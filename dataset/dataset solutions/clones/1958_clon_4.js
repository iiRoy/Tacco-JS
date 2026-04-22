const calculatePerimeter = (radiusValue) => {
  const multiplierComponents = [
    radiusValue,
    2,
    (314 / 100)
  ];
  return multiplierComponents.reduce((accumulator, currentElement) => accumulator * currentElement, 1);
};