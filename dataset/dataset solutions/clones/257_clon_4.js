const { createInterface } = require('readline');

class JourneyMapper {
    constructor() {
        this.config = {};
        this.terrain = [];
        this.inputStage = 0;
        this.rawGridEntries = [];
    }

    ingestLine(entryContent) {
        if (entryContent === "0") {
            this.inputStage = -1; // Signal end of input
            return;
        }

        if (this.inputStage < 4) {
            const parameterNames = ["width", "origin", "terminus", "depth"];
            this.config[parameterNames[this.inputStage]] = parseInt(entryContent);
            this.inputStage++;
            return;
        }
        
        this.rawGridEntries.push(entryContent);
    }

    // Transforms raw grid entries into the internal terrain matrix
    assembleTerrain() {
        this.config.origin -= 1; // Adjust to 0-indexed
        this.config.terminus -= 1; // Adjust to 0-indexed

        this.terrain = this.rawGridEntries.map(rowString => {
            let columnEffects = [];
            let barPresence = []; // Stores 0 or 1 from input string, indicating bar to the right

            for (let k = 0; k < this.config.width - 1; k++) {
                barPresence.push(parseInt(rowString.charAt(k)));
            }

            for (let k = 0; k < this.config.width; k++) {
                if (k < this.config.width - 1 && barPresence[k] === 1) {
                    columnEffects.push(1); // Bar moves to the right
                } else if (k > 0 && barPresence[k - 1] === 1) {
                    columnEffects.push(-1); // Bar moves to the left (from previous column)
                } else {
                    columnEffects.push(0); // No horizontal movement
                }
            }
            return columnEffects;
        });
    }

    // Generator function for tracing paths through the terrain
    *traverseJourney(initialCol, startingRow, ascending = true) {
        let currentColumn = initialCol;
        yield currentColumn; // Yield the starting column

        const verticalStep = ascending ? 1 : -1;
        const terminationRow = ascending ? this.config.depth : -1;

        for (let currentRow = startingRow;
             (ascending ? currentRow < terminationRow : currentRow >= 0);
             currentRow += verticalStep) {

            currentColumn += this.terrain[currentRow][currentColumn];
            yield currentColumn;
        }
    }

    executeAnalysis() {
        this.assembleTerrain();

        const primaryProgression = Array.from(this.traverseJourney(this.config.origin, 0, true));
        if (primaryProgression[primaryProgression.length - 1] === this.config.terminus) {
            return "0"; // Path already exists
        }

        const inverseProgression = Array.from(this.traverseJourney(this.config.terminus, this.config.depth - 1, false)).reverse();

        for (let level = 0; level < this.config.depth; level++) {
            const primaryPosition = primaryProgression[level];
            const inversePosition = inverseProgression[level];

            if (Math.abs(primaryPosition - inversePosition) === 1 &&
                this.terrain[level][primaryPosition] === 0 &&
                this.terrain[level][inversePosition] === 0) {
                
                return (level + 1) + " " + (Math.min(primaryPosition, inversePosition) + 1);
            }
        }

        return "1"; // No simple augmentation possible
    }
}

const systemMapper = new JourneyMapper();

const streamProcessor = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

streamProcessor.on('line', (entry) => {
    systemMapper.ingestLine(entry);
});

streamProcessor.on('close', () => {
    console.log(systemMapper.executeAnalysis());
});