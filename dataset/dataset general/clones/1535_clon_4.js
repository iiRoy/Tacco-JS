function createSegmentedSelector(originalSelectElement, configuration) {
    const defaultSettings = {
        inactiveClass: 'dormant-item',
        keyActions: [32, 13],
        doubleClickTransfer: false,
        availableHeader: null,
        availableFooter: null,
        chosenHeader: null,
        chosenFooter: null,
        allowGroupTransfer: true,
        componentClass: '',
        onDisplayInit: null,
        onTransfer: null,
        onRevert: null
    };

    const currentConfig = { ...defaultSettings, ...configuration };

    const sourceElement = originalSelectElement;
    let mainWrapper = document.createElement('div');
    mainWrapper.className = 'dlm-wrapper ' + currentConfig.componentClass;

    let availablePanel = document.createElement('div');
    availablePanel.className = 'dlm-available-options';
    let chosenPanel = document.createElement('div');
    chosenPanel.className = 'dlm-chosen-options';

    let availableList = document.createElement('ul');
    availableList.className = 'dlm-item-list';
    availableList.tabIndex = -1;
    let chosenList = document.createElement('ul');
    chosenList.className = 'dlm-item-list';
    chosenList.tabIndex = -1;

    let visibleItemQuery = 'li:not(.dlm-group-header,.dlm-group-wrapper,.' + currentConfig.inactiveClass + ')';

    // Helper to generate a unique key for value mapping
    const generateUniqueKey = (val) => {
        let h = 0, i, l = val.length;
        for (i = 0; i < l; i++) {
            h = ((h << 5) - h) + val.charCodeAt(i);
            h |= 0;
        }
        return `key-${h < 0 ? 'neg' + Math.abs(h) : h}`;
    };

    // Helper to escape HTML entities
    const cleanseText = (rawText) => {
        let tempDiv = document.createElement('div');
        tempDiv.textContent = rawText;
        return tempDiv.innerHTML;
    };

    const createOptionView = (optElement, insertionIndex, groupIdentifier) => {
        const optionSource = optElement;
        const valueKey = optionSource.value;
        const displayLabel = cleanseText(optionSource.textContent);
        const originalAttributes = Array.from(optionSource.attributes)
            .filter(attr => attr.name !== 'value' && attr.name !== 'disabled')
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');

        let availableItem = document.createElement('li');
        availableItem.setAttribute('data-dlm-val', valueKey);
        availableItem.className = 'dlm-item-available';
        availableItem.innerHTML = `<span>${displayLabel}</span>`;
        availableItem.id = `dlm-available-${generateUniqueKey(valueKey)}`;
        availableItem.setAttribute('original-attrs', originalAttributes);

        let chosenItem = availableItem.cloneNode(true);
        chosenItem.className = 'dlm-item-chosen';
        chosenItem.id = `dlm-chosen-${generateUniqueKey(valueKey)}`;

        if (optionSource.disabled || sourceElement.disabled) {
            availableItem.classList.add(currentConfig.inactiveClass);
            chosenItem.classList.add(currentConfig.inactiveClass);
        }

        if (groupIdentifier) {
            const groupKey = generateUniqueKey(groupIdentifier);
            let availableGroupWrapper = availableList.querySelector(`#dlm-group-available-${groupKey}`);
            let chosenGroupWrapper = chosenList.querySelector(`#dlm-group-chosen-${groupKey}`);

            if (!availableGroupWrapper) {
                const groupListTemplate = `<ul class="dlm-group-list"><li class="dlm-group-header"><span>${groupIdentifier}</span></li></ul>`;

                availableGroupWrapper = document.createElement('li');
                availableGroupWrapper.className = 'dlm-group-wrapper';
                availableGroupWrapper.id = `dlm-group-available-${groupKey}`;
                availableGroupWrapper.innerHTML = groupListTemplate;

                chosenGroupWrapper = document.createElement('li');
                chosenGroupWrapper.className = 'dlm-group-wrapper';
                chosenGroupWrapper.id = `dlm-group-chosen-${groupKey}`;
                chosenGroupWrapper.innerHTML = groupListTemplate;

                if (currentConfig.allowGroupTransfer) {
                    availableGroupWrapper.querySelector('.dlm-group-header').addEventListener('click', () => {
                        const valuesToTransfer = Array.from(optionSource.parentElement.children)
                            .filter(opt => opt.tagName === 'OPTION' && !opt.selected && !opt.disabled)
                            .map(opt => opt.value);
                        transferToRight(valuesToTransfer);
                    });
                    chosenGroupWrapper.querySelector('.dlm-group-header').addEventListener('click', () => {
                        const valuesToRevert = Array.from(optionSource.parentElement.children)
                            .filter(opt => opt.tagName === 'OPTION' && opt.selected && !opt.disabled)
                            .map(opt => opt.value);
                        transferToLeft(valuesToRevert);
                    });
                }
                availableList.appendChild(availableGroupWrapper);
                chosenList.appendChild(chosenGroupWrapper);
            }

            const availableGroupUl = availableGroupWrapper.querySelector('.dlm-group-list');
            const chosenGroupUl = chosenGroupWrapper.querySelector('.dlm-group-list');

            const actualIndex = insertionIndex === undefined ? availableGroupUl.children.length : insertionIndex + 1;
            if (availableGroupUl.children[actualIndex]) {
                availableGroupUl.insertBefore(availableItem, availableGroupUl.children[actualIndex]);
                chosenGroupUl.insertBefore(chosenItem, chosenGroupUl.children[actualIndex]);
            } else {
                availableGroupUl.appendChild(availableItem);
                chosenGroupUl.appendChild(chosenItem);
            }

        } else {
            const actualIndex = insertionIndex === undefined ? availableList.children.length : insertionIndex;
            if (availableList.children[actualIndex]) {
                availableList.insertBefore(availableItem, availableList.children[actualIndex]);
                chosenList.insertBefore(chosenItem, chosenList.children[actualIndex]);
            } else {
                availableList.appendChild(availableItem);
                chosenList.appendChild(chosenItem);
            }
        }
    };

    const incorporateNewChoice = (optionsData) => {
        const choices = Array.isArray(optionsData) ? optionsData : [optionsData];
        choices.forEach(choice => {
            if (choice.value !== undefined && choice.value !== null &&
                !sourceElement.querySelector(`option[value="${choice.value}"]`)) {

                const newOption = document.createElement('option');
                newOption.value = choice.value;
                newOption.textContent = choice.text;
                if (choice.disabled) {
                    newOption.disabled = true;
                }
                if (choice.attributes) {
                    for (const attrName in choice.attributes) {
                        newOption.setAttribute(attrName, choice.attributes[attrName]);
                    }
                }

                let targetContainer = sourceElement;
                if (choice.nested) {
                    let optgroup = sourceElement.querySelector(`optgroup[label="${choice.nested}"]`);
                    if (!optgroup) {
                        optgroup = document.createElement('optgroup');
                        optgroup.label = choice.nested;
                        sourceElement.appendChild(optgroup);
                    }
                    targetContainer = optgroup;
                }

                const index = parseInt(choice.index === undefined ? targetContainer.children.length : choice.index, 10);
                if (targetContainer.children[index]) {
                    targetContainer.insertBefore(newOption, targetContainer.children[index]);
                } else {
                    targetContainer.appendChild(newOption);
                }
                createOptionView(newOption, index, choice.nested);
            }
        });
    };

    const transferToRight = (valuesToMove, initialLoad = false) => {
        const valueArray = Array.isArray(valuesToMove) ? valuesToMove : [valuesToMove];
        const affectedKeys = valueArray.map(val => generateUniqueKey(val));

        let availableItems = availableList.querySelectorAll(affectedKeys.map(id => `#dlm-available-${id}`).join(', '));
        let chosenItems = chosenList.querySelectorAll(affectedKeys.map(id => `#dlm-chosen-${id}`).join(', '));

        if (!initialLoad) {
            availableItems = Array.from(availableItems).filter(el => !el.classList.contains(currentConfig.inactiveClass));
            chosenItems = Array.from(chosenItems).filter(el => !el.classList.contains(currentConfig.inactiveClass));
        }

        if (availableItems.length > 0) {
            availableItems.forEach(item => item.classList.add('dlm-transferred'));
            chosenItems.forEach(item => item.classList.add('dlm-transferred'));

            sourceElement.querySelectorAll('option').forEach(opt => {
                if (valueArray.includes(opt.value)) {
                    opt.selected = true;
                }
            });

            mainWrapper.querySelectorAll(visibleItemQuery).forEach(item => item.classList.remove('dlm-highlight'));

            const allAvailableGroupWrappers = availableList.querySelectorAll('.dlm-group-wrapper');
            if (allAvailableGroupWrappers.length > 0) {
                allAvailableGroupWrappers.forEach(groupWrapper => {
                    const groupItems = groupWrapper.querySelectorAll('.dlm-item-available');
                    if (Array.from(groupItems).every(item => item.classList.contains('dlm-transferred'))) {
                        groupWrapper.querySelector('.dlm-group-header').style.display = 'none';
                    }
                });

                const allChosenGroupWrappers = chosenList.querySelectorAll('.dlm-group-wrapper');
                allChosenGroupWrappers.forEach(groupWrapper => {
                    const groupItems = groupWrapper.querySelectorAll('.dlm-item-chosen');
                    if (Array.from(groupItems).some(item => item.classList.contains('dlm-transferred'))) {
                        groupWrapper.querySelector('.dlm-group-header').style.display = '';
                    }
                });
            }

            if (!initialLoad) {
                sourceElement.dispatchEvent(new Event('change', { bubbles: true }));
                if (typeof currentConfig.onTransfer === 'function') {
                    currentConfig.onTransfer.call(null, valueArray);
                }
            }
        }
    };

    const transferToLeft = (valuesToMove) => {
        const valueArray = Array.isArray(valuesToMove) ? valuesToMove : [valuesToMove];
        const affectedKeys = valueArray.map(val => generateUniqueKey(val));

        let availableItems = availableList.querySelectorAll(affectedKeys.map(id => `#dlm-available-${id}`).join(', '));
        let chosenItems = chosenList.querySelectorAll(affectedKeys.map(id => `#dlm-chosen-${id}`).join(', '));

        chosenItems = Array.from(chosenItems).filter(el =>
            el.classList.contains('dlm-transferred') && !el.classList.contains(currentConfig.inactiveClass)
        );

        if (chosenItems.length > 0) {
            availableItems.forEach(item => item.classList.remove('dlm-transferred'));
            chosenItems.forEach(item => item.classList.remove('dlm-transferred'));

            sourceElement.querySelectorAll('option').forEach(opt => {
                if (valueArray.includes(opt.value)) {
                    opt.selected = false;
                }
            });

            mainWrapper.querySelectorAll(visibleItemQuery).forEach(item => item.classList.remove('dlm-highlight'));

            const allAvailableGroupWrappers = availableList.querySelectorAll('.dlm-group-wrapper');
            if (allAvailableGroupWrappers.length > 0) {
                allAvailableGroupWrappers.forEach(groupWrapper => {
                    const groupItems = groupWrapper.querySelectorAll('.dlm-item-available');
                    if (Array.from(groupItems).some(item => !item.classList.contains('dlm-transferred'))) {
                        groupWrapper.querySelector('.dlm-group-header').style.display = '';
                    }
                });

                const allChosenGroupWrappers = chosenList.querySelectorAll('.dlm-group-wrapper');
                allChosenGroupWrappers.forEach(groupWrapper => {
                    const groupItems = groupWrapper.querySelectorAll('.dlm-item-chosen');
                    if (Array.from(groupItems).every(item => !item.classList.contains('dlm-transferred'))) {
                        groupWrapper.querySelector('.dlm-group-header').style.display = 'none';
                    }
                });
            }

            sourceElement.dispatchEvent(new Event('change', { bubbles: true }));
            if (typeof currentConfig.onRevert === 'function') {
                currentConfig.onRevert.call(null, valueArray);
            }
        }
    };

    const transferAllToRight = () => {
        const originalSelectedValues = Array.from(sourceElement.options)
            .filter(opt => opt.selected)
            .map(opt => opt.value);

        const valuesToTransfer = Array.from(sourceElement.options)
            .filter(opt => !opt.disabled)
            .map(opt => opt.value);

        sourceElement.querySelectorAll('option:not(:disabled)').forEach(opt => opt.selected = true);
        availableList.querySelectorAll('.dlm-item-available:not(.' + currentConfig.inactiveClass + ')').forEach(item => item.classList.add('dlm-transferred'));
        chosenList.querySelectorAll('.dlm-item-chosen:not(.' + currentConfig.inactiveClass + ')').forEach(item => item.classList.add('dlm-transferred'));

        availableList.querySelectorAll('.dlm-group-header').forEach(header => header.style.display = 'none');
        chosenList.querySelectorAll('.dlm-group-header').forEach(header => header.style.display = '');

        chosenList.focus();
        sourceElement.dispatchEvent(new Event('change', { bubbles: true }));

        if (typeof currentConfig.onTransfer === 'function') {
            const newlySelected = valuesToTransfer.filter(val => !originalSelectedValues.includes(val));
            currentConfig.onTransfer.call(null, newlySelected);
        }
    };

    const transferAllToLeft = () => {
        const originalSelectedValues = Array.from(sourceElement.options)
            .filter(opt => opt.selected)
            .map(opt => opt.value);

        sourceElement.querySelectorAll('option').forEach(opt => opt.selected = false);
        availableList.querySelectorAll('.dlm-item-available').forEach(item => item.classList.remove('dlm-transferred'));
        chosenList.querySelectorAll('.dlm-item-chosen').forEach(item => item.classList.remove('dlm-transferred'));

        availableList.querySelectorAll('.dlm-group-header').forEach(header => header.style.display = '');
        chosenList.querySelectorAll('.dlm-group-header').forEach(header => header.style.display = 'none');

        availableList.focus();
        sourceElement.dispatchEvent(new Event('change', { bubbles: true }));

        if (typeof currentConfig.onRevert === 'function') {
            currentConfig.onRevert.call(null, originalSelectedValues);
        }
    };

    let currentHighlightedItem = null;

    const updateHighlight = (listElement, direction) => {
        const visibleItems = Array.from(listElement.querySelectorAll(visibleItemQuery)).filter(item => {
            return !item.classList.contains('dlm-transferred') && item.offsetParent !== null;
        });
        if (visibleItems.length === 0) return;

        let currentIndex = -1;
        if (currentHighlightedItem && listElement.contains(currentHighlightedItem)) {
            currentIndex = visibleItems.indexOf(currentHighlightedItem);
        }

        let nextIndex;
        if (direction === 1) {
            nextIndex = (currentIndex === -1 || currentIndex === visibleItems.length - 1) ? 0 : currentIndex + 1;
        } else {
            nextIndex = (currentIndex === -1 || currentIndex === 0) ? visibleItems.length - 1 : currentIndex - 1;
        }

        if (currentHighlightedItem) {
            currentHighlightedItem.classList.remove('dlm-highlight');
        }
        currentHighlightedItem = visibleItems[nextIndex];
        currentHighlightedItem.classList.add('dlm-highlight');

        const itemHeight = currentHighlightedItem.offsetHeight;
        const listHeight = listElement.clientHeight;
        const itemTop = currentHighlightedItem.offsetTop;
        const listScrollTop = listElement.scrollTop;

        if (itemTop < listScrollTop) {
            listElement.scrollTop = itemTop;
        } else if (itemTop + itemHeight > listScrollTop + listHeight) {
            listElement.scrollTop = itemTop + itemHeight - listHeight;
        }
    };

    const performSelection = (listElement) => {
        if (currentHighlightedItem && listElement.contains(currentHighlightedItem)) {
            const value = currentHighlightedItem.dataset.dlmVal;
            if (listElement === availableList) {
                transferToRight(value);
            } else {
                transferToLeft(value);
            }
            currentHighlightedItem.classList.remove('dlm-highlight');
            currentHighlightedItem = null;
        }
    };

    const toggleActiveList = (currentList) => {
        currentList.blur();
        mainWrapper.querySelectorAll('.dlm-highlight').forEach(item => item.classList.remove('dlm-highlight'));
        currentHighlightedItem = null;

        if (currentList === availableList) {
            chosenList.focus();
        } else {
            availableList.focus();
        }
    };

    const enableKeyControls = (listElement) => {
        listElement.addEventListener('focus', () => {
            listElement.classList.add('dlm-active-list');
        });
        listElement.addEventListener('blur', () => {
            listElement.classList.remove('dlm-active-list');
            if (!mainWrapper.contains(document.activeElement) || (document.activeElement !== availableList && document.activeElement !== chosenList)) {
                 mainWrapper.querySelectorAll('.dlm-highlight').forEach(el => el.classList.remove('dlm-highlight'));
                 currentHighlightedItem = null;
            }
        });
        listElement.addEventListener('keydown', (e) => {
            switch (e.which) {
                case 40:
                case 38:
                    e.preventDefault();
                    e.stopPropagation();
                    updateHighlight(listElement, (e.which === 38) ? -1 : 1);
                    return;
                case 37:
                case 39:
                    e.preventDefault();
                    e.stopPropagation();
                    toggleActiveList(listElement);
                    return;
                case 9:
                    if (sourceElement.hasAttribute('tabindex')) {
                        e.preventDefault();
                        const currentTabIndex = parseInt(sourceElement.getAttribute('tabindex'), 10);
                        const nextTabIndex = e.shiftKey ? currentTabIndex - 1 : currentTabIndex + 1;
                        const nextFocusElement = document.querySelector(`[tabindex="${nextTabIndex}"]`);
                        if (nextFocusElement) {
                            nextFocusElement.focus();
                        } else {
                            if (e.shiftKey) sourceElement.focus();
                        }
                        return;
                    }
                    break;
            }
            if (currentConfig.keyActions.includes(e.which)) {
                e.preventDefault();
                e.stopPropagation();
                performSelection(listElement);
            }
        });
    };

    const enablePointerEvents = () => {
        document.body.addEventListener('mouseenter', (e) => {
            const target = e.target.closest(visibleItemQuery);
            if (target && mainWrapper.contains(target)) {
                mainWrapper.querySelectorAll('.dlm-highlight').forEach(el => el.classList.remove('dlm-highlight'));
                target.classList.add('dlm-highlight');
                currentHighlightedItem = target;
            }
        }, true);

        document.body.addEventListener('mouseleave', (e) => {
             const target = e.target.closest(visibleItemQuery);
             if (target && mainWrapper.contains(target) && !target.contains(e.relatedTarget)) {
                 target.classList.remove('dlm-highlight');
                 currentHighlightedItem = null;
             }
        }, true);

        const transferAction = currentConfig.doubleClickTransfer ? 'dblclick' : 'click';

        availableList.addEventListener(transferAction, (e) => {
            const item = e.target.closest('.dlm-item-available');
            if (item && !item.classList.contains(currentConfig.inactiveClass)) {
                transferToRight(item.dataset.dlmVal);
            }
        });

        chosenList.addEventListener(transferAction, (e) => {
            const item = e.target.closest('.dlm-item-chosen');
            if (item && !item.classList.contains(currentConfig.inactiveClass)) {
                transferToLeft(item.dataset.dlmVal);
            }
        });
    };

    const initializeComponent = () => {
        const existingWrapper = document.getElementById(`dlm-wrapper-${sourceElement.id}`);
        if (existingWrapper) {
            removeComponent();
        }

        sourceElement.style.position = 'absolute';
        sourceElement.style.left = '-9999px';
        sourceElement.id = sourceElement.id || `dlm-source-${Math.ceil(Math.random() * 1000000)}`;
        mainWrapper.id = `dlm-wrapper-${sourceElement.id}`;

        Array.from(sourceElement.children).forEach((child, index) => {
            if (child.tagName === 'OPTION') {
                createOptionView(child, index, null);
            } else if (child.tagName === 'OPTGROUP') {
                Array.from(child.children).forEach((option, optIndex) => {
                    createOptionView(option, optIndex, child.label);
                });
            }
        });

        chosenList.querySelectorAll('.dlm-group-header').forEach(header => header.style.display = 'none');

        if (currentConfig.availableHeader) {
            availablePanel.appendChild(currentConfig.availableHeader);
        }
        availablePanel.appendChild(availableList);
        if (currentConfig.availableFooter) {
            availablePanel.appendChild(currentConfig.availableFooter);
        }

        if (currentConfig.chosenHeader) {
            chosenPanel.appendChild(currentConfig.chosenHeader);
        }
        chosenPanel.appendChild(chosenList);
        if (currentConfig.chosenFooter) {
            chosenPanel.appendChild(currentConfig.chosenFooter);
        }

        mainWrapper.appendChild(availablePanel);
        mainWrapper.appendChild(chosenPanel);
        sourceElement.parentNode.insertBefore(mainWrapper, sourceElement.nextSibling);

        enablePointerEvents();
        enableKeyControls(availableList);
        enableKeyControls(chosenList);

        sourceElement.addEventListener('focus', () => {
            availableList.focus();
        });

        const selectedValues = Array.from(sourceElement.options)
            .filter(opt => opt.selected)
            .map(opt => opt.value);
        transferToRight(selectedValues, true);

        if (typeof currentConfig.onDisplayInit === 'function') {
            currentConfig.onDisplayInit.call(null, mainWrapper);
        }
    };

    const refreshDisplay = () => {
        removeComponent();
        initializeComponent();
    };

    const removeComponent = () => {
        const existingWrapper = document.getElementById(`dlm-wrapper-${sourceElement.id}`);
        if (existingWrapper) {
            existingWrapper.remove();
        }
        sourceElement.style.position = '';
        sourceElement.style.left = '';
        // Note: Global event listeners on `document.body` are not removed here,
        // but they are guarded by `mainWrapper.contains(target)` checks.
    };

    initializeComponent();

    return {
        transferToRight: transferToRight,
        transferToLeft: transferToLeft,
        transferAllToRight: transferAllToRight,
        transferAllToLeft: transferAllToLeft,
        addChoice: incorporateNewChoice,
        refreshDisplay: refreshDisplay,
        removeComponent: removeComponent,
        getComponentElement: () => mainWrapper,
        getSourceElement: () => sourceElement,
        getAvailableList: () => availableList,
        getChosenList: () => chosenList
    };
}