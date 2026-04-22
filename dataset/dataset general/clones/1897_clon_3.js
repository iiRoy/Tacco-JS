// Ensure jQuery is loaded and available as 'jq' within this scope.
// This module provides functionality for creating interactive hierarchical views.

(function(jq) {

  // Safeguard: Check if jQuery is properly loaded.
  if (typeof jq === 'undefined') {
    console.error('Hierarchical View plugin: jQuery (jq) not found. Initialization aborted.');
    return;
  }

  /**
   * Initializes a hierarchical view plugin on selected unordered list elements.
   * This plugin enables expand/collapse functionality for nested lists,
   * with options for persistence via cookies and custom styling.
   *
   * @param {object} userConfig - Configuration options for the hierarchical view.
   * @param {string} [userConfig.expandIndicator='&#9660;'] - HTML entity or character displayed for an expanded node.
   * @param {string} [userConfig.collapseIndicator='&#9658;'] - HTML entity or character displayed for a collapsed node.
   * @param {string} [userConfig.initialExpansionState=''] - Defines which paths are expanded upon initialization.
   *     - Use 'all' to expand all branches.
   *     - Use '' to collapse all branches.
   *     - Example: '0/1,2' expands the second child of the first root child, and the third root child.
   * @param {boolean} [userConfig.exclusiveBranching=false] - If true, only one branch can be open at a time within a sibling group.
   * @param {string|number} [userConfig.toggleAnimationDuration='slow'] - Animation speed for expand/collapse actions ('slow', 'fast', 'normal', or milliseconds).
   * @returns {jq} The jQuery object to maintain chainability.
   */
  jq.fn.hierarchicalView = function(userConfig) {

    // Define the base configuration settings for the plugin.
    const defaultConfiguration = {
      expandIndicator          : '&#9660;',        // Unicode for a downward-pointing triangle
      collapseIndicator        : '&#9658;',       // Unicode for a rightward-pointing triangle
      initialExpansionState    : '',             // Default: no paths expanded
      exclusiveBranching       : false,          // Default: multiple branches can be open
      toggleAnimationDuration  : 'slow'          // Default: 'slow' animation speed
    };

    // Merge default settings with any user-provided configurations.
    // Ensure userConfig is a valid object before merging.
    const effectiveConfig = jq.extend(
      {},
      defaultConfiguration,
      typeof userConfig === 'object' && userConfig !== null ? userConfig : {}
    );

    // Check if the jQuery Cookie plugin is available for state persistence.
    const isCookiePluginAvailable = typeof jq.cookie === 'function';

    /**
     * Gathers the currently expanded paths of the hierarchical structure.
     * This state can then be saved, typically to a cookie or data attribute.
     * @this {jq} The root UL element(s) of the hierarchical view.
     */
    jq.fn.storeExpansionState = function() {
      const activeStatePaths = [];
      let currentPathSegments = [];
      let previousDepth = null; // Tracks the depth of the previously processed active node.

      // Locate all toggle elements that are currently in an expanded state.
      const activeBranchToggles = jq(this).find('li > span.branch-toggle.expanded-node');

      // Iterate through each expanded toggle to reconstruct its path.
      activeBranchToggles.each(function() {
        const currentToggle = jq(this);
        const parentListItem = currentToggle.parent('li');
        // Calculate the current depth by counting parent 'ul' elements, adjusting for the root.
        const currentDepth = parentListItem.parents('ul').length - 1;
        // Determine the zero-based index of the current list item among its siblings.
        const siblingIndex = parentListItem.prevAll('li').length;

        // Logic to build the path array based on changes in depth.
        if (previousDepth === null) {
          // This is the first expanded node found.
          currentPathSegments = [siblingIndex];
        } else if (currentDepth < previousDepth) {
          // Moving up in the hierarchy: pop segments until the correct depth, then add current index.
          activeStatePaths.push(currentPathSegments.join('/'));
          const depthDifference = previousDepth - currentDepth;
          currentPathSegments.splice(currentPathSegments.length - depthDifference - 1, depthDifference + 1);
          currentPathSegments.push(siblingIndex);
        } else if (currentDepth === previousDepth) {
          // Staying at the same depth: close previous path, start new one at same level.
          activeStatePaths.push(currentPathSegments.join('/'));
          currentPathSegments.splice(currentPathSegments.length - 1, 1);
          currentPathSegments.push(siblingIndex);
        } else if (currentDepth > previousDepth) {
          // Moving into a deeper level: simply append the current index.
          currentPathSegments.push(siblingIndex);
        }
        previousDepth = currentDepth; // Update the previous depth for the next iteration.
      });

      // Add any remaining path segments after the loop completes.
      if (currentPathSegments.length > 0) {
        activeStatePaths.push(currentPathSegments.join('/'));
      }

      // Determine the key for persistence, falling back to a default if not specified.
      const storageKey = jq(this).data('tree-persist-key') || 'hierarchical-view-state';

      // Attempt to save the state using the jQuery Cookie plugin.
      if (isCookiePluginAvailable) {
        try {
          jq.cookie(storageKey, activeStatePaths.join(','));
        } catch (err) {
          console.warn('Hierarchical View: Failed to save state to cookie.', err);
        }
      } else {
        // As a Type III addition, if cookie plugin isn't present, store state in a data attribute.
        jq(this).data('current-expansion-state', activeStatePaths.join(','));
      }
    };

    /**
     * Recalls and applies the expansion state of the hierarchical view from a persisted source.
     * @this {jq} The root UL element(s) of the hierarchical view.
     */
    jq.fn.recallExpansionState = function() {
      let persistedStateString = null;
      const storageKey = jq(this).data('tree-persist-key') || 'hierarchical-view-state';

      // First, try to retrieve the state from a cookie.
      if (isCookiePluginAvailable) {
        try {
          persistedStateString = jq.cookie(storageKey);
        } catch (err) {
          console.warn('Hierarchical View: Failed to retrieve state from cookie.', err);
        }
      }

      // If no state found in cookie, check the data attribute (Type III fallback).
      if (!persistedStateString) {
          persistedStateString = jq(this).data('current-expansion-state');
      }

      // If no persisted state is found, use the initial configuration setting.
      if (!persistedStateString) {
        persistedStateString = effectiveConfig.initialExpansionState;
      }

      // Process the retrieved expansion pattern.
      if (persistedStateString === 'all') {
        // Expand all branches instantly.
        jq(this).find('span.branch-toggle').revealBranch(0); // Use 0 for no animation
      } else if (persistedStateString) {
        const stateSegments = persistedStateString.split(',');
        // Iterate through each path segment to expand the corresponding branch.
        for (let segmentIdx = 0; segmentIdx < stateSegments.length; segmentIdx++) {
          const segmentPath = stateSegments[segmentIdx].split('/');
          let targetElement = jq(this); // Start traversal from the root UL.

          for (let pathPartIdx = 0; pathPartIdx < segmentPath.length; pathPartIdx++) {
            const childIndex = parseInt(segmentPath[pathPartIdx], 10);

            // Validate the parsed child index.
            if (isNaN(childIndex) || childIndex < 0) {
                console.warn(`Hierarchical View: Skipping invalid path segment '${segmentPath[pathPartIdx]}' in path '${stateSegments[segmentIdx]}'.`);
                break; // Exit inner loop for this malformed path.
            }
            
            // Navigate to the specific list item using its index.
            const nextListItem = targetElement.children('li').eq(childIndex);
            if (nextListItem.length) {
              // If the list item exists, reveal its associated branch.
              nextListItem.children('span.branch-toggle').revealBranch(0); // Instant reveal
              // Move to the child UL for the next part of the path.
              targetElement = nextListItem.children('ul');
            } else {
                console.warn(`Hierarchical View: Path segment '${segmentPath[pathPartIdx]}' led to a non-existent element in path '${stateSegments[segmentIdx]}'.`);
                break; // Stop processing this path if an element is not found.
            }
          }
        }
      }
    };

    /**
     * Expands all collapsible branches within the selected elements.
     * @param {string|number} [durationParam] - Animation speed for expansion. Overrides the global setting.
     * @this {jq} The root UL element(s) or any container element.
     */
    jq.fn.unfoldAllBranches = function(durationParam) {
      // Determine the animation speed, allowing 'none' to mean instant.
      const animationSpeed = (durationParam === 'none') ? 0 : (durationParam === undefined ? effectiveConfig.toggleAnimationDuration : durationParam);

      // Find all currently collapsed branch toggles that are direct children of an 'li'
      // which itself is a direct child of a 'ul' (i.e., top-level toggles within each nested list).
      const topLevelCollapsibleToggles = jq(this).find('ul > li > span.branch-toggle.collapsed-node');

      // Crucial step for proper animation of deeply nested structures:
      // Instantly reveal all nested collapsed toggles to correctly calculate their parent UL's height.
      topLevelCollapsibleToggles.siblings('ul').find('span.branch-toggle.collapsed-node').revealBranch(0);

      // Now, animate the top-level toggles with the specified animation speed.
      topLevelCollapsibleToggles.revealBranch(animationSpeed);
    };

    /**
     * Collapses all expanded branches within the selected elements.
     * @param {string|number} [durationParam] - Animation speed for collapse. Overrides the global setting.
     * @this {jq} The root UL element(s) or any container element.
     */
    jq.fn.foldAllBranches = function(durationParam) {
      const animationSpeed = (durationParam === 'none') ? 0 : (durationParam === undefined ? effectiveConfig.toggleAnimationDuration : durationParam);
      // Find all branch toggles and hide their respective branches.
      jq(this).find('span.branch-toggle').hideBranch(animationSpeed);
    };

    /**
     * Reveals (expands) a specific branch.
     * @param {string|number} [toggleDuration] - Animation speed for this specific toggle action.
     * @this {jq} The branch-toggle element(s) to be revealed.
     */
    jq.fn.revealBranch = function(toggleDuration) {
      // Ensure the element is indeed a branch-toggle.
      if (jq(this).hasClass('branch-toggle')) {
        const animationSpeed = (toggleDuration === undefined) ? effectiveConfig.toggleAnimationDuration : toggleDuration;
        const targetList = jq(this).parent('li').children('ul'); // The nested UL associated with this toggle.

        // Only animate if the target list exists.
        if (targetList.length) {
            targetList.slideDown(animationSpeed, function() {
                // Callback to ensure the display style is cleared after animation, for robustness.
                jq(this).css('display', '');
            });
        }
        // Update the toggle's class and HTML content to reflect its expanded state.
        jq(this).removeClass('collapsed-node').addClass('expanded-node').html(effectiveConfig.expandIndicator);
      }
    };

    /**
     * Hides (collapses) a specific branch.
     * @param {string|number} [toggleDuration] - Animation speed for this specific toggle action.
     * @this {jq} The branch-toggle element(s) to be hidden.
     */
    jq.fn.hideBranch = function(toggleDuration) {
      // Ensure the element is a branch-toggle.
      if (jq(this).hasClass('branch-toggle')) {
        const animationSpeed = (toggleDuration === undefined) ? effectiveConfig.toggleAnimationDuration : toggleDuration;
        const targetList = jq(this).parent('li').children('ul'); // The nested UL associated with this toggle.

        // Only animate if the target list exists.
        if (targetList.length) {
            targetList.slideUp(animationSpeed);
        }
        // Update the toggle's class and HTML content to reflect its collapsed state.
        jq(this).removeClass('expanded-node').addClass('collapsed-node').html(effectiveConfig.collapseIndicator);
      }
    };

    /**
     * Handles the click event for a branch toggle or an associated action button.
     * This function determines the target toggle and performs the appropriate expand/collapse action.
     * @this {jq} The clicked element (either a branch-toggle or a branch-action-button).
     */
    jq.fn.handleToggleAction = function() {
      const triggeredElement = jq(this);
      let targetToggle;

      // Determine which element is the actual toggle.
      if (triggeredElement.hasClass('branch-toggle')) {
        targetToggle = triggeredElement;
      } else if (triggeredElement.hasClass('branch-action-button')) {
        // If an action button was clicked, find its corresponding branch toggle within the same list item.
        targetToggle = triggeredElement.closest('li').children('span.branch-toggle');
      }

      // Proceed only if a valid toggle element was identified.
      if (targetToggle && targetToggle.length) {
        // Toggle the branch's state: if currently expanded, hide it; otherwise, reveal it.
        if (targetToggle.hasClass('expanded-node')) {
          targetToggle.hideBranch(effectiveConfig.toggleAnimationDuration);
        } else {
          targetToggle.revealBranch(effectiveConfig.toggleAnimationDuration);
        }

        // If 'exclusiveBranching' mode is active, collapse all sibling branches.
        if (effectiveConfig.exclusiveBranching) {
          targetToggle.closest('li').siblings('li').children('span.branch-toggle.expanded-node').hideBranch(effectiveConfig.toggleAnimationDuration);
        }
      }
    };

    // Iterate over each selected root UL element to apply the hierarchical view logic.
    const rootElementCount = this.length;
    for (let currentIdx = 0; currentIdx < rootElementCount; currentIdx++) {
      const currentRootUL = jq(this[currentIdx]);

      // Ensure the element is an unordered list and has not been previously initialized.
      if (currentRootUL.prop('tagName') === 'UL' && !currentRootUL.data('hierarchical-view-initialized')) {

        // Mark this UL as initialized to prevent redundant processing.
        currentRootUL.data('hierarchical-view-initialized', true);

        // For each list item that contains a nested UL, prepend a branch toggle.
        currentRootUL.find('li:has(ul)').each(function() {
          const listItem = jq(this);
          // Create the toggle span element.
          const toggleSpan = jq('<span/>', {
            'class': 'branch-toggle collapsed-node',
            'style': 'cursor:pointer;',
            'html': effectiveConfig.collapseIndicator
          });
          listItem.prepend(toggleSpan); // Insert the toggle at the beginning of the list item.
        });

        // Initially, hide all nested unordered lists.
        currentRootUL.find('ul').css('display', 'none');

        // Attempt to restore the previous expansion state from persistence.
        currentRootUL.recallExpansionState();

        // Attach a click event handler to all branch toggles within this hierarchical view.
        currentRootUL.on('click', 'li > span.branch-toggle', function(event) {
          event.stopPropagation(); // Prevent the click event from bubbling up further.
          jq(this).handleToggleAction(); // Execute the toggle action.
          currentRootUL.storeExpansionState(); // Save the updated state.
        });

        // Attach a click event handler for elements designated as 'branch-action-button'.
        currentRootUL.on('click', 'li .branch-action-button', function(event) {
          event.stopPropagation(); // Prevent event bubbling.
          jq(this).handleToggleAction(); // Execute the toggle action.
          currentRootUL.storeExpansionState(); // Save the updated state.
        });

        // Type III Addition: Implement a custom event for external control.
        // This allows other parts of the application to trigger toggle actions programmatically.
        currentRootUL.on('hierarchicalView:toggle', function(event, pathString) {
            console.log(`Hierarchical View: External toggle request received for path: "${pathString}"`);
            if (pathString === 'all') {
                jq(this).unfoldAllBranches();
            } else if (pathString === '') {
                jq(this).foldAllBranches();
            } else if (typeof pathString === 'string' && pathString.includes('/')) {
                // This would require more complex parsing to target specific nodes.
                // For simplicity, we'll just log for now or recall state from this specific pattern.
                // A full implementation would parse pathString into an array and traverse.
                jq(this).recallExpansionState.call(jq(this).data('current-expansion-state', pathString));
            } else {
                console.warn(`Hierarchical View: Unknown or invalid path string for external toggle: "${pathString}"`);
            }
            jq(this).storeExpansionState(); // Ensure state is saved after external command.
        });
      }
    }
    return this; // Preserve jQuery chainability.
  };

})(jQuery);