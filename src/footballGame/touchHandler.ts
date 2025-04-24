export const initTouchHandler = (
  dom: HTMLCanvasElement,
  touchMove: (e: TouchEvent) => void,
  touchEnd: () => void,
  touchStart: () => void,
  initAction: () => void,
  initMs: number = 5000
) => {
  // 绘制手指触摸轨迹
  let canAction = true // 能否进行操作
  let canFinishAction = false // 能否结束操作

  let lastTouchTime = 0 // 上一次触摸时间
  let startX = 0 // 开始触摸时x坐标
  let startY = 0 // 开始触摸时y坐标

  const touchMoveHandler = (e: TouchEvent) => {
    // e.preventDefault()
    touchMove(e)
  }
  const touchStartHandler = (e) => {
    console.log('touch start')
    lastTouchTime = Date.now()
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY

    if (!canAction) return
    canAction = false
    canFinishAction = true
    touchStart()
    dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  }
  dom.addEventListener('touchstart', touchStartHandler, { passive: true })

  // dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  const touchEndHandler = (e) => {
    console.log('touch end')
    const now = Date.now()
    const duration = now - lastTouchTime
    const deltaX = Math.abs(e.changedTouches[0].clientX - startX)
    const deltaY = Math.abs(e.changedTouches[0].clientY - startY)
    console.log(deltaX, deltaY, duration)
    // 对触发条件进行限制
    if (duration > 100 && (deltaX > 10 || deltaY > 10)) {
      if (canFinishAction) {
        canFinishAction = false
        touchEnd()
        dom.removeEventListener('touchmove', touchMoveHandler)
        const timer = setTimeout(() => {
          initAction()
          canAction = true
          clearTimeout(timer)
        }, initMs)
      }
    } else {
      canFinishAction = false
      // touchEnd()
      // initAction()
      canAction = true
    }
  }
  dom.addEventListener('touchend', touchEndHandler, { passive: true })
}
