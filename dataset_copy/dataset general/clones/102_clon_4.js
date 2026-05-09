const _scrollerDefaults = {
    orientation: 'vertical',
    wheelStepPixels: 40,
    enableWheelScroll: true,
    railLength: 'auto',
    handleLength: 'auto'
};

function activateCustomScroller(elements, configOverrides) {
    const finalConfig = Object.assign({}, _scrollerDefaults, configOverrides);
    if (!elements || elements.length === 0) {
        return elements;
    }
    Array.from(elements).forEach(element => {
        element._dynamicScrollerInstance = new DynamicScroller(element, finalConfig);
    });
    return elements;
}

function refreshScrollerVisuals(elements, scrollDirective) {
    if (!elements || elements.length === 0) {
        return elements;
    }
    Array.from(elements).forEach(element => {
        if (element._dynamicScrollerInstance) {
            element._dynamicScrollerInstance.refreshDisplay(scrollDirective);
        }
    });
    return elements;
}

class DynamicScroller {
    constructor(mainContainerElement, config) {
        this.rootContainer = mainContainerElement;
        this.settings = config;

        this.visiblePanel = this.rootContainer.querySelector('.viewport');
        this.scrollableContent = this.rootContainer.querySelector('.overview');
        this.scrollerHousing = this.rootContainer.querySelector('.scrollbar');
        this.scrollerRail = this.rootContainer.querySelector('.track');
        this.scrollerHandle = this.rootContainer.querySelector('.thumb');

        this.isOrientationHorizontal = this.settings.orientation === 'horizontal';
        this.coordinateProperty = this.isOrientationHorizontal ? 'left' : 'top';
        this.sizeProperty = this.isOrientationHorizontal ? 'width' : 'height';
        this.scrollDimensionProperty = this.isOrientationHorizontal ? 'scrollWidth' : 'scrollHeight';
        this.clientDimensionProperty = this.isOrientationHorizontal ? 'clientWidth' : 'clientHeight';
        this.offsetDimensionProperty = this.isOrientationHorizontal ? 'offsetWidth' : 'offsetHeight';

        this.currentScrollOffset = 0;
        this.totalScrollableDistance = 0;
        this.contentVisibilityRatio = 1;
        this.handleTravelRange = 0;
        this.scrollScalingFactor = 1;

        this.dragInteraction = {
            initialMouseCoordinate: 0,
            initialHandleOffset: 0
        };

        this.init();
    }

    checkElementsPresent() {
        return (this.visiblePanel && this.scrollableContent && this.scrollerHousing && this.scrollerRail && this.scrollerHandle);
    }

    init() {
        if (!this.checkElementsPresent()) {
            throw new Error("Custom Scroller: Missing required sub-elements (e.g., .viewport, .overview, .scrollbar, .track, .thumb) in the container.");
        }
        this.refreshDisplay();
        this.setupEventListeners();
        return this;
    }

    isScrollActive() {
        return this.contentVisibilityRatio < 1;
    }

    refreshDisplay(scrollDirective) {
        if (!this.checkElementsPresent()) {
            throw new Error("Custom Scroller: Cannot refresh, missing required sub-elements.");
        }

        const visibleAreaDimension = this.visiblePanel[this.clientDimensionProperty];
        const contentDimension = this.scrollableContent[this.scrollDimensionProperty];
        this.totalScrollableDistance = contentDimension - visibleAreaDimension;
        this.contentVisibilityRatio = visibleAreaDimension / contentDimension;

        this.scrollerHousing.classList.toggle('disabled', !this.isScrollActive());

        const railDimension = this.settings.railLength === 'auto' ? visibleAreaDimension : this.settings.railLength;
        let handleDimension = this.settings.handleLength === 'auto'
            ? (railDimension * this.contentVisibilityRatio)
            : this.settings.handleLength;
        handleDimension = Math.min(railDimension, Math.max(0, handleDimension));

        this.handleTravelRange = railDimension - handleDimension;
        this.scrollScalingFactor = this.settings.handleLength === 'auto'
            ? (contentDimension / railDimension)
            : this.totalScrollableDistance / this.handleTravelRange;

        if (this.isScrollActive() && scrollDirective === 'relative') {
            this.currentScrollOffset = Math.min(this.totalScrollableDistance, Math.max(0, this.currentScrollOffset));
        } else if (this.isScrollActive() && scrollDirective === 'bottom') {
            this.currentScrollOffset = this.totalScrollableDistance;
        } else {
            const parsedScroll = parseInt(scrollDirective);
            this.currentScrollOffset = isNaN(parsedScroll) ? 0 : parsedScroll;
        }
        this.currentScrollOffset = Math.min(this.totalScrollableDistance, Math.max(0, this.currentScrollOffset));

        this.scrollerHandle.style[this.coordinateProperty] = `${this.currentScrollOffset / this.scrollScalingFactor}px`;
        this.scrollableContent.style[this.coordinateProperty] = `${-this.currentScrollOffset}px`;

        this.scrollerHousing.style[this.sizeProperty] = `${railDimension}px`;
        this.scrollerRail.style[this.sizeProperty] = `${railDimension}px`;
        this.scrollerHandle.style[this.sizeProperty] = `${handleDimension}px`;
    }

    setupEventListeners() {
        this.boundStartHandleDrag = this.startHandleDrag.bind(this);
        this.boundHandleTrackClick = this.handleTrackClick.bind(this);
        this.boundHandleWheelScroll = this.handleWheelScroll.bind(this);

        this.scrollerHandle.addEventListener('mousedown', this.boundStartHandleDrag);
        this.scrollerHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.boundStartHandleDrag(e.touches[0]);
        }, { passive: false });

        this.scrollerRail.addEventListener('mouseup', this.boundHandleTrackClick);
        this.scrollerRail.addEventListener('mousedown', (e) => e.preventDefault());

        if (this.settings.enableWheelScroll) {
            this.rootContainer.addEventListener('wheel', this.boundHandleWheelScroll, { passive: false });
        }
    }

    startHandleDrag(event) {
        if (!this.isScrollActive()) return;

        this.dragInteraction.initialMouseCoordinate = this.isOrientationHorizontal ? event.pageX : event.pageY;
        const currentHandleOffset = parseFloat(this.scrollerHandle.style[this.coordinateProperty]) || 0;
        this.dragInteraction.initialHandleOffset = currentHandleOffset;

        this.boundProcessHandleDrag = this.processHandleDrag.bind(this);
        this.boundEndHandleDrag = this.endHandleDrag.bind(this);
        this.boundProcessHandleDragTouch = (e) => this.processHandleDrag(e.touches[0]);

        document.addEventListener('mousemove', this.boundProcessHandleDrag);
        document.addEventListener('mouseup', this.boundEndHandleDrag);
        document.addEventListener('touchmove', this.boundProcessHandleDragTouch, { passive: false });
        document.addEventListener('touchend', this.boundEndHandleDrag);

        event.preventDefault();
    }

    processHandleDrag(event) {
        if (!this.isScrollActive()) return;

        const currentMouseCoordinate = this.isOrientationHorizontal ? event.pageX : event.pageY;
        const mouseDelta = currentMouseCoordinate - this.dragInteraction.initialMouseCoordinate;
        let newHandlePosition = this.dragInteraction.initialHandleOffset + mouseDelta;

        newHandlePosition = Math.min(this.handleTravelRange, Math.max(0, newHandlePosition));

        this.currentScrollOffset = newHandlePosition * this.scrollScalingFactor;

        this.scrollableContent.style[this.coordinateProperty] = `${-this.currentScrollOffset}px`;
        this.scrollerHandle.style[this.coordinateProperty] = `${newHandlePosition}px`;

        event.preventDefault();
    }

    endHandleDrag() {
        document.removeEventListener('mousemove', this.boundProcessHandleDrag);
        document.removeEventListener('mouseup', this.boundEndHandleDrag);
        document.removeEventListener('touchmove', this.boundProcessHandleDragTouch);
        document.removeEventListener('touchend', this.boundEndHandleDrag);

        delete this.boundProcessHandleDrag;
        delete this.boundEndHandleDrag;
        delete this.boundProcessHandleDragTouch;
    }

    handleWheelScroll(event) {
        if (!this.isScrollActive()) return;

        event.preventDefault();

        const delta = event.deltaY || -event.wheelDelta || event.detail;
        const scrollDirection = delta > 0 ? 1 : -1;

        this.currentScrollOffset += scrollDirection * this.settings.wheelStepPixels;

        this.currentScrollOffset = Math.min(this.totalScrollableDistance, Math.max(0, this.currentScrollOffset));

        this.scrollerHandle.style[this.coordinateProperty] = `${this.currentScrollOffset / this.scrollScalingFactor}px`;
        this.scrollableContent.style[this.coordinateProperty] = `${-this.currentScrollOffset}px`;
    }

    handleTrackClick(event) {
        if (!this.isScrollActive()) return;

        const trackRect = this.scrollerRail.getBoundingClientRect();
        const clickCoordinate = this.isOrientationHorizontal ? event.clientX : event.clientY;
        const trackStart = this.isOrientationHorizontal ? trackRect.left : trackRect.top;
        const clickOffsetInTrack = clickCoordinate - trackStart;

        let newHandlePosition = clickOffsetInTrack - (this.scrollerHandle[this.offsetDimensionProperty] / 2);
        newHandlePosition = Math.min(this.handleTravelRange, Math.max(0, newHandlePosition));

        this.currentScrollOffset = newHandlePosition * this.scrollScalingFactor;

        this.scrollerHandle.style[this.coordinateProperty] = `${newHandlePosition}px`;
        this.scrollableContent.style[this.coordinateProperty] = `${-this.currentScrollOffset}px`;

        event.preventDefault();
    }
}