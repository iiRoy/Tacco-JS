//
// Copyright (c) 2023 [Your Name/Organization]
//
// This software is provided under the terms of the MIT License.
// You may obtain a copy of the license at
//
//     https://opensource.org/licenses/MIT
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/* eslint-disable no-unused-vars, no-undef, no-plusplus */
/* global $, simulationCore, setInterval, clearInterval */

var GridPosition = function (col, row) {
  this.col = col;
  this.row = row;
};

var displayModule = (function () {
  var drawingSurface,
    drawingContext,
    surfaceIdentifier,
    unitDimension = 12, // display unit size in pixels
    liveColor = '#000000',
    deadColor = '#F0F0F0',
    meshColor = '#3C3C3C';

  // Sets up the primary canvas element.
  function initializeSurface(selectorString) {
    displayModule.drawingSurface = $(selectorString).get(0);
    displayModule.drawingContext = displayModule.drawingSurface.getContext('2d');
    displayModule.surfaceIdentifier = selectorString;
  }

  // Renders a single grid unit based on its coordinates and state.
  function renderUnit(col, row, isAlive) {
    displayModule.drawingContext.fillStyle = (isAlive) ? liveColor : deadColor;
    displayModule.drawingContext.fillRect(col * unitDimension + 1, row * unitDimension + 1, unitDimension - 1, unitDimension - 1);
  }

  // Handles pointer events on the drawing surface.
  function handlePointerEvent(evt) {
    var selfRef = this,
      cellStatus;

    // Determines grid coordinates from event position.
    function getUnitCoordinatesFromEvent(eventObj) {
      return new GridPosition(
        Math.floor((eventObj.pageX - selfRef.offsetLeft) / displayModule.unitDimension),
        Math.floor(((eventObj.pageY - selfRef.offsetTop) / displayModule.unitDimension))
      );
    }

    // Processes the state change for a given grid unit.
    function updateUnitState(cellCoord) {
      var c = cellCoord.col,
        r = cellCoord.row;
      if (c > simulationCore.colsTotal - 1 || r > simulationCore.rowsTotal - 1) {
        return;
      }
      if (typeof cellStatus === 'undefined') {
        cellStatus = !simulationCore.currentGen[c][r];
      }
      simulationCore.currentGen[c][r] = cellStatus;
      renderUnit(c, r, cellStatus);
    }

    updateUnitState(getUnitCoordinatesFromEvent(evt));

    $(displayModule.surfaceIdentifier).mousemove(function (moveEvt) {
      updateUnitState(getUnitCoordinatesFromEvent(moveEvt));
    });
  }

  // Draws only the units that have changed state since the last generation.
  function optimizedDraw() {
    var cIndex, rIndex;

    for (cIndex = 0; cIndex < simulationCore.colsTotal; cIndex++) {
      for (rIndex = 0; rIndex < simulationCore.rowsTotal; rIndex++) {
        if (simulationCore.currentGen[cIndex][rIndex] !== simulationCore.futureState[cIndex][rIndex]) {
          displayModule.renderUnit(cIndex, rIndex, simulationCore.futureState[cIndex][rIndex]);
        }
      }
    }
  }

  // Redraws the entire grid based on the current generation's state.
  function completeRender() {
    var cIndex, rIndex;

    for (cIndex = 0; cIndex < simulationCore.colsTotal; cIndex++) {
      for (rIndex = 0; rIndex < simulationCore.rowsTotal; rIndex++) {
        displayModule.renderUnit(cIndex, rIndex, simulationCore.currentGen[cIndex][rIndex]);
      }
    }
  }

  return {
    drawingSurface: drawingSurface,
    drawingContext: drawingContext,
    surfaceIdentifier: surfaceIdentifier,
    unitDimension: unitDimension,
    liveColor: liveColor,
    deadColor: deadColor,
    meshColor: meshColor,
    initializeSurface: initializeSurface,
    renderUnit: renderUnit,
    handlePointerEvent: handlePointerEvent,
    completeRender: completeRender,
    optimizedDraw: optimizedDraw
  };
}());

var simulationCore = (function () {
  var rowsTotal,
    colsTotal,
    currentGen = [], // Represents the previous generation's state
    futureState = [], // Stores the calculated next generation's state
    cycleDelay = 120, // Milliseconds between simulation steps
    timerHandle,
    simulationActive = false,
    colIdx, rowIdx;


  // Initializes the simulation grid and display canvas.
  function setupSimulation(selectorString) {
    displayModule.initializeSurface(selectorString);
    simulationCore.colsTotal = Math.floor((displayModule.drawingSurface.width - 1) / displayModule.unitDimension);
    simulationCore.rowsTotal = Math.floor((displayModule.drawingSurface.height - 1) / displayModule.unitDimension);
    displayModule.drawingContext.fillStyle = displayModule.deadColor;
    displayModule.drawingContext.fillRect(0, 0, simulationCore.colsTotal * displayModule.unitDimension, simulationCore.rowsTotal * displayModule.unitDimension);
    displayModule.drawingContext.fillStyle = displayModule.meshColor;

    for (colIdx = 0; colIdx < simulationCore.colsTotal; colIdx++) {
      simulationCore.currentGen[colIdx] = [];
      simulationCore.futureState[colIdx] = [];
      displayModule.drawingContext.fillRect(colIdx * displayModule.unitDimension, 0, 1, simulationCore.rowsTotal * displayModule.unitDimension);
      for (rowIdx = 0; rowIdx < simulationCore.rowsTotal; rowIdx++) {
        simulationCore.currentGen[colIdx][rowIdx] = false;
      }
    }
    displayModule.drawingContext.fillRect(simulationCore.colsTotal * displayModule.unitDimension, 0, 1, simulationCore.rowsTotal * displayModule.unitDimension);
    for (rowIdx = 0; rowIdx < simulationCore.rowsTotal; rowIdx++) {
      displayModule.drawingContext.fillRect(0, rowIdx * displayModule.unitDimension, simulationCore.colsTotal * displayModule.unitDimension, 1);
    }
    displayModule.drawingContext.fillRect(0, simulationCore.rowsTotal * displayModule.unitDimension, simulationCore.colsTotal * displayModule.unitDimension, 1);
    $(selectorString).mousedown(displayModule.handlePointerEvent);
    $('body').mouseup(function (mouseUpEvent) {
      $(displayModule.surfaceIdentifier).unbind('mousemove');
    });
  }

  // Counts living neighbors for a given cell, considering toroidal wrap-around.
  function getNeighborCount(c, r) {
    var sim = simulationCore,
      neighborCount = 0,
      i,
      adjacentStates = [
        sim.currentGen[c][(r - 1 + sim.rowsTotal) % sim.rowsTotal],
        sim.currentGen[(c + 1 + sim.colsTotal) % sim.colsTotal][(r - 1 + sim.rowsTotal) % sim.rowsTotal],
        sim.currentGen[(c + 1 + sim.colsTotal) % sim.colsTotal][r],
        sim.currentGen[(c + 1 + sim.colsTotal) % sim.colsTotal][(r + 1 + sim.rowsTotal) % sim.rowsTotal],
        sim.currentGen[c][(r + 1 + sim.rowsTotal) % sim.rowsTotal],
        sim.currentGen[(c - 1 + sim.colsTotal) % sim.colsTotal][(r + 1 + sim.rowsTotal) % sim.rowsTotal],
        sim.currentGen[(c - 1 + sim.colsTotal) % sim.colsTotal][r],
        sim.currentGen[(c - 1 + sim.colsTotal) % sim.colsTotal][(r - 1 + sim.rowsTotal) % sim.rowsTotal]
      ];

    for (i = 0; i < adjacentStates.length; i++) {
      if (adjacentStates[i]) {
        neighborCount++;
      }
    }

    return neighborCount;
  }

  // Calculates and applies the rules for the next generation.
  function advanceGeneration() {
    var sim = simulationCore,
      disp = displayModule,
      neighborCountValue;

    for (colIdx = 0; colIdx < sim.colsTotal; colIdx++) {
      for (rowIdx = 0; rowIdx < sim.rowsTotal; rowIdx++) {
        sim.futureState[colIdx][rowIdx] = sim.currentGen[colIdx][rowIdx];
      }
    }

    for (colIdx = 0; colIdx < sim.colsTotal; colIdx++) {
      for (rowIdx = 0; rowIdx < sim.rowsTotal; rowIdx++) {
        neighborCountValue = getNeighborCount(colIdx, rowIdx);

        // Conway's Game of Life rules applied:
        if (currentGen[colIdx][rowIdx]) { // If cell is currently alive
          if (neighborCountValue < 2 || neighborCountValue > 3) {
            futureState[colIdx][rowIdx] = false; // Dies by underpopulation or overpopulation
          }
        } else if (neighborCountValue === 3) { // If cell is currently dead
          futureState[colIdx][rowIdx] = true; // Becomes alive by reproduction
        }
      }
    }

    disp.optimizedDraw(); // Update only changed cells

    for (colIdx = 0; colIdx < sim.colsTotal; colIdx++) {
      for (rowIdx = 0; rowIdx < sim.rowsTotal; rowIdx++) {
        sim.currentGen[colIdx][rowIdx] = sim.futureState[colIdx][rowIdx];
      }
    }
  }

  // Starts or stops the simulation loop.
  function toggleSimulation() {
    if (!simulationActive) {
      simulationActive = true;
      timerHandle = setInterval(simulationCore.advanceGeneration, this.cycleDelay);
    } else {
      simulationActive = false;
      clearInterval(timerHandle);
    }
  }

  // Parses RLE (Run Length Encoded) patterns for initial grid setup.
  // Reference: http://www.conwaylife.com/wiki/RLE
  function importPattern(sourceUrl) {
    var disp = displayModule,
      sim = simulationCore,
      marginOffset = 25; // Border offset for pattern placement

    $.ajax({
      url: sourceUrl,
      success: function (dataContent) {
        var patternMatch = dataContent.match(/x\s=\s(\d*).*?y\s=\s(\d*).*\r([^]*)!/),
          patternWidth = parseInt(patternMatch[1], 10),
          encodedPattern = patternMatch[3].replace(/\s+/g, ""), // Remove all whitespace
          patternLines = encodedPattern.split('$'),
          lineOffset = 0, // Unused in this context, but kept for structural similarity
          lineIterator,
          currentLine,
          segmentLength,
          segmentIterator,
          gridY = marginOffset - 1;

        // Adjust canvas size to fit the loaded pattern with margins
        $(disp.surfaceIdentifier).attr('height', disp.unitDimension * (gridY + 1 + (marginOffset * 2)));
        $(disp.surfaceIdentifier).attr('width', disp.unitDimension * (patternWidth + 1 + (marginOffset * 2)));
        $(disp.surfaceIdentifier).unbind('mousedown'); // Detach old event handler
        sim.setupSimulation(disp.surfaceIdentifier); // Re-initialize universe with new size


        for (lineIterator = 0; lineIterator < patternLines.length; lineIterator++) {
          gridY++;
          let gridX = marginOffset; // Reset X position for each new line
          currentLine = patternLines[lineIterator];
          while (currentLine) {
            if (currentLine.charAt(0) === 'o' || currentLine.charAt(0) === 'b') {
              if (currentLine.charAt(0) === 'o') {
                sim.currentGen[gridX][gridY] = true;
                disp.renderUnit(gridX, gridY, true);
              }
              gridX++;
              currentLine = currentLine.substring(1);
            } else {
              segmentLength = currentLine.match(/(\d*)/)[1];
              currentLine = currentLine.substring(segmentLength.length);
              segmentLength = parseInt(segmentLength, 10);
              if (!currentLine) {
                gridY += segmentLength - 1;
                break;
              }
              if (currentLine.charAt(0) === 'o') {
                for (segmentIterator = 0; segmentIterator < segmentLength; segmentIterator++) {
                  sim.currentGen[gridX + segmentIterator][gridY] = true;
                  disp.renderUnit(gridX + segmentIterator, gridY, true);
                }
              }
              gridX += segmentLength;
              currentLine = currentLine.substring(1);
            }
          }
        }
      }
    });
  }

  // Reports the current simulation status.
  function isSimulationRunning() {
    return simulationActive;
  }

  // Modifies the simulation speed (interval between generations).
  function adjustSpeed(increaseSpeed) {
    if (increaseSpeed) {
      if (simulationCore.cycleDelay === 0) {
        return;
      }
      simulationCore.cycleDelay -= 10;

    } else {
      if (simulationCore.cycleDelay === 1000) {
        return;
      }
      simulationCore.cycleDelay += 10;
    }

    if (simulationActive) {
      clearInterval(timerHandle);
      timerHandle = setInterval(simulationCore.advanceGeneration, simulationCore.cycleDelay);
    }
  }

  // Clears all living cells from the grid.
  function resetGrid() {
    var cIndex, rIndex;

    for (cIndex = 0; cIndex < simulationCore.colsTotal; cIndex++) {
      for (rIndex = 0; rIndex < simulationCore.rowsTotal; rIndex++) {
        simulationCore.futureState[cIndex][rIndex] = false;
      }
    }

    displayModule.optimizedDraw(); // Reflect changes on display

    for (cIndex = 0; cIndex < simulationCore.colsTotal; cIndex++) {
      for (rIndex = 0; rIndex < simulationCore.rowsTotal; rIndex++) {
        simulationCore.currentGen[cIndex][rIndex] = false;
      }
    }
  }

  return {
    rowsTotal: rowsTotal,
    colsTotal: colsTotal,
    currentGen: currentGen,
    futureState: futureState,
    universe: currentGen, // Alias for current generation
    cycleDelay: cycleDelay,
    setupSimulation: setupSimulation,
    advanceGeneration: advanceGeneration,
    toggleSimulation: toggleSimulation,
    isSimulationRunning: isSimulationRunning,
    resetGrid: resetGrid,
    adjustSpeed: adjustSpeed,
    importPattern: importPattern
  };
}());