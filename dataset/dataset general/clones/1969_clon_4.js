const domOperations = {
    fetch: (selector, context = document) => context.querySelector(selector),
    fetchAll: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
    create: (tagName) => document.createElement(tagName),
    applyStyles: (element, styles) => Object.assign(element.style, styles),
    addClass: (element, className) => element.classList.add(className),
    removeClass: (element, className) => element.classList.remove(className),
    append: (parent, child) => parent.appendChild(child),
    remove: (element) => element.parentNode && element.parentNode.removeChild(element),
    on: (element, event, handler) => element.addEventListener(event, handler),
    off: (element, event, handler) => element.removeEventListener(event, handler),
    getData: (element, key) => element.dataset[key],
    setData: (element, key, value) => element.dataset[key] = value,
    getOffset: (element) => {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    },
    getWidth: (element) => element.offsetWidth,
    getHeight: (element) => element.offsetHeight,
    isTag: (element, tagName) => element.tagName.toLowerCase() === tagName.toLowerCase(),
    isComplete: (imgElement) => imgElement.complete,
    simulateLoad: (imgElement) => {
        if (domOperations.isComplete(imgElement)) {
            imgElement.dispatchEvent(new Event('load'));
        }
    }
};

const createBoundaries = (t, r, b, l) => ({
    topEdge: t,
    rightEdge: r,
    bottomEdge: b,
    leftEdge: l,
    encompasses: (pointX, pointY) => (l < pointX && pointX < r) && (t < pointY && pointY < b)
});

const baseConfiguration = {
    displayClass: 'magnifier-viewport',
    viewSize: 200,
    visualEffect: null,
    sourceImage: null,
    pointerStyle: 'none',
    areaLimits: [],
    cssRules: {
        borderRadius: '200px',
        width: '200px',
        height: '200px',
        border: '2px solid white',
        backgroundColor: 'white',
        boxShadow: '0 0 10px #777, 0 0 8px black inset, 0 0 80px white inset'
    },
    onMagnifyActivate: (viewer) => {},
    onMagnifyDeactivate: (viewer) => {},
    onMagnifyMove: (viewer) => {}
};

const enforcedStyles = {
    cssRules: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundRepeat: 'no-repeat'
    }
};

const createMagnifier = (originatingElement, userOptions = {}) => {
    let activeElement = originatingElement;
    let mainViewer;
    let horizontalRatio = 1;
    let verticalRatio = 1;
    let sourceImagePreloader;
    let elementBoundary;
    let elementPosition;
    let activeConfiguration;
    let documentBody = document.body;

    const assembleConfiguration = (options) => {
        let imageElementForZoom;
        let determinedSourceImage;

        if (domOperations.isTag(activeElement, 'a')) {
            imageElementForZoom = domOperations.fetch('img:first-of-type', activeElement);
            determinedSourceImage = options.sourceImage || activeElement.href;
        } else {
            imageElementForZoom = domOperations.isTag(activeElement, 'img') ? activeElement : domOperations.fetch('img:first-of-type', activeElement);
            determinedSourceImage = options.sourceImage || domOperations.getData(activeElement, 'zoom') || activeElement.src;
        }

        activeElement = imageElementForZoom;
        
        const mergedBase = Object.assign({}, baseConfiguration, options);
        mergedBase.cssRules = Object.assign({}, baseConfiguration.cssRules, options && options.cssRules);
        
        mergedBase.cssRules.backgroundImage = `url(${determinedSourceImage})`;
        mergedBase.cssRules.cursor = options.pointerStyle || baseConfiguration.pointerStyle;
        
        if (mergedBase.viewSize) {
            mergedBase.cssRules.width = `${mergedBase.viewSize}px`;
            mergedBase.cssRules.height = `${mergedBase.viewSize}px`;
            if (baseConfiguration.cssRules.borderRadius === '200px' && (!options.cssRules || !options.cssRules.borderRadius)) {
                mergedBase.cssRules.borderRadius = `${mergedBase.viewSize}px`;
            }
        }
        
        activeConfiguration = Object.assign({}, mergedBase);
        activeConfiguration.cssRules = Object.assign({}, mergedBase.cssRules, enforcedStyles.cssRules);
    };

    const calculateElementRegion = () => {
        elementPosition = domOperations.getOffset(activeElement);
        elementBoundary = createBoundaries(
            elementPosition.top,
            elementPosition.left + domOperations.getWidth(activeElement),
            elementPosition.top + domOperations.getHeight(activeElement),
            elementPosition.left
        );
    };

    const determineScalingFactors = () => {
        horizontalRatio = sourceImagePreloader.naturalWidth / domOperations.getWidth(activeElement);
        verticalRatio = sourceImagePreloader.naturalHeight / domOperations.getHeight(activeElement);
        domOperations.remove(sourceImagePreloader);
        domOperations.applyStyles(mainViewer, activeConfiguration.cssRules);
        performInitialSetup();
    };

    const handlePointerMovement = (event) => {
        if (!elementBoundary || mainViewer.style.animationName !== '') {
            return;
        }

        if (elementBoundary && !elementBoundary.encompasses(event.pageX, event.pageY)) {
            concealViewer();
            return;
        }

        const backgroundPositionX = -((event.pageX - elementPosition.left) * horizontalRatio - activeConfiguration.viewSize * 0.5);
        const backgroundPositionY = -((event.pageY - elementPosition.top) * verticalRatio - activeConfiguration.viewSize * 0.5);

        domOperations.applyStyles(mainViewer, {
            left: `${event.pageX - activeConfiguration.viewSize * 0.5}px`,
            top: `${event.pageY - activeConfiguration.viewSize * 0.5}px`,
            backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`
        });
        activeConfiguration.onMagnifyMove(mainViewer);
    };

    const displayViewer = (useAnimation = true) => {
        calculateElementRegion();
        domOperations.off(activeElement, 'mousemove', handlePointerMovement);
        domOperations.off(activeElement, 'mouseover', initialHoverTrigger);
        domOperations.on(documentBody, 'mousemove', handlePointerMovement);
        
        domOperations.applyStyles(mainViewer, {
            opacity: '1',
            cursor: activeConfiguration.cssRules.cursor,
            display: 'block'
        });
        activeConfiguration.onMagnifyActivate(mainViewer);
    };

    const concealViewer = (useAnimation = true) => {
        domOperations.on(activeElement, 'mouseover', initialHoverTrigger);
        domOperations.off(documentBody, 'mousemove', handlePointerMovement);
        
        domOperations.applyStyles(mainViewer, {
            opacity: '0',
            cursor: 'default',
            display: 'none'
        });
        activeConfiguration.onMagnifyDeactivate(mainViewer);
    };

    const performInitialSetup = () => {
        concealViewer();
    };

    const initialHoverTrigger = (e) => {
        if (activeConfiguration.pointerStyle === 'none') {
            e.preventDefault();
        }
        displayViewer();
    };

    const initializeMagnifier = () => {
        assembleConfiguration(userOptions);

        mainViewer = domOperations.create('div');
        domOperations.addClass(mainViewer, activeConfiguration.displayClass);
        domOperations.applyStyles(mainViewer, { display: 'none' });
        domOperations.append(documentBody, mainViewer);

        domOperations.setData(activeElement, 'magnifierInstance', instanceAPI);

        sourceImagePreloader = new Image();
        const imageUrlMatch = activeConfiguration.cssRules.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (imageUrlMatch && imageUrlMatch[1]) {
            sourceImagePreloader.src = imageUrlMatch[1];
        } else {
            console.warn('Could not extract image URL from background-image CSS property.');
            return;
        }
        
        const handlePreloaderLoad = () => {
            domOperations.off(sourceImagePreloader, 'load', handlePreloaderLoad);
            determineScalingFactors();
        };
        domOperations.on(sourceImagePreloader, 'load', handlePreloaderLoad);
        domOperations.simulateLoad(sourceImagePreloader);

        const handleActiveElementLoad = () => {
            domOperations.off(activeElement, 'load', handleActiveElementLoad);
            calculateElementRegion();
        };
        domOperations.on(activeElement, 'load', handleActiveElementLoad);
        domOperations.simulateLoad(activeElement);

        domOperations.on(activeElement, 'mousemove', handlePointerMovement);
        domOperations.on(activeElement, 'mouseout', concealViewer);
        domOperations.on(activeElement, 'mouseover', initialHoverTrigger);
    };

    const instanceAPI = {
        activate: displayViewer,
        deactivate: concealViewer,
        destroy: () => {
            domOperations.off(activeElement, 'mousemove', handlePointerMovement);
            domOperations.off(activeElement, 'mouseout', concealViewer);
            domOperations.off(activeElement, 'mouseover', initialHoverTrigger);
            domOperations.off(documentBody, 'mousemove', handlePointerMovement);
            domOperations.remove(mainViewer);
            domOperations.setData(activeElement, 'magnifierInstance', null);
        }
    };

    initializeMagnifier();
    return originatingElement;
};

window.setupZoomEffect = (selectorOrElement, options) => {
    let targetElements;
    if (typeof selectorOrElement === 'string') {
        targetElements = domOperations.fetchAll(selectorOrElement);
    } else if (selectorOrElement instanceof HTMLElement) {
        targetElements = [selectorOrElement];
    } else if (Array.isArray(selectorOrElement)) {
        targetElements = selectorOrElement;
    } else {
        console.warn("Invalid input for setupZoomEffect. Please provide a selector string or an HTMLElement.");
        return [];
    }

    targetElements.forEach(element => {
        if (!domOperations.getData(element, 'magnifierInstance')) {
            createMagnifier(element, options);
        }
    });
    return targetElements;
};