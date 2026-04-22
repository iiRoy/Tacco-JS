ChartExp.ChartExporter = ChartExp.CommonUtility.defineClass({
	initializeModule: function(targetChart, configurationSettings, autoInitFlag) {
		// Module instance reference
		let selfObj = this;

		// Configuration and state flags
		selfObj.isDebugging = false; // Toggle console output for internal operations
		selfObj.associatedChart = targetChart;
		selfObj.exportCanvas = null; // Canvas element for rasterization
		selfObj.collectedSvgs = []; // Array to hold SVG elements for processing
		selfObj.clientConfig = configurationSettings; // User-provided export settings
		selfObj.buttonGraphicPath = 'exp_btn.png'; // Default path for the export button icon

		// Export format capabilities (default values)
		selfObj.allowPngExport = true;
		selfObj.allowPdfExport = false;
		selfObj.allowJpegExport = false;
		selfObj.allowSvgExport = false;

		// Positioning parameters for the export button (defaults)
		selfObj.rightOffsetPx = 0; // Distance from the right edge
		selfObj.topOffsetPx = 0; // Distance from the top edge

		// Styling parameters for the export button
		selfObj.buttonHoverColor = "#EFEFEF"; // Background color on mouse hover
		selfObj.buttonTextHoverColor = "#CC0000"; // Text color on mouse hover
		selfObj.buttonDisplayOpacity = 0.75; // Initial opacity of the button
		selfObj.buttonMainTitle = "Export chart as image"; // Tooltip title for the button

		selfObj.outputFileName = "chart_export"; // Base filename for exported files
		selfObj.outputBackgroundColor = "#FFFFFF"; // Background color for rasterized images

		// If auto-initialization is requested, perform setup immediately
		if (autoInitFlag === true) {
			selfObj.setupModule();
		} else if (selfObj.isDebugging) {
			console.info("ChartExporter: Auto-initialization skipped. Call setupModule() manually.");
		}
	},

	/**
	 * Converts a dimension value to a CSS-compatible string.
	 * Returns "auto" for undefined values or appends "px" if no unit is specified.
	 * @param {string|number|undefined} val - The dimension value.
	 * @returns {string} Formatted dimension string.
	 */
	formatDimensionValue: function(val) {
		if (typeof val === 'undefined' || val === null) {
			return "auto";
		}
		const valueAsString = String(val);
		if (valueAsString.includes("%") || valueAsString.endsWith("px") || valueAsString.endsWith("em") || valueAsString.endsWith("pt")) {
			return valueAsString;
		} else {
			return valueAsString + "px";
		}
	},

	/**
	 * Initializes the export module, setting up configurations and event listeners.
	 */
	setupModule: function() {
		const selfObj = this;

		// Collect enabled export formats
		const enabledFormats = [];
		if (selfObj.allowPngExport) {
			enabledFormats.push("png");
		}
		if (selfObj.allowPdfExport) {
			enabledFormats.push("pdf");
		}
		if (selfObj.allowJpegExport) {
			enabledFormats.push("jpg");
		}
		if (selfObj.allowSvgExport) {
			enabledFormats.push("svg");
		}

		// Prepare menu items based on enabled formats
		const exportMenuItems = [];
		if (enabledFormats.length === 1) {
			// Single format: direct export button
			const singleFormat = enabledFormats[0];
			exportMenuItems.push({
				outputFormat: singleFormat,
				iconTooltip: selfObj.buttonMainTitle,
				buttonIconUrl: selfObj.associatedChart.pathToImages + selfObj.buttonGraphicPath
			});
		} else if (enabledFormats.length > 1) {
			// Multiple formats: dropdown menu
			const subMenuOptions = enabledFormats.map(fmt => ({
				outputFormat: fmt,
				displayTitle: fmt.toUpperCase()
			}));
			exportMenuItems.push({
				onClickAction: function() { /* Placeholder for dropdown toggle */ },
				buttonIconUrl: selfObj.associatedChart.pathToImages + selfObj.buttonGraphicPath,
				childItems: subMenuOptions
			});
		} else {
			// No export formats enabled, potentially log a warning
			selfObj.debugLog("No export formats enabled. Export button will not be displayed.");
			return; // Exit setup if nothing to export
		}

		// Determine effective colors, falling back to chart defaults if not set
		const effectiveTextColor = selfObj.color || selfObj.associatedChart.color || "#000000";
		const effectiveButtonBgColor = selfObj.buttonColor || "transparent";

		// Build the core configuration object for the export functionality
		selfObj.moduleConfiguration = {
			menuPositionTop: selfObj.formatDimensionValue(selfObj.top),
			menuPositionLeft: selfObj.formatDimensionValue(selfObj.left),
			menuPositionRight: selfObj.formatDimensionValue(selfObj.rightOffsetPx),
			menuPositionBottom: selfObj.formatDimensionValue(selfObj.bottom),
			exportMenuElements: exportMenuItems,
			menuElementStyle: {
				backgroundColor: effectiveButtonBgColor,
				opacity: selfObj.buttonDisplayOpacity,
				hoverBackgroundColor: selfObj.buttonHoverColor,
				textColor: effectiveTextColor,
				hoverTextColor: selfObj.buttonTextHoverColor,
				paddingVertical: '6px', // Combined padding for top/bottom
				paddingHorizontal: '6px', // Combined padding for left/right
				marginReset: '0px', // Reset all margins
				textAlign: 'left',
				textDecoration: 'none',
				fontFamily: selfObj.associatedChart.fontFamily || 'sans-serif',
				fontSize: (selfObj.associatedChart.fontSize ? selfObj.associatedChart.fontSize + 'px' : '13px')
			},
			outputSettings: {
				outputBackgroundColor: selfObj.outputBackgroundColor,
				outputFileName: selfObj.outputFileName,
				defaultFormat: 'png',
				outputMethod: 'dataurlnewwindow', // Default output: open in new tab
				renderingEngine: 'browser', // Default rendering: browser canvas
				imageDPI: 90,
				onOutputClick: function(exporterInstance, currentConfig, clickEvent) {
					clickEvent.preventDefault();
					exporterInstance.initiateExportProcess(currentConfig);
				}
			},
			stripChartImagery: true // Flag to remove images from SVG if desired
		};

		// Initialize processing state for asynchronous operations
		selfObj.exportProcessingState = {
			dataBuffer: [],
			elementsProcessed: 0,
			processingTimerId: 0
		};

		// Adapt output settings based on available libraries
		if (typeof window.canvg !== 'undefined' && typeof window.RGBColor !== 'undefined') {
			selfObj.moduleConfiguration.outputSettings.renderingEngine = 'canvg';
		}
		if (typeof window.saveAs !== 'undefined') {
			selfObj.moduleConfiguration.outputSettings.outputMethod = 'save'; // Use FileSaver.js if available
		}
		if (ChartExp.CommonUtility.isIE && ChartExp.CommonUtility.getIEVersion() < 10) {
			selfObj.moduleConfiguration.outputSettings.outputMethod = 'dataurlnewwindow'; // IE fallback
		}

		// Merge client-provided configurations
		const clientCfg = selfObj.clientConfig;
		if (clientCfg) {
			selfObj.moduleConfiguration.outputSettings = ChartExp.CommonUtility.deepMerge(selfObj.moduleConfiguration.outputSettings, clientCfg.outputSettings || {});
			selfObj.moduleConfiguration.menuElementStyle = ChartExp.CommonUtility.deepMerge(selfObj.moduleConfiguration.menuElementStyle, clientCfg.menuElementStyle || {});
			self.moduleConfiguration = ChartExp.CommonUtility.deepMerge(selfObj.moduleConfiguration, clientCfg);
		}

		// Establish a reference to this module on the chart object
		selfObj.associatedChart.chartExporterInstance = selfObj;

		// Attach an event listener to the chart's rendering cycle
		selfObj.associatedChart.addListener('rendered', function() {
			selfObj.prepareExportEnvironment();
		});

		// Make the instance globally accessible for debugging if enabled
		if (selfObj.isDebugging) {
			window.ChartExporterGlobalRef = selfObj;
			selfObj.debugLog("ChartExporter instance available as window.ChartExporterGlobalRef");
		}
	},

	/**
	 * Logs messages to the console if debugging is enabled.
	 * @param {...any} messages - Messages to log.
	 */
	debugLog: function() {
		if (this.isDebugging && typeof console !== 'undefined' && console.log) {
			console.log('ChartExporter: ', ...arguments);
		}
	},

	/**
	 * Prepares the chart's environment for export operations.
	 */
	prepareExportEnvironment: function() {
		const selfObj = this;

		// Only generate buttons for modern browsers or IE10+
		if (!ChartExp.CommonUtility.isIE || (ChartExp.CommonUtility.isIE && ChartExp.CommonUtility.getIEVersion() > 9)) {
			selfObj.generateExportButtons();
		} else {
			selfObj.debugLog("Skipping button generation for older IE versions.");
		}
	},

	/**
	 * Decodes a base64 string into a Uint8Array (binary array).
	 * @param {string} base64EncodedString - The base64 string to decode.
	 * @returns {Uint8Array} The decoded binary data.
	 * @copyright Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
	 */
	decodeBase64ToBuffer: function(base64EncodedString) {
		const stringLength = base64EncodedString.length;
		// Calculate buffer size: (length / 4 * 3) to account for padding
		const outputBuffer = new Uint8Array(Math.floor(stringLength / 4 * 3));
		let currentInputIndex = 0;
		let outputArrayIndex = 0;
		let carryValue = 0;
		let bitState = 0;
		let prevChar = [0, 0]; // Stores last two characters to check for padding

		// Lookup table for base64 characters. -1 indicates invalid, 255 for padding.
		const base64CharRankMap = new Uint8Array([
			62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
		]);

		while (currentInputIndex < stringLength) {
			const charCode = base64EncodedString.charCodeAt(currentInputIndex++);
			// Map character code to its base64 rank value
			const rankValue = base64CharRankMap[charCode - 43];

			if (rankValue !== 255 && rankValue !== undefined) { // Check if valid base64 char
				prevChar[1] = prevChar[0]; // Shift last character
				prevChar[0] = charCode; // Store current character

				carryValue = (carryValue << 6) | rankValue; // Accumulate 6 bits
				bitState++; // Increment bit state (0 to 3)

				if (bitState === 4) { // Four 6-bit chunks make 3 bytes (24 bits)
					outputBuffer[outputArrayIndex++] = (carryValue >>> 16) & 0xFF; // First byte
					if (prevChar[1] !== 61 /* padding character '=' */ ) {
						outputBuffer[outputArrayIndex++] = (carryValue >>> 8) & 0xFF; // Second byte
					}
					if (prevChar[0] !== 61 /* padding character '=' */ ) {
						outputBuffer[outputArrayIndex++] = carryValue & 0xFF; // Third byte
					}
					bitState = 0; // Reset state
				}
			}
		}
		// Return a sliced array to remove any potential null bytes at the end due to padding
		return outputBuffer.slice(0, outputArrayIndex);
	},

	/**
	 * Creates a Blob object from a data URI string.
	 * Handles base64 encoded data and provides a fallback for older IE versions.
	 * @param {string} dataUriString - The data URI string (e.g., "data:image/png;base64,...").
	 * @param {string} mimeType - The MIME type of the data (e.g., "image/png").
	 * @returns {Blob|object} A Blob object or a Blob-like object for IE.
	 */
	createDataBlob: function(dataUriString, mimeType) {
		const selfObj = this;
		let dataContent = dataUriString;
		let isBase64Encoded = false;
		let blobObject;

		// Determine if the data is base64 encoded
		const commaIndex = dataUriString.indexOf(',');
		if (commaIndex !== -1) {
			const header = dataUriString.substring(0, commaIndex);
			if (header.includes('base64')) {
				isBase64Encoded = true;
				dataContent = dataUriString.substring(commaIndex + 1);
			}
		}

		// Convert base64 data to binary array if necessary
		if (isBase64Encoded) {
			dataContent = selfObj.decodeBase64ToBuffer(dataContent);
		}

		// Check for native Blob support
		if (typeof Blob !== 'undefined' && !(ChartExp.CommonUtility.isIE && ChartExp.CommonUtility.getIEVersion() < 10)) {
			blobObject = new Blob([dataContent], {
				type: mimeType
			});
		} else {
			// Fallback for older IE versions
			selfObj.debugLog("Using IE fallback for Blob creation.");
			blobObject = {
				data: dataContent,
				size: dataContent.length,
				type: mimeType,
				encoding: isBase64Encoded ? 'base64' : 'binary'
			};
		}
		return blobObject;
	},

	/**
	 * Generates a PDF document from the current canvas content using jsPDF.
	 * @param {object} exportConfig - Configuration object for the export.
	 * @returns {object} The jsPDF document instance.
	 */
	producePDFDocument: function(exportConfig) {
		const selfObj = this;
		const pdfInstance = {
			output: function() {
				return '';
			}
		}; // Default dummy object

		if (!window.jsPDF) {
			console.error("ChartExporter Error: jsPDF library not found. Please include jsPDF.");
			alert("Error: Missing jsPDF library for PDF export.");
			return pdfInstance;
		}
		if (typeof jsPDF !== 'function') {
			console.error("ChartExporter Error: jsPDF is not a constructor. Ensure jsPDF is correctly loaded.");
			alert("Error: jsPDF library not properly initialized.");
			return pdfInstance;
		}

		const imageData = selfObj.exportCanvas.toDataURL('image/jpeg'); // jsPDF typically uses JPEG for raster images
		const canvasWidthMM = (selfObj.exportCanvas.width * 25.4) / (exportConfig.imageDPI || 90);
		const canvasHeightMM = (selfObj.exportCanvas.height * 25.4) / (exportConfig.imageDPI || 90);

		try {
			const doc = new jsPDF({
				unit: 'mm',
				format: [canvasWidthMM, canvasHeightMM]
			});

			if (typeof doc.addImage === 'function') {
				doc.addImage(imageData, 'JPEG', 0, 0, canvasWidthMM, canvasHeightMM);
			} else {
				console.error("ChartExporter Error: jsPDF 'addImage' plugin not found. Please ensure it's loaded.");
				alert("Error: Missing jsPDF addImage plugin.");
			}
			return doc;
		} catch (err) {
			console.error("ChartExporter Error during PDF generation:", err);
			alert("Error generating PDF: " + err.message);
			return pdfInstance;
		}
	},

	/**
	 * Orchestrates the export process based on the given configuration.
	 * @param {object} exportConfig - Configuration for the export operation.
	 * @param {function} [externalCompletionCallback] - Optional callback to execute after output.
	 * @returns {Promise<void>} A promise that resolves when output generation is complete.
	 */
	initiateExportProcess: function(exportConfig, externalCompletionCallback) {
		const selfObj = this;

		// Merge default output settings with current export configuration
		const effectiveConfig = ChartExp.CommonUtility.deepMerge(
			ChartExp.CommonUtility.deepMerge({}, selfObj.moduleConfiguration.outputSettings),
			exportConfig || {}
		);

		// Prepare the chart for export if the method exists
		if (typeof selfObj.associatedChart.prepareForExport === 'function') {
			selfObj.associatedChart.prepareForExport();
		}

		/**
		 * Handles the final output of the generated data (image, PDF, SVG).
		 * This function is called after rendering to canvas or SVG assembly.
		 * @param {string|Blob|object} rawData - The raw data to be outputted.
		 * @param {string} currentFormat - The format being exported (e.g., 'png', 'pdf', 'svg').
		 */
		const handleFinalOutput = function(rawData, currentFormat) {
			let outputBlob;
			let outputData = rawData;
			let mimeType;
			let fileNameExtension;

			switch (currentFormat) {
				case 'svg':
				case 'image/svg+xml':
					mimeType = 'image/svg+xml';
					fileNameExtension = '.svg';
					outputBlob = selfObj.createDataBlob(outputData, mimeType);
					break;
				case 'pdf':
				case 'application/pdf':
					mimeType = 'application/pdf';
					fileNameExtension = '.pdf';
					outputData = selfObj.producePDFDocument(effectiveConfig).output('dataurlstring');
					outputBlob = selfObj.createDataBlob(outputData, mimeType);
					break;
				case 'png':
				case 'image/png':
					mimeType = 'image/png';
					fileNameExtension = '.png';
					outputData = selfObj.exportCanvas.toDataURL('image/png');
					outputBlob = selfObj.createDataBlob(outputData, mimeType);
					break;
				case 'jpg':
				case 'jpeg':
				case 'image/jpeg':
					mimeType = 'image/jpeg';
					fileNameExtension = '.jpg';
					outputData = selfObj.exportCanvas.toDataURL('image/jpeg');
					outputBlob = selfObj.createDataBlob(outputData, mimeType);
					break;
				default:
					selfObj.debugLog("Unknown export format:", currentFormat);
					if (externalCompletionCallback) {
						externalCompletionCallback.apply(selfObj, [null, new Error("Unsupported format")]);
					}
					return;
			}

			const finalFileName = effectiveConfig.outputFileName + fileNameExtension;

			switch (effectiveConfig.outputMethod) {
				case 'save':
					if (typeof window.saveAs === 'function') {
						window.saveAs(outputBlob, finalFileName);
					} else {
						selfObj.debugLog("FileSaver.js not found for 'save' output method. Falling back to 'dataurlnewwindow'.");
						window.open(outputData);
					}
					break;
				case 'dataurlnewwindow':
					window.open(outputData);
					break;
				case 'datauristring':
				case 'datastring':
				case 'dataurlstring':
					// Blob already contains the data, or outputData is the string
					outputBlob = outputData; // In these cases, return the string itself
					break;
				case 'datauri':
				case 'dataurl':
					window.location.href = outputData;
					break;
				case 'datastream':
					// For datastream, change MIME type to force download
					let streamData = outputData;
					if (mimeType.includes('image/') || mimeType.includes('application/pdf')) {
						streamData = streamData.replace(mimeType, 'application/octet-stream');
					}
					window.location.href = streamData;
					break;
				default:
					selfObj.debugLog("Unknown output method:", effectiveConfig.outputMethod);
					break;
			}

			if (externalCompletionCallback) {
				externalCompletionCallback.apply(selfObj, [outputBlob]);
			}
		};

		return selfObj.orchestrateOutputGeneration(effectiveConfig, function(generatedContent) {
			handleFinalOutput(generatedContent, effectiveConfig.format);
		});
	},

	/**
	 * Enhances and processes an SVG element for export,
	 * optionally embedding images as base64 data URIs.
	 * @param {SVGElement} rawSvgElement - The SVG DOM element to process.
	 * @returns {SVGElement} The processed SVG element.
	 */
	enhanceSvgForExport: function(rawSvgElement) {
		const selfObj = this;

		/**
		 * Recursively processes image-related elements within an SVG.
		 * Converts external image references to embedded data URIs if stripChartImagery is false.
		 * @param {SVGElement} parentSvg - The SVG element to search within.
		 * @param {string} tagName - The tag name to target (e.g., 'image', 'pattern').
		 */
		function processImageReferences(parentSvg, tagName) {
			const elementsToProcess = Array.from(parentSvg.getElementsByTagName(tagName));

			for (const element of elementsToProcess) {
				if (selfObj.moduleConfiguration.stripChartImagery) {
					// Remove the element if stripping imagery is enabled
					element.parentNode.removeChild(element);
					continue;
				}

				const imageUrl = element.getAttribute('xlink:href') || element.getAttribute('href');
				if (!imageUrl) {
					selfObj.debugLog(`Skipping ${tagName} element with no href/xlink:href attribute.`);
					continue;
				}

				const imageWidth = parseInt(element.getAttribute('width'), 10);
				const imageHeight = parseInt(element.getAttribute('height'), 10);

				if (isNaN(imageWidth) || isNaN(imageHeight) || imageWidth <= 0 || imageHeight <= 0) {
					selfObj.debugLog(`Skipping ${tagName} element with invalid dimensions: ${imageUrl}`);
					continue;
				}

				const tempImage = new Image();
				tempImage.crossOrigin = 'Anonymous'; // Attempt to enable CORS for images
				tempImage.src = imageUrl;

				const tempCanvas = document.createElement('canvas');
				tempCanvas.width = imageWidth;
				tempCanvas.height = imageHeight;
				const canvasContext = tempCanvas.getContext('2d');

				try {
					tempImage.onload = function() {
						canvasContext.drawImage(tempImage, 0, 0, imageWidth, imageHeight);
						const dataUri = tempCanvas.toDataURL(); // Convert image to data URI
						element.setAttribute('xlink:href', dataUri); // Update SVG element
						element.removeAttribute('href'); // Remove standard href if xlink is used
					};
					tempImage.onerror = function(err) {
						selfObj.debugLog('Warning: Could not load image for embedding due to CORS or other error:', imageUrl, err);
						// Fallback: keep original URL or remove element
						// For now, we'll keep the original URL if loading fails.
					};
				} catch (err) {
					selfObj.debugLog('Error processing image for embedding (likely tainted canvas due to CORS):', imageUrl, err);
					// If error, likely tainted canvas, keep original image source or remove it
					if (selfObj.isDebugging) {
						console.warn('Tainted canvas detected. Image origin must match server for embedding:', imageUrl);
					}
					// Consider removing the image or leaving it as is if embedding fails
				}
			}
		}

		// Ensure necessary XML namespaces for valid SVG output
		if (ChartExp.CommonUtility.getIEVersion() === 0) { // Not IE
			if (!rawSvgElement.hasAttribute('xmlns')) {
				rawSvgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			}
			if (!selfObj.moduleConfiguration.stripChartImagery && !rawSvgElement.hasAttribute('xmlns:xlink')) {
				rawSvgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
			}
		}

		// Process specific elements
		processImageReferences(rawSvgElement, 'pattern');
		processImageReferences(rawSvgElement, 'image');

		selfObj.collectedSvgs.push(rawSvgElement); // Add processed SVG to collection
		return rawSvgElement;
	},

	/**
	 * Combines all collected SVG elements into a single SVG document string.
	 * Each SVG is placed within a group with its original transform applied.
	 * @returns {string} The serialized combined SVG string.
	 */
	assembleCombinedSvg: function() {
		const selfObj = this;
		if (selfObj.exportProcessingState.dataBuffer.length === 0) {
			selfObj.debugLog("No SVG elements in buffer to assemble.");
			return "";
		}

		// Create a root SVG element to hold all chart SVG parts
		const combinedSvgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		combinedSvgRoot.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		combinedSvgRoot.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

		// Iterate through buffered SVG data and append to the root
		for (const svgDataEntry of selfObj.exportProcessingState.dataBuffer) {
			const originalSvgElement = svgDataEntry[0];
			const originalPosition = svgDataEntry[1];

			// Create a group element to apply translation
			const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
			groupElement.setAttribute('transform', `translate(${originalPosition.x},${originalPosition.y})`);

			// Append the original SVG content to the group
			// Note: This might need deep cloning if originalSvgElement is still live DOM element
			groupElement.appendChild(originalSvgElement.cloneNode(true));
			combinedSvgRoot.appendChild(groupElement);
		}

		// Serialize the combined SVG DOM object to a string
		if (typeof XMLSerializer !== 'undefined') {
			return new XMLSerializer().serializeToString(combinedSvgRoot);
		} else {
			selfObj.debugLog("XMLSerializer not available, cannot generate SVG string.");
			return "";
		}
	},

	/**
	 * Generates the output (canvas or SVG) based on the configuration and
	 * invokes a callback upon completion.
	 * @param {object} cfg - Configuration object for output generation.
	 * @param {function} completionCallback - Callback function to execute after output is ready.
	 * @returns {Promise<void>} A promise that resolves when generation is complete.
	 */
	orchestrateOutputGeneration: function(cfg, completionCallback) {
		const selfObj = this;
		selfObj.exportProcessingState.dataBuffer = []; // Clear previous buffer
		selfObj.exportProcessingState.elementsProcessed = 0;

		// Collect all SVG elements from the chart's container
		const chartSvgElements = Array.from(selfObj.associatedChart.div.getElementsByTagName('svg'));

		if (chartSvgElements.length === 0) {
			selfObj.debugLog("No SVG elements found in chart container for export.");
			completionCallback(null, new Error("No SVG elements to export."));
			return Promise.resolve();
		}

		let totalSvgWidth = 0;
		let totalSvgHeight = 0;

		// Determine overall dimensions and collect SVG data
		chartSvgElements.forEach(svgElem => {
			const svgBoundingRect = svgElem.getBoundingClientRect();
			const chartBoundingRect = selfObj.associatedChart.div.getBoundingClientRect();

			// Calculate relative position within the chart's div
			const relativeX = svgBoundingRect.left - chartBoundingRect.left;
			const relativeY = svgBoundingRect.top - chartBoundingRect.top;

			const currentSvgWidth = svgElem.width.baseVal.value || svgBoundingRect.width;
			const currentSvgHeight = svgElem.height.baseVal.value || svgBoundingRect.height;

			totalSvgWidth = Math.max(totalSvgWidth, relativeX + currentSvgWidth);
			totalSvgHeight = Math.max(totalSvgHeight, relativeY + currentSvgHeight);

			selfObj.exportProcessingState.dataBuffer.push([svgElem, {
				x: relativeX,
				y: relativeY,
				width: currentSvgWidth,
				height: currentSvgHeight
			}]);
		});

		// Create a canvas for rasterization or a combined SVG for direct SVG export
		if (cfg.format === 'svg' || cfg.format === 'image/svg+xml') {
			const combinedSvgString = selfObj.assembleCombinedSvg();
			completionCallback(combinedSvgString);
			return Promise.resolve();
		}

		// For raster formats (PNG, JPG, PDF), create a canvas
		if (!selfObj.exportCanvas) {
			selfObj.exportCanvas = document.createElement('canvas');
		}
		selfObj.exportCanvas.width = totalSvgWidth;
		selfObj.exportCanvas.height = totalSvgHeight;

		const canvasContext = selfObj.exportCanvas.getContext('2d');
		if (!canvasContext) {
			selfObj.debugLog("Failed to get 2D context for canvas.");
			completionCallback(null, new Error("Canvas context not available."));
			return Promise.resolve();
		}

		// Fill background
		canvasContext.fillStyle = cfg.outputBackgroundColor;
		canvasContext.fillRect(0, 0, selfObj.exportCanvas.width, selfObj.exportCanvas.height);

		let promises = [];

		// Process each SVG element for drawing onto the canvas
		selfObj.exportProcessingState.dataBuffer.forEach(entry => {
			const svgElement = entry[0];
			const position = entry[1];

			// Create a temporary SVG string for canvg or direct image rendering
			let svgString = new XMLSerializer().serializeToString(selfObj.enhanceSvgForExport(svgElement.cloneNode(true)));
			let svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Base64 encode for rendering

			promises.push(new Promise((resolve, reject) => {
				if (cfg.renderingEngine === 'canvg' && typeof window.canvg === 'function') {
					// Use canvg for rendering SVG to canvas
					try {
						window.canvg(selfObj.exportCanvas, svgString, {
							ignoreMouse: true,
							ignoreAnimation: true,
							ignoreDimensions: true, // Let canvas size dictate
							scaleWidth: position.width,
							scaleHeight: position.height,
							offsetX: position.x,
							offsetY: position.y,
							renderCallback: function() {
								selfObj.debugLog("canvg rendered an SVG part.");
								resolve();
							},
							errorHandler: function(err) {
								selfObj.debugLog("canvg error:", err);
								reject(err);
							}
						});
					} catch (e) {
						selfObj.debugLog("Error with canvg:", e);
						reject(e);
					}
				} else {
					// Fallback to Image object rendering (less compatible with complex SVGs)
					const img = new Image();
					img.src = svgBase64;
					img.onload = () => {
						try {
							canvasContext.drawImage(img, position.x, position.y, position.width, position.height);
							resolve();
						} catch (e) {
							selfObj.debugLog("Error drawing SVG image to canvas:", e);
							reject(e);
						}
					};
					img.onerror = (err) => {
						selfObj.debugLog("Error loading SVG as image:", err);
						reject(err);
					};
				}
			}));
		});

		return Promise.all(promises)
			.then(() => {
				selfObj.debugLog("All SVG elements rendered to canvas.");
				completionCallback();
			})
			.catch(error => {
				selfObj.debugLog("Error during canvas rendering process:", error);
				completionCallback(null, error);
			});
	}
});

// Utility functions (similar to AmCharts.extend, AmCharts.isIE, etc.)
// These would typically be part of a common utility library.
ChartExp.CommonUtility = {
	defineClass: function(proto) {
		function Class() {
			if (proto.initializeModule) {
				proto.initializeModule.apply(this, arguments);
			}
		}
		Class.prototype = proto;
		return Class;
	},

	deepMerge: function(target, source) {
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
					target[key] = ChartExp.CommonUtility.deepMerge(target[key], source[key]);
				} else {
					target[key] = source[key];
				}
			}
		}
		return target;
	},

	isIE: (function() {
		const ua = navigator.userAgent;
		return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
	})(),

	getIEVersion: function() {
		const ua = navigator.userAgent;
		let rv = 0;
		if (navigator.appName === 'Microsoft Internet Explorer') {
			const re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) !== null) {
				rv = parseFloat(RegExp.$1);
			}
		} else if (ua.indexOf('Trident/') > -1) {
			const re = new RegExp("rv:([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) !== null) {
				rv = parseFloat(RegExp.$1);
			}
		}
		return rv;
	}
};