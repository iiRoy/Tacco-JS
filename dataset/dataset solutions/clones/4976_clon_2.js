'use strict'

class Processor
{

    execute (  )
    {
        const numSequence = Array.from(  dataStream.fetchLine( )  ).reverse();
        let totalValue = 0;
        
        for (let iterCount = 0; iterCount < (1 << (numSequence.length - 1)); ++iterCount)
        {
            let tempVal = iterCount;
            let multiplier = 1;
            
            for (const element of numSequence)
            {
                totalValue += element * multiplier;
                
                multiplier = (tempVal & 1) ? (multiplier * 10) : 1;
                tempVal >>= 1;
            }
        }
        console.log(totalValue);
    }
}


class UtilityBelt {
    accumulate(  collection  ) { return collection.reduce( (curr, next) => curr + next ); }

    findMinimum(  collection, comparatorFn  ) {
        if (comparatorFn == null) { comparatorFn = (valA, valB) => valA - valB; }
        return collection.reduce( (valA, valB) => comparatorFn(valA, valB) < 0 ? valA : valB );
    }

    findMaximum(  collection, comparatorFn  ) {
        if (comparatorFn == null) { comparatorFn = (valA, valB) => valA - valB; }
        return collection.reduce( (valA, valB) => comparatorFn(valA, valB) > 0 ? valA : valB );
    }

    arrange(  collection, comparatorFn  ) {
        if (comparatorFn == null) { comparatorFn = (valA, valB) => valA - valB; }
        return collection.sort(comparatorFn);
    }

    generateSequence(  begin, end, increment  ) {
        if (end == null) {
            end = begin || 0;
            begin = 0;
        }
        if (!increment) {
            increment = end < begin ? -1 : 1;
        }
        const seqLength = Math.max(Math.ceil((end - begin) / increment), 0);
        const generatedArray = Array(seqLength);

        for (var indexPos = 0; indexPos < seqLength; indexPos++, begin += increment) {
            generatedArray[indexPos] = begin;
        }
        return generatedArray;
    }

    getHead(  dataArray, count  ) {
        if (dataArray == null || dataArray.length < 1) return count == null ? void 0 : [];
        if (count == null) return dataArray[0];
        return this.getInitial(dataArray, dataArray.length - count);
    }

    getInitial(  dataArray, count  ) {
        return dataArray.slice.call(dataArray, 0, Math.max(0, dataArray.length - (count == null ? 1 : count)));
    }

    getTail(  dataArray, count  ) {
        return dataArray.slice.call(dataArray, count == null ? 1 : count);
    }

    getEnd(  dataArray, count  ) {
        if (count == null) return dataArray[dataArray.length - 1];
        return this.getTail(dataArray, Math.max(0, dataArray.length - count));
    }

    computePrefixSums(  collection  ) {
        return this.getTail(collection.reduce(((results, currentVal, idx) => {
            results.push(currentVal + results[idx]);
            return results;
        }), [0]));
    }

    performBinarySearch(  dataArray, targetKey, propertyAccessor  ) {
        const accessorFunc = (itemObject) => (typeof itemObject === 'object') ? itemObject[propertyAccessor] : itemObject;
        const searchVal = accessorFunc(targetKey);
        let lowerBound = 0, upperBound = dataArray.length;
        while (lowerBound < upperBound) {
            let middleIndex = Math.floor((lowerBound + upperBound) / 2);
            if (accessorFunc(dataArray[middleIndex]) < searchVal) lowerBound = middleIndex + 1;
            else upperBound = middleIndex;
        }
        return lowerBound;
    }
}
const util = new UtilityBelt();


class DataFetcher {
    constructor(  ) {
        this.positionPointer = 0;
        this.loadAllData();
    }

    loadAllData(  ) {
        this.rawData = (require("node:fs").readFileSync("/dev/stdin", "utf8")).split('\n');
        return this.rawData;
    }


    fetchNextLine(  lineCount  ) {
        if (lineCount) {
            const resultLines = this.rawData.slice(this.positionPointer, this.positionPointer + lineCount);
            this.positionPointer += lineCount;
            return resultLines;
        }
        return this.rawData[this.positionPointer++];
    }

    fetchNextInteger(  ) { return parseInt(this.fetchNextLine()); }

    fetchNextStringArray(  ) { return this.fetchNextLine().split(' '); }

    fetchNextIntegerArray(  ) { return this.fetchNextStringArray().map((elementStr) => parseInt(elementStr)); }

    fetchNextDecimalArray(  ) { return this.fetchNextStringArray().map((elementStr) => parseFloat(elementStr)); }

    fetchIntegerLines(  lineCount  ) { return this.fetchNextLine(lineCount).map((elementStr) => parseInt(elementStr)); }

    fetchDecimalLines(  lineCount  ) { return this.fetchNextLine(lineCount).map((elementStr) => parseFloat(elementStr)); }

    fetchStringMatrix(  lineCount  ) { return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' ')); }

    fetchIntegerMatrix(  lineCount  ) {
        return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((elementStr) => parseInt(elementStr)));
    }

    fetchDecimalMatrix(  lineCount  ) {
        return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((elementStr) => parseFloat(elementStr)));
    }
}

const dataStream = new DataFetcher();


const OutputHandler = (  dataToDisplay  ) => {
    let finalOutput;
    if (dataToDisplay == null) return;
    if (dataToDisplay === true) {
        finalOutput = 'Yes';
    }
    else if (dataToDisplay === false) {
        finalOutput = 'No';
    }
    else {
        finalOutput = dataToDisplay;
    }
    console.log(finalOutput);
};


OutputHandler(  new Processor().execute()  );