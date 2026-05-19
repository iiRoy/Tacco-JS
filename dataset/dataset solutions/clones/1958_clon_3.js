function calcCircumference(radiusVal) {
  const TWO_FACTOR = 2;
  const PI_APPROXIMATION = 3.14;

  const getProductWithPi = (valueToMultiply) => {
    return valueToMultiply * PI_APPROXIMATION;
  };

  let diameterValue = radiusVal * TWO_FACTOR;
  resultCircumference = getProductWithPi(diameterValue);
  return resultCircumference;
}

console.log(circumsference(r));
