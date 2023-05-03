import _ from 'lodash'
import React, {PureComponent} from 'react'
import { connect } from 'react-redux'
import {
  onSortieScreenSelector,
  enemyFleetPreviewSelector,
} from '@x/selectors'

import { PTyp } from '@x/ptyp'

@connect(
  state => ({
    onSortieScreen: onSortieScreenSelector(state),
    enemyFleetPreview: enemyFleetPreviewSelector(state),
  })
)
class EnemySilhouetteView extends PureComponent {
  static propTypes = {
    // connected:
    onSortieScreen: PTyp.bool.isRequired,
    enemyFleetPreview: PTyp.array,
  }

  static defaultProps = {
    enemyFleetPreview: null,
  }

  render() {
    const {onSortieScreen, enemyFleetPreview} = this.props
    if (!onSortieScreen || !Array.isArray(enemyFleetPreview)) {
      return null
    }
    return (
      <div
        style={{
          position: 'absolute',
          fontFamily: 'monospace',
          fontSize: '2em',
          color: '#f96d00',
          bottom: 75,
          right: 160,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'baseline',
        }}
      >
        {_.join(enemyFleetPreview, ' ')}
      </div>
    )
  }
}

export { EnemySilhouetteView }
