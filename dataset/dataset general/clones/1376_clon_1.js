/*
 *!
 * raphaeljs.serialize - A Raphael.js plugin for serializing and deserializing SVG elements.
 *
 * Copyright (c) 2010 Jonathan Spies
 * Licensed under the MIT license:
 * (http://www.opensource.org/licenses/mit-license.php)
 *
 * This file contains the core logic for the serialization and deserialization features.
 * Version 1.0.0
 */

// Extend Raphael.fn to add the serialize functionality.
Raphael.fn.serialize = {

  paper: this, // Reference to the current Raphael paper instance.

  /**
   * Serializes all elements on the paper into a JSON string.
   * Iterates through all elements from bottom to top and extracts their attributes.
   * @returns {string} A JSON string representing the SVG elements.
   */
  json: function ( ) {

    // Array to hold the serialized SVG data.
    var svgdata = [ ];

    // Loop through all elements on the paper, starting from the bottom.
    for ( var node = paper.bottom; node != null; node = node.next ) {

      // Ensure the node exists and has a type property.
      if ( node && node.type ) {

        // Use a switch statement to handle different element types.
        switch ( node.type ) {

          // Handle 'image' type elements.
          case "image":
            var object = {
              type: node.type,
              width: node.attrs[ 'width' ],
              height: node.attrs[ 'height' ],
              x: node.attrs[ 'x' ],
              y: node.attrs[ 'y' ],
              src: node.attrs[ 'src' ],
              // Include transformations if they exist, otherwise an empty string.
              transform: node.transformations ? node.transformations.join ( ' ' ) : ''
            };
            break;

          // Handle 'ellipse' type elements.
          case "ellipse":
            var object = {
              type: node.type,
              rx: node.attrs[ 'rx' ],
              ry: node.attrs[ 'ry' ],
              cx: node.attrs[ 'cx' ],
              cy: node.attrs[ 'cy' ],
              // Convert stroke value of 0 to 'none'.
              stroke: node.attrs[ 'stroke' ] === 0 ? 'none' : node.attrs[ 'stroke' ],
              'stroke-width': node.attrs[ 'stroke-width' ],
              fill: node.attrs[ 'fill' ]
            };
            break;

          // Handle 'rect' type elements.
          case "rect":
            var object = {
              type: node.type,
              x: node.attrs[ 'x' ],
              y: node.attrs[ 'y' ],
              width: node.attrs[ 'width' ],
              height: node.attrs[ 'height' ],
              // Convert stroke value of 0 to 'none'.
              stroke: node.attrs[ 'stroke' ] === 0 ? 'none' : node.attrs[ 'stroke' ],
              'stroke-width': node.attrs[ 'stroke-width' ],
              fill: node.attrs[ 'fill' ]
            };
            break;

          // Handle 'text' type elements.
          case "text":
            var object = {
              type: node.type,
              font: node.attrs[ 'font' ],
              'font-family': node.attrs[ 'font-family' ],
              'font-size': node.attrs[ 'font-size' ],
              // Convert stroke value of 0 to 'none'.
              stroke: node.attrs[ 'stroke' ] === 0 ? 'none' : node.attrs[ 'stroke' ],
              // Convert fill value of 0 to 'none'.
              fill: node.attrs[ 'fill' ] === 0 ? 'none' : node.attrs[ 'fill' ],
              'stroke-width': node.attrs[ 'stroke-width' ],
              x: node.attrs[ 'x' ],
              y: node.attrs[ 'y' ],
              text: node.attrs[ 'text' ],
              'text-anchor': node.attrs[ 'text-anchor' ]
            };
            break;


          // Handle 'path' type elements. This case is more complex due to path string construction.
          case "path":
            var path = "";

            // Check if the path attribute is already a string.
            if ( node.attrs[ 'path' ].constructor != Array ) {
              path += node.attrs[ 'path' ];
            }
            // If it's an array, iterate through its segments to build the path string.
            else {
              $.each ( node.attrs[ 'path' ], function ( i, group ) {
                $.each ( group,
                  function ( index, value ) {
                    if ( index < 1 ) {
                      path += value; // First value in a segment (e.g., 'M', 'L', 'C').
                    } else {
                      if ( index == ( group.length - 1 ) ) {
                        path += value; // Last value in a segment, no trailing comma.
                      } else {
                        path += value + ','; // Intermediate values get a comma.
                      }
                    }
                  }
                );
              } );
            }

            // Create the object for the path element.
            var object = {
              type: node.type,
              fill: node.attrs[ 'fill' ],
              opacity: node.attrs[ 'opacity' ],
              translation: node.attrs[ 'translation' ],
              scale: node.attrs[ 'scale' ],
              path: path,
              // Convert stroke value of 0 to 'none'.
              stroke: node.attrs[ 'stroke' ] === 0 ? 'none' : node.attrs[ 'stroke' ],
              'stroke-width': node.attrs[ 'stroke-width' ],
              // Include transformations if they exist.
              transform: node.transformations ? node.transformations.join ( ' ' ) : ''
            };
        }

        // If an object was successfully created for the node, add it to the svgdata array.
        if ( object ) {
          svgdata.push ( object );
        }
      }
    }

    // Convert the array of objects into a JSON string and return it.
    return ( JSON.stringify ( svgdata ) );
  },


  /**
   * Loads SVG elements onto the paper from a JSON string or object.
   * @param {string|object} json - The JSON string or object containing element data.
   * @returns {Raphael.set} A Raphael set containing all the newly created elements.
   */
  load_json: function ( json ) {

    // If the input is a string, parse it into a JSON object.
    if ( typeof ( json ) == "string" ) {
      json = JSON.parse ( json );
    } // allows both stringified or object input to the function

    var paper = this; // Get reference to the current Raphael paper.
    var set = paper.set ( ); // Create an empty Raphael set to hold new elements.

    // Iterate through each node (element definition) in the JSON data.
    $.each ( json, function ( index, node ) {
      try {
        // Create the element using its type and apply its attributes.
        var el = paper[ node.type ] ( ).attr ( node );
        set.push ( el ); // Add the newly created element to the set.
      } catch ( e ) {
        // Catch any errors during element creation (e.g., unsupported type).
        // For now, silently ignore and continue.
      }
    } );

    return set; // Return the set of created elements.
  }
};