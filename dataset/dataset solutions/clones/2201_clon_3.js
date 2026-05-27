class InputHandler {
  constructor(rawInputData) {
    this.lineBuffer = rawInputData;
    this.currentLineIndex = 0;
    this.totalLines = rawInputData.length;
  }

  hasMoreLines() {
    return (this.currentLineIndex < this.totalLines);
  }

  getNextLine() {
    if (!this.hasMoreLines()) {
      throw "ArrayIndexOutOfBoundsException これ以上ないよ";
    }
    const currentLineContent = this.lineBuffer[this.currentLineIndex];
    this.currentLineIndex++;
    return currentLineContent;
  }
}

function getInputLines() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInput() {
  const rawInputData = getInputLines();
  return new InputHandler(rawInputData);
}

const inputHandler = initializeInput();

const CONV_TYPE_INT = 1;
const CONV_TYPE_STR_ARRAY = 2;
const CONV_TYPE_INT_ARRAY = 4;
const CONV_TYPE_CHAR_ARRAY = 6;
const CONV_TYPE_CHAR_INT_ARRAY = 7;
const CONV_TYPE_JOIN_SP = 8;
const CONV_TYPE_JOIN_NL = 9;
const CONV_TYPE_JOIN_NONE = 0;

function convertInput(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case CONV_TYPE_INT: return parseInt(inputVal);
      case CONV_TYPE_STR_ARRAY: return inputVal.split(" ");
      case CONV_TYPE_INT_ARRAY: return inputVal.split(" ").map(Number);
      case CONV_TYPE_CHAR_ARRAY: return inputVal.split("");
      case CONV_TYPE_CHAR_INT_ARRAY: return inputVal.split("").map(Number);
      case CONV_TYPE_JOIN_SP: return inputVal.join(" ");
      case CONV_TYPE_JOIN_NL: return inputVal.join("\n");
      case CONV_TYPE_JOIN_NONE: return inputVal.join("");
      default: return inputVal;
    }
  } catch (e) {
    return inputVal;
  }
}

function createSpellObject(damageValue, costValue) {
  return { spellDamage: damageValue, spellCost: costValue };
}

function determineMinCostForAtLeast(currentValue, nextValue) {
  // Replicates original behavior where 0, null, undefined are falsy
  if (currentValue) {
    return Math.min(currentValue, nextValue);
  } else {
    return nextValue;
  }
}

function readInteger() { return convertInput(getNextLine(), CONV_TYPE_INT); }
function readStringArray() { return convertInput(getNextLine(), CONV_TYPE_STR_ARRAY); }
function readIntegerArray() { return convertInput(getNextLine(), CONV_TYPE_INT_ARRAY); }
function readCharacterArray() { return convertInput(getNextLine(), CONV_TYPE_CHAR_ARRAY); }
function getNextLine() { return inputHandler.getNextLine(); }
function hasMoreLines() { return inputHandler.hasMoreLines(); }
function printOutput(data) { console.log(data); }
function printError(data) { console.error(data); }

function executeMainLogic() {
  const firstLineData = readIntegerArray();
  const targetHealth = firstLineData[0];
  const numSpells = firstLineData[1];

  const spellList = new Array(numSpells);
  for (let idx = 0; idx < numSpells; idx++) {
    const currentSpellData = readIntegerArray();
    spellList[idx] = createSpellObject(currentSpellData[0], currentSpellData[1]);
  }

  const MAX_POSSIBLE_DAMAGE_CAP = 100000;
  const minCostDP = new Array(MAX_POSSIBLE_DAMAGE_CAP + 1).fill(null);
  minCostDP[0] = 0;

  for (let idx = 0; idx < numSpells; idx++) {
    const currentSpell = spellList[idx];
    const spellDamage = currentSpell.spellDamage;
    const spellCost = currentSpell.spellCost;

    for (let jdx = 0; jdx < targetHealth; jdx++) {
      if (minCostDP[jdx] !== null) {
        const currentTotalCost = minCostDP[jdx];
        const potentialNewDamage = jdx + spellDamage;
        const newDamageIndex = Math.min(MAX_POSSIBLE_DAMAGE_CAP, potentialNewDamage);

        const newCost = currentTotalCost + spellCost;

        if (minCostDP[newDamageIndex] === null || newCost < minCostDP[newDamageIndex]) {
          minCostDP[newDamageIndex] = newCost;
        }
      }
    }
  }

  const LARGE_INITIAL_VALUE = 1000000007;
  if (minCostDP[MAX_POSSIBLE_DAMAGE_CAP] === null) {
    minCostDP[MAX_POSSIBLE_DAMAGE_CAP] = LARGE_INITIAL_VALUE;
  }
  
  for (let idx = MAX_POSSIBLE_DAMAGE_CAP - 1; idx >= 0; idx--) {
    const costAtCurrentDamage = minCostDP[idx];
    const costAtNextDamage = minCostDP[idx + 1];
    minCostDP[idx] = determineMinCostForAtLeast(costAtCurrentDamage, costAtNextDamage);
  }
  
  printOutput(minCostDP[targetHealth]);
}

executeMainLogic();
