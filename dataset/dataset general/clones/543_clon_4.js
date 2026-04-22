var platformIdentifier = (function() {
  const agentString = navigator.userAgent;
  const platformString = navigator.platform;
  const docMode = document.documentMode;

  const detect = {};
  detect.geckoEngine = /gecko\/\d/i.test(agentString);
  detect.internetExplorer = /MSIE \d/.test(agentString);
  detect.ieLegacy = detect.internetExplorer && (docMode == null || docMode < 8);
  detect.ieOld = detect.internetExplorer && (docMode == null || docMode < 9);
  detect.webkitEngine = /WebKit\//.test(agentString);
  detect.qtWebkit = detect.webkitEngine && /Qt\/\d+\.\d+/.test(agentString);
  detect.chromium = /Chrome\//.test(agentString);
  detect.operaBrowser = /Opera\//.test(agentString);
  detect.appleSafari = /Apple Computer/.test(navigator.vendor);
  detect.khtmlEngine = /KHTML\//.test(agentString);
  detect.macOS_lionPlus = /Mac OS X 1\d\D([7-9]|\d\d)\D/.test(agentString);
  detect.macOS_mountainLionPlus = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(agentString);
  detect.phantomBrowser = /PhantomJS/.test(agentString);

  detect.appleMobile = /AppleWebKit/.test(agentString) && /Mobile\/\w+/.test(agentString);
  detect.mobileDevice = detect.appleMobile || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(agentString);
  detect.macSystem = detect.appleMobile || /Mac/.test(platformString);
  detect.windowsSystem = /windows/i.test(platformString);

  let operaVersionMatch = detect.operaBrowser && agentString.match(/Version\/(\d*\.\d*)/);
  if (operaVersionMatch) detect.operaVersionNum = Number(operaVersionMatch[1]);
  else detect.operaVersionNum = null;

  detect.invertControlCommand = detect.macSystem && (detect.qtWebkit || detect.operaBrowser && (detect.operaVersionNum == null || detect.operaVersionNum < 12.11));

  return detect;
})();

var observedReadonlySpans = false, observedCollapsedSegments = false;

// DUMMY/PLACEHOLDER DEPENDENCIES (as they are not provided in the original snippet)
const defaultSettings = {
  value: "", mode: "text/plain", lineWrapping: false, autofocus: false,
  gutters: [], lineNumbers: false, theme: "base", viewportMargin: 10,
  firstLineNumber: 1, lineNumberFormatter: (i) => i.toString()
};

class ContentModel {
  constructor(initialContent, modeConfig) {
    this.initialContent = initialContent;
    this.modeConfiguration = modeConfig;
    this.first = 0;
    this.size = 1; // Dummy size
    this.height = 10; // Dummy height
    this.scrollLeft = 0; // Dummy scrollLeft
    this.frontier = 0; // Dummy frontier
  }
  iter(callback) { /* dummy */ }
}

const performOperation = (instance, func) => (...args) => func.apply(instance, args);
const assignDocument = (instance, doc) => { instance.documentObject = doc; };
const attachHandler = (func, instance, ...args) => func.bind(instance, ...args);
const focusInputArea = (instance) => { if (instance.viewComponent && instance.viewComponent.textInputArea) instance.viewComponent.textInputArea.focus(); };
const blurInputArea = (instance) => { /* dummy */ };
const resetInputState = (instance, full) => { /* dummy */ };

class DelayedAction {
  constructor() { this.timer = null; }
  start(delay, func) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(func, delay);
  }
}

const keyBindingSchemes = {
  "default": { style: "standard" }
};
const configProcessors = {};
const setupRoutines = [];
const broadcastLater = (instance, event, ...args) => { /* dummy */ };
const purgeChildren = (element) => { while (element.firstChild) element.removeChild(element.firstChild); };
const getLineObject = (doc, idx) => ({ text: "dummy line", height: 10, stateAfter: null, styles: null }); // Dummy line object
const getCollapsedStartSpan = (line) => null; // Dummy
const getCollapsedEndSpan = (line) => null; // Dummy
const getLineMetrics = (view) => 10; // Dummy text height
const getCharacterMetrics = (view) => 7; // Dummy char width
const isLineObscured = (line) => false; // Dummy
const adjustLineDimension = (line, newHeight) => { line.height = newHeight; }; // Dummy
const getPaddingAmount = (view) => 0; // Dummy
const getScrollbarDimension = (probe) => 17; // Dummy
const scrollThresholdValue = 30; // Dummy
const computeIntactRanges = (currentRanges, changes) => currentRanges; // Dummy
const applyDOMPatch = (instance, from, to, intact, posChanged) => { /* dummy */ };
const retrieveLineIndex = (model, lineObj) => 0; // Dummy
const getVisualLine = (model, lineObj) => lineObj; // Dummy
const updateSelectionVisuals = (instance) => { /* dummy */ };

// Helper for creating DOM elements declaratively
function buildNode(tag, properties = {}) {
  const element = document.createElement(tag);
  for (const prop in properties) {
    if (prop === 'children') {
      properties.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    } else if (prop === 'style') {
      Object.assign(element.style, properties.style);
    } else if (prop === 'className') {
      element.className = properties.className;
    } else if (prop === 'attributes') {
      for (const attr in properties.attributes) {
        element.setAttribute(attr, properties.attributes[attr]);
      }
    } else {
      element[prop] = properties[prop];
    }
  }
  return element;
}

class ViewManager {
  constructor(placementTarget, documentStartLine) {
    const visual = {};
    const textInputArea = buildNode("textarea", {
      attributes: { autocorrect: "off", autocapitalize: "off", wrap: "off" },
      style: { position: "absolute", padding: "0", width: "1px", height: "1em", outline: "none" }
    });
    if (platformIdentifier.webkitEngine) textInputArea.style.width = "1000px";
    visual.textInputArea = textInputArea;

    visual.inputWrapper = buildNode("div", {
      children: [textInputArea],
      style: { overflow: "hidden", position: "relative", width: "3px", height: "0px" }
    });

    visual.horizontalScroller = buildNode("div", {
      children: [buildNode("div", { style: { height: "1px" } })],
      className: "CodeMirror-hscrollbar"
    });
    visual.verticalScroller = buildNode("div", {
      children: [buildNode("div", { style: { width: "1px" } })],
      className: "CodeMirror-vscrollbar"
    });
    visual.scrollbarCorner = buildNode("div", { className: "CodeMirror-scrollbar-filler" });

    visual.contentLines = buildNode("div");
    visual.selectionOverlay = buildNode("div", { style: { position: "relative", zIndex: "1" } });

    visual.caretIndicator = buildNode("div", { children: ["\u00a0"], className: "CodeMirror-cursor" });
    visual.altCaret = buildNode("div", { children: ["\u00a0"], className: "CodeMirror-cursor CodeMirror-secondarycursor" });

    visual.sizeProbe = buildNode("div", { className: "CodeMirror-measure" });

    visual.contentSpace = buildNode("div", {
      children: [visual.sizeProbe, visual.selectionOverlay, visual.contentLines, visual.caretIndicator, visual.altCaret],
      style: { position: "relative", outline: "none" }
    });

    visual.contentMover = buildNode("div", {
      children: [buildNode("div", { children: [visual.contentSpace], className: "CodeMirror-lines" })],
      style: { position: "relative" }
    });

    visual.sizeController = buildNode("div", { children: [visual.contentMover], className: "CodeMirror-sizer" });

    visual.heightSpacer = buildNode("div", {
      children: ["\u00a0"],
      style: { position: "absolute", height: scrollThresholdValue + "px" }
    });

    visual.sidePanels = buildNode("div", { className: "CodeMirror-gutters" });
    visual.linePanel = null;

    const innerScrollArea = buildNode("div", {
      children: [visual.sizeController, visual.heightSpacer, visual.sidePanels],
      style: { position: "relative", minHeight: "100%" }
    });

    visual.mainScrollArea = buildNode("div", {
      children: [innerScrollArea],
      className: "CodeMirror-scroll",
      attributes: { tabIndex: "-1" }
    });

    visual.editorContainer = buildNode("div", {
      children: [visual.inputWrapper, visual.horizontalScroller, visual.verticalScroller,
                 visual.scrollbarCorner, visual.mainScrollArea],
      className: "CodeMirror"
    });

    if (platformIdentifier.ieLegacy) {
      visual.sidePanels.style.zIndex = -1;
      visual.mainScrollArea.style.paddingRight = 0;
    }
    if (placementTarget.appendChild) placementTarget.appendChild(visual.editorContainer);
    else placementTarget(visual.editorContainer);

    if (platformIdentifier.appleMobile) textInputArea.style.width = "0px";
    if (!platformIdentifier.webkitEngine) visual.mainScrollArea.draggable = true;
    if (platformIdentifier.khtmlEngine) {
      visual.inputWrapper.style.height = "1px";
      visual.inputWrapper.style.position = "absolute";
    } else if (platformIdentifier.ieLegacy) {
      visual.horizontalScroller.style.minWidth = visual.verticalScroller.style.minWidth = "18px";
    }

    Object.assign(this, visual);

    this.currentViewOffset = this.lastComponentSize = 0;
    this.showingFromLine = this.showingToLine = documentStartLine;

    this.lineNumberPanelWidth = this.lineNumberInnerWidth = this.lineNumberCharacterCount = null;
    this.previousInputContent = "";
    this.needsWidgetAlignment = false;
    this.fastPollingActive = false;
    this.pollingScheduler = new DelayedAction();
    this.isDraggingText = false;

    this.cachedCharDimension = this.cachedLineDimension = null;
    this.lineDimensionCache = [];
    this.lineDimensionCachePosition = 0;

    this.selectionAccuracyCompromised = false;

    this.longestLineObject = null;
    this.longestLineLength = 0;
    this.longestLineChangedFlag = false;

    this.wheelDeltaX = this.wheelDeltaY = this.wheelStartCoordX = this.wheelStartCoordY = null;
  }
}

class TextEditorCore {
  constructor(containerElement, config) {
    if (!(this instanceof TextEditorCore)) return new TextEditorCore(containerElement, config);

    this.config = Object.assign({}, defaultSettings, config);
    
    adjustGutterOptionsForLineNumbers(this.config);

    const initialDocStart = typeof this.config.value == "string" ? 0 : this.config.value.first;
    this.viewComponent = new ViewManager(containerElement, initialDocStart);
    this.viewComponent.editorContainer.TextEditorCore = this;
    renderSidePanels(this);
    if (this.config.autofocus && !platformIdentifier.mobileDevice) focusInputArea(this);

    this.internalState = {
      keybindingStacks: [],
      displayOverlays: [],
      modeGeneration: 0,
      overwriteMode: false,
      isFocused: false,
      suppressContentEdits: false,
      pasteOperationIncoming: false,
      isDraggingContent: false,
      highlightScheduler: new DelayedAction()
    };

    this.nextOperationId = 0;
    applyVisualTheme(this);
    if (this.config.lineWrapping)
      this.viewComponent.editorContainer.className += " CodeMirror-wrap";

    let contentSource = this.config.value;
    if (typeof contentSource == "string") contentSource = new ContentModel(this.config.value, this.config.mode);
    performOperation(this, assignDocument)(this, contentSource);

    if (platformIdentifier.internetExplorer) setTimeout(attachHandler(resetInputState, this, true), 20);

    this.setupEventHandlers();
    let hasFocusStatus;
    try { hasFocusStatus = (document.activeElement == this.viewComponent.textInputArea); } catch(e) { }
    if (hasFocusStatus || (this.config.autofocus && !platformIdentifier.mobileDevice)) setTimeout(attachHandler(focusInputArea, this), 20);
    else blurInputArea(this);

    performOperation(this, function() {
      for (const handlerKey in configProcessors)
        if (Object.prototype.hasOwnProperty.call(configProcessors, handlerKey))
          configProcessors[handlerKey](this, this.config[handlerKey], "Init"); // "Init" is a dummy for the original Init constant
      setupRoutines.forEach(routine => routine(this));
    })();
  }

  setupEventHandlers() {
    // Dummy event handler registration
    this.viewComponent.textInputArea.addEventListener('focus', () => this.internalState.isFocused = true);
    this.viewComponent.textInputArea.addEventListener('blur', () => this.internalState.isFocused = false);
    // ... more event listeners would go here ...
  }
}

// STATE UPDATE FUNCTIONS

function refreshSyntaxHighlighting(editorInstance) {
  editorInstance.documentObject.mode = TextEditorCore.getMode(editorInstance.config, editorInstance.documentObject.modeConfiguration);
  editorInstance.documentObject.iter(function(line) {
    if (line.stateAfter) line.stateAfter = null;
    if (line.styles) line.styles = null;
  });
  editorInstance.documentObject.frontier = editorInstance.documentObject.first;
  // startWorker(editorInstance, 100); // Dummy
  editorInstance.internalState.modeGeneration++;
  if (editorInstance.nextOperationId) broadcastLater(editorInstance, "change", editorInstance); // regChange is a broadcast
}

function toggleWordWrap(editorInstance) {
  if (editorInstance.config.lineWrapping) {
    editorInstance.viewComponent.editorContainer.className += " CodeMirror-wrap";
    editorInstance.viewComponent.sizeController.style.minWidth = "";
  } else {
    editorInstance.viewComponent.editorContainer.className = editorInstance.viewComponent.editorContainer.className.replace(" CodeMirror-wrap", "");
    determineMaxLineDimension(editorInstance);
  }
  recomputeAllLineHeights(editorInstance);
  broadcastLater(editorInstance, "change", editorInstance);
  // clearCaches(editorInstance); // Dummy
  setTimeout(function(){syncScrollIndicators(editorInstance.viewComponent, editorInstance.documentObject.height);}, 100);
}

function calculateLineHeightEstimator(editorInstance) {
  const lineDim = getLineMetrics(editorInstance.viewComponent), wrappingStatus = editorInstance.config.lineWrapping;
  const charsPerLine = wrappingStatus && Math.max(5, editorInstance.viewComponent.mainScrollArea.clientWidth / getCharacterMetrics(editorInstance.viewComponent) - 3);
  return function(lineItem) {
    if (isLineObscured(lineItem))
      return 0;
    else if (wrappingStatus)
      return (Math.ceil(lineItem.text.length / charsPerLine) || 1) * lineDim;
    else
      return lineDim;
  };
}

function recomputeAllLineHeights(editorInstance) {
  const documentModel = editorInstance.documentObject, heightCalculator = calculateLineHeightEstimator(editorInstance);
  documentModel.iter(function(lineItem) {
    const estimatedHeight = heightCalculator(lineItem);
    if (estimatedHeight != lineItem.height) adjustLineDimension(lineItem, estimatedHeight);
  });
}

function updateKeyBindingScheme(editorInstance) {
  const styleClass = keyBindingSchemes[editorInstance.config.keyMap].style;
  editorInstance.viewComponent.editorContainer.className = editorInstance.viewComponent.editorContainer.className.replace(/\s*cm-keymap-\S+/g, "") +
    (styleClass ? " cm-keymap-" + styleClass : "");
}

function applyVisualTheme(editorInstance) {
  editorInstance.viewComponent.editorContainer.className = editorInstance.viewComponent.editorContainer.className.replace(/\s*cm-s-\S+/g, "") +
    editorInstance.config.theme.replace(/(^|\s)\s*/g, " cm-s-");
  // clearCaches(editorInstance); // Dummy
}

function refreshSidePanels(editorInstance) {
  renderSidePanels(editorInstance);
  broadcastLater(editorInstance, "change", editorInstance);
}

function renderSidePanels(editorInstance) {
  const panels = editorInstance.viewComponent.sidePanels, panelDefinitions = editorInstance.config.gutters;
  purgeChildren(panels);
  for (let i = 0; i < panelDefinitions.length; ++i) {
    const panelClass = panelDefinitions[i];
    const panelElement = panels.appendChild(buildNode("div", { className: "CodeMirror-gutter " + panelClass }));
    if (panelClass == "CodeMirror-linenumbers") {
      editorInstance.viewComponent.linePanel = panelElement;
      panelElement.style.width = (editorInstance.viewComponent.lineNumberPanelWidth || 1) + "px";
    }
  }
  panels.style.display = panelDefinitions.length ? "" : "none";
}

function obtainContentLength(documentModel, lineItem) {
  if (lineItem.height == 0) return 0;
  let currentLength = lineItem.text.length, mergedSegment, currentLine = lineItem;
  while (mergedSegment = getCollapsedStartSpan(currentLine)) {
    const foundSegment = mergedSegment.find();
    currentLine = getLineObject(documentModel, foundSegment.from.line);
    currentLength += foundSegment.from.ch - foundSegment.to.ch;
  }
  currentLine = lineItem;
  while (mergedSegment = getCollapsedEndSpan(currentLine)) {
    const foundSegment = mergedSegment.find();
    currentLength -= currentLine.text.length - foundSegment.from.ch;
    currentLine = getLineObject(documentModel, foundSegment.to.line);
    currentLength += currentLine.text.length - foundSegment.to.ch;
  }
  return currentLength;
}

function determineMaxLineDimension(editorInstance) {
  const visual = editorInstance.viewComponent, documentModel = editorInstance.documentObject;
  visual.longestLineObject = getLineObject(documentModel, documentModel.first);
  visual.longestLineLength = obtainContentLength(documentModel, visual.longestLineObject);
  visual.longestLineChangedFlag = true;
  documentModel.iter(function(lineItem) {
    const len = obtainContentLength(documentModel, lineItem);
    if (len > visual.longestLineLength) {
      visual.longestLineLength = len;
      visual.longestLineObject = lineItem;
    }
  });
}

function adjustGutterOptionsForLineNumbers(editorConfig) {
  let foundLineNumbersGutter = false;
  const filteredGutters = [];
  for (const gutterName of editorConfig.gutters) {
    if (gutterName === "CodeMirror-linenumbers") {
      if (editorConfig.lineNumbers) {
        foundLineNumbersGutter = true;
        filteredGutters.push(gutterName);
      }
    } else {
      filteredGutters.push(gutterName);
    }
  }
  if (!foundLineNumbersGutter && editorConfig.lineNumbers) {
    filteredGutters.push("CodeMirror-linenumbers");
  }
  editorConfig.gutters = filteredGutters;
}

// SCROLLBAR FUNCTIONS

function syncScrollIndicators(visuals, documentHeight) {
  const fullHeight = documentHeight + 2 * getPaddingAmount(visuals);
  visuals.sizeController.style.minHeight = visuals.heightSpacer.style.top = fullHeight + "px";
  const actualScrollHeight = Math.max(fullHeight, visuals.mainScrollArea.scrollHeight);
  const needsHorizontal = visuals.mainScrollArea.scrollWidth > visuals.mainScrollArea.clientWidth;
  const needsVertical = actualScrollHeight > visuals.mainScrollArea.clientHeight;

  if (needsVertical) {
    visuals.verticalScroller.style.display = "block";
    visuals.verticalScroller.style.bottom = needsHorizontal ? getScrollbarDimension(visuals.sizeProbe) + "px" : "0";
    visuals.verticalScroller.firstChild.style.height =
      (actualScrollHeight - visuals.mainScrollArea.clientHeight + visuals.verticalScroller.clientHeight) + "px";
  } else visuals.verticalScroller.style.display = "";

  if (needsHorizontal) {
    visuals.horizontalScroller.style.display = "block";
    visuals.horizontalScroller.style.right = needsVertical ? getScrollbarDimension(visuals.sizeProbe) + "px" : "0";
    visuals.horizontalScroller.firstChild.style.width =
      (visuals.mainScrollArea.scrollWidth - visuals.mainScrollArea.clientWidth + visuals.horizontalScroller.clientWidth) + "px";
  } else visuals.horizontalScroller.style.display = "";

  if (needsHorizontal && needsVertical) {
    visuals.scrollbarCorner.style.display = "block";
    visuals.scrollbarCorner.style.height = visuals.scrollbarCorner.style.width = getScrollbarDimension(visuals.sizeProbe) + "px";
  } else visuals.scrollbarCorner.style.display = "";

  if (platformIdentifier.macOS_lionPlus && getScrollbarDimension(visuals.sizeProbe) === 0)
    visuals.verticalScroller.style.minWidth = visuals.horizontalScroller.style.minHeight = platformIdentifier.macOS_mountainLionPlus ? "18px" : "12px";
}

function determineVisibleLineRange(visuals, documentModel, viewportBounds) {
  let topCoord = visuals.mainScrollArea.scrollTop, componentHeight = visuals.editorContainer.clientHeight;
  if (typeof viewportBounds == "number") topCoord = viewportBounds;
  else if (viewportBounds) {topCoord = viewportBounds.top; componentHeight = viewportBounds.bottom - viewportBounds.top;}
  topCoord = Math.floor(topCoord - getPaddingAmount(visuals));
  const bottomCoord = Math.ceil(topCoord + componentHeight);
  return {startLine: retrieveLineIndex(documentModel, topCoord), endLine: retrieveLineIndex(documentModel, bottomCoord)};
}

// LINE NUMBERS FUNCTIONS

function adjustHorizontalComponents(editorInstance) {
  const visuals = editorInstance.viewComponent;
  if (!visuals.needsWidgetAlignment && (!visuals.sidePanels.firstChild || !editorInstance.config.fixedGutter)) return;
  const horizontalCompensate = calculateHorizontalOffset(visuals) - visuals.mainScrollArea.scrollLeft + editorInstance.documentObject.scrollLeft;
  const sidePanelWidth = visuals.sidePanels.offsetWidth, leftPosition = horizontalCompensate + "px";
  for (let node = visuals.contentLines.firstChild; node; node = node.nextSibling) if (node.alignable) {
    for (let i = 0, elementsToAlign = node.alignable; i < elementsToAlign.length; ++i) elementsToAlign[i].style.left = leftPosition;
  }
  if (editorInstance.config.fixedGutter)
    visuals.sidePanels.style.left = (horizontalCompensate + sidePanelWidth) + "px";
}

function recalculateLineNumberPanelWidth(editorInstance) {
  if (!editorInstance.config.lineNumbers) return false;
  const documentModel = editorInstance.documentObject,
        lastLineNum = formatLineNumberDisplay(editorInstance.config, documentModel.first + documentModel.size - 1),
        visuals = editorInstance.viewComponent;
  if (lastLineNum.length != visuals.lineNumberCharacterCount) {
    const testElement = visuals.sizeProbe.appendChild(buildNode("div", {
      children: [buildNode("div", { children: [lastLineNum] })],
      className: "CodeMirror-linenumber CodeMirror-gutter-elt"
    }));
    const innerWidth = testElement.firstChild.offsetWidth, paddingAmount = testElement.offsetWidth - innerWidth;
    visuals.linePanel.style.width = "";
    visuals.lineNumberInnerWidth = Math.max(innerWidth, visuals.linePanel.offsetWidth - paddingAmount);
    visuals.lineNumberPanelWidth = visuals.lineNumberInnerWidth + paddingAmount;
    visuals.lineNumberCharacterCount = visuals.lineNumberInnerWidth ? lastLineNum.length : -1;
    visuals.linePanel.style.width = visuals.lineNumberPanelWidth + "px";
    return true;
  }
  return false;
}

function formatLineNumberDisplay(options, index) {
  return String(options.lineNumberFormatter(index + options.firstLineNumber));
}
function calculateHorizontalOffset(visuals) {
  return visuals.mainScrollArea.getBoundingClientRect().left - visuals.sizeController.getBoundingClientRect().left;
}

// DISPLAY DRAWING FUNCTIONS

function refreshView(editorInstance, changeList, viewportRegion) {
  const oldStart = editorInstance.viewComponent.showingFromLine, oldEnd = editorInstance.viewComponent.showingToLine;
  const wasUpdated = performViewUpdate(editorInstance, changeList, viewportRegion);
  if (wasUpdated) {
    broadcastLater(editorInstance, "update", editorInstance);
    if (editorInstance.viewComponent.showingFromLine != oldStart || editorInstance.viewComponent.showingToLine != oldEnd)
      broadcastLater(editorInstance, "viewportChange", editorInstance, editorInstance.viewComponent.showingFromLine, editorInstance.viewComponent.showingToLine);
  }
  updateSelectionVisuals(editorInstance);
  syncScrollIndicators(editorInstance.viewComponent, editorInstance.documentObject.height);

  return wasUpdated;
}

function performViewUpdate(editorInstance, changeList, viewportRegion) {
  const visuals = editorInstance.viewComponent, documentModel = editorInstance.documentObject;
  if (!visuals.editorContainer.clientWidth) {
    visuals.showingFromLine = visuals.showingToLine = documentModel.first;
    visuals.currentViewOffset = 0;
    return;
  }

  const currentVisible = determineVisibleLineRange(visuals, documentModel, viewportRegion);
  if (changeList.length == 0 &&
      currentVisible.startLine > visuals.showingFromLine && currentVisible.endLine < visuals.showingToLine)
    return;

  if (recalculateLineNumberPanelWidth(editorInstance))
    changeList = [{from: documentModel.first, to: documentModel.first + documentModel.size}];
  const sidePanelWidth = visuals.sidePanels.offsetWidth;
  visuals.sizeController.style.marginLeft = sidePanelWidth + "px";
  visuals.horizontalScroller.style.left = editorInstance.config.fixedGutter ? sidePanelWidth + "px" : "0";

  if (observedCollapsedSegments)
    for (let i = 0; i < changeList.length; ++i) {
      const currentChange = changeList[i];
      let mergedSegment;
      while (mergedSegment = getCollapsedStartSpan(getLineObject(documentModel, currentChange.from))) {
        const segmentFrom = mergedSegment.find().from.line;
        if (currentChange.diff) currentChange.diff -= currentChange.from - segmentFrom;
        currentChange.from = segmentFrom;
      }
    }

  let positionChangeStart = Infinity;
  if (editorInstance.config.lineNumbers)
    for (let i = 0; i < changeList.length; ++i)
      if (changeList[i].diff) { positionChangeStart = changeList[i].from; break; }

  const documentEnd = documentModel.first + documentModel.size;
  let viewFrom = Math.max(currentVisible.startLine - editorInstance.config.viewportMargin, documentModel.first);
  let viewTo = Math.min(documentEnd, currentVisible.endLine + editorInstance.config.viewportMargin);
  if (visuals.showingFromLine < viewFrom && viewFrom - visuals.showingFromLine < 20) viewFrom = Math.max(documentModel.first, visuals.showingFromLine);
  if (visuals.showingToLine > viewTo && visuals.showingToLine - viewTo < 20) viewTo = Math.min(documentEnd, visuals.showingToLine);
  if (observedCollapsedSegments) {
    viewFrom = retrieveLineIndex(documentModel, getVisualLine(documentModel, getLineObject(documentModel, viewFrom)));
    while (viewTo < documentEnd && isLineObscured(getLineObject(documentModel, viewTo))) ++viewTo;
  }

  const intactRanges = computeIntactRanges([{from: visuals.showingFromLine, to: visuals.showingToLine}], changeList);

  let intactLineCount = 0;
  for (let i = 0; i < intactRanges.length; ++i) {
    const range = intactRanges[i];
    if (range.from < viewFrom) range.from = viewFrom;
    if (range.to > viewTo) range.to = viewTo;
    if (range.from >= range.to) intactRanges.splice(i--, 1);
    else intactLineCount += range.to - range.from;
  }
  if (intactLineCount == viewTo - viewFrom && viewFrom == visuals.showingFromLine && viewTo == visuals.showingToLine) {
    // updateViewOffset(editorInstance); // Dummy
    return;
  }
  intactRanges.sort((a, b) => a.from - b.from);

  const currentlyFocused = document.activeElement;
  if (intactLineCount < (viewTo - viewFrom) * .7) visuals.contentLines.style.display = "none";
  applyDOMPatch(editorInstance, viewFrom, viewTo, intactRanges, positionChangeStart);
  visuals.contentLines.style.display = "";
  if (document.activeElement != currentlyFocused && currentlyFocused.offsetHeight) currentlyFocused.focus();

  const sizeChanged = viewFrom != visuals.showingFromLine || viewTo != visuals.showingToLine ||
    visuals.lastComponentSize != visuals.editorContainer.clientHeight;
  if (sizeChanged) visuals.lastComponentSize = visuals.editorContainer.clientHeight;
  visuals.showingFromLine = viewFrom; visuals.showingToLine = viewTo;
  // startWorker(editorInstance, 100); // Dummy

  let previousBottom = visuals.contentLines.offsetTop;
  for (let node = visuals.contentLines.firstChild, heightVal; node; node = node.nextSibling) if (node.lineObj) {
    if (platformIdentifier.ieLegacy) {
      const bottomCoord = node.offsetTop + node.offsetHeight;
      heightVal = bottomCoord - previousBottom;
      previousBottom = bottomCoord;
    } else {
      const boxDimensions = node.getBoundingClientRect();
      heightVal = boxDimensions.bottom - boxDimensions.top;
    }
    const heightDifference = node.lineObj.height - heightVal;
  }
  return true;
}