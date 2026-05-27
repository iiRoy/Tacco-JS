function getInputData(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function displayResult(res){console.log(res);}
function logError(err){console.error(err);}

const CONVERSION_TYPES = {
    NO_OP: 0,
    TO_INT: 1,
    SPLIT_SPACE: 2,
    SPLIT_NEWLINE: 3,
    SPLIT_SPACE_TO_NUM_ARRAY: 4,
    SPLIT_NEWLINE_TO_NUM_ARRAY: 5,
    SPLIT_CHARS: 6,
    SPLIT_CHARS_TO_NUM_ARRAY: 7
};

function processInputSegment(dataValue, conversionType) {
    const toNumeric = (str) => Number(str);
    const toInteger = (str) => parseInt(str, 10);

    const converters = {
        [CONVERSION_TYPES.NO_OP]: (val) => val,
        [CONVERSION_TYPES.TO_INT]: toInteger,
        [CONVERSION_TYPES.SPLIT_SPACE]: (val) => val.split(" "),
        [CONVERSION_TYPES.SPLIT_NEWLINE]: (val) => val.split("\n"),
        [CONVERSION_TYPES.SPLIT_SPACE_TO_NUM_ARRAY]: (val) => val.split(" ").map(toNumeric),
        [CONVERSION_TYPES.SPLIT_NEWLINE_TO_NUM_ARRAY]: (val) => val.split("\n").map(toNumeric),
        [CONVERSION_TYPES.SPLIT_CHARS]: (val) => val.split(""),
        [CONVERSION_TYPES.SPLIT_CHARS_TO_NUM_ARRAY]: (val) => val.split("").map(toNumeric)
    };
    return converters[conversionType](dataValue);
}

function executeSolution(rawData) {
  let processedLines = processInputSegment(rawData, CONVERSION_TYPES.SPLIT_NEWLINE);
  let itemCount = processInputSegment(processedLines[0], CONVERSION_TYPES.TO_INT);
  let numberList = processInputSegment(processedLines[1], CONVERSION_TYPES.SPLIT_SPACE_TO_NUM_ARRAY);

  const frequencyMap = {};
  const incrementFrequency = (map, key) => {
      map[key] = (map[key] || 0) + 1;
  };

  for(let idx = 0; idx < itemCount; idx++){
    incrementFrequency(frequencyMap, numberList[idx]);
  }

  let uniqueSortedNumbers = Object.keys(frequencyMap).map(Number);
  uniqueSortedNumbers.sort((numA, numB) => numA - numB);

  let leftPointer = 0;
  let rightPointer = uniqueSortedNumbers.length - 1;

  const finalizeMeetingPointers = (freqMapRef, numberKey, currentFreq) => {
      if (currentFreq >= 2) {
         freqMapRef[numberKey] = (currentFreq % 2 === 1) ? 1 : 0;
      }
  };

  while(true){
    const currentLeftNum = uniqueSortedNumbers[leftPointer];
    const currentRightNum = uniqueSortedNumbers[rightPointer];

    let leftNumFreq = frequencyMap[currentLeftNum];
    if(leftNumFreq <= 1){
        leftPointer++;
        continue;
    }

    let rightNumFreq = frequencyMap[currentRightNum];
    if(rightNumFreq <= 1){
        rightPointer--;
        continue;
    }

    if(leftPointer >= rightPointer){
       finalizeMeetingPointers(frequencyMap, currentLeftNum, leftNumFreq);
       break;
    } else {
      frequencyMap[currentLeftNum]--;
      frequencyMap[currentRightNum]--;
    }
  }

  let finalUniqueCount = 0;
  finalUniqueCount = uniqueSortedNumbers.filter(num => frequencyMap[num] === 1).length;
  
  displayResult(finalUniqueCount);
}

executeSolution(getInputData());
