const fileSystem = require('fs');

class InputProcessor {
    constructor(rawContent) {
        this.lines = rawContent.trim().split('\n');
        this.currentIndex = 0;
    }

    fetchNext() {
        if (this.currentIndex < this.lines.length) {
            return this.lines[this.currentIndex++];
        }
        return undefined;
    }
}

const sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataStream = new InputProcessor(sourceData);

function processInputSegment(stream) {
    const headerLine = stream.fetchNext();

    if (headerLine === undefined) {
        return;
    }

    const parts = headerLine.split(' ');
    const firstComponent = parts[0];
    const secondComponent = parts[1];

    if (firstComponent === '0' && secondComponent === '0') {
        return;
    }

    const countA = parseInt(firstComponent, 10);
    const countB = parseInt(secondComponent, 10);

    const valuesA = Array.from({ length: countA }, () => parseInt(stream.fetchNext(), 10));

    const valuesB = Array.from({ length: countB }, () => parseInt(stream.fetchNext(), 10));

    processInputSegment(stream);
}

processInputSegment(dataStream);
