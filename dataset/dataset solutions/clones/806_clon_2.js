function shiftUnit ( rowOffset , colOffset , unitSymbol ) {
    if ( gameGrid [ playerPos [ 0 ] + rowOffset ] [ playerPos [ 1 ] + colOffset ] === "." )
    {
        gameGrid [ playerPos [ 0 ] + rowOffset ] [ playerPos [ 1 ] + colOffset ] = unitSymbol;
        gameGrid [ playerPos [ 0 ] ] [ playerPos [ 1 ] ] = ".";
        playerPos [ 0 ] += rowOffset;
        playerPos [ 1 ] += colOffset;
    }
    else
    {
        gameGrid [ playerPos [ 0 ] ] [ playerPos [ 1 ] ] = unitSymbol;
    }
}

function fireProjectile(rowDirection, columnDirection) {
    let stepCount = 0;
    while (true) {
        stepCount++;
        if (gameGrid[playerPos[0] + (rowDirection * stepCount)][playerPos[1] + (columnDirection * stepCount)] === "#") break;
        else if (gameGrid[playerPos[0] + (rowDirection * stepCount)][playerPos[1] + (columnDirection * stepCount)] === "*") {
            gameGrid[playerPos[0] + (rowDirection * stepCount)][playerPos[1] + (columnDirection * stepCount)] = ".";
            break;
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");
let numScenarios = inputLines.shift() - 0;

for (let scenarioIndex = 0; scenarioIndex < numScenarios; scenarioIndex++) {
    if (scenarioIndex !== 0) console.log("");

    const dimInfo = inputLines.shift().split(" ").map(Number);
    let gameGrid = [];
    gameGrid.push("######################".split(""));
    let playerPos = [0, 0];

    for (let rowIndex = 0; rowIndex < dimInfo[0]; rowIndex++) {
        let currentLineChars = inputLines.shift().split("");
        let foundIdx = -1;
        currentLineChars.forEach(function (charVal, charIndex) {
            if (charVal === "^" || charVal === "v" || charVal === "<" || charVal === ">") foundIdx = charIndex;
        });
        if (foundIdx !== -1) playerPos = [rowIndex + 1, foundIdx + 1];
        currentLineChars.unshift("#");
        currentLineChars.push("#");
        gameGrid.push(currentLineChars);
    }

    gameGrid.push("######################".split(""));

    inputLines.shift();

    const commandSequence = inputLines.shift().split("");

    commandSequence.forEach(function (currentCommand) {
        if (currentCommand === "U") shiftUnit(-1, 0, "^");
        else if (currentCommand === "D") shiftUnit(1, 0, "v");
        else if (currentCommand === "L") shiftUnit(0, -1, "<");
        else if (currentCommand === "R") shiftUnit(0, 1, ">");
        else if (currentCommand === "S") {
            const unitDirection = gameGrid[playerPos[0]][playerPos[1]];
            if (unitDirection === "^") fireProjectile(-1, 0);
            else if (unitDirection === "v") fireProjectile(1, 0);
            else if (unitDirection === "<") fireProjectile(0, -1);
            else if (unitDirection === ">") fireProjectile(0, 1);
        }
    });

    gameGrid.shift();
    gameGrid.pop();

    const finalOutput = gameGrid.join("\n").replace(/,/g, "").replace(/^#|#$/mg, "");
    console.log(finalOutput);
}