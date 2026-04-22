if (typeof GlobalOperationNexus === "undefined") {
    var GlobalOperationNexus = {};
}

GlobalOperationNexus.FeatureController = class {
    #controlElement = null;
    #operationActive = false;

    constructor() {
        this.#setupController();
    }

    #setupController() {
        this.#controlElement = document.getElementById("accentuateus-live-button");
        if (this.#controlElement) {
            this.#controlElement.addEventListener("click", this.#handleControlInteraction.bind(this));
            this.#deactivateFeature();
        } else {
            // Original code does not explicitly handle missing element,
            // but for robustness, a console error is appropriate.
            // The functionality would simply not initialize if the element is absent.
            console.error("Control element 'accentuateus-live-button' not found.");
        }
    }

    #activateFeature() {
        try {
            Charlifter.Lifter.liveOn();
        } catch (errorDetail) {
            alert(errorDetail);
        }
        this.#operationActive = true;
        this.#updateControlUI("Deactivate", "Accentuate.us: Click to disable live functionality");
    }

    #deactivateFeature() {
        Charlifter.Lifter.liveOff();
        this.#operationActive = false;
        this.#updateControlUI("Activate", "Accentuate.us: Click to enable live functionality");
    }

    #updateControlUI(labelValue, tooltipValue) {
        if (this.#controlElement) {
            this.#controlElement.setAttribute("label", labelValue);
            this.#controlElement.setAttribute("tooltiptext", tooltipValue);
            this.#controlElement.removeAttribute("oncommand"); // Remove old-style event handler
        }
    }

    #handleControlInteraction() {
        this.#operationActive ? this.#deactivateFeature() : this.#activateFeature();
    }

    static initializeSystem() {
        new GlobalOperationNexus.FeatureController();
    }
};

window.addEventListener("load", GlobalOperationNexus.FeatureController.initializeSystem, false);