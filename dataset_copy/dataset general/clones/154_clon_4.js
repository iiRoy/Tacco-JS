// This script provides interactive functionality for a hierarchical list structure.
// It enables sections to be expanded/collapsed, displays counts of sub-items,
// and manages the state of associated checkboxes through the hierarchy.

document.addEventListener('DOMContentLoaded', function() {

    // Manage expanding and collapsing of sections
    document.addEventListener('click', function(evt) {
        if (evt.target.matches('.folding-control')) {
            const currentControl = evt.target;
            const targetContainer = currentControl.parentElement.querySelector('.nested-section');
            if (targetContainer) {
                if (targetContainer.classList.contains('is-hidden')) {
                    // Open the section
                    targetContainer.style.maxHeight = targetContainer.scrollHeight + 'px';
                    targetContainer.classList.remove('is-hidden');
                } else {
                    // Close the section
                    // Ensure max-height is explicitly set to current scrollHeight before collapsing
                    targetContainer.style.maxHeight = targetContainer.scrollHeight + 'px';
                    // Force a reflow to ensure the browser applies the current max-height before transitioning
                    void targetContainer.offsetWidth; 
                    targetContainer.style.maxHeight = '0';
                    targetContainer.classList.add('is-hidden');
                }
            }
        }
    });

    // Populate item counters for parent entries
    document.querySelectorAll('.visual-tree .item-entry').forEach(function(entryNode) {
        const tally = entryNode.querySelectorAll('li').length;
        if (tally > 0) {
            const indicatorElement = document.createElement('span');
            indicatorElement.className = 'child-indicator';
            indicatorElement.textContent = tally;
            entryNode.insertBefore(indicatorElement, entryNode.firstChild);
        }
    });

    // Handle checkbox state changes throughout the hierarchy
    document.addEventListener('change', function(evt) {
        if (evt.target.matches('.visual-tree input[type="checkbox"]')) {
            const activatedBox = evt.target;
            propagateDownstream(activatedBox);
            refreshUpstreamStatus(activatedBox);
        }
    });

    // Initialize toggle sections to be hidden and set up transitions
    document.querySelectorAll('.nested-section').forEach(function(section) {
        section.style.maxHeight = '0';
        section.classList.add('is-hidden');
        section.style.overflow = 'hidden';
        section.style.transition = 'max-height 0.2s ease-out'; // Matches 200ms duration
        // After transition to 'open' state, remove max-height to allow dynamic content
        section.addEventListener('transitionend', function handler() {
            if (!section.classList.contains('is-hidden') && section.style.maxHeight !== '0px') {
                section.style.maxHeight = '';
            }
        });
    });
});

// Provides the current state of a checkbox: 'empty', 'full', or 'partial'.
function obtainStatus(inputElement) {
    if (inputElement.indeterminate) {
        return 'partial';
    }
    if (inputElement.checked) {
        return 'full';
    }
    return 'empty';
}

// Sets the state of a checkbox and returns true if its state was changed.
function applyStatus(inputElement, desiredStatus) {
    const priorStatus = obtainStatus(inputElement);

    if (desiredStatus !== priorStatus) {
        if (desiredStatus === 'partial') {
            inputElement.indeterminate = true;
            inputElement.checked = false;
        } else {
            inputElement.indeterminate = false;
            inputElement.checked = (desiredStatus === 'full');
        }
        return true;
    }
    return false;
}

// Propagates a checkbox's state change to all its descendant checkboxes, including itself.
function propagateDownstream(sourceBox) {
    const desiredState = obtainStatus(sourceBox);
    // Select all checkboxes within the closest ancestor <li>, including the sourceBox itself.
    const descendantBoxes = sourceBox.closest('li').querySelectorAll('input[type="checkbox"]');

    descendantBoxes.forEach(currentBox => {
        applyStatus(currentBox, desiredState);
    });
}

// Updates parent checkbox states based on their children's states.
function recalculateParentStatus(parentEntry) {
    const parentSelector = parentEntry.querySelector('input[type="checkbox"]');
    if (!parentSelector) return; // No checkbox in this parent entry

    // Get direct child list items (li elements directly under a ul which is directly under parentEntry)
    const directChildrenLis = parentEntry.querySelector('ul')?.querySelectorAll(':scope > li') || [];

    // Collect all relevant checkboxes from these direct children
    const childCheckboxes = Array.from(directChildrenLis).flatMap(li => {
        // Find checkboxes that are direct children of a label (inside li) OR direct children of li
        return Array.from(li.querySelectorAll(':scope > label > input[type="checkbox"], :scope > input[type="checkbox"]'));
    });

    let fullCount = 0;
    let emptyCount = 0;
    let partialCount = 0;
    let newParentState = 'empty'; // Default

    if (childCheckboxes.length === 0) {
        // Replicates original behavior: if no direct child checkboxes, parent becomes 'full'.
        newParentState = 'full';
    } else {
        for (const childBox of childCheckboxes) {
            const childState = obtainStatus(childBox);
            if (childState === 'partial') {
                newParentState = 'partial';
                break; // Exit early if any child is partial
            } else if (childState === 'full') {
                fullCount++;
            } else { // 'empty'
                emptyCount++;
            }

            if (fullCount > 0 && emptyCount > 0) {
                newParentState = 'partial';
                break; // Exit early if mixed states
            }
        }

        if (newParentState !== 'partial') {
            if (emptyCount > 0) { // Some children are empty, but no full and no partial -> all relevant children are empty
                newParentState = 'empty';
            } else { // All children are full
                newParentState = 'full';
            }
        }
    }

    if (applyStatus(parentSelector, newParentState)) {
        // If this parent's state changed, propagate further up the hierarchy
        refreshUpstreamStatus(parentSelector);
    }
}

// Initiates the upward propagation of checkbox state changes.
function refreshUpstreamStatus(changedSelector) {
    const currentListItem = changedSelector.closest('li');
    // Find the actual parent list item in the tree hierarchy
    // This correctly finds the second ancestor <li> in the chain, mirroring original jQuery logic.
    const immediateParentListItem = currentListItem?.parentElement?.closest('li');

    if (immediateParentListItem) {
        recalculateParentStatus(immediateParentListItem);
    }
}