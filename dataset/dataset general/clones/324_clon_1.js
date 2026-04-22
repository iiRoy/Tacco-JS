//
// This file contains various utility functions and the main NetworkCanvas class.
//
// Original Copyright 2009-2010 Hugo Camboulive <hugo DOT camboulive AT gmail DOT com>
// Licensed under a BSD license (details omitted for brevity).
//

//
// Note regarding canvas multi-text line functions:
// It's somewhat unfortunate that the HTML5 Canvas API doesn't natively provide
// robust multi-line text rendering. These functions assume that character widths
// are relatively uniform, which may not hold true for all fonts or text content.
// For instance, a string like "AAAAAAAA aaaaaaaa" might cause issues if split.
// A more sophisticated rewrite might be necessary for perfect accuracy,
// but it's not a top priority at this moment.
//

// This function determines the number of lines required to display a given string
// within a specified maximum width. It's most accurate for monospaced fonts,
// but provides a reasonable approximation for proportional fonts.
// A small margin might be advisable in practical applications.
CanvasRenderingContext2D.prototype.measureTextLines = function ( str , maxwidth )
{
    var pixlen = this.measureText( str ).width ;

    if ( pixlen < maxwidth )
    {
        return 1 ;
    }

    // Utilize the custom String.prototype.splitLine helper.
    return str.splitLine( parseInt( maxwidth * str.length / pixlen ) ) [ 0 ] ;
} ;

//
// This function renders text across multiple lines within a canvas,
// respecting a given maximum width. It works best with monospaced fonts
// but generally provides sufficient accuracy for common use cases.
// Consider applying a margin for visual comfort.
//
CanvasRenderingContext2D.prototype.fillTextMultiLine = function ( str , x , y , maxWidth , lineHeight )
{
    lineHeight = lineHeight || 12 ; // Default line spacing is 12 pixels.

    var pixlen = this.measureText( str ).width ;
    var strings = str.splitLine( parseInt( maxWidth * str.length / pixlen ) ) [ 1 ] ;
    var string_ar = strings.split( "\n" ) ;

    for ( var i = 0 ; i < string_ar.length ; i ++ )
    {
        y += lineHeight ;
        this.fillText( string_ar [ i ] , x , y ) ;
    }
} ;

/*
 * Line Splitter Function - A utility to break a string into lines.
 *
 * Copyright Stephen Chapman, 19th April 2006.
 * You are permitted to copy and use this code, provided that the original
 * copyright notice is retained.
 */
String.prototype.splitLine = function ( n )
{
    var b = '' ;
    var s = this ;
    var linecount = 1 ;

    while ( s.length > n )
    {
        var c = s.substring( 0 , n ) ;
        var d = c.lastIndexOf( ' ' ) ;
        var e = c.lastIndexOf( '\n' ) ;

        if ( e != -1 )
        {
            d = e ;
        }

        if ( d == -1 )
        {
            d = n ;
        }

        b += c.substring( 0 , d ) + '\n' ;
        linecount += 1 ;
        s = s.substring( d + 1 ) ;
    }

    return [ linecount , b + s ] ;
}

//
// Constructor for the NetworkCanvas object.
// Requires a canvas ID, along with optional dimensions and data.
//
NetworkCanvas = function ( canvasid , width , height , names_width , meta , data )
{
    this.canvas = $ ( '#' + canvasid ) .get ( 0 ) ;
    this.height = height || 600 ;
    this.width = width || 920 ;
    this.canvas.width = this.width ;
    this.canvas.height = this.height ;

    this.names_width = names_width || 100 ;
    // Additional properties and configuration.
    this.xoffset = this.names_width ; // The left-most column for names is 100px wide.
    this.yoffset = 40 ;              // Space taken by month/day bars at the top (40px).

    this.dotsMouseOver = [ ] ; // Array to store hoverable dots.
    this.avatars = { } ;       // Cache for loaded Gravatar images.

    this.drawLabels = true ;

    this.maxx = - this.width + ( this.xoffset * 2 ) ;
    // The +100 provides a margin for displaying 'HEADS' labels.
    this.maxy = - this.height + ( this.yoffset * 2 ) + 100 ;
    this.loading = false ;
    // Colors for drawing branches; more can be added later.
    this.branchColor = [ "black" , "red" , "blue" , "lawngreen" , "magenta" , "yellow" , "orange" , "cyan" , "hotpink" , "peru" ] ;
    this.usersBySpace = [ ] ;

    // Initialize mouse event handler.
    this.mouse = new NetworkCanvas.Mouse( this ) ;
    this.mouse.init( ) ;

    // Initialize keyboard event handler.
    this.keyboard = new NetworkCanvas.Keyboard( this ) ;
    this.keyboard.init( ) ;

    // Initialize data loading and management.
    this.dataManager = new NetworkCanvas.DataManager( this ) ;
    this.dataManager.init( meta , data ) ;
} ;

NetworkCanvas.prototype = {
    /*
     * The primary drawing function for the canvas.
     * It retrieves the rendering context and orchestrates the drawing of all elements.
     * This method is invoked whenever the canvas graphics need to be updated.
     */
    draw : function ( )
    {
        // If data is not yet loaded, nothing can be drawn.
        if ( ! this.dataManager.meta )
        {
            return ;
        }
        if ( ! this.dataManager.data )
        {
            return ;
        }

        // Retrieve the 2D rendering context from the canvas.
        if ( this.canvas.getContext )
        {
            var ctx = this.canvas.getContext( '2d' ) ;
            ctx.font = "small sans-serif" ;

            this.drawBlocks( ctx ) ;      // Draw the background blocks.
            this.drawData( ctx ) ;        // Draw data points and their connections.
            this.drawNames( ctx ) ;       // Draw user names on the left.
            this.drawMonthBar( ctx ) ;    // Draw the month bar at the top.
            this.drawDayBar( ctx ) ;      // Draw the day bar below the month bar.
            this.drawDates( ctx ) ;       // Populate the month and day bars with dates.

            // Obscure the initial 100px of the month/day bars.
            ctx.fillStyle = "black" ;
            ctx.fillRect( 0 , 0 , this.names_width , 20 ) ;
            ctx.fillStyle = "rgb(64,64,64)" ;
            ctx.fillRect( 0 , 20 , this.names_width , 20 ) ;

            // If a dot is hovered, draw its associated hint.
            if ( this.drawDot )
            {
                this.drawHint( ctx , this.drawDot ) ;
            }
        }
    } ,

    //
    // Draws a "hint" box when a commit dot is hovered by the mouse.
    // This hint typically includes a rounded rectangle, a Gravatar image,
    // the author's name, commit hash, and the commit message.
    //
    drawHint : function ( ctx , hint )
    {
        var x = ( this.names_width * 2 ) + ( 20 * hint.time ) - this.xoffset + 10 ;
        var y = 80 + 20 * hint.space - this.yoffset - 10 ;

        // Calculate the necessary height for the hint box based on message length.
        ctx.font = "small sans-serif" ;
        ctx.fillStyle = "black" ;
        var txtlen = ctx.measureTextLines( hint.message , 400 - 15 - 15 ) ;
        var maxy = 70 + txtlen * 15 + 5 ;

        // Adjust the hint's horizontal position to keep it within canvas bounds.
        if ( x + 10 + 400 > this.width )
        {
            x = this.width - 400 - 10 ;
        }
        else if ( x + 10 < this.names_width )
        {
            x = this.names_width + 10 ;
        }
        else
        {
            x += 10 ;
        }

        // Adjust the hint's vertical position to keep it within canvas bounds.
        if ( y + 10 + maxy > this.height )
        {
            // Not enough space below the dot; move it above.
            y = Math.max( 40 , y - 10 - maxy ) ;
        }
        else if ( y < 40 )
        {
            y = 40 + 10 ;
        }
        else
        {
            y += 10 ;
        }

        // Draw the rounded rectangle background for the hint.
        ctx.beginPath( ) ;
        ctx.strokeStyle = "black" ;
        ctx.fillStyle = "white" ;
        ctx.lineWidth = "2" ;
        ctx.moveTo( x , y + 5 ) ;
        ctx.quadraticCurveTo( x , y , x + 5 , y ) ;
        ctx.lineTo( x + 400 - 5 , y ) ;
        ctx.quadraticCurveTo( x + 400 , y , x + 400 , y + 5 ) ;
        ctx.lineTo( x + 400 , y + maxy - 5 ) ;
        ctx.quadraticCurveTo( x + 400 , y + maxy , x + 395 , y + maxy ) ;
        ctx.lineTo( x + 5 , y + maxy ) ;
        ctx.quadraticCurveTo( x , y + maxy , x , y + maxy - 5 ) ;
        ctx.lineTo( x , y + 5 ) ;
        ctx.fill( ) ;
        ctx.stroke( ) ;

        // Preload the Gravatar image if it hasn't been cached yet.
        if ( ! this.avatars [ hint.gravatar ] )
        {
            this.avatars [ hint.gravatar ] = new Image( ) ;
            this.avatars [ hint.gravatar ].src = "http://www.gravatar.com/avatar/" + hint.gravatar + "?s=32" ;
            var ths = this ; // Capture 'this' for the onload callback.
            this.avatars [ hint.gravatar ].onload = function ( )
            {
                if ( hint == ths.drawDot )
                {
                    ctx.drawImage( ths.avatars [ hint.gravatar ] , x + 15 , y + 15 ) ;
                }
            } ;
        }
        else
        {
            ctx.drawImage( this.avatars [ hint.gravatar ] , x + 15 , y + 15 ) ;
        }

        // Add the author's name to the hint box.
        ctx.fillStyle = "black" ;
        ctx.font = "medium sans-serif" ;
        ctx.fillText( hint.author , x + 15 + 32 + 15 , y + 35 ) ;

        // Add the commit hash.
        ctx.font = "small sans-serif" ;
        ctx.fillStyle = "grey" ;
        ctx.fillText( hint.id , x + 15 , y + 65 ) ;

        // Add the commit message, potentially spanning multiple lines.
        ctx.font = "small sans-serif" ;
        ctx.fillStyle = "black" ;
        ctx.fillTextMultiLine( hint.message , x + 15 , y + 70 , 400 - 15 - 15 ) ;
    } ,

    // Fills the top-most bar with black to represent months.
    drawMonthBar : function ( ctx )
    {
        ctx.fillStyle = "black" ;
        ctx.fillRect( 0 , 0 , this.width , 20 ) ;
    } ,

    // Fills the bar directly below the month bar with grey for days.
    drawDayBar : function ( ctx )
    {
        ctx.fillStyle = "rgb(64,64,64)" ;
        ctx.fillRect( 0 , 20 , this.width , 20 ) ;
    } ,

    //
    // Draws an individual name block within the left-hand column.
    // Handles alternating background colors and hover effects.
    //
    drawNameBlock : function ( ctx , idx )
    {
        var colors = [ "rgb(235,235,255)" , "rgb(224,224,255)" ] ;
        var val = this.dataManager.meta.blocks [ idx ] ;
        var ystart = 80 + val.start * 20 ;
        var yend = ystart + val.count * 20 ;

        // Only draw if the block is within the visible canvas area.
        if ( ( ystart - this.yoffset >= 40 && ystart - this.yoffset <= this.height ) ||
             ( yend - this.yoffset >= 40 && yend - this.yoffset <= this.height ) )
        {
            // Draw the background of the name block.
            if ( this.mouse.lastPoint.y > ystart - this.yoffset &&
                 this.mouse.lastPoint.y <= yend - this.yoffset &&
                 this.mouse.lastPoint.x <= this.names_width )
            {
                // If hovered, use a specific highlight color.
                ctx.fillStyle = "rgb(223,223,243)" ;
                ctx.fillRect( 0 , ystart - this.yoffset , this.names_width , val.count * 20 ) ;
            }
            else if ( idx % 2 == 1 )
            {
                // For odd-indexed blocks, use an alternating background color.
                ctx.fillStyle = "rgb(224,224,255)" ;
                ctx.fillRect( 0 , ystart - this.yoffset , this.names_width , val.count * 20 ) ;
            }

            // Draw the border around the name block.
            ctx.strokeStyle = "rgb(222,222,222)" ;
            ctx.lineWidth = "1" ;
            ctx.beginPath( ) ;
            ctx.moveTo( this.names_width , ystart - this.yoffset + 0.5 ) ;
            ctx.lineTo( 0.5 , ystart - this.yoffset + 0.5 ) ;
            ctx.lineTo( 0.5 , yend - this.yoffset + 0.5 ) ;
            ctx.lineTo( this.names_width , yend - this.yoffset + 0.5 ) ;
            ctx.stroke( ) ;

            // Draw the actual name text.
            ctx.fillStyle = "black" ;
            ctx.fillText( val.name , 5 , ( ystart + yend ) / 2 - this.yoffset + 5 , this.names_width - 10 ) ;
        }
    } ,

    // Draws the names of each repository owner in the dedicated left column.
    drawNames : function ( ctx )
    {
        ctx.save( ) ;
        ctx.fillStyle = "rgb(235,235,255)" ;
        ctx.fillRect( 0 , 40 , this.names_width , this.height - 40 ) ;

        // Iterate through all blocks and draw their respective names.
        for ( var i = 0 ; i < this.dataManager.meta.blocks.length ; i ++ )
        {
            this.drawNameBlock( ctx , i ) ;
        }
        ctx.restore( ) ;
    } ,

    // Draws the background blocks to the right of each name column,
    // providing a visual separation for different commit "spaces".
    drawBlocks : function ( ctx )
    {
        var colors = [ "rgb(245,245,255)" , "rgb(240,240,255)" ] ;
        var y = 80 ;
        ctx.save( ) ;
        ctx.fillStyle = colors [ 0 ] ;
        ctx.fillRect( this.names_width , 40 , this.width - this.names_width , this.height - 40 ) ;

        for ( var i = 0 ; i < this.dataManager.meta.blocks.length ; i ++ )
        {
            var val = this.dataManager.meta.blocks [ i ] ;
            var ydest = y + val.count * 20 ;

            // Check visibility before drawing.
            if ( ( y - this.yoffset >= 40 && y - this.yoffset <= this.height ) ||
                 ( ydest - this.yoffset >= 40 && ydest - this.yoffset <= this.height ) )
            {
                if ( i % 2 == 1 )
                {
                    ctx.fillStyle = colors [ 1 ] ;
                    ctx.fillRect( this.names_width , y - this.yoffset , this.width - this.names_width , val.count * 20 ) ;
                }
                ctx.lineWidth = "1" ;
                ctx.strokeStyle = "rgb(222,222,222)" ;
                ctx.strokeRect( 0.5 , y - this.yoffset + 0.5 , this.width - 0.5 , val.count * 20 ) ;
            }
            y += val.count * 20 ;
        }
        ctx.restore( ) ;
    } ,

    // Draws the month and day labels in their respective bars at the top of the canvas.
    drawDates : function ( ctx )
    {
        // Mapping for month numbers to three-character abbreviations.
        var valtomonth = { "01" : "Jan" , "02" : "Feb" , "03" : "Mar" , "04" : "Apr" , "05" : "May" , "06" : "Jun" ,
                           "07" : "Jul" , "08" : "Aug" , "09" : "Sep" , "10" : "Oct" , "11" : "Nov" , "12" : "Dec" } ;
        var olddate ;
        var newdate ;
        var min = parseInt( ( this.xoffset - this.names_width ) / 20 ) ;

        if ( min <= 0 )
        {
            olddate = [ 1970 , 1 , 1 ] ;
        }
        else
        {
            olddate = this.dataManager.meta.dates [ min - 1 ].split( "-" ) ;
        }

        // Iterate through a range of dates to display.
        for ( var i = parseInt( ( this.xoffset - this.names_width ) / 20 ) ; i <= parseInt( ( this.xoffset - this.names_width + this.width ) / 20 ) ; i ++ )
        {
            var val = this.dataManager.meta.dates [ i ] ;
            if ( ! val )
            {
                continue ;
            }
            newdate = val.split( "-" ) ;
            var x = ( 2 * this.names_width ) + 20 * i - this.xoffset ;

            // Display a new month label if the month or year has changed.
            if ( newdate [ 0 ] != olddate [ 0 ] || newdate [ 1 ] != olddate [ 1 ] )
            {
                ctx.fillStyle = "white" ;
                ctx.fillText( valtomonth [ newdate [ 1 ] ] , x , 15 ) ;
            }
            // Display a new day label if the day, month, or year has changed.
            if ( newdate [ 0 ] != olddate [ 0 ] || newdate [ 1 ] != olddate [ 1 ] || newdate [ 2 ] != olddate [ 2 ] )
            {
                ctx.fillStyle = "rgb(192,192,192)" ;
                ctx.fillText( newdate [ 2 ] , x , 35 ) ;
            }
            olddate = newdate ;
        }
    } ,

    //
    // Draws a small branch head label (e.g., "master", "HEAD") below a commit dot.
    // The label is drawn within a rotated, rounded rectangle shape.
    //
    drawHead : function ( ctx , label , x , y )
    {
        ctx.save( ) ;
        ctx.font = "10px monospace" ;
        var size = ctx.measureText( label ).width ;

        // Draw the background shape for the label.
        ctx.beginPath( ) ;
        ctx.fillStyle = "black" ;
        ctx.globalAlpha = 0.8 ; // Semi-transparent background.
        ctx.moveTo( x , y ) ;
        ctx.lineTo( x - 4 , y + 10 ) ;
        ctx.quadraticCurveTo( x - 8 , y + 10 , x - 8 , y + 15 ) ;
        ctx.lineTo( x - 8 , y + 15 + size ) ;
        ctx.quadraticCurveTo( x - 8 , y + 15 + size + 5 , x - 4 , y + 15 + size + 5 ) ;
        ctx.lineTo( x + 4 , y + 15 + size + 5 ) ;
        ctx.quadraticCurveTo( x + 8 , y + 15 + size + 5 , x + 8 , y + 15 + size ) ;
        ctx.lineTo( x + 8 , y + 15 ) ;
        ctx.quadraticCurveTo( x + 8 , y + 10 , x + 4 , y + 10 ) ;
        ctx.lineTo( x , y ) ;
        ctx.fill( ) ;

        // Print the rotated text label.
        ctx.globalAlpha = 1.0 ; // Restore full opacity for text.
        ctx.fillStyle = "white" ;
        ctx.textBaseline = "middle" ;
        ctx.rotate( Math.PI / 2 ) ; // Rotate by 90 degrees.
        ctx.fillText( label , y + 15 , - x ) ;
        ctx.rotate( - Math.PI / 2 ) ; // Rotate back.
        ctx.restore( ) ;

        // Return the total vertical space consumed by the head label.
        return size + 5 + 15 ; // 5 = bottom border, 15 = top border.
    } ,

    // Draws all the commit dots on the canvas.
    // Also populates `dotsMouseOver` array for hit detection.
    drawDataDots : function ( ctx )
    {
        this.dotsMouseOver = [ ] ; // Clear previous hover data.

        // Iterate through all visible commits.
        for ( var i = parseInt( ( this.xoffset - this.names_width ) / 20 ) ; i <= parseInt( ( this.xoffset - this.names_width + this.width ) / 20 ) ; i ++ )
        {
            var val = this.dataManager.getCommit( i ) ;
            if ( ! val )
            {
                continue ;
            }
            var x = ( this.names_width * 2 ) + ( 20 * val.time ) - this.xoffset + 10 ;
            var y = 80 + 20 * val.space - this.yoffset - 10 ;

            // Draw the dot if it's within the visible area.
            if ( x > this.names_width - 20 && x < this.width + 20 && y > 20 && y < this.height + 20 )
            {
                ctx.beginPath( ) ;
                if ( val == this.drawDot )
                {
                    // If this dot is currently hovered, draw it larger and with a white outline.
                    ctx.fillStyle = "white" ;
                    ctx.arc( x , y , 6 , 0 , ( Math.PI * 2 ) , false ) ;
                    ctx.fill( ) ;
                    ctx.beginPath( ) ;
                    ctx.fillStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
                    ctx.arc( x , y , 5 , 0 , ( Math.PI * 2 ) , false ) ;
                    ctx.fill( ) ;
                }
                else
                {
                    // Otherwise, draw a standard small dot.
                    ctx.fillStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
                    ctx.arc( x , y , 3 , 0 , ( Math.PI * 2 ) , false ) ;
                    ctx.fill( ) ;
                }
                // Add the dot's data to the array for mouse interaction.
                this.dotsMouseOver.push( { "x" : x , "y" : y , "val" : val } ) ;
            }
        }
    } ,

    // Draws all the branch HEAD labels on the canvas.
    drawDataHeads : function ( ctx )
    {
        // Iterate through all visible commits to check for HEADs.
        for ( var i = parseInt( ( this.xoffset - this.names_width ) / 20 ) ; i <= parseInt( ( this.xoffset - this.names_width + this.width ) / 20 ) ; i ++ )
        {
            var val = this.dataManager.getCommit( i ) ;
            if ( ! val )
            {
                continue ;
            }
            var x = ( this.names_width * 2 ) + ( 20 * val.time ) - this.xoffset + 10 ;
            var y = 80 + 20 * val.space - this.yoffset - 10 ;
            var yhead = y + 5 ;

            // Check if this commit has any HEADs associated with it.
            if ( this.dataManager.heads [ this.usersBySpace [ val.space - 1 ].name ] && this.dataManager.heads [ this.usersBySpace [ val.space - 1 ].name ] [ val.id ] )
            {
                // Draw each head label.
                for ( var j = 0 ; j < this.dataManager.heads [ this.usersBySpace [ val.space - 1 ].name ] [ val.id ].length ; j ++ )
                {
                    var label = this.dataManager.heads [ this.usersBySpace [ val.space - 1 ].name ] [ val.id ] [ j ] ;
                    yhead += this.drawHead( ctx , label , x , yhead ) + 5 ;
                }
            }
        }
    } ,

    // Draws the lines and arrows connecting commit dots to their parents.
    drawDataLinks : function ( ctx )
    {
        // displaycount is unused; consider removing.
        var displaycount = 0 ;

        // Iterate backwards through commits to draw links from child to parent.
        for ( var i = this.dataManager.meta.dates.length - 1 ; i >= parseInt( ( this.xoffset - this.names_width ) / 20 ) ; i -- )
        {
            var val = this.dataManager.getCommit( i ) ;
            if ( ! val )
            {
                continue ;
            }
            var x = ( this.names_width * 2 ) + ( 20 * val.time ) - this.xoffset + 10 ;
            var y = 80 + 20 * val.space - this.yoffset - 10 ;
            ctx.strokeStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
            ctx.lineWidth = 2 ;

            var middle_used = false ;
            for ( var j = 0 ; j < val.parents.length ; j ++ )
            {
                var parnt = val.parents [ j ] ;
                if ( parnt [ 2 ] == val.space )
                {
                    middle_used = true ;
                }
            }

            // For each commit, draw lines/arrows to its parents.
            for ( var j = 0 ; j < val.parents.length ; j ++ )
            {
                var parnt = val.parents [ j ] ;
                var xdest = ( this.names_width * 2 ) + ( 20 * parnt [ 1 ] ) - this.xoffset + 10 ;
                var ydest = 80 + 20 * parnt [ 2 ] - this.yoffset - 10 ;

                // Skip drawing if the line is not visible on screen.
                if ( ! this.needToDrawLine( x , y , xdest , ydest ) )
                {
                    continue ;
                }

                // Different types of lines/arrows based on parent's position.
                if ( parnt [ 2 ] == val.space )
                {
                    // Parent is on the same line (straight line).
                    ctx.beginPath( ) ;
                    ctx.strokeStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
                    ctx.moveTo( x - 5 , y ) ;
                    ctx.lineTo( xdest + 5 , y ) ;
                    ctx.stroke( ) ;
                }
                else if ( parnt [ 2 ] > val.space )
                {
                    // Parent is on a 'lower' line (merge arrow).
                    ctx.beginPath( ) ;
                    ctx.lineWidth = 2 ;
                    ctx.strokeStyle = this.branchColor [ ( parnt [ 2 ] - 1 ) % this.branchColor.length ] ;
                    ctx.fillStyle = this.branchColor [ ( parnt [ 2 ] - 1 ) % this.branchColor.length ] ;
                    ctx.moveTo( xdest + 5 , ydest ) ;
                    ctx.lineTo( x - 11 , ydest ) ;
                    ctx.lineTo( x - 11 , y + 13 ) ;
                    ctx.lineTo( x - 9 , y + 9 ) ;
                    ctx.stroke( ) ;

                    // Draw the arrowhead.
                    ctx.beginPath( ) ;
                    ctx.lineWidth = 1 ;
                    ctx.moveTo( x - 5 , y + 5 ) ;
                    ctx.lineTo( x - 13 , y + 8 ) ;
                    ctx.lineTo( x - 7 , y + 14 ) ;
                    ctx.lineTo( x - 5 , y + 5 ) ;
                    ctx.fill( ) ;
                }
                else
                {
                    // Parent is on an 'upper' line (fork arrow).
                    if ( middle_used == false )
                    {
                        ctx.beginPath( ) ;
                        ctx.strokeStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
                        ctx.fillStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;

                        // Draw arrowhead.
                        ctx.lineWidth = 1 ;
                        ctx.moveTo( x - 5 , y ) ;
                        ctx.lineTo( x - 5 - 9 , y - 3.5 ) ;
                        ctx.lineTo( x - 5 - 9 , y + 3.5 ) ;
                        ctx.lineTo( x - 5 , y ) ;
                        ctx.fill( ) ;

                        // Draw lines.
                        ctx.beginPath( ) ;
                        ctx.lineWidth = 2 ;
                        ctx.moveTo( x - 5 - 8 , y ) ;
                        ctx.lineTo( xdest , y ) ;
                        ctx.lineTo( xdest , ydest + 5 ) ;
                        ctx.stroke( ) ;
                    }
                    else
                    {
                        ctx.beginPath( ) ;
                        ctx.lineWidth = 2 ;
                        ctx.strokeStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
                        ctx.fillStyle = this.branchColor [ ( val.space - 1 ) % this.branchColor.length ] ;
                        ctx.moveTo( xdest , ydest + 5 ) ;
                        ctx.lineTo( xdest , y - 12 ) ;
                        ctx.lineTo( x - 12 , y - 12 ) ;
                        ctx.lineTo( x - 9 , y - 9 ) ;
                        ctx.stroke( ) ;

                        // Draw arrowhead.
                        ctx.beginPath( ) ;
                        ctx.lineWidth = 1 ;
                        ctx.moveTo( x - 5 , y - 5 ) ;
                        ctx.lineTo( x - 13 , y - 8 ) ;
                        ctx.lineTo( x - 7 , y - 14 ) ;
                        ctx.lineTo( x - 5 , y - 5 ) ;
                        ctx.fill( ) ;
                    }
                }
            }
        }
    } ,

    //
    // The main function to draw all data-related elements:
    // commit dots, connecting arrows/lines, and optional hint boxes.
    //
    drawData : function ( ctx )
    {
        this.drawDataLinks( ctx ) ; // First draw the connections.
        this.drawDataDots( ctx ) ;  // Then draw the dots on top.
        if ( this.drawLabels )
        {
            this.drawDataHeads( ctx ) ; // Finally, draw any branch head labels.
        }
    }
} ;