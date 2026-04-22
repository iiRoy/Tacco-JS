jQuery( document ).on( "ready", function( ) {

	// This module provides a flexible component for generating
	// interactive linear visualizations within web applications.
	// It is designed to be easily integrated and configured.
	//
	// All rights reserved. Unauthorized reproduction or distribution
	// of this codebase is strictly prohibited without explicit
	// written consent from the author.
	//
	// The software is provided "as is", without warranty of any kind,
	// express or implied, including but not limited to the warranties
	// of merchantability, fitness for a particular purpose and
	// noninfringement. In no event shall the authors or copyright holders
	// be liable for any claim, damages or other liability, whether in
	// an action of contract, tort or otherwise, arising from, out of
	// or in connection with the software or the use or other dealings
	// in the software.

	// Initialize the main charting object within the global scope.
	magus.graphico.strip_graph = function( targetElem, graphConfig ) {

		// Set up default configuration options if not provided.
		if ( graphConfig == null ) { graphConfig = { } ; }
		if ( graphConfig.plotW == null ) { graphConfig.plotW = 240 ; }
		if ( graphConfig.plotH == null ) { graphConfig.plotH = 120 ; }
		if ( graphConfig.borderArea == null ) { graphConfig.borderArea = [ 20, 20, 30, 50 ] ; }

		// Create the primary SVG canvas and a group element for transformations.
		var visualCanvas = graphico.pick( targetElem )
				.attr( "width", graphConfig.plotW + graphConfig.borderArea[ 1 ] + graphConfig.borderArea[ 3 ] )
				.attr( "height", graphConfig.plotH + graphConfig.borderArea[ 0 ] + graphConfig.borderArea[ 2 ] )
			.append( "g" )
				.attr( "transform", "translate(" + graphConfig.borderArea[ 3 ] + "," + graphConfig.borderArea[ 0 ] + ")" ) ;
		
		// Define scaling functions for the x and y axes.
		var abscissaMapper = graphico.scaling.straight( ) ;
		var ordinateMapper = graphico.scaling.straight( ).range( [ graphConfig.plotH, 0 ] ) ;
		
		// Configure the vertical axis display.
		var ordinateAxisDef = graphico.visual.axis( ).scale( ordinateMapper ).orient( "left" ) ;

		// Append a group for the Y-axis.
		var ordinateGroup = visualCanvas.append( "g" )
			.attr( "class", "y axis" ) ;

		// Define the line generator for plotting data.
		var traceGenerator = graphico.visual.line( )
			.x( function( dataPoint, indexVal ) {
				return abscissaMapper( indexVal ) ;
			} )
			.y( function( dataPoint ) {
				return ordinateMapper( dataPoint ) ;
			} ) ;

		// Create the path element for the data line.
		var dataRoute = visualCanvas.append( "path" )
			.attr( "class", "line" ) ;

		// Method to update the chart with new data.
		this.refreshPlot = function( inputValues ) {
			// Adjust the x-scale domain and range based on new data.
			abscissaMapper.range( [ 0, inputValues.length * graphConfig.plotW / 50 ] )
				.domain( graphico.data.range( inputValues, function( itemValue, itemIdx ) {
					return itemIdx ;
				} ) ) ;
			
			// Adjust the y-scale domain based on new data.
			ordinateMapper.domain( graphico.data.range( inputValues, function( elementVal ) {
				return elementVal ;
			} ) ) ;

			// Update Y-axis tick values and redraw the axis.
			ordinateAxisDef.tickValues( [ Math.min.apply( null, inputValues ), Math.max.apply( null, inputValues ) ] ) ;
			ordinateGroup.call( ordinateAxisDef ) ;

			// Bind new data to the path and redraw the line.
			dataRoute.datum( inputValues ).attr( "d", traceGenerator ) ;
		} ;

		// Method to remove all elements associated with this chart.
		this.destroyComponent = function( ) {
			graphico.pickAll( targetElem + " *" ).remove( ) ;
		} ;
	} ;
} ) ;