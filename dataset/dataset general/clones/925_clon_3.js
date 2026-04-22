(function (ngCore, browserAgent) {
  'use strict';

  let modifierKeyForMultiSelection = 'ctrlKey';

  if (browserAgent.appVersion.indexOf("Mac") >= 0) {
    modifierKeyForMultiSelection = 'metaKey';
  }

  const isWhitespaceOnly = (textValue) => /^\s*$/.test(textValue);

  function extractNodeLayout(domRoot, mainHost) {
    let layoutSnippet;
    const initialHostChildren = Array.from(mainHost.childNodes);

    for (const currentChild of initialHostChildren) {
      // Remove child from the main host to process it
      mainHost.removeChild(currentChild);

      if (currentChild.nodeName === 'LI') {
        if (layoutSnippet) {
          throw new Error('Hierarchy explorer container must define only a single LI template.');
        }

        let shouldWrapContent = false;
        let visibleElementCount = 0;
        const currentChildElements = Array.from(currentChild.childNodes);

        // Determine if content needs to be wrapped in a DIV
        for (const nestedItem of currentChildElements) {
          if (nestedItem.nodeName === '#text') {
            if (!isWhitespaceOnly(nestedItem.nodeValue)) {
              shouldWrapContent = true;
              break;
            }
          } else { // Element node
            visibleElementCount++;
            if (visibleElementCount > 1) {
              shouldWrapContent = true;
              break;
            }
          }
        }

        // If wrapping is needed or no elements are present, create a wrapper
        if (shouldWrapContent || visibleElementCount === 0) {
          const contentWrapper = domRoot.createElement('DIV');
          while (currentChild.childNodes.length > 0) {
            contentWrapper.appendChild(currentChild.childNodes[0]);
          }
          currentChild.appendChild(contentWrapper);
        }
        
        const nestedContainer = domRoot.createElement('UL');
        nestedContainer.className = mainHost.className;
        currentChild.appendChild(nestedContainer);

        layoutSnippet = ngCore.element(currentChild);
        layoutSnippet.addClass('hie-node-item');
      }
    }

    // Return the extracted layout or a default one if none was found
    return layoutSnippet || ngCore.element('<li class="hie-node-item"><div>{{dataObject}}</div><ul></ul></li>');
  }

  function locateAncestorNode(checkElement) {
    let currentElement = checkElement;
    while (currentElement) {
      if (currentElement.nodeName === 'LI' && currentElement.classList.contains('hie-node-item')) {
        return ngCore.element(currentElement);
      }
      currentElement = currentElement.parentNode;
    }
    return null;
  }

  function traverseChildren(parentElement, processingFunction) {
    ngCore.forEach(parentElement.children('li'), function (childNodeItem) {
      const currentNode = ngCore.element(childNodeItem);

      if (processingFunction(parentElement, currentNode) !== false) {
        traverseChildren(currentNode.children().eq(1), processingFunction);
      }
    });
  }

  function initializeTreeComponent(elementRef, attributeSet, compilerService, documentService) {
    const nodeLayout = extractNodeLayout(documentService[0], elementRef[0]);
    const dataSourceExpression = attributeSet.source || attributeSet.hieExplorer;
    const iterationSpecifier = nodeLayout[0].getAttribute('for-each');
    let itemContextAlias = 'dataObject';
    let childCollectionPath = 'dataObject.children';
    const selectionHandlerExpression = nodeLayout.attr('on-select');
    const selectionStateAttribute = nodeLayout.attr('is-selected');

    if (iterationSpecifier) {
      const parts = iterationSpecifier.split(/\s+in\s+/).map(p => p.trim());
      if (parts.length !== 2 || !parts[0].match(/^\w+$/)) {
        throw new Error(`Invalid iteration expression: "${iterationSpecifier}". Expected "alias in collectionPath".`);
      }
      itemContextAlias = parts[0];
      childCollectionPath = `${itemContextAlias}.${parts[1]}`;
    }

    elementRef.addClass('hierarchy-explorer');

    const treeComponent = {
      isMultiSelectEnabled: 'multiple' in attributeSet,
      baseElement: elementRef,
      modelExpression: dataSourceExpression,
      itemCompiler: compilerService(nodeLayout),
      itemContextAlias: itemContextAlias,
      childCollectionPath: childCollectionPath,

      childDataWatcher: (currentScope) => currentScope.$eval(treeComponent.childCollectionPath),
      primaryDataWatcher: (currentScope) => currentScope.$eval(treeComponent.modelExpression),

      retrieveDataItem: function (currentScope) {
        return currentScope.$eval(this.itemContextAlias);
      },

      assignDataItem: function (currentScope, value) {
        currentScope[this.itemContextAlias] = value;
      },

      isSelectionTracked: !!selectionHandlerExpression || !!selectionStateAttribute,

      updateSelectionStatus: function (nodeScope, newStatus) {
        if (this.isSelectionTracked) {
          nodeScope.$selected = newStatus;
          if (selectionHandlerExpression) {
            nodeScope.$eval(selectionHandlerExpression);
          }
        }
      }
    };

    if (treeComponent.isSelectionTracked) {
      elementRef.on('click', function (eventObject) {
        const activeNodeElement = locateAncestorNode(eventObject.target);
        const activeNodeScope = activeNodeElement ? activeNodeElement.scope() : null;
        const isModifierPressed = eventObject[modifierKeyForMultiSelection];

        if (isModifierPressed && treeComponent.isMultiSelectEnabled) {
          if (activeNodeScope) {
            activeNodeScope.$apply(() => {
              treeComponent.updateSelectionStatus(activeNodeScope, !activeNodeScope.$selected);
            });
          }
        } else {
          traverseChildren(elementRef, function (parentElement, currentNode) {
            const nodeScope = currentNode.scope();
            // Deselect all nodes that are currently selected, unless it's the active node
            // and the active node is already selected (in single-select, clicking selected does nothing)
            if (nodeScope && nodeScope.$selected && (!activeNodeElement || currentNode[0] !== activeNodeElement[0])) {
                nodeScope.$apply(() => {
                    treeComponent.updateSelectionStatus(nodeScope, false);
                });
            }
            return true;
          });

          if (activeNodeScope && !activeNodeScope.$selected) {
            activeNodeScope.$apply(() => {
              treeComponent.updateSelectionStatus(activeNodeScope, true);
            });
          }
        }
      });
    }

    return treeComponent;
  }

  function appendNewNode(currentScope, treeComponent, parentListElement, dataObject, insertionIndex) {
    const nodeScope = currentScope.$new();
    treeComponent.assignDataItem(nodeScope, dataObject);

    const nodeElement = treeComponent.itemCompiler(nodeScope, ngCore.noop);

    if (treeComponent.isSelectionTracked) {
      nodeScope.$selected = false;
    }

    insertNodeAtPosition(parentListElement, nodeElement, insertionIndex);

    const childrenContainer = nodeElement.children().eq(1);

    renderTreeStructure(nodeScope, treeComponent, childrenContainer, treeComponent.childDataWatcher);
  }

  function insertNodeAtPosition(targetList, elementToInsert, position) {
    const currentChildren = targetList.children();
    if (position < 0 || position >= currentChildren.length) {
      targetList.append(elementToInsert);
    } else if (position === 0) {
      targetList.prepend(elementToInsert);
    } else {
      currentChildren.eq(position - 1).after(elementToInsert);
    }
  }

  function renderTreeStructure(currentScope, treeComponent, listElement, dataWatcher) {
    currentScope.$watch(dataWatcher, (updatedCollection, previousCollection) => {
      if (!updatedCollection || updatedCollection.length === 0) {
        Array.from(listElement.children()).forEach(childNode => {
          const childNgElement = ngCore.element(childNode);
          const childScope = childNgElement.scope();
          if (childScope && childScope.$selected) {
            treeComponent.updateSelectionStatus(childScope, false);
          }
          childNgElement.remove();
        });
        return;
      }

      const existingElementMap = new Map();
      Array.from(listElement.children()).forEach(childNode => {
        const childNgElement = ngCore.element(childNode);
        const childScope = childNgElement.scope();
        if (childScope) {
          const dataObj = treeComponent.retrieveDataItem(childScope);
          existingElementMap.set(dataObj, { element: childNgElement, scope: childScope });
        } else {
          childNgElement.remove();
        }
      });

      const newOrderFragment = document.createDocumentFragment();
      const elementsToKeep = new Set();

      for (let dataIndex = 0; dataIndex < updatedCollection.length; dataIndex++) {
        const currentDataObject = updatedCollection[dataIndex];
        let nodeElement;

        if (existingElementMap.has(currentDataObject)) {
          const { element } = existingElementMap.get(currentDataObject);
          nodeElement = element;
          elementsToKeep.add(currentDataObject);
        } else {
          const nodeScope = currentScope.$new();
          treeComponent.assignDataItem(nodeScope, currentDataObject);
          nodeElement = treeComponent.itemCompiler(nodeScope, ngCore.noop);
          if (treeComponent.isSelectionTracked) {
            nodeScope.$selected = false;
          }
        }
        newOrderFragment.appendChild(nodeElement[0]);
      }

      for (const [dataObj, { element, scope }] of existingElementMap.entries()) {
        if (!elementsToKeep.has(dataObj)) {
          if (scope && scope.$selected) {
            treeComponent.updateSelectionStatus(scope, false);
          }
          element.remove();
        }
      }

      while(listElement[0].firstChild) {
          listElement[0].removeChild(listElement[0].firstChild);
      }
      
      listElement.append(newOrderFragment);

    }, true);
  }

  ngCore.module('hierarchyExplorerModule', []).
    directive('hieExplorer', ['$compile', '$document', function (compilerService, documentService) {
      return {
        restrict: 'EA',
        compile: function (elementRef, attributeSet) {
          const treeComponent = initializeTreeComponent(elementRef, attributeSet, compilerService, documentService);

          return function linkFunction(currentScope, elementRef, attributeSet) {
            renderTreeStructure(currentScope, treeComponent, elementRef, treeComponent.primaryDataWatcher);
          };
        }
      };
    }]);

})(angular, navigator);