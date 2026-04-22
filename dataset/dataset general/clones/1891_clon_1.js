/*
 * This file contains utility functions for handling UI events and managing presentation state.
 * It uses 'globals' module, lodash ('_'), and a custom 'App' object.
 */
/* globals module, _, App */

'use strict' ; // Enforce strict mode for cleaner code.


// Exported object containing event listener setup.
module.exports = {

    /**
     * Attaches various event listeners to UI elements.
     * @param {object} handler - An object containing references to DOM elements.
     */
    addListeners: function ( handler ) {
        // Listener for presentation title input changes (keyup event).
        handler.presentationTitle.addEventListener( 'keyup', setPresentationTitle, false );

        // Listener for theme selector changes.
        handler.themeSelector.addEventListener( 'change', changeTheme, false );

        // Listener for hiding the sidemenu on click.
        handler.hideSidemenu.addEventListener( 'click', hideSidemenu, false );

        // Listener for showing the sidemenu on mouseover.
        document.querySelector( '.sidemenu' ) .addEventListener( 'mouseover', showSidemenu, false );
    }

}; // End of module.exports definition.


// Global flag to prevent multiple sidemenu animations.
var isSliding = false ;


/**
 * Changes the current presentation theme.
 * This function is typically triggered by a 'change' event on a theme selector.
 */
function changeTheme ( ) {

    // Update the application's theme property.
    App.theme = this.value ;

    // List of available themes (CSS files).
    var themes = [

        'default.css',
        'night.css',
        'beige.css'

    ] ;

    // Remove all existing theme CSS files.
    _.each( themes, removeCSS ) ;

    // Append the newly selected theme's CSS.
    appendCSS( this.value ) ;

}


/**
 * Dynamically appends a CSS stylesheet to the document head.
 * @param {string} theme - The filename of the CSS theme to append.
 */
function appendCSS ( theme ) {

    // Create a new link element.
    var link = document.createElement( 'link' ) ;

    // Set the relation attribute.
    link.rel = 'stylesheet' ;

    // Construct the href attribute.
    link.href = 'css/' + theme ;

    // Append the link element to the document's head.
    document.querySelector( 'head' ) .appendChild( link ) ;

}


/**
 * Removes a specific CSS stylesheet from the document head.
 * It identifies the stylesheet by its href attribute.
 * @param {string} val - The filename of the CSS theme to remove.
 */
function removeCSS ( val ) {

    // Select the link element based on its relation and partial href.
    var sel = document.querySelector( 'link[rel=stylesheet][href$="' + val + '"]' ) ;

    // If the element exists, remove it from its parent.
    if ( sel ) {

        sel.parentNode.removeChild( sel ) ;

    }

} // End of removeCSS function.


/**
 * Hides the sidemenu by transforming its position.
 * Sets a flag to prevent immediate re-showing.
 */
function hideSidemenu ( ) {

    // Get the parent element of the clicked element (the sidemenu itself).
    var el = this.parentNode ;

    // Apply CSS transforms for different browsers to move the sidemenu off-screen.
    el.style.mozTransform = 'translateX(-90%)' ;
    el.style.webkitTransform = 'translateX(-90%)' ;
    el.style.transform = 'translateX(-90%)' ;

    // Set sliding flag to true.
    isSliding = true ;

    // Reset the sliding flag after a short delay.
    window.setTimeout( function ( ) {

        isSliding = false ;

    }, 300 ) ;

}


/**
 * Shows the sidemenu by transforming its position back to visible.
 * Only acts if the sidemenu is not currently sliding.
 */
function showSidemenu ( ) {

    // Prevent showing if the sidemenu is currently transitioning.
    if ( isSliding ) {

        return ; // Exit early.

    }

    // 'this' refers to the sidemenu element in this context.
    var el = this ;

    // Apply CSS transforms for different browsers to move the sidemenu back into view.
    el.style.mozTransform = 'translateX(0)' ;
    el.style.webkitTransform = 'translateX(0)' ;
    el.style.transform = 'translateX(0)' ;

}


/**
 * Sets the presentation title based on user input.
 * Uses a debounce mechanism to avoid frequent updates.
 */
function setPresentationTitle ( ) {

    // Get the current value from the input field.
    var value = this.value ;

    // Clear any existing timeout to debounce updates.
    if ( window._timeout ) {

        clearInterval( window._timeout ) ;
        window._timeout = 0 ;

    }

    // Set a new timeout to update the title after a delay.
    window._timeout = setTimeout( function ( ) {

        document.title = value ; // Update browser tab title.
        App.title = value ;      // Update application's internal title.

    }, 300 ) ;

} // End of setPresentationTitle function.