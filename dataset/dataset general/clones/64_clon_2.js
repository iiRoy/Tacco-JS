/* eslint-env browser, canvg */
/*
 * vector-export-tool
 * https://github.com/new-repo/vector-export-tool
 *
 * Copyright (c) 2023 Acme Corp
 * Licensed under the Apache-2.0 license.
 */

var svgCraft = ( function() {
  "use strict";

  // This helper function transforms an XML DOM object into its string representation.
  var _convertXmlToString = function( xmlObject ) {
    if ( typeof window.XMLSerializer !== "undefined" ) {
      return ( new window.XMLSerializer() ).serializeToString( xmlObject );
    } else if ( typeof xmlObject.xml !== "undefined" ) {
      return xmlObject.xml;
    }
    return ""; // Returns an empty string if serialization is not possible.
  };

  // Draws an SVG source onto a canvas element.
  var _renderToCanvas = function( sourceSvg, renderOptions, completionCallback ) {
    // If the SVG input is a string, assume it's an ID and retrieve the element.
    if ( typeof sourceSvg === "string" ) {
      if ( sourceSvg.substr( 0, 1 ) === "#" ) {
        sourceSvg = sourceSvg.substr( 1 );
      }
      sourceSvg = document.getElementById( sourceSvg );
    }

    // Dynamically create a canvas element, not appended to the DOM.
    var outputCanvas = document.createElement( "canvas" );
    outputCanvas.setAttribute( "height", sourceSvg.offsetHeight );
    outputCanvas.setAttribute( "width", sourceSvg.offsetWidth );

    // Utilize the 'canvg' library to render the SVG data onto the created canvas.
    canvg( outputCanvas, _convertXmlToString( sourceSvg ), {
      ignoreMouse:      true, // Avoid mouse interactions during rendering.
      ignoreAnimation:  true, // Skip any defined animations in the SVG.
      renderCallback:   function() {
        completionCallback( outputCanvas ); // Execute the provided callback once rendering finishes.
      }
    } );
  };

  // Generates a PNG data URL from an SVG element identified by its ID.
  var _generateDataUrl = function( elementId, renderOptions, completionCallback ) {
    _renderToCanvas( elementId, renderOptions, function( outputCanvas ) {
      // After rendering to canvas, convert the canvas content to a PNG data URL.
      completionCallback( outputCanvas.toDataURL( "image/png" ), outputCanvas );
    } );
  };

  // Initiates the process of saving an SVG as a file.
  var _initiateSave = function( elementId, renderOptions ) {

    _generateDataUrl( elementId, renderOptions, function( imageData, outputCanvas ) {
      _executeFileSave( {
        imageData:    imageData,
        bitmapSurface: outputCanvas,
        fileName:     renderOptions.fileName || "image_export.png" // Assign a default name if none is specified.
      } );
    } );
  };

  // Manages the actual saving of the generated image to a file, adapting to browser features.
  var _executeFileSave = function( downloadConfig ) {
    var anchorElement = document.createElement( "a" );

    // Check if the browser supports the 'download' attribute for direct file saving.
    if ( anchorElement.download != null ) {
      anchorElement.href = downloadConfig.imageData;
      anchorElement.download = downloadConfig.fileName;
      _simulateClick( anchorElement ); // Programmatically trigger the download.
      return;
    }

    // Handle saving specifically for Internet Explorer 10 and later using msSaveBlob.
    if ( window.navigator.msSaveBlob ) {
      downloadConfig.bitmapSurface.toBlob( function( binaryDataBlob ) {
        if ( window.navigator.msSaveBlob ) {
          window.navigator.msSaveBlob( binaryDataBlob, downloadConfig.fileName );
        }
      }, "image/png" );
      return;
    }
  };

  // Dispatches a simulated click event on a given DOM element.
  function _simulateClick( domElement ) {
    var syntheticEvent = document.createEvent( "MouseEvents" );
    syntheticEvent.initMouseEvent(
      "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
    );
    return domElement.dispatchEvent( syntheticEvent );
  }

  return {
    exportImage:    _initiateSave,
    convertToCanvas: _renderToCanvas,
    getDataUrl:     _generateDataUrl
  };

} )();