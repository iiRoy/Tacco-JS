const printToConsole = console.log;

let dataRows = require('fs').readFileSync(0, 'utf8').split('\n');

let sizeInfo = dataRows[0].split(' ').map(Number);

let gridHeight = sizeInfo[0];
let gridWidth = sizeInfo[1];

const frameLine = '#'.repeat(gridWidth + 2);

printToConsole(frameLine);

for (let currentRow = 1; currentRow <= gridHeight;) {
  printToConsole(`#${dataRows[currentRow++]}#`);
}

printToConsole(frameLine);
