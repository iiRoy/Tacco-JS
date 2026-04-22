let globalModuleRegistry = {
    ytScriptLoaded: false,
    ytApiReady: false
};

window.onYouTubeIframeAPIReady = () => {
    globalModuleRegistry.ytApiReady = true;
};

const createContentScroller = (initialSettings = {}) => {
    const operationalConfig = {
        resourcePath: '/',
        displayAreaSelector: '.scroller-root',
        displayWrapperSelector: '.scroller-wrapper',
        viewWindowSelector: '.scroller-viewport',
        contentMaskSelector: '.scroller-mask',
        contentContainerSelector: '.scroller-items',
        itemUnitSelector: '.scroller-item',
        mediaLoadTargets: ['unit-content', 'thumbnails'],
        loadMessageDelayMs: 30,
        unitSpacing: 0,
        movementIncrement: undefined,
        groupSize: 1,
        responsiveGroupSizes: {},
        enableTouchGestures: false,
        allowMouseSwipe: false,
        gesturesAndControls: false,
        gestureAnimationSpeedMs: 300,
        animationCurve: 'ease',
        animationDurationMs: 1000,
        cycleMode: 'none',
        gestureCycleMode: 'none',
        autoAdvance: false,
        autoAdvanceIntervalMs: 3000,
        autoAdvanceMinBreakMs: 10,
        autoAdvancePauseMs: false,
        autoAdvanceDelayStartMs: 0,
        pauseOnHover: true,
        continuousAdvance: false,
        continuousAdvanceSpeedMs: 10000,
        continuousPauseOnHover: true,
        showNextButton: true,
        showPrevButton: true,
        controlPlacement: 'inside',
        controlsClass: '.scroller-controls',
        nextControlClass: '.scroller-next',
        prevControlClass: '.scroller-prev',
        nextDisabledClass: '.scroller-next-disabled',
        prevDisabledClass: '.scroller-prev-disabled',
        extraNextClass: '',
        extraPrevClass: '',
        nextKeyBinding: 13,
        prevKeyBinding: 14,
        showIndicators: false,
        indicatorsPlacement: 'outside',
        indicatorsClickable: true,
        wrapperHasIndicatorsClass: '.scroller-has-indicators',
        indicatorsWrapperClass: '.scroller-indicators-wrapper',
        indicatorItemClass: '.scroller-indicator',
        currentIndicatorClass: '.scroller-indicator-current',
        showThumbnails: false,
        hideThumbsIfLessThan: 2,
        thumbnailsPlacement: 'outside',
        thumbnailTemplates: {},
        thumbnailsClickable: true,
        wrapperHasThumbnailsClass: '.scroller-has-thumbnails',
        thumbnailsWrapperClass: '.scroller-thumbnails-wrapper',
        thumbnailsViewportClass: '.scroller-thumbnails-viewport',
        thumbnailsMaskClass: '.scroller-thumbnails-mask',
        thumbnailItemsContainerClass: '.scroller-thumbnail-items',
        thumbnailItemClass: '.scroller-thumbnail-item',
        onThumbnailsReady: undefined,
        useSublimeVideo: false,
        autoLoadYoutubeApi: true,
        closeVideoAfterEnd: true,
        scrollToTopOnSlide: false,
        scrollToTopOffset: 0,
        scrollToTopSpeedMs: 500,
        autoLoadDependencies: true,
        onScrollerReady: undefined,
        detachComponents: undefined,
        initialFadeInSpeed: 'slow'
    };

    const runtimeStatus = {
        maxGroupSize: 1,
        currentGroupSize: 1,
        activeItemIndex: 0,
        activeItemPosition: 0,
        itemCount: 0,
        maskDimension: 0,
        itemDimension: 0,
        isTransitioning: false,
        isGestureActive: false,
        lastInteractionType: null,
        nextControlActive: false,
        prevControlActive: false,
        indicatorCount: 0,
        indicatorCountCache: 0,
        currentIndicator: 0,
        indicatorsChanged: false,
        movingLeft: false,
        movingRight: false,
        isResizingWindow: false,
        cssTransitionsEnabled: false,
        isEventTriggered: false,
        hasTouchSupport: false,
        activationEventType: 'click',
        isAppleDevice: false,
        windowResizeInProgress: false,
        visibleItemsStartIndex: false,
        visibleItemsEndIndex: false,
        visibleItemIndices: false,
        autoAdvanceTimer: null,
        autoAdvanceActive: false,
        videoPlayerCounter: 0,
        activeVideoPlayerIndex: 0,
        lastPlayedVideoId: null,
        videoPlaybackActive: false,
        actualCycleMode: 'none',
        loadedDependenciesCount: 0,
        totalDependenciesToLoad: 0,
        browserCapabilities: [],
        loadingTimeoutId: null,
        isContentLoading: false,
    };

    const domElements = {
        rootContainer: null,
        wrapperElement: null,
        viewportElement: null,
        contentContainer: null,
        itemElements: null,
        indicatorsWrapper: null,
        indicatorElements: null,
        prevControlElement: null,
        nextControlElement: null,
        videoPlayers: {},
        itemVideoPlayers: {},
        thumbnailsWrapper: null,
        thumbnailsViewport: null,
        thumbnailItemContainer: null,
        thumbnailItemElements: null,
        visibleItemElements: null,
    };

    const utilityFunctions = {
        mergeSettings: (user, defaults) => {
            return Object.assign({}, defaults, user);
        },
        waitForCondition: (conditionFn, intervalMs = 50) => {
            return new Promise(resolve => {
                const check = () => {
                    if (conditionFn()) {
                        resolve();
                    } else {
                        setTimeout(check, intervalMs);
                    }
                };
                check();
            });
        },
        loadScript: (url, globalKey = null) => {
            return new Promise((resolve, reject) => {
                if (globalKey && globalModuleRegistry[globalKey]) {
                    resolve();
                    return;
                }
                const scriptElement = document.createElement('script');
                scriptElement.src = url;
                scriptElement.async = true;
                scriptElement.onload = () => {
                    if (globalKey) globalModuleRegistry[globalKey] = true;
                    resolve();
                };
                scriptElement.onerror = (e) => reject(new Error(`Failed to load script: ${url}`));
                document.head.appendChild(scriptElement);
            });
        }
    };

    const commenceSetup = async () => {
        Object.assign(operationalConfig, utilityFunctions.mergeSettings(initialSettings, operationalConfig));

        if (typeof window.ContentScrollerGlobals !== 'undefined' && window.ContentScrollerGlobals.settings) {
            Object.assign(operationalConfig, window.ContentScrollerGlobals.settings);
        }

        if (operationalConfig.autoAdvancePauseMs) {
            operationalConfig.autoAdvanceIntervalMs = operationalConfig.animationDurationMs + operationalConfig.autoAdvancePauseMs;
        }
        if (operationalConfig.autoAdvanceIntervalMs <= operationalConfig.animationDurationMs) {
            operationalConfig.autoAdvanceIntervalMs = operationalConfig.animationDurationMs + operationalConfig.autoAdvanceMinBreakMs;
        }

        runtimeStatus.browserCapabilities = Array.from(document.documentElement.classList);

        if (runtimeStatus.browserCapabilities.includes('touch') || operationalConfig.allowMouseSwipe) {
            runtimeStatus.hasTouchSupport = true;
            runtimeStatus.activationEventType = 'touchend';
        }
        if (runtimeStatus.hasTouchSupport && operationalConfig.enableTouchGestures && !operationalConfig.gesturesAndControls) {
            operationalConfig.showNextButton = false;
            operationalConfig.showPrevButton = false;
        }

        runtimeStatus.actualCycleMode = operationalConfig.cycleMode;
        if (runtimeStatus.hasTouchSupport && operationalConfig.enableTouchGestures) {
            runtimeStatus.actualCycleMode = operationalConfig.gestureCycleMode;
        }

        if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            runtimeStatus.isAppleDevice = true;
        }

        domElements.rootContainer = document.querySelector(operationalConfig.displayAreaSelector);
        if (!domElements.rootContainer) {
            console.warn('ContentScroller: Root container not found. Initialization aborted.');
            return;
        }
        domElements.wrapperElement = domElements.rootContainer;
        domElements.viewportElement = domElements.rootContainer.querySelector(operationalConfig.viewWindowSelector);
        domElements.contentMask = domElements.rootContainer.querySelector(operationalConfig.contentMaskSelector);
        domElements.contentContainer = domElements.rootContainer.querySelector(operationalConfig.contentContainerSelector);
        domElements.itemElements = domElements.rootContainer.querySelectorAll(operationalConfig.itemUnitSelector);

        const htmlElement = document.documentElement;
        if (htmlElement.classList.contains('csstransitions') &&
            htmlElement.classList.contains('csstransforms3d') &&
            htmlElement.classList.contains('cssanimations') &&
            operationalConfig.groupSize > 0) {
            runtimeStatus.cssTransitionsEnabled = true;
        }

        await loadExternalModules();

        await beginOperationalWorkflow();
    };

    const loadExternalModules = async () => {
        const dependencyPromises = [];
        let initialLoadedCount = 0;

        if (typeof YT === 'undefined' && operationalConfig.autoLoadYoutubeApi && !globalModuleRegistry.ytScriptLoaded) {
            dependencyPromises.push(utilityFunctions.loadScript('https://www.youtube.com/iframe_api', 'ytScriptLoaded')
                .then(() => utilityFunctions.waitForCondition(() => globalModuleRegistry.ytApiReady, 100))
                .then(() => { runtimeStatus.loadedDependenciesCount++; })
                .catch(e => console.error("Failed to load YouTube API:", e)));
        } else {
            initialLoadedCount++;
        }

        if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.imagesLoaded === 'undefined') {
            dependencyPromises.push(utilityFunctions.loadScript(operationalConfig.resourcePath + 'dependencies/imagesloaded.js')
                .then(() => { runtimeStatus.loadedDependenciesCount++; })
                .catch(e => console.error("Failed to load imagesLoaded:", e)));
        } else {
            initialLoadedCount++;
        }

        const needsTouchSwipe = (runtimeStatus.browserCapabilities.includes('touch') || operationalConfig.allowMouseSwipe) && operationalConfig.enableTouchGestures;
        if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.swipe === 'undefined' && needsTouchSwipe) {
            dependencyPromises.push(utilityFunctions.loadScript(operationalConfig.resourcePath + 'dependencies/jquery.touchSwipe.js')
                .then(() => { runtimeStatus.loadedDependenciesCount++; })
                .catch(e => console.error("Failed to load TouchSwipe:", e)));
        } else {
            initialLoadedCount++;
        }

        runtimeStatus.totalDependenciesToLoad = dependencyPromises.length + initialLoadedCount;
        runtimeStatus.loadedDependenciesCount += initialLoadedCount;

        await Promise.all(dependencyPromises);
        await utilityFunctions.waitForCondition(() => runtimeStatus.loadedDependenciesCount >= runtimeStatus.totalDependenciesToLoad);
    };

    const beginOperationalWorkflow = async () => {
        if (domElements.wrapperElement) {
            domElements.wrapperElement.style.position = 'relative';
            domElements.wrapperElement.style.opacity = '0';
        }

        console.log('Scroller: Calculating dimensions...');
        // Placeholder for dimension calculations (e.g., set_slidermaskwidth, set_slidecount)

        console.log('Scroller: Cloning items...');
        // Placeholder for item cloning (e.g., clon_slides)

        console.log('Scroller: Setting up navigation...');
        // Placeholder for navigation setup (e.g., set_prevnext, keynav)

        console.log('Scroller: Initializing thumbnails...');
        // Placeholder for thumbnail setup (e.g., thumbs)

        console.log('Scroller: Initializing indicators...');
        // Placeholder for indicator setup (e.g., bullets)

        console.log('Scroller: Detaching components...');
        // Placeholder for component detachment (e.g., init_detach)

        console.log('Scroller: Setting up touch gestures...');
        // Placeholder for touch gesture setup (e.g., init_touchswipe)

        console.log('Scroller: Handling iOS resize bug...');
        // Placeholder for iOS bug workaround (e.g., init_iosresizeclickbug)

        console.log('Scroller: Showing content units...');
        // Placeholder for content unit visibility (e.g., init_showslides)

        console.log('Scroller: Initializing video players...');
        // Placeholder for video player setup (e.g., init_video)

        console.log('Scroller: Equalizing item heights...');
        // Placeholder for height equalization (e.g., slides_equal_height)

        console.log('Scroller: Revealing display area...');
        if (domElements.wrapperElement) {
            domElements.wrapperElement.style.transition = `opacity ${operationalConfig.initialFadeInSpeed === 'slow' ? '600ms' : '300ms'} ease-in`;
            domElements.wrapperElement.style.opacity = '1';
        }

        if (typeof operationalConfig.onScrollerReady === 'function') {
            console.log('Scroller: Invoking readiness callback...');
            const callbackPayload = {
                displayElements: domElements,
                currentSettings: operationalConfig,
            };
            operationalConfig.onScrollerReady(callbackPayload);
        }
        console.log('ContentScroller initialized.');
    };

    const publicInterface = {
        start: commenceSetup,
    };

    return publicInterface;
};