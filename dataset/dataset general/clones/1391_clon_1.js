/*
 * jsWater pressure-based fluid simulation v0.01
 * http://www.upfork.com/
 * Copyright 2011, Simon Greenwold
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: November 3 2011
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
// This script defines an Array prototype method.
Array.prototype.setAll = function ( v ) {
  var i, n = this.length; // Declare loop variables.
  for ( i = 0; i < n; ++i ) {
    this[i] = v; // Set each element to the given value.
  }
};

// Main fluid simulation module constructor.
var fluid_maker = function ( FLUID_CELLS_X, FLUID_CELLS_Y ) {
  var my = {}; // Public interface object.

  // Constants for the simulation.
  var CONSERVATION = 0.97;
  var N_PARTICLES = 4800; // Number of particles, currently unused.
  var PI = 3.1415926534;
  var HALF_PI = 3.1415926534 / 2.0;
  var INV_SQRT_TWO = 1.0 / Math.sqrt(2.0);
  var SWISH_RADIUS = 2; // Radius for applying swish effect.
  var PARTIAL_CLEAR = 0.20; // Unused constant.

  // Direction vectors for neighbor calculations.
  var dirVecs = [
    [1, 0],
    [INV_SQRT_TWO, INV_SQRT_TWO],
    [0, 1],
    [-INV_SQRT_TWO, INV_SQRT_TWO],
    [-1, 0],
    [-INV_SQRT_TWO, -INV_SQRT_TWO],
    [0, -1],
    [INV_SQRT_TWO, -INV_SQRT_TWO]
  ];

  // Axis indices.
  var X0 = 0;
  var Y0 = 1;
  var X1 = 2;
  var Y1 = 3;

  // Enumeration for directions.
  var DIRS =
    {
      E: 0,
      NE: 1,
      N: 2,
      NW: 3,
      W: 4,
      SW: 5,
      S: 6,
      SE: 7
    };

  // Factory function for individual fluid cells.
  var cell_maker = function ( fluid, _x, _y ) {
    var my = {}; // Public methods/properties for a cell.
    my.pressure = 0; // Current pressure in the cell.
    my.flow = [0, 0]; // Current flow vector.

    // Private variables for the cell.
    var x = _x;
    var y = _y;
    var m_boundaryPotentials = [0, 0, 0, 0, 0, 0, 0, 0]; // Potentials across boundaries.
    var m_prevBoundaryPotentials = [0, 0, 0, 0, 0, 0, 0, 0]; // Previous potentials for conservation.
    var m_addedBoundaryFlow = [0, 0, 0, 0, 0, 0, 0, 0]; // Flow added by external forces.
    var m_neighbors = []; // References to neighboring cells, CCW from East.
    var m_isBlocked = []; // Boolean flags indicating blocked directions.

    // Helper function for dot product.
    function dotproduct( a, b ) {
      var n = 0, lim = Math.min(a.length, b.length);
      for ( var i = 0; i < lim; i++ ) n += a[i] * b[i];
      return n;
    }

    // Checks if a specific direction is blocked.
    function isDirBlocked( dir ) {
      return m_isBlocked[dir];
    }

    // Public methods for the cell object.

    // Finds and stores references to neighbor cells.
    my.findNeighbors = function () {
      m_neighbors[DIRS.E] = fluid.grid[Math.min(x + 1, FLUID_CELLS_X - 1)][y]; // East neighbor.
      m_neighbors[DIRS.NE] = fluid.grid[Math.min(x + 1, FLUID_CELLS_X - 1)][Math.min(y + 1, FLUID_CELLS_Y - 1)]; // North-East neighbor.
      m_neighbors[DIRS.N] = fluid.grid[x][Math.min(y + 1, FLUID_CELLS_Y - 1)]; // North neighbor.
      m_neighbors[DIRS.NW] = fluid.grid[Math.max(0, x - 1)][Math.min(y + 1, FLUID_CELLS_Y - 1)]; // North-West neighbor.
      m_neighbors[DIRS.W] = fluid.grid[Math.max(0, x - 1)][y]; // West neighbor.
      m_neighbors[DIRS.SW] = fluid.grid[Math.max(0, x - 1)][Math.max(0, y - 1)]; // South-West neighbor.
      m_neighbors[DIRS.S] = fluid.grid[x][Math.max(0, y - 1)]; // South neighbor.
      m_neighbors[DIRS.SE] = fluid.grid[Math.min(x + 1, FLUID_CELLS_X - 1)][Math.max(0, y - 1)]; // South-East neighbor.

      // Determine if boundaries are blocked (edge cells).
      m_isBlocked[DIRS.E] = (x === FLUID_CELLS_X - 1);
      m_isBlocked[DIRS.NE] = (x === FLUID_CELLS_X - 1 && y === 0);
      m_isBlocked[DIRS.N] = (y === 0);
      m_isBlocked[DIRS.NW] = (x === 0 && y == 0);
      m_isBlocked[DIRS.W] = (x === 0);
      m_isBlocked[DIRS.SW] = (x === 0 && y == FLUID_CELLS_Y - 1);
      m_isBlocked[DIRS.S] = (y == FLUID_CELLS_Y - 1);
      m_isBlocked[DIRS.SE] = (x === FLUID_CELLS_X - 1 && y == FLUID_CELLS_Y - 1);
    };


    // Resets cell's state.
    my.clear = function () {
      for ( var i = 0; i < 8; ++i ) {
        m_boundaryPotentials[i] = 0;
      }

      my.pressure = 0;
      my.flow = [0, 0];
    };

    // Calculates the net flow vector based on boundary potentials.
    my.calculateFlow = function () {
      my.flow = [0, 0];
      for ( var i = 0; i < 8; ++i ) {
        my.flow[0] = my.flow[0] + dirVecs[i][0] * m_boundaryPotentials[i] * 16;
        my.flow[1] = my.flow[1] + dirVecs[i][1] * m_boundaryPotentials[i] * 16;
      }
    };


    // Sums all positive boundary potentials.
    my.sumOfPositivePotentials = function () {
      var sum =
        (m_boundaryPotentials[0] > 0 ? m_boundaryPotentials[0] : 0) +
        (m_boundaryPotentials[1] > 0 ? m_boundaryPotentials[1] : 0) +
        (m_boundaryPotentials[2] > 0 ? m_boundaryPotentials[2] : 0) +
        (m_boundaryPotentials[3] > 0 ? m_boundaryPotentials[3] : 0) +
        (m_boundaryPotentials[4] > 0 ? m_boundaryPotentials[4] : 0) +
        (m_boundaryPotentials[5] > 0 ? m_boundaryPotentials[5] : 0) +
        (m_boundaryPotentials[6] > 0 ? m_boundaryPotentials[6] : 0) +
        (m_boundaryPotentials[7] > 0 ? m_boundaryPotentials[7] : 0);
      return sum;
    };

    // Calculates initial potentials based on pressure differences.
    my.calculatePotentials = function () {
      for ( var i = 0; i < 8; ++i ) {
        var other = m_neighbors[i];
        if ( isDirBlocked(i) ) other = my; // If blocked, treat as self (no flow).

        m_boundaryPotentials[i] = (my.pressure - other.pressure) * 0.0625; // Pressure differential.
        if ( i % 2 == 1 ) // Diagonal directions have reduced potential.
        {
          m_boundaryPotentials[i] *= 0.5; // *= INV_SQRT_TWO; - simplified factor.
        }
      }
    };

    // Distributes pressures to neighbors and updates own pressure.
    my.distributePressures = function () {
      for ( var i = 0; i < 8; ++i ) {
        // Apply conservation and added flow.
        m_boundaryPotentials[i] += CONSERVATION * m_prevBoundaryPotentials[i] + m_addedBoundaryFlow[i];

        if ( !isDirBlocked(i) ) {
          // Transfer pressure to neighbor.
          m_neighbors[i].pressure = m_neighbors[i].pressure + m_boundaryPotentials[i];
          my.pressure = my.pressure - m_boundaryPotentials[i]; // Decrease own pressure.
        }

        m_prevBoundaryPotentials[i] = m_boundaryPotentials[i]; // Store current potentials for next step.
        m_addedBoundaryFlow[i] = 0; // Reset added flow.
      }
    };


    // Adds an external flow vector to the cell's boundaries.
    my.addBoundaryFlow = function ( vec ) {
      var perpvec = [-vec[1], vec[0]]; // Perpendicular vector, currently unused.

      for ( var i = 0; i < 8; ++i ) {
        if ( isDirBlocked(i) ) {
          my.pressure = my.pressure + mag(vec); // If blocked, add pressure directly.
        }
        else {
          var dotVal = dotproduct(vec, dirVecs[i]); // Project vector onto direction.

          // Distribute flow to boundaries based on projection.
          m_addedBoundaryFlow[i] += dotVal * 0.25;
          m_addedBoundaryFlow[(i + 4) % 8] -= dotVal * 0.125;
          m_addedBoundaryFlow[(i - 4 + 8) % 8] -= dotVal * 0.125; // Ensure positive index.
        }
      }
    };

    return my; // Return the public interface of the cell.
  };

  // Applies a function to every cell in the grid.
  function applyToGrid( func ) {
    for ( var x = 0; x < FLUID_CELLS_X; x++ ) {
      for ( var y = 0; y < FLUID_CELLS_Y; y++ ) {
        func(my.grid[x][y]);
      }
    }
  }

  // Clears all cells in the grid.
  function clearGrid() {
    applyToGrid(function ( cell ) {
      cell.clear();
    });
  }

  // Calculates potentials for all cells.
  function calculatePotentials() {
    applyToGrid(function ( cell ) {
      cell.calculatePotentials();
    });
  }

  // Clears pressures for all cells (sets to 0).
  function clearPressures() {
    applyToGrid(function ( cell ) {
      // This method is not defined on cell_maker, likely a typo or removed feature.
      // Assuming it should set cell.pressure to 0.
      cell.pressure = 0;
    });
  }

  // Distributes pressures for all cells.
  function distributePressures() {
    applyToGrid(function ( cell ) {
      cell.distributePressures();
    });
  }

  // Multiplies pressure of all cells by a given multiplier.
  function multiplyPressures( multiplier ) {
    applyToGrid(function ( cell ) {
      cell.pressure = multiplier * cell.pressure;
    });
  }

  // Adjusts pressures across the grid so their sum is zero.
  function zeroSumPressures() {
    var pressureAdjuster = 0;
    // Calculate total pressure.
    for ( var x = 0; x < FLUID_CELLS_X; x++ ) {
      for ( var y = 0; y < FLUID_CELLS_Y; y++ ) {
        pressureAdjuster = pressureAdjuster + my.grid[x][y].pressure;
      }
    }
    // Calculate adjustment needed per cell.
    pressureAdjuster = pressureAdjuster / (-(FLUID_CELLS_X * FLUID_CELLS_Y));

    // Apply adjustment.
    for ( var x = 0; x < FLUID_CELLS_X; x++ ) {
      for ( var y = 0; y < FLUID_CELLS_Y; y++ ) {
        my.grid[x][y].pressure = my.grid[x][y].pressure + pressureAdjuster;
      }
    }
  }

  // Calculates flow for all cells.
  function calculateFlows() {
    applyToGrid(function ( cell ) {
      cell.calculateFlow();
    });
  }

  // Calculates the total sum of positive potentials across the grid.
  function totalPressurePotential() {
    var sum = 0;
    for ( var x = 0; x < FLUID_CELLS_X; x++ ) {
      for ( var y = 0; y < FLUID_CELLS_Y; y++ ) {
        sum = sum + my.grid[x][y].sumOfPositivePotentials();
      }
    }
    return sum;
  }

  // Main simulation step function.
  my.step = function () {
    // Clear pressures (make sum zero across grid).
    zeroSumPressures();
    // Calculate boundary potentials based on pressure differences.
    calculatePotentials();
    // Distribute pressures between cells.
    distributePressures();
    // Calculate the flow vector for each cell.
    calculateFlows();
  };

  // Finds the grid cell coordinates for given normalized (0-1) coordinates.
  function findCell( xCoord, yCoord ) {
    return [Math.floor(xCoord * FLUID_CELLS_X - 0.5 + FLUID_CELLS_X) % FLUID_CELLS_X,
      Math.floor(yCoord * FLUID_CELLS_Y - 0.5 + FLUID_CELLS_Y) % FLUID_CELLS_Y];
  }

  // Calculates the magnitude of a 2D vector.
  function mag( vec ) {
    //return fastSqrt_Bab(vec[0] * vec[0] + vec[1] * vec[1]); // Alternative fast sqrt.
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]); // Standard square root.
    //return fastSqrt(vec[0] * vec[0] + vec[1] * vec[1]); // Another fast sqrt.
  }

  // Applies a "swish" (external force/flow) to a region of cells.
  my.swish = function ( x, y, vecX, vecY ) {
    var center = findCell(x, y); // Get grid coordinates of the center.
    var xCenter = center[0] % FLUID_CELLS_X;
    var yCenter = center[1] % FLUID_CELLS_Y;

    var vec = [vecX, vecY]; // Original force vector.
    for ( var dx = -SWISH_RADIUS; dx <= SWISH_RADIUS; dx++ ) {

      // For toroidal mapping (commented out):
      //int xCell = (xCenter + dx + FLUID_CELLS_X) % FLUID_CELLS_X;

      // For bounded grid:
      var xCell = Math.max(0, Math.min(xCenter + dx, FLUID_CELLS_X - 1));

      for ( var dy = -SWISH_RADIUS; dy <= SWISH_RADIUS; dy++ ) {
        // Doing additive stuff here is quite controversial (original comment).

        // For toroidal mapping (commented out):
        //FluidCell* cell = grid()[xCell][(yCenter + dy + FLUID_CELLS_Y) % FLUID_CELLS_Y];

        // For bounded grid:
        var cell = my.grid[xCell][Math.max(0, Math.min(yCenter + dy, FLUID_CELLS_Y - 1))];

        // TODO: Falloff function here needs attention (original comment).
        var divisor = 1 + mag([dx, dy]); // Distance-based falloff.
        vec[0] = vecX / divisor;
        vec[1] = vecY / divisor;

        cell.addBoundaryFlow(vec); // Apply flow to the cell.
      }
    }
  };

  // Samples the fluid flow at a given normalized (0-1) coordinate using bilinear interpolation.
  my.sampleFlow = function ( x, y ) {

    //var sampleX = Math.max(0, Math.min(x, 0.999999999999)) * FLUID_CELLS_X;
    //var sampleY = Math.max(0, Math.min(y, 0.999999999999)) * FLUID_CELLS_Y;
    // It looks like individual bounds tests are faster than Math.min/max (original comment).

    var sampleX = x * FLUID_CELLS_X;
    var sampleY = y * FLUID_CELLS_Y;
    // Handle wrap-around or clamp if out of bounds (current implementation wraps).
    if ( sampleX >= FLUID_CELLS_X ) sampleX -= FLUID_CELLS_X;
    if ( sampleX < 0 ) sampleX = 0; // Clamp if negative.
    if ( sampleY >= FLUID_CELLS_Y ) sampleY -= FLUID_CELLS_Y;
    if ( sampleY < 0 ) sampleY = 0; // Clamp if negative.

    var baseX = Math.floor(sampleX);
    var fracX = sampleX - baseX; // Fractional part for interpolation.

    var baseY = Math.floor(sampleY);
    var fracY = sampleY - baseY; // Fractional part for interpolation.

    // Bilinear interpolation of flow vectors.
    return [my.grid[baseX][baseY].flow[0] * (1.0 - fracX) + my.grid[(baseX + 1) % FLUID_CELLS_X][baseY].flow[0] * fracX,
      my.grid[baseX][baseY].flow[1] * (1.0 - fracY) + my.grid[baseX][(baseY + 1) % FLUID_CELLS_Y].flow[1] * fracY];
  };

  my.grid = new Array(FLUID_CELLS_X); // Initialize grid structure.

  // Initialization function.
  function init() {
    // Create columns.
    for ( var i = 0; i < FLUID_CELLS_X; i++ ) {
      my.grid[i] = new Array(FLUID_CELLS_Y);
    }

    // Populate grid with cell objects.
    for ( var x = 0; x < FLUID_CELLS_X; x++ ) {
      for ( var y = 0; y < FLUID_CELLS_Y; y++ ) {
        my.grid[x][y] = cell_maker(my, x, y);
      }
    }

    // After all cells are created, find their neighbors.
    applyToGrid(function ( cell ) {
      cell.findNeighbors();
    });
  }

  init(); // Call initialization.
  return my; // Return the public API of the fluid simulation.
};