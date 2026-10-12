const parseNumericValue = (str) => parseInt(str, 10);

const buildFrequencyMap = (numbersArray) => {
    const frequencyCounter = {};
    for (const num of numbersArray) {
        frequencyCounter[num] = (frequencyCounter[num] || 0) + 1;
    }
    return frequencyCounter;
};

function processInputData(inputString) {
    const inputLines = inputString.split("\n");

    const numD = parseNumericValue(inputLines[0]);
    const dataDStrings = inputLines[1].split(" ");
    const numT = parseNumericValue(inputLines[2]);
    const dataTStrings = inputLines[3].split(" ");

    const dataDValues = dataDStrings.map(parseNumericValue);
    const dataTValues = dataTStrings.map(parseNumericValue);

    const itemCounts = buildFrequencyMap(dataDValues);

    let allRequirementsMet = true;

    for (let currentIdx = 0; currentIdx < numT; currentIdx++) {
        const requiredItem = dataTValues[currentIdx];
        const availableCount = itemCounts[requiredItem];

        if (availableCount === undefined || availableCount < 1) {
            allRequirementsMet = false;
            break;
        } else {
            itemCounts[requiredItem]--;
        }
    }

    if (allRequirementsMet) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

function runDebug(){
	const rawInputFromDOM = document.getElementById("input").value;
	processInputData(rawInputFromDOM);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
