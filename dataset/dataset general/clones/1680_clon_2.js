/*
 * Dynamic Grid Layout - v1.0.0
 * http://example.com/projects/dynamic-grid/
 * Copyright (c) 2024 GridMaster
 * Permitted under the Apache 2.0 license.
 */
( function ( jq ) {

  /* Custom Events Triggered
    grid.finished : broadcast when the entire grid has been laid out
    grid.resized : broadcast when the grid container's size changes
  */

  jq.fn.alignedGrid = function ( inputOptions ) {

    // Default configuration settings for the grid functionality
    var configPresets = {
      scaleIdentifiers: {
        'lessThanHundred': '',  // example: small thumbnail qualifier
        'lessThanTwoForty': '',  // example: medium thumbnail qualifier
        'lessThanThreeTwenty': '',  // example: another common size qualifier
        'lessThanFiveHundred': '',  // example: default size qualifier
        'lessThanSixForty': '',  // example: larger size qualifier
        'lessThanKiloTwentyFour': '', // example: high-res qualifier
      },
      lineElevation: 120,
      peakLineElevation: 0, // negative value means no height restrictions, 0 means 1.5 * lineElevation
      spacing: 1,
      frameThickness: -1, // negative = match spacing, 0 = no border

      finalLineArrangement: 'noAlign', // can also be 'align' or 'conceal'
      alignmentThreshold: 0.75, /* if line extent / available space > 0.75, it will always be aligned
                                  (i.e., finalLineArrangement setting is ignored) */
      constrainHeight: false,
      waitForImageLoads: true,
      textLabels: true,
      styleAnimations: false,
      pictureAnimDuration: 500, // ignored if styleAnimations is true
      labelSettings: { // ignored if styleAnimations is true
        animDuration: 500,
        visibleAlpha: 0.7,
        hiddenAlpha: 0.0
      },
      relationAttribute: null, // modifies the 'rel' attribute of each processed link
      linkTarget: null, // modifies the 'target' attribute for all links
      fileExtensionPattern: /\.[^.\\/]+$/,
      updateInterval: 100,
      shuffleItems: false
    };

    function deriveQualifier( itemWidth, itemHeight, processingCtx ) {
      var maxDimension;
      maxDimension = ( itemWidth > itemHeight ) ? itemWidth : itemHeight;
      if ( maxDimension <= 100 ) {
        return processingCtx.currentSettings.scaleIdentifiers.lessThanHundred;
      } else if ( maxDimension <= 240 ) {
        return processingCtx.currentSettings.scaleIdentifiers.lessThanTwoForty;
      } else if ( maxDimension <= 320 ) {
        return processingCtx.currentSettings.scaleIdentifiers.lessThanThreeTwenty;
      } else if ( maxDimension <= 500 ) {
        return processingCtx.currentSettings.scaleIdentifiers.lessThanFiveHundred;
      } else if ( maxDimension <= 640 ) {
        return processingCtx.currentSettings.scaleIdentifiers.lessThanSixForty;
      } else {
        return processingCtx.currentSettings.scaleIdentifiers.lessThanKiloTwentyFour;
      }
    }

    function terminatesWith( inputString, endingPattern ) {
      return inputString.indexOf( endingPattern, inputString.length - endingPattern.length ) !== -1;
    }

    function stripQualifier( originalString, qualifierToRemove ) {
      return originalString.substring( 0, originalString.length - qualifierToRemove.length );
    }

    function fetchActiveQualifier( targetString, processingCtx ) {
      var emptyQualifierFound = false;
      for ( var suffixIndex in processingCtx.currentSettings.scaleIdentifiers ) {
        if ( processingCtx.currentSettings.scaleIdentifiers[ suffixIndex ].length === 0 ) {
          emptyQualifierFound = true;
          continue;
        }
        if ( terminatesWith( targetString, processingCtx.currentSettings.scaleIdentifiers[ suffixIndex ] ) ) {
          return processingCtx.currentSettings.scaleIdentifiers[ suffixIndex ];
        }
      }

      if ( emptyQualifierFound ) return "";
      else throw 'unknown qualifier for ' + targetString;
    }

    /* Given an image source path, its width and height, this function generates a new image source path
       with the most appropriate suffix for optimal thumbnail quality. */
    function generateOptimizedSource( originalSource, actualWidth, actualHeight, processingCtx ) {
      var matchResult = originalSource.match( processingCtx.currentSettings.fileExtensionPattern );
      var fileExt = ( matchResult != null ) ? matchResult[ 0 ] : '';
      var optimizedSource = originalSource.replace( processingCtx.currentSettings.fileExtensionPattern, '' );
      optimizedSource = stripQualifier( optimizedSource, fetchActiveQualifier( optimizedSource, processingCtx ) );
      optimizedSource += deriveQualifier( actualWidth, actualHeight, processingCtx ) + fileExt;
      return optimizedSource;
    }

    function handleItemHoverIn( eventData ) {
      var $itemLabel = jq( eventData.currentTarget ).find( '.item-label' );
      if ( eventData.data.currentSettings.styleAnimations ) {
        $itemLabel.addClass( 'label-visible' ).removeClass( 'label-hidden' );
      } else {
        $itemLabel.stop().fadeTo( eventData.data.currentSettings.labelSettings.animDuration,
                               eventData.data.currentSettings.labelSettings.visibleAlpha );
      }
    }

    function handleItemHoverOut( eventData ) {
      var $itemLabel = jq( eventData.currentTarget ).find( '.item-label' );
      if ( eventData.data.currentSettings.styleAnimations ) {
        $itemLabel.removeClass( 'label-visible' ).removeClass( 'label-hidden' );
      } else {
        $itemLabel.stop().fadeTo( eventData.data.currentSettings.labelSettings.animDuration,
                               eventData.data.currentSettings.labelSettings.hiddenAlpha );
      }
    }

    function revealImage( $gridItem, onRevealComplete, processingCtx ) {
      if ( processingCtx.currentSettings.styleAnimations ) {
        $gridItem.addClass( 'item-revealed' );
        onRevealComplete();
      } else {
        $gridItem.stop().fadeTo( processingCtx.currentSettings.pictureAnimDuration, 1.0, onRevealComplete );
      }
    }

    function concealImageInstantly( $gridItem, processingCtx ) {
      if ( processingCtx.currentSettings.styleAnimations ) {
        $gridItem.removeClass( 'item-revealed' );
      } else {
        $gridItem.stop().fadeTo( 0, 0 );
      }
    }

    function extractImageFromItem( $gridItem ) {
      var $extractedImage = $gridItem.find( '> img' );
      if ( $extractedImage.length === 0 ) $extractedImage = $gridItem.find( '> a > img' );
      return $extractedImage;
    }

    function positionGridItem( $gridItem, posX, posY, displayedWidth, displayedHeight, lineHeight, processingCtx ) {
      var $targetImage = extractImageFromItem( $gridItem );
      $targetImage.css( 'width', displayedWidth );
      $targetImage.css( 'height', displayedHeight );
      // Center the image within its container.
      $targetImage.css( 'margin-left', - displayedWidth / 2 );
      $targetImage.css( 'margin-top', - displayedHeight / 2 );

      $gridItem.width( displayedWidth );
      $gridItem.height( lineHeight );
      $gridItem.css( 'top', posY );
      $gridItem.css( 'left', posX );

      // Reloading images for better resolution if required
      var currentImgSource = $targetImage.attr( 'src' );
      var optimizedImgSource = generateOptimizedSource( currentImgSource, displayedWidth, displayedHeight, processingCtx );

      $targetImage.one( 'error', function () {
        // If the new optimized image fails to load, revert to the original thumbnail source.
        $targetImage.attr( 'src', $targetImage.data( 'grid.originalSrc' ) );
      } );

      function reloadOptimizedImage() {
        if ( currentImgSource !== optimizedImgSource ) { // Update source after fade-in
          $targetImage.attr( 'src', optimizedImgSource );
        }
      }

      if ( $targetImage.data( 'grid.loadedState' ) === 'skipped' ) {
        onImageEvent( currentImgSource, function () {
          revealImage( $gridItem, reloadOptimizedImage, processingCtx );
          $targetImage.data( 'grid.loadedState', true );
        } );
      } else {
        revealImage( $gridItem, reloadOptimizedImage, processingCtx );
      }

      // Handle Text Labels ------------------------------
      var labelInteractionHandlers = $gridItem.data( 'grid.labelInteraction' );
      if ( processingCtx.currentSettings.textLabels === true ) {
        var $itemLabelElement = $gridItem.find( '.item-label' );
        if ( $itemLabelElement.length === 0 ) { // Create the label if it doesn't exist
          var itemDescription = $targetImage.attr( 'alt' );
          if ( typeof itemDescription === 'undefined' ) itemDescription = $gridItem.attr( 'title' );
          if ( typeof itemDescription !== 'undefined' ) { // Only create if content is available
            $itemLabelElement = jq( '<div class="item-label">' + itemDescription + '</div>' );
            $gridItem.append( $itemLabelElement );
          }
        }

        // Setup interaction events (check for existence again as it might still not be created)
        if ( $itemLabelElement.length !== 0 ) {
          if ( !processingCtx.currentSettings.styleAnimations ) {
            $itemLabelElement.stop().fadeTo( processingCtx.currentSettings.pictureAnimDuration,
                                      processingCtx.currentSettings.labelSettings.hiddenAlpha );
          }
          if ( typeof labelInteractionHandlers === 'undefined' ) {
            labelInteractionHandlers = {
              mouseenter: handleItemHoverIn,
              mouseleave: handleItemHoverOut
            };
            $gridItem.on( 'mouseenter', undefined, processingCtx, labelInteractionHandlers.mouseenter );
            $gridItem.on( 'mouseleave', undefined, processingCtx, labelInteractionHandlers.mouseleave );
            $gridItem.data( 'grid.labelInteraction', labelInteractionHandlers );
          }
        }
      } else {
        if ( typeof labelInteractionHandlers !== 'undefined' ) {
          $gridItem.off( 'mouseenter', undefined, processingCtx, labelInteractionHandlers.mouseenter );
          $gridItem.off( 'mouseleave', undefined, processingCtx, labelInteractionHandlers.mouseleave );
          $gridItem.removeData( 'grid.labelInteraction' );
        }
      }

    }

    function configureLineLayout( processingCtx, isFinalLine ) {
      var currentSettings = processingCtx.currentSettings;
      var idx, $currentGridItem, $currentImage, imgRatio, calculatedWidth, calculatedHeight, shouldAlign = true;
      var minimumHeight = 0;
      var spaceRemaining = processingCtx.containerExtent - 2 * processingCtx.frameThickness - (
                            ( processingCtx.currentLine.itemBuffer.length - 1 ) * currentSettings.spacing );
      var lineHeight = spaceRemaining / processingCtx.currentLine.totalAspectRatio;
      var alignable = processingCtx.currentLine.accumulatedWidth / spaceRemaining > currentSettings.alignmentThreshold;

      // If it's the last line and we can't align it, and finalLineArrangement is 'conceal', hide it.
      if ( isFinalLine && currentSettings.finalLineArrangement === 'conceal' && !alignable ) {
        for ( idx = 0; idx < processingCtx.currentLine.itemBuffer.length; idx++ ) {
          $currentGridItem = processingCtx.currentLine.itemBuffer[ idx ];
          if ( currentSettings.styleAnimations )
            $currentGridItem.removeClass( 'item-revealed' );
          else
            $currentGridItem.stop().fadeTo( 0, 0 );
        }
        return -1;
      }

      // For 'noAlign' on the last line, only align if it's naturally alignable (images won't become too large).
      if ( isFinalLine && !alignable && currentSettings.finalLineArrangement === 'noAlign' ) shouldAlign = false;

      for ( idx = 0; idx < processingCtx.currentLine.itemBuffer.length; idx++ ) {
        $currentImage = extractImageFromItem( processingCtx.currentLine.itemBuffer[ idx ] );
        imgRatio = $currentImage.data( 'grid.imageWidth' ) / $currentImage.data( 'grid.imageHeight' );

        if ( shouldAlign ) {
          calculatedWidth = ( idx === processingCtx.currentLine.itemBuffer.length - 1 ) ? spaceRemaining
                      : lineHeight * imgRatio;
          calculatedHeight = lineHeight;

          /* With constrainHeight, calculatedHeight should ideally be greater than lineElevation.
          However, sometimes justification might reduce it. We prioritize justification over strict
          height, as a slightly shorter, justified row is often preferable to a cropped image. */

        } else {
          calculatedWidth = currentSettings.lineElevation * imgRatio;
          calculatedHeight = currentSettings.lineElevation;
        }

        spaceRemaining -= Math.round( calculatedWidth );
        $currentImage.data( 'grid.justifiedImageWidth', Math.round( calculatedWidth ) );
        $currentImage.data( 'grid.justifiedImageHeight', Math.ceil( calculatedHeight ) );
        if ( idx === 0 || minimumHeight > calculatedHeight ) minimumHeight = calculatedHeight;
      }

      if ( currentSettings.constrainHeight && minimumHeight > currentSettings.lineElevation )
        minimumHeight = currentSettings.lineElevation;

      return { minimumHeight: minimumHeight, justify: shouldAlign };
    }

    function resetLayoutState( processingCtx ) {
      processingCtx.lastProcessedIndex = -1;
      processingCtx.currentLine.itemBuffer = [];
      processingCtx.currentLine.totalAspectRatio = 0;
      processingCtx.currentLine.accumulatedWidth = 0;
      processingCtx.verticalOffset = processingCtx.frameThickness;
    }

    function renderLine( processingCtx, isFinalLine ) {
      var currentSettings = processingCtx.currentSettings;
      var $gridItem, $imageElement, minimumHeight, lineLayoutResult, offsetXpos = processingCtx.frameThickness;

      lineLayoutResult = configureLineLayout( processingCtx, isFinalLine );
      minimumHeight = lineLayoutResult.minimumHeight;
      if ( isFinalLine && currentSettings.finalLineArrangement === 'conceal' && minimumHeight === -1 ) {
        processingCtx.currentLine.itemBuffer = [];
        processingCtx.currentLine.totalAspectRatio = 0;
        processingCtx.currentLine.accumulatedWidth = 0;
        return;
      }

      if ( currentSettings.peakLineElevation > 0 && currentSettings.peakLineElevation < minimumHeight )
        minimumHeight = currentSettings.peakLineElevation;
      else if ( currentSettings.peakLineElevation === 0 && ( 1.5 * currentSettings.lineElevation ) < minimumHeight )
        minimumHeight = 1.5 * currentSettings.lineElevation;

      for ( var itemIdx = 0; itemIdx < processingCtx.currentLine.itemBuffer.length; itemIdx++ ) {
        $gridItem = processingCtx.currentLine.itemBuffer[ itemIdx ];
        $imageElement = extractImageFromItem( $gridItem );
        positionGridItem( $gridItem, offsetXpos, processingCtx.verticalOffset, $imageElement.data( 'grid.justifiedImageWidth' ),
                     $imageElement.data( 'grid.justifiedImageHeight' ), minimumHeight, processingCtx );
        offsetXpos += $imageElement.data( 'grid.justifiedImageWidth' ) + currentSettings.spacing;
      }

      // Update Grid Container Height
      processingCtx.$gridContainer.height( processingCtx.verticalOffset + minimumHeight + processingCtx.frameThickness +
        ( processingCtx.loadingIndicator.isActive ? processingCtx.loadingIndicator.$element.innerDimension() : 0 )
      );

      if ( !isFinalLine || ( minimumHeight <= processingCtx.currentSettings.lineElevation && lineLayoutResult.justify ) ) {
        // Prepare for a new line layout
        processingCtx.verticalOffset += minimumHeight + processingCtx.currentSettings.spacing;

        processingCtx.currentLine.itemBuffer = []; // Clear the buffer for the next line
        processingCtx.currentLine.totalAspectRatio = 0;
        processingCtx.currentLine.accumulatedWidth = 0;
        processingCtx.$gridContainer.trigger( 'grid.lineRendered' );
      }
    }

    function monitorContainerSize( processingCtx ) {
      processingCtx.sizeMonitorId = setInterval( function () {
        var containerExtent = parseInt( processingCtx.$gridContainer.width(), 10 );
        if ( processingCtx.containerExtent !== containerExtent ) {

          processingCtx.containerExtent = containerExtent;
          resetLayoutState( processingCtx );

          // Restart the image analysis process
          beginImageAnalysis( processingCtx, true );
        }
      }, processingCtx.currentSettings.updateInterval );
    }

    function initSpinnerAnimation( loaderCtx ) {
      clearInterval( loaderCtx.animationId );
      loaderCtx.animationId = setInterval( function () {
        if ( loaderCtx.animationPhase < loaderCtx.$dotElements.length )
          loaderCtx.$dotElements.eq( loaderCtx.animationPhase ).fadeTo( loaderCtx.frameDuration, 1 );
        else
          loaderCtx.$dotElements.eq( loaderCtx.animationPhase - loaderCtx.$dotElements.length )
                        .fadeTo( loaderCtx.frameDuration, 0 );
        loaderCtx.animationPhase = ( loaderCtx.animationPhase + 1 ) % ( loaderCtx.$dotElements.length * 2 );
      }, loaderCtx.frameDuration );
    }

    function haltSpinnerAnimation( loaderCtx ) {
      clearInterval( loaderCtx.animationId );
      loaderCtx.animationId = null;
    }

    function terminateAnalysisScheduler( processingCtx ) {
      processingCtx.processingYield.linesRendered = 0;
      if ( processingCtx.analysisTimer !== null ) clearTimeout( processingCtx.analysisTimer );
    }

    function beginImageAnalysis( processingCtx, isSizeAdjustment ) {
      terminateAnalysisScheduler( processingCtx );
      processingCtx.analysisTimer = setTimeout( function () {
        processVisualElements( processingCtx, isSizeAdjustment );
      }, 0.001 );
      processVisualElements( processingCtx, isSizeAdjustment );
    }

    function processVisualElements( processingCtx, isSizeAdjustment ) {

      var currentSettings = processingCtx.currentSettings;
      var isFinalLine;

      for ( var itemIdx = processingCtx.lastProcessedIndex + 1; itemIdx < processingCtx.gridItems.length; itemIdx++ ) {
        var $currentItem = jq( processingCtx.gridItems[ itemIdx ] );
        var $currentImage = extractImageFromItem( $currentItem );

        if ( $currentImage.data( 'grid.loadedState' ) === true || $currentImage.data( 'grid.loadedState' ) === 'skipped' ) {
          isFinalLine = itemIdx >= processingCtx.gridItems.length - 1;

          var remainingWidth = processingCtx.containerExtent - 2 * processingCtx.frameThickness - (
                               ( processingCtx.currentLine.itemBuffer.length - 1 ) * currentSettings.spacing );
          var imageProportion = $currentImage.data( 'grid.imageWidth' ) / $currentImage.data( 'grid.imageHeight' );
          if ( remainingWidth / ( processingCtx.currentLine.totalAspectRatio + imageProportion ) < currentSettings.lineElevation ) {
            renderLine( processingCtx, isFinalLine );
            if( ++processingCtx.processingYield.linesRendered >= processingCtx.processingYield.yieldInterval ) {
              beginImageAnalysis( processingCtx, isSizeAdjustment );
              return;
            }
          }

          processingCtx.currentLine.itemBuffer.push( $currentItem );
          processingCtx.currentLine.totalAspectRatio += imageProportion;
          processingCtx.currentLine.accumulatedWidth += imageProportion * currentSettings.lineElevation;
          processingCtx.lastProcessedIndex = itemIdx;

        } else if ( $currentImage.data( 'grid.loadedState' ) !== 'error' ) {
          return;
        }
      }

      // Render any remaining items in the last (potentially incomplete) line
      if ( processingCtx.currentLine.itemBuffer.length > 0 ) renderLine( processingCtx, true );

      if ( processingCtx.loadingIndicator.isActive ) {
        processingCtx.loadingIndicator.isActive = false;
        processingCtx.$gridContainer.height( processingCtx.$gridContainer.height() - processingCtx.loadingIndicator.$element.innerDimension() );
        processingCtx.loadingIndicator.$element.detach();
        haltSpinnerAnimation( processingCtx.loadingIndicator );
      }

      /* Clear any pending analysis timers.
         This handles cases where an image loads, a timer is set, but the image is processed
         before the timer fires. */
      terminateAnalysisScheduler( processingCtx );

      // Trigger completion callbacks
      if ( !isSizeAdjustment )
        processingCtx.$gridContainer.trigger( 'grid.finished' );
      else
        processingCtx.$gridContainer.trigger( 'grid.resized' );
    }

    function validateConfiguration ( processingCtx ) {
      var currentSettings = processingCtx.currentSettings;

      function verifyQualifierRange( qualifierRange ) {
        if ( typeof currentSettings.scaleIdentifiers[ qualifierRange ] !== 'string' )
          throw 'scaleIdentifiers.' + qualifierRange + ' must be a string value';
      }

      function parseNumericSetting( configObject, optionName ) {
        if ( typeof configObject[ optionName ] === 'string' ) {
          configObject[ optionName ] = parseFloat( configObject[ optionName ], 10 );
          if ( isNaN( configObject[ optionName ] ) ) throw 'invalid numeric value for ' + optionName;
        } else if ( typeof configObject[ optionName ] === 'number' ) {
          if ( isNaN( configObject[ optionName ] ) ) throw 'invalid numeric value for ' + optionName;
        } else {
          throw optionName + ' must be a number';
        }
      }

      if ( typeof currentSettings.scaleIdentifiers !== 'object' )
        throw 'scaleIdentifiers must be defined and be an object type';

      verifyQualifierRange( 'lessThanHundred' );
      verifyQualifierRange( 'lessThanTwoForty' );
      verifyQualifierRange( 'lessThanThreeTwenty' );
      verifyQualifierRange( 'lessThanFiveHundred' );
      verifyQualifierRange( 'lessThanSixForty' );
      verifyQualifierRange( 'lessThanKiloTwentyFour' );

      parseNumericSetting( currentSettings, 'lineElevation' );
      parseNumericSetting( currentSettings, 'peakLineElevation' );

      if ( currentSettings.peakLineElevation > 0 &&
          currentSettings.peakLineElevation < currentSettings.lineElevation ) {
        currentSettings.peakLineElevation = currentSettings.lineElevation;
      }

      parseNumericSetting( currentSettings, 'spacing' );
      parseNumericSetting( currentSettings, 'frameThickness' );

      if ( currentSettings.finalLineArrangement !== 'noAlign' &&
          currentSettings.finalLineArrangement !== 'align' &&
          currentSettings.finalLineArrangement !== 'conceal' ) {
        throw 'finalLineArrangement must be "noAlign", "align" or "conceal"';
      }

      parseNumericSetting( currentSettings, 'alignmentThreshold' );
      if ( currentSettings.alignmentThreshold < 0 || currentSettings.alignmentThreshold > 1 ) {
        throw 'alignmentThreshold must be between 0 and 1';
      }

      parseNumericSetting( currentSettings, 'pictureAnimDuration' );

      parseNumericSetting( currentSettings.labelSettings, 'animDuration' );
      parseNumericSetting( currentSettings.labelSettings, 'visibleAlpha' );
      parseNumericSetting( currentSettings.labelSettings, 'hiddenAlpha' );

      parseNumericSetting( currentSettings, 'updateInterval' );

      if ( currentSettings.spacing < 0 ) currentSettings.spacing = 0;
      if ( currentSettings.frameThickness < 0 ) currentSettings.frameThickness = currentSettings.spacing;

      return currentSettings;
    }

    // Main plugin logic starts here
    return this.each( function ( ) {
      var $gridContainer = jq( this );
      $gridContainer.addClass( 'dynamic-grid' );

      var processingCtx = {
        currentSettings: jq.extend( true, {}, configPresets, inputOptions ), // Deep merge user options with defaults
        $gridContainer: $gridContainer,
        gridItems: [],
        containerExtent: 0,
        verticalOffset: 0,
        frameThickness: 0,
        lastProcessedIndex: -1,
        currentLine: {
          itemBuffer: [],
          totalAspectRatio: 0,
          accumulatedWidth: 0
        },
        sizeMonitorId: null,
        analysisTimer: null,
        processingYield: {
          linesRendered: 0,
          yieldInterval: 1 // Process one line at a time before yielding (can be changed for performance)
        },
        loadingIndicator: {
          isActive: false,
          $element: null,
          animationId: null,
          animationPhase: 0,
          $dotElements: null,
          frameDuration: 200
        }
      };

      // Validate and adjust configuration settings
      processingCtx.currentSettings = validateConfiguration( processingCtx );

      // Store context data on the grid container for later access
      $gridContainer.data( 'grid.context', processingCtx );

      processingCtx.containerExtent = parseInt( $gridContainer.width(), 10 );
      processingCtx.frameThickness = processingCtx.currentSettings.frameThickness;

      // Initialize CSS properties for the grid container
      $gridContainer.css( 'position', 'relative' );
      $gridContainer.css( 'height', '0px' );

      // Handle individual grid items
      jq( this ).find( '> a, > div' ).each( function () {
        var $gridItem = jq( this );
        var $imageElement = extractImageFromItem( $gridItem );

        // Ensure grid items are absolutely positioned
        $gridItem.css( 'display', 'block' );
        $gridItem.css( 'position', 'absolute' );

        // Hide images initially to prevent FOUC (Flash Of Unstyled Content)
        concealImageInstantly( $gridItem, processingCtx );

        // Store original image source if not already present
        if ( $imageElement.data( 'grid.originalSrc' ) === undefined ) {
          $imageElement.data( 'grid.originalSrc', $imageElement.attr( 'src' ) );
        }

        // Add to the list of grid items for processing
        processingCtx.gridItems.push( $gridItem[ 0 ] );
      } );

      // If randomization is enabled, shuffle the items
      if ( processingCtx.currentSettings.shuffleItems ) {
        processingCtx.gridItems.sort( function () { return 0.5 - Math.random(); } );
      }

      // If waiting for images to load is specified, handle that
      if ( processingCtx.currentSettings.waitForImageLoads ) {
        var imageLoadCounter = 0;
        for ( var idx = 0; idx < processingCtx.gridItems.length; idx++ ) {
          var $gridItem = jq( processingCtx.gridItems[ idx ] );
          var $imageElement = extractImageFromItem( $gridItem );

          // Skip if image is already loaded or marked for error
          if ( $imageElement.data( 'grid.loadedState' ) === true || $imageElement.data( 'grid.loadedState' ) === 'error' ) {
            processingCtx.processingYield.linesRendered++; // Increment to potentially yield sooner
            continue;
          }

          var imageObject = new Image();
          // Event handler for successful image loading
          jq( imageObject ).one( 'load', ( function ( $imageElement, $gridItem ) {
            return function () {
              $imageElement.data( 'grid.imageWidth', this.width );
              $imageElement.data( 'grid.imageHeight', this.height );
              $imageElement.data( 'grid.loadedState', true );
              imageLoadCounter++;
              beginImageAnalysis( processingCtx, false );
            };
          } )( $imageElement, $gridItem ) );

          // Event handler for image loading errors
          jq( imageObject ).one( 'error', ( function ( $imageElement, $gridItem ) {
            return function () {
              $imageElement.data( 'grid.imageWidth', $gridItem.width() );
              $imageElement.data( 'grid.imageHeight', $gridItem.height() );
              $imageElement.data( 'grid.loadedState', 'error' );
              imageLoadCounter++;
              beginImageAnalysis( processingCtx, false );
            };
          } )( $imageElement, $gridItem ) );

          // Set image source to trigger loading
          imageObject.src = $imageElement.data( 'grid.originalSrc' );
        }

        // If no images to load, start analysis immediately
        if ( imageLoadCounter === processingCtx.gridItems.length ) {
          beginImageAnalysis( processingCtx, false );
        }

      } else { // No waiting for image loads
        for ( var idx = 0; idx < processingCtx.gridItems.length; idx++ ) {
          var $gridItem = jq( processingCtx.gridItems[ idx ] );
          var $imageElement = extractImageFromItem( $gridItem );

          $imageElement.data( 'grid.imageWidth', $gridItem.width() );
          $imageElement.data( 'grid.imageHeight', $gridItem.height() );
          $imageElement.data( 'grid.loadedState', 'skipped' ); // Mark as skipped loading
        }
        beginImageAnalysis( processingCtx, false );
      }

      // Setup window resize monitoring
      jq( window ).on( 'resize.dynamicGrid', function () {
        monitorContainerSize( processingCtx );
      } );
    } );
  };
} )( jQuery );