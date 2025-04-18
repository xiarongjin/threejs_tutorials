import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { lerp, lightHelperControl, RapierDebugRenderer } from './utils'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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
controls.enabled = false
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
  .setFriction(wallData.friction)
  .setRestitution(wallData.restitution)
const wallCollider = world.createCollider(wallColliderDesc, wallRigidBody)

/// 球门参数
const goalData = {
  width: 100, // 球门宽度
  height: 30, // 球门高度
  postRadius: 1.5, // 门柱半径
  position: { x: 0, y: 0, z: -80 } // 球门位置
}

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

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
  callBack: (e: { target: RAPIER.Collider }) => void,
  isOnce: boolean = true
) => {
  const ballCollisionLinstener = (
    e: CustomEvent<{ target: RAPIER.Collider }>
  ) => {
    const event = e
    callBack(event.detail)
    if (isOnce) {
      window.removeEventListener(
        eventName,
        ballCollisionLinstener as EventListener
      )
    }
  }
  window.addEventListener(eventName, ballCollisionLinstener as EventListener)
}

let canClick = true
renderer.domElement.addEventListener('click', (e) => {
  if (canClick) {
    console.log(canClick)
    console.log(camera)

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
    // params.detalX = -9.8 * 1.4 // x 方向初引力
    // params.torque = new RAPIER.Vector3(552.0, 510, -100) // 初始扭矩(自转)

    // const actionParams = {
    //   impulse: new RAPIER.Vector3(200 * 1.8, 83, -280 * 1.5), // 初始力
    //   detalX: -9.8 * 5.7, // x 方向初引力
    //   torque: new RAPIER.Vector3(552.0 * 1, 510 * 1, -500 * -1), // 初始扭矩(自转)
    //   detalXSpeed: 0.4 // x 方向引力减弱强度
    // }

    const actionParams = {
      impulse: new RAPIER.Vector3(200 * 0.9 * 2.3, 73, -280 * 1.8), // 初始力
      detalX: -9.8 * 1.5 * 2.7, // x 方向初引力
      torque: new RAPIER.Vector3(552.0 * 0.3, 510 * 0, -500 * 0), // 初始扭矩(自转)
      detalXSpeed: 0.1 // x 方向引力减弱强度
    }

    const ballBody = dynamicBodies[0][1]
    ballBody.applyTorqueImpulse(actionParams.torque, true)

    // 瞬间给力
    ballBody.applyImpulse(actionParams.impulse, true)
    let detalX = actionParams.detalX
    const interval = setInterval(() => {
      // 持续施加x方向的力
      detalX += actionParams.detalXSpeed
      ballBody.addForce(new RAPIER.Vector3(detalX, 0, 0), true)
      if (detalX >= 0) {
        ballBody.resetForces(true)
        ballBody.addForce(new RAPIER.Vector3(0, 0, 0), true)
        clearInterval(interval)
      }
    }, 10)

    addBallCollisionListener('ballWallCollision', (e) => {
      ballBody.resetForces(true)
      ballBody.addForce(new RAPIER.Vector3(0, 0, 0), true)
      clearInterval(interval)
    })

    const initTimer = setTimeout(() => {
      clearInterval(interval)
      ballBody.resetForces(true)
      ballBody.applyImpulse(new RAPIER.Vector3(0, 0, 0), true)
      sphereBody.setTranslation({ x: 0, y: 2, z: 60 }, true)
      ballBody.setAngvel({ x: 0.0, y: 0.0, z: 0.0 }, true) // 角动量
      ballBody.setLinvel({ x: 0.0, y: 0.0, z: 0.0 }, true)
      clearTimeout(initTimer)
      canClick = true
    }, 4000)
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
