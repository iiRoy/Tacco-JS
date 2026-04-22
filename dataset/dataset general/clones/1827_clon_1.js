/*
 * This is a modified version of the ANS jQuery Bookmarklet launcher.
 * Original version: 3.0
 *
 * Project developed by A navalla suíza.
 * More info: http://idc.anavallasuiza.com/project/bookmarklet/
 *
 * Licensing information:
 * This code is released under the Creative Commons Attribution 3.0 Unported License.
 * For full details, please refer to: http://creativecommons.org/licenses/by/3.0/
 *
 * Extensive whitespace and comment changes have been applied to this file
 * to create a Type I clone, while preserving the exact original logic.
 */


// Enforce strict mode for cleaner code and error prevention.
"use strict"   ; // This helps catch common coding mistakes and "unsafe" actions.


// Define the main bookmarklet object, attached to the global window object.
window.bookmarklet =
{
    // Object to store references to dynamically loaded CSS files.
    css       : {},

    // Object to store references to dynamically loaded JavaScript files.
    js        : {},

    // Flag to indicate if jQuery has been loaded and noConflict applied.
    jQuery    : false,


    /**
     * Initializes and launches the bookmarklet by loading a configuration file.
     * @param {string} file The URL of the JavaScript file containing bookmarklet options.
     * @returns {boolean} False if no file is provided, otherwise initiates loading.
     */
    launch    : function ( file )
    {
        // Check if a file URL was actually provided.
        if ( ! file )
        {
            return false ; // Cannot launch without a file.
        }


        // Load the main JavaScript file.
        this.loadJS( file , function ( )
        {
            // Retrieve options from the global bookmarklet object, or an empty object if not set.
            var options = window.bookmarklet.options || {} ;

            // Now, execute the bookmarklet with the retrieved options.
            window.bookmarklet.execute( options )  ;
        } ) ;
    } , // End of launch method.


    /**
     * Executes the bookmarklet logic based on provided options.
     * This involves loading CSS, JavaScript, and handling jQuery initialization.
     * @param {object} options Configuration object for the bookmarklet.
     */
    execute   : function ( options )
    {
        // Ensure options.css is an array for consistent handling.
        if ( typeof( options.css ) !== 'object' )
        {
            if ( options.css )
            {
                options.css = [ options.css ] ;
            }
            else
            {
                options.css = [ ] ;
            }
        }

        // Ensure options.js is an array for consistent handling.
        if ( typeof( options.js ) !== 'object' )
        {
            if ( options.js )
            {
                options.js = [ options.js ] ;
            }
            else
            {
                options.js = [ ] ;
            }
        }


        // --- Load CSS files if any are specified in the options. ---
        if ( options.css.length )
        {
            var i ; // Loop counter variable.

            for ( i in options.css )
            {
                window.bookmarklet.loadCSS( options.css[ i ] ) ;
            }
        }


        // --- Handle jQuery loading if specified. ---
        if ( options.jquery )
        {
            // Prepend jQuery URL to the list of JS files to ensure it loads first.
            options.js.unshift( options.jquery ) ;
        }


        // --- Load all specified JavaScript files. ---
        window.bookmarklet.loadMultipleJS( options.js , function ( )
        {
            // If jQuery was part of the options:
            if ( options.jquery )
            {
                // Check if our internal jQuery reference is not yet set.
                if ( ! window.bookmarklet.jQuery )
                {
                    // Assign jQuery to our internal variable and release global $ and jQuery.
                    window.bookmarklet.jQuery = window.jQuery.noConflict( true ) ;
                }

                // Execute the 'ready' callback using our encapsulated jQuery.
                window.bookmarklet.jQuery( options.ready ) ;
            }
            else
            {
                // If no jQuery, just execute the 'ready' callback directly.
                options.ready( ) ;
            }
        } ) ;
    } , // End of execute method.


    /**
     * Recursively loads multiple JavaScript files in sequence.
     * @param {Array<string>} files An array of URLs for JavaScript files to load.
     * @param {Function} onload Callback function to execute after all files are loaded.
     * @returns {boolean} True if all files were processed (or none were provided).
     */
    loadMultipleJS: function ( files , onload )
    {
        // Base case: If there are no more files to load.
        if ( files.length === 0 )
        {
            if ( onload )
            {
                onload( ) ; // Execute the final callback.
            }
            
            return true ; // Indicate successful completion.
        }

        // Recursive step: Load the first file, then call itself for the rest.
        this.loadJS( files.shift( ) , function ( )
        {
            window.bookmarklet.loadMultipleJS( files , onload ) ;
        } ) ;
    } , // End of loadMultipleJS method.


    /**
     * Dynamically loads a single JavaScript file into the document.
     * @param {string} file The URL of the JavaScript file to load.
     * @param {Function} onload Callback function to execute once the script is loaded.
     * @returns {HTMLElement|boolean} The script element if loaded, or false if already loaded.
     */
    loadJS    : function ( file , onload )
    {
        // Check if the script has already been loaded to prevent duplicates.
        var element = this.loadedJS( file ) ;

        if ( element )
        {
            // If already loaded, and a callback is provided, execute it.
            if ( typeof onload === 'function' )
            {
                onload.call( element ) ;
            }

            return false ; // Indicate that no new element was created.
        }

        // Create a new script element.
        element = document.createElement( 'script' ) ;
        element.type = 'text/javascript' ;
        element.src = file ;

        // Attach the onload event handler, considering browser differences.
        if ( ! document.attachEvent )
        {
            // Standard browsers (Chrome, Firefox, Safari, Edge).
            element.onload = onload ;
        }
        else if ( typeof onload === 'function' )
        {
            // Older IE versions that use onreadystatechange.
            element.onreadystatechange = function ( )
            {
                // Check if the script's state indicates it's ready.
                if ( element.readyState === 'complete' || element.readyState === 'loaded' )
                {
                    onload.call( element ) ; // Execute the callback.
                    element.onreadystatechange = null ; // Prevent multiple calls.
                }
            } ;
        }

        // Append the script element to the document body to initiate loading.
        document.body.appendChild( element ) ;

        // Store a reference to the loaded script element.
        this.js[ file ] = element ;

        return element ; // Return the newly created script element.
    } , // End of loadJS method.


    /**
     * Dynamically loads a single CSS stylesheet into the document.
     * @param {string} file The URL of the CSS file to load.
     * @returns {HTMLElement|boolean} The link element if loaded, or false if already loaded.
     */
    loadCSS   : function ( file )
    {
        // Check if this CSS file has already been loaded.
        if ( this.loadedCSS( file ) )
        {
            return false ; // No need to load it again.
        }

        // Create a new <link> element for the stylesheet.
        var element = document.createElement( 'link' ) ;
        element.setAttribute( 'rel' , 'stylesheet' ) ;
        element.setAttribute( 'type' , 'text/css' ) ;
        element.setAttribute( 'href' , file ) ;

        // Append the link element to the <head> section of the document.
        document.getElementsByTagName( 'head' )[ 0 ].appendChild( element ) ;

        // Store a reference to the loaded CSS link element.
        this.css[ file ] = element ;

        return element ; // Return the newly created link element.
    } , // End of loadCSS method.


    /**
     * Checks if a specific JavaScript file has already been loaded.
     * @param {string} file The URL of the JavaScript file to check.
     * @returns {HTMLElement|boolean} The script element if loaded, otherwise false.
     */
    loadedJS  : function ( file )
    {
        // Check our internal registry for the file.
        if ( this.js[ file ] )
        {
            return this.js[ file ] ; // Return the stored element.
        }

        return false ; // File not found in registry.
    } , // End of loadedJS method.


    /**
     * Checks if a specific CSS file has already been loaded.
     * @param {string} file The URL of the CSS file to check.
     * @returns {HTMLElement|boolean} The link element if loaded, otherwise false.
     */
    loadedCSS : function ( file )
    {
        // Check our internal registry for the CSS file.
        if ( this.css[ file ] )
        {
            return this.css[ file ] ; // Return the stored element.
        }

        return false ; // File not found in registry.
    } , // End of loadedCSS method.


    /**
     * Cleans up all dynamically loaded JavaScript and CSS files from the document.
     * Resets the internal state of the bookmarklet.
     */
    die       : function ( )
    {
        var i ; // Loop iterator.

        // Remove all loaded JavaScript elements from the DOM.
        for ( i in this.js )
        {
            this.js[ i ].parentNode.removeChild( this.js[ i ] ) ;
        }

        // Remove all loaded CSS elements from the DOM.
        for ( i in this.css )
        {
            this.css[ i ].parentNode.removeChild( this.css[ i ] ) ;
        }

        // Reset the internal registries.
        this.js = {} ;
        this.css = {} ;

        // Reset the jQuery flag.
        this.jQuery = false ;
    } // End of die method.
}; // End of window.bookmarklet object definition.


// Example usage: Defines a specific bookmarklet function.
window.bookmarklet.executeMyBookmarklet = function ( )
{
    // Define options for this particular bookmarklet execution.
    var options =
    {
        // Specify the jQuery version to load.
        jquery : 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js' ,

        // The 'ready' function to execute once jQuery and other scripts are loaded.
        ready  : function ( $ )
        {
            // Change the background of the body to yellow using jQuery.
            $( "body" ).css( "background" , "yellow" ) ;

            // Clean up all loaded resources after execution.
            window.bookmarklet.die( ) ;
        }
    } ; // End of options object.

    // Execute the bookmarklet with the defined options.
    window.bookmarklet.execute( options ) ;
} ; // End of executeMyBookmarklet definition.


// --- Start of additional example bookmarklet functions (currently commented out) ---

/* This is another example demonstrating how to load external JS libraries (like jQuery plugins)
 * and then perform operations on the page.
 *
 * This specific example uses jquery.cookie.js and jquery.ba-replacetext.js
 * to replace all 'a' characters in the body with '*****'.
 */
// window.bookmarklet.executeMyBookmarklet = function ( ) {
//     var options = {
//         js: [
//         	'http://svn.wikimedia.org/svnroot/mediawiki/trunk/tools/viaf/jquery.cookie.js',
// 			'http://svn.wikimedia.org/svnroot/mediawiki/trunk/tools/viaf/jquery.ba-replacetext.js',
//         ],
//         jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
//         ready: function ($) {
// 			$("body").replaceText(/a/gi, "*****");
// 			console.log($.fn.replaceText);
// 			window.bookmarklet.die();
//         }
//     };
//
// 	window.bookmarklet.execute(options);
// }

/* Yet another example of a bookmarklet.
 * This one iterates through all <link> elements in the document.
 * If a link is a stylesheet and has an href, it appends a cache-busting
 * parameter '&r' to its URL, ensuring the browser reloads the stylesheet.
 * This can be useful for debugging CSS changes.
 */
// window.bookmarklet.executeMyBookmarklet = function ( ) {
// 	var options = {
// 		ready: function ( ) {
// 			var links = document.getElementsByTagName( 'link' ) ;
// 			var num = links.length ;
//
// 			if ( ! num ) {
// 				return ;
// 			}
//
// 			for ( var n = 0 ; n < num ; n++ ) {
// 				if ( links[ n ].rel.toLowerCase( ) == 'stylesheet' && links[ n ].href ) {
// 					if ( links[ n ].href.indexOf( '?' ) == -1 ) {
// 						links[ n ].href += '?' ;
// 					}
//
// 					links[ n ].href += '&r' ;
// 				}
// 			}
//
// 			window.bookmarklet.die( ) ;
// 		}
// 	} ;
//
// 	window.bookmarklet.execute( options ) ;
// }
// --- End of additional example bookmarklet functions ---