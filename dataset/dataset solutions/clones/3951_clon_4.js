"use strict";
class DataExtractor {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') throw new Error('引数（stdin）を省略できません！');
        this.position = 0;
        this.tokens = sourceText.split(/\n|\s/);
    }
    fetchInteger() {
        return parseInt(this.tokens[this.position++], 10);
    }
    fetchIntegerArray(count) {
        if (typeof count === 'undefined') throw new Error('引数（1以上）を省略できません！');
        let result = new Array(count);
        for (let i = 0; i < count; i++) {
            result[i] = this.fetchInteger();
        }
        return result;
    }
    fetchString() {
        return this.tokens[this.position++];
    }
    fetchStringArray(count) {
        if (typeof count === 'undefined') throw new Error('引数（1以上）を省略できません！');
        let result = new Array(count);
        for (let i = 0; i < count; i++) {
            result[i] = this.fetchString();
        }
        return result;
    }
}

function ProcessInput(rawInput) {
    let parser = new DataExtractor(rawInput);
    let countA = parser.fetchInteger();
    let countB = parser.fetchInteger();

    const GRID_DIMENSION = 100;
    const HALF_GRID = GRID_DIMENSION / 2;

    // Initialize the grid using a functional approach
    let canvas = Array.from({ length: GRID_DIMENSION }, (_, rowIndex) =>
        Array.from({ length: GRID_DIMENSION }, () => (rowIndex < HALF_GRID ? '#' : '.'))
    );

    // Generator function to produce coordinates for pattern placement
    function* coordinateGenerator(initialX, initialY, totalPointsToPlace) {
        let currentX = initialX;
        let currentY = initialY;
        for (let i = 0; i < totalPointsToPlace; i++) {
            yield { x: currentX, y: currentY };
            currentX += 2;
            if (currentX >= GRID_DIMENSION) {
                currentX = 1;
                currentY += 3;
            }
        }
    }

    // Apply pattern for countA
    for (const point of coordinateGenerator(1, 1, countA - 1)) {
        canvas[point.y][point.x] = '.';
    }

    // Apply pattern for countB
    for (const point of coordinateGenerator(1, 51, countB - 1)) {
        canvas[point.y][point.x] = '#';
    }

    console.log(`${GRID_DIMENSION} ${GRID_DIMENSION}`);
    canvas.forEach(row => {
        console.log(row.join(''));
    });
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
