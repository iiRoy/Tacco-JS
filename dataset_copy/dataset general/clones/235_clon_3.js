(function($, window, document, undefined) {
    'use strict';

    // This script manages the activation of various client-side interactive features
    // upon the completion of the Document Object Model (DOM) loading process.
    // It is designed to enhance user experience by adding dynamic behaviors.

    // A crucial preliminary check to ensure the core jQuery library is loaded.
    // Without jQuery, none of the subsequent enhancements can function correctly.
    if (typeof $ === 'undefined') {
        console.error('Critical dependency missing: jQuery library not found. Aborting UI enhancement initialization.');
        return; // Exit early if jQuery is unavailable.
    }

    // Centralized configuration object for all dynamic page elements.
    // This allows for easy adjustment of parameters and feature toggles.
    const pageBehaviorConfiguration = {
        smoothScrolling: {
            animationDurationMs: 650, // Renamed 'speed' to 'animationDurationMs' for clarity.
            animationStyle: 'easeOutExpo', // Added a new easing function for scroll animations.
            paddingOffsetPx: 0 // New parameter: vertical offset for scroll targets.
        },
        heroSlider: {
            autoAdvanceSlides: true, // Renamed 'autoPlay' to 'autoAdvanceSlides'.
            slideTransitionInterval: 6000, // Renamed 'interval' to 'slideTransitionInterval' (in milliseconds).
            pauseOnHoverEnabled: true, // New feature: pause slider when mouse hovers.
            loopCarousel: true // New feature: enable continuous looping.
        },
        elementPinning: {
            fixedOffsetFromTop: 20, // Added a top offset for elements that "stick".
            activationBreakpoint: 1024 // New parameter: minimum viewport width for pinning to activate.
        },
        enableDetailedLogging: true // Toggle for verbose console output during development.
    };

    /**
     * Orchestrates the initialization of all interactive components on the page.
     * This function is triggered once the browser has fully parsed the HTML document.
     * @private
     */
    function setupInteractiveElements() {
        if (pageBehaviorConfiguration.enableDetailedLogging) {
            console.groupCollapsed('Dynamic UI Initialization Report');
            console.log('Document ready. Commencing activation of page enhancements.');
        }

        // Define specific CSS selectors for the elements targeted by our plugins.
        const primaryNavSelector = '.main-header-navigation-wrapper';
        const heroCarouselSelector = '.visual-content-rotator';
        const persistentComponentSelector = '.utility-bar-fixed';

        // --- Section 1: Enhanced Navigation Scrolling ---
        // Applies smooth scrolling behavior to navigation links.
        const navigationTargets = $(primaryNavSelector);
        if (navigationTargets.length > 0) {
            // Extract relevant options for the smooth scroll plugin.
            const scrollOptions = {
                duration: pageBehaviorConfiguration.smoothScrolling.animationDurationMs,
                easing: pageBehaviorConfiguration.smoothScrolling.animationStyle,
                offset: pageBehaviorConfiguration.smoothScrolling.paddingOffsetPx
            };
            navigationTargets.applySmoothPageScroll(scrollOptions); // Plugin call renamed.
            if (pageBehaviorConfiguration.enableDetailedLogging) {
                console.info(`[SCROLL] Smooth scrolling initialized for: ${primaryNavSelector}`);
            }
        } else {
            if (pageBehaviorConfiguration.enableDetailedLogging) {
                console.warn(`[SCROLL] No elements found for smooth scrolling at selector: ${primaryNavSelector}`);
            }
        }

        // --- Section 2: Automated Hero Content Carousel ---
        // Manages the automatic rotation of images or content blocks.
        const carouselElements = $(heroCarouselSelector);
        if (carouselElements.length > 0) {
            // Pass the entire configuration subset for the slider plugin.
            carouselElements.initializeContentSlider(pageBehaviorConfiguration.heroSlider); // Plugin call renamed.
            if (pageBehaviorConfiguration.enableDetailedLogging) {
                console.info(`[CAROUSEL] Hero content slider activated for: ${heroCarouselSelector}`);
            }
        } else {
            if (pageBehaviorConfiguration.enableDetailedLogging) {
                console.info(`[CAROUSEL] No content carousels detected with selector: ${heroCarouselSelector}`);
            }
        }

        // --- Section 3: Sticky/Fixed Position UI Components ---
        // Makes certain elements remain visible when the user scrolls past them.
        const fixedElements = $(persistentComponentSelector);
        if (fixedElements.length > 0) {
            // Implement a guard clause: only activate sticky behavior on wider viewports.
            const currentBrowserWidth = window.innerWidth || document.documentElement.clientWidth;
            if (currentBrowserWidth >= pageBehaviorConfiguration.elementPinning.activationBreakpoint) {
                // Prepare options for the fixed positioning plugin.
                const pinningOptions = {
                    offset: pageBehaviorConfiguration.elementPinning.fixedOffsetFromTop
                };
                fixedElements.attachToViewportFixed(pinningOptions); // Plugin call renamed.
                if (pageBehaviorConfiguration.enableDetailedLogging) {
                    console.info(`[STICKY] Fixed positioning applied to ${persistentComponentSelector} (viewport >= ${pageBehaviorConfiguration.elementPinning.activationBreakpoint}px).`);
                }
            } else {
                if (pageBehaviorConfiguration.enableDetailedLogging) {
                    console.warn(`[STICKY] Fixed positioning skipped for ${persistentComponentSelector} due to narrow viewport (${currentBrowserWidth}px).`);
                }
            }
        } else {
            if (pageBehaviorConfiguration.enableDetailedLogging) {
                console.debug(`[STICKY] No elements designated for fixed positioning found at selector: ${persistentComponentSelector}`);
            }
        }

        if (pageBehaviorConfiguration.enableDetailedLogging) {
            console.groupEnd(); // Conclude the console group for a tidy output.
        }
    }

    // Attach the main initialization function to jQuery's DOM ready event.
    // This ensures all HTML elements are available before script execution.
    jQuery(document).ready(setupInteractiveElements);

})(jQuery, window, document); // Pass global objects into the IIFE for better encapsulation and performance.