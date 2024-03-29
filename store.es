import _ from 'lodash'
import { bindActionCreators } from 'redux'
import { store } from 'views/create-store'

const initState = {
  // whether we are on a sortie screen (formation selection might present)
  onSortieScreen: false,
  expectFormationSelection: false,
  // if true, forces single fleet overlay.
  forceSingleFleet: false,
  enemyFleetPreview: null,
}

/*
  Notes regarding api_e_deck_info:

  - ref: EnemyDeckSilhouette
    + it seems api_kind could be 1 or 2

 */

const reducer = (state = initState, action) => {
  if (action.type === '@poi-plugin-preigniter@Modify') {
    const {modifier} = action
    return modifier(state)
  }

  if (
    [
      '@@Response/kcsapi/api_port/port',
      '@@Request/kcsapi/api_req_member/get_incentive',
      '@@Response/kcsapi/api_req_sortie/battleresult',
      '@@Response/kcsapi/api_req_combined_battle/battleresult',
    ].indexOf(action.type) !== -1
  ) {
    // returning to port or right after a game reload.
    return {
      ...state,
      onSortieScreen: false,
      expectFormationSelection: false,
      forceSingleFleet: false,
      enemyFleetPreview: null,
    }
  }

  if (
    [
      '@@Response/kcsapi/api_req_map/start',
      '@@Response/kcsapi/api_req_map/next',
    ].indexOf(action.type) !== -1
  ) {
    const {body} = action
    let enemyFleetPreview = null
    const enemyPreviewRaw = _.get(body, ['api_e_deck_info'])
    if (Array.isArray(enemyPreviewRaw) && enemyPreviewRaw.length > 0) {
      // TODO: test this on combined fleets.
      enemyFleetPreview = _.flatten(enemyPreviewRaw.map(raw => _.get(raw, ['api_ship_ids'], [])))
    }

    /*
      Source: 74EO
      TODO: api_event_id also seems to play a role that
      would affect how we interpret api_event_kind

      api_event_kind：イベント種別
      0=非戦闘セル
      1=通常戦闘
      2=夜戦
      3=夜昼戦
      4=航空戦
      5=敵連合艦隊戦
      6=長距離空襲戦
      7=夜昼戦(対連合艦隊)
      8=レーダー射撃
     */
    /*
      Note that type of next node seems to be determined by:
      - area and map (exceptions seem to be rare, so let's ignore them for simplicity)
      - api_event_id
      - api_event_kind (seems to have different meanings depending on api_event_id)
      to deal with this mess, let's first shortcut those that definitely
      don't need formation selection by looking at api_event_id.
     */
    switch (_.get(body, 'api_event_id', null)) {
    case 1: // 1=イベントなし
    case 2: // 2=資源獲得
    case 3: // 3=渦潮
    case 6: // 6=気のせいだった
    case 8: // 8=船団護衛成功
    case 9: // 9=揚陸地点
    case 10: // 10=泊地
      return {
        ...state,
        onSortieScreen: true,
        expectFormationSelection: false,
        forceSingleFleet: false,
        enemyFleetPreview,
      }
    default:
    }
    switch (_.get(body, 'api_event_kind', null)) {
    case 0: // 0=非戦闘セル, api_event_id=7(航空戦)時は0=航空偵察
      return {
        ...state,
        onSortieScreen: true,
        expectFormationSelection: false,
        forceSingleFleet: false,
        enemyFleetPreview,
      }
    case 2:
    case 3:
    case 7:
      // Night battles always use single fleet formation selection.
      // TODO: verify this on combined fleets
      return {
        ...state,
        onSortieScreen: true,
        expectFormationSelection: true,
        forceSingleFleet: true,
        enemyFleetPreview,
      }
    default:
      return {
        ...state,
        onSortieScreen: true,
        expectFormationSelection: true,
        forceSingleFleet: false,
        enemyFleetPreview,
      }
    }
  }

  if (action.type.startsWith('@@Response/kcsapi')) {
    if (action.type.indexOf('kcsapi/api_req_sortie') && action.type.endsWith('battle')) {
      return {
        ...state,
        onSortieScreen: false,
        expectFormationSelection: false,
        forceSingleFleet: false,
      }
    }
    // at this point we have already handled all "battleresult" requests so it's relatively safe
    // to just look at prefix to determine whether we are in a battle.
    if (action.type.startsWith('@@Response/kcsapi/api_req_combined_battle/') ||
        action.type.startsWith('@@Response/kcsapi/api_req_battle_midnight/')
    ) {
      return {
        ...state,
        onSortieScreen: false,
        expectFormationSelection: false,
        forceSingleFleet: false,
      }
    }
  }

  return state
}

const actionCreators = {
  modify: modifier => ({
    type: '@poi-plugin-preigniter@Modify',
    modifier,
  }),
}

// force the formation selection to appear.
// note that this only works during a sortie (as we do check sortieMapId.
window.preigniterForceShow = () => {
  store.dispatch({
    type: '@poi-plugin-preigniter@Modify',
    modifier: obj => ({
      ...obj,
      forceSingleFleet: false,
      onSortieScreen: true,
      expectFormationSelection: true,
    }),
  })
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreators, dispatch)

const boundActionCreators =
  mapDispatchToProps(store.dispatch)

export {
  initState,
  reducer,
  mapDispatchToProps,
  boundActionCreators,
}
