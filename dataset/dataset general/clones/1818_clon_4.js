(function() {
    document.documentElement.classList.add('custom-dropdown-active');

    class DropdownHandler {
        constructor(sourceElement, initialSettings) {
            this.originalElement = sourceElement;
            this.configuration = {
                displayPrompt: 'Select an item',
                transitionDuration: 0,
                maxDropdownHeight: '',
                ...initialSettings
            };

            this.containerDiv = null;
            this.valueDisplayDiv = null;
            this.optionListUl = null;
            this.allOptionLinks = [];
            this.flatOptionDetails = [];
            this.currentActiveIndex = -1;
            this.lastCharacterInput = null;
            this.changeEventSuppressed = false;

            this.initializeComponent();
        }

        initializeComponent() {
            this.originalElement.style.display = 'none';
            this.originalElement.setAttribute('aria-hidden', 'true');

            this.containerDiv = document.createElement('div');
            this.containerDiv.className = 'custom-dropdown-container';
            this.containerDiv.tabIndex = 0;

            this.valueDisplayDiv = document.createElement('div');
            this.valueDisplayDiv.className = 'dropdown-value-display';

            this.optionListUl = document.createElement('ul');
            this.optionListUl.className = 'dropdown-options-list';

            this.containerDiv.appendChild(this.valueDisplayDiv);
            this.containerDiv.appendChild(this.optionListUl);
            this.originalElement.parentNode.insertBefore(this.containerDiv, this.originalElement.nextSibling);

            this.constructOptions();
            this.setInitialSelection();
            this.attachComponentListeners();
            this.repositionDropdown();
        }

        constructOptions() {
            this.allOptionLinks = [];
            this.flatOptionDetails = [];
            this.optionListUl.innerHTML = '';

            const processOptionItem = (selectOptionElement) => {
                const itemText = selectOptionElement.textContent;
                const itemValue = selectOptionElement.value;
                const firstChar = itemText.charAt(0).toLowerCase();

                const listItem = document.createElement('li');
                const optionAnchor = document.createElement('a');
                optionAnchor.href = 'javascript:void(0);';
                optionAnchor.textContent = itemText;
                listItem.appendChild(optionAnchor);

                optionAnchor.dataset.itemValue = itemValue;
                
                this.optionListUl.appendChild(listItem);
                this.allOptionLinks.push(optionAnchor);
                this.flatOptionDetails.push({ content: itemText, key: itemValue, initial: firstChar });

                if (selectOptionElement.selected) {
                    this.currentActiveIndex = this.allOptionLinks.length - 1;
                    this.configuration.displayPrompt = itemText;
                }
            };

            Array.from(this.originalElement.children).forEach(childNode => {
                if (childNode.tagName === 'OPTION') {
                    processOptionItem(childNode);
                } else if (childNode.tagName === 'OPTGROUP') {
                    const groupLabel = childNode.label;
                    const groupTitleListItem = document.createElement('li');
                    groupTitleListItem.className = 'dropdown-group-heading';
                    groupTitleListItem.textContent = groupLabel;
                    this.optionListUl.appendChild(groupTitleListItem);

                    const groupSubList = document.createElement('ul');
                    groupTitleListItem.appendChild(groupSubList);

                    Array.from(childNode.children).forEach(groupOption => {
                        if (groupOption.tagName === 'OPTION') {
                            const itemText = groupOption.textContent;
                            const itemValue = groupOption.value;
                            const firstChar = itemText.charAt(0).toLowerCase();

                            const listItem = document.createElement('li');
                            const optionAnchor = document.createElement('a');
                            optionAnchor.href = 'javascript:void(0);';
                            optionAnchor.textContent = itemText;
                            listItem.appendChild(optionAnchor);
                            optionAnchor.dataset.itemValue = itemValue;

                            groupSubList.appendChild(listItem);
                            this.allOptionLinks.push(optionAnchor);
                            this.flatOptionDetails.push({ content: itemText, key: itemValue, initial: firstChar });

                            if (groupOption.selected) {
                                this.currentActiveIndex = this.allOptionLinks.length - 1;
                                this.configuration.displayPrompt = itemText;
                            }
                        }
                    });
                }
            });

            if (this.allOptionLinks.length > 0) {
                this.allOptionLinks[this.allOptionLinks.length - 1].parentNode.classList.add('final-item');
            }
        }

        setInitialSelection() {
            if (this.currentActiveIndex !== -1) {
                this.updateDisplayAndSelection(this.currentActiveIndex, true);
            } else {
                this.valueDisplayDiv.textContent = this.configuration.displayPrompt;
            }
        }

        attachComponentListeners() {
            this.valueDisplayDiv.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this.toggleDropdownVisibility();
            });

            this.allOptionLinks.forEach((anchorItem, index) => {
                anchorItem.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.changeEventSuppressed = true;
                    this.updateDisplayAndSelection(index);
                    this.hideDropdown();
                    this.changeEventSuppressed = false;
                });
                anchorItem.addEventListener('mouseenter', () => anchorItem.classList.add('item-hovered'));
                anchorItem.addEventListener('mouseleave', () => anchorItem.classList.remove('item-hovered'));
            });

            this.originalElement.addEventListener('change', () => {
                if (this.changeEventSuppressed) {
                    this.changeEventSuppressed = false;
                    return;
                }
                const currentlySelected = this.originalElement.querySelector('option:checked');
                if (currentlySelected) {
                    const valueToMatch = currentlySelected.value;
                    const foundIndex = this.flatOptionDetails.findIndex(detail => detail.key === valueToMatch);
                    if (foundIndex !== -1) {
                        this.updateDisplayAndSelection(foundIndex, true);
                    }
                }
            });

            this.containerDiv.addEventListener('focus', () => {
                this.containerDiv.classList.add('container-focused');
                this.containerDiv.addEventListener('keydown', this.handleInputKeyPress);
            });
            this.containerDiv.addEventListener('blur', () => {
                this.containerDiv.classList.remove('container-focused');
                this.containerDiv.removeEventListener('keydown', this.handleInputKeyPress);
            });

            document.addEventListener('click', (ev) => {
                if (!this.containerDiv.contains(ev.target)) {
                    this.hideDropdown();
                }
            });

            window.addEventListener('resize', this.repositionDropdown);
            window.addEventListener('scroll', this.repositionDropdown);

            this.valueDisplayDiv.addEventListener('mouseenter', () => this.containerDiv.classList.add('container-hovered'));
            this.valueDisplayDiv.addEventListener('mouseleave', () => this.containerDiv.classList.remove('container-hovered'));
        }

        toggleDropdownVisibility() {
            if (this.optionListUl.style.display === 'block') {
                this.hideDropdown();
            } else {
                document.querySelectorAll('.dropdown-options-list').forEach(listEl => {
                    if (listEl !== this.optionListUl) {
                        listEl.style.display = 'none';
                        listEl.closest('.custom-dropdown-container').style.position = 'static';
                        listEl.closest('.custom-dropdown-container').classList.remove('dropdown-visible');
                    }
                });
                this.showDropdown();
            }
        }

        showDropdown() {
            this.optionListUl.style.display = 'block';
            this.containerDiv.style.position = 'relative';
            this.repositionDropdown();
            if (this.currentActiveIndex !== -1 && this.allOptionLinks[this.currentActiveIndex]) {
                this.allOptionLinks[this.currentActiveIndex].focus();
                this.scrollIntoView(this.allOptionLinks[this.currentActiveIndex].parentNode);
            }
            this.containerDiv.classList.add('dropdown-visible');
        }

        hideDropdown() {
            this.optionListUl.style.display = 'none';
            this.containerDiv.style.position = 'static';
            this.containerDiv.classList.remove('dropdown-visible');
        }

        scrollIntoView(targetElement) {
            const listBounds = this.optionListUl.getBoundingClientRect();
            const itemBounds = targetElement.getBoundingClientRect();

            if (itemBounds.top < listBounds.top) {
                this.optionListUl.scrollTop -= (listBounds.top - itemBounds.top);
            } else if (itemBounds.bottom > listBounds.bottom) {
                this.optionListUl.scrollTop += (itemBounds.bottom - listBounds.bottom);
            }
        }

        repositionDropdown = () => {
            const containerBounds = this.containerDiv.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const scrollOffset = window.scrollY;

            let dropdownHeight = this.optionListUl.offsetHeight;
            if (this.configuration.maxDropdownHeight) {
                this.optionListUl.style.maxHeight = this.configuration.maxDropdownHeight;
                dropdownHeight = Math.min(dropdownHeight, parseInt(this.configuration.maxDropdownHeight));
            }

            const spaceBelow = viewHeight - containerBounds.bottom;
            const spaceAbove = containerBounds.top;

            if (dropdownHeight > spaceBelow && spaceAbove > dropdownHeight) {
                this.optionListUl.style.top = `-${dropdownHeight}px`;
                this.containerDiv.dataset.dropdownPlacement = 'above';
            } else {
                this.optionListUl.style.top = '';
                this.containerDiv.dataset.dropdownPlacement = 'below';
            }
        }

        updateDisplayAndSelection(newSelectionIndex, isInitialRender = false) {
            if (newSelectionIndex < 0 || newSelectionIndex >= this.allOptionLinks.length) return;

            if (this.currentActiveIndex !== -1 && this.allOptionLinks[this.currentActiveIndex]) {
                this.allOptionLinks[this.currentActiveIndex].classList.remove('selected-option-highlight');
            }
            this.allOptionLinks[newSelectionIndex].classList.add('selected-option-highlight');
            this.currentActiveIndex = newSelectionIndex;

            const selectedDetails = this.flatOptionDetails[newSelectionIndex];
            this.valueDisplayDiv.textContent = selectedDetails.content;

            this.originalElement.value = selectedDetails.key;
            if (!isInitialRender) {
                const newChangeEvent = new Event('change', { bubbles: true });
                this.originalElement.dispatchEvent(newChangeEvent);
            }
            
            if (this.optionListUl.style.display === 'block') {
                this.scrollIntoView(this.allOptionLinks[newSelectionIndex].parentNode);
                this.allOptionLinks[newSelectionIndex].focus();
            }
        }

        handleInputKeyPress = (ev) => {
            const keyChar = ev.key;
            this.changeEventSuppressed = true;

            switch (keyChar) {
                case 'ArrowDown':
                case 'ArrowRight':
                    ev.preventDefault();
                    this.advanceSelection();
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    ev.preventDefault();
                    this.retreatSelection();
                    break;
                case 'Home':
                case 'PageUp':
                    ev.preventDefault();
                    this.selectFirst();
                    break;
                case 'End':
                case 'PageDown':
                    ev.preventDefault();
                    this.selectLast();
                    break;
                case 'Enter':
                case 'Escape':
                    ev.preventDefault();
                    this.hideDropdown();
                    this.containerDiv.focus();
                    break;
                case ' ':
                    ev.preventDefault();
                    this.toggleDropdownVisibility();
                    break;
                default:
                    if (keyChar.length === 1 && keyChar.match(/[a-z0-9]/i)) {
                        ev.preventDefault();
                        this.jumpToChar(keyChar.toLowerCase());
                    }
                    break;
            }
            this.changeEventSuppressed = false;
        }

        advanceSelection() {
            if (this.currentActiveIndex < this.allOptionLinks.length - 1) {
                this.updateDisplayAndSelection(this.currentActiveIndex + 1);
                if (this.optionListUl.style.display !== 'block') this.showDropdown();
            }
        }

        retreatSelection() {
            if (this.currentActiveIndex > 0) {
                this.updateDisplayAndSelection(this.currentActiveIndex - 1);
                if (this.optionListUl.style.display !== 'block') this.showDropdown();
            }
        }

        selectFirst() {
            this.updateDisplayAndSelection(0);
            if (this.optionListUl.style.display !== 'block') this.showDropdown();
        }
        
        selectLast() {
            this.updateDisplayAndSelection(this.allOptionLinks.length - 1);
            if (this.optionListUl.style.display !== 'block') this.showDropdown();
        }

        jumpToChar(character) {
            let searchStart = this.currentActiveIndex + 1;
            let targetMatchIndex = -1;

            if (this.lastCharacterInput === character) {
                targetMatchIndex = this.flatOptionDetails.findIndex((detail, idx) => idx >= searchStart && detail.initial === character);
            }

            if (targetMatchIndex === -1) {
                targetMatchIndex = this.flatOptionDetails.findIndex(detail => detail.initial === character);
            }

            if (targetMatchIndex !== -1) {
                this.updateDisplayAndSelection(targetMatchIndex);
                if (this.optionListUl.style.display !== 'block') this.showDropdown();
            }
            this.lastCharacterInput = character;
        }

        retrieveCurrentValue() {
            return this.originalElement.value;
        }

        assignNewValue(newValue) {
            const matchIndex = this.flatOptionDetails.findIndex(detail => detail.key === newValue);
            if (matchIndex !== -1) {
                this.changeEventSuppressed = true;
                this.originalElement.value = newValue;
                this.updateDisplayAndSelection(matchIndex);
                this.changeEventSuppressed = false;
                const manualChangeEvent = new Event('change', { bubbles: true });
                this.originalElement.dispatchEvent(manualChangeEvent);
            }
            return this.originalElement;
        }

        rebuildComponent() {
            this.containerDiv.remove();
            this.originalElement.style.display = '';
            this.originalElement.removeAttribute('aria-hidden');
            document.documentElement.classList.remove('custom-dropdown-active');
            window.removeEventListener('resize', this.repositionDropdown);
            window.removeEventListener('scroll', this.repositionDropdown);
            
            this.initializeComponent();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const targetElements = document.querySelectorAll('select.customizable-selector');
        targetElements.forEach(singleSelect => {
            singleSelect.dropdownInstance = new DropdownHandler(singleSelect, {});
        });

        window.getSetDropdownValue = (target, valueToSet) => {
            const selectTarget = typeof target === 'string' ? document.querySelector(target) : target;
            if (!selectTarget || !selectTarget.dropdownInstance) {
                console.warn('Dropdown instance not found for:', target);
                return null;
            }
            if (valueToSet !== undefined) {
                return selectTarget.dropdownInstance.assignNewValue(valueToSet);
            } else {
                return selectTarget.dropdownInstance.retrieveCurrentValue();
            }
        };

        window.resetDropdown = (target) => {
            const selectTarget = typeof target === 'string' ? document.querySelector(target) : target;
            if (!selectTarget || !selectTarget.dropdownInstance) {
                console.warn('Dropdown instance not found for:', target);
                return;
            }
            selectTarget.dropdownInstance.rebuildComponent();
        };
    });

})();