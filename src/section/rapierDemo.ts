import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'
import {
  // lerp,
  // lightHelperControl,
  moveBall,
  RapierDebugRenderer
} from './utils'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'
await RAPIER.init() // This line is only needed if using the compat version
const g = -9.8 * 3
const initialGravity = { x: 0.0, y: g, z: 0.0 }

let world = new RAPIER.World(initialGravity)
const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []

const scene = new THREE.Scene()
// scene.add(new THREE.GridHelper(1000, 4))

const rapierDebugRenderer = new RapierDebugRenderer(scene, world)

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.set(0, 300, 220)
camera.scale.set(13.7, 13.7, 13.7)
camera.rotation.set(-0.7, 0, 0)
camera.lookAt(-0, -80, -80)
scene.add(camera)

// const gridHelper = new THREE.GridHelper(1000, 10)
// gridHelper.position.set(0, 300, 220)
// gridHelper.rotation.set(0, 0, Math.PI / 2)
// camera.add(gridHelper)
const plane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    // map: texture,
    // color: 0xffff00,
    // emissive: 0xffffff,
    // emissiveMap: texture,
    // side: THREE.DoubleSide,
    // opacity: 1
    transparent: true, // 设置为透明
    opacity: 0
  })
)
// const plane2 = gridHelper
plane2.position.z -= 10
// gridHelper.position.z = -10
camera.add(plane2)

// const gui = new GUI()
const directionalLight = () => {
  const data = {
    color: 0x00ff00,
    lightColor: 0xffffff,
    shadowMapSizeWidth: 512,
    shadowMapSizeHeight: 512
  }

  const directionalLight = new THREE.DirectionalLight(
    data.lightColor,
    Math.PI / 2
  )
  const directionalLightConfigInit = () => {
    directionalLight.castShadow = true
    directionalLight.intensity = 4.7
    directionalLight.shadow.camera.near = 0
    directionalLight.shadow.camera.far = 900
    directionalLight.shadow.camera.top = 124
    directionalLight.shadow.camera.bottom = -124
    directionalLight.shadow.camera.right = 124
    directionalLight.shadow.camera.left = -124
    directionalLight.shadow.mapSize.width = data.shadowMapSizeWidth
    directionalLight.shadow.mapSize.height = data.shadowMapSizeHeight
    directionalLight.position.set(0, 50, 0)
  }
  directionalLightConfigInit()
  return directionalLight
}
scene.add(directionalLight())

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
CameraControls.install({ THREE: THREE })
const controls = new CameraControls(camera, renderer.domElement)
// controls.enabled = true
// controls.enableDamping = false
// controls.target.y = 1

// Ball Collider
// new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({ flatShading: true })),
let sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(2),
  // new THREE.IcosahedronGeometry(1, 1),
  // new THREE.MeshNormalMaterial()
  new THREE.MeshNormalMaterial({ flatShading: true })
)
sphereMesh.castShadow = true
scene.add(sphereMesh)

let sphereBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0, 2, 60)
    .setLinearDamping(0.1) // 添加线性阻尼
    .setAngularDamping(0.5) // 添加角阻尼
    .setCcdEnabled(true)
)
const sphereShape = RAPIER.ColliderDesc.ball(2)
  .setMass(2)
  .setRestitution(0.34)
  .setFriction(1)
const ballCollider = world.createCollider(sphereShape, sphereBody)

dynamicBodies.push([sphereMesh, sphereBody])

const initBallBody = () => {
  sphereBody.resetForces(true)
  sphereBody.applyImpulse(new RAPIER.Vector3(0, 0, 0), true)
  sphereBody.setTranslation({ x: 0, y: 2, z: 60 }, true)
  sphereBody.setAngvel({ x: 0.0, y: 0.0, z: 0.0 }, true) // 角动量
  sphereBody.setLinvel({ x: 0.0, y: 0.0, z: 0.0 }, true)
}

// 加载纹理
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('img/grid.png')

const floorData = {
  width: 300,
  height: 1,
  depth: 300,
  x: 0,
  y: 0,
  z: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  friction: 100, // 摩擦系数
  restitution: 0.3 // 弹性系数
}

const floorGeometry = new THREE.BoxGeometry(
  floorData.width,
  floorData.height,
  floorData.depth
) // 长、高、宽

const floorMaterial = new THREE.MeshStandardMaterial({
  map: texture,
  roughness: 0.8, // 添加粗糙度
  metalness: 0.2, // 添加金属度
  side: THREE.DoubleSide // 确保双面可见
})

// 地板视图
let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)

floorMesh.receiveShadow = true
floorMesh.position.y = 0
scene.add(floorMesh)

// 创建物理世界中的地板板固定刚体
const floorBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0)
)

// 为刚体添加碰撞器
const floorColliderDesc = RAPIER.ColliderDesc.cuboid(
  floorData.width / 2,
  floorData.height / 2,
  floorData.depth / 2
)
  .setFriction(floorData.friction)
  .setRestitution(floorData.restitution)
const floorCollider = world.createCollider(floorColliderDesc, floorBody)
floorMesh.userData.rigidBody = floorBody

// 围板视图

const wallData = {
  width: 300,
  height: 300,
  depth: 0.5,
  x: 0,
  y: -100,
  z: -125,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  friction: 1, // 摩擦系数
  restitution: 0.34 // 弹性系数
}

const wallGeometry = new THREE.BoxGeometry(
  wallData.width,
  wallData.height,
  wallData.depth
) // 长、高、宽

const wallMaterial = new THREE.MeshBasicMaterial({
  map: texture
  // specular: 0x333333,
  // shininess: 100
  // opacity: 1
}) // 绿色材质
const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)

// wallMesh.receiveShadow = true
wallMesh.position.set(wallData.x, wallData.y, wallData.z)
wallMesh.rotation.set(
  wallData.rotationX,
  wallData.rotationY,
  wallData.rotationZ
)
scene.add(wallMesh)

// 创建物理世界中的围板固定刚体
const wallRigidBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.fixed().setTranslation(
    wallData.x,
    wallData.y,
    wallData.z
  )
)

// 为围板添加碰撞器
const wallColliderDesc = RAPIER.ColliderDesc.cuboid(
  wallData.width / 2,
  wallData.height / 2,
  wallData.depth / 2
)

const wallCollider = world.createCollider(wallColliderDesc, wallRigidBody)
wallCollider.setFriction(wallData.friction)
wallCollider.setRestitution(wallData.restitution)
/// 球门参数
const goalData = {
  width: 100, // 球门宽度
  height: 30, // 球门高度
  postRadius: 1.5, // 门柱半径
  position: { x: 0, y: 0, z: -80 } // 球门位置
}

// 监听事件
// 在创建球体和墙体后添加碰撞检测
const wallColliderEvent = new CustomEvent('ballWallCollision', {
  detail: { target: wallCollider }
})
const floorColliderEvent = new CustomEvent('ballFloorCollision', {
  detail: { target: floorCollider }
})

function checkBallWallCollision() {
  // 触发墙面碰撞事件
  world.contactPair(wallCollider, ballCollider, () => {
    window.dispatchEvent(wallColliderEvent)
  })

  // 触发地板碰撞事件
  world.contactPair(floorCollider, ballCollider, () => {
    window.dispatchEvent(floorColliderEvent)
  })
}

let canClick = true
// renderer.domElement.addEventListener('click', (e) => {
//   if (canClick) {
//     console.log(canClick)
//     console.log(camera)

//     canClick = false

//     const actionParams = {
//       impulse: new RAPIER.Vector3(200 * 0.9 * 2.3, 73, -280 * 1.8), // 初始力
//       detalX: -9.8 * 1.5 * 2.7, // x 方向初引力
//       torque: new RAPIER.Vector3(552.0 * 0.3, 510 * 0, -500 * 0), // 初始扭矩(自转)
//       detalXSpeed: 0.1 // x 方向引力减弱强度
//     }

//     const ballBody = dynamicBodies[0][1]
//     ballBody.applyTorqueImpulse(actionParams.torque, true)

//     // 瞬间给力
//     ballBody.applyImpulse(actionParams.impulse, true)
//     let detalX = actionParams.detalX
//     const interval = setInterval(() => {
//       // 持续施加x方向的力
//       detalX += actionParams.detalXSpeed
//       ballBody.addForce(new RAPIER.Vector3(detalX, 0, 0), true)
//       if (detalX >= 0) {
//         ballBody.resetForces(true)
//         ballBody.addForce(new RAPIER.Vector3(0, 0, 0), true)
//         clearInterval(interval)
//       }
//     }, 10)

//     addBallCollisionListener('ballWallCollision', (e) => {
//       ballBody.resetForces(true)
//       ballBody.addForce(new RAPIER.Vector3(0, 0, 0), true)
//       clearInterval(interval)
//     })

//     const initTimer = setTimeout(() => {
//       clearInterval(interval)
//       ballBody.resetForces(true)
//       ballBody.applyImpulse(new RAPIER.Vector3(0, 0, 0), true)
//       sphereBody.setTranslation({ x: 0, y: 2, z: 60 }, true)
//       ballBody.setAngvel({ x: 0.0, y: 0.0, z: 0.0 }, true) // 角动量
//       ballBody.setLinvel({ x: 0.0, y: 0.0, z: 0.0 }, true)
//       clearTimeout(initTimer)
//       canClick = true
//     }, 4000)
//   }
// })

// 绘制手指触摸轨迹
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let isStart = false
const lineWayPositions: THREE.Vector3[] = []
const lineWayPositionsResolution: THREE.Vector2[] = []

const cylinderMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
}) // 轨迹的材质
const cylinders: THREE.Mesh[] = [] // 存储所有的轨迹圆

const createCylinder = (start: THREE.Vector3) => {
  const cylinderGeometry = new THREE.SphereGeometry(2.5) // 半径为1
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)

  // 设置轨迹点的位置和旋转
  cylinder.position.copy(start)

  return cylinder
}

const updateLine = () => {
  // 清除之前的轨迹体
  cylinders.forEach((cylinder) => scene.remove(cylinder))
  cylinders.length = 0 // 清空数组
  const bigLen = 200 // 最多 200 个轨迹点
  if (lineWayPositions.length > 1) {
    if (lineWayPositions.length > bigLen) {
      const newPositions = lineWayPositions.slice(lineWayPositions.length - 200)
      for (let i = 0; i < newPositions.length - 1; i++) {
        const cylinder = createCylinder(newPositions[i])
        scene.add(cylinder)
        cylinders.push(cylinder) // 存储轨迹体
      }
    } else {
      for (let i = 0; i < lineWayPositions.length - 1; i++) {
        const cylinder = createCylinder(lineWayPositions[i])
        scene.add(cylinder)
        cylinders.push(cylinder) // 存储轨迹体
      }
    }
  }
}

// 触摸事件
const moveHandler = (e: TouchEvent) => {
  if (!isStart) return
  mouse.set(
    (e.touches[0].clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.touches[0].clientY / renderer.domElement.clientHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera)
  // // 在 plane2 平面上绘制触摸点
  // const intersects = raycaster.intersectObjects([plane2], false)

  // if (intersects.length > 0) {
  //   // lineWayPositions.push(intersects[0].point)
  //   console.log('镜子上的点', intersects[0].point)
  //   // updateLine()
  // }

  // 记录在地板上的点
  const intersectsFloor = raycaster.intersectObjects([floorMesh], false)
  if (intersectsFloor.length > 0) {
    const currentPoint = intersectsFloor[0].point

    // console.log('地面上的点', intersectsFloor[0].point)

    lineWayPositions.push(currentPoint)
    lineWayPositionsResolution.push(
      new THREE.Vector2(currentPoint.x, currentPoint.z)
    )
    updateLine()
  }
}

let canMoveBall = true

const clearDrawLine = (interval?: number) => {
  isStart = false
  lineWayPositions.length = 0
  lineWayPositionsResolution.length = 0
  updateLine()
  renderer.domElement.removeEventListener('touchmove', moveHandler)
  const timer = setTimeout(() => {
    clearTimeout(timer)
    clearInterval(interval)
    if (interval) {
      canMoveBall = true
      initBallBody()
    }
  }, 2000)
}
renderer.domElement.addEventListener('touchstart', () => {
  if (!canMoveBall) return
  isStart = true
  renderer.domElement.addEventListener('touchmove', moveHandler)
  // 1000ms 后清除绘制
  // const timer = setTimeout(() => {
  //   clearTimeout(timer)
  //   clearDrawLine()
  // }, 1000)
})
const touchEndHandler = () => {
  if (lineWayPositionsResolution.length > 2) {
    // 在球体上施加力
    const ballBody = dynamicBodies[0][1] // 获取球体的刚体
    // ballBody.applyImpulse(, true) // 施加力
    const interval = moveBall(ballBody, lineWayPositionsResolution)

    clearDrawLine(interval)
  }
  isStart = true
}
renderer.domElement.addEventListener('touchend', () => {
  // clearDrawLine()
  console.log('touchend', canMoveBall)
  if (canMoveBall) {
    canMoveBall = false
    touchEndHandler()
  }
})

const stats = new Stats()
document.body.appendChild(stats.dom)

const clock = new THREE.Clock()
let delta

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()

  world.timestep = Math.min(delta, 0.1)
  world.step()

  for (let i = 0, n = dynamicBodies.length; i < n; i++) {
    if (dynamicBodies[i][0] && dynamicBodies[i][1]) {
      dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
      dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
    }
  }
  checkBallWallCollision()
  rapierDebugRenderer.update()
  // controls.update(delta)

  renderer.render(scene, camera)

  // stats.update()
}

// 重置物理世界
function removeBall() {
  if (sphereBody) {
    const colliders = sphereBody.collider(1)
    world.removeCollider(colliders, true)
    world.removeRigidBody(sphereBody)
  }

  // 2. 从场景中删除网格
  if (sphereMesh) {
    scene.remove(sphereMesh) // 从场景中移除
    sphereMesh.geometry.dispose() // 释放几何体内存
    sphereMesh.material.dispose() // 释放材质内存
  }

  // 3. 清除引用
  // sphereBody = null
  // sphereMesh = null
}

animate()
// resetWorld()
// removeBall()
