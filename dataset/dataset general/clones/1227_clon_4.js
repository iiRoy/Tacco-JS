(function() {
  const navPane = {};
  navPane.viewPort = {};

  const retrievePreference = TU_getPref;
  const sessionStoreService = tabutils._ss;
  const bookmarkUtility = PlacesUtils;
  const privateModeInterface = gPrivateBrowsingUI;
  const customUIEvent = CustomEvent;
  const injectCodeSegment = TU_hookCode;

  navPane.configureTabState = function(targetElement, forceFlag, restoreFlag, bookmarkIdentifier) {
    if (arguments.length === 1) {
      forceFlag = true;
      restoreFlag = false;
    }

    if (forceFlag === targetElement.pinned && (!forceFlag || bookmarkIdentifier === targetElement.bookmarkId)) {
      return;
    }

    if (forceFlag === null) {
      forceFlag = !targetElement.pinned;
    }

    if (!forceFlag) {
      targetElement.setAttribute("fadein", true);
      targetElement.removeAttribute("pinned");

      if (restoreFlag === null && !privateModeInterface.privateBrowsingEnabled) {
        let resourceLocator = targetElement.linkedBrowser.currentURI;
        try {
          resourceLocator = bookmarkUtility.bookmarks.getBookmarkURI(targetElement.bookmarkId);
        } catch (errorObject) {}

        bookmarkUtility.tagging.untagURI(resourceLocator, ["pinned"]);
        this.refreshVisualPinBar();
      }
      targetElement.bookmarkId = null;

      if (!restoreFlag) {
        sessionStoreService.deleteTabValue(targetElement, "pinned");
        sessionStoreService.deleteTabValue(targetElement, "bookmarkId");
      }
      targetElement.dispatchEvent(new customUIEvent("TabUnpinning", {
        bubbles: true
      }));

      this.viewPort.arrangeSinglePinnedItem(targetElement);
      this.viewPort.layoutAllPinnedItems();
      this.viewPort.adjustTabstrip();

      targetElement.linkedBrowser.docShell.isAppTab = false;
      if (targetElement.selected) {
        this._setCloseKeyState(true);
      }
      targetElement.dispatchEvent(new customUIEvent("TabUnpinned", {
        bubbles: true
      }));
    } else {
      targetElement.setAttribute("pinned", true);

      if (restoreFlag === null && !privateModeInterface.privateBrowsingEnabled && retrievePreference("extensions.tabutils.autoPin", true)) {
        bookmarkUtility.tagging.tagURI(targetElement.linkedBrowser.currentURI, ["pinned"]);
        this.refreshVisualPinBar();

        targetElement.bookmarkId = bookmarkUtility.getItemIdForTaggedURI(targetElement.linkedBrowser.currentURI, "pinned");
      } else {
        targetElement.bookmarkId = bookmarkIdentifier;
      }

      if (!restoreFlag) {
        sessionStoreService.setTabValue(targetElement, "pinned", "true");
        sessionStoreService.setTabValue(targetElement, "bookmarkId", String(targetElement.bookmarkId || ""));
      }
      targetElement.dispatchEvent(new customUIEvent("TabPinning", {
        bubbles: true
      }));

      this.viewPort.arrangeSinglePinnedItem(targetElement);
      this.viewPort.layoutAllPinnedItems();
      this.viewPort.applyVisualRulesToPinned();
      this.viewPort.adjustTabstrip();

      targetElement.linkedBrowser.docShell.isAppTab = true;
      if (targetElement.selected) {
        this._setCloseKeyState(false);
      }
      targetElement.dispatchEvent(new customUIEvent("TabPinned", {
        bubbles: true
      }));
    }
  };

  navPane.releaseTabState = function(targetElement) {
    return this.configureTabState(targetElement, false, false);
  };

  injectCodeSegment("gBrowser.onTabRestoring", "}", function() {
    this.configureTabState(aTab, aTab.pinned, true, ss.getTabValue(aTab, "bookmarkId"));

    if (aTab.pinned && retrievePreference("extensions.tabutils.pinTab.autoRevert", false)) {
      let resourceLocator;
      try {
        resourceLocator = bookmarkUtility.bookmarks.getBookmarkURI(aTab.bookmarkId);
      } catch (errorObject) {}

      if (resourceLocator) {
        let browserInstance = aTab.linkedBrowser;
        let historyStack = browserInstance.sessionHistory;
        if (historyStack.count > 0) {
          historyStack.PurgeHistory(historyStack.count);
        }

        let itemData = browserInstance.__SS_data;
        itemData.entries = [];
        itemData.index = 0;
        itemData.userTypedValue = resourceLocator.spec;
        itemData.userTypedClear = 1;
      }
    }
  });

  navPane.evaluateAutoStateAssignment = function(targetElement, resourceLocator, labelCollection) {
    if (!targetElement.pinned &&
      labelCollection.includes("pinned") &&
      retrievePreference("extensions.tabutils.autoPin", true) &&
      !Array.from(this.visibleTabs).slice(0, this._numPinnedTabs).some(function(candidateItem) {
        return candidateItem.linkedBrowser.currentURI.spec === resourceLocator.spec;
      })) {
      this.configureTabState(targetElement, true, false, bookmarkUtility.getItemIdForTaggedURI(resourceLocator, "pinned"));

      if (targetElement.mCorrespondingButton &&
        !retrievePreference("extensions.tabutils.pinTab.autoRevert", false) &&
        bookmarkUtility.annotations.itemHasAnnotation(targetElement.bookmarkId, "tabState")) {
        setTimeout(function() {
          targetElement.linkedBrowser.stop();
          sessionStoreService.setTabState(targetElement, bookmarkUtility.annotations.getItemAnnotation(targetElement.bookmarkId, "tabState"));
        }, 0);
      }
    }
  };

  injectCodeSegment("gBrowser.onTabOpen", "}", "this.evaluateAutoStateAssignment(aTab, uri, tags);");
  injectCodeSegment("gBrowser.onLocationChange", "}", "this.evaluateAutoStateAssignment(aTab, uri, tags);");

  injectCodeSegment("gBrowser.onTabClose", "}", function() {
    if (aTab.mCorrespondingButton && !privateModeInterface.privateBrowsingEnabled) {
      bookmarkUtility.setAnnotationsForItem(aTab.bookmarkId, [{
        name: "tabState",
        value: sessionStoreService.getTabState(aTab)
      }]);
      aTab.mCorrespondingButton.tab = null;
      aTab.mCorrespondingButton = null;
    }
  });

  injectCodeSegment("gBrowser.moveTabTo", /.*_numPinnedTabs.*/g, ";");
  injectCodeSegment("gBrowser.moveTabTo", "{", function() {
    aIndex = Math.min(Math.max(0, aIndex), this.mTabs.length - 1);
    if (aIndex === aTab._tPos) {
      return;
    }

    if (!arguments[2]) {
      if (aTab.mCorrespondingButton) {
        let candidateItem = this.mTabs[aIndex > aTab._tPos ? aIndex + 1 : aIndex];
        let candidateNode = candidateItem && candidateItem.mCorrespondingButton && candidateItem.mCorrespondingButton._placesNode;
        let sourceNode = aTab.mCorrespondingButton._placesNode;
        bookmarkUtility.bookmarks.moveItem(sourceNode.itemId, sourceNode.parent.itemId, candidateNode ? candidateNode.bookmarkIndex : -1);
        return;
      }

      let firstUnpinnedIndex = 0;
      for (let currentElement of this.mTabs) {
          if (!currentElement.mCorrespondingButton) break;
          firstUnpinnedIndex++;
      }
      let firstRegularTabIndex = firstUnpinnedIndex;
      for (let currentElement of this.mTabs.slice(firstUnpinnedIndex)) {
          if (!currentElement.pinned) break;
          firstRegularTabIndex++;
      }

      if (aTab.pinned) {
        aIndex = Math.min(Math.max(firstUnpinnedIndex, aIndex), firstRegularTabIndex - 1);
      } else {
        aIndex = Math.max(firstRegularTabIndex, aIndex);
      }

      if (aIndex === aTab._tPos) {
        return;
      }
    }
  });

  navPane.viewPort.arrangeSinglePinnedItem = function(targetElement) {
    if (targetElement.mCorrespondingButton) {
      targetElement.mCorrespondingButton.tab = null;
      targetElement.mCorrespondingButton = null;
    }

    let firstRegularIndex = 0;
    for (let currentElement of this.childNodes) {
        if (!currentElement.pinned && currentElement !== targetElement) break;
        firstRegularIndex++;
    }

    if (targetElement.pinned !== (targetElement._tPos < firstRegularIndex)) {
      gBrowser.moveTabTo(targetElement, targetElement._tPos < firstRegularIndex ? firstRegularIndex - 1 : firstRegularIndex, true);
    }

    if (targetElement.pinned && retrievePreference("extensions.tabutils.pinTab.showPhantom", true)) {
      gBrowser.moveTabTo(targetElement, targetElement._tPos < firstRegularIndex ? firstRegularIndex - 1 : firstRegularIndex, true);

      let pinBarContainer = this.mTabstrip._pinnedbox;
      let itemCounter = 0;
      for (let controlButton of pinBarContainer.childNodes) {
        if (controlButton.tab) {
          itemCounter++;
          continue;
        }
        if (controlButton._placesNode.itemId === targetElement.bookmarkId) {
          controlButton.tab = targetElement;
          targetElement.mCorrespondingButton = controlButton;
          gBrowser.moveTabTo(targetElement, itemCounter, true);
          break;
        }
      }
    }
  };

  navPane.viewPort.layoutAllPinnedItems = function(rebuildFlag) {
    let pinBarContainer = this.mTabstrip._pinnedbox;
    if (rebuildFlag) {
      for (let currentElement of this.childNodes) {
        if (!currentElement.mCorrespondingButton) break;
        currentElement.mCorrespondingButton = null;
      }

      let itemCounter = 0;
      for (let controlButton of pinBarContainer.childNodes) {
        controlButton.tab = null;
        for (let currentElement of this.childNodes) {
          if (!currentElement.pinned) break;
          if (currentElement.bookmarkId === controlButton._placesNode.itemId) {
            controlButton.tab = currentElement;
            currentElement.mCorrespondingButton = controlButton;
            gBrowser.moveTabTo(currentElement, itemCounter++, true);
            break;
          }
        }
      }
    }

    if (this.firstChild && this.firstChild.pinned || pinBarContainer.hasChildNodes()) {
      this.setAttribute("haspinned", true);
    } else {
      this.removeAttribute("haspinned");
    }

    for (let controlButton of pinBarContainer.childNodes) {
      controlButton.width = controlButton.tab ? controlButton.tab.getBoundingClientRect().width : 0;
      controlButton.style.opacity = controlButton.width > 0 ? 0 : "";
    }

    let isLeftToRight = getComputedStyle(this).direction === "ltr";
    let [startDirection, endDirection] = isLeftToRight ? ["left", "right"] : ["right", "left"];
    pinBarContainer.style.setProperty("border-" + startDirection, "", "");

    let endBoundary = pinBarContainer.hasChildNodes() ? pinBarContainer.lastChild.getBoundingClientRect()[endDirection] :
      pinBarContainer.getBoundingClientRect()[startDirection] + parseFloat(getComputedStyle(pinBarContainer).getPropertyValue("padding-" + startDirection)) * (isLeftToRight ? 1 : -1);
    let extraPadding = 0;

    for (let currentElement of this.childNodes) {
      if (!currentElement.pinned) break;
      if (currentElement.mCorrespondingButton) {
        let boundingRectangle = currentElement.mCorrespondingButton.getBoundingClientRect();
        let computedStyle = getComputedStyle(currentElement.mCorrespondingButton);
        currentElement.style.left = boundingRectangle.left - parseFloat(computedStyle.marginLeft) + "px";
      } else {
        let computedStyle = getComputedStyle(currentElement);
        let elementWidth = currentElement.boxObject.width + parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight);
        currentElement.style.left = endBoundary + extraPadding * (isLeftToRight ? 1 : -1) + elementWidth * (isLeftToRight ? 0 : -1) + "px";
        extraPadding += elementWidth;
      }
    }
    pinBarContainer.style.setProperty("border-" + endDirection, extraPadding > 0 ? extraPadding + "px solid transparent" : "", "");

    this.mTabstrip.ensureElementIsVisible(this.selectedItem, false);
  };
  navPane.viewPort._cachedLayoutAllPinnedItems = navPane.viewPort.layoutAllPinnedItems;

  injectCodeSegment("gBrowser.mTabContainer.adjustTabstrip", "{", "if (arguments[0]) this.layoutAllPinnedItems();");

  tabutils.addEventListener(navPane.viewPort, "overflow", function() {
    this.layoutAllPinnedItems();
  }, false);
  tabutils.addEventListener(navPane.viewPort, "underflow", function() {
    this.layoutAllPinnedItems();
  }, false);

  navPane.refreshVisualPinBar = function() {
    let tagIdentifier = -1;
    if (retrievePreference("extensions.tabutils.pinTab.showPhantom", true)) {
      tagIdentifier = bookmarkUtility.getItemIdForTag("pinned");
    }

    let pinBarContainer = this.viewPort.mTabstrip._pinnedbox;
    let locationString = "place:folder=" + tagIdentifier;
    if (pinBarContainer.place !== locationString) {
      while (pinBarContainer.hasChildNodes()) {
        let controlButton = pinBarContainer.firstChild;
        if (controlButton.tab) {
          controlButton.tab.mCorrespondingButton = null;
        }
        pinBarContainer.removeChild(controlButton);
      }
      pinBarContainer.place = locationString;
    }
  };

  navPane.viewPort.__defineGetter__("_fixedTabStyleRules", function() {
    delete this._fixedTabStyleRules;
    return this._fixedTabStyleRules = [
      tabutils.insertRule('.tabbrowser-tabs[multirow] #PinnedTabsBar[style*="border"]:empty,' +
        '.tabbrowser-tabs[multirow] #PinnedTabsBarItems[style*="border"]:empty,' +
        '.tabbrowser-tabs[orient="vertical"] #PinnedTabsBarItems[style*="border"]:empty,' +
        '.tabbrowser-tabs[orient="vertical"] #PinnedTabsBar[style*="border"]:empty {}'),
      tabutils.insertRule('.tabbrowser-tabs[multirow] > .tabbrowser-tab[pinned],' +
        '#main-window .tabbrowser-tabs[orient="vertical"] > .tabbrowser-tab[pinned] {}'),
      tabutils.insertRule('#main-window .tabbrowser-tab[pinned]:not([selected]) {}'),
      tabutils.insertRule('#main-window .tabbrowser-tab[pinned][selected] {}'),
      tabutils.insertRule('#main-window .tabbrowser-tab[pinned] > * {}')
    ];
  });

  navPane.viewPort.applyVisualRulesToPinned = function() {
    let currentElement = this.lastChild;
    while (currentElement && currentElement.boxObject.height === 0) {
      currentElement = currentElement.previousSibling;
    }
    if (!currentElement) {
      return;
    }

    let wasPreviouslySelected = currentElement.selected;
    let wasPreviouslyFixed = currentElement.pinned;

    currentElement.removeAttribute("selected");
    currentElement.removeAttribute("pinned");
    let computedStyle = getComputedStyle(currentElement);
    let elementHeight = currentElement.boxObject.height;
    let lineHeightValue = elementHeight - parseFloat(computedStyle.borderTopWidth) - parseFloat(computedStyle.borderBottomWidth) - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);
    this._fixedTabStyleRules[0].style.setProperty("height", elementHeight + "px", "");
    this._fixedTabStyleRules[1].style.setProperty("margin-top", -elementHeight + "px", "important");
    this._fixedTabStyleRules[2].style.setProperty("height", elementHeight + "px", "important");
    this._fixedTabStyleRules[2].style.setProperty("line-height", lineHeightValue + "px", "");

    currentElement.setAttribute("selected", true);
    computedStyle = getComputedStyle(currentElement);
    elementHeight = currentElement.boxObject.height;
    lineHeightValue = elementHeight - parseFloat(computedStyle.borderTopWidth) - parseFloat(computedStyle.borderBottomWidth) - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);
    this._fixedTabStyleRules[3].style.setProperty("height", elementHeight + "px", "important");
    this._fixedTabStyleRules[3].style.setProperty("line-height", lineHeightValue + "px", "");

    wasPreviouslySelected ? currentElement.setAttribute("selected", true) : currentElement.removeAttribute("selected");
    wasPreviouslyFixed ? currentElement.setAttribute("pinned", true) : currentElement.removeAttribute("pinned");

    currentElement = this.firstChild;
    while (currentElement && currentElement.boxObject.height === 0) {
      currentElement = currentElement.nextSibling;
    }

    if (currentElement && currentElement.pinned) {
      let boundingRectangle = currentElement.getBoundingClientRect();
      computedStyle = getComputedStyle(currentElement);
      let midpoint = (boundingRectangle.top + parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.paddingTop) + boundingRectangle.bottom - parseFloat(computedStyle.borderBottomWidth) - parseFloat(computedStyle.paddingBottom)) / 2;

      let iconElement = currentElement.boxObject.firstChild;
      boundingRectangle = iconElement.getBoundingClientRect();
      computedStyle = getComputedStyle(iconElement);
      let iconMidpoint = (boundingRectangle.top - parseFloat(computedStyle.marginTop) + boundingRectangle.bottom + parseFloat(computedStyle.marginBottom)) / 2 - (parseFloat(computedStyle.top) || 0);
      this._fixedTabStyleRules[4].style.setProperty("top", midpoint - iconMidpoint + "px", "");
    }
  };

  tabutils.addEventListener(window, "resize", function(eventObject) {
    if (!arguments.callee._initialized) {
      if (eventObject.target !== window) {
        return;
      }
      arguments.callee._initialized = true;
    }

    let containerElement = navPane.viewPort;
    let boxModel = containerElement.mTabstrip.boxObject;
    if (containerElement.mTabstripX !== boxModel.x || containerElement.mTabstripY !== boxModel.y) {
      containerElement.layoutAllPinnedItems();
      containerElement.mTabstripX = boxModel.x;
      containerElement.mTabstripY = boxModel.y;
    }

    if (containerElement.mTabstripHeight !== boxModel.height) {
      containerElement.applyVisualRulesToPinned();
      containerElement.mTabstripHeight = boxModel.height;
    }
  }, false);

  injectCodeSegment("gBrowser.selectTabAtIndex", "this.visibleTabs", "this.visibleTabs.filter(function(candidateItem) !candidateItem.collapsed)");

  navPane.chooseRegularItemByIndex = TU_hookFunc(gBrowser.selectTabAtIndex, "visibleTabs", "allTabs");

  navPane.chooseFixedItemByIndex = function(indexValue, eventObject) {
    let tabCollection = this.viewPort.mTabstrip._pinnedbox.childNodes;
    if (tabCollection.length === 0) {
      tabCollection = Array.from(this.visibleTabs).slice(0, this._numPinnedTabs);
    }

    if (indexValue < 0) {
      indexValue += tabCollection.length;
    }

    if (indexValue >= 0 && indexValue < tabCollection.length) {
      (tabCollection[indexValue].tab || tabCollection[indexValue]).click();
    }

    if (eventObject) {
      eventObject.preventDefault();
      eventObject.stopPropagation();
    }
  };
})();