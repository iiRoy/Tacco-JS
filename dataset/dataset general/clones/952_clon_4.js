class ChartExporterService {
    #diagnosticFlag;
    #targetComponent;
    #outputCanvas;
    #bufferedGraphicElements;
    #clientCustomizations;
    #exportIconAsset;
    #enabledOutputFormats;
    #rightMarginPx;
    #topMarginPx;
    #buttonHoverColor;
    #buttonTextColor;
    #tooltipMessage;
    #buttonAppearanceAlpha;
    #outputDocumentName;
    #outputDocumentBackground;
    #derivedConfiguration;
    #processingState;

    constructor(visualComponent, initialConfig) {
        this.#diagnosticFlag = false;
        this.#targetComponent = visualComponent;
        this.#outputCanvas = null;
        this.#bufferedGraphicElements = [];
        this.#clientCustomizations = initialConfig;
        this.#exportIconAsset = 'export.png';
        this.#enabledOutputFormats = {
            png: true,
            pdf: false,
            jpg: false,
            svg: false
        };
        this.#rightMarginPx = 0;
        this.#topMarginPx = 0;
        this.#buttonHoverColor = "#EFEFEF";
        this.#buttonTextColor = "#CC0000";
        this.#tooltipMessage = "Save chart as an image";
        this.#buttonAppearanceAlpha = 0.75;
        this.#outputDocumentName = "amChart";
        this.#outputDocumentBackground = "#FFFFFF";

        if (initialConfig?.activateImmediately) {
            this.initializeExportMechanism();
        }
    }

    #deepMerge(target, source) {
        target = target || {};
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                    target[key] = this.#deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    #determineBrowserEnvironment() {
        const userAgentString = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const msieIdentifier = userAgentString.indexOf('MSIE ');
        const tridentIdentifier = userAgentString.indexOf('Trident/');
        if (msieIdentifier > -1 || tridentIdentifier > -1) {
            let version = 99;
            if (msieIdentifier > -1) {
                version = parseInt(userAgentString.substring(msieIdentifier + 5, userAgentString.indexOf('.', msieIdentifier)), 10);
            } else if (tridentIdentifier > -1) {
                const rvIdentifier = userAgentString.indexOf('rv:');
                version = parseInt(userAgentString.substring(rvIdentifier + 3, userAgentString.indexOf('.', rvIdentifier)), 10);
            }
            return { isLegacy: true, versionNumber: version };
        }
        return { isLegacy: false, versionNumber: 0 };
    }

    #convertDimensionValue(measure) {
        if (measure === undefined) {
            return "auto";
        }
        if (String(measure).includes("%")) {
            return measure;
        }
        return measure + "px";
    }

    initializeExportMechanism() {
        const activeFormats = Object.entries(this.#enabledOutputFormats)
            .filter(([, isEnabled]) => isEnabled)
            .map(([formatName]) => formatName);

        const interfaceElements = (() => {
            if (activeFormats.length === 1) {
                const singleFormat = activeFormats[0];
                return [{
                    typeIdentifier: singleFormat,
                    labelContent: this.#tooltipMessage,
                    graphicSource: this.#targetComponent.pathToImages + this.#exportIconAsset
                }];
            } else if (activeFormats.length > 1) {
                const subOptions = activeFormats.map(f => ({
                    typeIdentifier: f,
                    labelContent: f.toUpperCase()
                }));
                return [{
                    actionTrigger: () => {},
                    graphicSource: this.#targetComponent.pathToImages + this.#exportIconAsset,
                    subordinateItems: subOptions
                }];
            }
            return [];
        })();

        const effectiveColor = this.#targetComponent.color ?? "transparent";
        const effectiveButtonColor = this.buttonColor ?? "transparent";

        this.#derivedConfiguration = {
            interfaceTop: this.#convertDimensionValue(this.top),
            interfaceLeft: this.#convertDimensionValue(this.left),
            interfaceRight: this.#convertDimensionValue(this.#rightMarginPx),
            interfaceBottom: this.#convertDimensionValue(this.bottom),
            interfaceItems: interfaceElements,
            itemDisplaySettings: {
                backgroundColor: effectiveButtonColor,
                opacityValue: this.#buttonAppearanceAlpha,
                hoverBackgroundColor: this.#buttonHoverColor,
                textColor: effectiveColor,
                hoverTextColor: this.#buttonTextColor,
                paddingTop: '6px',
                paddingRight: '6px',
                paddingBottom: '6px',
                paddingLeft: '6px',
                marginTop: '0px',
                marginRight: '0px',
                marginBottom: '0px',
                marginLeft: '0px',
                textAlign: 'left',
                textDecoration: 'none',
                fontFamily: this.#targetComponent.fontFamily,
                fontSize: this.#targetComponent.fontSize + 'px'
            },
            itemOutputSettings: {
                backgroundColor: this.#outputDocumentBackground,
                outputFileName: this.#outputDocumentName,
                outputFormat: 'png',
                deliveryMethod: 'dataurlnewwindow',
                renderEngine: 'browser',
                imageResolutionDpi: 90,
                clickAction: (exporterInstance, configData, clickEvent) => {
                    clickEvent.preventDefault();
                    exporterInstance.exportVisualContent(configData);
                }
            },
            stripImagery: true
        };

        this.#processingState = {
            graphicBuffer: [],
            renderedCount: 0,
            timingId: 0
        };

        const browserInfo = this.#determineBrowserEnvironment();
        if (typeof(window.canvg) !== 'undefined' && typeof(window.RGBColor) !== 'undefined') {
            this.#derivedConfiguration.itemOutputSettings.renderEngine = 'canvg';
        }
        if (typeof(window.saveAs) !== 'undefined') {
            this.#derivedConfiguration.itemOutputSettings.deliveryMethod = 'save';
        }
        if (browserInfo.isLegacy && browserInfo.versionNumber < 10) {
            this.#derivedConfiguration.itemOutputSettings.deliveryMethod = 'dataurlnewwindow';
        }

        if (this.#clientCustomizations) {
            this.#clientCustomizations.itemOutputSettings = this.#deepMerge(this.#derivedConfiguration.itemOutputSettings, this.#clientCustomizations.itemOutputSettings || {});
            this.#clientCustomizations.itemDisplaySettings = this.#deepMerge(this.#derivedConfiguration.itemDisplaySettings, this.#clientCustomizations.itemDisplaySettings || {});
            this.#derivedConfiguration = this.#deepMerge(this.#derivedConfiguration, this.#clientCustomizations);
        }

        this.#targetComponent.exportModule = this;

        this.#targetComponent.addEventListener('rendered', () => {
            this.prepareInterface();
        });

        if (this.#diagnosticFlag) {
            window.ChartExporterService = this;
        }
    }

    emitDiagnosticMessage(...messages) {
        console.log('ChartExporterService: ', ...messages);
    }

    prepareInterface() {
        const browserInfo = this.#determineBrowserEnvironment();
        if (!browserInfo.isLegacy || (browserInfo.isLegacy && browserInfo.versionNumber > 9)) {
            // Placeholder for button generation logic, not provided in original
            // This would likely populate this.#bufferedGraphicElements for later use
        }
    }

    #decodeBase64ToBytes(encodedString) {
        const charLength = encodedString.length;
        const outputBuffer = new Uint8Array(charLength / 4 * 3 | 0);
        let outputPointer = 0;
        let previousChars = [0, 0];
        let processingState = 0;
        let currentAccumulator = 0;

        const base64DecodingMap = new Uint8Array([
            62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
        ]);

        for (let i = 0; i < charLength; i++) {
            const charCode = encodedString.charCodeAt(i);
            const rankValue = base64DecodingMap[charCode - 43];

            if (rankValue !== 255 && rankValue !== undefined) {
                previousChars[1] = previousChars[0];
                previousChars[0] = charCode;
                currentAccumulator = (currentAccumulator << 6) | rankValue;
                processingState++;

                if (processingState === 4) {
                    outputBuffer[outputPointer++] = currentAccumulator >>> 16;
                    if (previousChars[1] !== 61) { // padding character '='
                        outputBuffer[outputPointer++] = currentAccumulator >>> 8;
                    }
                    if (previousChars[0] !== 61) { // padding character '='
                        outputBuffer[outputPointer++] = currentAccumulator;
                    }
                    processingState = 0;
                }
            }
        }
        return outputBuffer;
    }

    #createDataBlob(dataString, mimeType) {
        const headerEndIndex = mimeType !== 'image/svg+xml' ? dataString.indexOf(',') + 1 : 0;
        const headerPart = dataString.substring(0, headerEndIndex);
        let actualData = dataString;
        let generatedBlob = new Blob();

        if (headerPart.includes('base64')) {
            actualData = this.#decodeBase64ToBytes(dataString.substring(headerEndIndex));
        }

        const browserInfo = this.#determineBrowserEnvironment();
        if (browserInfo.isLegacy && browserInfo.versionNumber < 10) {
            generatedBlob.data = actualData;
            generatedBlob.size = actualData.length;
            generatedBlob.type = mimeType;
            generatedBlob.encoding = 'base64';
        } else {
            generatedBlob = new Blob([actualData], { type: mimeType });
        }
        return generatedBlob;
    }

    #producePdfDocument(exportConfig) {
        let pdfInstance = { output: () => '' };
        const imageData = this.#outputCanvas.toDataURL('image/jpeg');
        const imgWidthMm = (this.#outputCanvas.width * 25.4) / exportConfig.imageResolutionDpi;
        const imgHeightMm = (this.#outputCanvas.height * 25.4) / exportConfig.imageResolutionDpi;

        if (window.jsPDF) {
            pdfInstance = new window.jsPDF();
            if (pdfInstance.addImage) {
                pdfInstance.addImage(imageData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
            } else {
                alert("Missing jsPDF plugin; Please add the 'addImage' plugin.");
            }
        } else {
            alert("Missing jsPDF library; Don't forget to include it.");
        }
        return pdfInstance;
    }

    #processSvgForEmbedding(svgElement) {
        const selfRef = this;

        const transformImagery = (currentSvg, tagName) => {
            Array.from(currentSvg.getElementsByTagName(tagName)).forEach(item => {
                if (selfRef.#derivedConfiguration.stripImagery) {
                    item.parentNode.removeChild(item);
                } else {
                    const imgElement = document.createElement('img');
                    const tempCanvas = document.createElement('canvas');
                    const canvasContext = tempCanvas.getContext('2d');

                    tempCanvas.width = item.getAttribute('width');
                    tempCanvas.height = item.getAttribute('height');
                    imgElement.src = item.getAttribute('xlink:href');
                    imgElement.width = item.getAttribute('width');
                    imgElement.height = item.getAttribute('height');

                    try {
                        canvasContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
                        item.setAttribute('xlink:href', tempCanvas.toDataURL());
                    } catch (error) {
                        item.setAttribute('xlink:href', imgElement.src); // Fallback
                        selfRef.emitDiagnosticMessage('Tainted canvas, browser CORS security triggered:', error);
                        throw error;
                    }
                }
            });
        };

        const browser = this.#determineBrowserEnvironment();
        if (browser.versionNumber === 0) { // Not IE
            svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            if (!this.#derivedConfiguration.stripImagery) {
                svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }
        }

        transformImagery(svgElement, 'pattern');
        transformImagery(svgElement, 'image');
        this.#bufferedGraphicElements.push(svgElement);

        return svgElement;
    }

    #composeCombinedSvg() {
        const combinedSvgContainer = document.createElement('svg');
        combinedSvgContainer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        combinedSvgContainer.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        this.#processingState.graphicBuffer.forEach(graphicData => {
            const groupElement = document.createElement('g');
            const [svgNode, position] = graphicData;

            svgNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svgNode.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

            groupElement.setAttribute('transform', `translate(${position.x},${position.y})`);
            groupElement.appendChild(svgNode);
            combinedSvgContainer.appendChild(groupElement);
        });

        return new XMLSerializer().serializeToString(combinedSvgContainer);
    }

    #performOutputAction(dataContent, dataBlob, exportConfig, completionCallback) {
        const outputActions = {
            'save': () => {
                if (typeof window.saveAs !== 'undefined') {
                    window.saveAs(dataBlob, `${exportConfig.outputFileName}.${exportConfig.outputFormat.split('/').pop()}`);
                } else {
                    this.emitDiagnosticMessage("saveAs function not available. Cannot save file directly.");
                }
            },
            'datastring': () => dataContent,
            'datauristring': () => dataContent,
            'dataurlstring': () => dataContent,
            'dataurlnewwindow': () => window.open(dataContent),
            'datauri': () => window.location.href = dataContent,
            'dataurl': () => window.location.href = dataContent,
            'datastream': () => window.location.href = dataContent.replace(exportConfig.outputFormat, 'application/octet-stream')
        };

        let result = dataBlob;
        const action = outputActions[exportConfig.deliveryMethod];
        if (action) {
            const actionResult = action();
            if (exportConfig.deliveryMethod.includes('string')) {
                result = actionResult;
            }
        } else {
            this.emitDiagnosticMessage("Unknown output delivery method:", exportConfig.deliveryMethod);
        }

        if (completionCallback) {
            completionCallback.apply(this, [result]);
        }
    }

    #handleSvgExport(exportConfig, completionCallback) {
        const svgDataString = this.#composeCombinedSvg();
        const svgBlob = this.#createDataBlob(svgDataString, 'image/svg+xml');

        let finalData = svgDataString;
        if (exportConfig.deliveryMethod.includes('dataurl') || exportConfig.deliveryMethod.includes('datauri')) {
            finalData = `data:image/svg+xml;base64,${btoa(svgDataString)}`;
        }
        this.#performOutputAction(finalData, svgBlob, exportConfig, completionCallback);
    }

    #handlePdfExport(exportConfig, completionCallback) {
        const pdfOutput = this.#producePdfDocument(exportConfig).output('dataurlstring');
        const pdfBlob = this.#createDataBlob(pdfOutput, 'application/pdf');
        this.#performOutputAction(pdfOutput, pdfBlob, exportConfig, completionCallback);
    }

    #handlePngExport(exportConfig, completionCallback) {
        const pngData = this.#outputCanvas.toDataURL('image/png');
        const pngBlob = this.#createDataBlob(pngData, 'image/png');
        this.#performOutputAction(pngData, pngBlob, exportConfig, completionCallback);
    }

    #handleJpegExport(exportConfig, completionCallback) {
        const jpegData = this.#outputCanvas.toDataURL('image/jpeg');
        const jpegBlob = this.#createDataBlob(jpegData, 'image/jpeg');
        this.#performOutputAction(jpegData, jpegBlob, exportConfig, completionCallback);
    }

    exportVisualContent(customConfig, externalCallback) {
        const effectiveConfig = this.#deepMerge(this.#deepMerge({}, this.#derivedConfiguration.itemOutputSettings), customConfig || {});

        if (this.#targetComponent.prepareForExport) {
            this.#targetComponent.prepareForExport();
        }

        const renderCompletionCallback = () => {
            const formatDispatch = {
                'image/svg+xml': this.#handleSvgExport,
                'svg': this.#handleSvgExport,
                'application/pdf': this.#handlePdfExport,
                'pdf': this.#handlePdfExport,
                'image/png': this.#handlePngExport,
                'png': this.#handlePngExport,
                'image/jpeg': this.#handleJpegExport,
                'jpeg': this.#handleJpegExport,
                'jpg': this.#handleJpegExport,
            };

            const handler = formatDispatch[effectiveConfig.outputFormat];
            if (handler) {
                handler.call(this, effectiveConfig, externalCallback);
            } else {
                this.emitDiagnosticMessage("Unsupported export format:", effectiveConfig.outputFormat);
            }
        };

        return this.#renderExportCanvas(effectiveConfig, renderCompletionCallback);
    }

    #renderExportCanvas(exportConfig, renderComplete) {
        this.#outputCanvas = document.createElement('canvas');
        const drawingContext = this.#outputCanvas.getContext('2d');

        // This part assumes that this.#processingState.graphicBuffer has been populated
        // with SVG elements and their {x,y} offsets, similar to AmExport's processing.buffer
        // This population would typically happen in a 'generateButtons' or similar method,
        // which was not provided in the original snippet.
        // For equivalent functionality, we assume `this.#processingState.graphicBuffer` is ready.

        const combinedSvgString = this.#composeCombinedSvg();

        // Determine overall dimensions
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = combinedSvgString;
        document.body.appendChild(tempDiv); // Temporarily add to DOM to get dimensions
        const svgElement = tempDiv.querySelector('svg');
        const svgBounds = svgElement.getBoundingClientRect();
        this.#outputCanvas.width = svgBounds.width;
        this.#outputCanvas.height = svgBounds.height;
        document.body.removeChild(tempDiv);


        if (exportConfig.renderEngine === 'canvg' && typeof window.canvg !== 'undefined') {
            window.canvg(this.#outputCanvas, combinedSvgString, {
                renderCallback: renderComplete,
                ignoreMouse: true,
                ignoreAnimation: true,
                scaleWidth: this.#outputCanvas.width,
                scaleHeight: this.#outputCanvas.height,
                // backgroundColor: exportConfig.backgroundColor // Canvg often takes background here
            });
        } else {
            const img = new Image();
            const selfRef = this;
            img.onload = () => {
                try {
                    drawingContext.drawImage(img, 0, 0);
                    renderComplete();
                } catch (error) {
                    selfRef.emitDiagnosticMessage("Failed to draw SVG to canvas (CORS or other error):", error);
                    renderComplete(); // Still call callback even on error
                }
            };
            img.onerror = (error) => {
                selfRef.emitDiagnosticMessage("Error loading SVG image for canvas rendering:", error);
                renderComplete();
            };
            img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(combinedSvgString)))}`;
        }
    }
}