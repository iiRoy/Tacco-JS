class PictureCarousel {
    constructor(containerElement, customOptions) {
        this.configuration = Object.assign({}, PictureCarousel.DEFAULT_PARAMETERS, customOptions);
        this.carouselContainer = containerElement;
        this.imageElements = Array.from(this.carouselContainer.querySelectorAll('li'));
        this.totalImages = this.imageElements.length;
        this.activeImageIndex = 0;
        this.autoAdvanceIdentifier = null;
        this.isTransitioning = false;

        this.configureContainerAppearance();
        this.establishNavigationControls();
        this.activateAutoAdvancement();
        this.setWindowResizeHandler();
        this.prepareInitialImage();
    }

    static DEFAULT_PARAMETERS = {
        scalingMode: "cover",
        containerWidth: '100%',
        containerHeight: '100%',
        overlayPattern: "raster",
        backgroundColor: "#000",
        autoAdvanceInterval: 4000,
        randomOrder: false,
        displayAnimationDuration: 1500,
        concealAnimationDuration: 1500,
    };

    configureContainerAppearance() {
        this.carouselContainer.style.backgroundColor = this.configuration.backgroundColor;
        const patternElement = this.carouselContainer.querySelector('.mask');
        if (patternElement) {
            patternElement.style.backgroundImage = this.configuration.overlayPattern === 'none' ? 'none' : `url(./img/${this.configuration.overlayPattern}.png)`;
        }
        this.imageElements.forEach(imgEl => {
            imgEl.style.display = 'none';
            imgEl.style.position = 'absolute';
            imgEl.style.width = '100%';
            imgEl.style.height = '100%';
            imgEl.style.overflow = 'hidden';
        });
    }

    establishNavigationControls() {
        const forwardButton = this.carouselContainer.querySelector('.nav.next');
        const backwardButton = this.carouselContainer.querySelector('.nav.prev');

        if (forwardButton) {
            forwardButton.addEventListener('click', () => this.moveImage(1));
        }
        if (backwardButton) {
            backwardButton.addEventListener('click', () => this.moveImage(-1));
        }
    }

    activateAutoAdvancement() {
        if (this.configuration.autoAdvanceInterval > 0) {
            this.autoAdvanceIdentifier = setInterval(() => this.moveImage(1), this.configuration.autoAdvanceInterval);
        }
    }

    setWindowResizeHandler() {
        window.addEventListener('resize', this.adjustLayout.bind(this));
        this.adjustLayout();
    }

    prepareInitialImage() {
        if (this.totalImages === 0) return;
        this.imageElements[this.activeImageIndex].style.display = 'block';
        this.adjustLayout();
        this.imageElements[this.activeImageIndex].style.opacity = 0;
        this.imageElements[this.activeImageIndex].style.visibility = 'hidden';
        this.revealImage(this.activeImageIndex);
    }

    animateImageOpacity(elementRef, initialOpacity, finalOpacity, animationDuration, onCompletion) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        const beginTime = performance.now();

        const animateFrame = (currentTime) => {
            const elapsedDuration = currentTime - beginTime;
            const progressRatio = Math.min(elapsedDuration / animationDuration, 1);
            const currentOpacityValue = initialOpacity + (finalOpacity - initialOpacity) * progressRatio;
            elementRef.style.opacity = currentOpacityValue.toFixed(4);

            if (progressRatio < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.isTransitioning = false;
                if (onCompletion) onCompletion();
            }
        };

        requestAnimationFrame(animateFrame);
    }

    concealCurrent(indexToObscure, completionCallback) {
        const elementToObscure = this.imageElements[indexToObscure];
        if (!elementToObscure || elementToObscure.style.display === 'none') {
            if (completionCallback) completionCallback();
            return;
        }

        elementToObscure.style.visibility = 'visible';
        elementToObscure.style.opacity = 1;

        this.animateImageOpacity(elementToObscure, 1, 0, this.configuration.concealAnimationDuration, () => {
            elementToObscure.style.display = 'none';
            elementToObscure.style.visibility = 'hidden';
            if (completionCallback) completionCallback();
        });
    }

    revealImage(indexToDisplay) {
        const elementToDisplay = this.imageElements[indexToDisplay];
        if (!elementToDisplay) return;

        elementToDisplay.style.display = 'block';
        this.adjustLayout();
        elementToDisplay.style.visibility = 'hidden';
        elementToDisplay.style.opacity = 0;

        this.animateImageOpacity(elementToDisplay, 0, 1, this.configuration.displayAnimationDuration, () => {
            elementToDisplay.style.visibility = 'visible';
            elementToDisplay.style.opacity = 1;
        });
    }

    moveImage(stepIncrement) {
        if (this.isTransitioning || this.totalImages === 0) return;

        if (this.autoAdvanceIdentifier) {
            clearInterval(this.autoAdvanceIdentifier);
            this.activateAutoAdvancement();
        }

        const priorIndex = this.activeImageIndex;
        let nextPotentialIndex = priorIndex;

        if (this.configuration.randomOrder) {
            do {
                nextPotentialIndex = Math.floor(Math.random() * this.totalImages);
            } while (nextPotentialIndex === priorIndex && this.totalImages > 1);
        } else {
            nextPotentialIndex = (priorIndex + stepIncrement);
            nextPotentialIndex = (nextPotentialIndex % this.totalImages + this.totalImages) % this.totalImages;
        }

        this.activeImageIndex = nextPotentialIndex;

        this.concealCurrent(priorIndex, () => {
            this.revealImage(this.activeImageIndex);
        });
    }

    adjustLayout() {
        const currentImageWrapper = this.imageElements[this.activeImageIndex];
        if (!currentImageWrapper) return;

        const currentWindowWidth = window.innerWidth;
        const currentWindowHeight = window.innerHeight;

        const computedContainerWidth = this.configuration.containerWidth === null ? currentWindowWidth : (typeof this.configuration.containerWidth === 'string' && this.configuration.containerWidth.endsWith('%') ? (parseFloat(this.configuration.containerWidth) / 100) * this.carouselContainer.parentNode.offsetWidth : parseFloat(this.configuration.containerWidth));
        const computedContainerHeight = this.configuration.containerHeight === null ? currentWindowHeight : (typeof this.configuration.containerHeight === 'string' && this.configuration.containerHeight.endsWith('%') ? (parseFloat(this.configuration.containerHeight) / 100) * this.carouselContainer.parentNode.offsetHeight : parseFloat(this.configuration.containerHeight));

        this.carouselContainer.style.width = `${computedContainerWidth}px`;
        this.carouselContainer.style.height = `${computedContainerHeight}px`;

        const effectiveContainerWidth = this.carouselContainer.offsetWidth;
        const effectiveContainerHeight = this.carouselContainer.offsetHeight;
        const effectiveContainerRatio = effectiveContainerWidth / effectiveContainerHeight;

        const actualImageElement = currentImageWrapper.querySelector("img");
        if (!actualImageElement) return;

        const processImageSizing = () => {
            const imageNaturalRatio = actualImageElement.naturalWidth / actualImageElement.naturalHeight;

            actualImageElement.style.position = 'absolute';

            if ((effectiveContainerRatio < imageNaturalRatio && this.configuration.scalingMode === 'contain') || (effectiveContainerRatio >= imageNaturalRatio && this.configuration.scalingMode === 'cover')) {
                actualImageElement.style.width = '100%';
                actualImageElement.style.height = 'auto';
                actualImageElement.style.top = `${(effectiveContainerHeight - (effectiveContainerWidth / imageNaturalRatio)) / 2}px`;
                actualImageElement.style.left = '0';
            } else {
                actualImageElement.style.height = '100%';
                actualImageElement.style.width = 'auto';
                actualImageElement.style.top = '0';
                actualImageElement.style.left = `${(effectiveContainerWidth - (imageNaturalRatio * effectiveContainerHeight)) / 2}px`;
            }
        };

        if (actualImageElement.complete && actualImageElement.naturalWidth !== 0) {
            processImageSizing();
        } else {
            actualImageElement.onload = processImageSizing;
            if (actualImageElement.complete && actualImageElement.naturalWidth !== 0) {
                processImageSizing();
            }
        }
    }
}