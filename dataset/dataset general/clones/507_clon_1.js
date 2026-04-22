/* global window, document, $ */
/*
 * This script implements a Game of Life simulation.
 * Each cell's state is encoded in a 24-bit Number,
 * allowing for multiple independent games of life within the same cell.
 * The primary state array is STATE_CUR, and STATE_NEXT holds the computed
 * next generation.
 * The cell_index function provides a 1D array index for a given (row, col) pair.
 *
 * To ensure smooth animation and prevent garbage collection pauses,
 * memory allocations are strictly avoided during the simulation loop.
 *
 * Key functions:
 * - iterate(): Calculates the subsequent generation's state and updates the current state.
 * - update_display(): Renders the current grid state onto the HTML canvas.
 */


// Define grid dimensions.
var    COLS = 100;
var   ROWS = 100;

// The total number of cells in the grid.
// Note: An extra row/column might be conceptually added for boundary handling in some algorithms,
// but for this implementation, the grid size is strictly COLS x ROWS.
var num_cells = COLS * ROWS;

// Arrays to store the current and next states of the cells.
// These are pre-allocated to prevent GC during animation.
var STATE_CUR = new Array(num_cells);
var STATE_NEXT = new Array(num_cells);

// Canvas-related variables for rendering.
var canvas;     /* Reference to the HTML <canvas> element. */
var ctx;        /* The 2D rendering context of the canvas. */
var img_data;   /* ImageData object, a buffer for pixel manipulation. */

// Simulation control variables.
var interval_id; /* Stores the ID returned by setInterval for stopping the simulation. */
var playing;     /* Boolean flag: true if the simulation is running, false otherwise. */

/*
 * Sets the color for a specific cell in the given state array.
 * The color is stored as an inverted 24-bit RGB value.
 * (0xffffff - (r << 16 | g << 8 | b)) effectively.
 */
function set_cell_color( state, cell_id, r, g, b )
{
   // The game's display logic treats white as dead and black as alive.
   // Thus, the colors are inverted when stored to simplify rendering later.
   state[cell_id] = ~Number((r << 16) + (g << 8) + b) & 0xffffff;
}

// Utility function to convert 2D grid coordinates (column, row) into a 1D array index.
function cell_index( col, row )
{
   return row * COLS + col;
}

/*
 * Calculates the optimal block size (width/height of each cell on screen)
 * based on the current window dimensions and grid size.
 * Ensures the grid fits within the viewport.
 */
function get_blocksize()
{
   var   width  =  window.innerWidth;
   var   height =  window.innerHeight;

   // Determine the largest block size that allows the entire grid to be visible.
   return Math.max( Math.ceil( width / COLS ), Math.ceil( height / ROWS ) );
}

/*
 * Renders the current state of the game grid onto the canvas.
 * This function dynamically adjusts the canvas size and cell rendering
 * based on the window's dimensions.
 */
function update_display()
{
   var row, col, brow, bcol; // Loop iterators for grid and block pixels.
   var color;                // Holds the calculated color for a cell.
   var idx;                  // Index into the ImageData buffer.

   var width = window.innerWidth;   // Current viewport width.
   var height = window.innerHeight; // Current viewport height.
   var blocksize = get_blocksize(); // Size of each rendered cell block.

   // Re-initialize canvas and ImageData if window dimensions have changed
   // or if img_data is not yet set.
   if ( !img_data || canvas.width !== width || canvas.height !== height )
   {
      canvas.setAttribute( 'width', width );
      canvas.setAttribute( 'height', height );
      // Create a new ImageData object with dimensions based on blocksize and grid.
      img_data = ctx.createImageData( blocksize * COLS, blocksize * ROWS );
   }

   // Using createImageData and putImageData is significantly faster
   // than repeated fillStyle and fillRect calls, especially in Chrome.
   var stride = blocksize * COLS; // Pixel width of the ImageData buffer.

   // Iterate through each cell in the grid.
   for ( row = 0; row < ROWS; row++ )
   {
      // Optimization: Stop drawing if current row is off-screen.
      if ( row * blocksize > height ) { break; }

      for ( col = 0; col < COLS; col++ )
      {
         // Optimization: Stop drawing if current column is off-screen.
         if ( col * blocksize > width ) { break; }

         // Retrieve the cell's color (inverted from storage).
         color = ~STATE_CUR[ cell_index( col, row ) ] & 0xffffff;

         // Fill the block of pixels corresponding to this cell.
         for ( brow = 0; brow < blocksize; brow++ )
         {
            for ( bcol = 0; bcol < blocksize; bcol++ )
            {
               // Calculate the 1D index in the img_data.data array.
               // Each pixel uses 4 bytes (RGBA).
               idx = ( ( row * blocksize + brow ) * stride + ( col * blocksize + bcol ) ) * 4;

               // Set RGBA values for the current pixel.
               img_data.data[ idx     ] = ( color >> 16 ) & 0xff; // Red component
               img_data.data[ idx + 1 ] = ( color >> 8  ) & 0xff; // Green component
               img_data.data[ idx + 2 ] = ( color >> 0  ) & 0xff; // Blue component
               img_data.data[ idx + 3 ] = 0xff;                   // Alpha component (fully opaque)
            }
         }
      }
   }
   // Write the pixel data from the buffer to the canvas.
   ctx.putImageData( img_data, 0, 0 );
}

/*
 * Resets all cells on the game board to a 'dead' state (color 0).
 * Afterwards, the display is refreshed to reflect the empty board.
 */
function clear_board()
{
   var i; // Loop counter.

   // Iterate through all cells and set their state to 0.
   for ( i = 0; i < num_cells; i++ )
   {
      STATE_CUR[i] = Number(0); // Explicitly setting to Number(0) for clarity.
   }
   // Update the graphical display of the board.
   update_display();
}

/*
 * Assigns a random color to each cell on the board.
 * This is primarily for visual variety in the simulation.
 */
function randomize_colors()
{
   var row, col;  // Grid coordinates.
   var r, g, b;   // RGB color components.

   // Loop over every cell in the grid.
   for ( row = 0; row < ROWS; row++ )
   {
      for ( col = 0; col < COLS; col++ )
      {
         // Generate random RGB values for the cell.
         r = Math.round( Math.random() * 255 );
         g = Math.round( Math.random() * 255 );
         b = Math.round( Math.random() * 255 );

         // Apply the generated color to the current cell's state.
         set_cell_color( STATE_CUR, cell_index( col, row ), r, g, b );
      }
   }
   // Refresh the display to show the newly randomized colors.
   update_display();
}

/*
 * Computes the next generation of the Game of Life for all cells.
 * This function uses a 24-way parallel bitwise counter to efficiently
 * determine the number of live neighbors for each cell.
 * The logic applies Conway's rules for cell survival/death.
 */
function iterate()
{
   var row, col, cell_id;                 // Grid coordinates and 1D index.
   var s0, s1, s2;                        // Bitwise counters for live neighbors.
   var nrow, ncol, ncolw, nroww, n;       // Neighbor coordinates and neighbor cell state.

   // Iterate through each cell in the grid to calculate its next state.
   for ( row = 0; row < ROWS; row++ )
   {
      for ( col = 0; col < COLS; col++ )
      {
         cell_id = cell_index( col, row ); // Get the 1D index for the current cell.

         // Initialize the 3-bit parallel counter for live neighbors.
         // Each bit position (0-23) represents a separate game of life.
         s0 = 0; // Least significant bit of the neighbor count.
         s1 = 0; // Middle bit of the neighbor count.
         s2 = 0; // Most significant bit of the neighbor count.

         // Iterate through the 8 neighbors of the current cell.
         for ( nrow = row - 1; nrow <= row + 1; nrow++ )
         {
            for ( ncol = col - 1; ncol <= col + 1; ncol++ )
            {
               // Skip the current cell itself; we only count neighbors.
               if ( nrow === row && ncol === col ) { continue; }

               // Handle wrap-around for toroidal grid boundaries.
               ncolw = ( ncol + COLS ) % COLS;
               nroww = ( nrow + ROWS ) % ROWS;

               // Get the state of the neighbor cell.
               n = STATE_CUR[ cell_index( ncolw, nroww ) ];

               // Perform 24-way parallel addition using bitwise XOR and AND.
               // This effectively counts the number of '1' bits in 'n' across 24 channels.
               s2 ^= s1 & s0 & n; // Carry into bit 2.
               s1 ^= s0 & n;     // Carry into bit 1.
               s0 ^= n;          // Add 1 to bit 0.
            }
         }

         // Apply Conway's Game of Life rules using the parallel neighbor count (s2, s1, s0).
         // The rules are:
         // 1. A live cell with 2 or 3 live neighbours survives.
         // 2. A dead cell with 3 live neighbours becomes a live cell.
         // 3. All other live cells die. All other dead cells remain dead.
         // The expression `~s2 & s1 & (STATE_CUR[cell_id] | s0)` implements this.
         //
         // Truth table for new state (c') based on current state (c) and neighbor count (s2,s1,s0):
         // c | s2 | s1 | s0 | count | c'
         // --|----|----|----|-------|----
         // 0 | 0  | 0  | 0  | 0     | 0
         // 0 | 0  | 0  | 1  | 1     | 0
         // 0 | 0  | 1  | 0  | 2     | 0
         // 0 | 0  | 1  | 1  | 3     | 1  <-- Birth
         // 0 | 1  | 0  | 0  | 4     | 0
         // ...
         // 1 | 0  | 0  | 0  | 0     | 0
         // 1 | 0  | 0  | 1  | 1     | 0
         // 1 | 0  | 1  | 0  | 2     | 1  <-- Survival
         // 1 | 0  | 1  | 1  | 3     | 1  <-- Survival
         // 1 | 1  | 0  | 0  | 4     | 0
         // ...
         // The `& 0xffffff` ensures that only the relevant 24 bits are considered,
         // effectively masking any sign extension from the `~` operator.
         STATE_NEXT[cell_id] = ~s2 & s1 & (STATE_CUR[cell_id] | s0) & 0xffffff;
      }
   }

   // Swap the current and next state arrays.
   // This avoids copying large arrays and is very efficient.
   var t = STATE_CUR;
   STATE_CUR = STATE_NEXT;
   STATE_NEXT = t;

   // Update the visual representation of the grid.
   update_display();
}

/*
 * Loads a predefined pattern onto the game board.
 * The 'idx' parameter selects which preset to load.
 * After loading, the display is updated.
 */
function preset( idx )
{
   // Default to preset 0 if no index is provided.
   idx = idx || 0;

   // Inner helper function to create a closure for setting cell colors.
   function set_color( r, g, b )
   {
      // Returns a function suitable for use with jQuery's .map().
      // The `_` parameter is the array index, `x` is the coordinate pair `[col, row]`.
      return function( _, x )
      {
         set_cell_color( STATE_CUR, cell_index( x[0], x[1] ), r, g, b );
      };
   }

   // Use a switch statement to apply different predefined patterns.
   switch ( idx )
   {
      case 0: // Preset 0: A specific configuration of colored lines.
         // Row 23 cells.
         $( [ [41,23], [42,23], [43,23], [44,23], [45,23], [46,23], [47,23], [48,23],
             [41,26], [42,26], [43,26], [44,26], [45,26], [46,26], [47,26], [48,26] ]
         ).map( set_color( 54, 99, 204 ) ); // Blueish color.

         // Row 22 and 27 cells.
         $( [ [41,22], [42,22], [43,22], [44,22], [45,22], [46,22], [47,22], [48,22],
             [41,27], [42,27], [43,27], [44,27], [45,27], [46,27], [47,27], [48,27] ]
         ).map( set_color( 40, 187, 130 ) ); // Greenish color.

         // Row 21 and 28 cells.
         $( [ [41,21], [42,21], [43,21], [44,21], [45,21], [46,21], [47,21], [48,21],
             [41,28], [42,28], [43,28], [44,28], [45,28], [46,28], [47,28], [48,28] ]
         ).map( set_color( 170, 37, 37 ) ); // Reddish color.
         break;

      case 1: // Preset 1: Another complex pattern with multiple lines.
         // Cells in row 25.
         $( [ [25,25], [26,25], [27,25], [28,25], [29,25], [30,25], [31,25], [32,25],
             [34,25], [35,25], [36,25], [37,25], [38,25], [42,25], [43,25], [44,25],
             [51,25], [52,25], [53,25], [54,25], [55,25], [56,25], [57,25], [59,25],
             [60,25], [61,25], [62,25], [63,25] ]
         ).map( set_color( 25, 57, 150 ) ); // Dark blue.

         // Cells in row 26.
         $( [ [25,26], [26,26], [27,26], [28,26], [29,26], [30,26], [31,26], [32,26],
             [34,26], [35,26], [36,26], [37,26], [38,26], [42,26], [43,26], [44,26],
             [51,26], [52,26], [53,26], [54,26], [55,26], [56,26], [57,26], [59,26],
             [60,26], [61,26], [62,26], [63,26] ]
         ).map( set_color( 57, 150, 25 ) ); // Green.

         // Cells in row 27.
         $( [ [25,27], [26,27], [27,27], [28,27], [29,27], [30,27], [31,27], [32,27],
             [34,27], [35,27], [36,27], [37,27], [38,27], [42,27], [43,27], [44,27],
             [51,27], [52,27], [53,27], [54,27], [55,27], [56,27], [57,27], [59,27],
             [60,27], [61,27], [62,27], [63,27] ]
         ).map( set_color( 150, 57, 25 ) ); // Orange-red.
         break;

      case 3: // Preset 3: A simple 'glider' pattern.
         // A classic Game of Life glider, usually starts with 5 cells.
         $( [ [0, 1], [1,2], [2,0], [2,1], [2,2] ] ).map( set_color( 0,0,0 ) ); // Black color.
         break;
   }
   // Refresh the display after loading the preset.
   update_display();
}

/*
 * Determines the grid (row, col) coordinates corresponding to a mouse event.
 * This is used for interactive drawing on the canvas.
 */
function get_pencil_pos( evt )
{
   var offset = $( '#display' ).offset(); // Get the canvas's position relative to the document.
   var blocksize = get_blocksize();       // Get the current size of a rendered cell.

   // Calculate column and row by converting pixel coordinates to grid coordinates.
   var col = Math.floor( ( evt.clientX - offset.left ) / blocksize );
   var row = Math.floor( ( evt.clientY - offset.top ) / blocksize );

   // Return an object containing the calculated row and column.
   return {
      row: row,
      col: col
   };
}

/*
 * Global variables for managing the interactive 'pencil' drawing tool.
 */
var in_pencil = false;                  // Flag: true if pencil mode is active.
var pencil_color = { r:0, g:0, b:0 };   // The RGB color currently selected for drawing.
var is_pencil_down = false;             // Flag: true if mouse button is currently pressed while in pencil mode.
var cur_pencil_col = null;              // Stores the column of the last drawn cell to prevent redundant drawing.
var cur_pencil_row = null;              // Stores the row of the last drawn cell.

/*
 * Event handler for mouse down when the pencil tool is active.
 * Marks the pencil as 'down' and draws a cell at the initial click position.
 */
function on_pencil_down( evt )
{
   is_pencil_down = true; // Activate drawing state.
   var pos = get_pencil_pos( evt ); // Get grid coordinates from mouse event.

   // Set the color of the cell at the clicked position.
   set_cell_color( STATE_CUR, cell_index( pos.col, pos.row ),
                   pencil_color.r, pencil_color.g, pencil_color.b );

   // If the simulation is paused, update the display immediately.
   if ( !playing )
   {
      update_display();
   }
}

/*
 * Event handler for mouse up when the pencil tool is active.
 * Deactivates the drawing state.
 */
function on_pencil_up()
{
   is_pencil_down = false; // Deactivate drawing state.
}

/*
 * Event handler for mouse move when the pencil tool is active and mouse is down.
 * Draws cells as the mouse drags, but only if the mouse moves to a new cell.
 */
function on_pencil_move( evt )
{
   if ( is_pencil_down ) // Only draw if the mouse button is held down.
   {
      var pos = get_pencil_pos( evt ); // Get current grid coordinates.

      // Check if the mouse has moved to a new cell since the last draw.
      if ( pos.row !== cur_pencil_row || pos.col !== cur_pencil_col )
      {
         // Draw the cell with the selected pencil color.
         set_cell_color( STATE_CUR, cell_index( pos.col, pos.row ),
                         pencil_color.r, pencil_color.g, pencil_color.b );

         // If simulation is paused, update display immediately.
         if ( !playing )
         {
            update_display();
         }
      }
      // Update the last drawn cell coordinates.
      cur_pencil_row = pos.row;
      cur_pencil_col = pos.col;
   }
}

/*
 * Toggles the state of the pencil drawing tool.
 * When activated, it attaches mouse event handlers to the display canvas
 * and updates the UI to reflect the active state.
 * When deactivated, it removes the event handlers and reverts UI changes.
 */
function toggle_pencil()
{
   in_pencil = !in_pencil; // Flip the pencil tool state.

   if ( in_pencil ) // If pencil mode is now ON.
   {
      // Attach event listeners for drawing.
      $( '#display' ).on( 'mousedown.pencil', on_pencil_down );
      $( '#display' ).on( 'mousemove.pencil', on_pencil_move );
      $( '#display' ).on( 'mouseup.pencil',   on_pencil_up   );

      // Add CSS class to indicate pencil mode is active (e.g., change cursor).
      $( '#display' ).addClass( 'pencil' );
      $( '#pencil-btn' ).addClass( 'selected' ); // Highlight the pencil button.
   }
   else // If pencil mode is now OFF.
   {
      // Remove previously attached event listeners.
      $( '#display' ).off( 'mousedown.pencil' );
      $( '#display' ).off( 'mousemove.pencil' );
      $( '#display' ).off( 'mouseup.pencil'   );

      // Remove CSS class and unhighlight the pencil button.
      $( '#display' ).removeClass( 'pencil' );
      $( '#pencil-btn' ).removeClass( 'selected' );
   }
}

/*
 * Starts the Game of Life simulation.
 * Sets the 'playing' flag and establishes an interval timer
 * to call the 'iterate' function periodically.
 * Updates the UI to show the 'pause' button and hide the 'play' button.
 */
function play()
{
   playing = true; // Set simulation state to active.
   // Start the simulation loop, calling iterate() every 100 milliseconds.
   interval_id = setInterval( iterate, 100 );

   $( '#play' ).hide();  // Hide the "Play" button.
   $( '#pause' ).show(); // Show the "Pause" button.
}

/*
 * Pauses the Game of Life simulation.
 * Clears the interval timer and updates the UI to show the 'play' button.
 */
function pause()
{
   playing = false; // Set simulation state to inactive.
   clearInterval( interval_id ); // Stop the simulation interval.

   $( '#play' ).show();  // Show the "Play" button.
   $( '#pause' ).hide(); // Hide the "Pause" button.
}

/*
 * Document ready function (jQuery shorthand).
 * This code executes once the DOM is fully loaded.
 * It initializes the canvas, sets up event listeners,
 * and starts the Game of Life simulation.
 */
$( function()
{
   // Get references to the canvas element and its 2D rendering context.
   canvas = document.getElementById( 'display' );
   ctx    = canvas.getContext( '2d' );

   // Attach click handler to the pencil button to toggle the drawing tool.
   $( '#pencil-btn' ).click( toggle_pencil );

   // Initialize the ColorPicker plugin for the pencil button.
   $( '#pencil-btn' ).ColorPicker( {
      onShow: function()
      {
         // Only show the color picker if the pencil tool is currently active.
         return in_pencil;
      },
      onChange: function( hsb, hex, rgb )
      {
         // Update the global pencil_color object with the newly selected RGB values.
         pencil_color = rgb;
         // Update the visual swatch element to reflect the new color.
         $( '#swatch' ).css( 'background-color', '#' + hex );
      }
   } );

   // Attach a resize event handler to the window.
   $( window ).resize( function()
   {
      // If the simulation is not playing, update the display
      // to re-render the grid based on the new window size.
      if ( !playing )
      {
         update_display();
      }
   } );

   // Initial setup of the game board.
   clear_board();         // Clear all cells.
   randomize_colors();    // Assign random colors to cells.
   play();                // Start the simulation.
} );