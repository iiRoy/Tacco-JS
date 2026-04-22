class ContentViewer {
    static standardOptions = {
        useGraphicsStyles: true,
        useVectorGraphics: true,
        initialContentIndex: 0,
        hideControlButtonsOnSmallScreens: false,
        controlBarHideDelay: 3000,
        videoMaximumWidth: 1140,
        vimeoHighlightColor: 'cccccc',
        beforeDisplayCallback: null,
        afterDisplayCallback: null,
        afterClosureCallback: null,
        wrapAroundContent: false,
        autostartVideoPlayback: false
    };

    constructor(initialSource, userOptions) {
        this.currentSettings = Object.assign({}, ContentViewer.standardOptions, userOptions);
        this.mediaCollection = [];
        this.activationSource = initialSource;
        this.boundElements = null;
        this.activationQuery = null;

        this.mobileDeviceDetected = /(iPad|iPhone|iPod|Android|PlayBook|BB10|BlackBerry|Opera Mini|IEMobile|webOS|MeeGo)/i.test(navigator.userAgent);
        this.touchEnabled = this.mobileDeviceDetected || 'ontouchstart' in window || (navigator.maxTouchPoints > 0);
        this.svgSupported = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

        this.viewPortWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.currentTransformOffset = 0;

        this.overlayElement = null;
        this.sliderContainer = null;
        this.topControlPanel = null;
        this.bottomControlPanel = null;
        this.titleDisplay = null;
        this.previousButton = null;
        this.nextButton = null;
        this.closeButton = null;

        this.controlPanelTimer = null;
        this.isCurrentlyOpen = false;
        this.triggeredElement = null; // Storing the element that initiated the viewer

        this.boundHandleActivationClick = this.handleActivationClick.bind(this);
        this.boundUpdateDimensions = this.updateDimensions.bind(this);
        this.boundHandleKeyboardInput = this.handleKeyboardInput.bind(this);

        this.initializeViewer();
    }

    static closeActiveViewer() {
        if (ContentViewer.instance) {
            ContentViewer.instance.closeContent();
        }
    }

    static retrieveInstance() {
        return ContentViewer.instance;
    }

    initializeViewer() {
        if (Array.isArray(this.activationSource)) {
            this.mediaCollection = this.activationSource;
            this.prepareDisplay(this.currentSettings.initialContentIndex);
        } else {
            this.activationQuery = this.activationSource;
            document.addEventListener('click', this.boundHandleActivationClick);
        }
        ContentViewer.instance = this;
    }

    handleActivationClick(evt) {
        const clickedElement = evt.target.closest(this.activationQuery);

        if (!clickedElement || (clickedElement.parentNode && clickedElement.parentNode.classList.contains('active-item'))) {
            return;
        }

        if (this.isCurrentlyOpen) {
            this.destroyViewer();
        }

        this.boundElements = document.querySelectorAll(this.activationQuery);

        this.mediaCollection = [];
        let groupIdentifier = clickedElement.getAttribute('data-gallery-group') || clickedElement.getAttribute('rel');
        let effectiveElements;

        if (groupIdentifier && groupIdentifier !== '' && groupIdentifier !== 'nofollow') {
            effectiveElements = Array.from(this.boundElements).filter(el =>
                (el.getAttribute('data-gallery-group') === groupIdentifier || el.getAttribute('rel') === groupIdentifier)
            );
        } else {
            effectiveElements = Array.from(this.boundElements);
        }

        effectiveElements.forEach(el => {
            const mediaTitle = el.dataset.caption || el.getAttribute('title');
            const mediaSource = el.getAttribute('href');
            this.mediaCollection.push({
                source: mediaSource,
                caption: mediaTitle
            });
        });

        const initialIndex = effectiveElements.indexOf(clickedElement);
        evt.preventDefault();
        evt.stopPropagation();
        this.triggeredElement = clickedElement;
        this.prepareDisplay(initialIndex);
    }

    prepareDisplay(startIndex) {
        if (this.currentSettings.beforeDisplayCallback) {
            this.currentSettings.beforeDisplayCallback();
        }
        this.triggeredElement && this.triggeredElement.dispatchEvent(new CustomEvent('viewer-start'));
        this.isCurrentlyOpen = true;
        this.constructDOM();
        this.showContent(startIndex);
        // Preloading content logic would go here
        // this.preloadSpecificContent(startIndex + 1);
        // this.preloadSpecificContent(startIndex - 1);
        if (this.currentSettings.afterDisplayCallback) {
            this.currentSettings.afterDisplayCallback();
        }
    }

    constructDOM() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'visual-overlay';
        document.body.appendChild(this.overlayElement);

        let mainContainer = document.createElement('div');
        mainContainer.id = 'visual-container';
        this.overlayElement.appendChild(mainContainer);

        this.sliderContainer = document.createElement('div');
        this.sliderContainer.id = 'visual-carousel';
        mainContainer.appendChild(this.sliderContainer);

        this.topControlPanel = document.createElement('div');
        this.topControlPanel.id = 'visual-top-panel';
        mainContainer.appendChild(this.topControlPanel);

        this.titleDisplay = document.createElement('div');
        this.titleDisplay.id = 'visual-caption';
        this.topControlPanel.appendChild(this.titleDisplay);

        this.bottomControlPanel = document.createElement('div');
        this.bottomControlPanel.id = 'visual-bottom-panel';
        mainContainer.appendChild(this.bottomControlPanel);

        let navigationControls = document.createElement('div');
        navigationControls.id = 'visual-navigation';
        this.bottomControlPanel.appendChild(navigationControls);

        this.previousButton = document.createElement('a');
        this.previousButton.id = 'visual-previous';
        navigationControls.appendChild(this.previousButton);

        this.nextButton = document.createElement('a');
        this.nextButton.id = 'visual-next';
        navigationControls.appendChild(this.nextButton);

        this.closeButton = document.createElement('a');
        this.closeButton.id = 'visual-shut';
        mainContainer.appendChild(this.closeButton);

        if (this.svgSupported && this.currentSettings.useVectorGraphics) {
            this.overlayElement.classList.add('svg-enabled');
        }

        if (this.mobileDeviceDetected) {
            this.topControlPanel.style.display = 'none';
            this.bottomControlPanel.style.display = 'none';
        }

        this.mediaCollection.forEach(() => {
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('content-slide');
            this.sliderContainer.appendChild(slideDiv);
        });

        this.updateDimensions();
        this.attachInteractions();
        if (this.touchEnabled) {
            this.setupGestures();
        }
        this.setupKeyboardNavigation();
        this.manageControlPanelVisibility();
        this.setupResizeListener();
        document.body.classList.add('viewer-active');
    }

    updateDimensions() {
        this.viewPortWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        if (this.overlayElement) {
            this.overlayElement.style.width = `${this.viewPortWidth}px`;
            this.overlayElement.style.height = `${this.viewPortHeight}px`;
        }
    }

    setupResizeListener() {
        window.addEventListener('resize', this.boundUpdateDimensions);
    }

    checkTransitionSupport() {
        const testDiv = document.createElement('div');
        const prefixes = ['transition', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
        for (let i = 0; i < prefixes.length; i++) {
            if (testDiv.style[prefixes[i]] !== undefined) {
                return prefixes[i];
            }
        }
        return false;
    }

    useCSSTransitions() {
        if (this.currentSettings.useGraphicsStyles && this.checkTransitionSupport()) {
            return true;
        }
        return false;
    }

    setupGestures() {
        const MIN_HORIZONTAL_SWIPE = 10;
        const MIN_VERTICAL_SWIPE = 50;

        let startX, startY, currentX, currentY;
        let lastHorizontalDistance = 0;
        let lastVerticalDistance = 0;
        let isVerticalSwipe = false;
        let isHorizontalSwipe = false;
        let isTouching = false; // To track if a touch sequence is active

        const gestureStart = (evt) => {
            if (evt.touches.length > 1) return;
            isTouching = true;
            evt.preventDefault();
            evt.stopPropagation();

            this.sliderContainer.style.transition = '';
            this.overlayElement.classList.add('touch-active');

            startX = evt.touches[0].pageX;
            startY = evt.touches[0].pageY;
            currentX = startX; // Initialize currentX/Y for immediate use in gestureMove
            currentY = startY;

            lastHorizontalDistance = 0;
            lastVerticalDistance = 0;
            isVerticalSwipe = false;
            isHorizontalSwipe = false;

            this.sliderContainer.style.transform = `translate3d(${this.currentTransformOffset}%, 0, 0)`;
        };

        const gestureMove = (evt) => {
            if (!isTouching || evt.touches.length > 1) return;
            evt.preventDefault();
            evt.stopPropagation();

            currentX = evt.touches[0].pageX;
            currentY = evt.touches[0].pageY;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const horizontalDistancePercent = (deltaX * 100) / this.viewPortWidth;

            if (!isHorizontalSwipe && !isVerticalSwipe) {
                if (Math.abs(deltaY) >= MIN_VERTICAL_SWIPE) {
                    isVerticalSwipe = true;
                    this.sliderContainer.style.transition = '';
                } else if (Math.abs(deltaX) >= MIN_HORIZONTAL_SWIPE) {
                    isHorizontalSwipe = true;
                    this.sliderContainer.style.transition = '';
                }
            }

            if (isVerticalSwipe) {
                const opacity = 0.75 - Math.abs(deltaY) / this.sliderContainer.offsetHeight;
                this.sliderContainer.style.top = `${deltaY}px`;
                this.sliderContainer.style.opacity = Math.max(0, opacity).toString();
            } else if (isHorizontalSwipe) {
                const currentIndex = Array.from(this.sliderContainer.children).findIndex(el => el.classList.contains('active-item'));
                if (deltaX > 0) {
                    if (currentIndex === 0) {
                        this.overlayElement.classList.add('left-spring-effect');
                    } else {
                        this.overlayElement.classList.remove('left-spring-effect', 'right-spring-effect');
                        this.sliderContainer.style.transform = `translate3d(${this.currentTransformOffset + horizontalDistancePercent}%, 0, 0)`;
                    }
                } else {
                    if (currentIndex === this.mediaCollection.length - 1) {
                        this.overlayElement.classList.add('right-spring-effect');
                    } else {
                        this.overlayElement.classList.remove('left-spring-effect', 'right-spring-effect');
                        this.sliderContainer.style.transform = `translate3d(${this.currentTransformOffset + horizontalDistancePercent}%, 0, 0)`;
                    }
                }
            }

            lastHorizontalDistance = deltaX;
            lastVerticalDistance = deltaY;
        };

        const gestureEnd = (evt) => {
            if (!isTouching) return;
            isTouching = false;
            evt.preventDefault();
            evt.stopPropagation();

            this.sliderContainer.style.transition = 'transform 0.4s ease, top 0.4s ease, opacity 0.4s ease';

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            if (isVerticalSwipe) {
                if (Math.abs(deltaY) >= 2 * MIN_VERTICAL_SWIPE && Math.abs(deltaY) > Math.abs(lastVerticalDistance)) {
                    const targetTop = deltaY > 0 ? this.sliderContainer.offsetHeight : -this.sliderContainer.offsetHeight;
                    this.sliderContainer.style.top = `${targetTop}px`;
                    this.sliderContainer.style.opacity = '0';
                    setTimeout(() => this.closeContent(), 300);
                } else {
                    this.sliderContainer.style.top = '0px';
                    this.sliderContainer.style.opacity = '1';
                }
            } else if (isHorizontalSwipe) {
                if (deltaX >= MIN_HORIZONTAL_SWIPE && deltaX >= lastHorizontalDistance) {
                    this.showPreviousContent();
                } else if (deltaX <= -MIN_HORIZONTAL_SWIPE && deltaX <= lastHorizontalDistance) {
                    this.showNextContent();
                }
            } else {
                if (!this.topControlPanel.classList.contains('visible-controls')) {
                    this.showControlPanels();
                    this.resetControlPanelTimer();
                } else {
                    this.clearControlPanelTimer();
                    this.hideControlPanels();
                }
            }

            this.sliderContainer.style.transform = `translate3d(${this.currentTransformOffset}%, 0, 0)`;
            this.overlayElement.classList.remove('left-spring-effect', 'right-spring-effect', 'touch-active');
            this.sliderContainer.style.top = '0';
            this.sliderContainer.style.opacity = '1';
        };

        this.overlayElement.addEventListener('touchstart', gestureStart);
        this.overlayElement.addEventListener('touchmove', gestureMove);
        this.overlayElement.addEventListener('touchend', gestureEnd);
        this.overlayElement.addEventListener('touchcancel', gestureEnd);
    }

    resetControlPanelTimer() {
        if (this.currentSettings.controlBarHideDelay > 0) {
            this.clearControlPanelTimer();
            this.controlPanelTimer = window.setTimeout(() => {
                this.hideControlPanels();
            }, this.currentSettings.controlBarHideDelay);
        }
    }

    clearControlPanelTimer() {
        window.clearTimeout(this.controlPanelTimer);
        this.controlPanelTimer = null;
    }

    showControlPanels() {
        const panels = [this.topControlPanel, this.bottomControlPanel];
        if (this.useCSSTransitions()) {
            panels.forEach(panel => panel.classList.add('visible-controls'));
        } else {
            this.topControlPanel.style.top = '0px';
            this.bottomControlPanel.style.bottom = '0px';
            panels.forEach(panel => panel.classList.add('visible-controls'));
        }
    }

    hideControlPanels() {
        const panels = [this.topControlPanel, this.bottomControlPanel];
        if (this.useCSSTransitions()) {
            panels.forEach(panel => panel.classList.remove('visible-controls'));
        } else {
            this.topControlPanel.style.top = '-50px';
            this.bottomControlPanel.style.bottom = '-50px';
            panels.forEach(panel => panel.classList.remove('visible-controls'));
        }
    }

    manageControlPanelVisibility() {
        if (!this.mobileDeviceDetected) {
            this.showControlPanels();
            this.resetControlPanelTimer();
        }
    }

    showContent(index) {
        if (index < 0 || index >= this.mediaCollection.length) return;

        const slides = this.sliderContainer.children;
        Array.from(slides).forEach((slide, i) => {
            slide.classList.remove('active-item');
            if (i === index) {
                slide.classList.add('active-item');
                this.updateContentDisplay(slide, this.mediaCollection[index]);
            }
        });

        this.currentTransformOffset = -index * 100;
        this.sliderContainer.style.transform = `translate3d(${this.currentTransformOffset}%, 0, 0)`;

        if (this.titleDisplay) {
            this.titleDisplay.textContent = this.mediaCollection[index].caption || '';
        }

        if (this.previousButton) {
            this.previousButton.style.display = (index === 0 && !this.currentSettings.wrapAroundContent) ? 'none' : '';
        }
        if (this.nextButton) {
            this.nextButton.style.display = (index === this.mediaCollection.length - 1 && !this.currentSettings.wrapAroundContent) ? 'none' : '';
        }

        this.resetControlPanelTimer();
    }

    updateContentDisplay(slideElement, contentItem) {
        slideElement.innerHTML = `<img src="${contentItem.source}" alt="${contentItem.caption || ''}" style="max-width:100%; max-height:100%; object-fit: contain;">`;
    }

    showNextContent() {
        let currentIndex = Array.from(this.sliderContainer.children).findIndex(el => el.classList.contains('active-item'));
        let nextIndex = currentIndex + 1;

        if (nextIndex >= this.mediaCollection.length) {
            if (this.currentSettings.wrapAroundContent) {
                nextIndex = 0;
            } else {
                return;
            }
        }
        this.showContent(nextIndex);
    }

    showPreviousContent() {
        let currentIndex = Array.from(this.sliderContainer.children).findIndex(el => el.classList.contains('active-item'));
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            if (this.currentSettings.wrapAroundContent) {
                prevIndex = this.mediaCollection.length - 1;
            } else {
                return;
            }
        }
        this.showContent(prevIndex);
    }

    attachInteractions() {
        this.closeButton.addEventListener('click', this.closeContent.bind(this));
        this.previousButton.addEventListener('click', this.showPreviousContent.bind(this));
        this.nextButton.addEventListener('click', this.showNextContent.bind(this));

        if (!this.touchEnabled) {
            this.overlayElement.addEventListener('mousemove', () => {
                this.showControlPanels();
                this.resetControlPanelTimer();
            });
            this.overlayElement.addEventListener('mouseleave', () => {
                this.resetControlPanelTimer();
            });
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', this.boundHandleKeyboardInput);
    }

    handleKeyboardInput(evt) {
        if (!this.isCurrentlyOpen) return;

        switch (evt.key) {
            case 'ArrowLeft':
                evt.preventDefault();
                this.showPreviousContent();
                break;
            case 'ArrowRight':
                evt.preventDefault();
                this.showNextContent();
                break;
            case 'Escape':
                evt.preventDefault();
                this.closeContent();
                break;
        }
    }

    closeContent() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        this.isCurrentlyOpen = false;
        this.clearControlPanelTimer();
        document.removeEventListener('keydown', this.boundHandleKeyboardInput);
        window.removeEventListener('resize', this.boundUpdateDimensions);
        document.body.classList.remove('viewer-active');

        if (this.currentSettings.afterClosureCallback) {
            this.currentSettings.afterClosureCallback();
        }
        this.triggeredElement && this.triggeredElement.dispatchEvent(new CustomEvent('viewer-closed'));
        ContentViewer.instance = null; // Clear static instance
    }

    destroyViewer() {
        this.closeContent();
        if (!Array.isArray(this.activationSource) && this.activationQuery) {
            document.removeEventListener('click', this.boundHandleActivationClick);
        }
    }
}

(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function($) {
            return factory($, global);
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), global);
    } else {
        global.jQuery.contentViewer = function(inputSource, options) {
            if (typeof inputSource === 'string' || Array.isArray(inputSource)) {
                return new ContentViewer(inputSource, options);
            }
            if (inputSource instanceof global.jQuery) {
                if (inputSource.selector) {
                    return new ContentViewer(inputSource.selector, options);
                } else {
                    const contentArray = inputSource.map(function() {
                        return {
                            source: this.href,
                            caption: this.dataset.caption || this.title
                        };
                    }).get();
                    return new ContentViewer(contentArray, options);
                }
            }
        };

        global.jQuery.contentViewer.close = ContentViewer.closeActiveViewer;
        global.jQuery.contentViewer.instance = ContentViewer.retrieveInstance;
    }
}(typeof window !== 'undefined' ? window : this, function($, window) {
    return ContentViewer;
}));