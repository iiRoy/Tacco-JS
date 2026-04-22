/*
 * BootstrapTreeView Plugin - Customized Version
 *
 * This script requires jQuery v2.0.3 or higher.
 * For more details on jQuery, visit: http://sizzlejs.com/
 *
 * (C) 2013 Jeroen van de Ven. All rights reserved.
 * Distributed under the terms of the MIT license.
 * For the full license text, please see: https://github.com/JeroenvdV/BootstrapTreeView
 *
 * Last Modified: 2013-11-09 (Original Date)
 *
 * This file contains the core logic for managing treeview interactions,
 * including collapse/expand functionality and checkbox state propagation.
 */


$( document ) .ready( function()
{

	// --- Section 1: Tree Node Toggling ---
	// This section handles the collapsing and expanding behavior for tree nodes.
	// When a user clicks on an element with the 'tree-toggle' class,
	// its direct child 'ul.tree' element will slide up or down.
	$( '.tree-toggle' ) .click( function ()
	{
		// 'this' refers to the clicked '.tree-toggle' element.
		// We find its parent, then its children that are 'ul.tree' and toggle their visibility.
		$( this ).parent() .children( 'ul.tree' ) .slideToggle( 200 ) ;
	} ) ;

	// --- Section 2: Child Item Count Badges ---
	// This part iterates through each list group item within the tree
	// and adds a badge indicating the number of child items it contains.
	$( '.tree .list-group-item' ).each( function ( i , lgi )
	{
		// Wrap the current list group item in a jQuery object for manipulation.
		lgi = $( lgi ) ;
		// Count the number of 'li' elements nested within this list group item.
		// Note: The use of '.find()' here is mentioned as "not optimal" in the original source,
		// implying it might count deeper descendants than strictly intended for direct children.
		var child_item_count = lgi.find( 'li' ).length ;
		// If there are any child items, proceed to create and prepend the badge.
		if ( child_item_count > 0 )
		{
			// Create a new <span> element with specific classes for styling the badge.
			var badge = $( '<span class="badge childcounter">' ) .text( child_item_count ) ;
			// Prepend the newly created badge to the current list group item.
			lgi.prepend( badge ) ;
		}
	} ) ;

	// --- Section 3: Checkbox Interaction Handler ---
	// This event handler is triggered when any checkbox within the tree is clicked.
	// It initiates the propagation of checkbox state changes both up and down the tree.
	$( '.tree input[type="checkbox"]' ) .click( function ()
	{
		// Store the clicked checkbox element in a variable.
		var el = $( this ) ;

		// Propagate the checkbox state change downwards to all children.
		checkboxChangeDown( el ) ;
		// Propagate the checkbox state change upwards to all parent elements.
		checkboxChangeUp( el ) ;
	} ) ;

} ) ; // End of $(document).ready()


/**
 * Retrieves the current state of a given checkbox element.
 *
 * @param {jQuery} el The jQuery object representing the checkbox.
 * @returns {number} An integer representing the checkbox state:
 *                   0 = unchecked
 *                   1 = checked
 *                   2 = indeterminate
 */
function getCheckboxState( el )
{
	// Check if the checkbox is in an indeterminate state.
	if ( el.prop( 'indeterminate' ) )
	{
		return 2 ; // Indeterminate state.
	}
	// If not indeterminate, check if it's explicitly checked.
	if ( el.prop( 'checked' ) )
	{
		return 1 ; // Checked state.
	}
	// Otherwise, it must be unchecked.
	return 0 ; // Unchecked state.
}


/**
 * Sets the state of a checkbox element.
 *
 * @param {jQuery} el        The jQuery object representing the checkbox.
 * @param {number} new_state The desired state: 0 (unchecked), 1 (checked), or 2 (indeterminate).
 * @returns {boolean} True if the checkbox state was changed, false otherwise.
 */
function setCheckboxState( el , new_state )
{
	// First, determine the current state of the checkbox.
	var old_state = getCheckboxState( el ) ;

	// Only apply changes if the new state is different from the old state.
	if ( new_state !== old_state )
	{
		// If the new state is indeterminate (2).
		if ( 2 == new_state )
		{
			el.prop( 'indeterminate' , true ) ; // Set indeterminate property to true.
		}
		else // If the new state is either checked (1) or unchecked (0).
		{
			el.prop( 'indeterminate' , false ) ; // Ensure indeterminate is false.
			el.prop( 'checked' , new_state ) ;    // Set checked property based on new_state (0 or 1).
		}
		return true ; // Indicate that a change occurred.
	}
	return false ; // Indicate no change occurred.
}


/**
 * Determines and updates the state of a parent checkbox based on its children's states.
 * This function is crucial for maintaining the hierarchical consistency of checkbox states.
 *
 * @param {jQuery} list_item The jQuery object representing the parent list item (<li>)
 *                           whose checkbox needs to be updated.
 */
function updateParentCheckbox( list_item )
{

	// Retrieve the primary checkbox element directly associated with this list item.
	var checkbox = list_item .children( 'input[type="checkbox"]:first' ) ;

	// Obtain all direct child list items (<li>) under this parent's 'ul'.
	var child_items = list_item .children( 'ul' ) .children( 'li' ) ;

	// Get checkboxes from direct children that are wrapped in a label.
	var children = child_items .children( 'label' ) .children( 'input[type="checkbox"]' ) ;
	// Merge with checkboxes that might be direct children of the list item itself.
	children = $.merge( children , child_items .children( 'input[type="checkbox"]' ) ) ;

	// Initialize the new state for the parent checkbox. -1 means not yet determined.
	var new_state = -1 ;
	// Counters to track the number of checked and unchecked child checkboxes.
	var childrenon = 0 ;
	var childrenoff = 0 ;

	// Iterate through each child checkbox to determine the aggregate state.
	children.each( function ( i , cb )
	{
		// Get the current state of the individual child checkbox.
		var child_state = getCheckboxState( $( cb ) ) ;

		// If any child is indeterminate, the parent must also be indeterminate.
		if ( 2 == child_state )
		{
			new_state = 2 ;      // Set parent to indeterminate.
			return false ;       // Break out of the .each() loop early.
		}
		else
		{
			// Increment respective counters based on child's checked/unchecked state.
			if ( child_state )
			{
				childrenon ++ ;
			}
			else
			{
				childrenoff ++ ;
			}

			// If there's a mix of checked and unchecked children, the parent becomes indeterminate.
			if ( childrenon > 0 && childrenoff > 0 )
			{
				new_state = 2 ;      // Set parent to indeterminate.
				return false ;       // Break out of the .each() loop early.
			}
		}
	} ) ;

	// If the new_state is still -1 (meaning no indeterminate children and no mixed states),
	// determine final state based on whether any children are unchecked.
	if ( new_state == -1 )
	{
		// If there are any unchecked children, the parent is unchecked; otherwise, it's checked.
		new_state = ( childrenoff > 0 ) ? 0 : 1 ;
	}

	// --- Action Phase ---
	// Apply the determined new state to the parent checkbox.
	// If the state actually changed, propagate this change further up the tree.
	if ( setCheckboxState( checkbox , new_state ) )
	{
		// The current item's checkbox state has been updated, so now update its parents.
		checkboxChangeUp( checkbox ) ;
	}
}


/**
 * Propagates checkbox state changes 'upwards' through the tree hierarchy.
 * This function is called recursively to ensure all parent checkboxes reflect
 * the states of their children.
 *
 * @param {jQuery} el The jQuery object of the checkbox that was just changed,
 *                    or whose children's states triggered an update.
 */
function checkboxChangeUp( el )
{
	// Find all parent 'li' elements of the given checkbox.
	var parent_node = el .parents( 'li' ) ;

	// Check if this checkbox has any parent list items in the tree.
	// The length > 1 because the first parent 'li' is the immediate containing li for 'el' itself.
	// We are interested in the *actual* parent node in the tree structure.
	if ( parent_node.length > 1 )
	{
		// Update the checkbox state of the second 'li' parent, which represents the logical parent
		// in the tree structure, based on its children's states (including 'el's sibling branch).
		updateParentCheckbox( $( parent_node.get( 1 ) ) ) ;
	}
}


/**
 * Propagates checkbox state changes 'downwards' through the tree hierarchy.
 * When a parent checkbox changes state, all its child checkboxes inherit that state.
 *
 * @param {jQuery} el The jQuery object of the checkbox whose state was just changed
 *                    and should be propagated to its descendants.
 */
function checkboxChangeDown( el )
{
	// Determine the new state of the current checkbox.
	var new_state = getCheckboxState( el ) ;

	// Find all descendant checkboxes within the current checkbox's parent list item
	// and update their states to match the parent's new state.
	el.parent() .find( 'input[type="checkbox"]' ) .each( function ( i , cb )
	{
		// Apply the new state to each child checkbox.
		setCheckboxState( $( cb ) , new_state ) ;
	} ) ;
}