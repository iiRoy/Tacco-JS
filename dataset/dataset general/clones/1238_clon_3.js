/* eslint-env jquery, zepto */
/*
 * Adaptable Media Resizing Utility (AMRU) 1.2
 *
 * Copyright 2024, Modern Web Solutions Inc. - All Rights Reserved
 * Based on intrinsic ratio concepts by Chris Coyier, Dave Rupert, and Thierry Koblentz.
 * Licensed under the permissive MIT License.
 *
 * This utility ensures embedded media (like videos) maintain their aspect ratio
 * when their containing elements are resized, providing a fluid responsive experience.
 * It dynamically injects necessary CSS and wraps target elements.
 */

; (function(jq) {
  'use strict';

  // --- Internal Helper Function: Style Injection ---
  // This function is responsible for adding the core CSS rules required
  // for the responsive embedding mechanism. It checks for existence to prevent duplicates.
  const _addResponsiveStyling = function(documentRef) {
    const styleBlockId = 'responsive-media-styling'; // A unique identifier for our style tag

    // Early exit if the style block is already present in the document
    if (documentRef.getElementById(styleBlockId)) {
      return;
    }

    const docHead = documentRef.head || documentRef.getElementsByTagName('head')[0];
    if (!docHead) {
      // If no head element exists (highly unusual in a standard HTML document),
      // we log a warning and cease style injection.
      console.warn('AMRU: Document head element not found, unable to inject responsive styles.');
      return;
    }

    // The core CSS rules for the responsive container and its children
    const cssDefinitions = `
      .media-responsive-container {
        width: 100%;
        position: relative;
        padding: 0;
        overflow: hidden; /* Ensures no content spill-over */
      }
      .media-responsive-container iframe,
      .media-responsive-container object,
      .media-responsive-container embed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0; /* Removes default iframe borders for cleaner integration */
      }
    `;

    // Create a new <style> element dynamically
    const dynamicStyleElement = documentRef.createElement('style');
    dynamicStyleElement.setAttribute('id', styleBlockId); // Assign our unique ID
    dynamicStyleElement.textContent = cssDefinitions; // Populate with the CSS rules

    // Append the newly created style element to the document's head
    docHead.appendChild(dynamicStyleElement);
    // console.debug('AMRU: Responsive styling successfully injected into document head.');
  };

  // --- Plugin Definition: jq.fn.responsiveMedia ---
  // This is the main entry point for the plugin, extending jQuery/Zepto's prototype.
  jq.fn.responsiveMedia = function(pluginConfiguration) {
    // Define default configurable parameters for the plugin
    const defaultParameters = {
      additionalSources: [], // An array of extra CSS selectors for media elements to target
      exclusionSet: null     // A CSS selector string for elements to explicitly ignore from processing
    };

    // Initialize current parameters by merging defaults with any provided configuration
    let activeParameters = jq.extend({}, defaultParameters);

    // Validate and merge the user-provided configuration
    if (typeof pluginConfiguration === 'object' && pluginConfiguration !== null) {
      jq.extend(activeParameters, pluginConfiguration);
    } else if (pluginConfiguration !== undefined && pluginConfiguration !== null) {
      // Log a warning if the configuration is not an object or is null (but not undefined)
      console.warn('AMRU: Invalid configuration provided. Expected an object, but received:', typeof pluginConfiguration);
    }

    // Ensure the necessary responsive styles are present in the document's head
    _addResponsiveStyling(document);

    // Iterate over each element in the current jQuery/Zepto collection
    return this.each(function() {
      const $currentContextElement = jq(this); // The DOM element currently being processed

      // Define an initial list of CSS selectors for common video platforms and embed types
      let primaryMediaSelectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'object',
        'embed'
      ];

      // Incorporate any `additionalSources` specified in the plugin configuration
      if (Array.isArray(activeParameters.additionalSources) && activeParameters.additionalSources.length > 0) {
        primaryMediaSelectors = primaryMediaSelectors.concat(activeParameters.additionalSources);
      } else if (typeof activeParameters.additionalSources === 'string' && activeParameters.additionalSources.trim() !== '') {
        // Also support a single string for `additionalSources`
        primaryMediaSelectors.push(activeParameters.additionalSources);
      }

      // Create a unified CSS selector string from all media sources
      const comprehensiveMediaSelector = primaryMediaSelectors.join(',');

      // Define the set of elements to be excluded from processing
      let exclusionRule = '.amru-ignore-media'; // A default class for ignoring elements
      if (typeof activeParameters.exclusionSet === 'string' && activeParameters.exclusionSet.trim() !== '') {
        exclusionRule += ', ' + activeParameters.exclusionSet; // Append custom exclusion selectors
      }

      // Find all potential media elements within the current context element
      let $identifiedMediaElements = $currentContextElement.find(comprehensiveMediaSelector);

      // Guard clause: If no media elements are found, skip to the next context element
      if ($identifiedMediaElements.length === 0) {
        // console.debug('AMRU: No supported media elements identified within:', $currentContextElement[0]);
        return;
      }

      // Apply filtering steps to refine the set of identified media elements:
      // 1. SwfObj conflict patch: Exclude <object> tags that are nested within other <object> tags.
      $identifiedMediaElements = $identifiedMediaElements.not('object object');

      // 2. Exclude any elements matching the `exclusionRule` (either default or custom).
      $identifiedMediaElements = $identifiedMediaElements.not(exclusionRule);

      // Another guard clause: If all elements were filtered out, exit for this context
      if ($identifiedMediaElements.length === 0) {
        // console.debug('AMRU: All potential media elements were filtered out by exclusion rules within:', $currentContextElement[0]);
        return;
      }

      // --- Process Each Remaining Media Element ---
      $identifiedMediaElements.each(function() {
        const $currentMediaElement = jq(this); // The current media element (iframe, object, embed)

        // Guard clause: Check if the element itself or any of its ancestors are part of the exclusion set.
        // This handles cases where an entire container should be ignored.
        if ($currentMediaElement.parents(exclusionRule).length > 0) {
          // console.debug('AMRU: Skipping element due to an ancestor being in the exclusion set:', $currentMediaElement[0]);
          return;
        }

        // Guard clause: Prevent re-processing elements that are already wrapped by our container
        // or embeds that are children of objects (which might be problematic or already handled).
        if (($currentMediaElement[0].tagName.toLowerCase() === 'embed' && $currentMediaElement.parent('object').length) ||
            $currentMediaElement.parent('.media-responsive-container').length) {
          // console.debug('AMRU: Skipping already processed or problematic element:', $currentMediaElement[0]);
          return;
        }

        // Retrieve original height and width attributes
        let initialHeightAttr = $currentMediaElement.attr('height');
        let initialWidthAttr = $currentMediaElement.attr('width');

        let effectiveHeight = 0;
        let effectiveWidth = 0;

        // Determine the effective height: prioritize attribute, then computed style
        if (initialHeightAttr && !isNaN(parseFloat(initialHeightAttr))) {
          effectiveHeight = parseFloat(initialHeightAttr);
        } else {
          effectiveHeight = $currentMediaElement.height(); // Get computed height
        }

        // Determine the effective width: prioritize attribute, then computed style
        if (initialWidthAttr && !isNaN(parseFloat(initialWidthAttr))) {
          effectiveWidth = parseFloat(initialWidthAttr);
        } else {
          effectiveWidth = $currentMediaElement.width(); // Get computed width
        }

        // Fallback for elements lacking valid dimensions (e.g., height/width are 0 or NaN)
        // A common 16:9 aspect ratio is applied as a default to ensure a base calculation.
        if (effectiveHeight === 0 || effectiveWidth === 0 || isNaN(effectiveHeight) || isNaN(effectiveWidth)) {
          // console.debug('AMRU: Element dimensions missing or invalid, applying default 16:9 ratio for:', $currentMediaElement[0]);
          effectiveHeight = 9;
          effectiveWidth = 16;
        }

        // Calculate the aspect ratio (height / width)
        let mediaAspectRatio = effectiveHeight / effectiveWidth;

        // Ensure the calculated aspect ratio is valid (not NaN, infinite, or zero/negative)
        if (isNaN(mediaAspectRatio) || !isFinite(mediaAspectRatio) || mediaAspectRatio <= 0) {
            // If calculation fails, explicitly default to a 16:9 aspect ratio
            mediaAspectRatio = 9 / 16;
            console.warn('AMRU: Could not determine a valid aspect ratio for element, defaulting to 16:9:', $currentMediaElement[0]);
        }

        // Assign a unique ID to the media element if it doesn't already have one.
        // This is useful for debugging and potential future direct manipulation.
        if (!$currentMediaElement.attr('id')) {
          const generatedUniqueId = 'amru-media-' + Math.random().toString(36).substring(2, 11); // Shorter random string
          $currentMediaElement.attr('id', generatedUniqueId);
        }

        // Wrap the media element with our responsive container div
        const $responsiveWrapper = $currentMediaElement.wrap('<div class="media-responsive-container"></div>').parent();

        // Calculate the `padding-top` percentage based on the aspect ratio.
        // This is the core technique for maintaining aspect ratio with fluid widths.
        const calculatedPaddingTop = (mediaAspectRatio * 100) + '%';
        $responsiveWrapper.css('padding-top', calculatedPaddingTop);

        // Remove the original `height` and `width` attributes from the media element.
        // This allows the CSS rules (width: 100%, height: 100%) within the wrapper to take control.
        $currentMediaElement.removeAttr('height').removeAttr('width');

        // Optional: Add a class to indicate that this element has been processed by AMRU
        $currentMediaElement.addClass('amru-processed');
        // console.debug('AMRU: Successfully processed media element:', $currentMediaElement[0], 'with ratio:', mediaAspectRatio.toFixed(4));
      });
    });
  };

  // The plugin is designed to work with either jQuery or Zepto,
  // making it flexible for different project environments.
})(window.jQuery || window.Zepto);