import React, {PureComponent} from 'react'
import { connect } from 'react-redux'

import {
  spotHistorySelector,
  getSpotNameFuncSelector,
  onSortieScreenSelector,
} from '@x/selectors'
import { PTyp } from '@x/ptyp'

@connect(
  state => ({
    spotHistory: spotHistorySelector(state),
    getSpotName: getSpotNameFuncSelector(state),
    onSortieScreen: onSortieScreenSelector(state),

  })
)
class RouteView extends PureComponent {
  static propTypes = {
    // connected:
    spotHistory: PTyp.array.isRequired,
    getSpotName: PTyp.func.isRequired,
    onSortieScreen: PTyp.bool.isRequired,
  }

  render() {
    const {spotHistory, getSpotName, onSortieScreen} = this.props
    if (!onSortieScreen || !spotHistory.length)
      return null
    return (
      <div
        style={{
          position: 'absolute',
          fontFamily: 'monospace',
          fontSize: '2em',
          bottom: 15,
          right: 160,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'baseline',
        }}
      >
        {
          spotHistory.map((spotId, ind) => {
            const isLastElement = ind === spotHistory.length - 1
            return (
              <>
                <div
                  style={{
                    fontFamily: 'monospace',
                    ...(
                      isLastElement ? {
                        fontWeight: 'bold',
                        fontSize: '1.5em',
                        color: 'magenta',
                      } : {
                        color: '#AAA',
                      }
                    ),
                  }}
                  key={`spot-${spotId}`}>
                  {getSpotName(spotId)}
                </div>
                {
                  !isLastElement && (
                    <div
                      style={{
                        fontFamily: 'monospace',
                        color: '#AAA',
                        padding: '0 .4em',
                      }}
                      key={`sep-${spotId}`}
                    >
                      -
                    </div>
                  )
                }
              </>
            )
          })
        }
      </div>
    )
  }
}


export { RouteView }
