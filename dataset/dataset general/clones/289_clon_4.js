class NavigationDrawer {
    static _activeDrawerInstance = null;

    constructor(targetElement, initialOptions) {
        if (!targetElement) {
            console.error('Target element missing for navigation drawer setup.');
            return;
        }

        const defaultPreferences = {
            triggerBackground: 'white',
            triggerSize: '50px',
            linkSelector: 'li a',
            linkTextProcessor: (anchor) => anchor.textContent,
            linkInclusionFilter: (anchor, index, allAnchors) => true,
            isFixedPosition: true,
            zOrder: 100,
            topOffset: 0,
            triggerMarginSpace: 10,
            lineColor: 'black',
            lineThickness: '5px',
            lineLength: '30px',
            lineSpacing: '5px',
            hideInitialNavigation: true,
            drawerWidth: '100%',
            drawerHeight: 'auto',
            drawerBackground: 'white',
            drawerBorder: '1px solid black',
            linkFontColor: 'black',
            linkBackgroundColor: 'white',
            linkPadding: '10px 10px',
            linkDecoration: 'none',
            linkBottomDivider: '1px solid black',
            linkNoBottomDividerOnLast: true,
            drawerPlacement: 'left',
            keepTriggerAdjacent: false,
            transitionDuration: 0,
            hideOnPageClick: true,
            displayFromWidth: 0,
            displayUntilWidth: 640,
            shiftBodyContent: false,
            createOverlay: false,
            customDrawerContent: null,
            customTriggerContent: null,
            _instanceIndex: 0
        };

        this.prefs = { ...defaultPreferences, ...initialOptions };

        this.targetNav = targetElement;
        this.controlButton = null;
        this.sidePanel = null;
        this.overlayElement = null;

        this.uniqueIdentifier = `navigation-drawer-${Math.random().toString(36).substring(2, 11)}`;

        this.initializeInterface();
        this.registerGlobalEventHandlers();
        this.evaluateLayoutConstraints();
    }

    initializeInterface() {
        this.controlButton = this.constructControlElement();
        this.sidePanel = this.assemblePanelElement(this.targetNav);

        document.body.appendChild(this.controlButton);
        document.body.appendChild(this.sidePanel);

        this.controlButton.addEventListener('click', this.handleControlActivation.bind(this));
    }

    constructControlElement() {
        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('nav-toggle-button');
        buttonDiv.setAttribute('data-drawer-id', this.uniqueIdentifier);

        const buttonStyling = {
            background: this.prefs.triggerBackground,
            width: this.prefs.triggerSize,
            height: this.prefs.triggerSize,
            zIndex: this.prefs.zOrder,
            position: this.prefs.isFixedPosition ? 'fixed' : 'absolute',
            top: `${this.prefs.topOffset}px`,
            cursor: 'pointer',
            transition: `all ${this.prefs.transitionDuration}ms ease-in-out`
        };

        const buttonDimensionVal = parseInt(this.prefs.triggerSize);
        const buttonMarginVal = parseInt(this.prefs.triggerMarginSpace);
        const effectivePosition = (buttonDimensionVal + buttonMarginVal) * this.prefs._instanceIndex;
        buttonStyling[this.prefs.drawerPlacement] = `${effectivePosition}px`;

        Object.assign(buttonDiv.style, buttonStyling);

        if (!this.prefs.customTriggerContent) {
            for (let i = 0; i < 3; i++) {
                buttonDiv.appendChild(this.createIndicatorLine(i, buttonDimensionVal));
            }
        } else {
            if (typeof this.prefs.customTriggerContent === 'string') {
                buttonDiv.innerHTML = this.prefs.customTriggerContent;
            } else {
                buttonDiv.appendChild(this.prefs.customTriggerContent);
            }
        }

        return buttonDiv;
    }

    createIndicatorLine(index, parentDimension) {
        const lineSpan = document.createElement('span');
        lineSpan.classList.add('nav-toggle-line-segment');

        const lineThicknessVal = parseInt(this.prefs.lineThickness);
        const lineLengthVal = parseInt(this.prefs.lineLength);
        const lineSpacingVal = parseInt(this.prefs.lineSpacing);

        const lineStyling = {
            position: 'absolute',
            backgroundColor: this.prefs.lineColor,
            height: `${lineThicknessVal}px`,
            width: `${lineLengthVal}px`,
            left: `${(parentDimension - lineLengthVal) / 2}px`,
            top: `${((parentDimension - (lineThicknessVal * 3 + lineSpacingVal * 2)) / 2) + (lineThicknessVal + lineSpacingVal) * index}px`,
            display: 'block'
        };

        Object.assign(lineSpan.style, lineStyling);
        return lineSpan;
    }

    createPanelAnchor(sourceAnchor, index, totalCount) {
        const newAnchor = document.createElement('a');
        newAnchor.setAttribute('href', sourceAnchor.getAttribute('href'));
        newAnchor.textContent = this.prefs.linkTextProcessor(sourceAnchor);

        const linkStyling = {
            color: this.prefs.linkFontColor,
            padding: this.prefs.linkPadding,
            background: this.prefs.linkBackgroundColor,
            display: 'block',
            textDecoration: this.prefs.linkDecoration,
            borderBottom: this.prefs.linkBottomDivider
        };

        if (this.prefs.linkBottomDivider !== 'none' && this.prefs.linkNoBottomDividerOnLast && index === totalCount - 1) {
            linkStyling.borderBottom = 'none';
        }

        Object.assign(newAnchor.style, linkStyling);
        return newAnchor;
    }

    assemblePanelElement(navigationSource) {
        const panelDiv = document.createElement('div');
        panelDiv.classList.add('side-navigation-panel');
        panelDiv.setAttribute('data-drawer-id', this.uniqueIdentifier);

        const panelStyling = {
            height: this.prefs.drawerHeight,
            background: this.prefs.drawerBackground,
            top: this.prefs.keepTriggerAdjacent ? '0px' : `${parseInt(this.prefs.triggerSize) - 1}px`,
            zIndex: this.prefs.zOrder - 1,
            position: this.prefs.isFixedPosition ? 'fixed' : 'absolute',
            border: this.prefs.drawerBorder,
            boxSizing: 'border-box',
            transition: `${this.prefs.drawerPlacement} ${this.prefs.transitionDuration}ms ease-in-out`
        };

        const currentPanelWidth = this.calculatePanelDimension();
        panelStyling[this.prefs.drawerPlacement] = `-${currentPanelWidth}`;
        panelStyling.width = currentPanelWidth;

        Object.assign(panelDiv.style, panelStyling);
        panelDiv.style[`border${this.prefs.drawerPlacement.charAt(0).toUpperCase() + this.prefs.drawerPlacement.slice(1)}`] = 'none';

        if (!this.prefs.customDrawerContent) {
            const allSourceAnchors = Array.from(navigationSource.querySelectorAll(this.prefs.linkSelector));
            allSourceAnchors.forEach((anchor, idx) => {
                if (this.prefs.linkInclusionFilter(anchor, idx, allSourceAnchors)) {
                    panelDiv.appendChild(this.createPanelAnchor(anchor, idx, allSourceAnchors.length));
                }
            });
        } else {
            if (typeof this.prefs.customDrawerContent === 'string') {
                panelDiv.innerHTML = this.prefs.customDrawerContent;
            } else {
                panelDiv.appendChild(this.prefs.customDrawerContent);
            }
        }

        return panelDiv;
    }

    calculatePanelDimension() {
        if (this.prefs.keepTriggerAdjacent) {
            if (this.prefs.drawerWidth.includes('%')) {
                const percentageVal = parseInt(this.prefs.drawerWidth) / 100;
                return `${(window.innerWidth * percentageVal) - parseInt(this.prefs.triggerSize)}px`;
            } else {
                return `${parseInt(this.prefs.drawerWidth) - parseInt(this.prefs.triggerSize)}px`;
            }
        } else {
            return this.prefs.drawerWidth;
        }
    }

    togglePanelDisplay(forceHide = false) {
        const isCurrentlyActive = this.controlButton.classList.contains('active-drawer-toggle');
        const desiredState = forceHide ? false : !isCurrentlyActive;

        if (desiredState) {
            if (NavigationDrawer._activeDrawerInstance && NavigationDrawer._activeDrawerInstance !== this) {
                NavigationDrawer._activeDrawerInstance.togglePanelDisplay(true);
            }
            NavigationDrawer._activeDrawerInstance = this;
        } else if (NavigationDrawer._activeDrawerInstance === this) {
            NavigationDrawer._activeDrawerInstance = null;
        }

        const currentPanelWidth = this.calculatePanelDimension();
        const placementProperty = this.prefs.drawerPlacement;

        if (desiredState) {
            this.sidePanel.style[placementProperty] = '0px';
            if (this.prefs.keepTriggerAdjacent) {
                this.controlButton.style[placementProperty] = currentPanelWidth;
            }
            this.controlButton.classList.add('active-drawer-toggle');
            this.manageDimmerBackdrop(true);
            if (this.prefs.shiftBodyContent) {
                document.body.style[placementProperty] = currentPanelWidth;
            }
        } else {
            this.sidePanel.style[placementProperty] = `-${currentPanelWidth}`;
            if (this.prefs.keepTriggerAdjacent) {
                const buttonMarginVal = parseInt(this.prefs.triggerMarginSpace);
                const buttonDimensionVal = parseInt(this.prefs.triggerSize);
                const effectivePosition = (buttonDimensionVal + buttonMarginVal) * this.prefs._instanceIndex;
                this.controlButton.style[placementProperty] = `${effectivePosition}px`;
            }
            this.controlButton.classList.remove('active-drawer-toggle');
            this.manageDimmerBackdrop(false);
            if (this.prefs.shiftBodyContent) {
                document.body.style[placementProperty] = '0px';
            }
        }
    }

    manageDimmerBackdrop(showBackdrop) {
        if (!this.prefs.createOverlay) return;

        if (!this.overlayElement) {
            this.overlayElement = document.createElement('div');
            this.overlayElement.classList.add('content-dimmer');
            Object.assign(this.overlayElement.style, {
                opacity: 0,
                background: this.prefs.createOverlay,
                width: '100%',
                height: '100%',
                position: 'fixed',
                zIndex: this.prefs.zOrder - 2,
                top: 0,
                left: 0,
                transition: `opacity ${this.prefs.transitionDuration}ms ease-in-out`
            });
            document.body.appendChild(this.overlayElement);
            this.overlayElement.addEventListener('click', () => this.togglePanelDisplay(true));
        }

        if (showBackdrop) {
            this.overlayElement.style.opacity = 0.5;
        } else {
            this.overlayElement.style.opacity = 0;
            const self = this;
            const transitionEndHandler = function() {
                if (self.overlayElement && self.overlayElement.style.opacity === '0') {
                    self.overlayElement.removeEventListener('transitionend', transitionEndHandler);
                    self.overlayElement.parentNode.removeChild(self.overlayElement);
                    self.overlayElement = null;
                }
            };
            this.overlayElement.addEventListener('transitionend', transitionEndHandler);
        }
    }

    handleControlActivation(event) {
        event.stopPropagation();
        this.togglePanelDisplay();
    }

    concealIfVisible() {
        if (this.controlButton.classList.contains('active-drawer-toggle')) {
            this.togglePanelDisplay(true);
        }
    }

    evaluateLayoutConstraints() {
        const currentWindowWidth = window.innerWidth;
        const withinDisplayRange = currentWindowWidth >= this.prefs.displayFromWidth && currentWindowWidth <= this.prefs.displayUntilWidth;

        if (withinDisplayRange) {
            this.controlButton.style.display = '';
            this.sidePanel.style.display = '';

            if (this.prefs.hideInitialNavigation) {
                this.targetNav.style.display = 'none';
            }
        } else {
            this.controlButton.style.display = 'none';
            this.sidePanel.style.display = 'none';
            this.concealIfVisible();

            if (this.prefs.hideInitialNavigation) {
                this.targetNav.style.display = '';
            }
        }

        const recalculatedPanelWidth = this.calculatePanelDimension();
        this.sidePanel.style.width = recalculatedPanelWidth;
        if (!this.controlButton.classList.contains('active-drawer-toggle')) {
            this.sidePanel.style[this.prefs.drawerPlacement] = `-${recalculatedPanelWidth}`;
        }

        if (this.prefs.shiftBodyContent) {
            document.body.style.overflowX = 'hidden';
            document.body.style.position = 'relative';
            document.body.style.transition = `${this.prefs.drawerPlacement} ${this.prefs.transitionDuration}ms ease-in-out`;
        }
    }

    registerGlobalEventHandlers() {
        window.addEventListener('resize', () => {
            this.concealIfVisible();
            this.evaluateLayoutConstraints();
        });

        if (this.prefs.hideOnPageClick) {
            document.body.addEventListener('click', (event) => {
                const clickedNode = event.target;
                const isClickWithinControl = this.controlButton.contains(clickedNode);
                const isClickWithinPanel = this.sidePanel.contains(clickedNode);

                if (!isClickWithinControl && !isClickWithinPanel) {
                    this.concealIfVisible();
                }
            });
        }
    }
}

(function() {
    window.AppUI = window.AppUI || {};

    AppUI.createSlidingNavigation = function(selector, configuration) {
        const elementsToProcess = document.querySelectorAll(selector);
        const createdInstances = [];

        elementsToProcess.forEach((element, index) => {
            const instanceConfiguration = { ...configuration, _instanceIndex: index };
            createdInstances.push(new NavigationDrawer(element, instanceConfiguration));
        });

        return elementsToProcess;
    };
})();