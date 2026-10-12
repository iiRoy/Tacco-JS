const fileSystem = require('fs');

const inscriptionParts = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const chamberHeight = Number(inscriptionParts[0]);
const chamberWidth = Number(inscriptionParts[1]);

let inscriptionIndex = 2;

const symbolGrid = Array.from(
    { length: chamberHeight },
    () => Array.from(
        { length: chamberWidth },
        () => inscriptionParts[inscriptionIndex++]
    )
);

let northernBorder = 0;
let southernBorder = chamberHeight - 1;
let westernBorder = 0;
let easternBorder = chamberWidth - 1;

const decodedSymbols = [];

while (
    northernBorder <= southernBorder &&
    westernBorder <= easternBorder
) {
    for (
        let horizontalPosition = westernBorder;
        horizontalPosition <= easternBorder;
        horizontalPosition++
    ) {
        decodedSymbols.push(
            symbolGrid[northernBorder][horizontalPosition]
        );
    }

    northernBorder++;

    for (
        let verticalPosition = northernBorder;
        verticalPosition <= southernBorder;
        verticalPosition++
    ) {
        decodedSymbols.push(
            symbolGrid[verticalPosition][easternBorder]
        );
    }

    easternBorder--;

    if (northernBorder <= southernBorder) {
        for (
            let horizontalPosition = easternBorder;
            horizontalPosition >= westernBorder;
            horizontalPosition--
        ) {
            decodedSymbols.push(
                symbolGrid[southernBorder][horizontalPosition]
            );
        }

        southernBorder--;
    }

    if (westernBorder <= easternBorder) {
        for (
            let verticalPosition = southernBorder;
            verticalPosition >= northernBorder;
            verticalPosition--
        ) {
            decodedSymbols.push(
                symbolGrid[verticalPosition][westernBorder]
            );
        }

        westernBorder++;
    }
}

console.log(decodedSymbols.join(' '));