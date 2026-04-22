const ConfigurationMerger = function() {};
ConfigurationMerger.prototype.mixinConfiguration = function(baseConfig, userConfig) {
    if (!baseConfig || typeof baseConfig !== 'object') {
        baseConfig = {};
    }
    if (!userConfig || typeof userConfig !== 'object') {
        userConfig = {};
    }
    return Object.assign({}, baseConfig, userConfig);
};

const EventDispatcher = function() {
    this._eventSubscribers = {};
};
EventDispatcher.prototype.subscribeEvent = function(eventName, handlerFunction) {
    if (typeof handlerFunction !== 'function') return;
    if (!this._eventSubscribers[eventName]) {
        this._eventSubscribers[eventName] = [];
    }
    this._eventSubscribers[eventName].push(handlerFunction);
};
EventDispatcher.prototype.fireEvent = function(eventName, eventArguments) {
    if (this._eventSubscribers[eventName]) {
        this._eventSubscribers[eventName].forEach(handler => {
            try {
                handler.apply(this, eventArguments);
            } catch (error) {
                console.error(`DynamicPanelComponent: Error in event handler for ${eventName}:`, error);
            }
        });
    }
};

if (typeof MooFxElements === 'undefined') {
    window.MooFxElements = function(elements, options) {
        this.elements = elements;
        this.options = options;
        this.start = function(stylesObject) {
            // This is a mock function. In a real scenario, it would trigger actual CSS animations
            // on the 'elements' based on 'stylesObject' and 'options'.
        };
    };
}
if (typeof MooFxTransitions === 'undefined') {
    window.MooFxTransitions = {
        Quad: {
            easeOut: function(progress) { return progress * (2 - progress); }
        }
    };
}

const DynamicPanelComponent = function(targetSelector, componentOptions) {
    if (typeof targetSelector !== 'string' || !targetSelector.trim()) {
        console.error('DynamicPanelComponent: Invalid or empty target selector provided.');
        return;
    }

    this._configuration = this._getDefaultConfiguration();
    this._configuration = this.mixinConfiguration(this._configuration, componentOptions);

    this._visiblePanels = [];
    this._panelSizingData = {};
    this._currentFocusedPanelIndex = -1;
    this._animationHandler = null;

    this._initializeComponent(targetSelector);
};

Object.assign(DynamicPanelComponent.prototype, new ConfigurationMerger());
Object.assign(DynamicPanelComponent.prototype, new EventDispatcher());

DynamicPanelComponent.prototype._getDefaultConfiguration = function() {
    return {
        onPanelActivated: null,
        onPanelDeactivated: null,
        onPanelChosen: null,
        onPanelDeselected: null,
        focusedPanelWidthPx: 250,
        animationEasing: MooFxTransitions.Quad.easeOut,
        animationDurationMs: 450,
        initialSelection: null,
        panelSpacingPx: 0
    };
};

DynamicPanelComponent.prototype._initializeComponent = function(selector) {
    const foundElements = document.querySelectorAll(selector);
    this._visiblePanels = Array.from(foundElements);

    if (this._visiblePanels.length === 0) {
        console.warn('DynamicPanelComponent: No elements found for selector:', selector);
        return;
    }

    this._calculatePanelMetrics();

    this._animationHandler = new MooFxElements(this._visiblePanels, {
        wait: false,
        duration: this._configuration.animationDurationMs,
        transition: this._configuration.animationEasing
    });

    this._visiblePanels.forEach((panel, index) => {
        panel.setAttribute('data-panel-index', index);

        panel.addEventListener('mouseenter', this._handlePanelHoverIn.bind(this));
        panel.addEventListener('mouseleave', this._handlePanelHoverOut.bind(this));
        panel.addEventListener('click', this._handlePanelActivationToggle.bind(this));
    });

    this._setInitialActivePanelState();
};

DynamicPanelComponent.prototype._calculatePanelMetrics = function() {
    const firstPanel = this._visiblePanels[0];
    if (!firstPanel) return;

    const panelComputedStyle = window.getComputedStyle(firstPanel);
    const baseDimension = parseInt(panelComputedStyle.width, 10);
    const totalPanelCount = this._visiblePanels.length;

    if (isNaN(baseDimension) || baseDimension <= 0) {
        console.warn('DynamicPanelComponent: Base panel width could not be determined. Using default of 100px.');
        this._panelSizingData.collapsedDimension = 100;
    } else {
        this._panelSizingData.collapsedDimension = baseDimension;
    }

    this._panelSizingData.expandedDimension = this._configuration.focusedPanelWidthPx;

    if (totalPanelCount > 1) {
        const totalDefaultWidth = this._panelSizingData.collapsedDimension * totalPanelCount;
        const widthForRemainingPanels = totalDefaultWidth - this._panelSizingData.expandedDimension;

        this._panelSizingData.neighborDimension = Math.max(
            0,
            Math.floor(widthForRemainingPanels / (totalPanelCount - 1))
        );
    } else {
        this._panelSizingData.neighborDimension = this._panelSizingData.collapsedDimension;
    }

    if (this._panelSizingData.expandedDimension > this._panelSizingData.collapsedDimension * totalPanelCount) {
        console.warn('DynamicPanelComponent: Focused panel width is greater than total available width. Layout may be compromised.');
    }
};

DynamicPanelComponent.prototype._setInitialActivePanelState = function() {
    const initialSetting = this._configuration.initialSelection;
    if (initialSetting === null) {
        return;
    }

    let resolvedIndex = -1;
    if (typeof initialSetting === 'number' && initialSetting >= 0 && initialSetting < this._visiblePanels.length) {
        resolvedIndex = initialSetting;
    } else if (typeof initialSetting === 'string') {
        const foundPanel = this._visiblePanels.find(panel => panel.id === initialSetting);
        if (foundPanel) {
            resolvedIndex = parseInt(foundPanel.getAttribute('data-panel-index'), 10);
        }
    }

    if (resolvedIndex !== -1) {
        this._applyPanelWidths(resolvedIndex);
        this._currentFocusedPanelIndex = resolvedIndex;
    }
};

DynamicPanelComponent.prototype._handlePanelHoverIn = function(event) {
    event.preventDefault();
    event.stopPropagation();

    const currentPanel = event.currentTarget;
    const panelIdx = parseInt(currentPanel.getAttribute('data-panel-index'), 10);

    if (panelIdx !== this._currentFocusedPanelIndex) {
        this._applyPanelWidths(panelIdx);
        if (typeof this._configuration.onPanelActivated === 'function') {
            this._configuration.onPanelActivated(currentPanel, panelIdx);
        }
        this.fireEvent('panelHovered', [currentPanel, panelIdx]);
    }
};

DynamicPanelComponent.prototype._handlePanelHoverOut = function(event) {
    event.preventDefault();
    event.stopPropagation();

    const currentPanel = event.currentTarget;
    const panelIdx = parseInt(currentPanel.getAttribute('data-panel-index'), 10);

    this._applyPanelWidths(this._currentFocusedPanelIndex);

    if (typeof this._configuration.onPanelDeactivated === 'function') {
        this._configuration.onPanelDeactivated(currentPanel, panelIdx);
    }
    this.fireEvent('panelUnhovered', [currentPanel, panelIdx]);
};

DynamicPanelComponent.prototype._handlePanelActivationToggle = function(event) {
    event.preventDefault();
    event.stopPropagation();

    const clickedPanel = event.currentTarget;
    const panelIdx = parseInt(clickedPanel.getAttribute('data-panel-index'), 10);
    const panelActionLink = clickedPanel.getAttribute('href') || clickedPanel.getAttribute('data-action-link');

    if (panelIdx === this._currentFocusedPanelIndex) {
        this._currentFocusedPanelIndex = -1;
        this._applyPanelWidths(-1);
        if (typeof this._configuration.onPanelDeselected === 'function') {
            this._configuration.onPanelDeselected(panelActionLink, panelIdx);
        }
        this.fireEvent('panelDeselected', [panelActionLink, panelIdx]);
    } else {
        this._currentFocusedPanelIndex = panelIdx;
        this._applyPanelWidths(panelIdx);
        if (typeof this._configuration.onPanelChosen === 'function') {
            this._configuration.onPanelChosen(panelActionLink, panelIdx);
        }
        this.fireEvent('panelSelected', [panelActionLink, panelIdx]);
    }
};

DynamicPanelComponent.prototype._applyPanelWidths = function(focusIndex) {
    if (focusIndex < -1 || focusIndex >= this._visiblePanels.length) {
        console.warn(`DynamicPanelComponent: Invalid focus index provided for width adjustment: ${focusIndex}`);
        return;
    }

    const animationInstructionMap = {};
    const totalCount = this._visiblePanels.length;
    const defaultCollapsed = this._panelSizingData.collapsedDimension;
    const expandedTarget = this._panelSizingData.expandedDimension;
    const neighborCollapsed = this._panelSizingData.neighborDimension;

    for (let i = 0; i < totalCount; i++) {
        let desiredWidth;

        if (focusIndex === -1) {
            desiredWidth = defaultCollapsed;
        } else if (i === focusIndex) {
            desiredWidth = expandedTarget;
        } else {
            desiredWidth = neighborCollapsed;
        }
        
        animationInstructionMap[i] = { 'width': desiredWidth };
    }

    this._animationHandler.start(animationInstructionMap);
};