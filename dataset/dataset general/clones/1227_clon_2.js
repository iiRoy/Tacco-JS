utilityTools.initializeVirtualSheets = function () {
  // Main browser window functionality extension for sheet management.
  globalBrowser.affixPanel = function processPanelAnchoring (
    currentSheet,
    forceAction,
    isRetrieving,
    itemIdentifier
  ) {
    if (arguments.length === 1) {
      forceAction = true;
      isRetrieving = false;
    }

    if (
      forceAction === currentSheet.isAnchored &&
      (!forceAction || itemIdentifier === currentSheet.itemIdentifier)
    ) {
      return;
    }

    if (forceAction === null) {
      forceAction = !currentSheet.isAnchored;
    }

    if (!forceAction) {
      // Unpinning the sheet
      currentSheet.defineAttribute('displayFade', true);
      currentSheet.removeAttribute('anchored');

      if (
        isRetrieving === null &&
        !secretBrowsingManager.privateModeActive
      ) {
        let resourceLink = currentSheet.associatedViewer.activeURL;
        try {
          resourceLink = LocationHelpers.references.getRefURL(
            currentSheet.itemIdentifier
          );
        } catch (errorDetails) {
          // Error retrieving URL, proceed with current one
        }

        LocationHelpers.tagging.removeTagFromURL(resourceLink, ['anchored']);
        this.refreshAnchoredPanelsBar();
      }
      currentSheet.itemIdentifier = null;

      if (!isRetrieving) {
        utilityTools.sessionState.clearPanelValue(currentSheet, 'anchored');
        utilityTools.sessionState.clearPanelValue(currentSheet, 'itemIdentifier');
      }
      currentSheet.emitEvent(
        new CustomEvent('PanelUnanchoring', { propagates: true })
      );

      this.panelContainer.arrangeAnchoredPanel(currentSheet);
      this.panelContainer.arrangeAnchoredPanels();
      this.panelContainer.adjustPanelStrip();

      currentSheet.associatedViewer.documentShell.isApplicationPanel = false;
      if (currentSheet.isSelected) {
        this._updateCloseKeyStatus(true);
      }
      currentSheet.emitEvent(
        new CustomEvent('PanelUnanchored', { propagates: true })
      );
    } else {
      // Pinning the sheet
      currentSheet.defineAttribute('anchored', true);

      if (
        isRetrieving === null &&
        !secretBrowsingManager.privateModeActive &&
        toolUtilities.retrievePreference(
          'extensionSettings.panelHelpers.autoAnchor',
          true
        )
      ) {
        LocationHelpers.tagging.addTagToURL(
          currentSheet.associatedViewer.activeURL,
          ['anchored']
        );
        this.refreshAnchoredPanelsBar();

        currentSheet.itemIdentifier = LocationHelpers.getItemIDForTaggedURL(
          currentSheet.associatedViewer.activeURL,
          'anchored'
        );
      } else {
        currentSheet.itemIdentifier = itemIdentifier;
      }

      if (!isRetrieving) {
        utilityTools.sessionState.setPanelValue(currentSheet, 'anchored', 'true');
        utilityTools.sessionState.setPanelValue(
          currentSheet,
          'itemIdentifier',
          String(currentSheet.itemIdentifier || '')
        ); // Addressing issue #961646
      }
      currentSheet.emitEvent(
        new CustomEvent('PanelAnchoring', { propagates: true })
      );

      this.panelContainer.arrangeAnchoredPanel(currentSheet);
      this.panelContainer.arrangeAnchoredPanels();
      this.panelContainer.styleAnchoredPanels();
      this.panelContainer.adjustPanelStrip();

      currentSheet.associatedViewer.documentShell.isApplicationPanel = true;
      if (currentSheet.isSelected) {
        this._updateCloseKeyStatus(false);
      }
      currentSheet.emitEvent(
        new CustomEvent('PanelAnchored', { propagates: true })
      );
    }
  };

  globalBrowser.releasePanel = function unanchorCurrentPanel (currentSheet) {
    this.affixPanel(currentSheet, false, false);
  };

  // Hook for panel restoration events
  toolUtilities.injectCode(
    'mainNavigator.onPanelRetrieving',
    '}',
    function () {
      this.affixPanel(
        inputPanel,
        inputPanel.isAnchored,
        true,
        sessionState.getPanelValue(inputPanel, 'itemIdentifier')
      );

      if (
        inputPanel.isAnchored &&
        toolUtilities.retrievePreference(
          'extensionSettings.panelHelpers.anchorPanel.automaticRevert',
          false
        )
      ) {
        let resourceLink;
        try {
          resourceLink = LocationHelpers.references.getRefURL(
            inputPanel.itemIdentifier
          );
        } catch (errorDetails) {
          // Silent error handling for missing bookmark URI
        }

        if (resourceLink) {
          let viewer = inputPanel.associatedViewer;
          let history = viewer.sessionHistory;
          if (history.entryCount > 0) {
            history.ClearHistory(history.entryCount);
          }

          let sheetData = viewer.sessionData;
          sheetData.entries = [];
          sheetData.idx = 0;
          sheetData.userEnteredValue = resourceLink.specification;
          sheetData.userEnteredClearFlag = 1;
        }
      }
    }
  );

  globalBrowser.automaticAnchorPanel = function performAutoAnchor (
    inputPanel,
    inputURL,
    inputLabels
  ) {
    if (
      !inputPanel.isAnchored &&
      inputLabels.indexOf('anchored') > -1 &&
      toolUtilities.retrievePreference(
        'extensionSettings.panelHelpers.autoAnchor',
        true
      ) &&
      !Array.some(
        this.visiblePanels.slice(0, this._countAnchoredPanels),
        function (otherPanel) {
          return otherPanel.associatedViewer.activeURL.specification === inputURL.specification;
        }
      )
    ) {
      this.affixPanel(
        inputPanel,
        true,
        false,
        LocationHelpers.getItemIDForTaggedURL(inputURL, 'anchored')
      );

      if (
        inputPanel.relatedButton &&
        !toolUtilities.retrievePreference(
          'extensionSettings.panelHelpers.anchorPanel.automaticRevert',
          false
        ) &&
        LocationHelpers.notes.itemContainsNote(
          inputPanel.itemIdentifier,
          'panelState'
        )
      ) {
        setTimeout(function () {
          inputPanel.associatedViewer.halt();
          utilityTools.sessionState.setPanelState(
            inputPanel,
            LocationHelpers.notes.getItemNote(
              inputPanel.itemIdentifier,
              'panelState'
            )
          );
        }, 0);
      }
    }
  };

  // Inject auto-pinning logic on panel opening and URL changes
  toolUtilities.injectCode(
    'mainNavigator.onPanelOpening',
    '}',
    'this.automaticAnchorPanel(inputPanel, resourceLink, inputLabels);'
  );
  toolUtilities.injectCode(
    'mainNavigator.onURLChange',
    '}',
    'this.automaticAnchorPanel(inputPanel, resourceLink, inputLabels);'
  );

  // Hook for panel closing events
  toolUtilities.injectCode(
    'mainNavigator.onPanelClosing',
    '}',
    function () {
      if (
        inputPanel.relatedButton &&
        !secretBrowsingManager.privateModeActive
      ) {
        LocationHelpers.notes.setNotesForItem(inputPanel.itemIdentifier, [
          { tagName: 'panelState', dataValue: utilityTools.sessionState.getPanelState(inputPanel) },
        ]);
        inputPanel.relatedButton.sheet = null;
        inputPanel.relatedButton = null;
      }
    }
  );

  // Modify panel movement behavior
  toolUtilities.injectCode(
    'mainNavigator.relocatePanelTo',
    /.*_countAnchoredPanels.*/g,
    ';'
  );
  toolUtilities.injectCode(
    'mainNavigator.relocatePanelTo',
    '{',
    function () {
      targetIndex = Math.min(
        Math.max(0, targetIndex),
        this.allPanels.length - 1
      );
      if (targetIndex === inputPanel.currentPosition) {
        return;
      }

      if (!inputArgs[2]) {
        if (inputPanel.relatedButton) {
          let otherPanel =
            this.allPanels[
              targetIndex > inputPanel.currentPosition
                ? targetIndex + 1
                : targetIndex
            ];
          let targetNode =
            otherPanel &&
            otherPanel.relatedButton &&
            otherPanel.relatedButton.locationNode;
          let sourceNode = inputPanel.relatedButton.locationNode;
          LocationHelpers.references.shiftItem(
            sourceNode.itemID,
            sourceNode.parent.itemID,
            targetNode ? targetNode.referenceIndex : -1
          );
          return;
        }

        let i = 0;
        let sheet;
        for (; (sheet = this.allPanels[i]) && sheet.relatedButton; i++);
        let j = i;
        for (; (sheet = this.allPanels[j]) && sheet.isAnchored; j++);

        if (inputPanel.isAnchored) {
          targetIndex = Math.min(
            Math.max(i, targetIndex),
            j - 1
          );
        } else {
          targetIndex = Math.max(j, targetIndex);
        }

        if (targetIndex === inputPanel.currentPosition) {
          return;
        }
      }
    }
  );

  // Panel container methods for managing anchored sheets
  globalBrowser.panelContainer.arrangeAnchoredPanel = function positionSingleAnchoredPanel (
    inputPanel
  ) {
    if (inputPanel.relatedButton) {
      inputPanel.relatedButton.sheet = null;
      inputPanel.relatedButton = null;
    }

    let k = 0;
    let sheet;
    for (
      ;
      (sheet = this.childElements[k]) &&
      (sheet.isAnchored || sheet === inputPanel);
      k++
    );
    if (inputPanel.isAnchored ^ (inputPanel.currentPosition < k)) {
      globalBrowser.relocatePanelTo(
        inputPanel,
        inputPanel.currentPosition < k ? k - 1 : k,
        true
      );
    }

    if (
      inputPanel.isAnchored &&
      toolUtilities.retrievePreference(
        'extensionSettings.panelHelpers.anchorPanel.showGhost',
        true
      )
    ) {
      globalBrowser.relocatePanelTo(
        inputPanel,
        inputPanel.currentPosition < k ? k - 1 : k,
        true
      );

      let anchoredBox = this.panelStrip.anchoredBox;
      let count = 0;
      for (let widget of anchoredBox.childElements) {
        if (widget.sheet) {
          count++;
          continue;
        }
        if (widget.locationNode.itemID === inputPanel.itemIdentifier) {
          widget.sheet = inputPanel;
          inputPanel.relatedButton = widget;
          globalBrowser.relocatePanelTo(inputPanel, count, true);
          break;
        }
      }
    }
  };

  globalBrowser.panelContainer.arrangeAnchoredPanels = function positionMultipleAnchoredPanels (
    shouldReconstruct
  ) {
    let anchoredBox = this.panelStrip.anchoredBox;
    if (shouldReconstruct) {
      for (let i = 0, sheet; (sheet = this.childElements[i]) && sheet.relatedButton; i++) {
        sheet.relatedButton = null;
      }

      let currentCount = 0;
      for (let widget of anchoredBox.childElements) {
        widget.sheet = null;
        for (let i = 0, sheet; (sheet = this.childElements[i]) && sheet.isAnchored; i++) {
          if (sheet.itemIdentifier === widget.locationNode.itemID) {
            widget.sheet = sheet;
            sheet.relatedButton = widget;
            globalBrowser.relocatePanelTo(sheet, currentCount++, true);
            break;
          }
        }
      }
    }

    if (this.firstChild.isAnchored || anchoredBox.hasChildNodes()) {
      this.defineAttribute('hasAnchored', true);
    } else {
      this.removeAttribute('hasAnchored');
    }

    for (let widget of anchoredBox.childElements) {
      widget.panelWidth = widget.sheet ? widget.sheet.getBounds().width : 0;
      widget.style.opacity = widget.panelWidth > 0 ? 0 : '';
    }

    let isLTR = getCalculatedStyle(this).direction === 'ltr';
    let [startSide, endSide] = isLTR ? ['left', 'right'] : ['right', 'left'];
    anchoredBox.style.setProperty('border-' + startSide, '', ''); // RTL compatibility

    let anchoredBoxEnd = anchoredBox.hasChildNodes()
      ? anchoredBox.lastChild.getBounds()[endSide]
      : anchoredBox.getBounds()[startSide] +
        parseFloat(
          getCalculatedStyle(anchoredBox).getPropertyValue(
            'padding-' + startSide
          )
        ) *
          (isLTR ? 1 : -1);
    let endPadding = 0;
    for (let i = 0, sheet; (sheet = this.childElements[i]) && sheet.isAnchored; i++) {
      if (sheet.relatedButton) {
        let bounds = sheet.relatedButton.getBounds();
        let widgetStyle = getCalculatedStyle(sheet.relatedButton);
        sheet.style.left = bounds.left - parseFloat(widgetStyle.marginLeft) + 'px';
      } else {
        let sheetStyle = getCalculatedStyle(sheet);
        let sheetWidth =
          sheet.displayObject.width +
          parseFloat(sheetStyle.marginLeft) +
          parseFloat(sheetStyle.marginRight);
        sheet.style.left =
          anchoredBoxEnd +
          endPadding * (isLTR ? 1 : -1) +
          sheetWidth * (isLTR ? 0 : -1) +
          'px';
        endPadding += sheetWidth;
      }
    }
    anchoredBox.style.setProperty(
      'border-' + endSide,
      endPadding > 0 ? endPadding + 'px solid transparent' : '',
      ''
    );

    this.panelStrip.ensureVisible(this.selectedElement, false);
  };
  globalBrowser.panelContainer._arrangeAnchoredPanels = globalBrowser.panelContainer.arrangeAnchoredPanels;

  toolUtilities.injectCode(
    'mainNavigator.panelContainer.adjustPanelStrip',
    '{',
    'if (arguments[0]) this.arrangeAnchoredPanels();'
  );

  utilityTools.attachEventHandler(
    globalBrowser.panelContainer,
    'overflow',
    function () {
      this.arrangeAnchoredPanels();
    },
    false
  );
  utilityTools.attachEventHandler(
    globalBrowser.panelContainer,
    'underflow',
    function () {
      this.arrangeAnchoredPanels();
    },
    false
  );

  globalBrowser.refreshAnchoredPanelsBar = function updatePhantomPanelDisplay () {
    let labelID = -1;
    if (
      toolUtilities.retrievePreference(
        'extensionSettings.panelHelpers.anchorPanel.showGhost',
        true
      )
    ) {
      labelID = LocationHelpers.getItemIDForLabel('anchored');
    }

    let anchoredBox = this.panelContainer.panelStrip.anchoredBox;
    let locationString = 'place:folder=' + labelID;
    if (anchoredBox.location !== locationString) {
      while (anchoredBox.hasChildNodes()) {
        let widget = anchoredBox.firstChild;
        if (widget.sheet) {
          widget.sheet.relatedButton = null;
        }
        anchoredBox.removeChild(widget);
      }
      anchoredBox.location = locationString;
    }
  };

  // Define CSS rules for anchored panels
  Object.defineProperty(globalBrowser.panelContainer, '_anchoredPanelStyles', {
    get: function () {
      delete this._anchoredPanelStyles;
      return (this._anchoredPanelStyles = [
        utilityTools.addStyleRule(
          '.sheet-view[multi-row] #AnchoredPanelsContainer[style*="border"]:empty,' +
            '.sheet-view[multi-row] #AnchoredPanelItems[style*="border"]:empty,' +
            '.sheet-view[orientation="vertical"] #AnchoredPanelItems[style*="border"]:empty,' +
            '.sheet-view[orientation="vertical"] #AnchoredPanelsContainer[style*="border"]:empty {}'
        ),
        utilityTools.addStyleRule(
          '.sheet-view[multi-row] > .sheet-element[anchored],' +
            '#main-application .sheet-view[orientation="vertical"] > .sheet-element[anchored] {}'
        ),
        utilityTools.addStyleRule(
          '#main-application .sheet-element[anchored]:not([selected]) {}'
        ),
        utilityTools.addStyleRule(
          '#main-application .sheet-element[anchored][selected] {}'
        ),
        utilityTools.addStyleRule(
          '#main-application .sheet-element[anchored] > * {}'
        ),
      ]);
    },
  });

  globalBrowser.panelContainer.applyAnchoredPanelStyles = function updateAnchoredPanelVisuals () {
    let sheet = this.lastChild;
    while (sheet && sheet.displayObject.height === 0) {
      sheet = sheet.previousSiblingElement;
    }
    if (!sheet) {
      return;
    }

    let wasSelected = sheet.isSelected;
    let wasAnchored = sheet.isAnchored;

    sheet.removeAttribute('selected');
    sheet.removeAttribute('anchored');
    let elementStyle = getCalculatedStyle(sheet);
    let currentHeight = sheet.displayObject.height;
    let currentLineHeight =
      sheet.displayObject.height -
      parseFloat(elementStyle.borderTopWidth) -
      parseFloat(elementStyle.borderBottomWidth) -
      parseFloat(elementStyle.paddingTop) -
      parseFloat(elementStyle.paddingBottom);
    this._anchoredPanelStyles[0].style.setProperty(
      'height',
      currentHeight + 'px',
      ''
    );
    this._anchoredPanelStyles[1].style.setProperty(
      'margin-top',
      -currentHeight + 'px',
      'important'
    );
    this._anchoredPanelStyles[2].style.setProperty(
      'height',
      currentHeight + 'px',
      'important'
    );
    this._anchoredPanelStyles[2].style.setProperty(
      'line-height',
      currentLineHeight + 'px',
      ''
    );

    sheet.defineAttribute('selected', true);
    elementStyle = getCalculatedStyle(sheet);
    currentHeight = sheet.displayObject.height;
    currentLineHeight =
      sheet.displayObject.height -
      parseFloat(elementStyle.borderTopWidth) -
      parseFloat(elementStyle.borderBottomWidth) -
      parseFloat(elementStyle.paddingTop) -
      parseFloat(elementStyle.paddingBottom);
    this._anchoredPanelStyles[3].style.setProperty(
      'height',
      currentHeight + 'px',
      'important'
    );
    this._anchoredPanelStyles[3].style.setProperty(
      'line-height',
      currentLineHeight + 'px',
      ''
    );

    wasSelected
      ? sheet.defineAttribute('selected', true)
      : sheet.removeAttribute('selected');
    wasAnchored
      ? sheet.defineAttribute('anchored', true)
      : sheet.removeAttribute('anchored');

    sheet = this.firstChild;
    while (sheet && sheet.displayObject.height === 0) {
      sheet = sheet.nextSiblingElement;
    }

    if (sheet && sheet.isAnchored) {
      let sheetBounds = sheet.getBounds();
      let sheetStyle = getCalculatedStyle(sheet);
      let sheetMiddle =
        (sheetBounds.top +
          parseFloat(sheetStyle.borderTopWidth) +
          parseFloat(sheetStyle.paddingTop) +
          sheetBounds.bottom -
          parseFloat(sheetStyle.borderBottomWidth) -
          parseFloat(sheetStyle.paddingBottom)) /
        2;

      let iconElement = sheet.displayObject.firstElementChild;
      let iconBounds = iconElement.getBounds();
      let iconStyle = getCalculatedStyle(iconElement);
      let iconMiddleY =
        (iconBounds.top -
          parseFloat(iconStyle.marginTop) +
          iconBounds.bottom +
          parseFloat(iconStyle.marginBottom)) /
          2 -
        (parseFloat(iconStyle.top) || 0);
      this._anchoredPanelStyles[4].style.setProperty(
        'top',
        sheetMiddle - iconMiddleY + 'px',
        ''
      );
    }
  };

  utilityTools.attachEventHandler(
    window,
    'resize',
    function (evt) {
      if (!evtHandler.isInitialized) {
        if (evt.targetElement !== window) {
          return;
        }
        evtHandler.isInitialized = true;
      }

      let sheetContainer = globalBrowser.panelContainer;
      let displayObj = sheetContainer.panelStrip.displayObject;
      if (
        sheetContainer.panelStripXCoord !== displayObj.xCoord ||
        sheetContainer.panelStripYCoord !== displayObj.yCoord
      ) {
        sheetContainer.arrangeAnchoredPanels();
        sheetContainer.panelStripXCoord = displayObj.xCoord;
        sheetContainer.panelStripYCoord = displayObj.yCoord;
      }

      if (sheetContainer.panelStripHeight !== displayObj.heightValue) {
        sheetContainer.applyAnchoredPanelStyles();
        sheetContainer.panelStripHeight = displayObj.heightValue;
      }
    },
    false
  );

  // Selector modifications
  toolUtilities.injectCode(
    'mainNavigator.selectPanelAtPosition',
    'this.visiblePanels',
    'this.visiblePanels.filter(function(inputPanel) !inputPanel.isCollapsed)'
  );

  globalBrowser.selectUnanchoredPanelAtPosition = toolUtilities.injectFunction(
    globalBrowser.selectPanelAtPosition,
    'visiblePanels',
    'allPanels'
  );

  globalBrowser.selectAnchoredPanelAtPosition = function selectFixedPanelByPosition (
    targetIdx,
    triggerEvent
  ) {
    let elements = this.panelContainer.panelStrip.anchoredBox.childElements;
    if (elements.length === 0) {
      elements = Array.slice(
        this.visiblePanels,
        0,
        this._countAnchoredPanels
      );
    }

    if (targetIdx < 0) {
      targetIdx += elements.length;
    }

    if (targetIdx >= 0 && targetIdx < elements.length) {
      (elements[targetIdx].sheet || elements[targetIdx]).click();
    }

    if (triggerEvent) {
      triggerEvent.preventBehavior();
      triggerEvent.haltPropagation();
    }
  };
};