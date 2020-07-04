import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import {
  expectFormationSelectionSelector,
  gameScreenInfoSelector,
  formationTypeSelector,
} from '../../selectors'
import { PTyp } from '../../ptyp'
import { boxGuidesInfo } from '../../box-guides'

const { $ } = window

const GAME_ORIGINAL_WIDTH = 1200
const GAME_ORIGINAL_HEIGHT = 720

@connect(
  state => ({
    ...gameScreenInfoSelector(state),
    expectFormationSelection: expectFormationSelectionSelector(state),
    formationType: formationTypeSelector(state),
  })
)
class FormationSelectionOverlay extends PureComponent {
  static propTypes = {
    // connnected:
    expectFormationSelection: PTyp.bool.isRequired,
    gameDisplayWidth: PTyp.number.isRequired,
    gameOriginalWidth: PTyp.number.isRequired,
    formationType: PTyp.string.isRequired,
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
      expectFormationSelection,
      gameDisplayWidth,
      gameOriginalWidth,
      formationType,
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
      !expectFormationSelection ||
      !this.gameView ||
      !(formationType in boxGuidesInfo)
    )
      return ''
    const ratio = gameDisplayWidth / GAME_ORIGINAL_WIDTH
    const btnSpecs = boxGuidesInfo[formationType]
    const FSOverlay = (
      <div
        className="preigniter-overlay"
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
        {
          btnSpecs.map(({formation, x: left, y: top, width, height}) => (
            <div
              key={formation}
              style={{
                boxSizing: 'border-box',
                border: '3px solid cyan',
                position: 'absolute',
                left, top, width, height,
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

export {
  FormationSelectionOverlay,
}
