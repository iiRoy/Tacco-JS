"use strict";

class InputSource {
    #dataLines;
    #currentPosition;

    constructor() {
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        this.#dataLines = fileContent.trim().split("\n");
        this.#currentPosition = 0;
    }

    checkMore() {
        return this.#currentPosition < this.#dataLines.length;
    }

    retrieveNext() {
        if (!this.checkMore()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.#dataLines[this.#currentPosition++];
    }
}

const sourceInstance = new InputSource();

const obtainNext = () => sourceInstance.retrieveNext();
const obtainInt = () => parseInt(sourceInstance.retrieveNext());
const obtainStrArray = () => sourceInstance.retrieveNext().split(" ");
const obtainIntArray = () => sourceInstance.retrieveNext().split(" ").map(val => parseInt(val));
const obtainCharArray = () => sourceInstance.retrieveNext().split("");
const checkMore = () => sourceInstance.checkMore();
const displayOutput = (...args) => console.log(...args);

const Main = () => {
    const lineData = obtainIntArray();
    const nVal = lineData[0];
    const mVal = lineData[1];

    displayOutput(1900 * mVal + 100 * (nVal - mVal) * Math.pow(2, mVal));
};

Main();
