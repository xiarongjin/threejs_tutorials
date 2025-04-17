import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

export const initThree = () => {
  const root = document.body.querySelector('#myCanvas')!

  // const scene = new THREE.Scene()

  // 透视摄像机 模拟人眼
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  // 正射投影
  // const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, -5, 10)

  // 控制相机位置 vec3
  camera.position.set(0, 0.5, 3)
  camera.lookAt(1, 1, 1)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  root.appendChild(renderer.domElement)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // 场景控制
  const sceneA = new THREE.Scene()
  sceneA.background = new THREE.Color(0x123456)

  // 添加网格辅助
  sceneA.add(new THREE.GridHelper())

  const sceneB = new THREE.Scene()
  sceneB.background = new THREE.TextureLoader().load(
    'https://sbcode.net/img/grid.png'
  )

  const sceneC = new THREE.Scene()
  sceneC.background = new THREE.CubeTextureLoader()
    .setPath('https://sbcode.net/img/')
    .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
  //sceneC.backgroundBlurriness = 0.5

  // 相机控制器
  new OrbitControls(camera, renderer.domElement)

  const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
  const material = new THREE.MeshNormalMaterial({ wireframe: true })

  const cube = new THREE.Mesh(geometry, material)
  sceneA.add(cube)

  let activeScene = sceneA
  const setScene = {
    sceneA: () => {
      activeScene = sceneA
    },
    sceneB: () => {
      activeScene = sceneB
    },
    sceneC: () => {
      activeScene = sceneC
    }
  }

  // 参数调节界面
  const gui = new GUI()

  const cubeFolder = gui.addFolder('Cube')
  // gui.add(setScene, 'sceneA').name('Scene A')
  // cubeFolder.add.name()
  gui.add(setScene, 'sceneA').name('Scene A')
  gui.add(setScene, 'sceneB').name('Scene B')
  gui.add(setScene, 'sceneC').name('Scene C')

  cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
  cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
  cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
  cubeFolder.open()

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'x', -10, 10)
  cameraFolder.add(camera.position, 'y', -10, 10)
  cameraFolder.add(camera.position, 'z', -10, 10)
  cameraFolder.add(camera, 'fov', 0, 180, 0.01).onChange(() => {
    camera.updateProjectionMatrix()
  })
  cameraFolder.add(camera, 'aspect', 0.00001, 10).onChange(() => {
    camera.updateProjectionMatrix()
  })
  cameraFolder.add(camera, 'near', 0.01, 10).onChange(() => {
    camera.updateProjectionMatrix()
  })
  cameraFolder.add(camera, 'far', 0.01, 10).onChange(() => {
    camera.updateProjectionMatrix()
  })

  cameraFolder.open()

  // 状态面板
  const stats = new Stats()
  root.appendChild(stats.dom)

  function animate() {
    requestAnimationFrame(animate)

    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01

    renderer.render(activeScene, camera)
    stats.update()
  }

  animate()
}
