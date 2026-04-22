(function(globalScope) {
  // Polyfill for Array.prototype.indexOf for older browsers
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
      if (this === null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (len === 0) {
        return -1;
      }

      var n = fromIndex | 0;
      if (n >= len) {
        return -1;
      }

      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (k in o && o[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }

  // Internal helper functions
  const utilityFunctions = {
    // Get current viewport dimensions
    getCurrentViewbox: () => {
      let currentElement = globalScope;
      let dimensionKey = 'inner';
      if (!('innerWidth' in globalScope)) {
        dimensionKey = 'client';
        currentElement = document.documentElement || document.body;
      }
      return {
        horizontal: currentElement[dimensionKey + 'Width'],
        vertical: currentElement[dimensionKey + 'Height']
      };
    },
    // Handles window resize events
    handleResizeEvent: () => {
      if (fontGen.config.throttleEnabled) {
        clearTimeout(utilityFunctions.handleResizeEvent.delayTimer);
        utilityFunctions.handleResizeEvent.delayTimer = setTimeout(utilityFunctions.refreshAllInstances, fontGen.config.throttleDuration);
      } else {
        utilityFunctions.refreshAllInstances();
      }
    },
    // Iterates and updates all font generation instances
    refreshAllInstances: () => {
      fontGen.registeredInstances.forEach(instance => instance.synchronize());
    }
  };

  // Attach resize event listener
  if (globalScope.addEventListener) {
    globalScope.addEventListener('resize', utilityFunctions.handleResizeEvent);
  } else {
    globalScope.attachEvent('onresize', utilityFunctions.handleResizeEvent);
  }
  utilityFunctions.handleResizeEvent.delayTimer = null; // Timer for throttling

  // Main object for font generation
  const fontGen = function(targetSelector) {
    return new FontStylizer(targetSelector);
  };

  globalScope.fontGen = fontGen;

  // Default configuration settings
  fontGen.config = {
    unitType: 'px',
    throttleEnabled: false,
    throttleDuration: 500,
    forceOverride: false,
    dimensionPreference: 'width'
  };

  // Method to update configuration options
  fontGen.configure = function(newOptions) {
    Object.assign(fontGen.config, newOptions);
  };

  // Storage for all active FontStylizer instances
  fontGen.registeredInstances = [];

  // Method to iterate over all instances
  fontGen.eachInstance = function(iterationCallback) {
    fontGen.registeredInstances.forEach((instance, index) => {
      iterationCallback.call(instance, index, instance);
    });
  };

  // Constructor for FontStylizer instances
  function FontStylizer(targetSelector) {
    fontGen.registeredInstances.push(this);

    this.currentSelector = targetSelector;
    this.breakpointSettings = {
      horizontal: {},
      vertical: {}
    };
    this.currentUnit = fontGen.config.unitType;
    this.preferredDimension = fontGen.config.dimensionPreference;
    this.importantFlag = fontGen.config.forceOverride ? '!important' : '';

    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    this.styleElement.setAttribute('type', 'text/css');

    try {
      this.styleElement.innerHTML = this.currentSelector + '{}';
    } catch (error) {
      this.styleElement.styleSheet.cssText = this.currentSelector + '{}';
    }
  }

  // Prototype methods for FontStylizer instances
  FontStylizer.prototype = {
    // Change the CSS selector
    modifySelector: function(newSelector) {
      this.currentSelector = newSelector;
      this.styleElement.innerHTML = this.styleElement.innerHTML.replace(/.*\{/, this.currentSelector + '{');
      return this;
    },
    // Define media query breakpoints
    setBreakpoints: function(breakPoints, axis) {
      let resolvedAxis = axis ? axis.toLowerCase() : '';

      if (!['width', 'height'].includes(resolvedAxis)) {
        resolvedAxis = this.preferredDimension.toLowerCase();
        if (!['width', 'height'].includes(resolvedAxis)) {
          resolvedAxis = 'width'; // Fallback
        }
      }

      const dimensionKey = resolvedAxis === 'height' ? 'vertical' : 'horizontal';

      for (const point in breakPoints) {
        this.breakpointSettings[dimensionKey][point] = breakPoints[point];
      }

      return this.synchronize();
    },
    // Get or set the font size unit
    getSetUnit: function(unitValue) {
      if (unitValue === undefined) {
        return this.currentUnit;
      } else {
        this.currentUnit = unitValue;
        return this.synchronize();
      }
    },
    // Recalculate and apply font size
    synchronize: function() {
      const currentViewport = utilityFunctions.getCurrentViewbox();
      const horizontalPoints = Object.keys(this.breakpointSettings.horizontal).map(Number).sort((a, b) => a - b);
      const verticalPoints = Object.keys(this.breakpointSettings.vertical).map(Number).sort((a, b) => a - b);

      let calculatedHorizontalSize;
      if (horizontalPoints.length > 0) {
        let lowerBound = horizontalPoints.find(p => p <= currentViewport.horizontal);
        let upperBound = horizontalPoints.find(p => p > currentViewport.horizontal);

        if (lowerBound === undefined) {
          lowerBound = horizontalPoints[0];
          if (lowerBound === undefined) lowerBound = 0;
        }

        const lowerVal = this.breakpointSettings.horizontal[lowerBound];
        if (lowerVal !== undefined) {
          if (upperBound !== undefined) {
            const higherVal = this.breakpointSettings.horizontal[upperBound];
            calculatedHorizontalSize = (((currentViewport.horizontal - lowerBound) / (upperBound - lowerBound)) * (higherVal - lowerVal)) + lowerVal;
          } else {
            calculatedHorizontalSize = lowerVal;
          }
        }
      }

      let calculatedVerticalSize;
      if (verticalPoints.length > 0) {
        let lowerBound = verticalPoints.find(p => p <= currentViewport.vertical);
        let upperBound = verticalPoints.find(p => p > currentViewport.vertical);

        if (lowerBound === undefined) {
          lowerBound = verticalPoints[0];
          if (lowerBound === undefined) lowerBound = 0;
        }

        const lowerVal = this.breakpointSettings.vertical[lowerBound];
        if (lowerVal !== undefined) {
          if (upperBound !== undefined) {
            const higherVal = this.breakpointSettings.vertical[upperBound];
            calculatedVerticalSize = (((currentViewport.vertical - lowerBound) / (upperBound - lowerBound)) * (higherVal - lowerVal)) + lowerVal;
          } else {
            calculatedVerticalSize = lowerVal;
          }
        }
      }

      let sizeSum = (calculatedHorizontalSize || 0) + (calculatedVerticalSize || 0);
      let contributingFactors = (calculatedHorizontalSize !== undefined ? 1 : 0) + (calculatedVerticalSize !== undefined ? 1 : 0);

      let finalFontSize = 0;
      if (contributingFactors > 0) {
        finalFontSize = sizeSum / contributingFactors;
      } else if (this.currentUnit === 'px' || this.currentUnit === 'em' || this.currentUnit === 'rem') {
        finalFontSize = 16; // Default if no breakpoints are set
      }

      const cssDeclaration = `font-size: ${finalFontSize}${this.currentUnit}${this.importantFlag}`;

      try {
        this.styleElement.innerHTML = this.styleElement.innerHTML.replace(/\{.*\}/, `{${cssDeclaration}}`);
      } catch (error) {
        this.styleElement.styleSheet.cssText = this.styleElement.styleSheet.cssText.replace(/\{[\s\S]*\}/m, `{${cssDeclaration}}`);
      }

      return this;
    },
    // Remove the instance and its associated style element
    destroy: function() {
      const index = fontGen.registeredInstances.indexOf(this);
      if (index > -1) {
        fontGen.registeredInstances.splice(index, 1);
      }
      document.head.removeChild(this.styleElement);
    },
    // Control the !important flag
    setImportant: function(shouldBeImportant) {
      this.importantFlag = (shouldBeImportant === undefined || shouldBeImportant) ? '!important' : '';
      return this.synchronize();
    }
  };
})(window);