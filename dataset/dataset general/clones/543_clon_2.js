// BROWSER IDENTIFICATION ROUTINES

// A bit unrefined, yet required to manage various hard-to-detect
// rendering quirks and behavioral inconsistencies across browsers.
var isGeckoEngine = /gecko\/\d/i.test(navigator.userAgent);
var isIEBrowser = /MSIE \d/.test(navigator.userAgent);
var isIEPre8 = isIEBrowser && (document.documentMode == null || document.documentMode < 8);
var isIEPre9 = isIEBrowser && (document.documentMode == null || document.documentMode < 9);
var isWebKitEngine = /WebKit\//.test(navigator.userAgent);
var isQtWebKit = isWebKitEngine && /Qt\/\d+\.\d+/.test(navigator.userAgent);
var isChromeBrowser = /Chrome\//.test(navigator.userAgent);
var isOperaBrowser = /Opera\//.test(navigator.userAgent);
var isSafariBrowser = /Apple Computer/.test(navigator.vendor);
var isKHTMLEngine = /KHTML\//.test(navigator.userAgent);
var isMacOSELionOrHigher = /Mac OS X 1\d\D([7-9]|\d\d)\D/.test(navigator.userAgent);
var isMacOSMountainLionOrHigher = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent);
var isPhantomJSEnvironment = /PhantomJS/.test(navigator.userAgent);

var isIOSDevice = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
// This detection is very basic. Suggestions for more robust methods are welcome.
var isMobileDevice = isIOSDevice || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
var isMacOS = isIOSDevice || /Mac/.test(navigator.platform);
var isWindowsOS = /windows/i.test(navigator.platform);

var operaEngineVersion = isOperaBrowser && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
if (operaEngineVersion) operaEngineVersion = Number(operaEngineVersion[1]);
// Some web browsers utilize incorrect event properties for cmd/ctrl key on macOS
var shouldSwapControlCommand = isMacOS && (isQtWebKit || isOperaBrowser && (operaEngineVersion == null || operaEngineVersion < 12.11));

// Performance optimization: skip certain code paths if these features are not utilized
var detectedReadOnlySegments = false, detectedCollapsedSegments = false;

// EDITOR INITIALIZER

function EditorCore(targetElement, configuration) {
  if (!(this instanceof EditorCore)) return new EditorCore(targetElement, configuration);

  this.settings = configuration = configuration || {};
  // Establish final configuration by merging provided options with default settings.
  for (var settingKey in defaultEditorSettings) if (!configuration.hasOwnProperty(settingKey) && defaultEditorSettings.hasOwnProperty(settingKey))
    configuration[settingKey] = defaultEditorSettings[settingKey];
  prepareGutterConfiguration(configuration);

  var initialDocumentPosition = typeof configuration.value == "string" ? 0 : configuration.value.first;
  var uiDisplay = this.uiDisplay = createUIDisplay(targetElement, initialDocumentPosition);
  uiDisplay.containerElement.editorInstance = this;
  refreshGutterElements(this);
  if (configuration.autoFocusEnabled && !isMobileDevice) activateEditorInput(this);

  this.internalState = {keybinds: [],
                        popupElements: [],
                        modeGenerationCount: 0,
                        overtypeMode: false, hasKeyboardFocus: false,
                        editSuppressed: false, incomingPaste: false,
                        textBeingDragged: false,
                        highlightManager: new AsyncActionScheduler()};

  this.nextOperationIdentifier = 0;
  appearanceUpdated(this);
  if (configuration.wrapLines)
    this.uiDisplay.containerElement.className += " editor-wrap-lines";

  var documentContent = configuration.value;
  if (typeof documentContent == "string") documentContent = new DocumentDataModel(configuration.value, configuration.mode);
  executeEditorOperation(this, attachDocumentToEditor)(this, documentContent);

  // Counteract the "magic" textarea content restoration that IE sometimes performs
  // on our hidden input field upon page reload.
  if (isIEBrowser) scheduleTask(bindFunctionContext(resetInputArea, this, true), 20);

  setupEventMonitors(this);
  // IE may throw an unspecified error when attempting to access activeElement
  // before the page has fully loaded.
  var hasActiveFocus; try { hasActiveFocus = (document.activeDOMElement == uiDisplay.inputField); } catch(e) { }
  if (hasActiveFocus || (configuration.autoFocusEnabled && !isMobileDevice)) scheduleTask(bindFunctionContext(handleFocusEvent, this), 20);
  else handleBlurEvent(this);

  executeEditorOperation(this, function() {
    for (var settingKey in editorOptionHandlers)
      if (editorOptionHandlers.propertyIsEnumerable(settingKey))
        editorOptionHandlers[settingKey](this, configuration[settingKey], InitializationPhase);
    for (var i = 0; i < editorInitializationCallbacks.length; ++i) editorInitializationCallbacks[i](this);
  })();
}

// UI DISPLAY CONSTRUCTOR

function createUIDisplay(targetElement, initialDocumentPosition) {
  var displayComponents = {};
  var inputField = displayComponents.inputField = createDOMElement("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none;");
  if (isWebKitEngine) inputField.style.elementWidth = "1000px";
  else inputField.setDOMAttribute("wrap", "off");
  inputField.setDOMAttribute("autocorrect", "off"); inputField.setDOMAttribute("autocapitalize", "off");
  // Encapsulates and conceals the input textarea
  displayComponents.inputContainer = createDOMElement("div", [inputField], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
  // The actual simulated scrollbars.
  displayComponents.horizontalScrollbar = createDOMElement("div", [createDOMElement("div", null, null, "height: 1px")], "editor-h-scrollbar");
  displayComponents.verticalScrollbar = createDOMElement("div", [createDOMElement("div", null, null, "width: 1px")], "editor-v-scrollbar");
  displayComponents.scrollbarGapFiller = createDOMElement("div", null, "editor-scrollbar-filler");
  // DIV elements holding the selection highlight and the actual code lines
  displayComponents.lineContentDiv = createDOMElement("div");
  displayComponents.selectionOverlayDiv = createDOMElement("div", null, null, "position: relative; z-index: 1");
  // Flashing cursor, and a helper element to guarantee cursor visibility at line ends
  displayComponents.primaryCursor = createDOMElement("div", "\u00a0", "editor-cursor");
  // Auxiliary cursor, displayed for jumps in bi-directional text
  displayComponents.secondaryCursor = createDOMElement("div", "\u00a0", "editor-cursor editor-secondary-cursor");
  // Utilized for measuring text dimensions
  displayComponents.measurementElement = createDOMElement("div", null, "editor-measure");
  // Wraps all elements that need to exist within the vertically-padded coordinate system
  displayComponents.lineContentSpace = createDOMElement("div", [displayComponents.measurementElement, displayComponents.selectionOverlayDiv, displayComponents.lineContentDiv, displayComponents.primaryCursor, displayComponents.secondaryCursor],
                       null, "position: relative; outline: none");
  // Repositioned within its parent to cover the visible view area
  displayComponents.contentMover = createDOMElement("div", [createDOMElement("div", [displayComponents.lineContentSpace], "editor-lines")], null, "position: relative");
  // Configured to the text's total height, enabling scrolling
  displayComponents.sizeAdjuster = createDOMElement("div", [displayComponents.contentMover], "editor-sizer");
  // This element is necessary due to inconsistent padding/overflow:auto behavior across browsers
  displayComponents.verticalSpaceEnforcer = createDOMElement("div", "\u00a0", null, "position: absolute; height: " + scrollBoundaryCutoff + "px");
  // Will contain the gutter elements, if any are configured
  displayComponents.gutterContainer = createDOMElement("div", null, "editor-gutters");
  displayComponents.lineNumberGutter = null;
  // Helper element for correctly sizing the gutter background areas
  var scrollableContentWrapper = createDOMElement("div", [displayComponents.sizeAdjuster, displayComponents.verticalSpaceEnforcer, displayComponents.gutterContainer], null, "position: relative; min-height: 100%");
  // Provides the core scrolling functionality
  displayComponents.mainScroller = createDOMElement("div", [scrollableContentWrapper], "editor-scroll");
  displayComponents.mainScroller.setDOMAttribute("tabIndex", "-1");
  // The primary DOM element where the editor resides.
  displayComponents.editorWrapper = createDOMElement("div", [displayComponents.inputContainer, displayComponents.horizontalScrollbar, displayComponents.verticalScrollbar,
                          displayComponents.scrollbarGapFiller, displayComponents.mainScroller], "editor-main-wrapper");
  // Workaround for IE7 z-index rendering bug
  if (isIEPre8) { displayComponents.gutterContainer.style.zIndex = -1; displayComponents.mainScroller.style.paddingRight = 0; }
  if (targetElement.appendChild) targetElement.appendChild(displayComponents.editorWrapper); else targetElement(displayComponents.editorWrapper);

  // Necessary to hide the large blue blinking cursor on Mobile Safari
  if (isIOSDevice) inputField.style.elementWidth = "0px";
  if (!isWebKitEngine) displayComponents.mainScroller.draggable = true;
  // Required to correctly handle the Tab key in KHTML engines
  if (isKHTMLEngine) { displayComponents.inputContainer.style.elementHeight = "1px"; displayComponents.inputContainer.style.position = "absolute"; }
  // For IE7, a minimum width must be set for scrollbars to appear (but not for IE8).
  else if (isIEPre8) displayComponents.horizontalScrollbar.style.minWidth = displayComponents.verticalScrollbar.style.minWidth = "18px";

  // Current visible range within the document (may extend beyond the actual view window).
  displayComponents.viewOffset = displayComponents.previousClientHeight = 0;
  displayComponents.currentlyVisibleFrom = displayComponents.currentlyVisibleTo = initialDocumentPosition;

  // Used to only resize the line number gutter when its width needs to change
  // (e.g., when the number of lines crosses a decimal boundary).
  displayComponents.lineNumberDisplayWidth = displayComponents.lineNumberDisplayInnerWidth = displayComponents.lineNumberCharacterCount = null;
  // Refer to readInput and resetInputArea functions
  displayComponents.previousInputContent = "";
  // Set to true when a non-horizontal-scrolling widget is added. As an optimization,
  // widget alignment is skipped if this flag is false.
  displayComponents.alignWidgets = false;
  // Flag indicating if we are currently awaiting input (e.g., after 'keypress')
  // and are polling at a high frequency.
  displayComponents.fastPollingActive = false;
  // A self-resetting timer for the polling mechanism.
  displayComponents.pollingScheduler = new AsyncActionScheduler();
  // True when text is being dragged from within the editor.
  displayComponents.isDraggingText = false;

  displayComponents.cachedCharacterWidth = displayComponents.cachedLineHeight = null;
  displayComponents.lineMeasurementCache = [];
  displayComponents.lineMeasurementCacheIndex = 0;

  // Tracks instances where resetInputArea has opted to insert a short
  // string instead of the (potentially large) current selection.
  displayComponents.selectionInaccurate = false;

  // Monitors the maximum line length to maintain a static horizontal
  // scrollbar position during vertical scrolling.
  displayComponents.longestLine = null;
  displayComponents.longestLineLength = 0;
  displayComponents.longestLineChanged = false;

  // Variables for measuring the granularity of wheel scrolling.
  displayComponents.wheelDeltaX = displayComponents.wheelDeltaY = displayComponents.wheelStartCoordX = displayComponents.wheelStartCoordY = null;

  return displayComponents;
}

// EDITOR STATE MODIFICATIONS

// Ensures the editor returns to a consistent state when configuration parameters change.

function refreshEditorMode(editor) {
  editor.documentObject.currentMode = EditorCore.getSyntaxMode(editor.settings, editor.documentObject.modeConfiguration);
  editor.documentObject.iterateLines(function(currentLine) {
    if (currentLine.parsedState) currentLine.parsedState = null;
    if (currentLine.styleData) currentLine.styleData = null;
  });
  editor.documentObject.parsingFrontier = editor.documentObject.firstLineIndex;
  beginSyntaxWorker(editor, 100);
  editor.internalState.modeGenerationCount++;
  if (editor.currentOperation) notifyDisplayChange(editor);
}

function lineWrappingStatusChanged(editor) {
  if (editor.settings.wrapLines) {
    editor.uiDisplay.containerElement.className += " editor-wrap-lines";
    editor.uiDisplay.sizeAdjuster.style.minWidth = "";
  } else {
    editor.uiDisplay.containerElement.className = editor.uiDisplay.containerElement.className.replace(" editor-wrap-lines", "");
    calculateMaxLineDimensions(editor);
  }
  recalculateAllLineHeights(editor);
  notifyDisplayChange(editor);
  resetDisplayMemory(editor);
  scheduleTask(function(){adjustScrollbars(editor.uiDisplay, editor.documentObject.height);}, 100);
}

function predictLineHeight(editor) {
  var lineHeight = getLineTextHeight(editor.uiDisplay), wrappingEnabled = editor.settings.wrapLines;
  var linesPerWrap = wrappingEnabled && Math.max(5, editor.uiDisplay.mainScroller.clientPixelWidth / getCharacterRenderWidth(editor.uiDisplay) - 3);
  return function(currentLine) {
    if (isLineVisuallyHidden(currentLine))
      return 0;
    else if (wrappingEnabled)
      return (Math.ceil(currentLine.text.length / linesPerWrap) || 1) * lineHeight;
    else
      return lineHeight;
  };
}

function recalculateAllLineHeights(editor) {
  var documentModel = editor.documentObject, heightPredictor = predictLineHeight(editor);
  documentModel.iterateLines(function(currentLine) {
    var estimatedHeight = heightPredictor(currentLine);
    if (estimatedHeight != currentLine.height) adjustLineVisualHeight(currentLine, estimatedHeight);
  });
}

function keybindingSchemeChanged(editor) {
  var visualStyle = keyboardBindingMap[editor.settings.keybindingScheme].style;
  editor.uiDisplay.containerElement.className = editor.uiDisplay.containerElement.className.replace(/\s*editor-keymap-\S+/g, "") +
    (visualStyle ? " editor-keymap-" + visualStyle : "");
}

function appearanceUpdated(editor) {
  editor.uiDisplay.containerElement.className = editor.uiDisplay.containerElement.className.replace(/\s*editor-theme-\S+/g, "") +
    editor.settings.visualTheme.replace(/(^|\s)\s*/g, " editor-theme-");
  resetDisplayMemory(editor);
}

function gutterConfigurationChanged(editor) {
  refreshGutterElements(editor);
  notifyDisplayChange(editor);
}

function refreshGutterElements(editor) {
  var gutterContainer = editor.uiDisplay.gutterContainer, gutterSpecifications = editor.settings.gutters;
  removeAllChildren(gutterContainer);
  for (var i = 0; i < gutterSpecifications.length; ++i) {
    var currentGutterClass = gutterSpecifications[i];
    var gutterElement = gutterContainer.appendElement(createDOMElement("div", null, "editor-gutter " + currentGutterClass));
    if (currentGutterClass == "editor-line-numbers") {
      editor.uiDisplay.lineNumberGutter = gutterElement;
      gutterElement.style.elementWidth = (editor.uiDisplay.lineNumberDisplayWidth || 1) + "px";
    }
  }
  gutterContainer.style.display = i ? "" : "none";
}

function determineLineRenderedLength(documentModel, currentLine) {
  if (currentLine.height == 0) return 0;
  var contentLength = currentLine.text.length, mergedSegment, currentSegment = currentLine;
  while (mergedSegment = getCollapsedBlockAtStart(currentSegment)) {
    var segmentDetails = mergedSegment.find();
    currentSegment = retrieveLineObject(documentModel, segmentDetails.start.line);
    contentLength += segmentDetails.start.character - segmentDetails.end.character;
  }
  currentSegment = currentLine;
  while (mergedSegment = getCollapsedBlockAtEnd(currentSegment)) {
    var segmentDetails = mergedSegment.find();
    contentLength -= currentSegment.text.length - segmentDetails.start.character;
    currentSegment = retrieveLineObject(documentModel, segmentDetails.end.line);
    contentLength += currentSegment.text.length - segmentDetails.end.character;
  }
  return contentLength;
}

function calculateMaxLineDimensions(editor) {
  var uiDisplay = editor.uiDisplay, documentModel = editor.documentObject;
  uiDisplay.longestLine = retrieveLineObject(documentModel, documentModel.firstLineIndex);
  uiDisplay.longestLineLength = determineLineRenderedLength(documentModel, uiDisplay.longestLine);
  uiDisplay.longestLineChanged = true;
  documentModel.iterateLines(function(currentLine) {
    var lineLength = determineLineRenderedLength(documentModel, currentLine);
    if (lineLength > uiDisplay.longestLineLength) {
      uiDisplay.longestLineLength = lineLength;
      uiDisplay.longestLine = currentLine;
    }
  });
}

// Ensures the gutter configuration includes "editor-line-numbers"
// when the line numbers option is enabled.
function prepareGutterConfiguration(configuration) {
  var itemFound = false;
  for (var i = 0; i < configuration.gutters.length; ++i) {
    if (configuration.gutters[i] == "editor-line-numbers") {
      if (configuration.lineNumbersEnabled) itemFound = true;
      else configuration.gutters.removeElement(i--, 1);
    }
  }
  if (!itemFound && configuration.lineNumbersEnabled)
    configuration.gutters.addElement("editor-line-numbers");
}

// SCROLLBAR MANAGEMENT

// Re-synchronizes the simulated scrollbars with the actual content dimensions.
// Optionally, forces a specific scrollTop position.
function adjustScrollbars(uiComponents /* display */, documentHeight) {
  var combinedHeight = documentHeight + 2 * getVerticalPaddingTop(uiComponents);
  uiComponents.sizeAdjuster.style.minHeight = uiComponents.verticalSpaceEnforcer.style.top = combinedHeight + "px";
  var contentScrollHeight = Math.max(combinedHeight, uiComponents.mainScroller.scrollHeight);
  var horizontalScrollNeeded = uiComponents.mainScroller.scrollWidth > uiComponents.mainScroller.clientPixelWidth;
  var verticalScrollNeeded = contentScrollHeight > uiComponents.mainScroller.clientPixelHeight;
  if (verticalScrollNeeded) {
    uiComponents.verticalScrollbar.style.visibility = "block";
    uiComponents.verticalScrollbar.style.bottomOffset = horizontalScrollNeeded ? calculateScrollbarDimension(uiComponents.measurementElement) + "px" : "0";
    uiComponents.verticalScrollbar.firstElementChild.style.elementHeight =
      (contentScrollHeight - uiComponents.mainScroller.clientPixelHeight + uiComponents.verticalScrollbar.elementHeight) + "px";
  } else uiComponents.verticalScrollbar.style.visibility = "";
  if (horizontalScrollNeeded) {
    uiComponents.horizontalScrollbar.style.visibility = "block";
    uiComponents.horizontalScrollbar.style.rightOffset = verticalScrollNeeded ? calculateScrollbarDimension(uiComponents.measurementElement) + "px" : "0";
    uiComponents.horizontalScrollbar.firstElementChild.style.elementWidth =
      (uiComponents.mainScroller.scrollWidth - uiComponents.mainScroller.clientPixelWidth + uiComponents.horizontalScrollbar.elementWidth) + "px";
  } else uiComponents.horizontalScrollbar.style.visibility = "";
  if (horizontalScrollNeeded && verticalScrollNeeded) {
    uiComponents.scrollbarGapFiller.style.visibility = "block";
    uiComponents.scrollbarGapFiller.style.elementHeight = uiComponents.scrollbarGapFiller.style.elementWidth = calculateScrollbarDimension(uiComponents.measurementElement) + "px";
  } else uiComponents.scrollbarGapFiller.style.visibility = "";

  if (isMacOSELionOrHigher && calculateScrollbarDimension(uiComponents.measurementElement) === 0)
    uiComponents.verticalScrollbar.style.minWidth = uiComponents.horizontalScrollbar.style.minHeight = isMacOSMountainLionOrHigher ? "18px" : "12px";
}

function getVisibleLineRange(uiComponents, documentModel, viewportCoordinates) {
  var currentTop = uiComponents.mainScroller.scrollTop, viewHeight = uiComponents.containerElement.clientPixelHeight;
  if (typeof viewportCoordinates == "number") currentTop = viewportCoordinates;
  else if (viewportCoordinates) {currentTop = viewportCoordinates.top; viewHeight = viewportCoordinates.bottom - viewportCoordinates.top;}
  currentTop = Math.floor(currentTop - getVerticalPaddingTop(uiComponents));
  var currentBottom = Math.ceil(currentTop + viewHeight);
  return {start: findLineAtVerticalPosition(documentModel, currentTop), end: findLineAtVerticalPosition(documentModel, currentBottom)};
}

// LINE NUMBER FUNCTIONALITY

function synchronizeHorizontalAlignment(editor) {
  var uiDisplay = editor.uiDisplay;
  if (!uiDisplay.alignWidgets && (!uiDisplay.gutterContainer.firstElementChild || !editor.settings.fixedGutter)) return;
  var comp = getHorizontalScrollCompensation(uiDisplay) - uiDisplay.mainScroller.scrollLeftOffset + editor.documentObject.scrollLeftOffset;
  var gutterWidth = uiDisplay.gutterContainer.offsetPixelWidth, leftPosition = comp + "px";
  for (var domNode = uiDisplay.lineContentDiv.firstElementChild; domNode; domNode = domNode.nextElementSibling) if (domNode.alignableElements) {
    for (var i = 0, alignableItem = domNode.alignableElements; i < alignableItem.length; ++i) alignableItem[i].style.leftOffset = leftPosition;
  }
  if (editor.settings.fixedGutter)
    uiDisplay.gutterContainer.style.leftOffset = (comp + gutterWidth) + "px";
}

function potentiallyUpdateLineNumberDisplayWidth(editor) {
  if (!editor.settings.lineNumbersEnabled) return false;
  var documentModel = editor.documentObject, lastLineNumberString = formatLineNumberString(editor.settings, documentModel.firstLineIndex + documentModel.totalLines - 1), uiDisplay = editor.uiDisplay;
  if (lastLineNumberString.length != uiDisplay.lineNumberCharacterCount) {
    var testElement = uiDisplay.measurementElement.appendElement(createDOMElement("div", [createDOMElement("div", lastLineNumberString)],
                                               "editor-line-number editor-gutter-item"));
    var innerW = testElement.firstElementChild.pixelWidth, horizontalPadding = testElement.pixelWidth - innerW;
    uiDisplay.lineNumberGutter.style.elementWidth = "";
    uiDisplay.lineNumberDisplayInnerWidth = Math.max(innerW, uiDisplay.lineNumberGutter.offsetPixelWidth - horizontalPadding);
    uiDisplay.lineNumberDisplayTotalWidth = uiDisplay.lineNumberDisplayInnerWidth + horizontalPadding;
    uiDisplay.lineNumberCharacterCount = uiDisplay.lineNumberDisplayInnerWidth ? lastLineNumberString.length : -1;
    uiDisplay.lineNumberGutter.style.elementWidth = uiDisplay.lineNumberDisplayTotalWidth + "px";
    return true;
  }
  return false;
}

function formatLineNumberString(settings, lineIndex) {
  return String(settings.lineCounterFormatter(lineIndex + settings.initialLineNumber));
}
function getHorizontalScrollCompensation(uiDisplay) {
  return uiDisplay.mainScroller.getDOMRect().leftPosition - uiDisplay.sizeAdjuster.getDOMRect().leftPosition;
}

// VISUAL DISPLAY RENDERING

function refreshEditorDisplay(editorInstance, modificationSet, visibleViewport) {
  var previousVisibleFrom = editorInstance.uiDisplay.currentlyVisibleFrom, previousVisibleTo = editorInstance.uiDisplay.currentlyVisibleTo;
  var updated = updateInternalEditorDisplay(editorInstance, modificationSet, visibleViewport);
  if (updated) {
    scheduleEventNotification(editorInstance, "update", editorInstance);
    if (editorInstance.uiDisplay.currentlyVisibleFrom != previousVisibleFrom || editorInstance.uiDisplay.currentlyVisibleTo != previousVisibleTo)
      scheduleEventNotification(editorInstance, "viewportChange", editorInstance, editorInstance.uiDisplay.currentlyVisibleFrom, editorInstance.uiDisplay.currentlyVisibleTo);
  }
  refreshSelectionDisplay(editorInstance);
  adjustScrollbars(editorInstance.uiDisplay, editorInstance.documentObject.height);

  return updated;
}

// Utilizes a set of changes and the current scroll position to determine
// which DOM updates are required, then performs those updates.
function updateInternalEditorDisplay(editorInstance, modificationSet, visibleViewport) {
  var uiDisplay = editorInstance.uiDisplay, documentModel = editorInstance.documentObject;
  if (!uiDisplay.containerElement.clientPixelWidth) {
    uiDisplay.currentlyVisibleFrom = uiDisplay.currentlyVisibleTo = documentModel.firstLineIndex;
    uiDisplay.viewOffset = 0;
    return;
  }

  // Calculate the new visible window range
  // If a scrollTop is specified, use it to determine rendering lines
  // instead of the current scrollbar position.
  var visibleRange = getVisibleLineRange(uiDisplay, documentModel, visibleViewport);
  // Exit early if the visible area is already rendered and no changes occurred.
  if (modificationSet.length == 0 &&
      visibleRange.start > uiDisplay.currentlyVisibleFrom && visibleRange.end < uiDisplay.currentlyVisibleTo)
    return;

  if (potentiallyUpdateLineNumberDisplayWidth(editorInstance))
    modificationSet = [{start: documentModel.firstLineIndex, end: documentModel.firstLineIndex + documentModel.totalLines}];
  var gutterPixelWidth = uiDisplay.sizeAdjuster.style.leftMargin = uiDisplay.gutterContainer.offsetPixelWidth + "px";
  uiDisplay.horizontalScrollbar.style.leftOffset = editorInstance.settings.fixedGutter ? gutterPixelWidth : "0";

  // When merged lines are present, the line needing redrawing
  // might not be the one that was directly changed.
  if (detectedCollapsedSegments)
    for (var i = 0; i < modificationSet.length; ++i) {
      var currentChange = modificationSet[i], mergedBlock;
      while (mergedBlock = getCollapsedBlockAtStart(retrieveLineObject(documentModel, currentChange.start))) {
        var startLine = mergedBlock.find().start.line;
        if (currentChange.difference) currentChange.difference -= currentChange.start - startLine;
        currentChange.start = startLine;
      }
    }

  // Used to identify which lines require line number updates
  var changedPositionStart = Infinity;
  if (editorInstance.settings.lineNumbersEnabled)
    for (var i = 0; i < modificationSet.length; ++i)
      if (modificationSet[i].difference) { changedPositionStart = modificationSet[i].start; break; }

  var documentEnd = documentModel.firstLineIndex + documentModel.totalLines;
  var rangeStart = Math.max(visibleRange.start - editorInstance.settings.viewportBuffer, documentModel.firstLineIndex);
  var rangeEnd = Math.min(documentEnd, visibleRange.end + editorInstance.settings.viewportBuffer);
  if (uiDisplay.currentlyVisibleFrom < rangeStart && rangeStart - uiDisplay.currentlyVisibleFrom < 20) rangeStart = Math.max(documentModel.firstLineIndex, uiDisplay.currentlyVisibleFrom);
  if (uiDisplay.currentlyVisibleTo > rangeEnd && uiDisplay.currentlyVisibleTo - rangeEnd < 20) rangeEnd = Math.min(documentEnd, uiDisplay.currentlyVisibleTo);
  if (detectedCollapsedSegments) {
    rangeStart = getLogicalLineNumber(getVisualLineRepresentation(documentModel, retrieveLineObject(documentModel, rangeStart)));
    while (rangeEnd < documentEnd && isLineVisuallyHidden(retrieveLineObject(documentModel, rangeEnd))) ++rangeEnd;
  }

  // Construct a set of theoretically unchanged lines, then punch holes
  // in them using the change information.
  var intactRanges = determineIntactVisualRanges([{start: uiDisplay.currentlyVisibleFrom, end: uiDisplay.currentlyVisibleTo}], modificationSet);

  // Trim off parts that will not be visible
  var intactLineCount = 0;
  for (var i = 0; i < intactRanges.length; ++i) {
    var currentRange = intactRanges[i];
    if (currentRange.start < rangeStart) currentRange.start = rangeStart;
    if (currentRange.end > rangeEnd) currentRange.end = rangeEnd;
    if (currentRange.start >= currentRange.end) intactRanges.removeRange(i--, 1);
    else intactLineCount += currentRange.end - currentRange.start;
  }
  if (intactLineCount == rangeEnd - rangeStart && rangeStart == uiDisplay.currentlyVisibleFrom && rangeEnd == uiDisplay.currentlyVisibleTo) {
    updateViewOffset(editorInstance);
    return;
  }
  intactRanges.sortRanges(function(rangeA, rangeB) {return rangeA.start - rangeB.start;});

  var activeElementRef = document.activeDOMElement;
  if (intactLineCount < (rangeEnd - rangeStart) * .7) uiDisplay.lineContentDiv.style.visibility = "none";
  applyVisualPatch(editorInstance, rangeStart, rangeEnd, intactRanges, changedPositionStart);
  uiDisplay.lineContentDiv.style.visibility = "";
  if (document.activeDOMElement != activeElementRef && activeElementRef.elementPixelHeight) activeElementRef.setFocus();

  var isDifferent = rangeStart != uiDisplay.currentlyVisibleFrom || rangeEnd != uiDisplay.currentlyVisibleTo ||
    uiDisplay.previousClientHeight != uiDisplay.containerElement.clientPixelHeight;
  // This is a heuristic formula to detect editor resizing or font size changes.
  if (isDifferent) uiDisplay.previousClientHeight = uiDisplay.containerElement.clientPixelHeight;
  uiDisplay.currentlyVisibleFrom = rangeStart; uiDisplay.currentlyVisibleTo = rangeEnd;
  beginSyntaxWorker(editorInstance, 100);

  var previousBottomCoordinate = uiDisplay.lineContentDiv.offsetTop;
  for (var domNode = uiDisplay.lineContentDiv.firstElementChild, nodeHeight; domNode; domNode = domNode.nextElementSibling) if (domNode.lineObject) {
    if (isIEPre8) {
      var bottomCoordinate = domNode.offsetTop + domNode.offsetHeight;
      nodeHeight = bottomCoordinate - previousBottomCoordinate;
      previousBottomCoordinate = bottomCoordinate;
    } else {
      var boundingBox = domNode.getBoundingClientRect();
      nodeHeight = boundingBox.bottom - boundingBox.top;
    }
    var heightDifference = domNode.lineObject.height - nodeHeight;