/*
 * This is a Type I clone of the original JavaScript module.
 * All functional aspects, variable names, and expressions
 * are identical. Only whitespace and comments have been altered
 * to create a visually distinct but logically equivalent version.
 */
( function () {

  'use strict'; // Enforces stricter parsing and error handling in the code.

  // Define the main Angular module for Chart.js integration.
  var chartjs = angular.module( 'chartjs', [] )
    ,

    // Map of chart types to their Chart.js constructor names.
    // This object helps in dynamically creating directives for each chart type.
    chartTypes = {

      line:      'Line'     ,
      bar:       'Bar'      ,
      radar:     'Radar'    ,
      polar:     'PolarArea',
      pie:       'Pie'      ,
      doughnut:  'Doughnut'

    }
    ,

    /*
     * Helper function to generate an Angular directive for a given chart type.
     * Each directive will be named 'cjs[ChartType]' (e.g., 'cjsLine', 'cjsBar').
     */
    makeChartDirective = function ( chartType ) {

      // Capitalize the first letter of the chart type for directive naming.
      var upper = chartType.charAt( 0 ).toUpperCase() + chartType.slice( 1 );

      // Register the new directive with the 'chartjs' module.
      chartjs.directive( 'cjs' + upper, [ 'ChartFactory' , function ( ChartFactory ) {

        // The directive simply returns an instance of the ChartFactory, configured for this chart type.
        return new ChartFactory( chartType );

      } ] );

    }
  ; // End of initial variable declarations.


  /*
   * Loop through all defined chart types and create a directive for each.
   * This automates the creation of cjsLine, cjsBar, etc. directives.
   */
  for ( var c in chartTypes ) {

    makeChartDirective( c ); // Call the helper to create the directive.

  }


  /*
   * Define the ChartFactory service. This factory generates the directive definition object
   * for specific Chart.js chart types.
   */
  chartjs.factory( 'ChartFactory' , function () {

    // The factory returns a function that, when called with a chartType,
    // produces the actual directive definition object.
    return function ( chartType ) {

      // Map the provided chartType (e.g., 'line') to the Chart.js constructor name (e.g., 'Line').
      chartType = chartTypes[ chartType ];

      /*
       * Internal helper function to extract specific options from an attrs object,
       * based on the keys present in a default options object.
       * This allows directive attributes to override Chart.js options.
       */
      var extractSpecOpts = function ( opts , attrs ) {
          var extracted = {} , // Object to store extracted options.
              k              , // Loop variable for option keys.
              c              ; // Variable to hold attribute value.

          for ( k in opts ) { // Iterate over default options keys.

            c = attrs[ k ]; // Get the value from directive attributes.

            // If the attribute exists (is not undefined), add it to the extracted options.
            if ( typeof( c ) !== 'undefined' ) {

              extracted[ k ] = c;

            }

          }

          return extracted; // Return the object of extracted options.

        }
      ; // End of extractSpecOpts definition.


      // If the chartType is not recognized, return early.
      if ( typeof( chartType ) === 'undefined' ) {
        return;
      }


      // Return the Angular directive definition object.
      return {

        restrict: 'EAC'                                                                                       , // Can be used as an element, attribute, or class.
        template: '<div><canvas class="cjs-chart"></canvas><legend class="cjs-legend"></legend></div>' , // The HTML template for the directive.
        replace: true                                                                                         , // Replace the original directive element with this template.
        scope: {                                                                                              , // Isolate scope for the directive.
          dataset: '=' , // Two-way binding for chart data.
          options: '='   // Two-way binding for chart options.
        }                                                                                                     ,

        /*
         * The link function is where the Chart.js instance is created and managed.
         * It handles initialization, data updates, and options updates.
         */
        link: function postLink ( scope , element , attrs ) {

          var ctx       = element[ 0 ].children[ 0 ].getContext( '2d' ) , // Get the 2D rendering context of the canvas.
              chart     = new Chart( ctx )                              , // Initialize a new Chart.js instance.
              chartOpts = {}                                            ; // Object to hold merged chart options.

          // Merge global Chart.js defaults and type-specific defaults into chartOpts.
          angular.extend(

            chartOpts               ,
            Chart.defaults.global   ,
            Chart.defaults[ chartType ]

          );

          // Merge user-defined options from scope.options and directive attributes into chartOpts.
          angular.extend(

            chartOpts                     ,
            scope.options                 ,
            extractSpecOpts(

              chartOpts ,
              attrs

            )

          );

          // Create the chart using the specified type, dataset, and merged options.
          chart = chart[ chartType ]( scope.dataset , chartOpts );

          // Generate and display the chart legend.
          element[ 0 ].children[ 1 ].innerHTML = chart.generateLegend();


          // Watch for changes in the 'dataset' and re-initialize the chart if data changes.
          scope.$watch( 'dataset' , function ( newData , oldData ) {

            chart.initialize( newData ); // Re-initialize the chart with new data.

          } , true ); // Deep watch for changes within the dataset object.


          // Watch for changes in the 'options' and extend the chart's options if they change.
          scope.$watch( 'options' , function ( newData , oldData ) {

            angular.extend(

              chart.options , // Update the existing chart options.
              scope.options

            );

          } , true ); // Deep watch for changes within the options object.

        } // End of link function.

      }; // End of directive definition object.

    }; // End of ChartFactory return function.

  } ); // End of ChartFactory definition.

} )(); // Immediately invoked function expression (IIFE) ends.