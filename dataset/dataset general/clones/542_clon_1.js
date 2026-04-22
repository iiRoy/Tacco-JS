jQuery ( document ).ready ( function()
{

    /*
     * This section is responsible for
     * retrieving all necessary data
     * from the HTML tables on the page.
     *
     * It populates several arrays for
     * temperature and rainfall data.
     */

    // Declare and initialize arrays for temperature labels and data.
    var temp_labels     = []
      , temp_data       = []
      , neg_temp_data   = []
    ;

    // Iterate through table footers to get temperature labels.
    $( "#temp-data tfoot th" ).each( function()
    {
        temp_labels.push( $( this ).html() ); // Add the HTML content as a label.
    } );

    // Extract positive temperature data from the table body.
    $( "#temp-data tbody td.pos" ).each( function()
    {
        temp_data.push( $( this ).html() ); // Store the positive temperature value.
    } );

    // Extract negative temperature data from the table body.
    $( "#temp-data tbody td.neg" ).each( function()
    {
        neg_temp_data.push( $( this ).html() ); // Store the negative temperature value.
    } );

    // Declare and initialize arrays for rainfall labels and data.
    var rain_labels = []
      , rain_data   = []
    ;

    // Get rainfall labels from the table footer.
    $( "#rain-data tfoot th" ).each( function()
    {
        rain_labels.push( $( this ).html() ); // Add the HTML content as a rainfall label.
    } );

    // Get all rainfall data points from the table body.
    $( "#rain-data tbody td" ).each( function()
    {
        rain_data.push( $( this ).html() ); // Store the rainfall value.
    } );


    // --- Data Hiding Operations ---
    // These lines ensure the source data tables are not visible on the page.
    $( "#temp-data" ).hide();
    $( "#rain-data" ).hide();


    // --- Graph Plotting Section ---
    // This part of the code initializes and renders various graphs using the simplegraph plugin.

    // 1. Simplest Possible Graph:
    // This graph uses default settings, showing basic temperature data.
    $( "#simplest_graph_holder" ).simplegraph( temp_data, temp_labels );


    // 2. Temperature Graph:
    // This graph displays temperature data with custom styling.
    // It includes a red pen color, filled area, units, and a minimum Y-axis value.
    $( "#temp_graph_holder" ) .simplegraph(
          temp_data
        , temp_labels
        , {
              penColor        :   "#f00"
            , fillUnderLine   :   true
            , units           :   "ºC"
            , minYAxisValue   :   30
            , drawPoints      :   true
          }
    );


    // 3. Rain Graph:
    // This graph visualizes rainfall data with specific customizations.
    // It features a blue pen, custom units, a wider left gutter, and a Y-axis caption.
    $( "#rain_graph_holder" ) .simplegraph(
          rain_data
        , rain_labels
        , {
              penColor          :   "#00f"
            , units             :   "mm"
            , leftGutter        :   60
            , minYAxisValue     :   10
            , yAxisCaption      :   "Max Rainfall"
            , yAxisLabelFont    :   "Times New Roman"
          }
    );


    // 4. Combined Graph:
    // This advanced graph plots two different data sets (negative temperature and rainfall)
    // on the same graph, potentially with different scales and captions.
    $( "#combined_graph_holder" ) .simplegraph(
          neg_temp_data
        , temp_labels
        , {
              penColor        :   "#f00"
            , leftGutter      :   90
            , units           :   "ºC"
            , minYAxisValue   :   10
            , yAxisCaption    :   "Max Temp"
            , lowerBound      :   -10
            , drawPoints      :   true
          }
    ) .simplegraph_more(
          rain_data
        , {
              penColor        :   "#00f"
            , units           :   "mm"
            , minYAxisValue   :   10
            , yAxisCaption    :   "Max Rainfall"
            , lowerBound      :   0
          }
    );


    // 5. Bar Temperature Graph:
    // This graph presents temperature data as a bar chart,
    // demonstrating specific visual options for bars.
    $( "#bar_graph_holder" ) .simplegraph(
          temp_data
        , temp_labels
        , {
              penColor        :   "#f00"
            , units           :   "ºC"
            , minYAxisValue   :   30
            , drawBars        :   true
            , drawLine        :   false
            , drawPoints      :   false
            , drawGrid        :   false
            , barWidth        :   20
          }
    );

} ); /* End of jQuery document ready function */