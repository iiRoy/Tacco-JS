class ViewportStyler {
    #configuration;
    #activeStyleLink;
    #currentHrefPath = null;

    constructor(preferences = {}) {
        const basePreferences = {
            thresholdFiles: {
                1150: "1150.css",
                1550: "1550.css",
                830: "830.css",
            },
            defaultFile: "default.css",
            resourceBase: "/css/Sive/",
            linkIdentifier: "Sive"
        };

        this.#configuration = { ...basePreferences, ...preferences };
        this.#configuration.orderedThresholds = this.#prepareBreakpoints(this.#configuration.thresholdFiles);

        this.#establishStyleLink();
        this.#monitorViewportChanges();
        this.updateStylesheet();
    }

    #prepareBreakpoints(rawMap) {
        return Object.entries(rawMap)
            .map(([value, filename]) => ({ limit: parseInt(value, 10), asset: filename }))
            .sort((a, b) => a.limit - b.limit);
    }

    #establishStyleLink() {
        let existingLink = document.getElementById(this.#configuration.linkIdentifier);

        if (!existingLink) {
            existingLink = document.createElement("link");
            existingLink.setAttribute("id", this.#configuration.linkIdentifier);
            existingLink.setAttribute("rel", "stylesheet");
            document.head.appendChild(existingLink);
        }
        this.#activeStyleLink = existingLink;
        this.#currentHrefPath = this.#activeStyleLink.getAttribute("href");
    }

    #retrieveViewportDimension() {
        if (typeof window.innerWidth !== 'undefined') {
            return window.innerWidth;
        } else if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.clientWidth !== 'undefined' && document.documentElement.clientWidth !== 0) {
            return document.documentElement.clientWidth;
        } else {
            return document.getElementsByTagName('body')[0].clientWidth;
        }
    }

    updateStylesheet() {
        const viewportWidth = this.#retrieveViewportDimension();
        let chosenAsset = this.#configuration.defaultFile;

        for (const thresholdItem of this.#configuration.orderedThresholds) {
            if (viewportWidth <= thresholdItem.limit) {
                chosenAsset = thresholdItem.asset;
                break;
            }
        }

        const newHref = this.#configuration.resourceBase + chosenAsset;

        if (this.#currentHrefPath !== newHref) {
            this.#activeStyleLink.setAttribute("href", newHref);
            this.#currentHrefPath = newHref;
        }
    }

    #monitorViewportChanges() {
        window.addEventListener('resize', this.updateStylesheet.bind(this));
    }
}

new ViewportStyler();