import _ from 'lodash'
import { bindActionCreators } from 'redux'
import { store } from 'views/create-store'

const initState = {
  // whether we are on a sortie screen (formation selection might present)
  onSortieScreen: false,
  // if true, forces single fleet overlay.
  nextIsNightStart: false,
}

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
    return { ...state, onSortieScreen: false }
  }

  if (
    [
      '@@Response/kcsapi/api_req_map/start',
      '@@Response/kcsapi/api_req_map/next',
    ].indexOf(action.type) !== -1
  ) {
    const {body} = action
    /*
      Source: 74EO
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
    switch (_.get(body, 'api_event_kind', null)) {
    case 0:
      return {
        ...state,
        onSortieScreen: false,
      }
    case 2:
    case 3:
    case 7:
      // Night battles always use single fleet formation selection.
      // TODO: verify this on combined fleets
      return {
        ...state,
        nextIsNightStart: true,
        onSortieScreen: true,
      }
    default:
      return {
        ...state,
        nextIsNightStart: false,
        onSortieScreen: true,
      }
    }
  }

  if (action.type.startsWith('@@Response/kcsapi')) {
    if (action.type.indexOf('kcsapi/api_req_sortie') && action.type.endsWith('battle')) {
      return { ...state, onSortieScreen: false }
    }
    // at this point we have already handled all "battleresult" requests so it's relatively safe
    // to just look at prefix to determine whether we are in a battle.
    if (action.type.startsWith('@@Response/kcsapi/api_req_combined_battle/')
      && action.type.startsWith('@@Response/kcsapi/api_req_battle_midnight/')
    ) {
      return { ...state, onSortieScreen: false }
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
