import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

export const initThree = () => {
  const root = document.body.querySelector('#myCanvas')!

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  // 控制相机位置 vec3
  camera.position.z = 1.5
  camera.position.x = 1.5

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  root.appendChild(renderer.domElement)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // 相机控制器
  new OrbitControls(camera, renderer.domElement)

  const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
  const material = new THREE.MeshNormalMaterial({ wireframe: true })

  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // 参数调节界面
  const gui = new GUI()

  const cubeFolder = gui.addFolder('Cube')
  // gui.add(setScene, 'sceneA').name('Scene A')
  // cubeFolder.add.name()

  cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
  cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
  cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
  cubeFolder.open()

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 20)
  cameraFolder.open()

  // 状态面板
  const stats = new Stats()
  root.appendChild(stats.dom)

  function animate() {
    requestAnimationFrame(animate)

    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01

    renderer.render(scene, camera)
    stats.update()
  }

  animate()
}
