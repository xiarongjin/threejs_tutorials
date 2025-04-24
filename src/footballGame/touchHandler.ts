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

  const touchMoveHandler = (e: TouchEvent) => {
    // e.preventDefault()
    touchMove(e)
  }
  const touchStartHandler = () => {
    if (!canAction) return
    canAction = false
    canFinishAction = true
    touchStart()
    dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  }
  dom.addEventListener('touchstart', touchStartHandler, { passive: true })

  // dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  const touchEndHandler = () => {
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
  }
  dom.addEventListener('touchend', touchEndHandler, { passive: true })
}
