import _ from 'lodash'
import { createSelector } from 'reselect'
import {
  extensionSelectorFactory,
  sortieMapIdSelector,
  configSelector as poiConfigSelector,
} from 'views/utils/selectors'

import { initState } from './store'

const extSelector = createSelector(
  extensionSelectorFactory('poi-plugin-preigniter'),
  extStore =>
    _.isEmpty(extStore) ? initState : extStore
)

const mkExtPropSelector = propName =>
  createSelector(extSelector, ext => ext[propName])

const onSortieScreenSelector = mkExtPropSelector('onSortieScreen')

const expectFormationSelectionSelector = createSelector(
  sortieMapIdSelector,
  onSortieScreenSelector,
  (sortieMapId, isOnSortieScreen) =>
    Boolean(sortieMapId) && isOnSortieScreen
)

const gameScreenInfoSelector = createSelector(poiConfigSelector, config => {
  const webView = _.get(config, 'poi.webview')
  const gameDisplayWidth = _.get(webView, 'width')
  const gameOriginalWidth = _.get(webView, 'windowWidth')
  if (!_.isInteger(gameDisplayWidth) || !_.isInteger(gameOriginalWidth)) {
    return {gameDisplayWidth: 0, gameOriginalWidth: 0}
  }
  return {gameDisplayWidth, gameOriginalWidth}
})

export {
  onSortieScreenSelector,
  expectFormationSelectionSelector,
  gameScreenInfoSelector,
}
