(function () {
    'use strict';

    let registeredQueries = new Set();
    let elementRatios = new WeakMap();
    let isResizeListenerActive = false;
    let resizeThrottle = null;

    const testElement = (targetElement, query) => {
        return targetElement.matches(query);
    };

    const adjustElementSize = (targetElement) => {
        const storedRatio = elementRatios.get(targetElement);
        if (storedRatio) {
            const currentWidth = parseFloat(window.getComputedStyle(targetElement).width);
            targetElement.style.height = (currentWidth / storedRatio) + 'px';
        }
    };

    const setupElementForAdaptation = (targetElement) => {
        if (!elementRatios.has(targetElement)) {
            const currentStyles = window.getComputedStyle(targetElement);
            const initialWidth = parseFloat(currentStyles.width);
            const initialHeight = parseFloat(currentStyles.height);
            const calculatedRatio = initialWidth / initialHeight;

            elementRatios.set(targetElement, calculatedRatio);
            targetElement.style.width = '100%';
            targetElement.removeAttribute('width');
            targetElement.removeAttribute('height');
            adjustElementSize(targetElement);
        }
    };

    const handleDomAdditions = (entries) => {
        for (const entry of entries) {
            if (entry.addedNodes.length > 0) {
                for (const node of entry.addedNodes) {
                    if (node.nodeType === 1) {
                        for (const query of registeredQueries) {
                            if (testElement(node, query)) {
                                setupElementForAdaptation(node);
                            }
                        }
                    }
                }
            }
        }
    };

    const domWatcher = new MutationObserver(handleDomAdditions);
    domWatcher.observe(document.documentElement, { childList: true, subtree: true });

    const processCurrentMatches = () => {
        registeredQueries.forEach(query => {
            Array.from(document.querySelectorAll(query)).forEach(targetElement => {
                if (!elementRatios.has(targetElement)) {
                    setupElementForAdaptation(targetElement);
                } else {
                    adjustElementSize(targetElement);
                }
            });
        });
    };

    const handleWindowResize = () => {
        clearTimeout(resizeThrottle);
        resizeThrottle = setTimeout(processCurrentMatches, 100);
    };

    const adaptMedia = (query) => {
        if (typeof query !== 'string' || !query.trim()) {
            console.warn("Invalid selector string provided to adaptMedia.");
            return;
        }

        registeredQueries.add(query);

        Array.from(document.querySelectorAll(query)).forEach(setupElementForAdaptation);

        if (!isResizeListenerActive) {
            window.addEventListener('resize', handleWindowResize);
            isResizeListenerActive = true;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processCurrentMatches);
    } else {
        processCurrentMatches();
    }

    window.adaptMedia = adaptMedia;

})();