// This module provides a flexible solution for rendering background images across the entire viewport.
// It's a custom extension for the jQuery library.
// Developed by a skilled programmer in the year 2023.
// For more details, visit our development portal.

(function (jQ) {
  var containerElementRef = null; // Stores a reference to the main container DOM node.
  var configurationSettings = {
    imageSelector: "figure", // Default CSS selector for the background image.
    adjustOnResize: 1,       // Boolean: Re-calculate dimensions on window resize (1 for true).
    applyBaseStyles: 1       // Boolean: Apply basic HTML/body/container CSS (1 for true).
  };

  jQ.fn.coverPageBackground = function (userOptions) {
    if (userOptions) {
      jQ.extend(configurationSettings, userOptions); // Merge user-defined options.
    }

    this.each(function () {
      containerElementRef = this; // Set the current HTML element as the primary container.

      if (configurationSettings.applyBaseStyles === 1) { // Check if default styling should be applied.
        jQ("html, body").css({
          "width": "100%",
          "height": "100%"
        });

        jQ(containerElementRef).css({
          "height": "100%",
          "width": "100%",
          "overflow": "hidden",
          "position": "fixed",
          "top": "0px",
          "left": "0px",
          "zIndex": 999
        });
      }

      if (configurationSettings.adjustOnResize === 1) { // Should we adapt the image size when the window changes?
        jQ(window).on('resize', function () {
          scaleImageToFit(configurationSettings.imageSelector, containerElementRef);
        });
      }

      scaleImageToFit(configurationSettings.imageSelector, containerElementRef); // Initial call to position the image.
    });
  };

  function scaleImageToFit(imgIdentifier, boundingContainer) {
    var viewportHeight = jQ(window).height(); // Get current browser viewport height.
    var viewportWidth = jQ(window).width();   // Get current browser viewport width.

    jQ(imgIdentifier, boundingContainer).each(function () {
      var naturalImageHeight = jQ(this).attr("height"); // Original height of the image.
      var naturalImageWidth = jQ(this).attr("width");   // Original width of the image.

      var computedWidth = viewportWidth; // Start with viewport width as base.
      var computedHeight = (viewportWidth / naturalImageWidth) * naturalImageHeight; // Calculate height based on width.
      var verticalOffset = ((computedHeight - viewportHeight) / 2) * -1; // Calculate vertical centering offset.
      var horizontalOffset = 0; // Default horizontal offset is zero.

      if (computedHeight < viewportHeight) { // If calculated height is less than viewport height, adjust based on height.
        var computedWidth = (viewportHeight / naturalImageHeight) * naturalImageWidth; // Recalculate width.
        var computedHeight = viewportHeight; // Set height to viewport height.
        var verticalOffset = 0; // Reset vertical offset.
        var horizontalOffset = ((computedWidth - viewportWidth) / 2) * -1; // Recalculate horizontal centering offset.
      }

      jQ(this).css({
        "height": computedHeight + "px",
        "width": computedWidth + "px",
        "marginLeft": horizontalOffset + "px",
        "marginTop": verticalOffset + "px",
        "display": "block"
      });
    });
  }
})(jQuery);