/*
 * Author: Arif Setyawan
 *
 * This JavaScript function is designed to work in conjunction with Chart.js.
 * It is crucial to ensure that the Chart.js library is loaded and available
 * before this function is invoked, otherwise, it will not operate correctly.
 */


function respChart ( selector , data , options )
{

    // Define the default options object specifically for a line chart configuration.
    var option = {
        scaleOverlay        : false, // Don't overlay the scale with the chart data.
        scaleOverride       : false, // Do not override the scale with custom steps.
        scaleSteps          : null,  // Number of steps in the scale.
        scaleStepWidth      : null,  // Width of each step in the scale.
        scaleStartValue     : null,  // Starting value for the scale.
        scaleLineColor      : "rgba(0,0,0,.1)", // Color of the scale lines.
        scaleLineWidth      : 1,     // Width of the scale lines.
        scaleShowLabels     : true,  // Display labels on the scale.
        scaleLabel          : "<%=value%>", // Template string for scale labels.
        scaleFontFamily     : "'proxima-nova'", // Font family for scale labels.
        scaleFontSize       : 10,    // Font size for scale labels.
        scaleFontStyle      : "normal", // Font style for scale labels.
        scaleFontColor      : "#909090", // Font color for scale labels.

        scaleShowGridLines  : true,  // Display grid lines.
        scaleGridLineColor  : "rgba(0,0,0,.05)", // Color of the grid lines.
        scaleGridLineWidth  : 1,     // Width of the grid lines.

        bezierCurve         : true,  // Use Bezier curves for line interpolation.
        pointDot            : true,  // Display dots at data points.
        pointDotRadius      : 3,     // Radius of the data point dots.
        pointDotStrokeWidth : 1,     // Stroke width of the data point dots.

        datasetStroke       : true,  // Draw a stroke for the dataset.
        datasetStrokeWidth  : 2,     // Width of the dataset stroke.
        datasetFill         : true,  // Fill the area under the dataset line.

        animation           : true,  // Enable animation for chart rendering.
        animationSteps      : 60,    // Number of steps in the animation.
        animationEasing     : "easeOutQuart", // Easing function for animation.
        onAnimationComplete : null   // Callback function on animation completion.
    };


    // Check if the 'options' parameter was provided as 'false' or 'null'.
    // If so, the default 'option' object will be used instead.
    if ( options == false || options == null ) {
        options = option; // Assign the predefined default options.
    }


    // Obtain the 2D rendering context from the selected canvas element.
    var ctx = selector . get ( 0 ) . getContext ( "2d" ) ;

    // Identify the parent container of the chart canvas to inherit its width for responsiveness.
    var container = $( selector ) . parent ( ) ;


    // Attach a resize event listener to the window object.
    // This ensures that the chart is regenerated whenever the browser window is resized.
    $( window ) . resize ( generateChart ) ;


    /*
     * This nested function is responsible for generating and redrawing the Chart.js chart.
     * It ensures the chart remains responsive to changes in its container's dimensions.
     */
    function generateChart ( ) {
        // Adjust the width attribute of the selector element to match its parent container's width.
        var ww = selector . attr ( 'width' , $ ( container ) . width ( ) ) ;

        // Instantiate a new Chart.js chart or redraw an existing one with the provided data and options.
        new Chart ( ctx ) . Line ( data , options ) ;
    }

    // Execute the chart generation function immediately upon the initial load
    // to render the chart for the first time.
    generateChart ( ) ;

}