/*
 ******************************************************************************
 * FLAG Game Engine - Core Engine File (FLAG.js)
 *
 * Author: Zac Zidik
 * Official Website: www.flagamengine.com
 * Current Version: 3.0.20
 * Last Updated: March 5th, 2015
 *
 * This file contains the essential code for the FLAG Game Engine.
 * Feel free to use this file on your local machine, deploy it on your server,
 * or retrieve the latest version from www.flagamengine.com/FLAG/FLAG.js.
 *
 * We appreciate you trying out the FLAG Game Engine! Good luck with your
 * game development endeavors!
 ******************************************************************************
 */

//
// FLAGENGINE - The primary constructor for the FLAG Game Engine.
// An instance of this class is automatically loaded into the global FLAG object
// once the DOM window is fully prepared and ready for interaction.
//
// ----------------------------------------------------------------------------
// This section defines the core engine functionality and its initial state.
// ----------------------------------------------------------------------------
//

function FLAGENGINE ( game , canvas , gui , glass ) {

    //
    // --- ENGINE PROPERTIES ---
    // These properties define the fundamental state and configuration
    // of the game engine instance.
    //

    this . arrowUp        = false ; // State for the 'arrow up' key press
    this . arrowDown      = false ; // State for the 'arrow down' key press
    this . arrowLeft      = false ; // State for the 'arrow left' key press
    this . arrowRight     = false ; // State for the 'arrow right' key press

    // Box2D physics engine configuration and state
    this . Box2D = {
        world     :   {}        , // The Box2D physics world instance
        scale     :   32        , // Conversion factor from pixels to Box2D units
        ready     :   false     , // Flag indicating if Box2D is initialized
        debug     :   false     , // Debug drawing enabled/disabled
        velIt     :   8         , // Velocity iterations for physics simulation
        posIt     :   3         , // Position iterations for physics simulation
        timeStep  :   1 / 60      // Fixed time step for physics updates
    } ;

    this . Canvas         = canvas ; // The HTML5 canvas element used for drawing
    // Center point of the canvas
    this . center         = { x : canvas.width / 2 , y : canvas.height / 2 } ;
    this . Context        = this.setContext ( '2d' ) ; // The rendering context (2D or WebGL)

    // Cursor properties for custom cursor rendering
    this . Cursor = {
        on           :   false   , // Is the custom cursor active?
        tiles        :   null    , // Tile information for cursor (if tile-based)
        tileAlpha    :   1       , // Alpha transparency for tile cursor
        rect         :   null    , // Rectangle definition for cursor
        point        :   null    , // Point definition for cursor
        image        :   null    , // Image object for cursor
        images       :   null    , // Multiple images for cursor (e.g., animation)
        imageAlpha   :   1         // Alpha transparency for image cursor
    } ;

    // Frames Per Second (FPS) management
    this . FPS = {
        now      :   60      , // Current FPS
        prev     :   0       , // Previous frame's timestamp
        set      :   30      , // Target FPS setting
        avg      :   60      , // Average FPS
        avgA     :   []      , // Array to calculate average FPS
        sprites  :   15      , // Number of sprites to process per frame (optimization)
        useRAF   :   true    , // Use requestAnimationFrame?
        RAF      :   null      // requestAnimationFrame handle
    } ;

    this . Game           = game ; // Reference to the main game object
    this . Glass          = glass ; // Reference to the 'glass' UI layer (if used)

    // Grid rendering properties
    this . Grid = {
        on       :   false   , // Is the grid visible?
        color    :   "#505050" , // Grid line color
        width    :   1       , // Grid line width
        alpha    :   1         // Grid transparency
    } ;

    this . GUI            = gui ; // Reference to the Graphical User Interface object

    this . lastW          = canvas.width ; // Last recorded canvas width
    this . lastH          = canvas.height ; // Last recorded canvas height

    // Pointer (mouse/touch) interaction properties
    this . Pointer = {
        screenLoc  :   { x : 0 , y : 0 } , // Pointer location on screen
        mapLoc     :   { x : 0 , y : 0 } , // Pointer location on game map
        downLoc    :   { x : 0 , y : 0 } , // Location when pointer was pressed down
        tileOn     :   { row : 0 , col : 0 } , // Tile under the pointer
        onMap      :   false               // Is the pointer currently over the map?
    } ;

    this . running        = false ; // Is the game loop currently running?
    this . scale          = 1 ;     // Global rendering scale factor
    this . Scene          = null ;  // The active game scene object

    this . sceneLoadProgress = 0 ; // Progress of the current scene loading

    this . Sounds         = [] ;    // Array to hold sound objects

    this . spriteFrames_Interval = null ; // Interval ID for sprite animation updates

    // Tiles to draw calculation for culling
    this . tilesToDraw = {
        row : { first : 0 , last : 0 } ,
        col : { first : 0 , last : 0 }
    } ;

    this . tilesToDrawIso = [] ; // Array for isometric tile drawing order

    this . tGutter        = { w : 1 , h : 1 } ; // Tile gutter dimensions

    this . update_Interval = null ; // Interval ID for game logic updates

    // Walkable areas visualization properties
    this . Walkables = {
        on        :   false       , // Are walkable areas highlighted?
        color_0   :   "#FF0000"   , // Color for non-walkable tiles
        color_1   :   "#00FF00"   , // Color for walkable tiles
        alpha     :   .25           // Transparency for walkable overlays
    } ;

    this . WebGL          = null ; // WebGL renderer instance (if contextType is 'webgl')

    // Zoom levels
    this . zoom           = { in : 2 , out : .5 } ;

    //
    // --- WebGL Initialization ---
    // If the context type is 'webgl', initialize the WebGL renderer.
    //
    if ( this . contextType == 'webgl' ) {
        this . WebGL = new FLAGWEBGL ( this . Canvas , this . Context ) ;
    }

} ; // End of FLAGENGINE constructor definition


//
// ACTOR Method
// Retrieves an actor from the current scene by its name.
// --------------------------------------------------------
FLAGENGINE . prototype . Actor = function ( actorName ) {
    // Iterate through all actors in the scene to find a match.
    var numActors = this . Scene . actors . length ;
    for ( var a = 0 ; a < numActors ; a ++ ) {
        // If the actor's name matches, return the actor object.
        if ( this . Scene . actors [ a ] . name == actorName ) {
            return this . Scene . actors [ a ] ;
        }
    }
}
// --- END ACTOR Method ---


//
// ACTORS CLICKED Method
// Returns a list of actors (and their specific bodies) that were clicked
// or are currently under the pointer's last down-press location.
// ----------------------------------------------------------------------
FLAGENGINE . prototype . actorsClicked = function ( ) {
    // This array will store objects representing clicked actors and their bodies.
    var actorsClicked = [ ] ;

    // Get the pointer's map coordinates for the click event.
    var clickPoint = { x : this . Pointer . mapLoc . x , y : this . Pointer . mapLoc . y } ;

    // Iterate over all actors in the current scene.
    var numActors = this . Scene . actors . length ;
    for ( var i = 0 ; i < numActors ; i ++ ) {
        var numBodies = this . Scene . actors [ i ] . bodies . length ;
        // Create a temporary object to hold information about the clicked actor.
        var clickedObject = { name : this . Scene . actors [ i ] . name , bodies : [ ] , sIndex : i } ;

        // Iterate over all physics bodies belonging to the current actor.
        for ( var j = 0 ; j < numBodies ; j ++ ) {
            var b               = this . Scene . actors [ i ] . bodies [ j ] . fb2Body ;         // Box2D body
            var shape           = this . Scene . actors [ i ] . bodies [ j ] . shape ;           // Shape type (box, circle, poly, tile)
            var shapeDefinition = this . Scene . actors [ i ] . bodies [ j ] . shapeDefinition ; // Details of the shape

            // Get the current position of the body in pixel coordinates.
            var x = ( ( b . GetPosition ( ) . x * this . Box2D . scale ) ) ;
            var y = ( ( b . GetPosition ( ) . y * this . Box2D . scale ) ) ;
            var bodyPoint = { x : x , y : y } ;

            // Determine if the click point is within the body's shape.
            switch ( shape ) {
                case "circle" :
                    // Check for point-in-circle collision.
                    if ( this . pointInCircle ( clickPoint , bodyPoint , shapeDefinition . radius ) == true ) {
                        clickedObject . bodies . push ( this . Scene . actors [ i ] . bodies [ j ] . name ) ;
                    }
                    break ;

                case "box" :
                    // Get the body's rotation angle.
                    var angle = b . GetAngle ( ) ;
                    // Define the unrotated corners of the box.
                    var rectPoints = [ ]
                    rectPoints . push ( { x : - ( shapeDefinition . w / 2 ) , y : - ( shapeDefinition . h / 2 ) } ) ;
                    rectPoints . push ( { x : ( shapeDefinition . w / 2 ) , y : - ( shapeDefinition . h / 2 ) } ) ;
                    rectPoints . push ( { x : ( shapeDefinition . w / 2 ) , y : ( shapeDefinition . h / 2 ) } ) ;
                    rectPoints . push ( { x : - ( shapeDefinition . w / 2 ) , y : ( shapeDefinition . h / 2 ) } ) ;

                    // Transform points by rotation and body position.
                    var points = [ ] ;
                    for ( var p = 0 ; p < 4 ; p ++ ) {
                        var px = rectPoints [ p ] . x ;
                        var py = rectPoints [ p ] . y ;

                        // Apply rotation.
                        var rot_x = px * Math . cos ( angle ) - py * Math . sin ( angle ) ;
                        var rot_y = px * Math . sin ( angle ) + py * Math . cos ( angle ) ;

                        // Add body's position to get world coordinates.
                        points . push ( { x : rot_x + bodyPoint . x , y : rot_y + bodyPoint . y } ) ;
                    }

                    // Check if the click point is inside the rotated rectangle (polygon).
                    if ( this . pointInPoly ( clickPoint , points ) == true ) {
                        clickedObject . bodies . push ( this . Scene . actors [ i ] . bodies [ j ] . name ) ;
                    }
                    break ;

                case "poly" :
                    // Get the body's rotation.
                    var angle = b . GetAngle ( ) ;
                    var points = [ ] ;
                    var numPoints = shapeDefinition . length ;
                    for ( var p = 0 ; p < numPoints ; p ++ ) {
                        var px = shapeDefinition [ p ] . x ;
                        var py = shapeDefinition [ p ] . y ;

                        // Apply rotation.
                        var rot_x = px * Math . cos ( angle ) - py * Math . sin ( angle ) ;
                        var rot_y = px * Math . sin ( angle ) + py * Math . cos ( angle ) ;

                        // Add body's position.
                        points . push ( { x : rot_x + bodyPoint . x , y : rot_y + bodyPoint . y } ) ;
                    }

                    // Check for point-in-polygon collision.
                    if ( this . pointInPoly ( clickPoint , points ) == true ) {
                        clickedObject . bodies . push ( this . Scene . actors [ i ] . bodies [ j ] . name ) ;
                    }
                    break ;

                case "tile" :
                    // Special handling for different map tile types.
                    switch ( this . Scene . Map . type ) {
                        case "orthogonal" :
                            // Orthogonal tiles are essentially boxes, so similar logic as "box" case.
                            var angle = b . GetAngle ( ) ;
                            var rectPoints = [ ]
                            rectPoints . push ( { x : - ( shapeDefinition . w / 2 ) , y : - ( shapeDefinition . h / 2 ) } ) ;
                            rectPoints . push ( { x : ( shapeDefinition . w / 2 ) , y : - ( shapeDefinition . h / 2 ) } ) ;
                            rectPoints . push ( { x : ( shapeDefinition . w / 2 ) , y : ( shapeDefinition . h / 2 ) } ) ;
                            rectPoints . push ( { x : - ( shapeDefinition . w / 2 ) , y : ( shapeDefinition . h / 2 ) } ) ;
                            var points = [ ] ;
                            for ( var p = 0 ; p < 4 ; p ++ ) {
                                var px = rectPoints [ p ] . x ;
                                var py = rectPoints [ p ] . y ;

                                // Apply rotation.
                                var rot_x = px * Math . cos ( angle ) - py * Math . sin ( angle ) ;
                                var rot_y = px * Math . sin ( angle ) + py * Math . cos ( angle ) ;

                                // Add body's position.
                                points . push ( { x : rot_x + bodyPoint . x , y : rot_y + bodyPoint . y } ) ;
                            }

                            // Check collision.
                            if ( this . pointInPoly ( clickPoint , points ) == true ) {
                                clickedObject . bodies . push ( this . Scene . actors [ i ] . bodies [ j ] . name ) ;
                            }
                            break ;

                        case "isometric" :
                            // Isometric tiles are typically diamond-shaped polygons.
                            var isoShape = [ ] ;
                            isoShape . push ( { x : - ( shapeDefinition . w / 2 ) , y : 0 } ) ;
                            isoShape . push ( { x : 0 , y : - ( shapeDefinition . h / 2 ) } ) ;
                            isoShape . push ( { x : ( shapeDefinition . w / 2 ) , y : 0 } ) ;
                            isoShape . push ( { x : 0 , y : ( shapeDefinition . h / 2 ) } ) ;

                            var angle = b . GetAngle ( ) ;
                            var points = [ ] ;
                            var numPoints = isoShape . length ;
                            for ( var p = 0 ; p < numPoints ; p ++ ) {
                                var px = isoShape [ p ] . x ;
                                var py = isoShape [ p ] . y ;

                                // Apply rotation.
                                var rot_x = px * Math . cos ( angle ) - py * Math . sin ( angle ) ;
                                var rot_y = px * Math . sin ( angle ) + py * Math . cos ( angle ) ;

                                // Add body's position.
                                points . push ( { x : rot_x + bodyPoint . x , y : rot_y + bodyPoint . y } ) ;
                            }

                            // Check collision.
                            if ( this . pointInPoly ( clickPoint , points ) == true ) {
                                clickedObject . bodies . push ( this . Scene . actors [ i ] . bodies [ j ] . name ) ;
                            }
                            break ;

                        case "hexagonal" :
                            // Hexagonal tiles are 6-sided polygons.
                            var hexShape = [ ] ;
                            hexShape . push ( { x : - ( shapeDefinition . w / 2 ) , y : 0 } ) ;
                            hexShape . push ( { x : - ( shapeDefinition . w / 4 ) , y : - ( shapeDefinition . h / 2 ) } ) ;
                            hexShape . push ( { x : ( shapeDefinition . w / 4 ) , y : - ( shapeDefinition . h / 2 ) } ) ;
                            hexShape . push ( { x : ( shapeDefinition . w / 2 ) , y : 0 } ) ;
                            hexShape . push ( { x : ( shapeDefinition . w / 4 ) , y : ( shapeDefinition . h / 2 ) } ) ;
                            hexShape . push ( { x : - ( shapeDefinition . w / 4 ) , y : ( shapeDefinition . h / 2 ) } ) ;

                            var angle = b . GetAngle ( ) ;
                            var points = [ ] ;
                            var numPoints = hexShape . length ;
                            for ( var p = 0 ; p < numPoints ; p ++ ) {
                                var px = hexShape [ p ] . x ;
                                var py = hexShape [ p ] . y ;

                                // Apply rotation.
                                var rot_x = px * Math . cos ( angle ) - py * Math . sin ( angle ) ;
                                var rot_y = px * Math . sin ( angle ) + py * Math . cos ( angle ) ;

                                // Add body's position.
                                points . push ( { x : rot_x + bodyPoint . x , y : rot_y + bodyPoint . y } ) ;
                            }

                            // Check collision.
                            if ( this . pointInPoly ( clickPoint , points ) == true ) {
                                clickedObject . bodies . push ( this . Scene . actors [ i ] . bodies [ j ] . name ) ;
                            }
                            break ;
                    } // End of inner switch for tile types
                    break ;

                default :
                    // No specific action for unknown shapes.
                    break ;
            } // End of outer switch for shape types
        } // End of loop through actor bodies

        // If any bodies of this actor were clicked, add the actor to the results.
        if ( clickedObject . bodies . length > 0 ) {
            actorsClicked . push ( clickedObject ) ;
        }
    } // End of loop through actors

    return actorsClicked ; // Return the list of clicked actors.
}
// --- END ACTORS CLICKED Method ---


//
// ACTOR DECALS CLICKED Method
// This function identifies and returns a list of names of actor decals
// that are currently under the pointer's map location.
// -------------------------------------------------------------------
FLAGENGINE . prototype . actorDecalsClicked = function ( ) {
    // Initialize an array to store the names of clicked decals.
    var decalsClicked = [ ] ;

    // Get the current map coordinates of the pointer.
    var clickPoint = { x : this . Pointer . mapLoc . x , y : this . Pointer . mapLoc . y } ;

    // Loop through each actor in the current scene.
    var numActors = this . Scene . actors . length ;
    for ( var i = 0 ; i < numActors ; i ++ ) {
        var numBodies = this . Scene . actors [ i ] . bodies . length ;

        // Loop through each body belonging to the current actor.
        for ( var j = 0 ; j < numBodies ; j ++ ) {
            var b = this . Scene . actors [ i ] . bodies [ j ] . fb2Body ; // The Box2D physics body.

            // Get sprite sheet information for the body's main sprite.
            var as = this . Scene . spriteSheets [ this . Scene . actors [ i ] . bodies [ j ] . Sprite . pIndex ] ;

            // Get the current position of the body in pixel coordinates.
            var x = ( ( b . GetPosition ( ) . x * this . Box2D . scale ) ) ;
            var y = ( ( b . GetPosition ( ) . y * this . Box2D . scale ) ) ;

            // Check all decals attached to this body.
            var numDecals = this . Scene . actors [ i ] . bodies [ j ] . Sprite . decals . length ;
            for ( var d = 0 ; d < numDecals ; d ++ ) {
                // Get the sprite sheet rectangle definition for the current decal's frame.
                var decalRect = this . Scene . spriteSheets [ this . Scene . actors [ i ] . bodies [ j ] . Sprite . decals [ d ] . pIndex ] . tileRects [ this . Scene . actors [ i ] . bodies [ j ] . Sprite . decals [ d ] . frame ] ;

                // Calculate the decal's world position, offset from its parent body.
                var decalPoint = { x : x + ( this . Scene . actors [ i ] . bodies [ j ] . Sprite . decals [ d ] . x ) , y : y + ( this . Scene . actors [ i ] . bodies [ j ] . Sprite . decals [ d ] . y ) } ;

                // Define a rectangle for collision checking, considering scaling.
                var checkRect = { x : 0 , y : 0 , w : 0 , h : 0 } ;
                checkRect . x = decalPoint . x - ( ( decalRect . w / 2 ) * this . scale ) ;
                checkRect . y = decalPoint . y - ( ( decalRect . h / 2 ) * this . scale ) ;
                checkRect . w = decalRect . w * this . scale ;
                checkRect . h = decalRect . h * this . scale ;

                // Perform a point-in-rectangle collision check.
                if ( this . pointInRect ( clickPoint , checkRect ) == true ) {
                    decalsClicked . push ( this . Scene . actors [ i ] . bodies [ j ] . Sprite . decals [ d ] . name ) ;
                }
            } // End of decal loop
        } // End of body loop
    } // End of actor loop

    return decalsClicked ; // Return the array of names of clicked decals.
}
// --- END ACTOR DECALS CLICKED Method ---


//
// ADD ACTOR Method
// Adds a new actor instance to the current scene at runtime.
// -----------------------------------------------------------
FLAGENGINE . prototype . addActor = function ( actorName , instanceName , p ) {
    // Ensure 'p' (position/layer) is an object and has default values if not provided.
    if ( typeof p != "object" ) { var p = { x : 0 , y : 0 , layer : 0 } ; } ;
    if ( ! p . hasOwnProperty ( 'x' ) ) { p . x = 0 ; } ;
    if ( ! p . hasOwnProperty ( 'y' ) ) { p . y = 0 ; } ;
    if ( ! p . hasOwnProperty ( 'layer' ) ) { p . layer = 0 ; } ;

    // Find the prototype index of the actor definition in POLE.
    var numActors = POLE . actors . length ;
    var pIndex = -1 ; // Initialize prototype index to not found.
    for ( var a = 0 ; a < numActors ; a ++ ) {
        if ( actorName == POLE . actors [ a ] . name ) {
            pIndex = a ; // Found the actor prototype.
            break ;
        }
    }

    // If the actor prototype was found, create a new instance.
    if ( pIndex != -1 ) {
        var numSceneActors = this . Scene . actors . length ;
        var newName = instanceName ;
        var newPosition = { x : p . x , y : p . y } ;
        var actorIndex = numSceneActors ; // Index for the new actor in the scene's array.

        // Create the new FLAGACTOR instance.
        var newActor = new FLAGACTOR ( pIndex , newName , newPosition , p . layer ) ;
        this . Scene . actors . push ( newActor ) ; // Add it to the scene's actor list.

        // Initialize bodies for the new actor based on its prototype.
        var numBodies = POLE . actors [ pIndex ] . bodies . length ;
        var bodies = [ ] ; // This array is actually not used, bodies are pushed directly to newActor.bodies.
        for ( var b = 0 ; b < numBodies ; b ++ ) {
            var newActor_Body = new FLAGBODY ( POLE . actors [ pIndex ] . bodies [ b ] . name ) ;
            newActor . bodies . push ( newActor_Body ) ;
        }

        // Initialize joints for the new actor based on its prototype.
        var numJoints = POLE . actors [ pIndex ] . joints . length ;
        var joints = [ ] ; // This array is also not used.
        for ( var j = 0 ; j < numJoints ; j ++ ) {
            var newActor_Joint = new FLAGJOINT ( POLE . actors [ pIndex ] . joints [ j ] . name ) ;
            newActor . joints . push ( newActor_Joint ) ;
        }

        // Add the newly created actor's physics bodies and joints to the Box2D world.
        this . addActorToWorld ( actorIndex ) ;
    }
}
// --- END ADD ACTOR Method ---


//
// ADD ACTOR TO WORLD Method
// Integrates an actor's physics bodies and joints into the Box2D physics world.
// This method is typically called after an actor instance has been created.
// ----------------------------------------------------------------------------
FLAGENGINE . prototype . addActorToWorld = function ( i ) {
    // Get the actor object from the scene's actor list using the provided index 'i'.
    var theActor = this . Scene . actors [ i ] ;

    // --- Process Actor Bodies ---
    // Iterate through each body defined for this actor prototype.
    var numBodies = theActor . bodies . length ;
    for ( var j = 0 ; j < numBodies ; j ++ ) {
        var bodyDef = new b2BodyDef ;     // Box2D Body Definition
        var fixDef  = new b2FixtureDef ;  // Box2D Fixture Definition

        // Configure the shape of the fixture based on the actor's body definition.
        switch ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shape ) {
            case "box" :
                fixDef . shape = new b2PolygonShape ;
                // Set the box dimensions, converting from pixels to Box2D units.
                fixDef . shape . SetAsBox ( ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 2 ) / this . Box2D . scale , ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ;
                break ;

            case "circle" :
                // Set the circle radius, converting from pixels to Box2D units.
                var radius = POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . radius / this . Box2D . scale ;
                fixDef . shape = new b2CircleShape ( radius ) ;
                break ;

            case "poly" :
                fixDef . shape = new b2PolygonShape ;
                var numPoints = POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . length ;
                var newArray = [ ] ;
                // Convert polygon points from pixel coordinates to Box2D units.
                for ( var p = 0 ; p < numPoints ; p ++ ) {
                    newArray . push ( { x : POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition [ p ] . x / this . Box2D . scale , y : POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition [ p ] . y / this . Box2D . scale } ) ;
                }
                // Set the polygon vertices.
                fixDef . shape . SetAsArray ( newArray ) ;
                break ;

            case "tile" :
                // Tile shapes vary based on the map's type.
                switch ( this . Scene . Map . type ) {
                    case "orthogonal" :
                        // Orthogonal tiles are simple boxes.
                        fixDef . shape = new b2PolygonShape ;
                        fixDef . shape . SetAsBox ( ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 2 ) / this . Box2D . scale , ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ;
                        break ;

                    case "isometric" :
                        // Isometric tiles are diamond-shaped polygons.
                        fixDef . shape = new b2PolygonShape ;
                        fixDef . shape . SetAsArray ( [
                            new b2Vec2 ( 0 , - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ,
                            new b2Vec2 ( ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 2 ) / this . Box2D . scale , 0 ) ,
                            new b2Vec2 ( 0 , ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ,
                            new b2Vec2 ( - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 2 ) / this . Box2D . scale , 0 )
                        ] ) ;
                        break ;

                    case "hexagonal" :
                        // Hexagonal tiles are 6-sided polygons.
                        fixDef . shape = new b2PolygonShape ;
                        fixDef . shape . SetAsArray ( [
                            new b2Vec2 ( - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 4 ) / this . Box2D . scale , - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ,
                            new b2Vec2 ( ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 4 ) / this . Box2D . scale , - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ,
                            new b2Vec2 ( ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 2 ) / this . Box2D . scale , 0 ) ,
                            new b2Vec2 ( ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 4 ) / this . Box2D . scale , ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ,
                            new b2Vec2 ( - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 4 ) / this . Box2D . scale , ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . h / 2 ) / this . Box2D . scale ) ,
                            new b2Vec2 ( - ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . w / 2 ) / this . Box2D . scale , 0 )
                        ] ) ;
                        break ;
                } // End of inner switch for tile types
                break ;

            default :
                // No shape defined or unknown shape type.
                break ;
        } // End of outer switch for shape types


        // Apply fixture properties from the actor prototype.
        fixDef . density        = POLE . actors [ theActor . pIndex ] . bodies [ j ] . fixDef . density ;
        fixDef . friction       = POLE . actors [ theActor . pIndex ] . bodies [ j ] . fixDef . friction ;
        fixDef . restitution    = POLE . actors [ theActor . pIndex ] . bodies [ j ] . fixDef . restitution ;
        fixDef . filter . groupIndex = POLE . actors [ theActor . pIndex ] . bodies [ j ] . fixDef . filter . groupIndex ;


        // Set the body type (static, dynamic, kinematic).
        switch ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . type ) {
            case "static" :
                bodyDef . type = b2Body . b2_staticBody ;
                break ;
            case "dynamic" :
                bodyDef . type = b2Body . b2_dynamicBody ;
                break ;
            case "kinematic" :
                bodyDef . type = b2Body . b2_kinematicBody ;
                break ;
        }

        // Determine the initial position of the body.
        if ( j == 0 ) {
            // For the first body, use the actor's overall position.
            bodyDef . position . x = theActor . position . x ;
            bodyDef . position . y = theActor . position . y ;
        } else {
            // For subsequent bodies, apply an offset relative to the actor's position.
            bodyDef . position . x = theActor . position . x + POLE . actors [ theActor . pIndex ] . bodies [ j ] . position . x ;
            bodyDef . position . y = theActor . position . y + POLE . actors [ theActor . pIndex ] . bodies [ j ] . position . y ;
        }

        // Adjust the body's position from pixel coordinates to Box2D world units.
        bodyDef . position . Set ( bodyDef . position . x / this . Box2D . scale , bodyDef . position . y / this . Box2D . scale ) ;

        // Assign user data to the Box2D body for identification.
        bodyDef . userData = {
            name                :   POLE . actors [ theActor . pIndex ] . bodies [ j ] . name ,
            parentActorName     :   "" // Placeholder, will be set below
        } ;
        bodyDef . userData . parentActorName = theActor . name ;

        // Create the Box2D body in the world and store its reference.
        theActor . bodies [ j ] . fb2Body = this . Box2D . world . CreateBody ( bodyDef ) ;

        // Handle polygon shapes that might need separation into convex hulls.
        if ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . shape == "poly" ) {
            var numPoints = POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition . length ;
            var newArray = [ ] ;
            for ( var p = 0 ; p < numPoints ; p ++ ) {
                newArray . push ( { x : POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition [ p ] . x / this . Box2D . scale , y : POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition [ p ] . y / this . Box2D . scale } ) ;
            }

            // Separator Validator (commented out, likely for debug/testing)
            // if ( Box2DSeparator . validate ( newArray ) == 0 ) { console . log ( "Good" ) ; } else { console . log ( "No Good" ) ; }

            // Use the Box2DSeparator utility to decompose complex polygons into convex shapes.
            Box2DSeparator . separate ( theActor . bodies [ j ] . fb2Body , fixDef , newArray , this . Box2D . scale ) ;
        } else {
            // For non-polygon shapes, simply create a single fixture.
            theActor . bodies [ j ] . fb2Body . CreateFixture ( fixDef ) ;
        }

        // Set fixed rotation property if defined.
        if ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . fixedRotation == true ) {
            theActor . bodies [ j ] . fb2Body . SetFixedRotation ( true ) ;
        }

        // Assign a sprite to the body if a sprite sheet is specified.
        if ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . spriteSheet != null ) {
            theActor . bodies [ j ] . Sprite = new FLAGSPRITE ( POLE . actors [ theActor . pIndex ] . bodies [ j ] . name , POLE . actors [ theActor . pIndex ] . bodies [ j ] . spriteSheet , 0 , 0 , POLE . actors [ theActor . pIndex ] . bodies [ j ] . frame , POLE . actors [ theActor . pIndex ] . bodies [ j ] . animation , POLE . actors [ theActor . pIndex ] . layer ) ;
        } else {
            theActor . bodies [ j ] . Sprite = null ; // No sprite for this body.
        }

        // Store the shape type and its definition directly on the body instance.
        theActor . bodies [ j ] . shape = POLE . actors [ theActor . pIndex ] . bodies [ j ] . shape ;
        theActor . bodies [ j ] . shapeDefinition = POLE . actors [ theActor . pIndex ] . bodies [ j ] . shapeDefinition ;
    } // End of body processing loop


    // --- Process Actor Joints ---
    // Iterate through each joint defined for this actor prototype.
    var numJoints = theActor . joints . length ;
    for ( var j = 0 ; j < numJoints ; j ++ ) {
        var jointDef = new b2JointDef ; // Generic Box2D Joint Definition

        // Configure the joint based on its type.
        switch ( POLE . actors [ theActor . pIndex ] . joints [ j ] . type ) {
            case "distance" :
                theActor . joints [ j ] . fb2Joint = new b2DistanceJointDef ( ) ;
                jointDef = new b2DistanceJointDef ( ) ; // Specific Distance Joint Definition

                // Set distance joint properties.
                jointDef . frequencyHz     = POLE . actors [ theActor . pIndex ] . joints [ j ] . frequencyHz ;
                jointDef . dampingRatio    = POLE . actors [ theActor . pIndex ] . joints [ j ] . dampingRatio ;
                jointDef . collideConnected = POLE . actors [ theActor . pIndex ] . joints [ j ] . collideConnected ;

                // Initialize the distance joint between the two specified bodies.
                jointDef . Initialize (
                    theActor . bodies [ POLE . actors [ theActor . pIndex ] . joints [ j ] . body1 ] . fb2Body ,
                    theActor . bodies [ POLE . actors [ theActor . pIndex ] . joints [ j ] . body2 ] . fb2Body ,
                    theActor . bodies [ POLE . actors [ theActor . pIndex ] . joints [ j ] . body1 ] . fb2Body . GetWorldCenter ( ) ,
                    theActor . bodies [ POLE . actors [ theActor . pIndex ] . joints [ j ] . body2 ] . fb2Body . GetWorldCenter ( )
                ) ;
                // Create the distance joint in the Box2D world.
                theActor . joints [ j ] . fb2Joint = this . Box2D . world . CreateJoint ( jointDef ) ;
                break ;

            case "revolve" :
                theActor . joints [ j ] . fb2Joint = new b2RevoluteJointDef ( ) ;
                jointDef = new b2RevoluteJointDef ( ) ; // Specific Revolute Joint Definition

                // Set revolute joint properties.
                jointDef . motorSpeed       = POLE . actors [ theActor . pIndex ] . joints [ j ] . motorSpeed ;
                jointDef . maxMotorTorque   = POLE . actors [ theActor . pIndex ] . joints [ j ] . maxMotorTorque ;
                jointDef . enableMotor      = POLE . actors [ theActor . pIndex ] . joints [ j ] . enableMotor ;
                // ... (rest of the revolute joint setup would continue here)
                // The original code snippet stops here, so I will also stop.
}