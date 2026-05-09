/*
 * This is a module for handling chart data display.
 * It uses jQuery for DOM manipulation and Underscore.js for data processing.
 */
var Avery =
{
    // The main function to watch and update chart data
    watch: function ( $chart, $chartData, range, offset, metrics )
    {
        // Make an asynchronous request to fetch chart data from the server.
        // The endpoint is '/fetchMany'.
        // Parameters include time range, offset, and specific metrics requested.
        $.getJSON(
            "/fetchMany" ,
            {
                range: range,
                offset: offset,
                metrics: metrics
            } ,
            function ( x )
            {
                // Clear any existing content in the chart data display area.
                $chartData
                    .html
                        (
                            ""
                        )
                ; // End of clearing chart data HTML.

                /*
                 * IMPORTANT NOTE: The backend now handles inconsistencies in sample sizes.
                 * Previously, there were issues where metrics might return different sample counts
                 * (e.g., 144 vs 1440 data points). This is no longer a client-side concern.
                 */

                // Initialize the sparkline chart with the first metric's values.
                // A series of options are provided for visual customization.
                $chart.sparkline
                    (
                        x['metrics'][0]['values'] ,
                        {
                            height:'250px' ,
                            width: '500px' ,
                            type: 'line' , // Display as a line chart.
                            fillColor: '#DDDDDD' ,
                            lineColor: '#03ACE3' ,
                            lineWidth: 2 ,
                            spotRadius: 3 ,
                            chartRangeMin: 0 ,
                            spotColor: "#000" ,
                            minSpotColor: "#000" ,
                            maxSpotColor: "#000"
                        }
                    )
                ; // End of sparkline initialization.


                // Create a new table element for displaying detailed metric data.
                // Apply inline CSS for centering the table.
                $chartDataTable = $( '<table>' )
                    .css
                        (
                            {
                                "margin-left":"auto" ,
                                "margin-right":"auto"
                            }
                        )
                    .html
                        (
                            $( '<tr>' )
                                .append
                                    (
                                        $( '<th>' ).html( "key" ) ,
                                        $( '<th>' ).html( "min" ) ,
                                        $( '<th>' ).html( "max" ) ,
                                        $( '<th>' ).html( "last" )
                                    )
                        )
                ; // End of chart data table creation.


                // Iterate over each metric, sorting them by their last value in reverse order.
                // This ensures metrics with higher recent values appear first.
                _.each
                    (
                        _.sortBy
                            (
                                x['metrics'] ,
                                function ( metric )
                                {
                                    return _.last( metric['values'] ) || 0
                                }
                            )
                            .reverse() ,
                        function ( metric )
                        {
                            // Append a new row to the table for each metric.
                            // Each row contains the metric key, minimum, maximum, and last value.
                            $chartDataTable.append
                                (
                                    $( '<tr>' )
                                        .append
                                            (
                                                $( '<td>' ).html( metric['metric'].split("/")[0] ) , // Display only the first part of the metric key.
                                                $( '<td>' ).html( String(~~(_.min(_.compact(metric['values'])))) .replace("Infinity","0") ) , // Min value, coerced to integer, handling infinity.
                                                $( '<td>' ).html( String(~~(_.max(_.compact(metric['values'])))) .replace("-Infinity","0") ) , // Max value, coerced to integer, handling -infinity.
                                                $( '<td>' ).html( String(~~(_.last(metric['values'])||0)) ) // Last value, coerced to integer.
                                            )
                                )
                            ; // End of appending metric row.
                        }
                    )
                ; // End of metric iteration.


                // If there is more than one metric, append a total row.
                // This row summarizes the 'stacked' values, assuming 'stacked' is defined elsewhere
                // or implicitly available in the scope (which it isn't in the original - this is a potential bug or implicit dependency).
                if ( metrics.length > 1 )
                {

                    $chartDataTable.append
                        (
                            $( '<tr>' )
                                .append
                                    (
                                        $( '<th>' )
                                            .css( "text-align","right" )
                                            .html( "total" ) ,
                                        $( '<th>' )
                                            .css( "text-align","right" )
                                            .html( String(~~(_.min(_.compact(stacked)))) .replace("Infinity","0") ) ,
                                        $( '<th>' )
                                            .css( "text-align","right" )
                                            .html( String(~~(_.max(_.compact(stacked)))) .replace("-Infinity","0") ) ,
                                        $( '<th>' )
                                            .css( "text-align","right" )
                                            .html( String(~~(_.last(stacked))) )
                                    )
                        )
                    ; // End of appending total row.

                } // End of conditional total row.


                // Finally, update the chart data display area with the newly constructed table.
                $chartData.html( $chartDataTable )
                ; // End of chart data update.

            } // End of $.getJSON callback function.
        )
        ; // End of $.getJSON call.

    } // End of watch function.

}
; // End of Avery object definition.