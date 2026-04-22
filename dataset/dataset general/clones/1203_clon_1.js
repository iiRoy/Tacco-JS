// This JavaScript code defines two Shiny bindings:
// one for Google Charts output and another for a chart editor input.
// It ensures that Google Charts can be rendered dynamically
// and that chart editor interactions can be captured.

jQuery(document).ready(function () {

  // --- Google Chart Output Binding Definition ---
  // This binding handles the rendering of Google Charts on the client side.
  var googleChartOutputBinding = new Shiny.OutputBinding();

  // Extend the base output binding with custom methods for Google Charts.
  jQuery.extend(googleChartOutputBinding, {

    // The 'find' method identifies elements that this binding should manage.
    find: function (scope) {
      // It looks for any element with the class 'shinyGoogleChart'.
      return jQuery('.shinyGoogleChart');
    },

    // The 'getId' method retrieves the unique ID of a bound element.
    getId: function (el) {
      return jQuery(el).attr('id');
    },

    // The core 'renderValue' method, responsible for drawing the chart.
    renderValue: function (el, data) {
      // Internal function to be called once Google Charts library is loaded.
      function googleLoaded () {
        // Parse the data labels from the server-provided JSON.
        var dataLabels = JSON.parse(data.dataLabels);
        // Create a new Google Visualization DataTable.
        var chartData = new google.visualization.DataTable();

        // Iterate over data labels to add columns to the data table.
        jQuery.each(dataLabels, function (i, obj) {
          chartData.addColumn(obj, i); // Add column with type and label.
        });

        // Add the actual chart data rows, parsed from JSON.
        chartData.addRows(JSON.parse(data.dataJSON));

        // Create a new ChartWrapper for flexible chart configuration.
        // Note: 'wrapper' is intentionally global here as in original code snippet.
        wrapper = new google.visualization.ChartWrapper({
          // The data table for the chart.
          dataTable: chartData,
          // The DOM element ID where the chart will be rendered.
          containerId: jQuery(el).attr('id'),
          // The type of chart to display (e.g., 'ColumnChart', 'PieChart').
          chartType: data.chartType,
          // Chart options, parsed from JSON string.
          options: JSON.parse(data.options)
        });

        // Draw the chart using the configured wrapper.
        wrapper.draw();
        // Store the chart wrapper instance with the element for future reference.
        jQuery(el).data('chart', wrapper);
      }; // End of googleLoaded function.

      // Load the Google Visualization API, version 1.
      // Specify a callback function to run once the API is ready.
      // Also, include the 'charteditor' package.
      google.load("visualization", "1", { "callback": googleLoaded, "packages": "charteditor" });
    }, // End of renderValue.

    // 'renderError' is called if an error occurs during rendering.
    renderError: function (el, err) {
      // Currently, this method is left empty, providing no specific error handling UI.
    },

    // 'clearError' is called to clear any previously displayed errors.
    clearError: function (el) {
      // This method is also currently empty.
    }
  }); // End of $.extend for googleChartOutputBinding.

  // Register the custom Google Chart output binding with Shiny.
  Shiny.outputBindings.register(googleChartOutputBinding);


  // --- Chart Editor Input Binding Definition ---
  // This binding allows Shiny to capture input from a chart editor component.
  // ---------------------------------------------
  var chartEditorInputBinding = new Shiny.InputBinding();

  // Extend the input binding with custom methods.
  jQuery.extend(chartEditorInputBinding, {

    // The 'find' method identifies elements that represent a chart editor input.
    find: function (scope) {
      // It looks for any element with the class 'chartEditor'.
      return jQuery('.chartEditor');
    },

    // The 'getValue' method extracts the current value from the input element.
    getValue: function (el) {
      // It returns an object containing the chart type and options from element attributes.
      return { chartType: jQuery(el).attr('chartType'), options: jQuery(el).attr('options') };
    },

    // The 'setValue' method is used to programmatically set the value of the input.
    setValue: function (el, value) {
      // This method is currently empty, meaning the input's value isn't set externally.
    },

    // The 'subscribe' method sets up event listeners to detect changes in the input.
    subscribe: function (el, callback) {
      // It listens for a 'change' event specific to this binding.
      jQuery(el).on("change.chartEditorInputBinding", function (e) {
        callback(); // Call the Shiny callback when a change occurs.
      });
    },

    // The 'unsubscribe' method removes event listeners.
    unsubscribe: function (el) {
      // It removes all event handlers associated with this specific binding namespace.
      jQuery(el).off(".chartEditorInputBinding");
    }
  }); // End of $.extend for chartEditorInputBinding.

  // Register the custom Chart Editor input binding with Shiny.
  Shiny.inputBindings.register(chartEditorInputBinding);

}); // End of $(document).ready function.