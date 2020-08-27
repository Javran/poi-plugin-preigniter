/*

  Compute position and size of guiding boxes.

  Note that this module assumes game screen of 1200 x 720

 */

const boxGuidesInfo = (() => {
  const btnSingle = obj => ({
    ...obj,
    width: 144, height: 38,
  })

  const btnCombined = obj => ({
    ...obj,
    width: 204, height: 39,
  })

  const firstLine = [
    {
      formation: 'LineAhead',
      x: 599, y: 259,
    },
    {
      formation: 'DoubleLine',
      x: 794, y: 259,
    },
  ]

  const firstLineWithVanguard = [
    {
      formation: 'LineAhead',
      x: 698, y: 259,
    },
    {
      formation: 'DoubleLine',
      x: 894, y: 259,
    },
  ]

  const firstLineWithDiamond = [
    {
      formation: 'LineAhead',
      x: 599, y: 259,
    },
    {
      formation: 'DoubleLine',
      x: 794, y: 259,
    },
    {
      formation: 'Diamond',
      x: 992, y: 259,
    },
  ]

  const firstLineWithDiamondWithVanguard = firstLineWithDiamond

  const secondLine = [
    {
      formation: 'Echelon',
      x: 701, y: 497,
    },
    {
      formation: 'LineAbreast',
      x: 897, y: 497,
    },
  ]

  const secondLineWithVanguard = [
    {
      formation: 'Echelon',
      x: 599, y: 497,
    },
    {
      formation: 'Vanguard',
      x: 794, y: 497,
    },
    {
      formation: 'LineAbreast',
      x: 992, y: 497,
    },
  ]

  const Single = [
    ...firstLine,
    ...secondLine,
  ].map(btnSingle)
  const SingleHasDiamond = [
    ...firstLineWithDiamond,
    ...secondLine,
  ].map(btnSingle)
  const SingleHasDiamondHasVanguard = [
    ...firstLineWithDiamondWithVanguard,
    ...secondLineWithVanguard,
  ].map(btnSingle)
  const SingleHasVanguard = [
    ...firstLineWithVanguard,
    ...secondLineWithVanguard,
  ].map(btnSingle)

  const firstLineCombined = [
    {
      formation: 'Cruising Formation 1',
      x: 646, y: 242,
    },
    {
      formation: 'Cruising Formation 2',
      x: 893, y: 242,
    },
  ]
  const posCF3 = {
    formation: 'Cruising Formation 3',
    x: 646, y: 448,
  }
  const posCF4 = {
    formation: 'Cruising Formation 4',
    x: 893, y: 448,
  }

  const Combined = firstLineCombined.map(btnCombined)
  const CombinedHasCF3HasCF4 = [
    ...firstLineCombined,
    posCF3, posCF4,
  ].map(btnCombined)
  const CombinedHasCF4 = [
    ...firstLineCombined,
    posCF4,
  ].map(btnCombined)
  return {
    // None is left undefined intentionally.
    Single,
    SingleHasDiamond,
    SingleHasVanguard,
    SingleHasDiamondHasVanguard,
    Combined,
    CombinedHasCF3HasCF4,
    CombinedHasCF4,
  }
})()

export { boxGuidesInfo }
