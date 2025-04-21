import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { MeshColliderBuilder } from './meshColliderBuilder'

export const initFloor = (texture: THREE.Texture, world: RAPIER.World) => {
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
  const floorGeometry = new THREE.PlaneGeometry(
    floorData.width,
    floorData.depth
  ) // 长、高、宽
  floorGeometry.rotateX(-Math.PI / 2) // 绕x轴旋转90度

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
  // 创建物理世界中的地板板固定刚体
  const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())

  const floorCollider = MeshColliderBuilder.create(
    floorMesh,
    world,
    floorBody
    // 'cuboid'
  )
  floorCollider.setFriction(floorData.friction)
  floorCollider.setRestitution(floorData.restitution)
  return {
    mesh: floorMesh,
    body: floorBody,
    collider: floorCollider
  }
}
