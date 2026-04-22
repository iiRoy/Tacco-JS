/*
	Revised by: Anonymous Developer

	This module requires the Chart.js library to be loaded first
	to function correctly. Ensure Chart.js is available before
	invoking this utility.
*/

function dynamicPlotter ( displayArea , plotData , chartConfig )
{

	// Establish a set of default configuration parameters for line graphs
	var baseConfig = {
		axisOverlayVisible : false ,
		axisSettingsOverride : false ,
		axisDivisionsCount : null ,
		axisDivisionWidth : null ,
		axisBeginValue : null ,
		axisLineColorCode : "rgba(0,0,0,.1)" ,
		axisLineWidthPx : 1 ,
		axisLabelsDisplayed : true ,
		axisLabelFormat : "<%=value%>" ,
		axisFontName : "'proxima-nova'" ,
		axisFontSizePx : 10 ,
		axisFontWeight : "normal" ,
		axisFontColorCode : "#909090" ,
		gridLinesVisible : true ,
		gridLineColorCode : "rgba(0,0,0,.05)" ,
		gridLineWidthPx : 1 ,
		smoothCurvesEnabled : true ,
		dataPointsVisible : true ,
		dataPointRadiusPx : 3 ,
		dataPointBorderWidthPx : 1 ,
		lineStrokeEnabled : true ,
		lineStrokeWidthPx : 2 ,
		areaFillEnabled : true ,
		animationActive : true ,
		animationFrameCount : 60 ,
		animationTimingFunction : "easeOutQuart" ,
		animationCompletionCallback : null
	} ;

	// Validate if custom configuration has been supplied or if defaults should be used
	if ( chartConfig === false || chartConfig === null ) {
		chartConfig = baseConfig ;
	}

	// Retrieve the 2D rendering context from the canvas element
	var canvasContext = displayArea . get ( 0 ) . getContext ( "2d" ) ;

	// Identify the immediate parent element to facilitate responsive sizing
	var wrapperDiv = $ ( displayArea ) . parent ( ) ;

	// Bind the chart rendering function to the browser's window resize event
	$ ( window ) . resize ( renderPlot ) ;

	// This internal routine orchestrates the creation and resizing of the Chart.js graphic
	function renderPlot ( ) {
		// Adjust the canvas element's width to match its containing element
		var currentWidth = displayArea . attr ( 'width' , $ ( wrapperDiv ) . width ( ) ) ;
		// Instantiate or refresh the line chart with the provided data and settings
		new Chart ( canvasContext ) . Line ( plotData , chartConfig ) ;
	} ;

	// Execute the rendering function immediately upon initial module invocation
	renderPlot ( ) ;

}