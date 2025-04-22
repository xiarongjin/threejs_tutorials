import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
export const ballAction = (
  body: RAPIER.RigidBody,
  positions: THREE.Vector2[]
) => {
  const actionParams = {
    impulse: new RAPIER.Vector3(200 * 0.9 * 1.3, 73, -280 * 2.8), // 初始力
    detalX: -9.8 * 1.5 * 2.7, // x 方向初引力
    torque: new RAPIER.Vector3(552.0 * 0.3, 510 * 0, -500 * 0), // 初始扭矩(自转)
    detalXSpeed: 0.1 // x 方向引力减弱强度
  }
  body.applyTorqueImpulse(actionParams.torque, true)

  // 瞬间给力
  body.applyImpulse(actionParams.impulse, true)
}
