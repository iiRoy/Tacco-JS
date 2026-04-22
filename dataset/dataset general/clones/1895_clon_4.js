(function(){

	"use strict";

	var activeScope = this,
		previousGlobalEntity = activeScope.DataCanvas;

	var DataCanvas = function(renderingContext){
		var component = this;
		this.displaySurface = renderingContext.canvas;

		this.renderAgent = renderingContext;

		var surfaceWidth = this.surfaceWidth = renderingContext.canvas.width;
		var surfaceHeight = this.surfaceHeight = renderingContext.canvas.height;
		this.dimRatio = this.surfaceWidth / this.surfaceHeight;

		displayUtilities.adjustForHighDensity(this);

		return this;
	};

	DataCanvas.configPresets = {
		defaultSettings: {
			animateGraphics: true,
			animationFrames: 60,
			animationStyle: "easeOutQuart",
			renderAxis: true,
			axisOverride: false,
			axisDivisions: null,
			axisDivisionSize: null,
			axisStartPoint: null,
			axisLineColor: "rgba(0,0,0,.1)",
			axisLineWidth: 1,
			axisLabelVisibility: true,
			axisLabelFormatter: "<%=value%>",
			axisIntegerOnly: true,
			axisStartAtZero: false,
			axisFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			axisFontSize: 12,
			axisFontStyle: "normal",
			axisFontColor: "#666",
			responsiveLayout: false,
			preserveAspectRatio: true,
			displayHoverInfo: true,
			customHoverInfo: false,
			hoverInfoTriggers: ["mousemove", "touchstart", "touchmove", "mouseout"],
			hoverInfoBackgroundColor: "rgba(0,0,0,0.8)",
			hoverInfoFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			hoverInfoFontSize: 14,
			hoverInfoFontStyle: "normal",
			hoverInfoFontColor: "#fff",
			hoverInfoTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			hoverInfoTitleFontSize: 14,
			hoverInfoTitleFontStyle: "bold",
			hoverInfoTitleFontColor: "#fff",
			hoverInfoVPadding: 6,
			hoverInfoHPadding: 6,
			hoverInfoPointerSize: 8,
			hoverInfoCornerRadius: 6,
			hoverInfoXOffset: 10,
			hoverInfoSingleTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
			hoverInfoMultiTemplate: "<%= value %>",
			hoverInfoKeyBackground: '#fff',
			onAnimationUpdate: function(){},
			onAnimationFinished: function(){}
		}
	};

	DataCanvas.componentTypes = {};

	var displayUtilities = DataCanvas.utilities = {};

	var iterateCollection = displayUtilities.iterateCollection = (collection, processingFn, executionContext, ...extraParams) => {
			if (!collection) {
				return;
			}

			if (Array.isArray(collection) || (typeof collection === 'object' && collection !== null && typeof collection.length === 'number' && collection.length >= 0 && (collection.length === 0 || (collection.length > 0 && (collection.hasOwnProperty(0) || collection.propertyIsEnumerable(0)))))) { // Heuristic for array-like, avoiding string
				const processRecursive = (index) => {
					if (index < collection.length) {
						processingFn.apply(executionContext, [collection[index], index, ...extraParams]);
						processRecursive(index + 1);
					}
				};
				processRecursive(0);
			} else if (typeof collection === 'object' && collection !== null) {
				Object.keys(collection).forEach(key => {
					processingFn.apply(executionContext, [collection[key], key, ...extraParams]);
				});
			}
		},
		duplicateObject = displayUtilities.duplicateObject = (sourceObject) => {
			const duplicated = {};
			iterateCollection(sourceObject, (value, key) => {
				if (sourceObject.hasOwnProperty(key)) duplicated[key] = value;
			});
			return duplicated;
		},
		mergeIntoBase = displayUtilities.mergeIntoBase = (baseObject) => {
			Array.prototype.slice.call(arguments,1).forEach(extensionObject => {
				iterateCollection(extensionObject, (value, key) => {
					if (extensionObject.hasOwnProperty(key)) baseObject[key] = value;
				});
			});
			return baseObject;
		},
		combineObjects = displayUtilities.combineObjects = (firstObj, secondObj) => {
			const allArguments = Array.prototype.slice.call(arguments,0);
			allArguments.unshift({});
			return mergeIntoBase.apply(null, allArguments);
		},
		locateElementIndex = displayUtilities.locateElementIndex = (targetArray, itemToFind) => {
			if (Array.prototype.indexOf) {
				return targetArray.indexOf(itemToFind);
			} else {
				let currentIdx = 0;
				while (currentIdx < targetArray.length) {
					if (targetArray[currentIdx] === itemToFind) return currentIdx;
					currentIdx++;
				}
				return -1;
			}
		},
		filterCollection = displayUtilities.filterCollection = (sourceCollection, evaluationCallback) => {
			const matchedElements = [];
			iterateCollection(sourceCollection, (element) => {
				if (evaluationCallback(element)){
					matchedElements.push(element);
				}
			});
			return matchedElements;
		},
		seekForward = displayUtilities.seekForward = (targetArray, evaluationCallback, startingIndex) => {
			if (!startingIndex){
				startingIndex = -1;
			}
			for (let i = startingIndex + 1; i < targetArray.length; i++) {
				const currentElement = targetArray[i];
				if (evaluationCallback(currentElement)){
					return currentElement;
				}
			}
		},
		seekBackward = displayUtilities.seekBackward = (targetArray, evaluationCallback, startingIndex) => {
			if (!startingIndex){
				startingIndex = targetArray.length;
			}
			let i = startingIndex - 1;
			while (i >= 0) {
				const currentElement = targetArray[i];
				if (evaluationCallback(currentElement)){
					return currentElement;
				}
				i--;
			}
		},
		establishInheritance = displayUtilities.establishInheritance = (extensionDefinitions) => {
			const baseType = this;
			const DerivedComponent = (extensionDefinitions && extensionDefinitions.hasOwnProperty("constructor")) ? extensionDefinitions.constructor : function(){ return baseType.apply(this, arguments); };

			const PrototypeBridge = function(){ this.constructor = DerivedComponent;};
			PrototypeBridge.prototype = baseType.prototype;
			DerivedComponent.prototype = new PrototypeBridge();

			DerivedComponent.extend = establishInheritance;

			if (extensionDefinitions) mergeIntoBase(DerivedComponent.prototype, extensionDefinitions);

			DerivedComponent.__super__ = baseType.prototype;

			return DerivedComponent;
		},
		noOperation = displayUtilities.noOperation = function(){},
		generateUniqueId = displayUtilities.generateUniqueId = (function(){
			let counter=0;
			return function(){
				return "data-visual-" + counter++;
			};
		})(),
		logWarning = displayUtilities.logWarning = (message) => {
			if (window.console && typeof window.console.warn == "function") console.warn(message);
		},
		isAmdEnvironment = displayUtilities.isAmdEnvironment = (typeof define == 'function' && define.amd),
		isNumericValue = displayUtilities.isNumericValue = (val) => {
			return !isNaN(parseFloat(val)) && isFinite(val);
		},
		maximumValue = displayUtilities.maximumValue = (numberArray) => {
			return Math.max(...numberArray);
		},
		minimumValue = displayUtilities.minimumValue = (numberArray) => {
			return Math.min(...numberArray);
		},
		constrainValue = displayUtilities.constrainValue = (targetValue, upperLimit, lowerLimit) => {
			if(isNumericValue(upperLimit)) {
				if( targetValue > upperLimit ) {
					return upperLimit;
				}
			}
			else if(isNumericValue(lowerLimit)){
				if ( targetValue < lowerLimit ){
					return lowerLimit;
				}
			}
			return targetValue;
		},
		countDecimalDigits = displayUtilities.countDecimalDigits = (num) => {
			if (num % 1 !== 0 && isNumericValue(num)){
				return num.toString().split(".")[1].length;
			} else {
				return 0;
			}
		},
		convertToRadians = displayUtilities.convertToRadians = (degrees) => {
			return degrees * (Math.PI/180);
		},
		calculateVectorAngleAndDistance = displayUtilities.calculateVectorAngleAndDistance = (originPoint, destinationPoint) => {
			const deltaX = destinationPoint.x - originPoint.x,
				deltaY = destinationPoint.y - originPoint.y,
				radialDistance = Math.sqrt( deltaX * deltaX + deltaY * deltaY);

			let angleMeasurement = Math.PI * 2 + Math.atan2(deltaY, deltaX);

			if (deltaX < 0 && deltaY < 0){
				angleMeasurement += Math.PI*2;
			}

			return {
				angle: angleMeasurement,
				distance: radialDistance
			};
		},
		adjustPixelAlignment = displayUtilities.adjustPixelAlignment = (pixelVal) => {
			return (pixelVal & 1) === 0 ? 0 : 0.5;
		},
		computeSplineControlPoints = displayUtilities.computeSplineControlPoints = (firstPoint, middlePoint, afterPoint, tensionFactor) => {
			const dist01 = Math.sqrt(Math.pow(middlePoint.x - firstPoint.x, 2) + Math.pow(middlePoint.y - firstPoint.y, 2)),
				dist12 = Math.sqrt(Math.pow(afterPoint.x - middlePoint.x, 2) + Math.pow(afterPoint.y - middlePoint.y, 2)),
				factorA = tensionFactor * dist01 / (dist01 + dist12),
				factorB = tensionFactor * dist12 / (dist01 + dist12);
			return {
				inner : {
					x : middlePoint.x - factorA * (afterPoint.x - firstPoint.x),
					y : middlePoint.y - factorA * (afterPoint.y - firstPoint.y)
				},
				outer : {
					x: middlePoint.x + factorB * (afterPoint.x - firstPoint.x),
					y : middlePoint.y + factorB * (afterPoint.y - firstPoint.y)
				}
			};
		},
		determineMagnitudeOrder = displayUtilities.determineMagnitudeOrder = (value) => {
			return Math.floor(Math.log(value) / Math.LN10);
		},
		computeAxisRangeDetails = displayUtilities.computeAxisRangeDetails = (valueSet, drawingDimension, fontDimension, startAtZero, onlyIntegers) => {

			const minimumDivisions = 2;
			const maximumDivisions = Math.floor(drawingDimension / (fontDimension * 1.5));
			let bypassAdjustment = (minimumDivisions >= maximumDivisions);

			let highestVal = maximumValue(valueSet);
			let lowestVal = minimumValue(valueSet);

			if (highestVal === lowestVal){
				highestVal += 0.5;
				if (lowestVal >= 0.5 && !startAtZero){
					lowestVal -= 0.5;
				}
				else{
					highestVal += 0.5;
				}
			}

			const valueSpan = Math.abs(highestVal - lowestVal);
			const spanMagnitudeOrder = determineMagnitudeOrder(valueSpan);
			let graphHighest = Math.ceil(highestVal / (1 * Math.pow(10, spanMagnitudeOrder))) * Math.pow(10, spanMagnitudeOrder);
			let graphLowest = (startAtZero) ? 0 : Math.floor(lowestVal / (1 * Math.pow(10, spanMagnitudeOrder))) * Math.pow(10, spanMagnitudeOrder);
			const graphSpan = graphHighest - graphLowest;
			let divisionIncrement = Math.pow(10, spanMagnitudeOrder);
			let totalDivisions = Math.round(graphSpan / divisionIncrement);

			const adjustScaleParameters = (currentDivisions, currentIncrement, currentBypass) => {
				if (!currentBypass && (currentDivisions > maximumDivisions || (currentDivisions * 2) < maximumDivisions)) {
					if (currentDivisions > maximumDivisions){
						currentIncrement *=2;
						currentDivisions = Math.round(graphSpan/currentIncrement);
						if (currentDivisions % 1 !== 0){
							currentBypass = true;
						}
					}
					else{
						if (onlyIntegers && spanMagnitudeOrder >= 0){
							if(currentIncrement/2 % 1 === 0){
								currentIncrement /=2;
								currentDivisions = Math.round(graphSpan/currentIncrement);
							}
							else{
								return { divisions: currentDivisions, increment: currentIncrement, bypass: currentBypass };
							}
						}
						else{
							currentIncrement /=2;
							currentDivisions = Math.round(graphSpan/currentIncrement);
						}
					}
					return adjustScaleParameters(currentDivisions, currentIncrement, currentBypass);
				}
				return { divisions: currentDivisions, increment: currentIncrement, bypass: currentBypass };
			};

			const adjustedResult = adjustScaleParameters(totalDivisions, divisionIncrement, bypassAdjustment);
			totalDivisions = adjustedResult.divisions;
			divisionIncrement = adjustedResult.increment;
			bypassAdjustment = adjustedResult.bypass;

			if (bypassAdjustment){
				totalDivisions = minimumDivisions;
				divisionIncrement = graphSpan / totalDivisions;
			}

			return {
				steps : totalDivisions,
				stepValue : divisionIncrement,
				min : graphLowest,
				max	: graphLowest + (totalDivisions * divisionIncrement)
			};

		},
		renderTemplate = displayUtilities.renderTemplate = (templateSource, dataObject) => {
			if (typeof templateSource === 'function') {
				return templateSource(dataObject);
			}

			const templateCache = renderTemplate._cache = renderTemplate._cache || {};
			const compiledFn = templateCache[templateSource] || (() => {
				let functionBody = "var resultSegments=[], output=function(){resultSegments.push.apply(resultSegments,arguments);}; with(dataObject){";

				const parts = templateSource.split(/<%(?!=)([\s\S]*?)%>/g);
				
				for (let i = 0; i < parts.length; i++) {
					const part = parts[i];
					if (i % 2 === 0) { // Literal string part or part before first <%
						const outputParts = part.split(/<%=\s*?([\s\S]*?)%>/g);
						for (let j = 0; j < outputParts.length; j++) {
							const outputPart = outputParts[j];
							if (j % 2 === 0) { // Plain string
								if (outputPart.length > 0) {
									functionBody += `output('${outputPart.replace(/'/g, "\\'")}');`;
								}
							} else { // Expression to output
								functionBody += `output(${outputPart});`;
							}
						}
					} else { // JavaScript code block from <% ... %>
						functionBody += part;
					}
				}

				functionBody += "}return resultSegments.join('');";
				const newFunc = new Function("dataObject", functionBody);
				templateCache[templateSource] = newFunc;
				return newFunc;
			})();

			return compiledFn(dataObject);
		},
		createAxisLabels = displayUtilities.createAxisLabels = (labelTemplateSource, divisionCount, graphMin, divisionIncrement) => {
			const labelCollection = Array.from({length: divisionCount});
			if (labelTemplateSource){
				labelCollection.forEach((val,index) => {
					labelCollection[index] = renderTemplate(labelTemplateSource,{value: (graphMin + (divisionIncrement*(index+1)))});
				});
			}
			return labelCollection;
		},
		adjustForHighDensity = displayUtilities.adjustForHighDensity = function(instance) {
			const dpr = window.devicePixelRatio || 1;
			instance.displaySurface.width = instance.surfaceWidth * dpr;
			instance.displaySurface.height = instance.surfaceHeight * dpr;
			instance.renderAgent.scale(dpr, dpr);
			instance.surfaceWidth = instance.displaySurface.width; // Update internal width to match scaled canvas
			instance.surfaceHeight = instance.displaySurface.height; // Update internal height to match scaled canvas
		},
		animationCurves = displayUtilities.animationCurves = {
			straightLine: function (t) {
				return t;
			}
		};

}).call(this);