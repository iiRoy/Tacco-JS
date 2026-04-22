(function () {
    let activeGaze = null; 

    const defaultConfigurations = {
        opacityValue: 0.5,
        animationDuration: 400,
        fillColor: '#333',
        useAnimation: true,
        animationTiming: 'ease-out',
        dismissEvent: 'click',
        onDisplayCallback: () => {},
        onConcealCallback: () => {},
        gazeLayerIndex: 9999,
        gazeElementClass: 'visual-gaze',
        containerSelector: 'html',
        horizontalPaddingAmount: 0,
        verticalPaddingAmount: 0
    };

    function combineSettings(base, custom) {
        const result = {};
        for (const key in base) {
            result[key] = custom.hasOwnProperty(key) ? custom[key] : base[key];
        }
        return result;
    }

    function generateSVGElement(tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    function applySVGAttributes(element, attrs) {
        for (const key in attrs) {
            element.setAttribute(key, attrs[key]);
        }
    }

    function fetchElementBounds(element) {
        const rect = element.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    function executeTransition(element, startValue, endValue, duration, completionHandler) {
        if (!duration || duration <= 0) {
            element.style.opacity = endValue;
            if (completionHandler) completionHandler();
            return;
        }

        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = startValue + (endValue - startValue) * progress;
            element.style.opacity = currentValue;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (completionHandler) completionHandler();
            }
        };
        requestAnimationFrame(step);
    }

    let currentResizeObserver = null;

    function banishGaze() {
        if (!activeGaze) {
            return;
        }

        const currentConfigs = activeGaze._luminaConfigurations;

        if (currentResizeObserver) {
            window.removeEventListener('resize', currentResizeObserver);
            currentResizeObserver = null;
        }

        if (activeGaze._dismissEventHandler) {
            document.removeEventListener(currentConfigs.dismissEvent, activeGaze._dismissEventHandler);
            activeGaze._dismissEventHandler = null;
        }

        if (currentConfigs.useAnimation) {
            executeTransition(activeGaze, parseFloat(activeGaze.style.opacity || currentConfigs.opacityValue), 0, currentConfigs.animationDuration, () => {
                activeGaze.remove();
                activeGaze = null;
                currentConfigs.onConcealCallback.call(null);
            });
        } else {
            activeGaze.remove();
            activeGaze = null;
            currentConfigs.onConcealCallback.call(null);
        }
    }

    function refreshGazePresentation(focusElements, configurations, visualGazeElement) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        visualGazeElement.style.width = `${viewportWidth}px`;
        visualGazeElement.style.height = `${viewportHeight}px`;
        applySVGAttributes(visualGazeElement, {
            width: viewportWidth,
            height: viewportHeight
        });

        const maskElement = visualGazeElement.querySelector('mask');
        if (!maskElement) {
            console.error("SVG mask element not found in active gaze.");
            return;
        }
        maskElement.innerHTML = '';

        const baseMaskRect = generateSVGElement('rect');
        applySVGAttributes(baseMaskRect, {
            x: 0, y: 0,
            width: viewportWidth,
            height: viewportHeight,
            fill: 'white'
        });
        maskElement.appendChild(baseMaskRect);

        focusElements.forEach(element => {
            const elBounds = fetchElementBounds(element);
            const holeMaskRect = generateSVGElement('rect');
            applySVGAttributes(holeMaskRect, {
                x: elBounds.left - configurations.horizontalPaddingAmount,
                y: elBounds.top - configurations.verticalPaddingAmount,
                width: elBounds.width + (configurations.horizontalPaddingAmount * 2),
                height: elBounds.height + (configurations.verticalPaddingAmount * 2),
                fill: 'black'
            });
            maskElement.appendChild(holeMaskRect);
        });
    }

    function projectLumina(targetQueryOrElements, customOptions) {
        let focalPoints = [];
        if (typeof targetQueryOrElements === 'string') {
            focalPoints = Array.from(document.querySelectorAll(targetQueryOrElements));
        } else if (Array.isArray(targetQueryOrElements)) {
            focalPoints = targetQueryOrElements;
        } else if (targetQueryOrElements instanceof HTMLElement) {
            focalPoints = [targetQueryOrElements];
        } else {
            console.warn("No valid elements provided for projectLumina.", targetQueryOrElements);
            return { close: banishGaze, conceal: banishGaze };
        }

        if (typeof customOptions === 'string') {
            const requestedAction = customOptions;
            if (requestedAction === 'close' || requestedAction === 'conceal') {
                banishGaze();
            }
            return { close: banishGaze, conceal: banishGaze };
        }

        const configurations = combineSettings(defaultConfigurations, customOptions || {});

        banishGaze();

        const containerElement = document.querySelector(configurations.containerSelector);
        if (!containerElement) {
            console.error("Specified container for lumina not found:", configurations.containerSelector);
            return { close: banishGaze, conceal: banishGaze };
        }

        const visualGazeElement = generateSVGElement('svg');
        applySVGAttributes(visualGazeElement, {
            class: configurations.gazeElementClass,
            style: `
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: auto;
                opacity: 0;
                z-index: ${configurations.gazeLayerIndex};
            `
        });

        const definitionsElement = generateSVGElement('defs');
        const maskDefinition = generateSVGElement('mask');
        applySVGAttributes(maskDefinition, { id: 'luminaMaskID' });
        definitionsElement.appendChild(maskDefinition);
        visualGazeElement.appendChild(definitionsElement);

        const mainGazeRect = generateSVGElement('rect');
        applySVGAttributes(mainGazeRect, {
            x: 0, y: 0,
            width: '100%',
            height: '100%',
            fill: configurations.fillColor,
            mask: 'url(#luminaMaskID)'
        });
        visualGazeElement.appendChild(mainGazeRect);

        containerElement.appendChild(visualGazeElement);
        activeGaze = visualGazeElement;
        activeGaze._luminaConfigurations = configurations;

        refreshGazePresentation(focalPoints, configurations, visualGazeElement);

        currentResizeObserver = () => refreshGazePresentation(focalPoints, configurations, visualGazeElement);
        window.addEventListener('resize', currentResizeObserver);

        const dismissEventListener = (event) => {
            if (event.target === visualGazeElement || event.target === mainGazeRect) {
                 banishGaze();
            }
        };
        activeGaze._dismissEventHandler = dismissEventListener;
        document.addEventListener(configurations.dismissEvent, dismissEventListener);

        if (configurations.useAnimation) {
            executeTransition(visualGazeElement, 0, configurations.opacityValue, configurations.animationDuration, () => {
                configurations.onDisplayCallback.call(focalPoints);
            });
        } else {
            visualGazeElement.style.opacity = configurations.opacityValue;
            configurations.onDisplayCallback.call(focalPoints);
        }

        return {
            close: banishGaze,
            conceal: banishGaze
        };
    }

    window.projectLumina = projectLumina;

})();