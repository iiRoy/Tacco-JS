const Telemetry = {
    monitor: function ( $displayArea, $statisticDisplay, timeSpan, timeOffset, dataPoints ) {
        // Fetch statistical data from the backend using an asynchronous request.
        $.getJSON( "/fetchStats", { timeSpan: timeSpan, timeOffset: timeOffset, dataPoints: dataPoints }, function ( responsePayload ) {
            $statisticDisplay.empty(); // Clear current contents of the statistics display panel.

            // IMPORTANT: Sometimes retrieved data series might have inconsistent sample sizes (e.g., 150 vs 1500).
            // Currently, this data normalization is handled on the server side before transmission.
            $displayArea.sparkline( responsePayload['measurements'][0]['dataSeries'], {
                height: '250px',
                width: '500px',
                type: 'line',
                fillColor: '#EEEEEE',
                lineColor: '#05BEE9',
                lineWidth: 2,
                spotRadius: 3,
                chartRangeMin: 0,
                spotColor: "#000000",
                minSpotColor: "#000000",
                maxSpotColor: "#000000"
            } );

            // Initialize a new HTML table to present detailed metrics.
            let $statisticTable = $( '<table>' )
                .css( { "margin-left": "auto", "margin-right": "auto" } )
                .html(
                    $( '<tr>' ).append(
                        $( '<th>' ).html( "Identifier" ),
                        $( '<th>' ).html( "Lowest" ),
                        $( '<th>' ).html( "Highest" ),
                        $( '<th>' ).html( "Current" )
                    )
                );

            // Process each individual statistical item and append its row to the table.
            _.each(
                _.sortBy( responsePayload['measurements'], function ( individualStat ) {
                    return _.last( individualStat['dataSeries'] ) || 0;
                } ).reverse(),
                function ( individualStat ) {
                    $statisticTable.append(
                        $( '<tr>' ).append(
                            $( '<td>' ).html( individualStat['item'].split( "/" )[0] ),
                            $( '<td>' ).html( String( ~~ ( _.min( _.compact( individualStat['dataSeries'] ) ) ) ).replace( "INF", "0" ) ),
                            $( '<td>' ).html( String( ~~ ( _.max( _.compact( individualStat['dataSeries'] ) ) ) ).replace( "-INF", "0" ) ),
                            $( '<td>' ).html( String( ~~ ( _.last( individualStat['dataSeries'] ) || 0 ) ) )
                        )
                    );
                }
            );

            // If multiple data points were requested, add a summary row for aggregated values.
            if ( dataPoints.length > 1 ) {
                // The variable 'aggregatedValues' is assumed to be defined elsewhere or globally, mirroring 'stacked' in the original.
                $statisticTable.append(
                    $( '<tr>' ).append(
                        $( '<th>' ).css( "text-align", "right" ).html( "Overall" ),
                        $( '<th>' ).css( "text-align", "right" ).html( String( ~~ ( _.min( _.compact( aggregatedValues ) ) ) ).replace( "INF", "0" ) ),
                        $( '<th>' ).css( "text-align", "right" ).html( String( ~~ ( _.max( _.compact( aggregatedValues ) ) ) ).replace( "-INF", "0" ) ),
                        $( '<th>' ).css( "text-align", "right" ).html( String( ~~ ( _.last( aggregatedValues ) ) ) )
                    )
                );
            }
            $statisticDisplay.html( $statisticTable ); // Display the constructed table in the designated area.
        } );
    }
};