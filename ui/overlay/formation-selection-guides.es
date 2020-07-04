import React, {PureComponent} from 'react'
import { connect } from 'react-redux'

import {
  expectFormationSelectionSelector,
  formationTypeSelector,
} from '../../selectors'
import { PTyp } from '../../ptyp'
import { boxGuidesInfo } from '../../box-guides'

@connect(
  state => ({
    expectFormationSelection: expectFormationSelectionSelector(state),
    formationType: formationTypeSelector(state),
  })
)
class FormationSelectionGuides extends PureComponent {
  static propTypes = {
    // connnected:
    expectFormationSelection: PTyp.bool.isRequired,
    formationType: PTyp.string.isRequired,
  }

  render() {
    const {
      expectFormationSelection,
      formationType,
    } = this.props
    if (
      /*
         Don't show up if original width breaks the assumption.
         we could try to compute new scaling factor
         but I don't think it worths the effort - likely many other things
         will require adjustment prior to this anyways.
       */
      !expectFormationSelection ||
      !(formationType in boxGuidesInfo)
    )
      return ''
    const btnSpecs = boxGuidesInfo[formationType]
    return (
      <>
        {
          btnSpecs.map(({formation, x: left, y: top, width, height}) => (
            <div
              key={formation}
              style={{
                boxSizing: 'border-box',
                border: '3px solid cyan',
                position: 'absolute',
                left, top, width, height,
                zIndex: 1,
              }}
            />)
          )
        }
      </>
    )
  }
}


export {
  FormationSelectionGuides,
}
