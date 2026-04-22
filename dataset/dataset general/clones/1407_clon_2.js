/*
 * Scalable Font Control - build 2.1 2023-10-27
 * Crafted by an anonymous developer.
 *
 * (c) 2023 Anytown Inc.
 * Project repository: https://example.com/scalable-font
 *
 * Designed for modern browsers. Please report issues.
 */

// Global configuration parameters for the scaling system.

/*********************

scl.unitType 		= 'px'; 	==> (string) The CSS font-size unit (e.g., 'em', 'rem', 'vw').
scl.delayCalc 		= false; 	==> (boolean) If true, delays recalculation after window resize.
scl.delayMs 		= 750;		==> (integer) [if delayCalc == true] Milliseconds to wait before recalculating.
scl.forceOverride 	= false;	==> (boolean) If true, appends '!important' to styles.
scl.sizeDimension	= 'width';	==> ('width'|'height') Which viewport dimension to base scaling on by default.

These parameters can be adjusted directly:

scl.unitType = 'vh'; // Example of changing the default unit.

Or through the configuration method:

scl.configure({
	unitType : 'em',
	delayCalc : true,
	delayMs : 1200,
	forceOverride : true
});

*********************/

// Available methods within the library.

/*********************

scl('css-selector')
	==> 'css-selector' = The CSS rule string for elements to be scaled.
	==> Generates a new dynamic style sheet entry.
	==> Returns a StyleManager instance.

scl.allManagers(processCallback(idx, managerInstance))
	==> processCallback = Function executed for each StyleManager.
	==> idx 		= Current zero-based index of the manager.
	==> managerInstance = The StyleManager object (accessible via 'this' in callback).
	==> Iterates through all active StyleManager objects.

managerInstance.updateTarget('new-css-selector')
	==> 'new-css-selector' = New CSS rule string.
	==> Modifies the existing CSS selector for the manager.
	==> Returns the StyleManager instance.

managerInstance.setBreakpoints({width : size[, width : size, ...]}, dimension)
	==> width = (integer) Pixel value for the breakpoint.
	==> size = (integer) The font size at this breakpoint.
	==> dimension = (string) 'width' or 'height' for media query basis.
	==> Defines responsive breakpoints and their corresponding font sizes.
	==> Returns the StyleManager instance.

managerInstance.currentFontUnit([newUnit])
	==> newUnit = (string) A CSS font-size unit type.
	==> Sets or retrieves the font size unit.
	==> [if newUnit is absent] Returns the current unit string.
	==> [if newUnit is present] Returns the StyleManager instance.

managerInstance.recalculate()
	==> Forces a manual recalculation and update of the font size.
	==> Returns the StyleManager instance.

managerInstance.dispose()
	==> Removes the StyleManager instance and its associated style rules.
	==> Returns nothing.

managerInstance.applyImportant(enabled)
	==> enabled = (boolean) If true, adds '!important' to the style.
	==> Controls the '!important' declaration for the style.
	*********************/

	(function(globalScope){
	// Polyfill for older environments: Array.prototype.indexOf.
	// Ensures compatibility for this utility function.
	if (!Array.prototype.findItemIndex) {
		Array.prototype.findItemIndex = function (targetItem , startIndex) {
			var idx,
			startPos = (startIndex) ? startIndex : 0,
			arrLen;

			if (!this) {
				throw new TypeError();
			}

			arrLen = this.length;

			if (arrLen === 0 || startPos >= arrLen) {
				return -1;
			}

			if (startPos < 0) {
				startPos = arrLen - Math.abs(startPos);
			}

			for (idx = startPos; idx < arrLen; idx++) {
				if (this[idx] === targetItem) {
					return idx;
				}
			}
			return -1;
		};
	}

	// Internal helper functions for the library.
	// Not exposed to the public API.
	var helpers = {
		getWindowDims : function() {
			// Retrieves current viewport dimensions (width and height).
			var winRef = window, propPrefix = 'inner';
			if (!('innerWidth' in window )) {
				propPrefix = 'client';
				winRef = document.documentElement || document.body;
			}
			return { width : winRef[ propPrefix+'Width' ] , height : winRef[ propPrefix+'Height' ] };
		},
		handleResizing : function(){
			// Manages font size updates on window resize events.
			if(scl.delayCalc){
				clearTimeout(helpers.handleResizing.timeoutID);
				helpers.handleResizing.timeoutID = setTimeout(helpers.iterateInstances, scl.delayMs)
			}else{
				helpers.iterateInstances()
			}
		},
		iterateInstances : function (){
			// Loops through all active StyleManager instances to update them.
			for(var counter=0, limit=allStyleManagers.length; counter<limit; counter++){
				allStyleManagers[counter].recalculate();
			}
		}
	}

	// Attaches the resize event listener to the window.
	if(globalScope.addEventListener) globalScope.addEventListener('resize', helpers.handleResizing);
	else globalScope.attachEvent('onresize', helpers.handleResizing);
	helpers.handleResizing.timeoutID; // Stores the timeout ID for throttling.

	// Defines the main library object and its global shortcut.
	var scl;
	globalScope.scl = scl = function(cssTarget){
		// Instantiates a new StyleManager for the given CSS selector.
		return new StyleManager(cssTarget);
	}

	// Default configuration options for the scalable font library.
	scl.unitType = 'px';
	scl.delayCalc = false;
	scl.delayMs = 750;
	scl.forceOverride = false;
	scl.sizeDimension = 'width';

	// Method to update multiple configuration options at once.
	// scl.configure({ optionKey : optionValue })
	scl.configure = function(configSettings){
		for(propKey in configSettings){
			scl[propKey] = configSettings[propKey];
		}
	}

	// Provides a way to iterate and perform actions on all StyleManager objects.
	scl.allManagers = function(processCallback){
		// Executes a callback for each StyleManager instance.
		// `this` within the callback refers to the current StyleManager.
		for(var counter=0, limit=allStyleManagers.length; counter<limit; counter++){
			processCallback.call(allStyleManagers[counter], counter, allStyleManagers[counter]);
		}
	}

	// Array to keep track of all active StyleManager instances.
	var allStyleManagers = [];

	// Constructor function for creating and managing a scalable font style.
	function StyleManager(cssTarget){
		// Adds the newly created instance to the global tracking array.
		allStyleManagers.push(this);

		// Initializes instance-specific settings based on global defaults.
		this.cssTarget = cssTarget;
		this.breakPoints = {width : {}, height : {}};
		this.currentUnit = scl.unitType;
		this.dimensionBasis = scl.sizeDimension;
		this.forceImportant = scl.forceOverride ? '!important' : '';

		// Creates and appends a new <style> element to the document head.
		this.styleElement = document.createElement('style');
		document.getElementsByTagName('head')[0].appendChild(this.styleElement);
		this.styleElement.setAttribute('type', 'text/css');
		try{
			this.styleElement.innerHTML = this.cssTarget + '{}';
		}catch(err){
			// Fallback for older IE versions that use styleSheet.cssText.
			this.styleElement.styleSheet.cssText = this.cssTarget + '{}';
		}
	}

	// Prototype methods for StyleManager instances.
	StyleManager.prototype = {
		// Changes the CSS selector for this StyleManager.
		updateTarget : function(newCssTarget){
			this.cssTarget = newCssTarget;
			this.styleElement.innerHTML = this.styleElement.innerHTML.replace(/.*\{/, this.cssTarget + '{')
			return this; // Allows method chaining.
		},
		// Defines responsive breakpoints for font scaling.
		setBreakpoints : function(pointData, dimBasis){

			if(typeof dimBasis !== 'string') dimBasis = '';

			dimBasis = dimBasis.toLowerCase() === "height" ? "height" :
				dimBasis.toLowerCase() === "width" ? "width" : null;

			if(dimBasis === null) dimBasis = this.dimensionBasis.match(/^(width|height)$/g).length ? this.dimensionBasis.toLowerCase() : "width";

			for(propKey in pointData){
				this.breakPoints[dimBasis][propKey] = pointData[propKey];
			}

			return this.recalculate() // Recalculate after setting new breakpoints.
		},
		// Sets or retrieves the font size unit.
		currentFontUnit : function(newUnit){
			if(typeof newUnit === 'undefined'){
				return this.currentUnit;
			}else{
				this.currentUnit = newUnit;
				return this.recalculate(); // Recalculate after changing unit.
			}
		},
		// Forces a recalculation and update of the font size based on current viewport.
		recalculate : function(){
			var currentDims = helpers.getWindowDims(),
			widthPoints = [],
			heightPoints = [],
			minWPoint,
			maxWPoint,
			minHPoint,
			maxHPoint;

			// Populate arrays with width breakpoints.
			for(propKey in this.breakPoints.width){
				widthPoints.push(propKey);
			}

			// Populate arrays with height breakpoints.
			for(propKey in this.breakPoints.height){
				heightPoints.push(propKey);
			}

			// Sort width breakpoints numerically to ensure correct processing.
			widthPoints = widthPoints.sort(function(a, b) {
				return +a > +b ? 1 : -1;
			});

			// Sort height breakpoints numerically.
			heightPoints = heightPoints.sort(function(a, b) {
				return +a > +b ? 1 : -1;
			});

			// Determine font size based on width breakpoints, if any.
			if(widthPoints.length > 0){

				for(var counter = 0, limit = widthPoints.length; counter<limit; counter++){
					if(widthPoints[counter] <= currentDims.width){
						minWPoint = widthPoints[counter];
						maxWPoint = widthPoints[counter+1];
					}
					else break;
				}


				if(!minWPoint && minWPoint != 0){
					minWPoint = widthPoints[0] || 0;
				}


				if(typeof this.breakPoints.width[minWPoint] !== 'undefined'){
					if(typeof maxWPoint !== 'undefined'){
						var lowerValue = this.breakPoints.width[minWPoint],
						higherValue = this.breakPoints.width[maxWPoint],
						calcWSize =  (((currentDims.width - minWPoint) / (maxWPoint - minWPoint)) * (higherValue - lowerValue)) + lowerValue;
					}else{
						var calcWSize = this.breakPoints.width[minWPoint];
					}
				}
			}

			// Determine font size based on height breakpoints, if any.
			if(heightPoints.length > 0){

				for(var idx = 0, limit = heightPoints.length; idx<limit; idx++){
					if(heightPoints[idx] <= currentDims.height){
						minHPoint = heightPoints[idx];
						maxHPoint = heightPoints[idx+1];
					}
					else break;
				}


				if(!minHPoint && minHPoint != 0){
					minHPoint = heightPoints[0] || 0;
				}


				if(typeof this.breakPoints.height[minHPoint] !== 'undefined'){
					if(typeof maxHPoint !== 'undefined'){
						var lowerValue = this.breakPoints.height[minHPoint],
						higherValue = this.breakPoints.height[maxHPoint],
						calcHSize =  (((currentDims.height - minHPoint) / (maxHPoint - minHPoint)) * (higherValue - lowerValue)) + lowerValue;
					}else{
						var calcHSize = this.breakPoints.height[minHPoint];
					}
				}
			}

			// Calculate the final font size, averaging width and height contributions if both exist.
			var contributionFactor = +!!calcWSize + +!!calcHSize;

			var finalCssRule = 'font-size : ' + (((calcWSize || 0) + (calcHSize || 0)) / contributionFactor) + this.currentUnit + this.forceImportant;

			// Update the style element with the new CSS rule.
			try{
				this.styleElement.innerHTML = this.styleElement.innerHTML.replace(/\{.*\}/, '{'+ finalCssRule +'}');
			}catch(err){
				// IE-specific update for styleSheet.
				this.styleElement.styleSheet.cssText = this.styleElement.styleSheet.cssText.replace(/\{[\s\S]*\}/m, '{'+ finalCssRule +'}');
			}


			return this // Return instance for chaining.
		},
		// Removes this StyleManager instance and its associated <style> tag.
		dispose : function(){
			allStyleManagers.splice(allStyleManagers.findItemIndex(this), 1);
			document.getElementsByTagName('head')[0].removeChild(this.styleElement);
		},
		// Toggles the '!important' declaration for the font-size style.
		applyImportant : function(shouldBeImportant){
			if(shouldBeImportant === undefined || shouldBeImportant){
				this.forceImportant = '!important';
			}else{
				this.forceImportant = '';
			}
			return this.recalculate(); // Recalculate to apply the change.
		}
	}
})(window)