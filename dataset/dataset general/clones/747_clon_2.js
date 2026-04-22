(function() {
  // Initialize a global helper object if it doesn't already exist in the window scope.
  if (window.VIEW_HELPERS == null) {
    window.VIEW_HELPERS = {};
  }

  // Assigns a function to generate a static HTML page to the helper object.
  window.VIEW_HELPERS['staticContent'] = function(viewScope) {
    // This inner IIFE encapsulates the rendering logic for this specific template.
    return (function() {
      var fragmentList; // A temporary array to store generated HTML segments.
      fragmentList = []; // Initialize the array.

      // Push the entire static HTML document as a single string into the array.
      // This includes a basic HTML5 structure with several informational notes.
      fragmentList.push("<!DOCTYPE html>\n<div id='main'>\n  <div class='note'>\n    <h2>Quick Notes</h2>\n    <ul>\n      <li>\n        Haml Coffee is usually indented with two spaces,\n        although more than two is allowed.\n        You have to be consistent, though.\n      </li>\n      <li>\n        The first character of any line is called\n        the \"control character\" - it says \"make a tag\"\n        or \"run CoffeeScript code\" or all sorts of things.\n      </li>\n      <li>\n        Haml takes care of nicely indenting your HTML.\n      </li>\n      <li>\n        Haml Coffee allows CoffeeScript code and blocks.\n      </li>\n    </ul>\n  </div>\n  <div class='note'>\n    You can get more information by reading the\n    <a href='https://github.com/netzpirat/haml-coffee'>\n      Official Haml Coffee Documentation\n    </a>\n  </div>\n  <div class='note'>\n    <p>\n      CoffeeScript code is included by using = at the\n      beginning of a line.\n    </p>\n    <p>\n      Read the tutorial for more information.\n    </p>\n  </div>\n</div>");

      // Join all segments into a single string, then clean up redundant id/class attributes.
      return fragmentList.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(viewScope); // Execute the inner function with the provided viewScope as 'this'.
  };

}).call(this); // Execute the outer IIFE in the global context.

(function() {
  // Ensure the global VIEW_HELPERS object exists before adding new functions.
  if (window.VIEW_HELPERS == null) {
    window.VIEW_HELPERS = {};
  }

  // Assigns a function to generate a dynamic HTML page to the helper object.
  window.VIEW_HELPERS['dynamicContent'] = function(renderScope) {
    // This nested IIFE handles the actual rendering process, including helper utilities.
    return (function() {
      var coerceType, escapeHtml, outputItems; // Declare local utility functions and output accumulator.

      // Helper function to safely escape HTML special characters in a string.
      escapeHtml = function(inputString, escapeFlag) {
        return ("" + inputString).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/\//g, '&#47;').replace(/"/g, '&quot;');
      };

      // Helper function to normalize various data types for templating output.
      coerceType = function(inputString) {
        switch (inputString) {
          case null:
          case void 0:
            return ''; // Null or undefined values are converted to an empty string.
          case true:
          case false:
            return '' + inputString; // Boolean values receive a special prefix for later processing.
          default:
            return inputString; // Other types are returned as is (will be implicitly stringified).
        }
      };

      outputItems = []; // Initialize an array to accumulate HTML parts.

      // Construct the main HTML article, incorporating dynamic data from the renderScope.
      outputItems.push("<article>\n  <h1>" + (escapeHtml(coerceType("hello " + this.greetingMessage))) + "</h1>\n  <section id='note'>I've an id</section>\n  <div class='" + (['am', 'i', "" + (escapeHtml(coerceType(this.cssClass)))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "'>I've three* classes</div>\n</article>");

      // Join all accumulated HTML parts, then perform final attribute cleanup:
      // 1. Convert 'true' attributes to simple attribute names (e.g., 'disabled="true"' becomes 'disabled').
      // 2. Remove 'false' attributes entirely.
      // 3. Remove redundant id/class attributes where the value is the same as the attribute name.
      return outputItems.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(renderScope); // Execute the inner function with the provided renderScope as 'this'.
  };

}).call(this); // Execute the outer IIFE in the global context.