function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}
function myerr(t){console.error(t);}

const inputProcessors = [
    (val) => val,
    (val) => Number.parseInt(val, 10),
    (val) => val.split(" "),
    (val) => val.split("\n"),
    (val) => val.split(" ").map(Number),
    (val) => val.split("\n").map(Number),
    (val) => val.split(""),
    (val) => val.split("").map(Number),
];

function transformData(source, processorIndex) {
    return inputProcessors[processorIndex](source);
}

function calculateUniqueRemaining(rawData) {
    const lines = transformData(rawData, 3);
    const elementCount = transformData(lines[0], 1);
    const inputNumbers = transformData(lines[1], 4);

    const frequencyMap = new Map();
    inputNumbers.forEach(num => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    });

    let finalSingleCount = 0;
    const multipleEntryList = []; // Stores [value, count] for numbers with count > 1

    for (const [value, currentCount] of frequencyMap.entries()) {
        if (currentCount === 1) {
            finalSingleCount++;
        } else {
            multipleEntryList.push([value, currentCount]);
        }
    }

    multipleEntryList.sort((a, b) => a[0] - b[0]); // Sort by value

    let leftPointer = 0;
    let rightPointer = multipleEntryList.length - 1;

    while (leftPointer < rightPointer) {
        multipleEntryList[leftPointer][1]--; // Decrement count of left element
        multipleEntryList[rightPointer][1]--; // Decrement count of right element

        // Check and update left element's status
        if (multipleEntryList[leftPointer][1] === 1) {
            finalSingleCount++;
            leftPointer++;
        } else if (multipleEntryList[leftPointer][1] === 0) {
            leftPointer++;
        }

        // Check and update right element's status
        if (multipleEntryList[rightPointer][1] === 1) {
            finalSingleCount++;
            rightPointer--;
        } else if (multipleEntryList[rightPointer][1] === 0) {
            rightPointer--;
        }
    }

    // Handle the case where pointers meet on a single element
    if (leftPointer === rightPointer) {
        const remainingValueCount = multipleEntryList[leftPointer][1];
        // If the remaining count for this element is > 1 and odd, one instance remains.
        if (remainingValueCount > 1 && remainingValueCount % 2 === 1) {
            finalSingleCount++;
        }
    }

    return finalSingleCount;
}

myout(calculateUniqueRemaining(myin()));
