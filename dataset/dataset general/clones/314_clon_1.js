var main=  function ($) {
	// --- Global control variable for numbering elements ---
	var nControl =0;


	// --- Document ready function to initialize all handlers ---
	$( function()
	{
		setGuidesHandler(); // Initialize guide toggling
			setAddRowHandler(); // Set up adding new rows
		setControlsHandler(); // Configure draggable controls
				setupDefaultWidth(); // Set up the default width slider
		setSelectHandler(); // Handle selection of elements
			setDeleteHandler(); // Enable deletion of selected elements
	} );


	/**
	 * @function setGuidesHandler
	 * @description Toggles visibility of layout guides in the main form.
	 *              Adds or removes the 'show-guides' class based on checkbox state.
	 */
	var setGuidesHandler = function ()
	{
		$( '.guides' )
			.click( function ( event )
			{
			// Check if the 'guides' checkbox is currently checked
			if ( $( this ).is( ':checked' ) )
			{
				// If checked, add the class to display guides
				$( '.main-panel form' )
					.addClass( 'show-guides' );
			}
			else
			{
				// If unchecked, remove the class to hide guides
				$( '.main-panel form' )
					.removeClass( 'show-guides' );
			}
		} );
	};


	/**
	 * @function setAddRowHandler
	 * @description Handles the click event for adding new rows to the form.
	 *              New rows are sortable containers for controls.
	 */
	var setAddRowHandler = function ( ) {
		$( '.add-row' ).click( function ( event )
		{
			// Create a new div element with class 'row'
			var newRow = $( '<div class="row"></div>' );

			// Append the new row to the main form panel
			$( '.main-panel form' ).append( newRow );

			// Options for the sortable functionality of the new row
			var options =
			{
				'accept': '.control', // Only accept elements with class 'control'
				'connectWith': '.row', // Allow connecting with other rows for sorting
				'placeholder': 'placeholder', // Placeholder class for drag-and-drop
				'stop': function ( event, ui )
				{
					// This function executes when an item is dropped into the row
					var item = $( ui.item[0] );
					var width = getDefaultWidth(); // Get the default column width
					nControl++; // Increment the control counter for unique IDs

					var newItem; // Variable to hold the HTML for the new control

					// Determine which type of control was dropped
					switch ( item.attr( 'data-control' ) )
					{
						case 'input':
							newItem = '<div class="col col-' + width + '">';
							newItem += '<label for="control_' + nControl + '">Label ' + nControl + '</label>';
							newItem += '<input type="text" id="control_' + nControl + '" placeholder="" name="control_' + nControl + '">';
							newItem += '</div>';
							break;

						case 'textarea':
							newItem = '<div class="col col-' + width + '">';
							newItem += '<label for="control_' + nControl + '">Label ' + nControl + '</label>';
							newItem += '<textarea id="control_' + nControl + '" placeholder="" rows="3" name="control_' + nControl + '"></textarea>';
							newItem += '</div>';
							break;

						case 'select':
							newItem = '<div class="col col-' + width + '">';
							newItem += '<label for="control_' + nControl + '">Label ' + nControl + '</label>';
							newItem += '<select id="control_' + nControl + '">';
							newItem += '<option value="1">Option 1</option>';
							newItem += '<option value="2">Option 2</option>';
							newItem += '</textarea>'; // NOTE: This seems like a typo, should probably be '</select>'
							newItem += '</div>';
							break;

						case 'selectmultiple':
							newItem = '<div class="col col-' + width + '">';
							newItem += '<label for="control_' + nControl + '">Label ' + nControl + '</label>';
							newItem += '<select id="control_' + nControl + '" multiple="multiple">';
							newItem += '<option value="1">Option 1</option>';
							newItem += '<option value="2">Option 2</option>';
							newItem += '</select>';
							newItem += '</div>';
							break;

						case 'checklist':
							newItem = '<div class="col col-' + width + '">';
							newItem += '<div class="checkbox">';
							newItem += '<label>';
							newItem += '<input type="checkbox" value="">';
							newItem += 'Label A';
							newItem += '</label>';
							newItem += '</div>';
							newItem += '<div class="checkbox">';
							newItem += '<label>';
							newItem += '<input type="checkbox" value="">';
							newItem += 'Label B';
							newItem += '</label>';
							newItem += '</div>';
							newItem += '</div>';
							break;

						case 'radiolist':
							newItem = '<div class="col col-' + width + '">';
							newItem += '<div class="radio">';
							newItem += '<label>';
							newItem += '<input type="radio" value="">';
							newItem += 'Label A';
							newItem += '</label>';
							newItem += '</div>';
							newItem += '<div class="radio">';
							newItem += '<label>';
							newItem += '<input type="radio" value="">';
							newItem += 'Label B';
							newItem += '</label>';
							newItem += '</div>';
							newItem += '</div>';
							break;

						default:
							// If the control type is not recognized, do nothing.
							// This acts as a silent failure for unknown controls.
							return false;
					}

					// Replace the draggable helper item with the actual new control HTML
					item.replaceWith( newItem );
				}
			};

			// Make the newly created row sortable with the defined options
			$( newRow ).sortable( options );
		} );
	};


	/**
	 * @function setControlsHandler
	 * @description Makes the control elements draggable.
	 */
	var setControlsHandler = function ( )
	{
		var options =
		{
			revert: 'invalid', // Revert draggable if not dropped on a valid target
			helper: 'clone', // Create a clone for dragging, leave original in place
			connectToSortable: '.row' // Allow dragging into elements with class 'row'
		};
		// Apply draggable functionality to all elements with class 'control'
		$( '.control' ).draggable( options );
	};


	/**
	 * @function setupDefaultWidth
	 * @description Initializes the slider for setting the default width of new columns.
	 */
	var setupDefaultWidth = function ( ) {
		var options =
		{
			'min': 1, // Minimum width value
			'max': 12, // Maximum width value (Bootstrap grid system)
			'value': 12 // Default starting width
		};
		// Initialize the slider on the element with ID 'default-width'
		$( '#default-width' ).slider( options );
	};


	/**
	 * @function getDefaultWidth
	 * @description Retrieves the current value from the default width slider.
	 * @returns {number} The current default width.
	 */
	var getDefaultWidth = function ( ) {
		return $( '#default-width' ).slider( 'value' );
	};


	/**
	 * @function setSelectHandler
	 * @description Handles selection and deselection of form elements (columns and rows).
	 *              Highlights selected elements and enables the delete button.
	 */
	var setSelectHandler = function ( ) {
		// Event handler for clicking on columns or rows within the main form
		$( '.main-panel form' ).on( 'click', '.col, .row', function ( event )
		{
			// Remove 'selected' class from all currently selected elements
			$( '.col, .row' ).removeClass( 'selected' );
			// Add 'selected' class to the clicked element
			$( this ).addClass( 'selected' );
			// Enable the delete item button
			$( '.delete-item' ).attr( 'disabled', false );
			// Update the properties panel based on the new selection
			updateProperties();
			// Stop event propagation to prevent parent handlers from being triggered
			event.stopPropagation();
		} );

		// Event handler for clicking anywhere in the main panel (to deselect)
		$( '.main-panel' ).on( 'click', function ( event )
		{
			// Remove 'selected' class from all columns and rows
			$( '.col, .row' ).removeClass( 'selected' );
			// Disable the delete item button
			$( '.delete-item' ).attr( 'disabled', true );
			// Update the properties panel (which will hide it if nothing is selected)
			updateProperties();
		} );
	};


	/**
	 * @function setDeleteHandler
	 * @description Handles the click event for deleting selected form elements.
	 */
	var setDeleteHandler = function ( ) {
		$( '.delete-item' ).click( function ( event )
		{
			// Remove the currently selected element(s) from the DOM
			$( '.selected' ).remove();
			// Update the properties panel (will hide it as nothing is selected anymore)
			updateProperties();
		} );
	};


	/**
	 * @function updateProperties
	 * @description Updates the properties panel based on the currently selected form element.
	 *              Provides fields to modify ID, width, and label of the selected element.
	 */
	var updateProperties = function ( ) {
		var selected = $( '.col.selected' ); // Get the currently selected column

		// Check if any column is currently selected
		if ( selected.length )
		{
			selected = $( selected[0] ); // Ensure we're working with a single selected element (the first one)

			// Clear any previously displayed properties
			$( '.properties' ).html( '' );


			// --- Add Id handler ---
			var id = selected.find( 'label' ).attr( 'for' ); // Get the 'for' attribute of the label
			// Append ID input field to properties panel
			$( '.properties' ).append( '<label>Id</label><input type="text" value="' + id + '" id="properties-id">' );
			// Bind event handler for changes to the ID input field
			$( '#properties-id' ).bind( 'input propertychange', function ( event )
			{
				var value = $( this ).val(); // Get the new ID value
				selected.find( 'label' ).attr( 'for', value ); // Update label's 'for' attribute
				selected.find( 'input[type=text]' ).attr( 'id', value ); // Update text input's ID
				selected.find( 'input[type=text]' ).attr( 'name', value ); // Update text input's name
				selected.find( 'textarea' ).attr( 'id', value ); // Update textarea's ID
				selected.find( 'textarea' ).attr( 'name', value ); // Update textarea's name
			} );


			// --- Add Width handler ---
			var classes = selected.attr( 'class' ).split( /\s+/ ); // Get all classes as an array
			// Find the column class (e.g., 'col-12')
			var columnClass = _.find( classes, function ( item )
			{
				return item.match( /^col\-[0-9]+$/ );
			} );
			// Extract the numeric width value
			var width = parseInt( columnClass.match( /^col\-([0-9]+)$/ )[1] );
			// Append Width input field to properties panel
			$( '.properties' ).append( '<label>Width (1-12)</label><input type="text" value="' + width + '" id="properties-width">' );
			// Bind event handler for changes to the Width input field
			$( '#properties-width' ).bind( 'input propertychange', function ( event )
			{
				var value = parseInt( $( this ).val() ); // Get the new width value
				// Validate the width value
				if ( value >= 1 && value <= 12 )
				{
					// Remove all existing 'col-' classes
					_.each( _.range( 1, 13 ), function ( element )
					{
						selected.removeClass( 'col-' + element );
					} );
					console.log( width ); // Log the old width (might be a debugging remnant)
					selected.addClass( 'col-' + value ); // Add the new 'col-' class
				}
			} );


			// --- Add Label handler ---
			var label = selected.find( 'label' ).text(); // Get the current label text
			// Append Label input field to properties panel
			$( '.properties' ).append( '<label>Label</label><input type="text" value="' + label + '" id="properties-label">' );
			// Bind event handler for changes to the Label input field
			$( '#properties-label' ).bind( 'input propertychange', function ( event )
			{
				var value = $( this ).val(); // Get the new label text
				selected.find( 'label' ).text( value ); // Update the label text
			} );


			// Show the properties panel and its title
			$( '.properties, .properties-title' ).show();
		}
		else
		{
			// If nothing is selected, hide the properties panel and its title
			$( '.properties, .properties-title' ).hide();
		}
	};


	// Public API for the 'main' module
	return {
		'getDefaultWidth': getDefaultWidth // Expose the getDefaultWidth function
	};

} ( window.jQuery ); // Pass jQuery object to the main function


/**
 * @function formhtml
 * @description Retrieves the HTML content of the form element.
 * @returns {string} The inner HTML of the element with ID 'form'.
 */
function formhtml( )
{
	return ( $( '#form' ).html() );
};