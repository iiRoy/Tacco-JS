(function () {
    let internalComponentId = 0;

    function buildNode(tag, classList = [], attributes = {}) {
        const node = document.createElement(tag);
        if (classList.length) {
            node.classList.add(...classList);
        }
        for (const attr in attributes) {
            node.setAttribute(attr, attributes[attr]);
        }
        return node;
    }

    function smoothOpacityTransition(element, finalOpacity, durationMillis, completionCallback) {
        const initialOpacity = parseFloat(element.style.opacity || '1');
        const startTimestamp = performance.now();

        function animateFrame(currentTime) {
            const elapsed = currentTime - startTimestamp;
            const progress = Math.min(elapsed / durationMillis, 1);
            const currentOpacityValue = initialOpacity + (finalOpacity - initialOpacity) * progress;

            element.style.opacity = currentOpacityValue;

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                if (finalOpacity === 0) {
                    element.style.display = 'none';
                }
                completionCallback();
            }
        }
        if (finalOpacity > 0) {
            element.style.display = 'block';
        }
        requestAnimationFrame(animateFrame);
    }

    class PresentationEngine {
        static defaultConfiguration = {
            motionStyle: 'slide', // 'slide' or 'fade'
            axisOrientation: 'horizontal', // 'horizontal' or 'vertical'
            loopContinuously: true, // animationLoop
            motionSpeed: 600, // animationDuration
            randomizeOrder: false, // randomize
            showDotPagers: true, // controlNav
            showArrowNav: true, // directionNav
            backButtonLabel: 'Back', // prevText
            forwardButtonLabel: 'Next', // nextText
            enableKeyboardArrows: true, // keyboardNav
            enableScrollWheel: false, // mousewheel
            autoPlay: false, // slideshow
            autoPlayInterval: 7000, // slideshowSpeed
            pauseOnPointerOver: true, // pauseOnHover
            showToggleAutoPlayButton: false, // pausePlay
            pauseButtonLabel: 'Pause', // pauseText
            playButtonLabel: 'Play', // playText
            initialItemIndex: 0, // slideToStart
            controlPanelSelector: '', // controlsContainer
            customDotPagersSelector: '', // manualControls
            beforeItemTransition: (instance) => {}, // before() callback
            afterItemTransition: (instance) => {}, // after() callback
            onEngineStart: (instance) => {}, // start() callback
            onCycleCompletion: (instance) => {} // end() callback
        };

        constructor(hostElement, userConfig) {
            if (!hostElement || !(hostElement instanceof HTMLElement)) {
                console.error('Host element is invalid.');
                return;
            }

            this.hostElement = hostElement;
            this.instanceIdentifier = `engine-${internalComponentId++}`;
            this.hostElement.dataset.engineActive = 'true';

            this.config = Object.assign({}, PresentationEngine.defaultConfiguration, userConfig);

            this.contentArea = this.hostElement.querySelector('.slides');
            this.itemElements = Array.from(this.contentArea.children);
            this.itemCount = this.itemElements.length;

            this._engineState = {
                activeItemIdx: this.config.initialItemIndex,
                targetItemIdx: this.config.initialItemIndex,
                isActivelyTransitioning: false,
                isAtExtremeEnd: (this.config.initialItemIndex === 0) || (this.config.initialItemIndex === this.itemCount - 1),
                interactionEventName: ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click',
                cloneElementCount: 0,
                cloneElementOffset: 0,
                manualAutoPlayPaused: false,
                currentMovementDirection: null, // 'forward' or 'backward'
            };

            this._isAxisVertical = (this.config.axisOrientation === 'vertical');
            this._transformAxis = this._isAxisVertical ? 'Y' : 'X';
            this._transformProperty = 'transform';

            this._externalControlPanel = null;
            this._userProvidedPagers = null;
            this._dotPagerNodes = [];
            this._arrowButtonNodes = { prev: null, next: null };
            this._autoPlayToggleButton = null;

            this._autoPlayTimer = null;
            this._touchGestureData = {
                initialX: null, initialY: null, currentVisualOffset: null,
                itemDimension: null, displacementX: null, gestureStartTimestamp: null,
                isScrollAction: false
            };
            this._eventHandlers = {};

            this._setupEngine();
            this.config.onEngineStart(this);
        }

        _setupEngine() {
            if (this.config.randomizeOrder) {
                this.itemElements.sort(() => (Math.random() - 0.5));
                this.contentArea.innerHTML = '';
                this.itemElements.forEach(item => this.contentArea.appendChild(item));
            }

            if (this.config.motionStyle === 'slide') {
                if (this.config.loopContinuously) {
                    this._engineState.cloneElementCount = 2;
                    this._engineState.cloneElementOffset = 1;
                    this.contentArea.appendChild(this.itemElements[0].cloneNode(true)).classList.add('clone-component');
                    this.contentArea.insertBefore(this.itemElements[this.itemCount - 1].cloneNode(true), this.contentArea.firstChild).classList.add('clone-component');
                }
                this.itemElements = Array.from(this.contentArea.children);

                const initialPositionOffset = -1 * (this._engineState.activeItemIdx + this._engineState.cloneElementOffset);
                this.itemElements.forEach(item => {
                    item.style.display = 'block';
                    item.style.float = 'left';
                });

                if (this._isAxisVertical) {
                    this.contentArea.style.width = '100%';
                    this.contentArea.style.position = 'absolute';
                    this.contentArea.style.height = `${(this.itemCount + this._engineState.cloneElementCount) * 200}%`;

                    setTimeout(() => {
                        this.hostElement.style.height = `${this.itemElements[0].offsetHeight}px`;
                        this.hostElement.style.position = 'relative'; // Ensure host is positioned for absolute content
                        this.contentArea.style.transform = `translate3d(0, ${initialPositionOffset * this.itemElements[0].offsetHeight}px, 0)`;
                    }, 100);
                } else {
                    this.contentArea.style.width = `${(this.itemCount + this._engineState.cloneElementCount) * 200}%`;
                    this.contentArea.style.transform = `translate3d(${initialPositionOffset * this.itemElements[0].offsetWidth}px, 0, 0)`;

                    setTimeout(() => {
                        this.itemElements.forEach(item => {
                            item.style.width = `${this.hostElement.offsetWidth}px`;
                            item.style.float = 'left';
                        });
                    }, 100);
                }
                this.contentArea.style.transitionProperty = this._transformProperty;
                this.contentArea.style.transitionTimingFunction = 'ease-out';

            } else { // Fade animation
                this.itemElements.forEach((item, idx) => {
                    item.style.position = 'absolute';
                    item.style.top = '0';
                    item.style.left = '0';
                    item.style.width = '100%';
                    item.style.height = '100%';
                    item.style.opacity = (idx === this._engineState.activeItemIdx) ? 1 : 0;
                    item.style.zIndex = (idx === this._engineState.activeItemIdx) ? 2 : 1;
                    item.style.display = (idx === this._engineState.activeItemIdx) ? 'block' : 'none';
                });
            }

            this._configureControls();
            this._attachEventHandlers();

            if (this.config.autoPlay) {
                this._activateAutoPlay();
            }
        }

        _configureControls() {
            if (this.config.controlPanelSelector) {
                this._externalControlPanel = document.querySelector(this.config.controlPanelSelector);
            }
            const targetParentForControls = this._externalControlPanel || this.hostElement;

            if (this.config.showDotPagers) {
                if (this.config.customDotPagersSelector) {
                    this._userProvidedPagers = Array.from(document.querySelectorAll(this.config.customDotPagersSelector));
                    this._dotPagerNodes = this._userProvidedPagers;
                } else {
                    const pagerList = buildNode('ol', ['engine-dot-pagers']);
                    for (let i = 0; i < this.itemCount; i++) {
                        const listItem = buildNode('li');
                        const link = buildNode('a', [], { 'data-item-index': i });
                        link.textContent = String(i + 1);
                        listItem.appendChild(link);
                        pagerList.appendChild(listItem);
                    }
                    targetParentForControls.appendChild(pagerList);
                    this._dotPagerNodes = Array.from(pagerList.querySelectorAll('a'));
                }
                this._dotPagerNodes[this._engineState.activeItemIdx].classList.add('active');
            }

            if (this.config.showArrowNav) {
                const navList = buildNode('ul', ['engine-arrow-nav']);
                const prevLi = buildNode('li');
                this._arrowButtonNodes.prev = buildNode('a', ['prev-btn'], { 'href': '#' });
                this._arrowButtonNodes.prev.textContent = this.config.backButtonLabel;
                prevLi.appendChild(this._arrowButtonNodes.prev);
                navList.appendChild(prevLi);

                const nextLi = buildNode('li');
                this._arrowButtonNodes.next = buildNode('a', ['next-btn'], { 'href': '#' });
                this._arrowButtonNodes.next.textContent = this.config.forwardButtonLabel;
                nextLi.appendChild(nextLi);
                navList.appendChild(nextLi);

                targetParentForControls.appendChild(navList);

                this._refreshControlStates();
            }

            if (this.config.showToggleAutoPlayButton) {
                const toggleWrapper = buildNode('div', ['engine-autoplay-toggle']);
                this._autoPlayToggleButton = buildNode('span');
                toggleWrapper.appendChild(this._autoPlayToggleButton);
                targetParentForControls.appendChild(toggleWrapper);

                const initialState = this.config.autoPlay ? 'pause' : 'play';
                this._autoPlayToggleButton.classList.add(initialState);
                this._autoPlayToggleButton.textContent = (initialState === 'pause') ? this.config.pauseButtonLabel : this.config.playButtonLabel;
            }
        }

        _attachEventHandlers() {
            if (this.config.showDotPagers) {
                this._eventHandlers.dotPagerClick = (e) => {
                    e.preventDefault();
                    const index = parseInt(e.currentTarget.dataset.itemIndex, 10);
                    if (!isNaN(index) && !e.currentTarget.classList.contains('active')) {
                        this._engineState.currentMovementDirection = (index > this._engineState.activeItemIdx) ? 'forward' : 'backward';
                        this._initiateTransition(index, this.config.pauseOnPointerOver);
                    }
                };
                this._dotPagerNodes.forEach(pager => {
                    pager.addEventListener(this._engineState.interactionEventName, this._eventHandlers.dotPagerClick);
                });
            }

            if (this.config.showArrowNav) {
                this._eventHandlers.arrowButtonClick = (e) => {
                    e.preventDefault();
                    const direction = e.currentTarget.classList.contains('next-btn') ? 'forward' : 'backward';
                    const targetIdx = this._calculateTargetIndex(direction);

                    if (this._canMove(targetIdx)) {
                        this._initiateTransition(targetIdx, this.config.pauseOnPointerOver);
                    }
                };
                this._arrowButtonNodes.prev.addEventListener(this._engineState.interactionEventName, this._eventHandlers.arrowButtonClick);
                this._arrowButtonNodes.next.addEventListener(this._engineState.interactionEventName, this._eventHandlers.arrowButtonClick);
            }

            if (this.config.enableKeyboardArrows && document.querySelectorAll('.slides').length === 1) {
                this._eventHandlers.keyboardNavigation = (e) => {
                    if (this._engineState.isActivelyTransitioning) return;
                    if (e.keyCode !== 39 && e.keyCode !== 37) return;

                    const direction = (e.keyCode === 39) ? 'forward' : 'backward';
                    const targetIdx = this._calculateTargetIndex(direction);

                    if (this._canMove(targetIdx)) {
                        this._initiateTransition(targetIdx, this.config.pauseOnPointerOver);
                    }
                };
                document.addEventListener('keyup', this._eventHandlers.keyboardNavigation);
            }

            if (this.config.enableScrollWheel) {
                this._eventHandlers.scrollWheelNavigation = (e) => {
                    e.preventDefault();
                    const wheelDelta = e.deltaY || e.detail * -1;
                    const direction = (wheelDelta < 0) ? 'backward' : 'forward';
                    const targetIdx = this._calculateTargetIndex(direction);

                    if (this._canMove(targetIdx)) {
                        this._initiateTransition(targetIdx, this.config.pauseOnPointerOver);
                    }
                };
                this.hostElement.addEventListener('wheel', this._eventHandlers.scrollWheelNavigation);
            }

            if (this.config.autoPlay && this.config.pauseOnPointerOver) {
                this._eventHandlers.pointerEnter = () => this._deactivateAutoPlay();
                this._eventHandlers.pointerLeave = () => {
                    if (!this._engineState.manualAutoPlayPaused) {
                        this._activateAutoPlay();
                    }
                };
                this.hostElement.addEventListener('mouseenter', this._eventHandlers.pointerEnter);
                this.hostElement.addEventListener('mouseleave', this._eventHandlers.pointerLeave);
            }

            if (this.config.showToggleAutoPlayButton) {
                this._eventHandlers.toggleAutoPlayClick = (e) => {
                    e.preventDefault();
                    if (e.currentTarget.classList.contains('pause')) {
                        this._deactivateAutoPlay();
                        this._engineState.manualAutoPlayPaused = true;
                    } else {
                        this._activateAutoPlay();
                        this._engineState.manualAutoPlayPaused = false;
                    }
                };
                this._autoPlayToggleButton.addEventListener(this._engineState.interactionEventName, this._eventHandlers.toggleAutoPlayClick);
            }

            if ('ontouchstart' in document.documentElement) {
                this._eventHandlers.touchInitiate = (e) => {
                    if (this._engineState.isActivelyTransitioning) {
                        e.preventDefault();
                        return;
                    }
                    if (e.touches.length === 1) {
                        this._deactivateAutoPlay();
                        this._touchGestureData.itemDimension = this._isAxisVertical ? this.hostElement.offsetHeight : this.hostElement.offsetWidth;
                        this._touchGestureData.currentVisualOffset = this._isAxisVertical ?
                            (this._engineState.activeItemIdx + this._engineState.cloneElementOffset) * this.itemElements[0].offsetHeight :
                            (this._engineState.activeItemIdx + this._engineState.cloneElementOffset) * this.itemElements[0].offsetWidth;
                        this._touchGestureData.initialX = this._isAxisVertical ? e.touches[0].pageY : e.touches[0].pageX;
                        this._touchGestureData.initialY = this._isAxisVertical ? e.touches[0].pageX : e.touches[0].pageY;
                        this._touchGestureData.gestureStartTimestamp = Number(new Date());

                        this.contentArea.style.transitionDuration = '0ms';

                        this.hostElement.addEventListener('touchmove', this._eventHandlers.touchMoveActive, { passive: false });
                        this.hostElement.addEventListener('touchend', this._eventHandlers.touchEndGesture);
                    }
                };
                this._eventHandlers.touchMoveActive = (e) => {
                    this._touchGestureData.displacementX = (this._isAxisVertical) ?
                        this._touchGestureData.initialX - e.touches[0].pageY :
                        this._touchGestureData.initialX - e.touches[0].pageX;

                    this._touchGestureData.isScrollAction = (this._isAxisVertical) ?
                        (Math.abs(this._touchGestureData.displacementX) < Math.abs(e.touches[0].pageX - this._touchGestureData.initialY)) :
                        (Math.abs(this._touchGestureData.displacementX) < Math.abs(e.touches[0].pageY - this._touchGestureData.initialY));

                    if (!this._touchGestureData.isScrollAction) {
                        e.preventDefault();
                        if (this.config.motionStyle === 'slide') {
                            let adjustedDisplacement = this._touchGestureData.displacementX;
                            if (!this.config.loopContinuously) {
                                if ((this._engineState.activeItemIdx === 0 && adjustedDisplacement < 0) ||
                                    (this._engineState.activeItemIdx === this.itemCount - 1 && adjustedDisplacement > 0)) {
                                    adjustedDisplacement /= (Math.abs(adjustedDisplacement) / this._touchGestureData.itemDimension + 2);
                                }
                            }
                            const newTransformValue = -this._touchGestureData.currentVisualOffset - adjustedDisplacement;
                            this.contentArea.style.transform = `translate3d(${this._isAxisVertical ? 0 : newTransformValue}px, ${this._isAxisVertical ? newTransformValue : 0}px, 0)`;
                        }
                    }
                };
                this._eventHandlers.touchEndGesture = (e) => {
                    this._engineState.isActivelyTransitioning = false;
                    if (!this._touchGestureData.isScrollAction && this._touchGestureData.displacementX !== null) {
                        const swipeDuration = Number(new Date()) - this._touchGestureData.gestureStartTimestamp;
                        const swipeDistance = Math.abs(this._touchGestureData.displacementX);

                        let target = this._engineState.activeItemIdx;
                        const minimumSwipeDistance = this._touchGestureData.itemDimension / 2;
                        const fastSwipeDuration = 550;
                        const fastSwipeDistance = 20;

                        if ((swipeDuration < fastSwipeDuration && swipeDistance > fastSwipeDistance) || swipeDistance > minimumSwipeDistance) {
                            target = (this._touchGestureData.displacementX > 0) ?
                                this._calculateTargetIndex('forward') :
                                this._calculateTargetIndex('backward');
                        }

                        if (this._canMove(target)) {
                            this._initiateTransition(target, this.config.pauseOnPointerOver);
                        } else {
                            this._initiateTransition(this._engineState.activeItemIdx, this.config.pauseOnPointerOver);
                        }
                    }

                    this.hostElement.removeEventListener('touchmove', this._eventHandlers.touchMoveActive);
                    this.hostElement.removeEventListener('touchend', this._eventHandlers.touchEndGesture);
                    this._touchGestureData.initialX = null;
                    this._touchGestureData.initialY = null;
                    this._touchGestureData.displacementX = null;
                    this._touchGestureData.currentVisualOffset = null;
                };
                this.hostElement.addEventListener('touchstart', this._eventHandlers.touchInitiate, { passive: false });
            }

            if (this.config.motionStyle === 'slide') {
                this._eventHandlers.windowResizeHandler = () => {
                    if (!this._engineState.isActivelyTransitioning) {
                        const currentItemDimension = this._isAxisVertical ? this.itemElements[0].offsetHeight : this.itemElements[0].offsetWidth;
                        const newOffset = -1 * (this._engineState.activeItemIdx + this._engineState.cloneElementOffset) * currentItemDimension;

                        if (this._isAxisVertical) {
                            this.hostElement.style.height = `${this.itemElements[0].offsetHeight}px`;
                            this.contentArea.style.transform = `translate3d(0, ${newOffset}px, 0)`;
                        } else {
                            this.itemElements.forEach(item => {
                                item.style.width = `${this.hostElement.offsetWidth}px`;
                            });
                            this.contentArea.style.transform = `translate3d(${newOffset}px, 0, 0)`;
                        }
                        this.contentArea.style.transitionDuration = '0ms';
                    }
                };
                window.addEventListener('resize', this._eventHandlers.windowResizeHandler);
            }
        }

        _calculateTargetIndex(direction) {
            let nextIndex = this._engineState.activeItemIdx;
            if (direction === 'forward') {
                nextIndex = (this._engineState.activeItemIdx === this.itemCount - 1) ?
                    (this.config.loopContinuously ? 0 : this.itemCount - 1) :
                    this._engineState.activeItemIdx + 1;
            } else { // 'backward'
                nextIndex = (this._engineState.activeItemIdx === 0) ?
                    (this.config.loopContinuously ? this.itemCount - 1 : 0) :
                    this._engineState.activeItemIdx - 1;
            }
            return nextIndex;
        }

        _canMove(targetIndex) {
            if (this._engineState.isActivelyTransitioning) return false;
            if (!this.config.loopContinuously &&
                (targetIndex < 0 || targetIndex >= this.itemCount)) {
                return false;
            }
            return true;
        }

        _initiateTransition(targetIndex, shouldTemporarilyPause = false) {
            if (this._engineState.isActivelyTransitioning && this._engineState.targetItemIdx === targetIndex) return;

            this._engineState.isActivelyTransitioning = true;
            this._engineState.targetItemIdx = targetIndex;
            this.config.beforeItemTransition(this);

            if (shouldTemporarilyPause) {
                this._deactivateAutoPlay();
            }

            this._refreshControlStates();

            if (!this.config.loopContinuously && targetIndex === this.itemCount - 1) {
                this._deactivateAutoPlay();
                this.config.onCycleCompletion(this);
            }

            if (this.config.motionStyle === 'slide') {
                this._animateSlide(targetIndex);
            } else {
                this._animateFade(targetIndex);
            }
        }

        _animateSlide(targetIndex) {
            const itemDimension = this._isAxisVertical ? this.hostElement.offsetHeight : this.hostElement.offsetWidth;
            let transformValue;

            if (this._engineState.activeItemIdx === 0 && targetIndex === this.itemCount - 1 && this.config.loopContinuously && this._engineState.currentMovementDirection !== "forward") {
                transformValue = "0px";
            } else if (this._engineState.activeItemIdx === this.itemCount - 1 && targetIndex === 0 && this.config.loopContinuously && this._engineState.currentMovementDirection !== "backward") {
                transformValue = (-1 * (this.itemCount + 1)) * itemDimension + "px";
            } else {
                transformValue = (-1 * (targetIndex + this._engineState.cloneElementOffset)) * itemDimension + "px";
            }

            this.contentArea.style.transitionDuration = `${this.config.motionSpeed}ms`;
            this.contentArea.style.transform = `translate3d(${this._isAxisVertical ? 0 : transformValue}, ${this._isAxisVertical ? transformValue : 0}, 0)`;

            const transitionEndListener = () => {
                this.contentArea.removeEventListener('transitionend', transitionEndListener);
                this._finalizeTransition(itemDimension);
            };
            this.contentArea.addEventListener('transitionend', transitionEndListener);
        }

        _animateFade(targetIndex) {
            const currentItem = this.itemElements[this._engineState.activeItemIdx];
            const nextItem = this.itemElements[targetIndex];

            smoothOpacityTransition(currentItem, 0, this.config.motionSpeed, () => {
                currentItem.style.zIndex = 1;
            });
            smoothOpacityTransition(nextItem, 1, this.config.motionSpeed, () => {
                nextItem.style.zIndex = 2;
                this._finalizeTransition();
            });
        }

        _finalizeTransition(dimension = null) {
            if (this.config.motionStyle === 'slide' && dimension !== null) {
                if (this._engineState.activeItemIdx === 0 && this._engineState.targetItemIdx === this.itemCount - 1 && this.config.loopContinuously) {
                    this.contentArea.style.transitionDuration = '0ms';
                    this.contentArea.style.transform = `translate3d(${this._isAxisVertical ? 0 : (-1 * this.itemCount * dimension)}px, ${this._isAxisVertical ? (-1 * this.itemCount * dimension) : 0}px, 0)`;
                } else if (this._engineState.activeItemIdx === this.itemCount - 1 && this._engineState.targetItemIdx === 0 && this.config.loopContinuously) {
                    this.contentArea.style.transitionDuration = '0ms';
                    this.contentArea.style.transform = `translate3d(${this._isAxisVertical ? 0 : (-1 * dimension)}px, ${this._isAxisVertical ? (-1 * dimension) : 0}px, 0)`;
                }
            }

            this._engineState.isActivelyTransitioning = false;
            this._engineState.activeItemIdx = this._engineState.targetItemIdx;
            this.config.afterItemTransition(this);
        }

        _refreshControlStates() {
            if (this.config.showDotPagers) {
                this._dotPagerNodes.forEach((pager, idx) => {
                    if (idx === this._engineState.targetItemIdx) {
                        pager.classList.add('active');
                    } else {
                        pager.classList.remove('active');
                    }
                });
            }

            if (this.config.showArrowNav && !this.config.loopContinuously) {
                this._arrowButtonNodes.prev.classList.remove('disabled');
                this._arrowButtonNodes.next.classList.remove('disabled');

                if (this._engineState.targetItemIdx === 0) {
                    this._arrowButtonNodes.prev.classList.add('disabled');
                }
                if (this._engineState.targetItemIdx === this.itemCount - 1) {
                    this._arrowButtonNodes.next.classList.add('disabled');
                }
            }
        }

        _activateAutoPlay() {
            this._deactivateAutoPlay();
            this._autoPlayTimer = setInterval(() => {
                if (!this._engineState.isActivelyTransitioning) {
                    this._initiateTransition(this._calculateTargetIndex('forward'));
                }
            }, this.config.autoPlayInterval);

            if (this.config.showToggleAutoPlayButton) {
                this._autoPlayToggleButton.classList.remove('play');
                this._autoPlayToggleButton.classList.add('pause');
                this._autoPlayToggleButton.textContent = this.config.pauseButtonLabel;
            }
        }

        _deactivateAutoPlay() {
            clearInterval(this._autoPlayTimer);
            this._autoPlayTimer = null;

            if (this.config.showToggleAutoPlayButton) {
                this._autoPlayToggleButton.classList.remove('pause');
                this._autoPlayToggleButton.classList.add('play');
                this._autoPlayToggleButton.textContent = this.config.playButtonLabel;
            }
        }

        // Public API for external control (optional, but good practice for a library)
        moveTo(index) {
            if (index >= 0 && index < this.itemCount) {
                this._initiateTransition(index);
            }
        }

        nextItem() {
            this._initiateTransition(this._calculateTargetIndex('forward'));
        }

        prevItem() {
            this._initiateTransition(this._calculateTargetIndex('backward'));
        }

        // Method to clean up the carousel instance
        destroy() {
            this._deactivateAutoPlay();
            this.hostElement.removeAttribute('data-engine-active');

            Array.from(this.contentArea.querySelectorAll('.clone-component')).forEach(clone => clone.remove());

            if (!this.config.customDotPagersSelector && this._dotPagerNodes.length > 0) {
                this._dotPagerNodes[0].closest('.engine-dot-pagers')?.remove();
            }
            if (this.config.showArrowNav) {
                this._arrowButtonNodes.prev?.closest('.engine-arrow-nav')?.remove();
            }
            if (this.config.showToggleAutoPlayButton) {
                this._autoPlayToggleButton?.closest('.engine-autoplay-toggle')?.remove();
            }

            for (const handlerName in this._eventHandlers) {
                const handler = this._eventHandlers[handlerName];
                if (handlerName.includes('dotPager')) {
                    this._dotPagerNodes.forEach(pager => pager.removeEventListener(this._engineState.interactionEventName, handler));
                } else if (handlerName.includes('arrowButton')) {
                    this._arrowButtonNodes.prev?.removeEventListener(this._engineState.interactionEventName, handler);
                    this._arrowButtonNodes.next?.removeEventListener(this._engineState.interactionEventName, handler);
                } else if (handlerName === 'keyboardNavigation') {
                    document.removeEventListener('keyup', handler);
                } else if (handlerName === 'scrollWheelNavigation') {
                    this.hostElement.removeEventListener('wheel', handler);
                } else if (handlerName === 'pointerEnter' || handlerName === 'pointerLeave') {
                    this.hostElement.removeEventListener('mouseenter', handler);
                    this.hostElement.removeEventListener('mouseleave', handler);
                } else if (handlerName === 'toggleAutoPlayClick') {
                    this._autoPlayToggleButton?.removeEventListener(this._engineState.interactionEventName, handler);
                } else if (handlerName === 'touchInitiate' || handlerName === 'touchMoveActive' || handlerName === 'touchEndGesture') {
                    this.hostElement.removeEventListener('touchstart', handler);
                    this.hostElement.removeEventListener('touchmove', handler);
                    this.hostElement.removeEventListener('touchend', handler);
                } else if (handlerName === 'windowResizeHandler') {
                    window.removeEventListener('resize', handler);
                }
            }

            this.hostElement.style.height = '';
            this.contentArea.style.width = '';
            this.contentArea.style.height = '';
            this.contentArea.style.position = '';
            this.contentArea.style.transform = '';
            this.contentArea.style.transitionDuration = '';
            this.contentArea.style.transitionProperty = '';
            this.itemElements.forEach(item => {
                item.style.display = '';
                item.style.float = '';
                item.style.width = '';
                item.style.position = '';
                item.style.top = '';
                item.style.left = '';
                item.style.opacity = '';
                item.style.zIndex = '';
            });
        }
    }

    window.initializeCarouselEngine = function (domElement, settings = {}) {
        return new PresentationEngine(domElement, settings);
    };

})();