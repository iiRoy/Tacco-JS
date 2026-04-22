/*
 * This file demonstrates the usage of a 'grid' module, provided as a dependency,
 * to render various types of grid patterns onto an HTML5 canvas element.
 *
 * The script initializes the canvas, sets its dimensions to fill the browser window,
 * and then proceeds to call a specific function (`all()`) which draws
 * a composite view showcasing multiple distinct grid patterns simultaneously.
 */
require([ "grid" ], function ( grid ) {
    
    // Declare and initialize variables related to the canvas element and its rendering context.
    // The canvas dimensions are dynamically set to match the current browser window's inner size.
    var canvas  =   document.getElementById( "canvas" ) ,   // Reference to the main HTML canvas element.
        context =   canvas.getContext( "2d" )       ,   // The 2D rendering context for drawing operations.
        width   =   canvas.width    =   window.innerWidth   ,   // Canvas width, dynamically set to window's inner width.
        height  =   canvas.height   =   window.innerHeight  ;   // Canvas height, dynamically set to window's inner height.

    /*
     * The following function calls are intentionally commented out.
     * Each line represents an individual grid rendering function that can be
     * uncommented to display that specific grid type across the entire canvas.
     * By default, only the 'all()' function is active, which renders a
     * comprehensive layout of all available grid patterns in smaller sections.
     */
    // colorMinMaj();   // Example: Sets custom colors for major, minor, and third grid lines.
    // square();        // Example: Draws a standard square grid.
    // rect();          // Example: Draws a simple rectangular grid.
    // isometric();     // Example: Draws an isometric projection grid.
    // dimetric();      // Example: Draws a dimetric projection grid.
    // isodimetric();   // Example: Draws both isometric and dimetric grids side-by-side.
    // hex();           // Example: Draws a hexagonal grid pattern.
    // polar();         // Example: Draws a polar coordinate system grid.
    // dots();          // Example: Draws a grid composed of individual dots.
    // hexDots();       // Example: Draws a hexagonal grid using dots.
    // plus();          // Example: Draws a grid composed of plus (+) symbols.
    // celtic();        // Example: Draws a decorative Celtic knot-like grid design.
    // triangle();      // Example: Draws a grid based on triangular shapes.
    
    // Call the primary function responsible for rendering the composite grid view.
    all();



    /**
     * Function: colorMinMaj
     *
     * Description:
     *   This function is designed to configure the stroke and fill styles
     *   for major, minor, and third-level grid lines and areas within the 'grid' module.
     *   It does not perform any drawing operations itself, but rather sets
     *   properties that subsequent grid rendering functions might utilize.
     */
    function colorMinMaj () {
        grid.majorStrokeStyle = "blue"  ;   // Assigns "blue" as the color for major grid lines.
        grid.minorStrokeStyle = "red"   ;   // Assigns "red" as the color for minor grid lines.
        grid.thirdStrokeStyle = "green" ;   // Assigns "green" as the color for third-level grid lines.

        grid.majorFillStyle   = "blue"  ;   // Assigns "blue" as the fill color for major grid areas.
        grid.minorFillStyle   = "red"   ;   // Assigns "red" as the fill color for minor grid areas.
    }



    /**
     * Function: square
     *
     * Description:
     *   Renders a standard square grid pattern across the entire canvas area.
     *   This grid is characterized by uniform spacing in both horizontal and vertical directions.
     *
     * Parameters:
     *   - context: The 2D rendering context of the canvas.
     *   - 0, 0, width, height: Defines the full bounding box of the canvas for the grid.
     *   - 50: The major spacing unit for the grid lines.
     *   - 25: The minor spacing unit, typically half of the major spacing.
     *   - 12.5: The sub-minor spacing unit, typically half of the minor spacing.
     */
    function square () {
        grid.square( context, 0, 0, width, height, 50, 25, 12.5 );
    }



    /**
     * Function: rect
     *
     * Description:
     *   Draws a rectangular grid on the canvas, similar to a square grid
     *   but potentially allowing for different major and minor axis definitions.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the grid, covering the whole canvas.
     *   - 50: The major spacing value.
     *   - 25: The minor spacing value.
     */
    function rect () {
        grid.rect( context, 0, 0, width, height, 50, 25 );
    }



    /**
     * Function: isometric
     *
     * Description:
     *   Renders an isometric projection grid, which is commonly used
     *   for drawing 3D objects on a 2D plane without perspective.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the isometric grid.
     *   - 50: The base spacing unit for the isometric lines.
     */
    function isometric () {
        grid.isometric( context, 0, 0, width, height, 50 );
    }



    /**
     * Function: dimetric
     *
     * Description:
     *   Draws a dimetric projection grid, another form of axonometric projection.
     *   In a dimetric projection, two of the three axes have equal foreshortening.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the dimetric grid.
     *   - 50: The base spacing unit for the dimetric lines.
     */
    function dimetric () {
        grid.dimetric( context, 0, 0, width, height, 50 );
    }



    /**
     * Function: isodimetric
     *
     * Description:
     *   Renders both an isometric and a dimetric grid simultaneously.
     *   The canvas is split horizontally, with the isometric grid occupying
     *   the left half and the dimetric grid occupying the right half.
     */
    function isodimetric () {
        // Draw the isometric grid on the left half of the canvas.
        grid.isometric( context, 0, 0, width / 2, height, 50 );
        
        // Draw the dimetric grid on the right half of the canvas.
        grid.dimetric( context, width / 2, 0, width / 2, height, 50 );
    }



    /**
     * Function: hex
     *
     * Description:
     *   Renders a hexagonal grid pattern, where the cells are regular hexagons.
     *   This type of grid is often used in board games or certain mapping applications.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the hexagonal grid.
     *   - 50: The spacing parameter for the hexagonal cells (e.g., side length or diameter).
     */
    function hex () {
        grid.hex( context, 0, 0, width, height, 50 );
    }



    /**
     * Function: polar
     *
     * Description:
     *   Draws a polar coordinate grid system, consisting of concentric circles
     *   and radial lines (spokes) emanating from a central point.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the polar grid.
     *   - 50: The radial spacing between concentric circles.
     *   - 10: The number of angular divisions or spokes in the grid.
     */
    function polar () {
        grid.polar( context, 0, 0, width, height, 50, 10 );
    }



    /**
     * Function: dots
     *
     * Description:
     *   Renders a grid composed entirely of individual dots, arranged in
     *   a rectangular pattern. This provides a minimalist grid visualization.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the dot grid.
     *   - 30: The horizontal spacing between the centers of adjacent dots.
     *   - 15: The vertical spacing between the centers of adjacent dots.
     */
    function dots () {
        grid.dots( context, 0, 0, width, height, 30, 15 );
    }



    /**
     * Function: hexDots
     *
     * Description:
     *   Draws a hexagonal grid pattern, but instead of lines, it uses dots
     *   arranged in a hexagonal fashion to represent the grid points.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the hexagonal dot grid.
     *   - 50: The spacing parameter for the hexagonal arrangement of dots.
     */
    function hexDots () {
        grid.hexDots( context, 0, 0, width, height, 50 );
    }



    /**
     * Function: plus
     *
     * Description:
     *   Renders a grid where each grid point is represented by a plus (+) symbol.
     *   This can be used for visual emphasis or a stylistic grid.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the plus sign grid.
     *   - 10: The length of each arm of the plus symbol.
     *   - 50: The spacing between the centers of the plus symbols.
     */
    function plus () {
        grid.plus( context, 0, 0, width, height, 10, 50 );
    }



    /**
     * Function: celtic
     *
     * Description:
     *   Draws a Celtic knot-like grid pattern. This is a more decorative
     *   and complex grid style, often used for aesthetic purposes.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the Celtic grid.
     *   - 50: The spacing parameter that influences the size and density of the Celtic pattern.
     */
    function celtic () {
        grid.celtic( context, 0, 0, width, height, 50 );
    }



    /**
     * Function: triangle
     *
     * Description:
     *   Renders a grid composed of triangular shapes. This can be either
     *   an equilateral or isosceles triangular tiling of the canvas.
     *
     * Parameters:
     *   - context: The 2D rendering context.
     *   - 0, 0, width, height: The bounding box for the triangular grid.
     *   - 50: The spacing parameter for the triangular grid elements.
     */
    function triangle () {
        grid.triangle( context, 0, 0, width, height, 50 );
    }


    
    /**
     * Function: all
     *
     * Description:
     *   This is the main function that orchestrates the rendering of a
     *   composite view of various grid types. It divides the entire canvas
     *   into a 4x3 matrix of smaller sub-grids, with each sub-grid displaying
     *   a different grid pattern from the 'grid' module.
     */
    function all () {
        // Calculate the dimensions for each individual sub-grid cell.
        var w = width   /   4 , // Each sub-grid will occupy one-fourth of the total canvas width.
            h = height  /   3 , // Each sub-grid will occupy one-third of the total canvas height.
            x = 0           , // Initialize the X coordinate for the top-left corner of the current cell.
            y = 0           ; // Initialize the Y coordinate for the top-left corner of the current cell.

        // --- Render the First Row of Grids (Y-coordinate remains constant for this row) ---
        grid.square( context, x, y, w, h, 50, 25, 12.5 ); // Cell (0,0): Displays a square grid.
        x += w; // Advance X-coordinate to the next column.
        grid.rect( context, x, y, w, h, 50, 25 ); // Cell (1,0): Displays a rectangular grid.
        x += w; // Advance X-coordinate to the next column.
        grid.isometric( context, x, y, w, h, 50 ); // Cell (2,0): Displays an isometric grid.
        x += w; // Advance X-coordinate to the next column.
        grid.dimetric( context, x, y, w, h, 50 ); // Cell (3,0): Displays a dimetric grid (rightmost in row 1).

        // Reset X to the beginning of the row (0) and move Y down to the next row's starting position.
        x = 0;
        y += h;

        // --- Render the Second Row of Grids (Y-coordinate is now 'h') ---
        grid.hex( context, x, y, w, h, 50 ); // Cell (0,1): Displays a hexagonal grid.
        x += w; // Advance X-coordinate to the next column.
        // Note: The polar grid in 'all()' uses different parameters (center, radius) than the standalone 'polar()' function.
        grid.polar( context, x, y, w, h, 20, 20, w / 2, h / 2 ); // Cell (1,1): Displays a polar grid.
        x += w; // Advance X-coordinate to the next column.
        grid.dots( context, x, y, w, h, 50, 25 ); // Cell (2,1): Displays a grid of dots.
        x += w; // Advance X-coordinate to the next column.
        grid.hexDots( context, x, y, w, h, 50 ); // Cell (3,1): Displays a hexagonal dot grid (rightmost in row 2).

        // Reset X to the beginning of the row (0) and move Y down to the next row's starting position.
        x = 0;
        y += h;

        // --- Render the Third Row of Grids (Y-coordinate is now '2h') ---
        grid.plus( context, x, y, w, h, 10, 50 ); // Cell (0,2): Displays a grid of plus symbols.
        x += w; // Advance X-coordinate to the next column.
        grid.celtic( context, x, y, w, h, 50 ); // Cell (1,2): Displays a Celtic knot-like grid.
        x += w; // Advance X-coordinate to the next column.
        grid.triangle( context, x, y, w, h, 50 ); // Cell (2,2): Displays a triangular grid.
        x += w; // Advance X-coordinate to the next column.
        
        // This 'diamond' grid function is part of the original code's 'all()' function.
        // It is included here to maintain exact structural and functional equivalence.
        grid.diamond( context, x, y, w, h, 50 ); // Cell (3,2): Displays a diamond grid (rightmost in row 3).
    }

});