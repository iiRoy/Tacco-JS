(function() {
    const defaultParameters = {
        transparencyLevel: 0.2, // Opacity of non-selected items
        topMarginAdjustment: false, // Adjust the margin-top for the folder area based on row selected?
        baseTopMargin: '0px', // If margin-top-adjust is "true", the natural margin-top for the area
        topMarginIncrement: '-100px', // If margin-top-adjust is "true", the increment of margin-top per row
        motionDuration: 200, // Time (in ms) for transition
        urlRewriteEnabled: false, // Use URL rewriting?
        innerLinkSelector: '.auxiliary-link a', // a jQuery selector containing links to content within a jQuery App Folder
        instantSwitching: false
    };

    class PanelController {
        constructor(rootElement, configOptions) {
            if (!rootElement) {
                console.error('PanelController: Root element must be provided.');
                return;
            }
            this.enclosingArea = rootElement; // This corresponds to .jaf-container
            this.currentConfig = { ...defaultParameters, ...configOptions };
            this.currentActivePanelId = null; // Stores the ID of the currently open panel element

            this.prepareInterface();
            this.bindEvents();
            this.handleInitialStateFromURL();
        }

        prepareInterface() {
            const allContentPanes = this.enclosingArea.querySelectorAll('.content-panel-body');
            allContentPanes.forEach(pane => {
                pane.style.maxHeight = '0';
                pane.style.overflow = 'hidden';
                pane.style.transition = `max-height ${this.currentConfig.motionDuration}ms ease-out, opacity ${this.currentConfig.motionDuration}ms ease-out`;
                pane.style.opacity = '0';
            });
        }

        bindEvents() {
            this.enclosingArea.addEventListener('click', this.processClickEvent.bind(this));
            document.querySelectorAll(this.currentConfig.innerLinkSelector).forEach(link => {
                link.addEventListener('click', this.processAuxiliaryLinkClick.bind(this));
            });
        }

        processClickEvent(interactionEvent) {
            const activatorElement = interactionEvent.target.closest('.panel-activator');
            if (activatorElement) {
                interactionEvent.preventDefault();
                this.managePanelVisibility(activatorElement);
                return;
            }

            const closerButton = interactionEvent.target.closest('.panel-closer');
            if (closerButton) {
                interactionEvent.preventDefault();
                this.hidePanel(closerButton.closest('.content-panel-body'));
                return;
            }
        }

        processAuxiliaryLinkClick(interactionEvent) {
            interactionEvent.preventDefault();
            const destination = interactionEvent.currentTarget.getAttribute('href');
            window.location.href = destination;
            window.location.reload();
        }

        managePanelVisibility(clickedActivator) {
            const panelIdentifier = clickedActivator.dataset.panelId;
            const targetContentPanel = this.enclosingArea.querySelector(`.content-panel-body[data-panel-id="${panelIdentifier}"]`);

            if (!panelIdentifier || !targetContentPanel) return;

            const isPanelOpen = targetContentPanel.style.maxHeight !== '0px' && targetContentPanel.style.opacity !== '0';

            if (this.currentActivePanelId === panelIdentifier) {
                // Clicked on the currently active panel activator (to close it)
                if (isPanelOpen) {
                    this.hidePanel(targetContentPanel);
                }
            } else {
                // Clicked on a different activator, or no panel is active
                if (this.currentActivePanelId && this.currentConfig.instantSwitching) {
                    // Close current active panel instantly
                    const previouslyActiveActivator = this.enclosingArea.querySelector(`.panel-activator.active-state`);
                    const previouslyActivePanel = this.enclosingArea.querySelector(`.content-panel-body[data-panel-id="${this.currentActivePanelId}"]`);
                    if (previouslyActiveActivator) previouslyActiveActivator.classList.remove('active-state');
                    if (previouslyActivePanel) {
                        previouslyActivePanel.style.maxHeight = '0';
                        previouslyActivePanel.style.opacity = '0';
                        previouslyActivePanel.style.transitionDuration = '0ms';
                    }
                    targetContentPanel.style.transitionDuration = `${this.currentConfig.motionDuration}ms`;
                    this.adjustActivatorShading(1.0, 0); // Reset all activators
                } else if (this.currentActivePanelId) {
                    // Close current active panel with animation before opening new one
                    const previouslyActivePanel = this.enclosingArea.querySelector(`.content-panel-body[data-panel-id="${this.currentActivePanelId}"]`);
                    if (previouslyActivePanel) {
                        this.hidePanel(previouslyActivePanel);
                        setTimeout(() => {
                            this.revealPanel(clickedActivator, targetContentPanel);
                        }, this.currentConfig.motionDuration);
                        return;
                    }
                }
                this.revealPanel(clickedActivator, targetContentPanel);
            }
        }

        revealPanel(activatorElement, contentPanelElement) {
            const parentRow = activatorElement.closest('.row-wrapper');
            if (parentRow) {
                parentRow.insertAdjacentElement('afterend', contentPanelElement);
            }

            activatorElement.classList.add('active-state');
            this.currentActivePanelId = activatorElement.dataset.panelId;

            this.animatePanelExpansion(contentPanelElement);
            this.adjustActivatorShading(this.currentConfig.transparencyLevel, activatorElement);
            this.updateURLFragment(this.currentActivePanelId);
            this.adjustEnclosingAreaTopMargin(parentRow);
        }

        hidePanel(contentPanelElementToConceal) {
            const associatedActivator = this.enclosingArea.querySelector(`.panel-activator.active-state`);
            if (associatedActivator) {
                associatedActivator.classList.remove('active-state');
            }
            this.currentActivePanelId = null;

            this.animatePanelCollapse(contentPanelElementToConceal);
            this.adjustActivatorShading(1.0); // Reset all to full opacity
            this.updateURLFragment(''); // Clear hash
            this.adjustEnclosingAreaTopMargin(null, true); // Reset margin
        }

        animatePanelExpansion(targetPanel) {
            targetPanel.style.transitionDuration = `${this.currentConfig.motionDuration}ms`;
            targetPanel.style.display = 'block';
            targetPanel.style.maxHeight = 'none';
            const calculatedHeight = targetPanel.scrollHeight + 'px';
            targetPanel.style.maxHeight = '0';
            void targetPanel.offsetWidth; // Force reflow
            targetPanel.style.maxHeight = calculatedHeight;
            targetPanel.style.opacity = '1';
        }

        animatePanelCollapse(targetPanel) {
            targetPanel.style.transitionDuration = `${this.currentConfig.motionDuration}ms`;
            targetPanel.style.maxHeight = '0';
            targetPanel.style.opacity = '0';
        }

        adjustActivatorShading(level, exemptedElement = null, duration = this.currentConfig.motionDuration) {
            const allActivators = this.enclosingArea.querySelectorAll('.panel-activator');
            allActivators.forEach(activator => {
                if (activator !== exemptedElement) {
                    activator.style.transition = `opacity ${duration}ms ease-in-out`;
                    activator.style.opacity = level;
                } else {
                    activator.style.opacity = '1';
                }
            });
        }

        adjustEnclosingAreaTopMargin(referenceRow, reset = false) {
            if (!this.currentConfig.topMarginAdjustment) {
                return;
            }

            if (reset || !referenceRow) {
                this.enclosingArea.style.transition = `margin-top ${this.currentConfig.motionDuration}ms ease-in-out`;
                this.enclosingArea.style.marginTop = this.currentConfig.baseTopMargin;
            } else {
                const allRows = Array.from(this.enclosingArea.querySelectorAll('.row-wrapper'));
                const rowIndex = allRows.indexOf(referenceRow);
                if (rowIndex !== -1) {
                    const marginValue = parseFloat(this.currentConfig.baseTopMargin);
                    const incrementValue = parseFloat(this.currentConfig.topMarginIncrement);
                    const calculatedMargin = marginValue - (incrementValue * rowIndex);
                    this.enclosingArea.style.transition = `margin-top ${this.currentConfig.motionDuration}ms ease-in-out`;
                    this.enclosingArea.style.marginTop = `${calculatedMargin}px`;
                }
            }
        }

        updateURLFragment(identifier) {
            if (this.currentConfig.urlRewriteEnabled) {
                const identifiedElement = document.getElementById(identifier);
                if (identifiedElement) {
                    identifiedElement.removeAttribute('id');
                }
                window.location.hash = identifier ? identifier : '';
                if (identifiedElement) {
                    identifiedElement.setAttribute('id', identifier);
                }
            }
        }

        handleInitialStateFromURL() {
            const initialFragment = window.location.hash.substring(1);
            if (initialFragment) {
                const initialActivator = this.enclosingArea.querySelector(`.panel-activator[data-panel-id="${initialFragment}"]`);
                const initialContentPanel = this.enclosingArea.querySelector(`.content-panel-body[data-panel-id="${initialFragment}"]`);

                if (initialActivator && initialContentPanel) {
                    const parentRow = initialActivator.closest('.row-wrapper');
                    if (parentRow) {
                        parentRow.insertAdjacentElement('afterend', initialContentPanel);
                    }
                    initialActivator.classList.add('active-state');
                    this.currentActivePanelId = initialFragment;

                    initialContentPanel.style.transitionDuration = '0ms';
                    initialContentPanel.style.display = 'block';
                    initialContentPanel.style.maxHeight = 'none';
                    const calculatedHeight = initialContentPanel.scrollHeight + 'px';
                    initialContentPanel.style.maxHeight = calculatedHeight;
                    initialContentPanel.style.opacity = '1';

                    this.adjustActivatorShading(this.currentConfig.transparencyLevel, initialActivator, 0);
                    this.adjustEnclosingAreaTopMargin(parentRow);
                    
                    if (this.currentConfig.topMarginAdjustment) {
                         window.scrollTo(0, 0);
                    }
                }
            }
        }
    }

    // Expose a factory function to initialize the system
    window.ApplicationPanelGateway = function(containerSelector, initialOptions) {
        const targetContainer = document.querySelector(containerSelector);
        if (targetContainer) {
            return new PanelController(targetContainer, initialOptions);
        } else {
            console.warn('ApplicationPanelGateway: Container element not found for selector:', containerSelector);
            return null;
        }
    };
})();