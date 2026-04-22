/*jslint browser: true, continue: true, plusplus: true, regexp: true, sloppy: true */

document.createElement("responsive-image");

class VisualAssetHandler {
    #hostElement;
    #currentImageElement;
    #assetSettings;
    #currentSourceSize;
    #pathSchema; // To store regex segments and size field index for path reconstruction
    #idTag; // Unique ID for the rendered img

    constructor(sourceElement, globalSettings) {
        this.#hostElement = sourceElement;
        this.#assetSettings = this.#synthesizeSettings(globalSettings);
        this.#idTag = `vis-asset-${Math.floor(Math.random() * 99999999)}`;
        this.#hostElement.setAttribute(`data-vis-asset-id`, this.#idTag);

        // Extract initial source path from data-src-template or noscript content
        let initialSrc = this.#hostElement.getAttribute('data-src-template');
        if (!initialSrc && this.#assetSettings.usePlaceholderTag) {
             const tempDiv = document.createElement("div");
             tempDiv.innerHTML = this.#hostElement.childNodes[0]?.data || '';
             const imgInNoScript = tempDiv.getElementsByTagName("img")[0];
             if (imgInNoScript) {
                 initialSrc = imgInNoScript.src;
                 this.#hostElement.setAttribute('data-alt-text', imgInNoScript.getAttribute('alt') || '');
                 this.#hostElement.setAttribute('data-title-text', imgInNoScript.getAttribute('title') || '');
                 this.#hostElement.setAttribute('data-visual-class', imgInNoScript.getAttribute('class') || '');
             }
        }
        
        if (initialSrc) {
            const pathRegex = new RegExp(this.#assetSettings.pathPattern);
            const matches = pathRegex.exec(initialSrc);
            if (matches) {
                this.#pathSchema = {
                    segments: Array.from(matches).slice(1), // Store only capture groups (1-based)
                    sizeFieldIdx: this.#assetSettings.pathSizeIndex - 1 // Convert to 0-based index for array
                };
            } else {
                // Fallback if regex doesn't match, assume base + size + extension
                // This means the pathPattern was not able to parse the source with a size field.
                const lastDot = initialSrc.lastIndexOf('.');
                this.#pathSchema = {
                    segments: [initialSrc.substring(0, lastDot), initialSrc.substring(lastDot)], // [base, .ext]
                    sizeFieldIdx: -1 // Indicates injecting between base and ext
                };
            }
        }
    }

    // Merges global settings with element-specific data attributes and namespace overrides
    #synthesizeSettings(globals) {
        const local = {};
        const prefix = globals.assetClassIdentifier + '-';
        
        // Determine namespace-specific settings
        const classNames = this.#hostElement.className.split(" ").filter(Boolean);
        let selectedNamespaceKey = null;
        for (const cls of classNames) {
            if (cls === globals.assetClassIdentifier) {
                selectedNamespaceKey = 'standard';
            }
            if (cls.startsWith(prefix)) {
                const namespace = cls.substring(prefix.length);
                if (globals[namespace]) {
                    selectedNamespaceKey = namespace;
                }
            }
        }

        const effectiveDefaults = selectedNamespaceKey ? globals[selectedNamespaceKey] : globals.standard;
        
        // Merge global non-default settings
        local.assetClassIdentifier = globals.assetClassIdentifier;
        local.delayBeforeLoad = globals.delayBeforeLoad;
        local.usePlaceholderTag = globals.usePlaceholderTag;

        // Merge default/namespace settings
        local.availableDimensions = effectiveDefaults.availableDimensions;
        local.dimensionNameMapping = effectiveDefaults.dimensionNameMapping;
        local.pathPattern = effectiveDefaults.pathPattern;
        local.pathSizeIndex = effectiveDefaults.pathSizeIndex;
        local.allowDeferredLoad = effectiveDefaults.allowDeferredLoad;
        local.deferredLoadThreshold = effectiveDefaults.deferredLoadThreshold;

        // Overlay element-specific data attributes (highest precedence)
        const data = this.#hostElement.dataset;
        if (data.dimensions) local.availableDimensions = JSON.parse(data.dimensions);
        if (data.dimensionMap) local.dimensionNameMapping = JSON.parse(data.dimensionMap);
        if (data.pathPattern) local.pathPattern = data.pathPattern;
        if (data.pathSizeIndex) local.pathSizeIndex = parseInt(data.pathSizeIndex, 10);
        if (data.deferredLoad) local.allowDeferredLoad = data.deferredLoad === 'true';
        if (data.deferredLoadThreshold) local.deferredLoadThreshold = parseInt(data.deferredLoadThreshold, 10);
        if (data.assetClassIdentifier) local.assetClassIdentifier = data.assetClassIdentifier;

        // Ensure dimensions are sorted
        local.availableDimensions.sort((a, b) => a - b);
        
        return local;
    }

    // Determines the appropriate image size based on current viewport width
    #resolveOptimalDimension(currentWidth) {
        let bestDimension = this.#assetSettings.availableDimensions[this.#assetSettings.availableDimensions.length - 1]; // Default to largest
        for (const dim of this.#assetSettings.availableDimensions) {
            if (currentWidth <= dim) {
                bestDimension = dim;
                break;
            }
        }
        return bestDimension;
    }

    // Constructs the full image URL based on the selected dimension
    #generateSourcePath(selectedDimension) {
        if (!this.#pathSchema) return '';

        const sizeName = this.#assetSettings.dimensionNameMapping[selectedDimension] || selectedDimension;

        if (this.#pathSchema.sizeFieldIdx !== -1) {
            // Reconstruct using stored segments, replacing the size field
            const parts = [...this.#pathSchema.segments]; // Create a mutable copy
            if (this.#pathSchema.sizeFieldIdx < parts.length) {
                parts[this.#pathSchema.sizeFieldIdx] = String(sizeName); // Replace the size part
            }
            return parts.join(''); // Concatenate all capture groups
        } else { // Simple base + size + ext injection fallback
             return `${this.#pathSchema.segments[0]}-${sizeName}${this.#pathSchema.segments[1]}`;
        }
    }

    // Updates or creates the <img> element
    updateVisual(viewportWidth) {
        const newDimension = this.#resolveOptimalDimension(viewportWidth);
        
        // Only update if dimension has changed and an image already exists
        if (newDimension === this.#currentSourceSize && this.#currentImageElement) {
            return { needsDeferredObservation: false };
        }

        this.#currentSourceSize = newDimension;
        const newSourcePath = this.#generateSourcePath(newDimension);

        let existingImage = document.getElementById(this.#idTag);

        if (existingImage && parseInt(existingImage.getAttribute(`data-${this.#assetSettings.assetClassIdentifier}-used-dimension`), 10) === newDimension) {
            this.#currentImageElement = existingImage;
            return { needsDeferredObservation: this.#assetSettings.allowDeferredLoad }; // Already correct, just needs observation if deferred
        }

        if (existingImage) {
            existingImage.parentNode.removeChild(existingImage);
            existingImage = null;
            this.#hostElement.removeAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred-loaded`);
        }

        const newImage = document.createElement("img");
        newImage.setAttribute("id", this.#idTag);
        newImage.setAttribute(`data-${this.#assetSettings.assetClassIdentifier}-used-dimension`, newDimension);

        const altText = this.#hostElement.getAttribute('data-alt-text');
        if (altText) newImage.setAttribute("alt", altText);
        
        const titleText = this.#hostElement.getAttribute('data-title-text');
        if (titleText) newImage.setAttribute("title", titleText);
        
        const visualClass = this.#hostElement.getAttribute('data-visual-class');
        if (visualClass) newImage.setAttribute("class", visualClass);

        if (this.#assetSettings.allowDeferredLoad) {
            newImage.setAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred-src`, newSourcePath);
            this.#hostElement.setAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred`, String(this.#assetSettings.deferredLoadThreshold));
        } else {
            newImage.setAttribute("src", newSourcePath);
        }

        this.#hostElement.parentNode.insertBefore(newImage, this.#hostElement);
        this.#currentImageElement = newImage;
        return { needsDeferredObservation: this.#assetSettings.allowDeferredLoad };
    }

    // Called by IntersectionObserver to trigger deferred loading
    triggerLoadIfVisible(entry) {
        if (entry.isIntersecting && this.#currentImageElement) {
            const deferredSrc = this.#currentImageElement.getAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred-src`);
            if (deferredSrc && !this.#hostElement.hasAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred-loaded`)) {
                this.#currentImageElement.setAttribute("src", deferredSrc);
                this.#currentImageElement.removeAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred-src`);
                this.#hostElement.setAttribute(`data-${this.#assetSettings.assetClassIdentifier}-deferred-loaded`, "1");
                return true; // Indicates it was loaded
            }
        }
        return false;
    }

    get imageElement() {
        return this.#currentImageElement;
    }

    get hostElement() {
        return this.#hostElement;
    }

    get isDeferred() {
        return this.#assetSettings.allowDeferredLoad;
    }

    get uniqueId() {
        return this.#idTag;
    }
}

class DisplayManager {
    #globalConfiguration;
    #currentViewportWidth;
    #scrollbarOffset = 0;
    #assetRegistry = new Map(); // Maps uniqueId to VisualAssetHandler
    #intersectionMonitor;
    #resizeDebounceTimer;

    static #presetOptions = {
        assetClassIdentifier: "visual-asset",
        delayBeforeLoad: 200, // Used for resize debounce
        usePlaceholderTag: false, // Corresponds to useNoScript
        standard: { // Corresponds to 'default' in original
            availableDimensions: [320, 480, 720, 100000],
            dimensionNameMapping: {320: 320, 480: 480, 720: 720, 100000: 100000},
            pathPattern: "^(.+\\-)(\\d+)(\\.[a-z]+)$", // Regex string to extract parts
            pathSizeIndex: 2, // 1-based index of the size field in the regex match
            allowDeferredLoad: true, // Corresponds to lazy
            deferredLoadThreshold: 200 // Corresponds to lazyPrePx
        }
    };

    constructor() {
        this.#determineScrollbarWidth();
        this.#attachGlobalEvents();
    }

    // Deep merge function for configuration objects
    #mergeObjects(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                    target[key] = this.#mergeObjects(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    // Initializes the system with user-provided settings
    commenceOperations(userOptions) {
        this.#globalConfiguration = this.#mergeObjects(JSON.parse(JSON.stringify(DisplayManager.#presetOptions)), userOptions || {});

        // Ensure all dimension arrays in the configuration are sorted
        for (const key in this.#globalConfiguration) {
            if (this.#globalConfiguration.hasOwnProperty(key) && typeof this.#globalConfiguration[key] === 'object' && this.#globalConfiguration[key] !== null && this.#globalConfiguration[key].availableDimensions) {
                this.#globalConfiguration[key].availableDimensions.sort((a, b) => a - b);
            }
        }
        // Also ensure the 'standard' (default) dimensions are sorted
        if (this.#globalConfiguration.standard.availableDimensions) {
            this.#globalConfiguration.standard.availableDimensions.sort((a, b) => a - b);
        }

        this.#initializeAssetMonitors();
        this.#updateAssetDisplay(true); // Initial display update
    }

    // Calculates the scrollbar width
    #determineScrollbarWidth() {
        const testDiv = document.createElement("div");
        testDiv.style.width = "200px";
        testDiv.style.overflow = "scroll";
        testDiv.style.visibility = "hidden"; // Hide it
        document.body.appendChild(testDiv);

        if (testDiv.offsetWidth && testDiv.clientWidth) {
            // Original code includes a WebKit check, maintaining for functional equivalence
            if (!/WebKit/i.test(navigator.userAgent)) {
                 this.#scrollbarOffset = testDiv.offsetWidth - testDiv.clientWidth;
            }
        }
        testDiv.parentNode.removeChild(testDiv);
    }

    // Attaches global resize and load events
    #attachGlobalEvents() {
        window.addEventListener("resize", this.#onViewportChange.bind(this), false);
        window.addEventListener("load", this.#onViewportChange.bind(this), false); // Initial call on load
    }

    // Debounced viewport change handler (for resize and load)
    #onViewportChange() {
        if (this.#resizeDebounceTimer) {
            clearTimeout(this.#resizeDebounceTimer);
        }
        this.#resizeDebounceTimer = setTimeout(() => {
            this.#updateAssetDisplay();
        }, this.#globalConfiguration.delayBeforeLoad / 2); // Use half of delayBeforeLoad for resize debounce
    }

    // Finds and registers all visual asset elements
    #initializeAssetMonitors() {
        const assetElements = document.querySelectorAll(this.#globalConfiguration.usePlaceholderTag ? 'noscript' : 'responsive-image');
        
        assetElements.forEach(element => {
            if (!element.hasAttribute(`data-${this.#globalConfiguration.assetClassIdentifier}-id`)) { // Only process new elements
                const handler = new VisualAssetHandler(element, this.#globalConfiguration);
                this.#assetRegistry.set(handler.uniqueId, handler);
            }
        });

        // Setup IntersectionObserver for deferred loading
        // Root margin is determined by the maximum deferredLoadThreshold across all assets
        const maxThreshold = Math.max(...Array.from(this.#assetRegistry.values()).map(h => h.isDeferred ? h.#assetSettings.deferredLoadThreshold : 0));
        this.#intersectionMonitor = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    // The observed target is the <img> element, its parent is the host responsive-image/noscript
                    const hostElement = entry.target.parentNode;
                    const uniqueId = hostElement.getAttribute(`data-${this.#globalConfiguration.assetClassIdentifier}-id`);
                    const handler = this.#assetRegistry.get(uniqueId);
                    if (handler && handler.triggerLoadIfVisible(entry)) {
                        observer.unobserve(entry.target); // Stop observing once loaded
                    }
                });
            },
            {
                rootMargin: `0px 0px ${maxThreshold}px 0px` // Extends the bottom margin to trigger earlier
            }
        );
    }
    
    // Updates all registered assets, rebuilding images if necessary
    #updateAssetDisplay(force = false) {
        const newViewportWidth = document.documentElement.clientWidth + this.#scrollbarOffset;

        if (this.#currentViewportWidth === newViewportWidth && !force) {
            return;
        }

        this.#currentViewportWidth = newViewportWidth;
        
        // Disconnect previous observations to re-observe with potentially new image elements
        this.#intersectionMonitor.disconnect();

        this.#assetRegistry.forEach(handler => {
            const { needsDeferredObservation } = handler.updateVisual(this.#currentViewportWidth);
            if (needsDeferredObservation && handler.imageElement) {
                this.#intersectionMonitor.observe(handler.imageElement);
            }
        });
    }
}

// Global instance to manage all responsive images
const globalVisualManager = new DisplayManager();

// Exposed initiation function for external use
window.initiateVisualAssets = function(config) {
    globalVisualManager.commenceOperations(config);
};

// Auto-initialize when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.initiateVisualAssets(); // Initialize with default config
    });
} else {
    window.initiateVisualAssets(); // Initialize with default config if script runs after DOMContentLoaded
}