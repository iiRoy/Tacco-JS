const processDimensions = (rawData) => {
  const [widthStr, heightStr, xStr, yStr] = rawData[0].split(" ");

  const widthVal = Number(widthStr);
  const heightVal = Number(heightStr);
  const xCoord = Number(xStr);
  const yCoord = Number(yStr);

  const totalHalfArea = (widthVal * heightVal) / 2;

  const verticalCutArea = heightVal * Math.min(xCoord, widthVal - xCoord);
  const horizontalCutArea = widthVal * Math.min(yCoord, heightVal - yCoord);

  const isZeroIntersection = (verticalCutArea === 0 && horizontalCutArea === 0);
  const maxPartitionArea = Math.max(verticalCutArea, horizontalCutArea);
  const isMaxAreaEqualToHalf = (maxPartitionArea === totalHalfArea);
  const areBothCutsEqual = (verticalCutArea === horizontalCutArea);

  const outputValue = isZeroIntersection ? totalHalfArea : maxPartitionArea;

  const outputFlag = (
    (areBothCutsEqual && !isZeroIntersection) ||
    isMaxAreaEqualToHalf
  ) ? 1 : 0;

  console.log(`${outputValue} ${outputFlag}`);
};

processDimensions(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
