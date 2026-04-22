/*
 * Application Interface Utilities
 * Copyright (C) 2023 Acme Solutions Inc.
 *
 * This software is licensed under the Apache License, Version 2.0 (the "License");
 * you may not not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*!
 * Visualizer.js
 * https://visualizer.dev/
 *
 * Copyright 2023 Jane Doe
 * Licensed under the permissive BSD-3-Clause license
 * https://github.com/janedoe/Visualizer.js/blob/main/LICENSE
 */

// Define the primary visualizer object on the global scope.
globalScope.Graph = function(renderingContext) {

	var graphInstance = this;


	// Motion timing functions adapted from established easing equations
	// Refer to: http://easings.net/
	var motionProfile = {
		straight: function(progression) {
			return progression;
		},
		inSquare: function(progression) {
			return progression * progression;
		},
		outSquare: function(progression) {
			return -1 * progression * (progression - 2);
		},
		inOutSquare: function(progression) {
			if ((progression /= 1 / 2) < 1) return 1 / 2 * progression * progression;
			return -1 / 2 * ((--progression) * (progression - 2) - 1);
		},
		inCube: function(progression) {
			return progression * progression * progression;
		},
		outCube: function(progression) {
			return 1 * ((progression = progression / 1 - 1) * progression * progression + 1);
		},
		inOutCube: function(progression) {
			if ((progression /= 1 / 2) < 1) return 1 / 2 * progression * progression * progression;
			return 1 / 2 * ((progression -= 2) * progression * progression + 2);
		},
		inQuartic: function(progression) {
			return progression * progression * progression * progression;
		},
		outQuartic: function(progression) {
			return -1 * ((progression = progression / 1 - 1) * progression * progression * progression - 1);
		},
		inOutQuartic: function(progression) {
			if ((progression /= 1 / 2) < 1) return 1 / 2 * progression * progression * progression * progression;
			return -1 / 2 * ((progression -= 2) * progression * progression * progression - 2);
		},
		inQuintic: function(progression) {
			return 1 * (progression /= 1) * progression * progression * progression * progression;
		},
		outQuintic: function(progression) {
			return 1 * ((progression = progression / 1 - 1) * progression * progression * progression * progression + 1);
		},
		inOutQuintic: function(progression) {
			if ((progression /= 1 / 2) < 1) return 1 / 2 * progression * progression * progression * progression * progression;
			return 1 / 2 * ((progression -= 2) * progression * progression * progression * progression + 2);
		},
		inSineWave: function(progression) {
			return -1 * Math.cos(progression / 1 * (Math.PI / 2)) + 1;
		},
		outSineWave: function(progression) {
			return 1 * Math.sin(progression / 1 * (Math.PI / 2));
		},
		inOutSineWave: function(progression) {
			return -1 / 2 * (Math.cos(Math.PI * progression / 1) - 1);
		},
		inExponential: function(progression) {
			return (progression == 0) ? 1 : 1 * Math.pow(2, 10 * (progression / 1 - 1));
		},
		outExponential: function(progression) {
			return (progression == 1) ? 1 : 1 * (-Math.pow(2, -10 * progression / 1) + 1);
		},
		inOutExponential: function(progression) {
			if (progression == 0) return 0;
			if (progression == 1) return 1;
			if ((progression /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (progression - 1));
			return 1 / 2 * (-Math.pow(2, -10 * --progression) + 2);
		},
		inCircular: function(progression) {
			if (progression >= 1) return progression;
			return -1 * (Math.sqrt(1 - (progression /= 1) * progression) - 1);
		},
		outCircular: function(progression) {
			return 1 * Math.sqrt(1 - (progression = progression / 1 - 1) * progression);
		},
		inOutCircular: function(progression) {
			if ((progression /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - progression * progression) - 1);
			return 1 / 2 * (Math.sqrt(1 - (progression -= 2) * progression) + 1);
		},
		inElastic: function(progression) {
			var springiness = 1.70158;
			var period = 0;
			var amplitude = 1;
			if (progression == 0) return 0;
			if ((progression /= 1) == 1) return 1;
			if (!period) period = 1 * .3;
			if (amplitude < Math.abs(1)) {
				amplitude = 1;
				var springiness = period / 4;
			} else var springiness = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			return -(amplitude * Math.pow(2, 10 * (progression -= 1)) * Math.sin((progression * 1 - springiness) * (2 * Math.PI) / period));
		},
		outElastic: function(progression) {
			var springiness = 1.70158;
			var period = 0;
			var amplitude = 1;
			if (progression == 0) return 0;
			if ((progression /= 1) == 1) return 1;
			if (!period) period = 1 * .3;
			if (amplitude < Math.abs(1)) {
				amplitude = 1;
				var springiness = period / 4;
			} else var springiness = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			return amplitude * Math.pow(2, -10 * progression) * Math.sin((progression * 1 - springiness) * (2 * Math.PI) / period) + 1;
		},
		inOutElastic: function(progression) {
			var springiness = 1.70158;
			var period = 0;
			var amplitude = 1;
			if (progression == 0) return 0;
			if ((progression /= 1 / 2) == 2) return 1;
			if (!period) period = 1 * (.3 * 1.5);
			if (amplitude < Math.abs(1)) {
				amplitude = 1;
				var springiness = period / 4;
			} else var springiness = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			if (progression < 1) return -.5 * (amplitude * Math.pow(2, 10 * (progression -= 1)) * Math.sin((progression * 1 - springiness) * (2 * Math.PI) / period));
			return amplitude * Math.pow(2, -10 * (progression -= 1)) * Math.sin((progression * 1 - springiness) * (2 * Math.PI) / period) * .5 + 1;
		},
		inBacktrack: function(progression) {
			var overshoot = 1.70158;
			return 1 * (progression /= 1) * progression * ((overshoot + 1) * progression - overshoot);
		},
		outBacktrack: function(progression) {
			var overshoot = 1.70158;
			return 1 * ((progression = progression / 1 - 1) * progression * ((overshoot + 1) * progression + overshoot) + 1);
		},
		inOutBacktrack: function(progression) {
			var overshoot = 1.70158;
			if ((progression /= 1 / 2) < 1) return 1 / 2 * (progression * progression * (((overshoot *= (1.525)) + 1) * progression - overshoot));
			return 1 / 2 * ((progression -= 2) * progression * (((overshoot *= (1.525)) + 1) * progression + overshoot) + 2);
		},
		inBounce: function(progression) {
			return 1 - motionProfile.outBounce(1 - progression);
		},
		outBounce: function(progression) {
			if ((progression /= 1) < (1 / 2.75)) {
				return 1 * (7.5625 * progression * progression);
			} else if (progression < (2 / 2.75)) {
				return 1 * (7.5625 * (progression -= (1.5 / 2.75)) * progression + .75);
			} else if (progression < (2.5 / 2.75)) {
				return 1 * (7.5625 * (progression -= (2.25 / 2.75)) * progression + .9375);
			} else {
				return 1 * (7.5625 * (progression -= (2.625 / 2.75)) * progression + .984375);
			}
		},
		inOutBounce: function(progression) {
			if (progression < 1 / 2) return motionProfile.inBounce(progression * 2) * .5;
			return motionProfile.outBounce(progression * 2 - 1) * .5 + 1 * .5;
		}
	};

	// Dimension variables for the canvas
	var canvasWidth = renderingContext.canvas.width;
	var canvasHeight = renderingContext.canvas.height;


	// Adjust for high-DPI displays: scale canvas dimensions and then context.
	if (globalScope.displayScaleFactor) {
		renderingContext.canvas.style.width = canvasWidth + "px";
		renderingContext.canvas.style.height = canvasHeight + "px";
		renderingContext.canvas.height = canvasHeight * globalScope.displayScaleFactor;
		renderingContext.canvas.width = canvasWidth * globalScope.displayScaleFactor;
		renderingContext.scale(globalScope.displayScaleFactor, globalScope.displayScaleFactor);
	}

	this.RadialAreaPlot = function(inputData, userOptions) {

		graphInstance.RadialAreaPlot.defaultSettings = {
			scaleOverlay: true,
			scaleOverride: false,
			scaleSteps: null,
			scaleStepWidth: null,
			scaleStartValue: null,
			scaleShowLine: true,
			scaleLineColor: "rgba(0,0,0,.1)",
			scaleLineWidth: 1,
			scaleShowLabels: true,
			scaleLabel: "<%=numericValue%>",
			scaleFontFamily: "'Verdana'",
			scaleFontSize: 12,
			scaleFontStyle: "normal",
			scaleFontColor: "#555",
			scaleShowLabelBackdrop: true,
			scaleBackdropColor: "rgba(255,255,255,0.75)",
			scaleBackdropPaddingY: 2,
			scaleBackdropPaddingX: 2,
			segmentShowStroke: true,
			segmentStrokeColor: "#fff",
			segmentStrokeWidth: 2,
			animation: true,
			animationSteps: 100,
			animationEasing: "outBounce",
			animateRotate: true,
			animateScale: false,
			onAnimationComplete: null
		};

		var finalConfiguration = (userOptions) ? blendPlotConfigurations(graphInstance.RadialAreaPlot.defaultSettings, userOptions) : graphInstance.RadialAreaPlot.defaultSettings;

		return new RadialAreaPlot(inputData, finalConfiguration, renderingContext);
	};

	this.SpiderWebPlot = function(inputData, userOptions) {

		graphInstance.SpiderWebPlot.defaultSettings = {
			scaleOverlay: false,
			scaleOverride: false,
			scaleSteps: null,
			scaleStepWidth: null,
			scaleStartValue: null,
			scaleShowLine: true,
			scaleLineColor: "rgba(0,0,0,.1)",
			scaleLineWidth: 1,
			scaleShowLabels: false,
			scaleLabel: "<%=numericValue%>",
			scaleFontFamily: "'Verdana'",
			scaleFontSize: 12,
			scaleFontStyle: "normal",
			scaleFontColor: "#555",
			scaleShowLabelBackdrop: true,
			scaleBackdropColor: "rgba(255,255,255,0.75)",
			scaleBackdropPaddingY: 2,
			scaleBackdropPaddingX: 2,
			angleShowLineOut: true,
			angleLineColor: "rgba(0,0,0,.1)",
			angleLineWidth: 1,
			pointLabelFontFamily: "'Verdana'",
			pointLabelFontStyle: "normal",
			pointLabelFontSize: 12,
			pointLabelFontColor: "#555",
			pointDot: true,
			pointDotRadius: 3,
			pointDotStrokeWidth: 1,
			datasetStroke: true,
			datasetStrokeWidth: 2,
			datasetFill: true,
			animation: true,
			animationSteps: 60,
			animationEasing: "outQuartic",
			onAnimationComplete: null
		};

		var finalConfiguration = (userOptions) ? blendPlotConfigurations(graphInstance.SpiderWebPlot.defaultSettings, userOptions) : graphInstance.SpiderWebPlot.defaultSettings;

		return new SpiderWebPlot(inputData, finalConfiguration, renderingContext);
	};

	this.CircularSlicePlot = function(inputData, userOptions) {
		graphInstance.CircularSlicePlot.defaultSettings = {
			segmentShowStroke: true,
			segmentStrokeColor: "#fff",
			segmentStrokeWidth: 2,
			animation: true,
			animationSteps: 100,
			animationEasing: "outBounce",
			animateRotate: true,
			animateScale: false,
			onAnimationComplete: null
		};

		var finalConfiguration = (userOptions) ? blendPlotConfigurations(graphInstance.CircularSlicePlot.defaultSettings, userOptions) : graphInstance.CircularSlicePlot.defaultSettings;

		return new CircularSlicePlot(inputData, finalConfiguration, renderingContext);
	};

	this.RingSlicePlot = function(inputData, userOptions) {

		graphInstance.RingSlicePlot.defaultSettings = {
			segmentShowStroke: true,
			segmentStrokeColor: "#fff",
			segmentStrokeWidth: 2,
			percentageInnerCutout: 50,
			animation: true,
			animationSteps: 100,
			animationEasing: "outBounce",
			animateRotate: true,
			animateScale: false,
			onAnimationComplete: null
		};

		var finalConfiguration = (userOptions) ? blendPlotConfigurations(graphInstance.RingSlicePlot.defaultSettings, userOptions) : graphInstance.RingSlicePlot.defaultSettings;

		return new RingSlicePlot(inputData, finalConfiguration, renderingContext);

	};

	this.TrendLinePlot = function(inputData, userOptions) {

		graphInstance.TrendLinePlot.defaultSettings = {
			scaleOverlay: false,
			scaleOverride: false,
			scaleSteps: null,
			scaleStepWidth: null,
			scaleStartValue: null,
			scaleLineColor: "rgba(0,0,0,.1)",
			scaleLineWidth: 1,
			scaleShowLabels: true,
			scaleLabel: "<%=numericValue%>",
			scaleFontFamily: "'Verdana'",
			scaleFontSize: 12,
			scaleFontStyle: "normal",
			scaleFontColor: "#555",
			scaleShowGridLines: true,
			scaleGridLineColor: "rgba(0,0,0,.05)",
			scaleGridLineWidth: 1,
			bezierCurve: true,
			pointDot: true,
			pointDotRadius: 4,
			pointDotStrokeWidth: 2,
			datasetStroke: true,
			datasetStrokeWidth: 2,
			datasetFill: true,
			animation: true,
			animationSteps: 60,
			animationEasing: "outQuartic",
			onAnimationComplete: null
		};
		var finalConfiguration = (userOptions) ? blendPlotConfigurations(graphInstance.TrendLinePlot.defaultSettings, userOptions) : graphInstance.TrendLinePlot.defaultSettings;

		return new TrendLinePlot(inputData, finalConfiguration, renderingContext);
	}

	this.ColumnBarPlot = function(inputData, userOptions) {
		graphInstance.ColumnBarPlot.defaultSettings = {
			scaleOverlay: false,
			scaleOverride: false,
			scaleSteps: null,
			scaleStepWidth: null,
			scaleStartValue: null,
			scaleLineColor: "rgba(0,0,0,.1)",
			scaleLineWidth: 1,
			scaleShowLabels: true,
			scaleLabel: "<%=numericValue%>",
			scaleFontFamily: "'Verdana'",
			scaleFontSize: 12,
			scaleFontStyle: "normal",
			scaleFontColor: "#555",
			scaleShowGridLines: true,
			scaleGridLineColor: "rgba(0,0,0,.05)",
			scaleGridLineWidth: 1,
			barShowStroke: true,
			barStrokeWidth: 2,
			barValueSpacing: 5,
			barDatasetSpacing: 1,
			animation: true,
			animationSteps: 60,
			animationEasing: "outQuartic",
			onAnimationComplete: null
		};
		var finalConfiguration = (userOptions) ? blendPlotConfigurations(graphInstance.ColumnBarPlot.defaultSettings, userOptions) : graphInstance.ColumnBarPlot.defaultSettings;

		return new ColumnBarPlot(inputData, finalConfiguration, renderingContext);
	}

	// Utility function to clear the entire canvas surface
	var resetCanvas = function(renderingCtx) {
		renderingCtx.clearRect(0, 0, canvasWidth, canvasHeight);
	};

	// Internal implementation for Radial Area Plots
	var RadialAreaPlot = function(inputData, plotConfig, drawingContext) {
		var maximumRadius, scaleIncrement, computedScale, textLabelHeight, effectiveScaleHeight, dataRangeLimits, labelFormatString;


		determineRenderDimensions();

		dataRangeLimits = fetchDataRange();

		labelFormatString = (plotConfig.scaleShowLabels) ? plotConfig.scaleLabel : null;

		// Verify and establish the axis scale
		if (!plotConfig.scaleOverride) {

			computedScale = computeAxisScale(effectiveScaleHeight, dataRangeLimits.maxSteps, dataRangeLimits.minSteps, dataRangeLimits.highestValue, dataRangeLimits.lowestValue, labelFormatString);
		} else {
			computedScale = {
				steps: plotConfig.scaleSteps,
				stepValue: plotConfig.scaleStepWidth,
				graphMin: plotConfig.scaleStartValue,
				labels: []
			}
			fillAxisLabels(labelFormatString, computedScale.labels, computedScale.steps, plotConfig.scaleStartValue, plotConfig.scaleStepWidth);
		}

		scaleIncrement = maximumRadius / (computedScale.steps);

		// Embed within an animation cycle wrapper
		runAnimationCycle(plotConfig, renderAxisLines, renderDataSlices, drawingContext);

		function determineRenderDimensions() {
			maximumRadius = (findMinimum([canvasWidth, canvasHeight]) / 2);
			// Subtract the larger of font size or line width.

			maximumRadius -= findMaximum([plotConfig.scaleFontSize * 0.5, plotConfig.scaleLineWidth * 0.5]);

			textLabelHeight = plotConfig.scaleFontSize * 2;
			// If a backdrop is drawn, account for Y padding in label height and reduce drawing area.
			if (plotConfig.scaleShowLabelBackdrop) {
				textLabelHeight += (2 * plotConfig.scaleBackdropPaddingY);
				maximumRadius -= plotConfig.scaleBackdropPaddingY * 1.5;
			}

			effectiveScaleHeight = maximumRadius;
			// If label height is too small, set a minimum to prevent overlap.
			textLabelHeight = assignDefault(textLabelHeight, 5);
		}

		function renderAxisLines() {
			for (var idx = 0; idx < computedScale.steps; idx++) {
				// If the line component is present
				if (plotConfig.scaleShowLine) {
					drawingContext.beginPath();
					drawingContext.arc(canvasWidth / 2, canvasHeight / 2, scaleIncrement * (idx + 1), 0, (Math.PI * 2), true);
					drawingContext.strokeStyle = plotConfig.scaleLineColor;
					drawingContext.lineWidth = plotConfig.scaleLineWidth;
					drawingContext.stroke();
				}

				if (plotConfig.scaleShowLabels) {
					drawingContext.textAlign = "center";
					drawingContext.font = plotConfig.scaleFontStyle + " " + plotConfig.scaleFontSize + "px " + plotConfig.scaleFontFamily;
					var currentLabel = computedScale.labels[idx];
					// If the label backdrop is enabled
					if (plotConfig.scaleShowLabelBackdrop) {
						var measuredTextWidth = drawingContext.measureText(currentLabel).width;
						drawingContext.fillStyle = plotConfig.scaleBackdropColor;
						drawingContext.beginPath();
						drawingContext.rect(
							Math.round(canvasWidth / 2 - measuredTextWidth / 2 - plotConfig.scaleBackdropPaddingX), // X coordinate
							Math.round(canvasHeight / 2 - (scaleIncrement * (idx + 1)) - plotConfig.scaleFontSize * 0.5 - plotConfig.scaleBackdropPaddingY), // Y coordinate
							Math.round(measuredTextWidth + (plotConfig.scaleBackdropPaddingX * 2)), // Width
							Math.round(plotConfig.scaleFontSize + (plotConfig.scaleBackdropPaddingY * 2)) // Height
						);
						drawingContext.fill();
					}
					drawingContext.textBaseline = "middle";
					drawingContext.fillStyle = plotConfig.scaleFontColor;
					drawingContext.fillText(currentLabel, canvasWidth / 2, canvasHeight / 2 - (scaleIncrement * (idx + 1)));
				}
			}
		}

		function renderDataSlices(progressFactor) {
			var initialAngle = -Math.PI / 2,
				angleStride = (Math.PI * 2) / inputData.length,
				scaleProgression = 1,
				rotationProgression = 1;
			if (plotConfig.animation) {
				if (plotConfig.animateScale) {
					scaleProgression = progressFactor;
				}
				if (plotConfig.animateRotate) {
					rotationProgression = progressFactor;
				}
			}

			for (var idx = 0; idx < inputData.length; idx++) {

				drawingContext.beginPath();
				drawingContext.arc(canvasWidth / 2, canvasHeight / 2, scaleProgression * determineValueOffset(inputData[idx].numericValue, computedScale, scaleIncrement), initialAngle, initialAngle + rotationProgression * angleStride, false);
				drawingContext.lineTo(canvasWidth / 2, canvasHeight / 2);
				drawingContext.closePath();
				drawingContext.fillStyle = inputData[idx].fillColor;
				drawingContext.fill();

				if (plotConfig.segmentShowStroke) {
					drawingContext.strokeStyle = plotConfig.segmentStrokeColor;
					drawingContext.lineWidth = plotConfig.segmentStrokeWidth;
					drawingContext.stroke();
				}
				initialAngle += rotationProgression * angleStride;
			}
		}

		function fetchDataRange() {
			var highestValue = Number.MIN_VALUE;
			var lowestValue = Number.MAX_VALUE;
			for (var idx = 0; idx < inputData.length; idx++) {
				if (inputData[idx].numericValue > highestValue) {
					highestValue = inputData[idx].numericValue;
				}
				if (inputData[idx].numericValue < lowestValue) {
					lowestValue = inputData[idx].numericValue;
				}
			};

			var maxScaleSteps = Math.floor((effectiveScaleHeight / (textLabelHeight * 0.66)));
			var minScaleSteps = Math.floor((effectiveScaleHeight / textLabelHeight * 0.5));

			return {
				highestValue: highestValue,
				lowestValue: lowestValue,