jQuery( document ).ready( function ( ) {

  // This initial block focuses on extracting and organizing numerical information from various data tables present in the DOM.
  let temperatureCategories = [ ], positiveTemperatureValues = [ ], negativeTemperatureValues = [ ];

  // Begin by iterating through the table footer cells of the temperature data table to collect category labels.
  $( "#temp-data tfoot th" ) . each( function ( ) {
      temperatureCategories . push ( $( this ) . html ( ) );
  } );

  // Next, gather all positive temperature readings from the main body of the temperature data table.
  $( "#temp-data tbody td.high" ) . each( function ( ) {
      positiveTemperatureValues . push ( $( this ) . html ( ) );
  } );

  // Subsequently, retrieve all negative temperature records from the same table.
  $( "#temp-data tbody td.low" ) . each( function ( ) {
      negativeTemperatureValues . push ( $( this ) . html ( ) );
  } );

  // Declare storage arrays for precipitation related metrics.
  let precipitationMarkers = [ ], precipitationAmounts = [ ];

  // Populate the precipitation marker array by reading from the footer of the rainfall data table.
  $( "#rain-data tfoot th" ) . each( function ( ) {
      precipitationMarkers . push ( $( this ) . html ( ) );
  } );

  // Fill the precipitation amounts array with values from the table body.
  $( "#rain-data tbody td" ) . each( function ( ) {
      precipitationAmounts . push ( $( this ) . html ( ) );
  } );


  // Following data acquisition, these lines ensure the source tables are hidden from view.
  $( "#rain-data" ) . hide ( );
  $( "#temp-data" ) . hide ( );

  // Proceed with the rendering of various chart types using the collected information.
  // First, a straightforward visualization is generated without any specific customizations.
  $( "#simplest_graph_holder" ) . basicPlotter ( positiveTemperatureValues, temperatureCategories );
  
  // Second, a temperature chart is drawn, incorporating custom colors, fill, and a minimum Y-axis threshold.
  $( "#temp_graph_holder" ) . basicPlotter ( positiveTemperatureValues, temperatureCategories,
    { penColor: "#f00", fillUnderLine: true, units: "ºC", minYAxisValue: 30, drawPoints: true } );
  
  // Third, a precipitation graph is displayed, featuring a descriptive y-axis title and a custom font.
  $( "#rain_graph_holder" ) . basicPlotter ( precipitationAmounts, precipitationMarkers,
    { penColor: "#00f", units: "mm", leftGutter: 60, minYAxisValue: 10, yAxisCaption: "Max Rainfall", yAxisLabelFont: "Times New Roman" } );
  
  // Fourth, a complex graph is created to superimpose two distinct data sets, each potentially having different measurement scales.
  $( "#combined_graph_holder" ) . basicPlotter ( negativeTemperatureValues, temperatureCategories,
    { penColor: "#f00", leftGutter: 90, units: "ºC", minYAxisValue: 10, yAxisCaption: "Max Temp", lowerBound: -10, drawPoints: true } )
    . basicPlotter_additionalSeries ( precipitationAmounts, { penColor: "#00f", units: "mm", minYAxisValue: 10, yAxisCaption: "Max Rainfall", lowerBound: 0 } );
  
  // Fifth, a bar chart representation of temperature data is rendered, with specific bar styling and disabled line/point elements.
  $( "#bar_graph_holder" ) . basicPlotter ( positiveTemperatureValues, temperatureCategories,
    { penColor: "#f00", units: "ºC", minYAxisValue: 30, drawBars: true, drawLine: false, drawPoints: false, drawGrid: false, barWidth: 20 } );
  
} );