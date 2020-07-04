// Compute position and size of guiding boxes.

const boxGuidesInfo = (() => {
  const btnSingle = obj => ({
    ...obj,
    width: 140, height: 34,
  })

  /* eslint-disable */
  const _btnCombined = obj => ({
    ...obj,
    width: 200, height: 35,
  })
  /* eslint-enable */

  const firstLineWithVanguard = [
    {
      formation: 'LineAhead',
      x: 700, y: 261,
    },
    {
      formation: 'DoubleLine',
      x: 896, y: 261,
    },
  ]

  const firstLineWithDiamondWithVanguard = [
    {
      formation: 'LineAhead',
      x: 601, y: 261,
    },
    {
      formation: 'DoubleLine',
      x: 796, y: 261,
    },
    {
      formation: 'Diamond',
      x: 994, y: 261,
    },
  ]

  const secondLineWithVanguard = [
    {
      formation: 'Echelon',
      x: 601, y: 499,
    },
    {
      formation: 'Vanguard',
      x: 796, y: 499,
    },
    {
      formation: 'LineAbreast',
      x: 994, y: 499,
    },
  ]

  const SingleHasDiamondHasVanguard = [
    ...firstLineWithDiamondWithVanguard,
    ...secondLineWithVanguard,
  ].map(btnSingle)
  const SingleHasVanguard = [
    ...firstLineWithVanguard,
    ...secondLineWithVanguard,
  ].map(btnSingle)
  return {
    // None is left undefined intentionally.
    // TODO: Single
    // TODO: SingleHasDiamond
    SingleHasVanguard,
    SingleHasDiamondHasVanguard,
    // TODO: Combined
  }
})()

export { boxGuidesInfo }
