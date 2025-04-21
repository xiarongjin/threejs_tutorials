import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
export class RapierDebugRenderer {
  mesh
  world
  enabled = true

  constructor(scene: THREE.Scene, world: RAPIER.World) {
    this.world = world
    this.mesh = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true })
    )
    this.mesh.frustumCulled = false
    scene.add(this.mesh)
  }

  update() {
    if (this.enabled) {
      const { vertices, colors } = this.world.debugRender()
      this.mesh.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(vertices, 3)
      )
      this.mesh.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 4)
      )
      this.mesh.visible = true
    } else {
      this.mesh.visible = false
    }
  }
}

export const lightHelperControl = (
  directionalLight: any,
  data: any,
  scene: any,
  gui: any
) => {
  function updateDirectionalLightShadowMapSize() {
    directionalLight.shadow.mapSize.width = data.shadowMapSizeWidth
    directionalLight.shadow.mapSize.height = data.shadowMapSizeHeight
    directionalLight.shadow.map = null
  }
  // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
  const directionalLightHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera
  )
  directionalLightHelper.visible = true
  scene.add(directionalLightHelper)

  const directionalLightFolder = gui.addFolder('DirectionalLight')
  directionalLightFolder.add(directionalLight, 'visible')
  directionalLightFolder.addColor(data, 'lightColor').onChange(() => {
    directionalLight.color.set(data.lightColor)
  })
  directionalLightFolder.add(directionalLight, 'intensity', 0, Math.PI * 10)
  directionalLightFolder
    .add(directionalLight.position, 'x', -1005, 1005, 1)
    .onChange(() => {
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.position, 'y', -1005, 1005, 1)
    .onChange(() => {
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.position, 'z', -1005, 1005, 1)
    .onChange(() => {
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLightHelper, 'visible')
    .name('Helper Visible')
  directionalLightFolder
    .add(directionalLight.shadow.camera, 'left', -1000, -1, 1)
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix()
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.shadow.camera, 'right', 1, 1000, 1)
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix()
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.shadow.camera, 'top', 1, 1000, 1)
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix()
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.shadow.camera, 'bottom', -1000, -1, 1)
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix()
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.shadow.camera, 'near', 0, 10000)
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix()
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(directionalLight.shadow.camera, 'far', 0.1, 10000)
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix()
      directionalLightHelper.update()
    })
  directionalLightFolder
    .add(data, 'shadowMapSizeWidth', [256, 512, 1024, 2048, 4096])
    .onChange(() => updateDirectionalLightShadowMapSize())
  directionalLightFolder
    .add(data, 'shadowMapSizeHeight', [256, 512, 1024, 2048, 4096])
    .onChange(() => updateDirectionalLightShadowMapSize())
  directionalLightFolder
    .add(directionalLight.shadow, 'radius', 1, 1000, 1)
    .name('radius (PCF | VSM)') // PCFShadowMap or VSMShadowMap
  directionalLightFolder
    .add(directionalLight.shadow, 'blurSamples', 1, 2000, 1)
    .name('blurSamples (VSM)') // VSMShadowMap only
  directionalLightFolder.open()
}

export function lerp(from: number, to: number, speed: number) {
  const amount = (1 - speed) * from + speed * to
  return Math.abs(from - to) < 0.001 ? to : amount
}
export const addBallCollisionListener = (
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
export const moveBall = (
  body: RAPIER.RigidBody,
  positions: THREE.Vector2[]
) => {
  // 三点受力分析法，起点、第一个拐点、第二个拐点/终点
  // x 拐点重要，y 拐点辅助
  const threePoints: THREE.Vector2[] = []
  // const threePointsY: THREE.Vector2[] = []
  let deltaX = 0
  let deltaY = 0
  positions.forEach((position, index) => {
    if (index === 0) {
      threePoints.push(position)
    } else {
      const dX = positions[index].x - positions[index - 1].x
      const dY = positions[index].y - positions[index - 1].y
      if (deltaX && deltaY) {
        if ((deltaX < 0 && dX > 0) || (deltaX > 0 && dX < 0)) {
          // 记录 X 拐点
          threePoints.push(new THREE.Vector2(position.x, position.y))
        }

        // if ((deltaX < 0 && dX > 0) || (deltaX > 0 && dX < 0)) {
        //   // 记录 Y 拐点
        //   threePoints.push(new THREE.Vector2(position.x, position.y))
        // }

        deltaX = dX
        deltaY = dY
      } else {
        deltaX = dX
        deltaY = dY
      }

      // const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
  })

  console.log(threePoints)

  const actionParams = {
    impulse: new RAPIER.Vector3(200 * 0.9 * 2.3, 73, -280 * 1.8), // 初始力
    detalX: -9.8 * 1.5 * 2.7, // x 方向初引力
    torque: new RAPIER.Vector3(552.0 * 0.3, 510 * 0, -500 * 0), // 初始扭矩(自转)
    detalXSpeed: 0.1 // x 方向引力减弱强度
  }
  body.applyTorqueImpulse(actionParams.torque, true)

  // 瞬间给力
  body.applyImpulse(actionParams.impulse, true)
  let detalX = actionParams.detalX
  const interval = setInterval(() => {
    // 持续施加x方向的力
    detalX += actionParams.detalXSpeed
    body.addForce(new RAPIER.Vector3(detalX, 0, 0), true)
    if (detalX >= 0) {
      body.resetForces(true)
      body.addForce(new RAPIER.Vector3(0, 0, 0), true)
      clearInterval(interval)
    }
  }, 10)
  addBallCollisionListener('ballWallCollision', (e) => {
    body.resetForces(true)
    body.addForce(new RAPIER.Vector3(0, 0, 0), true)
    clearInterval(interval)
  })

  return interval
}
