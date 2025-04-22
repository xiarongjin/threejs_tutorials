import * as THREE from 'three'

// 三点受力分析法
const filterPoint = (lineWayPositions: THREE.Vector2[]) => {
  const keyPoints: THREE.Vector2[] = []
  const len = lineWayPositions.length
  let endPointIndex = len - 1
  // 获取转折点
  let deltaX = 0
  let deltaY = 0
  lineWayPositions.some((position, index) => {
    if (index === 0) {
      keyPoints.push(position)
    } else {
      const currentDeltaX = position.x - lineWayPositions[index - 1].x
      const currentDeltaY = position.y - lineWayPositions[index - 1].y
      if (
        (currentDeltaX < 0 && deltaX > 0) ||
        (currentDeltaX > 0 && deltaX < 0) ||
        (currentDeltaY < 0 && deltaY > 0) ||
        (currentDeltaY > 0 && deltaY < 0)
      ) {
        // x 左转或右转
        // keyPoints.push(position)
        endPointIndex = index - 1
        return true
      }
      deltaX = currentDeltaX
      deltaY = currentDeltaY
    }
  })
  keyPoints.push(lineWayPositions[Math.floor(endPointIndex / 2)])
  keyPoints.push(lineWayPositions[endPointIndex])
  return keyPoints
}

// 计算两点间的斜率
const getSlope = (p1: THREE.Vector2, p2: THREE.Vector2) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return {
    dx,
    dy,
    slope: dx / dy
  }
}

const getParams = (
  powerX: number,
  powerY: number,
  POWER: number,
  detalX: number = 0,
  detalXSpeed: number = 0
) => {
  return {
    impulse: new THREE.Vector3(powerX, -POWER / 1.2, powerY),
    torque: new THREE.Vector3(POWER * -5, POWER * -1, POWER * 1),
    detalX: detalX,
    detalXSpeed: detalXSpeed
  }
}

export const lineWayToActionParams = (lineWayPositions: THREE.Vector2[]) => {
  // 默认参数
  const actionParams = {
    impulse: new THREE.Vector3(400, 73, -1000), // 初始力
    detalX: -9.8 * 30, // x 方向初引力
    torque: new THREE.Vector3(552.0 * 10.3, 510 * 0, -500 * 0), // 初始扭矩(自转)
    detalXSpeed: 0.1 // x 方向引力减弱强度
  }

  const keyPoints = filterPoint(lineWayPositions)

  const phase1 = getSlope(keyPoints[0], keyPoints[1])
  const phase2 = getSlope(keyPoints[1], keyPoints[2])

  // 球门方向为 y 轴负方向
  // 开口方向

  const POWER = -1000 * 1 * 0.4

  if (phase1.dy < 0 && phase2.dy < 0) {
    // 朝 球门 方向
    if (phase1.dx > 0 && phase2.dx > 0) {
      // 朝 X 轴正方向
      // console.log('朝球门方向+X轴正方向')
      // console.log(phase1.slope, phase2.slope)
      // 斜率都是负的
      if (phase1.slope > phase2.slope) {
        // console.log('第一阶段更靠近球门走')
        const slope = phase1.dx / (phase1.dy + phase2.dy)
        const powerY = POWER * 5
        const powerX = powerY * slope
        // console.log('y 方向的力更大:' + powerY, 'x 方向的力:' + powerX)
        // TODO : 扭矩的调整与偏离角的叠加
        return getParams(powerX, powerY, POWER)
      } else {
        // console.log('第一阶段更靠近X轴走')
        const slope = (phase1.dx + phase2.dx) / phase1.dy
        const powerY = POWER * 5
        const powerX = powerY * slope
        // console.log('X 方向的力更大:' + powerX, 'y 方向的力:' + powerY)
        // TODO : 扭矩的调整与偏离角的叠加
        return getParams(powerX, powerY, POWER)
      }
    }
    if (phase1.dx < 0 && phase2.dx < 0) {
      // 朝 X 轴负方向
      // console.log('朝球门方向+X轴负方向')
      // console.log(phase1.slope, phase2.slope)
      if (phase1.slope > phase2.slope) {
        // console.log('第一阶段更靠近X轴走')
        const slope = phase1.dx / (phase1.dy + phase2.dy)
        const powerY = POWER * 5
        const powerX = powerY * slope
        // console.log('y 方向的力更大:' + powerY, 'x 方向的力:' + powerX)
        // TODO : 扭矩的调整与偏离角的叠加
        return getParams(powerX, powerY, POWER)
      } else {
        // console.log('第一阶段更靠近球门走')
        const slope = (phase1.dx + phase2.dx) / phase1.dy
        const powerY = POWER * 5
        const powerX = powerY * slope
        // console.log('y 方向的力更大:' + powerY, 'x 方向的力:' + powerX)
        // TODO : 扭矩的调整与偏离角的叠加
        return getParams(powerX, powerY, POWER)
      }
    }
  } else {
    console.log('朝球门反方向')
    return actionParams
  }
}
