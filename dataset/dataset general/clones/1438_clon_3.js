(function () {
    'use strict';

    // --- Configuration Settings for Readability Analysis ---
    // The default acceptable range for characters per line in main content.
    const PREFERRED_MIN_CHARS = 63;
    const PREFERRED_MAX_CHARS = 81;

    // Common CSS selectors for identifying primary content areas on a webpage.
    const CONTENT_AREA_CANDIDATES = ['article', 'section', 'main', '.primary-content', '#main-article', '.page-body'];

    // Custom CSS to style the analysis panel that will be injected into the page.
    // This styling aims for a clean, non-intrusive overlay.
    const ANALYSIS_PANEL_CSS = `
        #readability-metrics-dashboard {
            z-index: 99999;
            position: fixed;
            top: 20px;
            right: 20px;
            width: 340px;
            padding: 18px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 13px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            line-height: 1.6;
            color: #333;
            max-height: 90vh;
            overflow-y: auto;
        }
        #readability-metrics-dashboard h3 {
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 16px;
            color: #1a73e8;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 8px;
            font-weight: 600;
        }
        #readability-metrics-dashboard p {
            margin: 7px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #readability-metrics-dashboard label {
            flex-basis: 60%;
            margin-right: 12px;
            font-weight: 500;
            color: #555;
        }
        #readability-metrics-dashboard input[type="text"],
        #readability-metrics-dashboard input[type="number"] {
            flex-basis: 40%;
            padding: 6px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 13px;
            font-family: inherit;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }
        #readability-metrics-dashboard input[type="text"]:focus,
        #readability-metrics-dashboard input[type="number"]:focus {
            border-color: #1a73e8;
            outline: none;
        }
        #readability-metrics-dashboard .data-output {
            font-weight: bold;
            color: #0056b3;
            background-color: #eef5ff;
            padding: 3px 8px;
            border-radius: 4px;
            min-width: 60px;
            text-align: right;
            border: 1px solid #d0e0f0;
        }
        #readability-metrics-dashboard .status-badge {
            font-weight: bold;
            padding: 6px 10px;
            border-radius: 5px;
            color: #fff;
            text-align: center;
            display: block;
            margin-top: 15px;
            font-size: 1.1em;
            letter-spacing: 0.5px;
        }
        #readability-metrics-dashboard .status-badge.suboptimal-narrow { background-color: #dc3545; } /* Red */
        #readability-metrics-dashboard .status-badge.suboptimal-wide { background-color: #ffc107; color: #343a40; } /* Amber */
        #readability-metrics-dashboard .status-badge.within-range { background-color: #28a745; } /* Green */
        #readability-metrics-dashboard .alert-message {
            color: #dc3545;
            font-size: 12px;
            margin-bottom: 12px;
            border: 1px solid #dc3545;
            background-color: #f8d7da;
            padding: 8px;
            border-radius: 4px;
            display: none; /* Hidden by default */
        }
        #readability-metrics-dashboard .horizontal-divider {
            border-bottom: 1px dashed #eee;
            margin: 12px 0;
        }
    `;

    // --- Module-level Variables (State Management) ---
    let activeContentElement = null; // The currently selected DOM element for analysis.
    let currentMinChars = PREFERRED_MIN_CHARS;
    let currentMaxChars = PREFERRED_MAX_CHARS;

    // Cached measurement values to avoid redundant DOM reads.
    let avgCharsPerLine = 0;
    let docRootFontSizePx = 16;
    let elemComputedFontSizePx = 16;
    let elemRenderedWidthPx = 0;
    let elemRenderedWidthEm = 0;
    let docViewportWidthPx = 0;
    let docViewportWidthEm = 0;

    // --- References to the UI elements ---
    let dashboardPanel = null;
    let contentSelectorInput = null;
    let minCharsInputControl = null;
    let maxCharsInputControl = null;
    let charsPerLineDisplaySpan = null;
    let docWidthEmDisplaySpan = null;
    let docWidthPxDisplaySpan = null;
    let baseFontDisplaySpan = null;
    let estimatedOptimalEmRangeSpan = null;
    let elemWidthEmDisplaySpan = null;
    let elemWidthPxDisplaySpan = null;
    let elemFontDisplaySpan = null;
    let readabilityStatusIndicator = null;
    let feedbackAlert = null;

    // --- Core Utility Functions ---

    /**
     * Dynamically injects a CSS string into the document's `<head>`.
     * @param {string} cssString - The CSS content to be injected.
     * @param {string} styleId - A unique ID for the `<style>` element.
     */
    const addStylesheetToHead = (cssString, styleId = 'readability-tool-styles') => {
        if (document.getElementById(styleId)) return; // Prevent duplicate injection
        const styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.textContent = cssString;
        document.head.appendChild(styleTag);
    };

    /**
     * Extracts a numeric pixel value from a CSS string (e.g., "16px").
     * Returns a fallback value if parsing fails or input is invalid.
     * @param {string} cssPxValue - The CSS pixel string.
     * @param {number} fallbackValue - Value to return on error.
     * @returns {number} The parsed pixel value.
     */
    const extractPxValue = (cssPxValue, fallbackValue = 0) => {
        const numericValue = parseFloat(cssPxValue);
        return isNaN(numericValue) ? fallbackValue : numericValue;
    };

    /**
     * Computes the font size of a given DOM element in pixels.
     * @param {HTMLElement} element - The target DOM element.
     * @returns {number} The font size in pixels, or a default of 16 if unreadable.
     */
    const getComputedElementFontSize = (element) => {
        if (!element || typeof window.getComputedStyle !== 'function') return 16;
        const style = window.getComputedStyle(element);
        return extractPxValue(style.fontSize, 16);
    };

    /**
     * Converts a pixel value to an equivalent 'em' value, based on a reference font size.
     * @param {number} pixels - The value in pixels.
     * @param {number} basePixels - The base font size in pixels (e.g., from document root).
     * @returns {number} The converted 'em' value, rounded to three decimal places.
     */
    const convertPixelsToEm = (pixels, basePixels) => {
        if (basePixels === 0) return 0; // Avoid division by zero
        return parseFloat((pixels / basePixels).toFixed(3));
    };

    /**
     * Calculates the average character count per line for the currently active content element.
     * This function involves temporary DOM manipulation to accurately measure lines.
     * It targets the first suitable text block (paragraph, list item, or non-inline div).
     * @returns {number} The calculated average characters per line, or 0 if no content.
     */
    const determineAverageCharsPerLine = () => {
        if (!activeContentElement) return 0;

        // Prioritize common text block elements for analysis.
        const firstTextBlock = activeContentElement.querySelector('p, li, div:not([style*="display: inline"]):not(.readability-tool-temp-wrapper)');
        if (!firstTextBlock || !firstTextBlock.textContent.trim()) {
            return 0; // No measurable text content found.
        }

        const originalHtml = firstTextBlock.innerHTML;
        const computedStyle = window.getComputedStyle(firstTextBlock);
        const lineHeight = extractPxValue(computedStyle.lineHeight, getComputedElementFontSize(firstTextBlock) * 1.2); // Fallback to 1.2x font-size
        const blockHeight = firstTextBlock.offsetHeight;

        // Basic validation for measurement integrity.
        if (blockHeight <= 0 || lineHeight <= 0) {
            return 0;
        }

        const approximateLineCount = Math.round(blockHeight / lineHeight);
        if (approximateLineCount <= 0) {
            return 0;
        }

        // Split text into words and wrap them for individual position tracking.
        const words = firstTextBlock.textContent.trim().split(/\s+/);
        if (words.length === 0) return 0;

        let temporaryHtml = '';
        words.forEach(word => {
            temporaryHtml += `<span class="readability-tool-word-span">${word}</span> `;
        });
        firstTextBlock.innerHTML = temporaryHtml; // Temporarily alter DOM

        let totalCharsSum = 0;
        let effectiveLinesMeasured = 0;
        let currentLineYPosition = -1;
        let charsOnCurrentLine = 0;

        const wordSpans = firstTextBlock.querySelectorAll('.readability-tool-word-span');

        for (let i = 0; i < wordSpans.length; i++) {
            const span = wordSpans[i];
            const spanTop = span.offsetTop;

            if (currentLineYPosition === -1) {
                // Initialize for the very first word.
                currentLineYPosition = spanTop;
            } else if (spanTop > currentLineYPosition) {
                // A new line has been detected. Record the previous line's count.
                if (charsOnCurrentLine > 0) { // Only count non-empty lines
                    totalCharsSum += charsOnCurrentLine;
                    effectiveLinesMeasured++;
                }
                charsOnCurrentLine = 0; // Reset for the new line
                currentLineYPosition = spanTop;
            }

            // Add word length and one for the space following it.
            charsOnCurrentLine += span.textContent.length + 1;
        }
        // Add characters from the very last line, if any.
        if (charsOnCurrentLine > 0) {
            totalCharsSum += charsOnCurrentLine;
            effectiveLinesMeasured++;
        }

        // Restore the original HTML content.
        firstTextBlock.innerHTML = originalHtml;

        // Calculate average, ensuring no division by zero.
        return effectiveLinesMeasured > 0 ? Math.floor(totalCharsSum / effectiveLinesMeasured) : 0;
    };

    /**
     * Retrieves the current width of the document's visible viewport in pixels.
     * @returns {number} Viewport width.
     */
    const getDocumentViewportWidthPx = () => {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    };

    /**
     * Generates an HTML string indicating the readability status (Too Narrow, Too Wide, In Range).
     * @returns {string} HTML span with appropriate styling and text.
     */
    const getReadabilityStatusHtml = () => {
        if (avgCharsPerLine === 0) {
            return `<span class="status-badge suboptimal-wide">NO TEXT CONTENT</span>`;
        } else if (avgCharsPerLine < currentMinChars) {
            return `<span class="status-badge suboptimal-narrow">TOO NARROW</span>`;
        } else if (avgCharsPerLine > currentMaxChars) {
            return `<span class="status-badge suboptimal-wide">TOO WIDE</span>`;
        } else {
            return `<span class="status-badge within-range">IN RANGE</span>`;
        }
    };

    /**
     * Estimates the ideal 'em' width range for the target element to fall within
     * the preferred character count per line.
     * @returns {string} Formatted string (e.g., "30em - 45em") or "N/A".
     */
    const calculateEstimatedOptimalEmRange = () => {
        if (avgCharsPerLine === 0 || elemRenderedWidthEm === 0) {
            return 'N/A';
        }
        const emPerCharacter = elemRenderedWidthEm / avgCharsPerLine;
        const estimatedMinEm = parseFloat((emPerCharacter * currentMinChars).toFixed(3));
        const estimatedMaxEm = parseFloat((emPerCharacter * currentMaxChars).toFixed(3));
        return `${estimatedMinEm}em - ${estimatedMaxEm}em`;
    };

    /**
     * --- Main UI Update Function ---
     * Recalculates all readability metrics and refreshes the dashboard panel.
     */
    const refreshDashboardMetrics = () => {
        if (!activeContentElement) {
            feedbackAlert.textContent = 'Please provide a valid CSS selector for the content element to analyze (e.g., article, #main-content).';
            feedbackAlert.style.display = 'block';
            // Reset all display values to N/A or default if no target.
            [charsPerLineDisplaySpan, docWidthEmDisplaySpan, docWidthPxDisplaySpan,
             baseFontDisplaySpan, estimatedOptimalEmRangeSpan, elemWidthEmDisplaySpan,
             elemWidthPxDisplaySpan, elemFontDisplaySpan].forEach(span => span.textContent = 'N/A');
            readabilityStatusIndicator.innerHTML = `<span class="status-badge suboptimal-wide">NO TARGET</span>`;
            return;
        } else {
            feedbackAlert.style.display = 'none'; // Hide any previous warnings
        }

        // 1. Gather fundamental document and element properties.
        docRootFontSizePx = getComputedElementFontSize(document.documentElement || document.body);
        elemComputedFontSizePx = getComputedElementFontSize(activeContentElement);
        docViewportWidthPx = getDocumentViewportWidthPx();

        // 2. Derive EM values from pixel measurements.
        docViewportWidthEm = convertPixelsToEm(docViewportWidthPx, docRootFontSizePx);
        elemRenderedWidthPx = extractPxValue(window.getComputedStyle(activeContentElement).width);
        elemRenderedWidthEm = convertPixelsToEm(elemRenderedWidthPx, elemComputedFontSizePx);

        // 3. Perform the core readability calculation.
        avgCharsPerLine = determineAverageCharsPerLine();

        // 4. Update all UI fields with the latest calculated data.
        minCharsInputControl.value = currentMinChars;
        maxCharsInputControl.value = currentMaxChars;
        charsPerLineDisplaySpan.textContent = avgCharsPerLine;
        docWidthEmDisplaySpan.textContent = `${docViewportWidthEm} em`;
        docWidthPxDisplaySpan.textContent = `${docViewportWidthPx} px`;
        baseFontDisplaySpan.textContent = `${docRootFontSizePx} px`;
        estimatedOptimalEmRangeSpan.textContent = calculateEstimatedOptimalEmRange();
        elemWidthEmDisplaySpan.textContent = `${elemRenderedWidthEm} em`;
        elemWidthPxDisplaySpan.textContent = `${elemRenderedWidthPx} px`;
        elemFontDisplaySpan.textContent = `${elemComputedFontSizePx} px`;
        readabilityStatusIndicator.innerHTML = getReadabilityStatusHtml();
    };

    /**
     * --- UI Setup and Event Handling ---
     * Builds the readability dashboard panel and attaches necessary event listeners.
     */
    const createAndMountDashboard = () => {
        // Inject the custom CSS for the dashboard.
        addStylesheetToHead(ANALYSIS_PANEL_CSS);

        // Construct the main dashboard panel HTML.
        dashboardPanel = document.createElement('div');
        dashboardPanel.id = 'readability-metrics-dashboard';
        dashboardPanel.innerHTML = `
            <h3>Page Readability Insights</h3>
            <div id="readability-alert-area" class="alert-message"></div>
            <p>
                <label for="content-selector-input">Target Content Selector:</label>
                <input type="text" id="content-selector-input" placeholder="e.g., article, #main-content">
            </p>
            <p>
                <label>Desired Chars/Line:</label>
                <input type="number" id="min-chars-control" min="1" value="${currentMinChars}" style="width: 60px;">
                -
                <input type="number" id="max-chars-control" min="1" value="${currentMaxChars}" style="width: 60px;">
            </p>
            <p>
                <label>Actual Chars/Line:</label>
                <span id="chars-per-line-output" class="data-output">N/A</span>
            </p>
            <div class="horizontal-divider"></div>
            <p>
                <label>Viewport Width (em):</label>
                <span id="viewport-width-em-output" class="data-output">N/A</span>
            </p>
            <p>
                <label>Viewport Width (px):</label>
                <span id="viewport-width-px-output" class="data-output">N/A</span>
            </p>
            <p>
                <label>Document Base Font Size:</label>
                <span id="base-font-size-output" class="data-output">N/A</span>
            </p>
            <div class="horizontal-divider"></div>
            <p>
                <label>Estimated Optimal Element Width (em):</label>
                <span id="optimal-em-range-output" class="data-output">N/A</span>
            </p>
            <p>
                <label>Target Element Width (em):</label>
                <span id="element-width-em-output" class="data-output">N/A</span>
            </p>
            <p>
                <label>Target Element Width (px):</label>
                <span id="element-width-px-output" class="data-output">N/A</span>
            </p>
            <p>
                <label>Target Element Font Size:</label>
                <span id="element-font-size-output" class="data-output">N/A</span>
            </p>
            <div class="horizontal-divider"></div>
            <p style="text-align: center;">
                <label style="font-size:1.2em; font-weight:bold; color:#222;">Overall Readability:</label>
                <span id="readability-assessment-status" class="status-badge"></span>
            </p>
        `;
        document.body.appendChild(dashboardPanel);

        // Cache references to all interactive and display elements.
        contentSelectorInput = document.getElementById('content-selector-input');
        minCharsInputControl = document.getElementById('min-chars-control');
        maxCharsInputControl = document.getElementById('max-chars-control');
        charsPerLineDisplaySpan = document.getElementById('chars-per-line-output');
        docWidthEmDisplaySpan = document.getElementById('viewport-width-em-output');
        docWidthPxDisplaySpan = document.getElementById('viewport-width-px-output');
        baseFontDisplaySpan = document.getElementById('base-font-size-output');
        estimatedOptimalEmRangeSpan = document.getElementById('optimal-em-range-output');
        elemWidthEmDisplaySpan = document.getElementById('element-width-em-output');
        elemWidthPxDisplaySpan = document.getElementById('element-width-px-output');
        elemFontDisplaySpan = document.getElementById('element-font-size-output');
        readabilityStatusIndicator = document.getElementById('readability-assessment-status');
        feedbackAlert = document.getElementById('readability-alert-area');

        // Attach event listeners for user interactions.
        contentSelectorInput.addEventListener('input', handleContentSelectorChange);
        minCharsInputControl.addEventListener('change', handleMinMaxCharRangeUpdate);
        maxCharsInputControl.addEventListener('change', handleMinMaxCharRangeUpdate);

        // Global listener for window resizing to keep metrics up-to-date.
        window.addEventListener('resize', refreshDashboardMetrics);
    };

    /**
     * Event handler for changes in the content target selector input field.
     * Validates the selector and updates the active content element.
     */
    const handleContentSelectorChange = () => {
        const selectorValue = contentSelectorInput.value.trim();
        if (selectorValue.length > 0) {
            const candidateElement = document.querySelector(selectorValue);
            // Ensure the selected element is not the body itself, as body width is distinct.
            if (candidateElement && candidateElement !== document.body) {
                activeContentElement = candidateElement;
                feedbackAlert.style.display = 'none';
            } else {
                activeContentElement = null;
                feedbackAlert.textContent = 'Invalid selector or targets the <body> tag. Please specify a valid content element.';
                feedbackAlert.style.display = 'block';
            }
        } else {
            activeContentElement = null;
            feedbackAlert.textContent = 'Enter a CSS selector (e.g., article, #my-content) to analyze.';
            feedbackAlert.style.display = 'block';
        }
        refreshDashboardMetrics(); // Recalculate and update UI.
    };

    /**
     * Event handler for changes to the minimum or maximum character range inputs.
     * Validates input and ensures min is not greater than max.
     */
    const handleMinMaxCharRangeUpdate = () => {
        let newMin = parseInt(minCharsInputControl.value, 10);
        let newMax = parseInt(maxCharsInputControl.value, 10);

        // Apply fallback defaults for invalid numerical inputs.
        if (isNaN(newMin) || newMin < 1) newMin = PREFERRED_MIN_CHARS;
        if (isNaN(newMax) || newMax < 1) newMax = PREFERRED_MAX_CHARS;

        // Automatically correct if minimum exceeds maximum.
        if (newMin > newMax) {
            [newMin, newMax] = [newMax, newMin]; // Swap values using destructuring.
            minCharsInputControl.value = newMin;
            maxCharsInputControl.value = newMax;
        }

        currentMinChars = newMin;
        currentMaxChars = newMax;
        refreshDashboardMetrics(); // Recalculate and update UI.
    };

    /**
     * Attempts to automatically identify an initial content element for analysis
     * by checking predefined common selectors.
     */
    const attemptAutoDetectContentElement = () => {
        for (const selector of CONTENT_AREA_CANDIDATES) {
            const foundElement = document.querySelector(selector);
            if (foundElement) {
                activeContentElement = foundElement;
                contentSelectorInput.value = selector; // Pre-fill the input field.
                return;
            }
        }
        // If no default content element is found, display a prompt.
        feedbackAlert.textContent = 'No primary content element detected automatically. Please manually enter a CSS selector.';
        feedbackAlert.style.display = 'block';
    };

    /**
     * --- Tool Initialization ---
     * The main entry point to start the readability analysis tool.
     * @param {number} [initialMin] - Optional override for default min characters per line.
     * @param {number} [initialMax] - Optional override for default max characters per line.
     */
    const initializeReadabilityAnalyzer = (initialMin, initialMax) => {
        // Set initial character range, prioritizing provided arguments.
        currentMinChars = typeof initialMin === 'number' && !isNaN(initialMin) ? initialMin : PREFERRED_MIN_CHARS;
        currentMaxChars = typeof initialMax === 'number' && !isNaN(initialMax) ? initialMax : PREFERRED_MAX_CHARS;

        // Ensure the DOM is fully loaded before attempting to create or access elements.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createAndMountDashboard();
                attemptAutoDetectContentElement();
                refreshDashboardMetrics();
            });
        } else {
            createAndMountDashboard();
            attemptAutoDetectContentElement();
            refreshDashboardMetrics();
        }
    };

    // Execute the initialization function when the script loads.
    initializeReadabilityAnalyzer();

})();