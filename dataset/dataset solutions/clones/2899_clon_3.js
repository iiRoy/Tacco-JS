"use strict";

class InputParser {
  #lines;
  #currentColumn;
  #currentLine;
  #defaultParseFunction;

  constructor(sourceText, parseFunction = Number) {
    this.#lines = sourceText.split("\n");
    this.#currentColumn = 0;
    this.#currentLine = 0;
    this.#defaultParseFunction = parseFunction;
  }

  #retrieveCurrentLineContent() {
    return this.#lines[this.#currentLine];
  }

  readNextToken(customParseFn) {
    const currentLineContent = this.#retrieveCurrentLineContent();
    if (!currentLineContent) {
      return undefined;
    }

    const lineTokens = currentLineContent.trim().split(" ");
    const tokenValue = lineTokens[this.#currentColumn];

    this.#currentColumn++;

    if (this.#currentColumn === lineTokens.length) {
      this.#currentColumn = 0;
      this.#currentLine++;
    }

    const effectiveParseFn = customParseFn || this.#defaultParseFunction;
    return effectiveParseFn(tokenValue);
  }

  readLineTokens(customParseFn) {
    const currentLineContent = this.#retrieveCurrentLineContent();
    if (!currentLineContent) {
      return undefined;
    }

    this.#currentColumn = 0;
    this.#currentLine++;

    const effectiveParseFn = customParseFn || this.#defaultParseFunction;
    return currentLineContent.split(" ").map(effectiveParseFn);
  }
}

module.exports = InputParser;

const MODULUS_VALUE = 1000003;

function calculateProductModulo(initialX, commonDiff, countN, modulus) {
  let currentProduct = 1;
  for (let termIndex = 0; termIndex < countN; termIndex++) {
    const currentTerm = initialX + termIndex * commonDiff;
    currentProduct = (currentProduct * currentTerm) % modulus;
  }
  return currentProduct;
}

const processInput = (inputData) => {
  const parserInstance = new InputParser(inputData);

  const queryCount = parserInstance.readNextToken();
  for (let i = 0; i < queryCount; i++) {
    const startX = parserInstance.readNextToken();
    const diffD = parserInstance.readNextToken();
    const numTerms = parserInstance.readNextToken();

    if (numTerms >= MODULUS_VALUE) {
      console.log(0);
      continue;
    }

    const finalResult = calculateProductModulo(startX, diffD, numTerms, MODULUS_VALUE);
    console.log(finalResult);
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
