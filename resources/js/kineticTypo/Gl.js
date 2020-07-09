global.THREE = require('three');
const THREE = global.THREE;
const OrbitControls = require('three-orbit-controls')(THREE);
const loadFont = require('load-bmfont');
const createGeometry = require('three-bmfont-text');
const MSDFShader = require('three-bmfont-text/shaders/msdf');
const shaders = require('./shaders');

export default class Gl {
  constructor() {
    this.renderer = new THREE.WebGL1Renderer({
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    this.uniforms = {
      uTime: { type: 'f', value: 0 },
      uTexture: { type: 't', value: null }
    };

    this.camera.position.z = 40;
    this.scene = new THREE.Scene();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.clock = new THREE.Clock();
  }

  createRenderTarget() {
    this.rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.rtCamera.position.z = 2.5;
    this.rtScene = new THREE.Scene();
    this.rtScene.background = new THREE.Color('#000000');

    this.text = new THREE.Mesh(this.fontGeometry, this.fontMaterial);

    this.text.position.set(-0.965, -0.275, 0);
    this.text.rotation.set(Math.PI, 0, 0);
    this.text.scale.set(0.005, 0.03, 1);
    this.rtScene.add(this.text);
  }

  createMesh() {
    const geometry = new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3);
    this.uniforms.uTexture.value = this.rt.texture;
    const material = new THREE.ShaderMaterial({
      vertexShader: shaders.vert,
      fragmentShader: shaders.frag,
      uniforms: this.uniforms
    });

    this.boxMesh = new THREE.Mesh(geometry, material);
    this.boxMesh.scale.set(0.5, 0.5, 0.5);
    this.scene.add(this.boxMesh);
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  bind() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  render() {
    this.controls.update();
    // this.boxMesh.rotation.y += 0.005;
    this.uniforms.uTime.value = this.clock.getElapsedTime();

    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);

    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }

  init() {
    loadFont('./fonts/Orbitron-Black.fnt', (err, font) => {
      this.fontGeometry = createGeometry({
        font,
        text: 'DIFFICULT'
      });

      this.loader = new THREE.TextureLoader();
      this.loader.load('./fonts/Orbitron-Black.png', texture => {
        this.fontMaterial = new THREE.RawShaderMaterial(
          MSDFShader({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            negate: false,
            color: 0xffffff
          })
        );

        this.createRenderTarget();
        this.createMesh();
        this.animate();
        this.bind();
      });
    });
  }
}
