"use strict";

const processInput = ( inputString ) => {
    inputString = inputString
        .trim()
        .split("\n")
    ;

    const rowCount = parseInt(inputString[0].split(" ")[0]);
    const columnCount = parseInt(inputString[0].split(" ")[1]);

    const dataGrid = inputString.slice(1, rowCount + 1).map(currentLine => currentLine.split(" "));
    const columnLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    for ( let rowIterator = 0; rowIterator < rowCount; rowIterator++ ) {
        for ( let colIterator = 0; colIterator < columnCount; colIterator++ ) {
            if ( dataGrid[rowIterator][colIterator] === "snuke" ) {
                console.log(columnLetters[colIterator] + (parseInt(rowIterator) + 1));
                return;
            }
        }
    }
};

processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );