import { bindActionCreators } from 'redux'
import { store } from 'views/create-store'

const initState = {
  // whether we are on a sortie screen (formation selection might present)
  onSortieScreen: false,
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
    return { onSortieScreen: false }
  }

  if (
    [
      '@@Response/kcsapi/api_req_map/start',
      '@@Response/kcsapi/api_req_map/next',
    ].indexOf(action.type) !== -1
  ) {
    return { onSortieScreen: true }
  }

  if (action.type.startsWith('@@Response/kcsapi')) {
    if (action.type.indexOf('kcsapi/api_req_sortie') && action.type.endsWith('battle')) {
      return { onSortieScreen: false }
    }
    if (action.type.startsWith('@@Response/kcsapi/api_req_combined_battle/')
      && action.type.startsWith('@@Response/kcsapi/api_req_battle_midnight/')
    ) {
      return { onSortieScreen: false }
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
  reducer,
  boundActionCreators,
}
