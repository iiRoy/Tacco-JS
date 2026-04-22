(function (jQuery, window, document, undefined) {

    // This script dynamically renders a privacy consent notification bar
    // at the top of the page if user consent for cookies is not yet recorded.
    // It is designed to be a lightweight, unobtrusive solution.
    //
    // Author: Advanced Code Replication System
    // Version: 2.0.1
    // License: Public Domain Equivalent

    'use strict';

    // --- Core Configuration Variables ---
    const USER_CONSENT_COOKIE_KEY = "website_privacy_ack";
    const ACKNOWLEDGED_STATE_VALUE = "granted";
    const CONSENT_DURATION_YEARS = 3; // Cookie validity period in years
    const BANNER_CONTAINER_ID = "site-privacy-banner";
    const BODY_CLASS_FOR_BANNER = "site-header-offset";
    const PRIVACY_POLICY_LINK_REL = "privacy-policy-document"; // Custom rel attribute for policy URL

    // --- Utility Function: Cookie Reader ---

    /**
     * Inspects the document's cookies to find a specific key.
     * @param {string} searchKey - The name of the cookie to locate.
     * @returns {string|null} The decoded value of the cookie if found, otherwise null.
     */
    function findCookieData(searchKey) {
        if (!searchKey || typeof searchKey !== 'string') {
            console.error("Cookie search key must be a non-empty string.");
            return null;
        }

        const cookieSegments = document.cookie.split(';');
        for (let segmentIndex = 0; segmentIndex < cookieSegments.length; segmentIndex++) {
            let currentSegment = cookieSegments[segmentIndex].trim(); // Remove leading/trailing whitespace
            // Check if this cookie segment begins with the desired key followed by '='
            if (currentSegment.indexOf(searchKey + '=') === 0) {
                return currentSegment.substring(searchKey.length + 1);
            }
        }
        return null; // Key not found in any cookie
    }

    /**
     * Establishes a new cookie with specified parameters.
     * @param {string} key - The cookie's identifier.
     * @param {string} val - The data to store in the cookie.
     * @param {number} yearsToLive - How many years until the cookie expires.
     * @param {string} pathScope - The URL path for which the cookie is valid. Defaults to root.
     */
    function establishCookie(key, val, yearsToLive, pathScope = '/') {
        if (!key || typeof key !== 'string' || !val || typeof val !== 'string') {
            console.error("Cannot set cookie: invalid key or value provided.");
            return;
        }
        if (typeof yearsToLive !== 'number' || yearsToLive <= 0) {
            console.warn("Invalid cookie expiration duration. Using default 1 year.");
            yearsToLive = 1;
        }

        const expirationTimestamp = new Date();
        expirationTimestamp.setTime(expirationTimestamp.getTime() + (yearsToLive * 365 * 24 * 60 * 60 * 1000));
        const expirationString = "expires=" + expirationTimestamp.toUTCString();
        document.cookie = `${key}=${val}; ${expirationString}; path=${pathScope}; SameSite=Lax; Secure`; // Enhanced security attributes
    }

    // --- Primary Execution Block: jQuery Ready ---

    // Ensure jQuery is available before attempting to use it.
    if (typeof jQuery === 'undefined') {
        console.error("jQuery library not detected. The privacy banner script requires jQuery to operate.");
        return;
    }

    jQuery(document).ready(function () {
        // Attempt to retrieve the privacy policy URL from a specific HTML link element.
        let policyDocumentHref = jQuery(`link[rel="${PRIVACY_POLICY_LINK_REL}"]`).attr("href");

        // If the policy URL is not found or is empty, log an issue and halt banner display.
        if (!policyDocumentHref || policyDocumentHref.trim() === '') {
            console.warn(`Critical: A link with rel="${PRIVACY_POLICY_LINK_REL}" and a valid href is required in the <head> for the privacy banner.`);
            return;
        }

        // Verify if the user has previously acknowledged the privacy terms.
        // If the consent cookie is present with the correct value, exit.
        if (findCookieData(USER_CONSENT_COOKIE_KEY) === ACKNOWLEDGED_STATE_VALUE) {
            return; // Consent already given, no banner needed.
        }

        // --- Prepare and Inject the Consent Banner ---

        // Determine the current top margin of the body and calculate the new margin
        // to accommodate the banner without content overlap.
        const currentBodyTopPadding = parseFloat(jQuery("body").css("margin-top")) || 0;
        const estimatedBannerHeight = 45; // Pixel height estimation for the banner
        const newBodyTopMargin = Math.round(currentBodyTopPadding + estimatedBannerHeight); // Round for cleaner CSS value

        // Construct the HTML content for the privacy notification bar.
        const bannerMarkup = `
            <div id="${BANNER_CONTAINER_ID}" role="alert" aria-live="polite" aria-label="Website Privacy Notification">
                <p>
                    This site uses cookies to ensure you get the best browsing experience. By continuing to use this website, you agree to our use of cookies.
                    For more details, please review our <a href="${policyDocumentHref}" target="_blank" rel="noopener noreferrer" title="View our privacy policy">Privacy Policy</a>.
                </p>
                <button type="button" class="dismiss-privacy-notice" aria-label="Close privacy notice">
                    Got it!
                </button>
            </div>
        `;

        // Assemble the inline CSS styles for the notification bar.
        const bannerStyles = `
            <style type="text/css">
                body.${BODY_CLASS_FOR_BANNER} {
                    margin-top: ${newBodyTopMargin}px !important;
                }
                #${BANNER_CONTAINER_ID} {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    min-height: ${estimatedBannerHeight - 10}px; /* Adjusted min-height */
                    background-color: #f8f8f8;
                    border-bottom: 1px solid #e0e0e0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    z-index: 2147483640; /* High z-index */
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 5px 20px;
                }
                #${BANNER_CONTAINER_ID} p {
                    margin: 0;
                    flex-grow: 1;
                    padding-right: 15px;
                    line-height: 1.4;
                }
                #${BANNER_CONTAINER_ID} p a {
                    color: #007bff;
                    text-decoration: underline;
                    font-weight: 500;
                }
                #${BANNER_CONTAINER_ID} .dismiss-privacy-notice {
                    background-color: #28a745; /* Green button */
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                    white-space: nowrap;
                    font-weight: bold;
                }
                #${BANNER_CONTAINER_ID} .dismiss-privacy-notice:hover {
                    background-color: #218838;
                    transform: translateY(-1px);
                }
                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    #${BANNER_CONTAINER_ID} {
                        flex-direction: column;
                        text-align: center;
                        padding: 10px 15px;
                    }
                    #${BANNER_CONTAINER_ID} p {
                        padding-right: 0;
                        margin-bottom: 10px;
                    }
                }
            </style>
        `;

        // Append the new styles to the document head and the banner HTML to the body.
        jQuery('head').append(bannerStyles);
        jQuery('body').prepend(bannerMarkup);
        jQuery('body').addClass(BODY_CLASS_FOR_BANNER);

        // Attach an event handler to the dismiss button within the banner.
        // Using event delegation on the document for robustness, especially if banner is loaded dynamically.
        jQuery(document).on('click', `#${BANNER_CONTAINER_ID} .dismiss-privacy-notice`, function() {
            // Set the consent cookie to prevent the banner from showing again.
            establishCookie(USER_CONSENT_COOKIE_KEY, ACKNOWLEDGED_STATE_VALUE, CONSENT_DURATION_YEARS);

            // Remove the body class that adds the top margin, returning layout to normal.
            jQuery('body').removeClass(BODY_CLASS_FOR_BANNER);

            // Remove the banner element entirely from the DOM.
            jQuery(`#${BANNER_CONTAINER_ID}`).fadeOut(300, function() {
                jQuery(this).remove();
                // Optionally, trigger a custom event for other scripts to respond to the dismissal.
                jQuery(document).trigger('privacyBannerDismissed');
            });
        });
    });

})(jQuery, window, document);