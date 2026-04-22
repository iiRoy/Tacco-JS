/*
 * Responsive Layout Adaptor v3.0
 * Manages the dynamic application of responsive and desktop stylesheets,
 * allowing for a unified codebase that intelligently adjusts to various device types,
 * including specific handling for tablet-sized viewports.
 *
 * This module exports an object containing computed media query strings:
 * - `layoutConfiguration.desktopQuery`: The finalized media query for desktop layouts.
 * - `layoutConfiguration.mobileQuery`: The finalized media query for mobile/responsive layouts.
 * These queries can be integrated with third-party JavaScript libraries or used directly.
 *
 * Setup Guide:
 * 1. Ensure a viewport meta tag is defined in your HTML, typically:
 *    `<meta name="viewport" content="width=device-width, initial-scale=1">`
 * 2. Identify your desktop stylesheet link by adding `class="desktop-layout-link"`.
 *    Its `media` attribute will be dynamically updated (e.g., `media="all and (min-width: 1024px)"`).
 * 3. Identify your responsive stylesheet link by adding `class="mobile-layout-link"`.
 *    Its `media` attribute will also be dynamically adjusted (e.g., `media="all and (max-width: 1023px)"`).
 * 4. For tablet-specific breakpoints, add `data-tablet-breakpoint="[WIDTH_PX]"` to the desktop link.
 *    Example: `data-tablet-breakpoint="768"` for iPads.
 * 5. To force a specific viewport width on tablets, add `data-tablet-viewport="[WIDTH_PX]"` to the desktop link.
 *    Example: `data-tablet-viewport="1024"` will set the viewport to 1024px on tablets.
 * 6. For development or testing, add `data-force-touch-emulation="true"` to the desktop link.
 *    This will activate tablet-specific logic on non-touch devices.
 *
 * Copyright (c) 2024 Global Web Solutions. All rights reserved.
 *
 * For detailed documentation and support, please visit our knowledge base.
 * Licensed under the Apache License, Version 2.0.
 */
;const adaptiveLayoutModule = (() => {
  // --- Essential Browser API Availability Check ---
  const checkRequiredBrowserApis = () => {
    const hasQuerySelector = typeof document.querySelector === 'function';
    const hasGetElementsByClassName = typeof document.getElementsByClassName === 'function';
    const hasWindowInnerWidth = typeof window.innerWidth === 'number'; // More robust check for window.innerWidth

    if (!hasQuerySelector || !hasGetElementsByClassName || !hasWindowInnerWidth) {
      console.warn('Responsive Layout Adaptor: Core DOM APIs or window.innerWidth are not available. Module will not initialize.');
      return false;
    }
    return true;
  };

  if (!checkRequiredBrowserApis()) {
    return null; // Exit early if browser capabilities are insufficient
  }

  // --- DOM Element Selection ---
  const vpMetaTag = document.querySelector('meta[name="viewport"]');
  const dskStyleLinks = Array.from(document.getElementsByClassName('desktop-layout-link'));
  const mobStyleLinks = Array.from(document.getElementsByClassName('mobile-layout-link'));

  // --- Initial Configuration Verification ---
  if (!vpMetaTag || dskStyleLinks.length === 0 || mobStyleLinks.length === 0) {
    console.warn('Responsive Layout Adaptor: Missing critical HTML elements (viewport meta tag or stylesheet links). Initialization halted.');
    return null;
  }

  // --- Configuration Constants and Dynamic Variables ---
  const mediaAttrKey = 'media';
  const contentAttrKey = 'content';
  const tabletBreakpointDataAttr = 'data-tablet-breakpoint';
  const tabletViewportDataAttr = 'data-tablet-viewport';
  const forceTouchEmulationDataAttr = 'data-force-touch-emulation';

  const initialVpContent = vpMetaTag.getAttribute(contentAttrKey) || 'width=device-width, initial-scale=1';
  let standardDesktopWidth = 980; // Default width for desktop content
  const viewportAdjustmentDelay = 300; // Milliseconds delay for viewport updates

  // Feature detection for touch capabilities and orientation changes
  const isTouchEnabled = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const orientationChangeSupported = 'onorientationchange' in window;
  const viewportChangeEvent = orientationChangeSupported ? 'orientationchange' : 'resize';

  // Extract base media queries from the first detected links
  const primaryDesktopLink = dskStyleLinks[0];
  const primaryMobileLink = mobStyleLinks[0];

  const baseDskQuery = primaryDesktopLink.getAttribute(mediaAttrKey) || 'all and (min-width: 990px)';
  const baseMobQuery = primaryMobileLink.getAttribute(mediaAttrKey) || 'all and (max-width: 989px)';

  // Retrieve custom data attributes for breakpoint overrides
  const customTabletBkp = primaryDesktopLink.getAttribute(tabletBreakpointDataAttr);
  const customTabletVp = primaryDesktopLink.getAttribute(tabletViewportDataAttr);
  const isEmulationForced = primaryDesktopLink.getAttribute(forceTouchEmulationDataAttr) === 'true';

  let calculatedEffectiveBreakpoint = null;
  let finalAdjustedDesktopVpContent = `width=${standardDesktopWidth}`;

  // --- Utility Function: Extract Minimum Width from Media Query String ---
  const extractMinWidthFromQuery = (mqString) => {
    const matchResult = mqString.match(/min-width:\s?(\d+)px/);
    return matchResult ? Number(matchResult[1]) : null;
  };

  // --- Core Logic: Determine Breakpoint and Viewport Content ---
  const establishLayoutParameters = () => {
    let determinedBreakpoint;

    // Logic to set the primary breakpoint
    if (isTouchEnabled || isEmulationForced) {
      if (customTabletBkp) {
        determinedBreakpoint = Number(customTabletBkp);
        if (isNaN(determinedBreakpoint) || determinedBreakpoint <= 0) {
          console.warn(`Responsive Layout Adaptor: Invalid custom tablet breakpoint value '${customTabletBkp}'. Falling back to default media query extraction.`);
          determinedBreakpoint = extractMinWidthFromQuery(baseDskQuery);
        }
      } else {
        determinedBreakpoint = extractMinWidthFromQuery(baseDskQuery);
      }
    } else {
      determinedBreakpoint = extractMinWidthFromQuery(baseDskQuery);
    }

    // Apply a robust fallback if no breakpoint was successfully determined
    if (determinedBreakpoint === null) {
      console.error('Responsive Layout Adaptor: Failed to determine an effective breakpoint. Defaulting to 990px.');
      determinedBreakpoint = 990;
    }

    calculatedEffectiveBreakpoint = determinedBreakpoint;

    // Logic to adjust the viewport content for desktop-like rendering on tablets
    if (customTabletVp && (isTouchEnabled || isEmulationForced)) {
      const parsedCustomVp = Number(customTabletVp);
      if (!isNaN(parsedCustomVp) && parsedCustomVp > 0) {
        // Only apply if custom viewport is meaningfully larger
        if (parsedCustomVp >= calculatedEffectiveBreakpoint || parsedCustomVp > standardDesktopWidth) {
          finalAdjustedDesktopVpContent = `width=${parsedCustomVp}`;
          // console.log(`Responsive Layout Adaptor: Custom tablet viewport set to ${parsedCustomVp}px.`); // Debug
        } else {
          console.info(`Responsive Layout Adaptor: Custom tablet viewport (${parsedCustomVp}px) is not significantly larger than breakpoint (${calculatedEffectiveBreakpoint}px) or standard desktop width. Ignoring.`);
        }
      } else {
        console.warn(`Responsive Layout Adaptor: Invalid custom tablet viewport value '${customTabletVp}'. Using calculated default.`);
      }
    } else if (calculatedEffectiveBreakpoint > standardDesktopWidth) {
      // If the calculated breakpoint itself is wider than the standard desktop, use it
      finalAdjustedDesktopVpContent = `width=${calculatedEffectiveBreakpoint}`;
    }
  };

  establishLayoutParameters(); // Run the parameter establishment logic

  // --- Media Query String Construction ---
  // Ensure the breakpoint is an integer for accurate media query calculation
  const finalBoundaryWidth = Math.floor(calculatedEffectiveBreakpoint);
  const constructedDesktopQuery = baseDskQuery.replace(/min-width:\s?\d+px/g, `min-width: ${finalBoundaryWidth}px`);
  const constructedMobileQuery = baseMobQuery.replace(/max-width:\s?\d+px/g, `max-width: ${finalBoundaryWidth - 1}px`);

  const layoutConfiguration = {
    desktopQuery: constructedDesktopQuery,
    mobileQuery: constructedMobileQuery,
  };

  // --- Helper: Apply Media Query Updates to Link Elements ---
  const updateStylesheetLinks = (linksCollection, newMediaQuery) => {
    linksCollection.forEach(linkElement => {
      // Only modify the attribute if its value has actually changed
      if (linkElement && linkElement.getAttribute(mediaAttrKey) !== newMediaQuery) {
        linkElement.setAttribute(mediaAttrKey, newMediaQuery);
        // console.log(`Responsive Layout Adaptor: Updated media attribute for link to "${newMediaQuery}"`, linkElement); // Debug
      }
    });
  };

  // Apply updated media queries to the stylesheet links if on a touch device or debug is forced
  if (isTouchEnabled || isEmulationForced) {
    updateStylesheetLinks(dskStyleLinks, constructedDesktopQuery);
    updateStylesheetLinks(mobStyleLinks, constructedMobileQuery);
  }

  // --- Dynamic Viewport Switching Mechanism for Touch Devices ---
  if (isTouchEnabled) {
    const handleViewportAdjustments = () => {
      vpMetaTag.setAttribute(contentAttrKey, initialVpContent); // Reset to initial on orientation/resize
      window.setTimeout(() => {
        // Check current viewport width to decide on desktop content
        if (window.innerWidth >= finalBoundaryWidth) {
          vpMetaTag.setAttribute(contentAttrKey, finalAdjustedDesktopVpContent);
          // console.log(`Responsive Layout Adaptor: Viewport set to desktop emulation: ${finalAdjustedDesktopVpContent}`); // Debug
        } else {
          // console.log(`Responsive Layout Adaptor: Viewport remains responsive: ${initialVpContent}`); // Debug
        }
      }, viewportAdjustmentDelay);
    };

    // Execute once on initial load
    handleViewportAdjustments();

    // Attach event listeners for dynamic adjustments
    window.addEventListener(viewportChangeEvent, handleViewportAdjustments, { passive: true });
    // Also consider 'load' event for ensuring correct initial state after all resources are loaded
    window.addEventListener('load', handleViewportAdjustments, { passive: true });
  }

  // --- Module Output ---
  return layoutConfiguration;
})();