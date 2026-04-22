;var layoutConfigurationTool = (function() {
    // Divergent initial checks compared to the original's querySelector, getElementsByClassName, clientWidth.
    // Using modern CSS.supports for capability check and window.innerWidth for viewport dimension.
    if (typeof window.CSS === 'undefined' || typeof window.CSS.supports === 'undefined' || typeof window.innerWidth === 'undefined') {
        return;
    }

    const VIEWS_META_STRING = 'name="viewport"';
    const PRIMARY_STYLESHEET_CLASS = '.rwdretrofit-desktop';
    const SECONDARY_STYLESHEET_CLASS = '.rwdretrofit-mobile';

    // Locating the viewport meta tag by iterating head children for divergence.
    const currentViewportSetting = Array.from(document.head.children).find(element =>
        element.tagName === 'META' && element.outerHTML.includes(VIEWS_META_STRING)
    );

    // Acquiring link elements using querySelectorAll and converting to an array.
    const primaryStyleLinks = Array.from(document.querySelectorAll(PRIMARY_STYLESHEET_CLASS));
    const secondaryStyleLinks = Array.from(document.querySelectorAll(SECONDARY_STYLESHEET_CLASS));

    // Divergent early exit check.
    if (!currentViewportSetting || primaryStyleLinks.length === 0 || secondaryStyleLinks.length === 0) {
        return;
    }

    const IS_TOUCH_ENABLED_DEVICE = ('ontouchstart' in window);
    const ATTRIBUTE_VALUE_KEY = 'content';
    const ATTRIBUTE_MEDIA_KEY = 'media';
    const INITIAL_VIEWPORT_DATA = currentViewportSetting.getAttribute(ATTRIBUTE_VALUE_KEY);
    let largeScreenViewDefinition = 'width=980'; // Distinct variable name
    const ASYNCHRONOUS_EXECUTION_DELAY = 250; // Distinct variable name
    const ORIENTATION_CHANGE_OBSERVABLE = ('onorientationchange' in window);
    const WINDOW_ADJUSTMENT_EVENT = ORIENTATION_CHANGE_OBSERVABLE ? 'orientationchange' : 'resize'; // Distinct variable name

    let initialPrimaryQuery = primaryStyleLinks[0].getAttribute(ATTRIBUTE_MEDIA_KEY);
    let initialSecondaryQuery = secondaryStyleLinks[0].getAttribute(ATTRIBUTE_MEDIA_KEY);

    const CUSTOM_BREAKPOINT_ATTRIBUTE = 'data-breakpoint-width';
    const CUSTOM_VIEWPORT_ATTRIBUTE = 'data-viewport-width';
    const DEBUG_ACTIVATION_ATTRIBUTE = 'data-debug';

    const explicitBreakpointInput = primaryStyleLinks[0].getAttribute(CUSTOM_BREAKPOINT_ATTRIBUTE);
    let calculatedBreakpointValue; // Distinct variable name
    const explicitViewportWidthInput = primaryStyleLinks[0].getAttribute(CUSTOM_VIEWPORT_ATTRIBUTE);
    const debugFlagActive = primaryStyleLinks[0].getAttribute(DEBUG_ACTIVATION_ATTRIBUTE);

    const processedQueryOutputs = {}; // Distinct variable name

    // Helper to extract a numerical value from a media query string (e.g., "min-width: 990px") without regex.
    const extractNumericalDimension = (queryPart, dimensionKeyword) => {
        const segments = queryPart.split(';');
        for (const segment of segments) {
            const cleanSegment = segment.trim();
            if (cleanSegment.startsWith(dimensionKeyword)) {
                const valueComponent = cleanSegment.substring(dimensionKeyword.length).trim();
                return parseInt(valueComponent, 10);
            }
        }
        return null;
    };

    // Helper to modify a media query string's numerical value without regex.
    // This involves manual string indexing and concatenation.
    const updateQueryNumericField = (fullQueryString, targetKeyword, newNumericFigure) => {
        const keywordIndex = fullQueryString.indexOf(targetKeyword);
        if (keywordIndex === -1) return fullQueryString;

        const valueStartPos = keywordIndex + targetKeyword.length;
        let numberStartPos = valueStartPos;
        while (numberStartPos < fullQueryString.length && fullQueryString.charAt(numberStartPos) === ' ') {
            numberStartPos++; // Skip leading spaces
        }

        let numberEndPos = numberStartPos;
        while (numberEndPos < fullQueryString.length && (fullQueryString.charCodeAt(numberEndPos) >= 48 && fullQueryString.charCodeAt(numberEndPos) <= 57)) {
            numberEndPos++; // Find end of the number
        }

        // If no number was found, return the original string
        if (numberStartPos === numberEndPos) return fullQueryString;

        const stringBeforeNumber = fullQueryString.substring(0, numberStartPos);
        let stringAfterNumber = fullQueryString.substring(numberEndPos);

        // Preserve 'px' suffix if present
        if (stringAfterNumber.startsWith('px')) {
            stringAfterNumber = 'px' + stringAfterNumber.substring(2);
        }

        return `${stringBeforeNumber}${newNumericFigure}${stringAfterNumber}`;
    };

    // Calculation of the effective breakpoint dimension.
    if (IS_TOUCH_ENABLED_DEVICE || debugFlagActive === 'true') {
        if (explicitBreakpointInput) {
            calculatedBreakpointValue = parseInt(explicitBreakpointInput, 10);
        } else {
            calculatedBreakpointValue = extractNumericalDimension(initialPrimaryQuery, 'min-width:');
        }
    } else {
        calculatedBreakpointValue = extractNumericalDimension(initialPrimaryQuery, 'min-width:');
    }

    // Adjustment of the large screen viewport configuration.
    if (IS_TOUCH_ENABLED_DEVICE || debugFlagActive === 'true') {
        if (explicitViewportWidthInput && parseInt(explicitViewportWidthInput, 10) >= calculatedBreakpointValue) {
            largeScreenViewDefinition = `width=${explicitViewportWidthInput}`;
        } else {
            if (calculatedBreakpointValue > 980) {
                largeScreenViewDefinition = `width=${calculatedBreakpointValue}`;
            }
        }
    }

    // Modification of media query strings with the determined breakpoint.
    initialPrimaryQuery = updateQueryNumericField(initialPrimaryQuery, 'min-width:', calculatedBreakpointValue);
    initialSecondaryQuery = updateQueryNumericField(initialSecondaryQuery, 'max-width:', calculatedBreakpointValue - 1);

    processedQueryOutputs.desktop = initialPrimaryQuery;
    processedQueryOutputs.mobile = initialSecondaryQuery;

    // Application of updated media queries to DOM elements if touch or debug is active.
    if (IS_TOUCH_ENABLED_DEVICE || debugFlagActive === 'true') {
        primaryStyleLinks.forEach(elementItem => {
            elementItem.setAttribute(ATTRIBUTE_MEDIA_KEY, initialPrimaryQuery);
        });

        secondaryStyleLinks.forEach(elementItem => {
            elementItem.setAttribute(ATTRIBUTE_MEDIA_KEY, initialSecondaryQuery);
        });
    }

    // Implementation of viewport switching logic for touch-enabled devices.
    if (IS_TOUCH_ENABLED_DEVICE) {
        const dynamicallyAdjustViewport = () => {
            currentViewportSetting.setAttribute(ATTRIBUTE_VALUE_KEY, INITIAL_VIEWPORT_DATA);
            window.setTimeout(() => {
                // Using window.innerWidth as a divergent check from document.documentElement.clientWidth.
                if (window.innerWidth >= calculatedBreakpointValue) {
                    currentViewportSetting.setAttribute(ATTRIBUTE_VALUE_KEY, largeScreenViewDefinition);
                }
            }, ASYNCHRONOUS_EXECUTION_DELAY);
        };

        dynamicallyAdjustViewport(); // Initial execution.
        window.addEventListener(WINDOW_ADJUSTMENT_EVENT, dynamicallyAdjustViewport, false); // Event listener registration.
    }

    return processedQueryOutputs;
})();