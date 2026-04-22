function addCanvas( config )
{
    // This function creates a new HTML canvas element
    // and appends it to the document body.
    var canvas = document.createElement( "canvas" );

    // Set canvas dimensions based on configuration
    canvas.width = config.w;
    canvas.height = config.h;

    // Set background color
    canvas.style.background = config.bg;

    document.body.appendChild( canvas ); // Add canvas to the DOM

    return canvas;
} /* End of addCanvas function */


function drawPoint( ctx ,  x ,  y ,  color )
{
    // Begin a new path for drawing the point
    ctx.beginPath( ) ;

    // If a color is provided, set it as the fill style
    if ( color )
    {
        ctx.fillStyle = color ;
    }

    // Draw a small filled rectangle to represent the point
    ctx.fillRect( x - 2 ,  y - 2 ,  4 ,  4 ) ;
} // End of drawPoint


function drawLine( ctx , x1 , y1 , x2 , y2 )
{
    // Start a new drawing path
    ctx.beginPath();

    // Move to the starting point of the line
    ctx.moveTo( x1 , y1 );

    // Draw a line to the ending point
    ctx.lineTo( x2 , y2 );

    // Render the line
    ctx.stroke();
}


function drawStartPoint( ctx , x , y )
{
    // Set the fill style to red for the start point
    ctx.fillStyle = "rgb(255,0,0)";

    // Draw the actual point
    drawPoint( ctx , x , y );

    // Set font for text label
    ctx.font = "14px Tahoma";
    ctx.fillStyle = "#000000"; // Set text color to black

    // Draw the 'S' label next to the point
    ctx.fillText( "S" , x + 5 , y );
}

function drawControlPoint( ctx , x , y , num )
{
    // Set the fill style to blue for control points
    ctx.fillStyle = "rgb(0,0,255)";

    // Draw the point itself
    drawPoint( ctx , x , y );

    // Configure font for the label
    ctx.font = "14px Tahoma";
    ctx.fillStyle = "#000000"; // Black color for the text

    // Add a numerical label next to the control point
    ctx.fillText( num , x + 5 , y );
}

function drawCenterPoint( ctx , x , y )
{
    // Set fill style for the center point (blue)
    ctx.fillStyle = "rgb(0,0,255)";

    // Draw the point
    drawPoint( ctx , x , y );

    // Set font properties for the label
    ctx.font = "14px Tahoma";
    ctx.fillStyle = "#000000"; // Text color

    // Draw 'C' label
    ctx.fillText( "C" , x + 5 , y );
}

function drawEndPoint( ctx , x , y )
{
    // Set the fill color to green for end points
    ctx.fillStyle = "rgb(0,255,0)";

    // Call drawPoint to render the point
    drawPoint( ctx , x , y );

    // Set text font and color
    ctx.font = "14px Tahoma";
    ctx.fillStyle = "#000000";

    // Draw the 'E' label
    ctx.fillText( "E" , x + 5 , y );
}


function drawGuideLine( ctx , x1 , y1 , x2 , y2 , num )
{
    // Define an array of colors for guide lines based on 'num'
    var color = [
        "rgba(255,0,0,0.4)" , // Red with transparency
        "rgba(0,0,255,0.4)" , // Blue with transparency
        "rgba(0,255,0,0.4)"   // Green with transparency
    ][ num - 1 ] ; // Select color based on index (num - 1)

    ctx.lineWidth = 1 ; // Set line width to 1 pixel

    // If a color is defined, apply it as the stroke style
    if ( color )
        ctx.strokeStyle = color ;

    // Draw the line using the helper function
    drawLine( ctx , x1 , y1 , x2 , y2 ) ;
} // End of drawGuideLine function


function drawBoundingBox( path , pars )
{
    // Calculate the bounding rectangle for the given path
    var r = path.CalculateBounds( pars ) ;

    ctx.lineWidth = 1 ; // Set line width for the bounding box
    ctx.strokeStyle = "rgb(255,0,0)" ; // Set stroke color to red

    // Draw the rectangular bounding box
    ctx.strokeRect( r.X , r.Y , r.Width , r.Height ) ;
}


function randomInt( low , high )
{
    // Generates a random integer between low (inclusive) and high (exclusive)
    return Math.floor( Math.random( ) * ( high - low ) + low ) ;
}

function randomPoint( lowx , highx , lowy , highy )
{
    // Creates an object with random x and y coordinates
    return {
        x : randomInt( lowx , highx ) ,
        y : randomInt( lowy , highy )
    } ;
}


var multipath = ( function ( ) {
    // Helper function to add a random path entry (quadratic, cubic, or line)
    function randomEntry( path , config )
    {
        // Randomly choose the type of path segment to add
        switch ( randomInt( 0 , 3 ) )
        {
            case 0 : // Quadratic Bezier
                var qb = quadbezier.random( config ) ;
                path.QuadraticBezier( qb.cpx , qb.cpy , qb.x , qb.y ) ;
                break ;
            case 1 : // Cubic Bezier
                var cb = cubicbezier.random( config ) ;
                path.CubicBezier( cb.cp1x , cb.cp1y , cb.cp2x , cb.cp2y , cb.x , cb.y ) ;
                break ;
            case 2 : // Line segment
                var l = randomPoint( 0 , config.w , 0 , config.h ) ;
                path.Line( l.x , l.y ) ;
                break ;
        }
    }

    // Public interface for the multipath module
    return {
        random : function ( config ) {
            // Create a new raw path object
            var path = new Fayde.Path.RawPath( ) ;

            // Get a random starting point for the path
            var s = randomPoint( 0 , config.w , 0 , config.h ) ;
            path.Move( s.x , s.y ) ; // Move to the starting point

            // Determine how many segments to add to the path
            var count = randomInt( 3 , 7 ) ;

            // Add random segments to the path
            for ( var i = 0 ; i < count ; i++ )
            {
                randomEntry( path , config ) ;
            }

            return path ; // Return the generated multipath
        }
    } ;
} ) ( ) ; // Immediately-invoked function expression for multipath


var quadbezier = ( function ( ) {
    // Calculates the maxima (extrema) points of a quadratic bezier curve
    function getMaxima( x1 , x2 , x3 , y1 , y2 , y3 )
    {
        // Maxima in the x direction
        var m1 = {
            t : ( x1 - x2 ) / ( x1 - 2 * x2 + x3 ) ,
            x : 0 ,
            y : 0
        } ;
        m1.x = xoft( x1 , x2 , x3 , m1.t ) ;
        m1.y = xoft( y1 , y2 , y3 , m1.t ) ;

        // Maxima in the y direction
        var m2 = {
            t : ( y1 - y2 ) / ( y1 - 2 * y2 + y3 ) ,
            x : 0 ,
            y : 0
        } ;
        m2.y = xoft( y1 , y2 , y3 , m2.t ) ;
        m2.x = xoft( x1 , x2 , x3 , m2.t ) ;

        return [ m1 , m2 ] ; // Return both maxima points
    }

    // Calculates the coordinate at a given 't' value for a quadratic bezier component
    function xoft( a , b , c , t )
    {
        // Bezier curve formula: x(t) = a(1-t)^2 + 2*b(1-t)t + c*t^2
        // This is the "change of direction" point (where dx/dt = 0)
        return ( a * Math.pow( 1 - t , 2 ) ) + ( 2 * b * ( 1 - t ) * t ) + ( c * Math.pow( t , 2 ) ) ;
    }

    return {
        // Generates random control points for a quadratic bezier curve
        random : function ( config ) {
            var cpx = randomInt( 0 , config.w ) ;
            var cpy = randomInt( 0 , config.h ) ;
            var x = randomInt( 0 , config.w ) ;
            var y = randomInt( 0 , config.h ) ;

            return {
                cpx : cpx ,
                cpy : cpy ,
                x : x ,
                y : y
            } ;
        } ,
        maxima : getMaxima // Expose the maxima calculation function
    } ;
} ) ( ) ;


var cubicbezier = ( function ( ) {
    // Function to calculate maxima (extrema) for a cubic bezier curve
    function getMaxima( x1 , x2 , x3 , x4 , y1 , y2 , y3 , y4 )
    {
        // Inner function to calculate x-coordinate at given 't'
        function x_t( t )
        {
            var ot = 1 - t ;
            return ( x1 * ot * ot * ot ) + ( 3 * x2 * t * ot * ot ) + ( 3 * x3 * ot * t * t ) + ( x4 * t * t * t ) ;
        } ;

        // Inner function to calculate y-coordinate at given 't'
        function y_t( t )
        {
            var ot = 1 - t ;
            return ( y1 * ot * ot * ot ) + ( 3 * y2 * t * ot * ot ) + ( 3 * y3 * ot * t * t ) + ( y4 * t * t * t ) ;
        } ;

        // Inner function to create a maxima object
        function createMaxima( t )
        {
            return {
                t : t ,
                x : x_t( t ) ,
                y : y_t( t )
            } ;
        } ;

        var m = [ { } , { } , { } , { } ] ; // Array to hold maxima points

        // Calculate 't' values where dx/dt = 0
        var txs = d_dt_0( x1 , x2 , x3 , x4 ) ;
        if ( txs[ 0 ] >= 0 && txs[ 0 ] <= 1 )
            m[ 0 ] = createMaxima( txs[ 0 ] ) ;
        if ( txs[ 1 ] >= 0 && txs[ 1 ] <= 1 )
            m[ 1 ] = createMaxima( txs[ 1 ] ) ;

        // Calculate 't' values where dy/dt = 0
        var tys = d_dt_0( y1 , y2 , y3 , y4 ) ;
        if ( tys[ 0 ] >= 0 && tys[ 0 ] <= 1 )
            m[ 2 ] = createMaxima( tys[ 0 ] ) ;
        if ( tys[ 1 ] >= 0 && tys[ 1 ] <= 1 )
            m[ 3 ] = createMaxima( tys[ 1 ] ) ;

        return m ; // Return all found maxima
    }

    // Solves for 't' where the first derivative equals zero for a cubic bezier component
    function d_dt_0( a , b , c , d )
    {
        var u = 2 * a - 4 * b + 2 * c ;
        var v = b - a ;
        var w = -a + 3 * b + d - 3 * c ;

        var rt = Math.sqrt( u * u - 4 * v * w ) ;

        if ( isNaN( rt ) )
            return [ NaN , NaN ] ; // No real roots

        var z = [
            ( -u + rt ) / ( 2 * w ) ,
            ( -u - rt ) / ( 2 * w )
        ] ;
        return z ;
    }

    return {
        // Generates random control points for a cubic bezier curve
        random : function ( config ) {
            var cp1x = randomInt( 0 , config.w ) ;
            var cp1y = randomInt( 0 , config.h ) ;
            var cp2x = randomInt( 0 , config.w ) ;
            var cp2y = randomInt( 0 , config.h ) ;
            var x = randomInt( 0 , config.w ) ;
            var y = randomInt( 0 , config.h ) ;

            return {
                cp1x : cp1x ,
                cp1y : cp1y ,
                cp2x : cp2x ,
                cp2y : cp2y ,
                x : x ,
                y : y
            } ;
        } ,
        maxima : getMaxima // Expose the maxima calculation function
    } ;
} ) ( ) ;


var arcto = ( function ( ) {
    return {
        // Generates random parameters for an arcTo segment
        random : function ( config ) {
            var cpx = randomInt( 0 , config.w ) ;
            var cpy = randomInt( 0 , config.h ) ;
            var ex = randomInt( 0 , config.w ) ;
            var ey = randomInt( 0 , config.h ) ;

            var r = Math.max( 10 , randomInt( 0 , 50 ) ) ; // Radius, minimum 10

            return {
                cpx : cpx ,
                cpy : cpy ,
                ex : ex ,
                ey : ey ,
                r : r
            } ;
        }
    } ;
} ) ( ) ;


var arc = ( function ( ) {
    return {
        // Generates random parameters for an arc segment
        random : function ( config ) {
            var x = randomInt( 0 , config.w ) ;
            var y = randomInt( 0 , config.h ) ;

            // Calculate remaining space to ensure arc stays within bounds
            var rem = Math.min(
                Math.min( x , Math.max( 0 , config.w - x ) ) ,
                Math.min( y , Math.max( 0 , config.h - y ) )
            ) ;
            var radius = Math.max( 10 , randomInt( 0 , rem ) ) ; // Radius, minimum 10

            var f = Math.PI * 2 ; // Full circle in radians
            var startingAngle = randomInt( 0 , f ) ;
            var endingAngle = randomInt( 0 , f ) ;
            var counterclockwise = randomInt( 0 , 2 ) === 0 ; // Random boolean

            return {
                x : x ,
                y : y ,
                r : radius ,
                sa : startingAngle ,
                ea : endingAngle ,
                cc : counterclockwise
            } ;
        }
    } ;
} ) ( ) ;

// This section defines functions related to stroke parameters and drawing.
// The original `export interface` comment has been removed, as it's not JS code.

function randomStrokeParameters( ) {
    // Generates a set of random stroke parameters for drawing paths.
    return {
        thickness : randomInt( 1 , 35 ) , // Random thickness between 1 and 34
        join : randomInt( 0 , 3 ) , // Random line join style index
        startCap : randomInt( 0 , 3 ) , // Random start cap style index
        endCap : randomInt( 0 , 3 ) , // Random end cap style index
        miterLimit : 10 // Fixed miter limit
    } ;
}

var pathStroke ; // Function to apply stroke style to a path
var strokeParamsToString ; // Function to convert stroke parameters to a string representation

( function ( ) {
    // Define an array of possible line cap styles
    var caps = [
        "butt" ,    // Flat cap
        "square" ,  // Square cap
        "round" ,   // Round cap
        "butt"      // Triangle (falls back to butt if not supported, but spec allows)
    ] ;

    // Define an array of possible line join styles
    var joins = [
        "miter" ,
        "bevel" ,
        "round"
    ] ;

    // Assign the pathStroke function
    pathStroke = function ( ctx , stroke , pars ) {
        // If stroke or parameters are missing, do nothing
        if ( ! stroke || ! pars )
            return ;

        ctx.lineWidth = pars.thickness ; // Set line width
        // Set line cap, prioritizing startCap, then endCap, then default to butt (index 0)
        ctx.lineCap = caps[ pars.startCap || pars.endCap || 0 ] || caps[ 0 ] ;
        // Set line join, defaulting to miter (index 0)
        ctx.lineJoin = joins[ pars.join || 0 ] || joins[ 0 ] ;
        ctx.miterLimit = pars.miterLimit ; // Set miter limit
        ctx.strokeStyle = stroke ; // Set stroke color/style
        ctx.stroke( ) ; // Draw the stroke
    } ;

    // Assign the strokeParamsToString function
    strokeParamsToString = function ( pars ) {
        // If no parameters, return a default string
        if ( ! pars )
            return "thickness: 0" ;

        var thickness = pars.thickness ;
        // Resolve cap styles from their numerical indices
        var scap = caps[ pars.startCap || 0 ] || caps[ 0 ] ;
        var ecap = caps[ pars.endCap || 0 ] || caps[ 0 ] ;
        var join = joins[ pars.join || 0 ] || joins[ 0 ] ;
        var limit = pars.miterLimit ;

        // Create an array of key-value pairs and format them into a string
        return [
            [ "thickness" , thickness ] ,
            [ "startcap" , scap ] ,
            [ "endcap" , ecap ] ,
            [ "join" , join ]
        ].map( function ( kvp ) {
            return kvp.join( ": " ) ;
        } ).join( "; " ) ;
    } ;
} ) ( ) ; // End of IIFE for pathStroke and strokeParamsToString