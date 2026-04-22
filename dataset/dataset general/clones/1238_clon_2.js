/*
 * Global utility reference for DOM manipulation.
 * JSLint directives for browser environment.
 *
 * Responsive Media Resizer v1.0
 *
 * Copyright 2023, GlobalTech Solutions - https://globaltech.com
 * Inspiration from Adaptable Video Ratios - https://webdesign.com/responsive-video
 * Distributed under the MIT License - https://opensource.org/licenses/MIT
 *
 */

;(function ( jq ) { // Anonymous function wrapper for scope isolation

 'use strict' ; // Enforce stricter parsing and error handling

 jq.fn.responsiveMedia = function ( config ) { // jQuery plugin method for dynamic media resizing
  var currentConfig = { // Default configuration options
   extraFilter : void 0 , // Optional user-defined CSS selector for additional media
   excludeElements : void 0 // Optional CSS selector for elements to ignore
  } ; // End of default configuration object

  if ( ! document.getElementById( 'resp-media-sheet' ) ) { // Check if the necessary stylesheet is already present
   // Injecting essential styles for flexible media containers
   var docHead = document.head || document.getElementsByTagName( 'head' )[ 0 ] ; // Get the document's head element
   var styleRules = '.responsive-media-frame{ width:100% ; position:relative ; padding:0 ; } .responsive-media-frame iframe, .responsive-media-frame object, .responsive-media-frame embed { position:absolute ; top:0 ; left:0 ; width:100% ; height:100% ; }' ; // CSS rules for the responsive container
   var auxElement = document.createElement( "div" ) ; // Create a temporary DOM element
   auxElement.innerHTML = '<p>_</p><style id="resp-media-sheet">' + styleRules + '</style>' ; // Populate the temporary element with placeholder and style
   docHead.appendChild( auxElement.childNodes[ 1 ] ) ; // Append the generated style element to the document head
  } // End of stylesheet injection block

  if ( config ) { // If user-provided configuration exists
   jq.extend( currentConfig , config ) ; // Merge user configuration with defaults
  } // End of configuration merge block

  return this.each( function ( ) { // Iterate over each selected DOM element
   var mediaTargets = [ // Array of standard video source selectors
    'iframe[src*="player.vimeo.com"]' ,
    'iframe[src*="youtube.com"]' ,
    'iframe[src*="youtube-nocookie.com"]' ,
    'iframe[src*="kickstarter.com"][src*="video.html"]' ,
    'object' ,
    'embed'
   ] ; // End of media target selectors array

   if ( currentConfig.extraFilter ) { // If an additional selector is specified
    mediaTargets.push( currentConfig.extraFilter ) ; // Add it to the list of targets
   } // End of extra filter check

   var omissionList = '.no-scale-media' ; // Default class for elements to be ignored

   if ( currentConfig.excludeElements ) { // If custom exclusion elements are provided
    omissionList = omissionList + ', ' + currentConfig.excludeElements ; // Append them to the exclusion list
   } // End of exclusion list modification

   var $targetElements = jq( this ).find( mediaTargets.join( ',' ) ) ; // Find all matching media elements within the current context
   $targetElements = $targetElements.not( 'object object' ) ; // Filter out nested <object> elements to prevent issues
   $targetElements = $targetElements.not( omissionList ) ; // Remove elements explicitly marked for exclusion

   $targetElements.each( function ( ) { // Process each identified media element
    var $currentMedia = jq( this ) ; // Cache the current jQuery-wrapped media element
    if ( $currentMedia.parents( omissionList ).length > 0 ) {
     return ; // Skip this element if any of its ancestors are in the omission list
    }
    if ( this.tagName.toLowerCase() === 'embed' && $currentMedia.parent( 'object' ).length || $currentMedia.parent( '.responsive-media-frame' ).length ) { return ; } // Skip if it's an embed inside an object or already wrapped

    if ( ( ! $currentMedia.css( 'height' ) && ! $currentMedia.css( 'width' ) ) && ( isNaN( $currentMedia.attr( 'height' ) ) || isNaN( $currentMedia.attr( 'width' ) ) ) ) {
     $currentMedia.attr( 'height' , 0x9 ) ; // Set a default height for calculation if missing
     $currentMedia.attr( 'width' , 0x10 ) ; // Set a default width for calculation if missing
    }
    var elemHeight = ( this.tagName.toLowerCase() === 'object' || ( $currentMedia.attr( 'height' ) && ! isNaN( parseInt( $currentMedia.attr( 'height' ) , 10 ) ) ) ) ? parseInt( $currentMedia.attr( 'height' ) , 10 ) : $currentMedia.height() , // Determine element height
        elemWidth = ! isNaN( parseInt( $currentMedia.attr( 'width' ) , 10 ) ) ? parseInt( $currentMedia.attr( 'width' ) , 10 ) : $currentMedia.width() , // Determine element width
        dimensionRatio = elemHeight / elemWidth ; // Calculate the aspect ratio

    if ( ! $currentMedia.attr( 'id' ) ) { // If the element lacks an ID
     var mediaIdentifier = 'respmedia' + Math.floor( Math.random() * ( 1_000_000 - 1 ) ) ; // Generate a unique identifier
     $currentMedia.attr( 'id' , mediaIdentifier ) ; // Assign the generated ID
    }

    $currentMedia.wrap( '<div class="responsive-media-frame"></div>' ).parent( '.responsive-media-frame' ).css( 'padding-top' , ( dimensionRatio * 0x64 ) + '%' ) ; // Wrap the media and set top padding based on aspect ratio
    $currentMedia.removeAttr( 'height' ).removeAttr( 'width' ) ; // Remove explicit height and width attributes
   } ) ; // End of media element iteration
  } ) ; // End of selected element iteration
 } ; // End of responsiveMedia plugin definition

// Supports common DOM utility libraries like jQuery or Zepto
} ) ( window.jQuery || window.Zepto ) ;