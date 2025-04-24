import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { lineWayToActionParams } from './lineWayToAction'
import { addBallCollisionListener } from './utils'
export const ballTestAction = (
  body: RAPIER.RigidBody,
  positions: THREE.Vector2[]
) => {
  // const actionParams = {
  //   impulse: new THREE.Vector3(400, 73, -1000), // 初始力
  //   detalX: -9.8 * 30, // x 方向初引力
  //   torque: new THREE.Vector3(552.0 * 10.3, 510 * 0, -500 * 0), // 初始扭矩(自转)
  //   detalXSpeed: 0.1 // x 方向引力减弱强度
  // }

  const POWER = -3000
  const params = lineWayToActionParams(positions)
  const dx = params.phase1.dx
  const dy = params.phase1.dy
  const slope = params.phase1.slope
  const powerX = POWER * slope
  console.log(slope, dy, dx)
  // 直线
  if (Math.abs(dy) < 0.01) {
    // 横向踢时，x 会无穷大，所以做了限制
    body.applyImpulse(
      new RAPIER.Vector3((-POWER * Math.abs(dx)) / dx, POWER / -20, 0),
      true
    )
  } else if (dy < 0) {
    if (slope * slope < 0.7 * 0.7) {
      body.applyImpulse(new RAPIER.Vector3(powerX, POWER / -20, POWER), true) // 施加 X 轴的力
    } else {
      // 对 slope 取绝对值
      body.applyImpulse(
        new RAPIER.Vector3(
          powerX / Math.abs(slope),
          POWER / -20,
          POWER / Math.abs(slope)
        ),
        true
      ) // 施加 X 轴的力
    }
  } else {
    // 反踢
    if (slope * slope < 0.7 * 0.7) {
      body.applyImpulse(new RAPIER.Vector3(-powerX, POWER / -20, -POWER), true) // 施加 X 轴的力
    } else {
      body.applyImpulse(
        new RAPIER.Vector3(
          -powerX / Math.abs(slope),
          POWER / -20,
          -POWER / Math.abs(slope)
        ),
        true
      ) // 施加 X 轴的力
    }
    console.log('踢反了')
  }

  // 反作用力
  // body.addForce(new RAPIER.Vector3(-2000, 0, 0), true) // 持续施加重力

  // body.addTorque(new RAPIER.Vector3(-1000 * 1, 0, 0), true) // 持续施加绕 Z 轴的扭矩
  // // 瞬间给力
  // body.applyImpulse(actionParams.impulse, true)
  // let detalX = actionParams.detalX
  // if (detalX) {
  //   const interval = setInterval(() => {
  //     // 持续施加x方向的力
  //     detalX += actionParams.detalXSpeed
  //     body.addForce(new RAPIER.Vector3(detalX, 0, 0), true)
  //     if (detalX >= 0) {
  //       body.resetForces(true)
  //       body.addForce(new RAPIER.Vector3(0, 0, 0), true)
  //       clearInterval(interval)
  //     }
  //   }, 10)
  //   addBallCollisionListener('ballWallCollision', (e) => {
  //     // body.resetForces(true)
  //     body.addForce(new RAPIER.Vector3(0, 0, 0), true)
  //     clearInterval(interval)
  //   })
  // return interval
  // }
  return null
}
