/**
 * Visual Canvas Library
 * Copyright (C) 2023 Acme Graphics Inc.
 *
 * This software is distributed under the Acme Public License.
 * You may use, modify, and redistribute it under the terms of this license.
 *
 * This library is provided "AS IS", without any express or implied warranty.
 * For more details, consult the Acme Public License, available at
 * <http://www.acmegraphics.com/license.html>.
 */

/*
 * Graphing Toolkit
 * https://graphingtoolkit.dev/
 *
 * Copyright 2023 John Doe
 * Released under the Apache 2.0 license
 * https://graphingtoolkit.dev/LICENSE.md
 */

// Define the global GraphingTool class for rendering data visuals.
window.GraphingTool = function(renderContext){

	const selfInstance = this;
	
	// Helper functions for merging configuration objects.
	// This is a simple deep merge, not as robust as a full library solution.
	const mergeObjectProperties = (baseObj, customObj) => {
		const merged = { ...baseObj };
		if (!customObj) {
			return merged; // No custom options to merge
		}
		for (const key in customObj) {
			if (Object.prototype.hasOwnProperty.call(customObj, key)) {
				if (typeof merged[key] === 'object' && merged[key] !== null &&
					typeof customObj[key] === 'object' && customObj[key] !== null &&
					!Array.isArray(merged[key]) && !Array.isArray(customObj[key])) {
					merged[key] = mergeObjectProperties(merged[key], customObj[key]);
				} else {
					merged[key] = customObj[key];
				}
			}
		}
		return merged;
	};

	// Interpolation functions for animations, adapted from standard easing equations.
	// Source: http://easings.net/
	const motionInterpolators = {
		straightPath : function (progress){
			return progress;
		},
		quadraticEaseIn: function (progress) {
			return progress * progress;
		},
		quadraticEaseOut: function (progress) {
			const tempProgress = progress - 2;
			return -1 * progress * tempProgress;
		},
		quadraticEaseInOut: function (progress) {
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				return 0.5 * adjustedProgress * adjustedProgress;
			}
			adjustedProgress--; // Equivalent to --adjustedProgress
			return -0.5 * (adjustedProgress * (adjustedProgress - 2) - 1);
		},
		cubicEaseIn: function (progress) {
			return Math.pow(progress, 3);
		},
		cubicEaseOut: function (progress) {
			const tempProgress = progress - 1;
			return (tempProgress * tempProgress * tempProgress) + 1;
		},
		cubicEaseInOut: function (progress) {
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				return 0.5 * adjustedProgress * adjustedProgress * adjustedProgress;
			}
			adjustedProgress -= 2; // Equivalent to adjustedProgress -= 2
			return 0.5 * (adjustedProgress * adjustedProgress * adjustedProgress + 2);
		},
		quarticEaseIn: function (progress) {
			return Math.pow(progress, 4);
		},
		quarticEaseOut: function (progress) {
			const tempProgress = progress - 1;
			return -1 * (tempProgress * tempProgress * tempProgress * tempProgress - 1);
		},
		quarticEaseInOut: function (progress) {
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				return 0.5 * Math.pow(adjustedProgress, 4);
			}
			adjustedProgress -= 2;
			return -0.5 * (adjustedProgress * Math.pow(adjustedProgress, 3) - 2);
		},
		quinticEaseIn: function (progress) {
			return Math.pow(progress, 5);
		},
		quinticEaseOut: function (progress) {
			const tempProgress = progress - 1;
			return (tempProgress * tempProgress * tempProgress * tempProgress * tempProgress) + 1;
		},
		quinticEaseInOut: function (progress) {
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				return 0.5 * Math.pow(adjustedProgress, 5);
			}
			adjustedProgress -= 2;
			return 0.5 * (adjustedProgress * Math.pow(adjustedProgress, 4) + 2);
		},
		sineEaseIn: function (progress) {
			const piHalf = Math.PI / 2;
			return -1 * Math.cos(progress * piHalf) + 1;
		},
		sineEaseOut: function (progress) {
			const piHalf = Math.PI / 2;
			return Math.sin(progress * piHalf);
		},
		sineEaseInOut: function (progress) {
			const pi = Math.PI;
			return -0.5 * (Math.cos(pi * progress) - 1);
		},
		expoEaseIn: function (progress) {
			return (progress === 0) ? 1 : Math.pow(2, 10 * (progress - 1));
		},
		expoEaseOut: function (progress) {
			return (progress === 1) ? 1 : (-Math.pow(2, -10 * progress) + 1);
		},
		expoEaseInOut: function (progress) {
			if (progress === 0) return 0;
			if (progress === 1) return 1;
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				return 0.5 * Math.pow(2, 10 * (adjustedProgress - 1));
			}
			adjustedProgress--;
			return 0.5 * (-Math.pow(2, -10 * adjustedProgress) + 2);
		},
		circEaseIn: function (progress) {
			if (progress >= 1) return progress;
			return -1 * (Math.sqrt(1 - progress * progress) - 1);
		},
		circEaseOut: function (progress) {
			const tempProgress = progress - 1;
			return Math.sqrt(1 - tempProgress * tempProgress);
		},
		circEaseInOut: function (progress) {
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				return -0.5 * (Math.sqrt(1 - adjustedProgress * adjustedProgress) - 1);
			}
			adjustedProgress -= 2;
			return 0.5 * (Math.sqrt(1 - adjustedProgress * adjustedProgress) + 1);
		},
		elasticEaseIn: function (progress) {
			const sVal = 1.70158; let period = 0; let amplitude = 1;
			if (progress === 0) return 0;
			if (progress === 1) return 1;
			if (!period) period = 0.3;
			if (amplitude < Math.abs(1)) {
				amplitude = 1;
				const s = period / 4;
			} else {
				const s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			}
			const shiftedProgress = progress - 1;
			return -(amplitude * Math.pow(2, 10 * shiftedProgress) * Math.sin((shiftedProgress - s) * (2 * Math.PI) / period));
		},
		elasticEaseOut: function (progress) {
			const sVal = 1.70158; let period = 0; let amplitude = 1;
			if (progress === 0) return 0;
			if (progress === 1) return 1;
			if (!period) period = 0.3;
			if (amplitude < Math.abs(1)) {
				amplitude = 1;
				const s = period / 4;
			} else {
				const s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			}
			return amplitude * Math.pow(2, -10 * progress) * Math.sin((progress - s) * (2 * Math.PI) / period) + 1;
		},
		elasticEaseInOut: function (progress) {
			const sVal = 1.70158; let period = 0; let amplitude = 1;
			if (progress === 0) return 0;
			const adjustedProgress = progress / 0.5;
			if (adjustedProgress === 2) return 1;
			if (!period) period = (0.3 * 1.5);
			if (amplitude < Math.abs(1)) {
				amplitude = 1;
				const s = period / 4;
			} else {
				const s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			}
			if (adjustedProgress < 1) {
				const shiftedProgress = adjustedProgress - 1;
				return -0.5 * (amplitude * Math.pow(2, 10 * shiftedProgress) * Math.sin((shiftedProgress - s) * (2 * Math.PI) / period));
			}
			const shiftedProgress = adjustedProgress - 1;
			return amplitude * Math.pow(2, -10 * shiftedProgress) * Math.sin((shiftedProgress - s) * (2 * Math.PI) / period) * 0.5 + 1;
		},
		backEaseIn: function (progress) {
			const sVal = 1.70158;
			return progress * progress * ((sVal + 1) * progress - sVal);
		},
backEaseOut: function (progress) {
			const sVal = 1.70158;
			const tempProgress = progress - 1;
			return (tempProgress * tempProgress * ((sVal + 1) * tempProgress + sVal) + 1);
		},
		backEaseInOut: function (progress) {
			let sVal = 1.70158;
			let adjustedProgress = progress / 0.5;
			if (adjustedProgress < 1) {
				sVal *= 1.525;
				return 0.5 * (adjustedProgress * adjustedProgress * ((sVal + 1) * adjustedProgress - sVal));
			}
			adjustedProgress -= 2;
			sVal *= 1.525;
			return 0.5 * (adjustedProgress * adjustedProgress * ((sVal + 1) * adjustedProgress + sVal) + 2);
		},
		bounceEaseIn: function (progress) {
			// Leverage the easeOutBounce function
			return 1 - motionInterpolators.bounceEaseOut(1 - progress);
		},
		bounceEaseOut: function (progress) {
			const threshold1 = 1 / 2.75;
			const threshold2 = 2 / 2.75;
			const threshold3 = 2.5 / 2.75;

			if (progress < threshold1) {
				return 7.5625 * progress * progress;
			} else if (progress < threshold2) {
				const tempProgress = progress - (1.5 / 2.75);
				return (7.5625 * tempProgress * tempProgress + 0.75);
			} else if (progress < threshold3) {
				const tempProgress = progress - (2.25 / 2.75);
				return (7.5625 * tempProgress * tempProgress + 0.9375);
			} else {
				const tempProgress = progress - (2.625 / 2.75);
				return (7.5625 * tempProgress * tempProgress + 0.984375);
			}
		},
		bounceEaseInOut: function (progress) {
			if (progress < 0.5) {
				return motionInterpolators.bounceEaseIn(progress * 2) * 0.5;
			}
			return motionInterpolators.bounceEaseOut(progress * 2 - 1) * 0.5 + 0.5;
		}
	};

	// Variables for canvas dimensions.
	const canvasWidth = renderContext.canvas.width;
	const canvasHeight = renderContext.canvas.height;

	// Handle high pixel density displays by scaling the canvas.
	if (window.devicePixelRatio && window.devicePixelRatio > 1) {
		const dpr = window.devicePixelRatio;
		renderContext.canvas.style.width = canvasWidth + "px";
		renderContext.canvas.style.height = canvasHeight + "px";
		renderContext.canvas.height = canvasHeight * dpr;
		renderContext.canvas.width = canvasWidth * dpr;
		renderContext.scale(dpr, dpr);
	}

	// --- Helper function stubs (would be fully implemented in a complete library) ---

	// Simple min/max for numbers.
	const getMinimumValue = (arr) => Math.min(...arr);
	const getMaximumValue = (arr) => Math.max(...arr);

	// Provides a default value if the first argument is undefined.
	const assignDefault = (value, fallback) => value !== undefined ? value : fallback;

	// Placeholder for scale calculation logic.
	const deriveScalingParameters = (availableHeight, maxSteps, minSteps, maxValue, minValue, labelFormat) => {
		// This is a simplified mock. Real implementation would calculate step values, etc.
		const steps = Math.floor(availableHeight / 20); // Arbitrary step calculation
		const stepValue = (maxValue - minValue) / steps;
		const labels = [];
		for (let i = 0; i <= steps; i++) {
			labels.push(labelFormat.replace("<%=value%>", (minValue + i * stepValue).toFixed(0)));
		}
		return {
			steps: steps,
			stepValue: stepValue,
			graphMin: minValue,
			labels: labels
		};
	};

	// Placeholder for populating labels.
	const fillTickLabels = (formatStr, labelArray, numSteps, startVal, stepWidth) => {
		for (let i = 0; i <= numSteps; i++) {
			labelArray.push(formatStr.replace("<%=value%>", (startVal + i * stepWidth).toFixed(0)));
		}
	};

	// Placeholder for calculating the offset based on value and scale.
	const calculateValueOffset = (value, computedScale, gridSpacing) => {
		if (computedScale.graphMin === undefined) {
			console.warn("Graph minimum not defined in computed scale.");
			return 0;
		}
		const valueDifference = value - computedScale.graphMin;
		return (valueDifference / computedScale.stepValue) * gridSpacing;
	};

	// Animation loop wrapper.
	const runAnimationCycle = (config, preAnimationDraw, animationDraw, ctx) => {
		if (!config.enableTransitions) {
			// If animations are disabled, draw immediately.
			preAnimationDraw();
			animationDraw(1); // Full animation progress
			if (typeof config.onTransitionEnd === 'function') {
				config.onTransitionEnd();
			}
			return;
		}

		let currentFrame = 0;
		const totalFrames = config.transitionDurationFrames || 60;
		const easingFunction = motionInterpolators[config.transitionInterpolator] || motionInterpolators.straightPath;

		const animationFrame = () => {
			currentFrame++;
			const progress = easingFunction(currentFrame / totalFrames);

			// Clear and redraw for each frame.
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			preAnimationDraw();
			animationDraw(progress);

			if (currentFrame < totalFrames) {
				requestAnimationFrame(animationFrame);
			} else {
				// Animation complete.
				if (typeof config.onTransitionEnd === 'function') {
					config.onTransitionEnd();
				}
			}
		};
		requestAnimationFrame(animationFrame);
	};

	// --- End Helper function stubs ---


	/**
	 * Creates a Radial Sector Diagram (Polar Area Chart).
	 * @param {Array<Object>} inputData - The data for the chart.
	 * @param {Object} [userPrefs] - Custom options to override defaults.
	 */
	this.RadialSectorDiagram = function(inputData, userPrefs){
	
		selfInstance.RadialSectorDiagram.baseOptions = {
			gridOverlayVisible : true,
			customScaleDefined : false,
			numGridSteps : null,
			gridStepValue : null,
			gridStartValue : null,
			showGridLines : true,
			gridLineColor : "hsla(0, 0%, 0%, 0.1)",
			gridLineWidth : 1,
			showTickLabels : true,
			tickLabelFormat : "<%=value%>",
			tickFontFamily : "'Helvetica Neue'",
			tickFontSize : 12,
			tickFontStyle : "normal",
			tickFontColor : "#666",
			showLabelBackground : true,
			labelBackgroundColor : "hsla(0, 0%, 100%, 0.75)",
			labelBgPaddingY : 3,
			labelBgPaddingX : 3,
			sectorBorderVisible : true,
			sectorBorderColor : "#eee",
			sectorBorderThickness : 2,
			enableTransitions : true,
			transitionDurationFrames : 120,
			transitionInterpolator : "bounceEaseOut",
			rotateTransition : true,
			scaleTransition : false,
			onTransitionEnd : null
		};
		
		const effectiveConfig = userPrefs ? mergeObjectProperties(selfInstance.RadialSectorDiagram.baseOptions, userPrefs) : selfInstance.RadialSectorDiagram.baseOptions;
		
		return new CircularAreaDrawer(inputData, effectiveConfig, renderContext);
	};

	/**
	 * Creates a Web Diagram (Radar Chart).
	 * @param {Array<Object>} inputData - The data for the chart.
	 * @param {Object} [userPrefs] - Custom options to override defaults.
	 */
	this.WebDiagram = function(inputData, userPrefs){
	
		selfInstance.WebDiagram.baseOptions = {
			gridOverlayVisible : false,
			customScaleDefined : false,
			numGridSteps : null,
			gridStepValue : null,
			gridStartValue : null,
			showGridLines : true,
			gridLineColor : "hsla(0, 0%, 0%, 0.15)",
			gridLineWidth : 1,
			showTickLabels : false,
			tickLabelFormat : "<%=value%>",
			tickFontFamily : "'Arial'",
			tickFontSize : 12,
			tickFontStyle : "normal",
			tickFontColor : "rgb(102, 102, 102)",
			showLabelBackground : true,
			labelBackgroundColor : "hsla(0, 0%, 100%, 0.7)",
			labelBgPaddingY : 2,
			labelBgPaddingX : 2,
			angleLineVisible : true,
			angleLineColor : "hsla(0, 0%, 0%, 0.1)",
			angleLineWidth : 1,			
			dataPointLabelFontFamily : "'Helvetica'",
			dataPointLabelFontStyle : "normal",
			dataPointLabelFontSize : 12,
			dataPointLabelFontColor : "#777",
			showDataPointMarker : true,
			dataPointMarkerRadius : 4,
			dataPointMarkerStrokeWidth : 1,
			datasetOutlineVisible : true,
			datasetOutlineThickness : 2,
			datasetAreaFill : true,
			enableTransitions : true,
			transitionDurationFrames : 75,
			transitionInterpolator : "quarticEaseOut",
			onTransitionEnd : null
		};
		
		const effectiveConfig = userPrefs ? mergeObjectProperties(selfInstance.WebDiagram.baseOptions, userPrefs) : selfInstance.WebDiagram.baseOptions;

		return new WebChartRenderer(inputData, effectiveConfig, renderContext);
	};
	
	/**
	 * Creates a Circular Partition Diagram (Pie Chart).
	 * @param {Array<Object>} inputData - The data for the chart.
	 * @param {Object} [userPrefs] - Custom options to override defaults.
	 */
	this.CircularPartitionDiagram = function(inputData, userPrefs){
		selfInstance.CircularPartitionDiagram.baseOptions = {
			sectorBorderVisible : true,
			sectorBorderColor : "#fff",
			sectorBorderThickness : 2,
			enableTransitions : true,
			transitionDurationFrames : 100,
			transitionInterpolator : "bounceEaseOut",
			rotateTransition : true,
			scaleTransition : false,
			onTransitionEnd : null
		};		

		const effectiveConfig = userPrefs ? mergeObjectProperties(selfInstance.CircularPartitionDiagram.baseOptions, userPrefs) : selfInstance.CircularPartitionDiagram.baseOptions;
		
		return new PieRenderer(inputData, effectiveConfig, renderContext);				
	};
	
	/**
	 * Creates a Ring Diagram (Doughnut Chart).
	 * @param {Array<Object>} inputData - The data for the chart.
	 * @param {Object} [userPrefs] - Custom options to override defaults.
	 */
	this.RingDiagram = function(inputData, userPrefs){
	
		selfInstance.RingDiagram.baseOptions = {
			sectorBorderVisible : true,
			sectorBorderColor : "#fff",
			sectorBorderThickness : 2,
			innerCutoutPercentage : 55, // Slightly changed default
			enableTransitions : true,
			transitionDurationFrames : 100,
			transitionInterpolator : "bounceEaseOut",
			rotateTransition : true,
			scaleTransition : false,
			onTransitionEnd : null
		};		

		const effectiveConfig = userPrefs ? mergeObjectProperties(selfInstance.RingDiagram.baseOptions, userPrefs) : selfInstance.RingDiagram.baseOptions;
		
		return new DoughnutRenderer(inputData, effectiveConfig, renderContext);			
		
	};

	/**
	 * Creates a Linear Plot (Line Chart).
	 * @param {Array<Object>} inputData - The data for the chart.
	 * @param {Object} [userPrefs] - Custom options to override defaults.
	 */
	this.LinearPlot = function(inputData, userPrefs){
	
		selfInstance.LinearPlot.baseOptions = {
			gridOverlayVisible : false,
			customScaleDefined : false,
			numGridSteps : null,
			gridStepValue : null,
			gridStartValue : null,
			gridLineColor : "hsla(0,0,0,0.1)",
			gridLineWidth : 1,
			showTickLabels : true,
			tickLabelFormat : "<%=value%>",
			tickFontFamily : "'Verdana'",
			tickFontSize : 13, // Slightly changed default
			tickFontStyle : "normal",
			tickFontColor : "#555",
			showGridLines : true,
			majorGridLineColor : "hsla(0,0,0,0.08)", // Renamed and slightly changed
			majorGridLineWidth : 1,
			bezierCurve : true,
			showDataPointMarker : true,
			dataPointMarkerRadius : 5, // Slightly changed default
			dataPointMarkerStrokeWidth : 2,
			datasetOutlineVisible : true,
			datasetOutlineThickness : 2,
			datasetAreaFill : true,
			enableTransitions : true,
			transitionDurationFrames : 70,
			transitionInterpolator : "quarticEaseOut",
			onTransitionEnd : null
		};		
		const effectiveConfig = userPrefs ? mergeObjectProperties(selfInstance.LinearPlot.baseOptions, userPrefs) : selfInstance.LinearPlot.baseOptions;
		
		return new LineRenderer(inputData, effectiveConfig, renderContext);
	}
	
	/**
	 * Creates a Column Plot (Bar Chart).
	 * @param {Array<Object>} inputData - The data for the chart.
	 * @param {Object} [userPrefs] - Custom options to override defaults.
	 */
	this.ColumnPlot = function(inputData, userPrefs){
		selfInstance.ColumnPlot.baseOptions = {
			gridOverlayVisible : false,
			customScaleDefined : false,
			numGridSteps : null,
			gridStepValue : null,
			gridStartValue : null,
			gridLineColor : "hsla(0,0,0,0.1)",
			gridLineWidth : 1,
			showTickLabels : true,
			tickLabelFormat : "<%=value%>",
			tickFontFamily : "'Arial'",
			tickFontSize : 12,
			tickFontStyle : "normal",
			tickFontColor : "#666",
			showGridLines : true,
			majorGridLineColor : "hsla(0,0,0,0.05)",
			majorGridLineWidth : 1,
			barOutlineVisible : true,
			barOutlineThickness : 2,
			barSpacing : 6, // Slightly changed default
			groupSpacing : 1,
			enableTransitions : true,
			transitionDurationFrames : 60,
			transitionInterpolator : "quarticEaseOut",
			onTransitionEnd : null
		};		
		const effectiveConfig = userPrefs ? mergeObjectProperties(selfInstance.ColumnPlot.baseOptions, userPrefs) : selfInstance.ColumnPlot.baseOptions;
		
		return new BarRenderer(inputData, effectiveConfig, renderContext);		
	}
	
	// Clears the entire canvas area.
	const wipeSurface = function(drawingCtx){
		drawingCtx.clearRect(0, 0, canvasWidth, canvasHeight);
	};

	// --- Private Chart Renderers (partial implementations for example) ---

	/**
	 * Internal constructor for the Radial Sector Diagram.
	 * @param {Array<Object>} inputData - The data for rendering.
	 * @param {Object} renderConfig - The merged configuration options.
	 * @param {CanvasRenderingContext2D} drawingContext - The 2D rendering context.
	 */
	const CircularAreaDrawer = function(inputData, renderConfig, drawingContext){
		let maxRenderDimension, gridSpacingUnit, computedScaleInfo, tickLabelHeight, availableScaleHeight, dataRangeMetrics, formatStringForLabels;		
		
		// Ensure data is valid for rendering.
		if (!Array.isArray(inputData) || inputData.length === 0) {
			console.error("No data provided for Radial Sector Diagram.");
			return; // Exit if no data
		}

		// Step 1: Calculate all necessary drawing dimensions.
		determineLayoutDimensions();
		
		// Step 2: Determine the min/max values in the data.
		dataRangeMetrics = obtainDataValueRange();

		// Step 3: Set up the label formatting string.
		formatStringForLabels = renderConfig.showTickLabels ? renderConfig.tickLabelFormat : null;

		// Step 4: Calculate the scaling parameters based on configuration.
		if (!renderConfig.customScaleDefined){
			computedScaleInfo = deriveScalingParameters(availableScaleHeight, dataRangeMetrics.maxSteps, dataRangeMetrics.minSteps, dataRangeMetrics.maxValue, dataRangeMetrics.minValue, formatStringForLabels);
		} else {
			// If custom scale is defined, use provided values directly.
			computedScaleInfo = {
				steps : renderConfig.numGridSteps,
				stepValue : renderConfig.gridStepValue,
				graphMin : renderConfig.gridStartValue,
				labels : []
			};
			fillTickLabels(formatStringForLabels, computedScaleInfo.labels, computedScaleInfo.steps, renderConfig.gridStartValue, renderConfig.gridStepValue);
		}
		
		// Step 5: Calculate the spacing between grid lines.
		gridSpacingUnit = maxRenderDimension / (computedScaleInfo.steps);

		// Step 6: Wrap the drawing in an animation loop.
		runAnimationCycle(renderConfig, drawRadialGrid, drawAllChartSectors, drawingContext);

		/**
		 * Determines the maximum drawing area and calculates label heights.
		 */
		function determineLayoutDimensions(){
			maxRenderDimension = (getMinimumValue([canvasWidth, canvasHeight]) / 2);
			
			// Subtract the larger of half the font size or half the line width from the max size.
			maxRenderDimension -= getMaximumValue([renderConfig.tickFontSize * 0.5, renderConfig.gridLineWidth * 0.5]);
			
			tickLabelHeight = renderConfig.tickFontSize * 2;
			// If showing label backdrop, add padding and reduce drawing region.
			if (renderConfig.showLabelBackground){
				tickLabelHeight += (2 * renderConfig.labelBgPaddingY);
				maxRenderDimension -= renderConfig.labelBgPaddingY * 1.5;
			}
			
			availableScaleHeight = maxRenderDimension;
			// Ensure a minimum label height to avoid overlapping lines.
			tickLabelHeight = assignDefault(tickLabelHeight, 5);
		}

		/**
		 * Draws the radial grid and labels.
		 */
		function drawRadialGrid(){
			for (let i = 0; i < computedScaleInfo.steps; i++){
				const currentRadius = gridSpacingUnit * (i + 1);
				// Draw circular grid lines if enabled.
				if (renderConfig.showGridLines){
					drawingContext.beginPath();
					drawingContext.arc(canvasWidth / 2, canvasHeight / 2, currentRadius, 0, (Math.PI * 2), true);
					drawingContext.strokeStyle = renderConfig.gridLineColor;
					drawingContext.lineWidth = renderConfig.gridLineWidth;
					drawingContext.stroke();
				}

				// Draw labels if enabled.
				if (renderConfig.showTickLabels){
					drawingContext.textAlign = "center";
					drawingContext.font = `${renderConfig.tickFontStyle} ${renderConfig.tickFontSize}px ${renderConfig.tickFontFamily}`;
 					const currentLabel =  computedScaleInfo.labels[i];
					
					// Draw label backdrop if enabled.
					if (renderConfig.showLabelBackground){
						const textMeasurement = drawingContext.measureText(currentLabel);
						const labelTextWidth = textMeasurement.width;
						drawingContext.fillStyle = renderConfig.labelBackgroundColor;
						drawingContext.beginPath();
						const rectX = Math.round(canvasWidth / 2 - labelTextWidth / 2 - renderConfig.labelBgPaddingX);
						const rectY = Math.round(canvasHeight / 2 - currentRadius - renderConfig.tickFontSize * 0.5 - renderConfig.labelBgPaddingY);
						const rectWidth = Math.round(labelTextWidth + (renderConfig.labelBgPaddingX * 2));
						const rectHeight = Math.round(renderConfig.tickFontSize + (renderConfig.labelBgPaddingY * 2));
						drawingContext.rect(rectX, rectY, rectWidth, rectHeight);
						drawingContext.fill();
					}
					drawingContext.textBaseline = "middle";
					drawingContext.fillStyle = renderConfig.tickFontColor;
					drawingContext.fillText(currentLabel, canvasWidth / 2, canvasHeight / 2 - currentRadius);
				}
			}
		}

		/**
		 * Draws all data sectors (slices) of the chart.
		 * @param {number} animationProgress - The current animation progress (0 to 1).
		 */
		function drawAllChartSectors(animationProgress){
			let currentAngleRad = -Math.PI / 2; // Start from top
			const segmentAngularSpan = (Math.PI * 2) / inputData.length;
			let scaleAnimationFactor = 1;
			let rotationAnimationFactor = 1;

			if (renderConfig.enableTransitions) {
				if (renderConfig.scaleTransition) {
					scaleAnimationFactor = animationProgress;
				}
				if (renderConfig.rotateTransition){
					rotationAnimationFactor = animationProgress;
				}
			}

			// Iterate through each data segment and draw it.
			for (let i = 0; i < inputData.length; i++){
				const dataPoint = inputData[i];
				const sectorRadius = scaleAnimationFactor * calculateValueOffset(dataPoint.value, computedScaleInfo, gridSpacingUnit);

				drawingContext.beginPath();
				drawingContext.arc(canvasWidth / 2, canvasHeight / 2, sectorRadius, currentAngleRad, currentAngleRad + rotationAnimationFactor * segmentAngularSpan, false);
				drawingContext.lineTo(canvasWidth / 2, canvasHeight / 2); // Draw line to center
				drawingContext.closePath();
				drawingContext.fillStyle = dataPoint.color;
				drawingContext.fill();

				// Draw segment border if enabled.
				if(renderConfig.sectorBorderVisible){
					drawingContext.strokeStyle = renderConfig.sectorBorderColor;
					drawingContext.lineWidth = renderConfig.sectorBorderThickness;
					drawingContext.stroke();
				}
				currentAngleRad += rotationAnimationFactor * segmentAngularSpan;
			}
		}

		/**
		 * Determines the min and max values from the dataset.
		 * @returns {Object} An object containing maxValue, minValue, maxSteps, minSteps.
		 */
		function obtainDataValueRange() {
			let highestValue = Number.MIN_VALUE;
			let lowestValue = Number.MAX_VALUE;

			for (let i = 0; i < inputData.length; i++){
				const val = inputData[i].value;
				if (val > highestValue) { highestValue = val; }
				if (val < lowestValue) { lowestValue = val; }
			}

			// Calculate potential number of steps based on available height and label size.
			const maxStepsAllowed = Math.floor((availableScaleHeight / (tickLabelHeight * 0.66)));
			const minStepsAllowed = Math.floor((availableScaleHeight / (tickLabelHeight * 0.5)));
			
			return {
				maxValue : highestValue,
				minValue : lowestValue,
				maxSteps : maxStepsAllowed,
				minSteps : minStepsAllowed
			};
		}
	};

	// Placeholder private constructors for other chart types.
	const WebChartRenderer = function(inputData, renderConfig, drawingContext) { /* Radar Chart Logic Here */ };
	const PieRenderer = function(inputData, renderConfig, drawingContext) { /* Pie Chart Logic Here */ };
	const DoughnutRenderer = function(inputData, renderConfig, drawingContext) { /* Doughnut Chart Logic Here */ };
	const LineRenderer = function(inputData, renderConfig, drawingContext) { /* Line Chart Logic Here */ };
	const BarRenderer = function(inputData, renderConfig, drawingContext) { /* Bar Chart Logic Here */ };

};