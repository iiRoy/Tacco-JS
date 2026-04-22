class RouterCore {
    constructor() {
        this.actionRepository = new Map();
        this.activePanelIdentifier = null;
        this.activePanelElement = null;
        this.initializeRouting();
    }

    initializeRouting() {
        window.addEventListener("hashchange", this.processHashFragment.bind(this));
        document.addEventListener("DOMContentLoaded", () => {
            this.processHashFragment();
        });
    }

    // Equivalent to app.page
    registerPanelAction(panelId, logicFunction) {
        this.actionRepository.set(panelId, logicFunction);
    }

    // Equivalent to app (main navigation logic)
    async navigateToPanel(panelId, dataPayload) {
        const targetPanel = document.getElementById(panelId);
        if (!targetPanel || targetPanel.tagName.toLowerCase() !== 'section') {
            console.error(`Panel container with ID '${panelId}' not found or is not a section element.`);
            return;
        }

        const contentSource = targetPanel.getAttribute("data-content-source");
        if (contentSource && !targetPanel.firstElementChild) {
            try {
                const response = await fetch(contentSource);
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                const contentText = await response.text();
                targetPanel.innerHTML = contentText;
                this.activatePanel(panelId, dataPayload, targetPanel);
            } catch (error) {
                alert(`Content loading failed for: ${contentSource}. Error: ${error.message}`);
            }
        } else {
            this.activatePanel(panelId, dataPayload, targetPanel);
        }
    }

    // Equivalent to show
    activatePanel(panelId, dataPayload, panelNode) {
        if (!panelNode) {
            console.warn(`Panel node for ID '${panelId}' is undefined.`);
            return;
        }

        let panelLogic = this.actionRepository.get(panelId);
        if (panelLogic) {
            const executionResult = panelLogic.call(panelNode, dataPayload);
            if (typeof executionResult === "function") {
                this.actionRepository.set(panelId, executionResult);
                executionResult.call(panelNode, dataPayload);
            }
        }

        if (this.activePanelIdentifier) {
            document.body.classList.remove(this.activePanelIdentifier);
            if (this.activePanelElement) {
                this.activePanelElement.dispatchEvent(new CustomEvent("panelDeactivated", { detail: this.activePanelIdentifier }));
            }
        }

        document.body.classList.add(panelId);
        this.activePanelIdentifier = panelId;
        this.activePanelElement = panelNode;
        this.activePanelElement.dispatchEvent(new CustomEvent("panelActivated", { detail: panelId }));
    }

    // Equivalent to onhashchange
    processHashFragment() {
        let currentUrlHash = window.location.hash;
        const defaultPanelId = document.querySelector("section[data-default-panel]")?.id;
        
        if (!currentUrlHash && defaultPanelId) {
            currentUrlHash = `#${defaultPanelId}`;
        } else if (!currentUrlHash) {
            console.info("No URL hash found and no default panel specified. Router is idle.");
            return;
        }

        const hashRegex = /^#([-\w]+)(?::(.+))?$/;
        const hashMatch = currentUrlHash.match(hashRegex);

        if (hashMatch) {
            const extractedIdentifier = hashMatch[1];
            const extractedPayload = hashMatch[2];
            this.navigateToPanel(extractedIdentifier, extractedPayload);
        } else {
            console.warn(`Invalid URL hash format detected: ${currentUrlHash}`);
        }
    }
}

window.pageNavigator = new RouterCore();