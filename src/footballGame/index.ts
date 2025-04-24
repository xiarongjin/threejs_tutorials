import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { RapierDebugRenderer } from '../section/utils'
import { initLight } from './light'
import { initCamera } from './camera'
import { initBall } from './ball'
import Stats from 'three/addons/libs/stats.module.js'
import CameraControls from 'camera-controls'
import { getMouseMapPosition, meshAndBodyAutoPosition } from './utils'
import { ballAction } from './ballAction'
import { initFloor } from './floor'
import GUI from 'lil-gui'
import { initWall } from './wall'
import { initTouchHandler } from './touchHandler'
import { initTouchLine } from './touchLine'
import { initPost } from './goal'
export const initFootballGame = async () => {
  await RAPIER.init()
  const g = -9.8 * 3
  const initialGravity = { x: 0.0, y: g, z: 0.0 }
  let world = new RAPIER.World(initialGravity)
  const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []
  const scene = new THREE.Scene()
  const rapierDebugRenderer = new RapierDebugRenderer(scene, world)
  // rapierDebugRenderer.enabled = false

  const camera = initCamera()
  scene.add(camera)
  // 灯光
  const light = initLight()
  scene.add(light)
  const gui = new GUI()
  // lightHelperControl(
  //   light,
  //   {
  //     color: 0x00ff00,
  //     lightColor: 0xffffff,
  //     shadowMapSizeWidth: 512,
  //     shadowMapSizeHeight: 512
  //   },
  //   scene,
  //   gui
  // )
  // 渲染到 dom 上

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap

  document.body.appendChild(renderer.domElement)
  renderer.render(scene, camera)
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // 球
  const ball = initBall(world)
  scene.add(ball.mesh)

  dynamicBodies.push([ball.mesh, ball.body])

  // 加载纹理
  const textureLoader = new THREE.TextureLoader()
  const texture = await textureLoader.loadAsync('img/grid.png')

  // 地板
  const floor = initFloor(texture, world)
  scene.add(floor.mesh)

  // 挡板
  const wall = initWall(texture, world)
  scene.add(wall.mesh)
  // 左挡
  const leftWall = initWall(texture, world, {
    width: 700,
    height: 700,
    depth: 0.5,
    x: -300,
    y: -200,
    z: 0,
    rotationX: 0,
    rotationY: Math.PI / 2,
    rotationZ: 0,
    friction: 1, // 摩擦系数,
    restitution: 0 // 弹性系数
  })
  scene.add(leftWall.mesh)
  // 右挡
  const rWall = initWall(texture, world, {
    width: 700,
    height: 700,
    depth: 0.5,
    x: 300,
    y: -200,
    z: 0,
    rotationX: 0,
    rotationY: -Math.PI / 2,
    rotationZ: 0,
    friction: 1, // 摩擦系数,
    restitution: 0 // 弹性系数
  })
  scene.add(rWall.mesh)
  // 后档
  const bWall = initWall(texture, world, {
    width: 700,
    height: 700,
    depth: 0.5,
    x: 0,
    y: -200,
    z: 350,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    friction: 1, // 摩擦系数,
    restitution: 0 // 弹性系数
  })
  scene.add(bWall.mesh)
  // 球门
  // 门柱
  // 左门柱
  const leftPost = initPost(
    {
      width: 5,
      height: 120,
      depth: 5,
      x: -80,
      y: 20,
      z: -80,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      friction: 1, // 摩擦系数
      restitution: 0.34 // 弹性系数
    },
    texture,
    world
  )
  // 右门柱
  const rightPost = initPost(
    {
      width: 5,
      height: 120,
      depth: 5,
      x: 80,
      y: 20,
      z: -80,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      friction: 1, // 摩擦系数
      restitution: 0.34 // 弹性系数
    },
    texture,
    world
  )
  // 横梁
  const goalBeam = initPost(
    {
      width: 160,
      height: 5,
      depth: 5,
      x: 0,
      y: 80,
      z: -80,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      friction: 1, // 摩擦系数
      restitution: 0.34 // 弹性系数
    },
    texture,
    world
  )
  scene.add(leftPost.mesh, rightPost.mesh, goalBeam.mesh)
  // 交互
  const touchLine = initTouchLine(scene)
  const touchMoveHandler = (e: TouchEvent) => {
    const point = getMouseMapPosition(
      e,
      camera,
      [floor.mesh],
      renderer.domElement
    )
    // 实际只需要二维点（优化空间
    touchLine.updateLine(point)
  }
  let canDestroy = false
  let ballInterNum: number | null
  const touchEndHandler = () => {
    // 深拷贝三维数组只取二维
    const positionArrCopy = touchLine.getLineWayPositions().map((position) => {
      return new THREE.Vector2(position.x, position.z)
    })
    if (positionArrCopy.length > 2 && !canDestroy) {
      ballInterNum = ballAction(ball.body, positionArrCopy)
      canDestroy = true
      touchLine.clearLine()
    }
  }
  const initAction = () => {
    if (canDestroy) {
      ball.destroy()
      clearInterval(ballInterNum)
      ballInterNum == null
      canDestroy = false
    }
  }
  const touchStartHandler = () => {
    touchLine.clearLine()
  }
  initTouchHandler(
    renderer.domElement,
    touchMoveHandler,
    touchEndHandler,
    touchStartHandler,
    initAction,
    3000
  )

  // 辅助界面
  const stats = new Stats()
  document.body.appendChild(stats.dom)
  CameraControls.install({ THREE: THREE })
  const controls = new CameraControls(camera, renderer.domElement)
  controls.enabled = false
  const CameraControlsFolder = gui.addFolder('cameraControls')
  CameraControlsFolder.add(controls, 'enabled').onChange(() => {
    if (controls.enabled) {
      controls.enabled = true
    } else {
      controls.enabled = false
    }
  })
  rapierDebugRenderer.enabled = false
  const rapierDebugRendererFolder = gui.addFolder('rapierDebugRenderer')
  rapierDebugRendererFolder.add(rapierDebugRenderer, 'enabled').onChange(() => {
    if (rapierDebugRenderer.enabled) {
      rapierDebugRenderer.enabled = true
    } else {
      rapierDebugRenderer.enabled = false
    }
  })

  const clock = new THREE.Clock()
  let delta

  // 监听事件
  // 在创建球体和墙体后添加碰撞检测
  const wallColliderEvent = new CustomEvent('ballWallCollision', {
    detail: { target: wall.collider }
  })
  const floorColliderEvent = new CustomEvent('ballFloorCollision', {
    detail: { target: floor.collider }
  })

  function checkBallWallCollision() {
    // 触发墙面碰撞事件
    world.contactPair(wall.collider, ball.collider, () => {
      window.dispatchEvent(wallColliderEvent)
    })

    // 触发地板碰撞事件
    world.contactPair(floor.collider, ball.collider, () => {
      window.dispatchEvent(floorColliderEvent)
    })
  }

  function animate() {
    requestAnimationFrame(animate)

    delta = clock.getDelta()

    world.timestep = Math.min(delta, 0.1)
    world.step()

    rapierDebugRenderer.update()
    controls.update(delta)
    checkBallWallCollision()

    renderer.render(scene, camera)
    meshAndBodyAutoPosition(dynamicBodies)
    stats.update()
  }
  animate()
}
