(function (global) {
    'use strict';

    function styleApplicator(element, styleProperties) {
        for (const property in styleProperties) {
            element.style[property] = styleProperties[property];
        }
    }

    function quadEaseInOut(elapsedTime, startValue, changeInValue, totalDuration) {
        elapsedTime /= totalDuration / 2;
        if (elapsedTime < 1) return changeInValue / 2 * elapsedTime * elapsedTime + startValue;
        elapsedTime--;
        return -changeInValue / 2 * (elapsedTime * (elapsedTime - 2) - 1) + startValue;
    }

    class ContentScroller {
        constructor(domElement, configuration) {
            if (!domElement || !(domElement instanceof Element)) {
                throw new Error("Target DOM element missing or invalid.");
            }

            this.primaryHost = domElement;
            this.configOptions = {
                flowDirection: "horizontal", // 'horizontal' or 'vertical'
                scrollMagnitude: 15,
                animationTimeMs: 200,
                motionCurve: 'linear', // Placeholder, not directly used with rAF
                ...configuration
            };

            this.scrollFeatureActive = false;

            this.initialChildren = Array.from(this.primaryHost.children);
            this.primaryHost.innerHTML = '';

            this._constructDOM();
            this._bindInteractionEvents();
            this._evaluateLayout();
        }

        _constructDOM() {
            this.displayPort = document.createElement('div');
            this.displayPort.className = 'custom-view-port';
            styleApplicator(this.displayPort, {
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                height: '100%'
            });

            this.innerContentWrapper = document.createElement('div');
            this.innerContentWrapper.className = 'custom-content-wrapper';
            styleApplicator(this.innerContentWrapper, {
                position: 'relative',
                willChange: 'transform',
                display: 'inline-block'
            });
            this.initialChildren.forEach(child => this.innerContentWrapper.appendChild(child));

            this.railContainer = document.createElement('div');
            this.railContainer.className = 'custom-scroll-rail';
            styleApplicator(this.railContainer, {
                position: 'absolute',
                opacity: '0',
                transition: 'opacity 0.2s ease-in-out',
                zIndex: '10'
            });

            this.sliderThumb = document.createElement('div');
            this.sliderThumb.className = 'custom-scroll-thumb';
            styleApplicator(this.sliderThumb, {
                position: 'absolute',
                cursor: 'pointer',
                borderRadius: '3px',
                background: 'rgba(0,0,0,0.3)',
                transition: 'background 0.2s ease-in-out'
            });

            this.railContainer.appendChild(this.sliderThumb);
            this.displayPort.appendChild(this.innerContentWrapper);
            this.primaryHost.appendChild(this.displayPort);
            this.primaryHost.appendChild(this.railContainer);

            this._setDirectionalStyles();
        }

        _setDirectionalStyles() {
            if (this.configOptions.flowDirection === 'horizontal') {
                this.railContainer.classList.add('horizontal');
                this.innerContentWrapper.classList.add('horizontal');
                styleApplicator(this.railContainer, {
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: '10px'
                });
                styleApplicator(this.sliderThumb, {
                    top: '0',
                    height: '100%'
                });
            } else {
                this.railContainer.classList.add('vertical');
                this.innerContentWrapper.classList.add('vertical');
                styleApplicator(this.railContainer, {
                    right: '0',
                    top: '0',
                    height: '100%',
                    width: '10px'
                });
                styleApplicator(this.sliderThumb, {
                    left: '0',
                    width: '100%'
                });
                styleApplicator(this.innerContentWrapper, {
                    display: 'block'
                });
            }
        }

        _bindInteractionEvents() {
            this.primaryHost.addEventListener('wheel', this._handleScrollWheel.bind(this), { passive: false });
            this.sliderThumb.addEventListener('mousedown', this._initiateThumbDrag.bind(this));
            this.railContainer.addEventListener('click', this._handleRailClick.bind(this));

            this.sizeMonitor = new ResizeObserver(() => this.recalculateMetrics());
            this.sizeMonitor.observe(this.primaryHost);
            this.sizeMonitor.observe(this.innerContentWrapper);
        }

        _handleScrollWheel(event) {
            if (!this.scrollFeatureActive) {
                return;
            }
            event.preventDefault();

            const delta = event.deltaY || event.deltaX;
            const sensitivity = this.configOptions.scrollMagnitude;
            let currentPercentage = this._retrieveCurrentScrollFraction();
            let newPercentage;

            if (this.configOptions.flowDirection === 'horizontal') {
                newPercentage = currentPercentage + (delta > 0 ? sensitivity : -sensitivity);
            } else {
                newPercentage = currentPercentage + (delta > 0 ? sensitivity : -sensitivity);
            }

            this._applyScrollFraction(newPercentage, this.configOptions.animationTimeMs);
        }

        _initiateThumbDrag(event) {
            event.preventDefault();
            event.stopPropagation();
            this.primaryHost.style.userSelect = 'none';
            this.primaryHost.style.cursor = 'grabbing';

            const startMouseX = event.clientX;
            const startMouseY = event.clientY;
            const initialThumbBounds = this.sliderThumb.getBoundingClientRect();

            const _continueDrag = (moveEvent) => {
                let displacement;
                let newThumbPositionPixels;
                let maximumThumbTravel;
                let newFraction;

                if (this.configOptions.flowDirection === 'horizontal') {
                    displacement = moveEvent.clientX - startMouseX;
                    maximumThumbTravel = this.railContainer.clientWidth - this.sliderThumb.offsetWidth;
                    newThumbPositionPixels = initialThumbBounds.left - this.railContainer.getBoundingClientRect().left + displacement;
                } else {
                    displacement = moveEvent.clientY - startMouseY;
                    maximumThumbTravel = this.railContainer.clientHeight - this.sliderThumb.offsetHeight;
                    newThumbPositionPixels = initialThumbBounds.top - this.railContainer.getBoundingClientRect().top + displacement;
                }

                newThumbPositionPixels = Math.max(0, Math.min(maximumThumbTravel, newThumbPositionPixels));
                newFraction = (newThumbPositionPixels / maximumThumbTravel) * 100;
                this._applyScrollFraction(newFraction);
            };

            const _terminateDrag = () => {
                this.primaryHost.style.userSelect = '';
                this.primaryHost.style.cursor = '';
                document.removeEventListener('mousemove', _continueDrag);
                document.removeEventListener('mouseup', _terminateDrag);
            };

            document.addEventListener('mousemove', _continueDrag);
            document.addEventListener('mouseup', _terminateDrag);
        }

        _handleRailClick(event) {
            if (event.target === this.sliderThumb) {
                return;
            }

            const railBounds = this.railContainer.getBoundingClientRect();
            let clickCoordinate;
            let thumbCenterPoint;
            let newFraction;

            if (this.configOptions.flowDirection === 'horizontal') {
                clickCoordinate = event.clientX - railBounds.left;
                thumbCenterPoint = this.sliderThumb.offsetWidth / 2;
                newFraction = ((clickCoordinate - thumbCenterPoint) / (railBounds.width - this.sliderThumb.offsetWidth)) * 100;
            } else {
                clickCoordinate = event.clientY - railBounds.top;
                thumbCenterPoint = this.sliderThumb.offsetHeight / 2;
                newFraction = ((clickCoordinate - thumbCenterPoint) / (railBounds.height - this.sliderThumb.offsetHeight)) * 100;
            }
            this._applyScrollFraction(newFraction, this.configOptions.animationTimeMs);
        }

        _retrieveCurrentScrollFraction() {
            const currentTransform = this._getAppliedContentTransform();
            let currentOffset;
            let maxTravel;

            if (this.configOptions.flowDirection === 'horizontal') {
                currentOffset = parseFloat(currentTransform.replace(/[^0-9.\-,\s]/g, '').split(',')[0] || 0);
                maxTravel = this.innerContentWrapper.scrollWidth - this.displayPort.clientWidth;
            } else {
                currentOffset = parseFloat(currentTransform.replace(/[^0-9.\-,\s]/g, '').split(',')[1] || 0);
                maxTravel = this.innerContentWrapper.scrollHeight - this.displayPort.clientHeight;
            }

            if (maxTravel <= 0) return 0;

            return (-currentOffset / maxTravel) * 100;
        }

        _applyScrollFraction(fraction, duration = 0) {
            fraction = Math.max(0, Math.min(100, fraction));

            let targetPixelOffset;
            let maxContentTravel;
            let currentPixelOffset;

            if (this.configOptions.flowDirection === 'horizontal') {
                maxContentTravel = this.innerContentWrapper.scrollWidth - this.displayPort.clientWidth;
                targetPixelOffset = -(fraction / 100) * maxContentTravel;
                currentPixelOffset = this._getAppliedContentTransformX();
            } else {
                maxContentTravel = this.innerContentWrapper.scrollHeight - this.displayPort.clientHeight;
                targetPixelOffset = -(fraction / 100) * maxContentTravel;
                currentPixelOffset = this._getAppliedContentTransformY();
            }

            if (maxContentTravel <= 0) {
                this._positionThumb(0);
                this._setContentTransform(0, this.configOptions.flowDirection);
                return;
            }

            if (duration > 0) {
                this._animateContentMotion(currentPixelOffset, targetPixelOffset, duration);
            } else {
                this._setContentTransform(targetPixelOffset, this.configOptions.flowDirection);
            }

            const thumbFraction = (maxContentTravel > 0) ? fraction : 0;
            this._positionThumb(thumbFraction);
        }

        _animateContentMotion(startPos, endPos, timeMs) {
            const animationStart = performance.now();
            const frameUpdate = (currentTime) => {
                const elapsed = currentTime - animationStart;
                const progressRatio = Math.min(1, elapsed / timeMs);
                const easedProgress = quadEaseInOut(elapsed, 0, 1, timeMs);
                const currentAnimatedPosition = startPos + (endPos - startPos) * easedProgress;

                this._setContentTransform(currentAnimatedPosition, this.configOptions.flowDirection);

                if (elapsed < timeMs) {
                    requestAnimationFrame(frameUpdate);
                }
            };
            requestAnimationFrame(frameUpdate);
        }

        _getAppliedContentTransform() {
            const transformValue = getComputedStyle(this.innerContentWrapper).transform;
            if (transformValue === 'none') {
                return 'matrix(1, 0, 0, 1, 0, 0)';
            }
            return transformValue;
        }

        _getAppliedContentTransformX() {
            const transformMatrix = this._getAppliedContentTransform();
            const matrixValues = transformMatrix.match(/matrix.*\((.+)\)/)[1].split(', ');
            return parseFloat(matrixValues[4] || 0);
        }

        _getAppliedContentTransformY() {
            const transformMatrix = this._getAppliedContentTransform();
            const matrixValues = transformMatrix.match(/matrix.*\((.+)\)/[1].split(', ');
            return parseFloat(matrixValues[5] || 0);
        }

        _setContentTransform(offsetValue, direction) {
            if (direction === 'horizontal') {
                this.innerContentWrapper.style.transform = `translateX(${offsetValue}px)`;
            } else {
                this.innerContentWrapper.style.transform = `translateY(${offsetValue}px)`;
            }
        }

        _positionThumb(fraction) {
            let thumbRange;
            let thumbOffsetPixels;

            if (this.configOptions.flowDirection === 'horizontal') {
                thumbRange = this.railContainer.clientWidth - this.sliderThumb.offsetWidth;
                thumbOffsetPixels = (fraction / 100) * thumbRange;
                this.sliderThumb.style.transform = `translateX(${thumbOffsetPixels}px)`;
            } else {
                thumbRange = this.railContainer.clientHeight - this.sliderThumb.offsetHeight;
                thumbOffsetPixels = (fraction / 100) * thumbRange;
                this.sliderThumb.style.transform = `translateY(${thumbOffsetPixels}px)`;
            }
        }

        _evaluateLayout() {
            let totalContentSize, visibleViewportSize;
            let contentNeedsScroll;

            if (this.configOptions.flowDirection === 'horizontal') {
                totalContentSize = this.innerContentWrapper.scrollWidth;
                visibleViewportSize = this.displayPort.clientWidth;
                contentNeedsScroll = totalContentSize > visibleViewportSize;
            } else {
                totalContentSize = this.innerContentWrapper.scrollHeight;
                visibleViewportSize = this.displayPort.clientHeight;
                contentNeedsScroll = totalContentSize > visibleViewportSize;
            }

            if (contentNeedsScroll) {
                this.scrollFeatureActive = true;
                this.railContainer.style.opacity = '1';
                this._calculateThumbDimensions(totalContentSize, visibleViewportSize);
                this._adjustContentDimensionsForRail(true);
                this._syncThumbWithContent();
            } else {
                if (this.scrollFeatureActive) {
                    this.scrollFeatureActive = false;
                    this.railContainer.style.opacity = '0';
                    this._adjustContentDimensionsForRail(false);
                    this._setContentTransform(0, this.configOptions.flowDirection);
                    this._positionThumb(0);
                }
            }
        }

        _calculateThumbDimensions(fullContentLength, visibleLength) {
            const ratio = visibleLength / fullContentLength;
            let thumbLength;

            if (this.configOptions.flowDirection === 'horizontal') {
                thumbLength = Math.max(20, visibleLength * ratio);
                this.sliderThumb.style.width = `${thumbLength}px`;
            } else {
                thumbLength = Math.max(20, visibleLength * ratio);
                this.sliderThumb.style.height = `${thumbLength}px`;
            }
        }

        _adjustContentDimensionsForRail(railVisible) {
            if (this.configOptions.flowDirection === 'vertical') {
                if (railVisible) {
                    this.innerContentWrapper.style.width = `${this.displayPort.clientWidth - this.railContainer.offsetWidth}px`;
                } else {
                    this.innerContentWrapper.style.width = '100%';
                }
            }
        }

        _syncThumbWithContent() {
            const currentFraction = this._retrieveCurrentScrollFraction();
            this._positionThumb(currentFraction);
        }

        recalculateMetrics() {
            this._evaluateLayout();
            this._constrainContentPosition();
        }

        _constrainContentPosition() {
            let currentTranslation;
            let maxTranslation;

            if (this.configOptions.flowDirection === 'horizontal') {
                currentTranslation = this._getAppliedContentTransformX();
                maxTranslation = this.innerContentWrapper.scrollWidth - this.displayPort.clientWidth;
            } else {
                currentTranslation = this._getAppliedContentTransformY();
                maxTranslation = this.innerContentWrapper.scrollHeight - this.displayPort.clientHeight;
            }

            const minAllowedTranslation = -maxTranslation;
            const maxAllowedTranslation = 0;

            let adjustedTranslation = currentTranslation;
            if (currentTranslation < minAllowedTranslation) {
                adjustedTranslation = minAllowedTranslation;
            } else if (currentTranslation > maxAllowedTranslation) {
                adjustedTranslation = maxAllowedTranslation;
            }

            if (adjustedTranslation !== currentTranslation) {
                this._setContentTransform(adjustedTranslation, this.configOptions.flowDirection);
                this._syncThumbWithContent();
            }
        }

        traverseToOffset(pixelOffset) {
            let contentSize, viewportSize;
            if (this.configOptions.flowDirection === 'horizontal') {
                contentSize = this.innerContentWrapper.scrollWidth;
                viewportSize = this.displayPort.clientWidth;
            } else {
                contentSize = this.innerContentWrapper.scrollHeight;
                viewportSize = this.displayPort.clientHeight;
            }

            const maximumOffset = contentSize - viewportSize;
            let effectiveOffset = pixelOffset;

            if (pixelOffset + viewportSize > contentSize) {
                effectiveOffset = maximumOffset;
            }
            if (effectiveOffset < 0) {
                effectiveOffset = 0;
            }

            const fraction = (effectiveOffset / maximumOffset) * 100;
            this._applyScrollFraction(fraction, this.configOptions.animationTimeMs);
        }

        deactivate() {
            this.sizeMonitor.disconnect();
            this.primaryHost.removeEventListener('wheel', this._handleScrollWheel);
            this.sliderThumb.removeEventListener('mousedown', this._initiateThumbDrag);
            this.railContainer.removeEventListener('click', this._handleRailClick);

            this.primaryHost.innerHTML = '';
            this.initialChildren.forEach(child => this.primaryHost.appendChild(child));
        }

        updateConfiguration(optionName, newValue) {
            this.configOptions[optionName] = newValue;
            if (optionName === 'flowDirection') {
                this.deactivate();
                this.primaryHost.innerHTML = '';
                this._constructDOM();
                this._bindInteractionEvents();
            }
            this._evaluateLayout();
        }
    }

    global.ScrollerFactory = {
        create: function(targetElement, config) {
            return new ContentScroller(targetElement, config);
        }
    };

})(window);