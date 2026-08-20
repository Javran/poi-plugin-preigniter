import _ from 'lodash'
import React, {PureComponent} from 'react'
import { createSelector } from 'reselect'
import { connect } from 'react-redux'
import {
  constSelector,
} from 'views/utils/selectors'
import {
  onSortieScreenSelector,
  enemyFleetPreviewSelector,
} from '@x/selectors'

import { PTyp } from '@x/ptyp'

const isAbyssalShipMstId = x => x > 1500

/* eslint-disable quote-props */
const abyssalYomiAbbrs = {
  'flagship': 'FS',
  'elite': 'EL',
}
/* eslint-enable quote-props */

const combineAbyssalYomi = (name, yomi) => {
  if (!yomi || yomi === '-' || typeof yomi !== 'string') {
    return name
  }

  const tr = abyssalYomiAbbrs[yomi]

  if (_.isEmpty(tr)) {
    // new stuff that we don't know how to translate
    return `${name} ${yomi}`
  }

  return `${name} ${tr}`
}

const renderShipNameSelector = createSelector(
  constSelector,
  kcConst => {
    const $ships = _.get(kcConst, '$ships')
    if (_.isEmpty($ships)) {
      return shipId => `#${shipId}`
    }
    return shipId => {
      const aby = isAbyssalShipMstId(shipId)
      const nm = _.get($ships, [shipId, 'api_name'])

      if (!nm || typeof nm !== 'string') {
        return `#${shipId}`
      }

      if (aby) {
        /*
          abyssal may have extra info like "flagship" stored
          in api_yomi, which should be displayed
         */
        const ym = _.get($ships, [shipId, 'api_yomi'], '')
        return combineAbyssalYomi(nm, ym)
      }

      return nm
    }
  }
)

@connect(
  state => ({
    onSortieScreen: onSortieScreenSelector(state),
    enemyFleetPreview: enemyFleetPreviewSelector(state),
    renderShipName: renderShipNameSelector(state),
  })
)
class EnemySilhouetteView extends PureComponent {
  static propTypes = {
    // connected:
    onSortieScreen: PTyp.bool.isRequired,
    enemyFleetPreview: PTyp.array,
    renderShipName: PTyp.func.isRequired,
  }

  static defaultProps = {
    enemyFleetPreview: null,
  }

  render() {
    const {onSortieScreen, enemyFleetPreview, renderShipName} = this.props
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
        {_.join(enemyFleetPreview.map(x => renderShipName(x)), ' ')}
      </div>
    )
  }
}

export { EnemySilhouetteView }
