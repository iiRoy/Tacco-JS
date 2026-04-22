/*
 *  This file is a part of Pamela, a software project authored by Pieter Iserbyt.
 *
 *  Copyright (c) 2009 Pieter Iserbyt. All rights reserved.
 *
 *  Pamela is distributed under the terms of the GNU General Public License (GPL)
 *  as published by the Free Software Foundation. This includes either version 3
 *  of the License, or, at your option, any later version.
 *
 *  Please note that Pamela is provided "AS IS" without any warranty whatsoever.
 *  This explicitly includes, but is not limited to, the implied warranties of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  For complete details, please refer to the GNU General Public License.
 *
 *  You should have received a copy of the GNU General Public License alongside
 *  this software. If not, you can obtain one from <http://www.gnu.org/licenses/>.
 */

// Define the base interface button class.
// This class provides fundamental properties and methods for UI buttons.
function IFaceButton ( x , y , width , height ) {

    // Assign the provided width to the instance's width property.
    this.width = width ;

    // Assign the provided height to the instance's height property.
    this.height = height ;

    // Call the moveTo method to set the initial position of the button.
    this.moveTo ( x , y ) ;

} ; /* End of IFaceButton constructor */



// Define the moveTo method on the IFaceButton prototype.
// This method updates the button's x and y coordinates.
IFaceButton.prototype.moveTo = function ( x , y ) {

    this.x = x ; // Set the horizontal position.
    this.y = y ; // Set the vertical position.

} ;



// Define a placeholder execute method on the IFaceButton prototype.
// Subclasses are expected to override this method with specific functionality.
IFaceButton.prototype.execute = function ( ) {

    // No operation by default.

} ;



// Define a placeholder draw method on the IFaceButton prototype.
// Subclasses are expected to override this method to render the button.
IFaceButton.prototype.draw = function ( ) {

    // No drawing by default.

} ;



// Define the isHovered method on the IFaceButton prototype.
// This method checks if a given coordinate (x, y) is within the button's bounds.
IFaceButton.prototype.isHovered = function ( x , y ) {

    // Check all four boundary conditions.
    return ( ( this.x <= x ) && ( this.y <= y ) && ( this.x + this.width >= x ) && ( this.y + this.height >= y ) ) ;

} ; /* End of IFaceButton prototype methods */



// --- FullScreenButton Class Definition ---

// Extend the FullScreenButton prototype with methods from IFaceButton.
// This establishes an inheritance relationship.
jQuery.extend ( FullScreenButton.prototype , IFaceButton.prototype ) ;

// Define the constructor for the FullScreenButton class.
// This button manages the application's full-screen state.
function FullScreenButton ( x , y ) {

    // Set default dimensions for the full-screen button.
    this.width  = 64 ;
    this.height = 64 ;

    // Initialize state variables.
    this.isFullScreen = false ; // Tracks if the application is currently in full-screen mode.
    this.isHover      = false ; // Tracks if the mouse cursor is hovering over the button.

    // Load image assets for different button states.
    this.minCol = new Image ( ) ;
    this.minCol.src = "img/min-col.png" ; // Image for minimize (colored) state.

    this.maxCol = new Image ( ) ;
    this.maxCol.src = "img/max-col.png" ; // Image for maximize (colored) state.

    this.min = new Image ( ) ;
    this.min.src = "img/min.png" ;       // Image for minimize (normal) state.

    this.max = new Image ( ) ;
    this.max.src = "img/max.png" ;       // Image for maximize (normal) state.

} ; /* End of FullScreenButton constructor */



// Override the draw method for FullScreenButton.
// This method renders the appropriate image based on full-screen and hover states.
FullScreenButton.prototype.draw = function ( ) {

    // Check if the application is in full-screen mode.
    if ( this.isFullScreen ) {

        // If in full-screen, determine if the button is hovered.
        if ( this.isHover ) {

            // Draw the colored minimize icon if hovered.
            context.drawImage ( this.minCol , this.x , this.y ) ;

        } else {

            // Draw the normal minimize icon if not hovered.
            context.drawImage ( this.min , this.x , this.y ) ;

        }

    } else {

        // If not in full-screen, determine if the button is hovered.
        if ( this.isHover ) {

            // Draw the colored maximize icon if hovered.
            context.drawImage ( this.maxCol , this.x , this.y ) ;

        } else {

            // Draw the normal maximize icon if not hovered.
            context.drawImage ( this.max , this.x , this.y ) ;

        }

    }

} ; /* End of FullScreenButton.prototype.draw */



// Override the execute method for FullScreenButton.
// This method toggles the full-screen state.
FullScreenButton.prototype.execute = function ( ) {

    // Toggle the full-screen status.
    this.isFullScreen = ! this.isFullScreen ;

    // TODO: Implement actual full-screen switching logic here.
    //       This might involve browser-specific APIs or CSS changes.

} ; /* End of FullScreenButton prototype methods */



// --- DownloadScriptButton Class Definition ---

// Extend the DownloadScriptButton prototype with methods from IFaceButton.
// This enables inheritance of base button functionality.
jQuery.extend ( DownloadScriptButton.prototype , IFaceButton.prototype ) ;

// Define the constructor for the DownloadScriptButton class.
// This button triggers a script download.
function DownloadScriptButton ( x , y ) {

    // Set default dimensions for the download button.
    this.width  = 64 ;
    this.height = 64 ;

    // Initialize hover state.
    this.isHover = false ;

    // Load image assets for different button states.
    this.dlCol = new Image ( ) ;
    this.dlCol.src = "img/dl-col.png" ; // Image for download (colored) state.

    this.dl = new Image ( ) ;
    this.dl.src = "img/dl.png" ;       // Image for download (normal) state.

} ; /* End of DownloadScriptButton constructor */



// Override the draw method for DownloadScriptButton.
// This method renders the button, potentially with text if hovered.
DownloadScriptButton.prototype.draw = function ( ) {

    // Check if the button is currently hovered by the mouse.
    if ( this.isHover ) {

        // If hovered, set fill style and font for text.
        context.fillStyle = config.buttonColor ;
        context.font = "18pt sans-serif" ;

        // Draw explanatory text above the button.
        context.fillText ( "Download pamela scanner script" , this.x , this.y - 10 ) ;

        // Draw the colored download icon.
        context.drawImage ( this.dlCol , this.x , this.y ) ;

    } else {

        // If not hovered, draw the normal download icon.
        context.drawImage ( this.dl , this.x , this.y ) ;

    }

} ; /* End of DownloadScriptButton.prototype.draw */



// Override the execute method for DownloadScriptButton.
// This method initiates the script download by changing the browser's location.
DownloadScriptButton.prototype.execute = function ( ) {

    // Redirect the browser to the scanner download link.
    location.href = config.scannerDownloadLink ;

} ; /* End of DownloadScriptButton prototype methods */



// --- IFaceButtons Class Definition ---

// Define the constructor for the IFaceButtons class.
// This class acts as a container and manager for multiple IFaceButton instances.
function IFaceButtons ( ) {

    // Initialize an empty array to store the buttons.
    this.buttons = [ ] ;

} ; /* End of IFaceButtons constructor */



// Define the add method on the IFaceButtons prototype.
// This method adds a new button to the collection and repositions all buttons.
IFaceButtons.prototype.add = function ( button ) {

    // Add the new button to the end of the buttons array.
    this.buttons [ this.buttons.length ] = button ;

    // Re-calculate and set the positions of all buttons.
    this.reposition ( ) ;

} ; /* End of IFaceButtons.prototype.add */



// Define the reposition method on the IFaceButtons prototype.
// This method arranges all buttons horizontally starting from a fixed point.
IFaceButtons.prototype.reposition = function ( ) {

    var x = 20 ;        // Starting X coordinate for the first button.
    var y = height - 64 ; // Y coordinate, fixed at the bottom of the screen.

    // Iterate through all buttons in the collection.
    for ( var i = 0 ; i < this.buttons.length ; i ++ ) {

        // Move the current button to its calculated position.
        this.buttons [ i ] . moveTo ( x , y ) ;

        // Increment X for the next button, assuming a fixed width for spacing.
        x += 64 ;

    }

} ; /* End of IFaceButtons.prototype.reposition */



// Define the draw method on the IFaceButtons prototype.
// This method iterates through all managed buttons and calls their individual draw methods.
IFaceButtons.prototype.draw = function ( ) {

    // Loop through each button in the array.
    for ( var i = 0 ; i < this.buttons.length ; i ++ )

        // Call the draw method for the current button.
        this.buttons [ i ] . draw ( ) ;

} ; /* End of IFaceButtons.prototype.draw */



// Define the mousemove event handler on the IFaceButtons prototype.
// This method updates the hover state of buttons based on mouse movement.
IFaceButtons.prototype.mousemove = function ( event ) {

    // Iterate over all buttons to check for hover status.
    for ( var i = 0 ; i < this.buttons.length ; i ++ ) {

        var b = this.buttons [ i ] ; // Get a reference to the current button.

        // Update the button's isHover property using its isHovered method.
        b.isHover = b.isHovered ( event.clientX , event.clientY ) ;

    }

} ; /* End of IFaceButtons.prototype.mousemove */



// Define the mouseclick event handler on the IFaceButtons prototype.
// This method triggers the execute action for any hovered button upon a click.
IFaceButtons.prototype.mouseclick = function ( event ) {

    // Loop through each button to determine if it was clicked.
    for ( var i = 0 ; i < this.buttons.length ; i ++ ) {

        var b = this.buttons [ i ] ; // Get a reference to the current button.

        // Check if the current button is being hovered at the click coordinates.
        if ( b.isHovered ( event.clientX , event.clientY ) )

            // If hovered, execute the button's action.
            b.execute ( ) ;

    }

} ; /* End of IFaceButtons prototype methods */