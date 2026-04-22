"use strict";
var InputParser = (function() {
    function createParser(sourceString) {
        return new DataStream(sourceString);
    }
    function DataStream(inputContent) {
        this._lines = inputContent.trim().split("\n");
        this.readPosition = 0;
    }
    DataStream.prototype.getNextValue = function(returnRaw) {
        var lineData = this._lines,
            lineIndex = this.readPosition,
            tokenValue;
        if (typeof lineData[lineIndex] === "string")
            lineData[lineIndex] = lineData[lineIndex].split(" ").reverse();
        tokenValue = lineData[lineIndex].pop();
        if (!lineData[lineIndex].length)
            this.readPosition++;
        return returnRaw ? tokenValue : +tokenValue;
    };
    DataStream.prototype.getLineValues = function(rawStrings) {
        var lineTokens = this._lines[this.readPosition++].split(" ");
        return rawStrings ? lineTokens : lineTokens.map(item => +item);
    };
    DataStream.prototype.getMultiLineMatrix = function(numRows, rawOutput) {
        var matrixRows = this._lines.slice(this.readPosition, this.readPosition += numRows).map(row => row.split(" "));
        return rawOutput ? matrixRows : matrixRows.map(rowData => rowData.map(val => +val));
    };
    DataStream.prototype.getRawLines = function(numLines, returnRawLines) {
        var lineCollection = this._lines.slice(this.readPosition, this.readPosition += numLines);
        return returnRawLines ? lineCollection : lineCollection.map(eachLine => +eachLine);
    };
    return createParser;
})();

var inputReader = InputParser(require("node:fs").readFileSync("/dev/stdin", "utf8"));


function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        arrayCreationCode = "Array(args[" + --argCount + "]).fill(0).map( _ => { return " + initialValue + "; })";
    while (--argCount)
        arrayCreationCode = "Array(args[" + argCount + "]).fill(0).map( _ => " + arrayCreationCode + ")";
    return eval(arrayCreationCode);
}

var MAX_DIST_VAL = 1e15;

console.log(executeProgram());

function executeProgram() {
    var numVertices = inputReader.getNextValue();
    var numEdges = inputReader.getNextValue();
    var maxAllowedLength = inputReader.getNextValue();
    var connections = inputReader.getMultiLineMatrix(numEdges);
    var numQueries = inputReader.getNextValue();
    var pathQueries = inputReader.getMultiLineMatrix(numQueries);

    var distanceMatrix = createMultiDimArray(MAX_DIST_VAL, numVertices, numVertices);

    for (var vtxA = 0; vtxA < numVertices; vtxA++)
        distanceMatrix[vtxA][vtxA] = 0;

    for (var edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        distanceMatrix[connections[edgeIdx][0] - 1][connections[edgeIdx][1] - 1] = connections[edgeIdx][2];
        distanceMatrix[connections[edgeIdx][1] - 1][connections[edgeIdx][0] - 1] = connections[edgeIdx][2];
    }

    for (var interVtx = 0; interVtx < numVertices; interVtx++)
        for (var startVtx = 0; startVtx < numVertices; startVtx++)
            for (var endVtx = 0; endVtx < numVertices; endVtx++) {
                if (distanceMatrix[startVtx][interVtx] + distanceMatrix[interVtx][endVtx] < distanceMatrix[startVtx][endVtx])
                    distanceMatrix[startVtx][endVtx] = distanceMatrix[startVtx][interVtx] + distanceMatrix[interVtx][endVtx];
            }

    for (var vtxA = 0; vtxA < numVertices; vtxA++)
        for (var vtxB = 0; vtxB < numVertices; vtxB++) {
            if (distanceMatrix[vtxA][vtxB]) {
                if (maxAllowedLength < distanceMatrix[vtxA][vtxB])
                    distanceMatrix[vtxA][vtxB] = MAX_DIST_VAL;
                else
                    distanceMatrix[vtxA][vtxB] = 1;
            }
        }

    for (var interVtx = 0; interVtx < numVertices; interVtx++)
        for (var startVtx = 0; startVtx < numVertices; startVtx++)
            for (var endVtx = 0; endVtx < numVertices; endVtx++) {
                if (distanceMatrix[startVtx][interVtx] + distanceMatrix[interVtx][endVtx] < distanceMatrix[startVtx][endVtx])
                    distanceMatrix[startVtx][endVtx] = distanceMatrix[startVtx][interVtx] + distanceMatrix[interVtx][endVtx];
            }

    var outputValues = [];
    for (var queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        var calculatedDistance = distanceMatrix[pathQueries[queryIdx][0] - 1][pathQueries[queryIdx][1] - 1];
        if (calculatedDistance >= MAX_DIST_VAL)
            calculatedDistance = 0;
        outputValues.push(calculatedDistance - 1);
    }
    return outputValues.join("\n");
}