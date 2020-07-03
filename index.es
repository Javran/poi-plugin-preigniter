import _ from 'lodash'
import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { reducer } from './store'
import {
  expectFormationSelectionSelector,
  gameScreenInfoSelector,
} from './selectors'
import { PTyp } from './ptyp'

const { $ } = window

/*
  TODO:

  - support combined fleets
  - hide on less-than-4-ships case
  - match in game box (4 ships), or the combined fleet case.

 */

const widthToHeight = w => _.round(w * 6 / 10)

@connect(
  state => ({
    ...gameScreenInfoSelector(state),
    expectFormationSelection: expectFormationSelectionSelector(state),
  })
)
class FormationSelectionOverlay extends PureComponent {
  static propTypes = {
    // connnected:
    expectFormationSelection: PTyp.bool.isRequired,
    gameDisplayWidth: PTyp.number.isRequired,
    gameOriginalWidth: PTyp.number.isRequired,
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
    } = this.props
    const {gameTop, gameLeft} = this.state
    if (!this.gameView) return ''
    const ratio = gameDisplayWidth / gameOriginalWidth
    const offsetWithVanguard = [
      [261, 601], [261, 796], [261, 994],
      [499, 601], [499, 796], [499, 994],
    ]
    const FSOverlay = (
      <div
        className="preigniter-overlay"
        style={{
          width: gameDisplayWidth,
          height: widthToHeight(gameDisplayWidth),
          pointerEvents: 'none',
          position: 'absolute',
          left: gameLeft,
          top: gameTop,
          opacity: expectFormationSelection ? 1 : 0,
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
  reducer,
  reactClass,
}
