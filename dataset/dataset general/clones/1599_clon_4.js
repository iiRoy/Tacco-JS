const activeCustomSelectInstances = new Set();
let globalKeyBuffer = {
    value: '',
    timeoutId: null
};

function dismissAllCustomSelectPanels() {
    activeCustomSelectInstances.forEach(instance => instance.hideOptionsPanel());
}

document.addEventListener('click', (event) => {
    let clickedInsideCustomSelect = false;
    for (const instance of activeCustomSelectInstances) {
        if (instance.containerElement.contains(event.target)) {
            clickedInsideCustomSelect = true;
            break;
        }
    }
    if (!clickedInsideCustomSelect) {
        dismissAllCustomSelectPanels();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        dismissAllCustomSelectPanels();
    }
});

class CustomSelectManager {
    constructor(originalSelectElement, userConfiguration) {
        if (!(originalSelectElement instanceof HTMLSelectElement)) {
            throw new Error('Input must be an HTMLSelectElement.');
        }

        this.sourceElement = originalSelectElement;
        this.configuration = {
            multiItemDisplay: false,
            outerContainerClass: 'alternative-select-wrapper',
            optionMenuClass: 'alternative-select-menu',
            displayTriggerClass: 'alternative-select-trigger',
            markedOptionClass: 'option-marked',
            activeTriggerClass: 'trigger-active',
            calculateMenuWidth: true,
            keyboardNavigation: true
        };

        if (userConfiguration) {
            Object.assign(this.configuration, userConfiguration);
        }

        this.outerContainer = null;
        this.displayTrigger = null;
        this.optionMenu = null;
        this.menuOptionLinks = [];
        this.menuOptionTexts = [];
        this.currentlyHighlightedItem = null;

        this.cachedMenuWidth = 0;

        this.initializeComponent();
        activeCustomSelectInstances.add(this);
    }

    initializeComponent() {
        this.sourceElement.style.display = 'none';

        this.outerContainer = document.createElement('div');
        this.outerContainer.classList.add(this.configuration.outerContainerClass);
        if (this.sourceElement.className) {
            this.outerContainer.classList.add(...this.sourceElement.className.split(' '));
        }
        this.sourceElement.parentNode.insertBefore(this.outerContainer, this.sourceElement);
        this.outerContainer.appendChild(this.sourceElement);

        this.displayTrigger = document.createElement('span');
        this.displayTrigger.classList.add(this.configuration.displayTriggerClass);
        this.displayTrigger.setAttribute('tabindex', '0');
        this.outerContainer.appendChild(this.displayTrigger);

        this.optionMenu = document.createElement('ul');
        this.optionMenu.classList.add(this.configuration.optionMenuClass);
        this.optionMenu.style.position = 'absolute';
        this.optionMenu.style.zIndex = '9999';
        this.optionMenu.style.display = 'none';
        this.outerContainer.appendChild(this.optionMenu);

        this.populateMenuOptions();
        this.updateDisplayValue();

        this.attachComponentListeners();
    }

    populateMenuOptions() {
        Array.from(this.sourceElement.options).forEach(originalOption => {
            const menuItem = document.createElement('li');
            const menuLink = document.createElement('a');
            menuLink.href = '#';
            menuLink.textContent = originalOption.textContent;
            menuLink.dataset.originalIndex = originalOption.index;

            this.menuOptionLinks.push(menuLink);
            this.menuOptionTexts.push(originalOption.textContent.toLowerCase());

            if (this.sourceElement.multiple && originalOption.selected) {
                menuLink.classList.add(this.configuration.markedOptionClass);
            }

            menuItem.appendChild(menuLink);
            this.optionMenu.appendChild(menuItem);
        });
    }

    attachComponentListeners() {
        this.displayTrigger.addEventListener('click', this.toggleOptionMenu.bind(this));
        this.optionMenu.addEventListener('click', this.processOptionSelection.bind(this));

        if (this.configuration.keyboardNavigation) {
            this.displayTrigger.addEventListener('keydown', this.handleKeyboardEvents.bind(this));
            this.optionMenu.addEventListener('mouseover', this.handleMenuItemHover.bind(this));
        }
    }

    handleMenuItemHover(event) {
        if (event.target.tagName === 'A') {
            if (this.currentlyHighlightedItem) {
                this.currentlyHighlightedItem.classList.remove('hover');
            }
            event.target.classList.add('hover');
            this.currentlyHighlightedItem = event.target;
        }
    }

    processOptionSelection(event) {
        event.preventDefault();
        const selectedLink = event.target.closest('a');
        if (!selectedLink) return;

        const originalIndex = parseInt(selectedLink.dataset.originalIndex, 10);
        const originalOption = this.sourceElement.options[originalIndex];

        if (!this.sourceElement.multiple) {
            Array.from(this.sourceElement.options).forEach(opt => opt.selected = false);
            this.menuOptionLinks.forEach(link => link.classList.remove(this.configuration.markedOptionClass));

            originalOption.selected = true;
            selectedLink.classList.add(this.configuration.markedOptionClass);
            this.hideOptionsPanel();
        } else {
            originalOption.selected = !originalOption.selected;
            if (originalOption.selected) {
                selectedLink.classList.add(this.configuration.markedOptionClass);
            } else {
                selectedLink.classList.remove(this.configuration.markedOptionClass);
            }
        }

        this.updateDisplayValue();
        this.sourceElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    updateDisplayValue() {
        const selectedOptions = Array.from(this.sourceElement.options).filter(opt => opt.selected);
        let displayContent = '';

        if (selectedOptions.length === 0) {
            displayContent = this.sourceElement.getAttribute('placeholder') || '&nbsp;';
        } else if (this.sourceElement.multiple) {
            if (selectedOptions.length > 1 && this.configuration.multiItemDisplay) {
                displayContent = this.configuration.multiItemDisplay;
            } else {
                displayContent = selectedOptions.map(opt => opt.textContent).join(', ');
            }
        } else {
            displayContent = selectedOptions[0].textContent;
        }
        this.displayTrigger.innerHTML = displayContent;
    }

    toggleOptionMenu() {
        if (this.optionMenu.style.display === 'none') {
            dismissAllCustomSelectPanels();
            this.showOptionsPanel();
        } else {
            this.hideOptionsPanel();
        }
    }

    showOptionsPanel() {
        this.optionMenu.style.display = 'block';
        this.displayTrigger.classList.add(this.configuration.activeTriggerClass);
        this.adjustMenuDimensions();
        this.displayTrigger.focus();
    }

    hideOptionsPanel() {
        this.optionMenu.style.display = 'none';
        this.displayTrigger.classList.remove(this.configuration.activeTriggerClass);
        if (this.currentlyHighlightedItem) {
            this.currentlyHighlightedItem.classList.remove('hover');
            this.currentlyHighlightedItem = null;
        }
    }

    adjustMenuDimensions() {
        if (this.optionMenu.style.display === 'none') return;

        const currentTriggerWidth = this.displayTrigger.offsetWidth;
        if (this.cachedMenuWidth === currentTriggerWidth) return;

        let targetWidth = currentTriggerWidth;
        if (this.configuration.calculateMenuWidth) {
            const computedStyle = getComputedStyle(this.optionMenu);
            const borderLeft = parseFloat(computedStyle.borderLeftWidth);
            const borderRight = parseFloat(computedStyle.borderRightWidth);
            targetWidth -= (borderLeft + borderRight);
        }
        this.optionMenu.style.minWidth = `${targetWidth}px`;

        let maxOptionTextWidth = 0;
        this.menuOptionLinks.forEach(link => {
            const tempMeasurer = document.createElement('div');
            tempMeasurer.style.position = 'absolute';
            tempMeasurer.style.visibility = 'hidden';
            tempMeasurer.style.whiteSpace = 'nowrap';
            tempMeasurer.textContent = link.textContent;
            document.body.appendChild(tempMeasurer);
            maxOptionTextWidth = Math.max(maxOptionTextWidth, tempMeasurer.offsetWidth);
            document.body.removeChild(tempMeasurer);
        });

        if (maxOptionTextWidth > targetWidth) {
            this.optionMenu.style.width = `${maxOptionTextWidth}px`;
        } else {
            this.optionMenu.style.width = 'auto';
        }

        this.cachedMenuWidth = currentTriggerWidth;
    }

    handleKeyboardEvents(event) {
        if (this.optionMenu.style.display === 'none') return;

        const allMenuLinks = Array.from(this.optionMenu.querySelectorAll('li > a'));
        if (allMenuLinks.length === 0) return;

        let currentHighlightIndex = -1;
        if (this.currentlyHighlightedItem) {
            currentHighlightIndex = allMenuLinks.indexOf(this.currentlyHighlightedItem);
        }

        let nextHighlightItem = null;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                nextHighlightItem = allMenuLinks[currentHighlightIndex > 0 ? currentHighlightIndex - 1 : allMenuLinks.length - 1];
                break;
            case 'ArrowDown':
                event.preventDefault();
                nextHighlightItem = allMenuLinks[currentHighlightIndex < allMenuLinks.length - 1 ? currentHighlightIndex + 1 : 0];
                break;
            case 'Enter':
                event.preventDefault();
                if (this.currentlyHighlightedItem) {
                    this.currentlyHighlightedItem.click();
                }
                break;
            default:
                if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
                    event.preventDefault();
                    clearTimeout(globalKeyBuffer.timeoutId);
                    globalKeyBuffer.value += event.key.toLowerCase();

                    let matchIndex = -1;
                    for (let i = 0; i < this.menuOptionTexts.length; i++) {
                        if (this.menuOptionTexts[i].startsWith(globalKeyBuffer.value)) {
                            matchIndex = i;
                            break;
                        }
                    }

                    if (matchIndex !== -1) {
                        nextHighlightItem = allMenuLinks[matchIndex];
                    }

                    globalKeyBuffer.timeoutId = setTimeout(() => {
                        globalKeyBuffer.value = '';
                    }, 400);
                } else {
                    return;
                }
        }

        if (nextHighlightItem) {
            if (this.currentlyHighlightedItem) {
                this.currentlyHighlightedItem.classList.remove('hover');
            }
            nextHighlightItem.classList.add('hover');
            this.currentlyHighlightedItem = nextHighlightItem;

            const menuScrollTop = this.optionMenu.scrollTop;
            const menuHeight = this.optionMenu.clientHeight;
            const itemOffsetTop = nextHighlightItem.offsetTop;
            const itemHeight = nextHighlightItem.offsetHeight;

            if (itemOffsetTop < menuScrollTop) {
                this.optionMenu.scrollTop = itemOffsetTop;
            } else if (itemOffsetTop + itemHeight > menuScrollTop + menuHeight) {
                this.optionMenu.scrollTop = itemOffsetTop + itemHeight - menuHeight;
            }
        }
    }

    removeComponent() {
        this.displayTrigger.removeEventListener('click', this.toggleOptionMenu.bind(this));
        this.optionMenu.removeEventListener('click', this.processOptionSelection.bind(this));
        if (this.configuration.keyboardNavigation) {
            this.displayTrigger.removeEventListener('keydown', this.handleKeyboardEvents.bind(this));
            this.optionMenu.removeEventListener('mouseover', this.handleMenuItemHover.bind(this));
        }

        this.outerContainer.parentNode.insertBefore(this.sourceElement, this.outerContainer);
        this.sourceElement.style.display = '';
        this.outerContainer.remove();

        activeCustomSelectInstances.delete(this);
    }
}

window.initAlternativeSelects = function(selector, userConfiguration) {
    const targetElements = document.querySelectorAll(selector);
    targetElements.forEach(element => {
        if (element instanceof HTMLSelectElement) {
            new CustomSelectManager(element, userConfiguration);
        }
    });
};