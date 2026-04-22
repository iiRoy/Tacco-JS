const defaultScrollSettings = {
    leftControlClassName: "scrollingHotSpotLeft",
    rightControlClassName: "scrollingHotSpotRight",
    leftControlVisibleClassName: "scrollingHotSpotLeftVisible",
    rightControlVisibleClassName: "scrollingHotSpotRightVisible",
    contentAreaClassName: "scrollableArea",
    viewportWrapperClassName: "scrollWrapper",
    startHidden: false,
    contentOnLoad: {},
    itemCountClass: "",
    initialElementId: "",
    zoneScrollingActive: true,
    zoneScrollStep: 15,
    zoneScrollInterval: 10,
    zoneMouseDownBoost: 3,
    zoneBackgroundVisibility: "hover",
    zoneVisibleDuration: 5000,
    zoneEasingEnabled: true,
    zoneEasingDistance: 10,
    zoneEasingDuration: 300,
    zoneEasingFunction: "easeOutQuart",
    wheelScrollMode: "",
    wheelScrollStep: 70,
    wheelEasingEnabled: true,
    wheelEasingDuration: 300,
    wheelEasingFunction: "easeOutQuart",
    manualContinuousFlow: false,
    autoFlowMode: "",
    autoFlowDirection: "endlessLoopRight",
    autoFlowStep: 1,
    autoFlowInterval: 10,
    touchScrollActive: false,
    scrollToAnimationTime: 1000,
    scrollToEasingFunc: "easeOutQuart"
};

const easingFunctions = {
    easeOutQuart: function (t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    }
};

class EventDispatcher {
    constructor() {
        this.listeners = {};
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }

    off(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
        }
    }

    dispatch(eventName, detail = {}) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => callback(detail));
        }
    }
}

class ScrollComponent {
    constructor(hostElement, userSettings = {}) {
        this.hostElement = hostElement;
        this.settings = { ...defaultScrollSettings, ...userSettings };
        this.settings.contentOnLoad = { ...defaultScrollSettings.contentOnLoad, ...userSettings.contentOnLoad };

        this.dispatcher = new EventDispatcher();

        this.state = {
            speedMultiplier: 1,
            currentShiftAmount: 0,
            controlZoneWidth: 0,
            totalContentWidth: 0,
            initialOffset: 0,
            rightFlowHandle: null,
            leftFlowHandle: null,
            autoFlowHandle: null,
            hideControlsTimer: null,
            priorScrollPosition: 0,
            autoFlowDirection: "right",
            fetchNextElementSize: true,
            swapThreshold: null,
            initialElementNotPassed: true,
            relocatedElement: null,
            isVisible: true,
            isActive: true,
            contentAreaHeight: 0,
            containerOffset: { top: 0, left: 0 },
            animationFrameId: null,
            touchInstance: null,
        };

        this.setupDOM();
        this.setupEvents();
        this.loadInitialContent();
        this.setInitialVisibility();

        window.addEventListener('load', () => {
            if (!this.settings.startHidden) {
                this.measureContentLayout();
            }

            if (this.settings.autoFlowMode.length > 0 && !this.settings.startHidden) {
                this.initiateAutoFlow();
            }

            if (this.settings.autoFlowMode !== "always") {
                switch (this.settings.zoneBackgroundVisibility) {
                    case "always":
                        this.revealControlBackgrounds();
                        break;
                    case "onStart":
                        this.revealControlBackgrounds();
                        this.state.hideControlsTimer = setTimeout(() => {
                            this.concealControlBackgrounds(250);
                        }, this.settings.zoneVisibleDuration);
                        break;
                    case "hover":
                        this.hostElement.addEventListener('mouseenter', this.handleHostEnter.bind(this));
                        this.hostElement.addEventListener('mouseleave', this.handleHostLeave.bind(this));
                        break;
                    default:
                        break;
                }
            }

            this.evaluateControlVisibility();

            if (this.settings.initialElementId) {
                this.focusOnElement(this.settings.initialElementId, 0, 'linear');
            }

            this.dispatcher.dispatch('creationComplete');
        });
    }

    setupDOM() {
        let viewportElement = this.hostElement.querySelector(`.${this.settings.viewportWrapperClassName}`);
        let contentAreaElement = this.hostElement.querySelector(`.${this.settings.contentAreaClassName}`);
        let rightControlElement = this.hostElement.querySelector(`.${this.settings.rightControlClassName}`);
        let leftControlElement = this.hostElement.querySelector(`.${this.settings.leftControlClassName}`);

        if (rightControlElement) {
            rightControlElement.remove();
        }
        if (leftControlElement) {
            leftControlElement.remove();
        }

        if (!contentAreaElement && !viewportElement) {
            contentAreaElement = document.createElement('div');
            contentAreaElement.classList.add(this.settings.contentAreaClassName);
            while (this.hostElement.firstChild) {
                contentAreaElement.appendChild(this.hostElement.firstChild);
            }

            viewportElement = document.createElement('div');
            viewportElement.classList.add(this.settings.viewportWrapperClassName);
            viewportElement.appendChild(contentAreaElement);
            this.hostElement.appendChild(viewportElement);
        } else if (!viewportElement) {
            viewportElement = document.createElement('div');
            viewportElement.classList.add(this.settings.viewportWrapperClassName);
            while (this.hostElement.firstChild) {
                viewportElement.appendChild(this.hostElement.firstChild);
            }
            this.hostElement.appendChild(viewportElement);
            contentAreaElement = viewportElement.querySelector(`.${this.settings.contentAreaClassName}`);
            if (!contentAreaElement) {
                contentAreaElement = document.createElement('div');
                contentAreaElement.classList.add(this.settings.contentAreaClassName);
                while (viewportElement.firstChild) {
                    contentAreaElement.appendChild(viewportElement.firstChild);
                }
                viewportElement.appendChild(contentAreaElement);
            }
        } else if (!contentAreaElement) {
            contentAreaElement = document.createElement('div');
            contentAreaElement.classList.add(this.settings.contentAreaClassName);
            while (viewportElement.firstChild) {
                contentAreaElement.appendChild(viewportElement.firstChild);
            }
            viewportElement.appendChild(contentAreaElement);
        }

        this.viewportElement = viewportElement;
        this.contentAreaElement = contentAreaElement;

        if (!rightControlElement) {
            rightControlElement = document.createElement('div');
            rightControlElement.classList.add(this.settings.rightControlClassName);
        }
        this.hostElement.insertBefore(rightControlElement, this.hostElement.firstChild);
        this.rightControlElement = rightControlElement;

        if (!leftControlElement) {
            leftControlElement = document.createElement('div');
            leftControlElement.classList.add(this.settings.leftControlClassName);
        }
        this.hostElement.insertBefore(leftControlElement, this.hostElement.firstChild);
        this.leftControlElement = leftControlElement;

        this.state.controlZoneWidth = this.leftControlElement.offsetWidth;
        this.state.containerOffset = this.hostElement.getBoundingClientRect();
        this.state.contentAreaHeight = this.contentAreaElement.offsetHeight;
    }

    setupEvents() {
        if (this.settings.touchScrollActive && this.state.isActive) {
            if (typeof PureJSTouchScroller !== 'undefined') {
                this.state.touchInstance = new PureJSTouchScroller(this.viewportElement, {
                    axis: 'x',
                    onMove: () => {
                        if (this.settings.manualContinuousFlow) {
                            if (this.viewportElement.scrollLeft <= 0) {
                                this.checkLeftBoundaryRelocation();
                            } else {
                                this.checkRightBoundaryRelocation();
                            }
                        }
                        this.dispatcher.dispatch('touchMoved');
                    },
                    onStop: () => {
                        this.cancelCurrentAnimation();
                        this.haltAutoFlow();
                        this.dispatcher.dispatch('touchStopped');
                    }
                });
            }
        }

        this.rightControlElement.addEventListener('mousemove', this.handleRightZoneMove.bind(this));
        this.rightControlElement.addEventListener('mouseenter', this.handleRightZoneEnter.bind(this));
        this.rightControlElement.addEventListener('mouseleave', this.handleRightZoneLeave.bind(this));
        this.rightControlElement.addEventListener('mousedown', this.handleRightZoneDown.bind(this));

        this.leftControlElement.addEventListener('mousemove', this.handleLeftZoneMove.bind(this));
        this.leftControlElement.addEventListener('mouseenter', this.handleLeftZoneEnter.bind(this));
        this.leftControlElement.addEventListener('mouseleave', this.handleLeftZoneLeave.bind(this));
        this.leftControlElement.addEventListener('mousedown', this.handleLeftZoneDown.bind(this));

        document.body.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));

        this.contentAreaElement.addEventListener('wheel', this.handleWheelMotion.bind(this), { passive: false });
        if (this.settings.wheelScrollMode) {
            this.leftControlElement.addEventListener('wheel', this.preventWheelPropagation.bind(this), { passive: false });
            this.rightControlElement.addEventListener('wheel', this.preventWheelPropagation.bind(this), { passive: false });
        }

        window.addEventListener('resize', () => {
            this.evaluateControlVisibility();
            this.dispatcher.dispatch('windowResized');
        });
    }

    loadInitialContent() {
        const config = this.settings.contentOnLoad;
        if (config && config.method && config.content) {
            if (typeof this[config.method] === 'function') {
                this[config.method](config.content, config.manipulationMethod, config.addWhere, config.filterTag);
            }
        }
    }

    fetchAndInsert(url, manipulation, position, filter) {
        // Placeholder for content loading logic
        // After content is loaded and inserted, call this.measureContentLayout();
    }

    setInitialVisibility() {
        if (this.settings.startHidden) {
            this.hideComponent();
        }
    }

    handleRightZoneMove(event) {
        if (this.settings.zoneScrollingActive) {
            const x = event.pageX - this.rightControlElement.getBoundingClientRect().left;
            this.state.currentShiftAmount = Math.round((x / this.state.controlZoneWidth) * this.settings.zoneScrollStep);
            if (this.state.currentShiftAmount === Infinity || this.state.currentShiftAmount < 1) {
                this.state.currentShiftAmount = 1;
            }
        }
    }

    handleRightZoneEnter() {
        if (this.settings.zoneScrollingActive) {
            this.cancelCurrentAnimation();
            this.haltAutoFlow();

            this.state.rightFlowHandle = setInterval(() => {
                if (this.state.currentShiftAmount > 0 && this.state.isActive) {
                    this.viewportElement.scrollLeft += (this.state.currentShiftAmount * this.state.speedMultiplier);
                    if (this.settings.manualContinuousFlow) {
                        this.checkRightBoundaryRelocation();
                    }
                    this.evaluateControlVisibility();
                }
            }, this.settings.zoneScrollInterval);
            this.dispatcher.dispatch('controlEnteredRight');
        }
    }

    handleRightZoneLeave() {
        if (this.settings.zoneScrollingActive) {
            clearInterval(this.state.rightFlowHandle);
            this.state.currentShiftAmount = 0;

            if (this.settings.zoneEasingEnabled && this.state.isActive) {
                this.animateScroll(
                    this.viewportElement.scrollLeft,
                    this.viewportElement.scrollLeft + this.settings.zoneEasingDistance,
                    this.settings.zoneEasingDuration,
                    this.settings.zoneEasingFunction
                );
            }
        }
    }

    handleRightZoneDown() {
        this.state.speedMultiplier = this.settings.zoneMouseDownBoost;
    }

    handleLeftZoneMove(event) {
        if (this.settings.zoneScrollingActive) {
            const x = this.state.controlZoneWidth - (event.pageX - this.leftControlElement.getBoundingClientRect().left);
            this.state.currentShiftAmount = Math.round((x / this.state.controlZoneWidth) * this.settings.zoneScrollStep);
            if (this.state.currentShiftAmount === Infinity || this.state.currentShiftAmount < 1) {
                this.state.currentShiftAmount = 1;
            }
        }
    }

    handleLeftZoneEnter() {
        if (this.settings.zoneScrollingActive) {
            this.cancelCurrentAnimation();
            this.haltAutoFlow();

            this.state.leftFlowHandle = setInterval(() => {
                if (this.state.currentShiftAmount > 0 && this.state.isActive) {
                    this.viewportElement.scrollLeft -= (this.state.currentShiftAmount * this.state.speedMultiplier);
                    if (this.settings.manualContinuousFlow) {
                        this.checkLeftBoundaryRelocation();
                    }
                    this.evaluateControlVisibility();
                }
            }, this.settings.zoneScrollInterval);
            this.dispatcher.dispatch('controlEnteredLeft');
        }
    }

    handleLeftZoneLeave() {
        if (this.settings.zoneScrollingActive) {
            clearInterval(this.state.leftFlowHandle);
            this.state.currentShiftAmount = 0;

            if (this.settings.zoneEasingEnabled && this.state.isActive) {
                this.animateScroll(
                    this.viewportElement.scrollLeft,
                    this.viewportElement.scrollLeft - this.settings.zoneEasingDistance,
                    this.settings.zoneEasingDuration,
                    this.settings.zoneEasingFunction
                );
            }
        }
    }

    handleLeftZoneDown() {
        this.state.speedMultiplier = this.settings.zoneMouseDownBoost;
    }

    handleGlobalMouseUp() {
        this.state.speedMultiplier = 1;
    }

    preventWheelPropagation(event) {
        event.preventDefault();
    }

    handleWheelMotion(event) {
        if (this.state.isActive && this.settings.wheelScrollMode.length > 0) {
            let displacement = 0;
            const step = this.settings.wheelScrollStep;

            if (this.settings.wheelScrollMode === "vertical" && event.deltaY !== 0) {
                this.haltAutoFlow();
                event.preventDefault();
                displacement = Math.round(step * event.deltaY);
            } else if (this.settings.wheelScrollMode === "horizontal" && event.deltaX !== 0) {
                this.haltAutoFlow();
                event.preventDefault();
                displacement = Math.round(step * event.deltaX);
            } else if (this.settings.wheelScrollMode === "allDirections") {
                this.haltAutoFlow();
                event.preventDefault();
                displacement = Math.round(step * (event.deltaX || event.deltaY));
            }

            if (displacement !== 0) {
                this.shiftView(displacement);
            }
        }
    }

    handleHostEnter(event) {
        if (this.settings.zoneScrollingActive) {
            event.stopPropagation();
            this.revealControlBackgrounds(250);
        }
    }

    handleHostLeave(event) {
        if (this.settings.zoneScrollingActive) {
            event.stopPropagation();
            this.concealControlBackgrounds(250);
        }
    }

    refreshState() {
        this.measureContentLayout();
        this.evaluateControlVisibility();
        this.dispatcher.dispatch('initializationComplete');
    }

    configureOption(key, value) {
        this.settings[key] = value;

        if (key === "zoneScrollingActive") {
            if (value === true) {
                this.evaluateControlVisibility();
            } else {
                this.leftControlElement.style.display = 'none';
                this.rightControlElement.style.display = 'none';
            }
        } else if (["autoFlowStep", "zoneEasingDistance", "zoneEasingDuration", "wheelEasingDuration"].includes(key)) {
            this.settings[key] = parseInt(value, 10);
        } else if (key === "autoFlowInterval") {
            this.settings[key] = parseInt(value, 10);
            this.initiateAutoFlow();
        }
    }

    measureContentLayout() {
        let totalWidth = 0;
        const currentChildren = Array.from(this.contentAreaElement.children).filter(child =>
            this.settings.itemCountClass ? child.classList.contains(this.settings.itemCountClass) : true
        );

        currentChildren.forEach(item => {
            totalWidth += item.offsetWidth;
        });
        this.state.totalContentWidth = totalWidth;
        this.contentAreaElement.style.width = `${totalWidth}px`;
        this.state.contentAreaHeight = this.contentAreaElement.offsetHeight;
    }

    evaluateControlVisibility() {
        if (!this.settings.zoneScrollingActive || !this.state.isActive) {
            this.leftControlElement.style.display = 'none';
            this.rightControlElement.style.display = 'none';
            return;
        }

        if (this.state.totalContentWidth > this.viewportElement.clientWidth) {
            this.leftControlElement.style.display = 'block';
            this.rightControlElement.style.display = 'block';

            if (this.viewportElement.scrollLeft <= 0) {
                this.leftControlElement.classList.remove(this.settings.leftControlVisibleClassName);
            } else {
                this.leftControlElement.classList.add(this.settings.leftControlVisibleClassName);
            }

            if (this.viewportElement.scrollLeft >= (this.state.totalContentWidth - this.viewportElement.clientWidth)) {
                this.rightControlElement.classList.remove(this.settings.rightControlVisibleClassName);
            } else {
                this.rightControlElement.classList.add(this.settings.rightControlVisibleClassName);
            }
        } else {
            this.leftControlElement.style.display = 'none';
            this.rightControlElement.style.display = 'none';
        }
    }

    shiftView(amount) {
        this.cancelCurrentAnimation();
        const newScrollPos = this.viewportElement.scrollLeft + amount;

        if (this.settings.wheelEasingEnabled) {
            this.animateScroll(
                this.viewportElement.scrollLeft,
                newScrollPos,
                this.settings.wheelEasingDuration,
                this.settings.wheelEasingFunction
            );
        } else {
            this.viewportElement.scrollLeft = newScrollPos;
        }

        if (this.settings.manualContinuousFlow) {
            if (amount < 0) {
                this.checkLeftBoundaryRelocation();
            } else {
                this.checkRightBoundaryRelocation();
            }
        }
        this.evaluateControlVisibility();
    }

    animateScroll(startPos, endPos, duration, easingFuncKey) {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
        }

        const startTime = performance.now();
        const easingFunction = easingFunctions[easingFuncKey] || easingFunctions.easeOutQuart;
        const distance = endPos - startPos;

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            if (elapsed < duration) {
                this.viewportElement.scrollLeft = easingFunction(elapsed, startPos, distance, duration);
                this.state.animationFrameId = requestAnimationFrame(step);
            } else {
                this.viewportElement.scrollLeft = endPos;
                this.state.animationFrameId = null;
                this.evaluateControlVisibility();
            }
        };
        this.state.animationFrameId = requestAnimationFrame(step);
    }

    cancelCurrentAnimation() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
    }

    initiateAutoFlow() {
        this.haltAutoFlow();

        if (!this.state.isActive || this.settings.autoFlowMode.length === 0) {
            return;
        }

        this.state.autoFlowHandle = setInterval(() => {
            const currentScroll = this.viewportElement.scrollLeft;
            const maxScroll = this.state.totalContentWidth - this.viewportElement.clientWidth;
            let newScroll = currentScroll;

            switch (this.settings.autoFlowDirection) {
                case "right":
                    newScroll += this.settings.autoFlowStep;
                    if (newScroll >= maxScroll) {
                        newScroll = maxScroll;
                        this.haltAutoFlow();
                    }
                    break;
                case "left":
                    newScroll -= this.settings.autoFlowStep;
                    if (newScroll <= 0) {
                        newScroll = 0;
                        this.haltAutoFlow();
                    }
                    break;
                case "backAndForth":
                    if (this.state.autoFlowDirection === "right") {
                        newScroll += this.settings.autoFlowStep;
                        if (newScroll >= maxScroll) {
                            newScroll = maxScroll;
                            this.state.autoFlowDirection = "left";
                        }
                    } else {
                        newScroll -= this.settings.autoFlowStep;
                        if (newScroll <= 0) {
                            newScroll = 0;
                            this.state.autoFlowDirection = "right";
                        }
                    }
                    break;
                case "endlessLoopRight":
                    newScroll += this.settings.autoFlowStep;
                    this.checkRightBoundaryRelocation();
                    break;
                case "endlessLoopLeft":
                    newScroll -= this.settings.autoFlowStep;
                    this.checkLeftBoundaryRelocation();
                    break;
            }
            this.viewportElement.scrollLeft = newScroll;
            this.evaluateControlVisibility();
        }, this.settings.autoFlowInterval);
    }

    haltAutoFlow() {
        if (this.state.autoFlowHandle) {
            clearInterval(this.state.autoFlowHandle);
            this.state.autoFlowHandle = null;
        }
    }

    revealControlBackgrounds() {
        if (this.state.hideControlsTimer) {
            clearTimeout(this.state.hideControlsTimer);
            this.state.hideControlsTimer = null;
        }
        this.leftControlElement.classList.add(this.settings.leftControlVisibleClassName);
        this.rightControlElement.classList.add(this.settings.rightControlVisibleClassName);
    }

    concealControlBackgrounds() {
        this.leftControlElement.classList.remove(this.settings.leftControlVisibleClassName);
        this.rightControlElement.classList.remove(this.settings.rightControlVisibleClassName);
    }

    checkRightBoundaryRelocation() {
        const currentScroll = this.viewportElement.scrollLeft;
        const firstItem = this.contentAreaElement.firstElementChild;

        if (firstItem && currentScroll > firstItem.offsetWidth) {
            this.contentAreaElement.appendChild(firstItem);
            this.viewportElement.scrollLeft -= firstItem.offsetWidth;
            this.state.totalContentWidth = this.contentAreaElement.scrollWidth;
        }
    }

    checkLeftBoundaryRelocation() {
        const currentScroll = this.viewportElement.scrollLeft;

        if (currentScroll <= 0) {
            const lastItem = this.contentAreaElement.lastElementChild;
            if (lastItem) {
                this.contentAreaElement.insertBefore(lastItem, this.contentAreaElement.firstChild);
                this.viewportElement.scrollLeft += lastItem.offsetWidth;
                this.state.totalContentWidth = this.contentAreaElement.scrollWidth;
            }
        }
    }

    hideComponent() {
        this.hostElement.style.display = 'none';
        this.state.isVisible = false;
    }

    showComponent() {
        this.hostElement.style.display = '';
        this.state.isVisible = true;
        this.measureContentLayout();
        this.evaluateControlVisibility();
    }

    focusOnElement(elementId, duration = this.settings.scrollToAnimationTime, easing = this.settings.scrollToEasingFunc) {
        const targetElement = this.contentAreaElement.querySelector(`#${elementId}`);
        if (!targetElement) {
            return;
        }

        const targetOffset = targetElement.offsetLeft;
        const viewportWidth = this.viewportElement.clientWidth;
        const targetWidth = targetElement.offsetWidth;

        let finalScrollPosition = targetOffset - (viewportWidth / 2) + (targetWidth / 2);

        finalScrollPosition = Math.max(0, Math.min(finalScrollPosition, this.state.totalContentWidth - viewportWidth));

        this.animateScroll(this.viewportElement.scrollLeft, finalScrollPosition, duration, easing);
    }
}