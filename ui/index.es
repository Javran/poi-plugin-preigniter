import React, {PureComponent} from 'react'
import { OverlayRoot } from './overlay'

class PreigniterMain extends PureComponent {
  render() {
    return (
      <div>
        <div
          style={{
            fontSize: '2.4em',
            textAlign: 'center',
            color: 'lightgreen',
            padding: 25,
          }}
        >
          Preigniter, all systems green.
        </div>
        <OverlayRoot />
      </div>
    )
  }
}

export {
  PreigniterMain,
}
