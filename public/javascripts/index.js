
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
const ticktime_in_secs = .3;

function Coord(x, z) {
    let _this = this;
    this.x = x;
    this.z = z;
    
    this.translate = function (coord) {
        _this.x += coord.x;
        _this.z += coord.z;
    }
    
}


function Robot(location, mesh) {
    let _this = this;
    this.mesh = mesh;
    this.speed = 2;
    this.path = new Queue();
    
    let moving_positive;
    let moving_in_x_direction;
    let is_moving;
    
    Object.freeze(this.location);
    Object.freeze(this.mesh);
    Object.freeze(this.speed);
    
    this.mesh.position.y = 0.15;
    this.mesh.position.x = location.x * squaresize;
    this.mesh.position.z = location.z * squaresize;
    
    this.move = function (amount) {
        if (is_moving){
            if (!moving_positive){
                amount = -amount;
            }
    
            if (moving_in_x_direction){
                _this.mesh.translateX(amount);
            } else{
                _this.mesh.translateZ(amount);
            }
        }
    };
    
    this.pop_path = function () {
        if (!_this.path.isEmpty()) {
            let coord = _this.path.dequeue();
            console.log(coord);
            if (location.x === coord.x && location.z === coord.z){
                is_moving = false; // filters out duplicates
                console.log("found double" );
            } else{
                is_moving = true;
                if (location.x !== coord.x){
                    moving_in_x_direction = true;
                    moving_positive = location.x < coord.x;
                } else if (location.z !== coord.z){
                    moving_in_x_direction = false;
                    moving_positive = location.z < coord.z;
                } else{
                    // todo
                }
                location = coord;
            }
        }else{
            is_moving = false;
        }

    }
}

window.onload = function () {
    let camera, scene, renderer;
    let cameraControls;
    let robot;
    
    let worldObjects = {};
    
    let clock = new THREE.Clock();
    
    let moving = true;
    let time_since_last_tick = 0.0;
    let speed_per_sec = squaresize / ticktime_in_secs;
    let moving_straight = true;
    
    let distance = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        let delta = clock.getDelta();
        
        time_since_last_tick += delta;
        if (time_since_last_tick < ticktime_in_secs){
            time_since_last_tick = 0.0;
            robot.pop_path();
            if (moving){
                moving_straight = !moving_straight;
            }
        }
        
        if (moving){
            robot.move(speed_per_sec * delta);
        }
        
        cameraControls.update();
        renderer.render(scene, camera);
        
    }
    
    function init(world_state) {
        
        let world_map = world_state.world_map;
        
        scene = new THREE.Scene();
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight + 5);
        document.body.appendChild(renderer.domElement);
        
        window.addEventListener('resize', onWindowResize, false);
        
        let square_geometry = new THREE.PlaneGeometry(squaresize, squaresize, 3);
        let material_red = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        let material_green = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        let material_blue = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        let material_white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        let material_light_blue = new THREE.MeshBasicMaterial({ color: 0x42c5f4, side: THREE.DoubleSide });
    
    
        let add_plane = (i, j, material) => {
            let plane = new THREE.Mesh(square_geometry, material);
            plane.position.x = i * squaresize ;
            plane.position.z = j * squaresize ;
            plane.rotation.x = Math.PI / 2.0;
            scene.add(plane);
        };
        
        
        for (let i = 0; i < world_map.length ; i++) {
            for (let j = 0; j < world_map.length; j++) {
                if (world_map[j][i] === 'X'){
                    add_plane(i,j,material_green);
                } else if (world_map[j][i] === 'R'){
                    add_plane(i,j,material_red);
                } else if (world_map[j][i] === 'P'){
                    add_plane(i,j,material_blue);
                } else if (world_map[j][i] === 'S'){
                    add_plane(i,j,material_white);
                } else if (world_map[j][i] === 'D'){
                    add_plane(i,j,material_light_blue);
                }
            }
        }
        
        
        let light = new THREE.AmbientLight(0x404040);
        light.intensity = 4;
        scene.add(light);
        
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        cameraControls = new THREE.OrbitControls(camera);
        camera.position.z = 15;
        camera.position.y = 5;
        camera.position.x = 15;
        cameraControls.update();
    
    
    
        let robot_geometry = new THREE.BoxGeometry(0.9, 0.3, 0.9);
        let cubeMaterials = [
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/textures/robot_side.png"), side: THREE.DoubleSide }), //LEFT
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/textures/robot_side.png"), side: THREE.DoubleSide }), //RIGHT
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/textures/robot_top.png"), side: THREE.DoubleSide }), //TOP
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/textures/robot_bottom.png"), side: THREE.DoubleSide }), //BOTTOM
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/textures/robot_front.png"), side: THREE.DoubleSide }), //FRONT
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/textures/robot_front.png"), side: THREE.DoubleSide }), //BACK
        ];
        let material = new THREE.MeshFaceMaterial(cubeMaterials);
        robot = new Robot(new Coord(0,0), new THREE.Mesh(robot_geometry, material));
    
        robot.mesh.position.x = world_state.robo_info[0].x * squaresize - squaresize;
        robot.mesh.position.z = world_state.robo_info[0].y * squaresize;
    
            let group = new THREE.Group();
    
        group.add(robot.mesh);
    
        scene.add(group);
        
    
    
    
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
            message.tick_summary.robot_moves.forEach((move) => {
                robot.path.enqueue(new Coord(move.to.x - 1, move.to.y))
            })
        } else{
            map_loaded = true;
            init(message.world_state);
        }
        
    };
    /*
        if (command.command == "update") {
        if (Object.keys(worldObjects).indexOf(command.parameters.guid) < 0) {
         if (command.parameters.type == "robot") {
        
                worldObjects[command.parameters.guid] = group;
            //}
        //}
    
        let object = worldObjects[command.parameters.guid];
    
        object.position.x = command.parameters.x;
        object.position.y = command.parameters.y;
        object.position.z = command.parameters.z;
    
        object.rotation.x = command.parameters.rotationX;
        object.rotation.y = command.parameters.rotationY;
        object.rotation.z = command.parameters.rotationZ;
        }
        }*/
    
 

};
