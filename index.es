import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'

const { $ } = window

class FormationSelectionOverlay extends PureComponent {
  state = {
    gameTop: 0,
    gameLeft: 0,
  }

  componentDidMount = () => {
    /*
       For whatever reason, `kangame > div` doesn't trigger ResizeObserver,
       so we have to put this on its parent, ergo this messy state.
     */
    this.gameView = $('kan-game')
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.gameView)
  }

  componentWillUnmount = () => {
    this.resizeObserver.unobserve(this.gameView)
    this.gameView = null
  }

  // Keeping track of root of the game view
  gameView = null

  handleResize = _entries => {
    /*
       All we need is a hint that something has changed,
       we actually don't care what are the changes,
       since those are made to the parent.
     */
    const kanGameDiv = this.gameView && this.gameView.querySelector('div')
    if (!kanGameDiv)
      return
    this.setState({
      gameTop: kanGameDiv.offsetTop,
      gameLeft: kanGameDiv.offsetLeft,
    })
  }

  render() {
    const {gameTop, gameLeft} = this.state
    if (!this.gameView) return ''
    const ratio = 800 / 1200
    const offsetWithVanguard = [
      [261, 601], [261, 796], [261, 994],
      [499, 601], [499, 796], [499, 994],
    ]
    const FSOverlay = (
      <div
        className="preigniter-overlay"
        style={{
          width: 800,
          height: 480,
          pointerEvents: 'none',
          position: 'absolute',
          left: gameLeft,
          top: gameTop,
          zIndex: 1,
        }}
      >
        {
          offsetWithVanguard.map(([y,x]) => (
            <div
              style={{
                border: '2px solid purple',
                position: 'absolute',
                width: (141+4) * ratio,
                height: (35+4) * ratio,
                left: (x-2) * ratio,
                top: (y-2) * ratio,
                zIndex: 1,
              }}
            />)
          )
        }
      </div>
    )
    return ReactDOM.createPortal(
      FSOverlay,
      this.gameView
    )
  }
}

const reactClass = FormationSelectionOverlay

const pluginDidLoad = () => {}
const pluginWillUnload = () => {}

export {
  pluginDidLoad,
  pluginWillUnload,
  reactClass,
}
