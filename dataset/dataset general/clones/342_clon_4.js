const stylePrefixer = (propName, propValue, transformer = null) => {
    const prefixes = ['webkit', 'moz', 'ms', 'o'];
    const resultStyles = {};

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    prefixes.forEach(prefix => {
        let prefixedValue = propValue;
        if (transformer && typeof propValue === 'string') {
            prefixedValue = propValue.replace(transformer, `-${prefix}-${transformer}`);
        }
        resultStyles[`${prefix}${capitalize(propName)}`] = prefixedValue;
    });
    resultStyles[propName] = propValue;
    return resultStyles;
};

class AnimatedScrollElement {
    constructor(domElement, initialConfig) {
        this.htmlElement = domElement;
        this.configOptions = { ...initialConfig };
        this.initialOffsetTop = 0;
        this.currentOpacityState = 1;

        const elementDataset = domElement.dataset;
        for (const key in elementDataset) {
            if (Object.prototype.hasOwnProperty.call(elementDataset, key)) {
                const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                if (this.configOptions[camelKey] === undefined || this.configOptions[camelKey] === null) {
                    let dataValue = elementDataset[key];
                    if (!isNaN(Number(dataValue)) && dataValue.trim() !== '') {
                        dataValue = Number(dataValue);
                    }
                    this.configOptions[camelKey] = dataValue;
                }
            }
        }

        if (this.configOptions.opacity !== undefined && this.configOptions.opacity !== false) {
             this.configOptions.opacity = parseFloat(this.configOptions.opacity) / 100;
        }

        this.applyInitialStyles();
    }

    applyInitialStyles() {
        const transitionStyles = stylePrefixer('transition', this.configOptions.transition, 'transform');
        for (const prop in transitionStyles) {
            if (Object.prototype.hasOwnProperty.call(transitionStyles, prop)) {
                this.htmlElement.style[prop] = transitionStyles[prop];
            }
        }
    }

    updatePosition() {
        this.initialOffsetTop = this.htmlElement.getBoundingClientRect().top + window.scrollY;
    }

    buildTransformString() {
        const transformations = [];
        const transformMap = {
            'move': 'translate', 'move3D': 'translate3d', 'moveX': 'translateX', 'moveY': 'translateY', 'moveZ': 'translateZ',
            'rotate': 'rotate', 'rotate3d': 'rotate3d', 'rotateX': 'rotateX', 'rotateY': 'rotateY', 'rotateZ': 'rotateZ',
            'scale': 'scale', 'scale3d': 'scale3d', 'scaleX': 'scaleX', 'scaleY': 'scaleY',
            'skew': 'skew', 'skewX': 'skewX', 'skewY': 'skewY'
        };

        for (const key in this.configOptions) {
            if (Object.prototype.hasOwnProperty.call(this.configOptions, key) && transformMap[key] && this.configOptions[key] !== null) {
                let value = this.configOptions[key];
                if (typeof value === 'number' && typeof transformMap[key] === 'string') {
                    if (key.startsWith('move') && !String(value).endsWith('px')) value += 'px';
                    else if (key.startsWith('rotate') && !String(value).endsWith('deg')) value += 'deg';
                    else if (key.startsWith('skew') && !String(value).endsWith('deg')) value += 'deg';
                }
                transformations.push(`${transformMap[key]}(${value})`);
            }
        }
        return transformations.join(' ');
    }

    concealElement() {
        if (this.currentOpacityState === this.configOptions.opacity) return;

        if (this.configOptions.opacity !== false) {
            this.htmlElement.style.opacity = this.configOptions.opacity;
            this.currentOpacityState = this.configOptions.opacity;
        }

        const transformString = this.buildTransformString();
        if (transformString) {
            const transformStyles = stylePrefixer('transform', transformString);
            for (const prop in transformStyles) {
                if (Object.prototype.hasOwnProperty.call(transformStyles, prop)) {
                    this.htmlElement.style[prop] = transformStyles[prop];
                }
            }

            if (this.configOptions.perspective && this.htmlElement.parentElement) {
                 const perspectiveStyles = stylePrefixer('perspective', `${this.configOptions.perspective}px`);
                 for (const prop in perspectiveStyles) {
                     if (Object.prototype.hasOwnProperty.call(perspectiveStyles, prop)) {
                         this.htmlElement.parentElement.style[prop] = perspectiveStyles[prop];
                     }
                 }
            }

            if (this.configOptions.transformOrigin) {
                const originStyles = stylePrefixer('transformOrigin', this.configOptions.transformOrigin);
                for (const prop in originStyles) {
                    if (Object.prototype.hasOwnProperty.call(originStyles, prop)) {
                        this.htmlElement.style[prop] = originStyles[prop];
                    }
                }
            }
        }
    }

    revealElement() {
        if (this.currentOpacityState === 1) return;

        this.htmlElement.style.opacity = 1;
        this.currentOpacityState = 1;

        const resetTransformStyles = stylePrefixer('transform', '');
        for (const prop in resetTransformStyles) {
            if (Object.prototype.hasOwnProperty.call(resetTransformStyles, prop)) {
                this.htmlElement.style[prop] = resetTransformStyles[prop];
            }
        }
    }
}

class ScrollAnimationManager {
    constructor(domSelector, userOptions = {}) {
        this.targetSelector = domSelector;
        this.defaultProperties = {
            offset: 150,
            opacity: 0,
            transition: "all 1s ease, opacity 1.5s ease",
            transformStyle: 'preserve-3d',
            transformOrigin: null,
            perspective: 1000,
            move: null, move3D: null, moveX: null, moveY: null, moveZ: null,
            rotate: null, rotate3d: null, rotateX: null, rotateY: null, rotateZ: null,
            scale: null, scale3d: null, scaleX: null, scaleY: null,
            skew: null, skewX: null, skewY: null
        };
        this.globalSettings = { ...this.defaultProperties, ...userOptions };

        this.animatedComponents = [];
        this.eventListenersActive = false;
        this.previousScrollY = 0;
        this.scrollFlow = 'down';

        this.previousWindowHeight = window.innerHeight;
        this.previousWindowWidth = window.innerWidth;
        this.previousDocumentHeight = document.documentElement.scrollHeight;

        this.resizeDebounceTimer = null;
        this.scrollRenderScheduled = false;

        this.configureElements();
        this.activateGlobalListeners();
        this.performInitialRender();
    }

    configureElements() {
        document.querySelectorAll(this.targetSelector).forEach(element => {
            const animatedItem = new AnimatedScrollElement(element, this.globalSettings);
            this.animatedComponents.push(animatedItem);
        });
        if (document.body.offsetWidth === window.innerWidth) {
            document.body.style.overflowX = 'hidden';
        }
    }

    activateGlobalListeners() {
        if (this.eventListenersActive) return;

        window.addEventListener('scroll', () => this.handleScrollEvent(), { passive: true });
        window.addEventListener('resize', () => this.handleResizeEvent());
        window.addEventListener('load', () => this.performInitialRender());

        this.eventListenersActive = true;
    }

    handleScrollEvent() {
        if (!this.scrollRenderScheduled) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                this.scrollFlow = (currentScrollY < this.previousScrollY) ? 'up' : 'down';
                this.previousScrollY = currentScrollY;
                this.refreshComponentVisibility();
                this.scrollRenderScheduled = false;
            });
            this.scrollRenderScheduled = true;
        }
    }

    handleResizeEvent() {
        clearTimeout(this.resizeDebounceTimer);
        this.resizeDebounceTimer = setTimeout(() => {
            const currentHeight = window.innerHeight;
            const currentWidth = window.innerWidth;
            const currentDocHeight = document.documentElement.scrollHeight;

            this.scrollFlow = (this.previousWindowHeight > currentHeight) ? 'up' : 'down';
            this.previousWindowHeight = currentHeight;

            if (this.previousWindowWidth !== currentWidth) {
                this.animatedComponents.forEach(item => {
                    const resetTransformStyles = stylePrefixer('transform', '');
                    const resetTransitionStyles = stylePrefixer('transition', '');
                    for (const prop in resetTransformStyles) {
                        if (Object.prototype.hasOwnProperty.call(resetTransformStyles, prop)) {
                            item.htmlElement.style[prop] = resetTransformStyles[prop];
                        }
                    }
                    for (const prop in resetTransitionStyles) {
                        if (Object.prototype.hasOwnProperty.call(resetTransitionStyles, prop)) {
                            item.htmlElement.style[prop] = resetTransitionStyles[prop];
                        }
                    }
                });

                let layoutStabilityCheck = setInterval(() => {
                    const newDocHeight = document.documentElement.scrollHeight;
                    if (newDocHeight === this.previousDocumentHeight) {
                        clearInterval(layoutStabilityCheck);
                        this.animatedComponents.forEach(item => {
                            item.updatePosition();
                            item.applyInitialStyles();
                        });
                        this.refreshComponentVisibility();
                    }
                    this.previousDocumentHeight = newDocHeight;
                }, 500);
            } else {
                this.refreshComponentVisibility();
            }
            this.previousWindowWidth = currentWidth;
        }, 500);
    }

    performInitialRender() {
        this.animatedComponents.forEach(item => item.updatePosition());
        this.refreshComponentVisibility();
    }

    refreshComponentVisibility() {
        const viewportHeight = window.innerHeight;
        const currentScrollY = window.scrollY;

        this.animatedComponents.forEach(item => {
            const itemBottomToViewportBottom = currentScrollY + viewportHeight - item.initialOffsetTop;

            let effectiveThreshold = item.configOptions.offset;
            if ((!this.scrollFlow || (this.scrollFlow === 'down' && item.currentOpacityState === 1))) {
                effectiveThreshold = 0;
            }

            if (typeof effectiveThreshold === 'string' && effectiveThreshold.includes('%')) {
                effectiveThreshold = parseFloat(effectiveThreshold) / 100 * viewportHeight;
            }

            if (itemBottomToViewportBottom < effectiveThreshold) {
                item.concealElement();
            } else {
                item.revealElement();
            }
        });
    }
}

(() => {
    if (typeof window.ScrollEffectEngine === 'undefined') {
        window.ScrollEffectEngine = (selector, options) => {
            new ScrollAnimationManager(selector, options);
        };
    }
})();