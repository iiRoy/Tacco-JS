"use strict";

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputData.split(/ |\n/);
let currentTokenIndex = 0;

const inputUtility = {
    // Retrieves the next token as a number
    retrieveNumber: () => +inputTokens[currentTokenIndex++],

    // Retrieves the next token as a string
    retrieveString: () => inputTokens[currentTokenIndex++],

    // Retrieves the next token as a BigInt
    retrieveBigInt: () => BigInt(inputTokens[currentTokenIndex++]),

    // Retrieves an array of numbers of a specified length
    retrieveNumberArray: (count) => {
        const numericArray = [];
        for (let i = 0; i < count; i++) {
            numericArray.push(+inputTokens[currentTokenIndex++]);
        }
        return numericArray;
    },

    // Retrieves an array of strings of a specified length
    retrieveStringArray: (count) => {
        const stringArray = [];
        for (let i = 0; i < count; i++) {
            stringArray.push(inputTokens[currentTokenIndex++]);
        }
        return stringArray;
    },

    // Retrieves a 2D matrix of numbers (rows x columns)
    retrieveNumberMatrix: (rows, columns) => {
        const numberMatrix = [];
        for (let r = 0; r < rows; r++) {
            const rowData = [];
            for (let c = 0; c < columns; c++) {
                rowData.push(+inputTokens[currentTokenIndex++]);
            }
            numberMatrix.push(rowData);
        }
        return numberMatrix;
    },

    // Retrieves a 2D matrix of strings (rows x columns)
    retrieveStringMatrix: (rows, columns) => {
        const stringMatrix = [];
        for (let r = 0; r < rows; r++) {
            const rowData = [];
            for (let c = 0; c < columns; c++) {
                rowData.push(inputTokens[currentTokenIndex++]);
            }
            stringMatrix.push(rowData);
        }
        return stringMatrix;
    },
};

// Function to create multi-dimensional arrays with an initial value
const initializeMultiDimensionalArray = (...dimensionsAndValue) => {
    const dims = dimensionsAndValue;
    let dimCount = dims.length;
    // The original implementation uses eval, which is preserved here for Type III cloning.
    // The last argument is the initial value, others are dimensions.
    let arrayCreationExpression = "Array(dims[" + --dimCount + "]).fill().map(element => {return " + dims[0] + ";})";
    while (--dimCount) {
        arrayCreationExpression = "Array(dims[" + dimCount + "]).fill().map(element => " + arrayCreationExpression + ")";
    }
    return eval(arrayCreationExpression);
};

// Main problem-solving logic
const executeSolution = () => {
    const numberOfSwitches = inputUtility.retrieveNumber(); // N
    const numberOfBulbs = inputUtility.retrieveNumber();     // M

    // bulbSwitchCounts: Array storing the number of switches connected to each bulb
    const bulbSwitchCounts = initializeMultiDimensionalArray(0, numberOfBulbs);
    // bulbConnections: 2D array storing the indices of switches connected to each bulb
    // Initialized as an array of `numberOfBulbs` zeros, which are then replaced by actual arrays.
    const bulbConnections = initializeMultiDimensionalArray(0, numberOfBulbs);

    for (let bulbIdx = 0; bulbIdx < numberOfBulbs; bulbIdx++) {
        bulbSwitchCounts[bulbIdx] = inputUtility.retrieveNumber();
        bulbConnections[bulbIdx] = inputUtility.retrieveNumberArray(bulbSwitchCounts[bulbIdx]).map((switchVal) => switchVal - 1);
    }

    const requiredBulbParities = inputUtility.retrieveNumberArray(numberOfBulbs); // P

    let totalSatisfyingConfigurations = 0;
    const totalPossibleSwitchConfigurations = 1 << numberOfSwitches; // Equivalent to 2 ** numberOfSwitches

    // Array to hold the on/off state (0 or 1) for each switch in the current configuration
    const currentSwitchStates = Array(numberOfSwitches);

    // Helper function to determine if a specific bulb's parity requirement is met
    const checkBulbParityMatch = (idxBulb, statesOfSwitches, connectionsData, paritiesData) => {
        let activeSwitchTally = 0;
        const switchesLinkedToThisBulb = connectionsData[idxBulb];
        const countLinkedSwitches = switchesLinkedToThisBulb.length;

        for (let sIdx = 0; sIdx < countLinkedSwitches; sIdx++) {
            const connectedSwitchIdentifier = switchesLinkedToThisBulb[sIdx];
            activeSwitchTally += statesOfSwitches[connectedSwitchIdentifier];
        }
        // Check if the parity (even/odd) of active switches matches the required parity for this bulb
        return (activeSwitchTally & 1) === paritiesData[idxBulb]; // Using bitwise AND for modulo 2
    };

    // Iterate through all possible combinations of switch states
    for (let configValue = 0; configValue < totalPossibleSwitchConfigurations; configValue++) {
        // Populate currentSwitchStates array based on the binary representation of configValue
        for (let switchIdx = 0; switchIdx < numberOfSwitches; switchIdx++) {
            // Extract the switchIdx-th bit from configValue
            currentSwitchStates[switchIdx] = (configValue >> switchIdx) & 1;
        }

        let isCurrentConfigurationValid = true;
        // Verify if all bulbs are satisfied by the current switch configuration
        for (let bulbIdx = 0; bulbIdx < numberOfBulbs; bulbIdx++) {
            if (!checkBulbParityMatch(bulbIdx, currentSwitchStates, bulbConnections, requiredBulbParities)) {
                isCurrentConfigurationValid = false;
                break; // This configuration fails for at least one bulb, move to the next
            }
        }

        if (isCurrentConfigurationValid) {
            totalSatisfyingConfigurations++;
        }
    }

    return totalSatisfyingConfigurations;
};

console.log(executeSolution().toString());
