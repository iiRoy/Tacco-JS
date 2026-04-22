/*
 * Hierarchical View Component (HVC)
 *
 * Implemented with jQuery v3.x (or compatible)
 * Leverages standard DOM manipulation and event handling.
 *
 * Copyright 2024 Your Name Here
 * Distributed under the permissive MIT license.
 * Project repository: https://github.com/your-repo/hvc
 *
 * Version: 1.0.0
 * Last Modified: 2024-07-30
 */

// Define some constants for better readability and easier modification.
const ANIMATION_DURATION_MS = 250; // Slightly different duration
const CHECKBOX_STATUS_OFF = 0;
const CHECKBOX_STATUS_ON = 1;
const CHECKBOX_STATUS_INDETERMINATE = 2; // Using original values for simplicity of logic.

// Execute setup routines once the DOM is fully loaded.
jQuery(function($) { // Using jQuery alias and shorthand for document.ready

    // Initialize interactive collapse/expand functionality for tree branches.
    // This handler manages the visibility of child lists.
    $('.js-toggle-branch').on('click', function(evt) {
        evt.preventDefault(); // Prevent default link behavior if applicable
        const triggerElement = $(this);
        // Find the immediate child UL of the parent LI, which represents the sub-tree.
        triggerElement.closest('li').children('.tree-branch-container').slideToggle(ANIMATION_DURATION_MS);
        // Optionally, toggle an icon class here to indicate state
        triggerElement.toggleClass('expanded collapsed');
    });

    // Dynamically add numerical indicators (badges) to parent tree nodes.
    // These badges display the total count of all descendant list items.
    $('.tree-branch-container > .tree-node-item').each(function(idx, listItemElem) {
        const currentListItem = $(listItemElem);
        const allDescendantNodes = currentListItem.find('li.tree-node-item'); // Count all nested list items
        const descendantCount = allDescendantNodes.length;

        // Only add a badge if there are actual descendants.
        if (descendantCount > 0) {
            // Create a new span element for the badge.
            const countBadge = $('<span>').addClass('node-counter-badge node-child-count').text(descendantCount);
            // Insert the badge at the beginning of the list item's content.
            currentListItem.prepend(countBadge);
            // Optionally, add a class to the parent for styling if it has children
            currentListItem.addClass('has-descendants');
        }
    });

    // Attach event listener for changes on all tree checkboxes.
    // This triggers the propagation logic for checkbox states.
    $('.tree-branch-container input.node-toggle-input').on('change', function() { // Using 'change' instead of 'click' for better semantic accuracy
        const changedToggle = $(this);
        if (!changedToggle.length) { // Guard clause: ensure element exists
            console.warn("Attempted to handle change on non-existent toggle.");
            return;
        }
        // Orchestrate the update process: first downwards, then upwards.
        processToggleStateChange(changedToggle);
    });

    // Initial pass to ensure all parent checkboxes reflect their children's state on load.
    // This covers cases where initial states are set server-side.
    $('.tree-branch-container ul').each(function() {
        const parentNode = $(this).closest('li.tree-node-item');
        if (parentNode.length) {
            recalculateAncestorToggle(parentNode);
        }
    });
});

/**
 * Encapsulates the logic for propagating a toggle state change.
 * @param {jQuery} currentToggleElement The jQuery object representing the checkbox that was changed.
 */
function processToggleStateChange(currentToggleElement) {
    propagateStatusDownward(currentToggleElement); // Update all children first
    propagateStatusUpward(currentToggleElement);   // Then update all ancestors
}


/**
 * Retrieves the current logical state of a checkbox.
 * @param {jQuery} targetElement The jQuery object for the checkbox.
 * @returns {number} 0 for unchecked, 1 for checked, 2 for indeterminate.
 */
function retrieveToggleStatus(targetElement) {
    if (!targetElement || !targetElement.length || !targetElement.is('input[type="checkbox"]')) {
        console.error("Invalid element provided to retrieveToggleStatus:", targetElement);
        return CHECKBOX_STATUS_OFF; // Default or error state
    }

    if (targetElement.prop('indeterminate')) {
        return CHECKBOX_STATUS_INDETERMINATE;
    }
    if (targetElement.prop('checked')) {
        return CHECKBOX_STATUS_ON;
    }
    return CHECKBOX_STATUS_OFF;
}

/**
 * Applies a new logical state to a checkbox.
 * @param {jQuery} targetElement The jQuery object for the checkbox.
 * @param {number} desiredState The target state: 0 (off), 1 (on), or 2 (indeterminate).
 * @returns {boolean} True if the state was changed, false otherwise.
 */
function applyToggleStatus(targetElement, desiredState) {
    if (!targetElement || !targetElement.length || !targetElement.is('input[type="checkbox"]')) {
        console.error("Invalid element provided to applyToggleStatus:", targetElement);
        return false;
    }

    const priorState = retrieveToggleStatus(targetElement);

    // Only proceed if the desired state is different from the current state.
    if (desiredState === priorState) {
        return false;
    }

    // Apply the new state based on the desired value.
    switch (desiredState) {
        case CHECKBOX_STATUS_INDETERMINATE:
            targetElement.prop('indeterminate', true).prop('checked', false); // Ensure checked is false when indeterminate
            break;
        case CHECKBOX_STATUS_ON:
            targetElement.prop('indeterminate', false).prop('checked', true);
            break;
        case CHECKBOX_STATUS_OFF:
            targetElement.prop('indeterminate', false).prop('checked', false);
            break;
        default:
            console.warn("Attempted to set an unknown checkbox state:", desiredState);
            return false; // No change for invalid state
    }

    return true; // State successfully modified.
}

/**
 * Recalculates and updates the state of a parent checkbox based on its direct children's states.
 * @param {jQuery} currentNode The jQuery object representing the list item (LI) whose checkbox needs updating.
 */
function recalculateAncestorToggle(currentNode) {
    if (!currentNode || !currentNode.length || !currentNode.is('li.tree-node-item')) {
        console.warn("Invalid node provided for ancestor toggle recalculation:", currentNode);
        return;
    }

    // Locate the primary checkbox within this list item.
    const nodeToggle = currentNode.children('input.node-toggle-input:first');
    if (!nodeToggle.length) {
        // If the node itself doesn't have a checkbox, it can't be updated.
        return;
    }

    // Find all direct descendant checkboxes that are part of the immediate sub-list.
    // This selector targets checkboxes directly inside labels or standalone inputs within child LIs.
    const childToggleElements = currentNode.children('.tree-branch-container').children('li.tree-node-item')
                                      .find('> label > input.node-toggle-input, > input.node-toggle-input');

    if (childToggleElements.length === 0) {
        // No children to influence the parent's state, so it should be unchecked/checked manually.
        // For this scenario, we might want to ensure it's not indeterminate, but not change its checked state automatically.
        // Let's ensure it's not indeterminate if it has no children.
        applyToggleStatus(nodeToggle, retrieveToggleStatus(nodeToggle) === CHECKBOX_STATUS_INDETERMINATE ? CHECKBOX_STATUS_OFF : retrieveToggleStatus(nodeToggle));
        return;
    }

    let activeChildrenCount = 0;
    let inactiveChildrenCount = 0;
    let mixedStateDetected = false;

    // Iterate through all child checkboxes to determine their combined status.
    childToggleElements.each(function() {
        const currentChildStatus = retrieveToggleStatus($(this));

        if (currentChildStatus === CHECKBOX_STATUS_INDETERMINATE) {
            mixedStateDetected = true;
            // Short-circuit: if any child is indeterminate, the parent must also be.
            return false; // Breaks the $.each loop
        } else if (currentChildStatus === CHECKBOX_STATUS_ON) {
            activeChildrenCount++;
        } else { // CHECKBOX_STATUS_OFF
            inactiveChildrenCount++;
        }

        // If both active and inactive children are found, the parent is indeterminate.
        if (activeChildrenCount > 0 && inactiveChildrenCount > 0) {
            mixedStateDetected = true;
            return false; // Breaks the $.each loop
        }
    });

    let computedState;
    if (mixedStateDetected) {
        computedState = CHECKBOX_STATUS_INDETERMINATE;
    } else if (activeChildrenCount > 0) {
        computedState = CHECKBOX_STATUS_ON; // All children are checked.
    } else {
        computedState = CHECKBOX_STATUS_OFF; // All children are unchecked.
    }

    // Apply the determined state to the parent checkbox.
    // If the state changes, propagate this change further up the hierarchy.
    if (applyToggleStatus(nodeToggle, computedState)) {
        // The state of this item's checkbox has changed, so its ancestors also need re-evaluation.
        propagateStatusUpward(nodeToggle);
    }
}

/**
 * Propagates a checkbox state change upwards to parent elements in the hierarchy.
 * @param {jQuery} triggeringToggle The jQuery object for the checkbox that initiated the propagation.
 */
function propagateStatusUpward(triggeringToggle) {
    if (!triggeringToggle || !triggeringToggle.length) {
        console.warn("Invalid triggering toggle for upward propagation.");
        return;
    }

    // Find the immediate parent LI node that contains a UL.
    // This identifies the actual logical parent in the tree structure.
    const immediateParentListItem = triggeringToggle.closest('.tree-node-item').closest('.tree-branch-container').parent('li.tree-node-item');

    // If a valid parent list item is found, update its checkbox state.
    if (immediateParentListItem.length) {
        recalculateAncestorToggle(immediateParentListItem);
    }
}

/**
 * Propagates a checkbox state change downwards to all descendant checkboxes.
 * @param {jQuery} originatingToggle The jQuery object for the checkbox that initiated the propagation.
 */
function propagateStatusDownward(originatingToggle) {
    if (!originatingToggle || !originatingToggle.length) {
        console.warn("Invalid originating toggle for downward propagation.");
        return;
    }

    const targetStatus = retrieveToggleStatus(originatingToggle);

    // Find all descendant checkboxes within the current node's sub-tree.
    // Exclude the originating checkbox itself.
    const descendantToggles = originatingToggle.closest('li.tree-node-item')
                                            .find('.tree-branch-container input.node-toggle-input')
                                            .not(originatingToggle); // Ensure we don't re-process the initiating toggle.

    if (descendantToggles.length === 0) {
        // No descendants to update.
        return;
    }

    // Apply the new state to each descendant checkbox.
    descendantToggles.each(function() {
        applyToggleStatus($(this), targetStatus);
    });
}