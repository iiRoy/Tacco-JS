const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const platformAmount = transmission.shift();
const skyline = transmission.slice(0, platformAmount);

skyline.push(0);

const increasingTowers = [];

let optimalSurface = 0;
let currentPosition = 0;

while (currentPosition < skyline.length) {
    while (
        increasingTowers.length > 0 &&
        skyline[
            increasingTowers[increasingTowers.length - 1]
        ] > skyline[currentPosition]
    ) {
        const towerPosition = increasingTowers.pop();
        const usableHeight = skyline[towerPosition];

        const previousSmallerPosition =
            increasingTowers.length === 0
                ? -1
                : increasingTowers[
                    increasingTowers.length - 1
                ];

        const usableWidth =
            currentPosition -
            previousSmallerPosition -
            1;

        const generatedSurface =
            usableHeight * usableWidth;

        if (generatedSurface > optimalSurface) {
            optimalSurface = generatedSurface;
        }
    }

    increasingTowers.push(currentPosition);
    currentPosition++;
}

console.log(optimalSurface);