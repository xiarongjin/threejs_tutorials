export const initTouchHandler = (
  dom: HTMLCanvasElement,
  touchMove: (e: TouchEvent) => void,
  touchEnd: () => void,
  initAction: () => void,
  initMs: number = 5000
) => {
  // 绘制手指触摸轨迹
  let canAction = true // 能否进行操作

  const touchMoveHandler = (e: TouchEvent) => {
    // e.preventDefault()
    touchMove(e)
  }
  const touchStartHandler = () => {
    if (!canAction) return
    dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  }
  dom.addEventListener('touchstart', touchStartHandler, { passive: true })

  // dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  const touchEndHandler = () => {
    if (!canAction) return
    if (canAction) {
      touchEnd()
      dom.removeEventListener('touchmove', touchMoveHandler)
      canAction = false
      const timer = setTimeout(() => {
        canAction = true
        clearTimeout(timer)
        initAction()
      }, initMs)
    }
  }
  dom.addEventListener('touchend', touchEndHandler, { passive: true })
}
