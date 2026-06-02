"use strict";

const parseInputLines = (rawTextContent) => {
  return rawTextContent.split("\n");
};

const convertStringToNumber = (strValue) => {
  return Number(strValue);
};

function processInputData(rawData) {
  const allInputLines = parseInputLines(rawData);
  const numberOfElements = convertStringToNumber(allInputLines[0]);

  const numericElementValues = [];
  for (let elementIndex = 0; elementIndex < numberOfElements; ++elementIndex) {
    const currentLineString = allInputLines[elementIndex + 1];
    const parsedNumericValue = convertStringToNumber(currentLineString);
    numericElementValues.push(parsedNumericValue);
  }

  const dynamicProgrammingTable = [];
  for (let rowIdx = 0; rowIdx <= numberOfElements; ++rowIdx) {
    dynamicProgrammingTable.push(Array(5).fill(undefined));
  }
  
  dynamicProgrammingTable[0] = [0, 0, 0, 0, 0];

  for (let currentIdx = 1; currentIdx <= numberOfElements; ++currentIdx) {
    const currentElement = numericElementValues[currentIdx - 1];

    let evenCostCalculation;
    if (currentElement === 0) {
      evenCostCalculation = 2;
    } else {
      evenCostCalculation = currentElement % 2;
    }

    const oddCostCalculation = (currentElement % 2 === 0) ? 1 : 0;

    const previousRowValues = dynamicProgrammingTable[currentIdx - 1];
    const prevValueState0 = previousRowValues[0];
    const prevValueState1 = previousRowValues[1];
    const prevValueState2 = previousRowValues[2];
    const prevValueState3 = previousRowValues[3];
    const prevValueState4 = previousRowValues[4];

    dynamicProgrammingTable[currentIdx][0] = prevValueState0 + currentElement;
    
    const minVal0_1 = Math.min(prevValueState0, prevValueState1);
    dynamicProgrammingTable[currentIdx][1] = minVal0_1 + evenCostCalculation;
    
    const minVal0_1_2 = Math.min(minVal0_1, prevValueState2);
    dynamicProgrammingTable[currentIdx][2] = minVal0_1_2 + oddCostCalculation;
    
    const minVal0_1_2_3 = Math.min(minVal0_1_2, prevValueState3);
    dynamicProgrammingTable[currentIdx][3] = minVal0_1_2_3 + evenCostCalculation;
    
    const minVal0_1_2_3_4 = Math.min(minVal0_1_2_3, prevValueState4);
    dynamicProgrammingTable[currentIdx][4] = minVal0_1_2_3_4 + currentElement;
  }

  const finalRowCosts = dynamicProgrammingTable[numberOfElements];
  const minimumOverallCost = Math.min(...finalRowCosts);

  console.log(minimumOverallCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
