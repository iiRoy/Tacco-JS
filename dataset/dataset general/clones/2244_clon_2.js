( function ( jQ ) {
  'use strict'; // Enforce stricter parsing and error handling

  /**
   * Recursively determines the optimal text cut-off point for truncation.
   * @param {string} sizeParam - The CSS property to measure ('width' or 'height').
   * @param {number} maximumSize - The maximum allowed dimension for the truncated text.
   * @param {string} sourceString - The original text content.
   * @param {number} lowBound - The lower index boundary for the binary search.
   * @param {number} highBound - The upper index boundary for the binary search.
   * @param {jQuery} $measurementTool - A temporary jQuery element used for size calculations.
   * @param {string} delimiterChar - The string used as a truncation indicator (e.g., '&hellip;').
   * @param {boolean} isBackward - True if truncating from the end (right side), false for the beginning (left side).
   * @returns {number} The character index where truncation should occur.
   */
  function computeCutoffIndex ( sizeParam, maximumSize, sourceString, lowBound, highBound, $measurementTool, delimiterChar, isBackward ) {
    // Internal routine to render content with the delimiter
    const renderTextIntoTool = function ( inputContent ) {
      $measurementTool.text( inputContent );
      $measurementTool[isBackward ? 'prepend' : 'append']( delimiterChar );
    };

    let segmentOne, segmentTwo, middleIndex, segOneMeasure, segTwoMeasure;

    // Segment the string based on the truncation direction
    if ( isBackward ) {
      segmentOne = lowBound === 0 ? '' : sourceString.slice( -lowBound );
      segmentTwo = sourceString.slice( -highBound );
    } else {
      segmentOne = sourceString.slice( 0, lowBound );
      segmentTwo = sourceString.slice( 0, highBound );
    }

    // Check if the maximum allowed size is too small for the delimiter alone
    if ( maximumSize < $measurementTool.html( delimiterChar )[sizeParam]() ) {
      return 0;
    }

    // Evaluate the dimensions of the second segment
    renderTextIntoTool( segmentTwo );
    segOneMeasure = $measurementTool[sizeParam]();
    // Evaluate the dimensions of the first segment
    renderTextIntoTool( segmentOne );
    segTwoMeasure = $measurementTool[sizeParam]();
    if ( segOneMeasure < segTwoMeasure ) {
      return highBound;
    }

    // Determine the middle index for recursive evaluation
    middleIndex = Math.floor( ( lowBound + highBound ) / 2 );
    segmentOne = isBackward ? sourceString.slice( -middleIndex ) : sourceString.slice( 0, middleIndex );

    // Verify if the current segment's size matches the limit
    renderTextIntoTool( segmentOne );
    if ( $measurementTool[sizeParam]() === maximumSize ) {
      return middleIndex;
    }

    // Update search boundaries for the next iteration
    if ( $measurementTool[sizeParam]() > maximumSize ) {
      highBound = middleIndex - 1;
    } else {
      lowBound = middleIndex + 1;
    }

    // Proceed with recursive search to pinpoint the exact truncation index
    return computeCutoffIndex( sizeParam, maximumSize, sourceString, lowBound, highBound, $measurementTool, delimiterChar, isBackward );
  }

  /**
   * jQuery plugin to truncate text within elements.
   * @param {object} config - Configuration options for truncation.
   */
  jQ.fn.elideContent = function ( config ) {
    // Handle legacy configuration options for backward compatibility
    if ( config && !!config.centralAlign && !config.alignmentOption ) {
      config.alignmentOption = 'center';
      delete config.centralAlign;
    }

    // Remove invalid alignment options
    if ( config && !(/^(left|right|center)$/).test( config.alignmentOption ) ) {
      delete config.alignmentOption;
    }

    // Define standard settings for the plugin
    const defaultSettings = {
      targetLength: 'auto',
      ellipsisSymbol: '&hellip;',
      alignmentOption: 'right',
      extraCssClass: false,
      includeFullTextTitle: false,
      allowMultipleLines: false,
      reUseSizingElement: false
    };
    config = jQ.extend( defaultSettings, config );

    let computedStyles;
    let $targetItem;
    let $sizingHelper;
    let originalContent;
    
    // If reusing a sizing element, initialize it once
    if ( config.reUseSizingElement ) {
      $targetItem = jQ( this.get(0) );
      computedStyles = {
        'fontFamily': $targetItem.css('fontFamily'),
        'fontSize': $targetItem.css('fontSize'),
        'fontStyle': $targetItem.css('fontStyle'),
        'fontWeight': $targetItem.css('fontWeight'),
        'font-variant': $targetItem.css('font-variant'),
        'text-indent': $targetItem.css('text-indent'),
        'line-height': $targetItem.css('line-height'),
        'text-transform': $targetItem.css('text-transform'),
        'letter-spacing': $targetItem.css('letter-spacing'),
        'word-spacing': $targetItem.css('word-spacing'),
        'display': 'none'
      };
      $sizingHelper = jQ('<span/>')
                         .css( computedStyles )
                         .appendTo('body');
    }

    // Iterate over each selected element to apply truncation
    return this.each( function () {
      $targetItem = jQ( this );
      originalContent = $targetItem.text();
      // If not reusing, create a new sizing element for each item
      if ( !config.reUseSizingElement ) {
        computedStyles = {
          'fontFamily': $targetItem.css('fontFamily'),
          'fontSize': $targetItem.css('fontSize'),
          'fontStyle': $targetItem.css('fontStyle'),
          'fontWeight': $targetItem.css('fontWeight'),
          'font-variant': $targetItem.css('font-variant'),
          'text-indent': $targetItem.css('text-indent'),
          'line-height': $targetItem.css('line-height'),
          'text-transform': $targetItem.css('text-transform'),
          'letter-spacing': $targetItem.css('letter-spacing'),
          'word-spacing': $targetItem.css('word-spacing'),
          'display': 'none'
        };
        $sizingHelper = jQ('<span/>')
                           .css( computedStyles )
                           .text( originalContent )
                           .appendTo('body');
      } else {
        $sizingHelper.text( originalContent );
      }
      
      const initialSize = $sizingHelper.width();
      const desiredSize = Math.floor( parseFloat(config.targetLength) ) || $targetItem.width();
      let sizeAttribute = 'width';
      let partiallyDisplayedText, fullLength, constrainedLength;

      // Adjust dimensions for multiline truncation
      if ( config.allowMultipleLines ) {
        $sizingHelper.width( $targetItem.width() );
        sizeAttribute = 'height';
        fullLength = $sizingHelper.height();
        constrainedLength = $targetItem.height() + 1;
      }
      else {
        fullLength = initialSize;
        constrainedLength = desiredSize;
      }

      partiallyDisplayedText = { leadingPart: '', trailingPart: '' };
      // Perform truncation if the content exceeds the constrained length
      if ( fullLength > constrainedLength ) {
        let firstCut, secondCut;
        $sizingHelper.text(''); // Clear helper for accurate measurement

        if ( config.alignmentOption === 'left' ) {
          // Truncate from the left (keeping the end)
          firstCut = computeCutoffIndex(
            sizeAttribute, constrainedLength, originalContent, 0, originalContent.length,
            $sizingHelper, config.ellipsisSymbol, true
          );
          partiallyDisplayedText.trailingPart = originalContent.slice( -1 * firstCut );

        } else if ( config.alignmentOption === 'center' ) {
          // Truncate from the center (keeping both ends)
          constrainedLength = Math.floor( constrainedLength / 2 ) - 1;
          firstCut = computeCutoffIndex(
            sizeAttribute, constrainedLength, originalContent, 0, originalContent.length,
            $sizingHelper, config.ellipsisSymbol, false
          );
          secondCut = computeCutoffIndex(
            sizeAttribute, constrainedLength, originalContent, 0, originalContent.length,
            $sizingHelper, '', true
          );
          partiallyDisplayedText.leadingPart = originalContent.slice( 0, firstCut );
          partiallyDisplayedText.trailingPart = originalContent.slice( -1 * secondCut );

        } else if ( config.alignmentOption === 'right' ) {
          // Truncate from the right (keeping the beginning)
          firstCut = computeCutoffIndex(
            sizeAttribute, constrainedLength, originalContent, 0, originalContent.length,
            $sizingHelper, config.ellipsisSymbol, false
          );
          partiallyDisplayedText.leadingPart = originalContent.slice( 0, firstCut );
        }

        // Apply an additional CSS class if specified
        if ( config.extraCssClass ) {
          $targetItem.addClass( config.extraCssClass );
        }

        // Add the full text as a title attribute if configured
        if ( config.includeFullTextTitle ) {
          $targetItem.attr( 'title', originalContent );
        }

        // Sanitize the text parts and update the element's HTML
        partiallyDisplayedText.leadingPart = $sizingHelper
                               .text( partiallyDisplayedText.leadingPart ).html();
        partiallyDisplayedText.trailingPart = $sizingHelper
                               .text( partiallyDisplayedText.trailingPart )
                               .html();
        $targetItem.empty().html(
          partiallyDisplayedText.leadingPart + config.ellipsisSymbol + partiallyDisplayedText.trailingPart
        );

      }

      // Remove the temporary sizing element if it was created for this item
      if ( !config.reUseSizingElement ) {
        $sizingHelper.remove();
      }
    });
    
    // Remove the shared sizing element if it was created once
    if ( config.reUseSizingElement ) {
      $sizingHelper.remove();
    }
  };
})( jQuery );