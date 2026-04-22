class TacticalArena {
    constructor(fieldHeight, fieldWidth, initialCellLayout, unitPlacement, unitFacing) {
        this.fieldDimension = { vertical: fieldHeight, horizontal: fieldWidth };
        this.combatUnit = {
            verticalAxis: unitPlacement.row,
            horizontalAxis: unitPlacement.col,
            orientation: unitFacing
        };
        this.gridElements = new Map(); // Stores "row_col" -> character

        // Initialize the grid including external boundaries
        for (let rIdx = 0; rIdx < fieldHeight + 2; rIdx++) {
            for (let cIdx = 0; cIdx < fieldWidth + 2; cIdx++) {
                if (rIdx === 0 || rIdx === fieldHeight + 1 || cIdx === 0 || cIdx === fieldWidth + 1) {
                    this.gridElements.set(`${rIdx}_${cIdx}`, '#'); // Perimeter walls
                } else {
                    this.gridElements.set(`${rIdx}_${cIdx}`, initialCellLayout[rIdx - 1][cIdx - 1]);
                }
            }
        }
        // Place the combat unit at its determined location
        this.gridElements.set(`${this.combatUnit.verticalAxis}_${this.combatUnit.horizontalAxis}`, this.combatUnit.orientation);
    }

    // Static map for directional vectors
    static directionalVectors = new Map([
        ['U', { vDelta: -1, hDelta: 0 }],
        ['D', { vDelta: 1, hDelta: 0 }],
        ['L', { vDelta: 0, hDelta: -1 }],
        ['R', { vDelta: 0, hDelta: 1 }]
    ]);

    // Retrieve content of a specific grid cell
    retrieveCellContent(rCoord, cCoord) {
        return this.gridElements.get(`${rCoord}_${cCoord}`);
    }

    // Modify content of a specific grid cell
    updateCellContent(rCoord, cCoord, value) {
        this.gridElements.set(`${rCoord}_${cCoord}`, value);
    }

    // Recursive function to simulate projectile trajectory
    propagateProjectile(verticalDisplacement, horizontalDisplacement, currentVertical, currentHorizontal) {
        const nextVertical = currentVertical + verticalDisplacement;
        const nextHorizontal = currentHorizontal + horizontalDisplacement;
        const targetCellContent = this.retrieveCellContent(nextVertical, nextHorizontal);

        if (targetCellContent === '#') {
            return; // Projectile hits a wall, terminates
        } else if (targetCellContent === '*') {
            this.updateCellContent(nextVertical, nextHorizontal, '.'); // Projectile hits a target, clears it
            return;
        } else {
            // Projectile continues its path
            this.propagateProjectile(verticalDisplacement, horizontalDisplacement, nextVertical, nextHorizontal);
        }
    }

    // Process a single command received by the combat unit
    processCommand(instruction) {
        if (instruction === 'S') {
            const currentUnitBearing = this.combatUnit.orientation;
            const movementDeltas = TacticalArena.directionalVectors.get(currentUnitBearing);
            if (movementDeltas) {
                this.propagateProjectile(
                    movementDeltas.vDelta,
                    movementDeltas.hDelta,
                    this.combatUnit.verticalAxis,
                    this.combatUnit.horizontalAxis
                );
            }
        } else { // Movement command
            const movementDeltas = TacticalArena.directionalVectors.get(instruction);
            if (movementDeltas) {
                const destinationVertical = this.combatUnit.verticalAxis + movementDeltas.vDelta;
                const destinationHorizontal = this.combatUnit.horizontalAxis + movementDeltas.hDelta;
                const destinationElement = this.retrieveCellContent(destinationVertical, destinationHorizontal);

                // Always update the unit's facing direction
                this.updateCellContent(this.combatUnit.verticalAxis, this.combatUnit.horizontalAxis, instruction);
                this.combatUnit.orientation = instruction;

                if (destinationElement === '.') {
                    // If destination is empty, move the unit
                    this.updateCellContent(this.combatUnit.verticalAxis, this.combatUnit.horizontalAxis, '.'); // Clear old position
                    this.combatUnit.verticalAxis = destinationVertical;
                    this.combatUnit.horizontalAxis = destinationHorizontal;
                    this.updateCellContent(this.combatUnit.verticalAxis, this.combatUnit.horizontalAxis, instruction); // Place unit at new position
                }
            }
        }
    }

    // Generate the textual representation of the arena for output
    generateOutputLayout() {
        let outputLines = [];
        for (let rIdx = 1; rIdx <= this.fieldDimension.vertical; rIdx++) {
            let currentLineCharacters = [];
            for (let cIdx = 1; cIdx <= this.fieldDimension.horizontal; cIdx++) {
                currentLineCharacters.push(this.retrieveCellContent(rIdx, cIdx));
            }
            outputLines.push(currentLineCharacters.join(''));
        }
        return outputLines.join('\n')
            .replace(/U/g, '^')
            .replace(/D/g, 'v')
            .replace(/L/g, '<')
            .replace(/R/g, '>');
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedInputData = rawInputData
    .replace(/\^/g, "U")
    .replace(/v/g, "D")
    .replace(/\</g, "L")
    .replace(/\>/g, "R");

let inputLineSegments = processedInputData.trim().split("\n");
const totalScenarioCount = parseInt(inputLineSegments.shift(), 10);

const allScenarioOutcomes = [];

for (let currentScenarioIndex = 0; currentScenarioIndex < totalScenarioCount; currentScenarioIndex++) {
    if (currentScenarioIndex !== 0) {
        allScenarioOutcomes.push(""); // Add an empty line for separation
    }

    const dimensionParameters = inputLineSegments.shift().split(" ").map(Number);
    const arenaHeight = dimensionParameters[0];
    const arenaWidth = dimensionParameters[1];

    let initialMapLayout = [];
    let unitStartingPosition = { row: 0, col: 0 }; // 0-indexed relative to inner grid
    let unitStartingOrientation = '';

    for (let currentGridRow = 0; currentGridRow < arenaHeight; currentGridRow++) {
        const lineCharacters = inputLineSegments.shift().split("");
        const unitColumnPosition = lineCharacters.findIndex(cellChar => ['U', 'D', 'L', 'R'].includes(cellChar));
        if (unitColumnPosition !== -1) {
            unitStartingPosition = { row: currentGridRow, col: unitColumnPosition };
            unitStartingOrientation = lineCharacters[unitColumnPosition];
        }
        initialMapLayout.push(lineCharacters);
    }
    inputLineSegments.shift(); // Consume the empty line after the grid layout
    const commandSequence = inputLineSegments.shift().split("");

    // Instantiate the tactical arena for the current scenario
    const activeArena = new TacticalArena(
        arenaHeight,
        arenaWidth,
        initialMapLayout,
        { row: unitStartingPosition.row + 1, col: unitStartingPosition.col + 1 }, // Adjust to 1-indexed for arena's internal grid
        unitStartingOrientation
    );

    // Execute all commands for the current scenario
    commandSequence.forEach(command => activeArena.processCommand(command));

    // Store the resulting layout
    allScenarioOutcomes.push(activeArena.generateOutputLayout());
}

console.log(allScenarioOutcomes.join('\n'));