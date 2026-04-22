class VisualManager {
    constructor(configuration = {}) {
        this.primaryElement = configuration.mainPage;
        this.backLayer = configuration.background;
        this.backImageElement = configuration.backgroundImage;

        this.isAppleDevice = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

        this.isEffectActive = false;
        this.externalScroller = null;

        this.animationFrameRequester = this.animateFrame.bind(this);

        if (!this.isAppleDevice) {
            this.externalScroller = new IScroll(this.primaryElement);
        } else {
            this.performScrollCorrection();
            this.attachInteractionHandlers();
        }

        this.attachTouchLifecycleHandlers();
    }

    attachInteractionHandlers() {
        this.primaryElement.addEventListener('touchmove', (event) => {
            event.stopPropagation();
        }, false);

        this.primaryElement.addEventListener('scroll', () => this.queueScrollCorrection(), false);

        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, false);
    }

    attachTouchLifecycleHandlers() {
        this.primaryElement.addEventListener('touchstart', () => this.activateEffect(), false);
        this.primaryElement.addEventListener('touchend', () => this.deactivateEffectAndRefresh(), false);
        this.primaryElement.addEventListener('touchcancel', () => this.deactivateEffectAndRefresh(), false);
    }

    queueScrollCorrection() {
        setTimeout(() => this.performScrollCorrection(), 0);
    }

    performScrollCorrection() {
        if (this.primaryElement.scrollTop === 0) {
            this.primaryElement.scrollTop = 1;
        }
    }

    animateFrame() {
        webkitRequestAnimationFrame(this.animationFrameRequester);
        this.updateVisuals();
    }

    activateEffect() {
        this.isEffectActive = true;
    }

    deactivateEffectAndRefresh() {
        this.updateVisuals({ forcedScrollPosition: 1 });
        this.isEffectActive = false;
    }

    updateVisuals(visualOptions = {}) {
        if (this.isEffectActive) {
            const currentScrollPosition = visualOptions.forcedScrollPosition !== undefined
                ? visualOptions.forcedScrollPosition
                : (this.externalScroller ? this.externalScroller.y * -1 : this.primaryElement.scrollTop);

            let zoomFactor = 1;
            let moveOffset = 0;
            let styleTransition = "-webkit-transform 0.5s";

            if (currentScrollPosition < 0) {
                zoomFactor = (currentScrollPosition * -0.005) + 1;
                moveOffset = Math.ceil(currentScrollPosition * 1.1);
                styleTransition = "-webkit-transform 0.1s linear";
            }

            this.backImageElement.style.webkitTransition = styleTransition;
            this.backImageElement.style.webkitTransform = `translateZ(0) translateY(${moveOffset}px) scale(${zoomFactor})`;
        }
    }
}