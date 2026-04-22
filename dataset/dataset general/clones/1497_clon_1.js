// This module is designed to display a hierarchical data structure as an interactive heatmap.
// The input data is expected to be a tree-like structure where each node contains:
//  - a 'label' for display
//  - an array of 'values' (numeric data points)
//  - an optional 'children' array for sub-nodes (absent for leaf nodes)
//
// The visualization structure resembles a matrix:
//   +-------------------------------------------------------------------------+
//   |                                 Root Node                               |
//   +-------------------------------------+-----------------------------------+
//   |             Child 1.1             |            Child 1.2              |
//   +-----------+-----------+-----------+-----------+-----------+-----------+
//   | Leaf 2.1  | Leaf 2.2  | Leaf 2.3  | Leaf 2.4  | Leaf 2.5  | Leaf 2.6  |
//   +-----------+-----------+-----------+-----------+-----------+-----------+
//
// The 'createTreeHeatmap' function acts as the primary factory for generating the heatmap visualization.
// It takes a DOM element, the root of the data tree, and an options object.
//
// Parameters:
//  - domElement: The target HTML element where the SVG chart will be appended.
//  - root_node: The top-level node of the data tree. Each node in the tree must have:
//               - label: A string to be shown in the cell.
//               - values: An array of numbers. The 'value_index' option selects which value to use.
//               - children: An array of child nodes, or `undefined` if it's a leaf.
//  - opts: An object containing configuration parameters:
//          - title: (String) The main title for the entire chart.
//          - depth: (Number) Maximum tree depth to render. Must be >= 1.
//          - value_index: (Number) Specifies which element from the 'values' array to display. Default is 0.
//          - unit: (String) Defines the unit type for displayed values: 'NONE', 'CURRENCY', or 'PERCENT'.
//          - max_cell_width: (Number, optional) Sets an upper limit for the width of individual leaf cells.
//                            If not provided, cells will expand to fill available space.
//          - click_handler: (Function) A callback triggered on cell interaction.
//                           Signature: `function(is_drill_down, hit_node)`
//                             - `is_drill_down`: `true` for single click, `false` for double click.
//                             - `hit_node`: The data node associated with the clicked cell.
//
function createTreeHeatmap ( domElement , root_node , opts ) {

	var constants = null ,
			chart = null ;


	function initialize_constants ( ) {
		// Define various constant values used throughout the heatmap rendering process.
		constants = {

			units: { 'NONE':0 , 'CURRENCY':1 , 'PERCENT':2 } ,

			// Spacing between adjacent heatmap cells.
			cell_margin: { h:3 , v:2 } ,

			// Predefined heights for header rows at different levels.
			// These values represent the inner height, excluding margins.
			header_heights: [ 71 , 53 , 41 , 41 ] ,

			// Default height for the lowest-level (leaf) cells.
			default_leaf_height: 40 ,

			// Font sizes for header cells and leaf cells.
			fonts: {
				heatmap: [ 21 , 18 , 13 , 13 , 10 ] ,
				legend:  "13px" ,
			} ,

			// Color palettes for cell backgrounds and text.
			colors: {
				leaf_cell_bg:   [ '#c5f2bc' , '#78c875' , '#2d9234' , '#005b01' , '#005b01' ] ,
				leaf_cell_txt:  [ '#383628' , '#383628' , '#fff' ,    '#fff' ,    '#fff' ] ,
				header_cell_bg: [ '#063256' , '#10527e' , '#1a72a5' , '#1a72a5' ,   '#1a72a5' ]
			} ,

			// Y-coordinates for the top edge of each header row.
			header_y_pos: [ ] ,

			// D3.js formatter for currency values.
			currency_formatter: d3.format( ',' ) ,

		} ;

		// Adjust header heights to include vertical margins.
		constants.header_heights = _.map( constants.header_heights , function ( h ) { return h + 2 * constants.cell_margin.v ; } ) ;

		// Adjust default leaf cell height to include vertical margins.
		constants.default_leaf_height += 2 * constants.cell_margin.v ;

		// Calculate the cumulative Y positions for each header row.
		constants.header_y_pos = [ 0 ] ;
		_.each( constants.header_heights , function ( height , index ) {
			constants.header_y_pos.push( constants.header_y_pos[ index ] + height ) ;
		} ) ;

		// Diagnostic logging (commented out by default)
		// console.log("Constants initialized:", constants);
	}


	function initialize ( domElement , root_node , opts ) {
		// Ensure options object is not null/undefined.
		opts = opts || { } ;

		// Basic validation for required parameters.
		if ( domElement === undefined || domElement === null )
			return ;
		if ( root_node === undefined || root_node === null )
			return ;

		// console.log("Incoming options:", opts);

		// Determine the available rendering dimensions from the DOM element.
		var chart_width  = $ ( domElement ) . width ( ) ,
			chart_height = $ ( domElement ) . height ( ) ;

		// Set up the application's constant values.
		initialize_constants ( ) ;

		// Initialize the main chart configuration object.
		chart = {
			// Reference to the SVG element that will hold the visualization.
			svg: null ,

			// Overall dimensions of the chart area.
			total_width: chart_width ,
			total_height: chart_height ,

			// Chart's main title, if provided.
			title: opts.title || '' ,

			// The root of the data tree being visualized.
			root_node: root_node ,

			// The maximum hierarchical depth to render.
			desired_max_depth: opts.depth || 1 ,

			// The specific index within a node's 'values' array to use.
			value_index: opts.value_index || 0 ,

			// The unit of measurement for displayed values.
			unit: constants.units[ opts.unit ] ,

			// Maximum allowed width for a single leaf cell.
			max_cell_width: opts.max_cell_width || chart_width ,

			// Function to call when a cell is interacted with.
			click_handler: opts.click_handler ,
		} ;

		// Default the unit to CURRENCY if it was not explicitly set or recognized.
		if ( chart.unit === undefined ) {
			chart.unit = constants.units.CURRENCY ;
		}

		// Calculate the top margin, accounting for title presence and legend space.
		chart.top_margin = ( chart.title ? 50 : 0 ) + 30 ; // 50 for title+bottom margin, 30 for legend

		// Create the main SVG container for the heatmap within the specified DOM element.
		chart.svg = d3.select ( domElement )
			.append ( "svg:svg" )
			.attr ( "width" ,  chart.total_width )
			.attr ( "height" , chart.total_height )
			.attr ( "class" , "tree-heatmap" ) ;
	}



	/*
	 * This function orchestrates the data transformation required for rendering the heatmap.
	 * Its primary role is to construct the 'chart.rows' array, which is a tabular representation
	 * of the tree, directly consumable by the rendering functions.
	 */
	function prepare_chart ( ) {

		var leaf_breath_pos = -1 , // Tracks the horizontal position for leaf nodes
			id = 0 ,             // Unique ID counter for cells
			min_leaf_value = null ,
			max_leaf_value = null ;


		chart.rows = [ ] ;
		chart.num_max_colspan = 1 ;		// Maximum number of columns in any row
		chart.leaf_width = 0 ;			// Calculated width of a single leaf cell
		chart.leaf_height = 0 ;			// Calculated height of a single leaf cell


		// Recursively calculates the total colspan for a given node.
		// A node's colspan is the sum of its children's colspans, or 1 if it's a leaf.
		function calc_colspan ( node , level ) {
			if ( node === null || level + 1 >= chart.max_depth )
				return 1 ;
			return _.reduce ( node.children , function ( n , child ) { return n + calc_colspan ( child , level + 1 ) ; } , 0 ) ;
		}

		// Creates a data object for a single cell in the heatmap grid.
		function node_data ( node , level ) {
			var is_leaf = ( level === chart.max_depth ) ;
			var o = {
					id:				id++ ,
					node:			node ,
					empty:			node === null ,
					level:			level ,
					leaf:			is_leaf ,
					colspan:		calc_colspan ( node , level ) ,
					value:			node === null ? 0 : node.values[ chart.value_index ] ,
				} ;

			// Track the global min/max values among all leaf nodes for color scaling.
			if ( is_leaf ) {
				if ( min_leaf_value === null || o.value < min_leaf_value )
					min_leaf_value = o.value ;

				if ( max_leaf_value === null || o.value > max_leaf_value )
					max_leaf_value = o.value ;
			}

			return o ;
		}


		// Generates an array representing an empty row of leaf cells.
		function create_empty_leaf_row ( ) {
			var a = [ ] ;
			_.times ( chart.num_max_colspan , function ( i ) {
				a.push ( { empty:true , colspan:1 , leaf:true } ) ;
			} ) ;
			return a ;
		}


		/*
		 * This function recursively traverses the tree (depth-first) to build the 'chart.rows' array.
		 * Each level of the hierarchy generally corresponds to a row in 'chart.rows'.
		 * Leaf nodes, however, are handled specially: they are placed in rows *below* their parent's level.
		 */
		function process_node ( node , level ) {
			var children , row_index = level ;

			// Ensure the current row exists in the 'chart.rows' array.
			if ( row_index >= chart.rows.length )
				chart.rows.push ( [ ] ) ;

			// Add the current node's data to its corresponding row.
			chart.rows[ row_index ] . push ( node_data ( node , level ) ) ;

			// Special handling for nodes at the level just above the leaves.
			// Their children (the actual leaves) will be placed in subsequent rows.
			if ( level === chart.max_depth - 1 ) {
				row_index++ ;
				leaf_breath_pos++ ; // Increment horizontal position for leaf cells.

				// Get children, ensuring it's an array (even if empty or null).
				children = node.children || [ null ] ;

				// Iterate through children and place each one in its own leaf row.
				_.each ( children , function ( child , index ) {

					// Create new row if necessary for the current leaf.
					if ( row_index + index >= chart.rows.length )
						chart.rows.push ( create_empty_leaf_row ( ) ) ;

					// Generate data object for the leaf child.
					var data = node_data ( child , level + 1 ) ;

					// Place the leaf child's data at the computed position.
					chart.rows[ row_index + index ] [ leaf_breath_pos ] = data ;
				} ) ;
			}

			// If not a leaf-parent, continue recursion for regular children.
			else if ( node.children !== undefined ) {
				_.each ( node.children , function ( child ) { process_node ( child , level + 1 ) ; } ) ;
			}
		}

		// Iterates through all cells in `chart.rows` and assigns `row_index` and `col_index` properties.
		function add_row_col_indexes ( ) {
			_.each ( chart.rows , function ( row , row_index ) {
				var x = 0 ;
				_.each ( row , function ( cell ) {
					cell.row_index = row_index ;
					cell.col_index = x ;
					x += cell.colspan ;
				} ) ;
			} ) ;
		}


		// Calculates the total height occupied by all header rows.
		function calc_headers_height ( ) {
			return _.reduce (
				_.first ( constants.header_heights , chart.num_headers ) ,
				function ( total , height ) { return total + height ; } ,
				0
			) ;
		}

		// Determines the optimal height for individual leaf cells.
		function calc_leaf_height ( ) {
			var leaf_height = ( chart.total_height - chart.top_margin - chart.headers_height ) / ( chart.rows.length - chart.num_headers ) ;

			// Ensure leaf height doesn't exceed the default or become too small.
			return leaf_height > constants.default_leaf_height ? constants.default_leaf_height : leaf_height ;
		}


		// Recursively computes the maximum depth of the given node's subtree.
		function calc_max_depth ( node ) {
			if ( node.children === undefined )
				return 0 ;
			else
				return 1 + _.reduce ( node.children , function ( depth , child ) { return Math.max ( depth , calc_max_depth ( child ) ) ; } , 0 ) ;
		}


		// Determine the actual max depth to render, clamped by user's desired depth.
		chart.max_depth = Math.min ( calc_max_depth ( chart.root_node ) , chart.desired_max_depth ) ;

		// Calculate the maximum number of columns required for any row.
		chart.num_max_colspan = calc_colspan ( chart.root_node , 0 ) ;

		// The number of header rows is equal to the max depth.
		chart.num_headers = chart.max_depth ;

		// Compute the total vertical space consumed by header rows.
		chart.headers_height = calc_headers_height ( ) ;

		// Populate the 'chart.rows' array by traversing the data tree.
		process_node ( chart.root_node , 0 ) ;

		// Add row and column index properties to each cell for positioning.
		add_row_col_indexes ( ) ;

		// Calculate the effective width of a single leaf cell.
		chart.leaf_width = Math.min ( chart.max_cell_width , chart.total_width / chart.num_max_colspan ) ;

		// Calculate the effective height of a single leaf cell.
		chart.leaf_height = calc_leaf_height ( ) ;

		// Determine if there's enough space to display text within leaf cells.
		chart.show_leaf_text = ( chart.leaf_height - 2 * constants.cell_margin.v ) >= 12 ;

	 	// Recalculate legend values based on the observed min/max leaf values.
	 	update_legend_values ( min_leaf_value , max_leaf_value ) ;

		// console.log("Chart data prepared:", chart);
	}


	/*
	 * This function establishes the quartile boundaries for leaf cell values,
	 * which directly influences their assigned heatmap colors.
	 */
	function update_legend_values ( min_value , max_value ) {
		// Ensure min_value is not positive, to correctly handle negative ranges.
		min_value = Math.min ( 0 , min_value ) ;
		// Divide the value range into four equal steps.
		var step = ( max_value - min_value ) / 4 ;
		// Store the calculated boundaries for the legend.
		chart.legend_values = [ Math.round ( min_value + step ) , Math.round ( min_value + 2 * step ) , Math.round ( min_value + 3 * step ) ] ;
	}


	/*
	 * This function is responsible for rendering the chart's legend.
	 * It creates colored boxes and corresponding labels to explain the heatmap's color scale.
	 */
	function build_legend ( ) {
		var glegend ,
			box_size = 14 ,      // Size of the color swatch square
			box_margin = 4 ,     // Space between color swatch and its label
			item_margin = 10 ;   // Space between legend items


		// Helper function to format a value as a percentage.
		function pc ( value ) {
			return d3.round ( value * 100 / chart.root_node.values[ chart.value_index ] , 1 ) + '%' ;
		}

		// Helper function to format a value as currency.
		function currency ( value ) {
			return constants.currency_formatter ( value ) ;
		}

		// Dynamically generates the text labels for the legend items.
		function create_labels ( ) {
			var labels , x ,
				separator = '―' , // A horizontal bar character for ranges
				values = _.map ( chart.legend_values , function ( value ) { return value ; } ) ;

			// Choose formatting based on the chart's unit type.
			if ( chart.unit === constants.units.PERCENT ) {
				labels = [
					'< ' + pc ( values[ 0 ] ) ,
					pc ( values[ 0 ] ) + separator + pc ( chart.legend_values[ 1 ] ) ,
					pc ( values[ 1 ] ) + separator + pc ( chart.legend_values[ 2 ] ) ,
					'> ' + pc ( values[ 2 ] )
				] ;
			}
			else {
				labels = [
					'< ' + currency ( values[ 0 ] ) ,
					currency ( values[ 0 ] ) + separator + currency ( values[ 1 ] ) ,
					currency ( values[ 1 ] ) + separator + currency ( values[ 2 ] ) ,
					'> ' + currency ( values[ 2 ] )
				] ;
			}

			x = 0 ; // X-position accumulator for legend items.
			labels = _.map ( labels , function ( label ) {
				// Rough estimation of label width (consider replacing with actual text measurement).
				var w = label.length * 8 ,
					o = { txt:label , width:w , x:x } ;

				// Update x for the next legend item.
				x += box_size + box_margin + w + item_margin ;

				return o ;
			} ) ;

			return labels ;
		}


		// Remove any existing legend group before rebuilding.
		glegend = chart.container.selectAll ( 'g.legend' ) ;
		glegend.remove ( ) ;

		// Select or create the main legend group element.
		glegend = chart.container.selectAll ( 'g.legend' ) . data ( [ 1 ] ) ;
		glegend.enter ( )
				.append ( 'g' )
				.attr ( 'class' , 'legend' )
				.attr ( 'transform' , 'translate(6,50)' ) ; // Position the legend.


		// Create individual legend items (color swatch + label).
		var glegend_item = glegend.selectAll ( 'g.item' ) . data ( create_labels ( ) ) ;

		var glegitemEnter = glegend_item
			.enter ( )
				.append ( 'g' )
				.attr ( 'class' , 'item' ) ;

		// Append the colored rectangle for each legend item.
		glegitemEnter.append ( 'rect' )
			.attr ( "x" ,      function ( d , i ) { return d.x ; } )
			.attr ( 'y' ,      0 )
			.attr ( 'width' ,  box_size )
			.attr ( 'height' , box_size )
			.attr ( 'fill' ,   function ( d , i ) { return constants.colors.leaf_cell_bg[ i ] ; } )
			.attr ( "rx" ,     3 ) // Rounded corners
			.attr ( "ry" ,     3 ) ;

		// Append the text label for each legend item.
		glegitemEnter.append ( 'text' )
			.text ( function ( d ) { return d.txt ; } )
			.attr ( "font-size" , constants.fonts.legend )
			.attr ( "fill" ,      '#333' )
			.attr ( "x" ,         function ( d , i ) { return d.x + box_size + box_margin ; } )
			.attr ( "y" , 11 ) ; // Vertical alignment for text.
	}



	/*
	 * These helper functions determine the visual properties of each cell
	 * (position, size, styling) based on its data and chart configuration.
	 */
	function cell_x ( d ) {
		// Calculate the X-coordinate, including horizontal margin.
		return ( d.col_index * chart.leaf_width ) + constants.cell_margin.h ;
	}

	function cell_y ( d ) {
		var y ;
		// Y-coordinate depends on whether it's a header or a leaf cell.
		if ( !d.leaf )
			y = constants.header_y_pos[ d.row_index ] ;
		else
			// Leaf cells are positioned below headers, relative to their row index.
			y = constants.header_y_pos[ chart.num_headers ] + ( d.row_index - chart.num_headers ) * chart.leaf_height ;

		return y + constants.cell_margin.v ; // Add vertical margin.
	}

	function cell_width ( d ) {
		// Calculate cell width based on colspan and subtract margins.
		return ( d.colspan * chart.leaf_width ) - 2 * constants.cell_margin.h ;
	}

	function cell_height ( d ) {
		// Calculate cell height, differentiating between headers and leaves, then subtract margins.
		return ( !d.leaf ? constants.header_heights[ d.row_index ] : chart.leaf_height ) - 2 * constants.cell_margin.v ;
	}

	function cell_class ( d ) {
		// Assign CSS classes for styling.
		return d.leaf ? 'cell leaf' : 'cell' ;
	}

	function cell_font_size ( d ) {
		// Determine font size based on cell type and hierarchy level.
		return !d.leaf ? constants.fonts.heatmap[ d.row_index ] : constants.fonts.heatmap[ 3 ] ;
	}

	function cell_opacity ( d ) {
		// Control text opacity, especially for very small leaf cells or 'NONE' unit.
		return d.leaf && ( !chart.show_leaf_text || chart.unit === constants.units.NONE ) ? 0 : 1 ;
	}

	function cell_value_text ( d ) {
		// Format the cell's numeric value for display.
		if ( d.empty )
			return "" ; // Empty cells show no text.
		else if ( chart.unit === constants.units.PERCENT )
			// Format as percentage relative to root node's value.
			return d3.round ( d.value * 100 / chart.root_node.values[ chart.value_index ] , 1 ) + '%' ;
		else
			// Format as currency.
			return constants.currency_formatter ( d3.round ( d.value , 0 ) ) ;
	}


	function cell_rect_fill ( d ) {
		// Determine the background color of the cell's rectangle.
		if ( d.empty ) {
			return "#fff" ; // White for empty cells.
		}
		else if ( d.leaf ) {
			// Leaf cells use a heatmap color scale based on their value.
			if ( d.value < chart.legend_values[ 0 ] )		return constants.colors.leaf_cell_bg[ 0 ] ;
			else if ( d.value < chart.legend_values[ 1 ] )	return constants.colors.leaf_cell_bg[ 1 ] ;
			else if ( d.value < chart.legend_values[ 2 ] )	return constants.colors.leaf_cell_bg[ 2 ] ;
			else 										return constants.colors.leaf_cell_bg[ 3 ] ;
		}
		else {
			// Header cells use a distinct color scheme based on their row index.
			if ( d.row_index === 0 )			return constants.colors.header_cell_bg[ 0 ] ;
			else if ( d.row_index === 1 )		return constants.colors.header_cell_bg[ 1 ] ;
			else if ( d.row_index === 2 )		return constants.colors.header_cell_bg[ 2 ] ;
			else if ( d.row_index === 3 )		return constants.colors.header_cell_bg[ 3 ] ;
		}
	}

	function cell_text_fill ( d ) {
		// Determine the text color for the cell's label.
		if ( d.empty ) {
			return "" ; // No text color for empty cells.
		}
		else if ( d.leaf ) {
			// Leaf cell text color is chosen to contrast with its background.
			if ( d.value < chart.legend_values[ 0 ] )		return constants.colors.leaf_cell_txt[ 0 ] ;
			else if ( d.value < chart.legend_values[ 1 ] )	return constants.colors.leaf_cell_txt[ 1 ] ;
			else if ( d.value < chart.legend_values[ 2 ] )	return constants.colors.leaf_cell_txt[ 2 ] ;
			else 										return constants.colors.leaf_cell_txt[ 3 ] ;