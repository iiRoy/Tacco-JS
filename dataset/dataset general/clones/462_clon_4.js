(function (assertionTool) {
  assertionTool.describe('ComponentPanelBehavioralTests', function() {

    this.timeout(1500);

    var panelContainerIdentifier = '#mainPanelContainer',
        maskedLinkText = 'Concealed Link Description';

    var configurationSettings = {
      parentSelector: panelContainerIdentifier,
      accordionItemSelector: '.componentPanelItem',
      headerSelector: '.componentPanelItemHeader',
      hiddenAreaSelector: '.componentPanelHideArea',
      visibleAreaClass: 'visibleComponentPanelItem',
      hiddenLinkDescription: maskedLinkText,
      speed: 1
    };

    var clearPanelContent = function() {
      var container = document.querySelector(panelContainerIdentifier);
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };

    var constructPanelElements = function() {
      clearPanelContent();
      var containerElement = document.querySelector(panelContainerIdentifier);
      var panelRows = [];

      for (let indexValue = 0; indexValue < 5; ++indexValue) {
        var listItem = document.createElement('li');
        listItem.className = 'componentPanelItem';

        var headerDiv = document.createElement('div');
        headerDiv.className = 'componentPanelItemHeader';
        headerDiv.textContent = 'Header ' + indexValue;
        listItem.appendChild(headerDiv);

        var contentDiv = document.createElement('div');
        contentDiv.className = 'componentPanelHideArea';
        contentDiv.textContent = 'Item ' + indexValue;
        listItem.appendChild(contentDiv);

        panelRows.push(listItem);
      }

      for (let jdx = panelRows.length - 1; jdx >= 0; --jdx) {
        containerElement.insertBefore(panelRows[jdx], containerElement.firstChild);
      }
    };

    var isDomElementVisible = function(elementNode) {
      if (!elementNode) return false;
      var computedStyle = window.getComputedStyle(elementNode);
      return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0' &&
             (elementNode.offsetWidth > 0 || elementNode.offsetHeight > 0);
    };

    var verifyElementDisplay = function(accordionInstanceRef, recordIndex, shouldBeVisibleStatus) {
      var targetRecordElement = accordionInstanceRef.getRowEl(recordIndex);
      var concealedRegionElement = accordionInstanceRef._getHiddenArea(recordIndex);

      assertionTool.expect(isDomElementVisible(targetRecordElement.querySelector(accordionInstanceRef._showHeaderLabelSelector))).to.be(!shouldBeVisibleStatus);
      assertionTool.expect(isDomElementVisible(targetRecordElement.querySelector(accordionInstanceRef._hideHeaderLabelSelector))).to.be(shouldBeVisibleStatus);
      assertionTool.expect(isDomElementVisible(concealedRegionElement)).to.be(shouldBeVisibleStatus);
      assertionTool.expect(concealedRegionElement.classList.contains(accordionInstanceRef._visibleAreaClass)).to.be(shouldBeVisibleStatus);
    };

    beforeEach(constructPanelElements);
    afterEach(clearPanelContent);

    assertionTool.describe('ComponentPanelInitialization', function() {
      assertionTool.it('invalid configuration. creation failure', function() {
        var currentTestCount = 0;

        var testConfigurations = [
          {
            errorMessage: 'a11yAccordion - no element(s) with parentSelector was found',
            settings: {
              parentSelector: undefined,
              accordionItemSelector: '.componentPanelItem',
              headerSelector: '.componentPanelItemHeader',
              hiddenAreaSelector: '.componentPanelHideArea',
              visibleAreaClass: 'visibleComponentPanelItem'
            }
          },
          {
            errorMessage: 'a11yAccordion - no element(s) with accordionItemSelector was found',
            settings: {
              parentSelector: '#mainPanelContainer',
              accordionItemSelector: 'non-existent-item',
              headerSelector: '.componentPanelItemHeader',
              hiddenAreaSelector: '.componentPanelHideArea',
              visibleAreaClass: 'visibleComponentPanelItem'
            }
          },
          {
            errorMessage: 'a11yAccordion - no element(s) with headerSelector was found',
            settings: {
              parentSelector: '#mainPanelContainer',
              accordionItemSelector: '.componentPanelItem',
              headerSelector: 'non-existent-header',
              hiddenAreaSelector: '.componentPanelHideArea',
              visibleAreaClass: 'visibleComponentPanelItem'
            }
          },
          {
            errorMessage: 'a11yAccordion - no element(s) with hiddenAreaSelector was found',
            settings: {
              parentSelector: '#mainPanelContainer',
              accordionItemSelector: '.componentPanelItem',
              headerSelector: '.componentPanelItemHeader',
              hiddenAreaSelector: 'non-existent-area',
              visibleAreaClass: 'visibleComponentPanelItem'
            }
          }
        ];

        testConfigurations.forEach(function(testSituation) {
          try {
            new A11yAccordion(testSituation.settings);
          } catch (issue) {
            currentTestCount = currentTestCount + 1;
            assertionTool.expect(issue).to.equal(testSituation.errorMessage);
          }
        });

        assertionTool.expect(currentTestCount).to.equal(testConfigurations.length);
      });

      assertionTool.describe('valid configuration. creation success', function() {
        var doesSearchElementExist = function(accordionInstanceRef) {
          return !!accordionInstanceRef.el.querySelector('.a11yAccordionSearch');
        };

        assertionTool.it('Default initialization', function() {
          var accordionObject = new A11yAccordion(configurationSettings),
              headerLinkHiddenElement, headerTextElement, rowElement;

          assertionTool.expect(accordionObject.el.id).to.equal('mainPanelContainer'.substring(1));
          assertionTool.expect(accordionObject._accordionHideAreas.length).to.equal(5);
          assertionTool.expect(doesSearchElementExist(accordionObject)).to.be.true;
          assertionTool.expect(Array.from(accordionObject.el.querySelectorAll('.' + accordionObject._visibleAreaClass)).filter(isDomElementVisible).length).to.equal(0);

          rowElement = accordionObject.getRowEl(1);
          assertionTool.expect(Array.from(rowElement.querySelectorAll('.' + accordionObject._visibleAreaClass)).filter(isDomElementVisible).length).to.equal(0);

          verifyElementDisplay(accordionObject, 1, false);

          headerTextElement = rowElement.querySelector('.a11yAccordionItemHeaderText');
          headerLinkHiddenElement = rowElement.querySelector('.a11yAccordionItemHeaderLinkHiddenLabel');

          assertionTool.expect(headerTextElement).to.not.be.null;
          assertionTool.expect(headerTextElement.textContent).to.equal('Header 1');

          assertionTool.expect(headerLinkHiddenElement).to.not.be.null;
          assertionTool.expect(headerLinkHiddenElement.textContent).to.equal('Concealed Link Description');
        });

        assertionTool.it('Custom visual theme', function() {
          var customSettings = JSON.parse(JSON.stringify(configurationSettings));
          customSettings.colorScheme = 'myCustomTheme';

          var accordionObject = new A11yAccordion(customSettings),
              rowElement = accordionObject.getRowEl(1);

          assertionTool.expect(rowElement.querySelector('.a11yAccordionItemHeader').classList.contains('myCustomTheme-a11yAccordion-header')).to.be.true;
          assertionTool.expect(rowElement.querySelector('.a11yAccordionHideArea').classList.contains('myCustomTheme-a11yAccordion-area')).to.be.true;
        });

        assertionTool.it('Without search component', function() {
          var customSettings = JSON.parse(JSON.stringify(configurationSettings));
          customSettings.showSearch = false;

          var accordionObject = new A11yAccordion(customSettings);

          assertionTool.expect(doesSearchElementExist(accordionObject)).to.be.false;
        });
      });
    });

    assertionTool.describe('SearchMechanism', function() {
      assertionTool.it('Standard text search', function() {
        var accordionObject = new A11yAccordion(configurationSettings),
            mainElement = accordionObject.el,
            searchField = mainElement.querySelector('.a11yAccordionSearch');

        var activateSearchInput = function(inputText, anticipatedRowCount) {
          searchField.value = inputText;
          var keyUpEvent = new KeyboardEvent('keyup', {
            key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true
          });
          searchField.dispatchEvent(keyUpEvent);

          var visibleItems = Array.from(mainElement.querySelectorAll('.componentPanelItem')).filter(isDomElementVisible);
          assertionTool.expect(visibleItems.length).to.equal(anticipatedRowCount);

          if (!anticipatedRowCount) {
            assertionTool.expect(!!mainElement.querySelector(panelContainerIdentifier + '-noResultsItem')).to.be.true;
          }
        };

        assertionTool.expect(!!searchField).to.be.true;

        activateSearchInput('NonExistentText', 0);

        activateSearchInput('Header 3', 1);

        activateSearchInput('', 5);
      });

      assertionTool.it('Comprehensive content search', function() {
        var customSettings = JSON.parse(JSON.stringify(configurationSettings));
        customSettings.overallSearch = true;

        var accordionObject = new A11yAccordion(customSettings),
            mainElement = accordionObject.el,
            searchField = mainElement.querySelector('.a11yAccordionSearch');

        var activateSearchInput = function(inputText, anticipatedRowCount) {
          searchField.value = inputText;
          var keyUpEvent = new KeyboardEvent('keyup', {
            key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true
          });
          searchField.dispatchEvent(keyUpEvent);

          var visibleItems = Array.from(mainElement.querySelectorAll('.componentPanelItem')).filter(isDomElementVisible);
          assertionTool.expect(visibleItems.length).to.equal(anticipatedRowCount);

          if (!anticipatedRowCount) {
            assertionTool.expect(!!mainElement.querySelector(panelContainerIdentifier + '-noResultsItem')).to.be.true;
          }
        };

        assertionTool.expect(!!searchField).to.be.true;

        activateSearchInput('NonExistentContent', 0);

        activateSearchInput('Item 3', 1);

        activateSearchInput('', 5);
      });
    });

    assertionTool.describe('revealPanelRow() and _expandSection()', function() {
      assertionTool.it('basic functionality', function(completionCallback) {
        var customSettings = JSON.parse(JSON.stringify(configurationSettings));
        customSettings.onAreaShow = function(displayedElement) {
          assertionTool.expect(displayedElement.length).to.equal(1);
          verifyElementDisplay(accordionObject, 2, true);
          completionCallback();
        };

        var accordionObject = new A11yAccordion(customSettings);

        verifyElementDisplay(accordionObject, 2, false);

        accordionObject.uncollapseRow(2);
      });

      assertionTool.it('singlePanelMode is enabled', function(completionCallback) {
        var accordionObject = new A11yAccordion(configurationSettings);

        verifyElementDisplay(accordionObject, 2, false);

        accordionObject._onAreaShow = function() {
          var actionCounter = 0;

          accordionObject._onAreaShow = function() {
            processCompletion(++actionCounter);
          };
          accordionObject._onAreaHide = function() {
            processCompletion(++actionCounter);
          };

          var processCompletion = function(currentCount) {
            if (currentCount !== 2) {
              return;
            }

            verifyElementDisplay(accordionObject, 2, false);
            verifyElementDisplay(accordionObject, 3, true);
            completionCallback();
          };

          verifyElementDisplay(accordionObject, 2, true);
          accordionObject.uncollapseRow(3);
        };

        accordionObject.uncollapseRow(2);
      });

      assertionTool.it('singlePanelMode is disabled', function(completionCallback) {
        var customSettings = JSON.parse(JSON.stringify(configurationSettings));
        customSettings.showOne = false;

        var accordionObject = new A11yAccordion(customSettings);

        verifyElementDisplay(accordionObject, 2, false);

        accordionObject._onAreaShow = function() {
          accordionObject._onAreaShow = function() {
            verifyElementDisplay(accordionObject, 2, true);
            verifyElementDisplay(accordionObject, 3, true);
            completionCallback();
          };

          verifyElementDisplay(accordionObject, 2, true);
          accordionObject.uncollapseRow(3);
        };

        accordionObject.uncollapseRow(2);
      });
    });

    assertionTool.it('concealPanelRow() and _contractSection()', function(completionCallback) {
      var customSettings = JSON.parse(JSON.stringify(configurationSettings));
      customSettings.onAreaHide = function(hiddenElement) {
        assertionTool.expect(hiddenElement.length).to.equal(1);
        verifyElementDisplay(accordionObject, 2, false);
        completionCallback();
      };

      var accordionObject = new A11yAccordion(customSettings);

      accordionObject._onAreaShow = function() {
        verifyElementDisplay(accordionObject, 2, true);

        accordionObject.collapseRow(2);
      };

      accordionObject.uncollapseRow(2);
    });

    assertionTool.it('switchPanelRowState()', function(completionCallback) {
      var customSettings = JSON.parse(JSON.stringify(configurationSettings));
      customSettings.onAreaHide = function(hiddenElement) {
        verifyElementDisplay(accordionObject, 2, false);
        completionCallback();
      };
      customSettings.onAreaShow = function(displayedElement) {
        verifyElementDisplay(accordionObject, 2, true);
        accordionObject.toggleRow(2);
      };

      var accordionObject = new A11yAccordion(customSettings);
      verifyElementDisplay(accordionObject, 2, false);

      accordionObject.toggleRow(2);
    });

    assertionTool.it('retrievePanelRowElement()', function() {
      var accordionObject = new A11yAccordion(configurationSettings),
          retrievedRow;

      retrievedRow = accordionObject.getRowEl(-1);
      assertionTool.expect(retrievedRow).to.be.undefined;

      retrievedRow = accordionObject.getRowEl(2);
      assertionTool.expect(retrievedRow.id).to.equal('mainPanelContainer-row-2');
    });

    assertionTool.it('_contractAllPanels()', function(completionCallback) {
      var customSettings = JSON.parse(JSON.stringify(configurationSettings)),
          operationCount = 0;

      customSettings.showOne = false;
      customSettings.onAreaHide = function(hiddenElement) {
        operationCount++;

        if (operationCount === 2) {
          verifyElementDisplay(accordionObject, 2, false);
          verifyElementDisplay(accordionObject, 3, false);
          completionCallback();
        }
      };
      customSettings.onAreaShow = function(displayedElement) {
        operationCount++;

        if (operationCount === 2) {
          operationCount = 0;

          verifyElementDisplay(accordionObject, 2, true);
          verifyElementDisplay(accordionObject, 3, true);

          accordionObject._collapseAll();
        }
      };

      var accordionObject = new A11yAccordion(customSettings);

      verifyElementDisplay(accordionObject, 2, false);
      verifyElementDisplay(accordionObject, 3, false);

      accordionObject.uncollapseRow(2);
      accordionObject.uncollapseRow(3);
    });

    assertionTool.it('_getConcealedPanelArea()', function() {
      var accordionObject = new A11yAccordion(configurationSettings),
          concealedElement;

      concealedElement = accordionObject._getHiddenArea(-1);

      assertionTool.expect(concealedElement).to.be.undefined;

      concealedElement = accordionObject._getHiddenArea(1);
      assertionTool.expect(concealedElement).to.not.be.undefined;
      assertionTool.expect(isDomElementVisible(concealedElement)).to.be.false;
    });

  });
})(chai.expect);