(function (globalScope) {
    function createMomentumScroller(targetElement, configOptions) {
        const initialConfig = {
            frictionCoefficient: 0.93,
            motionTraceSize: 5
        };
        const activeConfig = { ...initialConfig, ...configOptions };

        let motionState = {
            startCoordinateX: 0,
            displacementX: 0,
            isEngaged: false,
            currentOffset: 0,
            lastMouseX: undefined,
            velocityHistory: []
        };

        let animationFrameHandle = null;

        function updateElementPosition() {
            if (!motionState.isEngaged && motionState.displacementX !== 0) {
                motionState.displacementX *= activeConfig.frictionCoefficient;
                motionState.currentOffset -= motionState.displacementX;
                targetElement.style.setProperty('background-position', `${motionState.currentOffset}px 0px`);

                if (Math.abs(motionState.displacementX) < 0.001) {
                    motionState.displacementX = 0;
                }
            }
            if (motionState.displacementX !== 0 || motionState.isEngaged) {
                animationFrameHandle = requestAnimationFrame(updateElementPosition);
            } else {
                animationFrameHandle = null;
            }
        }

        function initiateAnimationLoop() {
            if (animationFrameHandle === null) {
                animationFrameHandle = requestAnimationFrame(updateElementPosition);
            }
        }

        function handlePressStart(evt) {
            motionState.startCoordinateX = evt.pageX - motionState.currentOffset;
            motionState.isEngaged = true;
            evt.preventDefault();
            initiateAnimationLoop();
        }

        function handlePointerMove(evt) {
            if (motionState.isEngaged) {
                const currentPointerX = evt.pageX;
                if (motionState.lastMouseX === undefined) {
                    motionState.lastMouseX = currentPointerX;
                }
                motionState.currentOffset = currentPointerX - motionState.startCoordinateX;

                if (motionState.velocityHistory.length > activeConfig.motionTraceSize) {
                    motionState.velocityHistory.shift();
                }
                motionState.velocityHistory.push(motionState.lastMouseX - currentPointerX);

                targetElement.style.setProperty('background-position', `${motionState.currentOffset}px 0px`);
                motionState.lastMouseX = currentPointerX;
            }
        }

        function handleReleaseOrExit() {
            if (motionState.isEngaged) {
                if (motionState.velocityHistory.length > 0) {
                    let calculatedMomentum = motionState.velocityHistory[motionState.velocityHistory.length - 1];
                    const historicalSize = motionState.velocityHistory.length;
                    for (let traceIndex = 0; traceIndex < historicalSize; traceIndex++) {
                        calculatedMomentum = (calculatedMomentum * historicalSize + (motionState.velocityHistory[traceIndex])) / (historicalSize + 1);
                    }
                    motionState.displacementX = calculatedMomentum;
                } else {
                    motionState.displacementX = 0;
                }
            }
            motionState.isEngaged = false;
            motionState.lastMouseX = undefined;
            motionState.velocityHistory = [];
        }

        targetElement.addEventListener('mousedown', handlePressStart);
        targetElement.addEventListener('mousemove', handlePointerMove);
        targetElement.addEventListener('mouseup', handleReleaseOrExit);
        targetElement.addEventListener('mouseleave', handleReleaseOrExit);

        return {
            destroy: () => {
                targetElement.removeEventListener('mousedown', handlePressStart);
                targetElement.removeEventListener('mousemove', handlePointerMove);
                targetElement.removeEventListener('mouseup', handleReleaseOrExit);
                targetElement.removeEventListener('mouseleave', handleReleaseOrExit);
                if (animationFrameHandle) {
                    cancelAnimationFrame(animationFrameHandle);
                }
            }
        };
    }

    const ElementEnhancer = function (selectorOrElement) {
        if (typeof selectorOrElement === 'string') {
            this.elements = Array.from(document.querySelectorAll(selectorOrElement));
        } else if (selectorOrElement instanceof HTMLElement) {
            this.elements = [selectorOrElement];
        } else if (Array.isArray(selectorOrElement)) {
            this.elements = selectorOrElement.filter(el => el instanceof HTMLElement);
        } else {
            this.elements = [];
        }
    };

    ElementEnhancer.prototype.applyMomentumEffect = function (options) {
        this.elements.forEach(element => {
            createMomentumScroller(element, options);
        });
        return this;
    };

    globalScope.EnrichedElements = function (selectorOrElement) {
        return new ElementEnhancer(selectorOrElement);
    };

}(window));