const stylePrefixer = (prop) => {
    const capitalizedProp = prop.charAt(0).toUpperCase() + prop.slice(1);
    const prefixes = ['webkit', 'moz', 'ms', 'o'];
    const dummy = document.createElement('div');
    if (prop in dummy.style) {
        return prop;
    }
    for (let i = 0; i < prefixes.length; i++) {
        const prefixedProp = prefixes[i] + capitalizedProp;
        if (prefixedProp in dummy.style) {
            return prefixedProp;
        }
    }
    return prop;
};

const visualizerConfiguration = {
    mediaAttribute: 'data-image-full',
    transitionDuration: 300,
    animationDuration: 1000,
    visualEffect: 'motion',
    mobileResponsive: false,
    immersiveMode: false,
    restrictRightClick: false,
    containerSelector: null
};

let activeVisualizer = null;

class VisualizerDisplay {
    constructor(triggeringElement, userOptions) {
        this.activeInitiator = triggeringElement;
        this.config = Object.assign({}, visualizerConfiguration, userOptions);

        this.mediaItems = [];
        this.currentMediaIndex = -1;
        this.interfaceElements = {};
        this.isAnimating = false;
        this.cachedSources = new Set();
        this.touchInteraction = {
            active: false,
            startX: 0,
            currentX: 0,
            scrollOffset: null
        };

        this.mediaGroupIdentifier = this.activeInitiator.getAttribute('data-gallery-group') || null;
        this.config.mobileResponsive = !!navigator.userAgent.match(/iPhone|iPod|iPad|Android/i);

        this.configureVisualEffects();
        this.gatherMediaAssets();
        this.bindInitialEvents();
    }

    bindInitialEvents() {
        this.activeInitiator.addEventListener('click', this.activateDisplay.bind(this));
    }

    gatherMediaAssets() {
        const groupSelector = this.mediaGroupIdentifier ? `[data-gallery-group="${this.mediaGroupIdentifier}"]` : 'img';
        const allGroupElements = document.querySelectorAll(groupSelector);

        allGroupElements.forEach((el, idx) => {
            const mediaSrc = el.getAttribute(this.config.mediaAttribute) || el.getAttribute('src');
            this.mediaItems.push({
                source: mediaSrc,
                originalElement: el,
                caption: el.getAttribute('alt') || ''
            });
            if (el === this.activeInitiator) {
                this.currentMediaIndex = idx;
            }
        });
    }

    activateDisplay(event) {
        event.preventDefault();

        if (activeVisualizer && activeVisualizer !== this) {
            activeVisualizer.dismissInterface();
        }
        activeVisualizer = this;

        this.activeInitiator.classList.add('active-visual');

        this.buildInterface();
        this.refreshInterfaceStyles();
        this.displayMedia(this.currentMediaIndex);
        this.updateNavigationStates();
        this.prepareMediaAssets();

        this.bindGlobalEvents();

        if (this.config.restrictRightClick) {
            this.interfaceElements.imageContainer.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        if (this.config.mobileResponsive) {
            document.addEventListener('touchstart', this.gestureHandler.bind(this), { passive: false });
            document.addEventListener('touchmove', this.gestureHandler.bind(this), { passive: false });
            document.addEventListener('touchend', this.gestureHandler.bind(this), { passive: false });
        }
    }

    prepareMediaAssets() {
        this.mediaItems.forEach(item => {
            if (!this.cachedSources.has(item.source)) {
                const img = new Image();
                img.src = item.source;
                img.onload = () => {
                    this.cachedSources.add(item.source);
                };
            }
        });
    }

    buildInterface() {
        const interfaceMarkup = `
            <div id="visualizer-main-container">
                <div id="visualizer-backdrop">
                    <div id="visualizer-loading-spinner"></div>
                </div>
                <span id="visualizer-dismiss-button"></span>
                <div id="visualizer-image-area"></div>
                <div id="visualizer-navigation-panel">
                    <span class="visualizer-nav-next"><a>&gt;</a></span>
                    <span class="visualizer-caption-text"></span>
                    <span class="visualizer-nav-prev"><a>&lt;</a></span>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', interfaceMarkup);

        this.interfaceElements.mainContainer = document.getElementById('visualizer-main-container');
        this.interfaceElements.backdrop = document.getElementById('visualizer-backdrop');
        this.interfaceElements.spinner = document.getElementById('visualizer-loading-spinner');
        this.interfaceElements.dismissButton = document.getElementById('visualizer-dismiss-button');
        this.interfaceElements.imageContainer = document.getElementById('visualizer-image-area');
        this.interfaceElements.navigationPanel = document.getElementById('visualizer-navigation-panel');
        this.interfaceElements.navNext = this.interfaceElements.navigationPanel.querySelector('.visualizer-nav-next');
        this.interfaceElements.navPrev = this.interfaceElements.navigationPanel.querySelector('.visualizer-nav-prev');
        this.interfaceElements.captionDisplay = this.interfaceElements.navigationPanel.querySelector('.visualizer-caption-text');

        const transitionProperty = stylePrefixer('transition');
        const transformProperty = stylePrefixer('transform');
        const transitionValue = `opacity ${this.config.transitionDuration}ms ease, ${transformProperty} ${this.config.transitionDuration}ms ease`;

        this.interfaceElements.backdrop.style[transitionProperty] = transitionValue;
        this.interfaceElements.dismissButton.style[transitionProperty] = transitionValue;
        this.interfaceElements.navigationPanel.style[transitionProperty] = transitionValue;
        this.interfaceElements.imageContainer.style[transitionProperty] = transitionValue;
        this.interfaceElements.imageContainer.style[transformProperty] = 'scale(0)';

        this.interfaceElements.navNext.addEventListener('click', (e) => { e.preventDefault(); this.alterMedia('forward'); });
        this.interfaceElements.navPrev.addEventListener('click', (e) => { e.preventDefault(); this.alterMedia('backward'); });
        this.interfaceElements.backdrop.addEventListener('click', this.dismissInterface.bind(this));
        this.interfaceElements.imageContainer.addEventListener('click', this.dismissInterface.bind(this));
        this.interfaceElements.dismissButton.addEventListener('click', this.dismissInterface.bind(this));

        if (this.config.immersiveMode) {
            const docRoot = document.documentElement;
            if (docRoot.requestFullscreen) { docRoot.requestFullscreen(); }
            else if (docRoot.mozRequestFullScreen) { docRoot.mozRequestFullScreen(); }
            else if (docRoot.webkitRequestFullScreen) { docRoot.webkitRequestFullScreen(); }
        }
    }

    refreshInterfaceStyles() {
        setTimeout(() => {
            this.interfaceElements.backdrop.style.opacity = '1';
            this.interfaceElements.dismissButton.style.opacity = '1';
            this.interfaceElements.navigationPanel.style.opacity = '1';
            this.interfaceElements.imageContainer.style[stylePrefixer('transform')] = 'scale(1)';
        }, 10);
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
    }

    handleKeyboardInput(event) {
        if (event.key === 'Escape') {
            this.dismissInterface();
        } else if (event.key === 'ArrowRight') {
            this.alterMedia('forward');
        } else if (event.key === 'ArrowLeft') {
            this.alterMedia('backward');
        }
    }

    dismissInterface() {
        this.interfaceElements.imageContainer.style.opacity = '0';
        this.interfaceElements.imageContainer.style[stylePrefixer('transform')] = 'scale(1.2)';
        this.interfaceElements.backdrop.style.opacity = '0';
        this.interfaceElements.dismissButton.style.opacity = '0';
        this.interfaceElements.navigationPanel.style.opacity = '0';

        setTimeout(() => {
            if (this.interfaceElements.mainContainer && this.interfaceElements.mainContainer.parentNode) {
                this.interfaceElements.mainContainer.parentNode.removeChild(this.interfaceElements.mainContainer);
            }
            if (document.getElementById('visualizer-dynamic-styles')) {
                document.getElementById('visualizer-dynamic-styles').remove();
            }
            this.interfaceElements = {};

            this.activeInitiator.classList.remove('active-visual');

            document.removeEventListener('keydown', this.handleKeyboardInput.bind(this));
            document.removeEventListener('touchstart', this.gestureHandler.bind(this));
            document.removeEventListener('touchmove', this.gestureHandler.bind(this));
            document.removeEventListener('touchend', this.gestureHandler.bind(this));

            if (this.config.immersiveMode) {
                if (document.exitFullscreen) { document.exitFullscreen(); }
                else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
                else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
            }
            activeVisualizer = null;
        }, this.config.transitionDuration);
    }

    showProgressSpinner(state) {
        this.interfaceElements.spinner.style.display = state ? 'block' : 'none';
    }

    displayMedia(index) {
        if (index < 0 || index >= this.mediaItems.length) return;

        this.currentMediaIndex = index;
        const media = this.mediaItems[this.currentMediaIndex];
        this.showProgressSpinner(true);

        const img = new Image();
        img.src = media.source;

        img.onload = () => {
            this.showProgressSpinner(false);
            this.interfaceElements.imageContainer.style.backgroundImage = `url("${media.source}")`;
            this.interfaceElements.imageContainer.style.visibility = 'visible';
            this.interfaceElements.imageContainer.style.opacity = '1';
            this.interfaceElements.imageContainer.style[stylePrefixer('transform')] = 'scale(1)';
            this.interfaceElements.captionDisplay.textContent = media.caption;
            this.cachedSources.add(media.source);
        };
        img.onerror = () => {
            this.showProgressSpinner(false);
            console.error('Failed to load image:', media.source);
        };
    }

    alterMedia(direction) {
        if (this.isAnimating) return;

        let nextIndex = this.currentMediaIndex;
        if (direction === 'forward') {
            nextIndex++;
        } else {
            nextIndex--;
        }

        if (nextIndex >= 0 && nextIndex < this.mediaItems.length) {
            this.isAnimating = true;

            const animationClass = this.config.mobileResponsive
                ? ''
                : (direction === 'forward' ? 'visualizer-animation-out-right' : 'visualizer-animation-out-left');

            if (this.config.mobileResponsive) {
                const transformProp = stylePrefixer('transform');
                this.interfaceElements.imageContainer.style[transformProp] = direction === 'forward' ? 'translateX(-2000px)' : 'translateX(2000px)';
                this.interfaceElements.imageContainer.style.display = 'none';
            } else {
                this.interfaceElements.imageContainer.classList.add(animationClass);
            }

            setTimeout(() => {
                this.displayMedia(nextIndex);

                if (this.config.mobileResponsive) {
                    this.interfaceElements.imageContainer.style.display = 'block';
                    setTimeout(() => {
                        this.interfaceElements.imageContainer.style[stylePrefixer('transform')] = 'translateX(0px)';
                        this.isAnimating = false;
                    }, 50);
                } else {
                    this.interfaceElements.imageContainer.classList.remove(animationClass);
                    const inAnimationClass = direction === 'forward' ? 'visualizer-animation-in-right' : 'visualizer-animation-in-left';
                    this.interfaceElements.imageContainer.classList.add(inAnimationClass);

                    setTimeout(() => {
                        this.interfaceElements.imageContainer.classList.remove(inAnimationClass);
                        this.isAnimating = false;
                    }, this.config.animationDuration);
                }
                this.updateNavigationStates();
            }, this.config.animationDuration);

        } else {
            if (!this.isAnimating) {
                this.interfaceElements.imageContainer.classList.add('visualizer-shake-effect');
                setTimeout(() => {
                    this.interfaceElements.imageContainer.classList.remove('visualizer-shake-effect');
                }, 600);
            }
        }
    }

    updateNavigationStates() {
        this.interfaceElements.navPrev.classList.toggle('nav-disabled', this.currentMediaIndex === 0);
        this.interfaceElements.navNext.classList.toggle('nav-disabled', this.currentMediaIndex === this.mediaItems.length - 1);
    }

    isValidEffect(effectName) {
        const validEffects = ['motion', 'fade-large', 'fade-subtle', 'roll-out', 'rotate-around', 'flip-horizontal', 'flip-vertical'];
        return validEffects.includes(effectName);
    }

    configureVisualEffects() {
        let effectDefinitions = '';
        const transformPrefix = stylePrefixer('transform');
        const animationPrefix = stylePrefixer('animation');

        let chosenEffect = this.config.visualEffect;
        if (!this.isValidEffect(chosenEffect)) {
            chosenEffect = 'motion';
        }

        switch (chosenEffect) {
            case 'motion':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { ${transformPrefix}: translateX(0); }
                        20% { opacity: 1; ${transformPrefix}: translateX(20px); }
                        100% { opacity: 0; ${transformPrefix}: translateX(-2000px); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { opacity: 0; ${transformPrefix}: translateX(-2000px); }
                        60% { opacity: 1; ${transformPrefix}: translateX(30px); }
                        80% { ${transformPrefix}: translateX(-10px); }
                        100% { ${transformPrefix}: translateX(0); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { ${transformPrefix}: translateX(0); }
                        20% { opacity: 1; ${transformPrefix}: translateX(-20px); }
                        100% { opacity: 0; ${transformPrefix}: translateX(2000px); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { opacity: 0; ${transformPrefix}: translateX(2000px); }
                        60% { opacity: 1; ${transformPrefix}: translateX(-30px); }
                        80% { ${transformPrefix}: translateX(10px); }
                        100% { ${transformPrefix}: translateX(0); }
                    }
                `;
                break;
            case 'fade-large':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { opacity: 1; ${transformPrefix}: translateX(0); }
                        100% { opacity: 0; ${transformPrefix}: translateX(-2000px); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { opacity: 0; ${transformPrefix}: translateX(-2000px); }
                        100% { opacity: 1; ${transformPrefix}: translateX(0); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { opacity: 1; ${transformPrefix}: translateX(0); }
                        100% { opacity: 0; ${transformPrefix}: translateX(2000px); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { opacity: 0; ${transformPrefix}: translateX(2000px); }
                        100% { opacity: 1; ${transformPrefix}: translateX(0); }
                    }
                `;
                break;
            case 'fade-subtle':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { opacity: 1; ${transformPrefix}: translateX(0); }
                        100% { opacity: 0; ${transformPrefix}: translateX(-200px); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { opacity: 0; ${transformPrefix}: translateX(-200px); }
                        100% { opacity: 1; ${transformPrefix}: translateX(0); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { opacity: 1; ${transformPrefix}: translateX(0); }
                        100% { opacity: 0; ${transformPrefix}: translateX(200px); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { opacity: 0; ${transformPrefix}: translateX(200px); }
                        100% { opacity: 1; ${transformPrefix}: translateX(0); }
                    }
                `;
                break;
            case 'roll-out':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { opacity: 1; ${transformPrefix}: translateX(0px) rotate(0deg); }
                        100% { opacity: 0; ${transformPrefix}: translateX(-100%) rotate(-120deg); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { opacity: 0; ${transformPrefix}: translateX(-100%) rotate(-120deg); }
                        100% { opacity: 1; ${transformPrefix}: translateX(0px) rotate(0deg); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { opacity: 1; ${transformPrefix}: translateX(0px) rotate(0deg); }
                        100% { opacity: 0; ${transformPrefix}: translateX(100%) rotate(120deg); }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { opacity: 0; ${transformPrefix}: translateX(100%) rotate(120deg); }
                        100% { opacity: 1; ${transformPrefix}: translateX(0px) rotate(0deg); }
                    }
                `;
                break;
            case 'rotate-around':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { opacity: 1; ${transformPrefix}: rotate(0deg); ${transformPrefix}-origin:left bottom;}
                        100% { opacity: 0; ${transformPrefix}: rotate(-90deg); ${transformPrefix}-origin:left bottom;}
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { opacity: 0; ${transformPrefix}: rotate(90deg); ${transformPrefix}-origin:left bottom;}
                        100% { opacity: 1; ${transformPrefix}: rotate(0deg); ${transformPrefix}-origin:left bottom;}
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { opacity: 1; ${transformPrefix}: rotate(0deg); ${transformPrefix}-origin:right bottom;}
                        100% { opacity: 0; ${transformPrefix}: rotate(90deg); ${transformPrefix}-origin:right bottom;}
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { opacity: 0; ${transformPrefix}: rotate(-90deg); ${transformPrefix}-origin:right bottom;}
                        100% { opacity: 1; ${transformPrefix}: rotate(0deg); ${transformPrefix}-origin:right bottom;}
                    }
                `;
                break;
            case 'flip-horizontal':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { ${transformPrefix}: perspective(400px) rotateX(0deg); opacity: 1; }
                        100% { ${transformPrefix}: perspective(400px) rotateX(90deg); opacity: 0; }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { ${transformPrefix}: perspective(400px) rotateX(90deg); opacity: 0; }
                        40% { ${transformPrefix}: perspective(400px) rotateX(-10deg); }
                        70% { ${transformPrefix}: perspective(400px) rotateX(10deg); }
                        100% { ${transformPrefix}: perspective(400px) rotateX(0deg); opacity: 1; }
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { ${transformPrefix}: perspective(400px) rotateX(0deg); opacity: 1; }
                        100% { ${transformPrefix}: perspective(400px) rotateX(90deg); opacity: 0; }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { ${transformPrefix}: perspective(400px) rotateX(90deg); opacity: 0; }
                        40% { ${transformPrefix}: perspective(400px) rotateX(-10deg); }
                        70% { ${transformPrefix}: perspective(400px) rotateX(10deg); }
                        100% { ${transformPrefix}: perspective(400px) rotateX(0deg); opacity: 1; }
                    }
                `;
                break;
            case 'flip-vertical':
                effectDefinitions = `
                    @${animationPrefix}keyframes visualizerAnimationOutLeft {
                        0% { ${transformPrefix}: perspective(400px) rotateY(0deg); opacity: 1; }
                        100% { ${transformPrefix}: perspective(400px) rotateY(90deg); opacity: 0; }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInLeft {
                        0% { ${transformPrefix}: perspective(400px) rotateY(90deg); opacity: 0; }
                        40% { ${transformPrefix}: perspective(400px) rotateY(-10deg); }
                        70% { ${transformPrefix}: perspective(400px) rotateY(10deg); }
                        100% { ${transformPrefix}: perspective(400px) rotateY(0deg); opacity: 1; }
                    }
                    @${animationPrefix}keyframes visualizerAnimationOutRight {
                        0% { ${transformPrefix}: perspective(400px) rotateY(0deg); opacity: 1; }
                        100% { ${transformPrefix}: perspective(400px) rotateY(-90deg); opacity: 0; }
                    }
                    @${animationPrefix}keyframes visualizerAnimationInRight {
                        0% { ${transformPrefix}: perspective(400px) rotateY(90deg); opacity: 0; }
                        40% { ${transformPrefix}: perspective(400px) rotateY(-10deg); }
                        70% { ${transformPrefix}: perspective(400px) rotateY(10deg); }
                        100% { ${transformPrefix}: perspective(400px) rotateY(0deg); opacity: 1; }
                    }
                `;
                break;
        }

        const animationClasses = `
            .visualizer-animation-out-right {
                ${animationPrefix}: ${this.config.animationDuration}ms ease;
                ${animationPrefix}-name: visualizerAnimationOutLeft;
                ${animationPrefix}-fill-mode: both;
            }
            .visualizer-animation-in-left {
                ${animationPrefix}: ${this.config.animationDuration}ms ease;
                ${animationPrefix}-name: visualizerAnimationInLeft;
                ${animationPrefix}-fill-mode: both;
            }
            .visualizer-animation-out-left {
                ${animationPrefix}: ${this.config.animationDuration}ms ease;
                ${animationPrefix}-name: visualizerAnimationOutRight;
                ${animationPrefix}-fill-mode: both;
            }
            .visualizer-animation-in-right {
                ${animationPrefix}: ${this.config.animationDuration}ms ease;
                ${animationPrefix}-name: visualizerAnimationInRight;
                ${animationPrefix}-fill-mode: both;
            }
            .visualizer-shake-effect {
                ${animationPrefix}: 0.6s cubic-bezier(.36,.07,.19,.97) both;
                ${animationPrefix}-name: shakeVisualizer;
                ${transformPrefix}: translate3d(0, 0, 0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
            @${animationPrefix}keyframes shakeVisualizer {
                10%, 90% { ${transformPrefix}: translate3d(-1px, 0, 0); }
                20%, 80% { ${transformPrefix}: translate3d(2px, 0, 0); }
                30%, 50%, 70% { ${transformPrefix}: translate3d(-4px, 0, 0); }
                40%, 60% { ${transformPrefix}: translate3d(4px, 0, 0); }
            }
        `;

        let styleElement = document.getElementById('visualizer-dynamic-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'visualizer-dynamic-styles';
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = effectDefinitions + animationClasses;
    }

    gestureHandler(event) {
        switch (event.type) {
            case 'touchstart':
                this.touchInteraction.active = true;
                this.touchInteraction.startX = event.touches[0].clientX;
                this.touchInteraction.currentX = event.touches[0].clientX;
                this.touchInteraction.scrollOffset = 0;
                break;
            case 'touchmove':
                if (!this.touchInteraction.active) return;
                event.preventDefault();
                this.touchInteraction.currentX = event.touches[0].clientX;
                this.touchInteraction.scrollOffset = this.touchInteraction.currentX - this.touchInteraction.startX;
                this.interfaceElements.imageContainer.style[stylePrefixer('transform')] = `translateX(${this.touchInteraction.scrollOffset}px)`;
                break;
            case 'touchend':
                if (!this.touchInteraction.active) return;
                this.touchInteraction.active = false;
                const threshold = 50;
                if (this.touchInteraction.scrollOffset < -threshold) {
                    this.alterMedia('forward');
                } else if (this.touchInteraction.scrollOffset > threshold) {
                    this.alterMedia('backward');
                } else {
                    this.interfaceElements.imageContainer.style[stylePrefixer('transform')] = 'translateX(0px)';
                }
                this.touchInteraction.startX = 0;
                this.touchInteraction.currentX = 0;
                this.touchInteraction.scrollOffset = null;
                break;
        }
    }
}

window.createImageVisualizer = (targetSelector, options = {}) => {
    const targets = document.querySelectorAll(targetSelector);
    targets.forEach(target => {
        new VisualizerDisplay(target, options);
    });
};