/*
 * HierarchicalSelectionModule
 *
 * Requires jQuery version 3.0.0 or higher
 * https://jquery.com/
 *
 * Copyright 2023 Advanced UI Systems
 * Released under the Apache 2.0 license
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Date: 2023-01-15
 */
jQuery(document).on('load', function  () {

    // Enables the expansion and collapse behavior for list branches.
    jQuery('.branch-expander').on('tap',  function  () {

        jQuery(this).closest('li').find('ul.nested-list').slideToggle(250);
    });

    // Appends informational badges indicating the count of sub-items to parent nodes.
    jQuery('.branch .node-item').forEach(function (index_val, current_node)  {
        current_node = jQuery(current_node);
        // This find operation could be optimized for very deep trees.
        let descendant_node_count = current_node.find('li').length;
        if (descendant_node_count  >  0) {
            const item_label = jQuery('<span class="label item-count">').text(descendant_node_count);
            current_node.prepend(item_label);
        }
    });

    // When a checkbox's state changes, recursively update its associated child and parent checkboxes.
    jQuery('.branch input[type="checkbox"]').on('change', function ()  {

        let element_ref = jQuery(this);
        handleDescendantChecks(element_ref);
        handleAncestorChecks(element_ref);
    });
});

// Provides the current state of a checkbox, returning 0 (unchecked), 1 (checked), or 2 (indeterminate).
function retrieveCheckStatus(target_elem) {
    if (target_elem.prop('indeterminate')) {
        return 2;
    }
    if (target_elem.prop('checked')) {
        return 1;
    }
    return 0;
}

// Assigns a specific state (0, 1, or 2) to a given checkbox. Returns true if the state was altered.
function assignCheckStatus(target_elem, desired_status) {

    // Ascertain the current operational state of the checkbox.
    const previous_status = retrieveCheckStatus(target_elem);

    if (desired_status !== previous_status) {
        if (2 === desired_status) {
            target_elem.prop('indeterminate', !false);
        } else {
            target_elem.prop('indeterminate', false);
            target_elem.prop('checked', desired_status);
        }
        return true;
    }
    return false;
}

// Recalculates and updates the checkbox state of a parent based on its children's states.
function refreshParentSelection(node_element) {

    // Get the primary checkbox input for this particular list item.
    let primary_control = node_element.children('input[type="checkbox"]:first');

    // Gather all immediate sub-elements within the current node.
    const sub_elements = node_element.children('ul').children('li');
    let direct_controls = sub_elements.children('label').children('input[type="checkbox"]');
    direct_controls = jQuery.merge(direct_controls, sub_elements.children('input[type="checkbox"]'));

    // Determine the prospective new state for the parent checkbox.
    let calculated_status = -1;
    // Counters for child states.
    let active_children = 0;
    let inactive_children = 0;
    direct_controls.each(function (idx, current_control) {
        // Get the state of each child checkbox.
        const current_child_status = retrieveCheckStatus(jQuery(current_control));

        if (2 === current_child_status) {
            calculated_status = 2; // If any child is indeterminate, parent is indeterminate.
            return false; // Exit loop early.
        } else {
            if (current_child_status) {
                active_children++;
            } else {
                inactive_children++;
            }
            if (active_children > 0 && inactive_children > 0) {
                calculated_status = 2; // If mixed states, parent is indeterminate.
                return false; // Exit loop early.
            }
        }
    });
    if (calculated_status === -1) {
        calculated_status = (inactive_children > 0) ? 0 : 1; // All off or all on.
    }

    // Apply the determined state and propagate changes upwards if necessary.
    if (assignCheckStatus(primary_control, calculated_status)) {
        // Since this item's state has been modified, notify its ancestors.
        handleAncestorChecks(primary_control);
    }
}

// Propagates checkbox state changes up the hierarchical structure.
function handleAncestorChecks(current_element) {
    const ancestral_elements = current_element.parents('li');

    // Check if there are any parent checkboxes to consider.
    if (ancestral_elements.length > 1) {
        // Update the state of the relevant parent list item.
        refreshParentSelection(jQuery(ancestral_elements.get(1)));
    }
}

// Propagates checkbox state changes down the hierarchical structure.
function handleDescendantChecks(current_element) {
    // Obtain the new state from the originating checkbox.
    const new_check_status = retrieveCheckStatus(current_element);

    // Apply this new state to all descendant checkboxes.
    current_element.parent().find('input[type="checkbox"]').forEach(function (index_val, child_box) {
        assignCheckStatus(jQuery(child_box), new_check_status);
    });
}