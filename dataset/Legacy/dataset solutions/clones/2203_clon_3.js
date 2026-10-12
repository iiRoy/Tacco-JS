const inputHandler = initializeInputReader();
executeProgram();

function readInt() { return convertInput(getNextLine(), 1); }
function readStrArr() { return convertInput(getNextLine(), 2); }
function readIntArr() { return convertInput(getNextLine(), 4); }
function readCharArr() { return convertInput(getNextLine(), 6); }
function getNextLine() { return inputHandler.next(); }
function hasMoreLines() { return inputHandler.hasNext(); }

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
  const fileLines = readInputFile();
  let currentLineIndex = 0;
  const totalLines = fileLines.length;

  const checkHasNext = () => (currentLineIndex < totalLines);
  const retrieveNextLine = () => {
    if (!checkHasNext()) {
      throw "ArrayIndexOutOfBoundsException: No more input lines available.";
    }
    const lineContent = fileLines[currentLineIndex];
    currentLineIndex++;
    return lineContent;
  };

  return {
    "list": fileLines,
    "index": currentLineIndex,
    "max": totalLines,
    "hasNext": checkHasNext,
    "next": retrieveNextLine
  };
}

function printOutput(data) { console.log(data); }
function printError(data) { console.error(data); }

function parseToInt(val) { return parseInt(val); }
function splitBySpace(val) { return val.split(" "); }
function splitBySpaceAndMapToInt(val) { return val.split(" ").map((item) => Number(item)); }
function splitByChar(val) { return val.split(""); }
function splitByCharAndMapToInt(val) { return val.split("").map((item) => Number(item)); }
function joinBySpace(arr) { return arr.join(" "); }
function joinByNewline(arr) { return arr.join("\n"); }
function joinWithoutSeparator(arr) { return arr.join(""); }

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseToInt(inputValue);
      case 2: return splitBySpace(inputValue);
      case 4: return splitBySpaceAndMapToInt(inputValue);
      case 6: return splitByChar(inputValue);
      case 7: return splitByCharAndMapToInt(inputValue);
      case 8: return joinBySpace(inputValue);
      case 9: return joinByNewline(inputValue);
      case 0: return joinWithoutSeparator(inputValue);
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function executeProgram() {
  const firstLineData = readIntArr();
  const targetDamage = firstLineData[0];
  const spellCount = firstLineData[1];

  const spellList = [];
  for (let spellIdx = 0; spellIdx < spellCount; spellIdx++) {
    const currentSpellData = readIntArr();
    spellList.push({
      "spellDamage": currentSpellData[0],
      "spellCost": currentSpellData[1]
    });
  }

  const dpArraySizeMultiplier = 2;
  const maxDamageCapacity = targetDamage * dpArraySizeMultiplier;
  const minCostDp = new Array(maxDamageCapacity + 2).fill(undefined); // +2 for H*2+1 and H*2+2 for sentinel
  minCostDp[0] = 0;

  for (let currentSpellIdx = 0; currentSpellIdx < spellCount; currentSpellIdx++) {
    const currentSpell = spellList[currentSpellIdx];
    const spellDamageVal = currentSpell.spellDamage;
    const spellCostVal = currentSpell.spellCost;

    for (let currentDamage = 0; currentDamage <= maxDamageCapacity; currentDamage++) {
      if (minCostDp[currentDamage] !== undefined) {
        const newDamageAchieved = currentDamage + spellDamageVal;
        const newTotalCost = minCostDp[currentDamage] + spellCostVal;

        if (newDamageAchieved <= maxDamageCapacity + 1) { // Ensure within bounds for dp array
          if (minCostDp[newDamageAchieved] === undefined) {
            minCostDp[newDamageAchieved] = newTotalCost;
          } else {
            minCostDp[newDamageAchieved] = Math.min(minCostDp[newDamageAchieved], newTotalCost);
          }
        }
      }
    }
  }

  const largeCostSentinel = 1000000007; // A sufficiently large number for infinity
  const sentinelIndex = maxDamageCapacity + 1; // H * 2 + 1 from original

  if (minCostDp[sentinelIndex] === undefined) {
    minCostDp[sentinelIndex] = largeCostSentinel;
  }
  
  // Propagate minimum costs from right to left
  for (let currentDamageIdx = maxDamageCapacity; currentDamageIdx >= 0; currentDamageIdx--) {
    const nextDamageCost = minCostDp[currentDamageIdx + 1];
    const currentDamageCost = minCostDp[currentDamageIdx];

    if (currentDamageCost !== undefined) {
      minCostDp[currentDamageIdx] = Math.min(currentDamageCost, nextDamageCost);
    } else {
      minCostDp[currentDamageIdx] = nextDamageCost;
    }
  }
  
  printOutput(minCostDp[targetDamage]);
}
