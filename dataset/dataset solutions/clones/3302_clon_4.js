"use strict";

const processKnapsack = (inputContent) => {
    const dataLines = inputContent.trim().split("\n");
    const [itemCount, knapsackCapacity] = dataLines[0].split(" ").map(Number);

    const itemDetails = dataLines.slice(1, itemCount + 1).map(line => line.split(" ").map(Number));

    const maxValuesForCapacity = Array(knapsackCapacity + 1).fill(0);

    itemDetails.forEach(([weightOfItem, valueOfItem]) => {
        for (let currentWeightLimit = knapsackCapacity; currentWeightLimit >= weightOfItem; currentWeightLimit--) {
            maxValuesForCapacity[currentWeightLimit] = Math.max(
                maxValuesForCapacity[currentWeightLimit],
                valueOfItem + maxValuesForCapacity[currentWeightLimit - weightOfItem]
            );
        }
    });

    console.log(maxValuesForCapacity[knapsackCapacity]);
};

processKnapsack(require('fs').readFileSync('/dev/stdin', 'utf8'));
