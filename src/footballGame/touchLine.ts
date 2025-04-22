import * as THREE from 'three'
const linePointMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
}) // 轨迹的材质
const linePointMeshArr: THREE.Mesh[] = [] // 存储所有的轨迹圆
const createPoint = (point: THREE.Vector3) => {
  const pointGeometry = new THREE.SphereGeometry(2.5) // 半径为1
  const pointMesh = new THREE.Mesh(pointGeometry, linePointMaterial)

  // 设置轨迹点的位置和旋转
  pointMesh.position.copy(point)

  return pointMesh
}
const lineWayPositions: THREE.Vector3[] = []

const filterPointArr = () => {
  const bigLen = 200 // 最多 200 个轨迹点
  return lineWayPositions.slice(
    lineWayPositions.length > bigLen ? lineWayPositions.length - bigLen : 0,
    lineWayPositions.length
  )
}

const updateLine = (scene: THREE.Scene, point: THREE.Vector3) => {
  // 清除之前的轨迹体
  lineWayPositions.push(point)
  linePointMeshArr.forEach((point) => scene.remove(point))
  linePointMeshArr.length = 0 // 清空数组

  if (lineWayPositions.length > 1) {
    // if (lineWayPositions.length > bigLen) {
    const newPositions = filterPointArr()

    for (let i = 0; i < newPositions.length - 1; i++) {
      const pointMesh = createPoint(newPositions[i])
      scene.add(pointMesh)
      linePointMeshArr.push(pointMesh) // 存储轨迹体
    }
    // } else {
    //   for (let i = 0; i < lineWayPositions.length - 1; i++) {
    //     const pointMesh = createPoint(lineWayPositions[i])
    //     scene.add(pointMesh)
    //     linePointMeshArr.push(pointMesh) // 存储轨迹体
    //   }
    // }
  }
}
const clearLine = (scene: THREE.Scene) => {
  lineWayPositions.length = 0
  linePointMeshArr.forEach((point) => scene.remove(point))
  linePointMeshArr.length = 0
}

export const initTouchLine = (scene: THREE.Scene) => {
  return {
    updateLine: (point: THREE.Vector3) => {
      updateLine(scene, point)
    },
    clearLine: () => {
      clearLine(scene)
    },
    getLineWayPositions: () => {
      return lineWayPositions
    }
  }
}
