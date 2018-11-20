

function Robot(){
    THREE.Group.call(this);

    let height = 0.3;
    let geom = new THREE.BoxGeometry(0.9, height, 0.9);

    let mesh = new THREE.Mesh(geom, assets.robot_material);
    this.add(mesh);
    mesh.translateY( height / 2);
    this.location = function () {
        return new Coord_2d(mesh.position.x, mesh.position.y)
    };
    console.log(this);
}

Robot.prototype = Object.create(THREE.Group.prototype);

/*Object.defineProperty(Robot.prototype, 'constructor', {
    value: Robot,
    enumerable: false,
    writable: true }
    );*/

function Truck(){
    THREE.Group.call(this);

    let mesh = new THREE.Mesh(assets.robot_geometry, assets.robot_material);
    this.add(mesh);
    this.location = function () {
        return new Coord_2d(mesh.position.x, mesh.position.y)
    };
    console.log(this);
}

Truck.prototype = Object.create(THREE.Group.prototype);

function Scaffold(){
    THREE.Group.call(this);

    let mesh = new THREE.Mesh(assets.robot_geometry, assets.robot_material);
    this.add(mesh);
    this.location = function () {
        return new Coord_2d(mesh.position.x, mesh.position.y)
    };
    console.log(this);
}

Scaffold.prototype = Object.create(THREE.Group.prototype);

function Coord_2d(x,y) {
    this.x = x;
    this.y = y;
}