import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import {
  gameScreenInfoSelector,
  poiZoomFactorSelector,
} from '@x/selectors'
import { PTyp } from '@x/ptyp'
import { FormationSelectionGuides } from './formation-selection-guides'
import { RouteView } from './route-view'

const { $ } = window

const GAME_ORIGINAL_WIDTH = 1200
const GAME_ORIGINAL_HEIGHT = 720

/*
  This component serves as root of all overlays.
  it renders the overlay and attach it on top of the game screen,
  does all heavylifting of handling window resize and scaling.
  All children components can assume the standard game screen size
  1200 x 720.
 */
@connect(
  state => ({
    zoomFactor: poiZoomFactorSelector(state),
    ...gameScreenInfoSelector(state),
  }),
)
class OverlayRoot extends PureComponent {
  static propTypes = {
    // connnected:
    gameDisplayWidth: PTyp.number.isRequired,
    gameOriginalWidth: PTyp.number.isRequired,
    zoomFactor: PTyp.number.isRequired,
  }

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
    const {
      gameDisplayWidth,
      gameOriginalWidth,
      zoomFactor,
    } = this.props
    const {gameTop, gameLeft} = this.state
    if (
      /*
         Don't show up if original width breaks the assumption.
         we could try to compute new scaling factor
         but I don't the effort is worth it - likely many other things
         will require adjustment prior to this anyways.
       */
      gameOriginalWidth !== GAME_ORIGINAL_WIDTH ||
      !this.gameView
    )
      return ''
    const ratio = gameDisplayWidth / GAME_ORIGINAL_WIDTH / zoomFactor
    const OverlayRendered = (
      <div
        className="preigniter-overlay-root"
        style={{
          transform: `scale(${ratio})`,
          transformOrigin: '0 0',
          width: GAME_ORIGINAL_WIDTH,
          height: GAME_ORIGINAL_HEIGHT,
          pointerEvents: 'none',
          position: 'absolute',
          left: gameLeft,
          top: gameTop,
          zIndex: 1,
        }}
      >
        <FormationSelectionGuides />
        <RouteView />
      </div>
    )
    return ReactDOM.createPortal(
      OverlayRendered,
      this.gameView
    )
  }
}

export {
  OverlayRoot,
}
