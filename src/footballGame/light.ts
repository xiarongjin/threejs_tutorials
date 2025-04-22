import * as THREE from 'three'
export const initLight = () => {
  const data = {
    color: 0x00ff00,
    lightColor: 0xffffff,
    shadowMapSizeWidth: 512,
    shadowMapSizeHeight: 512
  }

  const directionalLight = new THREE.DirectionalLight(
    data.lightColor,
    Math.PI / 2
  )
  const directionalLightConfigInit = () => {
    directionalLight.castShadow = true
    directionalLight.intensity = 5
    directionalLight.shadow.camera.near = 0
    directionalLight.shadow.camera.far = 1520
    directionalLight.shadow.camera.top = 150
    directionalLight.shadow.camera.bottom = -247
    directionalLight.shadow.camera.right = 180
    directionalLight.shadow.camera.left = -120
    directionalLight.shadow.mapSize.width = data.shadowMapSizeWidth
    directionalLight.shadow.mapSize.height = data.shadowMapSizeHeight
    directionalLight.position.set(169, 214, 110)
  }
  directionalLightConfigInit()
  return directionalLight
}
