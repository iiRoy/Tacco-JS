// This is a custom logging utility, inspired by paulirish.com
// It provides a window.log function that stores history and safely calls console.log.
window.log = function () {

  // Initialize log history if it doesn't exist. This array stores all log arguments.
  log.history = log.history || [];

  // Push the current arguments to the history array for later reference.
  log.history.push(arguments);

  // Check if console is available in the current environment.
  if (this.console) {

    // Set arguments.callee to its caller to get a better stack trace in some consoles.
    arguments.callee = arguments.callee.caller;

    // Convert the arguments object into a true array using slice.call.
    var newarr = [].slice.call(arguments);

    // Determine the correct way to call console.log based on its type.
    // Some older IE versions might have console.log as an object.
    (typeof console.log === 'object' ?
      log.apply.call(console.log, console, newarr) : // If it's an object, use apply.call
      console.log.apply(console, newarr)             // Otherwise, use direct apply
    );
  }
};


// This immediately invoked function expression (IIFE) provides a robust
// console polyfill, ensuring console methods are always available and safe to call.
(function (b) {
  // A dummy function to replace missing console methods.
  function c() {}

  // List of standard console methods.
  for (var d = "assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),
      a; // Declare 'a' for use in the loop.
      a = d.pop(); // Iterate backwards through the console methods array.
  ) {
    // If a console method doesn't exist on the 'b' object (which is window.console),
    // assign the dummy function 'c' to it.
    b[a] = b[a] || c
  }
})((function () {
  try {
    // Attempt to call console.log to check if it exists and is callable.
    console.log();
    // If successful, return the existing window.console object.
    return window.console;
  } catch (err) {
    // If an error occurs (e.g., console is undefined or its methods are not functions),
    // return a dummy console object with empty methods.
    return window.console = {};
  }
})());


// This section is for jQuery/helper plugins. It's recommended to place them here
// to avoid multiple HTTP requests for separate script files, improving performance.

/*global jQuery */
/*!
 * FitText.js - A jQuery plugin for inflating web type
 * Version 1.0
 *
 * Copyright 2011, Dave Rupert http://daverupert.com
 * Released under the WTFPL license - Do What The F*ck You Want To Public License.
 * For more details, see http://sam.zoy.org/wtfpl/
 *
 * Date: Thursday, May 5th, 2011, 14:23:00 -0600 (Central Daylight Time)
 */

(function ($) {

  // Extend jQuery's prototype with the fitText function.
  $.fn.fitText = function (kompressor, options) {

    // Setup options: 'compressor' defaults to 1, and 'settings' merges
    // default min/max font sizes with any provided options.
    var compressor = kompressor || 1,
      settings = $.extend({
        'minFontSize': Number.NEGATIVE_INFINITY, // No minimum font size by default
        'maxFontSize': Number.POSITIVE_INFINITY  // No maximum font size by default
      }, options);

    // Iterate over each selected element to apply FitText.
    return this.each(function () {

      // Store the current jQuery object for efficient access.
      var $this = $(this);

      // Define the resizer function, which calculates and sets the font size.
      // It scales font size based on element width, compressor, and min/max limits.
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor * 10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call the resizer once immediately to set the initial font size.
      resizer();

      // Attach the resizer function to the window's 'resize' event.
      // This ensures the font size adjusts dynamically.
      // Note: Browsers like Opera often debounce resize events automatically.
      $(window).on('resize', resizer);

    });

  };

})(jQuery);