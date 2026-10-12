const DIRECTION_VECTORS = {
    'U': { dr: -1, dc: 0 },
    'D': { dr: 1, dc: 0 },
    'L': { dr: 0, dc: -1 },
    'R': { dr: 0, dc: 1 }
};

const INPUT_CHAR_MAP = {
    '^': 'U',
    'v': 'D',
    '<': 'L',
    '>': 'R'
};

const OUTPUT_CHAR_MAP = {
    'U': '^',
    'D': 'v',
    'L': '<',
    'R': '>'
};

function applyReplacements(text, map) {
    let result = text;
    for (const key in map) {
        result = result.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), map[key]);
    }
    return result;
}

function moveTank(tank, map, newOrientation) {
    const { dr, dc } = DIRECTION_VECTORS[newOrientation];
    const nextRow = tank.row + dr;
    const nextCol = tank.col + dc;
    const targetCellKey = `${nextRow},${nextCol}`;
    const targetCellContent = map.get(targetCellKey);

    if (targetCellContent === '.') {
        map.set(`${tank.row},${tank.col}`, '.');
        tank.row = nextRow;
        tank.col = nextCol;
        tank.orientation = newOrientation;
        map.set(targetCellKey, newOrientation);
    } else {
        tank.orientation = newOrientation;
        map.set(`${tank.row},${tank.col}`, newOrientation);
    }
}

function fireProjectile(tank, map) {
    const { dr, dc } = DIRECTION_VECTORS[tank.orientation];

    function* projectilePath(startR, startC, deltaR, deltaC) {
        let currentR = startR + deltaR;
        let currentC = startC + deltaC;
        while (true) {
            yield { r: currentR, c: currentC };
            currentR += deltaR;
            currentC += deltaC;
        }
    }

    for (const { r, c } of projectilePath(tank.row, tank.col, dr, dc)) {
        const cellKey = `${r},${c}`;
        const cellContent = map.get(cellKey);

        if (cellContent === '#') {
            break;
        } else if (cellContent === '*') {
            map.set(cellKey, '.');
            break;
        }
    }
}

function executeBattle(scenarioLines) {
    let lineIndex = 0;

    const [gridHeight, gridWidth] = scenarioLines[lineIndex++].split(" ").map(Number);

    const terrainMap = new Map();
    let currentTank = { row: 0, col: 0, orientation: '' };

    for (let c = 0; c <= gridWidth + 1; c++) {
        terrainMap.set(`0,${c}`, '#');
    }

    for (let r = 1; r <= gridHeight; r++) {
        const rowContent = scenarioLines[lineIndex++];
        terrainMap.set(`${r},0`, '#');
        for (let c = 1; c <= gridWidth; c++) {
            const char = rowContent[c - 1];
            if (DIRECTION_VECTORS[char]) {
                currentTank = { row: r, col: c, orientation: char };
                terrainMap.set(`${r},${c}`, char);
            } else {
                terrainMap.set(`${r},${c}`, char);
            }
        }
        terrainMap.set(`${r},${gridWidth + 1}`, '#');
    }

    for (let c = 0; c <= gridWidth + 1; c++) {
        terrainMap.set(`${gridHeight + 1},${c}`, '#');
    }

    lineIndex++;

    const commandSequence = scenarioLines[lineIndex++].split("");

    const commandDispatch = {
        'U': (tank, map) => moveTank(tank, map, 'U'),
        'D': (tank, map) => moveTank(tank, map, 'D'),
        'L': (tank, map) => moveTank(tank, map, 'L'),
        'R': (tank, map) => moveTank(tank, map, 'R'),
        'S': (tank, map) => fireProjectile(tank, map)
    };

    commandSequence.forEach(cmd => {
        if (commandDispatch[cmd]) {
            commandDispatch[cmd](currentTank, terrainMap);
        }
    });

    let finalMapRows = [];
    for (let r = 1; r <= gridHeight; r++) {
        let rowChars = [];
        for (let c = 1; c <= gridWidth; c++) {
            rowChars.push(terrainMap.get(`${r},${c}`));
        }
        finalMapRows.push(rowChars.join(''));
    }

    return applyReplacements(finalMapRows.join('\n'), OUTPUT_CHAR_MAP);
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInput = applyReplacements(rawInput, INPUT_CHAR_MAP);
const allLines = processedInput.trim().split('\n');

let currentLineIdx = 0;
const totalTestCases = parseInt(allLines[currentLineIdx++], 10);

let results = [];
for (let i = 0; i < totalTestCases; i++) {
    if (i > 0) {
        results.push('');
    }

    const [h, w] = allLines[currentLineIdx].split(" ").map(Number);
    const scenarioSlice = allLines.slice(currentLineIdx, currentLineIdx + h + 3);
    currentLineIdx += h + 3;

    results.push(executeBattle(scenarioSlice));
}

console.log(results.join('\n'));
