(function (windowRef) {
    'use strict';

    // Base configuration options
    const baseConfiguration = {
        scrollDuration: 500,
        curveType: 'easeInOutCubic',
        verticalOffset: 0,
        updateHistory: true,
        beforeScrollHook: function () {},
        afterScrollHook: function () {}
    };

    // Feature support check
    const featureSupported = !!document.querySelector && !!windowRef.addEventListener;

    /**
     * Iterates over collection items.
     * @private
     * @param {Array|Object|NodeList} collection
     * @param {Function} processor
     * @param {Object} context
     */
    const iterateCollection = (collection, processor, context) => {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for (const key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    processor.call(context, collection[key], key, collection);
                }
            }
        } else {
            Array.from(collection).forEach((item, index, arr) => {
                processor.call(context, item, index, arr);
            });
        }
    };

    /**
     * Merges objects.
     * @private
     * @param {Object} primary
     * @param {Object} secondary
     * @returns {Object}
     */
    const combineOptions = (primary, secondary) => {
        return Object.assign({}, primary, secondary);
    };

    /**
     * Finds the closest parent element matching a selector.
     * Uses Element.prototype.closest for divergence and modern approach.
     * @private
     * @param {Element} startNode
     * @param {String} targetSelector
     * @returns {Element|null}
     */
    const locateAncestor = (startNode, targetSelector) => {
        if (!startNode || !startNode.closest) {
            return null;
        }
        return startNode.closest(targetSelector);
    };

    /**
     * Measures an element's total height.
     * @private
     * @param {Node} elementNode
     * @returns {Number}
     */
    const measureNodeHeight = (elementNode) => {
        return Math.max(elementNode.scrollHeight, elementNode.offsetHeight, elementNode.clientHeight);
    };

    /**
     * Escapes characters for CSS selectors.
     * Rewritten for syntactic divergence.
     * @private
     * @param {String} inputId
     * @returns {String}
     */
    const formatCssIdentifier = (inputId) => {
        const idString = String(inputId);
        const charArray = [];
        let charCode;
        let firstChar = idString.charCodeAt(0);

        for (let i = 0; i < idString.length; i++) {
            charCode = idString.charCodeAt(i);

            if (charCode === 0x0000) {
                throw new Error('Invalid character: U+0000 found.');
            }

            if (
                (charCode >= 0x0001 && charCode <= 0x001F) || charCode === 0x007F ||
                (i === 0 && charCode >= 0x0030 && charCode <= 0x0039) ||
                (i === 1 && charCode >= 0x0030 && charCode <= 0x0039 && firstChar === 0x002D)
            ) {
                charArray.push('\\' + charCode.toString(16) + ' ');
            } else if (
                charCode >= 0x0080 ||
                charCode === 0x002D ||
                charCode === 0x005F ||
                (charCode >= 0x0030 && charCode <= 0x0039) ||
                (charCode >= 0x0041 && charCode <= 0x005A) ||
                (charCode >= 0x0061 && charCode <= 0x007A)
            ) {
                charArray.push(idString.charAt(i));
            } else {
                charArray.push('\\' + idString.charAt(i));
            }
        }
        return charArray.join('');
    };

    /**
     * Calculates easing progression.
     * Uses a Map for lookup instead of if-else chain.
     * @private
     * @param {String} styleKey
     * @param {Number} timeProgress
     * @returns {Number}
     */
    const calculateEasing = (styleKey, timeProgress) => {
        const easingFunctions = new Map([
            ['easeInQuad', t => t * t],
            ['easeOutQuad', t => t * (2 - t)],
            ['easeInOutQuad', t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t],
            ['easeInCubic', t => t * t * t],
            ['easeOutCubic', t => (--t) * t * t + 1],
            ['easeInOutCubic', t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1],
            ['easeInQuart', t => t * t * t * t],
            ['easeOutQuart', t => 1 - (--t) * t * t * t],
            ['easeInOutQuart', t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t],
            ['easeInQuint', t => t * t * t * t * t],
            ['easeOutQuint', t => 1 + (--t) * t * t * t * t],
            ['easeInOutQuint', t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t]
        ]);
        const func = easingFunctions.get(styleKey);
        return func ? func(timeProgress) : timeProgress;
    };

    /**
     * Determines the final scroll position.
     * @private
     * @param {Element} targetAnchor
     * @param {Number} headerOffset
     * @param {Number} extraOffset
     * @returns {Number}
     */
    const determineFinalScrollPosition = (targetAnchor, headerOffset, extraOffset) => {
        let currentPosition = 0;
        if (targetAnchor.offsetParent) {
            let tempAnchor = targetAnchor;
            do {
                currentPosition += tempAnchor.offsetTop;
                tempAnchor = tempAnchor.offsetParent;
            } while (tempAnchor);
        }
        currentPosition = currentPosition - headerOffset - extraOffset;
        return Math.max(0, currentPosition);
    };

    /**
     * Retrieves the document's total height.
     * @private
     * @returns {Number}
     */
    const retrieveTotalDocumentHeight = () => {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    };

    /**
     * Parses data-options attribute into an object.
     * @private
     * @param {String} dataString
     * @returns {Object}
     */
    const extractDataAttributes = (dataString) => {
        return (dataString && typeof JSON === 'object' && typeof JSON.parse === 'function') ? JSON.parse(dataString) : {};
    };

    /**
     * Modifies URL hash.
     * @private
     * @param {String} newHash
     * @param {Boolean} shouldUpdate
     */
    const modifyUrlHash = (newHash, shouldUpdate) => {
        if (history.pushState && (shouldUpdate || shouldUpdate === 'true')) {
            const currentUrl = [windowRef.location.protocol, '//', windowRef.location.host, windowRef.location.pathname, windowRef.location.search].join('');
            history.pushState(null, null, currentUrl + newHash);
        }
    };

    /**
     * Calculates the height of a fixed header.
     * @private
     * @param {Element|null} headerNode
     * @returns {Number}
     */
    const calculateFixedElementHeight = (headerNode) => {
        return headerNode === null ? 0 : (measureNodeHeight(headerNode) + headerNode.offsetTop);
    };

    // Main class for smooth page scrolling
    class PageScroller {
        constructor(initialConfig) {
            this.currentConfig = {};
            this.throttleTimer = null;
            this.fixedElement = null;
            this.fixedElementHeight = 0;
            this.animationFrameId = null;
            this.animationStartTime = 0;

            this._boundClickHandler = this._processClickEvent.bind(this);
            this._boundResizeHandler = this._throttleResizeEvent.bind(this);

            if (featureSupported) {
                this.initialize(initialConfig);
            }
        }

        /**
         * Initializes the scroller.
         * @public
         * @param {Object} userConfiguration
         */
        initialize(userConfiguration) {
            this.dispose();

            this.currentConfig = combineOptions(baseConfiguration, userConfiguration || {});
            this.fixedElement = document.querySelector('[data-scroll-header]');
            this.fixedElementHeight = calculateFixedElementHeight(this.fixedElement);

            document.addEventListener('click', this._boundClickHandler, false);
            if (this.fixedElement) {
                windowRef.addEventListener('resize', this._boundResizeHandler, false);
            }
        }

        /**
         * Cleans up scroller.
         * @public
         */
        dispose() {
            if (!this.currentConfig) return;

            document.removeEventListener('click', this._boundClickHandler, false);
            windowRef.removeEventListener('resize', this._boundResizeHandler, false);

            this.currentConfig = null;
            this.throttleTimer = null;
            this.fixedElement = null;
            this.fixedElementHeight = 0;
            if (this.animationFrameId) {
                windowRef.cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.animationStartTime = 0;
        }

        /**
         * Initiates the smooth scroll animation.
         * @public
         * @param {Element} triggerSource The element that caused the scroll
         * @param {String} destinationHash The hash string (e.g., '#section')
         * @param {Object} customOptions Optional settings specific to this scroll action
         */
        initiateScrollSequence(triggerSource, destinationHash, customOptions) {
            const effectiveConfig = combineOptions(this.currentConfig, customOptions || {});
            const inlineOverrides = extractDataAttributes(triggerSource ? triggerSource.getAttribute('data-options') : null);
            const finalConfig = combineOptions(effectiveConfig, inlineOverrides);

            const cleanHash = '#' + formatCssIdentifier(destinationHash.substring(1));
            const targetNode = (cleanHash === '#') ? document.documentElement : document.querySelector(cleanHash);

            if (!targetNode) {
                return;
            }

            const initialScrollY = windowRef.pageYOffset;
            const finalScrollY = determineFinalScrollPosition(targetNode, this.fixedElementHeight, parseInt(finalConfig.verticalOffset, 10));
            const scrollDistance = finalScrollY - initialScrollY;
            const fullDocumentHeight = retrieveTotalDocumentHeight();

            modifyUrlHash(cleanHash, finalConfig.updateHistory);

            if (windowRef.pageYOffset === 0) {
                windowRef.scrollTo(0, 0);
            }

            finalConfig.beforeScrollHook(triggerSource, destinationHash);

            this.animationStartTime = performance.now();

            const animateStep = (currentTime) => {
                const elapsedTime = currentTime - this.animationStartTime;
                let progressRatio = elapsedTime / parseInt(finalConfig.scrollDuration, 10);
                progressRatio = (progressRatio > 1) ? 1 : progressRatio;

                const currentYPosition = initialScrollY + (scrollDistance * calculateEasing(finalConfig.curveType, progressRatio));
                windowRef.scrollTo(0, Math.floor(currentYPosition));

                const currentWindowScroll = windowRef.pageYOffset;
                const atTarget = Math.abs(currentWindowScroll - finalScrollY) < 1 || progressRatio === 1;
                const atDocumentEnd = (windowRef.innerHeight + currentWindowScroll) >= fullDocumentHeight;

                if (atTarget || atDocumentEnd) {
                    targetNode.focus();
                    finalConfig.afterScrollHook(triggerSource, destinationHash);
                    this.animationFrameId = null;
                } else {
                    this.animationFrameId = windowRef.requestAnimationFrame(animateStep);
                }
            };

            if (this.animationFrameId) {
                windowRef.cancelAnimationFrame(this.animationFrameId);
            }
            this.animationFrameId = windowRef.requestAnimationFrame(animateStep);
        }

        /**
         * Handles click events on data-scroll elements.
         * @private
         * @param {Event} evt
         */
        _processClickEvent(evt) {
            const clickTarget = locateAncestor(evt.target, '[data-scroll]');
            if (clickTarget && clickTarget.tagName.toLowerCase() === 'a') {
                evt.preventDefault();
                this.initiateScrollSequence(clickTarget, clickTarget.hash, this.currentConfig);
            }
        }

        /**
         * Throttles resize events for performance.
         * @private
         */
        _throttleResizeEvent() {
            if (!this.throttleTimer) {
                this.throttleTimer = setTimeout(() => {
                    this.throttleTimer = null;
                    this.fixedElementHeight = calculateFixedElementHeight(this.fixedElement);
                }, 66);
            }
        }
    }

    windowRef.PageScroller = PageScroller;

})(this);