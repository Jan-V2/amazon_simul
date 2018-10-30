
function parseCommand(input = "") {
    return JSON.parse(input);
}

let exampleSocket;
/*
* todo
* draw grid with basic textures
* move robot around on grid
* make robot follow path
* hook client up to server via web socket
* todo add turning
* */

const squaresize = 2;
const ticktime_in_secs = 1;

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
    
    
    let clock = new THREE.Clock();
    
    let time_since_last_tick = 0.0;
    let speed_per_sec = squaresize / ticktime_in_secs;
    
    let scaffolds = [];
    let robots = [];
    let truck;
    
    let scaffold_place_queue = new Queue();
    let scaffold_remove_queue = new Queue();
    let truck_state_queue = new Queue();
    
    let tick_id;
    let animated_frames = 0;
    
    function get_scaffold_with_location(location){
        return get_with_location(scaffolds, location)
    }
    
    function get_robot_with_id(id){
        for (let i = 0; i < robots.length; i++) {
            if (robots[i].id === id){
                return robots[i];
            }
        }
    }
    
    function get_with_location(array, location) {
        for (let i = 0; i < array.length; i++) {
            let scaf = array[i];
            if (scaf.location === location){
                return scaf;
            }
        }
    }
    
    
    
    function animate() {
        requestAnimationFrame(animate);
        let delta = clock.getDelta();
        
        time_since_last_tick += delta;
        if (time_since_last_tick > ticktime_in_secs){
            time_since_last_tick = 0.0;
            robots.forEach((robot) => {
                if (robot.pop_path()){
                    robot.pick_up_scaffold(create_new_scaffold(undefined));
                }
            });
            animated_frames = 0;
            let delete_queue = [];
            for (let i = 0; i < scaffolds.length; i++) {
                if (scaffolds[i].location.x === -1) {
                    delete_queue.push(i);
                }
            }
            for (let i = delete_queue.length - 1; i > -1; i--) {
                scaffolds.splice(delete_queue[i], 1)
            }
            
            if (!scaffold_place_queue.isEmpty()) {
                if (scaffold_place_queue.peek().tick_id > tick_id){
                    let coord = scaffold_place_queue.dequeue().coord;
                    scaffolds.push(create_new_scaffold(coord));
                }
            }
    
            if (!scaffold_remove_queue.isEmpty()) {
                if (scaffold_remove_queue.peek().tick_id > tick_id){
                    let coord = scaffold_place_queue.dequeue().coord;//todo undefined error
                    get_scaffold_with_location(coord).remove();
                }
            }
    
    
            if (!truck_state_queue.isEmpty()) {
                if (truck_state_queue.peek().tick_id > tick_id){
                    truck.update_state(truck_state_queue.dequeue());
                }
            }
    
            
            tick_id++;
        }
        
        
        robots.forEach((robot) => {
            robot.move(speed_per_sec * delta);
            truck.move(delta);
        });
        animated_frames += 1;
        
        cameraControls.update();
        renderer.render(scene, camera);
        
    }
    
    function create_new_scaffold(location) {
        return new Scaffold(location,group, scene, assets)
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
                    add_plane(i,j,assets.material_green);
                } else if (world_map[j][i] === 'R'){
                    add_plane(i,j,assets.material_red);
                } else if (world_map[j][i] === 'P'){
                    add_plane(i,j,assets.material_blue);
                } else if (world_map[j][i] === 'S'){
                    add_plane(i,j,assets.material_white);
                } else if (world_map[j][i] === 'D'){
                    add_plane(i,j,assets.material_light_blue);
                }
            }
        }
        
        // load scaffolds
        
        world_state.scaffold_positions.forEach((location) => {
            location = convert_coord(location);
            scaffolds.push(create_new_scaffold(location));
        });
        
        
        // load the robot
        let robot_geometry = new THREE.BoxGeometry(0.9, 0.3, 0.9);
        world_state.robo_info.forEach((info) => {
            robot = new Robot(new Coord(info.x, info.y),
                new THREE.Mesh(robot_geometry, assets.robot_material), info.id);
            robot.mesh.position.x = robot.location.x * squaresize - squaresize;
            robot.mesh.position.z = robot.location.y * squaresize;
            group.add(robot.mesh);
            if (info.has_scaffold){
                let scaffold = create_new_scaffold(undefined);
                robot.pick_up_scaffold(scaffold);
                robot.path.enqueue(new Coord(0,0))
            }
            robots.push(robot)
        });
        
        //loads the truck
        let truck_geom = new THREE.BoxGeometry(4, 8, 15);
        let truck_mesh = new THREE.Mesh(plane_geometry, assets.material_blue);// new THREE.Mesh(truck_geom, assets.robot_material);
        truck = new Truck(world_state.truck, truck_mesh);
        group.add(truck_mesh);
        
        
        // load skybox
        let skybox_geom = new THREE.BoxGeometry(1000, 1000, 1000);
        
        // add stuff to group
        scene.add(new THREE.Mesh(skybox_geom, assets.skybox_mat));
        
        
        
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
    // todo load existing world state
    
    let map_loaded = false;
    let websocket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port + "/ws");
    websocket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        if (map_loaded){
            
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
            });
        } else{
            map_loaded = true;
            init(message.world_state);
        }
        
    };
    
    
    
    
};
