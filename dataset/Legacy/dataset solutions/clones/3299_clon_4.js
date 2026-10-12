function calculateOptimalPainting(rawInputLines) {
  const houseQuantityString = rawInputLines[0];
  const houseQuantityValue = parseInt(houseQuantityString, 10);

  try {
    new Array(houseQuantityValue);
  } catch (error) {
    if (error instanceof RangeError) {
      throw error;
    }
    throw error;
  }

  if (houseQuantityValue === 0) {
    console.log(NaN);
    return;
  }

  const houseColorPriceData = rawInputLines
    .slice(1, houseQuantityValue + 1)
    .map(line => line.split(' ').map(Number));

  const initialHouseCostSet = houseColorPriceData[0];

  const finalHouseMaxCostsByColor = houseColorPriceData.slice(1).reduce((previousMaxCosts, currentHousePrices) => {
    const [prevMaxRed, prevMaxGreen, prevMaxBlue] = previousMaxCosts;
    const [currentRedPrice, currentGreenPrice, currentBluePrice] = currentHousePrices;

    const nextMaxRed = currentRedPrice + Math.max(prevMaxGreen, prevMaxBlue);
    const nextMaxGreen = currentGreenPrice + Math.max(prevMaxRed, prevMaxBlue);
    const nextMaxBlue = currentBluePrice + Math.max(prevMaxRed, prevMaxGreen);

    return [nextMaxRed, nextMaxGreen, nextMaxBlue];
  }, initialHouseCostSet);

  console.log(Math.max(...finalHouseMaxCostsByColor));
}


let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  accumulatedInput += chunk;
});
process.stdin.on('end', function() {
  const processedInputLines = accumulatedInput.split('\n');
  calculateOptimalPainting(processedInputLines);
});
