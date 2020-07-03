import _ from 'lodash'
import { remote } from 'electron'
import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'

const { $ } = window

class FormationSelectionOverlayer extends PureComponent {
  render() {
    const gameView = $('kan-game')
    if (!gameView) return ''
    const ovl = (
      <div
        class="preigniter-overlayer"
        style={{
          width: 100,
          height: 100,
          color: '#E00',
          pointerEvents: 'none',
          position: 'absolute',
          left: 0,
          right: 0,
        }}
      />
    )
    return ReactDOM.createPortal(
      ovl,
      gameView
    )
  }
}

const reactClass = FormationSelectionOverlayer

const pluginDidLoad = () => {}
const pluginWillUnload = () => {}

export {
  pluginDidLoad,
  pluginWillUnload,
  reactClass,
}
