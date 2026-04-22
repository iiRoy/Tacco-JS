/*
 * This comprehensive script manages the initial setup, dynamic styling, and interactive behaviors
 * for a set of content presentation blocks on a web page. It ensures that all DOM manipulations
 * and plugin initializations occur only after the document's structure is fully loaded and parsed.
 * The script provides visual cues and enhances user interaction for a gallery-like component.
 */
jQuery(document).ready(function($) {
    // --- Core Configuration Parameters and Utility Functions ---

    /**
     * Defines the standardized saturation, lightness, and alpha values for
     * the dynamically generated HSLA background colors of the content panels.
     * These values ensure a consistent aesthetic across all panels.
     * @type {object}
     */
    const PANEL_VISUAL_PROPERTIES = {
        saturationLevel: '65%', // Reduced saturation for a softer look
        brightnessLevel: '55%', // Slightly increased brightness
        transparencyAlpha: 0.6  // Moderately transparent
    };

    /**
     * Constructs a complete HSLA (Hue, Saturation, Lightness, Alpha) color string.
     * This function abstracts the color generation logic, promoting reusability.
     * @param {number} hueAngleDegrees - The color's hue, represented as an angle from 0 to 359.
     * @param {string} satPercent - Saturation value as a percentage string (e.g., '70%').
     * @param {string} lightPercent - Lightness value as a percentage string (e.g., '50%').
     * @param {number} alphaValue - The alpha transparency level, from 0.0 (fully transparent) to 1.0 (fully opaque).
     * @returns {string} The formatted HSLA color string.
     */
    function assembleHslaColorString(hueAngleDegrees, satPercent, lightPercent, alphaValue) {
        return `hsla(${Math.round(hueAngleDegrees)}, ${satPercent}, ${lightPercent}, ${alphaValue})`;
    }

    /**
     * Generates a new HTML span element, configured to display a numerical sequence identifier.
     * This marker helps users track their position within a series of elements.
     * @param {number} sequenceValue - The integer value to be displayed within the span.
     * @returns {HTMLSpanElement} A newly created span element containing the sequence value.
     */
    function createSequenceIdentifier(sequenceValue) {
        const sequenceIndicatorSpan = document.createElement("span");
        sequenceIndicatorSpan.classList.add('panel-sequence-label'); // Apply a specific CSS class
        sequenceIndicatorSpan.textContent = sequenceValue.toString(); // Set the text content directly
        return sequenceIndicatorSpan;
    }

    // --- Dynamic Content Panel Initialization ---
    let currentHuePosition = 0; // Initializes the starting hue angle for color progression.

    // Retrieve all elements that are designated as interactive content panels.
    const allInteractivePanels = Array.from(document.querySelectorAll('.interactive-content-block'));

    // Validate if any content panels were found before proceeding.
    if (allInteractivePanels.length === 0) {
        console.warn('Script Warning: No elements matching ".interactive-content-block" found. Dynamic panel styling and indexing will be skipped.');
    } else {
        // Calculate the increment for the hue angle to ensure an even distribution
        // of colors across all panels, wrapping around the 360-degree color wheel.
        const hueProgressionStep = (allInteractivePanels.length > 0) ? (360 / allInteractivePanels.length) : 0;

        allInteractivePanels.forEach((panelDivElement, panelNumericIndex) => {
            // Append a visible numerical marker to each panel, indicating its order.
            panelDivElement.appendChild(createSequenceIdentifier(panelNumericIndex + 1));

            // Apply a distinct background color to the current panel, derived from the hue progression.
            panelDivElement.style.backgroundColor = assembleHslaColorString(
                currentHuePosition,
                PANEL_VISUAL_PROPERTIES.saturationLevel,
                PANEL_VISUAL_PROPERTIES.brightnessLevel,
                PANEL_VISUAL_PROPERTIES.transparencyAlpha
            );

            // Advance the hue position for the subsequent panel, ensuring it cycles within 0-359 degrees.
            currentHuePosition = (currentHuePosition + hueProgressionStep) % 360;
        });
    }

    // --- Transient Directional Guide Overlays ---
    // Construct the HTML string for a set of temporary directional indicators.
    // These guides provide initial hints to the user about navigation possibilities.
    const navigationalGuidesMarkup = `
        <div class="navigation-hint-overlay guide-left"></div>
        <div class="navigation-hint-overlay guide-up"></div>
        <div class="navigation-hint-overlay guide-right"></div>
        <div class="navigation-hint-overlay guide-down"></div>
        <div class="navigation-hint-overlay guide-center-focus"></div> <!-- An additional, central indicator -->
    `;

    // Insert these navigational hints at the very beginning of the document's body.
    $('body').prepend(navigationalGuidesMarkup);

    // --- Scheduled Removal of Guide Overlays ---
    const HINT_OVERLAY_DISPLAY_DELAY_MS = 4000;   // The duration before the fade-out animation begins.
    const HINT_OVERLAY_ANIMATION_DURATION_MS = 1200; // The length of the fade-out animation.

    // Set a timer to trigger the removal of the hint overlays after a specified delay.
    setTimeout(() => {
        const currentlyVisibleHints = $('.navigation-hint-overlay');
        // Only attempt to animate if there are hints present in the DOM.
        if (currentlyVisibleHints.length > 0) {
            // Smoothly animate the opacity of the hints to zero, then remove them from the DOM.
            currentlyVisibleHints.animate({ opacity: 0 }, HINT_OVERLAY_ANIMATION_DURATION_MS, function() {
                $(this).remove(); // Detach the element from the DOM once fully faded.
            });
        } else {
            console.info('No navigation hint overlays were found to be faded out and removed.');
        }
    }, HINT_OVERLAY_DISPLAY_DELAY_MS);

    // --- Specialized Interactive Gallery Plugin Engagement ---
    const primaryGalleryComponent = $('#main-interactive-gallery');

    // Confirm the existence of the target gallery element before attempting plugin initialization.
    if (primaryGalleryComponent.length > 0) {
        // Verify that the custom interactive slider plugin is loaded and accessible.
        // The original plugin 'slideToucher' is assumed to be renamed or aliased to 'customInteractiveSlider'.
        if (typeof $.fn.customInteractiveSlider === 'function') {
            primaryGalleryComponent.customInteractiveSlider({
                allowVerticalSwipe: true,    // Renamed option for vertical interaction.
                allowHorizontalDrag: true,   // Renamed option for horizontal interaction.
                animationTransitionSpeed: 500, // New hypothetical option: control animation speed.
                enableLooping: true,          // New hypothetical option: content loops at ends.
                preloadContent: true          // Another hypothetical option for content loading.
            });
        } else {
            console.error('Initialization Error: The "customInteractiveSlider" plugin is not defined or loaded. Interactive gallery functionality will be unavailable.');
        }
    } else {
        console.warn('Script Warning: Target element with ID "#main-interactive-gallery" was not found. Interactive gallery plugin initialization skipped.');
    }
});