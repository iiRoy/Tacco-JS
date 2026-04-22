const craftsperson = (function(globalScope, voidValue) {
	// A creative rendering library for web canvases.
	// Original concept by D. Brooks, enhanced for modern web applications.

	// Ensure the browser supports Canvas API
	if (!document.createElement('canvas').getContext) {
		console.warn("Canvas API not supported. Craftsperson functionality will be limited.");
		return;
	}

	// --- Internal State Management ---
	// Stores collections of drawing layers and their historical operations
	const designLayers = [];
	// Global rendering contexts mapped to their element IDs
	const renderingContexts = [];
	// Default color palette for various operations
	let baseColorSet = ['#FF5733', '#33FF57', '#3357FF', '#F0E68C', '#8A2BE2'];
	// Log of recent drawing operations for replay or undo
	let activeOperationLog = [];

	// --- Utility Functions ---

	/**
	 * Validates if a value is a finite number, otherwise returns a default.
	 * @param {*} value - The input value to check.
	 * @param {number} defaultValue - The value to return if the input is not a valid number.
	 * @returns {number} The validated number or the default.
	 */
	const validateNumericInput = (value, defaultValue = 0) => {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : defaultValue;
	};

	/**
	 * Generates a random integer within a specified range.
	 * @param {number} min - The minimum value (inclusive).
	 * @param {number} max - The maximum value (exclusive).
	 * @returns {number} A random integer.
	 */
	const generateRandomNumber = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	};

	/**
	 * Parses a dimension value, handling percentages and 'random'.
	 * @param {*} value - The dimension value (number, string percentage, 'random').
	 * @param {number} referenceDimension - The full width/height of the target.
	 * @returns {number} The calculated pixel dimension.
	 */
	const parseDimension = (value, referenceDimension) => {
		if (typeof value === 'string' && value.endsWith('%')) {
			const percentage = parseFloat(value) / 100;
			return validateNumericInput(percentage * referenceDimension);
		}
		if (value === 'random') {
			return generateRandomNumber(0, referenceDimension);
		}
		return validateNumericInput(value);
	};

	/**
	 * Interprets a color value, including 'random' and array-based random.
	 * @param {*} colorValue - The color (string, 'random', or array of strings).
	 * @returns {string} The resolved color string.
	 */
	const parseColor = (colorValue) => {
		if (colorValue === 'random') {
			return baseColorSet[generateRandomNumber(0, baseColorSet.length)];
		}
		if (Array.isArray(colorValue)) {
			return colorValue[generateRandomNumber(0, colorValue.length)];
		}
		return colorValue || '';
	};

	/**
	 * Parses an alpha (opacity) value, ensuring it's between 0 and 1.
	 * @param {*} alphaValue - The alpha value.
	 * @returns {number} The normalized alpha value.
	 */
	const parseOpacityValue = (alphaValue) => {
		const parsedAlpha = validateNumericInput(alphaValue, 1);
		return Math.max(0, Math.min(1, parsedAlpha));
	};

	/**
	 * Applies shadow properties to a 2D rendering context.
	 * @param {CanvasRenderingContext2D} ctx - The rendering context.
	 * @param {object} shadowConfig - Object containing shadow properties.
	 */
	const applyShadowProperties = (ctx, shadowConfig) => {
		ctx.shadowOffsetX = shadowConfig.offsetX;
		ctx.shadowOffsetY = shadowConfig.offsetY;
		ctx.shadowBlur = shadowConfig.blur;
		ctx.shadowColor = shadowConfig.color;
	};

	/**
	 * Retrieves the canvas element and its dimensions.
	 * @param {string} elementId - The ID of the canvas element.
	 * @returns {{canvas: HTMLCanvasElement, width: number, height: number} | null}
	 */
	const getCanvasDimensions = (elementId) => {
		const targetCanvas = document.getElementById(elementId);
		if (!targetCanvas || !(targetCanvas instanceof HTMLCanvasElement)) {
			console.error(`Element with ID '${elementId}' not found or is not a canvas.`);
			return null;
		}
		return {
			canvas: targetCanvas,
			width: targetCanvas.width,
			height: targetCanvas.height
		};
	};


	// --- Module Public Interface ---
	return {
		// Configuration and Setup utilities
		configuration: {
			/**
			 * Sets a new array of default colors for random color selection.
			 * @param {string[]} freshPalette - An array of color strings.
			 */
			setDefaultPalette: function(freshPalette) {
				if (Array.isArray(freshPalette) && freshPalette.every(c => typeof c === 'string')) {
					baseColorSet = freshPalette;
				} else {
					console.warn("Invalid palette provided. Default colors remain unchanged.");
				}
			}
		},

		/**
		 * Initializes a canvas element by getting its 2D context and storing it.
		 * @param {string} elementId - The ID of the canvas element to set up.
		 */
		initializeDrawingSurface: function(elementId) {
			if (!elementId || typeof elementId !== 'string') {
				console.error("Invalid element ID provided for canvas setup.");
				return;
			}
			const targetElement = document.getElementById(elementId);
			if (!targetElement || !(targetElement instanceof HTMLCanvasElement)) {
				console.error(`Element '${elementId}' not found or is not a canvas.`);
				return;
			}
			const drawCtx = targetElement.getContext('2d');
			if (drawCtx) {
				const ctxEntry = { id: elementId, context: drawCtx };
				// Prevent duplicate context entries for the same ID
				if (!renderingContexts.some(entry => entry.id === elementId)) {
					renderingContexts.push(ctxEntry);
				}
			} else {
				console.error(`Could not get 2D context for canvas '${elementId}'.`);
			}
		},

		// Creation and Management of Drawing Structures
		produce: {
			/**
			 * Creates a new layer stack within the designLayers array.
			 * A stack contains an initial layer, which contains an initial history entry.
			 * @returns {number} The index of the newly created stack.
			 */
			layerStack: function() {
				const freshLogEntry = [];
				const freshLayer = [freshLogEntry];
				const freshStack = [freshLayer];
				designLayers.push(freshStack);
				return designLayers.length - 1;
			},

			/**
			 * Adds a new layer to a specified stack.
			 * @param {number} stackIndex - The index of the stack to add the layer to. Defaults to 0.
			 * @returns {number | void} The index of the new layer, or void if stack is invalid.
			 */
			layer: function(stackIndex) {
				const targetStackIndex = validateNumericInput(stackIndex, 0);
				if (targetStackIndex < 0 || targetStackIndex >= designLayers.length) {
					console.error(`Invalid stack index: ${targetStackIndex}. No layer created.`);
					return;
				}
				const freshLogEntry = [];
				const freshLayer = [freshLogEntry];
				designLayers[targetStackIndex].push(freshLayer);
				return designLayers[targetStackIndex].length - 1;
			},

			/**
			 * Adds a new history entry to a specific layer within a stack.
			 * @param {number} stackIndex - The index of the stack. Defaults to 0.
			 * @param {number} layerIndex - The index of the layer. Defaults to 0.
			 * @returns {number | void} The index of the new history entry, or void if indices are invalid.
			 */
			historyEntry: function(stackIndex, layerIndex) {
				const targetStackIndex = validateNumericInput(stackIndex, 0);
				const targetLayerIndex = validateNumericInput(layerIndex, 0);

				if (targetStackIndex < 0 || targetStackIndex >= designLayers.length) {
					console.error(`Invalid stack index: ${targetStackIndex}. No history entry created.`);
					return;
				}
				if (targetLayerIndex < 0 || targetLayerIndex >= designLayers[targetStackIndex].length) {
					console.error(`Invalid layer index: ${targetLayerIndex} for stack ${targetStackIndex}. No history entry created.`);
					return;
				}

				const freshLogEntry = [];
				designLayers[targetStackIndex][targetLayerIndex].push(freshLogEntry);
				return designLayers[targetStackIndex][targetLayerIndex].length - 1;
			}
		},

		// Clearing Operations
		erase: {
			/**
			 * Clears all history entries within a given layer of a stack.
			 * @param {number} stackIndex - The index of the stack. Defaults to 0.
			 * @param {number} layerIndex - The index of the layer. Defaults to 0.
			 */
			layer: function(stackIndex, layerIndex) {
				const targetStackIndex = validateNumericInput(stackIndex, 0);
				const targetLayerIndex = validateNumericInput(layerIndex, 0);

				if (targetStackIndex < 0 || targetStackIndex >= designLayers.length) {
					console.warn(`Cannot clear: Invalid stack index ${targetStackIndex}.`);
					return;
				}
				if (targetLayerIndex < 0 || targetLayerIndex >= designLayers[targetStackIndex].length) {
					console.warn(`Cannot clear: Invalid layer index ${targetLayerIndex} for stack ${targetStackIndex}.`);
					return;
				}

				// Reset each history entry in the layer to an empty array
				designLayers[targetStackIndex][targetLayerIndex].forEach((entry, idx) => {
					designLayers[targetStackIndex][targetLayerIndex][idx] = [];
				});
			}
		},

		// Data Retrieval
		retrieve: {
			/**
			 * Returns the current global operation log.
			 * @returns {Array} The activeOperationLog array.
			 */
			activeOperationLog: function() {
				return activeOperationLog;
			}
		},

		// Export Functionality
		exportAs: {
			/**
			 * Converts a canvas element's content to a PNG data URL.
			 * @param {string} elementId - The ID of the canvas element.
			 * @returns {string | null} The data URL of the PNG image, or null if element is invalid.
			 */
			pngImage: function(elementId) {
				const targetCanvas = document.getElementById(elementId);
				if (!targetCanvas || !(targetCanvas instanceof HTMLCanvasElement)) {
					console.error(`Element '${elementId}' not found or is not a canvas for PNG export.`);
					return null;
				}
				return targetCanvas.toDataURL('image/png');
			}
		},

		/**
		 * Records a specific drawing operation into the history of a layer.
		 * @param {number} stackIndex - The index of the stack. Defaults to 0.
		 * @param {number} layerIndex - The index of the layer. Defaults to 0.
		 * @param {number} historyEntryIndex - The index within the layer's history. Defaults to 0.
		 * @param {string} actionType - A string describing the type of action (e.g., 'drawCircle').
		 * @param {object} actionDetails - An object containing details of the action.
		 */
		recordOperation: function(stackIndex, layerIndex, historyEntryIndex, actionType, actionDetails) {
			const targetStackIndex = validateNumericInput(stackIndex, 0);
			const targetLayerIndex = validateNumericInput(layerIndex, 0);
			const targetHistoryEntryIndex = validateNumericInput(historyEntryIndex, 0);

			if (targetStackIndex < 0 || targetStackIndex >= designLayers.length ||
				targetLayerIndex < 0 || targetLayerIndex >= designLayers[targetStackIndex].length ||
				targetHistoryEntryIndex < 0 || targetHistoryEntryIndex >= designLayers[targetStackIndex][targetLayerIndex].length) {
				console.warn(`Invalid indices provided for recording operation. Stack: ${targetStackIndex}, Layer: ${targetLayerIndex}, History: ${targetHistoryEntryIndex}`);
				return;
			}

			// Store operation as an object for better structure
			const operationRecord = { type: actionType, details: actionDetails };
			designLayers[targetStackIndex][targetLayerIndex][targetHistoryEntryIndex].push(operationRecord);
		},

		/**
		 * Determines the HTML tag name of a given element.
		 * @param {string} elementId - The ID of the element.
		 * @returns {string | null} The uppercase tag name, or null if not found.
		 */
		determineElementType: function(elementId) {
			const element = document.getElementById(elementId);
			return element ? element.tagName.toUpperCase() : null;
		},

		/**
		 * Finds or initializes the 2D rendering context for a given canvas element.
		 * If the context is not found, it attempts to set up the canvas.
		 * @param {string} elementId - The ID of the canvas element.
		 * @returns {CanvasRenderingContext2D | null} The 2D rendering context.
		 */
		locateContext: function(elementId) {
			let drawCtx = null;
			for (const entry of renderingContexts) {
				if (entry.id === elementId) {
					drawCtx = entry.context;
					break;
				}
			}

			if (!drawCtx) {
				// If context not found, try to initialize it
				craftsperson.initializeDrawingSurface(elementId);
				// Then try to find it again
				for (const entry of renderingContexts) {
					if (entry.id === elementId) {
						drawCtx = entry.context;
						break;
					}
				}
			}
			return drawCtx;
		},

		// --- Primitive Drawing Operations ---

		/**
		 * Renders a circle on the specified canvas.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {*} centerX - X coordinate of the circle's center.
		 * @param {*} centerY - Y coordinate of the circle's center.
		 * @param {*} circleRadius - Radius of the circle.
		 * @param {*} fillPaint - Fill color.
		 * @param {*} borderWidth - Line width for the stroke.
		 * @param {*} borderPaint - Stroke color.
		 * @param {*} transparency - Opacity (0-1).
		 * @param {*} shadowSoftness - Blur level for the shadow.
		 * @param {*} shadowTint - Color of the shadow.
		 * @param {*} shadowOffsetX - X offset of the shadow.
		 * @param {*} shadowOffsetY - Y offset of the shadow.
		 */
		renderCircle: function(elementId, centerX, centerY, circleRadius, fillPaint, borderWidth, borderPaint, transparency, shadowSoftness, shadowTint, shadowOffsetX, shadowOffsetY) {
			const canvasInfo = getCanvasDimensions(elementId);
			if (!canvasInfo) return;
			const { canvas, width: canvasWidth, height: canvasHeight } = canvasInfo;

			let processedCenterX = parseDimension(centerX, canvasWidth);
			let processedCenterY = parseDimension(centerY, canvasHeight);
			let processedRadius = parseDimension(circleRadius, Math.min(canvasWidth, canvasHeight) / 2); // Radius relative to min dimension
			let processedBorderWidth = parseDimension(borderWidth, canvasWidth);
			let processedFillPaint = parseColor(fillPaint);
			let processedTransparency = parseOpacityValue(transparency);
			let processedBorderPaint = parseColor(borderPaint);
			let processedShadowTint = parseColor(shadowTint);

			let finalShadowSoftness = validateNumericInput(shadowSoftness);
			if (shadowSoftness === 'random') {
				finalShadowSoftness = generateRandomNumber(0, 31);
			}
			let finalShadowOffsetX = validateNumericInput(shadowOffsetX);
			let finalShadowOffsetY = validateNumericInput(shadowOffsetY);

			const drawCtx = craftsperson.locateContext(elementId);
			if (!drawCtx) {
				console.error(`Cannot draw circle: No context found for '${elementId}'.`);
				return;
			}

			// Store operation in active log
			activeOperationLog.push({
				type: 'circle',
				details: {
					centerX: processedCenterX, centerY: processedCenterY, radius: processedRadius,
					fill: processedFillPaint, borderW: processedBorderWidth, borderC: processedBorderPaint,
					alpha: processedTransparency, shadowB: finalShadowSoftness, shadowC: processedShadowTint,
					shadowOX: finalShadowOffsetX, shadowOY: finalShadowOffsetY
				}
			});

			const renderFormat = craftsperson.determineElementType(elementId);
			if (renderFormat === "CANVAS") {
				drawCtx.beginPath();
				drawCtx.lineWidth = processedBorderWidth;
				drawCtx.globalAlpha = processedTransparency;
				drawCtx.arc(processedCenterX, processedCenterY, processedRadius, 0, Math.PI * 2, true);
				drawCtx.closePath();

				if (finalShadowSoftness > 0) {
					applyShadowProperties(drawCtx, {
						offsetX: finalShadowOffsetX,
						offsetY: finalShadowOffsetY,
						blur: finalShadowSoftness,
						color: processedShadowTint
					});
				} else {
					// Reset shadow properties if not used to avoid affecting subsequent draws
					applyShadowProperties(drawCtx, { offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0)' });
				}

				if (processedFillPaint) {
					drawCtx.fillStyle = processedFillPaint;
					drawCtx.fill();
				}
				if (processedBorderWidth > 0 && processedBorderPaint) {
					drawCtx.strokeStyle = processedBorderPaint;
					drawCtx.stroke();
				}
			}
			// Default case (other formats) can be added here if needed
		},

		/**
		 * Renders a rectangle on the specified canvas.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {*} startX - X coordinate of the top-left corner.
		 * @param {*} startY - Y coordinate of the top-left corner.
		 * @param {*} rectWidth - Width of the rectangle.
		 * @param {*} rectHeight - Height of the rectangle.
		 * @param {*} fillPaint - Fill color.
		 * @param {*} borderWidth - Line width for the stroke.
		 * @param {*} borderPaint - Stroke color.
		 * @param {*} transparency - Opacity (0-1).
		 * @param {*} shadowSoftness - Blur level for the shadow.
		 * @param {*} shadowTint - Color of the shadow.
		 * @param {*} shadowOffsetX - X offset of the shadow.
		 * @param {*} shadowOffsetY - Y offset of the shadow.
		 */
		renderRectangle: function(elementId, startX, startY, rectWidth, rectHeight, fillPaint, borderWidth, borderPaint, transparency, shadowSoftness, shadowTint, shadowOffsetX, shadowOffsetY) {
			const canvasInfo = getCanvasDimensions(elementId);
			if (!canvasInfo) return;
			const { canvas, width: canvasWidth, height: canvasHeight } = canvasInfo;

			let processedStartX = parseDimension(startX, canvasWidth);
			let processedStartY = parseDimension(startY, canvasHeight);
			let processedRectWidth = parseDimension(rectWidth, canvasWidth);
			let processedRectHeight = parseDimension(rectHeight, canvasHeight);
			let processedBorderWidth = parseDimension(borderWidth, canvasWidth);
			let processedFillPaint = parseColor(fillPaint);
			let processedTransparency = parseOpacityValue(transparency);
			let processedBorderPaint = parseColor(borderPaint);
			let processedShadowTint = parseColor(shadowTint);

			let finalShadowSoftness = validateNumericInput(shadowSoftness);
			if (shadowSoftness === 'random') {
				finalShadowSoftness = generateRandomNumber(0, 31);
			}
			let finalShadowOffsetX = validateNumericInput(shadowOffsetX);
			let finalShadowOffsetY = validateNumericInput(shadowOffsetY);

			const drawCtx = craftsperson.locateContext(elementId);
			if (!drawCtx) {
				console.error(`Cannot draw rectangle: No context found for '${elementId}'.`);
				return;
			}

			const renderFormat = craftsperson.determineElementType(elementId);
			if (renderFormat === "CANVAS") {
				drawCtx.globalAlpha = processedTransparency;
				drawCtx.lineWidth = processedBorderWidth;

				if (finalShadowSoftness > 0) {
					applyShadowProperties(drawCtx, {
						offsetX: finalShadowOffsetX,
						offsetY: finalShadowOffsetY,
						blur: finalShadowSoftness,
						color: processedShadowTint
					});
				} else {
					applyShadowProperties(drawCtx, { offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0)' });
				}

				if (processedFillPaint) {
					drawCtx.fillStyle = processedFillPaint;
					drawCtx.fillRect(processedStartX, processedStartY, processedRectWidth, processedRectHeight);
				}
				if (processedBorderWidth > 0 && processedBorderPaint) {
					drawCtx.strokeStyle = processedBorderPaint;
					drawCtx.strokeRect(processedStartX, processedStartY, processedRectWidth, processedRectHeight);
				}
			}
		},

		/**
		 * Renders an image on the specified canvas.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {string} imageSource - URL of the image to draw.
		 * @param {*} placex - X coordinate for the image's top-left corner.
		 * @param {*} placey - Y coordinate for the image's top-left corner.
		 * @param {*} surfaceWidth - Width to draw the image.
		 * @param {*} surfaceHeight - Height to draw the image.
		 * @param {*} transparency - Opacity (0-1).
		 * @param {*} fillPaint - Fill color (used for background if image fails to load, or not at all).
		 * @param {*} borderWidth - Line width (not directly applicable to image, but might be for a border).
		 * @param {*} borderPaint - Stroke color (for a border around the image).
		 * @param {*} shadowSoftness - Blur level for the shadow.
		 * @param {*} shadowTint - Color of the shadow.
		 * @param {*} shadowOffsetX - X offset of the shadow.
		 * @param {*} shadowOffsetY - Y offset of the shadow.
		 */
		renderImage: function(elementId, imageSource, placex, placey, surfaceWidth, surfaceHeight, transparency, fillPaint, borderWidth, borderPaint, shadowSoftness, shadowTint, shadowOffsetX, shadowOffsetY) {
			const canvasInfo = getCanvasDimensions(elementId);
			if (!canvasInfo) return;
			const { canvas, width: canvasWidth, height: canvasHeight } = canvasInfo;

			if (!imageSource || typeof imageSource !== 'string') {
				console.warn(`No valid image source provided for renderImage on '${elementId}'.`);
				return;
			}

			let processedPlacex = parseDimension(placex, canvasWidth);
			let processedPlacey = parseDimension(placey, canvasHeight);
			let processedSurfaceWidth = parseDimension(surfaceWidth, canvasWidth);
			let processedSurfaceHeight = parseDimension(surfaceHeight, canvasHeight);
			let processedTransparency = parseOpacityValue(transparency);
			let processedFillPaint = parseColor(fillPaint); // Currently unused, but could be for placeholder
			let processedBorderWidth = parseDimension(borderWidth, canvasWidth); // Currently unused
			let processedBorderPaint = parseColor(borderPaint); // Currently unused
			let processedShadowTint = parseColor(shadowTint);

			let finalShadowSoftness = validateNumericInput(shadowSoftness);
			if (shadowSoftness === 'random') {
				finalShadowSoftness = generateRandomNumber(0, 31);
			}
			let finalShadowOffsetX = validateNumericInput(shadowOffsetX);
			let finalShadowOffsetY = validateNumericInput(shadowOffsetY);

			const drawCtx = craftsperson.locateContext(elementId);
			if (!drawCtx) {
				console.error(`Cannot render image: No context found for '${elementId}'.`);
				return;
			}

			const renderFormat = craftsperson.determineElementType(elementId);
			if (renderFormat === "CANVAS") {
				const imgElement = new Image();
				imgElement.src = imageSource;
				imgElement.crossOrigin = "Anonymous"; // Handle CORS for images if needed

				imgElement.onload = function() {
					drawCtx.globalAlpha = processedTransparency;

					if (finalShadowSoftness > 0) {
						applyShadowProperties(drawCtx, {
							offsetX: finalShadowOffsetX,
							offsetY: finalShadowOffsetY,
							blur: finalShadowSoftness,
							color: processedShadowTint
						});
					} else {
						applyShadowProperties(drawCtx, { offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0)' });
					}

					drawCtx.drawImage(imgElement, processedPlacex, processedPlacey, processedSurfaceWidth, processedSurfaceHeight);

					// Optionally draw a border around the image
					if (processedBorderWidth > 0 && processedBorderPaint) {
						drawCtx.strokeStyle = processedBorderPaint;
						drawCtx.lineWidth = processedBorderWidth;
						drawCtx.strokeRect(processedPlacex, processedPlacey, processedSurfaceWidth, processedSurfaceHeight);
					}
				};
				imgElement.onerror = function() {
					console.error(`Failed to load image from URL: ${imageSource}`);
					// Optionally draw a placeholder rectangle or text
					if (processedFillPaint) {
						drawCtx.fillStyle = processedFillPaint;
						drawCtx.fillRect(processedPlacex, processedPlacey, processedSurfaceWidth, processedSurfaceHeight);
					}
				};
			}
		},

		/**
		 * Renders a complex path on the specified canvas.
		 * Path segments can be lines, Bezier curves, or quadratic curves.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {Array<Array<*>>} pathSegments - An array of points defining the path.
		 *   Each point is [x, y, (type), (cp1x, cp1y), (cp2x, cp2y)].
		 * @param {*} borderWidth - Width of the path line.
		 * @param {*} pathLineColor - Color of the path line.
		 * @param {*} fillPaint - Fill color for the closed path.
		 * @param {*} transparency - Opacity (0-1).
		 */
		renderPath: function(elementId, pathSegments, borderWidth, pathLineColor, fillPaint, transparency) {
			const canvasInfo = getCanvasDimensions(elementId);
			if (!canvasInfo) return;
			const { canvas, width: canvasWidth, height: canvasHeight } = canvasInfo;

			if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
				console.warn(`No valid path segments provided for renderPath on '${elementId}'.`);
				return;
			}

			const drawCtx = craftsperson.locateContext(elementId);
			if (!drawCtx) {
				console.error(`Cannot render path: No context found for '${elementId}'.`);
				return;
			}

			let processedBorderWidth = parseDimension(borderWidth, canvasWidth);
			let processedFillPaint = parseColor(fillPaint);
			let processedTransparency = parseOpacityValue(transparency);
			let processedPathLineColor = parseColor(pathLineColor);

			const pathStartX = parseDimension(pathSegments[0][0], canvasWidth);
			const pathStartY = parseDimension(pathSegments[0][1], canvasHeight);

			drawCtx.beginPath();
			drawCtx.moveTo(pathStartX, pathStartY);

			let lastPointX = pathStartX;
			let lastPointY = pathStartY;

			for (let segmentIdx = 1; segmentIdx < pathSegments.length; segmentIdx++) {
				const segment = pathSegments[segmentIdx];
				const currentPointX = parseDimension(segment[0], canvasWidth);
				const currentPointY = parseDimension(segment[1], canvasHeight);
				const segmentType = segment[2];

				if (!segmentType) {
					drawCtx.lineTo(currentPointX, currentPointY);
				} else if (segmentType === 'bezier') {
					const controlPoint1X = parseDimension(segment[3], canvasWidth);
					const controlPoint1Y = parseDimension(segment[4], canvasHeight);
					const controlPoint2X = parseDimension(segment[5], canvasWidth);
					const controlPoint2Y = parseDimension(segment[6], canvasHeight);
					drawCtx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, currentPointX, currentPointY);
				} else if (segmentType === 'quadratic') {
					// Quadratic curves are often defined with one control point.
					// For Canvas API, we can approximate it with a Bezier curve if needed,
					// or use quadraticCurveTo if the original intended to use it directly.
					// The original code converted quadratic to bezier, so we'll follow that.
					const quadControlX = parseDimension(segment[3], canvasWidth);
					const quadControlY = parseDimension(segment[4], canvasHeight);

					// Convert quadratic to cubic Bezier
					const controlPoint1X = lastPointX + 2.0 / 3.0 * (quadControlX - lastPointX);
					const controlPoint1Y = lastPointY + 2.0 / 3.0 * (quadControlY - lastPointY);
					const controlPoint2X = currentPointX + 2.0 / 3.0 * (quadControlX - currentPointX); // Original was cp1x + (point_x - cur_x)/3.0;
					const controlPoint2Y = currentPointY + 2.0 / 3.0 * (quadControlY - currentPointY); // Original was cp1y + (point_y - cur_y)/3.0;

					drawCtx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, currentPointX, currentPointY);
				}
				lastPointX = currentPointX;
				lastPointY = currentPointY;
			}

			drawCtx.globalAlpha = processedTransparency;

			if (processedBorderWidth > 0 && processedPathLineColor) {
				drawCtx.lineWidth = processedBorderWidth;
				drawCtx.strokeStyle = processedPathLineColor;
				drawCtx.stroke();
			}
			if (processedFillPaint) {
				drawCtx.fillStyle = processedFillPaint;
				drawCtx.fill();
			}
			drawCtx.closePath();
		},

		/**
		 * Renders a line (straight, Bezier, or quadratic) on the specified canvas.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {*} startX - X coordinate of the starting point.
		 * @param {*} startY - Y coordinate of the starting point.
		 * @param {*} endPointX - X coordinate of the ending point.
		 * @param {*} endPointY - Y coordinate of the ending point.
		 * @param {*} borderWidth - Width of the line.
		 * @param {*} pathLineColor - Color of the line.
		 * @param {string} lineType - Type of line: 'bezier', 'quadratic', or undefined for straight.
		 * @param {*} control1X - X coordinate of the first control point (for curves).
		 * @param {*} control1Y - Y coordinate of the first control point (for curves).
		 * @param {*} control2X - X coordinate of the second control point (for Bezier).
		 * @param {*} control2Y - Y coordinate of the second control point (for Bezier).
		 */
		renderLine: function(elementId, startX, startY, endPointX, endPointY, borderWidth, pathLineColor, lineType, control1X, control1Y, control2X, control2Y) {
			const canvasInfo = getCanvasDimensions(elementId);
			if (!canvasInfo) return;
			const { canvas, width: canvasWidth, height: canvasHeight } = canvasInfo;

			const drawCtx = craftsperson.locateContext(elementId);
			if (!drawCtx) {
				console.error(`Cannot render line: No context found for '${elementId}'.`);
				return;
			}

			let processedStartX = parseDimension(startX, canvasWidth);
			let processedStartY = parseDimension(startY, canvasHeight);
			let processedEndPointX = parseDimension(endPointX, canvasWidth);
			let processedEndPointY = parseDimension(endPointY, canvasHeight);
			let processedBorderWidth = parseDimension(borderWidth, canvasWidth);
			let processedPathLineColor = parseColor(pathLineColor);

			drawCtx.beginPath();
			drawCtx.moveTo(processedStartX, processedStartY);

			if (!lineType) {
				drawCtx.lineTo(processedEndPointX, processedEndPointY);
			} else if (lineType === 'bezier') {
				const processedControl1X = parseDimension(control1X, canvasWidth);
				const processedControl1Y = parseDimension(control1Y, canvasHeight);
				const processedControl2X = parseDimension(control2X, canvasWidth);
				const processedControl2Y = parseDimension(control2Y, canvasHeight);
				drawCtx.bezierCurveTo(processedControl1X, processedControl1Y, processedControl2X, processedControl2Y, processedEndPointX, processedEndPointY);
			} else if (lineType === 'quadratic') {
				// Convert quadratic to cubic Bezier as in renderPath
				const quadControlX = parseDimension(control1X, canvasWidth);
				const quadControlY = parseDimension(control1Y, canvasHeight);

				const bzControl1X = processedStartX + 2.0 / 3.0 * (quadControlX - processedStartX);
				const bzControl1Y = processedStartY + 2.0 / 3.0 * (quadControlY - processedStartY);
				const bzControl2X = processedEndPointX + 2.0 / 3.0 * (quadControlX - processedEndPointX);
				const bzControl2Y = processedEndPointY + 2.0 / 3.0 * (quadControlY - processedEndPointY);

				drawCtx.bezierCurveTo(bzControl1X, bzControl1Y, bzControl2X, bzControl2Y, processedEndPointX, processedEndPointY);
			}

			if (processedBorderWidth > 0 && processedPathLineColor) {
				drawCtx.strokeStyle = processedPathLineColor;
				drawCtx.lineWidth = processedBorderWidth;
				drawCtx.stroke();
			}
			// Note: The original did not call closePath for drawLine, we follow that.
		},

		/**
		 * Closes the current path on the specified canvas context.
		 * @param {string} elementId - ID of the target canvas.
		 */
		finalizePath: function(elementId) {
			const drawCtx = craftsperson.locateContext(elementId);
			if (drawCtx) {
				drawCtx.closePath();
			} else {
				console.warn(`No context found for '${elementId}' to finalize path.`);
			}
		},

		/**
		 * Renders text on the specified canvas.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {*} textX - X coordinate for the text.
		 * @param {*} textY - Y coordinate for the text.
		 * @param {string} displayText - The text string to render.
		 * @param {*} textColor - Color of the text.
		 * @param {string} fontWeight - Font weight (e.g., 'bold', 'normal').
		 * @param {*} fontSize - Font size (e.g., '16px', '2em', 'random').
		 * @param {string} fontFamily - Font family (e.g., 'sans-serif').
		 * @param {string} textAlign - Text alignment (e.g., 'left', 'center').
		 * @param {*} transparency - Opacity (0-1).
		 * @param {*} borderWidth - Line width for text stroke.
		 * @param {*} pathLineColor - Color for text stroke.
		 * @param {string} textBaseline - Text baseline (e.g., 'top', 'middle').
		 */
		renderText: function(elementId, textX, textY, displayText, textColor, fontWeight, fontSize, fontFamily, textAlign, transparency, borderWidth, pathLineColor, textBaseline) {
			const canvasInfo = getCanvasDimensions(elementId);
			if (!canvasInfo) return;
			const { canvas, width: canvasWidth, height: canvasHeight } = canvasInfo;

			const drawCtx = craftsperson.locateContext(elementId);
			if (!drawCtx) {
				console.error(`Cannot render text: No context found for '${elementId}'.`);
				return;
			}

			let processedTextX = parseDimension(textX, canvasWidth);
			let processedTextY = parseDimension(textY, canvasHeight);
			let processedTextColor = parseColor(textColor);
			let processedTransparency = parseOpacityValue(transparency);
			let processedBorderWidth = parseDimension(borderWidth, canvasWidth);
			let processedPathLineColor = parseColor(pathLineColor);

			const textContent = displayText || '';
			const finalFontWeight = fontWeight || 'normal';
			const finalFontFamily = fontFamily || 'sans-serif';
			const finalTextAlign = textAlign || 'left';
			const finalTextBaseline = textBaseline || 'top';

			let finalFontSize = '15px'; // Default
			if (fontSize === 'random') {
				finalFontSize = `${generateRandomNumber(10, 191)}px`;
			} else if (fontSize) {
				// Allows for '16px', '1.2em', or numeric values which will be treated as pixels
				if (typeof fontSize === 'number') {
					finalFontSize = `${fontSize}px`;
				} else if (typeof fontSize === 'string' && !isNaN(parseFloat(fontSize))) {
					finalFontSize = `${parseFloat(fontSize)}px`;
				} else if (typeof fontSize === 'string') {
					finalFontSize = fontSize; // Assume valid CSS font size string
				}
			}

			const computedFontStyle = `${finalFontWeight} ${finalFontSize} ${finalFontFamily}`;

			drawCtx.textAlign = finalTextAlign;
			drawCtx.globalAlpha = processedTransparency;
			drawCtx.textBaseline = finalTextBaseline;
			drawCtx.font = computedFontStyle;

			drawCtx.fillStyle = processedTextColor;
			drawCtx.fillText(textContent, processedTextX, processedTextY);

			if (processedBorderWidth > 0 && processedPathLineColor) {
				drawCtx.strokeStyle = processedPathLineColor;
				drawCtx.lineWidth = processedBorderWidth;
				drawCtx.strokeText(textContent, processedTextX, processedTextY);
			}
		},

		// --- Layer and Stack Rendering ---

		/**
		 * Renders an entire stack of layers onto the target canvas.
		 * Iterates through each layer and draws its latest history state.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {number | string} stackParam - The index of the stack ('latest', 'first', or numeric index).
		 * @param {number | string} historyParam - The history step to render for each layer ('latest', 'first', 'previous', or numeric index).
		 */
		renderLayerStack: function(elementId, stackParam, historyParam) {
			let targetStackIndex = validateNumericInput(stackParam, 0);
			if (stackParam === 'latest') {
				targetStackIndex = designLayers.length - 1;
			} else if (stackParam === 'first') {
				targetStackIndex = 0;
			}

			if (targetStackIndex < 0 || targetStackIndex >= designLayers.length) {
				console.warn(`Invalid stack index ${targetStackIndex}. Cannot render stack.`);
				return;
			}

			const stackToRender = designLayers[targetStackIndex];
			for (let layerIdx = 0; layerIdx < stackToRender.length; layerIdx++) {
				craftsperson.renderSpecificLayer(elementId, targetStackIndex, layerIdx, historyParam);
			}
		},

		/**
		 * Renders a specific layer from a stack onto the target canvas.
		 * @param {string} elementId - ID of the target canvas.
		 * @param {number} stackIndex - The index of the stack. Defaults to 0.
		 * @param {number | string} layerParam - The index of the layer ('latest', 'first', or numeric index).
		 * @param {number | string} historyParam - The history step to render ('latest', 'first', 'previous', or numeric index).
		 */
		renderSpecificLayer: function(elementId, stackIndex, layerParam, historyParam) {
			const targetStackIndex = validateNumericInput(stackIndex, 0);
			if (targetStackIndex < 0 || targetStackIndex >= designLayers.length) {
				console.warn(`Invalid stack index ${targetStackIndex}. Cannot render layer.`);
				return;
			}

			let targetLayerIndex = validateNumericInput(layerParam, 0);
			if (layerParam === 'latest') {
				targetLayerIndex = designLayers[targetStackIndex].length - 1;
			} else if (layerParam === 'first') {
				targetLayerIndex = 0;
			}

			if (targetLayerIndex < 0 || targetLayerIndex >= designLayers[targetStackIndex].length) {
				console.warn(`Invalid layer index ${targetLayerIndex} for stack ${targetStackIndex}. Cannot render layer.`);
				return;
			}

			const layerToRender = designLayers[targetStackIndex][targetLayerIndex];
			let targetHistoryIndex = validateNumericInput(historyParam, 0);

			if (historyParam === 'latest') {
				targetHistoryIndex = layerToRender.length - 1;
			} else if (historyParam === 'previous') {
				targetHistoryIndex = layerToRender.length - 2;
			} else if (historyParam === 'first') {
				targetHistoryIndex = 0;
			}

			if (targetHistoryIndex < 0 || targetHistoryIndex >= layerToRender.length) {
				console.warn(`Invalid history index ${targetHistoryIndex} for stack ${targetStackIndex}, layer ${targetLayerIndex}. Cannot render history.`);
				return;
			}

			// For Type III, we'd iterate through the history entries and call appropriate drawing functions.
			// This part is intentionally left as a placeholder for Type III, as the original code
			// only determined WHICH history entry to use, but didn't actually implement drawing it.
			// Implementing the actual drawing based on stored history would be a significant Type III addition.
			// For now, we'll just log the intent.
			console.log(`Attempting to render history entry ${targetHistoryIndex} from stack ${targetStackIndex}, layer ${targetLayerIndex} onto element '${elementId}'.`);
			const historyEntryData = layerToRender[targetHistoryIndex];
			if (historyEntryData && historyEntryData.length > 0) {
				console.log("History data found:", historyEntryData);
				// A full implementation would parse `historyEntryData` (which should contain
				// objects from `recordOperation`) and call the corresponding `renderX` methods.
				// Example:
				// historyEntryData.forEach(operation => {
				//   if (operation.type === 'circle') {
				//     this.renderCircle(elementId, operation.details.centerX, ...);
				//   } else if (operation.type === 'rectangle') {
				//     this.renderRectangle(elementId, operation.details.startX, ...);
				//   }
				//   // ... handle other types
				// });
			} else {
				console.log("No operation data found in this history entry.");
			}
		}
	};

})(window, undefined);