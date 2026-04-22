( function ()
	{
		// This block encapsulates the entire chart definition to prevent global scope pollution.
		"use strict";

		// Declare core variables needed throughout the module.
		var root = this; // 'this' refers to the global object (window in browsers, global in Node.js)
		var Chart = root.Chart; // Access the Chart object, assumed to be globally available.

		// Acquire the helper utilities from the Chart library.
		var helpers = Chart.helpers;


		// Define the default configuration options for the Bar chart type.
		var defaultConfig = {

			// Boolean - Determines if the scale should always begin at zero.
			// If false, the scale might start slightly below the lowest data value.
			scaleBeginAtZero : true ,

			// Boolean - Controls the visibility of grid lines across the chart area.
			scaleShowGridLines : true ,

			// String - Specifies the color of the grid lines.
			// Using RGBA for transparency.
			scaleGridLineColor : "rgba(0,0,0,.05)" ,

			// Number - Sets the width, in pixels, for the grid lines.
			scaleGridLineWidth : 1 ,

			// Boolean - Indicates whether horizontal grid lines (excluding the X-axis line) should be displayed.
			scaleShowHorizontalLines : true ,

			// Boolean - Indicates whether vertical grid lines (excluding the Y-axis line) should be displayed.
			scaleShowVerticalLines : true ,

			// Boolean - If true, each bar will have a visible stroke (border).
			barShowStroke : true ,

			// Number - The pixel width of the stroke around each bar.
			barStrokeWidth : 2 ,

			// Number - The spacing, in pixels, between different sets of X-axis values.
			barValueSpacing : 5 ,

			// Number - The spacing, in pixels, between individual data series within an X-axis value set.
			barDatasetSpacing : 1 ,

			// String - A template for generating the chart legend using EJS-like syntax.
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		};


		// Extend the base Chart.Type to create a new Bar chart type.
		Chart.Type.extend ( {

			// The internal name for this chart type.
			name : "Bar" ,

			// Assign the default configuration object.
			defaults : defaultConfig ,

			// The initialization function for a new Bar chart instance.
			initialize : function ( data ) {

				// Store options as a local variable for easier access within nested scopes,
				// particularly for the ScaleClass definition.
				var options = this.options;

				// Define the custom Scale class for Bar charts.
				this.ScaleClass = Chart.Scale.extend ( {
					// Bars are offset from the grid lines.
					offsetGridLines : true ,


					/**
					 * Calculates the X-position for a specific bar.
					 * @param {number} datasetCount - Total number of datasets.
					 * @param {number} datasetIndex - Index of the current dataset.
					 * @param {number} barIndex - Index of the bar within its dataset.
					 * @returns {number} The calculated X-coordinate for the bar's center.
					 */
					calculateBarX : function ( datasetCount , datasetIndex , barIndex ) {
						// This is a reusable method to determine the xPosition of a bar.
						var xWidth = this.calculateBaseWidth ( ) ;
						var xAbsolute = this.calculateX ( barIndex ) - ( xWidth / 2 ) ;
						var barWidth = this.calculateBarWidth ( datasetCount ) ;

						// Calculate the final X position, accounting for dataset spacing and bar center.
						return xAbsolute + ( barWidth * datasetIndex ) + ( datasetIndex * options.barDatasetSpacing ) + barWidth / 2 ;
					} ,


					/**
					 * Calculates the total width available for all bars at a given X-axis point.
					 * @returns {number} The base width.
					 */
					calculateBaseWidth : function ( ) {
						// The width between two X-axis labels, minus the value spacing on both sides.
						return ( this.calculateX ( 1 ) - this.calculateX ( 0 ) ) - ( 2 * options.barValueSpacing ) ;
					} ,


					/**
					 * Calculates the individual width of a single bar.
					 * @param {number} datasetCount - Total number of datasets.
					 * @returns {number} The calculated bar width.
					 */
					calculateBarWidth : function ( datasetCount ) {
						// Padding between datasets is applied to the right of each bar.
						// This accounts for all but the last dataset.
						var baseWidth = this.calculateBaseWidth ( ) - ( ( datasetCount - 1 ) * options.barDatasetSpacing ) ;

						return ( baseWidth / datasetCount ) ;
					}
				} ) ;

				// Initialize an empty array to hold dataset objects.
				this.datasets = [ ] ;

				// Set up tooltip event handling if tooltips are enabled in options.
				if ( this.options.showTooltips ) {
					helpers.bindEvents ( this , this.options.tooltipEvents , function ( evt ) {
						// Determine active bars based on event type.
						var activeBars = ( evt.type !== 'mouseout' ) ? this.getBarsAtEvent ( evt ) : [ ] ;

						// Restore previous fill and stroke colors for all bars.
						this.eachBars ( function ( bar ) {
							bar.restore ( [ 'fillColor' , 'strokeColor' ] ) ;
						} ) ;

						// Apply highlight colors to currently active bars.
						helpers.each ( activeBars , function ( activeBar ) {
							activeBar.fillColor = activeBar.highlightFill ;
							activeBar.strokeColor = activeBar.highlightStroke ;
						} ) ;

						// Display the tooltip for the active bars.
						this.showTooltip ( activeBars ) ;
					} ) ;
				}


				// Define the BarClass by extending Chart.Rectangle.
				// This class represents individual bars on the chart.
				this.BarClass = Chart.Rectangle.extend ( {
					strokeWidth : this.options.barStrokeWidth , // Bar border width
					showStroke : this.options.barShowStroke , // Whether to show the border
					ctx : this.chart.ctx // The drawing context
				} ) ;


				// Iterate through each dataset provided in the chart data.
				helpers.each ( data.datasets , function ( dataset , datasetIndex ) {

					// Create an object to store properties for the current dataset.
					var datasetObject = {
						label : dataset.label || null ,
						fillColor : dataset.fillColor ,
						strokeColor : dataset.strokeColor ,
						bars : [ ] // Array to hold individual BarClass instances
					} ;

					// Add the newly created dataset object to the chart's datasets array.
					this.datasets.push ( datasetObject ) ;

					// Iterate through the data points within the current dataset.
					helpers.each ( dataset.data , function ( dataPoint , index ) {
						// For each data point, create a new BarClass instance.
						datasetObject.bars.push ( new this.BarClass ( {
							value : dataPoint ,
							label : data.labels [ index ] ,
							datasetLabel : dataset.label ,
							strokeColor : dataset.strokeColor ,
							fillColor : dataset.fillColor ,
							highlightFill : dataset.highlightFill || dataset.fillColor , // Fallback to fillColor if highlight not provided
							highlightStroke : dataset.highlightStroke || dataset.strokeColor // Fallback to strokeColor
						} ) ) ;
					} , this ) ; // Ensure 'this' context is maintained for the inner loop.

				} , this ) ; // Ensure 'this' context is maintained for the outer loop.

				// Construct the chart's scale based on the provided labels.
				this.buildScale ( data.labels ) ;

				// Set the base Y-position for all bars (usually the bottom of the chart).
				this.BarClass.prototype.base = this.scale.endPoint ;

				// Initialize properties for each bar, such as width, x-position, and y-position.
				this.eachBars ( function ( bar , index , datasetIndex ) {
					helpers.extend ( bar , {
						width : this.scale.calculateBarWidth ( this.datasets.length ) ,
						x : this.scale.calculateBarX ( this.datasets.length , datasetIndex , index ) ,
						y : this.scale.endPoint
					} ) ;
					bar.save ( ) ; // Save the initial state of the bar.
				} , this ) ;

				// Render the chart initially.
				this.render ( ) ;
			} ,


			// The update method to re-render the chart after data or option changes.
			update : function ( ) {
				// Update the scale's configuration.
				this.scale.update ( ) ;

				// Before updating, reset any highlight colors from previously active elements.
				helpers.each ( this.activeElements , function ( activeElement ) {
					activeElement.restore ( [ 'fillColor' , 'strokeColor' ] ) ;
				} ) ;

				// Save the current state of each bar.
				this.eachBars ( function ( bar ) {
					bar.save ( ) ;
				} ) ;

				// Re-render the chart with the updated state.
				this.render ( ) ;
			} ,


			// Helper method to iterate over all bars in all datasets.
			// @param {function} callback - Function to execute for each bar.
			eachBars : function ( callback ) {
				helpers.each ( this.datasets , function ( dataset , datasetIndex ) {
					helpers.each ( dataset.bars , callback , this , datasetIndex ) ;
				} , this ) ;
			} ,


			// Retrieves bars at a specific event position (e.g., mouse click).
			// @param {Event} e - The event object.
			// @returns {Array<Chart.Rectangle>} An array of bars found at the event's coordinates.
			getBarsAtEvent : function ( e ) {
				var barsArray = [ ] ;
				var eventPosition = helpers.getRelativePosition ( e ) ;

				// Helper function to push a bar from a dataset into the array.
				var datasetIterator = function ( dataset ) {
					barsArray.push ( dataset.bars [ barIndex ] ) ;
				} ;
				var barIndex ; // Declared outside the loop for scope.

				// Iterate through all datasets and their bars to find a match.
				for ( var datasetIndex = 0 ; datasetIndex < this.datasets.length ; datasetIndex ++ ) {
					for ( barIndex = 0 ; barIndex < this.datasets [ datasetIndex ].bars.length ; barIndex ++ ) {
						// Check if the current bar is within the event's coordinates.
						if ( this.datasets [ datasetIndex ].bars [ barIndex ].inRange ( eventPosition.x , eventPosition.y ) ) {
							// If a bar is found, add all bars at that barIndex across all datasets.
							helpers.each ( this.datasets , datasetIterator ) ;
							return barsArray ; // Return immediately after finding the first matching group.
						}
					}
				}

				return barsArray ; // Return an empty array if no bars are found.
			} ,


			// Constructs and initializes the chart's scale.
			// @param {Array<string>} labels - Labels for the X-axis.
			buildScale : function ( labels ) {
				var self = this ; // Capture 'this' for use in nested functions.

				// Function to collect all bar values for scale calculation.
				var dataTotal = function ( ) {
					var values = [ ] ;
					self.eachBars ( function ( bar ) {
						values.push ( bar.value ) ;
					} ) ;
					return values ;
				} ;

				// Define the options for the scale.
				var scaleOptions = {
					templateString : this.options.scaleLabel ,
					height : this.chart.height ,
					width : this.chart.width ,
					ctx : this.chart.ctx ,
					textColor : this.options.scaleFontColor ,
					fontSize : this.options.scaleFontSize ,
					fontStyle : this.options.scaleFontStyle ,
					fontFamily : this.options.scaleFontFamily ,
					valuesCount : labels.length ,
					beginAtZero : this.options.scaleBeginAtZero ,
					integersOnly : this.options.scaleIntegersOnly ,
					calculateYRange : function ( currentHeight ) {
						var updatedRanges = helpers.calculateScaleRange (
							dataTotal ( ) ,
							currentHeight ,
							this.fontSize ,
							this.beginAtZero ,
							this.integersOnly
						) ;
						helpers.extend ( this , updatedRanges ) ;
					} ,
					xLabels : labels ,
					font : helpers.fontString ( this.options.scaleFontSize , this.options.scaleFontStyle , this.options.scaleFontFamily ) ,
					lineWidth : this.options.scaleLineWidth ,
					lineColor : this.options.scaleLineColor ,
					showHorizontalLines : this.options.scaleShowHorizontalLines ,
					showVerticalLines : this.options.scaleShowVerticalLines ,
					gridLineWidth : ( this.options.scaleShowGridLines ) ? this.options.scaleGridLineWidth : 0 ,
					gridLineColor : ( this.options.scaleShowGridLines ) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)" ,
					padding : ( this.options.showScale ) ? 0 : ( this.options.barShowStroke ) ? this.options.barStrokeWidth : 0 ,
					showLabels : this.options.scaleShowLabels ,
					display : this.options.showScale
				} ;

				// If scale override options are provided, extend the scale options.
				if ( this.options.scaleOverride ) {
					helpers.extend ( scaleOptions , {
						calculateYRange : helpers.noop , // Disable auto-calculation
						steps : this.options.scaleSteps ,
						stepValue : this.options.scaleStepWidth ,
						min : this.options.scaleStartValue ,
						max : this.options.scaleStartValue + ( this.options.scaleSteps * this.options.scaleStepWidth )
					} ) ;
				}

				// Create a new instance of the ScaleClass with the defined options.
				this.scale = new this.ScaleClass ( scaleOptions ) ;
			} ,


			// Adds new data points to the chart.
			// @param {Array<number>} valuesArray - Array of values, one for each dataset.
			// @param {string} label - The label for the new X-axis point.
			addData : function ( valuesArray , label ) {
				// Map the values array to each of the existing datasets.
				helpers.each ( valuesArray , function ( value , datasetIndex ) {
					// For each value, create a new BarClass instance and add it to the corresponding dataset.
					this.datasets [ datasetIndex ].bars.push ( new this.BarClass ( {
						value : value ,
						label : label ,
						x : this.scale.calculateBarX ( this.datasets.length , datasetIndex , this.scale.valuesCount + 1 ) ,
						y : this.scale.endPoint ,
						width : this.scale.calculateBarWidth ( this.datasets.length ) ,
						base : this.scale.endPoint ,
						strokeColor : this.datasets [ datasetIndex ].strokeColor ,
						fillColor : this.datasets [ datasetIndex ].fillColor
					} ) ) ;
				} , this ) ;

				// Add the new label to the scale's X-axis labels.
				this.scale.addXLabel ( label ) ;
				// Then, re-render the chart to display the new data.
				this.update ( ) ;
			} ,


			// Removes the first data point from each dataset.
			removeData : function ( ) {
				this.scale.removeXLabel ( ) ; // Remove the first X-axis label.
				// Then re-render the chart.
				helpers.each ( this.datasets , function ( dataset ) {
					dataset.bars.shift ( ) ; // Remove the first bar from each dataset.
				} , this ) ;
				this.update ( ) ; // Update the chart to reflect the changes.
			} ,


			// Adjusts chart elements in response to layout changes (e.g., window resize).
			reflow : function ( ) {
				// Extend the BarClass prototype with updated Y and base positions.
				helpers.extend ( this.BarClass.prototype , {
					y : this.scale.endPoint ,
					base : this.scale.endPoint
				} ) ;

				// Create an object with new height and width for the scale update.
				var newScaleProps = helpers.extend ( {
					height : this.chart.height ,
					width : this.chart.width
				} ) ;

				// Update the scale with the new dimensions.
				this.scale.update ( newScaleProps ) ;
			} ,


			// Draws the chart elements.
			// @param {number} [ease] - An easing value (0 to 1) for animations.
			draw : function ( ease ) {
				var easingDecimal = ease || 1 ; // Default to full draw if no easing specified.
				this.clear ( ) ; // Clear the chart canvas.

				var ctx = this.chart.ctx ; // Get the 2D rendering context.

				this.scale.draw ( easingDecimal ) ; // Draw the chart scale.

				// Draw all the bars for each dataset.
				helpers.each ( this.datasets , function ( dataset , datasetIndex ) {
					helpers.each ( dataset.bars , function ( bar , index ) {
						if ( bar.hasValue ( ) ) {
							bar.base = this.scale.endPoint ; // Ensure bar base is at the scale's end point.
							// Transition the bar's properties and then draw it.
							bar.transition ( {
								x : this.scale.calculateBarX ( this.datasets.length , datasetIndex , index ) ,
								y : this.scale.calculateY ( bar.value ) ,
								width : this.scale.calculateBarWidth ( this.datasets.length )
							} , easingDecimal ).draw ( ) ;
						}
					} , this ) ;

				} , this ) ;
			}
		} ) ; // End of Chart.Type.extend call.


	} ) .call ( this ) ; // Execute the IIFE, passing the global context.