import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { MeshColliderBuilder } from './meshColliderBuilder'

export const initWall = (
  texture: THREE.Texture,
  world: RAPIER.World,
  data = {
    width: 700,
    height: 700,
    depth: 0.5,
    x: 0,
    y: -220,
    z: -220,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    friction: 1, // 摩擦系数,
    restitution: 0.34 // 弹性系数
  }
) => {
  const wallData = data
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

  // 创建物理世界中的挡板固定刚体
  const wallBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())

  const floorCollider = MeshColliderBuilder.create(
    wallMesh,
    world,
    wallBody
    // 'cuboid'
  )
  floorCollider.setFriction(wallData.friction)
  floorCollider.setRestitution(wallData.restitution)
  return {
    mesh: wallMesh,
    collider: floorCollider
  }
}
