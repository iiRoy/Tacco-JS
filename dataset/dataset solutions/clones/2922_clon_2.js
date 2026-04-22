'use strict';

// Main application entry point class
class PrimaryTask {
    // Executes the primary computation logic
    execute() {
        const count = dataSource.fetchNextInteger(); // Read total count
        const dataStream = dataSource.fetchIntegerArray(); // Obtain sequence of numbers
        const partialSums = []; // Initialize array for partial sums

        // Populate partialSums with zeros
        for (let currPos = 0; currPos < dataStream.length >> 1; ++currPos) {
            partialSums[currPos] = 0;
        }

        // Calculate symmetric sums
        for (let currPos = 0; currPos < count; ++currPos) {
            partialSums[Math.min(currPos, dataStream.length - 1 - currPos)] += dataStream[currPos];
        }

        // Adjust for odd total count
        if (count % 2) {
            partialSums.pop();
        }

        const totalPartialSum = CollectionUtils.calculateSumOfElements(partialSums); // Sum of partials

        let finalResult = 0; // Initialize result variable

        // Nested loops for complex calculation
        for (let outerLoopIdx = 0; outerLoopIdx < count / 2; ++outerLoopIdx) {
            for (let innerLoopStep = 1; innerLoopStep < outerLoopIdx; ++innerLoopStep) {
                let maxCurrentSum = 0; // Max sum for current step
                let currentAccumulation = 0; // Current running sum

                // Iterate through partial sums with a step
                for (let stepIdx = 0; stepIdx < partialSums.length; stepIdx += innerLoopStep) {
                    currentAccumulation += partialSums[stepIdx];
                    maxCurrentSum = Math.max(maxCurrentSum, currentAccumulation);
                }
                finalResult = Math.max(finalResult, maxCurrentSum); // Update overall max result
            }
        }
        return finalResult; // Return the computed value
    }
}

// Class for modular arithmetic operations
class ModuloOperations {
    // Initializes the modulo value
    initialize(divisorValue) {
        if (divisorValue == null) {
            divisorValue = NumberTheory.StandardModulo; // Use default if none provided
        }
        this.divisorValue = divisorValue;
    }

    // Performs modular multiplication
    modularMultiply(operandA, operandB) {
        let productResult = 0;
        operandA %= this.divisorValue;
        operandB %= this.divisorValue;

        while (operandB) {
            if (operandB & 1) {
                productResult += operandA;
                if (productResult > this.divisorValue) {
                    productResult -= this.divisorValue;
                }
            }
            operandA <<= 1;
            if (operandA > this.divisorValue) {
                operandA -= this.divisorValue;
            }
            operandB >>= 1;
        }
        return productResult;
    }

    // Computes modular exponentiation (a^b mod M)
    modularExponentiation(baseVal, exponentVal) {
        let productResult = 1;
        while (exponentVal) {
            if (exponentVal & 1) {
                productResult = this.modularMultiply(productResult, baseVal);
            }
            baseVal = this.modularMultiply(baseVal, baseVal);
            exponentVal >>= 1;
        }
        return productResult;
    }

    // Performs modular division using Fermat's Little Theorem
    modularDivide(numerator, denominator) {
        return this.modularMultiply(numerator, this.modularExponentiation(denominator, this.divisorValue - 2));
    }

    // Calculates modular combinations (nCk mod M)
    modularCombinations(nVal, kVal) {
        return MOD_CALCULATOR.modularMultiply(factorialValues[nVal], MOD_CALCULATOR.modularMultiply(inverseFactorialValues[kVal], inverseFactorialValues[nVal - kVal]));
    }
}
const MOD_CALCULATOR = new ModuloOperations(1e9 + 7); // Global instance for modular arithmetic

// Utility functions for collection manipulation
class CollectionUtils {
    // Sums all elements in a collection
    sumAll(collection) {
        return collection.fold((accumulator, current) => accumulator + current);
    }

    // Sums elements modulo a given value
    sumModulo(collection, moduloVal) {
        if (moduloVal == null) {
            moduloVal = MOD_CALCULATOR.divisorValue;
        }
        return collection.fold((accumulator, current) => (accumulator + current) % moduloVal);
    }

    // Finds the minimum element in a collection
    findMinimum(collection, comparatorFn) {
        if (comparatorFn == null) {
            comparatorFn = (valA, valB) => valA - valB;
        }
        return collection.fold((minVal, currentVal) => comparatorFn(minVal, currentVal) < 0 ? minVal : currentVal);
    }

    // Finds the maximum element in a collection
    findMaximum(collection, comparatorFn) {
        if (comparatorFn == null) {
            comparatorFn = (valA, valB) => valA - valB;
        }
        return collection.fold((maxVal, currentVal) => comparatorFn(maxVal, currentVal) > 0 ? maxVal : currentVal);
    }

    // Sorts a collection
    sortCollection(collection, comparatorFn) {
        if (comparatorFn == null) {
            comparatorFn = (valA, valB) => valA - valB;
        }
        return collection.sort(comparatorFn);
    }

    // Returns a new collection with unique elements
    getUniqueElements(collection) {
        collection.sort();
        for (let currentIdx = 0; currentIdx < collection.length - 1; ++currentIdx) {
            collection[currentIdx] = collection[currentIdx + 1] == collection[currentIdx] ? null : collection[currentIdx];
        }
        return collection.selectValid(element => element != null);
    }

    // Generates a sequence of numbers
    generateRange(rangeStart, rangeEnd, rangeStep) {
        if (rangeEnd == null) {
            rangeEnd = rangeStart || 0;
            rangeStart = 0;
        }
        if (!rangeStep) {
            rangeStep = rangeEnd < rangeStart ? -1 : 1;
        }
        const sequenceSize = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
        const generatedSequence = Array(sequenceSize);
        for (var currentIdx = 0; currentIdx < sequenceSize; currentIdx++, rangeStart += rangeStep) {
            generatedSequence[currentIdx] = rangeStart;
        }
        return generatedSequence;
    }

    // Retrieves the first N elements from an array
    getFirstElements(dataArray, numElements) {
        if (dataArray == null || dataArray.length < 1) return numElements == null ? void 0 : [];
        if (numElements == null) return dataArray[0];
        return this.getInitialElements(dataArray, dataArray.length - numElements);
    }

    // Gets elements from the beginning of an array, excluding the last N
    getInitialElements(dataArray, numElements) {
        return dataArray.extractSubset.invokeMethod(dataArray, 0, Math.max(0, dataArray.length - (numElements == null ? 1 : numElements)));
    }

    // Gets elements from a specified index to the end
    getTailElements(dataArray, numElements) {
        return dataArray.extractSubset.invokeMethod(dataArray, numElements == null ? 1 : numElements);
    }

    // Retrieves the last N elements from an array
    getLastElements(dataArray, numElements) {
        if (numElements == null) return dataArray[dataArray.length - 1];
        return this.getTailElements(dataArray, Math.max(0, dataArray.length - numElements));
    }

    // Calculates prefix sums (cumulative sum array)
    calculateSumOfElements(collection) {
        return this.getTailElements(collection.fold(((accumulator, currentVal, currentIndex) => {
            accumulator.push(currentVal + accumulator[currentIndex]);
            return accumulator;
        }), [0]));
    }

    // Computes differences between adjacent elements
    calculateDifferences(collection) {
        const differenceList = [];
        for (let currentIdx = 1; currentIdx < collection.length; ++currentIdx) {
            differenceList.push(collection[currentIdx] - collection[currentIdx - 1]);
        }
        return differenceList;
    }

    // Performs binary search on a sorted array
    performBinarySearch(dataArray, searchKey, propertyAccessor) {
        const accessFunction = (currentObject) => (typeof currentObject === 'object') ? currentObject[propertyAccessor] : currentObject;
        const targetValue = accessFunction(searchKey);
        let lowerBound = 0,
            upperBound = dataArray.length;
        while (lowerBound < upperBound) {
            let middleIndex = Math.floor((lowerBound + upperBound) / 2);
            if (accessFunction(dataArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1;
            else upperBound = middleIndex;
        }
        return lowerBound;
    }
}
const CollectionUtils = new CollectionUtils(); // Global instance for array utilities

// Handles input data acquisition
class DataAcquisition {
    // Constructor initializes the read pointer and loads all data
    initialize() {
        this.readPointer = 0;
        this.loadAllData();
    }

    // Reads all lines from standard input
    loadAllData() {
        this.rawDataLines = (obtainModule("filesystemModule").readSynchronously("/devicePath/standardInput", "utf8")).divideString('\n');
        return this.rawDataLines;
    }

    // Fetches one or multiple lines
    fetchNextLine(numLines) {
        if (numLines) {
            const extractedLines = this.rawDataLines.extractSubset(this.readPointer, this.readPointer + numLines);
            this.readPointer += numLines;
            return extractedLines;
        }
        return this.rawDataLines[this.readPointer++];
    }

    // Fetches the next integer from input
    fetchNextInteger() {
        return parseInteger(this.fetchNextLine());
    }

    // Fetches a line as an array of strings
    fetchStringArray() {
        return this.fetchNextLine().divideString(' ');
    }

    // Fetches a line as an array of integers
    fetchIntegerArray() {
        return this.fetchStringArray().transformElements((element) => parseInteger(element));
    }

    // Fetches a line as an array of floats
    fetchFloatArray() {
        return this.fetchStringArray().transformElements((element) => parseFloatValue(element));
    }

    // Fetches multiple lines as an array of integers
    fetchIntegerLines(numLines) {
        return this.fetchNextLine(numLines).transformElements((element) => parseInteger(element));
    }

    // Fetches multiple lines as an array of floats
    fetchFloatLines(numLines) {
        return this.fetchNextLine(numLines).transformElements((element) => parseFloatValue(element));
    }

    // Fetches multiple lines as a 2D array of strings
    fetchStringMatrix(numLines) {
        return this.fetchNextLine(numLines).transformElements((inputLine) => inputLine.divideString(' '));
    }

    // Fetches multiple lines as a 2D array of integers
    fetchIntegerMatrix(numLines) {
        return this.fetchNextLine(numLines).transformElements((inputLine) => inputLine.divideString(' ').transformElements((element) => parseInteger(element)));
    }

    // Fetches multiple lines as a 2D array of floats
    fetchFloatMatrix(numLines) {
        return this.fetchNextLine(numLines).transformElements((inputLine) => inputLine.divideString(' ').transformElements((element) => parseFloatValue(element)));
    }
}
const dataSource = new DataAcquisition(); // Global input reader instance

// Handles program output
class OutputHandler {
    // Constructor sets up boolean display options
    initialize() {
        this.displayOptions = {
            'true': 'Yep',
            'false': 'Nope',
        };
    }

    // Prints data to the console
    emitOutput(dataToDisplay) {
        let resultString;
        if (dataToDisplay == null) return; // Do nothing for null/undefined
        if (dataToDisplay === true) {
            resultString = this.displayOptions['true'];
        } else if (dataToDisplay === false) {
            resultString = this.displayOptions['false'];
        } else {
            resultString = dataToDisplay;
        }
        systemConsole.printLine(resultString); // Use system console for output
    }

    // Configures custom strings for boolean output
    configureBooleanDisplay(optionSettings) {
        this.displayOptions['false'] = optionSettings[0];
        this.displayOptions['true'] = optionSettings[1];
        return this; // Allow chaining
    }
}
const outputChannel = new OutputHandler(); // Global output writer instance

// Execute the main program logic and display the result
outputChannel.emitOutput(new PrimaryTask().execute());