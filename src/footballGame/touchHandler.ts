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

  const touchMoveHandler = (e: TouchEvent) => {
    // e.preventDefault()
    touchMove(e)
  }
  const touchStartHandler = () => {
    if (!canAction) return
    touchStart()
    dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  }
  dom.addEventListener('touchstart', touchStartHandler, { passive: true })

  // dom.addEventListener('touchmove', touchMoveHandler, { passive: true })
  const touchEndHandler = () => {
    if (canAction) {
      touchEnd()
      dom.removeEventListener('touchmove', touchMoveHandler)
      dom.removeEventListener('touchstart', touchStartHandler)
      canAction = false
      const timer = setTimeout(() => {
        initAction()
      }, initMs)
      const timer2 = setTimeout(() => {
        canAction = true
        clearTimeout(timer)
        clearTimeout(timer2)
        dom.addEventListener('touchstart', touchStartHandler, { passive: true })
      }, initMs + 10)
    }
  }
  dom.addEventListener('touchend', touchEndHandler, { passive: true })
}
