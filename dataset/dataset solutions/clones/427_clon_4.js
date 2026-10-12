const fs = require('fs');

const tokens = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const numberOfColumns = tokens.shift();
const surface = tokens.slice(0, numberOfColumns);

let westExplorer = 0;
let eastExplorer = surface.length - 1;

let westWall = 0;
let eastWall = 0;
let storedStardust = 0;

while (westExplorer <= eastExplorer) {
    const westHeight = surface[westExplorer];
    const eastHeight = surface[eastExplorer];

    if (westHeight <= eastHeight) {
        if (westHeight >= westWall) {
            westWall = westHeight;
        } else {
            storedStardust += westWall - westHeight;
        }

        westExplorer++;
    } else {
        if (eastHeight >= eastWall) {
            eastWall = eastHeight;
        } else {
            storedStardust += eastWall - eastHeight;
        }

        eastExplorer--;
    }
}

console.log(storedStardust);