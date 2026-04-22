// This is a cloned version of the original script.
// All functionality remains identical, only formatting and comments are altered.


// The following arrays define configuration for the dashboard display.
// TODO: Consider fetching these dynamically from a server or configuration file for better flexibility.
var columns = [ 0, 1 ]; // Array of column indices for initialization
var keys = [
  'rpm',
  'cache0',
  'cache1',
  'http_status',
  'wp_login',
  'aurt',
  'aurtli',
  'mysql',
  'df'
]; // Array of metric keys to display, used across various initialization and update functions.


/**
 * @function init_all
 * @description Orchestrates the initial setup of all dashboard components.
 * This function iterates through predefined columns and keys to create
 * the necessary UI elements like column containers, graphs, and value displays.
 */
var init_all = function ( ) {
  // Loop through each column index specified in the `columns` array.
  for ( var i = 0; i < columns.length; i++ ) {
    init_column( i ); // Initialize the current column container.

    // For each initialized column, iterate through all defined `keys`
    // to create individual graph elements within that column.
    for ( var j = 0; j < keys.length; j++ ) {
      init_graph( i, keys[ j ] );
    }
  }

  // After initializing standard columns, create an additional column
  // specifically for displaying aggregate or summary values.
  var lastcol = columns.length;
  init_column( lastcol );

  // Within this last column, initialize value display elements
  // for each of the predefined `keys`.
  for ( var j = 0; j < keys.length; j++ ) {
    init_values( lastcol, keys[ j ] );
  }
};


/**
 * @function init_column
 * @param {number} index - The numerical index to be assigned to the new column.
 * @description Creates a new 'div' element representing a dashboard column,
 * assigns it a unique ID and a CSS class, and appends it to the main 'container'.
 */
var init_column = function ( index ) {
  var container = document.getElementById( 'container' ); // Retrieve the main container element from the DOM.
  var column = document.createElement( 'div' ); // Create a new 'div' element.

  column.className = 'column'; // Assign the CSS class 'column' for styling purposes.
  column.id = 'column-' + index; // Set a unique ID for the column, e.g., 'column-0', 'column-1'.
  container.appendChild( column ); // Add the newly created column to the main container.
};


/**
 * @function init_graph
 * @param {number} col - The index of the parent column where the graph will be placed.
 * @param {string} key - The unique identifier (key) for the metric this graph will display.
 * @description Creates a 'div' element intended for plotting a graph, assigns it
 * a unique ID, applies styling, and appends it to the specified column.
 */
var init_graph = function ( col, key ) {
  var column = document.getElementById( 'column-' + col ); // Locate the parent column using its ID.
  var plot = document.createElement( 'div' ); // Create a new 'div' element for the graph plot.

  plot.className = 'plot'; // Assign the CSS class 'plot'.
  plot.id = 'plot-' + col + '-' + key; // Generate a unique ID, e.g., 'plot-0-rpm'.
  plot.style.width = column.style.width; // Inherit the width from the parent column.
  plot.innerHTML = plot.id; // As a placeholder, display the plot's ID inside the div.
  column.appendChild( plot ); // Attach the plot div to its parent column.
};


/**
 * @function init_values
 * @param {number} col - The index of the parent column where the value display will reside.
 * @param {string} key - The unique identifier (key) for the metric whose value will be displayed.
 * @description Creates a 'div' element to show a single metric value, assigns it
 * a unique ID, applies styling, and appends it to the specified column.
 */
var init_values = function ( col, key ) {
  var column = document.getElementById( 'column-' + col ); // Find the target column element.
  var value = document.createElement( 'div' ); // Create a new 'div' for displaying the value.

  value.className = 'value'; // Assign the CSS class 'value'.
  value.id = 'value-' + key; // Set a unique ID for the value display, e.g., 'value-rpm'.
  value.innerHTML = key; // Initialize its content with the metric key itself.
  column.appendChild( value ); // Add the value div to the specified column.
};


/**
 * @function update_all
 * @param {string} body - A JSON string containing all the necessary data to update the dashboard.
 * @description Parses the incoming JSON data and iterates through each metric key
 * to update the corresponding graphs and value displays.
 */
var update_all = function ( body ) {
  var data = JSON.parse( body ); // Convert the JSON string from the server into a JavaScript object.

  var labels = data[ 'labels' ]; // Extract an object containing display labels for each metric.
  var history = data[ 'history' ]; // Extract an object containing historical data points for each graph.
  var history_length = data[ 'history_length' ]; // Get the total length of the historical data array.
  var options_list = data[ 'flot_options' ]; // Extract Flot plotting options for each graph.
  var column = data[ 'index' ]; // Identify which column the update pertains to.

  // Loop through each predefined metric key.
  for ( var i = 0; i < keys.length; i++ ) {
    var key = keys[ i ]; // Get the current metric key.
    var values = history[ key ]; // Retrieve the data points for the current key.
    var label = labels[ key ]; // Retrieve the display label for the current key.
    var options = options_list[ key ]; // Retrieve the specific Flot options for the current key.

    // Call `update_graph` to refresh the plot and its associated value display.
    update_graph( column, key, values, label, history_length, options );
  }
};


/**
 * @function update_graph
 * @param {number} col - The column index where the graph is located.
 * @param {string} key - The unique key identifying the specific graph to update.
 * @param {Array} values - An array of data points to plot on the graph.
 * @param {string} label - The text label to display alongside the graph (often the latest value).
 * @param {number} history_length - The number of data points in the `values` array.
 * @param {Object} options - Configuration options for the Flot plotting library.
 * @description Updates a specific graph using Flot and refreshes its corresponding value display.
 */
var update_graph = function ( col, key, values, label, history_length, options ) {
  // Update the plot using the jQuery Flot library.
  var css_id = '#plot-' + col + '-' + key; // Construct the CSS selector for the target plot div.
  $.plot( $( css_id ), values, options ); // Call Flot's plot function to redraw the graph.

  // Update the text content of the associated value display element.
  var value = document.getElementById( 'value-' + key ); // Get the value display div by its ID.
  value.innerHTML = label; // Set its inner HTML to the provided label.
  // The following lines are commented out, but were present in the original for reference.
  // value.innerHTML = label + "<br>" + values[history_length-1][1];
  // value.innerHTML = "<br>" + values[history_length-1][1];
};


// This block of code executes automatically once the Document Object Model (DOM) is fully loaded.
// It leverages jQuery's shorthand for `$(document).ready()`.
$( function ( ) {
  // First, initialize all the static dashboard elements.
  init_all( );

  // Instantiate a new STOMP client object to handle WebSocket communication.
  stomp = new STOMPClient( );

  // Define the callback function to be executed when the STOMP connection is successfully opened.
  stomp.onopen = function ( ) {
    // Currently, no specific actions are performed upon connection open, beyond establishing it.
  };

  // Define the callback for when the STOMP connection is closed.
  // It alerts the user with the connection closure code.
  stomp.onclose = function ( c ) {
    alert( 'Lost Connection, Code: ' + c );
  };

  // Define the callback for general STOMP errors.
  stomp.onerror = function ( error ) {
    alert( "Error: " + error );
  };

  // Define the callback for when an error frame is received from the STOMP server.
  stomp.onerrorframe = function ( frame ) {
    alert( "Error: " + frame.body );
  };

  // Define the callback for when a 'CONNECTED' frame is received, indicating a successful login/connection.
  stomp.onconnectedframe = function ( ) {
    stomp.subscribe( "/topic/graph" ); // Subscribe to the '/topic/graph' destination to receive updates.
  };

  // Define the callback for when a message frame is received from the STOMP server.
  stomp.onmessageframe = function ( frame ) {
    update_all( frame.body ); // Process the received message body to update the dashboard.
  };

  // Establish the actual connection to the STOMP server running on localhost at port 61613.
  stomp.connect( 'localhost', 61613 );
} );