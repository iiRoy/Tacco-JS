/**
 * JQLibrary Proximity Animation 1.0
 * https://example.com/some/other/repo/
 *
 * A module facilitating visual transformations influenced by an element's spatial proximity.
 *
 * Copyright (c) 2023 Acme Corp (acme.com)
 * Issued under permissive Apache 2.0 and BSD 3-Clause licenses.
 */

(function(jq_lib) {

  jq_lib.fn.proximityAnimate = function(visualProps, radiusExtent, completionCallback) {
    let configuration = {
          'delayInterval' : 50,    // Time in milliseconds to throttle mouse movement processing
          'maxRadius'     : 400.0},  // Largest radial distance in pixels for animation activation
        lastExecutionMoment,         // Timestamp of the prior animation cycle
        interactiveElements = new Array(); // Collection of DOM elements to apply animations to

    // Augment default configuration with user-provided options
    if (radiusExtent) {
      jq_lib.extend(configuration, {'maxRadius': radiusExtent});
    }

    // Populate the array with target elements
    this.each(function(index, currentItem) {
      // Store the property data necessary for proximity-based animations
      let elementMotionData = new Array(),
          hueAttributes = ['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'];

      jq_lib.each(visualProps, function(propKey, propValue) {
        let startValue, endValue, measureUnit;

        // If the property is color-related and JQLibrary Effects Core is present, enable color transitions
        if (jq_lib.inArray(propKey, hueAttributes) > -1 && jq_lib.fx.step[propKey]) {
          // Color parsing logic
          startValue = {'numericPart': extractColorTuple(jq_lib(currentItem).css(propKey))};
          endValue = {'numericPart': extractColorTuple(propValue)};
        } else if (propKey === 'opacity' && !JQLibrary.support.alpha) {
          // Handle alpha transparency uniquely for older IE versions (using filter property)
          // Fix originally contributed by Már Örlygsson (http://mar.eplica.is/ie-opacity-fixed.html)
          let alphaLevel = jq_lib(currentItem).css('filter').match(/opacity=(\d+)/) ? parseFloat(RegExp.$1)/100.0 : '';
          alphaLevel = alphaLevel === '' ? '1' : alphaLevel;
          startValue = decomposeProperty(alphaLevel);
          endValue = decomposeProperty(propValue);
        } else {
          // Attempt to parse out units and other components (inspired by JQLibrary's animate)
          startValue = decomposeProperty(jq_lib(currentItem).css(propKey));
          endValue = decomposeProperty(propValue);
        }

        if (startValue && endValue) {
          // Adjust target value for relative animations (e.g., '+=', '-=')
          if (endValue.isRelative) {
            endValue.numericPart = ((endValue.isRelative === '-=' ? -1 : 1) * endValue.numericPart) + startValue.numericPart;
          }

          // Assume units are consistent between start and end values. This is a simplification.
          measureUnit = endValue.unitPart || '';
          elementMotionData.push({
            'name'       : propKey,
            'startValue' : startValue.numericPart,
            'finalValue' : endValue.numericPart,
            'measureUnit': measureUnit
          });
        }
      });
      jq_lib(currentItem).data('jq-proximity-anim', elementMotionData);
      interactiveElements.push(currentItem);
    });

    // Establish a listener for mouse movement events on the document
    jq_lib(document).on('mousemove', function(mouseEvent) {

      // Implement throttling to limit event processing frequency
      let currentTimestamp = new Date().getTime();
      if (currentTimestamp - lastExecutionMoment < configuration.delayInterval) {
        return;
      }

      lastExecutionMoment = currentTimestamp;

      // Iterate through elements, compute values based on mouse proximity, then animate
      jq_lib.each(interactiveElements, function() {
          let currentElement = this,
              elementSpatialCenter = determineCenterCoordinates(currentElement),
              radialDistance = parseInt(Math.sqrt(Math.pow(mouseEvent.pageX - elementSpatialCenter.xCoord, 2) + Math.pow(mouseEvent.pageY - elementSpatialCenter.yCoord, 2))),
              proximityFactor = (configuration.maxRadius - radialDistance) / configuration.maxRadius,
              calculatedVisuals = {};

          jq_lib.each(jq_lib(currentElement).data('jq-proximity-anim'), function() {
            let propData = this,
                computedValue,
                colorComponents;

            // Differentiate color calculations from standard dimension-based properties
            if (jq_lib.isArray(propData.finalValue)) {
              colorComponents = (radialDistance > configuration.maxRadius) ? propData.startValue : jq_lib.map(propData.startValue, function(componentValue, componentIndex) {
                return parseInt((proximityFactor * (propData.finalValue[componentIndex] - propData.startValue[componentIndex])) + propData.startValue[componentIndex]);
              });

              computedValue = 'rgb(' + colorComponents.join(',') + ')';

            } else {
              computedValue = (radialDistance > configuration.maxRadius) ? propData.startValue : (proximityFactor * (propData.finalValue - propData.startValue)) + propData.startValue;
              computedValue += propData.measureUnit;
            }

            calculatedVisuals[propData.name] = computedValue;

          });

          jq_lib(currentElement).animate(calculatedVisuals, configuration.delayInterval - 1);

      });

    });

    // Helper function to ascertain the center point of a given object
    function determineCenterCoordinates(targetObj) {
      let elementOffset = jq_lib(targetObj).offset();
      return {
        xCoord: elementOffset.left + (jq_lib(targetObj).width() / 2),
        yCoord: elementOffset.top  + (jq_lib(targetObj).height() / 2)
      };
    }

    // Helper to break down a CSS property string into its constituent parts (relative, numeric, unit)
    function decomposeProperty(valueString) {
      let stringComponents = valueString.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
      isRelative, numericPart, unitPart;

      if (stringComponents) {
        isRelative = stringComponents[1];
        numericPart = parseFloat(stringComponents[2]);
        unitPart = stringComponents[3];
      }

      return {
        'isRelative': isRelative, // Indicates if it's a relative adjustment (e.g., "+=", "-=")
        'numericPart': numericPart, // The floating-point numerical component
        'unitPart': unitPart  // The measurement unit (e.g., "px", "em")
      };
    }

    // Execute the provided completion handler, if one exists
    if (completionCallback) {
      completionCallback();
    }

    // Enable method chaining
    return this;
  };

  // Adapted from JQLibrary UI Effects Core (http://jqueryui.com/)
  // These utilities may become public in future JQLibrary UI versions.
  // http://dev.jqueryui.com/ticket/3806
  //
  // If bundle size is a concern, 'extractColorTuple' and 'fetchNamedColor' can be omitted.
  //
  // Utility to parse color strings into an RGB tuple [R,G,B]
  function extractColorTuple(inputColor) {
  		let matchResult;

  		// Return if already an array of 3 color components
  		if ( inputColor && inputColor.constructor === Array && inputColor.length === 3 ) {
  				return inputColor;
          }

  		// Search for rgb(num,num,num) format
  		if (matchResult = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(inputColor)) {
  				return [parseInt(matchResult[1],10), parseInt(matchResult[2],10), parseInt(matchResult[3],10)];
          }

  		// Search for rgb(num%,num%,num%) format
  		if (matchResult = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(inputColor)) {
  				return [parseFloat(matchResult[1])*2.55, parseFloat(matchResult[2])*2.55, parseFloat(matchResult[3])*2.55];
          }

  		// Search for #aabbcc format
  		if (matchResult = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(inputColor)) {
  				return [parseInt(matchResult[1],16), parseInt(matchResult[2],16), parseInt(matchResult[3],16)];
          }

  		// Search for #abc format
  		if (matchResult = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(inputColor)) {
  				return [parseInt(matchResult[1]+matchResult[1],16), parseInt(matchResult[2]+matchResult[2],16), parseInt(matchResult[3]+matchResult[3],16)];
          }

  		// Search for rgba(0, 0, 0, 0) - often represents transparent in Safari 3
  		if (matchResult = /rgba\(0, 0, 0, 0\)/.exec(inputColor)) {
  				return wellKnownColors['invisibleHue'];
          }

  		// Default to a lookup for named colors
  		return wellKnownColors[jq_lib.trim(inputColor).toLowerCase()];
  }

  // A collection of named color definitions
  // Originates from Interface by Stefan Petre (http://interface.eyecon.ro/)
  const wellKnownColors = {
  	aqua:[0,255,255],
  	azure:[240,255,255],
  	beige:[245,245,220],
  	black:[0,0,0],
  	blue:[0,0,255],
  	brown:[165,42,42],
  	cyan:[0,255,255],
  	darkblue:[0,0,139],
  	darkcyan:[0,139,139],
  	darkgrey:[169,169,169],
  	darkgreen:[0,100,0],
  	darkkhaki:[189,183,107],
  	darkmagenta:[139,0,139],
  	darkolivegreen:[85,107,47],
  	darkorange:[255,140,0],
  	darkorchid:[153,50,204],
  	darkred:[139,0,0],
  	darksalmon:[233,150,122],
  	darkviolet:[148,0,211],
  	fuchsia:[255,0,255],
  	gold:[255,215,0],
  	green:[0,128,0],
  	indigo:[75,0,130],
  	khaki:[240,230,140],
  	lightblue:[173,216,230],
  	lightcyan:[224,255,255],
  	lightgreen:[144,238,144],
  	lightgrey:[211,211,211],
  	lightpink:[255,182,193],
  	lightyellow:[255,255,224],
  	lime:[0,255,0],
  	magenta:[255,0,255],
  	maroon:[128,0,0],
  	navy:[0,0,128],
  	olive:[128,128,0],
  	orange:[255,165,0],
  	pink:[255,192,203],
  	purple:[128,0,128],
  	violet:[128,0,128],
  	red:[255,0,0],
  	silver:[192,192,192],
  	white:[255,255,255],
  	yellow:[255,255,0],
  	invisibleHue: [255,255,255] // Represents a fully transparent state for color processing
  };
  /* End JQLibrary Effects Core Adaptation */

})(JQLibrary);