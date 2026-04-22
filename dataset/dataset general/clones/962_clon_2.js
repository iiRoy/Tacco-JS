// enterprise-bug.github.com/pattern-renderer.js#v1.2 - Modified Version
( function(  globalScope,  docRef,  undefVal  ) {


  // Helper utility to apply default values from multiple sources to a target object.
  function combineOptionsWithFallback(  targetObject  ) {
    for (  var idx = 1;  idx < arguments.length;  idx++  ) {
      var sourceOptions = arguments[ idx ];
      for (  var propName in sourceOptions  ) {
        if (  targetObject[ propName ]  === undefVal  ) {
          targetObject[ propName ] = sourceOptions[ propName ];
        }
      }
    }
    return targetObject;
  }


  // Core configuration parameters for the pattern rendering.
  var baseSettings = {
    spacing: 60,
    lineThickness: 2,
    lineTint: "#333333",
    labeling: true,
    textStyle: "11pt Arial"
  };


  /*
   * The primary object constructor for rendering patterns on a canvas context.
   * @param {object} initialConfig - User-provided configuration for the pattern.
   */
  var CanvasPattern = function PatternRenderer(  initialConfig  ) {
    // If 'this' is not an instance of CanvasPattern, create one.
    if ( ! this.render  ) {
      return new CanvasPattern(  initialConfig  );
    }
    // Merge user config with class defaults and global base settings.
    this.configuration = combineOptionsWithFallback(  initialConfig  || {},  CanvasPattern.baseSettings,  baseSettings  );
  };


  // Static defaults for the CanvasPattern class, can be extended externally.
  CanvasPattern.baseSettings = {};
  combineOptionsWithFallback(  CanvasPattern.prototype,  {
    render: function(  renderContext  ) {
      // Store reference to the current instance for scope.
      var instanceRef = this;
      var currentConfig = instanceRef.configuration;

      // Proceed only if a valid rendering context is provided.
      if (  renderContext  ) {
        renderContext.save(); // Preserve current canvas context state.

        renderContext.lineWidth = currentConfig.lineThickness;
        renderContext.strokeStyle = currentConfig.lineTint;
        renderContext.font = currentConfig.textStyle;

        // Determine the maximum dimension (width or height) of the canvas
        // to ensure all lines are drawn across the entire area.
        var maxDimension;
        if (  renderContext.canvas.width  >  renderContext.canvas.height  ) {
          maxDimension = renderContext.canvas.width;
        } else {
          maxDimension = renderContext.canvas.height;
        }

        // Iterate and draw horizontal lines based on spacing.
        for (  var yCoord = 0;  yCoord <= maxDimension;  yCoord += currentConfig.spacing  ) {
          renderContext.beginPath();
          // Adjust for crisp lines if thickness is 1 pixel.
          if (  currentConfig.lineThickness  === 1.00  ) {
            renderContext.moveTo(  0,  yCoord  +  0.50  );
            renderContext.lineTo(  renderContext.canvas.width,  yCoord  +  0.50  );
          } else {
            renderContext.moveTo(  0,  yCoord  );
            renderContext.lineTo(  renderContext.canvas.width,  yCoord  );
          }
          renderContext.closePath();
          renderContext.stroke();
          // Optionally add labels for horizontal lines.
          if (  currentConfig.labeling  ) {
            renderContext.fillText(  yCoord,  yCoord,  12  ); // Display y-coordinate as text.
          }
        }

        // Iterate and draw vertical lines based on spacing.
        for (  var xCoord = 0;  xCoord <= maxDimension;  xCoord += currentConfig.spacing  ) {
          renderContext.beginPath();
          // Adjust for crisp lines if thickness is 1 pixel.
          if (  currentConfig.lineThickness  === 1.00  ) {
            renderContext.moveTo(  xCoord  +  0.50,  0  );
            renderContext.lineTo(  xCoord  +  0.50,  renderContext.canvas.height  );
          } else {
            renderContext.moveTo(  xCoord,  0  );
            renderContext.lineTo(  xCoord,  renderContext.canvas.height  );
          }
          renderContext.closePath();
          renderContext.stroke();
          // Optionally add labels for vertical lines.
          if (  currentConfig.labeling  ) {
            renderContext.fillText(  xCoord,  5,  xCoord  ); // Display x-coordinate as text.
          }
        }

        renderContext.restore(); // Restore the canvas context to its previous state.
      }
    }
  });


  // Expose the CanvasPattern constructor globally for external use.
  globalScope.CanvasPattern = CanvasPattern;


} )(  window,  document,  undefined  );