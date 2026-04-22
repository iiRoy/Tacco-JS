// This file details the core rendering and interaction logic for a specialized text editing component.

// --- BROWSER ENVIRONMENT DETECTION ---
// These flags are essential for handling various browser-specific quirks and performance optimizations.
// Feature detection is preferred, but sometimes direct browser sniffing is unavoidable for critical behaviors.

const _navigator = window.navigator || {};
const _document = window.document || {};

/**
 * Utility function to check if a regular expression matches the user agent string.
 * @param {RegExp} pattern - The regex pattern to test.
 * @returns {boolean} - True if the pattern matches, false otherwise.
 */
const _uaMatches = (pattern) => _navigator.userAgent && pattern.test(_navigator.userAgent);

/**
 * Utility function to check if a regular expression matches the platform string.
 * @param {RegExp} pattern - The regex pattern to test.
 * @returns {boolean} - True if the pattern matches, false otherwise.
 */
const _platformMatches = (pattern) => _navigator.platform && pattern.test(_navigator.platform);

// Core browser engine identification
const isGeckoEngine = _uaMatches(/gecko\/\d/i);
const isOldInternetExplorer = _uaMatches(/MSIE \d/); // Detects classic IE versions
const isWebkitBased = _uaMatches(/WebKit\//);
const isChromiumBased = _uaMatches(/Chrome\//); // More specific than WebKit
const isOperaBrowser = _uaMatches(/Opera\//);
const isKhtmlEngine = _uaMatches(/KHTML\//); // Older engine, less common now
const isPhantomJSRuntime = _uaMatches(/PhantomJS/); // Headless browser detection

// IE version specific checks (relying on document.documentMode for modern IE compatibility)
// isIEPre8: Checks for IE versions prior to IE8. Null `documentMode` implies Quirks Mode or IE7 compatibility.
const isIEPre8 = isOldInternetExplorer && (_document.documentMode === null || _document.documentMode < 8);
// isIEPre9: Checks for IE versions prior to IE9.
const isIEPre9 = isOldInternetExplorer && (_document.documentMode === null || _document.documentMode < 9);

// Specific WebKit derivations
const isQtWebkitVariant = isWebkitBased && _uaMatches(/Qt\/\d+\.\d+/);
const isSafariBrowser = _navigator.vendor && /Apple Computer/.test(_navigator.vendor); // Safari often identifies by vendor

// Operating System detection
const isMobileIOS = _uaMatches(/AppleWebKit/) && _uaMatches(/Mobile\/\w+/);
// Note: This mobile detection is rudimentary. For robust mobile detection, more sophisticated libraries are recommended.
const isAnyMobileDevice = isMobileIOS || _uaMatches(/Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i);
const isMacOS = isMobileIOS || _platformMatches(/Mac/);
const isWindowsOS = _platformMatches(/windows/i);

// Mac OS X version specifics for UI behavior adjustments
const isMacOSLionOrGreater = _uaMatches(/Mac OS X 1\d\D([7-9]|\d\d)\D/);
const isMacOSMountainLionOrGreater = _uaMatches(/Mac OS X 1\d\D([8-9]|\d\d)\D/);

// Opera version parsing
let currentOperaVersion = null;
if (isOperaBrowser) {
    const versionMatch = _navigator.userAgent.match(/Version\/(\d*\.\d*)/);
    if (versionMatch && versionMatch[1]) {
        currentOperaVersion = parseFloat(versionMatch[1]);
    }
}

// Special handling for Command/Ctrl key mapping on macOS
// Some older browsers/engines on Mac use incorrect event properties for cmd/ctrl.
const shouldFlipCtrlCmd = isMacOS && (isQtWebkitVariant || (isOperaBrowser && (currentOperaVersion === null || currentOperaVersion < 12.11)));

// Optimization flags for rendering engine. These are set dynamically based on document content.
let hasObservedReadOnlySpans = false; // Indicates if read-only text regions have been encountered.
let hasObservedCollapsedSpans = false; // Indicates if collapsed (hidden) text regions have been encountered.


// --- EDITOR CORE CONSTRUCTOR ---

/**
 * Initializes a new instance of the TextEditorCore.
 * This function serves as the primary entry point for creating an editor.
 * @param {HTMLElement|Function} targetElement - The DOM element to attach the editor to, or a function to call with the editor's wrapper element.
 * @param {Object} editorConfig - Configuration options for the editor instance.
 * @returns {TextEditorCore} The initialized editor instance.
 */
function TextEditorCore(targetElement, editorConfig) {
    // Ensure 'new' keyword is used. If not, instantiate and return.
    if (!(this instanceof TextEditorCore)) {
        return new TextEditorCore(targetElement, editorConfig);
    }

    // Merge provided options with default settings.
    this._settings = editorConfig || {};
    // Assuming 'defaultEditorSettings' is an external object containing default values.
    // For each default option, if not explicitly provided in editorConfig, use the default.
    for (const optionKey in defaultEditorSettings) {
        if (!this._settings.hasOwnProperty(optionKey) && defaultEditorSettings.hasOwnProperty(optionKey)) {
            this._settings[optionKey] = defaultEditorSettings[optionKey];
        }
    }
    // Normalize gutter configurations based on line numbering setting.
    normalizeGutterConfiguration(this._settings);

    // Determine the starting line index for the document, if provided as an object.
    const initialDocumentLineIndex = typeof this._settings.value === "string" ? 0 : this._settings.value.first;
    // Create and manage the DOM elements for the editor's display.
    const displayComponents = this.viewPortManager = initializeRenderingSurface(targetElement, initialDocumentLineIndex);
    displayComponents.editorRootContainer.editorInstanceRef = this; // Establish a back-reference.

    // Update the visual representation of gutters.
    refreshGutterLayout(this);
    // If autofocus is enabled and it's not a mobile device, attempt to focus the input immediately.
    if (this._settings.autofocus && !isAnyMobileDevice) {
        activateInputArea(this);
    }

    // Initialize the internal state object for the editor.
    this.editorState = {
        keyBindingMaps: [],         // Active keymap configurations.
        visualOverlays: [],         // List of active text overlays.
        modeRevisionCounter: 0,     // Counter for syntax mode changes.
        isOverwriteMode: false,     // Flag for overwrite input mode.
        isFocused: false,           // Tracks if the editor has focus.
        isEditSuppressed: false,    // Temporarily disable edits.
        isPasteIncoming: false,     // Flag for tracking paste operations.
        isTextDragging: false,      // Flag for active text drag operations.
        syntaxHighlightDelay: new DelayedOperation() // Manages delayed syntax highlighting.
    };

    this.operationCounter = 0; // Unique ID counter for editor operations.
    applyVisualTheme(this); // Apply the configured theme styles.
    // Apply line wrapping class if enabled.
    if (this._settings.lineWrappingEnabled) {
        displayComponents.editorRootContainer.classList.add("EditorComponent-wrap");
    }

    // Initialize the document model. If a string, create a new document.
    let documentModel = this._settings.value;
    if (typeof documentModel === "string") {
        documentModel = new DocumentModel(this._settings.value, this._settings.syntaxMode);
    }
    // Attach the document model to the editor within an atomic operation.
    executeAtomicOperation(this, linkDocumentModel)(this, documentModel);

    // Workaround for IE's magic textarea content restoration on reload.
    if (isOldInternetExplorer) {
        // Delay resetting the input to ensure IE's default behavior doesn't interfere.
        setTimeout(() => resetInputContent(this, true), 25);
    }

    // Attach all necessary DOM event listeners.
    attachDomListeners(this);

    // Determine initial focus state.
    let editorHasFocus = false;
    try {
        // Check if the hidden input element is currently the active DOM element.
        editorHasFocus = (_document.activeElement === displayComponents.hiddenInputArea);
    } catch (error) {
        // IE can throw errors when accessing activeElement in certain contexts before document is fully loaded.
        console.warn("Could not determine active element due to browser error:", error);
    }

    // If already focused or autofocus is requested, schedule a focus event.
    if (editorHasFocus || (this._settings.autofocus && !isAnyMobileDevice)) {
        setTimeout(() => handleFocusEvent(this), 30);
    } else {
        handleBlurEvent(this); // Otherwise, ensure blur state is correctly set.
    }

    // Apply all configured option handlers and initialization hooks.
    executeAtomicOperation(this, () => {
        // Iterate through registered option handlers and apply them.
        for (const optKey in optionHandlers) {
            if (Object.prototype.hasOwnProperty.call(optionHandlers, optKey)) {
                // Assuming 'InitFlag' is a constant indicating initial setup.
                optionHandlers[optKey](this, this._settings[optKey], InitFlag);
            }
        }
        // Execute any registered initialization hooks.
        initializationHooks.forEach(hookFn => hookFn(this));
    })(); // Immediately invoke the operation.
}


// --- DISPLAY COMPONENT INITIALIZATION ---

/**
 * Creates and organizes the necessary DOM elements for the editor's display.
 * @param {HTMLElement|Function} containerTarget - The DOM element where the editor will be placed, or a function.
 * @param {number} initialLineIdx - The starting line index for the document view.
 * @returns {Object} An object containing references to the created DOM elements and display state.
 */
function initializeRenderingSurface(containerTarget, initialLineIdx) {
    const displayContext = {}; // Object to hold all display-related DOM elements and state.

    // Helper for creating DOM elements with optional content, class, and style.
    const createDomElement = (tagName, childrenOrText, className, inlineStyle) => {
        const elem = _document.createElement(tagName);
        if (className) elem.className = className;
        if (inlineStyle) elem.style.cssText = inlineStyle;

        if (Array.isArray(childrenOrText)) {
            childrenOrText.forEach(child => elem.appendChild(child));
        } else if (childrenOrText !== null && childrenOrText !== undefined) {
            elem.appendChild(_document.createTextNode(childrenOrText));
        }
        return elem;
    };

    // --- Input Element Setup ---
    // A hidden textarea is used for capturing keyboard input.
    displayContext.hiddenInputArea = createDomElement("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none;");
    // Webkit specific width adjustment for input.
    if (isWebkitBased) displayContext.hiddenInputArea.style.width = "1000px";
    else displayContext.hiddenInputArea.setAttribute("wrap", "off"); // Disable word wrap for consistent input.
    displayContext.hiddenInputArea.setAttribute("autocorrect", "off");
    displayContext.hiddenInputArea.setAttribute("autocapitalize", "off");

    // Wrapper for the hidden input, used to control its visibility and position.
    displayContext.inputWrapper = createDomElement("div", [displayContext.hiddenInputArea], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");

    // --- Scrollbar Elements ---
    // Fake horizontal scrollbar with an inner div to control width.
    displayContext.horzScrollbar = createDomElement("div", [createDomElement("div", null, null, "height: 1px")], "EditorComponent-hscrollbar");
    // Fake vertical scrollbar with an inner div to control height.
    displayContext.vertScrollbar = createDomElement("div", [createDomElement("div", null, null, "width: 1px")], "EditorComponent-vscrollbar");
    // Filler element for the corner where scrollbars meet.
    displayContext.scrollCornerBlock = createDomElement("div", null, "EditorComponent-scrollbar-filler");

    // --- Content Display Elements ---
    displayContext.contentLinesContainer = createDomElement("div"); // Container for all line elements.
    // Overlay for displaying text selections.
    displayContext.selectionOverlayArea = createDomElement("div", null, null, "position: relative; z-index: 1");
    // Main blinking text cursor element.
    displayContext.mainCursorElement = createDomElement("div", "\u00a0", "EditorComponent-cursor");
    // Secondary cursor, used for bi-directional text or multiple selections.
    displayContext.secondaryCursorElement = createDomElement("div", "\u00a0", "EditorComponent-cursor EditorComponent-secondarycursor");
    // Element used to accurately measure text dimensions.
    displayContext.textMeasureElement = createDomElement("div", null, "EditorComponent-measure");

    // Wrapper for all elements that need to be vertically aligned and padded.
    displayContext.lineViewportWrapper = createDomElement("div", [
        displayContext.textMeasureElement,
        displayContext.selectionOverlayArea,
        displayContext.contentLinesContainer,
        displayContext.mainCursorElement,
        displayContext.secondaryCursorElement
    ], null, "position: relative; outline: none");

    // This element is moved around to bring the visible part of the document into view.
    displayContext.contentMover = createDomElement("div", [createDomElement("div", [displayContext.lineViewportWrapper], "EditorComponent-lines")], null, "position: relative");
    // This element's height is set to the total text height, driving the scroller's scrollHeight.
    displayContext.contentSizer = createDomElement("div", [displayContext.contentMover], "EditorComponent-sizer");
    // A small element to force minimum height, preventing display issues with zero-height content.
    // 'SCROLLER_CUTOFF_HEIGHT_PX' is assumed to be an external constant, e.g., 30px.
    displayContext.minHeightEnforcer = createDomElement("div", "\u00a0", null, `position: absolute; height: ${SCROLLER_CUTOFF_HEIGHT_PX}px`);

    // Container for line number gutters and other gutter elements.
    displayContext.gutterPanel = createDomElement("div", null, "EditorComponent-gutters");
    displayContext.lineNumberGutter = null; // Reference to the line number specific gutter.

    // Inner scroller content combining sizer, height enforcer, and gutters.
    const internalScrollerContent = createDomElement("div", [displayContext.contentSizer, displayContext.minHeightEnforcer, displayContext.gutterPanel], null, "position: relative; min-height: 100%");
    // The main scrollable area.
    displayContext.mainScroller = createDomElement("div", [internalScrollerContent], "EditorComponent-scroll");
    displayContext.mainScroller.setAttribute("tabIndex", "-1"); // Make it focusable for scrolling.

    // The root wrapper element for the entire editor component.
    displayContext.editorRootContainer = createDomElement("div", [
        displayContext.inputWrapper,
        displayContext.horzScrollbar,
        displayContext.vertScrollbar,
        displayContext.scrollCornerBlock,
        displayContext.mainScroller
    ], "EditorComponent");

    // Append the editor to the target element.
    if (containerTarget && containerTarget.appendChild) {
        containerTarget.appendChild(displayContext.editorRootContainer);
    } else if (typeof containerTarget === "function") {
        containerTarget(displayContext.editorRootContainer);
    } else {
        console.error("Invalid target element provided for TextEditorCore initialization.", containerTarget);
        return null; // Indicate failure
    }

    // --- Browser-specific CSS adjustments ---
    // Hide the large blue blinking cursor on Mobile Safari.
    if (isMobileIOS) displayContext.hiddenInputArea.style.width = "0px";
    // Enable dragging for non-Webkit browsers (Webkit handles it differently).
    if (!isWebkitBased) displayContext.mainScroller.draggable = true;
    // KHTML specific fix for Tab key handling.
    if (isKhtmlEngine) {
        displayContext.inputWrapper.style.height = "1px";
        displayContext.inputWrapper.style.position = "absolute";
    }
    // IE7 z-index bug workaround: Gutters should be behind scroller content.
    if (isIEPre8) {
        displayContext.gutterPanel.style.zIndex = -1;
        displayContext.mainScroller.style.paddingRight = "0"; // Prevent double padding issues.
        // IE7 scrollbar minimum width.
        displayContext.horzScrollbar.style.minWidth = displayContext.vertScrollbar.style.minWidth = "18px";
    }

    // --- Initialize Display State Variables ---
    displayContext.verticalScrollOffset = 0; // Current vertical scroll position offset.
    displayContext.lastClientHeight = 0;     // Stores last known client height for resize detection.
    displayContext.visibleStartLine = initialLineIdx; // Index of the first visible line.
    displayContext.visibleEndLine = initialLineIdx;   // Index of the last visible line.

    // Line number column sizing cache.
    displayContext.lineNumberColumnWidth = null;
    displayContext.lineNumberTextWidth = null;
    displayContext.lineNumberDigitCount = null;

    displayContext.lastKnownInputContent = "";    // Stores the previous content of the hidden input.
    displayContext.needsWidgetAlignment = false;  // Flag to trigger widget re-alignment.
    displayContext.isPollingInputFast = false;    // Indicates intensive input polling is active.
    displayContext.inputPollTimer = new DelayedOperation(); // Timer for input polling.
    displayContext.isTextDragging = false;        // Flag for active text dragging state.

    // Cached text metrics for performance.
    displayContext.charWidthCache = null;
    displayContext.lineHeightCache = null;
    displayContext.lineMetricsCache = [];
    displayContext.lineMetricsCacheIndex = 0;

    displayContext.selectionTruncated = false;    // Flag if selection in input is inaccurate/truncated.

    // Metrics for horizontal scrolling.
    displayContext.longestContentLine = null;
    displayContext.longestLineLength = 0;
    displayContext.longestLineRecalculated = false;

    // Variables for tracking wheel scroll granularity.
    displayContext.scrollDeltaX = displayContext.scrollDeltaY = null;
    displayContext.scrollInitialX = displayContext.scrollInitialY = null;
    
    return displayContext;
}


// --- EDITOR STATE UPDATE FUNCTIONS ---

/**
 * Applies a new syntax highlighting mode to the document.
 * This invalidates existing styling and triggers a re-parse.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function applySyntaxMode(editorInstance) {
    const documentModel = editorInstance.documentModel;
    // Retrieve the mode definition using an external mode registry.
    documentModel.activeMode = SyntaxHighlighterRegistry.getMode(editorInstance._settings, documentModel.modeConfiguration);

    // Invalidate all existing line states and styles to force re-highlighting.
    documentModel.forEachLine(line => {
        line.stateAfter = null; // Clear cached state for incremental parsing.
        line.styles = null;     // Clear cached styles.
    });
    documentModel.parseFrontier = documentModel.firstLineIndex; // Reset parsing frontier.

    initSyntaxWorker(editorInstance, 100); // Start or restart the background syntax worker.
    editorInstance.editorState.modeRevisionCounter++; // Increment mode revision counter.

    // If an operation is active, schedule a full re-render.
    if (editorInstance.currentOperation) {
        scheduleRenderUpdate(editorInstance);
    }
}

/**
 * Handles changes to the line wrapping setting.
 * Adjusts CSS classes and recomputes line dimensions.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function updateWordWrapSetting(editorInstance) {
    const displayContext = editorInstance.viewPortManager;
    if (editorInstance._settings.lineWrappingEnabled) {
        displayContext.editorRootContainer.classList.add("EditorComponent-wrap");
        displayContext.contentSizer.style.minWidth = ""; // Remove fixed min-width for wrapping.
    } else {
        displayContext.editorRootContainer.classList.remove("EditorComponent-wrap");
        determineMaxLineMetrics(editorInstance); // Recalculate longest line for horizontal scrolling.
    }
    recalculateAllLineHeights(editorInstance); // Re-estimate all line heights.
    scheduleRenderUpdate(editorInstance);      // Request a re-render.
    clearCachedMetrics(editorInstance);        // Clear cached character/line dimensions.
    // Defer scrollbar update to allow DOM reflow.
    setTimeout(() => {
        adjustScrollbarVisibility(displayContext, editorInstance.documentModel.totalHeight);
    }, 100);
}

/**
 * Provides a function to estimate the visual height of a line.
 * Accounts for line wrapping if enabled.
 * @param {TextEditorCore} editorInstance - The editor instance.
 * @returns {Function} A function that takes a line object and returns its estimated height.
 */
function determineLineHeightEstimator(editorInstance) {
    const lineHeightPx = getLineHeight(editorInstance.viewPortManager);
    const isWrappingActive = editorInstance._settings.lineWrappingEnabled;
    const charWidthPx = getCharWidth(editorInstance.viewPortManager);
    // Calculate approximate characters per line before wrapping, with a safety margin.
    const effectiveCharsPerWrapLine = isWrappingActive ? Math.max(5, editorInstance.viewPortManager.mainScroller.clientWidth / charWidthPx - 3) : Infinity;

    return function(lineObject) {
        if (isLineCollapsed(lineObject)) {
            return 0; // Collapsed lines have no visual height.
        } else if (isWrappingActive) {
            // Estimate height based on wrapped lines. Minimum 1 line.
            return (Math.ceil(lineObject.text.length / effectiveCharsPerWrapLine) || 1) * lineHeightPx;
        } else {
            return lineHeightPx; // Single line height.
        }
    };
}

/**
 * Recalculates the estimated height for all lines in the document.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function recalculateAllLineHeights(editorInstance) {
    const documentModel = editorInstance.documentModel;
    const heightEstimator = determineLineHeightEstimator(editorInstance);

    documentModel.forEachLine(line => {
        const estimatedHeight = heightEstimator(line);
        if (estimatedHeight !== line.visualHeight) {
            setLineVisualHeight(line, estimatedHeight); // Update line height if changed.
        }
    });
}

/**
 * Updates the editor's wrapper class based on the active keymap style.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function refreshKeymapStyles(editorInstance) {
    const displayElement = editorInstance.viewPortManager.editorRootContainer;
    // Assuming 'keybindingConfigurations' is an external object.
    const keymapStyle = keybindingConfigurations[editorInstance._settings.activeKeymap]?.style;

    // Remove any existing keymap style classes.
    displayElement.className = displayElement.className.replace(/\s*cm-keymap-\S+/g, "");
    // Add the new keymap style class if it exists.
    if (keymapStyle) {
        displayElement.classList.add(`cm-keymap-${keymapStyle}`);
    }
}

/**
 * Applies the configured visual theme to the editor.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function applyVisualTheme(editorInstance) {
    const displayWrapper = editorInstance.viewPortManager.editorRootContainer;
    // Remove all theme-related classes.
    displayWrapper.className = displayWrapper.className.replace(/\s*cm-s-\S+/g, "");
    // Add new theme classes, replacing spaces with " cm-s-".
    const themeClasses = editorInstance._settings.themeName.split(/\s+/).filter(Boolean).map(t => `cm-s-${t}`).join(" ");
    if (themeClasses) {
        displayWrapper.classList.add(...themeClasses.split(" "));
    }
    clearCachedMetrics(editorInstance); // Theme changes might affect text metrics.
}

/**
 * Reacts to changes in gutter configuration by rebuilding the gutter elements.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function handleGutterConfigChange(editorInstance) {
    rebuildGutterElements(editorInstance);
    scheduleRenderUpdate(editorInstance);
}

/**
 * Reconstructs the gutter elements based on the editor's configuration.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function rebuildGutterElements(editorInstance) {
    const displayContext = editorInstance.viewPortManager;
    const gutterContainer = displayContext.gutterPanel;
    const gutterSpecifications = editorInstance._settings.gutterLayout;

    clearDomChildren(gutterContainer); // Remove all existing gutter elements.
    displayContext.lineNumberGutter = null; // Reset line number gutter reference.

    if (!gutterSpecifications || gutterSpecifications.length === 0) {
        gutterContainer.style.display = "none"; // Hide gutters if no specs.
        return;
    }

    for (const spec of gutterSpecifications) {
        const gutterElement = createDomElement("div", null, `EditorComponent-gutter ${spec}`);
        gutterContainer.appendChild(gutterElement);

        if (spec === "EditorComponent-linenumbers") {
            displayContext.lineNumberGutter = gutterElement;
            // Set initial width, will be updated by evaluateLineNumberColumnSize.
            gutterElement.style.width = (displayContext.lineNumberColumnWidth || 1) + "px";
        }
    }
    gutterContainer.style.display = ""; // Ensure gutters are visible.
}

/**
 * Calculates the effective display length of a line, accounting for collapsed spans.
 * @param {DocumentModel} docModel - The document model.
 * @param {LineObject} lineObj - The line object to measure.
 * @returns {number} The effective character length.
 */
function getEffectiveLineLength(docModel, lineObj) {
    if (lineObj.visualHeight === 0) return 0; // Collapsed line has no length.

    let currentLength = lineObj.text.length;
    let currentLine = lineObj;
    let collapsedSpan;

    // Account for collapsed spans at the beginning of the line.
    while ((collapsedSpan = findCollapsedStartSpan(currentLine))) {
        const spanInfo = collapsedSpan.getRange();
        currentLine = retrieveLineByNumber(docModel, spanInfo.from.line);
        currentLength += spanInfo.from.charIndex - spanInfo.to.charIndex;
    }

    currentLine = lineObj; // Reset to original line.
    // Account for collapsed spans at the end of the line.
    while ((collapsedSpan = findCollapsedEndSpan(currentLine))) {
        const spanInfo = collapsedSpan.getRange();
        currentLength -= currentLine.text.length - spanInfo.from.charIndex;
        currentLine = retrieveLineByNumber(docModel, spanInfo.to.line);
        currentLength += currentLine.text.length - spanInfo.to.charIndex;
    }
    return currentLength;
}

/**
 * Determines the line with the maximum effective length in the document
 * to correctly size the horizontal scrollbar.
 * @param {TextEditorCore} editorInstance - The editor instance.
 */
function determineMaxLineMetrics(editorInstance) {
    const display = editorInstance.viewPortManager;
    const doc = editorInstance.documentModel;

    // Initialize with the first line.
    display.longestContentLine = retrieveLineByNumber(doc, doc.firstLineIndex);
    display.longestLineLength = getEffectiveLineLength(doc, display.longestContentLine);
    display.longestLineRecalculated = true; // Mark that max line has been recomputed.

    doc.forEachLine(line => {
        const len = getEffectiveLineLength(doc, line);
        if (len > display.longestLineLength) {
            display.longestLineLength = len;
            display.longestContentLine = line;
        }
    });
}

/**
 * Ensures that the "EditorComponent-linenumbers" gutter is present in the gutter configuration
 * if the `lineNumbersEnabled` option is true, and removed otherwise.
 * @param {Object} configOptions - The editor's configuration options.
 */
function normalizeGutterConfiguration(configOptions) {
    let lineNumberGutterFound = false;
    const lineNumberGutterClass = "EditorComponent-linenumbers";
    
    // Create a mutable copy of the gutters array if it's not already one.
    const currentGutters = Array.isArray(configOptions.gutterLayout) ? [...configOptions.gutterLayout] : [];

    for (let i = 0; i < currentGutters.length; ++i) {
        if (currentGutters[i] === lineNumberGutterClass) {
            if (configOptions.lineNumbersEnabled) {
                lineNumberGutterFound = true;
            } else {
                currentGutters.splice(i--, 1); // Remove if line numbers are disabled.
            }
        }
    }
    // If line numbers are enabled but the gutter class isn't found, add it.
    if (!lineNumberGutterFound && configOptions.lineNumbersEnabled) {
        currentGutters.push(lineNumberGutterClass);
    }
    configOptions.gutterLayout = currentGutters; // Update the configuration with the normalized array.
}


// --- SCROLLBAR MANAGEMENT ---

/**
 * Synchronizes the custom scrollbars with the document's actual dimensions
 * and the scroller's client dimensions.
 * @param {Object} dispObj - The display context object.
 * @param {number} totalDocumentHeight - The total height of the document content.
 */
function adjustScrollbarVisibility(dispObj, totalDocumentHeight) {
    const contentHeightWithPadding = totalDocumentHeight + (2 * getPaddingTopValue(dispObj));
    dispObj.contentSizer.style.minHeight = dispObj.minHeightEnforcer.style.top = `${contentHeightWithPadding}px`;

    // Determine the actual scrollable height, accounting for contentSizer vs scroller.
    const scrollableHeight = Math.max(contentHeightWithPadding, dispObj.mainScroller.scrollHeight);

    // Check if horizontal or vertical scrollbars are needed.
    const needsHorizontalScrollbar = dispObj.mainScroller.scrollWidth > dispObj.mainScroller.clientWidth;
    const needsVerticalScrollbar = scrollableHeight > dispObj.mainScroller.clientHeight;
    
    const scrollbarThickness = measureScrollbarThickness(dispObj.textMeasureElement);

    // Update vertical scrollbar.
    if (needsVerticalScrollbar) {
        dispObj.vertScrollbar.style.display = "block";
        dispObj.vertScrollbar.style.bottom = needsHorizontalScrollbar ? `${scrollbarThickness}px` : "0";
        // Calculate the height of the inner scrollbar thumb.
        dispObj.vertScrollbar.firstChild.style.height = 
            `${scrollableHeight - dispObj.mainScroller.clientHeight + dispObj.vertScrollbar.clientHeight}px`;
    } else {
        dispObj.vertScrollbar.style.display = ""; // Hide if not needed.
    }

    // Update horizontal scrollbar.
    if (needsHorizontalScrollbar) {
        dispObj.horzScrollbar.style.display = "block";
        dispObj.horzScrollbar.style.right = needsVerticalScrollbar ? `${scrollbarThickness}px` : "0";
        // Calculate the width of the inner scrollbar thumb.
        dispObj.horzScrollbar.firstChild.style.width =
            `${dispObj.mainScroller.scrollWidth - dispObj.mainScroller.clientWidth + dispObj.horzScrollbar.clientWidth}px`;
    } else {
        dispObj.horzScrollbar.style.display = ""; // Hide if not needed.
    }

    // Update scrollbar corner filler.
    if (needsHorizontalScrollbar && needsVerticalScrollbar) {
        dispObj.scrollCornerBlock.style.display = "block";
        dispObj.scrollCornerBlock.style.height = dispObj.scrollCornerBlock.style.width = `${scrollbarThickness}px`;
    } else {
        dispObj.scrollCornerBlock.style.display = ""; // Hide if not needed.
    }

    // macOS specific scrollbar styling adjustments, especially for overlay scrollbars.
    if (isMacOSLionOrGreater && scrollbarThickness === 0) {
        const macScrollbarMinSize = isMacOSMountainLionOrGreater ? "18px" : "12px";
        dispObj.vertScrollbar.style.minWidth = dispObj.horzScrollbar.style.minHeight = macScrollbarMinSize;
    }
}

/**
 * Calculates the range of visible line indices based on scroll position and client height.
 * @param {Object} renderingContext - The display context object.
 * @param {DocumentModel} documentRef - The document model.
 * @param {Object|number} [optionalViewport] - Optional viewport override: {top, bottom} or just 'top'.
 * @returns {{from: number, to: number}} An object with the start and end line indices.
 */
function calculateVisibleLineRange(renderingContext, documentRef, optionalViewport) {
    let viewportTop = renderingContext.mainScroller.scrollTop;
    let viewportHeight = renderingContext.editorRootContainer.clientHeight;

    // Apply optional viewport overrides.
    if (typeof optionalViewport === "number") {
        viewportTop = optionalViewport;
    } else if (optionalViewport && typeof optionalViewport === "object") {
        viewportTop = optionalViewport.top;
        viewportHeight = optionalViewport.bottom - optionalViewport.top;
    }

    // Adjust for top padding and convert to line indices.
    const startPixel = Math.floor(viewportTop - getPaddingTopValue(renderingContext));
    const endPixel = Math.ceil(startPixel + viewportHeight);

    return {
        from: getLineIndexAtHeight(documentRef, startPixel),
        to: getLineIndexAtHeight(documentRef, endPixel)
    };
}


// --- LINE NUMBERING AND ALIGNMENT ---

/**
 * Synchronizes the horizontal position of elements that need to align with the text content,
 * such as widgets and fixed gutters, considering horizontal scroll.
 * @param {TextEditorCore} editorCore - The editor instance.
 */
function synchronizeHorizontalAlignment(editorCore) {
    const renderData = editorCore.viewPortManager;
    // Skip if no widgets need alignment or if fixed gutters are disabled and no gutters exist.
    if (!renderData.needsWidgetAlignment && (!renderData.gutterPanel.firstChild || !editorCore._settings.fixedGutter)) {
        return;
    }

    // Calculate the horizontal offset correction due to scrolling.
    const horizontalCorrection = calculateScrollCompensation(renderData) - renderData.mainScroller.scrollLeft + editorCore.documentModel.scrollLeft;
    const gutterWidthPx = renderData.gutterPanel.offsetWidth;
    const computedLeftPosition = `${horizontalCorrection}px`;

    // Align all alignable child nodes within the lineDiv.
    for (let node = renderData.contentLinesContainer.firstChild; node; node = node.nextSibling) {
        if (node.alignableElements) { // Custom property for elements needing alignment.
            node.alignableElements.forEach(elem => {
                elem.style.left = computedLeftPosition;
            });
        }
    }

    // If fixed gutters are enabled, position them relative to the content.
    if (editorCore._settings.fixedGutter) {
        renderData.gutterPanel.style.left = `${horizontalCorrection + gutterWidthPx}px`;
    }
}

/**
 * Checks if the line number column width needs to be updated and performs the update if necessary.
 * This happens when the number of digits in the line numbers changes (e.g., from 99 to 100).
 * @param {TextEditorCore} editorCore - The editor instance.
 * @returns {boolean} True if the line number width was updated, false otherwise.
 */
function evaluateLineNumberColumnSize(editorCore) {
    if (!editorCore._settings.lineNumbersEnabled) {
        return false;
    }

    const docInstance = editorCore.documentModel;
    const renderData = editorCore.viewPortManager;

    // Get the line number string for the last line in the document.
    const lastLineNumberText = generateLineNumberText(editorCore._settings, docInstance.firstLineIndex + docInstance.totalLines - 1);

    // Only update if the number of digits has changed.
    if (lastLineNumberText.length !== renderData.lineNumberDigitCount) {
        // Create a temporary element to measure the width of the longest line number.
        const tempMeasureElement = renderData.textMeasureElement.appendChild(
            createDomElement("div", [createDomElement("div", lastLineNumberText)], "EditorComponent-linenumber EditorComponent-gutter-elt")
        );
        const innerTextWidth = tempMeasureElement.firstChild.offsetWidth;
        const totalPadding = tempMeasureElement.offsetWidth - innerTextWidth;

        renderData.lineNumberGutter.style.width = ""; // Reset width to allow browser to re-calculate.
        renderData.lineNumberTextWidth = Math.max(innerTextWidth, renderData.lineNumberGutter.offsetWidth - totalPadding);
        renderData.lineNumberColumnWidth = renderData.lineNumberTextWidth + totalPadding;
        renderData.lineNumberDigitCount = renderData.lineNumberTextWidth ? lastLineNumberText.length : -1;
        renderData.lineNumberGutter.style.width = `${renderData.lineNumberColumnWidth}px`;

        // Remove the temporary element after measurement.
        tempMeasureElement.remove();
        return true;
    }
    return false;
}

/**
 * Generates the formatted line number string for a given line index.
 * @param {Object} editorSettings - The editor's configuration settings.
 * @param {number} lineIdx - The 0-based index of the line.
 * @returns {string} The formatted line number.
 */
function generateLineNumberText(editorSettings, lineIdx) {
    return String(editorSettings.lineNumberFormatter(lineIdx + editorSettings.firstLineNumberOffset));
}

/**
 * Calculates the horizontal offset needed to align content relative to the scroller.
 * This is used for fixed elements like gutters.
 * @param {Object} displayContext - The display context object.
 * @returns {number} The compensation value in pixels.
 */
function calculateScrollCompensation(displayContext) {
    // Difference between the scroller's left edge and the sizer's left edge.
    // This value accounts for any padding/border on the scroller itself.
    const scrollerRect = displayContext.mainScroller.getBoundingClientRect();
    const sizerRect = displayContext.contentSizer.getBoundingClientRect();
    return scrollerRect.left - sizerRect.left;
}


// --- DISPLAY RENDERING AND PATCHING ---

/**
 * Orchestrates the full editor display refresh process.
 * @param {TextEditorCore} editorRef - The editor instance.
 * @param {Array<Object>} changeList - List of document changes (e.g., {from, to, diff}).
 * @param {Object} [targetViewport] - Optional viewport definition to force scrolling.
 * @returns {boolean} True if the display was updated, false if no changes were needed.
 */
function refreshEditorRendering(editorRef, changeList, targetViewport) {
    const renderState = editorRef.viewPortManager;
    const docModel = editorRef.documentModel;

    const prevVisibleStart = renderState.visibleStartLine;
    const prevVisibleEnd = renderState.visibleEndLine;

    // Perform the core internal update logic.
    const wasUpdated = performInternalDisplayUpdate(editorRef, changeList, targetViewport);

    if (wasUpdated) {
        queueEventNotification(editorRef, "refresh", editorRef); // Notify about general refresh.
        // Notify if the visible viewport range has changed.
        if (renderState.visibleStartLine !== prevVisibleStart || renderState.visibleEndLine !== prevVisibleEnd) {
            queueEventNotification(editorRef, "viewportChanged", editorRef, renderState.visibleStartLine, renderState.visibleEndLine);
        }
    }
    repositionSelectionUI(editorRef); // Always update selection UI after rendering.
    adjustScrollbarVisibility(renderState, docModel.totalHeight); // Always ensure scrollbars are correct.

    return wasUpdated;
}

/**
 * Handles the internal logic for updating the editor's DOM to reflect document changes
 * and scroll position. This is the heart of the rendering engine.
 * @param {TextEditorCore} editorRef - The editor instance.
 * @param {Array<Object>} changeList - List of document changes (e.g., {from, to, diff}).
 * @param {Object} [targetViewport] - Optional viewport definition to force scrolling.
 * @returns {boolean} True if the display DOM was modified, false otherwise.
 */
function performInternalDisplayUpdate(editorRef, changeList, targetViewport) {
    const renderState = editorRef.viewPortManager;
    const docModel = editorRef.documentModel;

    // If the editor wrapper has no width, it's hidden or not yet rendered. Reset viewport and bail.
    if (!renderState.editorRootContainer.clientWidth) {
        renderState.visibleStartLine = renderState.visibleEndLine = docModel.firstLineIndex;
        renderState.verticalScrollOffset = 0;
        return false;
    }

    // Determine the new range of lines that should be visible.
    const currentVisibleRange = calculateVisibleLineRange(renderState, docModel, targetViewport);

    // If no document changes and the visible range is already rendered (with some buffer), no DOM update needed.
    // This optimization prevents unnecessary re-renders.
    const bufferMargin = 1; // Small buffer for checking if already rendered.
    if (changeList.length === 0 &&
        currentVisibleRange.from > renderState.visibleStartLine + bufferMargin &&
        currentVisibleRange.to < renderState.visibleEndLine - bufferMargin) {
        return false;
    }

    // Check and resize line number column if needed; this might force a full re-render.
    if (checkAndResizeLineNumbers(editorRef)) {
        // If line number width changed, treat it as a full document change for re-rendering purposes.
        changeList = [{from: docModel.firstLineIndex, to: docModel.firstLineIndex + docModel.totalLines, diff: 0}];
    }

    // Adjust the left margin of the sizer to account for gutter width, and position horizontal scrollbar.
    const gutterAreaWidth = renderState.gutterPanel.offsetWidth;
    renderState.contentSizer.style.marginLeft = `${gutterAreaWidth}px`;
    renderState.horzScrollbar.style.left = editorRef._settings.fixedGutter ? `${gutterAreaWidth}px` : "0";

    // If collapsed spans are present, expand change ranges to include affected collapsed regions.
    if (hasObservedCollapsedSpans) {
        for (let i = 0; i < changeList.length; ++i) {
            let currentChange = changeList[i];
            let collapsedSpanAtStart;
            // Extend 'from' upwards if a collapsed span starts before the change.
            while ((collapsedSpanAtStart = getStartCollapsedRegion(fetchLineObject(docModel, currentChange.from)))) {
                const spanDetails = collapsedSpanAtStart.getRange();
                // Adjust diff if necessary, though diff is primarily for line count.
                if (currentChange.diff !== undefined) currentChange.diff -= (currentChange.from - spanDetails.from.line);
                currentChange.from = spanDetails.from.line;
            }
        }
    }

    // Track the starting line index from which line numbers might need updating due to line count changes.
    let lineNumUpdateStartIdx = Infinity;
    if (editorRef._settings.lineNumbersEnabled) {
        for (const change of changeList) {
            if (change.diff !== undefined && change.diff !== 0) { // Check for actual line count changes.
                lineNumUpdateStartIdx = change.from;
                break;
            }
        }
    }

    const documentEndLine = docModel.firstLineIndex + docModel.totalLines;
    // Expand the visible range by viewport margins to pre-render off-screen lines.
    let fromLineIndex = Math.max(currentVisibleRange.from - editorRef._settings.viewportMargin, docModel.firstLineIndex);
    let toLineIndex = Math.min(documentEndLine, currentVisibleRange.to + editorRef._settings.viewportMargin);

    // Heuristic: If the new range is very close to the old one, extend the range to include the old one
    // to minimize DOM changes.
    const SMALL_DIFF_THRESHOLD = 20;
    if (renderState.visibleStartLine < fromLineIndex && fromLineIndex - renderState.visibleStartLine < SMALL_DIFF_THRESHOLD) {
        fromLineIndex = Math.max(docModel.firstLineIndex, renderState.visibleStartLine);
    }
    if (renderState.visibleEndLine > toLineIndex && renderState.visibleEndLine - toLineIndex < SMALL_DIFF_THRESHOLD) {
        toLineIndex = Math.min(documentEndLine, renderState.visibleEndLine);
    }

    // If collapsed spans are active, ensure the visible range starts at a visual line boundary
    // and extends past any hidden lines at the end.
    if (hasObservedCollapsedSpans) {
        fromLineIndex = getLogicalLineNumber(resolveVisualLine(docModel, fetchLineObject(docModel, fromLineIndex)));
        while (toLineIndex < documentEndLine && isLineHidden(fetchLineObject(docModel, toLineIndex))) {
            toLineIndex++;
        }
    }

    // Compute regions of lines that are "intact" (not affected by changes and within the expanded viewport).
    const intactLineRanges = calculateIntactRegions([{from: renderState.visibleStartLine, to: renderState.visibleEndLine}], changeList);

    // Clip intact regions to the new expanded viewport and count total intact lines.
    let totalIntactLines = 0;
    for (let i = 0; i < intactLineRanges.length; ++i) {
        const range = intactLineRanges[i];
        if (range.from < fromLineIndex) range.from = fromLineIndex;
        if (range.to > toLineIndex) range.to = toLineIndex;
        if (range.from >= range.to) { // Remove empty or inverted ranges.
            intactLineRanges.splice(i--, 1);
        } else {
            totalIntactLines += range.to - range.from;
        }
    }
    // If the entire new viewport is already intact and aligned, only update view offset.
    if (totalIntactLines === (toLineIndex - fromLineIndex) && fromLineIndex === renderState.visibleStartLine && toLineIndex === renderState.visibleEndLine) {
        syncViewOffset(editorRef);
        return false; // No DOM update needed.
    }

    // Sort intact regions by their starting line number.
    intactLineRanges.sort((a, b) => a.from - b.from);

    // Capture the currently focused element to restore focus after DOM manipulation.
    const currentlyFocusedElement = _document.activeElement;

    // Temporarily hide the line container if a large portion of lines will be repatched.
    // This prevents visual flickering.
    if (totalIntactLines < (toLineIndex - fromLineIndex) * 0.7) {
        renderState.contentLinesContainer.style.display = "none";
    }

    // Apply the DOM patches: remove old lines, insert new/updated lines.
    applyDomPatches(editorRef, fromLineIndex, toLineIndex, intactLineRanges, lineNumUpdateStartIdx);
    renderState.contentLinesContainer.style.display = ""; // Show the container again.

    // Restore focus if it was lost during DOM manipulation and the element is still visible.
    if (_document.activeElement !== currentlyFocusedElement && currentlyFocusedElement && currentlyFocusedElement.offsetHeight) {
        currentlyFocusedElement.focus();
    }

    // Check if the editor's client height or visible range has changed significantly.
    const isLayoutDifferent = fromLineIndex !== renderState.visibleStartLine ||
                            toLineIndex !== renderState.visibleEndLine ||
                            renderState.lastClientHeight !== renderState.editorRootContainer.clientHeight;
    
    if (isLayoutDifferent) {
        renderState.lastClientHeight = renderState.editorRootContainer.clientHeight;
    }
    // Update the stored visible range.
    renderState.visibleStartLine = fromLineIndex;
    renderState.visibleEndLine = toLineIndex;
    kickoffBackgroundParser(editorRef, 100); // Restart background parsing for the new viewport.

    // After patching, update line heights to ensure they are accurate.
    let previousLineBottom = renderState.contentLinesContainer.offsetTop;
    for (let node = renderState.contentLinesContainer.firstChild; node; node = node.nextSibling) {
        if (node.lineObjectRef) { // Assuming line DOM nodes have a reference to their line object.
            let computedHeight;
            if (isIEPre8) {
                // IE_LT8 uses offsetTop/offsetHeight for height calculation.
                const currentBottom = node.offsetTop + node.offsetHeight;
                computedHeight = currentBottom - previousLineBottom;
                previousLineBottom = currentBottom;
            } else {
                // Modern browsers use getBoundingClientRect for more accurate dimensions.
                const elementBox = node.getBoundingClientRect();
                computedHeight = elementBox.bottom - elementBox.top;
            }
            const heightDifference = node.lineObjectRef.visualHeight - computedHeight;
            // If there's a significant difference, log or handle it.
            // Original code just calculated diff, not explicitly used.
            // For Type III, we can add a check or a specific action.
            if (Math.abs(heightDifference) > 0.1) { // Small tolerance for float inaccuracies.
                // console.warn(`Line height discrepancy detected for line ${node.lineObjectRef.lineNumber}: expected ${node.lineObjectRef.visualHeight}, got ${computedHeight}`);
                // Potentially trigger a more precise line height update if needed, but for now just noting the diff.
            }
        }
    }
    return true; // Indicate that DOM was updated.
}

// --- Helper Functions (Stubs for the purpose of clone generation) ---
// In a real implementation, these would be defined elsewhere or globally.

const defaultEditorSettings = {
    value: "",
    syntaxMode: "javascript",
    autofocus: false,
    lineWrappingEnabled: false,
    themeName: "default",
    gutterLayout: [],
    lineNumbersEnabled: false,
    firstLineNumberOffset: 1,
    lineNumberFormatter: (num) => String(num),
    fixedGutter: true,
    viewportMargin: 10 // Number of lines to render above and below the visible viewport
};

const InitFlag = Symbol("InitFlag"); // Unique symbol for initialization.

const optionHandlers = {
    // Example handler:
    themeName: (editor, value, flag) => {
        if (flag === InitFlag) { /* initial setup */ }
        applyVisualTheme(editor);
    },
    lineWrappingEnabled: (editor, value, flag) => {
        if (flag === InitFlag) { /* initial setup */ }
        updateWordWrapSetting(editor);
    },
    gutterLayout: (editor, value, flag) => {
        handleGutterConfigChange(editor);
    }
    // ... other option handlers
};

const initializationHooks = []; // Array of functions to run on editor initialization.

class DelayedOperation {
    constructor() { this._timer = null; }
    trigger(fn, delay) {
        clearTimeout(this._timer);
        this._timer = setTimeout(fn, delay);
    }
    cancel() { clearTimeout(this._timer); this._timer = null; }
}

// Dummy classes/objects for the clone to reference
const SyntaxHighlighterRegistry = {
    getMode: (settings, modeConfig) => ({ name: modeConfig || "plain", parse: () => [] })
};

class DocumentModel {
    constructor(initialValue, mode) {
        this.value = initialValue;
        this.modeConfiguration = mode;
        this.lines = initialValue.split('\n').map((text, i) => ({ text, visualHeight: 18, stateAfter: null, styles: null, lineNumber: i }));
        this.firstLineIndex = 0;
        this.totalLines = this.lines.length;
        this.totalHeight = this.lines.length * 18; // dummy height
        this.parseFrontier = 0;
        this.scrollLeft = 0; // dummy
        this.editorInstanceRef = null; // Back-reference to editor
    }
    forEachLine(callback) { this.lines.forEach(callback); }
    getLine(index) { return this.lines[index]; } // dummy
}

// Dummy functions/constants for the clone to reference
const SCROLLER_CUTOFF_HEIGHT_PX = 30; // Example value
const getPaddingTopValue = (display) => 0; // Dummy implementation
const measureScrollbarThickness = (measureElement) => 17; // Dummy value, common scrollbar width
const getLineIndexAtHeight = (doc, height) => Math.floor(height / 18); // Dummy, assumes fixed line height
const isLineCollapsed = (line) => line.visualHeight === 0; // Dummy
const setLineVisualHeight = (line, height) => { line.visualHeight = height; }; // Dummy
const getLineHeight = (display) => display.lineHeightCache || 18; // Dummy
const getCharWidth = (display) => display.charWidthCache || 8; // Dummy
const clearCachedMetrics = (editor) => { editor.viewPortManager.charWidthCache = null; editor.viewPortManager.lineHeightCache = null; }; // Dummy
const clearDomChildren = (element) => { while (element.firstChild) element.removeChild(element.firstChild); }; // Dummy
const findCollapsedStartSpan = (line) => null; // Dummy
const findCollapsedEndSpan = (line) => null; // Dummy
const retrieveLineByNumber = (doc, num) => doc.getLine(num); // Dummy
const getLogicalLineNumber = (lineObj) => lineObj.lineNumber; // Dummy
const resolveVisualLine = (doc, lineObj) => lineObj; // Dummy
const isLineHidden = (lineObj) => lineObj.visualHeight === 0; // Dummy
const calculateIntactRegions = (oldRanges, changes) => oldRanges; // Dummy
const syncViewOffset = (editor) => {}; // Dummy
const applyDomPatches = (editor, from, to, intact, lineNumUpdateStartIdx) => { /* Actual DOM manipulation logic */ }; // Dummy
const queueEventNotification = (editor, eventName, ...args) => { /* Event system */ }; // Dummy
const repositionSelectionUI = (editor) => { /* Update cursor and selection */ }; // Dummy
const initSyntaxWorker = (editor, delay) => { /* Start worker */ }; // Dummy
const scheduleRenderUpdate = (editor) => { /* Request render */ }; // Dummy
const activateInputArea = (editor) => { editor.viewPortManager.hiddenInputArea.focus(); }; // Dummy
const resetInputContent = (editor, force) => { /* Reset input */ }; // Dummy
const attachDomListeners = (editor) => { /* Attach listeners */ }; // Dummy
const handleFocusEvent = (editor) => { editor.editorState.isFocused = true; }; // Dummy
const handleBlurEvent = (editor) => { editor.editorState.isFocused = false; }; // Dummy
const executeAtomicOperation = (editor, fn) => { return (...args) => { editor.currentOperation = {}; try { return fn(...args); } finally { editor.currentOperation = null; } }; }; // Dummy
const linkDocumentModel = (editor, doc) => { editor.documentModel = doc; doc.editorInstanceRef = editor; }; // Dummy
const checkAndResizeLineNumbers = (editor) => evaluateLineNumberColumnSize(editor); // Dummy wrapper for renamed function
const createDomElement = (tagName, childrenOrText, className, inlineStyle) => { // Redefined for global use if needed, or kept local.
    const elem = _document.createElement(tagName);
    if (className) elem.className = className;
    if (inlineStyle) elem.style.cssText = inlineStyle;

    if (Array.isArray(childrenOrText)) {
        childrenOrText.forEach(child => elem.appendChild(child));
    } else if (childrenOrText !== null && childrenOrText !== undefined) {
        elem.appendChild(_document.createTextNode(childrenOrText));
    }
    return elem;
};

// Assuming keybindingConfigurations is an external object
const keybindingConfigurations = {
    "default": { style: "default" },
    "sublime": { style: "sublime" }
};