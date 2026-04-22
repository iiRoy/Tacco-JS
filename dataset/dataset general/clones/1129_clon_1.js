/*
 * This script initializes interactive elements on page load.
 * It handles button click events and calculates distances for
 * determining interaction direction.
 */
window.onload = function ( ) { // Main entry point after the document is fully loaded

    // Declare and initialize the main button element.
    var btn = document . querySelector ( '.btn' ) ;

    // Declare and initialize specific parts of the button.
    var btnFront = btn . querySelector ( '.btn-front' ) , // The visible front part of the button
        btnYes = btn . querySelector ( '.btn-back .yes' ) , // The 'Yes' button in the back
        btnNo = btn . querySelector ( '.btn-back .no' ) ; // The 'No' button in the back

    // Add an event listener to the front of the button for click events.
    btnFront . addEventListener ( 'click' , function ( event ) {

        /*
         * Calculate mouse coordinates relative to the button's position.
         * mx: mouse X coordinate relative to button's left edge
         * my: mouse Y coordinate relative to button's top edge
         */
        var mx = event . clientX - btn . offsetLeft ,
            my = event . clientY - btn . offsetTop ;

        // Get the width and height of the button.
        var w = btn . offsetWidth ,
            h = btn . offsetHeight ;

        // Define potential interaction directions with their central points.
        var directions = [
            { id : 'top' , x : w / 2 , y : 0 } ,
            { id : 'right' , x : w , y : h / 2 } ,
            { id : 'bottom' , x : w / 2 , y : h } ,
            { id : 'left' , x : 0 , y : h / 2 }
        ] ;

        // Sort the directions based on their distance from the mouse click point.
        // The closest direction will be at the beginning of the array.
        directions . sort ( function ( a , b ) {
            return distance ( mx , my , a . x , a . y ) - distance ( mx , my , b . x , b . y ) ;
        } ) ;

        // Set the 'data-direction' attribute of the button based on the closest direction.
        // Then, add the 'is-open' class to reveal the back of the button.
        btn . setAttribute ( 'data-direction' , directions . shift ( ) . id ) ;
        btn . classList . add ( 'is-open' ) ;

    } ) ; // End of btnFront click listener

    // Add an event listener to the 'Yes' button.
    btnYes . addEventListener ( 'click' , function ( event ) {
        // When 'Yes' is clicked, remove the 'is-open' class to close the button.
        btn . classList . remove ( 'is-open' ) ;
    } ) ; // End of btnYes click listener

    // Add an event listener to the 'No' button.
    btnNo . addEventListener ( 'click' , function ( event ) {
        // When 'No' is clicked, also remove the 'is-open' class to close the button.
        btn . classList . remove ( 'is-open' ) ;
    } ) ; // End of btnNo click listener

    /**
     * Calculates the Euclidean distance between two points (x1, y1) and (x2, y2).
     * @param {number} x1 - The X coordinate of the first point.
     * @param {number} y1 - The Y coordinate of the first point.
     * @param {number} x2 - The X coordinate of the second point.
     * @param {number} y2 - The Y coordinate of the second point.
     * @returns {number} The distance between the two points.
     */
    function distance ( x1 , y1 , x2 , y2 ) {
        // Calculate the difference in X coordinates.
        var dx = x1 - x2 ;
        // Calculate the difference in Y coordinates.
        var dy = y1 - y2 ;
        // Return the square root of (dx^2 + dy^2).
        return Math . sqrt ( dx * dx + dy * dy ) ;
    } // End of distance function

} ; // End of window.onload function