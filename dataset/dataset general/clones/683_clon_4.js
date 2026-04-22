class DropdownPresenter {
    constructor(originalElement, settings) {
        this.sourceElement = originalElement;
        this.configuration = settings || {};

        this.topOffset = this.configuration.topOffset || 0;
        this.leftOffset = this.configuration.leftOffset || 0;
        this.visibleOptionCount = this.configuration.size || 10;
        this.isHoverActivated = this.configuration.hoverOnly || (window.navigator && navigator.userAgent.match(/iphone|ipod|ipad/i));

        this.mainHousing = null;
        this.visualControl = null;
        this.valueDisplay = null;

        this._constructElements();
        this._applyInteractions();
        this._refreshDisplayedValue();
    }

    _constructElements() {
        this.sourceElement.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 1;';
        this.sourceElement.classList.add('custom-select-source');

        this.mainHousing = document.createElement('div');
        this.mainHousing.classList.add('custom-select-container');
        this.mainHousing.style.position = 'relative';

        this.visualControl = document.createElement('div');
        this.visualControl.classList.add('custom-select-display');
        this.visualControl.tabIndex = 0;

        this.valueDisplay = document.createElement('div');
        this.valueDisplay.classList.add('custom-select-value-text');

        this.visualControl.appendChild(this.valueDisplay);
        this.mainHousing.appendChild(this.visualControl);

        this.sourceElement.parentNode.insertBefore(this.mainHousing, this.sourceElement);
        this.mainHousing.appendChild(this.sourceElement);

        if (!this.isHoverActivated) {
            this.sourceElement.size = Math.min(this.sourceElement.options.length, this.visibleOptionCount);
        }
    }

    _fetchCurrentSelectionText() {
        const selectedIndex = this.sourceElement.selectedIndex;
        if (selectedIndex >= 0 && this.sourceElement.options[selectedIndex]) {
            return this.sourceElement.options[selectedIndex].textContent;
        }
        return '';
    }

    _refreshDisplayedValue() {
        this.valueDisplay.textContent = this._fetchCurrentSelectionText();
        const visualRect = this.visualControl.getBoundingClientRect();
        this.sourceElement.style.width = visualRect.width + 'px';
        this.sourceElement.style.height = visualRect.height + 'px';
        this.sourceElement.style.top = this.visualControl.offsetTop + 'px';
        this.sourceElement.style.left = this.visualControl.offsetLeft + 'px';
    }

    _controlDropdownVisibility(makeVisible) {
        if (makeVisible) {
            this.sourceElement.style.opacity = '1';
            this.sourceElement.style.pointerEvents = 'auto';
            this.mainHousing.classList.add('custom-select-active');
            setTimeout(() => this.sourceElement.focus(), 0);
        } else {
            this.sourceElement.style.opacity = '0';
            this.sourceElement.style.pointerEvents = 'none';
            this.mainHousing.classList.remove('custom-select-active');
        }
    }

    _finalizeSelection(shouldRefocusDisplay) {
        this.sourceElement.blur();
        this._refreshDisplayedValue();
        if (shouldRefocusDisplay) {
            this.visualControl.focus();
        }
        this._controlDropdownVisibility(false);
    }

    _applyInteractions() {
        if (this.isHoverActivated) {
            this.sourceElement.style.opacity = '0.001';
            this.sourceElement.style.pointerEvents = 'auto';
            this.sourceElement.addEventListener('change', () => this._refreshDisplayedValue());
            return;
        }

        this.sourceElement.addEventListener('keydown', (event) => {
            if (event.which === 13 || event.which === 32) {
                event.preventDefault();
                this._finalizeSelection(true);
            }
        });

        this.sourceElement.addEventListener('change', () => {
            this._refreshDisplayedValue();
        });

        this.sourceElement.addEventListener('blur', () => {
            this._controlDropdownVisibility(false);
        });

        this.visualControl.addEventListener('mousedown', (event) => {
            event.preventDefault();
            const isSelectHidden = this.sourceElement.style.opacity === '0';
            if (isSelectHidden) {
                this._controlDropdownVisibility(true);
            } else {
                this._finalizeSelection(true);
            }
        });

        this.visualControl.addEventListener('keydown', (event) => {
            const relevantKeys = [13, 32, 37, 38, 39, 40];
            if (relevantKeys.includes(event.which)) {
                event.preventDefault();
                this._controlDropdownVisibility(true);
            }
        });
    }
}

function initializeCustomDropdowns(selector, config) {
    document.querySelectorAll(selector).forEach(element => {
        if (element.tagName === 'SELECT') {
            new DropdownPresenter(element, config);
        }
    });
}

// Attach to the global object or use a different entry point if not a direct plugin replacement
// For this Type IV clone, a global function is chosen over extending HTMLElement prototype.
// (window.jQuery || {}).fn = (window.jQuery || {}).fn || {};
// (window.jQuery || {}).fn.yaselect = initializeCustomDropdowns; // Not allowed for Type IV, so this is commented out.

// The entry point would be like:
// initializeCustomDropdowns('select', { size: 5 });