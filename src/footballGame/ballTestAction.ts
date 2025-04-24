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
  // console.log(params, positions)

  const dx = params.phase1.dx
  const dy = params.phase1.dy
  const dx2 = params.phase2.dx
  const dy2 = params.phase2.dy
  // 斜率 dx/dy
  const slope = params.phase1.slope
  const slope2 = params.phase2.slope
  const powerX = POWER * slope
  // console.log(dx, dy, dx2, dy2, slope, slope2)

  // 引力因子
  const forceFactor = (-10 * Math.abs(1 / (slope / slope2))) / 1.3
  // console.log(forceFactor, Math.abs(slope), Math.abs(slope2))

  // 当只有两个点时
  if (!slope || !slope2) {
    // console.log('只有两个点', Math.abs(dy2))

    // 横向踢时，x 会无穷大，所以做了限制
    if (Math.abs(dy2) < 0.3) {
      // console.log('只有两个点', Math.abs(dx2 ? dx2 : dx), Math.abs(dy2), 0.3)
      // 横向踢时，x 会无穷大，所以做了限制
      body.applyImpulse(
        new RAPIER.Vector3(
          (-POWER * Math.abs(dx2 ? dx2 : dx)) / (dx2 ? dx2 : dx),
          POWER / -20,
          0
        ),
        true
      )
    } else {
      const dy2New = dy2 ? dy2 : dy
      // console.log(dy2, dy, slope2, dy2New, Math.abs(dy2New) / dy2New)

      body.applyImpulse(
        new RAPIER.Vector3(
          -POWER * slope2 ? slope2 : slope,
          POWER / -20,
          POWER * -(Math.abs(dy2New) / dy2New)
        ),
        true
      )
    }
  } // 直线
  else if (Math.abs(dy) < 0.01) {
    // 横向踢时，x 会无穷大，所以做了限制
    body.applyImpulse(
      new RAPIER.Vector3((-POWER * Math.abs(dx)) / dx, POWER / -20, 0),
      true
    )
  } else if (dy < 0) {
    // 正踢

    // 控制斜率
    if (Math.abs(slope) < 2.7) {
      body.applyImpulse(new RAPIER.Vector3(powerX, POWER / -15, POWER), true) // 施加 X 轴的力
      // 添加持续引力
      body.addForce(new RAPIER.Vector3(powerX * forceFactor, 0, 0), true) // 施加 X 轴的力
      // 添加扭矩
      body.applyTorqueImpulse(
        new RAPIER.Vector3(-forceFactor * 100, 0, 0),
        true
      ) // 扭矩
    } else {
      // 对 slope 取绝对值
      // 当斜率较小时，控制施加的力度
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
    if (Math.abs(slope) < 0.7) {
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
  }
  {
  }

  addBallCollisionListener('ballWallCollision', (e) => {
    body.resetForces(true)
    body.resetTorques(true)
    // body.addForce(new RAPIER.Vector3(0, 0, 0), true)
    // clearInterval(interval)
  })

  return null
}
