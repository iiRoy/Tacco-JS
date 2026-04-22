class HoverInfoController {
    #infoElement;
    #dataCache = new Map();
    #requestQueue = [];
    #activeFetchIdentifier = null;
    #lastHoveredIdentifier = null;
    #currentOwnerElement = null;
    #maxAllowedWidth = 370;

    constructor() {
        this.#setupGlobalCallbacks();
    }

    // Public method to initialize the system
    bootSystem() {
        // Omitting Modernizr.touch check for Type IV divergence, assuming core functionality on non-touch devices.
        this.#createAndAppendOverlay();
        this.#concealOverlay(); // Initial state
    }

    // Private methods for internal operations
    #createAndAppendOverlay() {
        this.#infoElement = document.createElement("aside");
        this.#infoElement.id = "dynamic-info-overlay-panel"; // Different ID
        this.#infoElement.style.cssText = `
            position: absolute;
            visibility: hidden;
            z-index: 9999;
            pointer-events: none;
            box-sizing: border-box;
        `;
        document.body.appendChild(this.#infoElement);
    }

    #displayOverlay() {
        if (!this.#infoElement || !this.#currentOwnerElement) return;

        this.#infoElement.style.width = null; // Clear width for recalculation

        const ownerRect = this.#currentOwnerElement.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;

        let calculatedX = ownerRect.right + 30;
        let calculatedY = ownerRect.top + window.scrollY;

        // Temporarily make visible (if not already) to get accurate offsetWidth for left-side calculation
        const originalDisplay = this.#infoElement.style.display;
        this.#infoElement.style.display = 'block';

        // Perform width clamping before calculating left-side position if needed
        const currentStyleWidth = parseInt(this.#infoElement.style.width, 10);
        if ((!isNaN(currentStyleWidth) && currentStyleWidth > this.#maxAllowedWidth) ||
            (this.#infoElement.offsetWidth > this.#maxAllowedWidth)) {
            this.#infoElement.style.width = this.#maxAllowedWidth + "px";
        }

        if (viewportWidth - calculatedX < 400) {
            calculatedX = ownerRect.left - this.#infoElement.offsetWidth - 30;
        }

        this.#infoElement.style.display = originalDisplay; // Restore display

        this.#applyFinalPosition(calculatedX, calculatedY);
        this.#infoElement.style.visibility = "visible";
    }

    #concealOverlay() {
        if (!this.#infoElement) return;
        this.#infoElement.style.visibility = "hidden";
        this.#lastHoveredIdentifier = null;
        this.#currentOwnerElement = null;
    }

    #updateOverlayContent(markup, isPlainText = false) {
        if (!this.#infoElement) return;
        if (isPlainText) {
            this.#infoElement.innerHTML = `<section class="info-text-wrapper"><p>${this.#escapeHtml(markup)}</p></section>`;
        } else {
            this.#infoElement.innerHTML = markup;
        }
    }

    #escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    #applyFinalPosition(targetX, targetY) {
        if (!this.#infoElement) return;

        // Ensure element is display: block to get correct dimensions for clamping
        const originalDisplay = this.#infoElement.style.display;
        this.#infoElement.style.display = 'block';

        // Reset position for width calculation, then apply max width
        this.#infoElement.style.left = "0px";
        this.#infoElement.style.top = "0px";
        const currentStyleWidth = parseInt(this.#infoElement.style.width, 10);
        if ((!isNaN(currentStyleWidth) && currentStyleWidth > this.#maxAllowedWidth) ||
            (this.#infoElement.offsetWidth > this.#maxAllowedWidth)) {
            this.#infoElement.style.width = this.#maxAllowedWidth + "px";
        }

        const overlayHeight = this.#infoElement.offsetHeight;
        const viewportHeight = document.documentElement.clientHeight;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        let finalY = targetY;
        let finalX = targetX;

        // Bottom clamp
        if (finalY + overlayHeight > viewportHeight + scrollY) {
            finalY = (viewportHeight + scrollY) - overlayHeight;
        }
        // Top clamp
        if (finalY < scrollY) {
            finalY = scrollY;
        }

        this.#infoElement.style.left = finalX + "px";
        this.#infoElement.style.top = finalY + "px";

        this.#infoElement.style.display = originalDisplay; // Restore original display
    }

    // Public methods for external interaction
    presentInformationText(message) {
        if (!this.#infoElement) return;
        this.#updateOverlayContent(message, true);
        this.#displayOverlay();
    }

    presentCachedInformationData(dataObject) {
        if (!this.#infoElement) return;
        this.#updateOverlayContent(dataObject.markup);
        this.#displayOverlay();
    }

    presentProcessedInformationData(dataObject) {
        if (!this.#infoElement) return;
        dataObject.finalMarkup = `<article class="info-border-wrapper">${dataObject.markup}</article>`; // Divergent property name and structure
        this.#dataCache.set(this.#activeFetchIdentifier, dataObject);

        if (this.#lastHoveredIdentifier === this.#activeFetchIdentifier) {
            this.presentCachedInformationData(dataObject);
        }

        this.#activeFetchIdentifier = null;
        this.#processPendingRequests();
    }

    signalFetchFailure() {
        if (!this.#infoElement) return;
        this.#activeFetchIdentifier = null;
        this.presentInformationText("Failed to load information.");
    }

    // Hover event handler
    async handleElementHover(event) {
        if (!this.#infoElement) return;

        const targetElement = event.currentTarget;
        this.#currentOwnerElement = targetElement;

        const identifier = targetElement.dataset.hintId;
        const spellIdentifier = targetElement.dataset.hintSpellid;
        const randomModifier = targetElement.dataset.hintRand;
        const upgradeLevel = targetElement.dataset.hintUpgd;
        const bonusIds = targetElement.dataset.hintBonus;

        if (!identifier) return;

        const hintType = targetElement.dataset.hintType || "item";

        let requestUrl = `https://www.wowhead.com/${hintType}=${identifier}&power`;
        if (randomModifier && randomModifier !== "0") {
            requestUrl += `&rand=${randomModifier}`;
        }
        if (upgradeLevel && upgradeLevel !== "0") {
            requestUrl += `&upgd=${upgradeLevel}`;
        }
        if (bonusIds) {
            requestUrl += `&bonus=${bonusIds}`;
        }
        requestUrl += "&lvl=100";

        this.#lastHoveredIdentifier = requestUrl;

        if (this.#dataCache.has(requestUrl)) {
            this.presentCachedInformationData(this.#dataCache.get(requestUrl));
        } else {
            this.#enqueueFetch(requestUrl);
            this.presentInformationText("Retrieving data...");
        }
    }

    // Request queue management
    #enqueueFetch(url) {
        if (this.#activeFetchIdentifier !== url && !this.#requestQueue.includes(url)) {
            this.#requestQueue.push(url);
            this.#processPendingRequests();
        }
    }

    async #processPendingRequests() {
        if (this.#requestQueue.length === 0 || this.#activeFetchIdentifier) {
            return;
        }

        this.#activeFetchIdentifier = this.#requestQueue.shift();

        try {
            const response = await fetch(this.#activeFetchIdentifier);
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            const scriptText = await response.text();

            const tempScript = document.createElement('script');
            tempScript.textContent = scriptText;
            document.body.appendChild(tempScript);
            tempScript.remove();
        } catch (error) {
            console.error("Data fetch error:", error);
            this.signalFetchFailure();
        }
    }

    // WoWHead compatibility functions
    #setupGlobalCallbacks() {
        window.ExternalDataProcessor = {
            registerItem: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
            registerSpell: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
            registerAchievement: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
            registerStatistic: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
            registerNpc: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
            registerObject: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
            registerQuest: (id, showIcon, data) => this.#handleExternalDataCallback(id, showIcon, data),
        };
    }

    #handleExternalDataCallback(id, showIcon, rawData) {
        rawData.markup = rawData.tooltip_enus || rawData.tooltip_beta; // Use 'markup' instead of 'tooltip'
        this.presentProcessedInformationData(rawData);
    }
}

// Global instance and initialization
const infoService = new HoverInfoController();

document.addEventListener('DOMContentLoaded', () => {
    infoService.bootSystem();

    // Attach event listeners using delegation
    document.body.addEventListener('mouseover', (event) => {
        const target = event.target.closest('[data-hint-id]');
        if (target) {
            infoService.handleElementHover(event);
        }
    });

    document.body.addEventListener('mouseout', (event) => {
        const target = event.target.closest('[data-hint-id]');
        if (target) {
            infoService.concealOverlay();
        }
    });
});