
function parseCommand(input = "") {
    return JSON.parse(input);
}
let robots = {};
let scaffolds = [];
let truck;
let server_msg;
const squaresize = 2;
const ticktime_in_ms = 1000;
const assets = new Assets();


// woensdag
// todo truck animation
// todo scaffolds in en uitladen
// todo texture voor truck en scaffold vinden
// todo mischien rotatie toevoegen, if i can be fucked.



function Coord(x, z) {
    let _this = this;
    this.x = x;
    this.z = z;
    
    this.translate = function (coord) {
        return new Coord(_this.x + coord.x,_this.y + coord.y );
    }
    
}

function convert_coord(socket_coord){
    return new Coord(socket_coord.x, socket_coord.y);
}



window.onload = function () {
    let camera, scene, renderer;
    let cameraControls;
    let assets = new Assets();
    let tick_id;


    function animate() {
        requestAnimationFrame(animate);
        cameraControls.update();
        renderer.render(scene, camera);
    }

    function process_commands(){

    }
    
    function init(world_state) {
        
        tick_id =  world_state.tick_id;
        
        let world_map = world_state.world_map;
        
        scene = new THREE.Scene();
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight + 5);
        document.body.appendChild(renderer.domElement);
        
        window.addEventListener('resize', onWindowResize, false);
        
        
        let plane_geometry = new THREE.PlaneGeometry(squaresize, squaresize, 3);
        
        let add_plane = (i, j, material) => {
            let plane = new THREE.Mesh(plane_geometry, material);
            plane.position.x = i * squaresize ;
            plane.position.z = j * squaresize ;
            plane.rotation.x = Math.PI / 2.0;
            scene.add(plane);
        };
        
        
        for (let i = 0; i < world_map.length ; i++) {
            for (let j = 0; j < world_map.length; j++) {
                if (world_map[j][i] === 'X'){
                    add_plane(i,j,assets.tex_muur);
                } else if (world_map[j][i] === 'R'){
                    add_plane(i,j,assets.tex_vloer);
                } else if (world_map[j][i] === 'P'){
                    add_plane(i,j,assets.tex_parkeerplaats);
                } else if (world_map[j][i] === 'S'){
                    add_plane(i,j,assets.tex_pallet);
                } else if (world_map[j][i] === 'D'){
                    add_plane(i,j,assets.tex_dock);
                }
            }
        }
        
        // load scaffolds

        world_state.scaffold_positions.forEach(function (pos) {
            let new_coord = new Coord_2d(pos.x, pos.y);
            let scaffold = new Scaffold(new_coord);
            scaffolds.push(scaffold);
            scene.add(scaffold);
        });

        
        
        // load skybox
        let skybox_geom = new THREE.BoxGeometry(1000, 1000, 1000);
        
        // add stuff to group
        scene.add(new THREE.Mesh(skybox_geom, assets.skybox_mat));


        for (let i in _.range(world_state.robo_info.length)){
            let scaf = new Scaffold();
            robots[i] = new Robot(scaf);
            robots[i].set_position(new Coord_2d(world_state.robo_info[i].x,world_state.robo_info[i].y));
            scene.add(robots[i]);
            scene.add(scaf);
        }

        truck = new Truck(squaresize);
        scene.add(truck);

        // add lighting
        let light = new THREE.AmbientLight(0x404040);
        light.intensity = 4;
        scene.add(light);
        
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        cameraControls = new THREE.OrbitControls(camera);
        camera.position.z = 15;
        camera.position.y = 5;
        camera.position.x = 15;
        cameraControls.update();
        
        renderer.render(scene, camera);
        animate();
    }
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    let map_loaded = false;
    let websocket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port + "/ws");
    websocket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        server_msg = message;
        if (map_loaded){

            message.tick_summary.robot_moves.forEach((move) => {
                robots[move.id].animate_to_coord(new Coord_2d(move.to.x, move.to.y), ticktime_in_ms)
            });
            message.tick_summary.scaffold_placed.forEach((coord) => {

            });
            message.tick_summary.scaffold_removed.forEach((coord) => {

            });
            message.tick_summary.robot_unload.forEach((id) => {

            });
            message.tick_summary.robot_load.forEach((id) => {

            });
            truck.update(message.tick_summary.truck_state, ticktime_in_ms);
        } else{
            map_loaded = true;
            init(message.world_state);
        }
        
    };
    
    
    
    
};
