function calculateOverallValue(rawContent) {
    const items = rawContent.split(/\s|\n/).filter(Boolean);
    const itemCount = Number(items[0]);
    const numericalEntities = items.slice(1, itemCount + 1).map(Number);

    function computeSequenceSum(collection, currentIdx, runningSum) {
        if (currentIdx === collection.length) {
            return runningSum;
        } else if (currentIdx === collection.length - 1) {
            return computeSequenceSum(collection, currentIdx + 1, runningSum + collection[currentIdx - 1]);
        } else {
            const smallerOne = collection[currentIdx - 1] < collection[currentIdx] ? collection[currentIdx - 1] : collection[currentIdx];
            return computeSequenceSum(collection, currentIdx + 1, runningSum + smallerOne);
        }
    }
    
    const finalValue = computeSequenceSum(numericalEntities, 1, numericalEntities[0]);
    
    process.stdout.write(String(finalValue));
}

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
calculateOverallValue(sourceData);