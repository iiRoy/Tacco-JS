function InputParser(rawInputString) {
    const _instanceRef = this;
    _instanceRef._tokenIndex = 0;
    _instanceRef._originalInputString = rawInputString;

    // Helper function to process the input string into tokens
    const _processInputToTokens = (targetString) => {
        // Replace multiple newlines/spaces/tabs with a single space
        const cleanedString = targetString.replace(/[\n\s\t]+/g, " ");
        // Split by space. Do NOT filter empty strings, as the original code includes them.
        // E.g., " a b ".split(" ") -> ["", "a", "b", ""]
        return cleanedString.split(" ");
    };

    _instanceRef._tokens = _processInputToTokens(rawInputString);

    // Internal helper to retrieve the next raw token and advance the index
    const _retrieveNextRawToken = () => {
        if (_instanceRef._tokenIndex >= _instanceRef._tokens.length) {
            return null; // No more tokens
        }
        const currentToken = _instanceRef._tokens[_instanceRef._tokenIndex];
        _instanceRef._tokenIndex++;
        return currentToken;
    };

    _instanceRef.getNextToken = function() {
        const token = _retrieveNextRawToken();
        return (token !== null) ? token : null;
    };

    _instanceRef.getNextInteger = function() {
        const token = _retrieveNextRawToken();
        return (token !== null) ? parseInt(token, 10) : null; // Explicit radix for safety
    };

    _instanceRef.getNextFloat = function() {
        const token = _retrieveNextRawToken();
        return (token !== null) ? parseFloat(token) : null;
    };
    
    _instanceRef.getNextByteArray = function() {
        const token = _retrieveNextRawToken();
        // Preserving original behavior: new Int8Array(string) results in Int8Array(0)
        // new Int8Array(number_string) also results in Int8Array(0)
        return (token !== null) ? new Int8Array(token) : null;
    };
}

function ProcessSolution(inputParser) {

    const numElements = inputParser.getNextInteger();
    const maxValue = inputParser.getNextInteger();
    const numQueries = inputParser.getNextInteger();
    
    // Helper function to read query conditions from the parser
    const readQueryConditions = (parser, count) => {
        const conditions = [];
        for (let queryIdx = 0; queryIdx < count; queryIdx++) {
            const queryData = {
                a: parser.getNextInteger(),
                b: parser.getNextInteger(),
                c: parser.getNextInteger(),
                d: parser.getNextInteger(),
            };
            conditions.push(queryData);
        }
        return conditions;
    };

    const queryConditions = readQueryConditions(inputParser, numQueries);
    
    // Helper function to initialize the combination array with a given size and initial value
    const initializeCombinationArray = (size, initialValue) => {
        const combinationArray = new Array(size);
        for (let idx = 0; idx < size; idx++) {
            combinationArray[idx] = initialValue;
        }
        return combinationArray;
    };

    // Initialize the array with all 1s, as per original logic
    const currentCombination = initializeCombinationArray(numElements, 1);
    
    let maxScore = 0;
    
    // Helper function to increment the combination array in place.
    // It mimics a base-M counter with a specific carry logic.
    // Returns true if incremented successfully, false if overflowed (all combinations exhausted).
    const incrementCombination = (combination, maxAllowedValue) => {
        const arrayLength = combination.length;
        const lastElementIndex = arrayLength - 1;
        
        // Increment the rightmost element first, as per original logic
        combination[lastElementIndex]++; 
        
        for (let carryIdx = lastElementIndex; carryIdx >= 0; carryIdx--) {
            if (combination[carryIdx] > maxAllowedValue) {
                if (carryIdx === 0) {
                    // Overflow at the leftmost element, indicating all combinations have been generated
                    return false; 
                }
                combination[carryIdx - 1]++; // Carry over to the left
                const newBaseValue = combination[carryIdx - 1];
                // Fill subsequent elements from the current carry position with the new base value
                for (let fillIdx = carryIdx; fillIdx < arrayLength; fillIdx++) {
                    combination[fillIdx] = newBaseValue;
                }
            } else {
                // No carry needed for this position or further left, so we can stop
                break; 
            }
        }
        return true; // Successfully generated a new combination
    };

    // Helper function to calculate the score for a given combination based on query conditions
    const calculateScoreForCombination = (combination, conditions) => {
        let score = 0;
        const oneBasedIndexAdjustment = 1; // 'a' and 'b' in conditions are 1-based indices
        for (let queryIdx = 0; queryIdx < conditions.length; queryIdx++) {
            const currentQuery = conditions[queryIdx];
            // Adjust 1-based indices from query to 0-based for array access
            const valB = combination[currentQuery.b - oneBasedIndexAdjustment];
            const valA = combination[currentQuery.a - oneBasedIndexAdjustment];
            if (currentQuery.c === (valB - valA)) {
                score += currentQuery.d;
            }
        }
        return score;
    };

    // Main loop for generating and evaluating combinations.
    // The original loop structure increments the combination *then* evaluates it.
    // The initial combination [1,1,...,1] is never evaluated.
    // This while loop structure correctly mirrors that behavior.
    let combinationGenerationSuccessful = true;
    while (combinationGenerationSuccessful) {
        combinationGenerationSuccessful = incrementCombination(currentCombination, maxValue);
        
        if (!combinationGenerationSuccessful) {
            break; // All possible combinations have been exhausted
        }
        
        const currentScore = calculateScoreForCombination(currentCombination, queryConditions);
        if (maxScore < currentScore) {
            maxScore = currentScore;
        }
    }
    
    console.log(maxScore);
}

ProcessSolution(new InputParser(require("fs").readFileSync("/dev/stdin", "utf8")));
