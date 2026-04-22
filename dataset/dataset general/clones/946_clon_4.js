class ViewPortController {
    #motionElement = null;
    #interactionState = {
        isEngaged: false,
        lastXCoord: 0,
        lastYCoord: 0,
        initialDisplacementX: 0,
        initialDisplacementY: 0,
        lastActivityTime: 0,
        hasMoved: false,
        engagedTarget: null
    };
    #positionDynamics = {
        targetXOffset: 0,
        targetYOffset: 0,
        currentXOffset: 0,
        currentYOffset: 0,
        roundedXOffset: 0,
        roundedYOffset: 0,
        velocityAcrossX: 0,
        velocityAcrossY: 0,
        momentumX: 0,
        momentumY: 0,
        directionX: 0,
        directionY: 0,
        isProcessingMomentum: false
    };
    #configuration = {
        scrollAxis: 'x', // 'x' or 'y'
        minBound: 0,
        maxBound: 0,
        dragThreshold: 10,
        smoothingFactor: 0.12,
        decayFactor: 0.9,
        interactiveSelector: 'img',
        supports3dTransforms: false,
        usingPointerEvents: false
    };

    get currentXDisplayOffset() { return this.#positionDynamics.roundedXOffset; }
    get currentYDisplayOffset() { return this.#positionDynamics.roundedYOffset; }

    constructor() {
        this.#handlePointerInitiate = this.#handlePointerInitiate.bind(this);
        this.#handlePointerProgression = this.#handlePointerProgression.bind(this);
        this.#handlePointerTermination = this.#handlePointerTermination.bind(this);
        this.#handlePointerExit = this.#handlePointerExit.bind(this);
        this.#animationFrameCallback = this.#animationFrameCallback.bind(this);

        this.#configuration.supports3dTransforms = this.#detect3dTransformCapability();
    }

    // Public method to initialize the controller
    initializeMotion(elementToControl, axisOfScroll, useUnifiedPointerInput) {
        this.#motionElement = elementToControl;
        this.#configuration.scrollAxis = axisOfScroll;
        this.#configuration.usingPointerEvents = useUnifiedPointerInput;

        this.#setInitialElementStyle();
        this.#attachInteractionHandlers(useUnifiedPointerInput);

        // Apply a small initial transform to prevent flicker on some mobile browsers
        this.#applyElementTransformation(this.#motionElement, "1px", "0px");

        this.#startAnimationFrameLoop();
    }

    // Feature detection for 3D transforms (simplified Modernizr equivalent)
    #detect3dTransformCapability() {
        const testElement = document.createElement('div');
        document.body.appendChild(testElement);
        testElement.style.transform = 'translate3d(1px,1px,1px)';
        const computedStyle = window.getComputedStyle(testElement);
        const has3d = (computedStyle.getPropertyValue('transform') || 
                       computedStyle.getPropertyValue('-webkit-transform') || 
                       computedStyle.getPropertyValue('-moz-transform') || 
                       computedStyle.getPropertyValue('-ms-transform')).indexOf('translate3d') !== -1;
        document.body.removeChild(testElement);
        return has3d;
    }

    #setInitialElementStyle() {
        if (this.#configuration.scrollAxis === 'y') {
            this.#motionElement.style.width = '640px';
            this.#motionElement.style.height = '8200px'; 
            this.#motionElement.style.marginLeft = '-320px';
            this.#motionElement.className = this.#motionElement.className.replace(new RegExp('(^|\\s+)vCenter(\\s+|$)'), 'hCenter') || 'hCenter';
            this.#configuration.maxBound = this.#motionElement.clientHeight;
        } else { // 'x'
            this.#motionElement.style.width = '12900px';
            this.#motionElement.style.height = '410px';
            this.#motionElement.style.marginTop = '-205px';
            this.#motionElement.className = this.#motionElement.className.replace(new RegExp('(^|\\s+)hCenter(\\s+|$)'), 'vCenter') || 'vCenter';
            this.#configuration.maxBound = this.#motionElement.clientWidth;
        }
    }

    modifyLayoutDirection(isVertical) {
        this.#configuration.scrollAxis = isVertical ? 'y' : 'x';
        const oldClass = isVertical ? 'vCenter' : 'hCenter';
        const newClass = isVertical ? 'hCenter' : 'vCenter';

        this.#motionElement.classList.remove(oldClass);
        this.#motionElement.classList.add(newClass);

        if (isVertical) {
            this.#motionElement.style.width = '640px';
            this.#motionElement.style.height = '8200px';
            this.#motionElement.style.marginLeft = '-320px';
            this.#motionElement.style.marginTop = ''; 
            this.#configuration.maxBound = this.#motionElement.clientHeight;
        } else { // Horizontal
            this.#motionElement.style.width = '12900px';
            this.#motionElement.style.height = '410px';
            this.#motionElement.style.marginTop = '-205px';
            this.#motionElement.style.marginLeft = ''; 
            this.#configuration.maxBound = this.#motionElement.clientWidth;
        }
        // Reset motion state on orientation change
        this.#positionDynamics.targetXOffset = 0;
        this.#positionDynamics.targetYOffset = 0;
        this.#positionDynamics.currentXOffset = 0;
        this.#positionDynamics.currentYOffset = 0;
        this.#positionDynamics.velocityAcrossX = 0;
        this.#positionDynamics.velocityAcrossY = 0;
        this.#positionDynamics.isProcessingMomentum = false;
    }

    #attachInteractionHandlers(useUnifiedPointerInput) {
        const targetElement = this.#motionElement;
        const globalDocument = document;

        if (useUnifiedPointerInput) {
            targetElement.addEventListener('pointerdown', this.#handlePointerInitiate);
            globalDocument.addEventListener('pointerup', this.#handlePointerTermination);
            globalDocument.addEventListener('pointerleave', this.#handlePointerExit);
            globalDocument.addEventListener('pointercancel', this.#handlePointerTermination); 
        } else { // Mouse/Touch fallback
            targetElement.addEventListener('mousedown', this.#handlePointerInitiate);
            targetElement.addEventListener('touchstart', this.#handlePointerInitiate, { passive: false }); 

            globalDocument.addEventListener('mouseup', this.#handlePointerTermination);
            globalDocument.addEventListener('touchend', this.#handlePointerTermination);

            window.addEventListener('blur', this.#handlePointerTermination);
            targetElement.addEventListener('mouseout', this.#handlePointerExit);
        }
        // General text selection prevention during drag
        globalDocument.addEventListener('mousedown', (e) => {
            if (this.#interactionState.isEngaged) e.preventDefault();
        });
    }

    #activateMotionTracking() {
        const globalDocument = document;
        if (this.#configuration.usingPointerEvents) {
            globalDocument.addEventListener('pointermove', this.#handlePointerProgression);
        } else {
            globalDocument.addEventListener('mousemove', this.#handlePointerProgression);
            globalDocument.addEventListener('touchmove', this.#handlePointerProgression, { passive: false });
        }
    }

    #deactivateMotionTracking() {
        const globalDocument = document;
        if (this.#configuration.usingPointerEvents) {
            globalDocument.removeEventListener('pointermove', this.#handlePointerProgression);
        } else {
            globalDocument.removeEventListener('mousemove', this.#handlePointerProgression);
            globalDocument.removeEventListener('touchmove', this.#handlePointerProgression);
        }
    }

    #handlePointerInitiate(event) {
        if (event.target && event.target.nodeName.toLowerCase() === this.#configuration.interactiveSelector) {
            this.#interactionState.engagedTarget = event.target;
        }

        const currentX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].pageX : 0);
        const currentY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].pageY : 0);

        this.#interactionState.lastXCoord = currentX;
        this.#interactionState.lastYCoord = currentY;
        this.#positionDynamics.momentumX = 0;
        this.#positionDynamics.momentumY = 0;
        this.#positionDynamics.velocityAcrossX = 0;
        this.#positionDynamics.velocityAcrossY = 0;
        this.#interactionState.lastActivityTime = performance.now();
        this.#interactionState.initialDisplacementX = this.#positionDynamics.targetXOffset;
        this.#interactionState.initialDisplacementY = this.#positionDynamics.targetYOffset;
        this.#interactionState.isEngaged = true;
        this.#interactionState.hasMoved = false;

        this.#activateMotionTracking();
        if (event.cancelable) event.preventDefault(); 
    }

    #handlePointerProgression(event) {
        if (!this.#interactionState.isEngaged) return;

        const currentTime = performance.now();
        const newX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].pageX : 0);
        const newY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].pageY : 0);
        const displacementX = newX - this.#interactionState.lastXCoord;
        const displacementY = newY - this.#interactionState.lastYCoord;

        if (this.#configuration.scrollAxis === 'x') {
            if (Math.abs(displacementX) < this.#configuration.dragThreshold && !this.#interactionState.hasMoved) return;
        } else { // 'y'
            if (Math.abs(displacementY) < this.#configuration.dragThreshold && !this.#interactionState.hasMoved) return;
        }

        this.#interactionState.lastXCoord = newX;
        this.#interactionState.lastYCoord = newY;
        this.#interactionState.lastActivityTime = currentTime;

        const currentTargetX = this.#positionDynamics.targetXOffset;
        const currentTargetY = this.#positionDynamics.targetYOffset;

        if (this.#configuration.scrollAxis === 'y') {
            const viewportHeight = window.browser_height || window.innerHeight;
            if (currentTargetY > this.#configuration.minBound && currentTargetY < this.#configuration.maxBound - viewportHeight) {
                this.#positionDynamics.targetYOffset -= displacementY;
            } else {
                this.#positionDynamics.targetYOffset -= displacementY / 3;
            }

            const currentDisplacementY = this.#positionDynamics.targetYOffset - this.#interactionState.initialDisplacementY;
            this.#interactionState.initialDisplacementY = this.#positionDynamics.targetYOffset;

            const speedY = Math.abs(currentDisplacementY);
            this.#positionDynamics.velocityAcrossY = (this.#positionDynamics.velocityAcrossY * 0.7) + (speedY * 0.3);
            this.#positionDynamics.directionY = currentDisplacementY < 0 ? -1 : 1;
        } else { // 'x'
            const viewportWidth = window.browser_width || window.innerWidth;
            if (currentTargetX > this.#configuration.minBound && currentTargetX < this.#configuration.maxBound - viewportWidth) {
                this.#positionDynamics.targetXOffset -= displacementX;
            } else {
                this.#positionDynamics.targetXOffset -= displacementX / 3;
            }

            const currentDisplacementX = this.#positionDynamics.targetXOffset - this.#interactionState.initialDisplacementX;
            this.#interactionState.initialDisplacementX = this.#positionDynamics.targetXOffset;

            const speedX = Math.abs(currentDisplacementX);
            this.#positionDynamics.velocityAcrossX = (this.#positionDynamics.velocityAcrossX * 0.7) + (speedX * 0.3);
            this.#positionDynamics.directionX = currentDisplacementX < 0 ? -1 : 1;
        }
        this.#interactionState.hasMoved = true;
        if (event.cancelable) event.preventDefault(); 
    }

    #handlePointerTermination(event) {
        if (!this.#interactionState.isEngaged) return;

        this.#interactionState.isEngaged = false;
        this.#positionDynamics.momentumX = Math.abs(this.#positionDynamics.velocityAcrossX);
        this.#positionDynamics.momentumY = Math.abs(this.#positionDynamics.velocityAcrossY);
        this.#positionDynamics.isProcessingMomentum = true;

        const currentTime = performance.now();
        let timeElapsed = currentTime - this.#interactionState.lastActivityTime;
        timeElapsed = Math.max(10, timeElapsed);

        const decayModifier = 1 - Math.min(1, Math.max(0, timeElapsed / 100));
        this.#positionDynamics.velocityAcrossX *= decayModifier;
        this.#positionDynamics.velocityAcrossY *= decayModifier;

        this.#interactionState.lastXCoord = 0;
        this.#interactionState.lastYCoord = 0;

        this.#deactivateMotionTracking();

        if (!this.#interactionState.hasMoved && this.#interactionState.engagedTarget) {
            this.notifyElementInteraction(this.#interactionState.engagedTarget);
        }
        this.#interactionState.engagedTarget = null;
    }

    #handlePointerExit(event) {
        if (this.#interactionState.isEngaged) {
            this.#handlePointerTermination(event);
        }
    }

    // Placeholder for external callback on element interaction
    notifyElementInteraction(element) {
        // This method can be overridden or extended by the consumer of this class
    }

    #updateScrollState() {
        if (this.#configuration.scrollAxis === 'x') {
            this.#manageMomentum('x');
            const easing = this.#configuration.smoothingFactor;
            const displacement = (this.#positionDynamics.targetXOffset - this.#positionDynamics.currentXOffset) * easing;
            this.#positionDynamics.currentXOffset += displacement;
            this.#positionDynamics.roundedXOffset = Math.round(-this.#positionDynamics.currentXOffset);
        } else { // 'y'
            this.#manageMomentum('y');
            const easing = this.#configuration.smoothingFactor;
            const displacementY = (this.#positionDynamics.targetYOffset - this.#positionDynamics.currentYOffset) * easing;
            this.#positionDynamics.currentYOffset += displacementY;
            this.#positionDynamics.roundedYOffset = Math.round(-this.#positionDynamics.currentYOffset);
        }
    }

    #manageMomentum(axis) {
        const isXAxis = axis === 'x';
        const targetProp = isXAxis ? 'targetXOffset' : 'targetYOffset';
        const velocityProp = isXAxis ? 'velocityAcrossX' : 'velocityAcrossY';
        const directionProp = isXAxis ? 'directionX' : 'directionY';
        const maxLimit = this.#configuration.maxBound;
        const viewportExtent = isXAxis ? (window.browser_width || window.innerWidth) : (window.browser_height || window.innerHeight);

        if (this.#positionDynamics.isProcessingMomentum) {
            this.#positionDynamics[targetProp] += this.#positionDynamics[velocityProp] * this.#positionDynamics[directionProp];
            this.#positionDynamics[velocityProp] *= this.#configuration.decayFactor;

            // Boundary handling
            if (this.#positionDynamics[targetProp] < this.#configuration.minBound) {
                this.#positionDynamics[velocityProp] = 0;
                this.#positionDynamics[targetProp] = this.#configuration.minBound;
                this.#positionDynamics.isProcessingMomentum = false;
            } else if (this.#positionDynamics[targetProp] > maxLimit - viewportExtent) {
                this.#positionDynamics[velocityProp] = 0;
                this.#positionDynamics[targetProp] = maxLimit - viewportExtent;
                this.#positionDynamics.isProcessingMomentum = false;
            }

            if (Math.abs(this.#positionDynamics[velocityProp]) < 0.01) {
                this.#positionDynamics.isProcessingMomentum = false;
                this.#positionDynamics[velocityProp] = 0;
            }
        }
    }

    #renderVisuals() {
        const xTranslate = this.#positionDynamics.roundedXOffset + "px";
        const yTranslate = this.#positionDynamics.roundedYOffset + "px";

        this.#applyElementTransformation(this.#motionElement, xTranslate, yTranslate);

        const secondaryVisual = document.getElementById('parallaxBg');
        if (secondaryVisual) {
            const parallaxX = (this.#positionDynamics.roundedXOffset / 8) + "px";
            const parallaxY = (this.#positionDynamics.roundedYOffset / 8) + "px";
            this.#applyElementTransformation(secondaryVisual, parallaxX, parallaxY);
        }
    }

    #applyElementTransformation(element, x, y) {
        let transformValue;
        if (this.#configuration.supports3dTransforms) {
            transformValue = `translate3d(${x}, ${y}, 0px)`;
        } else {
            transformValue = `translate(${x}, ${y})`;
        }

        element.style.transform = transformValue;
        element.style.WebkitTransform = transformValue;
        element.style.msTransform = transformValue;
        element.style.MozTransform = transformValue;
    }

    #animationFrameCallback() {
        this.#updateScrollState();
        this.#renderVisuals();
        requestAnimationFrame(this.#animationFrameCallback);
    }

    #startAnimationFrameLoop() {
        requestAnimationFrame(this.#animationFrameCallback);
    }
}

var MotionController = new ViewPortController();