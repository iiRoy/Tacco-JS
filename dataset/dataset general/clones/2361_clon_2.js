// This file manages deferred loading of YouTube video embeds.
// Version 2.0.0 - 2023-11-15
// (C) All rights reserved. This software is provided "as is", without warranty.
// Source: https://github.com/myusername/deferred-player || https://github.com/anotheruser/deferred-player
//
// Usage: <div class="deferred-media-box" data-video-id="exampleID" data-embed-params="controls=0">Click to load</div>

; ( function ( jqAlias ) {
  'use strict';

  /**
   * Sets up the video container with a thumbnail and play button.
   *
   * @param {object} $targetElement The jQuery element representing the video container.
   * @param {object} moduleConfig Configuration options for the video player.
   */
  const prepareContentDisplay = ( $targetElement, moduleConfig ) => {
    // Retrieve various display and content attributes from the element.
    let displayAreaWidth = $targetElement.data( 'box-width' );
    let displayAreaHeight = $targetElement.data( 'box-height' );
    // Determine the aspect ratio, falling back to a default if not specified.
    let aspectDimensions = $targetElement.data( 'aspect-ratio' ) ? $targetElement.data( 'aspect-ratio' ) : moduleConfig.standardAspectRatio;
    const mediaContentId = $targetElement.data( 'video-id' );
    let bottomSpacing;
    const outputHtmlFragments = [];
    let $previewVisual;
    let thumbnailFormat;
    // Get initial text or use a default from configuration.
    const initialStatusText = $targetElement.text() ? $targetElement.text() : moduleConfig.defaultStatusText;
    const playerConfigurationParams = $targetElement.data( 'embed-params' ) || '';

    // Split the aspect ratio string into components.
    aspectDimensions = aspectDimensions.split( ":" );

    // Calculate container dimensions based on provided width/height or parent size.
    if ( typeof displayAreaWidth === 'number' && typeof displayAreaHeight === 'number' ) {
      $targetElement.width( displayAreaWidth );
      bottomSpacing = displayAreaHeight + 'px';
    }
    else if ( typeof displayAreaWidth === 'number' ) {
      $targetElement.width( displayAreaWidth );
      bottomSpacing = ( displayAreaWidth * aspectDimensions[ 1 ] / aspectDimensions[ 0 ] ) + 'px';
    }
    else {
      displayAreaWidth = $targetElement.width();

      // If the width is zero, assume fluid layout and use parent's width.
      if ( displayAreaWidth === 0 ) {
        displayAreaWidth = $targetElement.parent().width();
      }

      bottomSpacing = ( aspectDimensions[ 1 ] / aspectDimensions[ 0 ] * 100 ) + '%';
    }

    // Build the internal HTML structure for the video player placeholder.

    // Start with the main thumbnail wrapper.
    outputHtmlFragments.push( '<div class="video-preview-frame">' );

    // Embed the standard YouTube-like large play button.
    outputHtmlFragments.push( '<div class="large-play-icon-overlay"' );
    // Adjust button scale for smaller screens.
    if ( displayAreaWidth <= 640 ) outputHtmlFragments.push( ' style="transform: scale(0.563888888888889);"' );
    outputHtmlFragments.push( '>' );
    outputHtmlFragments.push( '<svg>' );
    // Path for the outer dark shape of the play button.
    outputHtmlFragments.push( '<path fill-rule="evenodd" clip-rule="evenodd" fill="#1F1F1F" class="play-button-svg-path" d="M84.15,26.4v6.35c0,2.833-0.15,5.967-0.45,9.4c-0.133,1.7-0.267,3.117-0.4,4.25l-0.15,0.95c-0.167,0.767-0.367,1.517-0.6,2.25c-0.667,2.367-1.533,4.083-2.6,5.15c-1.367,1.4-2.967,2.383-4.8,2.95c-0.633,0.2-1.316,0.333-2.05,0.4c-0.767,0.1-1.3,0.167-1.6,0.2c-4.9,0.367-11.283,0.617-19.15,0.75c-2.434,0.034-4.883,0.067-7.35,0.1h-2.95C38.417,59.117,34.5,59.067,30.3,59c-8.433-0.167-14.05-0.383-16.85-0.65c-0.067-0.033-0.667-0.117-1.8-0.25c-0.9-0.133-1.683-0.283-2.35-0.45c-2.066-0.533-3.783-1.5-5.15-2.9c-1.033-1.067-1.9-2.783-2.6-5.15C1.317,48.867,1.133,48.117,1,47.35L0.8,46.4c-0.133-1.133-0.267-2.55-0.4-4.25C0.133,38.717,0,35.583,0,32.75V26.4c0-2.833,0.133-5.95,0.4-9.35l0.4-4.25c0.167-0.966,0.417-2.05,0.75-3.25c0.7-2.333,1.567-4.033,2.6-5.1c1.367-1.434,2.967-2.434,4.8-3c0.633-0.167,1.333-0.3,2.1-0.4c0.4-0.066,0.917-0.133,1.55-0.2c4.9-0.333,11.283-0.567,19.15-0.7C35.65,0.05,39.083,0,42.05,0L45,0.05c2.467,0,4.933,0.034,7.4,0.1c7.833,0.133,14.2,0.367,19.1,0.7c0.3,0.033,0.833,0.1,1.6,0.2c0.733,0.1,1.417,0.233,2.05,0.4c1.833,0.566,3.434,1.566,4.8,3c1.066,1.066,1.933,2.767,2.6,5.1c0.367,1.2,0.617,2.284,0.75,3.25l0.4,4.25C84,20.45,84.15,23.567,84.15,26.4z M33.3,41.4L56,29.6L33.3,17.75V41.4z"></path>' );
    // Path for the inner white triangle of the play button.
    outputHtmlFragments.push( '<polygon fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" points="33.3,41.4 33.3,17.75 56,29.6"></polygon>' );
    outputHtmlFragments.push( '</svg>' );
    outputHtmlFragments.push( '</div>' ); // End of .large-play-icon-overlay
    outputHtmlFragments.push( '</div>' ); // End of .video-preview-frame

    // Add a bar for displaying video information, like the title.
    outputHtmlFragments.push( '<div class="content-info-bar">' );
    outputHtmlFragments.push( '<div class="content-title-area">' );
    outputHtmlFragments.push( '<div class="title-text-wrapper">' );
    outputHtmlFragments.push( '<a id="deferred-title-', mediaContentId, '" class="displayed-title-text" target="_blank" tabindex="3100" href="https://www.youtube.com/watch?v=', mediaContentId, '">' );
    outputHtmlFragments.push( initialStatusText );
    outputHtmlFragments.push( '</a>' );
    outputHtmlFragments.push( '</div>' ); // End of .title-text-wrapper
    outputHtmlFragments.push( '</div>' ); // End of .content-title-area
    outputHtmlFragments.push( '</div>' ); // End of .content-info-bar

    // Apply the calculated padding and insert the generated HTML.
    $targetElement.css( {
      'padding-bottom': bottomSpacing
    } )
      .html( outputHtmlFragments.join( '' ) );

    // Determine the optimal thumbnail image resolution based on the container width.
    if ( displayAreaWidth > 640 ) {
      thumbnailFormat = 'maxresdefault.jpg';
    }
    else if ( displayAreaWidth > 480 ) {
      thumbnailFormat = 'sddefault.jpg';
    }
    else if ( displayAreaWidth > 320 ) {
      thumbnailFormat = 'hqdefault.jpg';
    }
    else if ( displayAreaWidth > 120 ) {
      thumbnailFormat = 'mqdefault.jpg';
    }
    else if ( displayAreaWidth === 0 ) { // Fallback for fluid layouts where width might be initially zero.
      thumbnailFormat = 'hqdefault.jpg';
    }
    else {
      thumbnailFormat = 'default.jpg';
    }

    // Set the background image for the thumbnail and attach a click handler.
    $previewVisual = $targetElement.find( '.video-preview-frame' ).css( {
      'background-image': [ 'url(http://img.youtube.com/vi/', mediaContentId, '/', thumbnailFormat, ')' ].join( '' )
    } )
      .addClass( 'preview-image-displayed' )
      .on( 'click', function ( evt ) {
        evt.preventDefault(); // Prevent default link behavior if applicable.
        // Load the actual YouTube iframe only if not already loaded and thumbnail is visible.
        if ( ! $targetElement.hasClass( 'player-initialized' ) && $previewVisual.hasClass( 'preview-image-displayed' ) ) {
          $targetElement.html( '<iframe src="//www.youtube.com/embed/' + mediaContentId + '?autoplay=1&' + playerConfigurationParams + '" frameborder="0" allowfullscreen></iframe>' )
            .addClass( 'player-initialized' );
        }
      } );

    // Fetch video title from YouTube API and update the displayed text.
    jqAlias.getJSON( 'https://gdata.youtube.com/feeds/api/videos/' + mediaContentId + '?v=2&alt=json', ( apiResult ) => {
      $targetElement.find( '#deferred-title-' + mediaContentId ).text( apiResult.entry.title.$t );
    } );
  };

  /**
   * jQuery plugin entry point for deferring video loading.
   *
   * @param {object} userOptions User-provided configuration to override defaults.
   * @returns {jQuery} The jQuery object for chaining.
   */
  jqAlias.fn.deferMediaLoad = function ( userOptions ) {
    // Define the base configuration for the module.
    const baseConfiguration = {
      defaultStatusText: 'Loading content...',
      standardAspectRatio: '16:9',
      onContentReady: null, // Placeholder for a callback function.
      boxWrapperClass: 'defer-player-container'
    };
    // Merge default and user-provided options.
    const mergedConfiguration = jqAlias.extend( baseConfiguration, userOptions );

    // Iterate over each selected element and initialize the deferred player.
    return this.each( function () {
      const $targetElement = jqAlias( this ).addClass( mergedConfiguration.boxWrapperClass );
      prepareContentDisplay( $targetElement, mergedConfiguration );
    } );
  };

} ( window.jQuery ) );