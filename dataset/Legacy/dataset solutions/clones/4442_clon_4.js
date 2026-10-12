function processInputData(inputString) {
  const [firstLineData, secondLineData, thirdLineData] = inputString.split('\n');

  const [gridHeight, gridWidth] = firstLineData.split(' ').map(Number);
  const colorTypeCount = Number(secondLineData);
  const colorAmounts = thirdLineData.split(' ').map(Number);

  const flatColorSequence = colorAmounts.flatMap((amountValue, typeIndex) =>
    Array.from({ length: amountValue }, () => typeIndex + 1)
  );

  const getSequenceElement = (rowIdx, colIdx) => {
    let sequencePosition;
    if (rowIdx % 2 === 0) {
      sequencePosition = rowIdx * gridWidth + colIdx;
    } else {
      sequencePosition = (rowIdx + 1) * gridWidth - colIdx;
    }
    return flatColorSequence[sequencePosition];
  };

  const generatedGridRows = Array.from({ length: gridHeight }, (_, rowIdx) => {
    return Array.from({ length: gridWidth }, (_, colIdx) =>
      getSequenceElement(rowIdx, colIdx)
    ).join(' ');
  });

  const finalResultString = generatedGridRows.join('\n');

  console.log(finalResultString.slice(0, finalResultString.length - 1));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
