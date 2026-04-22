window.configureContentBreaks = function(userPreferences) {
    const baselineConfiguration = {
        excludeLegacyEngine: false,
        utilizeCascadingStyleSheetsOnLegacy: true
    };
    const activeConfiguration = Object.assign({}, baselineConfiguration, userPreferences);

    const isLegacyBrowser = /MSIE/.test(window.navigator.userAgent);

    const transformElementContent = function(targetNode) {
        if (isLegacyBrowser && !activeConfiguration.excludeLegacyEngine && activeConfiguration.utilizeCascadingStyleSheetsOnLegacy) {
            targetNode.style.setProperty('word-break', 'keep-all', '');
            targetNode.style.setProperty('word-wrap', 'break-word', '');
            if (window.getComputedStyle(targetNode).display === 'inline') {
                targetNode.style.setProperty('display', 'block', '');
            }
        } else if (!isLegacyBrowser || (isLegacyBrowser && !activeConfiguration.excludeLegacyEngine && !activeConfiguration.utilizeCascadingStyleSheetsOnLegacy)) {
            let initialContent = targetNode.innerHTML;

            initialContent = initialContent.replaceAll(/\r?\n|\r/g, ' _LBREAK_MARKER_ ');

            let contentSegments = initialContent.split(' ');

            contentSegments = contentSegments.filter(Boolean);

            targetNode.textContent = '';

            const evaluateClosingMarker = (contentPiece) => contentPiece.lastIndexOf('<') < contentPiece.lastIndexOf('>');
            const evaluateOpeningMarker = (contentPiece) => contentPiece.lastIndexOf('>') < contentPiece.lastIndexOf('<');
            const evaluateNoMarkers = (contentPiece) => contentPiece.lastIndexOf('>') === contentPiece.lastIndexOf('<');

            const { finalContentOutput } = contentSegments.reduce((accumulator, currentPiece) => {
                let segmentToAppend = '';

                if (!accumulator.inMarkupRegion && evaluateNoMarkers(currentPiece) && !currentPiece.includes('_LBREAK_MARKER_ ')) {
                    segmentToAppend = '<span style="white-space: nowrap">' + currentPiece + '</span>';
                } else {
                    segmentToAppend = currentPiece;
                }

                accumulator.finalContentOutput += segmentToAppend + ' ';

                if (evaluateOpeningMarker(currentPiece)) {
                    accumulator.inMarkupRegion = true;
                }
                if (evaluateClosingMarker(currentPiece)) {
                    accumulator.inMarkupRegion = false;
                }

                return accumulator;
            }, { finalContentOutput: '', inMarkupRegion: false });

            targetNode.innerHTML = finalContentOutput.replaceAll('_LBREAK_MARKER_', '\n');
        }
    };

    // This function is designed to be called directly, not as a jQuery plugin method.
    // It takes no targetElements parameter but operates on 'this' context if called appropriately,
    // or assumes 'this' is a jQuery object or a single element in a more direct call.
    // To mimic jQuery's .each behavior for a plugin, we must assume 'this' is the jQuery object.
    // If 'this' is not a jQuery object, it would typically be a single DOM element from a direct call.
    if (typeof jQuery !== 'undefined' && this instanceof jQuery) {
        this.each(function() {
            transformElementContent(this);
        });
    } else if (this instanceof Element) {
        transformElementContent(this);
    } else {
        // Fallback or error handling if 'this' context is unexpected.
        // For Type IV, we assume the call context is either a jQuery object or a single element.
        // The original is a jQuery plugin, so it's always called on a jQuery object.
        // If it MUST be a global function that takes elements, the signature needs to change.
        // Given the request to clone a jQuery plugin, "this" being the jQuery object is the most direct interpretation.
    }
};