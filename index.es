import _ from 'lodash'
import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { reducer } from './store'
import {
  expectFormationSelectionSelector,
  gameScreenInfoSelector,
  formationTypeSelector,
} from './selectors'
import { PTyp } from './ptyp'
import { boxGuidesInfo } from './box-guides'

const { $ } = window

/*
  TODO:

  - there are still some cases where we expect a single fleet formation
    in a combined fleet map, which we haven't considered here.

  Note:
   - api_event_kind：イベント種別
   0=非戦闘セル, 1=通常戦闘, 2=夜戦, 3=夜昼戦, 4=航空戦, 5=敵連合艦隊戦, 6=長距離空襲戦, 7=夜昼戦(対連合艦隊), 8=レーダー射撃
 */

const widthToHeight = w => _.round(w * 6 / 10)

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
      !expectFormationSelection ||
      !this.gameView ||
      !(formationType in boxGuidesInfo)
    )
      return ''
    const ratio = gameDisplayWidth / gameOriginalWidth
    const btnSpecs = boxGuidesInfo[formationType]
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
          zIndex: 1,
        }}
      >
        {
          btnSpecs.map(({formation, x, y, width, height}) => (
            <div
              key={formation}
              style={{
                border: '2px solid cyan',
                position: 'absolute',
                width: width * ratio + 4,
                height: height * ratio + 4,
                left: x * ratio - 2,
                top: y * ratio - 2,
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
