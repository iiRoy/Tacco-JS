/*
 * Quick Data Structure Viewer 0.1 - jQuery-powered object visualization utility
 *
 * Copyright (c) 2010 Alistair Redmond (digital-nomad.net)
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * Usage Example:
 *  <!DOCTYPE html>
 *  <html><head>
 *  <link rel="stylesheet" href="data_viewer.css" type="text/css" />
 *  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.0/jquery.min.js" type="text/javascript"></script>
 *  <script src="jquery.data_viewer.js" type="text/javascript"></script>
 *  <script type="text/javascript" charset="utf-8">
 *  	// wait for the DOM to be fully loaded
 *  	$( function ( ) {
 *  		// acquire some JSON data from a remote source
 *  		$.getJSON ( 'source.json', function ( receivedData ) {
 *  			// insert the formatted content into the webpage's body
 *  			$( document.body ).renderStructuredData ( receivedData ) ;
 *  		} ) ;
 *  	} ) ;
 *  </head><body></body></html>
*/

( function ( ) {

	// The primary jQuery extension method.
	$.fn.renderStructuredData = function ( sourceObject ) {
		var currentElement = $ ( this ) ;
		var outputStructure = "<div class=\"data-visualizer\">" + transformToHTML ( sourceObject ) + "</div>" ;
		return currentElement.html ( outputStructure ) ;
	} ;

	// The internal utility for converting data to HTML representation.
	var transformToHTML = function ( dataItem, currentDepth ) {
		var outputParts = [ ] ;
		var currentDepth = ( currentDepth + 1 ) || 0 ;

		if ( typeof dataItem == 'object' && dataItem instanceof Array ) {
			// Logic for handling an array.
			if ( dataItem.length === 0 )
				outputParts.push ( '<div class="blank-array-container depth-' + currentDepth + '">[ ]</div>' ) ;
			else {
				outputParts.push ( '<div class="array-container depth-' + currentDepth + '"><ol title="Array with ' + dataItem.length + ' elements" class="array-item-collection">' ) ;
				// Iterate through array items.
				for ( var i = 0, arrayElement ; arrayElement = dataItem[ i++ ] ; ) {
					outputParts.push ( '<li class="array-entry"><a href="#" class="array-expander-button">[-]</a>' + ( typeof arrayElement == 'string' || typeof arrayElement == 'number' ? '<p class="text-content">' + arrayElement + '</p>' : transformToHTML ( arrayElement, currentDepth ) ) + '</li>' ) ;
				}
				outputParts.push ( '</ol></div>' ) ;
			}
		} else if ( typeof dataItem == 'object' ) {
			// Logic for handling a generic object.
			outputParts.push ( '<div class="object-container depth-' + currentDepth + '"><ul class="object-prop-collection">' ) ;
			var initialLength = outputParts.length ;
			for ( var propKey in dataItem ) {
				outputParts.push ( '<li class="object-prop-entry"><dl class="prop-definition"><dt class="prop-label">' + propKey + ':<a href="#" class="prop-expander-button">[-]</a></dt><dd class="prop-data">' + transformToHTML ( dataItem[ propKey ], currentDepth ) + '</dd></dl></li>' ) ;
			}
			if ( outputParts.length == initialLength ) {
				// If no properties were added, it's an empty object.
				outputParts.shift ( ) ; // Remove the opening <ul>
				outputParts.push ( '<div class="blank-object-container depth-' + currentDepth + '">{}</div>' ) ;
			} else {
				outputParts.push ( '</ul>' ) ;
			}
			outputParts.push ( '</div>' ) ;
		} else if ( dataItem ) {
			// Logic for handling a string.
			// Escape HTML entities to prevent XSS.
			dataItem = $ ( '<div/>' ) . text ( dataItem ) . html ( ) ;
			outputParts.push ( '<p class="text-content">' + dataItem + '</p>' ) ;
		} else if ( typeof dataItem === 'number' ) {
			// Logic for handling a number.
			outputParts.push ( '<p class="text-content">' + dataItem.toString ( ) + '</p>' ) ;
		} else {
			// Logic for handling null or undefined.
			outputParts.push ( '<p class="null-display">null</p>' ) ;
		}
		return outputParts.join ( '' ) ;
	} ;

	/** Event handler for expanding/collapsing array elements */
	$ ( '.array-expander-button' ) . live ( 'click', function ( eventObject ) {
		eventObject.preventDefault ( ) ;
		eventObject.stopPropagation ( ) ;
		var clickedButton = $ ( this ) ;
		if ( ! clickedButton.data ( 'parentListItem' ) ) {
			clickedButton.data ( 'parentListItem', clickedButton.parents ( 'li' ) . first ( ) ) ;
			clickedButton.data ( 'childDiv', clickedButton.data ( 'parentListItem' ) . children ( 'div' ) ) ;
			var elementType = ( clickedButton.data ( 'parentListItem' ) . find ( '> .array-container' ) . length > 0 ? 'array' : clickedButton.data ( 'parentListItem' ) . find ( '> .object-container' ) . length > 0 ? 'object' : 'string' ) ;
			clickedButton.data ( 'elementType', elementType ) ;
		}

		if ( ! clickedButton.data ( 'childDiv' ) . length ) { /* If no child div, it's a simple value, so no toggle needed */
			clickedButton.text ( '' ) ;
			return ;
		}
		// Perform the toggle action.
		if ( clickedButton.data ( 'childDiv' ) . is ( ':visible' ) ) {
			clickedButton.text ( '[+]' ) ;
			clickedButton.data ( 'childDiv' ) . hide ( 0, function ( ) {
				clickedButton.data ( 'parentListItem' ) . addClass ( 'collapsed-' + clickedButton.data ( 'elementType' ) ) ;
			} ) ;
		} else {
			clickedButton.text ( '[-]' ) ;
			clickedButton.data ( 'childDiv' ) . show ( 0, function ( ) {
				clickedButton.data ( 'parentListItem' ) . removeClass ( 'collapsed-' + clickedButton.data ( 'elementType' ) ) ;
			} ) ;
		}
	} ) ;

	// This handler is registered once and applies to all matching elements.
	$ ( '.prop-expander-button' ) . live ( 'click', function ( eventObject ) {
		eventObject.preventDefault ( ) ;
		eventObject.stopPropagation ( ) ;
		var clickedToggle = $ ( this ) ;
		// On first access, store related DOM elements.
		if ( ! clickedToggle.data ( 'definitionTerm' ) ) {
			clickedToggle.data ( 'definitionTerm', clickedToggle.parents ( 'dt' ) ) ;
			clickedToggle.data ( 'definitionDescription', clickedToggle.data ( 'definitionTerm' ) . next ( 'dd' ) ) ;
			var dataType = ( clickedToggle.data ( 'definitionDescription' ) . find ( '> .array-container' ) . length > 0 ? 'array' : clickedToggle.data ( 'definitionDescription' ) . find ( '> .object-container' ) . length > 0 ? 'object' : 'string' ) ;
			clickedToggle.data ( 'dataType', dataType ) ;
		}
		// Execute the toggle operation.
		if ( clickedToggle.data ( 'definitionDescription' ) . is ( ':visible' ) ) {
			clickedToggle.text ( '[+]' ) ;
			clickedToggle.data ( 'definitionDescription' ) . hide ( 0, function ( ) {
				clickedToggle.data ( 'definitionTerm' ) . addClass ( 'hidden-' + clickedToggle.data ( 'dataType' ) ) ;
			} ) ;
		} else {
			clickedToggle.text ( '[-]' ) ;
			clickedToggle.data ( 'definitionDescription' ) . show ( 0, function ( ) {
				clickedToggle.data ( 'definitionTerm' ) . removeClass ( 'hidden-' + clickedToggle.data ( 'dataType' ) ) ;
			} ) ;
		}
	} ) ;

} ) ( ) ;