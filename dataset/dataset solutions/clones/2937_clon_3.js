const InputSource = (() => {
    class DataReader {
        constructor(rawStringContent) {
            // Stores raw lines initially; can be updated to token arrays by processing methods
            this.allLines = rawStringContent.trim().split('\n');
            this.currentLineIndex = 0; // Pointer to the current line being processed
        }

        // Helper to retrieve and potentially process the line at the current pointer
        _retrieveCurrentLineTokens() {
            if (this.currentLineIndex >= this.allLines.length) {
                return null; // No more lines
            }

            let lineData = this.allLines[this.currentLineIndex];
            if (typeof lineData === 'string') {
                // If the line is still a raw string, split it into tokens
                const tokens = lineData.split(' ');
                // Update the array in place, mimicking the original's behavior
                this.allLines[this.currentLineIndex] = tokens;
                return tokens;
            }
            // If it's already an array (processed by a previous call), return it directly
            return lineData;
        }

        // Renamed from 'a': Reads and extracts a single token from the current line
        extractSingleToken(shouldReturnAsText = false) {
            let lineTokens = this._retrieveCurrentLineTokens();
            
            // Skip empty lines or lines already exhausted
            while (lineTokens && lineTokens.length === 0 && this.currentLineIndex < this.allLines.length) {
                this.currentLineIndex++; // Advance past the empty line
                lineTokens = this._retrieveCurrentLineTokens(); // Try the next line
            }

            if (!lineTokens || lineTokens.length === 0) {
                throw new Error("Input stream exhausted or current line is unexpectedly empty.");
            }

            // Original used `pop()`, so we extract from the end of the token list
            const extractedToken = lineTokens.pop();

            if (lineTokens.length === 0) {
                // If the current line is now fully consumed, advance to the next line
                this.currentLineIndex++;
            }
            
            return shouldReturnAsText ? extractedToken : Number(extractedToken);
        }

        // Renamed from 'l': Reads and extracts all tokens from an entire line
        readFullLineTokens(outputAsText = false) {
            if (this.currentLineIndex >= this.allLines.length) {
                throw new Error("Attempted to read line beyond the input stream boundaries.");
            }

            // Get the tokens for the current line, ensuring it's in array format
            const tokensOnLine = this._retrieveCurrentLineTokens();
            this.currentLineIndex++; // Consume the entire line by advancing the pointer
            
            if (!tokensOnLine) {
                return []; // Return empty array for an undefined line (should be prevented by earlier checks)
            }

            return outputAsText ? tokensOnLine : tokensOnLine.map(token => Number(token));
        }

        // Renamed from 'm': Reads multiple consecutive lines as a matrix of token arrays
        readMultipleLineArrays(desiredLineCount, outputAsText = false) {
            if (desiredLineCount <= 0) {
                return []; // No lines to read
            }
            if (this.currentLineIndex + desiredLineCount > this.allLines.length) {
                throw new Error(`Insufficient lines available to read ${desiredLineCount} lines for matrix.`);
            }

            const resultingMatrix = [];
            for (let i = 0; i < desiredLineCount; i++) {
                // This call ensures the line at currentLineIndex is processed into an array
                const tokens = this._retrieveCurrentLineTokens();
                resultingMatrix.push(tokens);
                this.currentLineIndex++; // Advance for each line consumed
            }
            
            return outputAsText ? resultingMatrix : resultingMatrix.map(row => row.map(token => Number(token)));
        }

        // Renamed from 'r': Fetches raw line content, optionally converting to numbers
        fetchRawLines(countOfLines, convertToNumbers = false) {
            if (countOfLines <= 0) {
                return []; // No lines to fetch
            }
            if (this.currentLineIndex + countOfLines > this.allLines.length) {
                throw new Error(`Not enough lines to fetch ${countOfLines} raw lines.`);
            }

            const rawLineContents = [];
            for (let i = 0; i < countOfLines; i++) {
                let lineContent = this.allLines[this.currentLineIndex];
                if (typeof lineContent === 'object' && Array.isArray(lineContent)) {
                    // If a line was previously processed into an array by other methods, join it back to a string
                    lineContent = lineContent.join(' ');
                }
                rawLineContents.push(lineContent);
                this.currentLineIndex++; // Advance for each raw line fetched
            }
            return convertToNumbers ? rawLineContents.map(line => Number(line)) : rawLineContents;
        }
    }

    // Returns a factory function to create a DataReader instance
    return (inputString) => new DataReader(inputString);
})();

// Instantiate the input reader with data from stdin
let problemInputReader = InputSource(require("fs").readFileSync("/dev/stdin","utf8"));

// Renamed from xArray: Creates a multi-dimensional array initialized with a value
const createMultiDimensionalArray = (initialValue, ...dimensions) => {
    // Validate dimensions to be non-negative integers
    if (dimensions.some(dim => !Number.isInteger(dim) || dim < 0)) {
        throw new Error("All dimensions for multi-dimensional array must be non-negative integers.");
    }

    const recursiveArrayBuilder = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            // Base case: innermost dimension, fill with initial value
            return Array.from({ length: dimensions[dimIndex] }, () => initialValue);
        } else {
            // Recursive step: outer dimensions, fill with nested arrays
            return Array.from({ length: dimensions[dimIndex] }, () => recursiveArrayBuilder(dimIndex + 1));
        }
    };

    if (dimensions.length === 0) {
        return initialValue; // If no dimensions, just return the initial value
    }

    return recursiveArrayBuilder(0);
};

// Helper function to calculate the sum of array elements (extracted from repeated logic)
const calculateArraySum = (numberArray) => {
    if (!numberArray || numberArray.length === 0) {
        return 0; // Handle empty or null arrays gracefully
    }
    return numberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

// Renamed from main: Contains the core problem-solving logic
function solveProblem(){
    // Read problem parameters
    const initialItemCount = problemInputReader.extractSingleToken(); // Original 'n'
    const numberOfDeals = problemInputReader.extractSingleToken();   // Original 'm'

    // Read the initial item prices, then sort them in ascending order
    const itemPrices = problemInputReader.readFullLineTokens().sort((priceA, priceB) => priceA - priceB);

    // Read the deal offers (each is [count, value])
    const availableDeals = problemInputReader.readMultipleLineArrays(numberOfDeals);
    
    // Validate deal structure: each deal should be an array of at least two numbers
    if (availableDeals.some(deal => !Array.isArray(deal) || deal.length < 2 || deal.some(val => typeof val !== 'number'))) {
         throw new Error("Each deal offer must consist of at least two numeric elements: [quantity, value].");
    }

    // Sort deals by their value (second element) in descending order to prioritize better deals
    availableDeals.sort((dealOne, dealTwo) => dealTwo[1] - dealOne[1]);

    let currentItemProcessingPointer = 0; // Original 'x', tracks position in itemPrices array

    // Iterate through each available deal offer
    for (let dealIndex = 0; dealIndex < numberOfDeals; dealIndex++) {
        const currentDealDetails = availableDeals[dealIndex];
        const dealQuantity = currentDealDetails[0]; // Number of items this deal can apply to
        const dealValue = currentDealDetails[1];     // The value offered by this deal

        // Apply the current deal to items as long as there are items left to process
        // and the deal quantity hasn't been exhausted.
        for (let itemsProcessedInCurrentDeal = 0; 
             itemsProcessedInCurrentDeal < dealQuantity && currentItemProcessingPointer < initialItemCount;
             itemsProcessedInCurrentDeal++, currentItemProcessingPointer++) {
            
            const currentItemPrice = itemPrices[currentItemProcessingPointer];

            // If the current item's price can be improved by this deal
            if (currentItemPrice < dealValue) {
                itemPrices[currentItemProcessingPointer] = dealValue; // Apply the deal
            } else {
                // Critical optimization from original:
                // Since itemPrices is sorted ascending, and availableDeals is sorted by value descending,
                // if the current item (which is the cheapest unprocessed item) cannot be improved
                // by the current deal (which is the best available deal value-wise),
                // then no subsequent item can be improved by this deal, nor by any weaker deal.
                // Therefore, we can stop processing and return the current sum.
                const totalValueAfterOptimization = calculateArraySum(itemPrices);
                return totalValueAfterOptimization;
            }
        }
    }

    // If all deals are exhausted or all items have been processed, calculate the final sum
    return calculateArraySum(itemPrices);
}

// Execute the problem solver and print the result
console.log(solveProblem());