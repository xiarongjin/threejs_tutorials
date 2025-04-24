import * as THREE from 'three'
// import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'
import CameraControls from 'camera-controls'

CameraControls.install({ THREE: THREE })

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
)
camera.position.set(0, 0, 5)
scene.add(camera)
// camera.position.set(0, 300, 1220)
// camera.scale.set(10.7, 10.7, 10.7)
// camera.rotation.set(-0.7, 0, 0)
// camera.lookAt(-0, -180, -180)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap

document.body.appendChild(renderer.domElement)
renderer.render(scene, camera)

const controls = new CameraControls(camera, renderer.domElement)

// const plane1 = new THREE.Mesh(
//   new THREE.PlaneGeometry(100, 100, 100),
//   new THREE.MeshStandardMaterial({
//     color: 0xffffff,
//     emissive: 0xffffff,
//     side: THREE.DoubleSide
//   })
// )
// scene.add(plane1)
// camera.add(plane1)
// const gui = new GUI()
// gui.add(plane1.position, 'x', -1000, 1000, 1).name('X')
// gui.add(plane1.position, 'y', -1000, 1000, 1).name('Y')
// gui.add(plane1.position, 'z', -1000, 1000, 1).name('Z')

// const plane2 = new THREE.Mesh(
//   new THREE.PlaneGeometry(1000, 1000),
//   new THREE.MeshStandardMaterial({
//     color: 0xffffff,
//     emissive: 0xffffff,
//     side: THREE.DoubleSide
//   })
// )
// // scene.add(plane2)
// const gridHelper = new THREE.GridHelper(1000, 4)
// // gridHelper.position.set(0, 300, 220)
// // gridHelper.rotation.set(Math.PI / 2, 0, 0)
// scene.add(gridHelper)

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    side: THREE.DoubleSide
  })
)
box.position.set(0, 0, 0)
scene.add(box)

// 加载纹理
const textureLoader = new THREE.TextureLoader()
const texture = await textureLoader.loadAsync('img/grid.png')

const plane1 = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    side: THREE.DoubleSide
  })
)
plane1.rotateX(Math.PI / 2)
scene.add(plane1)

const plane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveMap: texture,
    side: THREE.DoubleSide,
    transparent: true
  })
)
plane2.position.z -= 10
camera.add(plane2)

const clock = new THREE.Clock()
let delta
function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()

  // world.timestep = Math.min(delta, 0.1)
  // world.step()

  // for (let i = 0, n = dynamicBodies.length; i < n; i++) {
  //   if (dynamicBodies[i][0] && dynamicBodies[i][1]) {
  //     dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
  //     dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
  //   }
  // }
  // checkBallWallCollision()
  // rapierDebugRenderer.update()

  controls.update(delta)
  renderer.render(scene, camera)

  // stats.update()
}

animate()
