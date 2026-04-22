function LineChart ( data , options ) {
// This function initializes a D3.js line chart within a specified container.
// It sets up chart dimensions, scales, axes, and interactive elements.

    // Define the fixed width for the entire chart area.
    var WIDTH = 500,
    // Define the fixed height for the entire chart area.
        HEIGHT = 70;

    // Chart margins, used to define the drawable area within the SVG.
    var margins = {
        top:    16, // Top margin in pixels.
        bottom: 15, // Bottom margin in pixels.
        left:   15, // Left margin in pixels.
        right:  15  // Right margin in pixels.
    };

    // Chart padding, currently set to zero, allowing content to reach margin edges.
    var padding = {
        top:    0, // Top padding.
        bottom: 0, // Bottom padding.
        left:   0, // Left padding.
        right:  0  // Right padding.
    };

    // Declaration of a variable to hold the time selector instance.
    // This will be initialized later in the function.
    var timeSelector;

    // Filter the input data based on date extents provided in the options.
    // If 'options.extents.date' is defined, only data points within the
    // specified date range will be included in the chart.
    if ( options.extents.date ) {
        data = data.filter ( function ( d ) {
            return d.date >= options.extents.date[0] && d.date <= options.extents.date[1] ;
        } ) ;
    }


    // Select the target container element using D3.js and append an SVG element.
    // The SVG element will serve as the canvas for the entire line chart.
    var svg = d3.select ( options.container )
        // The following line is commented out; it would dynamically adjust the width
        // based on the window's inner width if uncommented.
        //.style("width",Math.round(window.innerWidth*(window.innerWidth<=960?1:0.8))+"px")
        .append ( "svg" ) // Append the SVG element to the selected container.
            .attr ( "width" , WIDTH ) // Set the 'width' attribute of the SVG.
            .attr ( "height" , HEIGHT ) ; // Set the 'height' attribute of the SVG.

    // Define a reusable pattern for diagonal hatching within the SVG's <defs> section.
    // This pattern can be applied as a fill style to chart elements.
    var defs = svg.append ( "defs" ) // Append a <defs> element for definitions.
            .append ( "pattern" ) // Append a <pattern> element inside <defs>.
                .attr ( {
                    id:               "diagonalHatch", // Unique identifier for the pattern.
                    width:            3,             // Width of the pattern tile.
                    height:           3,             // Height of the pattern tile.
                    patternTransform: "rotate(-45 0 0)", // Rotate the pattern by -45 degrees.
                    patternUnits:     "userSpaceOnUse" // Units for pattern attributes.
                } ) ;
    // Append a rectangle to the pattern, forming the background of the hatch.
    defs.append ( "rect" )
                    .attr ( {
                        x:      0, // X-coordinate of the rectangle.
                        y:      0, // Y-coordinate of the rectangle.
                        width:  4, // Width of the rectangle.
                        height: 4  // Height of the rectangle.
                    } )
                    .style ( {
                        stroke: "none", // No stroke for the rectangle.
                        fill:   "#fff"  // Fill the rectangle with white.
                    } ) ;
    // Append a line to the pattern, creating the diagonal stroke.
    defs
        .append ( "line" )
        .attr ( {
            x0: 0, // Starting X-coordinate of the line.
            y1: 0, // Starting Y-coordinate of the line.
            x2: 0, // Ending X-coordinate of the line.
            y2: 4  // Ending Y-coordinate of the line.
        } )
        .style ( {
            stroke:        "#A06535", // Stroke color for the line.
            "stroke-width": 1         // Stroke width for the line.
        } ) ;

    // Create a group element for the chart's axes.
    // This group is transformed to position the axes correctly within the SVG.
    var axes = svg.append ( "g" )
                .attr ( "id" , "axes" ) // Assign an ID for styling or selection.
                .attr ( "transform" , "translate(" + margins.left + "," + ( HEIGHT - margins.bottom ) + ")" ) ;

    // Create a group element for the main line chart components (line, area, circles).
    // This group is also transformed to account for the top and left margins.
    var linechart = svg.append ( "g" )
            .attr ( "class" , "linechart" ) // Assign a class for styling.
            .attr ( "transform" , "translate(" + margins.left + "," + margins.top + ")" ) ;


    // Calculate the data extents (min/max) for both date and value properties.
    // These extents are essential for configuring the chart's scales.
    var extents = {
        date: d3.extent ( data , function ( d ) {
            return d.date; // Extract the date property.
        } ) ,
        y:    d3.extent ( data , function ( d ) {
            return d.value; // Extract the value property.
        } )
    } ;

    // Initialize the X-axis scale as a time scale.
    // It maps date values to horizontal pixel positions.
    var xscale = d3.time.scale ( )
                    .domain ( extents.date ) // Set the input domain based on data dates.
                    .range ( [ 0 , WIDTH - ( margins.left + margins.right + padding.left + padding.right ) ] ) ; // Set the output range.

    // Initialize the Y-axis scale as a linear scale.
    // It maps data values to vertical pixel positions (inverted for SVG).
    var yscale = d3.scale.linear ( )
                    .domain ( [ 0 , extents.y[1] ] ) // Set the input domain from 0 to max value.
                    .range ( [ HEIGHT - ( margins.bottom + margins.top ) , 0 ] ) // Set the output range (inverted).
                    .nice ( ) ; // Adjust domain to "nice" round numbers.

    // Define the D3 line generator.
    // This function will create the 'd' attribute for the SVG path element representing the line.
    var line = d3.svg.line ( )
                    .x ( function ( d ) {
                        return xscale ( d.date ) ; // Map date to X-coordinate.
                    } )
                    .y ( function ( d ) {
                        return yscale ( d.value ) ; // Map value to Y-coordinate.
                    } ) ;
    // Define the D3 area generator.
    // This function will create the 'd' attribute for the SVG path element representing the area under the line.
    var area = d3.svg.area ( )
                    .x ( function ( d ) {
                        return xscale ( d.date ) ; // Map date to X-coordinate.
                    } )
                    .y0 ( HEIGHT - ( margins.bottom + margins.top ) ) // Set the y-baseline for the area.
                    .y1 ( function ( d ) {
                        return yscale ( d.value ) ; // Map value to Y1-coordinate.
                    } ) ;

    // Append the area path to the linechart group.
    linechart
            .append ( "path" ) // Add an SVG path element.
            .attr ( "class" , "area" ) // Assign a class for styling.
            .attr ( "d" , area ( data ) ) // Use the area generator to create the path data.
            .style ( {
                fill: "url(#diagonalHatch)" // Fill the area with the defined pattern.
            } ) ;

    // Append the line path to the linechart group.
    linechart
            .append ( "path" ) // Add another SVG path element.
            .attr ( "class" , "line" ) // Assign a class for styling.
            .attr ( "d" , line ( data ) ) ; // Use the line generator to create the path data.


    // Create interactive circles for each data point on the line chart.
    // These circles will respond to user interactions like mouseover and click.
    var circles = linechart.selectAll ( "g.circle" ) // Select all 'g' elements with class 'circle' (initially none).
                .data ( data ) // Bind the chart data to this selection.
                .enter ( ) // For each new data point, create new elements.
                .append ( "g" ) // Append a new group element for each data point.
                    .attr ( "class" , "circle" ) // Assign 'circle' class to the group.
                    .classed ( "selected" , function ( d , i ) {
                        // Mark the last data point as 'selected' by default.
                        return d.date == extents.date[1] ;
                    } )
                    .attr ( "transform" , function ( d ) {
                        // Translate each circle group to its corresponding (x, y) position on the chart.
                        var x = xscale ( d.date ) , // Calculate x-coordinate using xscale.
                            y = yscale ( d.value ) ; // Calculate y-coordinate using yscale.
                        return "translate(" + x + "," + y + ")" ; // Return the transform string.
                    } )
                    .on ( "mouseover" , function ( d ) {
                        // On mouseover, highlight the corresponding x-axis tick.
                        d3.select ( ".x.axis" ) // Select the x-axis group.
                            .selectAll ( ".tick" ) // Select all tick elements within the x-axis.
                                .classed ( "highlight" , function ( t ) {
                                    // Add 'highlight' class if the tick's date matches the hovered data point's date.
                                    return d.date.getTime ( ) == t.getTime ( ) ;
                                } ) ;
                    } )
                    .on ( "mouseout" , function ( d ) {
                        // On mouseout, remove the highlight from all x-axis ticks.
                        d3.select ( ".x.axis" ) // Select the x-axis group.
                            .selectAll ( ".tick" ) // Select all tick elements.
                                .classed ( "highlight" , false ) ; // Remove the 'highlight' class.
                    } ) ;


    // Calculate the width for the interactive rectangle associated with each circle.
    // This provides a larger hit area for mouse events than the circle itself.
    var w = ( xscale.range ( )[1] ) / ( circles.data ( ).length - 1 ) ;

    // Append an interactive rectangle ("ix") to each circle group.
    circles.append ( "rect" )
                .attr ( "class" , "ix" ) // Assign 'ix' class for styling.
                .attr ( "x" , -w / 2 ) // Position x-coordinate relative to the circle's center.
                .attr ( "y" , function ( d ) {
                    return -yscale ( d.value ) ; // Position y-coordinate relative to the circle's center.
                } )
                .attr ( "width" , w ) // Set the width of the interactive rectangle.
                .attr ( "height" , yscale.range ( )[0] + margins.bottom ) ; // Set the height to extend to the bottom.


    // Append the actual circle shape to each data point's group.
    circles.append ( "circle" )
                    .attr ( "cx" , 0 ) // Center X-coordinate of the circle.
                    .attr ( "cy" , 0 ) // Center Y-coordinate of the circle.
                    .attr ( "r" , 4 ) ; // Radius of the circle.

    // Append a text label group to each circle group for displaying information.
    var text = circles.append ( "text" )
                .attr ( "class" , "label" ) // Assign 'label' class for styling.
                .attr ( "x" , 5 ) // X-offset for the text label.
                .attr ( "y" , 14 ) // Y-offset for the text label.
                .style ( "text-anchor" , function ( d , i ) {
                    // Dynamically set the text anchor based on the data point's position.
                    var position = "middle" ;
                    if ( i == 0 )
                        position = "start" ; // Start anchor for the first point.
                    if ( i == circles.data ( ).length - 1 )
                        position = "end" ; // End anchor for the last point.
                    return position ;
                } ) ;

    // Append a "click to select" tspan (sub-text) to the label.
    text.append ( "tspan" )
            .attr ( "class" , "click" ) // Assign 'click' class.
            .style ( "text-anchor" , function ( d , i ) {
                // Dynamically set text anchor for this tspan.
                var position = "start" ;
                if ( i == circles.data ( ).length - 1 )
                    position = "end" ;
                return position ;
            } )
            .text ( function ( d ) {
                return "click to select" ; // Text content for the tspan.
            } ) ;

    // Append another tspan to display the formatted data value.
    text.append ( "tspan" )
            .attr ( "x" , 5 ) // X-offset for this tspan.
            .attr ( "y" , -8 ) // Y-offset for this tspan (above the main label).
            .text ( function ( d ) {
                return d3.format ( ",.2s" ) ( d.value ) ; // Format the value (e.g., "10k", "1.2M").
            } ) ;

    // Append a vertical dropline from each circle down to the x-axis.
    circles.append ( "line" )
                .attr ( "class" , "dropline" ) // Assign 'dropline' class for styling.
                .attr ( "x1" , 0 ) // Starting X-coordinate of the line.
                .attr ( "x2" , 0 ) // Ending X-coordinate of the line.
                .attr ( "y1" , 0 ) // Starting Y-coordinate of the line.
                .attr ( "y2" , function ( d ) {
                    // Ending Y-coordinate, calculated to reach the x-axis.
                    return yscale.range ( )[0] - yscale ( d.value ) ;
                } ) ;


    // Initialize the D3 X-axis generator.
    var xAxis = d3.svg.axis ( )
                    .scale ( xscale ) // Set the scale for the x-axis.
                    .tickSize ( 3 ) ; // Set the length of the tick marks.

    // Initialize the D3 Y-axis generator.
    var yAxis = d3.svg.axis ( )
                    .scale ( yscale ) // Set the scale for the y-axis.
                    .orient ( "left" ) // Orient the axis to the left side.
                    .tickValues ( yscale.ticks ( 3 ).filter ( function ( d ) {
                        return d > 0 ;
                    } ) ) ; // Set custom tick values, showing 3 positive ticks.

    // Define a custom format function for X-axis tick labels.
    var xtickFormat = function ( value ) {
        // Calculate the quarter number (1-4) based on the month.
        var q = Math.ceil ( +d3.time.format ( "%m" ) ( value ) / 3 ) ;
        return d3.time.format ( "Q" + q + "/%y" ) ( value ) ; // Format as "Q#/YY".
    } ;
    // Define a custom format function for Y-axis tick labels.
    var ytickFormat = function ( d , i ) {
        var title = "" ; // Initialize an empty title string.
        if ( i == yAxis.tickValues ( ).length - 1 ) {
            title = " ACTIVE REPOSITORIES" ; // Add a title to the last y-axis tick.
        }
        return d3.format ( "s" ) ( d ) + title ; // Format the value and append the title.
    } ;

    // Apply the custom format functions to the X and Y axes.
    xAxis.tickFormat ( xtickFormat ) ; // Set the X-axis tick formatter.
    yAxis.tickFormat ( ytickFormat ) ; // Set the Y-axis tick formatter.

    // Append the X-axis to the axes group.
    axes.append ( "g" )
      .attr ( "class" , "x axis" ) // Assign 'x axis' class.
      .attr ( "transform" , "translate(" + padding.left + ",0)" ) // Translate the x-axis.
      .call ( xAxis ) ; // Call the x-axis generator to render it.


    // Append the Y-axis to the axes group.
    axes.append ( "g" )
      .attr ( "class" , "y axis" ) // Assign 'y axis' class.
      .attr ( "transform" , "translate(0," + ( -( HEIGHT - ( margins.bottom + margins.top ) ) ) + ")" ) // Translate the y-axis.
      .call ( yAxis ) // Call the y-axis generator to render it.
      	.selectAll ( "text" ) // Select all text elements within the y-axis.
      		.attr ( "dx" , margins.left - 22 ) // Adjust X-position of y-axis labels.
      		.attr ( "dy" , -3 ) ; // Adjust Y-position of y-axis labels.

    // Append horizontal grid lines (y-grid) to the axes group.
    axes.selectAll ( "line.ygrid" ) // Select all 'line' elements with class 'ygrid' (initially none).
			.data ( yscale.ticks ( 3 ).filter ( function ( d ) {
                return d > 0 ;
            } ) ) // Bind filtered y-axis tick values as data.
    		.enter ( ) // For each new data point.
    		.append ( "line" ) // Append a new line element.
    			.attr ( "class" , "ygrid" ) // Assign 'ygrid' class.
    			.attr ( "x1" , 0 ) // Starting X-coordinate of the grid line.
    			.attr ( "x2" , WIDTH - ( margins.left + margins.right ) ) // Ending X-coordinate (across the chart).
    			.attr ( "y1" , function ( d ) {
    				// Starting Y-coordinate, calculated from y-scale and chart dimensions.
    				return  - ( ( HEIGHT - ( margins.top + margins.bottom ) ) - yscale ( d ) ) ;
    			} )
    			.attr ( "y2" , function ( d ) {
    				// Ending Y-coordinate (same as y1 for horizontal line).
    				return  - ( ( HEIGHT - ( margins.top + margins.bottom ) ) - yscale ( d ) ) ;
    			} ) ;

    // TimeSelector function: Creates an interactive component for navigating through time periods.
    function TimeSelector ( ) {
    	var container = d3.select ( options.selector ) , // Select the container for the time selector UI.
    		current   = xscale.ticks ( ).length - 1 , // Initialize 'current' to the index of the last tick date.
    		dates     = xscale.ticks ( ) , // Get all tick dates from the x-scale.
    		to        = null ; // Variable to hold a timeout ID for debouncing.

    	// Append a "Previous Quarter" arrow button.
    	container.append ( "a" )
    			.attr ( "class" , "arrow" ) // Assign 'arrow' class.
    			.attr ( "title" , "Previous Quarter" ) // Tooltip text.
    			.attr ( "href" , "#" ) // Prevent default navigation.
    			.html ( "&lt;" ) // HTML content for the left arrow symbol.
    			.on ( "click" , function ( d ) {
    				d3.event.preventDefault ( ) ; // Prevent default link behavior.
    				if ( current > 0 ) { // If not at the first date.
    					current-- ; // Decrement current index.
	    				selectDate ( dates[current] ) ; // Select the previous date.
	    			}
    			} ) ;

    	// Append an unordered list (ul) to display selectable dates.
    	container.append ( "ul" )
    			.selectAll ( "li" ) // Select all list items (initially none).
    			.data ( dates ) // Bind the array of dates.
    			.enter ( ) // For each new date, create a new list item.
    				.append ( "li" ) // Append a new list item.
    				.classed ( "selected" , function ( d , i ) {
						return d.getTime ( ) == dates[current].getTime ( ) ; // Mark the current date as selected.
					} )
    				.text ( function ( d ) {
    					return xtickFormat ( d ) ; // Display formatted date as list item text.
    				} ) ;
    	// Append a "Next Quarter" arrow button.
    	container.append ( "a" )
    			.attr ( "class" , "arrow" ) // Assign 'arrow' class.
    			.attr ( "title" , "Next Quarter" ) // Tooltip text.
    			.attr ( "href" , "#" ) // Prevent default navigation.
    			.html ( "&gt;" ) // HTML content for the right arrow symbol.
    			.on ( "click" , function ( d ) {
    				d3.event.preventDefault ( ) ; // Prevent default link behavior.
    				if ( current < dates.length - 1 ) { // If not at the last date.
    					current++ ; // Increment current index.
	    				selectDate ( dates[current] ) ; // Select the next date.
	    			}
    			} ) ;

    	// Public method to programmatically select a date from outside the TimeSelector.
    	this.select = function ( date ) {
    		selectDate ( date , true ) ; // Call the internal selectDate function, suppressing the callback.
    	} ;
    	// Internal function to handle the logic for selecting a date.
    	function selectDate ( date , no_callback ) {
    		if ( to ) {
    			clearTimeout ( to ) ; // Clear any existing timeout to debounce calls.
    		}
    		// Set a timeout to delay the selection update, preventing rapid updates.
    		to = setTimeout ( function ( ) {

    			current = dates.map ( function ( d ) {
                    return d.getTime ( ) ;
                } ).indexOf ( date.getTime ( ) ) ; // Find the index of the newly selected date.

    			container
    				.selectAll ( "li" ) // Select all list items.
    				.classed ( "selected" , function ( d , i ) {
						return d.getTime ( ) == date.getTime ( ) ; // Update 'selected' class based on the new date.
					} ) ;
    			if ( !no_callback ) { // If the callback is not suppressed.
    				selectTick ( date ) ; // Update the chart's visual selection.
					options.callback ( { date: date } ) ; // Invoke the user-defined callback with the selected date.
    			}

    		} , 200 ) ; // 200ms debounce delay.
    	}
    }

    // Initialize the TimeSelector instance.
    timeSelector = new TimeSelector ( ) ;

    // Attach a click event listener to each circle group in the line chart.
    linechart.selectAll ( "g.circle" )
		.on ( "click" , function ( d ) {
			selectTick ( d.date ) ; // Update chart visuals based on the clicked data point's date.
			options.callback ( d ) ; // Invoke the user-defined callback with the full data point.
		} ) ;

    // Function to visually select a specific tick (data point) on the chart.
	function selectTick ( time ) {

		// Update the 'selected' class for all circle groups.
		linechart
			.selectAll ( "g.circle" )
			.classed ( "selected" , function ( t ) {
				// Mark the circle as selected if its date matches the provided time.
				return time.getTime ( ) == t.date.getTime ( ) ;
			} ) ;

		// Update the 'selected' class for all x-axis ticks.
		svg.select ( ".x.axis" )
			.selectAll ( ".tick" )
				.classed ( "selected" , function ( t ) {
					// Mark the tick as selected if its date matches the provided time.
					return time.getTime ( ) == t.getTime ( ) ;
				} ) ;

		// Inform the time selector to update its UI based on the selected time.
		timeSelector.select ( time ) ;
	}
	// Initially select the last tick on the x-axis when the chart is first loaded.
	selectTick ( xscale.ticks ( )[ xscale.ticks ( ).length - 1 ] ) ;
}