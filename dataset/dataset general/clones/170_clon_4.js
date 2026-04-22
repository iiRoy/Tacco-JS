class InteractivePanelManager {
    constructor(rootElement, initialSettings) {
        if (!(rootElement instanceof HTMLElement)) {
            console.error("InteractivePanelManager requires a valid HTMLElement as its primary display container.");
            return;
        }

        this.primaryDisplayContainer = rootElement;
        this.hoverActivationTimeout = null;
        this.activePanelRegistry = new Map(); // Tracks currently open sub-panels

        this.systemConfiguration = this.establishSystemConfiguration(initialSettings);

        this.prepareDocumentLayout();
        this.registerInteractionListeners();
    }

    establishSystemConfiguration(userSettings) {
        const defaultSettings = {
            enableAnimations: true,
            primaryAnimationDirection: "upwards",
            subPanelAnimationDirection: "towards-left",
            activationDelayMs: 450,
            animationDurationMs: 120
        };
        return { ...defaultSettings, ...userSettings };
    }

    prepareDocumentLayout() {
        document.querySelectorAll(".content-groupings UL").forEach(listElement => {
            listElement.classList.add("flex-no-wrap", "zero-padding", "zero-margin");
        });
        document.querySelectorAll(".panel-container").forEach(panelElement => {
            panelElement.classList.add("absolute-position");
            panelElement.style.setProperty('--panel-transition-duration', `${this.systemConfiguration.animationDurationMs}ms`);
        });
    }

    registerInteractionListeners() {
        document.addEventListener('click', this.handleDocumentInteraction.bind(this));

        document.querySelectorAll('LI.panel-item:not(.is-disabled)').forEach(itemEntry => {
            itemEntry.addEventListener('click', this.handlePanelItemClick.bind(this));
            itemEntry.addEventListener('mouseenter', this.handlePanelItemHover.bind(this));
            itemEntry.addEventListener('mouseleave', this.handlePanelItemExit.bind(this));
        });
    }

    // Helper to manage panel visibility and animation
    revealPanelElement(elementToReveal, direction, duration) {
        if (!elementToReveal) return;

        elementToReveal.style.setProperty('--panel-transition-duration', `${duration}ms`);

        if (this.systemConfiguration.enableAnimations) {
            elementToReveal.style.display = 'block';
            elementToReveal.dataset.animationDirection = direction;
            void elementToReveal.offsetWidth; // Force reflow
            elementToReveal.classList.add('is-visible');
        } else {
            elementToReveal.style.display = 'block';
            elementToReveal.classList.add('is-visible');
            elementToReveal.style.opacity = '1';
            elementToReveal.style.transform = 'none';
        }
    }

    concealPanelElement(elementToConceal, duration) {
        if (!elementToConceal) return;

        elementToConceal.style.setProperty('--panel-transition-duration', `${duration}ms`);

        if (this.systemConfiguration.enableAnimations) {
            elementToConceal.classList.remove('is-visible');
            setTimeout(() => {
                elementToConceal.style.display = 'none';
            }, duration);
        } else {
            elementToConceal.style.display = 'none';
            elementToConceal.classList.remove('is-visible');
        }
    }

    // Event handlers
    handlePanelItemClick(interactionEvent) {
        interactionEvent.stopPropagation();
        clearTimeout(this.hoverActivationTimeout);

        const currentItem = interactionEvent.currentTarget;
        const subPanelTrigger = currentItem.querySelector(".nested-panel-trigger");

        if (subPanelTrigger) {
            const currentAnimationDirection = this.systemConfiguration.subPanelAnimationDirection;
            const parentHost = currentItem.parentElement;

            parentHost.querySelectorAll(".panel-container").forEach(panel => {
                this.concealPanelElement(panel, this.systemConfiguration.animationDurationMs);
                panel.parentElement.classList.remove('is-active-item');
            });

            const targetSubPanel = currentItem.querySelector(".panel-container");
            if (targetSubPanel) {
                this.revealPanelElement(targetSubPanel, currentAnimationDirection, this.systemConfiguration.animationDurationMs);
                currentItem.classList.add('is-active-item');
            }
        }
    }

    handlePanelItemHover(interactionEvent) {
        interactionEvent.stopPropagation();
        clearTimeout(this.hoverActivationTimeout);

        const currentItem = interactionEvent.currentTarget;
        const subPanelTrigger = currentItem.querySelector(".nested-panel-trigger");

        if (subPanelTrigger) {
            const currentAnimationDirection = this.systemConfiguration.subPanelAnimationDirection;
            this.hoverActivationTimeout = setTimeout(() => {
                const parentHost = currentItem.parentElement;
                parentHost.querySelectorAll(".panel-container").forEach(panel => {
                    this.concealPanelElement(panel, this.systemConfiguration.animationDurationMs);
                    panel.parentElement.classList.remove('is-active-item');
                });

                const targetSubPanel = currentItem.querySelector(".panel-container");
                if (targetSubPanel) {
                    this.revealPanelElement(targetSubPanel, currentAnimationDirection, this.systemConfiguration.animationDurationMs);
                    currentItem.classList.add('is-active-item');
                }
            }, this.systemConfiguration.activationDelayMs);
        } else {
            currentItem.parentElement.querySelectorAll(".panel-container").forEach(panel => {
                this.concealPanelElement(panel, this.systemConfiguration.animationDurationMs);
                panel.parentElement.classList.remove('is-active-item');
            });
        }
    }

    handlePanelItemExit(interactionEvent) {
        clearTimeout(this.hoverActivationTimeout);
    }

    handleDocumentInteraction(interactionEvent) {
        document.querySelectorAll(".panel-container").forEach(panel => {
            this.concealPanelElement(panel, this.systemConfiguration.animationDurationMs);
            panel.parentElement.classList.remove('is-active-item');
            panel.dataset.panelStatus = 'inactive';
        });
    }

    // Public API Methods
    displayMainPanel() {
        const direction = this.systemConfiguration.primaryAnimationDirection;
        this.revealPanelElement(this.primaryDisplayContainer, direction, this.systemConfiguration.animationDurationMs);
        this.primaryDisplayContainer.classList.add('is-active-item');
    }

    hideMainPanel() {
        this.concealPanelElement(this.primaryDisplayContainer, this.systemConfiguration.animationDurationMs);
    }

    presentContextualPanel(interactionEvent) {
        interactionEvent.preventDefault();

        const contextAreaViewer = document.querySelector(".context-area-viewer");
        if (!contextAreaViewer) {
            console.warn("Context area viewer element was not found in the DOM.");
            return false;
        }

        const calculatedHeight = contextAreaViewer.offsetHeight;
        const calculatedWidth = contextAreaViewer.offsetWidth;

        const leftPosition = (interactionEvent.pageX - (calculatedWidth / 2)) + "px";
        const topPosition = (interactionEvent.pageY - (calculatedHeight / 2)) + "px";

        this.primaryDisplayContainer.style.left = leftPosition;
        this.primaryDisplayContainer.style.top = topPosition;

        const direction = this.systemConfiguration.primaryAnimationDirection;
        this.revealPanelElement(this.primaryDisplayContainer, direction, this.systemConfiguration.animationDurationMs);
        this.primaryDisplayContainer.classList.add('is-active-item');

        return false;
    }

    // Generates the public interface for external control
    createControlInterface() {
        return {
            showPanel: this.displayMainPanel.bind(this),
            hidePanel: this.hideMainPanel.bind(this),
            launchContextPanel: this.presentContextualPanel.bind(this)
        };
    }
}

// Factory function to instantiate and return the control interface, mimicking a jQuery plugin call
function initiatePanelSystem(targetHTMLElement, configurationOptions) {
    const managerInstance = new InteractivePanelManager(targetHTMLElement, configurationOptions);
    return managerInstance.createControlInterface();
}