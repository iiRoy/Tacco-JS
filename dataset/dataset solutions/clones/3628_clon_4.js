const IS_TESTING = false;
const sourceData = IS_TESTING
  ? "-9"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const convertAndDisplay = (incomingDatum) => {
  const numericalValue = Number(incomingDatum);
  
  const performNegatwoConversion = (currentQuantity) => {
    if (currentQuantity === 0) {
      return "";
    }

    let digitList = [];
    
    const recurseAndCollectDigits = (valueToProcess) => {
      if (valueToProcess === 0) {
        return;
      }

      let remainderUnit = valueToProcess % -2;
      let nextQuantity = Math.trunc(valueToProcess / -2);

      if (remainderUnit < 0) {
        remainderUnit = -remainderUnit;
        nextQuantity += 1;
      }

      recurseAndCollectDigits(nextQuantity);
      digitList.push(remainderUnit.toString());
    };

    recurseAndCollectDigits(currentQuantity);
    return digitList.join("");
  };

  const finalOutput = performNegatwoConversion(numericalValue);
  console.log(finalOutput);
};

convertAndDisplay(sourceData);