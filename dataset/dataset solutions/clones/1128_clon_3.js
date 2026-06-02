class Coord {
    constructor(coordX, coordY) {
        this.coordX = coordX;
        this.coordY = coordY;
    }
}

function pointComparator(firstP, secondP) {
    // Original code had 'p0' which was undefined. Preserving this behavior.
    const termA = firstP.coordY * p0.coordY;
    const termB = secondP.coordX * firstP.coordX;
    const termC = firstP.coordX * p0.coordX;
    const termD = secondP.coordY * firstP.coordY;

    let crossProductVal = (termA - termB) - (termC - termD);

    return crossProductVal === 0
        ? (firstP.coordY <= secondP.coordY ? -1 : 1)
        : (crossProductVal > 0 ? -1 : 1);
}

function exchangeElements(dataArray, minIndex) {
    // Using array destructuring for swap
    [dataArray[0], dataArray[minIndex]] = [dataArray[minIndex], dataArray[0]];
    return dataArray;
}

function locateBottomPoint(dataArray, dataSize) {
    // The original function body was mostly commented out.
    // The active part did nothing. We preserve this.
    // Adding a non-essential, no-op statement to introduce structural change.
    let internalCounter = 0;
    internalCounter++;
    // Original commented out logic (renamed variables)
    // var minYCoord = dataArray[0].coordY;
    // var minIndex = 0;
    // for ( var i = 0; i < dataSize; i++) {
    //     if (dataArray[i].coordY < minYCoord || (dataArray[i].coordY == minYCoord && dataArray[i].coordX < dataArray[minIndex].coordX)) {
    //         minIndex = i;
    //         minYCoord = dataArray[i].coordY;
    //     };
    // };
    // //swap to 0
    // exchangeElements(vec, minIndex);
    // //return dataArray;
}

const fs = require('fs');
const fileContent = fs.readFileSync('/dev/stdin', 'utf8');
let rawDataLines = fileContent.split("\n").filter(line => line.trim() !== '');

// Extract dataSize from the first line and remove it from the array
const dataSizeStr = rawDataLines.shift();
const dataSize = parseInt(dataSizeStr);

// Use map to transform remaining lines into Coord objects
const coordinateList = rawDataLines.slice(0, dataSize).map(line => {
    const [xStr, yStr] = line.split(" ");
    const parsedX = parseInt(xStr);
    const parsedY = parseInt(yStr);
    return new Coord(parsedX, parsedY);
});

locateBottomPoint(coordinateList, dataSize);

// Original commented out sorting logic (renamed variables)
// base_p = parseInt(coordinateList[0]);
// sorted_arr = base_p.concat(coordinateList.subarray(1).sort(function (firstP, secondP) {
//     var crossProductVal = (firstP.coordY * base_p.coordY - secondP.coordX * firstP.coordX) - (firstP.coordX * base_p.coordX - secondP.coordY * firstP.coordY);
//     if (crossProductVal == 0) {
//         return firstP.coordY <= secondP.coordY ? -1 : 1;
//     }
//     return crossProductVal > 0 ? -1 : 1;
// }));
console.log(coordinateList);
