
function Assets() {
    
    const tex_loader = new THREE.TextureLoader();
    
    let texture_loader = (url) => {
        let tex = tex_loader.load(url);
        return new THREE.MeshBasicMaterial({map: tex, side: THREE.DoubleSide})
    };
    

    this.tex_vloer = texture_loader("assets/textures/vloer.jpg");
    this.tex_muur = texture_loader("assets/textures/wall.png");
    this.tex_parkeerplaats = texture_loader("assets/textures/parking.jpeg");
    this.tex_pallet = texture_loader("assets/textures/pallet.jpg");
    this.tex_dock = texture_loader("assets/textures/steel_texture.jpg");
    
    this.skybox_mat = new THREE.MeshFaceMaterial([
        texture_loader("assets/textures/skybox/right.png"), //RIGHT
        texture_loader("assets/textures/skybox/left.png"), //LEFT
        texture_loader("assets/textures/skybox/top.png"), //TOP
        texture_loader("assets/textures/skybox/bottom.png"), //BOTTOM
        texture_loader("assets/textures/skybox/front.png"), //FRONT
        texture_loader("assets/textures/skybox/back.png"), //BACK
    ]);
    
    
    this.robot_material = new THREE.MeshFaceMaterial([
        texture_loader("assets/textures/robot_side.png"), //RIGHT
        texture_loader("assets/textures/robot_side.png"), //LEFT
        texture_loader("assets/textures/robot_top.png"), //TOP
        texture_loader("assets/textures/robot_bottom.png"), //BOTTOM
        texture_loader("assets/textures/robot_front.png"), //FRONT
        texture_loader("assets/textures/robot_front.png"), //BACK
    ]);

    this.scaffold_geom = new THREE.BoxGeometry(1, 1, 1);
}
