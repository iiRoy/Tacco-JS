(function(moduleFactory) {
    if (typeof exports === "object" && typeof module === "object")
        module.exports = moduleFactory();
    else if (typeof define === "function" && define.amd)
        return define([], moduleFactory);
    else
        this.EditorEngine = moduleFactory();
})(function() {
    "use strict";

    const establishClientCharacteristics = () => {
        const agentString = navigator.userAgent;
        const tridentMatch = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agentString);
        const msieMatch = /MSIE (\d)/.test(agentString);
        const webkitMatch = /WebKit\//.test(agentString);
        const geckoMatch = /gecko\/\d/i.test(agentString);
        const operaMatch = /Opera\//.test(agentString);
        const chromeMatch = /Chrome\//.test(agentString);
        const appleVendorMatch = /Apple Computer/.test(navigator.vendor);
        const phantomMatch = /PhantomJS/.test(agentString);
        const mobileWebKitMatch = /AppleWebKit/.test(agentString) && /Mobile\/\w+/.test(agentString);

        let browserVersion = null;
        let isLegacyMsie = msieMatch;
        let isModernMsie = tridentMatch;
        let isMsie = isLegacyMsie || isModernMsie;

        if (isMsie) {
            browserVersion = isLegacyMsie ? document.documentMode || 6 : parseInt(tridentMatch[1], 10);
        }

        const operaVersionMatch = operaMatch && agentString.match(/Version\/(\d*\.\d*)/);
        let operaVersion = operaVersionMatch ? Number(operaVersionMatch[1]) : null;

        let derivedWebkit = webkitMatch;
        let derivedOpera = operaMatch;

        if (operaVersion && operaVersion >= 15) {
            derivedOpera = false;
            derivedWebkit = true;
        }

        const platformString = navigator.platform;
        const isMacintosh = mobileWebKitMatch || /Mac/.test(platformString);
        const isIos = mobileWebKitMatch;
        const isMobileDevice = isIos || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(agentString);
        const isWindowsOs = /win/i.test(platformString);

        const macMountainLionCheck = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(agentString);
        const flipControlCommand = isMacintosh && (webkitMatch && /Qt\/\d+\.\d+/.test(agentString) || derivedOpera && (operaVersion == null || operaVersion < 12.11));
        const captureRightMouse = geckoMatch || (isMsie && browserVersion >= 9);

        return {
            isGecko: geckoMatch,
            isLegacyIE: isLegacyMsie,
            isModernIE: isModernMsie,
            isAnyIE: isMsie,
            ieRuntimeVersion: browserVersion,
            isWebKit: webkitMatch,
            isQtWebKit: webkitMatch && /Qt\/\d+\.\d+/.test(agentString),
            isChrome: chromeMatch,
            isPresto: operaMatch,
            isSafari: appleVendorMatch,
            isMacMountainLion: macMountainLionCheck,
            isPhantomJs: phantomMatch,
            isIOS: isIos,
            isHandheld: isMobileDevice,
            isMacOS: isMacintosh,
            prestoEngineVersion: operaVersion,
            remapControlCommand: flipControlCommand,
            interceptRightClick: captureRightMouse
        };
    };

    const clientInfo = establishClientCharacteristics();

    let observedReadOnlySpans = false;
    let observedFoldedSpans = false;

    const replicateObjectProperties = (sourceObject, destinationObject, overwriteExisting = true) => {
        const target = destinationObject || {};
        for (const key in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
                if (overwriteExisting || !Object.prototype.hasOwnProperty.call(target, key)) {
                    target[key] = sourceObject[key];
                }
            }
        }
        return target;
    };

    const constructDomElement = (tagName, childNodes, classNames, inlineStyle) => {
        const elementNode = document.createElement(tagName);
        if (classNames) elementNode.className = classNames;
        if (inlineStyle) elementNode.style.cssText = inlineStyle;
        if (childNodes) {
            if (Array.isArray(childNodes)) {
                childNodes.forEach(child => {
                    if (child instanceof Node) elementNode.appendChild(child);
                });
            } else if (childNodes instanceof Node) {
                elementNode.appendChild(childNodes);
            }
        }
        return elementNode;
    };

    const addCssClass = (element, className) => {
        if (element.classList) {
            element.classList.add(className);
        } else if (!element.className.match(new RegExp(`(^|\\s)${className}(?:$|\\s)`))) {
            element.className += ` ${className}`;
        }
    };

    const removeCssClass = (element, className) => {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className = element.className.replace(new RegExp(`(^|\\s)${className}(?:$|\\s)`), " ");
        }
    };

    const attachContext = (func, context) => func.bind(context);

    const findElementIndex = (array, element) => array.indexOf(element);

    const addDomListener = (element, eventType, handler) => {
        element.addEventListener(eventType, handler, false);
    };

    const purgeChildNodes = (parentNode) => {
        while (parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
        }
    };

    const InitialisationPhase = {};
    const defaultSettings = {
        lineWrapping: false,
        autofocus: false,
        inputStyle: "native",
        theme: "default",
        gutters: [],
        lineNumbers: false,
        fixedGutter: true,
        finishInit: null,
        value: ""
    };
    const optionHooks = {};
    const setupHooks = [];
    const textMeasurement = {
        getHeight: (display) => 12,
        getWidth: (display) => 7,
    };
    const lineUtility = {
        isHidden: (doc, line) => false,
        adjustHeight: (line, newHeight) => { line.height = newHeight; },
        getCollapsedStart: (line) => null,
        getCollapsedEnd: (line) => null,
    };
    const coordinateSystem = {
        getVerticalPadding: (display) => 0,
        getScrollGap: (editor) => 0,
    };
    const operationManager = {
        begin: (editor) => { editor.currentOp = {forceUpdate: false}; },
        complete: (editor) => {},
        registerChange: (editor) => {},
    };
    const workerScheduler = {
        initiate: (editor, delay) => {},
    };
    const modeManager = {
        retrieve: (options, modeOption) => ({name: "javascript"}),
    };
    const globalEventRegistry = {
        ensurePresence: () => {},
    };
    const docAttachment = {
        link: (editor, doc) => {},
    };
    const focusUtility = {
        gain: (editor) => {},
        lose: (editor) => {},
        check: (editor) => false,
    };
    const delayedExecution = function() {
        this.set = () => {};
    };
    const scrollerOffset = 30;

    class DocumentHandler {
        constructor(content, mode) {
            this.textLines = content.split('\n').map(t => ({text: t, height: 12, widgets: null, stateAfter: null, styles: null}));
            this.modeOption = mode;
            this.mode = modeManager.retrieve({}, mode);
            this.first = 0;
            this.height = this.textLines.length * 12;
            this.frontier = this.first;
        }
        iter(callback) {
            this.textLines.forEach(callback);
        }
    }

    class InputProcessor {
        constructor(editorInstance) {
            this.editor = editorInstance;
            this.inputElement = constructDomElement("textarea", null, "EditorEngine-hidden-input", "position: absolute; clip: rect(0 0 0 0);");
        }
        focus() { this.inputElement.focus(); }
        reset(full) { /* simplified reset */ }
        init(display) { /* simplified init */ }
        initiateEventListeners(editorInstance) { /* simplified event listener setup */ }
    }

    class UiConstructor {
        constructor(hostElement, documentHandler, inputProcessor, editorInstance) {
            this.inputElement = inputProcessor.inputElement;

            this.scrollFillerElement = constructDomElement("div", null, "EditorEngine-scrollbar-filler");
            this.scrollFillerElement.setAttribute("editor-no-content", "true");

            this.gutterFillElement = constructDomElement("div", null, "EditorEngine-gutter-filler");
            this.gutterFillElement.setAttribute("editor-no-content", "true");

            this.lineContentArea = constructDomElement("div", null, "EditorEngine-code");

            this.selectionOverlay = constructDomElement("div", null, null, "position: relative; z-index: 1");
            this.cursorLayer = constructDomElement("div", null, "EditorEngine-cursors");

            this.measurementProbe = constructDomElement("div", null, "EditorEngine-measure");
            this.lineMeasurementProbe = constructDomElement("div", null, "EditorEngine-measure");

            this.lineContentWrapper = constructDomElement("div",
                [this.measurementProbe, this.lineMeasurementProbe, this.selectionOverlay, this.cursorLayer, this.lineContentArea],
                null, "position: relative; outline: none");

            this.viewportMover = constructDomElement("div", [constructDomElement("div", [this.lineContentWrapper], "EditorEngine-lines")], null, "position: relative");

            this.sizeElement = constructDomElement("div", [this.viewportMover], "EditorEngine-sizer");
            this.sizeElementWidth = null;

            this.heightEnforcer = constructDomElement("div", null, null, `position: absolute; height: ${scrollerOffset}px; width: 1px;`);

            this.gutterContainer = constructDomElement("div", null, "EditorEngine-gutters");
            this.lineNumberGutter = null;

            this.scrollingElement = constructDomElement("div", [this.sizeElement, this.heightEnforcer, this.gutterContainer], "EditorEngine-scroll");
            this.scrollingElement.setAttribute("tabIndex", "-1");

            this.containerElement = constructDomElement("div",
                [this.scrollFillerElement, this.gutterFillElement, this.scrollingElement],
                "EditorEngine");

            if (clientInfo.isAnyIE && clientInfo.ieRuntimeVersion < 8) {
                this.gutterContainer.style.zIndex = -1;
                this.scrollingElement.style.paddingRight = 0;
            }
            if (!clientInfo.isWebKit && !(clientInfo.isGecko && clientInfo.isHandheld)) {
                this.scrollingElement.draggable = true;
            }

            if (hostElement) {
                if (hostElement.appendChild) hostElement.appendChild(this.containerElement);
                else hostElement(this.containerElement);
            }

            this.visibleRangeStart = this.visibleRangeEnd = documentHandler.first;
            this.reportedVisibleStart = this.reportedVisibleEnd = documentHandler.first;
            this.renderedSegments = [];
            this.activeRenderedView = null;
            this.externalMeasuredSegment = null;
            this.visibleOffset = 0;
            this.lastWrapperHeight = this.lastWrapperWidth = 0;
            this.updateLineNumbersFlag = null;

            this.nativeScrollBarSize = this.barHeightDimension = this.barWidthDimension = 0;
            this.scrollbarsAreClipped = false;

            this.lineNumberDisplayWidth = this.lineNumberDisplayInnerWidth = this.lineNumberCharacterCount = null;
            this.alignWidgetElements = false;

            this.cachedCharacterWidth = this.cachedTextHeight = this.cachedHorizontalPadding = null;

            this.maximumLine = null;
            this.maximumLineLength = 0;
            this.maximumLineChanged = false;

            this.wheelDeltaX = this.wheelDeltaY = this.wheelOriginX = this.wheelOriginY = null;
            this.shiftKeyActive = false;
            this.contextMenuSelection = null;
            this.activeTouchGesture = null;

            inputProcessor.init(this);
        }
    }

    class EditorCore {
        constructor(hostElement, userSettings) {
            if (!(this instanceof EditorCore)) return new EditorCore(hostElement, userSettings);

            this.editorConfig = replicateObjectProperties(userSettings, {}, true);
            replicateObjectProperties(defaultSettings, this.editorConfig, false);
            this.prepareGutterConfiguration(this.editorConfig);

            let contentSource = this.editorConfig.value;
            if (typeof contentSource === "string") contentSource = new DocumentHandler(contentSource, this.editorConfig.mode);
            this.documentModel = contentSource;

            this.inputProcessor = new InputProcessor(this);
            this.viewRenderer = new UiConstructor(hostElement, this.documentModel, this.inputProcessor, this);
            this.viewRenderer.containerElement.EditorEngine = this;
            this.refreshGutterLayout();
            this.updateThemeStyling();
            if (this.editorConfig.lineWrapping) {
                addCssClass(this.viewRenderer.containerElement, "EditorEngine-wrap");
            }
            if (this.editorConfig.autofocus && !clientInfo.isHandheld) this.viewRenderer.inputElement.focus();
            this.initializeScrollbarSystem();

            this.internalStatus = {
                keySequenceMaps: [],
                overlayViews: [],
                modeGeneration: 0,
                overwriteMode: false,
                isFocused: false,
                preventEdits: false,
                incomingPaste: false,
                incomingCut: false,
                draggingContent: false,
                highlightTask: new delayedExecution(),
                currentKeySequence: null
            };

            const selfReference = this;

            if (clientInfo.isAnyIE && clientInfo.ieRuntimeVersion < 11) {
                setTimeout(() => { selfReference.viewRenderer.inputElement.reset(true); }, 20);
            }

            this.inputProcessor.initiateEventListeners(this);
            globalEventRegistry.ensurePresence();

            operationManager.begin(this);
            this.currentOp.forceUpdate = true;
            docAttachment.link(this, this.documentModel);

            if ((this.editorConfig.autofocus && !clientInfo.isHandheld) || focusUtility.check(this)) {
                setTimeout(attachContext(focusUtility.gain, this), 20);
            } else {
                focusUtility.lose(this);
            }

            for (const optKey in optionHooks) {
                if (Object.prototype.hasOwnProperty.call(optionHooks, optKey)) {
                    optionHooks[optKey](this, this.editorConfig[optKey], InitialisationPhase);
                }
            }
            this.adjustLineNumberWidth();
            if (this.editorConfig.finishInit) this.editorConfig.finishInit(this);
            setupHooks.forEach(hook => hook(this));
            operationManager.complete(this);

            if (clientInfo.isWebKit && this.editorConfig.lineWrapping &&
                getComputedStyle(this.viewRenderer.lineContentArea).textRendering === "optimizelegibility") {
                this.viewRenderer.lineContentArea.style.textRendering = "auto";
            }
        }

        refreshModeConfiguration() {
            this.documentModel.mode = modeManager.retrieve(this.editorConfig, this.documentModel.modeOption);
            this.resetModeStateData();
        }

        resetModeStateData() {
            this.documentModel.iter(line => {
                if (line.stateAfter) line.stateAfter = null;
                if (line.styles) line.styles = null;
            });
            this.documentModel.frontier = this.documentModel.first;
            workerScheduler.initiate(this, 100);
            this.internalStatus.modeGeneration++;
            if (this.currentOp) operationManager.registerChange(this);
        }

        handleWrappingChange() {
            if (this.editorConfig.lineWrapping) {
                addCssClass(this.viewRenderer.containerElement, "EditorEngine-wrap");
                this.viewRenderer.sizeElement.style.minWidth = "";
                this.viewRenderer.sizeElementWidth = null;
            } else {
                removeCssClass(this.viewRenderer.containerElement, "EditorEngine-wrap");
                this.determineLongestLine();
            }
            this.estimateAllLineHeights();
            operationManager.registerChange(this);
            this.clearDisplayCaches();
            setTimeout(() => { this.updateScrollbarDimensions(); }, 100);
        }

        createHeightEstimator() {
            const lineHeight = textMeasurement.getHeight(this.viewRenderer);
            const lineWrapEnabled = this.editorConfig.lineWrapping;
            const charsPerLine = lineWrapEnabled && Math.max(5, this.viewRenderer.scrollingElement.clientWidth / textMeasurement.getWidth(this.viewRenderer) - 3);

            return (singleLine) => {
                if (lineUtility.isHidden(this.documentModel, singleLine)) return 0;

                let widgetTotalHeight = 0;
                if (singleLine.widgets) {
                    singleLine.widgets.forEach(w => {
                        if (w.height) widgetTotalHeight += w.height;
                    });
                }

                if (lineWrapEnabled) {
                    return widgetTotalHeight + (Math.ceil(singleLine.text.length / charsPerLine) || 1) * lineHeight;
                } else {
                    return widgetTotalHeight + lineHeight;
                }
            };
        }

        estimateAllLineHeights() {
            const documentRef = this.documentModel;
            const heightCalculator = this.createHeightEstimator();
            documentRef.iter(line => {
                const estimatedHeight = heightCalculator(line);
                if (estimatedHeight !== line.height) lineUtility.adjustHeight(line, estimatedHeight);
            });
        }

        updateThemeStyling() {
            this.viewRenderer.containerElement.className = this.viewRenderer.containerElement.className.replace(/\s*ee-s-\S+/g, "") +
                this.editorConfig.theme.replace(/(^|\s)\s*/g, " ee-s-");
            this.clearDisplayCaches();
        }

        handleGutterChange() {
            this.refreshGutterLayout();
            operationManager.registerChange(this);
            setTimeout(() => { this.alignDisplayHorizontally(); }, 20);
        }

        refreshGutterLayout() {
            const gutterContainer = this.viewRenderer.gutterContainer;
            const gutterSpecs = this.editorConfig.gutters;
            purgeChildNodes(gutterContainer);
            let hasGutters = false;
            for (let i = 0; i < gutterSpecs.length; ++i) {
                const currentGutterClass = gutterSpecs[i];
                const gutterNode = gutterContainer.appendChild(constructDomElement("div", null, `EditorEngine-gutter ${currentGutterClass}`));
                if (currentGutterClass === "EditorEngine-linenumbers") {
                    this.viewRenderer.lineNumberGutter = gutterNode;
                    gutterNode.style.width = (this.viewRenderer.lineNumberWidth || 1) + "px";
                }
                hasGutters = true;
            }
            gutterContainer.style.display = hasGutters ? "" : "none";
            this.adjustGutterSpacing();
        }

        adjustGutterSpacing() {
            const gutterWidth = this.viewRenderer.gutterContainer.offsetWidth;
            this.viewRenderer.sizeElement.style.marginLeft = `${gutterWidth}px`;
        }

        calculateLineDisplayLength(currentLine) {
            if (currentLine.height === 0) return 0;
            let currentLen = currentLine.text.length;
            let mergedSegment;
            let lineWalker = currentLine;

            while (mergedSegment = lineUtility.getCollapsedStart(lineWalker)) {
                const foundRange = mergedSegment.find(0, true);
                lineWalker = foundRange.from.line;
                currentLen += foundRange.from.ch - foundRange.to.ch;
            }
            lineWalker = currentLine;
            while (mergedSegment = lineUtility.getCollapsedEnd(lineWalker)) {
                const foundRange = mergedSegment.find(0, true);
                currentLen -= lineWalker.text.length - foundRange.from.ch;
                lineWalker = foundRange.to.line;
                currentLen += lineWalker.text.length - foundRange.to.ch;
            }
            return currentLen;
        }

        determineLongestLine() {
            const displayHandle = this.viewRenderer;
            const documentHandle = this.documentModel;
            displayHandle.maximumLine = documentHandle.textLines[0] || null;
            displayHandle.maximumLineLength = displayHandle.maximumLine ? this.calculateLineDisplayLength(displayHandle.maximumLine) : 0;
            displayHandle.maximumLineChanged = true;
            documentHandle.iter(line => {
                const currentLength = this.calculateLineDisplayLength(line);
                if (currentLength > displayHandle.maximumLineLength) {
                    displayHandle.maximumLineLength = currentLength;
                    displayHandle.maximumLine = line;
                }
            });
        }

        prepareGutterConfiguration(currentOptions) {
            const lineNumbersIndex = findElementIndex(currentOptions.gutters, "EditorEngine-linenumbers");
            if (lineNumbersIndex === -1 && currentOptions.lineNumbers) {
                currentOptions.gutters = currentOptions.gutters.concat(["EditorEngine-linenumbers"]);
            } else if (lineNumbersIndex > -1 && !currentOptions.lineNumbers) {
                currentOptions.gutters = currentOptions.gutters.slice(0);
                currentOptions.gutters.splice(lineNumbersIndex, 1);
            }
        }

        measureForScrollbarUpdate() {
            const displayRef = this.viewRenderer;
            const currentGutterWidth = displayRef.gutterContainer.offsetWidth;
            const documentRenderHeight = Math.round(this.documentModel.height + coordinateSystem.getVerticalPadding(displayRef));
            return {
                clientAreaHeight: displayRef.scrollingElement.clientHeight,
                viewportHeight: displayRef.containerElement.clientHeight,
                scrollableWidth: displayRef.scrollingElement.scrollWidth,
                clientAreaWidth: displayRef.scrollingElement.clientWidth,
                viewportWidth: displayRef.containerElement.clientWidth,
                leftBarOffset: this.editorConfig.fixedGutter ? currentGutterWidth : 0,
                docTotalHeight: documentRenderHeight,
                totalScrollHeight: documentRenderHeight + coordinateSystem.getScrollGap(this) + displayRef.barHeightDimension,
                nativeBarSize: displayRef.nativeScrollBarSize,
                combinedGutterWidth: currentGutterWidth
            };
        }

        initializeScrollbarSystem() {
            if (this.viewRenderer.activeScrollbars) {
                this.viewRenderer.activeScrollbars.dispose();
                if (this.viewRenderer.activeScrollbars.customClass) {
                    removeCssClass(this.viewRenderer.containerElement, this.viewRenderer.activeScrollbars.customClass);
                }
            }

            this.viewRenderer.activeScrollbars = new ScrollbarModelRegistry[this.editorConfig.scrollbarStyle](
                (node) => {
                    this.viewRenderer.containerElement.insertBefore(node, this.viewRenderer.scrollFillerElement);
                    addDomListener(node, "mousedown", () => {
                        if (this.internalStatus.isFocused) setTimeout(() => { this.inputProcessor.focus(); }, 0);
                    });
                    node.setAttribute("editor-no-content", "true");
                },
                (position, direction) => {
                    if (direction === "horizontal") this.setHorizontalScrollPosition(position);
                    else this.setVerticalScrollPosition(position);
                },
                this
            );
        }

        clearDisplayCaches() {}
        updateScrollbarDimensions() {}
        alignDisplayHorizontally() {}
        adjustLineNumberWidth() {}
        setHorizontalScrollPosition(pos) {}
        setVerticalScrollPosition(pos) {}
    }

    class SystemScrollbars {
        constructor(placementCallback, scrollEventCallback, editorInstance) {
            this.editorRef = editorInstance;
            const verticalBar = this.verticalSlider = constructDomElement("div", [constructDomElement("div", null, null, "min-width: 1px")], "EditorEngine-vscrollbar");
            const horizontalBar = this.horizontalSlider = constructDomElement("div", [constructDomElement("div", null, null, "height: 100%; min-height: 1px")], "EditorEngine-hscrollbar");
            placementCallback(verticalBar);
            placementCallback(horizontalBar);

            addDomListener(verticalBar, "scroll", () => {
                if (verticalBar.clientHeight) scrollEventCallback(verticalBar.scrollTop, "vertical");
            });
            addDomListener(horizontalBar, "scroll", () => {
                if (horizontalBar.clientWidth) scrollEventCallback(horizontalBar.scrollLeft, "horizontal");
            });

            this.overlayChecked = false;
            if (clientInfo.isAnyIE && clientInfo.ieRuntimeVersion < 8) {
                this.horizontalSlider.style.minHeight = this.verticalSlider.style.minWidth = "18px";
            }
        }

        refresh(measurements) {
            const needsHorizontal = measurements.scrollableWidth > measurements.clientAreaWidth + 1;
            const needsVertical = measurements.totalScrollHeight > measurements.clientAreaHeight + 1;
            const barDimension = measurements.nativeBarSize;

            if (needsVertical) {
                this.verticalSlider.style.display = "block";
                this.verticalSlider.style.bottom = needsHorizontal ? `${barDimension}px` : "0";
                const totalVisibleHeight = measurements.viewportHeight - (needsHorizontal ? barDimension : 0);
                this.verticalSlider.firstChild.style.height =
                    `${Math.max(0, measurements.totalScrollHeight - measurements.clientAreaHeight + totalVisibleHeight)}px`;
            } else {
                this.verticalSlider.style.display = "";
                this.verticalSlider.firstChild.style.height = "0";
            }

            if (needsHorizontal) {
                this.horizontalSlider.style.display = "block";
                this.horizontalSlider.style.right = needsVertical ? `${barDimension}px` : "0";
                this.horizontalSlider.style.left = `${measurements.leftBarOffset}px`;
                const totalVisibleWidth = measurements.viewportWidth - measurements.leftBarOffset - (needsVertical ? barDimension : 0);
                this.horizontalSlider.firstChild.style.width =
                    `${(measurements.scrollableWidth - measurements.clientAreaWidth + totalVisibleWidth)}px`;
            } else {
                this.horizontalSlider.style.display = "";
                this.horizontalSlider.firstChild.style.width = "0";
            }

            if (!this.overlayChecked && measurements.clientAreaHeight > 0) {
                if (barDimension === 0) this.applyOverlayFix();
                this.overlayChecked = true;
            }

            return {right: needsVertical ? barDimension : 0, bottom: needsHorizontal ? barDimension : 0};
        }

        setScrollX(position) {
            if (this.horizontalSlider.scrollLeft !== position) this.horizontalSlider.scrollLeft = position;
        }

        setScrollY(position) {
            if (this.verticalSlider.scrollTop !== position) this.verticalSlider.scrollTop = position;
        }

        applyOverlayFix() {
            const barSize = clientInfo.isMacOS && !clientInfo.isMacMountainLion ? "12px" : "18px";
            this.horizontalSlider.style.minHeight = this.verticalSlider.style.minWidth = barSize;
            const self = this;
            const barInteraction = (evt) => {
                if (evt.target !== self.verticalSlider && evt.target !== self.horizontalSlider) {
                    console.log("Editor operation on scrollbar interaction (placeholder)");
                }
            };
            addDomListener(this.verticalSlider, "mousedown", barInteraction);
            addDomListener(this.horizontalSlider, "mousedown", barInteraction);
        }

        dispose() {
            const parentNode = this.horizontalSlider.parentNode;
            if (parentNode) {
                parentNode.removeChild(this.horizontalSlider);
                parentNode.removeChild(this.verticalSlider);
            }
        }
    }

    class BlankScrollbars {
        refresh() { return {bottom: 0, right: 0}; }
        setScrollX() {}
        setScrollY() {}
        dispose() {}
    }

    const ScrollbarModelRegistry = {"native": SystemScrollbars, "null": BlankScrollbars};

    return EditorCore;
});