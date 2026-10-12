'use strict'
const parseNumeric = parseInt;

class Solver {
    computeResult() {
        const dimParams = dataReader.readIntegerArray();
        const numItems = dimParams[0], blockDim = dimParams[1];
        const doubleBlockDim = 2 * blockDim;

        const coordSet = dataReader.fetchStringMatrix(numItems).map(pointEntry => {
            return {
                coordX: (parseNumeric(pointEntry[0]) + (pointEntry[2] === 'B' ? blockDim : 0)) % doubleBlockDim,
                coordY: parseNumeric(pointEntry[1]) % doubleBlockDim,
            };
        });

        const spatialMap = SpatialGrid.createFrom(coordSet);

        const assignColor = (coordX, coordY) => (coordX < blockDim ? 0 : 1) ^ (coordY < blockDim ? 0 : 1);
        let currentCount = coordSet.filter(element => assignColor(element.coordX, element.coordY) === 0).length;
        let overallMax = currentCount;

        for (let verticalShift = 0; verticalShift < blockDim; ++verticalShift) {
            const temporaryCounts = [];
            for (let horizontalShift = 0; horizontalShift < doubleBlockDim; ++horizontalShift) {
                const wrappedHorizontalShift = horizontalShift + ((horizontalShift + blockDim) >= doubleBlockDim ? -blockDim : blockDim);
                
                overallMax = Math.max(overallMax, currentCount);

                temporaryCounts[horizontalShift] = temporaryCounts[horizontalShift] ? temporaryCounts[horizontalShift] : spatialMap.queryRangeCount(horizontalShift, verticalShift, horizontalShift, verticalShift + blockDim);
                temporaryCounts[wrappedHorizontalShift] = temporaryCounts[wrappedHorizontalShift] ? temporaryCounts[wrappedHorizontalShift] : spatialMap.queryRangeCount(wrappedHorizontalShift, verticalShift, wrappedHorizontalShift, verticalShift + blockDim);

                const whiteLeft = temporaryCounts[horizontalShift];
                const blackLeft = spatialMap.countElements('coordX', horizontalShift) - whiteLeft;
                const whiteRight = temporaryCounts[wrappedHorizontalShift];
                const blackRight = spatialMap.countElements('coordX', wrappedHorizontalShift) - whiteRight;
                
                currentCount += (-whiteLeft + blackLeft) + (+whiteRight - blackRight);
            }
            
            while (verticalShift < blockDim && spatialMap.countElements('coordY', verticalShift) === 0 && spatialMap.countElements('coordY', verticalShift + blockDim) === 0) {
                ++verticalShift;
            }
            if (verticalShift === blockDim) {
                break;
            }

            const whiteSegmentLeft = spatialMap.queryRangeCount(0, verticalShift, blockDim, verticalShift);
            const blackSegmentLeft = spatialMap.countElements('coordY', verticalShift) - whiteSegmentLeft;
            const whiteSegmentRight = spatialMap.queryRangeCount(0, verticalShift + blockDim, blockDim, verticalShift + blockDim);
            const blackSegmentRight = spatialMap.countElements('coordY', verticalShift + blockDim) - whiteSegmentRight;
            
            currentCount += (-whiteSegmentLeft + blackSegmentLeft) + (+whiteSegmentRight - blackSegmentRight);
        }
        return overallMax;
    }
}

class SpatialGrid {
    static get StandardAxes() {
        return ['coordX', 'coordY'];
    }
    static get DefaultSortingCriteria() {
        return { 'coordX': (itemA, itemB) => itemA.coordY - itemB.coordY, 'coordY': (itemA, itemB) => itemA.coordX - itemB.coordX };
    }
    static createFrom(dataList, extraAxes, extraSortRules) {
        return new SpatialGrid().initializeStructure(dataList, extraAxes, extraSortRules);
    }
    countElements(axisLabel, indexValue) {
        return this.indexedCollections[axisLabel][indexValue] == null ? 0 : this.indexedCollections[axisLabel][indexValue].length;
    }
    initializeStructure(dataList, extraAxes, extraSortRules) {
        if (extraAxes == null) {
            extraAxes = [];
        }
        if (extraSortRules == null) {
            extraSortRules = {};
        }
        this.axisLabels = SpatialGrid.StandardAxes.concat(extraAxes);
        this.sortingRules = Object.assign(SpatialGrid.DefaultSortingCriteria, extraSortRules);
        this.indexedCollections = {};
        
        this.axisLabels.forEach(axisLabel => {
            this.indexedCollections[axisLabel] = {};
        });
        
        dataList.forEach(element => {
            this.axisLabels.forEach(axisLabel => {
                if (this.indexedCollections[axisLabel][element[axisLabel]] === undefined) {
                    this.indexedCollections[axisLabel][element[axisLabel]] = [];
                }
                this.indexedCollections[axisLabel][element[axisLabel]].push(element);
            });
        });
        
        this.axisLabels.forEach(axisLabel => {
            const axisElements = this.indexedCollections[axisLabel];
            for (const currentKey in axisElements) {
                axisElements[currentKey].sort(this.sortingRules[axisLabel]);
            }
        });
        return this;
    }

    retrievePoint(coordX, coordY) {
        const insertionIndex = util.findSortedIndex(this.indexedCollections.coordX[coordX], coordY, 'coordY');
        if (this.indexedCollections.coordX[insertionIndex] == null || this.indexedCollections.coordX[insertionIndex].coordY !== coordY) {
            return null;
        }
        return this.indexedCollections.coordX[insertionIndex];
    }

    queryRangeCount(coordX1, coordY1, coordX2, coordY2) {
        if (coordX1 === coordX2) {
            if (this.indexedCollections.coordX[coordX1] == null) return 0;
            const leftIndex = util.findSortedIndex(this.indexedCollections.coordX[coordX1], coordY1, 'coordY');
            const rightIndex = util.findSortedIndex(this.indexedCollections.coordX[coordX1], coordY2, 'coordY');
            return rightIndex - leftIndex;
        }
        if (coordY1 === coordY2) {
            if (this.indexedCollections.coordY[coordY1] == null) return 0;
            const leftIndex = util.findSortedIndex(this.indexedCollections.coordY[coordY1], coordX1, 'coordX');
            const rightIndex = util.findSortedIndex(this.indexedCollections.coordY[coordY1], coordX2, 'coordX');
            return rightIndex - leftIndex;
        }
        return -1;
    }

    retrievePointsInRegion(coordX1, coordY1, coordX2, coordY2) {
        if (coordX1 === coordX2) {
            const collectedPoints = [];
            if (this.indexedCollections.coordX[coordX1] == null) return collectedPoints;
            const leftIdx = util.findSortedIndex(this.indexedCollections.coordX[coordX1], coordY1, 'coordY');
            const rightIdx = util.findSortedIndex(this.indexedCollections.coordX[coordX1], coordY2, 'coordY');
            for (let i = leftIdx; i < rightIdx; ++i) {
                collectedPoints.push(this.indexedCollections.coordY[i]);
            }
            return collectedPoints;
        }
        if (coordY1 === coordY2) {
            const collectedPoints = [];
            if (this.indexedCollections.coordY[coordY1] == null) return collectedPoints;
            const leftIdx = util.findSortedIndex(this.indexedCollections.coordY[coordY1], coordX1, 'coordX');
            const rightIdx = util.findSortedIndex(this.indexedCollections.coordY[coordY1], coordX2, 'coordX');
            for (let i = leftIdx; i < rightIdx; ++i) {
                collectedPoints.push(this.indexedCollections.coordX[i]);
            }
            return collectedPoints;
        }
        return -1;
    }
}

class ModularArithmetic {
    constructor(modulusVal) {
        if (modulusVal == null) {
            modulusVal = 1000000007;
        }
        this.modulusVal = modulusVal;
    }
    multiplyMod(valA, valB) {
        let product = 0;
        valA %= this.modulusVal;
        valB %= this.modulusVal;
        while (valB) {
            if (valB & 1) {
                product += valA;
                if (product > this.modulusVal) {
                    product -= this.modulusVal;
                }
            }
            valA <<= 1;
            if (valA > this.modulusVal) {
                valA -= this.modulusVal;
            }
            valB >>= 1;
        }
        return product;
    }
    powerMod(baseVal, exponentVal) {
        let result = 1;
        while (exponentVal) {
            if (exponentVal & 1) {
                result = this.multiplyMod(result, baseVal);
            }
            baseVal = this.multiplyMod(baseVal, baseVal);
            exponentVal >>= 1;
        }
        return result;
    }
    divideMod(numerator, denominator) {
        return this.multiplyMod(numerator, this.powerMod(denominator, this.modulusVal - 2));
    }
    combinationsMod(totalN, chooseK) {
        return this.multiplyMod(globalThis.factTable[totalN], this.multiplyMod(globalThis.invFactTable[chooseK], globalThis.invFactTable[totalN - chooseK]));
    }
}
const MOD_OPERATOR = new ModularArithmetic(1000000007);

class UtilityFunctions {
    calculateSum(numericArray) {
        return numericArray.reduce((acc, current) => acc + current);
    }
    calculateModSum(numericArray, modulusValue) {
        if (modulusValue == null) {
            modulusValue = MOD_OPERATOR.modulusVal;
        }
        return numericArray.reduce((acc, current) => (acc + current) % modulusValue);
    }
    findMinimum(valueArray, comparisonFn) {
        if (comparisonFn == null) {
            comparisonFn = (a, b) => a - b;
        }
        return valueArray.reduce((minVal, currentVal) => comparisonFn(minVal, currentVal) < 0 ? minVal : currentVal);
    }
    findMaximum(valueArray, comparisonFn) {
        if (comparisonFn == null) {
            comparisonFn = (a, b) => a - b;
        }
        return valueArray.reduce((maxVal, currentVal) => comparisonFn(maxVal, currentVal) > 0 ? maxVal : currentVal);
    }
    sortArray(targetArray, comparisonFn) {
        if (comparisonFn == null) {
            comparisonFn = (a, b) => a - b;
        }
        return targetArray.sort(comparisonFn);
    }
    uniqueElements(targetArray) {
        targetArray.sort();
        for (let i = 0; i < targetArray.length - 1; ++i) {
            if (targetArray[i + 1] === targetArray[i]) {
                targetArray[i] = null;
            }
        }
        return targetArray.filter(item => item != null);
    }
    generateRange(startValue, stopValue, stepSize) {
        if (stopValue == null) {
            stopValue = startValue || 0;
            startValue = 0;
        }
        if (!stepSize) {
            stepSize = stopValue < startValue ? -1 : 1;
        }
        const rangeLength = Math.max(Math.ceil((stopValue - startValue) / stepSize), 0);
        const generatedRange = Array(rangeLength);
        for (let index = 0; index < rangeLength; index++, startValue += stepSize) {
            generatedRange[index] = startValue;
        }
        return generatedRange;
    }
    getFirstElements(sourceArray, countN) {
        if (sourceArray == null || sourceArray.length < 1) return countN == null ? undefined : [];
        if (countN == null) return sourceArray[0];
        return this.getInitialSegment(sourceArray, sourceArray.length - countN);
    }
    getInitialSegment(sourceArray, countN) {
        return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (countN == null ? 1 : countN)));
    }
    getTailSegment(sourceArray, countN) {
        return sourceArray.slice.call(sourceArray, countN == null ? 1 : countN);
    }
    getLastElements(sourceArray, countN) {
        if (countN == null) return sourceArray[sourceArray.length - 1];
        return this.getTailSegment(sourceArray, Math.max(0, sourceArray.length - countN));
    }
    cumulativeSumArray(sourceArray) {
        return this.getTailSegment(sourceArray.reduce(((accumulator, currentValue, currentIndex) => {
            accumulator.push(currentValue + accumulator[currentIndex]);
            return accumulator;
        }), [0]));
    }
    differenceArray(sourceArray) {
        const diffs = [];
        for (let i = 1; i < sourceArray.length; ++i) {
            diffs.push(sourceArray[i] - sourceArray[i - 1]);
        }
        return diffs;
    }
    findSortedIndex(sortedArray, targetValue, keyExtractor) {
        const extractFunc = (itemObject) => (typeof itemObject === 'object') ? itemObject[keyExtractor] : itemObject;
        const valueToSearch = extractFunc(targetValue);
        let lowerBound = 0, upperBound = sortedArray.length;
        while (lowerBound < upperBound) {
            let middleIndex = (lowerBound + upperBound) >> 1;
            if (extractFunc(sortedArray[middleIndex]) < valueToSearch) {
                lowerBound = middleIndex + 1;
            } else {
                upperBound = middleIndex;
            }
        }
        return lowerBound;
    }
}
const util = new UtilityFunctions();

class InputHandler {
    constructor() {
        this.readPointer = 0;
        this.readAllInput();
    }

    readAllInput() {
        this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
        return this.inputLines;
    }

    fetchLine(numLines) {
        if (numLines) {
            const fetchedSegment = this.inputLines.slice(this.readPointer, this.readPointer + numLines);
            this.readPointer += numLines;
            return fetchedSegment;
        }
        return this.inputLines[this.readPointer++];
    }
    fetchInt() {
        return parseNumeric(this.fetchLine());
    }
    fetchStringArray() {
        return this.fetchLine().split(' ');
    }
    fetchIntArray() {
        return this.fetchStringArray().map((element) => parseNumeric(element));
    }
    fetchFloatArray() {
        return this.fetchStringArray().map((element) => parseFloat(element));
    }
    fetchIntLines(numLines) {
        return this.fetchLine(numLines).map((element) => parseNumeric(element));
    }
    fetchFloatLines(numLines) {
        return this.fetchLine(numLines).map((element) => parseFloat(element));
    }
    fetchStringMatrix(numLines) {
        return this.fetchLine(numLines).map((lineEntry) => lineEntry.split(' '));
    }
    fetchIntMatrix(numLines) {
        return this.fetchLine(numLines).map((lineEntry) => lineEntry.split(' ').map((element) => parseNumeric(element)));
    }
    fetchFloatMatrix(numLines) {
        return this.fetchLine(numLines).map((lineEntry) => lineEntry.split(' ').map((element) => parseFloat(element)));
    }
}
const dataReader = new InputHandler();

class OutputWriter {
    constructor() {
        this.outputOptions = {
            'true': 'Yep',
            'false': 'Nope',
        };
    }
    displayResult(outputValue) {
        let finalOutput;
        if (outputValue == null) return;
        if (outputValue === true) {
            finalOutput = this.outputOptions['true'];
        } else if (outputValue === false) {
            finalOutput = this.outputOptions['false'];
        } else {
            finalOutput = outputValue;
        }
        console.log(finalOutput);
    }
    setBooleanOptions(booleanStrings) {
        this.outputOptions['false'] = booleanStrings[0];
        this.outputOptions['true'] = booleanStrings[1];
        return this;
    }
}
const resultPrinter = new OutputWriter();

resultPrinter.displayResult(new Solver().computeResult());