window . Xhgui = window . Xhgui || {}; // Initialize Xhgui namespace if not already present

// This function maps metric short codes to human-readable names.
Xhgui.metricName = function ( metric ) {

    // Define a lookup table for metric names.
    var map = {
        pmu   : "Peak Memory Use",   // Peak memory usage
        mu    : "Memory Use",        // Current memory usage
        cpu   : "CPU time",          // CPU time spent
        wt    : "Wall time",         // Wall clock time
        epmu  : "Exclusive peak memory use", // Exclusive peak memory usage
        emu   : "Exclusive memory use",      // Exclusive memory usage
        ecpu  : "Exclusive CPU",             // Exclusive CPU time
        ewt   : "Exclusive wall time"        // Exclusive wall clock time
    };

    // If the metric is not found in the map, return "Unknown".
    if ( ! map[ metric ] ) {
        return "Unknown";
    }

    // Return the human-readable name.
    return map[ metric ];
};

/*
 *  Utility function to generate a D3 ordinal color scale.
 *  Provides a consistent set of colors for various graph elements.
 */
Xhgui.colors = function ( ) {

    // A predefined array of hex color codes.
    var colors = [
        '#59bdd2', // A shade of blue
        '#637964', // A shade of green
        '#d46245', // A shade of red
        '#ffe85e', // A shade of yellow
        '#e9814f', // A shade of orange
        '#e3b7b3', // A shade of pink
        '#b63c71'  // A shade of purple
    ];

    // Return a D3 ordinal scale configured with these colors.
    return d3.scale.ordinal().range( colors );
};

/*
 * Xhgui.formatDate: A D3 time format object.
 * It formats a Date object into a 'YY-MM-DD HH:MM:SS' string.
 *
 * @param { Date } date - The date object to be formatted.
 * @returns { String } - The formatted date string.
 */
Xhgui.formatDate = d3.time.format( '%y-%m-%d %H:%M:%S' );

// Xhgui.dateTimeFormat: Placeholder for dynamic date/time format.
// This variable is intended to hold a D3 time format string
// that can change based on the specific date/time being displayed,
// allowing for flexible formatting in charts.
Xhgui.dateTimeFormat;

/*
 * Formats a given number by adding thousand separators and
 * allowing for a specified number of decimal places.
 * All inputs are first cast to a Number type.
 *
 * @param { Mixed } num - The number or string that needs formatting.
 * @param { Number } decimalPlaces - The desired number of decimal places.
 *                                   Defaults to 2 if not provided.
 * @returns { String } - The formatted number as a string.
 */
Xhgui.formatNumber = function ( num, decimalPlaces ) {

    // Default to 2 decimal places if not explicitly set.
    if ( decimalPlaces === undefined ) {
        decimalPlaces = 2;
    }

    var sep = ','; // Thousand separator character.

    // Ensure 'number' is a numeric type and format to fixed decimal places.
    number = + num;
    var val = number.toFixed( decimalPlaces );

    // If the value is less than 1000, no thousand separators are needed.
    if ( val < 1000 ) {
        return val;
    }

    // Split the number into integer and decimal parts.
    var split = val.split( /\./ );
    var thousands = split[0]; // The integer part.
    // Determine the starting point for inserting separators.
    var i = thousands.length % 3 || 3;

    // Insert thousand separators into the integer part.
    thousands = thousands.slice( 0, i ) + thousands.slice( i ).replace( /(\d{3})/g, sep + '$1' );
    split[0] = thousands; // Reassemble the integer part.

    // Join the integer and decimal parts back together.
    return split.join( '.' );
};

/*
 * Xhgui.legend: Renders a legend item onto an SVG element.
 *
 * @param { Object } svg - The D3 SVG selection to append the legend to.
 * @param { String } text - The text label for the legend item.
 * @param { Number } height - The overall height of the chart area, used for positioning.
 * @param { Object } margin - An object containing chart margins (top, right, bottom, left).
 * @param { String } color - The color associated with this legend item.
 * @returns { void }
 */
Xhgui.legend = function ( svg, text, height, margin, color ) {

    // If no text is provided, there's nothing to render.
    if ( ! text ) {
        return;
    }

    // Calculate the Y-offset for the legend.
    // '-3' is a small adjustment for text descenders.
    var yOffset = height + margin.bottom - 3;

    // Calculate the X-offset dynamically based on previously added legend items.
    var legendGroups = svg.select( '.legend-group' );
    var xOffset = 0;

    // Check if there are existing legend groups.
    if ( legendGroups[0].length && legendGroups[0][0] ) {
        // Get the bounding box of the last legend group to determine next position.
        var box = legendGroups[ legendGroups.length - 1 ][0].getBBox( );
        // Add some margin between legend items.
        xOffset = box.x + box.width + 20;
    }

    // Create a new group for this legend item.
    var group = svg.append( 'g' )
        .attr( 'class', 'legend-group' );

    // Append the colored circle (dot) for the legend.
    group.append( 'circle' )
        .attr( 'fill', color )
        .attr( 'r', 3 )    // Radius of the circle
        .attr( 'cx', 0 )   // X-coordinate relative to group
        .attr( 'cy', -5 ); // Y-coordinate relative to group (slightly above text baseline)

    // Add the text label for the legend item.
    group.append( 'text' )
        .attr( 'x', 5 )   // X-coordinate relative to group (offset from circle)
        .attr( 'y', 0 )   // Y-coordinate relative to group (baseline)
        .text( text );    // The actual legend text

    // Position the entire legend group using a transform.
    group.attr( 'transform', 'translate(' + xOffset + ', ' + yOffset + ')' );
};

/*
 * Xhgui.tooltip: Binds a dynamic tooltip functionality to D3 selections.
 *
 * @param { D3 Selection } container - The D3 selection representing the chart's container.
 * @param { Object } options - Configuration options for the tooltip.
 *   - formatter { Function }: Function to generate HTML content for the tooltip.
 *   - positioner { Function }: Function to calculate the {x, y} position of the tooltip.
 *   - bindTo { D3 Selection }: The D3 selection of elements to which the tooltip should respond.
 * @throws { Exception } if formatter, positioner, or bindTo options are missing.
 */
Xhgui.tooltip = function ( container, options ) {

    // Validate required options.
    if (
           ! options.formatter
        || ! options.positioner
        || ! options.bindTo
    ) {
        throw new Exception( 'You need the formatter, positioner & bindTo options.' );
    }

    // Prevents event propagation, useful for stopping mouseout from bubbling up.
    function stop ( ) {
        d3.event.stopPropagation( );
    }

    /*
     * Helper function to create or retrieve the tooltip DOM elements.
     * It ensures there's only one tooltip popover in the document body.
     *
     * @param { D3 Selection } container - The D3 selection for the tooltip's parent (document.body).
     * @returns { Object } An object containing D3 selections for the tooltip frame and its content.
     */
    function createTooltip ( container ) {
        var exists = container.select( '#chart-popover' ),
            popover,
            content;

        if ( exists.empty( ) ) {
            // If the popover doesn't exist, create it.
            popover = container.append( 'div' );

            popover.attr( 'class', 'popover top' )
                .attr( 'id', 'chart-popover' )
                .append( 'div' )
                .attr( 'class', 'arrow' ); // The arrow element for the popover.

            content = popover.append( 'div' )
                .attr( 'class', 'popover-content' ); // The main content area.

            // Stop flickering tooltips by preventing mouseout from bubbling.
            container.on( 'mouseout', stop );
            popover.on( 'mouseout', stop );

            return { frame: popover, content: content };
        }
        // If the popover already exists, just select its parts.
        popover = exists;
        content = exists.select( '.popover-content' );

        return { frame: popover, content: content };
    }

    // Create or get the tooltip elements, attaching them to the document body.
    var tooltip = createTooltip( d3.select( document.body ) );

    /*
     * Hides the tooltip by setting its opacity to 0.
     * Also removes the document-wide mouseout listener.
     */
    function hide ( ) {
        tooltip.frame.transition( ).style( 'opacity', 0 );
        d3.select( document ).on( 'mouseout', false ); // Disable the mouseout listener.
    }

    // Bind the mouseover event to the specified elements.
    options.bindTo.on( 'mouseover', function ( d, i ) {
        var top, left,
            tooltipHeight, tooltipWidth,
            content, position;

        // Get the content for the tooltip using the formatter function.
        content = options.formatter.call( this, d, i );

        // Set the content and make the tooltip visible.
        tooltip.content.html( content );
        tooltip.frame.style( {
            display: 'block',
            opacity: 1
        } );

        // Get the desired position for the tooltip using the positioner function.
        position = options.positioner.call( this, d, i, tooltip );

        // Measure the tooltip's dimensions after content has been set.
        tooltipWidth = parseInt( tooltip.frame.style( 'width' ), 10 );
        tooltipHeight = parseInt( tooltip.frame.style( 'height' ), 10 );

        var containerNode = container.node( ); // Get the raw DOM node of the container.

        // Recalculate final top and left positions, adjusting for tooltip size and arrow.
        // '7' and '5' are magic numbers for arrow offsets.
        top = containerNode.offsetTop + position.y - ( tooltipHeight / 2 ) - 7;
        left = containerNode.offsetLeft + position.x - ( tooltipWidth / 2 ) + 5;

        // Apply the calculated position to the tooltip.
        tooltip.frame.style( {
            top: top + 'px',
            left: left + 'px'
        } );

        // Attach a document-wide mouseout listener to hide the tooltip when leaving the document.
        d3.select( document ).on( 'mouseout', hide );
    } );
};

/*
 * Xhgui.piechart: Generates a D3-based pie chart.
 *
 * @param { string } container - CSS selector for the DOM element where the chart will be rendered.
 * @param { Array<Object> } data - An array of objects, each with 'name' and 'value' keys.
 * @param { Object } options - Configuration options for the pie chart.
 *   - height { Number }: Height of the chart (defaults to 400).
 *   - width { Number }: Width of the chart (defaults to 400).
 *   - postfix { String }: Optional string to append to tooltip values.
 * @returns { void }
 */
Xhgui.piechart = function ( container, data, options ) {

    options = options || {}; // Ensure options object exists.
    var height = options.height || 400,
        width = options.width || 400,
        radius = Math.min( width, height ) / 2; // Calculate radius based on min dimension.

    // Define the arc generator for the pie slices.
    var arc = d3.svg.arc( )
        .outerRadius( radius - 10 ) // Outer radius, with a small margin.
        .innerRadius( 0 );          // Inner radius (0 for a solid pie chart).

    // Define the pie layout generator.
    var pie = d3.layout.pie( )
        .sort( null ) // No sorting, maintain original data order.
        .value( function ( d ) {
            return d.value; // Use the 'value' key from data objects.
        } );

    var color = Xhgui.colors( ); // Get the color scale from Xhgui utilities.

    container = d3.select( container ); // Select the container element using D3.

    // Create the main SVG element and append a group for the chart, translated to the center.
    var svg = container.append( 'svg' )
        .attr( 'width', width )
        .attr( 'height', height )
            .append( 'g' )
            .attr( 'transform', "translate(" + width / 2 + "," + height / 2 + ")" );

    // Bind data to the 'chart-arc' elements, creating new groups for each slice.
    var g = svg.selectAll( '.chart-arc' )
        .data( pie( data ) )
            .enter( ).append( 'g' )
        .attr( 'class', 'chart-arc' );

    // Append path elements for each pie slice and style them.
    g.append( 'path' )
        .attr( 'd', arc ) // Use the arc generator to define the path shape.
        .style( 'fill', function ( d ) {
            return color( d.data.value ); // Fill color based on the data value.
        } );

    // Attach tooltip functionality to the pie slices.
    Xhgui.tooltip( container, {
        bindTo: g, // Bind tooltip to each slice group.
        positioner: function ( d, i ) {
            var position, sliceX, sliceY;

            position = arc.centroid( d, i ); // Get the centroid of the arc for positioning.

            // Recalculate position relative to the overall chart container.
            sliceX = position[0] + ( height / 2 );
            sliceY = position[1] + ( width / 2 );
            return { x: sliceX, y: sliceY };
        },
        formatter: function ( d, i ) {
            // Format tooltip content: name, formatted value, and optional postfix.
            var label = '<strong>' + d.data.name +
                '</strong><br />' +
                Xhgui.formatNumber( d.data.value, 0 ) + options.postfix;
            return label;
        }
    } );
};

/*
 * Xhgui.columnchart: Generates a D3-based column chart.
 *
 * @param { string } container - CSS selector for the DOM element to render the chart in.
 * @param { Array<Object> } data - An array of objects, each with 'name' and 'value' keys.
 * @param { Object } options - Configuration options for the column chart.
 *   - height { Number }: Height of the chart (defaults to 400).
 *   - width { Number }: Width of the chart (defaults to 400).
 *   - postfix { String }: Optional string to append to tooltip values.
 * @returns { void }
 */
Xhgui.columnchart = function ( container, data, options ) {

    options = options || {}; // Ensure options object is initialized.
    var height = options.height || 400,
        width = options.width || 400,
        margin = { top: 20, right: 20, bottom: 30, left: 50 }; // Chart margins.

    // Define the Y-axis scale (linear).
    var y = d3.scale.linear( )
        .range( [ height, 0 ] ); // Maps data values to pixel range (inverted for SVG).

    // Define the X-axis scale (ordinal, for categories).
    var x = d3.scale.ordinal( )
        .rangeRoundBands( [ 0, width ], 0.1 ); // Maps categories to bands with padding.

    // Define the Y-axis renderer.
    var yAxis = d3.svg.axis( )
        .scale( y )
        .tickFormat( d3.format( '2s' ) ) // Format tick labels for large numbers (e.g., 1k, 1M).
        .tickSize( 6, 6, 0 ) // Inner tick size, outer tick size, end tick size.
        .orient( "left" ); // Position axis labels to the left.

    // Define the X-axis renderer.
    var xAxis = d3.svg.axis( )
        .scale( x )
        .tickSize( 6, 6, 0 ) // Tick sizes.
        .orient( "bottom" ); // Position axis labels at the bottom.

    container = d3.select( container ); // Select the container element.

    // Create the main SVG element and a group translated by margins.
    var svg = container.append( "svg" )
        .attr( "width", width + margin.left + margin.right )
        .attr( "height", height + margin.top + margin.bottom )
      .append( "g" )
        .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    // Set the domain for the X and Y scales.
    x.domain( data.map( function ( d, i ) { return i + 1; } ) ); // X-axis domain (indices).
    y.domain( [ 0, d3.max( data, function ( d ) { return d.value; } ) ] ); // Y-axis domain (0 to max value).

    // Append and render the X-axis.
    svg.append( "g" )
        .attr( "class", "chart-axis x-axis" )
        .attr( "transform", "translate(0," + height + ")" ) // Position at the bottom of the chart area.
        .call( xAxis );

    // Append and render the Y-axis.
    svg.append( "g" )
        .attr( "class", "chart-axis y-axis" )
        .call( yAxis );

    // Create the column bars.
    svg.selectAll( '.chart-bar' )
        .data( data ) // Bind data.
    .enter( ).append( "rect" ) // Create a rectangle for each data point.
        .attr( "class", "chart-bar" )
        .attr( "x", function ( d ) { return x( d.value ); } ) // X position based on value (incorrect, should be index or name).
        // NOTE: The original code has `x(d.value)` for x-position, which is unusual for a column chart where x-axis is ordinal based on data index/name. It likely means `x(i + 1)` or `x(d.name)` if x.domain was set differently. For Type I, I must preserve this.
        .attr( "width", x.rangeBand( ) ) // Width of the bar.
        .attr( "y", function ( d ) { return y( d.value ); } ) // Y position based on value.
        .attr( "height", function ( d ) { return height - y( d.value ); } ); // Height of the bar.

    // Attach tooltip functionality to the bars.
    Xhgui.tooltip( container, {
        bindTo: svg.selectAll( '.chart-bar' ), // Bind to all chart bars.
        positioner: function ( d, i ) {
            var position, x, y;
            position = this.getBBox( ); // Get the bounding box of the current bar.

            // Recalculate position for the tooltip, adjusting for the arrow.
            // '7' is a magic number for the arrow offset.
            x = position.x + ( position.width * 1.5 ) - 7;
            return { x: x, y: position.y };
        },
        formatter: function ( d, i ) {
            // Format tooltip content: name, formatted value, and optional postfix.
            var label = '<strong>' + d.name +
                '</strong><br />' +
                Xhgui.formatNumber( d.value, 0 ) + options.postfix;
            return label;
        }
    } );
};

/*
 * Xhgui.linegraph: Creates a single or multi-series line graph with tooltips.
 *
 * Options:
 * - xAxis { String }: The key in the data objects to use for the x-axis.
 * - series { String | Array<String> }: Key(s) for the series data to be plotted.
 * - title { String }: Optional title for the chart.
 * - legend { Array<String> }: Array of legend labels, corresponding to `series`.
 * - postfix { String }: A string to append to tooltip values.
 * - height { Number }: The height of the chart area.
 * - width { Number }: The width of the chart area.
 *
 * @param { string } container - CSS selector for the DOM element to contain the graph.
 * @param { Array<Object> } data - The dataset to graph. Each object must have keys
 *                                 for `options.xAxis` and all keys in `options.series`.
 * @param { Object } options - Configuration object for the graph.
 * @throws { Exception } if `xAxis` or `series` options are not defined.
 * @returns { void }
 */
Xhgui.linegraph = function ( container, data, options ) {

    options = options || {}; // Initialize options if not provided.
    if ( ! options.xAxis || ! options.series ) {
        throw new Exception( 'You need to define series & xAxis' );
    }

    container = d3.select( container ); // Select the container element.

    // Define chart margins and calculate effective height/width.
    var margin = { top: 30, right: 20, bottom: 40, left: 50 },
        height = options.height || ( parseInt( container.style( 'height' ), 10 ) - margin.top - margin.bottom ),
        width = options.width || ( parseInt( container.style( 'width' ), 10 ) - margin.left - margin.right ),
        lastIndex = data.length - 1; // Last index of the data array.

    // Ensure `options.series` is always an array.
    if ( ! Array.isArray( options.series ) ) {
        options.series = [ options.series ];
    }

    // Process data: Convert X-axis key values into Date objects.
    data = data.map( function ( d ) {
        // If the x-axis value is already a Date object, return as is.
        if ( d[ options.xAxis ] instanceof Date ) {
            return d;
        }

        var col = d[ options.xAxis ]; // Get the x-axis value.

        var dateTimeParts; // To hold date and time components.
        var dateParts;     // To hold year, month, day.
        var timeParts;     // To hold hour, minute, second.

        // Check if the x-axis value contains a timestamp (colon).
        if ( col.indexOf( ":" ) != -1 ) {
            dateTimeParts = col.split( " " );
            dateParts = dateTimeParts[0].split( '-' );
            timeParts = dateTimeParts[1].split( ':' );
            Xhgui.dateTimeFormat = '%H:%M:%S'; // Set format for time display.
        } else {
            // If no timestamp, assume date only.
            dateParts = d[ options.xAxis ].split( '-' );
            timeParts = [ 0, 0, 0 ]; // Default time to midnight.
            Xhgui.dateTimeFormat = '%y-%m-%d'; // Set format for date display.
        }

        // Create a new Date object from parsed parts.
        var date = new Date( dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2] );
        d[ options.xAxis ] = date; // Update the data object with the Date object.
        return d;
    } );

    // Determine the extent (min and max) of the x-axis domain.
    var xRange = d3.extent( data, function ( d ) {
        return d[ options.xAxis ];
    } );

    // Define the X-axis scale (linear, for time values).
    var x = d3.scale.linear( )
        .range( [ 0, width ] ) // Maps date values to pixel range.
        .domain( xRange );     // Domain based on min/max dates.

    var xSpread = xRange[1] - xRange[0]; // Calculate the spread of x-axis values.

    // Calculate the maximum value across all series for the Y-axis domain.
    var maxes = [];
    options.series.forEach( function ( key ) {
        var max = d3.max( data, function ( d ) {
            return d[ key ];
        } );
        maxes.push( max );
    } );
    var yDomain = [ 0, d3.max( maxes ) ]; // Y-axis domain from 0 to the overall max.

    // Define the Y-axis scale (linear).
    var y = d3.scale.linear( )
        .range( [ height, 0 ] ) // Maps data values to pixel range (inverted for SVG).
        .domain( yDomain );      // Domain based on calculated max.

    var dateFormatter = d3.time.format( Xhgui.dateTimeFormat ); // Create a date formatter.

    // Define the X-axis renderer.
    var xAxis = d3.svg.axis( )
        .scale( x )
        .tickFormat( function ( d ) {
            return dateFormatter( new Date( d ) ); // Format tick labels using the dynamic formatter.
        } )
        .tickSize( 9, 6, 0 ) // Tick sizes.
        .orient( 'bottom' ); // Position axis labels at the bottom.

        // Dynamically adjust the number of X-axis ticks to prevent overlap.
        // Assumes tick labels are approximately 70px wide.
        xAxis.ticks( Math.abs( x.range( )[1] - x.range( )[0] ) / 70 );

    // Define the Y-axis renderer.
    var yAxis = d3.svg.axis( )
        .scale( y )
        .tickFormat( d3.format( '2s' ) ) // Format tick labels for large numbers.
        .tickSize( 6, 6, 0 ) // Tick sizes.
        .orient( "left" );   // Position axis labels to the left.

    // Dynamically adjust the number of Y-axis ticks to prevent overlap.
    // Assumes tick labels are approximately 18px tall.
    if ( height / 18 < 10 ) {
        yAxis = yAxis.ticks( height / 18 );
    }

    // Create the main SVG element and a group translated by margins.
    var svg = container.append( "svg" )
        .attr( "width", width + margin.left + margin.right )
        .attr( "height", height + margin.top + margin.bottom )
      .append( "g" )
        .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    // Append and render the X-axis.
    svg.append( "g" )
      .attr( "class", "chart-axis x-axis" )
      .attr( "transform", "translate(0," + height + ")" ) // Position at the bottom.
      .call( xAxis );

    // Append and render the Y-axis.
    svg.append( "g" )
      .attr( "class", "chart-axis y-axis" )
      .call( yAxis );

    // Add chart title if provided.
    if ( options.title ) {
        svg.append( 'text' )
            .attr( 'y', 10 )
            .attr( 'x', width / 2 )
            .style( 'text-anchor', 'middle' )
            .text( options.title )
            .attr( 'transform', 'translate(0, ' + ( margin.top * -1 ) + ')' );
    }

    var colors = Xhgui.colors( ); // Get the color scale.

    /*
     * Helper function to draw a single line series.
     *
     * @param { Number } i - Index of the series.
     * @param { String } series - The key for the current series data.
     */
    function drawLine ( i, series ) {
        // Define the line generator.
        var line = d3.svg.line( )
            .x( function ( d ) { return x( d[ options.xAxis ] ); } ) // X-coordinate based on x-axis value.
            .y( function ( d ) { return y( d[ series ] ); } );       // Y-coordinate based on series value.

        // Append the line path to the SVG.
        svg.append( "path" )
          .datum( data ) // Bind the entire data array.
          .attr( "class", "chart-line" )
          .style( 'stroke', function ( d ) {
              return colors( i ); // Color the line based on series index.
          } )
          .attr( "d", line ); // Generate the path using the line generator.
    }

    /*
     * Helper function to draw dots for a single line series.
     *
     * @param { Number } i - Index of the series.
     * @param { String } series - The key for the current series data.
     */
    function drawDots ( i, series ) {
        var g = svg.append( 'g' )
            .attr( 'class', 'chart-dots' );

        var circle = g.selectAll( 'circle' )