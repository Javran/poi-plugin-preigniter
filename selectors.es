import _ from 'lodash'
import { createSelector } from 'reselect'
import {
  extensionSelectorFactory,
  sortieMapIdSelector,
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

export {
  onSortieScreenSelector,
  expectFormationSelectionSelector,
}

