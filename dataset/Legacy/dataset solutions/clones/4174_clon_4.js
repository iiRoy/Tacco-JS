"use strict";

const processInputData = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    const firstLineElements = inputLines[0].split(" ");
    const totalItemsCount = parseInt(firstLineElements[0]);
    const categoriesToPreserve = parseInt(firstLineElements[1]);

    const itemCategoryIdentifiers = inputLines[1].split(" ").map(Number);

    const categoryOccurrenceMap = new Map();
    itemCategoryIdentifiers.forEach(categoryKey => {
        categoryOccurrenceMap.set(categoryKey, (categoryOccurrenceMap.get(categoryKey) || 0) + 1);
    });

    const allCategoryFrequencies = Array.from(categoryOccurrenceMap.values());

    allCategoryFrequencies.sort((frequencyOne, frequencyTwo) => frequencyOne - frequencyTwo);

    const countOfCategoriesToEliminate = Math.max(0, allCategoryFrequencies.length - categoriesToPreserve);

    const sumOfEliminatedFrequencies = allCategoryFrequencies
        .slice(0, countOfCategoriesToEliminate)
        .reduce((currentSum, frequencyValue) => currentSum + frequencyValue, 0);

    console.log(sumOfEliminatedFrequencies);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
