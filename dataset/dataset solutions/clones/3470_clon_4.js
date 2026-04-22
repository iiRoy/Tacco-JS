function performTransform(sourceData) {
  const numericExtractor = /\d+/g;
  const parsedQuantities = sourceData.match(numericExtractor).map(Number);

  const initialQuantityX = parsedQuantities[0];
  const initialQuantityY = parsedQuantities[1];
  const iterationCount = parsedQuantities[2];

  let currentSituation = {
    quantityX: initialQuantityX,
    quantityY: initialQuantityY,
    activeSideIsX: true
  };

  const iterationArray = Array.from({
    length: iterationCount
  });

  const finalSituation = iterationArray.reduce((accState, _, index) => {
    let {
      quantityX,
      quantityY,
      activeSideIsX
    } = accState;

    let receivedValue;
    let nextQuantityX;
    let nextQuantityY;

    if (activeSideIsX) {
      let tempX = quantityX;
      if (tempX % 2 !== 0) {
        tempX--;
      }
      receivedValue = tempX / 2;

      nextQuantityX = tempX / 2;
      nextQuantityY = quantityY + receivedValue;
    } else {
      let tempY = quantityY;
      if (tempY % 2 !== 0) {
        tempY--;
      }
      receivedValue = tempY / 2;

      nextQuantityX = quantityX + receivedValue;
      nextQuantityY = tempY / 2;
    }

    return {
      quantityX: nextQuantityX,
      quantityY: nextQuantityY,
      activeSideIsX: !activeSideIsX
    };
  }, currentSituation);

  console.log(`${finalSituation.quantityX} ${finalSituation.quantityY}`);
}

(function() {
  const fileInput = require("fs").readFileSync("/dev/stdin", "utf8");
  performTransform(fileInput);
})();