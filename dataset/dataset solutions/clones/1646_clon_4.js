const processData = (rawData) => {
    const dataLines = rawData.split("\n");
    const initialValues = dataLines[0].split(" ").map(Number);
    const initialFirst = initialValues[0];
    const initialSecond = initialValues[1];
    const initialThird = initialValues[2];
    const operationLimit = Number(dataLines[1]);

    const exploreCombinations = (remainingOperations, currentSelections) => {
        if (remainingOperations === 0) {
            let transformedValues = [...initialValues]; 
            
            for (let operationIndex = 0; operationIndex < currentSelections.length; operationIndex++) {
                const targetPosition = currentSelections[operationIndex];
                
                // Replicate the specific assignment logic from the original code's nested loops
                if (operationIndex === 4) { // Corresponds to the 't' operation (5th operation, 0-indexed is 4)
                    const sourcePosition = currentSelections[3]; // 's' operation (4th operation, 0-indexed is 3)
                    transformedValues[targetPosition] = transformedValues[sourcePosition] * 2;
                } else if (operationIndex === 6) { // Corresponds to the 'v' operation (7th operation, 0-indexed is 6)
                    const sourcePosition = currentSelections[5]; // 'u' operation (6th operation, 0-indexed is 5)
                    transformedValues[targetPosition] = transformedValues[sourcePosition] * 2;
                } else { // All other operations are simple doubling of the selected position
                    transformedValues[targetPosition] = transformedValues[targetPosition] * 2;
                }
            }

            return transformedValues[0] < transformedValues[1] && transformedValues[1] < transformedValues[2];
        }

        // Recursively try applying the next operation to each of the three positions
        for (let nextSelection = 0; nextSelection < 3; nextSelection++) {
            if (exploreCombinations(remainingOperations - 1, [...currentSelections, nextSelection])) {
                return true;
            }
        }
        return false;
    };

    const isOrderAchievable = exploreCombinations(operationLimit, []);
    console.log(isOrderAchievable ? "Yes" : "No");
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));