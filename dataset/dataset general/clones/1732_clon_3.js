/**
 * Document content integrity module for jQuery.
 * Version 2.1.0
 *
 * Copyright 2023, Alistair Vance (alistair.vance@example.com)
 * Licensed under the Apache 2.0 or MIT licenses.
 * http://www.apache.org/licenses/LICENSE-2.0
 * https://opensource.org/licenses/MIT
 *
 * Date: 2023-11-20
 */

(function($pluginHost) {

    // Define a unique marker for line breaks to avoid conflicts with actual content.
    const LINE_BREAK_TOKEN = '$$LBRK$$';
    const STYLE_NO_WRAP = 'white-space: nowrap';
    const PROP_WB = 'word-break';
    const VAL_KEEP_ALL = 'keep-all';
    const PROP_WW = 'word-wrap';
    const VAL_BREAK_WORD = 'break-word';

    /**
     * Helper to determine if a string segment appears to be part of an HTML tag.
     * This is a simplified check, assuming tags are well-formed enough for basic parsing.
     * @param {string} segmentText - The string segment to check.
     * @returns {object} An object indicating bracket presence.
     */
    const identifyBracketContext = (segmentText) => {
        const firstOpen = segmentText.indexOf('<');
        const firstClose = segmentText.indexOf('>');
        const lastOpen = segmentText.lastIndexOf('<');
        const lastClose = segmentText.lastIndexOf('>');

        return {
            hasAny: firstOpen !== -1 || firstClose !== -1,
            isClosingTagSegment: lastOpen < lastClose && lastClose !== -1, // e.g., `</div>` or `<span>...</span>`
            isOpeningTagSegment: lastOpen > lastClose && lastOpen !== -1, // e.g., `<p>` or `<a href=`
            isBalancedTagSegment: firstOpen !== -1 && firstClose !== -1 && lastOpen < lastClose && lastOpen === firstOpen && lastClose === firstClose, // e.g., `<br/>`
            isPureText: firstOpen === -1 && firstClose === -1
        };
    };

    /**
     * Default configuration for the module.
     * @type {object}
     */
    const moduleSettings = {
        disableLegacyBrowserProcessing: false, // If true, skips text processing for older browsers.
        useCSSForLegacyBrowsers: true // If true, attempts CSS for legacy browsers.
    };

    /**
     * Main plugin function to ensure word integrity.
     * @param {object} customConfiguration - User-provided settings to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $pluginHost.fn.preserveWordIntegrity = function(customConfiguration) {

        // Merge user settings with defaults using modern syntax.
        const currentOperationalConfig = { ...moduleSettings, ...customConfiguration };

        // Determine if the current browser is a legacy IE version.
        const isLegacyBrowser = /MSIE|Trident/.test(navigator.userAgent);

        let activeContentProcessor; // Function to be executed for each element.

        // Branching logic based on browser type and configuration.
        if (isLegacyBrowser && !currentOperationalConfig.disableLegacyBrowserProcessing && currentOperationalConfig.useCSSForLegacyBrowsers) {
            // Strategy for legacy browsers: Apply CSS rules directly.
            activeContentProcessor = function(targetEl) {
                // Validate the target element.
                if (!targetEl || !targetEl.nodeType) {
                    console.warn("Invalid element passed to CSS word preservation processor.", targetEl);
                    return;
                }
                const $target = $(targetEl);
                $target.css({
                    [PROP_WB]: VAL_KEEP_ALL,
                    [PROP_WW]: VAL_BREAK_WORD
                });
                // Ensure block-level display for word-break to function correctly on some elements.
                if ($target.css('display') === 'inline') {
                    $target.css('display', 'block');
                }
            };
        } else if (!isLegacyBrowser || (isLegacyBrowser && !currentOperationalConfig.disableLegacyBrowserProcessing && !currentOperationalConfig.useCSSForLegacyBrowsers)) {
            // Strategy for modern browsers or legacy browsers explicitly opting out of CSS.
            activeContentProcessor = function(targetEl) {
                // Validate the target element.
                if (!targetEl || !targetEl.nodeType) {
                    console.warn("Invalid element passed to content word preservation processor.", targetEl);
                    return;
                }
                const $target = $(targetEl);
                let initialHtmlContent = $target.html();

                // If content is empty, there's nothing to process.
                if (!initialHtmlContent || initialHtmlContent.trim().length === 0) {
                    return;
                }

                // Preserve line breaks before splitting by spaces.
                initialHtmlContent = initialHtmlContent.replace(/(\r\n|\n|\r)/g, ` ${LINE_BREAK_TOKEN} `);

                // Split the content by spaces. This might create empty strings.
                let contentPieces = initialHtmlContent.split(' ').filter(p => p.length > 0);

                let reconstructedContent = '';
                let withinHtmlTagContext = false; // Flag to track if we're currently inside an HTML tag.

                // Iterate through each segment to apply non-breaking spans.
                for (let k = 0; k < contentPieces.length; k++) {
                    const currentPiece = contentPieces[k];
                    const bracketInfo = identifyBracketContext(currentPiece);

                    // If we're not inside a tag context, it's pure text, and it's not a line break marker,
                    // wrap it to prevent breaks.
                    if (!withinHtmlTagContext && bracketInfo.isPureText && currentPiece.indexOf(LINE_BREAK_TOKEN) === -1) {
                        reconstructedContent += `<span style="${STYLE_NO_WRAP}">${currentPiece}</span> `;
                    } else {
                        // Otherwise, add the piece as is.
                        reconstructedContent += currentPiece + ' ';
                    }

                    // Update the tag context flag based on bracket presence.
                    if (bracketInfo.isOpeningTagSegment) {
                        withinHtmlTagContext = true;
                    }
                    if (bracketInfo.isClosingTagSegment) {
                        withinHtmlTagContext = false;
                    }
                }

                // Restore line breaks and update the element's HTML.
                $target.html(reconstructedContent.trim().replace(new RegExp(` ${LINE_BREAK_TOKEN} `, 'g'), '\n'));
            };
        } else {
            // Case where disableLegacyBrowserProcessing is true for a legacy browser.
            // Or some other unhandled configuration.
            activeContentProcessor = function(targetEl) {
                console.info("Word integrity processing skipped for element due to configuration or browser type.", targetEl);
            };
        }

        // Apply the chosen processor function to each selected element.
        return this.each(function() {
            activeContentProcessor(this);
        });
    };

})(jQuery);