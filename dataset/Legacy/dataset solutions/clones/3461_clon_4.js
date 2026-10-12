console.log((function(inputContent) {
  const parsedNumbers = inputContent.split('\n').map(Number);
  const elementQuantity = parsedNumbers[0];
  const valueCollection = parsedNumbers.slice(1, 1 + elementQuantity);
  valueCollection.sort((firstVal, secondVal) => firstVal - secondVal);

  const divisionPoint = Math.floor((elementQuantity + 1) / 2);

  const initialAccumulation = valueCollection.reduce((currentTotal, currentItem, itemIndex) => {
    const coefficient = (itemIndex < divisionPoint) ? -2 : 2;
    return currentTotal + (currentItem * coefficient);
  }, 0);

  const valueAtDivision = valueCollection[divisionPoint];
  const valuePriorToDivision = valueCollection[divisionPoint - 1];
  const valueTwoPriorToDivision = valueCollection[divisionPoint - 2];

  const finalModification = (elementQuantity % 2 === 0)
    ? (valuePriorToDivision - valueAtDivision)
    : (
        (valuePriorToDivision + valueTwoPriorToDivision > valuePriorToDivision * 3 - valueAtDivision)
          ? (valuePriorToDivision + valueTwoPriorToDivision)
          : (valuePriorToDivision * 3 - valueAtDivision)
      );

  return initialAccumulation + finalModification;
})(require("fs").readFileSync("/dev/stdin", "utf8")));
