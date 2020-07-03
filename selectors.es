import _ from 'lodash'
import { createSelector } from 'reselect'
import {
  extensionSelectorFactory,
  sortieMapIdSelector,
  configSelector as poiConfigSelector,
  constSelector,
  sortieSelector,
  fleetsSelector,
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

/*
  The earliest downloadable map is for world 42,
  which corresponds to Early Fall 2018 Event.
  Therefore it is a safe guess that if we have any worldId >= 40, we are in an event.
 */
const eventPresenceSelector = createSelector(
  constSelector, konst => _.some(_.keys(_.get(konst, '$mapareas', {})), x => Number(x) >= 40))

/*
  Vanguard is first introduced in Fall 2017 Event, whose content is no longer downloadable,
  therefore let's just say presence of event entails presense of vanguard formation.
 */
const vanguardPresenceSelector = eventPresenceSelector

const combinedFlagSelector = createSelector(
  sortieSelector,
  sortie => {
    const raw = sortie.combinedFlag
    return raw <= 0 ? 0 : raw
  }
)

const sortieShipsCountSelector = createSelector(
  fleetsSelector,
  sortieSelector,
  (fleets, sortie) => {
    if (fleets.length !== sortie.sortieStatus.length)
      return 0
    return _.flatMap(sortie.sortieStatus, (sortieFlag, fleetIdx) => {
      if (!sortieFlag)
        return []
      const fleet = fleets[fleetIdx]
      return fleet.api_ship.filter(x => x > 0)
    }).length
  }
)

/*
  Returns one of (all of which are strings):

  - None
  - Single
  - SingleHasDiamond
  - SingleHasVanguard
  - SingleHasDiamondHasVanguard
  - Combined

 */
const formationTypeSelector = createSelector(
  combinedFlagSelector,
  vanguardPresenceSelector,
  sortieShipsCountSelector,
  (combinedFlag, hasVanguard, sortieShipsCount) => {
    if (combinedFlag > 0)
      return 'Combined'
    if (sortieShipsCount < 4)
      return 'None'
    const prefix =
      sortieShipsCount > 4 ? 'SingleHasDiamond' : 'Single'
    return hasVanguard ? `${prefix}HasVanguard` : prefix
  }
)

export {
  onSortieScreenSelector,
  expectFormationSelectionSelector,
  gameScreenInfoSelector,
  eventPresenceSelector,
  vanguardPresenceSelector,
  formationTypeSelector,
}
