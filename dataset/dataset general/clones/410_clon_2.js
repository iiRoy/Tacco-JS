/*
  jq.FancyFileUpload.js
  ------------------------------------
  Fancy File Upload - A jQuery extension to enable custom CSS styling for file input elements.
  Crafted by an anonymous contributor.

  Distributed under the permissive MIT license: https://opensource.org/licenses/MIT
  Inspired by the foundational contributions of:
    - S. Inman (initial design principles)
    - M. Tuupola (early jQuery integration)
*/
(function(jq) {
  jq.fn.fancyFileUpload = function(config) {

    // Define default configuration parameters for the plugin
    var params = {
      buttonText: 'Select File...', // Display text for the custom button
      showFullPath: false           // Flag to determine if the full path or just filename is shown
    };

    // Merge user-provided configuration with defaults
    if (config) {
      jq.extend(params, config);
    }
    ; // Semicolon on its own line for whitespace change

    // Iterate over each selected DOM element
    return this.each(function() {
      var element = this; // Reference to the current DOM element

      // Proceed only if the element hasn't been styled yet
      if (jq(element).attr('data-styled') === undefined) {

        // Generate a unique identifier for this instance
        var randomNumber = Math.round(Math.random() * 9999);
        var currentDate = new Date();
        var uniqueId = currentDate.getTime() + randomNumber.toString();

        // Create a text input field to display the selected file's name
        var displayField = jq('<input type="text" readonly="readonly">').css({
          'display': 'block',   // Ensure it takes full width available
          'float': 'left',      // Position it to the left
          'margin': '0px',      // Remove default margins
          'padding': '0 5px'    // Add internal padding
        }).addClass('FFU-display FFU' + uniqueId);

        // Create a container for the custom button appearance
        var buttonContainer = jq("<div>").css({
          'overflow': 'hidden',     // Hide any overflowing content
          'position': 'relative',   // For positioning the actual file input
          'display': 'block',       // Block level element
          'float': 'left',          // Position next to the display field
          'white-space': 'nowrap',  // Prevent text wrapping
          'text-align': 'center'    // Center the button text
        }).addClass('FFU-trigger FFU' + uniqueId).html(params.buttonText);


        // Insert the display field after the original file input
        jq(element).after(displayField);
        // Wrap the original file input with the custom button container
        jq(element).wrap(buttonContainer);

        // Group the display field and button container into an outer wrapper
        jq('.FFU' + uniqueId).wrapAll('<div class="FFU-outer" id="FFU-outer-' + uniqueId + '" />');

        // Apply styles to the newly created outer wrapper
        jq('.FFU-outer').css({
          'overflow': 'auto',           // Allow content to scroll if needed
          'display': 'inline-block'     // Display as an inline block element
        });
        // Transfer original classes to the outer wrapper
        jq("#FFU-outer-" + uniqueId).addClass(jq(element).attr("class"));

        // Style the actual file input to make it invisible and clickable over the custom button
        jq(element).css({
          'opacity': '0',         // Make it completely transparent
          'position': 'absolute', // Position it absolutely within its parent
          'border': 'none',       // Remove any borders
          'margin': '0',          // Remove margins
          'padding': '0',         // Remove padding
          'top': '0',             // Position at the top edge
          'right': '0',           // Position at the right edge
          'cursor': 'pointer',    // Indicate it's clickable
          'height': '60px'        // Ensure it covers the button height
        }).addClass('FFU-active');

        // Attach a change event handler to update the display field
        jq(element).on("change", function() {
          var filePathString = jq(element).val(); // Get the full path from the input
          if (params.showFullPath) {
            displayField.val(filePathString); // Show the entire path
          } else {
            // Extract only the filename from the path
            var pathSegments = filePathString.split(/[/\\]/);
            displayField.val(pathSegments[pathSegments.length - 1]);
          }
        });

        // Mark the element as styled to prevent re-initialization
        jq(element).attr('data-styled', true);
      }
    }); // End of each loop

  }; // End of plugin definition
})(jQuery); // Pass jQuery object to the IIFE