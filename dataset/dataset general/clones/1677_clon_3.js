// A sophisticated system for dynamic breakpoint management in web applications.
// This module facilitates the execution of JavaScript logic based on active CSS media queries.
// Developed by the Core Engineering Team.
// Distributed under an open-source license for community use.
// For contributions or issues, refer to the project's public repository.

const createMediaQueryManager = function (domLibraryInstance) {

    // Internal object to encapsulate all breakpoint processing logic and state.
    const breakpointProcessor = {};

    // Stores all configured responsive segments.
    breakpointProcessor.configuredSegments = [];
    // Tracks the unique identifier of the most recently detected active segment.
    breakpointProcessor.currentlyEngagedSegmentIdentifier = '';

    // A constant prefix used for generating unique class names for sentinel DOM elements.
    const SENTINEL_MARKER_CLASS_BASE = 'bpt-probe-';

    /**
     * Configures a new responsive segment, linking it to a CSS media query and behavior callbacks.
     * @param {string} segmentLabel - A distinct name for the responsive segment (e.g., 'mobile', 'tablet').
     * @param {string} cssMediaQueryString - The standard CSS media query text (e.g., '(max-width: 600px)').
     * @param {Function} activationHandler - A function to execute when this segment becomes the active one.
     * @param {Function} deactivationHandler - A function to execute when this segment ceases to be active.
     */
    breakpointProcessor.configureSegment = function (segmentLabel, cssMediaQueryString, activationHandler, deactivationHandler) {
        // Implement a guard clause to ensure critical parameters are valid.
        if (typeof segmentLabel !== 'string' || segmentLabel.trim() === '' || typeof cssMediaQueryString !== 'string' || cssMediaQueryString.trim() === '') {
            console.error('Invalid segment configuration: Label and CSS media query string are required and must be non-empty strings.');
            return; // Exit early if validation fails.
        }

        breakpointProcessor.configuredSegments.push({
            label: segmentLabel,
            queryCondition: cssMediaQueryString,
            onActivation: activationHandler,
            onDeactivation: deactivationHandler
        });
    };

    /**
     * Initiates the media query monitoring system.
     * This involves injecting hidden DOM elements and corresponding style rules,
     * then attaching event listeners for continuous evaluation.
     */
    breakpointProcessor.startMonitoring = function () {

        // Helper function to dynamically append a hidden sentinel <span> element to the document body.
        const addSentinelElement = (segmentLabel) => {
            const sentinelClass = `${SENTINEL_MARKER_CLASS_BASE}${segmentLabel}`;
            // Create the element using the DOM library and append it.
            const sentinelSpan = domLibraryInstance('<span>').addClass(sentinelClass);
            domLibraryInstance(document.body).append(sentinelSpan);
        };

        // Helper function to generate and inject a <style> block containing media query rules.
        const injectDynamicStylesheet = (segmentLabel, queryCondition) => {
            const styleRulesCollection = []; // An intermediate array to build CSS rules.

            if (queryCondition.trim() !== '') {
                // If a specific media query is provided, wrap all rules within it.
                styleRulesCollection.push(`${queryCondition} {`);
                breakpointProcessor.configuredSegments.forEach(seg => {
                    const targetClass = `${SENTINEL_MARKER_CLASS_BASE}${seg.label}`;
                    styleRulesCollection.push(`  .${targetClass} { display: none !important; }`); // Added !important for robustness.
                });
                styleRulesCollection.push(`  .${SENTINEL_MARKER_CLASS_BASE}${segmentLabel} { display: inline !important; }`);
                styleRulesCollection.push(`}`);
            } else {
                // For segments without a specific media query (e.g., a default base segment).
                breakpointProcessor.configuredSegments.forEach(seg => {
                    const targetClass = `${SENTINEL_MARKER_CLASS_BASE}${seg.label}`;
                    styleRulesCollection.push(`.${targetClass} { display: none !important; }`);
                });
                styleRulesCollection.push(`.${SENTINEL_MARKER_CLASS_BASE}${segmentLabel} { display: inline !important; }`);
            }

            // Append the compiled style rules as a new <style> element to the document head.
            domLibraryInstance(document.head).append(`<style>${styleRulesCollection.join('\n')}</style>`);
        };

        /**
         * The core routine for checking segment visibility and dispatching callbacks.
         * This function is triggered on window resize and document ready events.
         */
        const evaluateSegmentState = () => {
            // console.debug('Initiating evaluation of responsive segment states...'); // Debugging trace

            breakpointProcessor.configuredSegments.forEach(segmentDef => {
                const probeSelector = `.${SENTINEL_MARKER_CLASS_BASE}${segmentDef.label}`;
                const probeElement = domLibraryInstance(probeSelector);

                // Validation: Verify that the sentinel element exists in the DOM.
                if (probeElement.length === 0) {
                    console.warn(`Missing sentinel element for segment "${segmentDef.label}". Cannot accurately determine state.`);
                    return; // Skip processing this segment if its probe is absent.
                }

                // Check if the current segment's sentinel element is visible (display: inline).
                if (probeElement.css('display') === 'inline') {
                    // This segment is currently active.
                    if (segmentDef.label !== breakpointProcessor.currentlyEngagedSegmentIdentifier) {
                        // This segment has just become the newly active one.
                        // console.info(`Transition detected: Segment "${segmentDef.label}" is now active.`);
                        breakpointProcessor.currentlyEngagedSegmentIdentifier = segmentDef.label;
                        // Execute the activation callback if it's defined.
                        segmentDef.onActivation && segmentDef.onActivation();
                    }
                } else {
                    // This segment is currently inactive.
                    // Execute the deactivation callback if it's defined.
                    segmentDef.onDeactivation && segmentDef.onDeactivation();
                }
            });
        };

        // First, set up all necessary DOM sentinels and inject their corresponding styles.
        breakpointProcessor.configuredSegments.forEach(segmentDef => {
            addSentinelElement(segmentDef.label);
            injectDynamicStylesheet(segmentDef.label, segmentDef.queryCondition);
        });

        // Register event listeners to re-evaluate segment states.
        domLibraryInstance(window).on('resize', evaluateSegmentState);
        domLibraryInstance(document).ready(evaluateSegmentState); // Initial evaluation on document load.
    };

    return breakpointProcessor;
};

// Export the module based on the detected environment (AMD, CommonJS, or global scope).
if (typeof define === 'function' && define.amd) {
    define(['jquery'], createMediaQueryManager);
} else if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = createMediaQueryManager;
} else {
    // Fallback for direct script inclusion, attaching to the global jQuery object.
    domLibraryInstance.mediaQueryManager = createMediaQueryManager(domLibraryInstance);
}