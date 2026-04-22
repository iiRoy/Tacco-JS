(function() {

    function deepMerge(target, source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    target[key] = deepMerge(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    class DynamicContentPresenter {
        constructor(hostElement, userOptions) {
            const defaultPresentationSettings = {
                animatePauseOverlay: true,
                autoAdvance: true,
                transitionSpeedMs: 600,
                navigationControls: true,
                controlLabels: {
                    start: 'Start',
                    stop: 'Stop',
                    next: 'Next',
                    previous: 'Previous'
                },
                customCssClass: '',
                displayEffect: 'crossfade',
                pauseOnMouseOver: true,
                pageIndicators: true,
                advanceIntervalMs: 3000
            };

            this.presentationSettings = deepMerge(defaultPresentationSettings, userOptions || {});

            if (this.presentationSettings.advanceIntervalMs < (this.presentationSettings.transitionSpeedMs + 20)) {
                console.warn('DynamicContentPresenter: advanceIntervalMs should be at least 20ms longer than transitionSpeedMs for smoother transitions. Adjusting value.');
                this.presentationSettings.advanceIntervalMs = this.presentationSettings.transitionSpeedMs + 20;
            }

            this.hostElement = hostElement;
            this.contentUnits = Array.from(this.hostElement.children);
            this.hostElement.innerHTML = '';

            this.advanceTimer = null;
            this.currentContentIndex = 0;
            this.preloadedImages = [];
            this.isTransitionActive = false;
            this.isManuallyPaused = !this.presentationSettings.autoAdvance;
            this.isMouseOver = false;

            DynamicContentPresenter.instanceCounter = (DynamicContentPresenter.instanceCounter || 0) + 1;
            this.presenterIdentifier = `content-presenter-${DynamicContentPresenter.instanceCounter}`;

            this.setupPresenterStructure();
            this.cacheVisualAssets();

            if (this.contentUnits.length < 1) {
                this.presenterWrapper.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">No content elements found for this presenter.</p>';
                return;
            }

            this.displayContent(this.contentUnits[0].cloneNode(true), 'initial');

            if (this.presentationSettings.navigationControls) {
                this.createNavigationElements();
            }
            if (this.presentationSettings.pageIndicators) {
                this.createPageIndicators();
                this.updatePageIndicators();
            }

            if (this.presentationSettings.pauseOnMouseOver) {
                this.hostElement.addEventListener('mouseenter', () => {
                    this.isMouseOver = true;
                    if (this.isAdvancing()) {
                        this.stopAdvancement('hover');
                    }
                });
                this.hostElement.addEventListener('mouseleave', () => {
                    this.isMouseOver = false;
                    if (this.isAdvancing()) {
                        this.startAdvancement('hover');
                    }
                });
            }

            if (this.presentationSettings.autoAdvance && this.contentUnits.length > 1) {
                this.startAdvancement();
            }
        }

        setupPresenterStructure() {
            this.hostElement.style.position = 'relative';
            this.presenterWrapper = document.createElement('div');
            this.presenterWrapper.className = `presenter-view-area ${this.presenterIdentifier} ${this.presentationSettings.customCssClass}`;
            Object.assign(this.presenterWrapper.style, {
                position: 'relative',
                overflow: 'hidden'
            });

            this.hostElement.parentNode.insertBefore(this.presenterWrapper, this.hostElement);
            this.presenterWrapper.appendChild(this.hostElement);
        }

        cacheVisualAssets() {
            this.contentUnits.forEach(unit => {
                const images = unit.querySelectorAll('img');
                images.forEach(img => {
                    const tempImg = new Image();
                    tempImg.src = img.src;
                    this.preloadedImages.push(tempImg);
                });
            });
        }

        applyTransition(oldContentElement, newContentElement, transitionDirection) {
            this.isTransitionActive = true;

            Object.assign(newContentElement.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%'
            });

            const transitionEndHandler = (e) => {
                if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
                    e.currentTarget.removeEventListener('transitionend', transitionEndHandler);
                    if (oldContentElement && oldContentElement.parentNode) {
                        oldContentElement.parentNode.removeChild(oldContentElement);
                    }
                    Object.assign(newContentElement.style, {
                        position: '',
                        transform: '',
                        opacity: '',
                        transition: ''
                    });
                    this.isTransitionActive = false;
                }
            };

            if (this.presentationSettings.displayEffect === 'sideScroll') {
                const containerWidth = this.hostElement.offsetWidth;
                const startingOffset = transitionDirection === 'left' ? containerWidth : -containerWidth;
                const endingOffset = 0;

                newContentElement.style.transform = `translateX(${startingOffset}px)`;
                newContentElement.style.transition = `transform ${this.presentationSettings.transitionSpeedMs}ms ease-in-out`;
                this.hostElement.appendChild(newContentElement);

                newContentElement.offsetWidth;

                newContentElement.style.transform = `translateX(${endingOffset}px)`;

                if (oldContentElement) {
                    Object.assign(oldContentElement.style, {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        transform: `translateX(0)`,
                        transition: `transform ${this.presentationSettings.transitionSpeedMs}ms ease-in-out`
                    });
                    oldContentElement.offsetWidth;
                    oldContentElement.style.transform = `translateX(${transitionDirection === 'left' ? -containerWidth : containerWidth}px)`;
                    oldContentElement.addEventListener('transitionend', transitionEndHandler);
                }
                newContentElement.addEventListener('transitionend', transitionEndHandler);

            } else if (this.presentationSettings.displayEffect === 'crossfade') {
                newContentElement.style.opacity = '0';
                newContentElement.style.transition = `opacity ${this.presentationSettings.transitionSpeedMs}ms ease-in-out`;
                this.hostElement.appendChild(newContentElement);

                newContentElement.offsetWidth;

                newContentElement.style.opacity = '1';
                if (oldContentElement) {
                    oldContentElement.style.position = 'absolute';
                    oldContentElement.style.transition = `opacity ${this.presentationSettings.transitionSpeedMs}ms ease-in-out`;
                    oldContentElement.style.opacity = '0';
                    oldContentElement.addEventListener('transitionend', transitionEndHandler);
                }
                newContentElement.addEventListener('transitionend', transitionEndHandler);

            } else {
                this.hostElement.innerHTML = '';
                this.hostElement.appendChild(newContentElement);
                this.isTransitionActive = false;
            }
        }

        displayContent(newUnitNode, transitionMode = 'auto') {
            if (this.isTransitionActive) return;

            const existingUnits = Array.from(this.hostElement.children);
            const oldContentElement = existingUnits.length > 0 ? existingUnits[0] : null;

            if (transitionMode === 'initial') {
                this.hostElement.appendChild(newUnitNode);
                this.isTransitionActive = false;
                return;
            }

            const oldIndex = this.currentContentIndex;
            const newIndex = this.contentUnits.findIndex(unit => unit.isEqualNode(newUnitNode));
            
            let scrollDirection = 'left';

            if (this.presentationSettings.displayEffect === 'sideScroll') {
                if (newIndex > oldIndex || (oldIndex === this.contentUnits.length - 1 && newIndex === 0)) {
                    scrollDirection = 'left';
                } else if (newIndex < oldIndex || (oldIndex === 0 && newIndex === this.contentUnits.length - 1)) {
                    scrollDirection = 'right';
                }
            }
            
            this.applyTransition(oldContentElement, newUnitNode.cloneNode(true), scrollDirection);
            this.currentContentIndex = newIndex;
            this.updatePageIndicators();
        }

        isAdvancing() {
            return this.advanceTimer !== null && !this.isManuallyPaused;
        }

        startAdvancement(source = 'auto') {
            if (this.advanceTimer) {
                clearInterval(this.advanceTimer);
            }
            if (!this.isMouseOver || source === 'hover') {
                this.advanceTimer = setInterval(() => {
                    this.advanceToNext();
                }, this.presentationSettings.advanceIntervalMs);
                this.isManuallyPaused = false;
                this.updatePlayPauseButton(false);
            }
        }

        stopAdvancement(source = 'auto') {
            clearInterval(this.advanceTimer);
            this.advanceTimer = null;
            if (source === 'user') {
                this.isManuallyPaused = true;
            }
            this.updatePlayPauseButton(true);

            if (this.presentationSettings.animatePauseOverlay && source === 'user') {
                this.showAnimatedPauseText();
            }
        }

        advanceToNext() {
            let nextIdx = this.currentContentIndex + 1;
            if (nextIdx >= this.contentUnits.length) {
                nextIdx = 0;
            }
            this.jumpToContent(nextIdx);
        }

        retreatToPrevious() {
            let prevIdx = this.currentContentIndex - 1;
            if (prevIdx < 0) {
                prevIdx = this.contentUnits.length - 1;
            }
            this.jumpToContent(prevIdx);
        }

        jumpToContent(targetIndex) {
            if (this.isTransitionActive || targetIndex === this.currentContentIndex) return;

            this.stopAdvancement('user');
            this.displayContent(this.contentUnits[targetIndex]);
        }

        createNavigationElements() {
            const navContainer = document.createElement('div');
            navContainer.className = `presenter-navigation-set ${this.presenterIdentifier}-navigation-set`;

            const playPauseButton = document.createElement('button');
            playPauseButton.className = `presenter-action-button presenter-toggle-playback ${this.presenterIdentifier}-toggle-playback`;
            playPauseButton.textContent = this.presentationSettings.autoAdvance ? this.presentationSettings.controlLabels.stop : this.presentationSettings.controlLabels.start;
            playPauseButton.addEventListener('click', () => {
                if (this.isAdvancing()) {
                    this.stopAdvancement('user');
                } else {
                    this.startAdvancement('user');
                }
            });

            const previousButton = document.createElement('button');
            previousButton.className = `presenter-action-button presenter-move-backward ${this.presenterIdentifier}-move-backward`;
            previousButton.textContent = this.presentationSettings.controlLabels.previous;
            previousButton.addEventListener('click', () => this.retreatToPrevious());

            const nextButton = document.createElement('button');
            nextButton.className = `presenter-action-button presenter-move-forward ${this.presenterIdentifier}-move-forward`;
            nextButton.textContent = this.presentationSettings.controlLabels.next;
            nextButton.addEventListener('click', () => this.advanceToNext());

            navContainer.append(playPauseButton, previousButton, nextButton);
            this.presenterWrapper.appendChild(navContainer);

            this.playbackToggleButton = playPauseButton;
        }

        updatePlayPauseButton(isCurrentlyPaused) {
            if (this.playbackToggleButton) {
                this.playbackToggleButton.textContent = isCurrentlyPaused ? this.presentationSettings.controlLabels.start : this.presentationSettings.controlLabels.stop;
            }
        }

        createPageIndicators() {
            const indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = `presenter-page-links ${this.presenterIdentifier}-page-links`;

            this.contentUnits.forEach((unit, index) => {
                const indicatorLink = document.createElement('a');
                indicatorLink.href = '#';
                indicatorLink.className = `presenter-page-indicator-${index} ${this.presenterIdentifier}-page-indicator-${index}`;
                indicatorLink.textContent = unit.title || (index + 1);
                indicatorLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.jumpToContent(index);
                });
                indicatorsContainer.appendChild(indicatorLink);
            });
            this.presenterWrapper.appendChild(indicatorsContainer);
            this.pageLinksContainer = indicatorsContainer;
        }

        updatePageIndicators() {
            if (this.pageLinksContainer) {
                Array.from(this.pageLinksContainer.children).forEach((link, index) => {
                    if (index === this.currentContentIndex) {
                        link.classList.add('presenter-active-indicator');
                        link.classList.add(`${this.presenterIdentifier}-active-indicator`);
                    } else {
                        link.classList.remove('presenter-active-indicator');
                        link.classList.remove(`${this.presenterIdentifier}-active-indicator`);
                    }
                });
            }
        }

        showAnimatedPauseText() {
            const pauseTextOverlay = document.createElement('p');
            pauseTextOverlay.className = `presenter-pause-text-overlay ${this.presenterIdentifier}-pause-text-overlay`;
            pauseTextOverlay.textContent = this.presentationSettings.controlLabels.stop;
            Object.assign(pauseTextOverlay.style, {
                fontSize: '62%',
                textAlign: 'center',
                position: 'absolute',
                top: '40%',
                lineHeight: '100%',
                width: '100%',
                opacity: '1',
                transition: 'all 0.5s ease-out',
                pointerEvents: 'none',
                zIndex: '100'
            });
            this.presenterWrapper.appendChild(pauseTextOverlay);

            setTimeout(() => {
                Object.assign(pauseTextOverlay.style, {
                    fontSize: '600%',
                    top: '30%',
                    opacity: '0'
                });
            }, 50);

            pauseTextOverlay.addEventListener('transitionend', function handler() {
                pauseTextOverlay.removeEventListener('transitionend', handler);
                if (pauseTextOverlay.parentNode) {
                    pauseTextOverlay.parentNode.removeChild(pauseTextOverlay);
                }
            });
        }
    }

    window.initializeContentPresenter = function(selector, options) {
        const elementsToConvert = document.querySelectorAll(selector);
        elementsToConvert.forEach(el => {
            new DynamicContentPresenter(el, options);
        });
    };

})();