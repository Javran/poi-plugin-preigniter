import _ from 'lodash'
import { remote } from 'electron'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'

const { $ } = window

class FormationSelectionOverlayer extends Component {
  state = {
    gameTop: 0,
    gameLeft: 0,
  }

  gameView = null

  handleResize = _entries => {
    const kanGameDiv = $('kan-game > div')
    if (!kanGameDiv)
      return
    const offset = {
      top: kanGameDiv.offsetTop,
      left: kanGameDiv.offsetLeft,
    }
    this.setState({
      gameTop: kanGameDiv.offsetTop,
      gameLeft: kanGameDiv.offsetLeft,
    })
  }

  componentDidMount = () => {
    this.gameView = $('kan-game')
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.gameView)
  }

  componentWillUnmount = () => {
    this.resizeObserver.unobserve(this.gameView)
    this.gameView = null
  }


  render() {
    const {gameTop, gameLeft} = this.state
    const kanGameView = $('kan-game')
    if (!kanGameView) return ''
    const ovl = (
      <div
        class="preigniter-overlayer"
        style={{
          width: 800,
          height: 480,
          border: '1px solid #E00',
          pointerEvents: 'none',
          position: 'absolute',
          left: gameLeft,
          top: gameTop,
          zIndex: 1,
        }}
      />
    )
    return ReactDOM.createPortal(
      ovl,
      kanGameView
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
