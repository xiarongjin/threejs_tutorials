import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
// import { lineWayToActionParams } from './lineWayToAction'
// import { addBallCollisionListener } from './utils'
import { ballTestAction } from './ballTestAction'
export const ballAction = (
  body: RAPIER.RigidBody,
  positions: THREE.Vector2[]
) => {
  try {
    ballTestAction(body, positions)
  } catch (error) {
    console.log(error)
  }

  // const actionParams = lineWayToActionParams(positions)
  // body.applyTorqueImpulse(actionParams.torque, true)

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
