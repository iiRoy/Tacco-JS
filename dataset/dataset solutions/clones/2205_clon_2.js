// This section handles input processing and should generally not be modified.
var inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var dataSource;
var capturedLines = [];

inputReader.on('line', function(singleLine) {
    capturedLines.push(singleLine);
});

inputReader.on('close', function() {
    dataSource = prepareInput(capturedLines);
    console.warn('\n↑Input data ↓Output result'); // Changed error to warn, and message
    executePrimaryLogic();
});

// Utility function to create a deep copy of an object or Set.
function replicateObject(sourceObj) {
    return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

// Functions to retrieve and convert the next piece of input data.
function retrieveInteger() {
    return convertInput(fetchNextItem(), 1);
}

function retrieveStringArray() {
    return convertInput(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
    return convertInput(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
    return convertInput(fetchNextItem(), 6);
}

// Retrieves the next item from the input source.
function fetchNextItem() {
    return dataSource.fetchNextItem();
}

// Checks if there are more items available in the input source.
function hasMoreItems() {
    return dataSource.hasMoreItems();
}

// Initializes the data source object from raw input lines.
function prepareInput(rawInputLines) {
    return {
        dataList: rawInputLines,
        currentPosition: 0,
        maximumCount: rawInputLines.length,
        hasMoreItems: function() {
            return (this.currentPosition < this.maximumCount);
        },
        fetchNextItem: function() {
            if (this.hasMoreItems()) {
                return this.dataList[this.currentPosition++];
            } else {
                throw 'DataRetrievalError: No further input available'; // Changed error message
            }
        }
    };
}

// Displays the final result to the console.
function displayResult(messageContent) {
    console.log(messageContent);
}

// Logs debug information to the standard error stream.
function logDebugInfo(debugPayload) {
    console.error('trace:' + require('util').inspect(debugPayload, false, null)); // Changed debug prefix
}

// Helper function for various input conversions.
// The 'conversionType' parameter dictates the transformation:
// 1: Parses to an integer.
// 2: Splits string by space.
// 4: Splits string by space and converts parts to numbers.
// 6: Splits string into individual characters.
// 7: Splits string into characters and converts them to numbers.
// 8: Joins array elements with spaces.
// 9: Joins array elements with newlines.
// 0: Joins array elements without a separator.
// Default: Returns the input value as is.
function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return Number.parseInt(inputValue); // Changed parseInt to Number.parseInt
            case 2:
                return inputValue.split(' ');
            case 4:
                return inputValue.split(' ').map(Number);
            case 6:
                return inputValue.split('');
            case 7:
                return inputValue.split('').map(Number);
            case 8:
                return inputValue.join(' ');
            case 9:
                return inputValue.join('\n');
            case 0:
                return inputValue.join('');
            default:
                return inputValue;
        }
    } catch (errorObject) { // Changed 'e' to 'errorObject'
        return inputValue;
    }
}

// End of utility functions.
// ----------------------------------------------------------------------------------------------------------------------
// Main program logic starts here.

function executePrimaryLogic() {
    // Read the initial set of parameters for the problem.
    var initialParameters = retrieveIntegerArray();

    // Extract problem-specific variables from the initial input.
    var monsterCount = initialParameters[0]; // Total number of monsters.
    var attackRange = initialParameters[1]; // Range of the bomb's effect.
    var bombDamage = initialParameters[2]; // Damage inflicted by a single bomb.

    // Initialize an array to store monster details (position, health).
    var monsterData = new Array(monsterCount);

    // Populate the monster data array with input.
    for (var idx = 0; idx < monsterCount; idx++) {
        monsterData[idx] = retrieveIntegerArray();
    }

    // Sort the monster data based on their positions (first element).
    monsterData.sort(function(entityA, entityB) {
        return entityA[0] - entityB[0];
    });

    var totalBombsUsed = 0; // Accumulator for the total number of bombs needed.

    // Iterate through each monster to determine bomb requirements.
    for (var currIdx = 0; currIdx < monsterCount; currIdx++) {
        // If a monster's health is already zero or less, skip it.
        if (monsterData[currIdx][1] === 0) { // Changed == to ===
            continue;
        }

        var currentMonsterPosition = monsterData[currIdx][0]; // Position of the current monster.
        // Calculate the number of bombs required to defeat the current monster.
        var requiredBombs = Math.ceil(monsterData[currIdx][1] / bombDamage);

        totalBombsUsed += requiredBombs; // Add to the total bomb count.

        // Apply bomb damage to subsequent monsters within the attack radius.
        for (var nextIdx = currIdx + 1; nextIdx < monsterCount; nextIdx++) {
            // Check if the next monster is within the blast radius of the current monster's bomb.
            // The blast radius extends 'attackRange' in both directions, so '2 * attackRange' from the current monster's position.
            if (currentMonsterPosition + 2 * attackRange >= monsterData[nextIdx][0]) {
                // Reduce the next monster's health, ensuring it doesn't go below zero.
                monsterData[nextIdx][1] = Math.max(0, monsterData[nextIdx][1] - requiredBombs * bombDamage);
            } else {
                // If the next monster is out of range, subsequent monsters will also be, due to sorting.
                break;
            }
        }
    }

    // Output the final count of bombs used.
    displayResult(totalBombsUsed);
}