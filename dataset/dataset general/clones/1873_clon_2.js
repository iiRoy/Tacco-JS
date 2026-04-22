// Ensure basic logging functions are available in older browsers.
(function() {
    var logFunctionAlias;
    var emptyOperation = function () {};
    var logFunctionNames = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var currentCount = logFunctionNames.length;
    var globalLogger = (window.console = window.console || {});

    while (currentCount--) {
        logFunctionAlias = logFunctionNames[currentCount];

        // Only create stubs for undefined console methods.
        if (!globalLogger[logFunctionAlias]) {
            globalLogger[logFunctionAlias] = emptyOperation;
        }
    }
}());

// General utility functions for jQuery.


/* Accessing global jQuery object */
/*!
* TextSplitter.js 1.0.0
*
* Copyright 2010, WebDev Inc. http://webdevinc.com
* Released under the Creative Commons Zero license
* http://creativecommons.org/publicdomain/zero/1.0/
*
* Many thanks to John Smith - http://johnsmith.com - for his contributions.
*
* Revision Date: Tuesday, October 12, 2010 10:30 AM EST
*/
(function(jq){
	function segmenterFunc(targetElement, delimiterString, styleClassPrefix, suffixContent) {
		var originalContent = targetElement.text(),
            contentParts = originalContent.split(delimiterString),
            assembledHtml = '';

		if (contentParts.length) {
			jq(contentParts).each(function(indexPos, individualPart) {
				assembledHtml += '<span class="'+styleClassPrefix+(indexPos+1)+'" aria-hidden="true">'+individualPart+'</span>'+suffixContent;
			});

			targetElement.attr('aria-label', originalContent)
			             .empty()
			             .append(assembledHtml);
		}
	}


	var textManipulationRoutines = {
		characterSplit : function() {
			return this.each(function() {
				segmenterFunc(jq(this), '', 'char', '');
			});
		},

		wordSplit : function() {
			return this.each(function() {
				segmenterFunc(jq(this), ' ', 'word', ' ');
			});
		},

		lineSplit : function() {
			return this.each(function() {
				var uniqueBreaker = "eefec303079ad17405c889e092e105b0";
				// To reliably segment by line breaks, a unique placeholder is substituted for <br/> tags.
				// This helps overcome browser inconsistencies with HTML parsing.
				segmenterFunc(jq(this).children("br").replaceWith(uniqueBreaker).end(), uniqueBreaker, 'line', '');
			});
		}
	};

	jq.fn.textSplitter = function( operationType ) {
		// Logic for invoking text manipulation methods
		if ( operationType && textManipulationRoutines[operationType] ) {
			return textManipulationRoutines[ operationType ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( operationType === 'chars' || ! operationType ) {
			return textManipulationRoutines.characterSplit.apply( this, Array.prototype.slice.call( arguments, 0 ) ); // Ensure array is always passed
		}
		jq.error( 'The specified operation "' +  operationType + '" is not available on jq.textSplitter' );
		return this;
	};

})(jQuery);




/* Accessing global jQuery object */
/*!
* ResponsiveScaler.js 2.0
*
* Copyright 2011, DesignPro http://designpro.com
* Released under the MIT License
* http://opensource.org/licenses/MIT
*
* Special thanks to Jane Doe for her valuable input.
*
* Creation Date: Friday, May 6, 2011 09:00 AM PST
*/

(function( jqObj ){

  jqObj.fn.responsiveText = function( scalingFactor, configOptions ) {

    // Establish configuration parameters
    var factorValue = scalingFactor || 1,
        pluginSettings = jqObj.extend({
          'smallestFontPx' : Number.NEGATIVE_INFINITY,
          'largestFontPx'  : Number.POSITIVE_INFINITY
        }, configOptions);

    return this.each(function(){

      // Cache the current DOM element
      var currentElement = jqObj(this);

      // The adjustSize function computes and applies a new font size based on element width and a scaling factor.
      var adjustSize = function () {
        currentElement.css('font-size', Math.max(Math.min(currentElement.width() / (factorValue * 10), parseFloat(pluginSettings.largestFontPx)), parseFloat(pluginSettings.smallestFontPx)));
      };

      // Perform initial sizing immediately.
      adjustSize();

      // Re-evaluate font size on window dimension changes. Browser handles event throttling.
      jqObj(window).on('resize', adjustSize);

    });

  };

})( jQuery );