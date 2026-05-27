const EMPTY_CELL = ".";
const WALL_CELL = "#";
const BRICK_CELL = "*";

const isEmptyCell = (cellValue) => cellValue === EMPTY_CELL;
const isWallCell = (cellValue) => cellValue === WALL_CELL;
const isBrickCell = (cellValue) => cellValue === BRICK_CELL;

function updateTankPosition(deltaY, deltaX, tankChar, gameGrid, tankCoords){
   const currentTankY = tankCoords[0];
   const currentTankX = tankCoords[1];
   const targetY = currentTankY + deltaY;
   const targetX = currentTankX + deltaX;

   if(isEmptyCell(gameGrid[targetY][targetX])){
      gameGrid[targetY][targetX] = tankChar;
      gameGrid[currentTankY][currentTankX] = EMPTY_CELL;
      tankCoords[0] = targetY;
      tankCoords[1] = targetX;
   } else {
     gameGrid[currentTankY][currentTankX] = tankChar;
   }
}

function fireProjectile(deltaY, deltaX, gameGrid, tankCoords){
   const MAX_SHOT_DISTANCE = 200;

   for(let stepCount = 1; stepCount <= MAX_SHOT_DISTANCE; stepCount++){
      const projectileY = tankCoords[0] + (deltaY * stepCount);
      const projectileX = tankCoords[1] + (deltaX * stepCount);

      if (projectileY < 0 || projectileX < 0 || projectileY >= gameGrid.length || projectileX >= gameGrid[0].length) {
          break;
      }

      const targetCell = gameGrid[projectileY][projectileX];

      if(isWallCell(targetCell)) {
          break;
      } else if(isBrickCell(targetCell)) {
          gameGrid[projectileY][projectileX] = EMPTY_CELL;
          break;
      }
   }
}

function processRawInput(rawString) {
    return rawString
        .replace(/\^/g, "U")
        .replace(/v/g, "D")
        .replace(/\</g, "L")
        .replace(/\>/g, "R");
}

const createGridBorderRow = (length = 20) => Array(length).fill(WALL_CELL);

function findTankInRow(rowChars) {
    const tankDirections = ["U", "D", "L", "R"];
    for (let i = 0; i < rowChars.length; i++) {
        if (tankDirections.includes(rowChars[i])) {
            return i;
        }
    }
    return -1;
}

function formatFinalGridForOutput(gridString) {
    return gridString
        .replace(/U/g, "^")
        .replace(/D/g, "v")
        .replace(/L/g, "<")
        .replace(/R/g, ">");
}

const fs = require('fs');
let rawInputData = fs.readFileSync('/dev/stdin', 'utf8');

let processedInput = processRawInput(rawInputData);
let inputLines = processedInput.trim().split("\n");

let testCaseCount = parseInt(inputLines.shift(), 10);

for(let caseIndex = 0; caseIndex < testCaseCount; caseIndex++){
   if(caseIndex !== 0) {
       console.log("");
   }

   const [gridHeight, gridWidth] = inputLines.shift().split(" ").map(Number);

   let gameGrid = [];
   gameGrid.push(createGridBorderRow());

   let tankCoords = [0,0];

   for(let rowIndex = 0; rowIndex < gridHeight; rowIndex++){
      let currentRowChars = inputLines.shift().split("");
      const foundTankCol = findTankInRow(currentRowChars);

      if(foundTankCol !== -1) {
          tankCoords = [rowIndex + 1, foundTankCol + 1];
      }
      currentRowChars.unshift(WALL_CELL);
      currentRowChars.push(WALL_CELL);
      gameGrid.push(currentRowChars);
   }

   gameGrid.push(createGridBorderRow());

   inputLines.shift();

   const commandSequence = inputLines.shift().split("");

   const shotDirectionMap = {
       "U": [-1, 0],
       "D": [1, 0],
       "L": [0, -1],
       "R": [0, 1]
   };

   for (const currentCommand of commandSequence) {
      const tankCurrentY = tankCoords[0];
      const tankCurrentX = tankCoords[1];
      const tankDirectionChar = gameGrid[tankCurrentY][tankCurrentX];

      switch(currentCommand) {
          case "U":
          case "D":
          case "L":
          case "R":
              updateTankPosition(shotDirectionMap[currentCommand][0], shotDirectionMap[currentCommand][1], currentCommand, gameGrid, tankCoords);
              break;
          case "S":
              const [shotDeltaY, shotDeltaX] = shotDirectionMap[tankDirectionChar] || [0,0];
              fireProjectile(shotDeltaY, shotDeltaX, gameGrid, tankCoords);
              break;
      }
   }

   gameGrid.shift();
   gameGrid.pop();

   const gridRowsWithoutInternalCommas = gameGrid.map(row => row.join(""));
   let finalOutputGridString = gridRowsWithoutInternalCommas.join("\n");

   finalOutputGridString = finalOutputGridString.replace(/^#|#$/mg, "");

   console.log(formatFinalGridForOutput(finalOutputGridString));
}
