import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { MeshColliderBuilder } from './meshColliderBuilder'

export const initBall = (world: RAPIER.World) => {
  const ballRadius = 2
  const ballData = {
    radius: ballRadius,
    x: 0,
    y: ballRadius,
    z: 80,
    mass: 5,
    friction: 0.5, // 摩擦
    restitution: 0.04, // 弹性
    linearDamping: 0.1,
    angularDamping: 0.5,
    ccdEnabled: true
  }
  let ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(ballData.radius, 32, 32),
    new THREE.MeshNormalMaterial({ flatShading: true })
  )
  ballMesh.position.set(ballData.x, ballData.y, ballData.z)
  ballMesh.castShadow = true
  let body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setLinearDamping(0.1) // 添加线性阻尼
      .setAngularDamping(0.5) // 添加角阻尼
      .setCcdEnabled(true)
  )

  const ballCollider = MeshColliderBuilder.create(ballMesh, world, body, 'ball')
  ballCollider.setFriction(ballData.friction)
  ballCollider.setRestitution(ballData.restitution)
  ballCollider.setMass(ballData.mass)
  const ball = {
    mesh: ballMesh,
    collider: ballCollider,
    body: body,
    destroy: () => {
      // console.log('destroy ball')
      body.resetForces(true)
      body.applyImpulse(new RAPIER.Vector3(0, 0, 0), true)
      body.setTranslation({ x: 0, y: ballData.y, z: ballData.z }, true)
      body.setAngvel({ x: 0.0, y: 0.0, z: 0.0 }, true) // 角动量
      body.setLinvel({ x: 0.0, y: 0.0, z: 0.0 }, true)
    },
    update: () => {
      console.log('update ball')
    }
  }

  return ball
}
