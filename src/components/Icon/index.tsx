import type { CSSProperties } from 'vue'
export interface iconProps {
  className?: string
  type?: 'copy' | 'close'
  size?: number
  style?: CSSProperties
}
const svgMap = {
  copy: (
    <svg
      viewBox='64 64 896 896'
      focusable='false'
      data-icon='copy'
      aria-hidden='true'
    >
      <path d='M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z'></path>
    </svg>
  ),
  close: (
    <svg
      viewBox='0 0 1045 1024'
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      p-id='1187'
    >
      <path
        d='M282.517333 213.376l-45.354666 45.162667L489.472 512 237.162667 765.461333l45.354666 45.162667L534.613333 557.354667l252.096 253.269333 45.354667-45.162667-252.288-253.44 252.288-253.482666-45.354667-45.162667L534.613333 466.624l-252.096-253.226667z'
        p-id='1188'
      ></path>
    </svg>
  ),
}
const renderDom = (props: iconProps) => {
  const { type = 'copy', size = 12, style = {} } = props
  if (type in svgMap) {
    const svg = svgMap[type]
    if (size) {
      style.width = size + 'px'
      style.height = size + 'px'
    }
    if (svg && svg.props) {
      svg.props.style = style
    }
    return svg
  }
  return <i></i>
}
export default renderDom
