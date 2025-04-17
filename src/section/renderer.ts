// import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'

export const initSection1 = (root: Element) => {
  const scene = new THREE.Scene()
  scene.add(new THREE.GridHelper())

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 1.5
  camera.position.x = 1.5
  camera.position.y = 1.5

  // 抗锯齿、使用页面 canvas 元素
  const renderer = new THREE.WebGLRenderer({
    canvas: root.querySelector('canvas')!,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  // root.appendChild(renderer.domElement)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
  })

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', () => {
    renderer.render(scene, camera) // render whenever the OrbitControls changes
  })

  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshNormalMaterial({ wireframe: true })

  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  const stats = new Stats()
  root.appendChild(stats.dom)
  renderer.render(scene, camera)

  const clock = new THREE.Clock()
  let delta
  function animate() {
    requestAnimationFrame(animate)
    // delta = clock.getDelta()

    // cube.rotation.x += delta
    // cube.rotation.y += delta
    renderer.render(scene, camera)
  }

  animate()
}
