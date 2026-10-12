function processInput(inputStr) {
    const inputLines = inputStr.split("\n");
    const firstLineData = inputLines[0].split(" ");

    const numElements = Number(firstLineData[0]);
    const subArrayLength = Number(firstLineData[1]);

    const dataArray = inputLines[1].split(" ").map(Number);

    const processedResults = [];
    const iterationCount = numElements - subArrayLength + 1;

    for (let currentIdx = 0; currentIdx < iterationCount; currentIdx++) {
        const leadingSegment = dataArray.slice(0, currentIdx);
        const segmentToSort = dataArray.slice(currentIdx, currentIdx + subArrayLength);
        
        // Create a shallow copy of the segment before sorting to ensure no unintended modifications
        const sortedSegment = [...segmentToSort].sort(numericSort); 
        
        const trailingSegment = dataArray.slice(currentIdx + subArrayLength);

        const finalCombinedArray = leadingSegment.concat(sortedSegment).concat(trailingSegment);
        processedResults.push(finalCombinedArray.toString());
    }

    const distinctCombinations = new Set(processedResults);

    console.log(distinctCombinations.size);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function numericSort(valueA, valueB) {
    return valueA - valueB;
}
