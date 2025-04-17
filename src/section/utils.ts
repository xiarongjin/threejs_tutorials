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
