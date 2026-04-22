"use strict" ; // This directive enables strict mode for the entire script.

// This function is responsible for creating and returning a dimension object.
// It calculates inner dimensions and center coordinates based on provided inputs.
function makeDimension (  width ,  height ,  top ,  right ,  bottom ,  left  )
{
    // The returned object contains various dimension properties.
    return {
        width : width ,
        height : height ,
        innerWidth : width  -  (  left  +  right  ) , // Calculate inner width
        innerHeight : height  -  (  top  +  bottom  ) , // Calculate inner height
        top : top ,
        right : right ,
        bottom : bottom ,
        left : left ,
        cx : (  width  -  (  left  +  right  )  )  /  2  +  left , // Center X coordinate
        cy : (  height  -  (  top  +  bottom  )  )  /  2  +  top    // Center Y coordinate
    } ;
}


/*
 * Below are the definitions for various dimension objects used throughout the application.
 * These define the sizes and margins for different plotting areas.
 */
var testDimension = makeDimension( 620 , 400 , 30 , 30 , 30 , 30 ) ;

var plotPositionDimension = makeDimension( 220 , 200 , 30 , 30 , 30 , 30 ) ;
var plotVelocitiesDimension = plotPositionDimension ; // Velocities plot shares dimensions with position plot
var plotHitsDimension = plotPositionDimension ;       // Hits plot also shares dimensions

var plotScatterDimension = makeDimension( 220 , 200 , 30 , 30 , 30 , 50 ) ;
var scatterEffectiveDimension = makeDimension( 540 , 300 , 30 , 30 , 30 , 50 ) ;
var positionEffectiveDimension = makeDimension( 540 , 200 , 30 , 30 , 30 , 40 ) ;
var speedEffectiveDimension = positionEffectiveDimension ; // Speed effective plot shares dimensions
var histDimension = makeDimension( 540 , 300 , 30 , 30 , 30 , 50 ) ;


// Constants for timing and speed calculations.
var LIVE_STAY = 1000 ;
var MAX_TIME = 2000 ;
var UPDATE_DELAY = MAX_TIME ;
var MAX_SPEED = 6 ; /* Represents pixels per millisecond. */


// Function to scale a radius for hit visualization.
function rHit ( r , rTarget )
{
    return ( ( plotHitsDimension . innerWidth  /  2 )  /  rTarget )  *  r ;
} ;


// Function to determine a color based on speed.
function v ( v )
{
    var colour = 'rgb('  +  clampInt( 0 , 255 , ( v  /  MAX_SPEED )  *  255 )  +  ', 0, 0)' ;
    return colour ;
} ;


// D3.js linear scales for various plots.
var scatterX = d3 . scale . linear ( )
    . domain ( [ 0.5 , 5.5 ] )
    . range ( [ 0 , plotScatterDimension . innerWidth ] ) ;

var scatterY = d3 . scale . linear ( )
    . domain ( [ MAX_TIME , 0 ] )
    . range ( [ 0 , plotScatterDimension . innerHeight ] ) ;

var scaleT = d3 . scale . linear ( )
    . domain ( [ 0 , 1000 ] )
    . range ( [ 0 , plotVelocitiesDimension . innerWidth ] ) ;

var scaleV = d3 . scale . linear ( )
    . domain ( [ 0 , MAX_SPEED ] )
    . range ( [ plotVelocitiesDimension . innerHeight , 0 ] ) ;

var scaleX = d3 . scale . linear ( )
    . domain ( [ -20 , 300 ] )
    . range ( [ 0 , plotPositionDimension . innerWidth ] ) ;

var scaleY = d3 . scale . linear ( )
    . domain ( [ -50 , 50 ] )
    . range ( [ plotPositionDimension . innerHeight , 0 ] ) ;

var effScatterX = d3 . scale . linear ( )
    . domain ( [ 0.5 , 6.5 ] )
    . range ( [ 0 , scatterEffectiveDimension . innerWidth ] ) ;

var effScatterY = d3 . scale . linear ( )
    . domain ( [ MAX_TIME , 0 ] )
    . range ( [ 0 , scatterEffectiveDimension . innerHeight ] ) ;

var effPositionX = d3 . scale . linear ( )
    . domain ( [ -60 , 400 ] )
    . range ( [ 0 , positionEffectiveDimension . innerWidth ] ) ;

var effPositionY = d3 . scale . linear ( )
    . domain ( [ -50 , 50 ] )
    . range ( [ positionEffectiveDimension . innerHeight , 0 ] ) ;

var effSpeedX = d3 . scale . linear ( )
    . domain ( [ 0 , MAX_TIME ] )
    . range ( [ 0 , speedEffectiveDimension . innerWidth ] ) ;

var effSpeedY = d3 . scale . linear ( )
    . domain ( [ 0 , MAX_SPEED ] )
    . range ( [ speedEffectiveDimension . innerHeight , 0 ] ) ;



// The main Fitts' Law test object, containing state and methods.
var fittsTest =
{
    target : { x : 0 , y : 0 , r : 10 } , // Current target's position and radius.
    start : { x : 0 , y : 0 , t : 0 } ,   // Starting point of a trial.
    last : { } ,                          // Last recorded mouse position during a trial.

    isoPositions : [ ] ,                  // Array of possible ISO positions.
    currentPosition : 0 ,                 // Index of the current target in isoPositions.
    currentCount : 0 ,                    // Number of targets hit in the current sequence.
    miss : 0 ,                            // Count of misses.
    isoLimits : { minD : 120 , maxD : 300 , minW : 10 , maxW : 100 } , // Limits for ISO parameters.
    isoParams : { num : 9 , distance : 200 , width : 50 , randomize : true } , // Current ISO parameters.

    currentPath : [ ] , // Stores the mouse path for the current trial.
    active : false ,    // Indicates if a trial is currently active.

    data : [ ] ,          // Array to store collected data sets.
    currentDataSet : 0 ,  // Index of the currently active data set.
    dataCnt : 0 ,         // Counter for total data sets created.

    colour : d3 . scale . category10 ( ) , // D3 scale for assigning colors to data sets.

    sumID : 0 ,   // Sum of IDs (Index of Difficulty).
    sumTime : 0 , // Sum of trial times.

    updateTimeoutHandle : undefined , // Handle for the plot update timeout.

    // Generates and displays a new target circle.
    generateTarget : function ( )
    {
        this . target = this . isoPositions [ this . currentPosition ] ;
        this . target . distance = this . isoParams . distance ;
        this . currentPosition = ( this . currentPosition + Math . ceil ( this . isoPositions . length / 2 ) ) % this . isoPositions . length ;

        var target = testAreaSVG . selectAll ( '#target' ) . data ( [ this . target ] ) ;

        var insert = function ( d )
        {
            d . attr ( 'cx' , function ( d ) { return d . x ; } )
             . attr ( 'cy' , function ( d ) { return d . y ; } )
             . attr ( 'r' , function ( d ) { return d . w / 2 ; } ) ;
        } ;

        target . enter ( )
            . append ( 'circle' )
                . attr ( 'id' , 'target' )
                . style ( 'fill' , 'red' )
                . call ( insert ) ;

        target . transition ( )
                . call ( insert ) ;

        this . active = true ; // Mark test as active after target generation.
    } ,

    // Updates the display of ISO circles based on current parameters.
    updateISOCircles : function ( )
    {
        this . currentCount = 0 ;

        this . generateISOPositions ( this . isoParams . num ,
            this . isoParams . distance ,
            this . isoParams . width ) ;

        var circles = testAreaSVG . selectAll ( 'circle' ) . data ( this . isoPositions ) ;

        var insert = function ( d )
        {
            d . attr ( 'cx' , function ( d ) { return d . x ; } )
             . attr ( 'cy' , function ( d ) { return d . y ; } )
             . attr ( 'r' , function ( d ) { return d . w / 2 ; } ) ;
        } ;

        circles . enter ( )
            . append ( 'circle' )
                . attr ( 'class' , 'iso' )
                . call ( insert ) ;

        circles . transition ( )
            . call ( insert ) ;

        circles . exit ( )
            . transition ( )
                . attr ( 'r' , 0 )
                . remove ( ) ;

        this . currentPosition = 0 ;
        this . generateTarget ( ) ;
        this . active = false ;
    } ,

    // Calculates and stores the positions of ISO targets.
    generateISOPositions : function ( num , d , w )
    {
        // Remove all previous data representations from the live view plots.
        plotHitsGroup . selectAll ( 'circle.hit' )
            . transition ( )
                . duration ( LIVE_STAY )
                    . ease ( 'linear' )
                    . attr ( 'r' , 2 )
                    . style ( 'opacity' , 0 )
                    . remove ( ) ;

        plotPositionGroup . selectAll ( 'line.live' )
            . transition ( )
                . duration ( LIVE_STAY )
                . style ( 'stroke-opacity' , 0 )
                . remove ( ) ;

        plotVelocitiesGroup . selectAll ( 'line.live' )
            . transition ( )
                . duration ( LIVE_STAY )
                . style ( 'stroke-opacity' , 0 )
                . remove ( ) ;

        this . isoPositions = [ ] ; // Clear existing positions.

        // Populate isoPositions with new circular positions.
        for ( var i = 0 ; i  <  num ; i ++ )
        {
            this . isoPositions [ i ] = {
                x : testDimension . cx  +  ( ( d / 2 )  *  Math . cos ( ( 2  *  Math . PI  *  i )  /  num ) ) ,
                y : testDimension . cy  +  ( ( d / 2 )  *  Math . sin ( ( 2  *  Math . PI  *  i )  /  num ) ) ,
                w : w
            } ;
        }
    } ,

    // Hides the current target and resets the trial path.
    removeTarget : function ( )
    {
        testAreaSVG . selectAll ( '#target' ) . data ( [ ] )
            . exit ( )
                . remove ( ) ;

        this . active = false ;
        this . currentPath = [ ] ; // Clear the path.
    } ,

    // Handles a mouse click event within the test area.
    mouseClicked : function ( x , y )
    {
        // Check if the click occurred within the target's boundaries.
        if ( distance ( { x : x , y : y } , this . target )  <  ( this . target . w  /  2 ) )
        {
            this . addDataPoint ( {
                start : this . start ,
                target : this . target ,
                path : this . currentPath ,
                hit : { x : x , y : y , t : ( new Date ) . getTime ( ) }
            } ) ;
            this . removeTarget ( ) ;

            // If randomization is enabled and all targets in the sequence are hit.
            if ( this . isoParams . randomize  &&  this . currentCount  >=  this . isoPositions . length )
            {
                this . randomizeParams ( ) ;
                this . currentCount = 0 ;
                this . currentPosition = 0 ;
                this . miss = 0 ;
                this . updateISOCircles ; // Note: This is missing '()' to be a function call.
                this . generateTarget ( ) ;
                this . active = false ;
            }
            else
            {
                this . currentCount ++ ;
                this . generateTarget ( ) ;
            }

            this . last = { x : x , y : y , t : ( new Date ) . getTime ( ) } ;
            this . start = this . last ;
            this . currentPath . push ( this . last ) ;
        }
        else
        {
            this . miss ++ ; // Increment the miss counter.
        }
    } ,

    // Handles mouse movement events when a trial is active.
    mouseMoved : function ( x , y )
    {
        if ( this . active )
        {
            // Optimize: skip if mouse coordinates are identical to the last recorded.
            if ( x  ==  this . last . x  &&  y  ==  this . last . y )
            {
                return ;
            }

            // Manage the timeout for updating plot visualizations.
            if ( this . updateTimeoutHandle )
            {
                window . clearTimeout ( this . updateTimeoutHandle ) ;
            }
            this . updateTimeoutHandle = window . setTimeout ( this . updatePlots , UPDATE_DELAY , this ) ;


            var newPoint = { x : x , y : y , t : ( new Date ) . getTime ( ) } ;
            this . currentPath . push ( newPoint ) ;

            var dt = newPoint . t  -  this . last . t ;
            var dist = distance ( this . last , { x : x , y : y } ) ;
            var speed = ( dt  >  0 )  ?  ( dist  /  dt )  :  0 ;

            testAreaSVG . append ( 'line' )
                /* Temporarily commented out class attribute. */
                . attr ( 'x1' , this . last . x )
                . attr ( 'x2' , newPoint . x )
                . attr ( 'y1' , this . last . y )
                . attr ( 'y2' , newPoint . y )
                . style ( 'stroke' , v ( speed ) )
                . transition ( )
                    . duration ( 5000 ) // Line fades out over 5 seconds.
                    . style ( 'stroke-opacity' , 0 )
                    . remove ( ) ;

            this . last = newPoint ; // Update last point.
        }
    } ,

    // Adds a completed trial's data to the data array and updates plots.
    addDataPoint : function ( data )
    {
        // Only proceed if the test is active.
        if ( this . active  ==  false )
        {
            return ;
        }

        var dt = data . hit . t  -  data . start . t ;

        // Filter out trials that took an excessively long time, likely outliers.
        if ( dt  <  MAX_TIME )
        {
            var dist = distance ( data . target , data . start ) ;
            var id = shannon ( dist , data . target . w ) ;

            // Push the new data point to the current data set.
            this . data [ this . currentDataSet ] . data . push ( {
                time : dt ,
                distance : data . target . distance ,
                width : data . target . w ,
                hit : data . hit ,
                start : data . start ,
                target : data . target ,
                path : data . path
            } ) ;

            // Visualize the data point on the scatter plot.
            scatterGroup . append ( 'circle' )
                . attr ( 'class' , 'cat'  +  this . currentDataSet )
                . style ( 'fill' , this . data [ this . currentDataSet ] . colour )
                . attr ( 'cx' , scatterX ( id ) )
                . attr ( 'cy' , scatterY ( dt ) )
                . attr ( 'r' , 0 )
                    . transition ( )
                        . duration ( 200 )
                        . ease ( 'bounce' )
                        . attr ( 'r' , 3 ) ;

            var A = data . start ;
            var B = data . target ;
            var path = data . path ;

            var hit = { } ;
            var q = project ( A , B , data . hit ) ;
            hit . x = distance ( q , B )  *  sign ( q . t  -  1 ) ;
            hit . y = distance ( q , data . hit )  *  isLeft ( A , B , data . hit ) ;

            // Plot the hit point on the hits plot.
            plotHitsGroup . append ( 'circle' )
                . attr ( 'class' , 'hit' )
                . attr ( 'cx' , rHit ( hit . x , data . target . w  /  2 ) )
                . attr ( 'cy' , rHit ( hit . y , data . target . w  /  2 ) )
                . attr ( 'r' , 6 )
                . style ( 'fill' , 'red' )
                . style ( 'opacity' , 1 )
                . transition ( )
                    . duration ( 500 )
                        . ease ( 'linear' )
                        . attr ( 'r' , 3 ) ;

            var last = { x : 0 , y : 0 , t : data . start . t , v : 0 } ;
            for ( var i = 0 ; i  <  path . length ; i ++ )
            {
                var p = path [ i ] ;

                var q = project ( A , B , p ) ;
                var x = distance ( q , A )  *  sign ( q . t ) ;
                var y = distance ( q , p )  *  isLeft ( A , B , p ) ;

                var dt = p . t  -  last . t ;
                var dist = distance ( last , { x : x , y : y } ) ;
                var speed = ( dt  >  0 )  ?  ( dist  /  dt )  :  0 ;

                // Plot the position path.
                plotPositionGroup . append ( 'svg:line' )
                    . attr ( 'class' , 'live' )
                    . attr ( 'x1' , scaleX ( last . x ) )
                    . attr ( 'x2' , scaleX ( x ) )
                    . attr ( 'y1' , scaleY ( last . y ) )
                    . attr ( 'y2' , scaleY ( y ) )
                    . style ( 'stroke' , v ( speed ) )
                    . transition ( )
                        . duration ( LIVE_STAY )
                        . style ( 'stroke-opacity' , 0.5 ) ;

                // Plot the velocity profile.
                plotVelocitiesGroup . append ( 'svg:line' )
                    . attr ( 'class' , 'live' )
                    . attr ( 'x1' , scaleT ( last . t  -  data . start . t ) )
                    . attr ( 'x2' , scaleT ( p . t  -  data . start . t ) )
                    . attr ( 'y1' , scaleV ( last . v ) )
                    . attr ( 'y2' , scaleV ( speed ) )

                    . style ( 'stroke' , v ( speed ) )
                    . transition ( )
                        . duration ( LIVE_STAY )
                        . style ( 'stroke-opacity' , 0.5 ) ;

                var last = { } ; // Update last point for next segment.
                last . x = x ;
                last . y = y ;
                last . t = p . t ;
                last . v = speed ;
            }
        }
    } ,

    // Randomizes the distance and width parameters for the ISO targets.
    randomizeParams : function ( )
    {
        this . isoParams . distance = Math . floor ( randomAB ( this . isoLimits . minD , this . isoLimits . maxD ) ) ;
        this . isoParams . width = Math . floor ( randomAB ( this . isoLimits . minW , this . isoLimits . maxW ) ) ;

        // Update UI sliders.
        $ ( '#sliderDistance' ) . slider ( 'value' , this . isoParams . distance ) ;
        $ ( '#sliderWidth' ) . slider ( 'value' , this . isoParams . width ) ;

        this . updateISOCircles ( ) ; // Re-render circles with new parameters.
        d3 . select ( '#sliderDistanceValue' ) . text ( this . isoParams . distance ) ;
        d3 . select ( '#sliderWidthValue' ) . text ( this . isoParams . width ) ;
    } ,

    // Creates a new data set for collecting trial data.
    addDataSet : function ( )
    {
        // Before adding a new set, ensure current plots are updated.
        this . updatePlots ( this ) ;

        this . dataCnt ++ ;
        var num = this . dataCnt ;
        var colour = this . colour ( randomAB ( 0 , 10 ) ) ;

        this . data [ num ] = { data : [ ] , colour : colour } ;

        this . currentDataSet = num ;
        var div = d3 . select ( '#dataSets' ) . append ( 'div' )
            . attr ( 'id' , 'dataSet'  +  num )
            . text ( 'Data Set '  +  num  +  ' ' )
            . style ( 'background-color' , colour ) ;

        var buttonID = 'removeDataSet'  +  num ;
        div . append ( 'button' )
            . attr ( 'id' , buttonID )
            . attr ( 'type' , 'button' )
            . text ( 'delete!' ) ;

        var that = this ; // Store context for event handlers.

        $ ( '#'  +  buttonID ) . click ( function ( )
        {
            that . deleteDataSet ( num ) ;
            fittsTest . active = false ; // Deactivate test when deleting data set.
        } ) ;

        $ ( '#dataSet'  +  num ) . click ( function ( )
        {
            if ( assIsKey ( num , that . data ) )
            {
                that . currentDataSet = num ;
                that . highlightDataSet ( num ) ;
            }
            fittsTest . active = false ; // Deactivate test when switching data set.
        } ) ;

        this . highlightDataSet ( num ) ; // Highlight the newly created data set.
    } ,

    // Deletes an existing data set and removes its visualizations.
    deleteDataSet : function ( num )
    {
        if ( assSize ( this . data )  ==  1 )
        {
            alert ( 'Cannot delete data set! Create another data set first.' ) ;
        }
        else
        {
            d3 . select ( '#dataSet'  +  num ) . remove ( ) ;
            delete this . data [ num ] ;

            // Remove all associated visual elements from plots.
            scatterGroup . selectAll ( '.cat'  +  num )
                . transition ( )
                    . duration ( 500 )
                        . attr ( 'r' , 0 )
                        . remove ( ) ;

            scatterEffectiveGroup . selectAll ( '.cat'  +  num )
                . transition ( )
                    . duration ( 500 )
                        . style ( 'opacity' , 0 )
                        . remove ( ) ;

            throughputGroup . selectAll ( 'rect.cat'  +  num )
                . transition ( )
                    . duration ( 500 )
                        . attr ( 'width' , 0 )
                        . remove ( ) ;

            positionEffectiveGroup . selectAll ( 'line.cat'  +  num )
                . transition ( )
                    . duration ( 500 )
                        . style ( 'opacity' , 0 )
                        . remove ( ) ;

            speedEffectiveGroup . selectAll ( 'line.cat'  +  num )
                . transition ( )
                    . duration ( 500 )
                        . style ( 'opacity' , 0 )
                        . remove ( ) ;

            // If the deleted set was the current one, switch to the first available set.
            if ( num  ==  this . currentDataSet )
            {
                var first = parseInt ( assFirstKey ( this . data ) ) ;
                this . currentDataSet = first ;
                this . highlightDataSet ( first ) ;
            }

            this . updatePlots ( this ) ; // Update plots to reflect changes.
        }
    }
} ; // End of fittsTest object definition.