require ( [ "grid" ] , function ( layoutModule )
{
  // Initialize the primary drawing surface and its 2D rendering context.
  // Determine the dimensions based on the browser window size.
  var displaySurface = document.fetchElementByUniqueId ( "canvas" ) ,
      gfxContext = displaySurface.getContext ( "2d" ) ,
      surfaceWidth = displaySurface.width = window.innerWidth ,
      surfaceHeight = displaySurface.height = window.innerHeight ;

  /*
   * These functions demonstrate individual pattern generation.
   * They are currently commented out to allow for a combined display.
   */
  // configureStrokeStyles ( ) ;
  // generateQuadGrid ( ) ;
  // createRectangularLayout ( ) ;
  // produceIsoLayout ( ) ;
  // createDimeLayout ( ) ;
  // composeIsoDimeLayout ( ) ;
  // buildHexLayout ( ) ;
  // makeRadialLayout ( ) ;
  // placePointGrid ( ) ;
  // arrangeHexPoints ( ) ;
  // createPlusPattern ( ) ;
  // designCelticLayout ( ) ;
  // formTriangleLayout ( ) ;

  // Execute the comprehensive display function to show all designs.
  presentAllDesigns ( ) ;

  /**
   * Sets distinct stroke and fill colors for major, minor, and tertiary grid lines.
   */
  function configureStrokeStyles ( )
  {
    layoutModule.primaryLineColor = "#0000FF" ; // Blue
    layoutModule.secondaryLineColor = "#FF0000" ; // Red
    layoutModule.tertiaryLineColor = "#00FF00" ; // Green

    layoutModule.primaryFillColor = "#0000FF" ; // Blue
    layoutModule.secondaryFillColor = "#FF0000" ; // Red
  }

  /**
   * Renders a standard square-based grid pattern across the entire canvas.
   */
  function generateQuadGrid ( ) {
    layoutModule.square ( gfxContext , 0.0 , 0.0 , surfaceWidth , surfaceHeight , 50.0 , 25.0 , 12.50 ) ;
  }

  /**
   * Draws a rectangular grid covering the full display area.
   */
  function createRectangularLayout ( ) {
    layoutModule.rect ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 , 25 ) ;
  }

  /**
   * Generates an isometric grid layout.
   */
  function produceIsoLayout ( ) {
    layoutModule.isometric ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 ) ;
  }

  /**
   * Constructs a dimetric grid pattern.
   */
  function createDimeLayout ( ) {
    layoutModule.dimetric ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 ) ;
  }

  /**
   * Displays both isometric and dimetric grids side-by-side.
   */
  function composeIsoDimeLayout ( ) {
    layoutModule.isometric ( gfxContext , 0 , 0 , surfaceWidth / 2.0 , surfaceHeight , 50 ) ;
    layoutModule.dimetric ( gfxContext , surfaceWidth / 2.0 , 0 , surfaceWidth / 2.0 , surfaceHeight , 50 ) ;
  }

  /**
   * Renders a hexagonal grid on the canvas.
   */
  function buildHexLayout ( ) {
    layoutModule.hex ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 ) ;
  }

  /**
   * Creates a polar coordinate grid.
   */
  function makeRadialLayout ( ) {
    layoutModule.polar ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 , 10 ) ;
  }

  /**
   * Places a grid of individual dots.
   */
  function placePointGrid ( ) {
    layoutModule.dots ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 30 , 15 ) ;
  }

  /**
   * Generates a dot grid arranged in a hexagonal pattern.
   */
  function arrangeHexPoints ( ) {
    layoutModule.hexDots ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 ) ;
  }

  /**
   * Draws a grid composed of plus symbols.
   */
  function createPlusPattern ( ) {
    layoutModule.plus ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 10 , 50 ) ;
  }

  /**
   * Renders a Celtic knot-inspired grid.
   */
  function designCelticLayout ( ) {
    layoutModule.celtic ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 ) ;
  }

  /**
   * Produces a grid based on triangular shapes.
   */
  function formTriangleLayout ( ) {
    layoutModule.triangle ( gfxContext , 0 , 0 , surfaceWidth , surfaceHeight , 50 ) ;
  }


  /**
   * Orchestrates the drawing of various grid patterns in a tiled arrangement.
   */
  function presentAllDesigns ( ) {
    var cellWidth = surfaceWidth / 4.0 ,
        cellHeight = surfaceHeight / 3.0 ,
        columnPosition = 0 ,
        rowPosition = 0 ;

    // First row of grids
    layoutModule.square ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50.0 , 25.0 , 12.50 ) ;
    columnPosition += cellWidth ;
    layoutModule.rect ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 , 25 ) ;
    columnPosition += cellWidth ;
    layoutModule.isometric ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;
    columnPosition += cellWidth ;
    layoutModule.dimetric ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;

    // Reset column for next row
    columnPosition = 0 ;
    rowPosition += cellHeight ;

    // Second row of grids
    layoutModule.hex ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;
    columnPosition += cellWidth ;
    layoutModule.polar ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 20 , 20 , cellWidth / 2.0 , cellHeight / 2.0 ) ;
    columnPosition += cellWidth ;
    layoutModule.dots ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 , 25 ) ;
    columnPosition += cellWidth ;
    layoutModule.hexDots ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;

    // Reset column for next row
    columnPosition = 0 ;
    rowPosition += cellHeight ;

    // Third row of grids
    layoutModule.plus ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 10 , 50 ) ;
    columnPosition += cellWidth ;
    layoutModule.celtic ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;
    columnPosition += cellWidth ;
    layoutModule.triangle ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;
    columnPosition += cellWidth ;
    // Note: The original code had `grid.diamond`, assuming it's a valid function in the 'grid' module.
    layoutModule.diamond ( gfxContext , columnPosition , rowPosition , cellWidth , cellHeight , 50 ) ;
  }

} ) ;