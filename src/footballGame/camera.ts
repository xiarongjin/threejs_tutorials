import * as THREE from 'three'
export const initCamera = () => {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  )
  camera.position.set(0, 600, 440)
  // camera.scale.set(1.7, 1.7, 1.7)
  // camera.rotation.set(-0.7, 0, 0)
  // camera.lookAt(-0, -80, -80)
  return camera
}
