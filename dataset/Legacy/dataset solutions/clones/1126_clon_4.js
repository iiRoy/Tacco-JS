const Point = class {
    constructor(xCoord, yCoord) {
        Object.defineProperties(this, {
            x: { value: xCoord, writable: true, enumerable: true, configurable: true },
            y: { value: yCoord, writable: true, enumerable: true, configurable: true }
        });
    }
};

const { readFileSync } = require('fs');

const processInput = () => {
    const sourceContent = readFileSync('/dev/stdin', 'utf8');
    const linesArray = sourceContent.split('\n').filter(Boolean);

    const totalEntries = Number(linesArray.shift());

    const coordinateSet = linesArray.reduce((accumulator, currentLine) => {
        const [xComponent, yComponent] = currentLine.split(' ').map(Number);
        accumulator.push(new Point(xComponent, yComponent));
        return accumulator;
    }, []);

    return coordinateSet;
};

const finalCollection = processInput();
console.log(finalCollection);
