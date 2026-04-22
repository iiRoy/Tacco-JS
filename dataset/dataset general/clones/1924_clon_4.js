(function() {
    "use strict";

    HTMLElement.prototype.createVisualNavigator = function(userOptions) {
        const defaultParameters = {
            heightFactor: 0.6,
            widthFactor: 0.05,
            verticalMarginFactor: 0.035,
            horizontalMarginFactor: 0.035,
            placement: "right",
            enableTouch: true,
            animateScroll: true,
            animationDuration: 200,
            onDisplayChange: function() {}
        };

        let currentConfiguration = Object.assign({}, defaultParameters, userOptions);
        const validPlacementOptions = ["right", "left"];

        let contentElement = this;
        let displayPanel = null;
        let viewIndicator = null;
        let isPanelVisible = true;
        let isPointerDepressed = false;
        let isScrollMotionActive = false;
        let motionIntervalHandle = null;

        const emptyFunction = function() {};

        const inspectProperty = function(propertyKey, propertyValue) {
            const propertyValidators = {
                'heightFactor': (val) => {
                    if (typeof val !== 'number' || val <= 0.0 || val > 1.0)
                        throw new Error("Invalid heightFactor: " + val);
                },
                'widthFactor': (val) => {
                    if (typeof val !== 'number' || val <= 0.0 || val > 0.5)
                        throw new Error("Invalid widthFactor: " + val);
                },
                'verticalMarginFactor': (val) => {
                    if (typeof val !== 'number' || val < 0.0 || val > 0.9)
                        throw new Error("Invalid verticalMarginFactor: " + val);
                },
                'horizontalMarginFactor': (val) => {
                    if (typeof val !== 'number' || val < 0.0 || val > 0.9)
                        throw new Error("Invalid horizontalMarginFactor: " + val);
                },
                'placement': (val) => {
                    const normalizedValue = String(val).toLowerCase();
                    if (!validPlacementOptions.includes(normalizedValue))
                        throw new Error("Invalid placement: " + val);
                    currentConfiguration.placement = normalizedValue;
                },
                'animationDuration': (val) => {
                    if (typeof val !== 'number' || !Number.isInteger(val) || val < 4)
                        throw new Error("Invalid animationDuration (in ms): " + val);
                },
                'enableTouch': emptyFunction,
                'animateScroll': emptyFunction,
                'onDisplayChange': (val) => {
                    if (typeof val !== 'function')
                        throw new Error("Invalid onDisplayChange: " + val);
                }
            };

            const validator = propertyValidators[propertyKey];
            if (!validator) {
                throw new Error("Unknown configuration property: " + propertyKey);
            }
            validator(propertyValue);
        };

        for (const key in currentConfiguration) {
            inspectProperty(key, currentConfiguration[key]);
        }

        displayPanel = contentElement.cloneNode(true);
        displayPanel.querySelectorAll('.visual-navigator-panel, .visual-navigator-indicator').forEach(el => el.remove());
        displayPanel.classList.add('visual-navigator-panel', 'no-select-text');
        displayPanel.querySelectorAll('*').forEach(child => {
            child.style.pointerEvents = 'none';
        });

        viewIndicator = document.createElement('div');
        viewIndicator.classList.add('visual-navigator-indicator');

        document.body.appendChild(viewIndicator);
        document.body.appendChild(displayPanel);

        const computeDimensionFactors = function() {
            const currentWindowWidth = window.innerWidth;
            const currentWindowHeight = window.innerHeight;
            const originalContentWidth = contentElement.offsetWidth;
            const originalContentHeight = contentElement.offsetHeight;

            return {
                horizontal: (currentWindowWidth / originalContentWidth) * currentConfiguration.widthFactor,
                vertical: (currentWindowHeight / originalContentHeight) * currentConfiguration.heightFactor
            };
        };

        const refreshDisplayLayout = function() {
            if (!isPanelVisible) return;

            const factors = computeDimensionFactors();
            const scaleTransformation = `scale(${factors.horizontal}, ${factors.vertical})`;
            const topBoundaryOffsetPx = window.innerHeight * currentConfiguration.verticalMarginFactor;
            const sideBoundaryOffsetPx = window.innerWidth * currentConfiguration.horizontalMarginFactor;

            const panelTopPosition = contentElement.offsetHeight * (factors.vertical - 1) / 2 + topBoundaryOffsetPx;
            const panelSidePosition = contentElement.offsetWidth * (factors.horizontal - 1) / 2 + sideBoundaryOffsetPx;

            const panelWidth = window.innerWidth * (1 / factors.horizontal) * currentConfiguration.widthFactor;
            const panelHeight = window.innerHeight * (1 / factors.vertical) * currentConfiguration.heightFactor;

            const panelStyling = {
                '-webkit-transform': scaleTransformation,
                '-moz-transform': scaleTransformation,
                '-ms-transform': scaleTransformation,
                '-o-transform': scaleTransformation,
                'transform': scaleTransformation,
                'transform-origin': '0 0',
                'position': 'fixed',
                'top': `${panelTopPosition}px`,
                'width': `${panelWidth}px`,
                'height': `${panelHeight}px`,
                'margin': '0px',
                'padding': '0px',
                'box-sizing': 'border-box',
                'overflow': 'hidden',
                'z-index': '9999'
            };
            panelStyling[currentConfiguration.placement] = `${panelSidePosition}px`;

            for (const key in panelStyling) {
                displayPanel.style[key] = panelStyling[key];
            }

            const indicatorWidth = displayPanel.offsetWidth * factors.horizontal;
            const indicatorHeight = window.innerHeight * factors.vertical;

            const scaledContentElementOffsetTop = contentElement.offsetTop * factors.vertical;
            const indicatorCalculatedTop = window.scrollY * factors.vertical + topBoundaryOffsetPx - scaledContentElementOffsetTop;

            const indicatorStyling = {
                'width': `${indicatorWidth}px`,
                'height': `${indicatorHeight}px`,
                'margin': '0px',
                'top': `${indicatorCalculatedTop}px`,
                'position': 'fixed',
                'box-sizing': 'border-box',
                'z-index': '10000'
            };
            indicatorStyling[currentConfiguration.placement] = `${sideBoundaryOffsetPx}px`;

            for (const key in indicatorStyling) {
                viewIndicator.style[key] = indicatorStyling[key];
            }

            currentConfiguration.onDisplayChange(displayPanel, factors);
        };

        const updateIndicatorLocation = function() {
            if (!isPanelVisible) return;

            const factors = computeDimensionFactors();
            const topBoundaryOffsetPx = window.innerHeight * currentConfiguration.verticalMarginFactor;

            const scaledOriginalElementTop = contentElement.offsetTop * factors.vertical;
            const scaledWindowScroll = window.scrollY * factors.vertical;
            const indicatorVisualHeight = viewIndicator.offsetHeight;
            const scaledOriginalElementBottom = (contentElement.offsetHeight * factors.vertical) + scaledOriginalElementTop;

            const indicatorCurrentTopRelativeToWindow = scaledWindowScroll + topBoundaryOffsetPx - scaledOriginalElementTop;

            if ((scaledWindowScroll + indicatorVisualHeight + topBoundaryOffsetPx) < scaledOriginalElementTop || scaledWindowScroll > scaledOriginalElementBottom) {
                viewIndicator.style.display = 'none';
            } else {
                viewIndicator.style.top = `${indicatorCurrentTopRelativeToWindow}px`;
                viewIndicator.style.display = 'block';
            }
        };

        const navigateContentToTarget = function(eventObject) {
            if (!isPanelVisible) return;

            const factors = computeDimensionFactors();
            const topBoundaryOffsetPx = window.innerHeight * currentConfiguration.verticalMarginFactor;
            const scaledOriginalElementOffsetTop = contentElement.offsetTop * factors.vertical;

            const pointerClientY = eventObject.clientY;
            let desiredScrollY = (pointerClientY - topBoundaryOffsetPx + scaledOriginalElementOffsetTop) / factors.vertical;

            const maximumScrollable = contentElement.scrollHeight - window.innerHeight;
            desiredScrollY = Math.max(0, Math.min(desiredScrollY, maximumScrollable));

            if (eventObject.type === 'click' && currentConfiguration.animateScroll) {
                if (isScrollMotionActive) {
                    clearInterval(motionIntervalHandle);
                    isScrollMotionActive = false;
                }

                const currentScrollPosition = window.scrollY;
                const totalScrollDistance = Math.abs(currentScrollPosition - desiredScrollY);
                const scrollDirection = desiredScrollY > currentScrollPosition ? 1 : -1;
                const totalMotionDuration = currentConfiguration.animationDuration;

                const distanceRatio = totalMotionDuration / totalScrollDistance;
                let stepSize = 1;
                let stepInterval = 4;

                if (distanceRatio >= 4) {
                    stepInterval = 1;
                } else if (distanceRatio >= 1) {
                    stepSize = parseInt(distanceRatio) * 4;
                } else {
                    stepSize = (4 / distanceRatio);
                }

                let currentMotionPosition = currentScrollPosition;
                isScrollMotionActive = true;

                motionIntervalHandle = setInterval(() => {
                    const remainingMotionDistance = Math.abs(currentMotionPosition - desiredScrollY);
                    if (remainingMotionDistance <= stepSize) {
                        window.scrollTo(0, desiredScrollY);
                        clearInterval(motionIntervalHandle);
                        isScrollMotionActive = false;
                        return;
                    }

                    currentMotionPosition += stepSize * scrollDirection;
                    window.scrollTo(0, currentMotionPosition);

                    if ((scrollDirection === 1 && currentMotionPosition >= desiredScrollY) ||
                        (scrollDirection === -1 && currentMotionPosition <= desiredScrollY)) {
                        window.scrollTo(0, desiredScrollY);
                        clearInterval(motionIntervalHandle);
                        isScrollMotionActive = false;
                    }
                }, stepInterval);

            } else {
                window.scrollTo(0, desiredScrollY);
            }
            eventObject.stopPropagation();
        };

        const handlePointerDepression = function(eventObject) {
            isPointerDepressed = true;
        };

        const handlePointerRelease = function(eventObject) {
            isPointerDepressed = false;
        };

        const handlePointerMovement = function(eventObject) {
            if (!isPointerDepressed || isScrollMotionActive) return;
            navigateContentToTarget(eventObject);
        };

        const handlePointerActivation = function(eventObject) {
            navigateContentToTarget(eventObject);
            isPointerDepressed = false;
        };

        let previousInteractionKind = '';
        const processInputFromTouch = function(eventObject) {
            const touchInputs = eventObject.changedTouches;

            if (touchInputs.length > 1) return;

            const singleTouchInput = touchInputs[0];
            const eventTypeMapping = {
                "touchstart": "mousedown",
                "touchmove": "mousemove",
                "touchend": "mouseup",
            };

            const mouseInputType = eventTypeMapping[eventObject.type];
            if (!mouseInputType) return;

            let finalMouseInputType = mouseInputType;
            if (eventObject.type === "touchend" && previousInteractionKind === "touchstart") {
                finalMouseInputType = "click";
            }

            const simulatedMouseInput = new MouseEvent(finalMouseInputType, {
                bubbles: true,
                cancelable: true,
                view: window,
                detail: 1,
                screenX: singleTouchInput.screenX,
                screenY: singleTouchInput.screenY,
                clientX: singleTouchInput.clientX,
                clientY: singleTouchInput.clientY,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: null
            });

            singleTouchInput.target.dispatchEvent(simulatedMouseInput);
            eventObject.preventDefault();
            previousInteractionKind = eventObject.type;
        };

        refreshDisplayLayout();

        window.addEventListener('resize', refreshDisplayLayout);
        window.addEventListener('scroll', updateIndicatorLocation);

        [viewIndicator, displayPanel].forEach(element => {
            element.addEventListener('mousedown', handlePointerDepression);
            element.addEventListener('mouseup', handlePointerRelease);
            element.addEventListener('mousemove', handlePointerMovement);
            element.addEventListener('click', handlePointerActivation);
        });

        if (currentConfiguration.enableTouch) {
            document.addEventListener("touchstart", processInputFromTouch, { passive: false });
            document.addEventListener("touchmove", processInputFromTouch, { passive: false });
            document.addEventListener("touchend", processInputFromTouch, { passive: false });
            document.addEventListener("touchcancel", processInputFromTouch, { passive: false });
        }

        const setPanelPlacement = function(newPlacement) {
            const oldPlacement = currentConfiguration.placement;
            inspectProperty('placement', newPlacement);
            if (oldPlacement !== currentConfiguration.placement) {
                displayPanel.style[oldPlacement] = '';
                viewIndicator.style[oldPlacement] = '';
                refreshDisplayLayout();
            }
        };

        const modifyConfigurationValue = function(keyName, shouldRedraw) {
            return function(newValue) {
                inspectProperty(keyName, newValue);
                currentConfiguration[keyName] = newValue;
                if (shouldRedraw) refreshDisplayLayout();
            };
        };

        const revealPanel = function() {
            if (isPanelVisible) return;
            displayPanel.style.display = '';
            viewIndicator.style.display = '';
            isPanelVisible = true;
            refreshDisplayLayout();
        };

        const concealPanel = function() {
            if (!isPanelVisible) return;
            displayPanel.style.display = 'none';
            viewIndicator.style.display = 'none';
            isPanelVisible = false;
        };

        const togglePanelVisibility = function() {
            if (isPanelVisible) {
                concealPanel();
            } else {
                revealPanel();
            }
        };

        return {
            "setPanelPlacement": setPanelPlacement,
            "setMapRatioHeight": modifyConfigurationValue('heightFactor', true),
            "setMapRatioWidth": modifyConfigurationValue('widthFactor', true),
            "setMapVerticalMargin": modifyConfigurationValue('verticalMarginFactor', true),
            "setMapHorizontalMargin": modifyConfigurationValue('horizontalMarginFactor', true),
            "setScrollAnimation": modifyConfigurationValue('animateScroll', false),
            "setAnimationDelay": modifyConfigurationValue('animationDuration', false),
            "revealPanel": revealPanel,
            "concealPanel": concealPanel,
            "togglePanelVisibility": togglePanelVisibility
        };
    };
}());