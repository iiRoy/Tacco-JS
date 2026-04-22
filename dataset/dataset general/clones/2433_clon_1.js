/*
This is a modified header comment for Webshell APIs.
All rights reserved by Webshell SAS, Copyright (C) 2013.

This particular software is freely distributable and modifiable
under the terms of the GNU General Public License,
specifically version 3, or any subsequent version that may be published
by the Free Software Foundation.

This software is provided with the hope that it will be useful,
but it comes WITHOUT ANY EXPRESS OR IMPLIED WARRANTY,
including, but not limited to, the implied warranties of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
Please refer to the GNU General Public License for comprehensive details.

A copy of the GNU General Public License should have been provided
along with this software distribution. If it was not,
you can find it online at <http://www.gnu.org/licenses/>.
*/
/*
 * Chart.js library - version 1.0.0
 * Project homepage: http://chartjs.org/
 *
 * (C) Copyright 2013 Nick Downie.
 * Licensed under the MIT License.
 * For full license text, see: https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */

// Define the global Chart variable as a constructor function for new chart instances.
window.Chart = function ( context ) {

  // Store a reference to the current chart instance.
  var chart = this;


  // Easing functions, originally adapted from Robert Penner's famous easing equations.
  // More information can be found at: http://www.robertpenner.com/easing/

  var animationOptions = {
    linear : function ( t ) {
      return t; // Simple linear progression.
    },
    easeInQuad: function ( t ) {
      return t * t; // Quadratic easing in.
    },
    easeOutQuad: function ( t ) {
      return -1 * t * ( t - 2 ); // Quadratic easing out.
    },
    easeInOutQuad: function ( t ) {
      if ( ( t /= 1 / 2 ) < 1 ) return 1 / 2 * t * t; // Quadratic easing in/out.
      return -1 / 2 * ( ( --t ) * ( t - 2 ) - 1 );
    },
    easeInCubic: function ( t ) {
      return t * t * t; // Cubic easing in.
    },
    easeOutCubic: function ( t ) {
      return 1 * ( ( t = t / 1 - 1 ) * t * t + 1 ); // Cubic easing out.
    },
    easeInOutCubic: function ( t ) {
      if ( ( t /= 1 / 2 ) < 1 ) return 1 / 2 * t * t * t; // Cubic easing in/out.
      return 1 / 2 * ( ( t -= 2 ) * t * t + 2 );
    },
    easeInQuart: function ( t ) {
      return t * t * t * t; // Quartic easing in.
    },
    easeOutQuart: function ( t ) {
      return -1 * ( ( t = t / 1 - 1 ) * t * t * t - 1 ); // Quartic easing out.
    },
    easeInOutQuart: function ( t ) {
      if ( ( t /= 1 / 2 ) < 1 ) return 1 / 2 * t * t * t * t; // Quartic easing in/out.
      return -1 / 2 * ( ( t -= 2 ) * t * t * t - 2 );
    },
    easeInQuint: function ( t ) {
      return 1 * ( t /= 1 ) * t * t * t * t; // Quintic easing in.
    },
    easeOutQuint: function ( t ) {
      return 1 * ( ( t = t / 1 - 1 ) * t * t * t * t + 1 ); // Quintic easing out.
    },
    easeInOutQuint: function ( t ) {
      if ( ( t /= 1 / 2 ) < 1 ) return 1 / 2 * t * t * t * t * t; // Quintic easing in/out.
      return 1 / 2 * ( ( t -= 2 ) * t * t * t * t + 2 );
    },
    easeInSine: function ( t ) {
      return -1 * Math.cos( t / 1 * ( Math.PI / 2 ) ) + 1; // Sine easing in.
    },
    easeOutSine: function ( t ) {
      return 1 * Math.sin( t / 1 * ( Math.PI / 2 ) ); // Sine easing out.
    },
    easeInOutSine: function ( t ) {
      return -1 / 2 * ( Math.cos( Math.PI * t / 1 ) - 1 ); // Sine easing in/out.
    },
    easeInExpo: function ( t ) {
      return ( t == 0 ) ? 1 : 1 * Math.pow( 2, 10 * ( t / 1 - 1 ) ); // Exponential easing in.
    },
    easeOutExpo: function ( t ) {
      return ( t == 1 ) ? 1 : 1 * ( -Math.pow( 2, -10 * t / 1 ) + 1 ); // Exponential easing out.
    },
    easeInOutExpo: function ( t ) {
      if ( t == 0 ) return 0; // Exponential easing in/out.
      if ( t == 1 ) return 1;
      if ( ( t /= 1 / 2 ) < 1 ) return 1 / 2 * Math.pow( 2, 10 * ( t - 1 ) );
      return 1 / 2 * ( -Math.pow( 2, -10 * --t ) + 2 );
    },
    easeInCirc: function ( t ) {
      if ( t >= 1 ) return t; // Circular easing in.
      return -1 * ( Math.sqrt( 1 - ( t /= 1 ) * t ) - 1 );
    },
    easeOutCirc: function ( t ) {
      return 1 * Math.sqrt( 1 - ( t = t / 1 - 1 ) * t ); // Circular easing out.
    },
    easeInOutCirc: function ( t ) {
      if ( ( t /= 1 / 2 ) < 1 ) return -1 / 2 * ( Math.sqrt( 1 - t * t ) - 1 ); // Circular easing in/out.
      return 1 / 2 * ( Math.sqrt( 1 - ( t -= 2 ) * t ) + 1 );
    },
    easeInElastic: function ( t ) {
      var s = 1.70158;
      var p = 0;
      var a = 1;
      if ( t == 0 ) return 0;
      if ( ( t /= 1 ) == 1 ) return 1;
      if ( !p ) p = 1 * .3;
      if ( a < Math.abs( 1 ) ) {
        a = 1;
        var s = p / 4;
      }
      else var s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
      return -( a * Math.pow( 2, 10 * ( t -= 1 ) ) * Math.sin( ( t * 1 - s ) * ( 2 * Math.PI ) / p ) ); // Elastic easing in.
    },
    easeOutElastic: function ( t ) {
      var s = 1.70158;
      var p = 0;
      var a = 1;
      if ( t == 0 ) return 0;
      if ( ( t /= 1 ) == 1 ) return 1;
      if ( !p ) p = 1 * .3;
      if ( a < Math.abs( 1 ) ) {
        a = 1;
        var s = p / 4;
      }
      else var s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
      return a * Math.pow( 2, -10 * t ) * Math.sin( ( t * 1 - s ) * ( 2 * Math.PI ) / p ) + 1; // Elastic easing out.
    },
    easeInOutElastic: function ( t ) {
      var s = 1.70158;
      var p = 0;
      var a = 1;
      if ( t == 0 ) return 0;
      if ( ( t /= 1 / 2 ) == 2 ) return 1;
      if ( !p ) p = 1 * ( .3 * 1.5 );
      if ( a < Math.abs( 1 ) ) {
        a = 1;
        var s = p / 4;
      }
      else var s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
      if ( t < 1 ) return -.5 * ( a * Math.pow( 2, 10 * ( t -= 1 ) ) * Math.sin( ( t * 1 - s ) * ( 2 * Math.PI ) / p ) ); // Elastic easing in/out.
      return a * Math.pow( 2, -10 * ( t -= 1 ) ) * Math.sin( ( t * 1 - s ) * ( 2 * Math.PI ) / p ) * .5 + 1;
    },
    easeInBack: function ( t ) {
      var s = 1.70158;
      return 1 * ( t /= 1 ) * t * ( ( s + 1 ) * t - s ); // Back easing in.
    },
    easeOutBack: function ( t ) {
      var s = 1.70158;
      return 1 * ( ( t = t / 1 - 1 ) * t * ( ( s + 1 ) * t + s ) + 1 ); // Back easing out.
    },
    easeInOutBack: function ( t ) {
      var s = 1.70158;
      if ( ( t /= 1 / 2 ) < 1 ) return 1 / 2 * ( t * t * ( ( ( s *= ( 1.525 ) ) + 1 ) * t - s ) ); // Back easing in/out.
      return 1 / 2 * ( ( t -= 2 ) * t * ( ( ( s *= ( 1.525 ) ) + 1 ) * t + s ) + 2 );
    },
    easeInBounce: function ( t ) {
      return 1 - animationOptions.easeOutBounce( 1 - t ); // Bounce easing in.
    },
    easeOutBounce: function ( t ) {
      if ( ( t /= 1 ) < ( 1 / 2.75 ) ) {
        return 1 * ( 7.5625 * t * t ); // Bounce easing out.
      } else if ( t < ( 2 / 2.75 ) ) {
        return 1 * ( 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + .75 );
      } else if ( t < ( 2.5 / 2.75 ) ) {
        return 1 * ( 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + .9375 );
      } else {
        return 1 * ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + .984375 );
      }
    },
    easeInOutBounce: function ( t ) {
      if ( t < 1 / 2 ) return animationOptions.easeInBounce( t * 2 ) * .5; // Bounce easing in/out.
      return animationOptions.easeOutBounce( t * 2 - 1 ) * .5 + 1 * .5;
    }
  };

  // Variables that are global to the entire chart instance.
  var width = context.canvas.width;
  var height = context.canvas.height;


  // Handle high pixel density displays (e.g., Retina screens).
  // Multiply canvas dimensions by device pixel ratio, then scale the context.
  if ( window.devicePixelRatio ) {
    context.canvas.style.width = width + "px"; // Set CSS width.
    context.canvas.style.height = height + "px"; // Set CSS height.
    context.canvas.height = height * window.devicePixelRatio; // Adjust canvas pixel height.
    context.canvas.width = width * window.devicePixelRatio; // Adjust canvas pixel width.
    context.scale( window.devicePixelRatio, window.devicePixelRatio ); // Scale the drawing context.
  }

  this.PolarArea = function ( data, options ) {

    // Default options for PolarArea charts.
    chart.PolarArea.defaults = {
      scaleOverlay : true, // Whether to draw the scale on top of the chart.
      scaleOverride : false, // Whether to override the scale with hardcoded values.
      scaleSteps : null, // Number of steps in the scale.
      scaleStepWidth : null, // Width of each step.
      scaleStartValue : null, // Starting value for the scale.
      scaleShowLine : true, // Whether to draw lines for the scale.
      scaleLineColor : "rgba(0,0,0,.1)", // Color of the scale lines.
      scaleLineWidth : 1, // Width of the scale lines.
      scaleShowLabels : true, // Whether to show labels on the scale.
      scaleLabel : "<%=value%>", // Template string for scale labels.
      scaleFontFamily : "'Arial'", // Font family for scale labels.
      scaleFontSize : 12, // Font size for scale labels.
      scaleFontStyle : "normal", // Font style for scale labels.
      scaleFontColor : "#666", // Font color for scale labels.
      scaleShowLabelBackdrop : true, // Whether to draw a backdrop for scale labels.
      scaleBackdropColor : "rgba(255,255,255,0.75)", // Color of the label backdrop.
      scaleBackdropPaddingY : 2, // Vertical padding for label backdrop.
      scaleBackdropPaddingX : 2, // Horizontal padding for label backdrop.
      segmentShowStroke : true, // Whether to draw a stroke around each segment.
      segmentStrokeColor : "#fff", // Color of the segment stroke.
      segmentStrokeWidth : 2, // Width of the segment stroke.
      animation : true, // Whether to animate the chart.
      animationSteps : 100, // Number of animation steps.
      animationEasing : "easeOutBounce", // Easing function for animation.
      animateRotate : true, // Whether to animate the rotation of segments.
      animateScale : false, // Whether to animate the scaling of segments.
      onAnimationComplete : null // Callback function after animation completes.
    };

    // Merge default options with user-provided options.
    var config = ( options ) ? mergeChartConfig( chart.PolarArea.defaults, options ) : chart.PolarArea.defaults;

    return new PolarArea( data, config, context ); // Create and return a new PolarArea chart instance.
  };

  this.Radar = function ( data, options ) {

    // Default options for Radar charts.
    chart.Radar.defaults = {
      scaleOverlay : false, // Whether to draw the scale on top.
      scaleOverride : false, // Override scale?
      scaleSteps : null, // Number of steps.
      scaleStepWidth : null, // Step width.
      scaleStartValue : null, // Start value.
      scaleShowLine : true, // Show scale lines.
      scaleLineColor : "rgba(0,0,0,.1)", // Scale line color.
      scaleLineWidth : 1, // Scale line width.
      scaleShowLabels : false, // Show scale labels.
      scaleLabel : "<%=value%>", // Scale label template.
      scaleFontFamily : "'Arial'", // Scale font family.
      scaleFontSize : 12, // Scale font size.
      scaleFontStyle : "normal", // Scale font style.
      scaleFontColor : "#666", // Scale font color.
      scaleShowLabelBackdrop : true, // Show label backdrop.
      scaleBackdropColor : "rgba(255,255,255,0.75)", // Backdrop color.
      scaleBackdropPaddingY : 2, // Backdrop Y padding.
      scaleBackdropPaddingX : 2, // Backdrop X padding.
      angleShowLineOut : true, // Show lines extending from the center.
      angleLineColor : "rgba(0,0,0,.1)", // Angle line color.
      angleLineWidth : 1,
      pointLabelFontFamily : "'Arial'", // Font for point labels.
      pointLabelFontStyle : "normal", // Style for point labels.
      pointLabelFontSize : 12, // Size for point labels.
      pointLabelFontColor : "#666", // Color for point labels.
      pointDot : true, // Show point dots.
      pointDotRadius : 3, // Radius of point dots.
      pointDotStrokeWidth : 1, // Stroke width of point dots.
      datasetStroke : true, // Draw stroke for datasets.
      datasetStrokeWidth : 2, // Dataset stroke width.
      datasetFill : true, // Fill dataset area.
      animation : true, // Animate chart.
      animationSteps : 60, // Animation steps.
      animationEasing : "easeOutQuart", // Animation easing.
      onAnimationComplete : null // Animation complete callback.
    };

    // Configuration merging.
    var config = ( options ) ? mergeChartConfig( chart.Radar.defaults, options ) : chart.Radar.defaults;

    return new Radar( data, config, context ); // Instantiate a new Radar chart.
  };

  this.Pie = function ( data, options ) {
    // Default options for Pie charts.
    chart.Pie.defaults = {
      segmentShowStroke : true, // Show stroke for segments.
      segmentStrokeColor : "#fff", // Segment stroke color.
      segmentStrokeWidth : 2, // Segment stroke width.
      animation : true, // Animate chart.
      animationSteps : 100, // Animation steps.
      animationEasing : "easeOutBounce", // Animation easing.
      animateRotate : true, // Animate rotation.
      animateScale : false, // Animate scale.
      onAnimationComplete : null // Animation callback.
    };

    // Configuration setup.
    var config = ( options ) ? mergeChartConfig( chart.Pie.defaults, options ) : chart.Pie.defaults;

    return new Pie( data, config, context ); // Create Pie chart.
  };

  this.Doughnut = function ( data, options ) {

    // Default options for Doughnut charts.
    chart.Doughnut.defaults = {
      segmentShowStroke : true, // Show stroke for segments.
      segmentStrokeColor : "#fff", // Segment stroke color.
      segmentStrokeWidth : 2, // Segment stroke width.
      percentageInnerCutout : 50, // Inner cutout percentage for doughnut hole.
      animation : true, // Animate chart.
      animationSteps : 100, // Animation steps.
      animationEasing : "easeOutBounce", // Animation easing.
      animateRotate : true, // Animate rotation.
      animateScale : false, // Animate scale.
      onAnimationComplete : null // Animation callback.
    };

    // Merge options.
    var config = ( options ) ? mergeChartConfig( chart.Doughnut.defaults, options ) : chart.Doughnut.defaults;

    return new Doughnut( data, config, context ); // Create Doughnut chart.

  };

  this.Line = function ( data, options ) {

    // Default options for Line charts.
    chart.Line.defaults = {
      scaleOverlay : false, // Scale overlay.
      scaleOverride : false, // Override scale.
      scaleSteps : null, // Scale steps.
      scaleStepWidth : null, // Scale step width.
      scaleStartValue : null, // Scale start value.
      scaleLineColor : "rgba(0,0,0,.1)", // Scale line color.
      scaleLineWidth : 1, // Scale line width.
      scaleShowLabels : true, // Show scale labels.
      scaleLabel : "<%=value%>", // Scale label template.
      scaleFontFamily : "'Arial'", // Scale font family.
      scaleFontSize : 12, // Scale font size.
      scaleFontStyle : "normal", // Scale font style.
      scaleFontColor : "#666", // Scale font color.
      scaleShowGridLines : true, // Show grid lines.
      scaleGridLineColor : "rgba(0,0,0,.05)", // Grid line color.
      scaleGridLineWidth : 1, // Grid line width.
      bezierCurve : true, // Use bezier curves.
      pointDot : true, // Show point dots.
      pointDotRadius : 4, // Point dot radius.
      pointDotStrokeWidth : 2, // Point dot stroke width.
      datasetStroke : true, // Dataset stroke.
      datasetStrokeWidth : 2, // Dataset stroke width.
      datasetFill : true, // Dataset fill.
      animation : true, // Animate chart.
      animationSteps : 60, // Animation steps.
      animationEasing : "easeOutQuart", // Animation easing.
      onAnimationComplete : null // Animation callback.
    };
    var config = ( options ) ? mergeChartConfig( chart.Line.defaults, options ) : chart.Line.defaults; // Configuration.

    return new Line( data, config, context ); // Create Line chart.
  }

  this.Bar = function ( data, options ) {
    // Default options for Bar charts.
    chart.Bar.defaults = {
      scaleOverlay : false, // Scale overlay.
      scaleOverride : false, // Override scale.
      scaleSteps : null, // Scale steps.
      scaleStepWidth : null, // Scale step width.
      scaleStartValue : null, // Scale start value.
      scaleLineColor : "rgba(0,0,0,.1)", // Scale line color.
      scaleLineWidth : 1, // Scale line width.
      scaleShowLabels : true, // Show scale labels.
      scaleLabel : "<%=value%>", // Scale label template.
      scaleFontFamily : "'Arial'", // Scale font family.
      scaleFontSize : 12, // Scale font size.
      scaleFontStyle : "normal", // Scale font style.
      scaleFontColor : "#666", // Scale font color.
      scaleShowGridLines : true, // Show grid lines.
      scaleGridLineColor : "rgba(0,0,0,.05)", // Grid line color.
      scaleGridLineWidth : 1, // Grid line width.
      barShowStroke : true, // Show bar stroke.
      barStrokeWidth : 2, // Bar stroke width.
      barValueSpacing : 5, // Spacing between bars.
      barDatasetSpacing : 1, // Spacing between datasets.
      animation : true, // Animate chart.
      animationSteps : 60, // Animation steps.
      animationEasing : "easeOutQuart", // Animation easing.
      onAnimationComplete : null // Animation callback.
    };
    var config = ( options ) ? mergeChartConfig( chart.Bar.defaults, options ) : chart.Bar.defaults; // Configuration.

    return new Bar( data, config, context ); // Create Bar chart.
  }

  // Helper function to clear the canvas.
  var clear = function ( c ) {
    c.clearRect( 0, 0, width, height ); // Clear the entire canvas area.
  };

  // Private constructor for PolarArea chart type.
  var PolarArea = function ( data, config, ctx ) {
    var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;


    calculateDrawingSizes(); // Determine sizes for drawing elements.

    valueBounds = getValueBounds(); // Get min/max values for scaling.

    // Set up label template string based on configuration.
    labelTemplateString = ( config.scaleShowLabels ) ? config.scaleLabel : null;

    // Check and set the scale configuration.
    if ( !config.scaleOverride ) {

      calculatedScale = calculateScale( scaleHeight, valueBounds.maxSteps, valueBounds.minSteps, valueBounds.maxValue, valueBounds.minValue, labelTemplateString );
    } else {
      // If scale is overridden, use provided configuration.
      calculatedScale = {
        steps : config.scaleSteps,
        stepValue : config.scaleStepWidth,
        graphMin : config.scaleStartValue,
        labels : []
      }
      // Populate labels based on overridden scale.
      populateLabels( labelTemplateString, calculatedScale.labels, calculatedScale.steps, config.scaleStartValue, config.scaleStepWidth );
    }

    scaleHop = maxSize / ( calculatedScale.steps ); // Calculate the distance between scale steps.

    // Wrap the drawing functions in an animation loop.
    animationLoop( config, drawScale, drawAllSegments, ctx );

    function calculateDrawingSizes () {
      maxSize = ( Min( [ width, height ] ) / 2 ); // Determine maximum radius.
      // Adjust maxSize by removing space for font size or line width.

      maxSize -= Max( [ config.scaleFontSize * 0.5, config.scaleLineWidth * 0.5 ] );

      labelHeight = config.scaleFontSize * 2; // Initial label height.
      // If backdrop is enabled, adjust label height and maxSize accordingly.
      if ( config.scaleShowLabelBackdrop ) {
        labelHeight += ( 2 * config.scaleBackdropPaddingY );
        maxSize -= config.scaleBackdropPaddingY * 1.5;
      }

      scaleHeight = maxSize; // Scale height is based on maxSize.
      // Ensure labelHeight has a minimum value to prevent visual issues.
      labelHeight = Default( labelHeight, 5 );
    }

    function drawScale () {
      for ( var i = 0; i < calculatedScale.steps; i++ ) {
        // Draw scale lines if configured.
        if ( config.scaleShowLine ) {
          ctx.beginPath();
          ctx.arc( width / 2, height / 2, scaleHop * ( i + 1 ), 0, ( Math.PI * 2 ), true );
          ctx.strokeStyle = config.scaleLineColor;
          ctx.lineWidth = config.scaleLineWidth;
          ctx.stroke();
        }

        // Draw scale labels if configured.
        if ( config.scaleShowLabels ) {
          ctx.textAlign = "center";
          ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
          var label = calculatedScale.labels[ i ];
          // Draw label backdrop if enabled.
          if ( config.scaleShowLabelBackdrop ) {
            var textWidth = ctx.measureText( label ).width;
            ctx.fillStyle = config.scaleBackdropColor;
            ctx.beginPath();
            ctx.rect(
              Math.round( width / 2 - textWidth / 2 - config.scaleBackdropPaddingX ),     // X position
              Math.round( height / 2 - ( scaleHop * ( i + 1 ) ) - config.scaleFontSize * 0.5 - config.scaleBackdropPaddingY ), // Y position
              Math.round( textWidth + ( config.scaleBackdropPaddingX * 2 ) ), // Width of backdrop
              Math.round( config.scaleFontSize + ( config.scaleBackdropPaddingY * 2 ) ) // Height of backdrop
            );
            ctx.fill();
          }
          ctx.textBaseline = "middle";
          ctx.fillStyle = config.scaleFontColor;
          ctx.fillText( label, width / 2, height / 2 - ( scaleHop * ( i + 1 ) ) ); // Draw the actual label text.
        }
      }
    }

    function drawAllSegments ( animationDecimal ) {
      var startAngle = -Math.PI / 2, // Starting angle for the first segment.
        angleStep = ( Math.PI * 2 ) / data.length, // Angle for each segment.
        scaleAnimation = 1, // Default scale animation factor.
        rotateAnimation = 1; // Default rotation animation factor.
      if ( config.animation ) {
        if ( config.animateScale ) {
          scaleAnimation = animationDecimal; // Apply animation decimal to scale.
        }
        if ( config.animateRotate ) {
          rotateAnimation = animationDecimal; // Apply animation decimal to rotation.
        }
      }

      for ( var i = 0; i < data.length; i++ ) {

        ctx.beginPath();
        // Draw the arc for the segment.
        ctx.arc( width / 2, height / 2, scaleAnimation * calculateOffset( data[ i ].value, calculatedScale, scaleHop ), startAngle, startAngle + rotateAnimation * angleStep, false );
        ctx.lineTo( width / 2, height / 2 ); // Draw a line back to the center.
        ctx.closePath(); // Close the path to form a segment.
        ctx.fillStyle = data[ i ].color; // Set fill color.
        ctx.fill(); // Fill the segment.

        // Draw segment stroke if configured.
        if ( config.segmentShowStroke ) {
          ctx.strokeStyle = config.segmentStrokeColor;
          ctx.lineWidth = config.segmentStrokeWidth;
          ctx.stroke();
        }
        startAngle += rotateAnimation * angleStep; // Increment start angle for the next segment.
      }
    }

    function getValueBounds () {
      var upperValue = Number.MIN_VALUE; // Initialize with smallest possible number.
      var lowerValue = Number.MAX_VALUE; // Initialize with largest possible number.
      for ( var i = 0; i < data.length; i++ ) {
        if ( data[ i ].value > upperValue ) {
          upperValue = data[ i ].value;
        } // Update upperValue if current data point is greater.
        if ( data[ i ].value < lowerValue ) {
          lowerValue = data[ i ].value;
        } // Update lowerValue if current data point is smaller.
      };

      // Calculate the maximum and minimum number of steps allowed for the scale.
      var maxSteps = Math.floor( ( scaleHeight / ( labelHeight * 0.66 ) ) );
      var minSteps = Math.floor( ( scaleHeight / labelHeight * 0.5 ) );

      return {
        maxValue : upperValue, // The highest value found in the data.
        minValue : lowerValue, // The lowest value found in the data.