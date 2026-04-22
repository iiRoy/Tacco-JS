(function () {
  "use strict";

  // Default configuration for the hierarchical selector
  const defaultConfigurationSet = {
    cascadeChecksDownward: true, // When an item is checked, all its descendants are also checked.
    cascadeUnchecksDownward: true, // When an item is unchecked, all its descendants are also unchecked.
    initialDisplayMode: 'default', // Options: 'expand' (all visible), 'collapse' (all hidden), or 'default'.
    exclusiveBranchActivation: false, // If true, only one branch at a time can be open within a given level.
    preSelectedBranches: null, // An array of CSS selectors for branches that should be open initially.
    hideDescendantsOnUncheck: true // If true, descendants are hidden when a parent is unchecked.
  };

  // Class identifiers used for styling and behavior
  const domClassNames = {
    contentHidden: 'content-hidden', // Replaces 'hide'
    toggleIconClosed: 'toggle-sign-closed', // Replaces 'collapsed'
    toggleIconOpen: 'toggle-sign-open', // Replaces 'expanded'
    branchToggleControl: 'branch-toggle-control', // Replaces the generic 'span'
    rootWrapper: 'tree-list-wrapper' // Identifies the primary container
  };

  /**
   * Factory function to create and manage a hierarchical selector instance.
   * @param {HTMLElement} containerElement - The root DOM element containing the tree structure.
   * @param {Object} userConfiguration - User-provided options to override defaults.
   * @returns {Object} An API object with methods to control the tree.
   */
  function createHierarchicalSelector(containerElement, userConfiguration) {
    const mainContainer = containerElement;
    mainContainer.classList.add(domClassNames.rootWrapper);

    const activeConfiguration = Object.assign({}, defaultConfigurationSet, userConfiguration);

    // --- Internal Utility Functions ---

    /**
     * Updates the visual state of a branch toggle icon.
     * @param {HTMLElement} indicatorSpan - The span element acting as the toggle icon.
     * @param {boolean} isCurrentlyExpanded - True if the branch should appear expanded, false otherwise.
     */
    function adjustToggleIcon(indicatorSpan, isCurrentlyExpanded) {
      if (!indicatorSpan) return;
      if (isCurrentlyExpanded) {
        indicatorSpan.classList.remove(domClassNames.toggleIconClosed);
        indicatorSpan.classList.add(domClassNames.toggleIconOpen);
      } else {
        indicatorSpan.classList.remove(domClassNames.toggleIconOpen);
        indicatorSpan.classList.add(domClassNames.toggleIconClosed);
      }
    }

    /**
     * Retrieves the branch toggle span for a given list item.
     * @param {HTMLElement} listItem - The LI element.
     * @returns {HTMLElement|null} The toggle span, or null if not found.
     */
    function getBranchToggleElement(listItem) {
      return listItem.querySelector(`:scope > .${domClassNames.branchToggleControl}`);
    }

    /**
     * Retrieves the direct child UL element of a list item.
     * @param {HTMLElement} listItem - The LI element.
     * @returns {HTMLElement|null} The child UL, or null if not found.
     */
    function getDirectChildGroup(listItem) {
      return listItem.querySelector(':scope > ul');
    }

    /**
     * Recursively sets the checked state for all checkboxes within a parent LI.
     * @param {HTMLElement} parentListItem - The LI element whose descendants will be affected.
     * @param {boolean} targetCheckedState - The desired checked state (true/false).
     */
    function applyDescendantCheckState(parentListItem, targetCheckedState) {
      const descendantCheckboxes = parentListItem.querySelectorAll('input[type="checkbox"]');
      descendantCheckboxes.forEach(cb => {
        cb.checked = targetCheckedState;
      });
    }

    /**
     * Dispatches a custom event from the main container to notify listeners of a change.
     */
    function triggerStateChangeNotification() {
      mainContainer.dispatchEvent(new CustomEvent('item-state-changed', {
        bubbles: true,
        detail: {
          timestamp: new Date().toISOString(),
          source: 'hierarchical-selector'
        }
      }));
    }

    // --- Core Initialization and Event Handlers ---

    /**
     * Initializes the tree's DOM structure by adding toggle controls.
     */
    function prepareDomStructure() {
      const parentListItems = mainContainer.querySelectorAll('li:has(> ul)');
      parentListItems.forEach(li => {
        if (!li.querySelector(`:scope > .${domClassNames.branchToggleControl}`)) {
          const toggleSpan = document.createElement('span');
          toggleSpan.classList.add(domClassNames.branchToggleControl);
          toggleSpan.innerHTML = '&nbsp;'; // Content for styling purposes
          li.prepend(toggleSpan);
        }
      });

      // If cascadeChecksDownward is enabled, ensure initially checked items cascade their state.
      if (activeConfiguration.cascadeChecksDownward) {
        mainContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkedItem => {
          const containingLi = checkedItem.closest('li');
          if (containingLi) {
            applyDescendantCheckState(containingLi, true);
          }
        });
      }
    }

    /**
     * Handles the change event for checkboxes.
     * @param {Event} evt - The DOM event object.
     */
    function handleCheckboxToggled(evt) {
      const changedCheckbox = evt.target;
      if (!changedCheckbox.matches('input[type="checkbox"]')) return;

      const containingLi = changedCheckbox.closest('li');
      if (!containingLi) return;

      const isNowChecked = changedCheckbox.checked;
      const childGroup = getDirectChildGroup(containingLi);
      const branchToggle = getBranchToggleElement(containingLi);

      if (isNowChecked) {
        // Show immediate children of the checked item
        if (childGroup) {
          childGroup.classList.remove(domClassNames.contentHidden);
          adjustToggleIcon(branchToggle, true);
        }

        // Apply check state to descendants and show all their ULs if configured
        if (activeConfiguration.cascadeChecksDownward) {
          applyDescendantCheckState(containingLi, true);
          containingLi.querySelectorAll('ul').forEach(ul => {
            ul.classList.remove(domClassNames.contentHidden);
          });
          containingLi.querySelectorAll(`.${domClassNames.branchToggleControl}`).forEach(span => {
            adjustToggleIcon(span, true);
          });
        }
      } else { // Item was unchecked
        // Apply uncheck state to descendants if configured
        if (activeConfiguration.cascadeUnchecksDownward) {
          applyDescendantCheckState(containingLi, false);
          // Hide all descendants if configured
          if (activeConfiguration.hideDescendantsOnUncheck) {
            containingLi.querySelectorAll('ul').forEach(ul => {
              ul.classList.add(domClassNames.contentHidden);
            });
            containingLi.querySelectorAll(`.${domClassNames.branchToggleControl}`).forEach(span => {
              adjustToggleIcon(span, false);
            });
          }
        }
      }
      triggerStateChangeNotification();
    }

    /**
     * Handles click events on the branch toggle controls.
     * @param {Event} evt - The DOM event object.
     */
    function handleBranchToggleClicked(evt) {
      const clickedToggleSpan = evt.target;
      if (!clickedToggleSpan.matches(`.${domClassNames.branchToggleControl}`)) return;

      const containingLi = clickedToggleSpan.closest('li');
      if (!containingLi) return;

      const childGroup = getDirectChildGroup(containingLi);
      if (!childGroup) return; // No child UL to toggle

      const isCurrentlyOpen = clickedToggleSpan.classList.contains(domClassNames.toggleIconOpen);

      if (isCurrentlyOpen) { // Branch was open, now close it
        childGroup.classList.add(domClassNames.contentHidden);
        adjustToggleIcon(clickedToggleSpan, false);
      } else { // Branch was closed, now open it
        if (activeConfiguration.exclusiveBranchActivation) {
          // Collapse all sibling branches at the same level
          const siblingListItems = containingLi.parentNode.children;
          Array.from(siblingListItems).forEach(siblingLi => {
            if (siblingLi !== containingLi && siblingLi.tagName === 'LI') {
              const siblingChildGroup = getDirectChildGroup(siblingLi);
              const siblingToggle = getBranchToggleElement(siblingLi);
              if (siblingChildGroup) {
                siblingChildGroup.classList.add(domClassNames.contentHidden);
              }
              if (siblingToggle) {
                adjustToggleIcon(siblingToggle, false);
              }
            }
          });
        }
        childGroup.classList.remove(domClassNames.contentHidden);
        adjustToggleIcon(clickedToggleSpan, true);
      }
    }

    // --- Public API Methods ---

    /**
     * Expands all branches in the tree, making all content visible.
     */
    function revealAllBranches() {
      mainContainer.querySelectorAll('ul').forEach(ul => {
        ul.classList.remove(domClassNames.contentHidden);
      });
      mainContainer.querySelectorAll(`li:has(> ul) > .${domClassNames.branchToggleControl}`).forEach(span => {
        adjustToggleIcon(span, true);
      });
    }

    /**
     * Collapses all branches in the tree, hiding all content.
     */
    function concealAllBranches() {
      mainContainer.querySelectorAll('ul').forEach(ul => {
        ul.classList.add(domClassNames.contentHidden);
      });
      mainContainer.querySelectorAll(`li:has(> ul) > .${domClassNames.branchToggleControl}`).forEach(span => {
        adjustToggleIcon(span, false);
      });
    }

    /**
     * Sets the initial expansion state of the tree based on configuration.
     */
    function setInitialDisplayState() {
      // 1. Hide all descendant ULs first
      mainContainer.querySelectorAll('ul').forEach(ul => {
        ul.classList.add(domClassNames.contentHidden);
      });

      // Helper to ensure an element and its ancestors are expanded
      const expandAncestors = (targetNode) => {
        let current = targetNode;
        while (current && current !== mainContainer) {
          if (current.tagName === 'UL') {
            current.classList.remove(domClassNames.contentHidden);
          }
          if (current.tagName === 'LI') {
            const toggle = getBranchToggleElement(current);
            if (toggle) adjustToggleIcon(toggle, true);
          }
          current = current.parentNode;
        }
      };

      if (activeConfiguration.preSelectedBranches && activeConfiguration.preSelectedBranches.length > 0) {
        const selectedElements = mainContainer.querySelectorAll(activeConfiguration.preSelectedBranches.join(','));
        selectedElements.forEach(el => {
          if (el.tagName === 'LI') {
            const childUl = getDirectChildGroup(el);
            if (childUl) childUl.classList.remove(domClassNames.contentHidden);
          } else if (el.tagName === 'UL') {
            el.classList.remove(domClassNames.contentHidden);
          }
          expandAncestors(el); // Ensure parent branches are also open
        });
      } else {
        // Default: Show immediate children of checked items and their ancestors
        mainContainer.querySelectorAll('li:has(input[type="checkbox"]:checked)').forEach(li => {
          const childUl = getDirectChildGroup(li);
          if (childUl) {
            childUl.classList.remove(domClassNames.contentHidden);
          }
          expandAncestors(li); // Ensure parent branches are also open
        });
      }

      // 3. Final pass to update all toggle icons based on actual visibility
      mainContainer.querySelectorAll(`li:has(> ul)`).forEach(li => {
        const childUl = getDirectChildGroup(li);
        const toggle = getBranchToggleElement(li);
        if (toggle && childUl) {
          adjustToggleIcon(toggle, !childUl.classList.contains(domClassNames.contentHidden));
        }
      });
    }


    /**
     * Checks all checkboxes in the tree.
     */
    function markAllItems() {
      mainContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
      });
      triggerStateChangeNotification();
    }

    /**
     * Unchecks all checkboxes in the tree.
     */
    function unmarkAllItems() {
      mainContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      triggerStateChangeNotification();
    }

    // --- Initialization Sequence ---

    prepareDomStructure();

    // Map initial display mode options to their respective functions
    const initialModeHandlers = {
      'expand': revealAllBranches,
      'collapse': concealAllBranches,
      'default': setInitialDisplayState
    };
    (initialModeHandlers[activeConfiguration.initialDisplayMode] || initialModeHandlers['default'])();

    // Attach delegated event listeners to the main container
    mainContainer.addEventListener('change', handleCheckboxToggled);
    mainContainer.addEventListener('click', handleBranchToggleClicked);

    // Return the public API
    return {
      revealAllBranches: revealAllBranches,
      concealAllBranches: concealAllBranches,
      markAllItems: markAllItems,
      unmarkAllItems: unmarkAllItems
    };
  }

  // Expose the factory function globally for external use
  window.initializeHierarchicalSelector = createHierarchicalSelector;

})();