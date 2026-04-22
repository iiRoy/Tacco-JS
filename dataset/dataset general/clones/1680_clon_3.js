(function (jQ) {
  // Image Grid Layout Engine - v1.0.0
  // Based on "Justified Gallery" by Miro Mannino
  // Copyright (c) 2023 Renamed Author
  // Licensed under the MIT license.

  /* Custom Events:
   *  grid.layoutComplete : Fired once all visual elements are positioned.
   *  grid.resized : Fired when the container dimensions change and layout is re-evaluated.
   */

  jQ.fn.imageGridDisplay = function (configOpts) {

    // Standard configuration parameters
    var standardOpts = {
      scaleIdentifiers: {
        'tiny': '', // e.g., for very small thumbnails
        'small': '', // e.g., for mobile previews
        'medium': '', // e.g., standard web display
        'large': '', // e.g., higher resolution for larger screens
        'xlarge': '', // e.g., desktop full-width
        'original': '' // e.g., for retina or full-res
      },
      baseRowH: 120, // Desired height for rows
      limitRowH: 0, // 0 = 1.5 * baseRowH, negative = no max height
      spacingVal: 1, // Gap between visual elements
      edgePadding: -1, // Negative = same as spacingVal, 0 = no padding

      finalRowBehavior: 'noAdjust', // Options: 'noAdjust', 'align', 'conceal'
      alignThreshold: 0.75, /* If row fill ratio > 0.75, it will always align (overrides finalRowBehavior) */
      enforceFixedH: false, // Maintain strict row height
      deferThumbLoad: true, // Wait for all thumbnails to load before layout
      showLabels: true, // Display captions on hover
      useCssTransit: false, // Use CSS for animations instead of jQuery's .animate()
      imgAnimDuration: 500, // Image fade-in duration (if useCssTransit is false)
      labelSettings: { // Caption animation details (if useCssTransit is false)
        animDuration: 500,
        visibleOpc: 0.7,
        hiddenOpc: 0.0
      },
      linkGroupAttr: null, // Rewrites 'rel' attribute for links
      linkTargetAttr: null, // Rewrites 'target' attribute for links
      fileExtensionPattern: /\.[^.\\/]+$/, // Regex for file extensions
      recheckInterval: 100, // How often to check for container resize
      shuffleItems: false // Randomize the order of items
    };

    // Helper to determine the correct scaling identifier for an image
    function deriveScaleId(imgWidth, imgHeight, gridCtx) {
      var longerSide = Math.max(imgWidth, imgHeight);
      var scaleMap = gridCtx.settings.scaleIdentifiers;

      if (longerSide <= 100) {
        return scaleMap.tiny;
      } else if (longerSide <= 240) {
        return scaleMap.small;
      } else if (longerSide <= 320) {
        return scaleMap.medium;
      } else if (longerSide <= 500) {
        return scaleMap.large;
      } else if (longerSide <= 640) {
        return scaleMap.xlarge;
      } else {
        return scaleMap.original;
      }
    }

    // Checks if a string ends with a specific suffix
    function strTerminatesWith(fullString, termination) {
      if (!fullString || !termination) return false;
      return fullString.slice(-termination.length) === termination;
    }

    // Removes a suffix from a string
    function trimScaleId(fullString, suffixToRemove) {
      if (!fullString || !suffixToRemove || !strTerminatesWith(fullString, suffixToRemove)) {
        return fullString;
      }
      return fullString.substring(0, fullString.length - suffixToRemove.length);
    }

    // Identifies the currently used scale identifier in an image source
    function extractUsedScaleId(currentSource, gridCtx) {
      var scaleMap = gridCtx.settings.scaleIdentifiers;
      var foundSuffix = '';

      for (var key in scaleMap) {
        if (Object.prototype.hasOwnProperty.call(scaleMap, key)) {
          var suffix = scaleMap[key];
          if (suffix && strTerminatesWith(currentSource, suffix)) {
            foundSuffix = suffix;
            break; // Found the most specific suffix
          }
        }
      }
      return foundSuffix;
    }

    // Generates a new image source URL with the appropriate scale identifier
    function generateScaledSrc(initialImgSrc, assetWidth, assetHeight, gridCtx) {
      var extMatch = initialImgSrc.match(gridCtx.settings.fileExtensionPattern);
      var fileExt = extMatch ? extMatch[0] : '';
      var cleanedSrc = initialImgSrc.replace(gridCtx.settings.fileExtensionPattern, '');

      cleanedSrc = trimScaleId(cleanedSrc, extractUsedScaleId(cleanedSrc, gridCtx));
      cleanedSrc += deriveScaleId(assetWidth, assetHeight, gridCtx) + fileExt;
      return cleanedSrc;
    }

    // Handles mouse entry for caption display
    function handleLabelHoverIn(ev) {
      var _captionElement = jQ(ev.currentTarget).find('.caption');
      if (ev.data.settings.useCssTransit) {
        _captionElement.addClass('caption-visible').removeClass('caption-hidden');
      } else {
        _captionElement.stop().fadeTo(ev.data.settings.labelSettings.animDuration,
          ev.data.settings.labelSettings.visibleOpc);
      }
    }

    // Handles mouse exit for caption concealment
    function handleLabelHoverOut(ev) {
      var _captionElement = jQ(ev.currentTarget).find('.caption');
      if (ev.data.settings.useCssTransit) {
        _captionElement.removeClass('caption-visible').addClass('caption-hidden');
      } else {
        _captionElement.stop().fadeTo(ev.data.settings.labelSettings.animDuration,
          ev.data.settings.labelSettings.hiddenOpc);
      }
    }

    // Makes an image container visible with animation
    function revealImageElement(_itemContainer, completionCallback, gridCtx) {
      if (gridCtx.settings.useCssTransit) {
        _itemContainer.addClass('entry-visible');
        completionCallback();
      } else {
        _itemContainer.stop().fadeTo(gridCtx.settings.imgAnimDuration, 1.0, completionCallback);
      }
    }

    // Hides an image container instantly
    function concealImageFast(_itemContainer, gridCtx) {
      if (gridCtx.settings.useCssTransit) {
        _itemContainer.removeClass('entry-visible');
      } else {
        _itemContainer.stop().fadeTo(0, 0);
      }
    }

    // Retrieves the primary image element from an item container
    function getImageFromContainer(_itemContainer) {
      var _visualAsset = _itemContainer.find('> img');
      if (_visualAsset.length === 0) {
        _visualAsset = _itemContainer.find('> a > img');
      }
      return _visualAsset;
    }

    // Positions and displays a single visual element within the grid
    function positionAndShowItem(_itemContainer, posX, posY, calculatedImgW, calculatedImgH, targetRowHeight, gridCtx) {
      var _visualAsset = getImageFromContainer(_itemContainer);
      if (_visualAsset.length === 0) return; // Guard against missing image

      // Apply dimensions and positioning
      _visualAsset.css({
        'width': calculatedImgW,
        'height': calculatedImgH,
        'margin-left': -calculatedImgW / 2,
        'margin-top': -calculatedImgH / 2
      });
      _itemContainer.css({
        'width': calculatedImgW,
        'height': targetRowHeight,
        'top': posY,
        'left': posX
      });

      // Handle image source adjustment for quality
      var originalImgSource = _visualAsset.attr('src');
      var adjustedImgSource = generateScaledSrc(originalImgSource, calculatedImgW, calculatedImgH, gridCtx);

      _visualAsset.one('error', function () {
        // Fallback to original if adjusted source fails to load
        _visualAsset.attr('src', _visualAsset.data('jg.originalSrc'));
      });

      function applyNewImageSource() {
        if (originalImgSource !== adjustedImgSource) {
          _visualAsset.attr('src', adjustedImgSource);
        }
      }

      // Determine when to show the image based on load status
      if (_visualAsset.data('jg.loaded') === 'skipped') {
        setupImageLoadHandler(originalImgSource, function () {
          revealImageElement(_itemContainer, applyNewImageSource, gridCtx);
          _visualAsset.data('jg.loaded', true);
        });
      } else {
        revealImageElement(_itemContainer, applyNewImageSource, gridCtx);
      }

      // Caption handling ------------------------------
      var labelInteractionHandlers = _itemContainer.data('jg.captionMouseEvents');
      if (gridCtx.settings.showLabels === true) {
        var _captionElement = _itemContainer.find('.caption');
        if (_captionElement.length === 0) { // Create if not present
          var captionText = _visualAsset.attr('alt');
          if (captionText === undefined || captionText === null) {
            captionText = _itemContainer.attr('title');
          }
          if (captionText !== undefined && captionText !== null) { // Only create if text exists
            _captionElement = jQ('<div class="caption">' + captionText + '</div>');
            _itemContainer.append(_captionElement);
          }
        }

        // Set up caption events
        if (_captionElement.length > 0) {
          if (!gridCtx.settings.useCssTransit) {
            _captionElement.stop().fadeTo(gridCtx.settings.imgAnimDuration,
              gridCtx.settings.labelSettings.hiddenOpc);
          }
          if (labelInteractionHandlers === undefined || labelInteractionHandlers === null) {
            labelInteractionHandlers = {
              mouseenter: handleLabelHoverIn,
              mouseleave: handleLabelHoverOut
            };
            _itemContainer.on('mouseenter', undefined, gridCtx, labelInteractionHandlers.mouseenter);
            _itemContainer.on('mouseleave', undefined, gridCtx, labelInteractionHandlers.mouseleave);
            _itemContainer.data('jg.captionMouseEvents', labelInteractionHandlers);
          }
        }
      } else {
        if (labelInteractionHandlers !== undefined && labelInteractionHandlers !== null) {
          _itemContainer.off('mouseenter', undefined, gridCtx, labelInteractionHandlers.mouseenter);
          _itemContainer.off('mouseleave', undefined, gridCtx, labelInteractionHandlers.mouseleave);
          _itemContainer.removeData('jg.captionMouseEvents');
        }
      }
    }

    // Pre-calculates dimensions for a row before rendering
    function precomputeRowLayout(gridCtx, isFinalRow) {
      var currentSettings = gridCtx.settings;
      var i, _itemContainer, _visualAsset, assetRatio, calculatedImgW, calculatedImgH, shouldJustify = true;
      var minimumRowHeight = 0;

      var spaceRemaining = gridCtx.containerWidth - (2 * gridCtx.edgePadding) - (
        (gridCtx.currentRowData.itemBuffer.length - 1) * currentSettings.spacingVal);

      var idealRowHeight = spaceRemaining / gridCtx.currentRowData.accumulatedRatio;
      var rowFillRatio = gridCtx.currentRowData.accumulatedWidth / spaceRemaining;
      var isJustifiable = rowFillRatio > currentSettings.alignThreshold;

      // Check for 'conceal' behavior on the final row
      if (isFinalRow && currentSettings.finalRowBehavior === 'conceal' && !isJustifiable) {
        for (i = 0; i < gridCtx.currentRowData.itemBuffer.length; i++) {
          _itemContainer = gridCtx.currentRowData.itemBuffer[i];
          concealImageFast(_itemContainer, gridCtx);
        }
        return {
          minimumRowHeight: -1,
          shouldJustify: false
        }; // Indicate row was hidden
      }

      // Apply 'noAdjust' for the final row if not justifiable
      if (isFinalRow && !isJustifiable && currentSettings.finalRowBehavior === 'noAdjust') {
        shouldJustify = false;
      }

      for (i = 0; i < gridCtx.currentRowData.itemBuffer.length; i++) {
        _visualAsset = getImageFromContainer(gridCtx.currentRowData.itemBuffer[i]);
        assetRatio = _visualAsset.data('jg.imgw') / _visualAsset.data('jg.imgh');

        if (shouldJustify) {
          calculatedImgW = (i === gridCtx.currentRowData.itemBuffer.length - 1) ? spaceRemaining : idealRowHeight * assetRatio;
          calculatedImgH = idealRowHeight;
        } else {
          calculatedImgW = currentSettings.baseRowH * assetRatio;
          calculatedImgH = currentSettings.baseRowH;
        }

        spaceRemaining -= Math.round(calculatedImgW);
        _visualAsset.data('jg.jimgw', Math.round(calculatedImgW));
        _visualAsset.data('jg.jimgh', Math.ceil(calculatedImgH));
        if (i === 0 || minimumRowHeight > calculatedImgH) {
          minimumRowHeight = calculatedImgH;
        }
      }

      if (currentSettings.enforceFixedH && minimumRowHeight > currentSettings.baseRowH) {
        minimumRowHeight = currentSettings.baseRowH;
      }

      return {
        minimumRowHeight: minimumRowHeight,
        shouldJustify: shouldJustify
      };
    }

    // Resets the grid context for a fresh layout calculation
    function resetGridContext(gridCtx) {
      gridCtx.lastProcessedIdx = -1;
      gridCtx.currentRowData.itemBuffer = [];
      gridCtx.currentRowData.accumulatedRatio = 0;
      gridCtx.currentRowData.accumulatedWidth = 0;
      gridCtx.currentYOffset = gridCtx.edgePadding;
      if (gridCtx.loaderState.active) {
        gridCtx._targetElement.height(gridCtx.currentYOffset + gridCtx.loaderState.$el.innerHeight());
      } else {
        gridCtx._targetElement.height(gridCtx.currentYOffset);
      }
    }

    // Renders a completed row of visual elements
    function renderCompletedRow(gridCtx, isFinalRow) {
      var currentSettings = gridCtx.settings;
      var _itemContainer, _visualAsset;
      var currentXOffset = gridCtx.edgePadding;

      var rowCalcResult = precomputeRowLayout(gridCtx, isFinalRow);
      var minimumRowHeight = rowCalcResult.minimumRowHeight;

      if (isFinalRow && currentSettings.finalRowBehavior === 'conceal' && minimumRowHeight === -1) {
        gridCtx.currentRowData.itemBuffer = [];
        gridCtx.currentRowData.accumulatedRatio = 0;
        gridCtx.currentRowData.accumulatedWidth = 0;
        return;
      }

      // Adjust row height based on maxRowHeight setting
      if (currentSettings.limitRowH > 0 && currentSettings.limitRowH < minimumRowHeight) {
        minimumRowHeight = currentSettings.limitRowH;
      } else if (currentSettings.limitRowH === 0 && (1.5 * currentSettings.baseRowH) < minimumRowHeight) {
        minimumRowHeight = 1.5 * currentSettings.baseRowH;
      }

      for (var i = 0; i < gridCtx.currentRowData.itemBuffer.length; i++) {
        _itemContainer = gridCtx.currentRowData.itemBuffer[i];
        _visualAsset = getImageFromContainer(_itemContainer);
        positionAndShowItem(_itemContainer, currentXOffset, gridCtx.currentYOffset, _visualAsset.data('jg.jimgw'),
          _visualAsset.data('jg.jimgh'), minimumRowHeight, gridCtx);
        currentXOffset += _visualAsset.data('jg.jimgw') + currentSettings.spacingVal;
      }

      // Update gallery container height
      var newGalleryHeight = gridCtx.currentYOffset + minimumRowHeight + gridCtx.edgePadding;
      if (gridCtx.loaderState.active) {
        newGalleryHeight += gridCtx.loaderState.$el.innerHeight();
      }
      gridCtx._targetElement.height(newGalleryHeight);

      // Prepare for a new row if not the last or justified
      if (!isFinalRow || (minimumRowHeight <= currentSettings.baseRowH && rowCalcResult.shouldJustify)) {
        gridCtx.currentYOffset += minimumRowHeight + currentSettings.spacingVal;
        gridCtx.currentRowData.itemBuffer = []; // Clear buffer
        gridCtx.currentRowData.accumulatedRatio = 0;
        gridCtx.currentRowData.accumulatedWidth = 0;
        gridCtx._targetElement.trigger('jg.rowflush');
      }
    }

    // Monitors the container width for changes and triggers re-layout
    function monitorContainerWidth(gridCtx) {
      if (gridCtx.resizeMonitorId) {
        clearInterval(gridCtx.resizeMonitorId);
      }
      gridCtx.resizeMonitorId = setInterval(function () {
        var currentContainerWidth = parseInt(gridCtx._targetElement.width(), 10);
        if (gridCtx.containerWidth !== currentContainerWidth) {
          gridCtx.containerWidth = currentContainerWidth;
          resetGridContext(gridCtx);
          initiateLayoutProcessor(gridCtx, true); // Re-analyze
        }
      }, gridCtx.settings.recheckInterval);
    }

    // Starts the loading spinner animation
    function activateLoaderAnim(spinnerCtx) {
      clearInterval(spinnerCtx.intervalId);
      spinnerCtx.intervalId = setInterval(function () {
        if (spinnerCtx.phase < spinnerCtx.$points.length) {
          spinnerCtx.$points.eq(spinnerCtx.phase).fadeTo(spinnerCtx.timeslot, 1);
        } else {
          spinnerCtx.$points.eq(spinnerCtx.phase - spinnerCtx.$points.length)
            .fadeTo(spinnerCtx.timeslot, 0);
        }
        spinnerCtx.phase = (spinnerCtx.phase + 1) % (spinnerCtx.$points.length * 2);
      }, spinnerCtx.timeslot);
    }

    // Stops the loading spinner animation
    function deactivateLoaderAnim(spinnerCtx) {
      clearInterval(spinnerCtx.intervalId);
      spinnerCtx.intervalId = null;
    }

    // Halts any pending layout processor scheduling
    function haltLayoutProcessorScheduler(gridCtx) {
      gridCtx.processingYield.flushed = 0;
      if (gridCtx.layoutTimerHandle !== null) {
        clearTimeout(gridCtx.layoutTimerHandle);
        gridCtx.layoutTimerHandle = null;
      }
    }

    // Initiates the image layout processing
    function initiateLayoutProcessor(gridCtx, isForResize) {
      haltLayoutProcessorScheduler(gridCtx);
      gridCtx.layoutTimerHandle = setTimeout(function () {
        processVisualElements(gridCtx, isForResize);
      }, 1); // Small delay to allow browser to render
    }

    // Core function to analyze images and arrange them into rows
    function processVisualElements(gridCtx, isForResize) {
      var currentSettings = gridCtx.settings;
      var isFinalItemInQueue;
      var currentItemIndex = gridCtx.lastProcessedIdx + 1;

      while (currentItemIndex < gridCtx.visualItems.length) {
        var _itemContainer = jQ(gridCtx.visualItems[currentItemIndex]);
        var _visualAsset = getImageFromContainer(_itemContainer);

        var assetLoadStatus = _visualAsset.data('jg.loaded');

        if (assetLoadStatus === true || assetLoadStatus === 'skipped') {
          isFinalItemInQueue = (currentItemIndex === gridCtx.visualItems.length - 1);

          var spaceForCurrentRow = gridCtx.containerWidth - (2 * gridCtx.edgePadding) - (
            (gridCtx.currentRowData.itemBuffer.length + 1 - 1) * currentSettings.spacingVal); // +1 for the current item

          var currentAssetRatio = _visualAsset.data('jg.imgw') / _visualAsset.data('jg.imgh');
          var potentialAccumulatedRatio = gridCtx.currentRowData.accumulatedRatio + currentAssetRatio;

          // Check if adding the current item would make the row too tall (exceeding target row height)
          if (spaceForCurrentRow / potentialAccumulatedRatio < currentSettings.baseRowH) {
            renderCompletedRow(gridCtx, false); // Flush current row
            if (++gridCtx.processingYield.flushed >= gridCtx.processingYield.every) {
              // Yield control to browser, then continue processing
              initiateLayoutProcessor(gridCtx, isForResize);
              return;
            }
          }

          gridCtx.currentRowData.itemBuffer.push(_itemContainer);
          gridCtx.currentRowData.accumulatedRatio += currentAssetRatio;
          gridCtx.currentRowData.accumulatedWidth += currentAssetRatio * currentSettings.baseRowH;
          gridCtx.lastProcessedIdx = currentItemIndex;
          currentItemIndex++; // Move to next item
        } else if (assetLoadStatus !== 'error') {
          // If the image is not yet loaded and not in error, stop and wait for it.
          // The layout process will resume when an image finishes loading.
          return;
        } else {
          // Image load error, skip this image and continue
          currentItemIndex++;
        }
      }

      // Flush any remaining items in the last row
      if (gridCtx.currentRowData.itemBuffer.length > 0) {
        renderCompletedRow(gridCtx, true);
      }

      // Deactivate spinner if no more items to load
      if (gridCtx.loaderState.active) {
        gridCtx.loaderState.active = false;
        var currentGalleryHeight = gridCtx._targetElement.height();
        var spinnerHeight = gridCtx.loaderState.$el.innerHeight();
        if (currentGalleryHeight >= spinnerHeight) { // Prevent negative height if gallery is very small
          gridCtx._targetElement.height(currentGalleryHeight - spinnerHeight);
        }
        gridCtx.loaderState.$el.detach();
        deactivateLoaderAnim(gridCtx.loaderState);
      }

      // Ensure no further layout processing is scheduled
      haltLayoutProcessorScheduler(gridCtx);

      // Trigger completion or resize events
      if (!isForResize) {
        gridCtx._targetElement.trigger('grid.layoutComplete');
      } else {
        gridCtx._targetElement.trigger('grid.resized');
      }
    }

    // Validates and sanitizes the configuration settings
    function validateConfiguration(gridCtx) {
      var currentSettings = gridCtx.settings;

      function checkSuffixMapEntry(entryName) {
        if (typeof currentSettings.scaleIdentifiers[entryName] !== 'string') {
          throw new Error('Configuration error: scaleIdentifiers.' + entryName + ' must be a string.');
        }
      }

      function ensureNumeric(parentObj, propName) {
        if (typeof parentObj[propName] === 'string') {
          parentObj[propName] = parseFloat(parentObj[propName], 10);
          if (isNaN(parentObj[propName])) {
            throw new Error('Configuration error: invalid number for ' + propName + '.');
          }
        } else if (typeof parentObj[propName] !== 'number' || isNaN(parentObj[propName])) {
          throw new Error('Configuration error: ' + propName + ' must be a number.');
        }
      }

      if (typeof currentSettings.scaleIdentifiers !== 'object' || currentSettings.scaleIdentifiers === null) {
        throw new Error('Configuration error: scaleIdentifiers must be an object.');
      }

      checkSuffixMapEntry('tiny');
      checkSuffixMapEntry('small');
      checkSuffixMapEntry('medium');
      checkSuffixMapEntry('large');
      checkSuffixMapEntry('xlarge');
      checkSuffixMapEntry('original');

      ensureNumeric(currentSettings, 'baseRowH');
      ensureNumeric(currentSettings, 'limitRowH');

      if (currentSettings.limitRowH > 0 && currentSettings.limitRowH < currentSettings.baseRowH) {
        currentSettings.limitRowH = currentSettings.baseRowH; // Max height cannot be less than base height
      }

      ensureNumeric(currentSettings, 'spacingVal');
      ensureNumeric(currentSettings, 'edgePadding');

      if (!['noAdjust', 'align', 'conceal'].includes(currentSettings.finalRowBehavior)) {
        throw new Error('Configuration error: finalRowBehavior must be "noAdjust", "align", or "conceal".');
      }

      ensureNumeric(currentSettings, 'alignThreshold');
      if (currentSettings.alignThreshold < 0 || currentSettings.alignThreshold > 1) {
        throw new Error('Configuration error: alignThreshold must be between 0 and 1.');
      }

      if (typeof currentSettings.enforceFixedH !== 'boolean') {
        throw new Error('Configuration error: enforceFixedH must be a boolean.');
      }

      if (typeof currentSettings.deferThumbLoad !== 'boolean') {
        throw new Error('Configuration error: deferThumbLoad must be a boolean.');
      }

      if (typeof currentSettings.showLabels !== 'boolean') {
        throw new Error('Configuration error: showLabels must be a boolean.');
      }

      if (typeof currentSettings.useCssTransit !== 'boolean') {
        throw new Error('Configuration error: useCssTransit must be a boolean.');
      }

      ensureNumeric(currentSettings, 'imgAnimDuration');
      if (currentSettings.imgAnimDuration < 0) currentSettings.imgAnimDuration = 0;

      if (typeof currentSettings.labelSettings !== 'object' || currentSettings.labelSettings === null) {
        throw new Error('Configuration error: labelSettings must be an object.');
      }
      ensureNumeric(currentSettings.labelSettings, 'animDuration');
      ensureNumeric(currentSettings.labelSettings, 'visibleOpc');
      ensureNumeric(currentSettings.labelSettings, 'hiddenOpc');

      if (currentSettings.labelSettings.visibleOpc < 0 || currentSettings.labelSettings.visibleOpc > 1) {
        throw new Error('Configuration error: labelSettings.visibleOpc must be between 0 and 1.');
      }
      if (currentSettings.labelSettings.hiddenOpc < 0 || currentSettings.labelSettings.hiddenOpc > 1) {
        throw new Error('Configuration error: labelSettings.hiddenOpc must be between 0 and 1.');
      }

      if (currentSettings.linkGroupAttr !== null && typeof currentSettings.linkGroupAttr !== 'string') {
        throw new Error('Configuration error: linkGroupAttr must be a string or null.');
      }
      if (currentSettings.linkTargetAttr !== null && typeof currentSettings.linkTargetAttr !== 'string') {
        throw new Error('Configuration error: linkTargetAttr must be a string or null.');
      }

      if (!(currentSettings.fileExtensionPattern instanceof RegExp)) {
        throw new Error('Configuration error: fileExtensionPattern must be a RegExp object.');
      }

      ensureNumeric(currentSettings, 'recheckInterval');
      if (currentSettings.recheckInterval < 50) currentSettings.recheckInterval = 50; // Minimum interval

      if (typeof currentSettings.shuffleItems !== 'boolean') {
        throw new Error('Configuration error: shuffleItems must be a boolean.');
      }
    }

    // Generic image load handler
    var imageLoadCache = {}; // Cache for image dimensions

    function setupImageLoadHandler(imageUrl, callback) {
      if (imageLoadCache[imageUrl]) {
        callback(imageLoadCache[imageUrl]);
        return;
      }

      var tempImage = new Image();
      tempImage.onload = function () {
        imageLoadCache[imageUrl] = {
          width: this.width,
          height: this.height
        };
        callback(imageLoadCache[imageUrl]);
      };
      tempImage.onerror = function () {
        // Handle error if needed
        callback(null);
      };
      tempImage.src = imageUrl;
    }

    // Main initialization loop for each selected gallery
    return this.each(function (index, element) {
      var _targetElement = jQ(element);
      _targetElement.addClass('justified-grid-container');

      var gridCtx = {
        _targetElement: _targetElement,
        settings: jQ.extend({}, standardOpts, configOpts),
        visualItems: [],
        containerWidth: _targetElement.width(),
        edgePadding: 0, // Calculated later
        currentYOffset: 0,
        lastProcessedIdx: -1,
        currentRowData: {
          itemBuffer: [],
          accumulatedRatio: 0,
          accumulatedWidth: 0
        },
        loaderState: {
          active: false,
          $el: null,
          $points: null,
          phase: 0,
          timeslot: 300,
          intervalId: null
        },
        processingYield: {
          every: 10, // Number of rows to flush before yielding
          flushed: 0
        },
        layoutTimerHandle: null,
        resizeMonitorId: null
      };

      try {
        validateConfiguration(gridCtx); // Validate settings at the start
      } catch (e) {
        console.error('ImageGridDisplay Configuration Error:', e.message);
        return; // Exit if configuration is invalid
      }

      // Apply border setting
      if (gridCtx.settings.edgePadding < 0) {
        gridCtx.edgePadding = gridCtx.settings.spacingVal;
      } else {
        gridCtx.edgePadding = gridCtx.settings.edgePadding;
      }

      // Apply initial styling
      _targetElement.css({
        'position': 'relative',
        'height': 0, // Will be calculated
        'overflow': 'hidden',
        'padding-left': gridCtx.edgePadding,
        'padding-right': gridCtx.edgePadding
      });

      // Prepare visual items
      var rawItems = _targetElement.find('> a, > div');
      if (gridCtx.settings.shuffleItems) {
        rawItems = rawItems.sort(function () {
          return Math.random() - 0.5;
        });
      }

      var itemsProcessed = 0;
      rawItems.each(function (idx, itemEl) {
        var _itemContainer = jQ(itemEl);
        var _visualAsset = getImageFromContainer(_itemContainer);

        if (_visualAsset.length === 0) {
          return; // Skip if no image found
        }

        // Store original source for fallback
        _visualAsset.data('jg.originalSrc', _visualAsset.attr('src'));

        // Apply CSS for animations
        if (gridCtx.settings.useCssTransit) {
          _itemContainer.addClass('entry-css-animated');
          _visualAsset.addClass('img-css-animated');
        } else {
          _itemContainer.css('opacity', 0); // Hide initially for jQuery fade
        }

        // Set up link attributes
        if (gridCtx.settings.linkGroupAttr !== null) {
          _itemContainer.attr('rel', gridCtx.settings.linkGroupAttr);
        }
        if (gridCtx.settings.linkTargetAttr !== null) {
          _itemContainer.attr('target', gridCtx.settings.linkTargetAttr);
        }

        gridCtx.visualItems.push(itemEl);

        _itemContainer.addClass('jg-entry');
        _itemContainer.css({
          'position': 'absolute'
        });

        itemsProcessed++;
        var currentImage = new Image();
        currentImage.onload = function () {
          _visualAsset.data('jg.imgw', this.width);
          _visualAsset.data('jg.imgh', this.height);
          _visualAsset.data('jg.loaded', true);
          itemsProcessed--;
          if (itemsProcessed === 0) {
            // All images loaded, start layout
            initiateLayoutProcessor(gridCtx, false);
          }
        };
        currentImage.onerror = function () {
          _visualAsset.data('jg.loaded', 'error');
          itemsProcessed--;
          if (itemsProcessed === 0) {
            initiateLayoutProcessor(gridCtx, false);
          }
        };

        if (gridCtx.settings.deferThumbLoad) {
          _visualAsset.data('jg.loaded', 'skipped');
          currentImage.src = _visualAsset.attr('src'); // Start loading in background
        } else {
          currentImage.src = _visualAsset.attr('src'); // This will trigger onload/onerror
        }
      });

      // Show spinner if images are still loading
      if (itemsProcessed > 0) {
        gridCtx.loaderState.active = true;
        gridCtx.loaderState.$el = jQ('<div class="jg-spinner"><span>.</span><span>.</span><span>.</span></div>');
        _targetElement.append(gridCtx.loaderState.$el);
        gridCtx.loaderState.$points = gridCtx.loaderState.$el.find('span');
        activateLoaderAnim(gridCtx.loaderState);

        // Initial height with spinner
        _targetElement.height(gridCtx.edgePadding + gridCtx.loaderState.$el.innerHeight());
      } else {
        // If no images or all loaded synchronously, immediately start processor
        initiateLayoutProcessor(gridCtx, false);
      }

      // Start monitoring container width for resize events
      monitorContainerWidth(gridCtx);

      // Store context on the element for external access/debugging
      _targetElement.data('jg.context', gridCtx);
    });
  };
})(window.jQuery);