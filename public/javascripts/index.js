
function parseCommand(input = "") {
    return JSON.parse(input);
}

let exampleSocket;


const squaresize = 2;
const ticktime_in_secs = 1;
const assets = new Assets();

// dinsdag
// todo truck toevoegen.
// todo systeem om acties te queuen.
// todo variable snelheid

// woensdag
// todo loop buiten de animatie functie die robots an schaffolds beweegt
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
    let group = new THREE.Group();
    


    
    let tick_id;


    function animate() {
        requestAnimationFrame(animate);
        cameraControls.update();
        renderer.render(scene, camera);
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


        
        
        // load skybox
        let skybox_geom = new THREE.BoxGeometry(1000, 1000, 1000);
        
        // add stuff to group
        scene.add(new THREE.Mesh(skybox_geom, assets.skybox_mat));

        scene.add(new Robot());

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
        
        scene.add(group);
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
        if (map_loaded){
/*
            truck_state_queue.enqueue({
                truck_state: message.tick_summary.truck_state,
                tick_id:message.tick_summary.tick_id
            });

            message.tick_summary.robot_moves.forEach((move) => {
                let to_coord = new Coord(move.to.x - 1, move.to.y);
                get_robot_with_id(move.id).path.enqueue(to_coord);
            });
            message.tick_summary.scaffold_placed.forEach((coord) => {
                scaffold_place_queue.enqueue({
                    coord : convert_coord(coord),
                    tick_id : message.tick_summary.tick_id
                });
            });

            message.tick_summary.scaffold_removed.forEach((coord) => {
                scaffold_remove_queue.enqueue({
                    coord : convert_coord(coord),
                    tick_id : message.tick_summary.tick_id
                });
            });
            message.tick_summary.robot_unload.forEach((id) => {
                get_robot_with_id(id).path.enqueue({
                    scaffold_change: true,
                    add_scaffold: false
                })
            });
            message.tick_summary.robot_load.forEach((id) => {
                get_robot_with_id(id).path.enqueue({
                    scaffold_change: true,
                    add_scaffold: true
                })
            });*/
        } else{
            map_loaded = true;
            init(message.world_state);
        }
        
    };
    
    
    
    
};
