"use strict";

class InputProcessor {
    #tokenBuffer;
    #currentPosition;

    constructor() {
        const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
        this.#tokenBuffer = rawContent.split(/\s+/).filter(Boolean);
        this.#currentPosition = 0;
    }

    retrieveScalar(isString = false) {
        if (this.#currentPosition >= this.#tokenBuffer.length) {
            throw new Error("Input exhaustion: No more scalar tokens.");
        }
        const value = this.#tokenBuffer[this.#currentPosition];
        this.#currentPosition++;
        return isString ? value : Number(value);
    }

    retrieveVector(count, asStrings = false) {
        if (this.#currentPosition + count > this.#tokenBuffer.length) {
            throw new Error(`Input exhaustion: Not enough tokens for vector of size ${count}.`);
        }
        const collection = [];
        for (let i = 0; i < count; i++) {
            const token = this.#tokenBuffer[this.#currentPosition + i];
            collection.push(asStrings ? token : Number(token));
        }
        this.#currentPosition += count;
        return collection;
    }

    retrieveGrid(rows, columns, asStrings = false) {
        const gridData = [];
        for (let r = 0; r < rows; r++) {
            gridData.push(this.retrieveVector(columns, asStrings));
        }
        return gridData;
    }
}

function constructNestedArray(initialElement, ...dimensions) {
    const recursiveBuilder = (dimensionList) => {
        if (dimensionList.length === 0) {
            return initialElement;
        }
        const currentDimensionSize = dimensionList[0];
        const remainingDimensions = dimensionList.slice(1);
        return Array.from({ length: currentDimensionSize }, () => recursiveBuilder(remainingDimensions));
    };
    return recursiveBuilder(dimensions);
}

const dataHandler = new InputProcessor();

var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  const valA = dataHandler.retrieveScalar();
  const valB = dataHandler.retrieveScalar();
  const valC = dataHandler.retrieveScalar();

  const diffTerm = valC - valA - valB;

  if (diffTerm <= 0) {
    return "No";
  } else {
    const leftProduct = 4 * valA * valB;
    const rightSquare = diffTerm * diffTerm;
    return leftProduct < rightSquare ? "Yes" : "No";
  }
}
