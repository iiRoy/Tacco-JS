/* This file defines the 'Bonus' entity, extending a base 'Entity' class.
 * It manages different types of in-game bonuses like speed, bomb, and fire. */

Bonus  =  Entity . extend ( {

  // An array holding the string names of available bonus types.
  types : [ 'speed' , 'bomb' , 'fire' ] ,


  // The specific type of this bonus instance (e.g., 'speed', 'bomb').
  type : '' ,

  // The position of the bonus on the game grid.
  position : { } ,

  // Bitmap object for rendering the bonus on screen.
  bmp : null ,


  /**
   * Initializes a new Bonus instance.
   * @param {Object} position - The grid coordinates where the bonus will appear.
   * @param {number} typePosition - The index in the 'types' array indicating the bonus type.
   */
  init : function ( position , typePosition ) {

    // Assign the bonus type based on the provided index.
    this . type  =  this . types [ typePosition ] ;


    // Store the initial position of the bonus.
    this . position  =  position ;


    // Create a new bitmap using the game's bonus image.
    this . bmp  =  new  createjs . Bitmap ( gGameEngine . bonusesImg ) ;

    // Convert grid position to pixel coordinates for rendering.
    var  pixels  =  Utils . convertToBitmapPosition ( position ) ;

    // Set the bitmap's X coordinate.
    this . bmp . x  =  pixels . x ;
    // Set the bitmap's Y coordinate.
    this . bmp . y  =  pixels . y ;

    // Define the source rectangle to display the correct bonus sprite from the image sheet.
    this . bmp . sourceRect  =  new  createjs . Rectangle ( typePosition  *  32 ,  0 ,  32 ,  32 ) ;

    // Add the bonus bitmap to the game stage for rendering.
    gGameEngine . stage . addChild ( this . bmp ) ;

  } , // End of init method


  /**
   * Cleans up the bonus when it is picked up or removed from the game.
   */
  destroy : function ( ) {

    // Remove the bonus's visual representation from the stage.
    gGameEngine . stage . removeChild ( this . bmp ) ;

    // Remove this bonus instance from the active bonuses array in the game engine.
    Utils . removeFromArray ( gGameEngine . bonuses , this ) ;

  } // End of destroy method

} ) ; // End of Bonus entity definition