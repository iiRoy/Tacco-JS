/*
 * This file contains the Sand-Signika theme configuration for Highcharts JS.
 * It has been generated as a Type I code clone.
 * Original author: Torstein Honsi.
 */


// Begin loading necessary external resources.
// Loading the required fonts from Google Fonts for the theme.
Highcharts.createElement ( 'link' ,

	{
		href : 'https://fonts.googleapis.com/css?family=Signika:400,700' , // URL for the Signika font family.
		rel : 'stylesheet' ,                                                 // Specifies the relationship to the current document.
		type : 'text/css'                                                   // Defines the type of content.
	}

	, null , document.getElementsByTagName ( 'head' ) [ 0 ]
);


// Modifying the chart container's appearance.
// Adding a custom background image to the Highcharts container element.
Highcharts.wrap ( Highcharts.Chart.prototype , 'getContainer' , function

( proceed )
{
	proceed.call ( this ); // Call the original getContainer method.

	// Set the background style for the container element.
	this.container.style.background = 'url(http://www.highcharts.com/samples/graphics/sand.png)';
} );


// Definition of the Highcharts theme object.
Highcharts.theme = {

	// Array of colors to be used in series.
	colors : [ "#f45b5b" , "#8085e9" , "#8d4654" , "#7798BF" , "#aaeeee" ,
	"#ff0066" , "#eeaaee" , "#55BF3B" , "#DF5353" , "#7798BF" , "#aaeeee" ] ,

	// Chart-specific options.
	chart : {
		backgroundColor : null , // No default background color, allowing image to show.
		style : {
			fontFamily : "Signika, serif" // Apply the Signika font.
		}
	} ,

	// Title text options.
	title : {
		style : {
			color : 'black' ,    // Color of the chart title.
			fontSize : '16px' ,  // Font size for the title.
			fontWeight : 'bold' // Font weight for the title.
		}
	} ,

	// Subtitle text options.
	subtitle : {
		style : {
			color : 'black' // Color of the chart subtitle.
		}
	} ,

	// Tooltip options.
	tooltip : {
		borderWidth : 0 // No border for tooltips.
	} ,

	// Legend options.
	legend : {
		itemStyle : {
			fontWeight : 'bold' , // Bold font for legend items.
			fontSize : '13px'     // Font size for legend items.
		}
	} ,

	// X-axis options.
	xAxis : {
		labels : {
			style : {
				color : '#6e6e70' // Color for X-axis labels.
			}
		}
	} ,

	// Y-axis options.
	yAxis : {
		labels : {
			style : {
				color : '#6e6e70' // Color for Y-axis labels.
			}
		}
	} ,

	// Plot options for various series types.
	plotOptions : {
		series : {
			shadow : true // Enable shadow for series.
		} ,
		candlestick : {
			lineColor : '#404048' // Line color for candlestick series.
		} ,
		map : {
			shadow : false // Disable shadow for map series.
		}
	} ,


	/*
	 * Highstock specific theme configurations.
	 * These options only apply when using Highstock.
	 */
	navigator : {
		xAxis : {
			gridLineColor : '#D0D0D8' // Grid line color for the navigator's X-axis.
		}
	} ,

	rangeSelector : {
		buttonTheme : {
			fill : 'white' ,
			stroke : '#C0C0C8' ,
			'stroke-width' : 1 ,
			states : {
				select : {
					fill : '#D0D0D8' // Fill color when a button is selected.
				}
			}
		}
	} ,

	scrollbar : {
		trackBorderColor : '#C0C0C8' // Border color for the scrollbar track.
	} ,

	// General theme options.
	background2 : '#E0E0E8' // Secondary background color.

};

// Applying the newly defined theme to Highcharts.
Highcharts.setOptions ( Highcharts.theme );