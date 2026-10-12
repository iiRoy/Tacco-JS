function processInputData(rawData) {
    // Split the raw input string into individual lines
    const inputLines = rawData.split("\n");

    // Extract the count of elements from the first line and convert to an integer
    const elementCount = Number.parseInt(inputLines[0], 10);

    // Split the second line into number strings and convert each to an integer
    const initialNumbers = inputLines[1].split(" ").map(numStr => Number.parseInt(numStr, 10));

    // Calculate the total sum of all numbers using the reduce method
    const totalSum = initialNumbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Determine the average value of the numbers
    const targetAverage = totalSum / elementCount;

    // Transform the array: for each number, calculate its absolute difference from the average
    // and store this difference along with the number's original index.
    const processedElements = initialNumbers.map((currentNum, originalIdx) => {
        const differenceValue = Math.abs(currentNum - targetAverage);
        return { differenceValue: differenceValue, originalIndex: originalIdx };
    });

    // Sort the transformed array based on the calculated difference value in ascending order
    processedElements.sort((itemA, itemB) => itemA.differenceValue - itemB.differenceValue);

    // Return the original index of the element that has the smallest difference from the average
    return processedElements[0].originalIndex;
}

// If you are interested in the algorithms I used,
// there is no need to read down from this line.

((b,c,d)=>"undefined"!=typeof require?console.log(processInputData(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return processInputData(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
5
2 5 2 5 6
`);
