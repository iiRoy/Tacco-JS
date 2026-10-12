function processNumbers(inputValues) {
    const sortedValues = [...inputValues].sort((a, b) => a - b);
    const frequencyMap = new Map();

    for (const val of sortedValues) {
        frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
    }

    const uniqueElements = Array.from(frequencyMap.keys());
    const elementCounts = Array.from(frequencyMap.values());
    
    return [uniqueElements, elementCounts];
}

function executeProgram(programInput) {
    const [firstLine, secondLine] = programInput.split("\n");
    
    const initialCount = Number(firstLine);
    const parsedNumbers = secondLine.split(" ").map(Number);
    
    const [uniqueValues, frequencies] = processNumbers(parsedNumbers);
    
    const totalAdjustments = uniqueValues.reduce((accumulator, currentValue, index) => {
        const valueFrequency = frequencies[index];
        return accumulator + ((currentValue < valueFrequency) ? (valueFrequency - currentValue) : ((currentValue > valueFrequency) ? valueFrequency : 0));
    }, 0);
    
    console.log(totalAdjustments);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
