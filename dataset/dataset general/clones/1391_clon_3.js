/**
 * jsFluid simulation engine for pressure-based dynamics, version 0.02
 * Developed by Simon Greenwold, 2011, adapted by AI, 2023.
 * Original source: http://www.upfork.com/
 * Licensed under the MIT or GPL Version 2 licenses.
 * Last Modified: November 3, 2011 (original)
 *
 * Copyright (C) 2011 by Simon Greenwold
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Extends the Array prototype to fill all elements with a specified value.
 * This function modifies the array in-place.
 * @param {any} fillValue - The value to assign to every element in the array.
 */
Array.prototype.populateWith = function(fillValue) {
  let currentIndex = 0;
  const totalElements = this.length;
  // A simple loop for compatibility, similar to the original's intent.
  // Could use Array.prototype.fill() for modern JS.
  while (currentIndex < totalElements) {
    this[currentIndex] = fillValue;
    currentIndex++;
  }
};

/**
 * Factory function to create a fluid dynamics simulation engine.
 * This engine simulates water pressure and flow on a 2D grid.
 * @param {number} gridDimensionX - The number of cells horizontally.
 * @param {number} gridDimensionY - The number of cells vertically.
 * @returns {object} An API object for interacting with the simulation.
 */
const createFluidSimulation = function (gridDimensionX, gridDimensionY) {
  // Public interface for the simulation instance
  const simulationAPI = {};

  // --- Configuration Constants (grouped for clarity) ---
  const SIM_CONFIG = {
    FLOW_RETENTION_FACTOR: 0.97, // Factor for conserving flow potentials between steps
    PARTICLE_COUNT_LIMIT: 4800,  // Max number of particles (declared but not used in this version)
    MATH_PI_VALUE: 3.1415926534, // Value of PI (declared but not used)
    HALF_MATH_PI: 3.1415926534 / 2.0, // Half PI (declared but not used)
    ONE_OVER_SQRT_2: 1.0 / Math.sqrt(2.0), // Inverse square root of two for diagonal scaling
    IMPULSE_SPREAD_RADIUS: 2,    // Radius for applying external impulses (e.g., mouse interaction)
    PARTIAL_RESET_FACTOR: 0.20,  // Factor for partial clearing (declared but not used)
    FLOW_ACCUMULATION_SCALE: 16, // Scaling factor for potentials when calculating net flow vector
    PRESSURE_POTENTIAL_COEFFICIENT: 0.0625 // Equivalent to 1/16, scales pressure difference to potential
  };

  // --- Directional Vectors for 8-way grid movement ---
  // Represents unit vectors for East, North-East, North, etc., used for flow calculations.
  const octagonalDirectionVectors = [
    [1, 0],
    [SIM_CONFIG.ONE_OVER_SQRT_2, SIM_CONFIG.ONE_OVER_SQRT_2],
    [0, 1],
    [-SIM_CONFIG.ONE_OVER_SQRT_2, SIM_CONFIG.ONE_OVER_SQRT_2],
    [-1, 0],
    [-SIM_CONFIG.ONE_OVER_SQRT_2, -SIM_CONFIG.ONE_OVER_SQRT_2],
    [0, -1],
    [SIM_CONFIG.ONE_OVER_SQRT_2, -SIM_CONFIG.ONE_OVER_SQRT_2]
  ];

  // --- Directional Indices (enum-like for readability) ---
  const GridDirections = Object.freeze({
    EAST: 0,
    NORTHEAST: 1,
    NORTH: 2,
    NORTHWEST: 3,
    WEST: 4,
    SOUTHWEST: 5,
    SOUTH: 6,
    SOUTHEAST: 7
  });

  // --- General Utility Functions ---

  /**
   * Calculates the dot product of two 2D vectors.
   * @param {number[]} vecA - First vector [x, y].
   * @param {number[]} vecB - Second vector [x, y].
   * @returns {number} The dot product.
   */
  const calculateVectorDotProduct = (vecA, vecB) => {
    // Adding a guard clause for vector length
    if (!Array.isArray(vecA) || vecA.length < 2 || !Array.isArray(vecB) || vecB.length < 2) {
      console.warn("Vector Dot Product: Input vectors must be arrays of at least 2 dimensions.");
      return 0; // Return 0 or throw an error for invalid input
    }
    return (vecA[0] * vecB[0]) + (vecA[1] * vecB[1]);
  };

  /**
   * Computes the magnitude (length) of a 2D vector.
   * @param {number[]} vec - The vector [x, y].
   * @returns {number} The magnitude of the vector.
   */
  const computeVectorMagnitude = (vec) => {
    if (!Array.isArray(vec) || vec.length < 2) {
      console.warn("Vector Magnitude: Input vector must be an array of at least 2 dimensions.");
      return 0;
    }
    const squareSum = (vec[0] * vec[0]) + (vec[1] * vec[1]);
    return Math.sqrt(squareSum);
  };

  // --- Fluid Cell Constructor/Factory ---
  /**
   * Factory function to create a single fluid cell within the simulation grid.
   * Each cell manages its local pressure, flow, and interactions with neighbors.
   * @param {object} parentFluidEngine - Reference to the main fluid engine object.
   * @param {number} initialX - X-coordinate of the cell in the grid.
   * @param {number} initialY - Y-coordinate of the cell in the grid.
   * @returns {object} An API object for this specific fluid cell.
   */
  const createFluidCell = function (parentFluidEngine, initialX, initialY) {
    const cellPublicInterface = {};

    // Cell state variables (private to this cell instance)
    let cellXPosition = initialX;
    let cellYPosition = initialY;
    let currentPressureLevel = 0;
    let outgoingFlowAccumulator = [0, 0]; // Represents net flow vector
    // Potentials for flow to/from 8 neighbors (E, NE, N, NW, W, SW, S, SE)
    const boundaryPotentials = new Array(8).populateWith(0);
    const previousBoundaryPotentials = new Array(8).populateWith(0);
    const incomingExternalFlows = new Array(8).populateWith(0); // Flow added externally to boundaries

    // References to adjacent cells and boundary blockage status
    const adjacentCells = new Array(8);
    const boundaryBlockedStatus = new Array(8); // True if a boundary is at the edge of the grid

    // --- Private Helper for Cell ---
    /**
     * Checks if a specific boundary direction from this cell is blocked (e.g., at grid edge).
     * @param {number} directionIndex - The index of the direction (0-7, using GridDirections).
     * @returns {boolean} True if the boundary is blocked, false otherwise.
     */
    const isDirectionBlocked = (directionIndex) => {
      // Adding a check for valid direction index
      if (directionIndex < 0 || directionIndex >= 8) {
        console.error(`Invalid direction index ${directionIndex} for cell (${cellXPosition},${cellYPosition}).`);
        return true; // Treat as blocked for safety
      }
      return boundaryBlockedStatus[directionIndex];
    };

    // --- Public Cell Methods (exposed via cellPublicInterface) ---

    // Expose properties for external access (read-only where appropriate)
    Object.defineProperty(cellPublicInterface, 'pressureLevel', {
      get: () => currentPressureLevel,
      set: (val) => { currentPressureLevel = val; } // Allow setting pressure directly
    });
    Object.defineProperty(cellPublicInterface, 'flowResultVector', {
      get: () => [...outgoingFlowAccumulator] // Return a copy to prevent external modification
    });

    /**
     * Identifies and stores references to neighboring cells and determines boundary blockages.
     * This should be called once after the entire grid is initialized.
     */
    cellPublicInterface.locateAdjacentCells = function () {
      // Calculate neighbor coordinates, clamping to grid boundaries to get actual neighbor.
      // This is crucial for correctly identifying cells at the grid edges.
      const xPlus1 = Math.min(cellXPosition + 1, gridDimensionX - 1);
      const xMinus1 = Math.max(0, cellXPosition - 1);
      const yPlus1 = Math.min(cellYPosition + 1, gridDimensionY - 1);
      const yMinus1 = Math.max(0, cellYPosition - 1);

      // Assign neighbor cell references from the parent engine's grid
      adjacentCells[GridDirections.EAST] = parentFluidEngine.simulationGrid[xPlus1][cellYPosition];
      adjacentCells[GridDirections.NORTHEAST] = parentFluidEngine.simulationGrid[xPlus1][yPlus1];
      adjacentCells[GridDirections.NORTH] = parentFluidEngine.simulationGrid[cellXPosition][yPlus1];
      adjacentCells[GridDirections.NORTHWEST] = parentFluidEngine.simulationGrid[xMinus1][yPlus1];
      adjacentCells[GridDirections.WEST] = parentFluidEngine.simulationGrid[xMinus1][cellYPosition];
      adjacentCells[GridDirections.SOUTHWEST] = parentFluidEngine.simulationGrid[xMinus1][yMinus1];
      adjacentCells[GridDirections.SOUTH] = parentFluidEngine.simulationGrid[cellXPosition][yMinus1];
      adjacentCells[GridDirections.SOUTHEAST] = parentFluidEngine.simulationGrid[xPlus1][yMinus1];

      // Determine if boundaries are blocked (at grid edges).
      // A boundary is blocked if any part of it would go outside the grid.
      boundaryBlockedStatus[GridDirections.EAST] = (cellXPosition === gridDimensionX - 1);
      boundaryBlockedStatus[GridDirections.NORTHEAST] = (cellXPosition === gridDimensionX - 1 || cellYPosition === gridDimensionY - 1);
      boundaryBlockedStatus[GridDirections.NORTH] = (cellYPosition === gridDimensionY - 1);
      boundaryBlockedStatus[GridDirections.NORTHWEST] = (cellXPosition === 0 || cellYPosition === gridDimensionY - 1);
      boundaryBlockedStatus[GridDirections.WEST] = (cellXPosition === 0);
      boundaryBlockedStatus[GridDirections.SOUTHWEST] = (cellXPosition === 0 || cellYPosition === 0);
      boundaryBlockedStatus[GridDirections.SOUTH] = (cellYPosition === 0);
      boundaryBlockedStatus[GridDirections.SOUTHEAST] = (cellXPosition === gridDimensionX - 1 || cellYPosition === 0);
    };

    /**
     * Resets the cell's internal state, clearing potentials and flow.
     */
    cellPublicInterface.resetCellState = function () {
      boundaryPotentials.populateWith(0);
      previousBoundaryPotentials.populateWith(0);
      incomingExternalFlows.populateWith(0);
      currentPressureLevel = 0;
      outgoingFlowAccumulator = [0, 0];
    };

    /**
     * Calculates the net flow vector based on current boundary potentials.
     * This updates the cell's `flowResultVector`.
     */
    cellPublicInterface.determineFlowVector = function () {
      let totalFlowX = 0;
      let totalFlowY = 0;
      for (let i = 0; i < 8; ++i) {
        // Potentials are multiplied by a scaling factor to represent flow strength.
        const potentialContribution = boundaryPotentials[i] * SIM_CONFIG.FLOW_ACCUMULATION_SCALE;
        totalFlowX += octagonalDirectionVectors[i][0] * potentialContribution;
        totalFlowY += octagonalDirectionVectors[i][1] * potentialContribution;
      }
      outgoingFlowAccumulator = [totalFlowX, totalFlowY];
    };

    /**
     * Computes and stores the potential difference (pressure gradient) for each boundary.
     * These potentials drive the flow between cells.
     */
    cellPublicInterface.computeBoundaryPotentials = function () {
      for (let i = 0; i < 8; ++i) {
        // Determine the "other" cell for pressure comparison. If blocked, use this cell's pressure,
        // effectively creating a wall.
        const neighborCell = isDirectionBlocked(i) ? cellPublicInterface : adjacentCells[i];
        let potentialValue = (currentPressureLevel - neighborCell.pressureLevel) * SIM_CONFIG.PRESSURE_POTENTIAL_COEFFICIENT;

        // Diagonal neighbors have a reduced influence, reflecting longer distance or geometry.
        // Using 1/sqrt(2) for diagonals.
        if (i % 2 === 1) { // Odd indices are diagonal (NE, NW, SW, SE)
          potentialValue *= SIM_CONFIG.ONE_OVER_SQRT_2;
        }
        boundaryPotentials[i] = potentialValue;
      }
    };

    /**
     * Distributes pressure changes to neighboring cells based on calculated potentials.
     * Also applies conservation from previous step and external flow contributions.
     */
    cellPublicInterface.propagatePressureChanges = function () {
      for (let i = 0; i < 8; ++i) {
        // Incorporate previous potentials (for conservation) and external flow contributions
        let currentPotential = boundaryPotentials[i];
        currentPotential += SIM_CONFIG.FLOW_RETENTION_FACTOR * previousBoundaryPotentials[i];
        currentPotential += incomingExternalFlows[i];

        // If the boundary is not blocked, transfer pressure to/from the neighbor.
        // This cell loses pressure, the neighbor gains it.
        if (!isDirectionBlocked(i)) {
          const neighbor = adjacentCells[i];
          neighbor.pressureLevel += currentPotential;
          currentPressureLevel -= currentPotential;
        }
        // If blocked, the pressure potential is contained within this cell or reflected.
        // The original code implicitly handles this by not transferring pressure.

        // Store current potential for the next step's conservation
        previousBoundaryPotentials[i] = currentPotential;
        // Reset incoming external flow for the next cycle
        incomingExternalFlows[i] = 0;
      }
    };

    /**
     * Adds an external flow impulse to the cell's boundaries.
     * This simulates an external force pushing fluid, distributing the impulse
     * across relevant boundaries.
     * @param {number[]} impulseVector - The 2D vector representing the external impulse.
     */
    cellPublicInterface.injectBoundaryFlow = function (impulseVector) {
      // Guard for invalid impulseVector
      if (!Array.isArray(impulseVector) || impulseVector.length !== 2) {
        console.warn(`Invalid impulse vector provided to injectBoundaryFlow for cell (${cellXPosition},${cellYPosition}).`);
        return;
      }

      const impulseMagnitude = computeVectorMagnitude(impulseVector);

      for (let i = 0; i < 8; ++i) {
        if (isDirectionBlocked(i)) {
          // If a boundary is blocked, the impulse directly increases this cell's pressure.
          // This simulates hitting a wall.
          currentPressureLevel += impulseMagnitude;
        } else {
          // Calculate how much the impulse aligns with each boundary direction using dot product.
          const alignment = calculateVectorDotProduct(impulseVector, octagonalDirectionVectors[i]);

          // Distribute the impulse across multiple boundaries for a smoother, more realistic effect.
          // A primary contribution in the direction of alignment, and a smaller opposing contribution
          // to the opposite boundary to help maintain conservation.
          const primaryContribution = alignment * 0.25;
          const oppositeContribution = alignment * -0.125; // Negative contribution

          incomingExternalFlows[i] += primaryContribution;
          // Apply a smaller, opposing contribution to the directly opposite boundary
          incomingExternalFlows[(i + 4) % 8] += oppositeContribution;
        }
      }
    };

    /**
     * Calculates the sum of all positive boundary potentials for this cell.
     * Useful for diagnostics or total energy calculations.
     * @returns {number} The sum of positive potentials.
     */
    cellPublicInterface.sumPositiveBoundaryPotentials = function () {
      let positivePotentialSum = 0;
      for (let i = 0; i < 8; ++i) {
        if (boundaryPotentials[i] > 0) {
          positivePotentialSum += boundaryPotentials[i];
        }
      }
      return positivePotentialSum;
    };

    return cellPublicInterface;
  };

  // --- Grid Iteration Helper ---
  /**
   * Applies a given function to every cell in the simulation grid.
   * @param {function(object)} operation - The function to apply to each cell.
   */
  const iterateGridCells = (operation) => {
    // Adding a guard for the operation function
    if (typeof operation !== 'function') {
      console.error("iterateGridCells requires a function as an argument.");
      return;
    }
    for (let xIdx = 0; xIdx < gridDimensionX; xIdx++) {
      for (let yIdx = 0; yIdx < gridDimensionY; yIdx++) {
        operation(simulationAPI.simulationGrid[xIdx][yIdx]);
      }
    }
  };

  // --- Global Grid Operations (Private to the engine) ---
  /** Resets all cells in the grid to their initial state. */
  const resetAllCells = () => iterateGridCells(cell => cell.resetCellState());

  /** Recalculates boundary potentials for all cells. */
  const recalculateAllPotentials = () => iterateGridCells(cell => cell.computeBoundaryPotentials());

  /** Propagates pressure changes across all cells based on potentials. */
  const propagateAllPressures = () => iterateGridCells(cell => cell.propagatePressureChanges());

  /** Recalculates the net flow vector for all cells. */
  const recalculateAllFlows = () => iterateGridCells(cell => cell.determineFlowVector());

  /**
   * Adjusts all cell pressures so that the total pressure across the grid sums to zero.
   * This helps maintain stability by preventing pressure accumulation or depletion.
   */
  const normalizeTotalPressure = () => {
    let totalGridPressure = 0;
    iterateGridCells(cell => {
      totalGridPressure += cell.pressureLevel;
    });

    // Calculate the average pressure to subtract from each cell.
    // The negative sign ensures that if total pressure is positive, we subtract,
    // and if negative, we add.
    const numberOfCells = gridDimensionX * gridDimensionY;
    if (numberOfCells === 0) {
      console.warn("Cannot normalize pressure for a grid with zero cells.");
      return;
    }
    const averagePressureAdjustment = totalGridPressure / numberOfCells;

    // Distribute the adjustment to each cell
    iterateGridCells(cell => {
      cell.pressureLevel -= averagePressureAdjustment;
    });
  };

  /**
   * Calculates the total sum of positive boundary potentials across the entire grid.
   * This could be used for debugging or energy monitoring.
   * @returns {number} The aggregate sum of positive potentials.
   */
  const computeTotalPositivePotential = () => {
    let aggregateSum = 0;
    iterateGridCells(cell => {
      aggregateSum += cell.sumPositiveBoundaryPotentials();
    });
    return aggregateSum;
  };

  // --- Public API Methods (Exposed via simulationAPI) ---

  /**
   * Advances the fluid simulation by one time step.
   * This involves calculating potentials, distributing pressures, and updating flow vectors.
   */
  simulationAPI.advanceSimulationStep = function () {
    // Ensure total pressure remains balanced to prevent drift over time.
    // This is a crucial stability step.
    normalizeTotalPressure();
    // First, calculate how pressure wants to flow between cells based on current differences.
    recalculateAllPotentials();
    // Then, apply the calculated pressure flows, modifying cell pressures.
    propagateAllPressures();
    // Finally, update the net flow vectors for each cell, which can be used for rendering or sampling.
    recalculateAllFlows();
  };

  /**
   * Maps continuous 0-1 coordinates to discrete grid cell indices.
   * The coordinates are clamped to ensure they are within the grid bounds.
   * @param {number} coordX - X-coordinate (0.0 to 1.0).
   * @param {number} coordY - Y-coordinate (0.0 to 1.0).
   * @returns {number[]} An array `[gridX, gridY]` of integer cell coordinates.
   */
  const mapCoordinatesToGridCell = (coordX, coordY) => {
    // Ensure coordinates are within [0, 1) range to avoid issues with Math.floor(1.0 * N)
    const clampedX = Math.max(0, Math.min(coordX, 0.999999999999));
    const clampedY = Math.max(0, Math.min(coordY, 0.999999999999));

    const gridX = Math.floor(clampedX * gridDimensionX);
    const gridY = Math.floor(clampedY * gridDimensionY);

    return [gridX, gridY];
  };

  /**
   * Applies an external impulse (e.g., a "swish" or "poke") to the fluid at a given location.
   * The impulse spreads over a configurable radius of cells, with a falloff effect.
   * @param {number} normalizedX - X-coordinate (0.0 to 1.0) of the impulse center.
   * @param {number} normalizedY - Y-coordinate (0.0 to 1.0) of the impulse center.
   * @param {number} impulseVecX - X component of the impulse vector.
   * @param {number} impulseVecY - Y component of the impulse vector.
   */
  simulationAPI.applyImpulse = function (normalizedX, normalizedY, impulseVecX, impulseVecY) {
    const [centerX, centerY] = mapCoordinatesToGridCell(normalizedX, normalizedY);
    const baseImpulseVector = [impulseVecX, impulseVecY];

    // Iterate over cells within the impulse spread radius (square region)
    for (let dx = -SIM_CONFIG.IMPULSE_SPREAD_RADIUS; dx <= SIM_CONFIG.IMPULSE_SPREAD_RADIUS; dx++) {
      const currentX = centerX + dx;
      // Clamp x-coordinate to grid boundaries for bounded impulse application
      const xCell = Math.max(0, Math.min(currentX, gridDimensionX - 1));

      for (let dy = -SIM_CONFIG.IMPULSE_SPREAD_RADIUS; dy <= SIM_CONFIG.IMPULSE_SPREAD_RADIUS; dy++) {
        const currentY = centerY + dy;
        // Clamp y-coordinate to grid boundaries for bounded impulse application
        const yCell = Math.max(0, Math.min(currentY, gridDimensionY - 1));

        const targetCell = simulationAPI.simulationGrid[xCell][yCell];

        // Calculate a falloff factor based on Euclidean distance from the impulse center.
        // This makes the impulse weaker further from the center.
        const distanceSq = (dx * dx) + (dy * dy);
        const distance = Math.sqrt(distanceSq);
        const falloffDivisor = 1 + distance; // Linear falloff, stronger close to center

        // Apply a scaled impulse to the cell's boundaries.
        const scaledImpulseX = baseImpulseVector[0] / falloffDivisor;
        const scaledImpulseY = baseImpulseVector[1] / falloffDivisor;
        targetCell.injectBoundaryFlow([scaledImpulseX, scaledImpulseY]);
      }
    }
  };

  /**
   * Samples the interpolated flow vector at a given continuous point within the grid.
   * Uses bilinear interpolation across the four nearest cells for smoother flow readings.
   * @param {number} normalizedX - X-coordinate (0.0 to 1.0).
   * @param {number} normalizedY - Y-coordinate (0.0 to 1.0).
   * @returns {number[]} The interpolated 2D flow vector `[flowX, flowY]`.
   */
  simulationAPI.interpolateFlowAtPoint = function (normalizedX, normalizedY) {
    // Map normalized coordinates to continuous grid coordinates.
    // We allow values outside [0,1) for normalizedX/Y here and use modulo
    // to simulate a toroidal sampling behavior, matching the original.
    let sampleCoordX = normalizedX * gridDimensionX;
    let sampleCoordY = normalizedY * gridDimensionY;

    // Handle boundary conditions: wrap around if out of bounds (toroidal effect for sampling)
    sampleCoordX = (sampleCoordX % gridDimensionX + gridDimensionX) % gridDimensionX;
    sampleCoordY = (sampleCoordY % gridDimensionY + gridDimensionY) % gridDimensionY;

    const baseGridX = Math.floor(sampleCoordX);
    const fracX = sampleCoordX - baseGridX;

    const baseGridY = Math.floor(sampleCoordY);
    const fracY = sampleCoordY - baseGridY;

    // Get references to the four surrounding cells for bilinear interpolation.
    // Use modulo for neighbor indices to handle wrap-around at grid edges.
    const cell00 = simulationAPI.simulationGrid[baseGridX][baseGridY];
    const cell10 = simulationAPI.simulationGrid[(baseGridX + 1) % gridDimensionX][baseGridY];
    const cell01 = simulationAPI.simulationGrid[baseGridX][(baseGridY + 1) % gridDimensionY];
    const cell11 = simulationAPI.simulationGrid[(baseGridX + 1) % gridDimensionX][(baseGridY + 1) % gridDimensionY];

    // Bilinear interpolation for the X component of the flow vector
    const flowX_bottom = cell00.flowResultVector[0] * (1.0 - fracX) + cell10.flowResultVector[0] * fracX;
    const flowX_top = cell01.flowResultVector[0] * (1.0 - fracX) + cell11.flowResultVector[0] * fracX;
    const interpolatedFlowX = flowX_bottom * (1.0 - fracY) + flowX_top * fracY;

    // Bilinear interpolation for the Y component of the flow vector
    const flowY_bottom = cell00.flowResultVector[1] * (1.0 - fracX) + cell10.flowResultVector[1] * fracX;
    const flowY_top = cell01.flowResultVector[1] * (1.0 - fracX) + cell11.flowResultVector[1] * fracX;
    const interpolatedFlowY = flowY_bottom * (1.0 - fracY) + flowY_top * fracY;

    return [interpolatedFlowX, interpolatedFlowY];
  };

  // --- Grid Initialization ---
  // The main 2D array that holds all fluid cell objects.
  simulationAPI.simulationGrid = new Array(gridDimensionX);

  /**
   * Initializes the 2D grid of fluid cells.
   * This involves creating the cell objects and then establishing their neighbor relationships.
   */
  const initializeGrid = () => {
    // Create the primary 2D array structure
    for (let i = 0; i < gridDimensionX; i++) {
      simulationAPI.simulationGrid[i] = new Array(gridDimensionY);
    }

    // Populate the grid with new fluid cell instances
    for (let x = 0; x < gridDimensionX; x++) {
      for (let y = 0; y < gridDimensionY; y++) {
        simulationAPI.simulationGrid[x][y] = createFluidCell(simulationAPI, x, y);
      }
    }

    // After all cells are created, tell each cell to find its neighbors.
    // This step must happen after all cells exist in the grid.
    iterateGridCells(cell => cell.locateAdjacentCells());
  };

  // Execute initialization when the fluid engine is created
  initializeGrid();

  return simulationAPI;
};