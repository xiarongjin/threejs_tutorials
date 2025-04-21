import RAPIER from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'
import type { BufferGeometry, Mesh } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils'

export type RigidBodyAutoCollider =
  | 'ball'
  | 'cuboid'
  | 'hull'
  | 'trimesh'
  | 'heightfield'
  | false

export class MeshColliderBuilder {
  static create(
    mesh: Mesh,
    world: RAPIER.World,
    body: RAPIER.RigidBody,
    type: RigidBodyAutoCollider = 'trimesh'
  ): RAPIER.Collider {
    const data = this.getColliderArgsFromGeometry(mesh.geometry, type)
    const worldScale = mesh.getWorldScale(new Vector3())
    const worldPosition = mesh.getWorldPosition(new Vector3())
    const worldQuaternion = mesh.getWorldQuaternion(new Quaternion())

    body.setTranslation(
      { x: worldPosition.x, y: worldPosition.y, z: worldPosition.z },
      true
    )
    console.log(worldPosition)
    body.setRotation(
      {
        x: worldQuaternion.x,
        y: worldQuaternion.y,
        z: worldQuaternion.z,
        w: worldQuaternion.w
      },
      true
    )

    const scaledArgs = this.scaleColliderArgs(type, data.args, worldScale)

    let colliderDesc: RAPIER.ColliderDesc

    switch (type) {
      case 'trimesh':
        colliderDesc = RAPIER.ColliderDesc.trimesh(scaledArgs[0], scaledArgs[1])
        break
      case 'hull':
        colliderDesc = RAPIER.ColliderDesc.convexHull(scaledArgs[0])!
        break
      case 'ball':
        colliderDesc = RAPIER.ColliderDesc.ball(scaledArgs[0])
        break
      case 'cuboid':
        colliderDesc = RAPIER.ColliderDesc.cuboid(
          scaledArgs[0],
          scaledArgs[1],
          scaledArgs[2]
        )
        break
      default:
        throw new Error(`Unsupported collider type: ${type}`)
    }

    const scaledOffset = data.offset.clone().multiply(worldScale)
    colliderDesc.setTranslation(scaledOffset.x, scaledOffset.y, scaledOffset.z)

    return world.createCollider(colliderDesc, body)
  }

  private static scaleColliderArgs(
    type: RigidBodyAutoCollider,
    args: any[],
    scale: Vector3
  ): any[] {
    switch (type) {
      case 'ball':
        return [args[0] * Math.max(scale.x, scale.y, scale.z)]
      case 'cuboid':
        return [args[0] * scale.x, args[1] * scale.y, args[2] * scale.z]
      case 'trimesh':
      case 'hull': {
        const scaledVertices = new Float32Array(args[0].length)
        for (let i = 0; i < args[0].length; i += 3) {
          scaledVertices[i] = args[0][i] * scale.x
          scaledVertices[i + 1] = args[0][i + 1] * scale.y
          scaledVertices[i + 2] = args[0][i + 2] * scale.z
        }
        return [scaledVertices, args[1]]
      }
      default:
        return args
    }
  }

  private static getColliderArgsFromGeometry(
    geometry: BufferGeometry,
    type: RigidBodyAutoCollider
  ): { args: any[]; offset: Vector3 } {
    switch (type) {
      case 'cuboid': {
        geometry.computeBoundingBox()
        const { boundingBox } = geometry
        const size = boundingBox!.getSize(new Vector3())
        return {
          args: [size.x / 2, size.y / 2, size.z / 2],
          offset: boundingBox!.getCenter(new Vector3())
        }
      }

      case 'ball': {
        geometry.computeBoundingSphere()
        const { boundingSphere } = geometry
        return {
          args: [boundingSphere!.radius],
          offset: boundingSphere!.center
        }
      }

      case 'trimesh': {
        const clonedGeometry = geometry.index
          ? geometry.clone()
          : mergeVertices(geometry)
        return {
          args: [
            clonedGeometry.attributes.position.array as Float32Array,
            clonedGeometry.index?.array as Uint32Array
          ],
          offset: new Vector3()
        }
      }

      case 'hull': {
        const g = geometry.clone()
        return {
          args: [g.attributes.position.array as Float32Array],
          offset: new Vector3()
        }
      }

      default:
        return { args: [], offset: new Vector3() }
    }
  }
}
