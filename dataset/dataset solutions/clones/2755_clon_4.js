const initialValueGenerator = (firstParameter, secondParameter) => {
    const rangeDifference = secondParameter - firstParameter + 1;
    const randomScaleFactor = Math.random();
    const intermediateCalculation = randomScaleFactor * rangeDifference;
    const finalShiftedValue = intermediateCalculation + firstParameter;
    return secondParameter.truncate(finalShiftedValue);
};

let primaryQuantity = initialValueGenerator(18, 2);