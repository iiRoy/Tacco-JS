/*
 * This file provides a JavaScript utility for converting JSON data
 * into a native XML Document object.
 *
 * It is a re-implementation inspired by the original 'json2xml' jQuery plugin
 * authored by Michal Korecki (www.michalkorecki.com).
 *
 * While Michal's plugin typically returns XML as a string, this variant,
 * named 'json2xmlDoc', focuses on producing a DOM XML Document.
 *
 * Current version does not expose configuration options, but aims for
 * straightforward JSON-to-XML transformation.
 *
 * Primary use case: Client-side generation of SVARX validation rulesets
 * from structured JSON input.
 *
 * @version 1.00 - Initial release based on JSON to XML conversion logic.
 * @author Max Shirshin, building upon Michal Korecki's foundational work.
 */


( function ( $ ) {

    /**
     * Transforms a given JSON object into an XML Document.
     *
     * Note: This function expects a JavaScript object, not a JSON string.
     * The `tagName` parameter specifies the root element of the resulting XML.
     *
     * @param {object} json - The JSON object to be converted.
     * @param {string} tagName - The desired name for the root XML element.
     * @returns {Document} An XML Document object representing the JSON data.
     * @throws {Error} If the conversion process encounters an issue.
     */
    $.json2xmlDoc = function ( json, tagName ) {

        var xmlDoc ; // Variable to hold the new XML Document instance.

        // Attempt to create a new XML Document using standard DOM methods.
        try {

            xmlDoc = document.implementation.createDocument ( '', '', null ) ;

        } catch ( e ) {

            // Fallback for older IE versions that require ActiveX.
            xmlDoc = new ActiveXObject ( 'Msxml2.DOMDocument.3.0' ) ;

        }


        // Proceed with the actual conversion by calling the helper function.
        try {

            convertToXml ( xmlDoc, json, tagName ) ;

        } catch ( e ) {

            // If any error occurs during conversion, re-throw with a descriptive message.
            throw new Error ( 'JSON to XML conversion failed: ' + e.message ) ;

        }

        // Return the fully constructed XML Document.
        return xmlDoc ;

    } ;


    /**
     * Recursively converts a JSON object or part of it into XML elements.
     * This is a core helper function for the json2xmlDoc process.
     *
     * @param {Node} root - The current XML parent node to append new elements to.
     * @param {object} json - The JSON object (or sub-object) to process.
     * @param {string} tagName - The tag name for the element representing the current JSON object.
     */
    function convertToXml ( root, json, tagName ) {

        var doc = root.ownerDocument || root , // Get the XML document reference.
            newTag = root.appendChild ( doc.createElement ( tagName ) ) ; // Create and append the new XML element.


        // Iterate over properties of the JSON object.
        for ( var key in json ) {

            // Ensure we are only processing own properties, not inherited ones.
            if ( json.hasOwnProperty ( key ) ) {

                // Check if the current property's value is an array.
                if ( $.isArray ( json[ key ] ) ) {

                    // If it's an array, handle it specifically.
                    createNodeFromArray ( newTag, json[ key ], key ) ;

                }
                // Check if the current property's value is another object (and not null).
                else if ( typeof json[ key ] === 'object' && json[ key ] !== null ) {

                    // Recursively call convertToXml for nested objects.
                    convertToXml ( newTag, json[ key ], key ) ;

                }
                // Otherwise, it's a primitive value, treat it as an attribute.
                else {

                    // Set the JSON key as an attribute name and its value as the attribute value.
                    newTag.setAttribute ( key, json[ key ] ) ;

                }

            }

        }

    }


    /**
     * Handles the conversion of JSON array values into XML elements.
     * Each item in the array will typically become a new XML element.
     *
     * @param {Node} root - The XML parent node where array items will be appended.
     * @param {Array} source - The JavaScript array to process.
     * @param {string} name - The tag name to use for each element created from array items.
     */
    function createNodeFromArray ( root, source, name ) {

        // If the array contains elements.
        if ( source.length > 0 ) {

            // Loop through each item in the array.
            for ( var index in source ) {

                // Check if the array item is not an object.
                if ( typeof source[ index ] !== 'object' ) {

                    // If the item is an empty string, create an empty element.
                    if ( source[ index ] === '' ) {

                        root.appendChild ( root.ownerDocument.createElement ( name ) ) ;

                    }
                    // Otherwise, create an element and append its text content.
                    else {

                        root.appendChild ( root.ownerDocument.createElement ( name ) )
                            .appendChild ( root.ownerDocument.createTextNode ( source[ index ] ) ) ;

                    }

                }
                // If the array item is an object, recursively convert it.
                else {

                    convertToXml ( root, source[ index ], name ) ;

                }

            }

        }
        // If the array is empty, just create a single empty element to represent it.
        else {

            root.appendChild ( root.ownerDocument.createElement ( name ) ) ;

        }

    }


} ) ( jQuery ) ; // Pass jQuery into the immediately invoked function expression.