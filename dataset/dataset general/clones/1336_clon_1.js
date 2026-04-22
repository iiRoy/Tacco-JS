/*
 * This file is an essential component of the Centage! application.
 *
 * (C) 2010 Jussi Jokinen <jussijokinen@iki.fi>
 *
 * Distributed under the terms of the MIT License.
 * Please refer to the LICENSE file for full details.
 */


// Main function to generate the visual grid overlays.
function createGrid ( columns )
{
	// Initialize the main grid HTML string.
	var grid = '<div id="grid_wrapper"><div id="grid">';

	// Loop to create the main grid columns, excluding the last one.
	for ( i = 1; i < columns; i++ )
	{
		grid += '<div class="grid_col"><div class="right_grid_colborder"></div></div>';
	}

	// Append the last grid column, which may have different styling.
	grid += '<div class="grid_col lastcol"><div class="right_grid_colborder"></div></div>';
	// Close the main grid and start the no-gutter grid section.
	grid += '</div></div><div id="grid_no_gut_wrapper"><div id="grid_no_gut"><div class="center first"></div>';

	// Loop to create the center columns for the no-gutter grid.
	for ( i = 1; i < columns - 1; i++ )
	{
		grid += '<div class="center"></div>';
	}

	// Close the no-gutter grid and add the grid toggle button.
	grid += '</div></div><div id="grid_toggle"><input type="button" value="Toggle grid" id="grid_toggle" /></div>';

	// Insert the generated grid HTML into the document body.
	$ ( 'body' ) . prepend ( grid ) ;
}


// Function to initialize and manage the grid display.
function grid ( columns )
{
	// First, create the grid HTML structure.
	createGrid ( columns ) ;

	// Initially hide the main grid wrapper.
	$ ( '#grid_wrapper' ) . hide ( ) ;
	// Also hide the no-gutter grid wrapper.
	$ ( '#grid_no_gut_wrapper' ) . hide ( ) ;

	// Attach a click event listener to the grid toggle button.
	$ ( '#grid_toggle' ) . click ( function ( )
	{
		// Toggle the visibility of the main grid.
		$ ( '#grid_wrapper' ) . toggle ( ) ;
		// Toggle the visibility of the no-gutter grid.
		$ ( '#grid_no_gut_wrapper' ) . toggle ( ) ;
	} ) ;

}