
function Actor(){
    let _this = this;
    THREE.Group.call(this);
    this.steps_per_anim = 50;

    this.mesh;

    this.location = function () {
        return new Coord_2d(_this.mesh.position.x, _this.mesh.position.z)
    };

    this.animate_to_coord = function(destination, ticktime_in_ms){
        Actor.prototype._animate_to_coord( _this, destination, ticktime_in_ms)
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
Actor.prototype._animate_to_coord = function (_this, destination, time_in_ms, injection) {
    destination = destination.get_3d_coord();
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
        if(injection){
            injection();
        }
    }, ms_per_step)
};


function Robot(scaffold){
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

    function align_scaffold() {
        if (scaffold){
            scaffold.set_position(_this.location(), true);
        }else{
            console.log("scaffold error 3");
        }

    }

    this.animate_to_coord = function(destination, ticktime_in_ms){
        if (scaffold){

            Actor.prototype._animate_to_coord( _this, destination, ticktime_in_ms, function () {
                align_scaffold();
            });
        }else{
            Actor.prototype._animate_to_coord( _this, destination, ticktime_in_ms);
        }
    };

    this.load_scaffold = function (_scaffold) {
        if(!scaffold){
            scaffold = _scaffold;
            scaffold.load();
            align_scaffold();
        }else {
            console.log("scaffold error 1");
        }
    };

    this.unload_scaffold = function (destination) {
        if (scaffold){
            scaffold.unload(destination);
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

function Truck(){
    Actor.call(this);
    let height = 2.5;

    let geom = new THREE.BoxGeometry(7, height, 2.5);

    this.mesh = new THREE.Mesh(geom, assets.robot_material);
    this.add(this.mesh);
    this.mesh.translateY( height / 2);
    this.mesh.translateZ( -3);
}

Truck.prototype = Object.create(Actor.prototype);


function Scaffold(){
    Actor.call(this);
    let _this = this;
    this.mesh = new THREE.Mesh(assets.scaffold_geom, assets.robot_material);
    this.add(this.mesh);

    this.unload = function (destination) {
        _this.mesh.position.y = 0.5;
        if (destination){
            destination = destination.get_3d_coord()
            _this.mesh.position.x = destination.x;
            _this.mesh.position.z = destination.y;
        }
    };

    this.load = function () {
        _this.mesh.position.y = 0.85;
    };

    this.unload();

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