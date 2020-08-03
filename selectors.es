import _ from 'lodash'
import { createSelector } from 'reselect'
import {
  extensionSelectorFactory,
  sortieMapIdSelector,
  configSelector as poiConfigSelector,
  constSelector,
  sortieSelector,
  fleetsSelector,
  fcdSelector,
  layoutSelector,
  fleetShipsDataWithEscapeSelectorFactory,
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
const forceSingleFleetSelector = mkExtPropSelector('forceSingleFleet')
const expectFormationSelectionSelector = mkExtPropSelector('expectFormationSelection')

const gameScreenInfoSelector = createSelector(
  poiConfigSelector,
  layoutSelector,
  (config, layout) => {
    const gameDisplayWidth = _.get(layout, ['webview' ,'width'])
    const gameOriginalWidth = _.get(config, ['poi', 'webview', 'windowWidth'])
    if (!_.isFinite(gameDisplayWidth) || !_.isFinite(gameOriginalWidth)) {
      return {gameDisplayWidth: 0, gameOriginalWidth: 0}
    }
    return {gameDisplayWidth, gameOriginalWidth}
  }
)

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

/*
  The type of the return value changes depending on whether this is a combined fleet:

  - for combined fleet, an array of exactly 2 integers is returned,
    counting # of ships in main and escort fleet (with escape idx taken into account)

  - for single fleet, an integer is returned
     counting the # of ships (with escape idx taken into account)
 */
const sortieShipsCountSelector = createSelector(
  fleetsSelector,
  sortieSelector,
  combinedFlagSelector,
  // main fleet
  fleetShipsDataWithEscapeSelectorFactory(0),
  // escort fleet
  fleetShipsDataWithEscapeSelectorFactory(1),
  (fleets, sortie, combinedFlag, mainFleetInfo, escortFleetInfo) => {
    if (combinedFlag > 0) {
      const countShips = raw => {
        const counted = _.countBy(raw, r => {
          const shipId = _.get(r, ['0', 'api_id'])
          return _.isFinite(shipId) && shipId > 0
        })
        return _.get(counted, [true], 0)
      }
      const ret = [countShips(mainFleetInfo),countShips(escortFleetInfo)]
      return ret
    }
    // TODO: escaping is not yet handled for single fleet.
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
  Note: In the context of Combined fleet, "CF" is short for "Cruising Formation".

  - None
  - Single
  - SingleHasDiamond
  - SingleHasVanguard
  - SingleHasDiamondHasVanguard
  - Combined (CF1 + CF2)
  - CombinedHasCF3HasCF4 (CF1 + CF2 + CF3 + CF4)
  - CombinedHasCF4 (CF1 + CF2 + CF4)

 */
const formationTypeSelector = createSelector(
  combinedFlagSelector,
  vanguardPresenceSelector,
  sortieShipsCountSelector,
  forceSingleFleetSelector,
  (combinedFlag, hasVanguard, sortieShipsCountInp, forceSingleFleet) => {
    let sortieShipsCount = sortieShipsCountInp
    if (combinedFlag > 0) {
      // extract number from the escort fleet.
      if (!Array.isArray(sortieShipsCount) || sortieShipsCount.length !== 2) {
        console.warn(`Unexpected sortieShipsCount: ${sortieShipsCount}`)
      }
      const [_mainCount, escortCount] = sortieShipsCount
      if (!_.isFinite(escortCount)) {
        console.warn(`Unexpected escortCount: ${escortCount}`)
      }
      // in this case sortieShipsCountInp is an array.
      if (!forceSingleFleet) {
        if (escortCount >= 5) {
          // CF3 requires 5+ ships in escort fleet, which also implies CF4.
          return 'CombinedHasCF3HasCF4'
        }
        if (escortCount >= 4) {
          // CF4 requires 4+ ships in escort fleet.
          return 'CombinedHasCF4'
        }
        return 'Combined'
      }
      sortieShipsCount = escortCount
    }
    if (sortieShipsCount < 4)
      return 'None'
    const prefix =
      sortieShipsCount > 4 ? 'SingleHasDiamond' : 'Single'
    return hasVanguard ? `${prefix}HasVanguard` : prefix
  }
)

const spotHistorySelector = createSelector(
  sortieSelector,
  sortie => _.get(sortie, 'spotHistory', [])
)

// Selects an Object keyed by spotId, with value being an array of two elements,
// indicating two ends. null if the map cannot be found.
const currentRouteMapSelector = createSelector(
  sortieMapIdSelector,
  fcdSelector,
  (sortieMapIdStr, fcd) => {
    const mapId = Number(sortieMapIdStr)
    if (!_.isInteger(mapId) || !mapId)
      return null
    const mapNo = mapId % 10
    const areaNo = _.floor(mapId / 10)
    const mapKey = `${areaNo}-${mapNo}`
    return _.get(fcd, ['map', mapKey, 'route'], null)
  }
)

const getSpotNameFuncSelector = createSelector(
  currentRouteMapSelector,
  routeMap =>
    spotId =>
      // either we have a proper spot name,
      // or we use spotId with a '?' in the end.
      _.get(routeMap, [spotId, 1]) || `${spotId}?`
)

export {
  onSortieScreenSelector,
  forceSingleFleetSelector,
  expectFormationSelectionSelector,
  gameScreenInfoSelector,
  eventPresenceSelector,
  vanguardPresenceSelector,
  formationTypeSelector,
  spotHistorySelector,
  getSpotNameFuncSelector,
}
