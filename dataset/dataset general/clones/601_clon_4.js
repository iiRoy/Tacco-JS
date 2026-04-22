// Helper to manage element creation and attribute setting
function constructElement(tagName, classList = '', attributes = {}) {
    const freshElement = document.createElement(tagName);
    if (classList) {
        freshElement.className = classList;
    }
    for (const key in attributes) {
        freshElement.setAttribute(key, attributes[key]);
    }
    return freshElement;
}

class CarouselWidget {
    constructor(baseElementSelector, initialOptions) {
        this.baseElement = document.querySelector(baseElementSelector);
        if (!this.baseElement) {
            console.error("Carousel root element not found:", baseElementSelector);
            return;
        }

        const defaultSettings = {
            // General structure and styling
            mainContainerClass: 'main-container',
            contentDisplayAreaClass: 'content-display-area',
            contentViewportClass: 'content-viewport',
            listElementClass: 'slides-list', // Class for the original <ul>/whatever
            slideItemSelector: 'li', // Selector for individual slide items within the listElement
            activeSlideClass: 'active-slide',
            aspectRatioSpacerClass: 'aspect-spacer',
            initialLoadClass: 'loading-carousel',

            // Core functionality options
            flexibleHeight: true, // Height adapts to current slide content
            startingIndex: 1, // 1-based index, or 'random'
            allowLooping: true, // First -> last & last -> first
            activateSingleSlide: true, // Initialize even with one slide
            responsiveEnabled: true, // Placeholder for future responsive logic
            resourcePreloadStrategy: 'visibleOnly', // 'visibleOnly', 'allContent'

            // Caption display
            captionSource: 'imageAlt', // 'imageAlt', 'slideTitle' (from slide item title attribute)
            captionContainerPlacement: 'overlay', // 'overlay', 'below', 'custom', false
            captionContainerSelector: '.item-caption', // Selector for captions wrapper

            // Navigation dots (pager)
            showNavigationDots: true,
            navigationDotsClass: 'navigation-dots',
            activeDotClass: 'active-dot',

            // Directional buttons (controls)
            showDirectionalButtons: true,
            directionalButtonsClass: 'direction-buttons',
            previousButtonClass: 'prev-button',
            previousButtonText: 'Previous',
            nextButtonClass: 'next-button',
            nextButtonText: 'Next',
            hideButtonsAtEnds: true,

            // Animation
            animationStyle: 'fading', // 'fading', 'gliding-horizontal', 'gliding-vertical', false
            enableKenBurns: false, // New option for Ken Burns effect
            kenBurnsZoomFactor: 1.2, // Max zoom for ken burns (e.g., 1.2 for 120%)
            itemSpacingPercentage: 0, // Spacing between slides (in %) for gliding
            animatingClass: 'is-animating', // Class added during transition
            animationDurationMs: 800, // Time the transition takes (ms)
            animationTimingFunction: 'ease-in-out', // Easing for Web Animations API
            seamlessGlidingLoop: true, // Seamless first/last transition, only with gliding

            // Autoplay (auto advance)
            autoAdvance: true,
            advanceDirection: 'next',
            pauseOnHover: true,
            hoverPauseDelayMs: 100,
            initialAdvanceDelayMs: 500,
            advanceIntervalMs: 4000,

            // Callbacks
            onCarouselReady: () => {},
            beforeItemTransition: () => {},
            afterItemTransition: () => {}
        };

        this.config = { ...defaultSettings, ...initialOptions };

        // Internal state management
        this._internalState = {
            slideElements: [], // All slide elements including clones
            originalSlideCount: 0, // Number of original slides
            currentActiveRawIndex: 0, // Index in slideElements array (includes clones)
            transitionInProgress: false,
            autoAdvanceIntervalId: null,
            initialAdvanceTimeoutId: null,
            isHovering: false,
            isInitialLoadComplete: false,
            currentWebAnimation: null // Stores the active Web Animation API instance
        };

        this._buildComponentStructure();
        this._initializeSlideItems();
        this._prepareForDisplay();
    }

    _buildComponentStructure() {
        this.baseElement.classList.add(this.config.listElementClass);

        // Main wrapper
        this.mainContainer = constructElement('div', `${this.config.mainContainerClass} ${this.config.initialLoadClass}`);
        this.baseElement.parentNode.insertBefore(this.mainContainer, this.baseElement);

        // Content display area
        this.contentDisplayArea = constructElement('div', this.config.contentDisplayAreaClass);
        this.mainContainer.appendChild(this.contentDisplayArea);

        // Content viewport (for clipping slides)
        this.contentViewport = constructElement('div', this.config.contentViewportClass);
        this.contentDisplayArea.appendChild(this.contentViewport);

        // Move the original list element into the viewport
        this.contentViewport.appendChild(this.baseElement);

        // Aspect ratio spacer
        this.aspectRatioSpacer = constructElement('div', this.config.aspectRatioSpacerClass);
        this.contentViewport.insertBefore(this.aspectRatioSpacer, this.baseElement);

        // Caption element
        if (this.config.captionContainerPlacement !== 'custom' && this.config.captionContainerPlacement !== false) {
            this.captionElement = constructElement('div', this.config.captionContainerSelector.substring(1)); // Remove '.'
            if (this.config.captionContainerPlacement === 'below') {
                this.mainContainer.appendChild(this.captionElement);
            } else { // 'overlay'
                this.contentDisplayArea.appendChild(this.captionElement);
            }
            this.captionElement.style.display = 'none';
        } else if (this.config.captionContainerPlacement === 'custom') {
            this.captionElement = document.querySelector(this.config.captionContainerSelector);
        }

        // Navigation dots
        if (this.config.showNavigationDots) {
            this.navigationDotsList = constructElement('ol', this.config.navigationDotsClass);
            this.mainContainer.appendChild(this.navigationDotsList);
        }

        // Directional buttons
        if (this.config.showDirectionalButtons) {
            this.directionalButtonsWrapper = constructElement('div', this.config.directionalButtonsClass);
            this.contentDisplayArea.appendChild(this.directionalButtonsWrapper);

            this.previousButton = constructElement('button', this.config.previousButtonClass, { type: 'button' });
            this.previousButton.textContent = this.config.previousButtonText;
            this.directionalButtonsWrapper.appendChild(this.previousButton);

            this.nextButton = constructElement('button', this.config.nextButtonClass, { type: 'button' });
            this.nextButton.textContent = this.config.nextButtonText;
            this.directionalButtonsWrapper.appendChild(this.nextButton);
        }
    }

    _initializeSlideItems() {
        const originalItems = Array.from(this.baseElement.querySelectorAll(this.config.slideItemSelector));
        this._internalState.originalSlideCount = originalItems.length;

        if (this._internalState.originalSlideCount === 0) {
            console.warn("No slide items found for carousel.");
            return;
        }

        if (this._internalState.originalSlideCount === 1 && !this.config.activateSingleSlide) {
            this.mainContainer.classList.add('single-item-mode');
            this.mainContainer.classList.remove(this.config.initialLoadClass);
            return;
        }

        let initialLogicalIndex = 0;
        if (this.config.startingIndex === 'random') {
            initialLogicalIndex = Math.floor(Math.random() * this._internalState.originalSlideCount);
        } else if (typeof this.config.startingIndex === 'number') {
            initialLogicalIndex = Math.max(0, Math.min(this.config.startingIndex - 1, this._internalState.originalSlideCount - 1));
        }

        // If seamless gliding loop, duplicate items
        if (this.config.allowLooping && this.config.seamlessGlidingLoop && this.config.animationStyle.startsWith('gliding')) {
            const firstClone = originalItems[0].cloneNode(true);
            firstClone.classList.add('clone-item', 'clone-after');
            const lastClone = originalItems[originalItems.length - 1].cloneNode(true);
            lastClone.classList.add('clone-item', 'clone-before');

            this.baseElement.insertBefore(lastClone, originalItems[0]);
            this.baseElement.appendChild(firstClone);

            this._internalState.slideElements = Array.from(this.baseElement.querySelectorAll(this.config.slideItemSelector));
            this._internalState.currentActiveRawIndex = initialLogicalIndex + 1; // Adjust for the 'clone-before'
        } else {
            this._internalState.slideElements = originalItems;
            this._internalState.currentActiveRawIndex = initialLogicalIndex;
        }

        this._internalState.slideElements[this._internalState.currentActiveRawIndex].classList.add(this.config.activeSlideClass);

        // Setup navigation dots
        if (this.config.showNavigationDots) {
            originalItems.forEach((_, idx) => {
                const dot = constructElement('li', '', { 'data-logical-index': idx });
                dot.addEventListener('click', () => this.goToSlide(idx));
                this.navigationDotsList.appendChild(dot);
            });
        }

        // Setup directional button listeners
        if (this.config.showDirectionalButtons) {
            this.previousButton.addEventListener('click', () => this.goToSlide('previous'));
            this.nextButton.addEventListener('click', () => this.goToSlide('next'));
        }

        // Setup auto advance hover pause
        if (this.config.autoAdvance && this.config.pauseOnHover) {
            this.contentDisplayArea.addEventListener('mouseenter', () => {
                this._internalState.isHovering = true;
                this._stopAutoAdvance();
            });
            this.contentDisplayArea.addEventListener('mouseleave', () => {
                this._internalState.isHovering = false;
                if (!this._internalState.transitionInProgress) {
                    this._startAutoAdvance();
                }
            });
        }
    }

    _prepareForDisplay() {
        // Preload strategy
        if (this.config.resourcePreloadStrategy === 'allContent') {
            const images = this.baseElement.querySelectorAll('img');
            let loadedCount = 0;
            const totalImages = images.length;
            if (totalImages === 0) {
                this._completeInitialLoad();
                return;
            }
            images.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === totalImages) this._completeInitialLoad();
                    }, { once: true });
                    img.addEventListener('error', () => { // Still count error as loaded for progress
                        loadedCount++;
                        if (loadedCount === totalImages) this._completeInitialLoad();
                    }, { once: true });
                }
            });
            if (loadedCount === totalImages) this._completeInitialLoad();
        } else { // 'visibleOnly' or other, just complete loading
            this._completeInitialLoad();
        }
    }

    _completeInitialLoad() {
        this.mainContainer.classList.remove(this.config.initialLoadClass);
        this._internalState.isInitialLoadComplete = true;
        this._updateVisualComponents();
        if (this.config.autoAdvance) {
            this._startAutoAdvance();
        }
        this.config.onCarouselReady.call(this.baseElement, this._getLogicalIndex(this._internalState.currentActiveRawIndex));
    }

    _adjustAspectRatioSpacer(width, height) {
        if (!this.aspectRatioSpacer) return;
        const ratio = width / height;
        const paddingTop = (1 / ratio * 100) + '%';
        this.aspectRatioSpacer.style.paddingTop = paddingTop;
        this.aspectRatioSpacer.classList.add('is-ready'); // Indicate spacer is set
    }

    _updateVisualComponents() {
        const currentLogicalIndex = this._getLogicalIndex(this._internalState.currentActiveRawIndex);

        // Update pager dots
        if (this.config.showNavigationDots && this.navigationDotsList) {
            Array.from(this.navigationDotsList.children).forEach(dot => {
                const dotIndex = parseInt(dot.dataset.logicalIndex, 10);
                if (dotIndex === currentLogicalIndex) {
                    dot.classList.add(this.config.activeDotClass);
                } else {
                    dot.classList.remove(this.config.activeDotClass);
                }
            });
        }

        // Update directional buttons visibility
        if (this.config.showDirectionalButtons && this.config.hideButtonsAtEnds && !this.config.allowLooping) {
            this.previousButton.style.display = (currentLogicalIndex === 0) ? 'none' : '';
            this.nextButton.style.display = (currentLogicalIndex === this._internalState.originalSlideCount - 1) ? 'none' : '';
        }

        // Update caption
        this._refreshCaptionDisplay();

        // Update flexible height
        if (this.config.flexibleHeight) {
            const activeSlide = this._internalState.slideElements[this._internalState.currentActiveRawIndex];
            if (activeSlide) {
                const img = activeSlide.querySelector('img');
                if (img && !img.complete) {
                    const imgLoader = new Image();
                    imgLoader.onload = () => this._adjustAspectRatioSpacer(activeSlide.offsetWidth, activeSlide.offsetHeight);
                    imgLoader.onerror = () => this._adjustAspectRatioSpacer(activeSlide.offsetWidth, activeSlide.offsetHeight);
                    imgLoader.src = img.src;
                } else {
                    this._adjustAspectRatioSpacer(activeSlide.offsetWidth, activeSlide.offsetHeight);
                }
            }
        }

        // Handle Ken Burns effect for the active slide
        if (this.config.enableKenBurns) {
            const currentActiveSlide = this._internalState.slideElements[this._internalState.currentActiveRawIndex];
            this._startKenBurnsAnimation(currentActiveSlide);
        }
    }

    _refreshCaptionDisplay() {
        if (!this.captionElement || this.config.captionContainerPlacement === false) return;

        let captionContent = '';
        const activeSlide = this._internalState.slideElements[this._internalState.currentActiveRawIndex];

        if (this.config.captionSource === 'slideTitle') {
            captionContent = activeSlide.getAttribute('title') || '';
        } else { // 'imageAlt'
            const img = activeSlide.querySelector('img');
            if (img) {
                captionContent = img.getAttribute('title') || img.getAttribute('alt') || '';
            }
        }

        if (captionContent) {
            this.captionElement.textContent = captionContent;
            this.captionElement.style.display = '';
        } else {
            this.captionElement.style.display = 'none';
        }
    }

    _startAutoAdvance() {
        if (this._internalState.autoAdvanceIntervalId || !this.config.autoAdvance) return;

        this._internalState.initialAdvanceTimeoutId = setTimeout(() => {
            this._internalState.autoAdvanceIntervalId = setInterval(() => {
                this.goToSlide(this.config.advanceDirection, 'auto');
            }, this.config.advanceIntervalMs);
        }, this.config.initialAdvanceDelayMs);
    }

    _stopAutoAdvance() {
        clearInterval(this._internalState.autoAdvanceIntervalId);
        clearTimeout(this._internalState.initialAdvanceTimeoutId);
        this._internalState.autoAdvanceIntervalId = null;
        this._internalState.initialAdvanceTimeoutId = null;
    }

    // Maps raw index (including clones) to logical index (0 to originalSlideCount-1)
    _getLogicalIndex(rawIndex) {
        if (!this.config.allowLooping || !this.config.seamlessGlidingLoop || !this.config.animationStyle.startsWith('gliding')) {
            return rawIndex;
        }
        let logicalIndex = rawIndex - 1;
        if (logicalIndex < 0) logicalIndex = this._internalState.originalSlideCount - 1;
        if (logicalIndex >= this._internalState.originalSlideCount) logicalIndex = 0;
        return logicalIndex;
    }

    // Maps logical index to raw index (including clones)
    _getRawIndex(logicalIndex) {
        if (!this.config.allowLooping || !this.config.seamlessGlidingLoop || !this.config.animationStyle.startsWith('gliding')) {
            return logicalIndex;
        }
        return logicalIndex + 1; // +1 because of the 'clone-before'
    }

    goToSlide(target, trigger = 'user') {
        if (this._internalState.transitionInProgress || this._internalState.originalSlideCount === 0 || (this._internalState.originalSlideCount === 1 && !this.config.activateSingleSlide)) return;

        const previousRawIndex = this._internalState.currentActiveRawIndex;
        let nextLogicalIndex = this._getLogicalIndex(previousRawIndex);

        if (target === 'previous') {
            nextLogicalIndex = (nextLogicalIndex === 0) ? (this._internalState.originalSlideCount - 1) : (nextLogicalIndex - 1);
            if (!this.config.allowLooping && nextLogicalIndex === this._internalState.originalSlideCount - 1 && previousRawIndex === this._getRawIndex(0)) return; // Prevent going back from first without loop
        } else if (target === 'next') {
            nextLogicalIndex = (nextLogicalIndex === this._internalState.originalSlideCount - 1) ? 0 : (nextLogicalIndex + 1);
            if (!this.config.allowLooping && nextLogicalIndex === 0 && previousRawIndex === this._getRawIndex(this._internalState.originalSlideCount - 1)) return; // Prevent going forward from last without loop
        } else if (typeof target === 'number') {
            nextLogicalIndex = Math.max(0, Math.min(target, this._internalState.originalSlideCount - 1));
        }

        const nextRawIndex = this._getRawIndex(nextLogicalIndex);

        if (nextRawIndex === previousRawIndex) return;

        this._internalState.transitionInProgress = true;
        this._stopAutoAdvance();
        this.mainContainer.classList.add(this.config.animatingClass);

        const previousSlide = this._internalState.slideElements[previousRawIndex];
        const nextSlide = this._internalState.slideElements[nextRawIndex];

        this.config.beforeItemTransition.call(this.baseElement, nextSlide, this._getLogicalIndex(previousRawIndex), nextLogicalIndex);

        let transitionAnimation = null;
        switch (this.config.animationStyle) {
            case 'fading':
                transitionAnimation = this._animateFading(previousSlide, nextSlide);
                break;
            case 'gliding-horizontal':
            case 'gliding-vertical':
                transitionAnimation = this._animateGliding(previousSlide, nextSlide, previousRawIndex, nextRawIndex);
                break;
            case false: // No animation
                this._activateSlide(nextSlide);
                this._deactivateSlide(previousSlide);
                this._finalizeTransition(previousSlide, nextSlide);
                return;
            default:
                console.warn(`Unknown animation style: ${this.config.animationStyle}. Falling back to instant change.`);
                this._activateSlide(nextSlide);
                this._deactivateSlide(previousSlide);
                this._finalizeTransition(previousSlide, nextSlide);
                return;
        }

        if (transitionAnimation) {
            this._internalState.currentWebAnimation = transitionAnimation;
            transitionAnimation.onfinish = () => this._finalizeTransition(previousSlide, nextSlide);
            transitionAnimation.oncancel = () => this._finalizeTransition(previousSlide, nextSlide);
        } else {
            // Fallback if Web Animations API not available or animation not configured
            this._activateSlide(nextSlide);
            this._deactivateSlide(previousSlide);
            this._finalizeTransition(previousSlide, nextSlide);
        }
    }

    _activateSlide(slide) {
        slide.classList.add(this.config.activeSlideClass);
        slide.style.opacity = ''; // Reset if previously faded
        slide.style.transform = ''; // Reset if previously glided
    }

    _deactivateSlide(slide) {
        slide.classList.remove(this.config.activeSlideClass);
        slide.style.opacity = ''; // Reset if previously faded
        slide.style.transform = ''; // Reset if previously glided
    }

    _animateFading(oldSlide, newSlide) {
        oldSlide.style.zIndex = 1;
        newSlide.style.zIndex = 2;
        this._activateSlide(newSlide); // Make new slide visible for animation

        const fadeOutAnimation = oldSlide.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: this.config.animationDurationMs,
            easing: this.config.animationTimingFunction,
            fill: 'forwards'
        });
        return fadeOutAnimation; // We only need to wait for the old slide to fade out
    }

    _animateGliding(oldSlide, newSlide, oldRawIdx, newRawIdx) {
        const isHorizontal = this.config.animationStyle === 'gliding-horizontal';
        const transformAxis = isHorizontal ? 'X' : 'Y';
        const slideFullDimensionPercentage = (100 + this.config.itemSpacingPercentage);

        const initialOffset = -oldRawIdx * slideFullDimensionPercentage;
        const targetOffset = -newRawIdx * slideFullDimensionPercentage;

        // Ensure the baseElement (content list) starts at its calculated position
        this.baseElement.style.transform = `translate${transformAxis}(${initialOffset}%)`;

        const glidingAnimation = this.baseElement.animate([
            { transform: `translate${transformAxis}(${initialOffset}%)` },
            { transform: `translate${transformAxis}(${targetOffset}%)` }
        ], {
            duration: this.config.animationDurationMs,
            easing: this.config.animationTimingFunction,
            fill: 'forwards'
        });

        this._activateSlide(newSlide);
        this._deactivateSlide(oldSlide);

        return glidingAnimation;
    }

    _finalizeTransition(oldSlide, newSlide) {
        if (this._internalState.currentWebAnimation) {
            this._internalState.currentWebAnimation.cancel();
            this._internalState.currentWebAnimation = null;
        }

        this._deactivateSlide(oldSlide);
        this._activateSlide(newSlide);

        // Reset styles that might have been set during animation
        oldSlide.style.zIndex = '';
        newSlide.style.zIndex = '';
        this.baseElement.style.transform = ''; // Reset transform on the content list

        // Handle seamless loop instant jump
        if (this.config.allowLooping && this.config.seamlessGlidingLoop && this.config.animationStyle.startsWith('gliding')) {
            const currentRawIndex = this._internalState.slideElements.indexOf(newSlide);
            const slideFullDimensionPercentage = (100 + this.config.itemSpacingPercentage);
            const transformAxis = this.config.animationStyle === 'gliding-horizontal' ? 'X' : 'Y';

            let snapRequired = false;
            let snapTargetOffset = 0;

            if (currentRawIndex === 0) { // If currently on the 'clone-before' (last item clone)
                snapRequired = true;
                snapTargetOffset = -(this._internalState.originalSlideCount) * slideFullDimensionPercentage; // To show the actual last item
            } else if (currentRawIndex === this._internalState.slideElements.length - 1) { // If currently on the 'clone-after' (first item clone)
                snapRequired = true;
                snapTargetOffset = -slideFullDimensionPercentage; // To show the actual first item
            }

            if (snapRequired) {
                this.baseElement.style.transition = 'none'; // Disable transition for snap
                this.baseElement.style.transform = `translate${transformAxis}(${snapTargetOffset}%)`;
                this.baseElement.offsetWidth; // Force reflow for instant style application
                this.baseElement.style.transition = ''; // Re-enable transition
            }
        }

        this._internalState.currentActiveRawIndex = this._internalState.slideElements.indexOf(newSlide);
        this._internalState.transitionInProgress = false;
        this.mainContainer.classList.remove(this.config.animatingClass);

        this._updateVisualComponents(); // Refresh visual elements

        this.config.afterItemTransition.call(this.baseElement, newSlide, this._getLogicalIndex(oldSlide), this._getLogicalIndex(newSlide));

        if (this.config.autoAdvance && !this._internalState.isHovering) {
            this._startAutoAdvance();
        }
    }

    _startKenBurnsAnimation(slideItem) {
        if (!slideItem || !slideItem.animate) return;

        // Stop any existing Ken Burns animation on this slide
        this._stopKenBurnsAnimation(slideItem);

        const kenBurnsDuration = this.config.advanceIntervalMs + this.config.animationDurationMs * 2;
        const zoomFactor = this.config.kenBurnsZoomFactor;
        const translateFactor = (1 - zoomFactor) * 50; // Adjust translate to keep center if scaled from center

        let startTransform, endTransform;
        const logicalIndex = this._getLogicalIndex(this._internalState.slideElements.indexOf(slideItem));

        // Alternating start/end positions based on logical index
        if (logicalIndex % 2 === 0) {
            startTransform = `scale(${zoomFactor}) translate(${translateFactor}%, ${translateFactor}%)`;
            endTransform = `scale(1) translate(0%, 0%)`;
        } else {
            startTransform = `scale(1) translate(0%, 0%)`;
            endTransform = `scale(${zoomFactor}) translate(${translateFactor}%, ${translateFactor}%)`;
        }

        const kenBurnsAnim = slideItem.animate([
            { transform: startTransform },
            { transform: endTransform }
        ], {
            duration: kenBurnsDuration,
            easing: this.config.animationTimingFunction,
            fill: 'forwards'
        });
        slideItem._activeKenBurnsAnimation = kenBurnsAnim; // Store reference
    }

    _stopKenBurnsAnimation(slideItem) {
        if (slideItem && slideItem._activeKenBurnsAnimation) {
            slideItem._activeKenBurnsAnimation.cancel();
            slideItem._activeKenBurnsAnimation = null;
            slideItem.style.transform = ''; // Reset transform
        }
    }
}

// Global initialization function to mimic a plugin pattern
function generateCarousel(selector, options) {
    return new CarouselWidget(selector, options);
}