

function Truck(truckstate, mesh) {
    let _this = this;
    let start_coord = new Coord(-4, -40);
    let speed = 4;
    this.at_dock = truckstate.at_dock;
    this.travel_time = truckstate.travel_time;
    
    this.update_state = function(truckstate){
        _this.at_dock = truckstate.at_dock;
        _this.travel_time = truckstate.travel_time;
        let target = start_coord.translate(new Coord(0, get_progress() * speed));
        
        mesh.position.x = target.x;
        mesh.position.z = target.z;
    };
    
    this.move = function(delta){
        mesh.translateZ (delta * speed);
    };
    
    function get_progress() {
        let ret = _this.travel_time;
        if (_this.at_dock){
            ret += 10;
        }
        return ret;
    }
    
    this.update_state(truckstate);
}

function Scaffold (location, group, scene, assets) {
    let _this =this;
    this.location = location;
    let geom = new THREE.BoxGeometry(1,1,1);
    
    
    this.mesh =  new THREE.Mesh(geom, assets.robot_material);
    
    group.add(this.mesh);
    
    
    
    this.place = (location) => {
        _this.location = location;
        _this.mesh.position.x = _this.location.x * 2;// 2= squaresize
        _this.mesh.position.z = _this.location.z * 2;
        _this.mesh.position.y = 0.5;
        
    };
    
    this.remove = () => {
        scene.remove(this.mesh);
        this.mesh.visible = false;
        _this.location = new Coord(-1,-1);
    };
    
    if (this.location !== undefined){
        _this.place(_this.location);
    }
    
}


function Robot(location, mesh, id) {
    let _this = this;
    this.location = location;
    this.mesh = mesh;
    this.speed = 2;
    this.path = new Queue();
    this.id = id;
    this.scaffold = undefined;
    
    let moving_positive;
    let moving_in_x_direction;
    let is_moving;
    
    Object.freeze(this.mesh);
    Object.freeze(this.id);
    Object.freeze(this.speed);
    
    this.mesh.position.y = 0.15;
    this.mesh.position.x = this.location.x * squaresize + squaresize;
    this.mesh.position.z = this.location.z * squaresize + squaresize;
    
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
            if (_this.scaffold !== undefined) {
                _this.scaffold.mesh.position.x = _this.mesh.position.x;
                _this.scaffold.mesh.position.z = _this.mesh.position.z;
                _this.scaffold.mesh.position.y = _this.mesh.position.y + 0.65;
            }
        }
    };

    
    this.pop_path = function () {
    
        if (!_this.path.isEmpty()) {
            if (_this.path.peek().scaffold_change){
                if(_this.path.dequeue().add_scaffold){
                    return true;
                }else{
                    _this.remove_scaffold();
                }
            }
        }
        if (!_this.path.isEmpty()) {
            let coord = _this.path.dequeue();
            if (_this.location.x === coord.x && _this.location.z === coord.z){
                is_moving = false; // filters out duplicates
            } else{
                _this.mesh.position.x = _this.location.x * squaresize + squaresize;
                _this.mesh.position.z = _this.location.z * squaresize ;
                is_moving = true;
                if (_this.location.x !== coord.x){
                    moving_in_x_direction = true;
                    moving_positive = _this.location.x < coord.x;
                } else if (_this.location.z !== coord.z){
                    moving_in_x_direction = false;
                    moving_positive = _this.location.z < coord.z;
                } else{
                    // todo
                }
                _this.location = coord;
            }

            
        }else{
            is_moving = false;
        }
    };
    
    
    
    this.pick_up_scaffold = (_scaffold) => {
        _this.scaffold = _scaffold;
    };
    
    this.remove_scaffold = () => {
        _this.scaffold.remove();
        _this.scaffold = undefined;
    };
    
}
