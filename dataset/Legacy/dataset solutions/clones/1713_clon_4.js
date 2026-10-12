"use strict";

class TokenStream {
  #tokenSequence;
  #currentPosition;

  constructor(sourceText) {
    this.#tokenSequence = sourceText.split(/ |\n/);
    this.#currentPosition = 0;
  }

  retrieveNumber() {
    return Number(this.#tokenSequence[this.#currentPosition++]);
  }

  retrieveString() {
    return this.#tokenSequence[this.#currentPosition++];
  }

  retrieveBigInteger() {
    return BigInt(this.#tokenSequence[this.#currentPosition++]);
  }

  retrieveNumberArray(count) {
    const startPoint = this.#currentPosition;
    this.#currentPosition += count;
    return this.#tokenSequence.slice(startPoint, this.#currentPosition).map(Number);
  }

  retrieveNumberMatrix(rows, columns) {
    return Array.from({ length: rows }, () => this.retrieveNumberArray(columns));
  }
}

function constructNestedArray(initialElement, ...dimensions) {
  const buildStructure = (dimList) => {
    if (dimList.length === 0) {
      return initialElement;
    }
    const currentDimensionSize = dimList[0];
    const remainingDimensions = dimList.slice(1);
    return Array.from({ length: currentDimensionSize }, () => buildStructure(remainingDimensions));
  };
  return buildStructure(dimensions);
}

const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputProcessor = new TokenStream(fileInputContent);

function executeChallenge() {
  const totalDays = inputProcessor.retrieveNumber();
  const itemCategories = 26;
  const decayCoefficients = inputProcessor.retrieveNumberArray(itemCategories);
  const dailySatisfactionValues = inputProcessor.retrieveNumberMatrix(totalDays, itemCategories);

  const initialProcessingState = {
    cumulativeScore: 0,
    categoryDecayStatus: constructNestedArray(0, itemCategories),
  };

  Array.from({ length: totalDays }).reduce((currentState, _, dayIndex) => {
    const chosenCategory = inputProcessor.retrieveNumber();
    const adjustedCategoryIndex = chosenCategory - 1;

    const nextDecayStatus = currentState.categoryDecayStatus.map((currentDecay, categoryIdx) =>
      currentDecay - decayCoefficients[categoryIdx]
    );

    nextDecayStatus[adjustedCategoryIndex] = 0;

    const satisfactionBoost = dailySatisfactionValues[dayIndex][adjustedCategoryIndex];
    const totalDailyPenalty = nextDecayStatus.reduce((summation, decayValue) => summation + decayValue, 0);
    const updatedCumulativeScore = currentState.cumulativeScore + satisfactionBoost + totalDailyPenalty;

    console.log(updatedCumulativeScore);

    return {
      cumulativeScore: updatedCumulativeScore,
      categoryDecayStatus: nextDecayStatus,
    };
  }, initialProcessingState);
}

const finalOutcome = executeChallenge();
