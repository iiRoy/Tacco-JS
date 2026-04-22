"use strict"
const acquireInputHandler =
  () => {
    const fileContentLines = require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim()
      .split("\n");
    const dataAccessObject = {
      "itemCollection": fileContentLines,
      "currentPosition": 0,
      "totalItems": fileContentLines.length,
      "canAdvance": function() {
        return this.currentPosition < this.totalItems
      },
      "fetchElement": function() {
        if (!this.canAdvance()) {
          throw "ArrayIndexOutOfBoundsException";
        } else {
          return this.itemCollection[this.currentPosition++];
        }
      }
    };
    return dataAccessObject;
  }
const readerInstance = acquireInputHandler();
const getNextItem = () =>
  readerInstance.fetchElement()
const parseNextInteger = () =>
  parseInt(readerInstance.fetchElement())
const retrieveStringArray = () =>
  readerInstance.fetchElement().split(" ")
const retrieveIntegerArray = () =>
  readerInstance.fetchElement().split(" ").map(elementValue => parseInt(elementValue))
const retrieveCharacterArray = () =>
  readerInstance.fetchElement().split("")
const hasMoreElements = () =>
  readerInstance.canAdvance()
const displayOutput = (...outputValues) =>
  console.log(...outputValues)
const orchestrateExecution = () => {
  const [firstParam, secondParam] = retrieveIntegerArray()
  console.log(1900 * secondParam + 100 * (firstParam - secondParam) * Math.pow(2, secondParam))
}
orchestrateExecution()