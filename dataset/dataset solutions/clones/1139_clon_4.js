const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = fileContent.trim().split("\n");

const configValues = processedLines.shift().split(" ").map(Number);
const distinctItemTypes = configValues[0];
const capacityLimit = configValues[1];

const itemSpecifications = processedLines.slice(0, distinctItemTypes);
const generatedItems = [null];
itemSpecifications.forEach(specLine => {
    const [baseValue, baseWeight] = specLine.split(" ").map(Number);
    let currentFactor = 1;
    while (baseWeight * currentFactor <= capacityLimit) {
        generatedItems.push({
            val: baseValue * currentFactor,
            wt: baseWeight * currentFactor
        });
        currentFactor++;
    }
});
const totalGeneratedItems = generatedItems.length - 1;

function calculateOptimalValue() {
    const maxValues = Array(capacityLimit + 1).fill(0);

    for (let itemIndex = 1; itemIndex <= totalGeneratedItems; itemIndex++) {
        const currentItem = generatedItems[itemIndex];
        for (let currentCapacity = capacityLimit; currentCapacity >= currentItem.wt; currentCapacity--) {
            maxValues[currentCapacity] = Math.max(
                maxValues[currentCapacity],
                currentItem.val + maxValues[currentCapacity - currentItem.wt]
            );
        }
    }
    return maxValues[capacityLimit];
}

const finalMaxResult = calculateOptimalValue();
console.log(finalMaxResult);
