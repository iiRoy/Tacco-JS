// This module handles the advanced management and visual presentation of 'anchored' tabs,
// which are special pinned tabs with additional UI behaviors, often referred to as 'ghost tabs'.
tabOperations.initializeGhostTabs = function() {
  // Establish an alias for the main browser window's global object, enhancing readability
  // and allowing for easier refactoring of `gBrowser` references.
  const mainBrowserWindow = gBrowser;

  /**
   * Manages the pinned state of a given tab element, including session storage,
   * bookmark integration, and UI updates.
   * @param {object} currentTab - The DOM element representing the tab to be processed.
   * @param {boolean|null} shouldForce - Explicitly set pinned state (true/false) or null to toggle.
   * @param {boolean} fromSessionRestore - Indicates if this operation is part of a session restore.
   * @param {string|null} associatedBookmarkID - The ID of a corresponding bookmark, if known.
   */
  mainBrowserWindow.affixTab = function(currentTab, shouldForce, fromSessionRestore, associatedBookmarkID) {
    // A helper function to normalize and process the input arguments, ensuring defaults.
    const processInputArgs = (argsArray) => {
      let [tabElement, forcePinState, isRestoring, bookmarkReference] = argsArray;
      if (argsArray.length === 1) { // If only the tab is provided, assume force-pin.
        forcePinState = true;
        isRestoring = false;
      }
      // If forcePinState is null, toggle the current pinned state.
      forcePinState = (forcePinState === null || forcePinState === undefined) ? !tabElement.pinned : forcePinState;
      return { tabElement, forcePinState, isRestoring, bookmarkReference };
    };

    const { tabElement, forcePinState, isRestoring, bookmarkReference } = processInputArgs(arguments);

    // Guard clause: If the tab is already in the desired pinned state, and for pinned tabs,
    // if the bookmark IDs match, then no action is needed.
    if (forcePinState === tabElement.pinned && (!forcePinState || bookmarkReference === tabElement.bookmarkId)) {
      console.debug(`[TabOp] AffixTab: Tab ${tabElement.id} already in target state. Skipping.`);
      return; // Exit early to prevent redundant operations.
    }

    // Aliases for frequently used global services.
    const sessionManager = tabOperations.sessionManager;
    const bookmarkService = PlacesUtils;

    if (!forcePinState) { // Logic for unpinning the tab.
      tabElement.setAttribute("fadein", "true"); // Apply visual fade-in effect.
      tabElement.removeAttribute("pinned"); // Remove the 'pinned' attribute.

      if (!isRestoring && !gPrivateBrowsingUI.privateBrowsingEnabled) {
        // Only interact with bookmarks if not restoring and not in private browsing.
        let tabLocationURI = tabElement.linkedBrowser.currentURI;
        let bookmarkSourceURI;
        try {
          bookmarkSourceURI = bookmarkService.bookmarks.getBookmarkURI(tabElement.bookmarkId);
        } catch (error) {
          console.warn(`[TabOp] Failed to retrieve bookmark URI for unpinning tab ${tabElement.id}: ${error.message}`);
          // Fallback to current URI if bookmark lookup fails.
        }
        const effectiveURIForUntagging = bookmarkSourceURI || tabLocationURI;
        bookmarkService.tagging.untagURI(effectiveURIForUntagging, ["pinned"]);
        this.refreshPinnedTabsDisplay(); // Update the visual display of pinned tabs.
      }
      tabElement.bookmarkId = null; // Clear the associated bookmark ID.

      if (!isRestoring) {
        // Remove pinned state from session storage.
        sessionManager.deleteTabValue(tabElement, "pinned");
        sessionManager.deleteTabValue(tabElement, "bookmarkId");
      }
      // Dispatch custom events to notify other components.
      tabElement.dispatchEvent(new CustomEvent("TabUnpinning", { bubbles: true }));

      const tabStripContainer = this.browserTabContainer;
      tabStripContainer.positionSingleAnchoredTab(tabElement);
      tabStripContainer.recalculateAnchoredTabsPositions();
      tabStripContainer.adjustLayout();

      tabElement.linkedBrowser.documentShell.isApplicationTab = false; // Mark as a regular tab.
      if (tabElement.selected) {
        this.toggleCloseButtonVisibility(true); // Adjust close button visibility.
      }
      tabElement.dispatchEvent(new CustomEvent("TabUnpinned", { bubbles: true }));
      console.info(`[TabOp] Tab ${tabElement.id} has been unpinned.`);
    } else { // Logic for pinning the tab.
      tabElement.setAttribute("pinned", "true"); // Apply the 'pinned' attribute.

      if (!isRestoring && !gPrivateBrowsingUI.privateBrowsingEnabled && browserSettings.getPreference("extensions.tabutils.autoPin", true)) {
        // Auto-tag URI if conditions met.
        const tabLocationURI = tabElement.linkedBrowser.currentURI;
        bookmarkService.tagging.tagURI(tabLocationURI, ["pinned"]);
        this.refreshPinnedTabsDisplay();

        tabElement.bookmarkId = bookmarkService.getItemIdForTaggedURI(tabLocationURI, "pinned");
      } else {
        tabElement.bookmarkId = bookmarkReference; // Use provided bookmark ID or null.
      }

      if (!isRestoring) {
        // Store pinned state in session storage.
        sessionManager.setTabValue(tabElement, "pinned", "true");
        sessionManager.setTabValue(tabElement, "bookmarkId", tabElement.bookmarkId?.toString() || "");
      }
      tabElement.dispatchEvent(new CustomEvent("TabPinning", { bubbles: true }));

      const tabStripContainer = this.browserTabContainer;
      tabStripContainer.positionSingleAnchoredTab(tabElement);
      tabStripContainer.recalculateAnchoredTabsPositions();
      tabStripContainer.applyAnchoredTabStyles();
      tabStripContainer.adjustLayout();

      tabElement.linkedBrowser.documentShell.isApplicationTab = true; // Mark as an application tab.
      if (tabElement.selected) {
        this.toggleCloseButtonVisibility(false); // Adjust close button visibility.
      }
      tabElement.dispatchEvent(new CustomEvent("TabPinned", { bubbles: true }));
      console.info(`[TabOp] Tab ${tabElement.id} has been pinned.`);
    }
  };

  // Simplified wrapper for unpinning a tab.
  mainBrowserWindow.releaseTab = function(targetTabElement) {
    console.debug(`[TabOp] Attempting to release tab ${targetTabElement.id} via wrapper.`);
    this.affixTab(targetTabElement, false, false);
  };

  // Injects code into the tab restoration process to correctly handle pinned tabs.
  browserExtension.injectCode("gBrowser.onTabRestoring", "}", function() {
    const restoredTab = aTab; // Alias for clarity within the hook scope.
    const currentSessionStore = ss; // Alias for clarity.

    // Re-apply the pinned state based on session data.
    this.affixTab(restoredTab, restoredTab.pinned, true, currentSessionStore.getTabValue(restoredTab, "bookmarkId"));

    // If auto-revert is enabled for pinned tabs, restore the tab's original URI.
    if (restoredTab.pinned && browserSettings.getPreference("extensions.tabutils.pinTab.autoRevert", false)) {
      let originalBookmarkURI;
      try {
        originalBookmarkURI = bookmarkService.bookmarks.getBookmarkURI(restoredTab.bookmarkId);
      } catch (err) {
        console.warn(`[TabOp] Could not get bookmark URI for reverting tab ${restoredTab.id}: ${err.message}`);
      }

      if (originalBookmarkURI) {
        const browserInstance = restoredTab.linkedBrowser;
        const sessionHistory = browserInstance.sessionHistory;

        // Purge existing history to ensure the tab loads the original URI cleanly.
        if (sessionHistory.count > 0) {
          sessionHistory.PurgeHistory(sessionHistory.count);
          console.debug(`[TabOp] Purged history for tab ${restoredTab.id} during revert.`);
        }

        // Manually manipulate session data to force the tab to load the original URI.
        const tabSessionData = browserInstance.__SS_data;
        tabSessionData.entries = [];
        tabSessionData.index = 0;
        tabSessionData.userTypedValue = originalBookmarkURI.spec;
        tabSessionData.userTypedClear = 1;
        console.info(`[TabOp] Reverted tab ${restoredTab.id} to original pinned URI: ${originalBookmarkURI.spec}`);
      }
    }
  });

  /**
   * Automatically pins a tab if it meets predefined criteria (e.g., has a 'pinned' tag).
   * @param {object} currentTab - The tab element.
   * @param {object} uri - The URI object of the tab.
   * @param {Array<string>} tags - An array of tags associated with the tab.
   */
  mainBrowserWindow.autoPinTab = function(currentTab, uri, tags) {
    const isTabAlreadyPinned = currentTab.pinned;
    const hasRequiredPinnedTag = tags.includes("pinned");
    const isAutoPinPreferenceEnabled = browserSettings.getPreference("extensions.tabutils.autoPin", true);

    // Check for existing pinned tabs with the same URI to avoid duplicates.
    const hasDuplicatePinnedTab = Array.from(this.displayableTabs || []) // Ensure iterable
                                      .slice(0, this.numberOfAnchoredTabs || 0)
                                      .some(existingTab => existingTab.linkedBrowser.currentURI?.spec === uri.spec);

    // Early exit if any condition for automatic pinning is not met.
    if (isTabAlreadyPinned || !hasRequiredPinnedTag || !isAutoPinPreferenceEnabled || hasDuplicatePinnedTab) {
      if (isTabAlreadyPinned) console.debug(`[TabOp] AutoPin: Tab ${currentTab.id} is already pinned.`);
      if (!hasRequiredPinnedTag) console.debug(`[TabOp] AutoPin: Tab ${currentTab.id} lacks 'pinned' tag.`);
      if (!isAutoPinPreferenceEnabled) console.debug(`[TabOp] AutoPin: Auto-pinning preference is disabled.`);
      if (hasDuplicatePinnedTab) console.debug(`[TabOp] AutoPin: Duplicate pinned tab found for URI ${uri.spec}.`);
      return;
    }

    const bookmarkReferenceId = bookmarkService.getItemIdForTaggedURI(uri, "pinned");
    this.affixTab(currentTab, true, false, bookmarkReferenceId);
    console.info(`[TabOp] Automatically pinned tab ${currentTab.id} with URI: ${uri.spec}`);

    const associatedButton = currentTab.associatedButtonElement;
    const shouldRevertOnPin = browserSettings.getPreference("extensions.tabutils.pinTab.autoRevert", false);

    // If the tab has a corresponding button and auto-revert is off, restore its saved state.
    if (associatedButton && !shouldRevertOnPin && bookmarkService.annotations.itemHasAnnotation(bookmarkReferenceId, "tabState")) {
      const delayedStateRestore = () => {
        currentTab.linkedBrowser.stop();
        sessionManager.setTabState(currentTab, bookmarkService.annotations.getItemAnnotation(bookmarkReferenceId, "tabState"));
        console.debug(`[TabOp] Restored previous tab state for auto-pinned tab ${currentTab.id}.`);
      };
      setTimeout(delayedStateRestore, 0); // Execute asynchronously to avoid blocking.
    }
  };

  // Inject auto-pinning logic into tab open and location change events.
  browserExtension.injectCode("gBrowser.onTabOpen", "}", "this.autoPinTab(aTab, uri, tags);");
  browserExtension.injectCode("gBrowser.onLocationChange", "}", "this.autoPinTab(aTab, uri, tags);");

  // Hook into tab close event to save state for pinned tabs.
  browserExtension.injectCode("gBrowser.onTabClose", "}", function() {
    const closingTab = aTab;
    const tabButton = closingTab.associatedButtonElement;
    const bookmarkIdentifier = closingTab.bookmarkId;

    if (tabButton && bookmarkIdentifier && !gPrivateBrowsingUI.privateBrowsingEnabled) {
      // Save the current tab state as an annotation on its bookmark.
      bookmarkService.setAnnotationsForItem(bookmarkIdentifier, [{ name: "tabState", value: tabOperations.sessionManager.getTabState(closingTab) }]);
      // Clear references to facilitate garbage collection and prevent memory leaks.
      tabButton.tab = null;
      closingTab.associatedButtonElement = null;
      console.debug(`[TabOp] Saved state for pinned tab ${closingTab.id} on close.`);
    } else {
      console.debug(`[TabOp] State not saved for tab ${closingTab.id} (not pinned, no bookmark, or private browsing).`);
    }
  });

  // A placeholder or compatibility hook for tab movement, possibly to prevent conflicts.
  browserExtension.injectCode("gBrowser.moveTabTo", /.*_numPinnedTabs.*/g, ";");

  // Injects complex logic for moving tabs, specifically handling pinned tabs and their bookmark order.
  browserExtension.injectCode("gBrowser.moveTabTo", "{", function() {
    let desiredIndex = aIndex;
    const tabBeingMoved = aTab;
    const allTabElements = this.allTabElements;

    // Normalize the target index to be within valid bounds.
    desiredIndex = Math.min(Math.max(0, desiredIndex), allTabElements.length - 1);
    // If the tab is already at the target position, no action is needed.
    if (desiredIndex === tabBeingMoved.currentPositionIndex) {
      console.debug(`[TabOp] MoveTabTo: Tab ${tabBeingMoved.id} is already at index ${desiredIndex}.`);
      return;
    }

    // Only apply complex logic if this is not an internal, forced move (indicated by arguments[2]).
    if (!arguments[2]) {
      const correspondingTabButton = tabBeingMoved.associatedButtonElement;
      if (correspondingTabButton) {
        // If the tab has an associated button, it's a bookmark-backed tab, so update its bookmark order.
        const targetTabForBookmark = allTabElements[desiredIndex > tabBeingMoved.currentPositionIndex ? desiredIndex + 1 : desiredIndex];
        const targetBookmarkNode = targetTabForBookmark?.associatedButtonElement?.bookmarkTreeNode;
        const movingBookmarkNode = correspondingTabButton.bookmarkTreeNode;

        if (movingBookmarkNode) {
          bookmarkService.bookmarks.moveItem(
            movingBookmarkNode.itemId,
            movingBookmarkNode.parent.itemId,
            targetBookmarkNode ? targetBookmarkNode.bookmarkIndex : -1
          );
          console.info(`[TabOp] Moved bookmark for tab ${tabBeingMoved.id} due to UI drag operation.`);
          return; // Exit after handling bookmark movement.
        }
      }

      // Determine the boundary between tabs with buttons and those without.
      let firstTabWithoutButtonIndex = 0;
      for (let i = 0; i < allTabElements.length; i++) {
        if (!allTabElements[i].associatedButtonElement) {
          firstTabWithoutButtonIndex = i;
          break;
        }
        firstTabWithoutButtonIndex = i + 1; // If loop completes, all tabs have buttons.
      }

      // Determine the boundary between pinned and unpinned tabs.
      let firstUnpinnedTabIndex = firstTabWithoutButtonIndex; // Start search from after buttoned tabs.
      for (let i = firstTabWithoutButtonIndex; i < allTabElements.length; i++) {
        if (!allTabElements[i].pinned) {
          firstUnpinnedTabIndex = i;
          break;
        }
        firstUnpinnedTabIndex = i + 1; // If loop completes, all tabs are pinned up to this point.
      }

      // Constrain the `desiredIndex` based on whether the tab is pinned or not.
      if (tabBeingMoved.pinned) {
        desiredIndex = Math.min(Math.max(firstTabWithoutButtonIndex, desiredIndex), firstUnpinnedTabIndex - 1);
      } else {
        desiredIndex = Math.max(firstUnpinnedTabIndex, desiredIndex);
      }

      if (desiredIndex === tabBeingMoved.currentPositionIndex) {
        console.debug(`[TabOp] MoveTabTo: Tab ${tabBeingMoved.id} movement constrained, no actual change.`);
        return;
      }
    }
  });

  // Manages the visual positioning of a single anchored (pinned) tab within the tab strip.
  mainBrowserWindow.browserTabContainer.positionSingleAnchoredTab = function(targetTabElement) {
    const tabStripContainer = this;

    // Disassociate any existing button to prepare for potential re-association.
    if (targetTabElement.associatedButtonElement) {
      targetTabElement.associatedButtonElement.tab = null;
      targetTabElement.associatedButtonElement = null;
    }

    let calculatedInsertionPoint = 0;
    // Find the correct position for the tab: before the first non-pinned tab,
    // or after all pinned tabs if the target itself is pinned.
    for (let i = 0; i < tabStripContainer.childNodes.length; i++) {
      const currentChildTab = tabStripContainer.childNodes[i];
      if (!currentChildTab.pinned && currentChildTab !== targetTabElement) {
        calculatedInsertionPoint = i;
        break;
      }
      calculatedInsertionPoint = i + 1; // If all are pinned or the current one is the target, increment.
    }

    // Check if the tab needs to be moved based on its pinned state and current position relative to the insertion point.
    const requiresMovement = (targetTabElement.pinned !== (targetTabElement.currentPositionIndex < calculatedInsertionPoint));
    if (requiresMovement) {
      mainBrowserWindow.moveTabTo(targetTabElement, targetTabElement.currentPositionIndex < calculatedInsertionPoint ? calculatedInsertionPoint - 1 : calculatedInsertionPoint, true);
    }

    // Special handling for "phantom" pinned tabs (those represented by buttons).
    if (targetTabElement.pinned && browserSettings.getPreference("extensions.tabutils.pinTab.showPhantom", true)) {
      // Recalculate insertion point after the initial move, as positions might have shifted.
      calculatedInsertionPoint = 0;
      for (let i = 0; i < tabStripContainer.childNodes.length; i++) {
        const currentChildTab = tabStripContainer.childNodes[i];
        if (!currentChildTab.pinned && currentChildTab !== targetTabElement) {
          calculatedInsertionPoint = i;
          break;
        }
        calculatedInsertionPoint = i + 1;
      }
      mainBrowserWindow.moveTabTo(targetTabElement, targetTabElement.currentPositionIndex < calculatedInsertionPoint ? calculatedInsertionPoint - 1 : calculatedInsertionPoint, true);

      const anchoredTabsBox = tabStripContainer.tabStripElement.anchoredTabsBox;
      let actualPinnedButtonCount = 0; // Tracks actual visible pinned buttons.

      // Iterate through phantom buttons to find and associate with the tab.
      for (const button of Array.from(anchoredTabsBox.childNodes)) {
        if (button.tab) { // If button is already linked to a tab, count it.
          actualPinnedButtonCount++;
          continue;
        }
        // If button's bookmark ID matches the tab's, link them.
        if (button.bookmarkTreeNode?.itemId === targetTabElement.bookmarkId) {
          button.tab = targetTabElement;
          targetTabElement.associatedButtonElement = button;
          mainBrowserWindow.moveTabTo(targetTabElement, actualPinnedButtonCount, true);
          console.debug(`[TabOp] Linked phantom button to tab ${targetTabElement.id} at index ${actualPinnedButtonCount}.`);
          break;
        }
      }
    }
  };

  // Recalculates and updates the positions of all anchored tabs within the tab strip.
  mainBrowserWindow.browserTabContainer.recalculateAnchoredTabsPositions = function(shouldRebuildAssociations = false) {
    const tabStripContainer = this;
    const anchoredTabsBox = tabStripContainer.tabStripElement.anchoredTabsBox;

    if (shouldRebuildAssociations) {
      // Clear all existing button-tab associations for a fresh rebuild.
      Array.from(tabStripContainer.childNodes).forEach(tab => {
        if (tab.associatedButtonElement) {
          tab.associatedButtonElement.tab = null;
          tab.associatedButtonElement = null;
        }
      });

      let currentButtonOrderingIndex = 0;
      // Re-associate phantom buttons with their respective pinned tabs based on bookmark IDs.
      Array.from(anchoredTabsBox.childNodes).forEach(button => {
        button.tab = null; // Clear any stale association.
        Array.from(tabStripContainer.childNodes).some(tab => {
          if (tab.pinned && tab.bookmarkId === button.bookmarkTreeNode?.itemId) {
            button.tab = tab;
            tab.associatedButtonElement = button;
            mainBrowserWindow.moveTabTo(tab, currentButtonOrderingIndex++, true);
            console.debug(`[TabOp] Rebuilt association for tab ${tab.id} during position recalculation.`);
            return true; // Stop iterating over tabs for this button.
          }
          return false;
        });
      });
    }

    // Toggle a class attribute indicating the presence of pinned tabs or phantom buttons.
    tabStripContainer.toggleAttribute("haspinned", !!tabStripContainer.firstChild?.pinned || anchoredTabsBox.hasChildNodes());

    // Adjust the visual width and opacity of phantom buttons.
    Array.from(anchoredTabsBox.childNodes).forEach(button => {
      const linkedTab = button.tab;
      button.width = linkedTab ? linkedTab.getBoundingClientRect().width : 0;
      button.style.opacity = button.width > 0 ? "0" : ""; // Hide if no width.
    });

    const isLayoutLTR = getComputedStyle(tabStripContainer).direction === "ltr";
    const [startLayoutProp, endLayoutProp] = isLayoutLTR ? ["left", "right"] : ["right", "left"];

    // Reset the starting border property for RTL compatibility.
    anchoredTabsBox.style.setProperty(`border-${startLayoutProp}`, "", "");

    // Calculate the end position of the pinned box, accounting for padding.
    const initialPaddingValue = parseFloat(getComputedStyle(anchoredTabsBox).getPropertyValue(`padding-${startLayoutProp}`));
    let endOfPinnedBoxPosition = anchoredTabsBox.hasChildNodes()
      ? anchoredTabsBox.lastChild.getBoundingClientRect()[endLayoutProp]
      : anchoredTabsBox.getBoundingClientRect()[startLayoutProp] + initialPaddingValue * (isLayoutLTR ? 1 : -1);

    let currentCumulativePadding = 0;
    // Position each pinned tab element.
    Array.from(tabStripContainer.childNodes).forEach(tab => {
      if (!tab.pinned) return; // Only process pinned tabs.

      const linkedButton = tab.associatedButtonElement;
      if (linkedButton) {
        // If linked to a phantom button, position based on the button's rectangle.
        const buttonRect = linkedButton.getBoundingClientRect();
        const buttonStyle = getComputedStyle(linkedButton);
        tab.style.left = `${buttonRect.left - parseFloat(buttonStyle.marginLeft)}px`;
      } else {
        // If no phantom button, position based on cumulative width.
        const tabStyle = getComputedStyle(tab);
        const tabCalculatedWidth = tab.boxObject.width + parseFloat(tabStyle.marginLeft) + parseFloat(tabStyle.marginRight);
        tab.style.left = `${endOfPinnedBoxPosition + currentCumulativePadding * (isLayoutLTR ? 1 : -1) + tabCalculatedWidth * (isLayoutLTR ? 0 : -1)}px`;
        currentCumulativePadding += tabCalculatedWidth;
      }
    });
    // Apply an end border to create space for the phantom tabs.
    anchoredTabsBox.style.setProperty(`border-${endLayoutProp}`, currentCumulativePadding > 0 ? `${currentCumulativePadding}px solid transparent` : "", "");

    this.tabStripElement.ensureElementIsVisible(this.selectedItem, false);
    console.debug(`[TabOp] Recalculated and updated positions for anchored tabs.`);
  };

  // Create an internal alias for the position recalculation function.
  mainBrowserWindow.browserTabContainer.internalRecalculateAnchoredTabs = mainBrowserWindow.browserTabContainer.recalculateAnchoredTabsPositions;

  // Hook into the tabstrip's layout adjustment to ensure pinned tabs are always correctly positioned.
  browserExtension.injectCode("gBrowser.mTabContainer.adjustTabstrip", "{", "if (arguments[0]) this.recalculateAnchoredTabsPositions();");

  // Attach event listeners for tabstrip overflow/underflow events to trigger position recalculations.
  tabOperations.addEventListener(mainBrowserWindow.browserTabContainer, "overflow", function() { this.recalculateAnchoredTabsPositions(); }, false);
  tabOperations.addEventListener(mainBrowserWindow.browserTabContainer, "underflow", function() { this.recalculateAnchoredTabsPositions(); }, false);

  // Updates the display of the phantom pinned tabs bar, clearing and rebuilding as necessary.
  mainBrowserWindow.refreshPinnedTabsDisplay = function() {
    let phantomTagID = -1;
    if (browserSettings.getPreference("extensions.tabutils.pinTab.showPhantom", true)) {
      phantomTagID = bookmarkService.getItemIdForTag("pinned");
    }

    const anchoredTabsBox = this.browserTabContainer.tabStripElement.anchoredTabsBox;
    const desiredPlaceURI = `place:folder=${phantomTagID}`;

    // If the target place URI has changed, clear and rebuild the phantom tabs bar.
    if (anchoredTabsBox.place !== desiredPlaceURI) {
      while (anchoredTabsBox.hasChildNodes()) {
        const buttonToRemove = anchoredTabsBox.firstChild;
        if (buttonToRemove.tab) {
          buttonToRemove.tab.associatedButtonElement = null;
        }
        anchoredTabsBox.removeChild(buttonToRemove);
      }
      anchoredTabsBox.place = desiredPlaceURI;
      console.info(`[TabOp] Refreshed phantom tabs display for place: ${desiredPlaceURI}`);
    }
  };

  // Defines a getter for CSS rules related to pinned tabs, ensuring they are loaded once.
  Object.defineProperty(mainBrowserWindow.browserTabContainer, "cachedPinnedTabStyles", {
    get: function() {
      // On first access, delete this getter and replace it with the actual array of rules.
      delete this.cachedPinnedTabStyles;
      const insertNewRule = tabOperations.insertRule; // Alias for the rule insertion utility.

      // Define and store the CSS rules for various pinned tab states and layouts.
      return this.cachedPinnedTabStyles = [
        insertNewRule(`.browser-tabs[data-multiline="true"] #AnchoredTabsDisplay[style*="border"]:empty,
                    .browser-tabs[data-multiline="true"] #AnchoredTabsItems[style*="border"]:empty,
                    .browser-tabs[data-orientation="vertical"] #AnchoredTabsItems[style*="border"]:empty,
                    .browser-tabs[data-orientation="vertical"] #AnchoredTabsDisplay[style*="border"]:empty {}`),
        insertNewRule(`.browser-tabs[data-multiline="true"] > .browser-tab[data-pinned="true"],
                    #main-window .browser-tabs[data-orientation="vertical"] > .browser-tab[data-pinned="true"] {}`),
        insertNewRule(`#main-window .browser-tab[data-pinned="true"]:not([selected]) {}`),
        insertNewRule(`#main-window .browser-tab[data-pinned="true"][selected] {}`),
        insertNewRule(`#main-window .browser-tab[data-pinned="true"] > * {}`)
      ];
    },
    configurable: true // Allows the property to be redefined after its initial access.
  });

  // Applies dynamic CSS styling to pinned tabs based on their current state and dimensions.
  mainBrowserWindow.browserTabContainer.applyAnchoredTabStyles = function() {
    const tabStripContainer = this;

    // Find a visible tab to use as a reference for calculating heights and line heights.
    let referenceTabForStyles = tabStripContainer.lastChild;
    while (referenceTabForStyles && referenceTabForStyles.boxObject.height === 0) {
      referenceTabForStyles = referenceTabForStyles.previousSibling;
    }
    if (!referenceTabForStyles) {
      console.warn(`[TabOp] No visible reference tab found for applying anchored tab styles.`);
      return;
    }

    // Temporarily remove attributes to get a baseline computed style.
    const originalSelectedState = referenceTabForStyles.selected;
    const originalPinnedState = referenceTabForStyles.pinned;

    referenceTabForStyles.removeAttribute("selected");
    referenceTabForStyles.removeAttribute("pinned");

    const baseComputedStyle = getComputedStyle(referenceTabForStyles);
    const baseTabHeight = referenceTabForStyles.boxObject.height;
    const baseTabLineHeight = baseTabHeight -
                              parseFloat(baseComputedStyle.borderTopWidth) - parseFloat(baseComputedStyle.borderBottomWidth) -
                              parseFloat(baseComputedStyle.paddingTop) - parseFloat(baseComputedStyle.paddingBottom);

    // Apply calculated heights and margins to the generic pinned tab rules.
    tabStripContainer.cachedPinnedTabStyles[0].style.setProperty("height", `${baseTabHeight}px`, "");
    tabStripContainer.cachedPinnedTabStyles[1].style.setProperty("margin-top", `${-baseTabHeight}px`, "important");
    tabStripContainer.cachedPinnedTabStyles[2].style.setProperty("height", `${baseTabHeight}px`, "important");
    tabStripContainer.cachedPinnedTabStyles[2].style.setProperty("line-height", `${baseTabLineHeight}px`, "");

    // Temporarily apply 'selected' attribute to get styles for the selected state.
    referenceTabForStyles.setAttribute("selected", "true");
    const selectedComputedStyle = getComputedStyle(referenceTabForStyles);
    const selectedTabHeight = referenceTabForStyles.boxObject.height;
    const selectedTabLineHeight = selectedTabHeight -
                                  parseFloat(selectedComputedStyle.borderTopWidth) - parseFloat(selectedComputedStyle.borderBottomWidth) -
                                  parseFloat(selectedComputedStyle.paddingTop) - parseFloat(selectedComputedStyle.paddingBottom);

    // Apply calculated heights and line heights for selected pinned tabs.
    tabStripContainer.cachedPinnedTabStyles[3].style.setProperty("height", `${selectedTabHeight}px`, "important");
    tabStripContainer.cachedPinnedTabStyles[3].style.setProperty("line-height", `${selectedTabLineHeight}px`, "");

    // Restore the tab's original attributes.
    originalSelectedState ? referenceTabForStyles.setAttribute("selected", "true") : referenceTabForStyles.removeAttribute("selected");
    originalPinnedState ? referenceTabForStyles.setAttribute("pinned", "true") : referenceTabForStyles.removeAttribute("pinned");

    // Adjust the vertical position of the icon in the first pinned tab.
    let firstVisiblePinnedTab = tabStripContainer.firstChild;
    while (firstVisiblePinnedTab && firstVisiblePinnedTab.boxObject.height === 0) {
      firstVisiblePinnedTab = firstVisiblePinnedTab.nextSibling;
    }

    if (firstVisiblePinnedTab && firstVisiblePinnedTab.pinned) {
      const tabBoundingRect = firstVisiblePinnedTab.getBoundingClientRect();
      const tabStyleProps = getComputedStyle(firstVisiblePinnedTab);
      // Calculate the vertical midpoint of the tab content area.
      const tabContentMiddleY = (tabBoundingRect.top + parseFloat(tabStyleProps.borderTopWidth) + parseFloat(tabStyleProps.paddingTop) +
                                 tabBoundingRect.bottom - parseFloat(tabStyleProps.borderBottomWidth) - parseFloat(tabStyleProps.paddingBottom)) / 2;

      const tabIconElement = firstVisiblePinnedTab.boxObject.firstChild; // Assuming the icon is the first child.
      const iconBoundingRect = tabIconElement.getBoundingClientRect();
      const iconStyleProps = getComputedStyle(tabIconElement);
      // Calculate the vertical midpoint of the icon, accounting for margins and explicit 'top' style.
      const iconMiddleY = (iconBoundingRect.top - parseFloat(iconStyleProps.marginTop) +
                           iconBoundingRect.bottom + parseFloat(iconStyleProps.marginBottom)) / 2 -
                          (parseFloat(iconStyleProps.top) || 0);

      // Set the icon's 'top' property to vertically center it.
      tabStripContainer.cachedPinnedTabStyles[4].style.setProperty("top", `${tabContentMiddleY - iconMiddleY}px`, "");
    }
    console.debug(`[TabOp] Applied dynamic CSS styles for anchored tabs.`);
  };

  // Global event listener for window resize events, triggering layout and style updates.
  tabOperations.addEventListener(window, "resize", function(event) {
    // This flag ensures initialization logic runs only once per handler instance.
    if (!arguments.callee.isResizeHandlerInitialized) {
      if (event.target !== window) return; // Only process actual window resize events.
      arguments.callee.isResizeHandlerInitialized = true;
      console.log(`[TabOp] Initializing window resize handler for tab operations.`);
    }

    const tabDisplayContainer = mainBrowserWindow.browserTabContainer;
    const tabStripGeometry = tabDisplayContainer.tabStripElement.boxObject;

    // Check for changes in tabstrip position.
    if (tabDisplayContainer.lastTabstripX !== tabStripGeometry.x || tabDisplayContainer.lastTabstripY !== tabStripGeometry.y) {
      tabDisplayContainer.recalculateAnchoredTabsPositions();
      tabDisplayContainer.lastTabstripX = tabStripGeometry.x;
      tabDisplayContainer.lastTabstripY = tabStripGeometry.y;
      console.debug(`[TabOp] Window resize: Tabstrip position changed, recalculating tab positions.`);
    }

    // Check for changes in tabstrip height.
    if (tabDisplayContainer.lastTabstripHeight !== tabStripGeometry.height) {
      tabDisplayContainer.applyAnchoredTabStyles();
      tabDisplayContainer.lastTabstripHeight = tabStripGeometry.height;
      console.debug(`[TabOp] Window resize: Tabstrip height changed, applying tab styles.`);
    }
  }, false);

  // Hook into the tab selection process to filter out collapsed tabs.
  browserExtension.injectCode("gBrowser.selectTabAtIndex", "this.visibleTabs", "this.displayableTabs.filter(function(aTab) !aTab.collapsed)");

  // Creates a new function for selecting unpinned tabs, leveraging the modified `selectTabAtIndex`.
  mainBrowserWindow.selectUnpinnedTabByIndex = browserExtension.replicateFunction(mainBrowserWindow.selectTabAtIndex, "visibleTabs", "allTabs");

  /**
   * Selects an anchored (pinned) tab by its numerical index within the pinned tab list.
   * @param {number} targetIndex - The zero-based index of the pinned tab to activate.
   * @param {Event} [triggeringEvent] - The event that initiated the selection (e.g., keyboard shortcut).
   */
  mainBrowserWindow.selectAnchoredTabByIndex = function(targetIndex, triggeringEvent) {
    const tabStripContainer = this.browserTabContainer;
    let currentlyAvailableTabs = tabStripContainer.tabStripElement.anchoredTabsBox.childNodes;

    // Fallback: If the phantom tabs box is empty, use the actual pinned tabs from the main strip.
    if (currentlyAvailableTabs.length === 0) {
      currentlyAvailableTabs = Array.from(this.displayableTabs).slice(0, this.numberOfAnchoredTabs);
      console.debug(`[TabOp] SelectAnchoredTab: Phantom box empty, using visible pinned tabs as fallback.`);
    }

    // Adjust negative indices (e.g., -1 for the last tab).
    if (targetIndex < 0) {
      targetIndex += currentlyAvailableTabs.length;
    }

    // Attempt to click the target tab if the index is valid.
    if (targetIndex >= 0 && targetIndex < currentlyAvailableTabs.length) {
      const selectedTabCandidate = currentlyAvailableTabs[targetIndex]?.tab || currentlyAvailableTabs[targetIndex];
      if (selectedTabCandidate && typeof selectedTabCandidate.click === 'function') {
        selectedTabCandidate.click();
        console.info(`[TabOp] Selected anchored tab at index ${targetIndex}.`);
      } else {
        console.warn(`[TabOp] Failed to select anchored tab at index ${targetIndex}: Tab element or click method missing.`);
      }
    } else {
      console.warn(`[TabOp] Invalid index ${targetIndex} provided for anchored tab selection.`);
    }

    // Prevent default event actions if an event was passed.
    if (triggeringEvent) {
      triggeringEvent.preventDefault();
      triggeringEvent.stopPropagation();
    }
  };
};