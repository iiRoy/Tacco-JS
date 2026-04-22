'use strict';

const standardInputRawData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
const standardInputLinesArray = standardInputRawData.split('\n');
let lineReadPointer = 0;

const retrieveNextLine = () => standardInputLinesArray[lineReadPointer++];
const parseLineIntoNumbers = () => retrieveNextLine().split(' ').map(Number);
const constructNumericTuples = (count) => Array.from({ length: count }, parseLineIntoNumbers);

class PrioritizedElementContainer {
  constructor() {
    this.storedElements = [];
  }

  insertElement(priorityValue, payloadData) {
    let lowerBound = 0, upperBound = this.storedElements.length;
    while (lowerBound < upperBound) {
      let midPoint = Math.floor((lowerBound + upperBound) / 2);
      if (this.storedElements[midPoint].priority < priorityValue) {
        upperBound = midPoint; 
      } else {
        lowerBound = midPoint + 1; 
      }
    }
    this.storedElements.splice(lowerBound, 0, { priority: priorityValue, data: payloadData });
  }

  extractHighestPriorityElement() {
    return this.storedElements.shift();
  }

  get currentElementCount() {
    return this.storedElements.length;
  }
}

function processDataForScore() {
  const initialConfiguration = parseLineIntoNumbers(); 
  const overallItemCount = initialConfiguration[0];
  const initialChosenCount = initialConfiguration[1];
  const allAvailableItems = constructNumericTuples(overallItemCount); 

  allAvailableItems.sort((itemOne, itemTwo) => itemTwo[1] - itemOne[1]);

  const initialWorkingSet = allAvailableItems.slice(0, initialChosenCount);

  const itemCategoryCounts = new Map();
  initialWorkingSet.forEach(entry => {
    const categoryIdentifier = entry[0];
    itemCategoryCounts.set(categoryIdentifier, (itemCategoryCounts.get(categoryIdentifier) || 0) + 1);
  });

  let uniqueCategoryCount = itemCategoryCounts.size;
  let currentAggregateValue = initialWorkingSet.reduce((total, current) => total + current[1], 0);

  const valueSumPerUniqueCategory = new Map();
  valueSumPerUniqueCategory.set(uniqueCategoryCount, currentAggregateValue);

  const redundantItemPool = new PrioritizedElementContainer();
  initialWorkingSet.forEach(entry => {
    const categoryIdentifier = entry[0];
    if (itemCategoryCounts.get(categoryIdentifier) > 1) {
      redundantItemPool.insertElement(entry[1], entry); 
    }
  });

  let explorationPosition = initialChosenCount;
  while (redundantItemPool.currentElementCount > 0 && explorationPosition < overallItemCount) {
    const candidateForRemoval = redundantItemPool.extractHighestPriorityElement(); 
    const categoryOfCandidate = candidateForRemoval.data[0];

    if (itemCategoryCounts.get(categoryOfCandidate) >= 2) {
      itemCategoryCounts.set(categoryOfCandidate, itemCategoryCounts.get(categoryOfCandidate) - 1);
      currentAggregateValue -= candidateForRemoval.data[1];

      let newUniqueCandidate = null;
      while (explorationPosition < overallItemCount) {
        const potentialNewEntry = allAvailableItems[explorationPosition];
        explorationPosition++;
        if (!itemCategoryCounts.has(potentialNewEntry[0]) || itemCategoryCounts.get(potentialNewEntry[0]) === 0) {
          newUniqueCandidate = potentialNewEntry;
          break;
        }
      }

      if (newUniqueCandidate) {
        itemCategoryCounts.set(newUniqueCandidate[0], (itemCategoryCounts.get(newUniqueCandidate[0]) || 0) + 1);
        currentAggregateValue += newUniqueCandidate[1];
        uniqueCategoryCount++; 
        valueSumPerUniqueCategory.set(uniqueCategoryCount, currentAggregateValue);

        redundantItemPool.insertElement(newUniqueCandidate[1], newUniqueCandidate);
      } else {
        break;
      }
    }
  }

  let finalMaxScore = 0;
  for (const [categoryCount, accumulatedValue] of valueSumPerUniqueCategory.entries()) {
    const calculatedScore = accumulatedValue + categoryCount * categoryCount;
    if (calculatedScore > finalMaxScore) {
      finalMaxScore = calculatedScore;
    }
  }
  console.log(finalMaxScore);
}

processDataForScore();