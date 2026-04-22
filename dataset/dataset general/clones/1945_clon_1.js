/***************************************************************************************************
 *
 *  $.jsonView() 0.1 - jQuery-based JSON to HTML Pretty Printer
 *
 *  Copyright (c) 2010 Francois Lafortune (quickredfox.at)
 *  Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 *  Description:
 *      This script provides a jQuery plugin to transform a JSON object into a
 *      collapsible HTML representation, making it easier to visualize complex
 *      JSON structures.
 *
 *  Usage Example:
 *      A typical HTML structure demonstrating its use would look like this:
 *
 *      <html>
 *      <head>
 *          <link rel="stylesheet" href="jsonview.jquery.css" type="text/css" />
 *          <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.0/jquery.min.js" type="text/javascript"></script>
 *          <script src="jquery.jsonview.js" type="text/javascript"></script>
 *          <script type="text/javascript" charset="utf-8">
 *              // Ensure the DOM is fully loaded before executing scripts
 *              $(function(){
 *                  // Asynchronously fetch JSON data from a specified URL
 *                  $.getJSON('data.json', function(json){
 *                      // Render the fetched JSON data into the document body
 *                      $(document.body).jsonView(json);
 *                  });
 *              });
 *          </script>
 *      </head>
 *      <body>
 *          <!-- JSON will be injected here -->
 *      </body>
 *      </html>
 *
 ***************************************************************************************************/

( function () {

    // Define the main jQuery plugin function for pretty printing JSON
    $.fn.jsonView = function ( jsonData ) {

        var $this = $( this ); // Cache the jQuery object for the current element

        // Generate the HTML tree structure from the JSON data
        var treeHTML = "<div class=\"jquery-jsonview\">" + json2markup( jsonData ) + "</div>";

        // Inject the generated HTML into the selected element
        return $this.html( treeHTML );
    };


    // Internal recursive function to convert JSON data into HTML markup
    var json2markup = function ( json, lvl ) {

        var markup = []; // Array to hold generated HTML snippets
        var lvl    = ( lvl + 1 ) || 0; // Increment nesting level, default to 0 if not provided

        // Check if the current JSON element is an array
        if ( typeof json == 'object' && json instanceof Array ) {

            // Handle array type
            if ( json.length == 0 ) {
                // If the array is empty, render a specific empty array div
                markup.push( '<div class="empty-array-wrapper lvl-"' + lvl + '">[ ]</div>' );
            } else {
                // For non-empty arrays, start an ordered list wrapper
                markup.push( '<div class="array-wrapper lvl-' + lvl + '"><ol title="Array with ' + json.length + ' items" class="array-item-list">' );

                // Iterate through each item in the array
                for ( var i = 0, item; item = json[ i++ ]; ) {
                    // Append each array item, recursively calling json2markup for complex types
                    markup.push( '<li class="array-item"><a href="#" class="list-toggle-button">[-]</a>' + ( typeof item == 'string' || typeof item == 'number' ? '<p class="string-value">' + item + '</p>' : json2markup( item, lvl ) ) + '</li>' );
                }
                // Close the ordered list wrapper
                markup.push( '</ol></div>' );
            }

        } else if ( typeof json == 'object' ) {

            // Handle a regular JavaScript object (not an array)
            markup.push( '<div class="object-wrapper lvl-' + lvl + '"><ul class="object-property-list">' );
            var ml = markup.length; // Store initial length to check for empty objects later

            // Iterate through each property in the object
            for ( var k in json ) {
                // Append each object property and its value, recursively calling json2markup
                markup.push( '<li class="object-property"><dl class="property-definition"><dt class="property-name">' + k + ':<a href="#" class="property-toggle-button">[-]</a></dt><dd class="property-value">' + json2markup( json[ k ], lvl ) + '</dd></dl></li>' );
            }

            // Check if no properties were added (meaning the object was empty)
            if ( markup.length == ml ) {
                // If no properties, adjust markup to show an empty object wrapper
                markup.shift(); // Remove the initial <ul> tag
                markup.push( '<div class="empty-object-wrapper lvl-' + lvl + '">' );
            } else {
                markup.push( '</ul>' ); // Close the unordered list
            }
            markup.push( '</div>' ); // Close the object wrapper

        } else if ( json ) {

            // Handle string values (non-empty)
            // Sanitize the string to prevent XSS issues when inserting into HTML
            json = $( '<div/>' ).text( json ).html();
            markup.push( '<p class="string-value">' + json + '</p>' );

        } else if ( typeof json === 'number' ) {

            // Handle number values
            markup.push( '<p class="string-value">' + json.toString() + '</p>' );

        } else {

            // Handle null values (and potentially undefined, though typically not passed as 'json')
            markup.push( '<p class="null-value">null</p>' );

        }

        // Join all HTML snippets into a single string and return
        return markup.join( '' );
    };


    /**
     * Event handler for toggling the visibility of array items.
     * This allows users to collapse and expand array content.
     */
    $( '.list-toggle-button' ).live( 'click', function ( e ) {

        e.preventDefault(); // Prevent default link behavior
        e.stopPropagation(); // Stop event propagation

        var $this = $( this ); // Cache the jQuery object for the clicked button

        // Initialize data attributes on the button if not already present
        if ( !$this.data( 'li' ) ) {
            $this.data( 'li', $this.parents( 'li' ).first() ); // Store the parent <li> element
            $this.data( 'div', $this.data( 'li' ).children( 'div' ) ); // Store the child <div> containing the content
            // Determine the type of content (array, object, or string)
            var type = ( $this.data( 'li' ).find( '> .array-wrapper' ).length > 0 ? 'array' : $this.data( 'li' ).find( '> .object-wrapper' ).length > 0 ? 'object' : 'string' );
            $this.data( 'type', type );
        }

        // If there's no associated div content (e.g., array of simple strings/numbers), clear button text and exit
        if ( !$this.data( 'div' ).length ) {
            $this.text( '' );
            return;
        }

        // Toggle visibility based on current state
        if ( $this.data( 'div' ).is( ':visible' ) ) {
            // If currently visible, hide it
            $this.text( '[+]' ); // Change button text to indicate expandable content
            $this.data( 'div' ).hide( 0, function () {
                $this.data( 'li' ).addClass( 'closed-' + $this.data( 'type' ) ); // Add class to parent for styling
            } );
        } else {
            // If currently hidden, show it
            $this.text( '[-]' ); // Change button text to indicate collapsable content
            $this.data( 'div' ).show( 0, function () {
                $this.data( 'li' ).removeClass( 'closed-' + $this.data( 'type' ) ); // Remove class from parent
            } );
        }
    } );


    /**
     * Event handler for toggling the visibility of object properties.
     * This allows users to collapse and expand object property content.
     */
    $( '.property-toggle-button' ).live( 'click', function ( e ) {

        e.preventDefault(); // Prevent default link behavior
        e.stopPropagation(); // Stop event propagation

        var $this = $( this ); // Cache the jQuery object for the clicked button

        // Initialize data attributes on the button if not already present
        if ( !$this.data( 'dt' ) ) {
            $this.data( 'dt', $this.parents( 'dt' ) ); // Store the parent <dt> element
            $this.data( 'dd', $this.data( 'dt' ).next( 'dd' ) ); // Store the sibling <dd> element (the value)
            // Determine the type of content within the <dd>
            var type = ( $this.data( 'dd' ).find( '> .array-wrapper' ).length > 0 ? 'array' : $this.data( 'dd' ).find( '> .object-wrapper' ).length > 0 ? 'object' : 'string' );
            $this.data( 'type', type );
        }

        // Toggle visibility based on current state
        if ( $this.data( 'dd' ).is( ':visible' ) ) {
            // If currently visible, hide it
            $this.text( '[+]' ); // Change button text
            $this.data( 'dd' ).hide( 0, function () {
                $this.data( 'dt' ).addClass( 'closed-' + $this.data( 'type' ) ); // Add class to parent <dt> for styling
            } );
        } else {
            // If currently hidden, show it
            $this.text( '[-]' ); // Change button text
            $this.data( 'dd' ).show( 0, function () {
                $this.data( 'dt' ).removeClass( 'closed-' + $this.data( 'type' ) ); // Remove class from parent <dt>
            } );
        }
    } );

} )();