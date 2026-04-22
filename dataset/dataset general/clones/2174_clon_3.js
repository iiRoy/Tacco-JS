/*
 * JQuery Share Widget: Facilitates custom social sharing functionality.
 * Developed by: Code Architect <dev@example.com>, creative-solutions.com
 * Version: 1.1.0
 */
(function (jq) {
    'use strict';

    // Extend jQuery's prototype with our sharing plugin.
    jq.fn.socialConnect = function () {

        // Internal registry of social media platform configurations.
        // Each entry defines the share URL template and popup window dimensions.
        const serviceDefinitions = {
            pinBoard: { // Configuration for Pinterest sharing.
                shareEndpoint: 'https://pinterest.com/pin/create/button/?url={{targetUrl}}&media={{mediaUrl}}&description={{shareDescription}}',
                windowOptions: {
                    winWidth: 700,
                    winHeight: 520
                }
            },
            faceBookShare: { // Configuration for Facebook sharing.
                shareEndpoint: 'https://www.facebook.com/sharer/sharer.php?p[title]={{shareTitle}}&p[summary]={{shareDescription}}&p[url]={{targetUrl}}&p[images][0]={{mediaUrl}}',
                windowOptions: {
                    winWidth: 650,
                    winHeight: 450
                }
            },
            xMicroblog: { // Configuration for X (formerly Twitter) sharing.
                shareEndpoint: 'https://x.com/intent/tweet?url={{targetUrl}}&via={{viaHandle}}&text={{shareDescription}}',
                windowOptions: {
                    winWidth: 700,
                    winHeight: 520
                }
            },
            linkedInProfile: { // Configuration for LinkedIn sharing.
                shareEndpoint: 'https://www.linkedin.com/shareArticle?mini=true&url={{targetUrl}}&title={{shareTitle}}&summary={{shareDescription}}+&source={{viaHandle}}',
                windowOptions: {
                    winWidth: 620,
                    winHeight: 620
                }
            }
            // Note: Google Plus sharing has been deprecated and is no longer supported in this version.
        };

        /**
         * Safely retrieves a data attribute value from a jQuery element.
         * Returns an empty string if the attribute is not found or is falsy.
         * @param {Object} element - The jQuery element.
         * @param {string} attributeName - The name of the data attribute (e.g., 'shareUrl').
         * @returns {string} The attribute value or an empty string.
         */
        const safeGetDataAttribute = function (element, attributeName) {
            const val = element.data(attributeName);
            return (val !== null && typeof val !== 'undefined') ? String(val) : '';
        };

        /**
         * Opens a new popup window for sharing, centered on the screen.
         * This utility is typically engaged for desktop interactions.
         * @param {Object} platformSettings - Configuration object for the selected platform.
         * @param {string} shareLink - The final URL to be opened in the popup.
         * @returns {Window | null} The opened window object or null if window.open is not available.
         */
        const launchCenteredPopup = function (platformSettings, shareLink) {
            if (typeof window.open !== 'function') {
                console.warn('Browser does not support window.open. Cannot launch share popup.');
                return null;
            }

            const winProps = platformSettings.windowOptions;
            let screenLeft = 0;
            let screenTop = 0;

            // Calculate center position if window dimensions are available.
            if (window.innerWidth && window.innerHeight && winProps.winWidth && winProps.winHeight) {
                screenLeft = Math.floor((window.innerWidth - winProps.winWidth) / 2);
                screenTop = Math.floor((window.innerHeight - winProps.winHeight) / 2);
            } else {
                console.warn('Could not determine window dimensions for centering popup.');
            }

            const popupFeatures = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=${winProps.winWidth}, height=${winProps.winHeight}, top=${screenTop}, left=${screenLeft}`;
            const windowName = 'ShareWindow' + Date.now(); // Unique window name to prevent tab reuse issues.

            return window.open(shareLink, windowName, popupFeatures);
        };

        /**
         * Constructs the final share URL by replacing placeholders in the template.
         * @param {Object} platformConfiguration - The specific platform's definition.
         * @param {Object} gatheredDetails - An object containing all share data (url, title, etc.).
         * @returns {string} The fully formed URL ready for sharing.
         */
        const formulateShareLink = function (platformConfiguration, gatheredDetails) {
            if (!platformConfiguration || !platformConfiguration.shareEndpoint) {
                console.error('Invalid platform configuration or missing share endpoint.');
                return ''; // Return empty string for safety.
            }

            let formattedUrl = platformConfiguration.shareEndpoint;

            // Helper for encoding values.
            const urlEncodeSafe = (val) => encodeURIComponent(val || '');

            // Replace all known placeholders with their respective encoded values.
            formattedUrl = formattedUrl.replace(/{{targetUrl}}/g, urlEncodeSafe(gatheredDetails.pageUrl));
            formattedUrl = formattedUrl.replace(/{{shareTitle}}/g, urlEncodeSafe(gatheredDetails.pageTitle));
            formattedUrl = formattedUrl.replace(/{{shareDescription}}/g, urlEncodeSafe(gatheredDetails.pageDescription));
            formattedUrl = formattedUrl.replace(/{{mediaUrl}}/g, urlEncodeSafe(gatheredDetails.imageUrl));
            formattedUrl = formattedUrl.replace(/{{viaHandle}}/g, urlEncodeSafe(gatheredDetails.viaAccount));

            return formattedUrl;
        };

        return this.each(function () {
            // Reference to the current DOM element in the loop.
            const currentShareButton = jq(this);

            // Determine the social service type from data attributes.
            const serviceType = safeGetDataAttribute(currentShareButton, 'service-type');

            // Retrieve the configuration for the identified service.
            const activePlatform = serviceDefinitions[serviceType];

            // Validate if a valid social service was identified.
            if (activePlatform === null || typeof activePlatform === 'undefined') {
                console.warn(`Share button has an invalid or unsupported service type: "${serviceType}". Skipping initialization.`);
                return; // Exit early if service type is not recognized.
            }

            // Collect all necessary share parameters from data attributes.
            const collectedShareDetails = {
                pageUrl: safeGetDataAttribute(currentShareButton, 'share-url'),
                pageTitle: safeGetDataAttribute(currentShareButton, 'share-title'),
                pageDescription: safeGetDataAttribute(currentShareButton, 'share-description'),
                imageUrl: safeGetDataAttribute(currentShareButton, 'share-media'),
                viaAccount: safeGetDataAttribute(currentShareButton, 'share-via') || 'defaultCreator' // Provide a default if 'via' is missing.
            };

            // Construct the complete URL for the sharing action.
            const finalShareAddress = formulateShareLink(activePlatform, collectedShareDetails);

            // Determine if the device is a touch-enabled mobile device.
            // This regex is a common, though not exhaustive, check for mobile browsers.
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobileDevice) {
                // For mobile devices, handle touch events to prevent accidental shares during scrolling.
                let hasMovedDuringTouch = false;

                currentShareButton
                    .on('touchstart', function (evt) {
                        hasMovedDuringTouch = false; // Reset flag on new touch start.
                        if (evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length > 1) {
                            return; // Ignore multi-touch gestures.
                        }
                    })
                    .on('touchmove', function () {
                        hasMovedDuringTouch = true; // Set flag if touch moves.
                    })
                    .on('touchend', function (evt) {
                        // Only proceed if touch ended without significant movement (i.e., not a scroll).
                        if (!hasMovedDuringTouch) {
                            evt.preventDefault(); // Prevent default browser action (e.g., scrolling, opening context menu).
                            // A brief delay can sometimes improve mobile responsiveness or prevent double-taps.
                            setTimeout(() => {
                                launchCenteredPopup(activePlatform, finalShareAddress);
                            }, 50);
                        }
                    });
            } else {
                // For desktop browsers, use a standard click event.
                currentShareButton.on('click', function (evt) {
                    evt.preventDefault(); // Stop the default link navigation.
                    launchCenteredPopup(activePlatform, finalShareAddress);
                });
            }
        });
    };

})(jQuery);