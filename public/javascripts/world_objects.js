let logged = false;

function Actor(){
    let _this = this;
    THREE.Group.call(this);
    this.steps_per_anim = 50;

    this.mesh;

    this.location = function () {
        return new Coord_2d(_this.mesh.position.x, _this.mesh.position.z)
    };

    this.animate_to_coord = function(destination, ticktime_in_ms){
        Actor.prototype._animate_to_coord( _this, destination.get_3d_coord(), ticktime_in_ms)
    };


    this.set_position = function (coord_2d, skip_mult) {
        if(!skip_mult){
            coord_2d = coord_2d.get_3d_coord();
        }
        _this.mesh.position.x = coord_2d.x;
        _this.mesh.position.z = coord_2d.y;
    };

}

Actor.prototype = Object.create(THREE.Group.prototype);
Actor.prototype._animate_to_coord = function (_this, destination, time_in_ms, post_injection) {
    let ms_per_step = (time_in_ms ) / _this.steps_per_anim;
    let location = _this.location();
    let x_translate_per_step = -((location.x - destination.x) / _this.steps_per_anim);
    let y_translate_per_step = -((location.y - destination.y) / _this.steps_per_anim);
    let counter = 0;

    let animation = setInterval(function () {
        if (!(counter < _this.steps_per_anim)){
            _this.mesh.position.x = destination.x;
            _this.mesh.position.z = destination.y;
            clearInterval(animation);
        }else{
            _this.mesh.translateX(x_translate_per_step);
            _this.mesh.translateZ(y_translate_per_step);
        }
        counter++;
        if(post_injection){
            post_injection();
        }
    }, ms_per_step)
};


function Robot(scaffold, loaded_from_init){
    Actor.call(this);
    let _this = this;
    let height = 0.3;

    let geom = new THREE.BoxGeometry(0.9, height, 0.9);

    this.mesh = new THREE.Mesh(geom, assets.robot_material);
    this.add(this.mesh);
    this.mesh.translateY( height / 2);

    if (scaffold){
        scaffold.load();
        align_scaffold();
    }

    this.load_scaff_on_truck = function () {
        let temp = scaffold;
        scaffold = undefined;
        temp.set_position(new Coord_2d(NaN, NaN), true);
        temp.dispose();
    };

    this.load_scaff_from_truck = function () {
        scaffold = new Scaffold(_this.location(), true)
        scaffold.load();
    };

    function align_scaffold() {
        try {
            if (scaffold){
                scaffold.set_position(_this.location(), true);
            }else{
                console.log("kan scaff niet alignen, geen scaff");
            }
        }catch (err){
            if (!logged){
                logged = true;
                console.log("");
                console.log("fucking bulllshit");
                console.log(err);
                console.log(scaffold);
                console.log(_this);
                console.log("");
            }
        }
    }

    this.animate_to_coord = function(destination, ticktime_in_ms){
        if (scaffold){

            Actor.prototype._animate_to_coord( _this, destination.get_3d_coord(), ticktime_in_ms, function () {
                align_scaffold();
            });
        }else{
            Actor.prototype._animate_to_coord( _this, destination.get_3d_coord(), ticktime_in_ms);
        }
    };

    this.load_scaffold = function (_scaffold) {
        if(!scaffold){
            scaffold = _scaffold;
            scaffold.load();
            align_scaffold();
        }else {
            console.log("kan scaffold niet laden, heeft al scaffold");
        }
    };

    this.unload_scaffold = function (destination) {
        if (scaffold){
            if (loaded_from_init){
                scaffold.unload(destination);
            }else{
                scaffold.unload(destination.get_3d_coord());
            }
            let temp  = scaffold;
            scaffold = undefined;
            return temp;

        }else{
            console.log("scaffold error 2");
        }
    };
}

Robot.prototype = Object.create(Actor.prototype);


/*Object.defineProperty(Robot.prototype, 'constructor', {
    value: Robot,
    enumerable: false,
    writable: true }
    );*/

function Truck(squaresize){
    Actor.call(this);
    let _this = this;
    let height = 2.5;

    let map_length = 17;
    let dock_position = 9;
    let last_position = 0;


    let geom = new THREE.BoxGeometry(7, height, 2.5);

    this.mesh = new THREE.Mesh(geom, assets.robot_material);
    this.add(this.mesh);
    this.mesh.translateY( height / 2);
    this.mesh.translateZ( -3);

    this.update = function (truckstate, ticktime_in_ms) {
        if (truckstate.did_reset){
            reset()
        }else{
            if (truckstate.has_moved){
                if (truckstate.position === map_length  + 1){
                    move_model(dock_position, ticktime_in_ms);
                }else{
                    move_model(truckstate.position, ticktime_in_ms);
                }
            }
        }
        last_position = truckstate.position;
    };

    function move_model(one_d_coord, ticktime_in_ms, no_animation) {
        if (no_animation){
            _this.mesh.position.x = one_d_coord;
        }else {
            let coord = new Coord_2d( one_d_coord * squaresize , _this.mesh.position.z);
            Actor.prototype._animate_to_coord( _this, coord, ticktime_in_ms);
        }

    }
    function reset(ticktime_in_ms) {
        last_position = 0;
        move_model(0, ticktime_in_ms, true);
    }
}

Truck.prototype = Object.create(Actor.prototype);


function Scaffold(position, no_mult_coord){
    console.log(position);
    Actor.call(this);
    let _this = this;
    this.mesh = new THREE.Mesh(assets.scaffold_geom, assets.robot_material);
    this.add(this.mesh);

    this.unload = function (destination) {
        _this.mesh.position.y = 0.5;

        if (destination){
            console.log("destination");
            console.log(destination);
            console.log("");
            destination = convert_coord(destination);
            if (!no_mult_coord){
                destination = destination.get_3d_coord();
            }
            _this.mesh.position.x = destination.x;
            _this.mesh.position.z = destination.y;
        }
    };

    this.load = function () {
        _this.mesh.position.y = 0.85;
    };

    this.unload(position);
    scaffolds.push(this);
    scene.add(this);

}

Scaffold.prototype = Object.create(Actor.prototype);

function Coord_2d(x,y) {
    let _this = this;
    this.x = x;
    this.y = y;

    this.get_3d_coord = function () {
        return{
            x:_this.x * 2,
            y: _this.y*2
        }
    }
}