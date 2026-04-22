(function (globalObject, navigationAgent) {
    'use strict';

    const selectionTriggerModifier = (navigationAgent.appVersion.includes("Mac")) ? 'metaKey' : 'ctrlKey';

    function generateElement(tag, attributes = {}, content = '') {
        const component = document.createElement(tag);
        for (const key in attributes) {
            component.setAttribute(key, attributes[key]);
        }
        if (content) {
            if (typeof content === 'string') {
                component.innerHTML = content;
            } else {
                component.appendChild(content);
            }
        }
        return component;
    }

    function extractItemBlueprint(sourceDocument, structureContainer) {
        let blueprintElement = null;

        const childrenSnapshot = Array.from(structureContainer.childNodes);
        for (const childNode of childrenSnapshot) {
            structureContainer.removeChild(childNode);

            if (childNode.nodeName === 'LI') {
                if (blueprintElement) {
                    throw new Error('Structure container must contain only a single LI blueprint.');
                }
                blueprintElement = childNode;

                let needsWrapper = false;
                let explicitContentCount = 0;
                const grandChildrenSnapshot = Array.from(blueprintElement.childNodes);

                for (const innerNode of grandChildrenSnapshot) {
                    if (innerNode.nodeType === Node.TEXT_NODE) {
                        if (!/^\s*$/.test(innerNode.nodeValue)) {
                            needsWrapper = true;
                            break;
                        }
                    } else {
                        explicitContentCount++;
                        if (explicitContentCount > 1) {
                            needsWrapper = true;
                            break;
                        }
                    }
                }

                if (needsWrapper || explicitContentCount === 0) {
                    const wrapperComponent = generateElement('DIV');
                    while (blueprintElement.childNodes.length > 0) {
                        wrapperComponent.appendChild(blueprintElement.childNodes[0]);
                    }
                    blueprintElement.appendChild(wrapperComponent);
                }

                const childListContainer = generateElement('UL', { class: structureContainer.className });
                blueprintElement.appendChild(childListContainer);

                blueprintElement.classList.add('display-node');
            }
        }

        if (!blueprintElement) {
            const defaultLi = generateElement('LI', { class: 'display-node' });
            const defaultDiv = generateElement('DIV', {}, '{{itemData}}');
            const defaultUl = generateElement('UL');
            defaultLi.appendChild(defaultDiv);
            defaultLi.appendChild(defaultUl);
            blueprintElement = defaultLi;
        }

        return blueprintElement;
    }

    function renderTemplate(templateNode, dataObject, keyIdentifier) {
        const clonedNode = templateNode.cloneNode(true);
        const textNodes = [];

        function gatherTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                for (const child of node.childNodes) {
                    gatherTextNodes(child);
                }
            }
        }
        gatherTextNodes(clonedNode);

        for (const textNode of textNodes) {
            let content = textNode.nodeValue;
            content = content.replace(new RegExp(`{{\\s*${keyIdentifier}\\s*}}`, 'g'), () => {
                return dataObject != null ? String(dataObject) : '';
            });
            textNode.nodeValue = content;
        }

        return clonedNode;
    }

    function findClosestContainer(startElement) {
        let current = startElement;
        while (current && (current.nodeName !== 'LI' || !current.classList.contains('display-node'))) {
            current = current.parentNode;
        }
        return current;
    }

    function walkTreeComponents(rootContainer, processCallback) {
        const childComponents = Array.from(rootContainer.children);
        for (const childElem of childComponents) {
            if (childElem.nodeName === 'LI' && childElem.classList.contains('display-node')) {
                if (processCallback(rootContainer, childElem) !== false) {
                    const childList = childElem.children[childElem.children.length - 1];
                    if (childList && childList.nodeName === 'UL') {
                        walkTreeComponents(childList, processCallback);
                    }
                }
            }
        }
    }

    const componentDataStore = new WeakMap();

    class NestedStructureManager {
        constructor(rootElement, configuration) {
            if (!rootElement || rootElement.nodeName !== 'UL') {
                throw new Error('Root component must be an UL.');
            }

            this.primaryContainer = rootElement;
            this.configuration = {
                multiSelectCapable: 'multiple' in configuration.attributes,
                itemBlueprint: null,
                dataKeyIdentifier: 'itemData',
                childDataPath: 'children',
                selectionActive: !!configuration.attributes.onSelect,
                selectedStatusField: configuration.attributes.selectedStatus || '_isSelected',
                selectionAction: configuration.attributes.onSelect ? new Function('nodeItem', 'isSelected', configuration.attributes.onSelect) : null
            };

            this.configuration.itemBlueprint = extractItemBlueprint(document, this.primaryContainer);

            const itemIterationAttribute = this.configuration.itemBlueprint.getAttribute('each-item');
            if (itemIterationAttribute) {
                const match = /^\s*(\w+)\s+in\s+(.*?)\s*$/.exec(itemIterationAttribute);
                if (!match) {
                    throw new Error('Invalid item iteration expression: "' + itemIterationAttribute + '". Must follow "name in collection".');
                }
                this.configuration.dataKeyIdentifier = match[1];
                this.configuration.childDataPath = match[2];
            }

            this.primaryContainer.classList.add('display-tree');

            this.currentSelections = new Set();

            if (this.configuration.selectionActive) {
                this.primaryContainer.addEventListener('click', this.handleComponentClick.bind(this));
            }
        }

        getComponentDataItem(domComponent) {
            return componentDataStore.get(domComponent);
        }

        setComponentSelectionState(domComponent, dataItem, isSelected) {
            if (this.configuration.selectionActive) {
                if (this.configuration.selectedStatusField) {
                    dataItem[this.configuration.selectedStatusField] = isSelected;
                }

                if (isSelected) {
                    domComponent.classList.add('is-selected');
                    this.currentSelections.add(dataItem);
                } else {
                    domComponent.classList.remove('is-selected');
                    this.currentSelections.delete(dataItem);
                }

                if (this.configuration.selectionAction) {
                    this.configuration.selectionAction(dataItem, isSelected);
                }
            }
        }

        handleComponentClick(event) {
            const clickedComponent = findClosestContainer(event.target);

            if (!clickedComponent) return;

            const clickedDataItem = this.getComponentDataItem(clickedComponent);
            if (!clickedDataItem) return;

            const isCurrentlySelected = clickedDataItem[this.configuration.selectedStatusField] || false;

            if (event[selectionTriggerModifier] && this.configuration.multiSelectCapable) {
                this.setComponentSelectionState(clickedComponent, clickedDataItem, !isCurrentlySelected);
            } else {
                this.currentSelections.forEach(selectedItem => {
                    if (selectedItem !== clickedDataItem) {
                        walkTreeComponents(this.primaryContainer, (parentUl, itemLi) => {
                            if (this.getComponentDataItem(itemLi) === selectedItem) {
                                this.setComponentSelectionState(itemLi, selectedItem, false);
                                return false;
                            }
                        });
                    }
                });

                if (!isCurrentlySelected) {
                    this.setComponentSelectionState(clickedComponent, clickedDataItem, true);
                }
            }
        }

        updateStructure(listContainer, incomingDataList) {
            if (!Array.isArray(incomingDataList)) incomingDataList = [];

            const oldDomComponents = Array.from(listContainer.children);
            const oldDataItemToDomMap = new Map();

            oldDomComponents.forEach(domComponent => {
                const data = componentDataStore.get(domComponent);
                if (data) {
                    oldDataItemToDomMap.set(data, domComponent);
                }
            });

            const newDomComponentsOrdered = [];

            incomingDataList.forEach(itemEntry => {
                let itemDomComponent;
                if (oldDataItemToDomMap.has(itemEntry)) {
                    itemDomComponent = oldDataItemToDomMap.get(itemEntry);
                    oldDataItemToDomMap.delete(itemEntry);
                } else {
                    itemDomComponent = renderTemplate(this.configuration.itemBlueprint, itemEntry, this.configuration.dataKeyIdentifier);
                    componentDataStore.set(itemDomComponent, itemEntry);
                    if (this.configuration.selectionActive && itemEntry[this.configuration.selectedStatusField]) {
                         itemDomComponent.classList.add('is-selected');
                         this.currentSelections.add(itemEntry);
                    }
                }
                newDomComponentsOrdered.push(itemDomComponent);

                const childListElement = itemDomComponent.children[itemDomComponent.children.length - 1];
                const childrenData = itemEntry[this.configuration.childDataPath];
                if (childListElement && childListElement.nodeName === 'UL') {
                    this.updateStructure(childListElement, Array.isArray(childrenData) ? childrenData : []);
                }
            });

            oldDataItemToDomMap.forEach((domComponent, dataItem) => {
                if (dataItem[this.configuration.selectedStatusField]) {
                    this.setComponentSelectionState(domComponent, dataItem, false);
                }
                domComponent.remove();
            });

            if (newDomComponentsOrdered.length === 0) {
                listContainer.innerHTML = '';
            } else {
                let currentChild = listContainer.firstElementChild;
                for (let i = 0; i < newDomComponentsOrdered.length; i++) {
                    const newElem = newDomComponentsOrdered[i];
                    if (currentChild === newElem) {
                        currentChild = currentChild.nextElementSibling;
                    } else if (currentChild) {
                        listContainer.insertBefore(newElem, currentChild);
                    } else {
                        listContainer.appendChild(newElem);
                    }
                }
                while (currentChild) {
                    const nextChild = currentChild.nextElementSibling;
                    const removedDataItem = componentDataStore.get(currentChild);
                    if (removedDataItem && removedDataItem[this.configuration.selectedStatusField]) {
                        this.setComponentSelectionState(currentChild, removedDataItem, false);
                    }
                    currentChild.remove();
                    currentChild = nextChild;
                }
            }
        }

        initialize(initialData) {
            this.updateStructure(this.primaryContainer, initialData);
        }
    }

    globalObject.HierarchyDisplay = function(element, options) {
        const instance = new NestedStructureManager(element, options);

        let initialData = [];
        if (options.data) {
            if (typeof options.data === 'function') {
                initialData = options.data();
            } else if (Array.isArray(options.data)) {
                initialData = options.data;
            }
        }
        instance.initialize(initialData);
        return instance;
    };

})(window, navigator);