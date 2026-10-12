'use strict'

function processInputData(rawText) {
  const lineSegments = rawText.split(/\r?\n/);
  const contentLines = lineSegments.slice(1);

  const numericCollections = contentLines.map(currentLine => {
    const stringValues = currentLine.split(' ').slice(1);
    return stringValues.map(value => Number.parseInt(value, 10));
  });

  // Mimic original behavior: if numericCollections is empty,
  // accessing numericCollections[0] will be undefined, leading to a TypeError
  // when passed to new Set() or when .filter() is called on it.
  const initialCommonSet = new Set(numericCollections[0]);

  const finalIntersectionSet = numericCollections.slice(1).reduce((currentCommonSet, nextCollection) => {
    const nextCollectionElements = new Set(nextCollection);
    const updatedCommonSet = new Set();
    for (const element of currentCommonSet) {
      if (nextCollectionElements.has(element)) {
        updatedCommonSet.add(element);
      }
    }
    return updatedCommonSet;
  }, initialCommonSet);

  return finalIntersectionSet.size;
}

const fileSystem = require("fs");
const resultCount = processInputData(fileSystem.readFileSync("/dev/stdin", "utf8"));
console.log(resultCount);
