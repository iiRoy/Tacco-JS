/*
 * HighchartTable Plugin for jQuery
 * This plugin converts standard HTML tables into dynamic Highcharts graphs.
 * It leverages data attributes on the table and its cells to configure the chart.
 *
 * Version: 1.0.0
 * License: MIT
 *
 * This file is a Type I clone of the original source.
 * Only whitespace and comments have been altered to achieve a visually different,
 * but functionally identical, representation of the code.
 */

;
( function ( $ ) {

    // Extend jQuery's prototype with the highchartTable function.
    // This allows calling .highchartTable() on a jQuery object containing tables.
    $.fn.highchartTable = function () {

        // Define the allowed types of graphs that can be generated.
        var allowedGraphTypes = [ 'column', 'line', 'area', 'spline', 'pie' ];

        /**
         * Helper function to dynamically retrieve a callable function
         * specified by a string path in a data attribute (e.g., "window.myObject.myFunction").
         *
         * @param {HTMLElement} table     The DOM element of the table.
         * @param {string}      attribute The name of the data attribute holding the callback path.
         * @returns {Function|undefined} The resolved callable function, or undefined if not found.
         */
        var getCallable = function ( table, attribute ) {
            var callbackPath = $( table ).data( attribute );

            if ( typeof callbackPath !== 'undefined' ) {
                var pathSegments      = callbackPath.split( '.' );
                var currentCallable   = window[ pathSegments[ 0 ] ];

                for ( var i = 1, segmentsLength = pathSegments.length; i < segmentsLength; i++ ) {
                    // Traverse down the object path to find the actual function.
                    currentCallable = currentCallable[ pathSegments[ i ] ];
                }

                return currentCallable;
            }

            // Return nothing if the data attribute isn't set.
            return undefined;
        };


        // Iterate over each table element selected by the jQuery object.
        this.each( function () {

            var table      = $( this ); // The current HTML table element.
            var $table     = $( table ); // jQuery wrapper for the table.
            var nbYaxis    = 1;          // Tracks the number of Y-axes needed (default is 1).

            /*
             * CHART TITLE EXTRACTION
             * Attempts to retrieve the chart's main title from the table's <caption> tag.
             * If no caption is found, the title defaults to an empty string.
             */
            var captions   = $( 'caption', table );
            var graphTitle = captions.length ? $( captions[ 0 ] ).text() : '';


            var graphContainer; // This variable will hold the DOM element where Highcharts will render.

            // Determine where the Highcharts graph should be rendered.
            if ( $table.data( 'graph-container-before' ) !== 1 ) {
                /*
                 * If 'graph-container-before' is not explicitly set to '1',
                 * we look for a specified container via 'graph-container' data attribute.
                 */

                var graphContainerSelector = $table.data( 'graph-container' );

                // The 'graph-container' attribute is mandatory unless 'graph-container-before' is used.
                if ( !graphContainerSelector ) {
                    throw "graph-container data attribute is mandatory";
                }

                /*
                 * Handle absolute vs. relative selectors for the graph container.
                 * Absolute selectors start with '#' (ID) or don't contain '..' (parent traversal).
                 * Relative selectors use '..' to traverse up the DOM tree from the table.
                 */
                if ( graphContainerSelector[ 0 ] === '#' || graphContainerSelector.indexOf( '..' ) === -1 ) {
                    // Absolute selector: directly find the element in the document.
                    graphContainer = $( graphContainerSelector );
                } else {
                    // Relative selector: traverse up from the current table.
                    var referenceNode                 = table;
                    var currentGraphContainerSelector = graphContainerSelector;

                    // Keep traversing up as long as '..' is present in the selector.
                    while ( currentGraphContainerSelector.indexOf( '..' ) !== -1 ) {
                        currentGraphContainerSelector = currentGraphContainerSelector.replace( /^.. /, '' );
                        referenceNode                 = referenceNode.parent();
                    }

                    // Find the container within the resolved reference node.
                    graphContainer = $( currentGraphContainerSelector, referenceNode );
                }

                // Ensure that exactly one container element was found.
                if ( graphContainer.length !== 1 ) {
                    throw "graph-container is not available in this DOM or available multiple times";
                }

                // Extract the raw DOM element from the jQuery object.
                graphContainer = graphContainer[ 0 ];

            } else {
                /*
                 * If 'graph-container-before' is '1', a new div will be inserted
                 * immediately before the table to serve as the chart container.
                 */
                $table.before( '<div></div>' );
                graphContainer = $table.prev(); // Get the newly inserted div.
                graphContainer = graphContainer[ 0 ]; // Extract the raw DOM element.
            }


            /*
             * GLOBAL GRAPH SETTINGS EXTRACTION
             * Retrieves the overall graph type, stacking behavior, data label status,
             * and inversion setting from the table's data attributes.
             */
            var globalGraphType = $table.data( 'graph-type' );

            // The 'graph-type' attribute is essential.
            if ( !globalGraphType ) {
                throw "graph-type data attribute is mandatory";
            }

            // Validate that the specified graph type is supported.
            if ( $.inArray( globalGraphType, allowedGraphTypes ) === -1 ) {
                throw "graph-container data attribute must be one of " + allowedGraphTypes.join( ', ' );
            }

            var stackingType = $table.data( 'graph-stacking' );
            if ( !stackingType ) {
                stackingType = 'normal'; // Default stacking behavior.
            }

            var dataLabelsEnabled = $table.data( 'graph-datalabels-enabled' );
            var isGraphInverted   = $table.data( 'graph-inverted' ) === 1;


            /*
             * SERIES AND VLINE CONFIGURATION FROM TABLE HEADERS
             * Iterates through the table header cells (<th>) to define individual
             * series (columns of data) and special vertical line annotations.
             */
            var ths            = $( 'thead th', table );
            var columns        = []; // Array to store configuration for data series.
            var vlines         = []; // Array to store configuration for vertical lines.
            var skippedColumns = 0;  // Counter for columns that are marked to be skipped.
            var graphIsStacked = false; // Flag indicating if any series uses stacking.

            ths.each( function ( indexTh, th ) {
                var $th         = $( th );
                var columnScale = $th.data( 'graph-value-scale' );

                var serieGraphType = $th.data( 'graph-type' );
                if ( $.inArray( serieGraphType, allowedGraphTypes ) === -1 ) {
                    // If a specific series type is invalid, fall back to the global graph type.
                    serieGraphType = globalGraphType;
                }

                var serieStackGroup = $th.data( 'graph-stack-group' );
                if ( serieStackGroup ) {
                    // If any series has a stack group, the graph is considered stacked.
                    graphIsStacked = true;
                }

                var serieDataLabelsEnabled = $th.data( 'graph-datalabels-enabled' );
                if ( typeof serieDataLabelsEnabled === 'undefined' ) {
                    // If not defined for the series, inherit from the global setting.
                    serieDataLabelsEnabled = dataLabelsEnabled;
                }

                var yaxis = $th.data( 'graph-yaxis' );

                // Check if a second Y-axis is required.
                if ( typeof yaxis !== 'undefined' && yaxis === '1' ) {
                    nbYaxis = 2;
                }

                var isColumnSkipped = $th.data( 'graph-skip' ) === 1;
                if ( isColumnSkipped ) {
                    skippedColumns = skippedColumns + 1;
                }

                // Basic configuration object for either a series or a vline.
                var thGraphConfig = {
                    libelle:           $th.text(),
                    skip:              isColumnSkipped,
                    // Adjusted index for data columns, accounting for skipped columns and the X-axis column.
                    indexTd:           indexTh - skippedColumns - 1,
                    color:             $th.data( 'graph-color' ),
                    visible:           !$th.data( 'graph-hidden' ),
                    yAxis:             typeof yaxis !== 'undefined' ? yaxis : 0, // Default to the first Y-axis (index 0).
                    dashStyle:         $th.data( 'graph-dash-style' ) || 'solid',
                    dataLabelsEnabled: serieDataLabelsEnabled === 1,
                    dataLabelsColor:   $th.data( 'graph-datalabels-color' ) || $table.data( 'graph-datalabels-color' )
                };

                var vlinex = $th.data( 'graph-vline-x' );
                if ( typeof vlinex === 'undefined' ) {
                    // This header defines a regular data series.
                    thGraphConfig.scale     = typeof columnScale !== 'undefined' ? parseFloat( columnScale ) : 1;
                    // For inverted charts, 'column' type becomes 'bar'.
                    thGraphConfig.graphType = serieGraphType === 'column' && isGraphInverted ? 'bar' : serieGraphType;
                    thGraphConfig.stack     = serieStackGroup;
                    thGraphConfig.unit      = $th.data( 'graph-unit' );
                    columns[ indexTh ]      = thGraphConfig; // Store in columns array.
                } else {
                    // This header defines a vertical line annotation.
                    thGraphConfig.x        = vlinex;
                    thGraphConfig.height   = $th.data( 'graph-vline-height' );
                    thGraphConfig.name     = $th.data( 'graph-vline-name' );
                    vlines[ indexTh ]      = thGraphConfig; // Store in vlines array.
                }
            } );


            // Array to hold all Highcharts series objects before data population.
            var series = [];

            // Convert column configurations into Highcharts series objects.
            $( columns ).each( function ( indexColumn, column ) {
                // Skip the first column (typically X-axis labels) and any explicitly skipped columns.
                if ( indexColumn !== 0 && !column.skip ) {

                    var serieConfig = {
                        name:      column.libelle + ( column.unit ? ' (' + column.unit + ')' : '' ),
                        data:      [], // This will be populated from <tbody> cells later.
                        type:      column.graphType,
                        stack:     column.stack,
                        color:     column.color,
                        visible:   column.visible,
                        yAxis:     column.yAxis,
                        dashStyle: column.dashStyle,
                        marker: {
                            enabled: false // Disable markers by default.
                        },
                        dataLabels: {
                            enabled: column.dataLabelsEnabled,
                            color:   column.dataLabelsColor,
                            align:   $table.data( 'graph-datalabels-align' ) || ( globalGraphType === 'column' && isGraphInverted === 1 ? undefined : 'center' )
                        }
                    };

                    // If data labels are enabled, check for a custom formatter function.
                    if ( column.dataLabelsEnabled ) {
                        var callableSerieDataLabelsFormatter = getCallable( table, 'graph-datalabels-formatter' );
                        if ( callableSerieDataLabelsFormatter ) {
                            serieConfig.dataLabels.formatter = function () {
                                return callableSerieDataLabelsFormatter( this.y );
                            };
                        }
                    }

                    series.push( serieConfig ); // Add the configured series to the main series array.
                }
            } );

            // Add vertical line configurations as special Highcharts series.
            $( vlines ).each( function ( indexColumn, vline ) {
                if ( typeof vline !== 'undefined' && !vline.skip ) {
                    series.push( {
                        name:    vline.libelle,
                        data:    [ { x: vline.x, y: 0, name: vline.name }, { x: vline.x, y: vline.height, name: vline.name } ],
                        type:    'spline', // Vertical lines are typically rendered as spline series.
                        color:   vline.color,
                        visible: vline.visible,
                        marker: {
                            enabled: false
                        }
                    } );
                }
            } );


            /*
             * DATA POPULATION FROM TABLE BODY
             * This section iterates through the table rows and cells (<td>)
             * to extract the actual data points for each series.
             */
            var xValues         = []; // Array to store X-axis category labels (from the first column).
            var callablePoint   = getCallable( table, 'graph-point-callback' ); // Callback for individual point clicks.
            var isGraphDatetime = $table.data( 'graph-xaxis-type' ) === 'datetime'; // Flag for datetime X-axis.

            var rows = $( 'tbody:first tr', table ); // Get all rows from the first tbody.
            rows.each( function ( indexRow, row ) {
                // Skip rows that are explicitly marked to be skipped.
                if ( !!$( row ).data( 'graph-skip' ) ) {
                    return;
                }

                var tds = $( 'td', row ); // Get all data cells within the current row.
                tds.each( function ( indexTd, td ) {
                    var cellValue;
                    var columnConfig = columns[ indexTd ]; // Get the configuration for this specific column.

                    // If the column itself is marked to be skipped, ignore its cells.
                    if ( columnConfig.skip ) {
                        return;
                    }

                    var $td = $( td );
                    if ( indexTd === 0 ) {
                        // The first cell in a row typically provides the X-axis category label.
                        cellValue = $td.text();
                        xValues.push( cellValue );
                    } else {
                        // Subsequent cells provide data points for the series.
                        var rawCellValue = $td.text();
                        var targetSerie  = series[ columnConfig.indexTd ]; // Reference the correct series object.

                        if ( rawCellValue.length === 0 ) {
                            // If a cell is empty, push 'null' to represent missing data in Highcharts.
                            if ( !isGraphDatetime ) {
                                targetSerie.data.push( null );
                            }
                            // For datetime, empty cells might mean no data for that time point, handled implicitly.
                        } else {
                            // Clean and parse the cell value into a float.
                            var cleanedCellValue = rawCellValue.replace( /\s/g, '' ).replace( /,/, '.' );
                            cellValue            = Math.round( parseFloat( cleanedCellValue ) * columnConfig.scale * 100 ) / 100;

                            var dataGraphX = $td.data( 'graph-x' ); // Get explicit X value if defined.

                            if ( isGraphDatetime ) {
                                // If X-axis is datetime, parse the date from the first cell of the row.
                                dataGraphX = $( 'td', $( row ) ).first().text();
                                var date   = parseDate( dataGraphX );
                                // Convert to UTC milliseconds, adjusting for timezone offset.
                                dataGraphX = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
                            }

                            var tdGraphName = $td.data( 'graph-name' );
                            var serieDataItem = {
                                name:   typeof tdGraphName !== 'undefined' ? tdGraphName : rawCellValue,
                                y:      cellValue,
                                x:      dataGraphX // Will be undefined for category axes, or a specific value for others.
                            };

                            // Attach a click event handler to the data point if a callback is specified.
                            if ( callablePoint ) {
                                serieDataItem.events = {
                                    click: function () {
                                        return callablePoint( this );
                                    }
                                };
                            }

                            // Special handling for pie charts: mark a slice as 'sliced' if highlighted.
                            if ( columnConfig.graphType === 'pie' ) {
                                if ( $td.data( 'graph-item-highlight' ) ) {
                                    serieDataItem.sliced = 1;
                                }
                            }

                            // Apply an individual color to the data point if specified.
                            var tdGraphItemColor = $td.data( 'graph-item-color' );
                            if ( typeof tdGraphItemColor !== 'undefined' ) {
                                serieDataItem.color = tdGraphItemColor;
                            }

                            targetSerie.data.push( serieDataItem ); // Add the prepared data point to its series.
                        }
                    }
                } );

            } ); // End of rows.each()


            /*
             * Y-AXIS CONFIGURATION
             * Builds the configuration objects for the Y-axes (up to 2 supported).
             */
            var yAxisConfig = [];
            var yAxisNum;

            for ( yAxisNum = 1; yAxisNum <= nbYaxis; yAxisNum++ ) {
                var currentYAxisConfig = {
                    title: {
                        text: typeof $table.data( 'graph-yaxis-' + yAxisNum + '-title-text' ) !== 'undefined' ? $table.data( 'graph-yaxis-' + yAxisNum + '-title-text' ) : null
                    },
                    max:          typeof $table.data( 'graph-yaxis-' + yAxisNum + '-max' ) !== 'undefined' ? $table.data( 'graph-yaxis-' + yAxisNum + '-max' ) : null,
                    min:          typeof $table.data( 'graph-yaxis-' + yAxisNum + '-min' ) !== 'undefined' ? $table.data( 'graph-yaxis-' + yAxisNum + '-min' ) : null,
                    reversed:     $table.data( 'graph-yaxis-' + yAxisNum + '-reversed' ) === '1',
                    opposite:     $table.data( 'graph-yaxis-' + yAxisNum + '-opposite' ) === '1',
                    tickInterval: $table.data( 'graph-yaxis-' + yAxisNum + '-tick-interval' ) || null,
                    labels: {
                        rotation: $table.data( 'graph-yaxis-' + yAxisNum + '-rotation' ) || 0
                    },
                    startOnTick: $table.data( 'graph-yaxis-' + yAxisNum + '-start-on-tick' ) !== "0", // Default to true if not "0".
                    endOnTick:   $table.data( 'graph-yaxis-' + yAxisNum + '-end-on-tick' ) !== "0",     // Default to true if not "0".
                    stackLabels : {
                        enabled: $table.data( 'graph-yaxis-' + yAxisNum + '-stacklabels-enabled' ) === '1'
                    },
                    gridLineInterpolation: $table.data( 'graph-yaxis-' + yAxisNum + '-grid-line-interpolation' ) || null
                };

                // Apply a custom formatter for Y-axis labels if specified.
                var callableYAxisFormatter = getCallable( table, 'graph-yaxis-' + yAxisNum + '-formatter-callback' );
                if ( callableYAxisFormatter ) {
                    currentYAxisConfig.labels.formatter = function () {
                        return callableYAxisFormatter( this.value );
                    };
                }

                yAxisConfig.push( currentYAxisConfig );
            }


            /*
             * COLOR SCHEME AND LINE STYLING
             * Defines default colors and allows overriding them via data attributes or Highcharts theme.
             */
            var defaultColors = [
                '#4572A7', '#AA4643', '#89A54E', '#80699B',
                '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C',
                '#B5CA92'
            ];
            var colors = []; // Final array of colors to be used in the chart.

            // Check for colors defined in the global Highcharts theme.
            var themeColors = typeof Highcharts.theme !== 'undefined' && typeof Highcharts.theme.colors !== 'undefined' ? Highcharts.theme.colors : [];
            var lineShadow  = $table.data( 'graph-line-shadow' );
            var lineWidth   = $table.data( 'graph-line-width' ) || 2; // Default line width.

            // Populate the 'colors' array, prioritizing data attributes, then theme, then defaults.
            var nbOfColors = Math.max( defaultColors.length, themeColors.length );
            for ( var i = 0; i < nbOfColors; i++ ) {
                var dataname = 'graph-color-' + ( i + 1 );
                colors.push(
                    typeof $table.data( dataname ) !== 'undefined' ? $table.data( dataname ) :
                        typeof themeColors[ i ] !== 'undefined' ? themeColors[ i ] :
                            defaultColors[ i ]
                );
            }


            /*
             * CHART MARGINS AND X-AXIS LABEL STYLING
             */
            var marginTop    = $table.data( 'graph-margin-top' );
            var marginRight  = $table.data( 'graph-margin-right' );
            var marginBottom = $table.data( 'graph-margin-bottom' );
            var marginLeft   = $table.data( 'graph-margin-left' );

            var xAxisLabelsEnabled = $table.data( 'graph-xaxis-labels-enabled' );

            var xAxisLabelStyle = {};
            var xAxisLabelFontSize = $table.data( 'graph-xaxis-labels-font-size' );

            if ( typeof xAxisLabelFontSize !== 'undefined' ) {
                xAxisLabelStyle.fontSize = xAxisLabelFontSize;
            }


            /*
             * MAIN HIGHCHARTS CONFIGURATION OBJECT
             * This object consolidates all the collected settings into a format
             * directly usable by the Highcharts.Chart constructor.
             */
            var highChartConfig = {
                colors: colors, // Custom or default color scheme.
                chart: {
                    renderTo:     graphContainer, // The target DOM element for rendering.
                    inverted:     isGraphInverted,
                    marginTop:    typeof marginTop !== 'undefined' ? marginTop : null,
                    marginRight:  typeof marginRight !== 'undefined' ? marginRight : null,
                    marginBottom: typeof marginBottom !== 'undefined' ? marginBottom : null,
                    marginLeft:   typeof marginLeft !== 'undefined' ? marginLeft : null,
                    spacingTop:   $table.data( 'graph-spacing-top' ) || 10,
                    height:       $table.data( 'graph-height' ) || null,
                    zoomType:     $table.data( 'graph-zoom-type' ) || null,
                    polar:        $table.data( 'graph-polar' ) || null
                },
                title: {
                    text: graphTitle // Chart title.
                },
                subtitle: {
                    text: $table.data( 'graph-subtitle-text' ) || ''
                },
                legend: {
                    enabled:     $table.data( 'graph-legend-disabled' ) !== '1',
                    layout:      $table.data( 'graph-legend-layout' ) || 'horizontal',
                    symbolWidth: $table.data( 'graph-legend-width' ) || 30,
                    x:           $table.data( 'graph-legend-x' ) || 15,
                    y:           $table.data( 'graph-legend-y' ) || 0
                },
                xAxis: {
                    categories:           ( $table.data( 'graph-xaxis-type' ) !== 'datetime' ) ? xValues : undefined,
                    type:                 ( $table.data( 'graph-xaxis-type' ) === 'datetime' ) ? 'datetime' : undefined,
                    reversed:             $table.data( 'graph-xaxis-reversed' ) === '1',
                    opposite:             $table.data( 'graph-xaxis-opposite' ) === '1',
                    showLastLabel:        typeof $table.data( 'graph-xaxis-show-last-label' ) !== 'undefined' ? $table.data( 'graph-xaxis-show-last-label' ) : true,
                    tickInterval:         $table.data( 'graph-xaxis-tick-interval' ) || null,
                    dateTimeLabelFormats: { // Default formats for datetime axis labels.
                        second: '%e. %b',
                        minute: '%e. %b',
                        hour:   '%e. %b',
                        day:    '%e. %b',
                        week:   '%e. %b',
                        month:  '%e. %b',
                        year:   '%e. %b'
                    },
                    labels: {
                        rotation: $table.data( 'graph-xaxis-rotation' ) || 0,
                        align:    $table.data( 'graph-xaxis-align' ) || 'center',
                        enabled:  typeof xAxisLabelsEnabled !== 'undefined' ? xAxisLabelsEnabled : true,
                        style:    xAxisLabelStyle
                    },
                    startOnTick: $table.data( 'graph-xaxis-start-on-tick' ),
                    endOnTick:   $table.data( 'graph-xaxis-end-on-tick' ),
                    min: getXAxisMinMax( table, 'min' ),
                    max: getXAxisMinMax( table, 'max' ),
                    alternateGridColor: $table.data( 'graph-xaxis-alternateGridColor' ) || null,
                    title: {
                        text: $table.data( 'graph-xaxis-title-text' ) || null
                    },
                    gridLineWidth:     $table.data( 'graph-xaxis-gridLine-width' ) || 0,
                    gridLineDashStyle: $table.data( 'graph-xaxis-gridLine-style' ) || 'ShortDot',
                    tickmarkPlacement: $table.data( 'graph-xaxis-tickmark-placement' ) || 'between',
                    lineWidth:         $table.data( 'graph-xaxis-line-width' ) || 0
                },
                yAxis: yAxisConfig, // Configured Y-axes.
                tooltip: {
                    formatter: function () {
                        if ( $table.data( 'graph-xaxis-type' ) === 'datetime' ) {
                            return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat( '%e. %b', this.x ) + ' : ' + this.y;
                        } else {
                            var xValue = typeof xValues[ this.point.x ] !== 'undefined' ? xValues[ this.point.x ] : this.point.x;
                            if ( globalGraphType === 'pie' ) {
                                return '<strong>' + this.series.name + '</strong><br />' + xValue + ' : ' + this.point.y;
                            }
                            return '<strong>' + this.series.name + '</strong><br />' + xValue + ' : ' + this.point.name;
                        }
                    }
                },
                credits: {
                    enabled: false // Disable Highcharts credits by default.
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        lineWidth: lineWidth
                    },
                    area: {
                        lineWidth:   lineWidth,
                        shadow:      typeof lineShadow !== 'undefined' ? lineShadow : true,
                        fillOpacity: $table.data( 'graph-area-fillOpacity' ) || 0.75
                    },
                    pie: {
                        allowPointSelect: true,
                        dataLabels: {
                            enabled: true
                        },
                        showInLegend: $table.data( 'graph-pie-show-in-legend' ) === '1',
                        size:         '80%'
                    },
                    series: {
                        animation:       false, // Disable animation for performance.
                        stickyTracking:  false,
                        stacking:        graphIsStacked ? stackingType : null,
                        groupPadding:    $table.data( 'graph-group-padding' ) || 0
                    }
                },
                series: series, // All prepared series data.
                exporting: {
                    filename: graphTitle.replace( / /g, '_' ), // Sanitized filename for export.
                    buttons: {
                        exportButton: {
                            menuItems: null, // Use default export menu.
                            onclick: function () {
                                this.exportChart(); // Function to trigger chart export.
                            }
                        }
                    }
                }
            };

            // Trigger a custom event, allowing external scripts to modify the Highcharts configuration
            // object just before the chart is rendered.
            $table.trigger( 'highchartTable.beforeRender', highChartConfig );

            // Instantiate and render the Highcharts chart.
            new Highcharts.Chart( highChartConfig );

        } ); // End of this.each() iteration.

        // Return the jQuery object to maintain chainability.
        return this;
    }; // End of $.fn.highchartTable definition.


    /**
     * Helper function to retrieve and parse X-axis min or max values.
     * Handles datetime conversion if the X-axis type is 'datetime'.
     *
     * @param {HTMLElement} table    The DOM element of the table.
     * @param {string}      minOrMax Specifies whether to retrieve 'min' or 'max'.
     * @returns {number|null} The parsed numeric min/max value, or null if not defined.
     */
    var getXAxisMinMax = function ( table, minOrMax ) {
        var value = $( table ).data( 'graph-xaxis-' + minOrMax );

        if ( typeof value !== 'undefined' ) {
            if ( $( table ).data( 'graph-xaxis-type' ) === 'datetime' ) {
                var date = parseDate( value );
                // Convert to UTC milliseconds, adjusting for local timezone offset, as Highcharts expects.
                return date.getTime() - date.getTimezoneOffset() * 60 * 1000;
            }
            return value; // Return as is for non-datetime types.
        }
        return null; // No min/max value defined.
    };


    /**
     * Parses a datetime string into a JavaScript Date object.
     * Supports formats like "YYYY-MM-DD HH:MM" or "YYYY-MM-DD".
     *
     * @param {string} datetime The datetime string to parse.
     * @returns {Date} The constructed Date object.
     */
    var parseDate = function ( datetime ) {
        var datetimeParts = datetime.split( ' ' );
        var dateDayParts  = datetimeParts[ 0 ].split( '-' );
        var minute        = null;
        var hour          = null;

        // Check if time components (HH:MM) are present in the string.
        if ( datetimeParts[ 1 ] ) {
            var dateHourParts = datetimeParts[ 1 ].split( ':' );
            hour              = parseInt( dateHourParts[ 0 ], 10 );
            minute            = parseInt( dateHourParts[ 1 ], 10 );
        }

        // Construct the Date object. Note: month is 0-indexed in Date constructor.
        return new Date(
            parseInt( dateDayParts[ 0 ], 10 ),      // Year
            parseInt( dateDayParts[ 1 ], 10 ) - 1,  // Month (0-11)
            parseInt( dateDayParts[ 2 ], 10 ),      // Day
            hour,                                   // Hour
            minute                                  // Minute
        );
    };

} )( jQuery ); // Immediately Invoked Function Expression (IIFE) with jQuery as an argument.