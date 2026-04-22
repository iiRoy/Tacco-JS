function shallowCombineProperties(target, ...sources) {
    if (target === null || typeof target !== 'object') {
        target = {};
    }
    for (const source of sources) {
        if (source !== null && typeof source === 'object') {
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}

function debounceFunction(func, delay) {
    let timeoutId = null;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}

function isElementRendered(element) {
    if (!element || element.parentNode === null) {
        return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        return false;
    }
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
}

function applyOpacityTransition(element, durationMs) {
    element.style.transition = `opacity ${durationMs}ms ease-in-out`;
}

class VisualContentLoader {
    constructor(scopeElement, configuration = {}) {
        if (!(scopeElement instanceof HTMLElement)) {
            throw new Error("Target scope element must be an HTMLElement.");
        }

        this.rootElement = scopeElement;
        this.moduleIdentifier = `vcl-${Math.random().toString(36).substr(2, 9)}`;

        this.settings = shallowCombineProperties({}, VisualContentLoader.defaultConfiguration, configuration);

        this.loadedSourceCache = new Set(); 

        this.currentViewportHeight = 0;
        this.currentViewportScrollY = 0;
        this.currentViewportWidth = 0;
        this.currentViewportScrollX = 0;

        this.prepareContentForLoading();
        this.enableDynamicLoading();
    }

    static defaultConfiguration = {
        visualClass: "lazy",
        completionClass: "contentLoaded",
        placeholderImage: "data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH/C1hNUCBEYXRhWE1QRT94cGFja2V0IDE2MDZCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZERDQ1MzVGMkZGMTExRTFBQTE4OTE5ODk4MQAh+QQFAAAAACwAAAAAAQABAEACAkQBADs=",
        refreshOnResize: true,
        auxiliaryScrollElement: "",
        attributeList: ["src", "width", "height", "alt", "class"],
        proximityThreshold: 300,
        debounceDuration: 100,
        fadeDuration: 250,
        loadHiddenContent: false,
        forceLoadOverride: false,
        sourcePriorities: ["doubleDensity", "mobileDevice", "desktopDevice"],
        sourceFallbackKey: "desktopDevice",
        sourceChecks: {
            "doubleDensity": function() { return window.devicePixelRatio > 1; },
            "mobileDevice": function() { return window.innerWidth < 600; },
            "desktopDevice": function() { return window.innerWidth >= 600; }
        },
        minHeight: null,
        onload: null
    };

    prepareContentForLoading() {
        this.processNoscriptTags();
        this.updateViewportMetrics();
    }

    enableDynamicLoading() {
        const debouncedScan = debounceFunction(() => {
            this.updateViewportMetrics();
            this.scanForLazyImages(false);
        }, this.settings.debounceDuration);

        window.addEventListener("scroll", debouncedScan, { passive: true });
        window.addEventListener("resize", debouncedScan, { passive: true });
        window.addEventListener("orientationchange", debouncedScan, { passive: true });

        if (this.settings.auxiliaryScrollElement) {
            const auxElem = document.querySelector(this.settings.auxiliaryScrollElement);
            if (auxElem) {
                auxElem.addEventListener("scroll", debouncedScan, { passive: true });
            }
        }

        this.rootElement.addEventListener(`updateLazyContent.${this.moduleIdentifier}`, (event) => {
            if (event.target instanceof HTMLImageElement) {
                this.evaluateImageEligibility(event.target, event.detail && event.detail.forceScan);
            }
        });
        this.rootElement.addEventListener(`forceContentLoad.${this.moduleIdentifier}`, (event) => {
            if (event.target instanceof HTMLImageElement) {
                this.initiateImmediateLoad(event.target);
            }
        });

        this.scanForLazyImages(true);
    }

    processNoscriptTags() {
        const noscriptElements = Array.from(this.rootElement.querySelectorAll(`noscript.${this.settings.visualClass}`));

        noscriptElements.forEach(noscript => {
            const newImgElement = document.createElement("img");

            this.settings.attributeList.forEach(attr => {
                const dataValue = noscript.dataset[attr];
                if (dataValue !== undefined) {
                    newImgElement.setAttribute(attr, dataValue);
                }
            });

            for (const key in noscript.dataset) {
                if (Object.prototype.hasOwnProperty.call(noscript.dataset, key)) {
                    newImgElement.dataset[key] = noscript.dataset[key];
                }
            }

            newImgElement.classList.add(this.settings.visualClass);
            newImgElement.setAttribute("src", this.settings.placeholderImage);

            if (this.settings.minHeight !== null && !newImgElement.getAttribute("height")) {
                newImgElement.style.height = `${this.settings.minHeight}px`;
            }

            noscript.parentNode.replaceChild(newImgElement, noscript);

            applyOpacityTransition(newImgElement, this.settings.fadeDuration);
            newImgElement.style.opacity = "0.01";
        });
    }

    updateViewportMetrics() {
        this.currentViewportHeight = window.innerHeight;
        this.currentViewportScrollY = window.pageYOffset || document.documentElement.scrollTop;
        this.currentViewportWidth = window.innerWidth;
        this.currentViewportScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    }

    scanForLazyImages(isInitialLoad) {
        const imagesToConsider = Array.from(this.rootElement.querySelectorAll(`img.${this.settings.visualClass}`));

        imagesToConsider.forEach(imgElement => {
            if (!this.settings.refreshOnResize && imgElement.classList.contains(this.settings.completionClass) && !isInitialLoad) {
                return;
            }
            this.evaluateImageEligibility(imgElement, isInitialLoad);
        });
    }

    evaluateImageEligibility(imgElement, explicitForce = false) {
        const config = this.settings;

        if (imgElement.classList.contains(config.completionClass) && !explicitForce) {
            return;
        }

        const isVisible = config.loadHiddenContent || isElementRendered(imgElement);
        const dataForceOverride = imgElement.dataset.forceLoadOverride === 'true';

        const imgRect = imgElement.getBoundingClientRect();
        const elementTopAbsolute = imgRect.top + this.currentViewportScrollY;
        const elementLeftAbsolute = imgRect.left + this.currentViewportScrollX;

        const isInViewThreshold = () => {
            const extraVerticalBuffer = (/iphone|ipod/i.test(navigator.userAgent.toLowerCase())) ? 60 : 0;
            const verticalCheck = elementTopAbsolute < (this.currentViewportScrollY + this.currentViewportHeight + config.proximityThreshold + extraVerticalBuffer);
            const horizontalCheck = elementLeftAbsolute < (this.currentViewportScrollX + this.currentViewportWidth + config.proximityThreshold);
            return verticalCheck && horizontalCheck;
        };

        const shouldAttemptLoad = explicitForce || (
            (config.refreshOnResize || !imgElement.classList.contains(config.completionClass)) &&
            isVisible &&
            isInViewThreshold() &&
            !(config.forceLoadOverride || dataForceOverride)
        );

        if (shouldAttemptLoad) {
            this.determineAndApplySource(imgElement, explicitForce);
            imgElement.classList.add(config.completionClass);
        }
    }

    determineOptimalSource(imgElement) {
        const config = this.settings;
        let chosenSource = null;

        for (const priorityKey of config.sourcePriorities) {
            const dataSource = imgElement.dataset[priorityKey];
            const testFn = config.sourceChecks[priorityKey];

            if (typeof testFn === 'function' && testFn.call(imgElement) && dataSource) {
                chosenSource = dataSource;
                break;
            }
        }
        return chosenSource || imgElement.dataset[config.sourceFallbackKey];
    }

    determineAndApplySource(imgElement, explicitForce) {
        const config = this.settings;
        const newSourceUrl = this.determineOptimalSource(imgElement);

        if (newSourceUrl && newSourceUrl !== imgElement.getAttribute("src")) {
            if (sessionStorage.getItem(newSourceUrl) === "loaded" || this.loadedSourceCache.has(newSourceUrl)) {
                explicitForce = true;
            }

            const handleImageLoad = () => {
                imgElement.removeEventListener("load", handleImageLoad);
                imgElement.style.opacity = "1";
                if (typeof config.onload === "function") {
                    config.onload.call(imgElement, false);
                }
            };

            imgElement.addEventListener("load", handleImageLoad, { once: true });

            imgElement.style.opacity = "0.01";
            imgElement.setAttribute("src", newSourceUrl);

            if (!imgElement.dataset.width) {
                imgElement.removeAttribute("width");
            }
            if (!imgElement.dataset.height) {
                imgElement.removeAttribute("height");
            }

            try {
                sessionStorage.setItem(newSourceUrl, "loaded");
                this.loadedSourceCache.add(newSourceUrl);
            } catch (e) {
                // sessionStorage might be unavailable
            }
        }
    }

    initiateImmediateLoad(imgElement) {
        this.evaluateImageEligibility(imgElement, true);
    }

    triggerRescan() {
        this.updateViewportMetrics();
        this.scanForLazyImages(false);
    }
}