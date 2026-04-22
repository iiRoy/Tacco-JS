/*
 * This file contains the core logic for the 'angles' module,
 * specifically defining directives for integrating Chart.js
 * into AngularJS applications.
 *
 * It includes the main 'chart' factory function and
 * several convenience directives for specific chart types.
 */

var angles = angular.module( "angles" , [ ] ) ; // Initialize the 'angles' module without dependencies.

// The primary factory function for generating Chart.js directives.
angles.chart = function ( type )
{
  return { // This object defines the directive configuration.
    restrict: "A" , // Restrict the directive to be used as an attribute.
    scope: {         // Define an isolated scope for the directive.
      data: "=" ,    // Two-way binding for chart data.
      options: "=" , // Two-way binding for chart options.
      id: "@" ,      // One-way binding for chart ID.
      width: "=" ,   // Two-way binding for canvas width.
      height: "=" ,  // Two-way binding for canvas height.
      resize: "=" ,  // Two-way binding for resize flag.
      chart: "@" ,   // One-way binding for chart type override.
      segments: "@" ,// One-way binding for segments (e.g., for pie charts).
      responsive: "=" ,// Two-way binding for responsiveness.
      tooltip: "=" , // Two-way binding for tooltip index.
      legend: "="    // Two-way binding for legend display flag.
    } ,

    link: function ( $scope , $elem )
    {
      // Get the 2D rendering context of the canvas element.
      var ctx = $elem[ 0 ].getContext( "2d" ) ;
      var autosize = false ; // Flag to indicate if canvas was autosized.

      // Function to handle canvas sizing based on scope properties or parent element.
      $scope.size = function ( )
      {
        if ( $scope.width <= 0 )
        {
          $elem.width( $elem.parent( ).width( ) ) ; // Set element width to parent's width.
          ctx.canvas.width = $elem.width( ) ;      // Update canvas width.
        }
        else
        {
          ctx.canvas.width = $scope.width || ctx.canvas.width ; // Use scope width or current canvas width.
          autosize = true ;                                    // Mark as autosized.
        }

        if ( $scope.height <= 0 )
        {
          $elem.height( $elem.parent( ).height( ) ) ; // Set element height to parent's height.
          ctx.canvas.height = ctx.canvas.width / 2 ;  // Set canvas height to half of its width.
        }
        else
        {
          ctx.canvas.height = $scope.height || ctx.canvas.height ; // Use scope height or current canvas height.
          autosize = true ;                                     // Mark as autosized.
        }
      } ; // End of $scope.size function.

      // Watch for changes in the 'data' property to re-render the chart.
      $scope.$watch( "data" , function ( newVal , oldVal )
      {
        // If a chart instance already exists, destroy it before creating a new one.
        if ( chartCreated )
        {
          chartCreated.destroy( ) ;
        }

        // Ensure options object exists.
        $scope.options = $scope.options || { } ;

        // If no new data is provided, exit early.
        if ( ! newVal )
        {
          return ;
        }

        // Allow overriding the chart type via the 'chart' attribute.
        if ( $scope.chart )
        {
          type = $scope.chart ;
        }

        // If autosize was triggered, re-apply size and initialize a new Chart object.
        if ( autosize )
        {
          $scope.size( ) ;
          chart = new Chart( ctx ) ;
        } ;

        // Set responsive option based on scope properties.
        if ( $scope.responsive || $scope.resize )
        {
          $scope.options.responsive = true ;
        }

        // Explicitly set responsive option if defined in scope.
        if ( $scope.responsive !== undefined )
        {
          $scope.options.responsive = $scope.responsive ;
        }

        // Create the new chart instance.
        chartCreated = chart[ type ]( $scope.data , $scope.options ) ;
        chartCreated.update( ) ; // Update the chart to reflect new data/options.

        // If legend is enabled, generate and append it.
        if ( $scope.legend )
        {
          angular.element( $elem[ 0 ] ).parent( ).after( chartCreated.generateLegend( ) ) ;
        }
      } , true ) ; // Deep watch for data changes.

      // Watch for changes in the 'tooltip' property to highlight segments.
      $scope.$watch( "tooltip" , function ( newVal , oldVal )
      {
        // Redraw the chart if it exists.
        if ( chartCreated )
        {
          chartCreated.draw( ) ;
        }

        // If tooltip value is undefined or chart has no segments, return.
        if ( newVal === undefined || ! chartCreated.segments )
        {
          return ;
        }

        // Validate the tooltip index.
        if ( ! isFinite( newVal ) || newVal >= chartCreated.segments.length || newVal < 0 )
        {
          return ;
        }

        // Get the active segment, save its state, change color, show tooltip, then restore.
        var activeSegment = chartCreated.segments[ newVal ] ;
        activeSegment.save( ) ;
        activeSegment.fillColor = activeSegment.highlightColor ;
        chartCreated.showTooltip( [ activeSegment ] ) ;
        activeSegment.restore( ) ;
      } , true ) ; // Deep watch for tooltip changes.

      // Initial sizing of the canvas.
      $scope.size( ) ;

      // Initialize a Chart.js object (not the specific chart type yet).
      var chart = new Chart( ctx ) ;
      var chartCreated ; // Variable to hold the actual chart instance once created.
    } // End of link function.
  } ; // End of return object.
} ; // End of angles.chart definition.


/*
 * Helper directives to quickly create specific chart types.
 * These act as aliases for the main angles.chart factory.
 */
angles.directive( "chart" , function ( ) { return angles.chart( ) ; } ) ;
angles.directive( "linechart" , function ( ) { return angles.chart( "Line" ) ; } ) ;
angles.directive( "barchart" , function ( ) { return angles.chart( "Bar" ) ; } ) ;
angles.directive( "radarchart" , function ( ) { return angles.chart( "Radar" ) ; } ) ;
angles.directive( "polarchart" , function ( ) { return angles.chart( "PolarArea" ) ; } ) ;
angles.directive( "piechart" , function ( ) { return angles.chart( "Pie" ) ; } ) ;
angles.directive( "doughnutchart" , function ( ) { return angles.chart( "Doughnut" ) ; } ) ;
angles.directive( "donutchart" , function ( ) { return angles.chart( "Doughnut" ) ; } ) ;