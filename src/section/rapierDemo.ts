import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { lerp, lightHelperControl, RapierDebugRenderer } from './utils'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

await RAPIER.init() // This line is only needed if using the compat version
const g = -9.8
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
  700
)

camera.position.set(0, 172, 202)
camera.scale.set(0.5, 0.5, 0.5)
camera.rotation.set(10.36, 10.55, 10.02)
camera.lookAt(0, 0, 0)

// const gui = new GUI()
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

scene.add(directionalLight)

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

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.y = 1

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
    .setTranslation(0, 2, 20)
    .setLinearDamping(0.1) // 添加线性阻尼
    .setAngularDamping(0.5) // 添加角阻尼
    .setCcdEnabled(true)
)
const sphereShape = RAPIER.ColliderDesc.ball(2)
  .setMass(2)
  .setRestitution(1.7)
  .setFriction(0.3)
const ballCollider = world.createCollider(sphereShape, sphereBody)
dynamicBodies.push([sphereMesh, sphereBody])

// 加载纹理
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('img/grid.png')

// 地板视图
let floorMesh = new THREE.Mesh(
  new THREE.BoxGeometry(190, 2, 190),
  new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.8, // 添加粗糙度
    metalness: 0.2, // 添加金属度
    side: THREE.DoubleSide // 确保双面可见
  })
)

floorMesh.receiveShadow = true
floorMesh.position.y = 0
scene.add(floorMesh)

// 创建物理世界中的地板板固定刚体
const floorBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0)
)

// 为刚体添加碰撞器
const floorColliderDesc = RAPIER.ColliderDesc.cuboid(95, 1, 95)
  .setFriction(1000)
  .setRestitution(0.01) // 草地弹性弱
const floorCollider = world.createCollider(floorColliderDesc, floorBody)
floorMesh.userData.rigidBody = floorBody

// 围板视图
const geometry = new THREE.BoxGeometry(190, 50, 0.5) // 长、高、宽
const material = new THREE.MeshBasicMaterial({
  map: texture
  // specular: 0x333333,
  // shininess: 100
  // opacity: 1
}) // 绿色材质
const wallMesh = new THREE.Mesh(geometry, material)
wallMesh.position.set(0, -1, -95)
scene.add(wallMesh)

// 创建物理世界中的围板固定刚体
const wallRigidBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, -95)
)

// 为围板添加碰撞器
const wallColliderDesc = RAPIER.ColliderDesc.cuboid(95, 25, 0.5)
  .setFriction(0.8)
  .setRestitution(0.3)
const wallCollider = world.createCollider(wallColliderDesc, wallRigidBody)

// 将物理刚体与网格关联
// wallMesh.userData.rigidBody = wallRigidBody

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function getBallAngularVelocity(ballBody: RAPIER.RigidBody) {
  if (ballBody) {
    const angularVel = ballBody.linvel()
    console.log('角速度:', {
      x: angularVel.x, // 绕 X 轴旋转速度
      y: angularVel.y, // 绕 Y 轴旋转速度
      z: angularVel.z // 绕 Z 轴旋转速度
    })
    return angularVel
  }
  return null
}
// const gui = new GUI()
// lightHelperControl(directionalLight, data, scene, gui)

// 创建事件
// let myEvent = new CustomEvent('ballCollision', {
//   detail: { msg: 'ballCollision' }
// })

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

const addBallCollisionListener = (
  eventName: 'ballWallCollision' | 'ballFloorCollision',
  callBack: (e: { target: RAPIER.Collider }) => void
) => {
  const ballCollisionLinstener = (
    e: CustomEvent<{ target: RAPIER.Collider }>
  ) => {
    const event = e
    callBack(event.detail)
    window.removeEventListener(
      eventName,
      ballCollisionLinstener as EventListener
    )
  }
  window.addEventListener(eventName, ballCollisionLinstener as EventListener)
}

let canClick = true
renderer.domElement.addEventListener('click', (e) => {
  if (!canClick) return
  canClick = false
  // mouse.set(
  //   (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
  //   -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  // )
  // raycaster.setFromCamera(mouse, camera)
  // const intersects = raycaster.intersectObjects(
  //   dynamicBodies.flatMap((a) => a[0]),
  //   false
  // )
  // console.log(intersects.length)
  // if (intersects.length) {
  // }

  // 影响球体运动轨迹参数 params
  // 初始力 actionParams.impulse = new RAPIER.Vector3(200, 43, -280) // 初始力
  // params.detalX = -9.8 * 1.4 // 初始速度
  const actionParams = {
    impulse: new RAPIER.Vector3(200, 43, -280), // 初始力
    detalX: -9.8 * 2.0 // x 方向初引力
  }
  const ballBody = dynamicBodies[0][1]

  const torque = new RAPIER.Vector3(552.0, 510, -100)
  ballBody.applyTorqueImpulse(torque, true)

  // 瞬间给力
  ballBody.applyImpulse(actionParams.impulse, true)
  let detalX = actionParams.detalX
  const interval = setInterval(() => {
    // 持续施加x方向的力
    detalX += 0.05
    ballBody.addForce(new RAPIER.Vector3(detalX, 0, 0), true)
    if (detalX >= 0) {
      ballBody.resetForces(true)
      ballBody.addForce(new RAPIER.Vector3(0, 0, 0), true)
      clearInterval(interval)
    }
  }, 10)

  addBallCollisionListener('ballWallCollision', (e) => {
    console.log(e.target == floorCollider)

    ballBody.resetForces(true)
    ballBody.addForce(new RAPIER.Vector3(0, 0, 0), true)
    clearInterval(interval)
  })

  const initTimer = setTimeout(() => {
    clearInterval(interval)
    ballBody.resetForces(true)
    ballBody.applyImpulse(new RAPIER.Vector3(0, 0, 0), true)
    sphereBody.setTranslation({ x: 0, y: 2, z: 20 }, true)
    ballBody.setAngvel({ x: 0.0, y: 0.0, z: 0.0 }, true) // 角动量
    ballBody.setLinvel({ x: 0.0, y: 0.0, z: 0.0 }, true)
    clearTimeout(initTimer)
    canClick = true
  }, 4000)
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

  renderer.render(scene, camera)

  stats.update()
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
