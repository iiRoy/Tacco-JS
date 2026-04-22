(function() {
    "use strict";

    // Utility function to fetch multiple DOM elements
    const gatherElements = (querySelector, contextNode = document) => Array.from(contextNode.querySelectorAll(querySelector));
    // Utility function to fetch a single DOM element
    const obtainElement = (querySelector, contextNode = document) => contextNode.querySelector(querySelector);

    // Dynamic style insertion utility
    const injectStyleRule = (ruleDefinition) => {
        let styleSheetContainer = obtainElement('style[data-custom-patch]');
        if (!styleSheetContainer) {
            styleSheetContainer = document.createElement('style');
            styleSheetContainer.setAttribute('data-custom-patch', '');
            document.head.appendChild(styleSheetContainer);
        }
        styleSheetContainer.sheet.insertRule(ruleDefinition, styleSheetContainer.sheet.cssRules.length);
    };

    // Part 1: Prevent specific elements from being hidden (Type IV: CSS-based override)
    // This rule ensures any element with the 'deeper' class, when attempted to be hidden by `display: none`,
    // will remain visible, effectively mimicking the original's MooTools hide override.
    injectStyleRule('.deeper[style*="display: none"] { display: block !important; visibility: visible !important; }');

    // Main initialization routine, equivalent to $(document).ready
    const initializeDOMFeatures = () => {

        // Part 2: Dropdown menu setup
        const candidateContainers = gatherElements('.parent');
        for (const container of candidateContainers) {
            const nestedList = obtainElement('ul', container);
            if (nestedList) {
                container.classList.add('dropdown-container'); // Divergent class name

                const linkNode = obtainElement('a', container);
                if (linkNode) {
                    linkNode.classList.add('toggle-trigger'); // Divergent class name
                    linkNode.setAttribute('data-action-trigger', 'dropdown-menu'); // Divergent attribute name
                    
                    const indicatorArrow = document.createElement('b');
                    indicatorArrow.classList.add('caret-icon'); // Divergent class name
                    linkNode.appendChild(indicatorArrow);
                }
                nestedList.classList.add('menu-panel'); // Divergent class name
            }
        }

        // Part 3: Prevent interaction within dropdown menus from closing them
        const interactiveControls = gatherElements('.menu-panel input, .menu-panel label');
        for (const control of interactiveControls) {
            control.addEventListener('click', (interactionEvent) => {
                interactionEvent.stopImmediatePropagation();
            }, false);
        }

        // Part 4: Custom tooltip implementation (Type IV: manual DOM/event handling)
        const tipElements = gatherElements('.tooltip');
        let activeTipDisplay = null;

        const showTip = (eventObject) => {
            const referenceElement = eventObject.currentTarget;
            const contentPayload = referenceElement.getAttribute('data-tip-content') || referenceElement.getAttribute('title');
            if (!contentPayload) return;

            if (activeTipDisplay) {
                activeTipDisplay.remove();
                activeTipDisplay = null;
            }

            const tipBox = document.createElement('div');
            tipBox.classList.add('display-tip-box'); // Divergent class name
            tipBox.innerHTML = contentPayload; // Simulates html: true
            document.body.appendChild(tipBox);
            activeTipDisplay = tipBox;

            // Basic positioning logic
            const elementRect = referenceElement.getBoundingClientRect();
            tipBox.style.position = 'absolute';
            tipBox.style.left = `${window.scrollX + elementRect.left + elementRect.width / 2}px`;
            tipBox.style.top = `${window.scrollY + elementRect.top - tipBox.offsetHeight - 8}px`;
            tipBox.style.zIndex = '10000';
            tipBox.style.pointerEvents = 'none';
            tipBox.style.transform = 'translateX(-50%)';
            // Basic styles for visibility (could be CSS classes)
            tipBox.style.backgroundColor = 'rgba(0,0,0,0.8)';
            tipBox.style.color = '#fff';
            tipBox.style.padding = '6px 12px';
            tipBox.style.borderRadius = '4px';
            tipBox.style.fontSize = '13px';
            tipBox.style.maxWidth = '250px';
        };

        const hideTip = () => {
            if (activeTipDisplay) {
                activeTipDisplay.remove();
                activeTipDisplay = null;
            }
        };

        for (const targetElement of tipElements) {
            targetElement.addEventListener('mouseenter', showTip, false);
            targetElement.addEventListener('mouseleave', hideTip, false);
            // Optionally remove original title to prevent native tooltips
            if (targetElement.hasAttribute('title')) {
                 targetElement.setAttribute('data-original-title-backup', targetElement.getAttribute('title'));
                 targetElement.removeAttribute('title');
            }
        }

        // Part 5: Scroll-to-Top functionality (Type IV: native events, custom animation)
        const verticalScrollThreshold = 220;
        const fadeAnimationDuration = 500;
        const returnToTopButton = obtainElement('.back-to-top');

        if (returnToTopButton) {
            // Set initial styles for fade effect
            returnToTopButton.style.transition = `opacity ${fadeAnimationDuration / 1000}s ease-in-out`;
            returnToTopButton.style.opacity = '0';
            returnToTopButton.style.display = 'none';

            const adjustButtonVisibility = () => {
                const currentYOffset = window.pageYOffset || document.documentElement.scrollTop;
                if (currentYOffset > verticalScrollThreshold) {
                    returnToTopButton.style.display = 'block';
                    // Force reflow to ensure display change is applied before opacity transition
                    void returnToTopButton.offsetWidth; 
                    returnToTopButton.style.opacity = '1';
                } else {
                    returnToTopButton.style.opacity = '0';
                    setTimeout(() => {
                        // Only set display to none if opacity is truly 0 after transition
                        if (parseFloat(returnToTopButton.style.opacity) === 0) {
                            returnToTopButton.style.display = 'none';
                        }
                    }, fadeAnimationDuration);
                }
            };

            window.addEventListener('scroll', adjustButtonVisibility, false);
            adjustButtonVisibility(); // Initial check on load

            returnToTopButton.addEventListener('click', (triggerEvent) => {
                triggerEvent.preventDefault();

                const initialScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                const animationStartTimestamp = performance.now();

                const performScrollAnimation = (currentTime) => {
                    const elapsedTime = currentTime - animationStartTimestamp;
                    const progressRatio = Math.min(elapsedTime / fadeAnimationDuration, 1);
                    // Cosine easing function for smooth acceleration/deceleration
                    const easedProgress = 0.5 - Math.cos(progressRatio * Math.PI) / 2;

                    window.scrollTo(0, initialScrollPosition * (1 - easedProgress));

                    if (progressRatio < 1) {
                        requestAnimationFrame(performScrollAnimation);
                    }
                };

                requestAnimationFrame(performScrollAnimation);
            }, false);
        }
    };

    // Execute initialization when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDOMFeatures);
    } else {
        initializeDOMFeatures(); // DOM already loaded
    }

})();