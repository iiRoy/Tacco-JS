window.addEventListener("load", kickoffFeatureActivation, false);
window.addEventListener("DOMContentLoaded", kickoffFeatureActivation, false);

/**
 * Scans the current document for HTML5 video elements or their sources.
 * It also attempts to parse video content embedded within <noscript> tags.
 * @returns {string|null} The URL of the first found video source, or null if none is identified.
 */
function probeForMediaContentUrl() {
    const activeDoc = document;
    let contentUri = null;

    /**
     * Helper function to extract the source from a given media element or its children.
     * @param {HTMLElement} mediaElement - The video element to inspect.
     * @returns {string|null} The source URL or null.
     */
    const extractSourceFromElement = (mediaElement) => {
        if (!mediaElement) return null;
        if (mediaElement.src && mediaElement.src.trim() !== '') {
            return mediaElement.src;
        }
        const sourceElements = mediaElement.getElementsByTagName('source');
        if (sourceElements.length > 0 && sourceElements[0].src && sourceElements[0].src.trim() !== '') {
            return sourceElements[0].src;
        }
        return null;
    };

    const primaryVideoElements = activeDoc.getElementsByTagName('video');
    if (primaryVideoElements.length > 0) {
        contentUri = extractSourceFromElement(primaryVideoElements[0]);
        if (contentUri) {
            return contentUri;
        }
    }

    const hiddenScriptContainers = activeDoc.getElementsByTagName('noscript');
    if (hiddenScriptContainers.length > 0) {
        for (let idx = 0; idx < hiddenScriptContainers.length; idx++) {
            const currentNoScript = hiddenScriptContainers[idx];
            const temporaryParserDiv = activeDoc.createElement("div");
            let potentialHtmlContent = currentNoScript.innerHTML;

            if (currentNoScript.childNodes.length === 1 && currentNoScript.childNodes[0].nodeType === Node.TEXT_NODE) {
                potentialHtmlContent = currentNoScript.childNodes[0].nodeValue;
            }

            if (potentialHtmlContent) {
                temporaryParserDiv.innerHTML = potentialHtmlContent;
                const embeddedVideoElements = temporaryParserDiv.getElementsByTagName('video');
                if (embeddedVideoElements.length > 0) {
                    contentUri = extractSourceFromElement(embeddedVideoElements[0]);
                    if (contentUri) {
                        return contentUri;
                    }
                }
            }
        }
    }

    return null;
}

chrome.runtime.onMessage.addListener(
    function(msgPayload, msgOrigin, respondToCaller) {
        if (!msgPayload || typeof msgPayload.action !== 'string') {
            console.warn('Received invalid message payload from extension.');
            return false;
        }

        if (msgPayload.action === "RetrieveMediaLink") {
            console.debug('Incoming message: Request for media content URL initiated.');
            const detectedMediaUrl = probeForMediaContentUrl();
            respondToCaller({ mediaSource: detectedMediaUrl });
            return true;
        }
        return false;
    }
);

/**
 * Initializes the process of enabling site-specific playback enhancements.
 * It uses a polling mechanism to wait for the page to reach a suitable state.
 * @param {Event} [triggerEvent] - The event that triggered this activation (optional, not used internally).
 */
function kickoffFeatureActivation(triggerEvent) {
    let activationPollingInterval = null;
    let pollAttempts = 0;
    const maxPollAttempts = 50;
    const pollFrequencyMs = 150;

    /**
     * Periodically checks the current page's readiness for feature activation.
     * It looks for specific URL patterns or DOM elements to determine readiness.
     * This function is designed to be called repeatedly by `setInterval`.
     */
    const assessPageReadiness = () => {
        const currentDocumentUrl = document.URL;
        const isVimeoPage = /vimeo\.com/i.test(currentDocumentUrl);
        const targetElementsPresent = document.getElementsByClassName('target').length > 0;

        pollAttempts++;

        const pageIsReady = !isVimeoPage || targetElementsPresent;

        if (pageIsReady || pollAttempts >= maxPollAttempts) {
            clearInterval(activationPollingInterval);
            if (!pageIsReady) {
                console.warn('Playback enhancement activation timed out. Page did not reach ready state.');
                return;
            }
            console.debug('Page readiness confirmed. Proceeding with feature engagement.');
            engageSiteEnhancements();
        }

        /**
         * Applies specific enhancements based on the current page's URL and content.
         * This function contains the core logic for integrating with YouTube, HTML5 videos, and Vimeo.
         */
        function engageSiteEnhancements() {
            const currentUrl = document.URL;
            const sendIconSignal = () => {
                chrome.runtime.sendMessage({ action: "showOmniboxIcon" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to extension:", chrome.runtime.lastError.message);
                    } else {
                        console.log("Omnibox icon display signal sent.");
                    }
                });
            };

            // Evaluate the current URL against known patterns.
            if (/^(https?:\/\/)?(www\.)?(youtube\.com|m\.youtube\.com)\/watch\?(?=[^?]*v=[\w-]+)(?:[^\s?]+)?$/i.test(currentUrl)) {
                console.info('YouTube video page detected. Activating extension icon.');
                sendIconSignal();
            } else if (probeForMediaContentUrl()) {
                console.info('HTML5 video content detected. Activating extension icon.');
                sendIconSignal();
            } else if (/vimeo\.com/i.test(currentUrl)) {
                console.info('Vimeo page detected. Applying specific UI adjustments.');

                const applyStyleToElements = (selector, property, value, important = false) => {
                    const elements = document.getElementsByClassName(selector);
                    if (elements && elements.length > 0) {
                        for (const element of elements) {
                            element.style.setProperty(property, value, important ? 'important' : '');
                        }
                    } else {
                        console.debug(`No elements found for selector: ${selector}`);
                    }
                };

                applyStyleToElements('target', 'z-index', '-1');

                const videoElements = document.getElementsByClassName('video');
                if (videoElements && videoElements.length > 0) {
                    for (const vidEl of videoElements) {
                        vidEl.style.setProperty('z-index', '1000', 'important');
                        const currentClasses = Array.from(vidEl.classList);
                        if (currentClasses.includes('video')) {
                            vidEl.classList.remove('video');
                        }
                        vidEl.classList.add('video_unlocked_by_chromeplay');
                    }
                } else {
                    console.debug("No elements with class 'video' found on Vimeo page.");
                }

                const videoCoverElements = document.getElementsByClassName('video cover');
                if (videoCoverElements && videoCoverElements.length > 0) {
                    for (const coverEl of videoCoverElements) {
                        const currentClasses = Array.from(coverEl.classList);
                        if (currentClasses.includes('video')) {
                            coverEl.classList.remove('video');
                        }
                        coverEl.classList.add('video_unlocked_by_chromeplay');
                        if (!currentClasses.includes('cover')) {
                            coverEl.classList.add('cover');
                        }
                    }
                } else {
                    console.debug("No elements with class 'video cover' found on Vimeo page.");
                }

            } else {
                console.log('No specific media content or platform identified for enhancement.');
            }
        }
    };

    activationPollingInterval = setInterval(assessPageReadiness, pollFrequencyMs);
}