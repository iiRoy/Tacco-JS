//
// Copyright 2011-2012 Julian Pulgarin
//
// This software is licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.
// A copy of the License is available at:
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/*jslint plusplus:true, sloppy:true */ /*globals $, life, setInterval, clearInterval */


var Point = function (x, y)
{
    this.x = x; // X-coordinate of the point.
    this.y = y; // Y-coordinate of the point.
};




var graphics = (function () {

    var canvas,           // The HTML5 canvas element itself.
        ctx,              // The 2D rendering context of the canvas.
        canvasSelector,   // Selector string for the canvas element.
        cellSize = 10,    // Size of each cell in pixels. Default is 10.
        onColour = 'rgb(0, 0, 0)',      // Colour for "alive" cells (black).
        offColour = 'rgb(255, 255, 255)', // Colour for "dead" cells (white).
        gridColour = 'rgb(50, 50, 50)'; // Colour for the grid lines (dark grey).


    /**
     * Initializes the canvas and its 2D rendering context.
     * @param {string} canvasSelector - The CSS selector for the canvas element.
     */
    function initCanvas(canvasSelector) {
        graphics.canvas = $(canvasSelector).get(0); // Get the DOM element from jQuery object.
        graphics.ctx = graphics.canvas.getContext('2d'); // Obtain the 2D rendering context.
        graphics.canvasSelector = canvasSelector; // Store the selector for later use.
    }


    /**
     * Draws a single cell on the canvas.
     * @param {number} x     - The X-coordinate (column) of the cell in the grid.
     * @param {number} y     - The Y-coordinate (row) of the cell in the grid.
     * @param {boolean} alive - True if the cell is alive (onColour), false if dead (offColour).
     */
    function drawCell(x, y, alive) {
        graphics.ctx.fillStyle = (alive) ? onColour : offColour; // Set fill style based on cell state.
        // Fill a rectangle for the cell, leaving 1 pixel margin for grid lines.
        graphics.ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 1, cellSize - 1);
    }



    /**
     * Handles mouse events for drawing/toggling cells on the canvas.
     * Supports initial click and drag-to-draw functionality.
     * @param {MouseEvent} e - The mouse event object.
     */
    function handleMouse(e) {
        var that = this, // Reference to the canvas DOM element.
            state;       // The state (alive/dead) to set the cells to.

        /**
         * Calculates the grid coordinates (Point) of the cell under the mouse cursor.
         * @param   {MouseEvent} e - The mouse event object.
         * @returns {Point} A Point object representing the cell's grid coordinates.
         */
        function getCellPointUnderMouse(e) {
            return new Point(
                Math.floor((e.pageX - that.offsetLeft) / graphics.cellSize),
                Math.floor(((e.pageY - that.offsetTop) / graphics.cellSize))
            );
        }

        /**
         * Processes a given cell, toggling its state if it's the first cell,
         * or applying the determined state for subsequent cells during drag.
         * @param {Point} cell - The grid coordinates of the cell to process.
         */
        function processCell(cell) {
            var x = cell.x, // Cell's X-coordinate.
                y = cell.y; // Cell's Y-coordinate.

            // Ensure cell coordinates are within the grid bounds.
            if (x > life.xCells - 1 || y > life.yCells - 1) {
                return;
            }

            // Determine the state (alive/dead) for the current drawing operation.
            // If 'state' is undefined, this is the first cell clicked.
            if (typeof state === 'undefined') {
                state = !life.prev[x][y]; // Toggle the initial cell's state.
            }

            life.prev[x][y] = state; // Update the cell's state in the previous generation array.
            drawCell(x, y, state);   // Redraw the cell on the canvas.
        }

        // Process the cell initially clicked.
        processCell(getCellPointUnderMouse(e));

        // Attach a mousemove handler to the canvas for drag-to-draw.
        $(graphics.canvasSelector).mousemove(function (e) {
            processCell(getCellPointUnderMouse(e));
        });
    }

    /**
     * Efficiently paints only the cells that have changed state between generations.
     * This improves performance by reducing canvas redraw operations.
     */
    function smartPaint() {
        var x, y; // Loop counters for grid coordinates.

        // Iterate through all cells in the grid.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                // If the cell's state has changed from the previous generation to the next.
                if (life.prev[x][y] !== life.next[x][y]) {
                    graphics.drawCell(x, y, life.next[x][y]); // Redraw only the changed cell.
                }
            }
        }
    }


    /**
     * Paints all cells on the canvas based on their current state in `life.prev`.
     * This is a full redraw, typically used after initialization or clearing.
     */
    function paint() {
        var x, y; // Loop counters for grid coordinates.

        // Iterate through all cells in the grid.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                graphics.drawCell(x, y, life.prev[x][y]); // Draw each cell based on its 'prev' state.
            }
        }
    }


    // Public interface for the graphics module.
    return {
        canvas: canvas,             // Exposes the canvas DOM element (initially undefined).
        ctx: ctx,                   // Exposes the 2D rendering context (initially undefined).
        canvasSelector: canvasSelector, // Exposes the selector string.
        cellSize: cellSize,         // Exposes the cell size.
        onColour: onColour,         // Exposes the 'on' colour.
        offColour: offColour,       // Exposes the 'off' colour.
        gridColour: gridColour,     // Exposes the grid colour.
        initCanvas: initCanvas,     // Exposes the canvas initialization function.
        drawCell: drawCell,         // Exposes the function to draw a single cell.
        handleMouse: handleMouse,   // Exposes the mouse event handler.
        paint: paint,               // Exposes the full paint function.
        smartPaint: smartPaint      // Exposes the optimized paint function.
    };

}());



var life = (function () {

    var yCells,        // Number of cells in the Y-direction (rows).
        xCells,        // Number of cells in the X-direction (columns).
        prev = [],     // 2D array representing the previous generation's cell states.
        next = [],     // 2D array representing the next generation's cell states.
        speed = 100,   // Simulation speed in milliseconds per generation.
        timeout,       // Stores the ID of the setInterval timer.
        alive = false, // Boolean indicating if the simulation is running.
        x,             // Loop counter for X-coordinates.
        y;             // Loop counter for Y-coordinates.


    /**
     * Initializes the Game of Life universe, including canvas setup and grid drawing.
     * @param {string} canvasSelector - The CSS selector for the canvas element.
     */
    function initUniverse(canvasSelector) {
        graphics.initCanvas(canvasSelector); // Initialize the graphics canvas.

        // Calculate the number of cells based on canvas size and cell size.
        life.xCells = Math.floor((graphics.canvas.width - 1) / graphics.cellSize);
        life.yCells = Math.floor((graphics.canvas.height - 1) / graphics.cellSize);

        // Fill the entire canvas with the 'off' (dead) colour.
        graphics.ctx.fillStyle = graphics.offColour;
        graphics.ctx.fillRect(0, 0, life.xCells * graphics.cellSize, life.yCells * graphics.cellSize);

        graphics.ctx.fillStyle = graphics.gridColour; // Set fill style for grid lines.

        // Draw vertical grid lines and initialize prev/next arrays.
        for (x = 0; x < life.xCells; x++) {
            life.prev[x] = []; // Initialize inner array for 'prev'.
            life.next[x] = []; // Initialize inner array for 'next'.
            // Draw a vertical grid line.
            graphics.ctx.fillRect(x * graphics.cellSize, 0, 1, life.yCells * graphics.cellSize);
            for (y = 0; y < life.yCells; y++) {
                life.prev[x][y] = false; // All cells start as dead.
            }
        }
        // Draw the last vertical grid line on the right edge.
        graphics.ctx.fillRect(life.xCells * graphics.cellSize, 0, 1, life.yCells * graphics.cellSize);

        // Draw horizontal grid lines.
        for (y = 0; y < life.yCells; y++) {
            // Draw a horizontal grid line.
            graphics.ctx.fillRect(0, y * graphics.cellSize, life.xCells * graphics.cellSize, 1);
        }
        // Draw the last horizontal grid line on the bottom edge.
        graphics.ctx.fillRect(0, life.yCells * graphics.cellSize, life.xCells * graphics.cellSize, 1);

        // Attach mouse event handlers for user interaction.
        $(canvasSelector).mousedown(graphics.handleMouse);
        $('body').mouseup(function (e) {
            $(graphics.canvasSelector).unbind('mousemove'); // Unbind mousemove on mouseup to stop dragging.
        });
    }


    /**
     * Counts the number of living neighbours for a given cell.
     * Uses toroidal (wraparound) boundary conditions.
     * @param   {number} x - The X-coordinate of the cell.
     * @param   {number} y - The Y-coordinate of the cell.
     * @returns {number} The count of living neighbours (0-8).
     */
    function neighbourCount(x, y) {
        var l = life,     // Shorthand for the life module.
            count = 0,    // Counter for living neighbours.
            i,            // Loop counter.
            neighbours = [// Array of neighbour states (true for alive, false for dead).
                life.prev[x][(y - 1 + life.yCells) % life.yCells],                                        // North
                life.prev[(x + 1 + life.xCells) % life.xCells][(y - 1 + life.yCells) % life.yCells],     // North-East
                life.prev[(x + 1 + life.xCells) % life.xCells][y],                                        // East
                life.prev[(x + 1 + life.xCells) % life.xCells][(y + 1 + life.yCells) % life.yCells],     // South-East
                life.prev[x][(y + 1 + life.yCells) % life.yCells],                                        // South
                life.prev[(x - 1 + life.xCells) % life.xCells][(y + 1 + life.yCells) % life.yCells],     // South-West
                life.prev[(x - 1 + life.xCells) % life.xCells][y],                                        // West
                life.prev[(x - 1 + life.xCells) % life.xCells][(y - 1 + life.yCells) % life.yCells]      // North-West
            ];

        // Iterate through the neighbours array and count living ones.
        for (i = 0; i < neighbours.length; i++) {
            if (neighbours[i]) {
                count++;
            }
        }

        return count; // Return the total count of living neighbours.
    }


    /**
     * Calculates the next generation of cells based on Conway's Game of Life rules.
     * Updates the `life.next` array and then copies it to `life.prev`.
     */
    function nextGen() {
        var l = life,      // Shorthand for the life module.
            g = graphics,  // Shorthand for the graphics module.
            count;         // Variable to store neighbour count.

        // Initialize next generation array to match current generation.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.next[x][y] = life.prev[x][y];
            }
        }

        // Apply Game of Life rules to determine the state of each cell in the next generation.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                count = neighbourCount(x, y); // Get the number of living neighbours.

                // Rule 1 & 3: Underpopulation and Overpopulation
                if (prev[x][y]) { // If the cell is currently alive.
                    if (count < 2 || count > 3) {
                        next[x][y] = false; // It dies.
                    }
                    // Rule 2: Survival (2 or 3 neighbours, it lives on, no change needed as next[x][y] was already prev[x][y])
                } else if (count === 3) { // Rule 4: Reproduction (If dead and exactly 3 neighbours).
                    next[x][y] = true;    // It becomes alive.
                }
            }
        }

        graphics.smartPaint(); // Update the canvas, drawing only changed cells.

        // Copy the next generation states to the previous generation for the next cycle.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.prev[x][y] = life.next[x][y];
            }
        }
    }


    /**
     * Toggles the simulation between running and paused states.
     * Starts `setInterval` when running, clears it when paused.
     */
    function toggleLife() {
        if (!alive) {
            alive = true; // Set simulation state to running.
            timeout = setInterval(life.nextGen, this.speed); // Start the generation loop.
        } else {
            alive = false; // Set simulation state to paused.
            clearInterval(timeout); // Stop the generation loop.
        }
    }


    /**
     * Parses and loads a pattern from a Run Length Encoded (RLE) file.
     * Adjusts canvas size and re-initializes the universe to fit the pattern.
     * @param {string} url - The URL of the RLE pattern file.
     */
    function loadPattern(url) {
        var g = graphics, // Shorthand for graphics module.
            l = life,     // Shorthand for life module.
            padding = 30; // Padding around the loaded pattern.

        $.ajax({
            url: url, // The URL to fetch the RLE data from.
            success: function (data) {
                var match = data.match(/x\s=\s(\d*).*?y\s=\s(\d*).*\r([^]*)!/), // Regex to extract dimensions and pattern data.
                    x = parseInt(match[1], 10), // Width of the pattern.
                    pattern = match[3].replace(/\s+/g, ""), // Raw RLE pattern string, whitespace removed.
                    lines = pattern.split('$'), // Split pattern into individual rows.
                    offset = 0, // Not used in this version, but present in original logic.
                    i,          // Loop counter for lines.
                    line,       // Current line of the RLE pattern.
                    length,     // Number of consecutive cells of the same type.
                    j,          // Loop counter for cells within a segment.
                    y = padding - 1; // Starting Y-coordinate for placing the pattern.

                // Adjust canvas dimensions to fit the pattern with padding.
                $(graphics.canvasSelector).attr('height', graphics.cellSize * (y + 1 + (padding * 2)));
                $(graphics.canvasSelector).attr('width', graphics.cellSize * (x + 1 + (padding * 2)));

                $(graphics.canvasSelector).unbind('mousedown'); // Remove previous mouse handlers.
                life.initUniverse(graphics.canvasSelector);     // Re-initialize the universe with new dimensions.


                for (i = 0; i < lines.length; i++) { // Iterate through each line of the RLE pattern.
                    y++;         // Move to the next row on the grid.
                    x = padding; // Reset X-coordinate for the start of the current line.
                    line = lines[i]; // Get the current line.

                    while (line) { // Process the line until it's empty.
                        if (line.charAt(0) === 'o' || line.charAt(0) === 'b') { // If a single 'o' (alive) or 'b' (dead) cell.
                            if (line.charAt(0) === 'o') {
                                life.prev[x][y] = true; // Set cell to alive.
                                graphics.drawCell(x, y, true); // Draw it.
                            }
                            x++; // Move to the next cell horizontally.
                            line = line.substring(1); // Remove the processed character.
                        } else { // If a run-length encoded segment (e.g., '3o', '5b').
                            length = line.match(/(\d*)/)[1]; // Extract the numerical length.
                            line = line.substring(length.length); // Remove the length from the string.
                            length = parseInt(length, 10); // Convert length to an integer.

                            if (!line) { // If the line ends with a number (e.g., '3$').
                                y += length - 1; // Advance rows by the specified length.
                                break; // Break from inner while loop, move to next pattern line.
                            }

                            if (line.charAt(0) === 'o') { // If the segment is for 'alive' cells.
                                for (j = 0; j < length; j++) {
                                    life.prev[x + j][y] = true;    // Set cells to alive.
                                    graphics.drawCell(x + j, y, true); // Draw them.
                                }
                            }
                            x += length; // Advance X-coordinate by the length of the segment.
                            line = line.substring(1); // Remove the 'o' or 'b' character.
                        }
                    }
                }
            }
        });
    }


    /**
     * Checks if the simulation is currently running.
     * @returns {boolean} True if the simulation is active, false otherwise.
     */
    function isAlive() {
        return alive;
    }


    /**
     * Changes the simulation speed.
     * @param {boolean} faster - True to increase speed (decrease interval), false to decrease speed.
     */
    function changeSpeed(faster) {
        if (faster) {
            if (life.speed === 0) { // Minimum speed reached.
                return;
            }
            life.speed -= 10; // Decrease interval (make it faster).

        } else {
            if (life.speed === 1000) { // Maximum speed reached.
                return;
            }
            life.speed += 10; // Increase interval (make it slower).
        }

        // If simulation is running, restart the interval with the new speed.
        if (alive) {
            clearInterval(timeout);                 // Stop current interval.
            timeout = setInterval(life.nextGen, life.speed); // Start new interval with updated speed.
        }
    }


    /**
     * Clears all cells on the grid, setting them to dead.
     * Redraws the canvas to reflect the cleared state.
     */
    function clear() {
        var x, y; // Loop counters.

        // Set all cells in the 'next' generation to dead.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.next[x][y] = false;
            }
        }

        graphics.smartPaint(); // Efficiently redraw the canvas (all cells will turn off).

        // Copy the 'next' (all dead) state to 'prev'.
        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.prev[x][y] = false;
            }
        }
    }


    // Public interface for the life module.
    return {
        yCells: yCells,             // Exposes the number of Y-cells.
        xCells: xCells,             // Exposes the number of X-cells.
        prev: prev,                 // Exposes the previous generation array.
        next: next,                 // Exposes the next generation array.
        universe: prev,             // Alias for the previous generation (current state).
        speed: speed,               // Exposes the current simulation speed.
        initUniverse: initUniverse, // Exposes the universe initialization function.
        nextGen: nextGen,           // Exposes the function to calculate the next generation.
        toggleLife: toggleLife,     // Exposes the function to start/stop the simulation.
        isAlive: isAlive,           // Exposes the function to check simulation status.
        clear: clear,               // Exposes the function to clear the grid.
        changeSpeed: changeSpeed,   // Exposes the function to adjust simulation speed.
        loadPattern: loadPattern    // Exposes the RLE pattern loading function.
    };
}());