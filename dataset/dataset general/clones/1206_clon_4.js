class ImageAlterationProcessor {
    static defaultConfiguration = {
        transformKind: "grayscale", // Options include: 'grayscale', 'inverse', 'diffuse'
        layerArrangement: "top",    // Manipulated image can be on 'top' or 'bottom'
        enclosureClass: "altered-image-wrapper", // Class name for the generated wrapping div
        viewWidth: "responsive",    // Can be 'responsive', fixed width (e.g., 500), or 'inherit' from the image
        viewHeight: "auto",         // 'auto' or fixed height (only if viewWidth is fixed)
        scaleStrategy: "crop",      // 'crop' (aspect ratio preserved, content cropped), 'stretch' (image/canvas fills fixed dimensions)
        fadeDurationEnter: 400,     // Time in milliseconds for fade-in
        fadeDurationExit: 200       // Time in milliseconds for fade-out
    };

    constructor(targetImageElement, customConfig = {}) {
        if (!targetImageElement || !(targetImageElement instanceof HTMLImageElement)) {
            console.error("ImageAlterationProcessor: Invalid image element provided.");
            return;
        }

        this.originalImage = targetImageElement;
        this.currentConfiguration = { ...ImageAlterationProcessor.defaultConfiguration, ...customConfig };

        this.wrapperElement = null;
        this.effectCanvas = null;
        this.renderContext = null;
        this.activeAnimationId = null; // Used to manage requestAnimationFrame for fades

        this.initializeComponents();
        this.attachEventHandlers();
        this.applyInitialTransform();
        this.handleResize(); // Initial sizing based on current state
    }

    initializeComponents() {
        this.wrapperElement = document.createElement('div');
        this.wrapperElement.classList.add(this.currentConfiguration.enclosureClass);
        this.wrapperElement.style.position = 'relative';

        this.effectCanvas = document.createElement('canvas');
        this.effectCanvas.classList.add('effect-layer');
        this.effectCanvas.style.position = 'absolute';
        this.effectCanvas.style.top = '0';
        this.effectCanvas.style.left = '0';
        this.effectCanvas.style.zIndex = '10';

        this.originalImage.parentNode.insertBefore(this.wrapperElement, this.originalImage);
        this.wrapperElement.appendChild(this.originalImage);
        this.wrapperElement.appendChild(this.effectCanvas);

        this.renderContext = this.effectCanvas.getContext('2d');

        if (this.currentConfiguration.layerArrangement === "top") {
            this.originalImage.style.zIndex = '-1';
        } else { // 'bottom'
            this.originalImage.style.zIndex = '1';
            this.effectCanvas.style.display = 'none';
        }
    }

    attachEventHandlers() {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.originalImage.addEventListener('load', this.handleImageLoad.bind(this));

        this.wrapperElement.addEventListener('mouseenter', this.handleHoverEnter.bind(this));
        this.wrapperElement.addEventListener('mouseleave', this.handleHoverLeave.bind(this));
    }

    handleImageLoad() {
        this.applyInitialTransform();
        this.handleResize();
    }

    handleResize() {
        const imgNaturalWidth = this.originalImage.naturalWidth || this.originalImage.offsetWidth;
        const imgNaturalHeight = this.originalImage.naturalHeight || this.originalImage.offsetHeight;

        let calculatedWidth = imgNaturalWidth;
        let calculatedHeight = imgNaturalHeight;

        if (this.currentConfiguration.viewWidth === "responsive") {
            this.effectCanvas.style.maxWidth = '100%';
            this.originalImage.style.maxWidth = '100%';
            this.wrapperElement.style.width = '100%';
            calculatedWidth = this.wrapperElement.clientWidth;
            calculatedHeight = (calculatedWidth / imgNaturalWidth) * imgNaturalHeight;
            this.wrapperElement.style.height = 'auto'; 
        } else if (this.currentConfiguration.viewWidth !== "inherit") {
            calculatedWidth = parseInt(this.currentConfiguration.viewWidth, 10);
            if (this.currentConfiguration.viewHeight !== "auto") {
                calculatedHeight = parseInt(this.currentConfiguration.viewHeight, 10);
            } else {
                calculatedHeight = (calculatedWidth / imgNaturalWidth) * imgNaturalHeight;
            }
            this.wrapperElement.style.width = `${calculatedWidth}px`;
            this.wrapperElement.style.height = `${calculatedHeight}px`;

            if (this.currentConfiguration.scaleStrategy === "crop") {
                this.wrapperElement.style.overflow = "hidden";
            } else { // stretch
                this.originalImage.style.width = `${calculatedWidth}px`;
                this.originalImage.style.height = `${calculatedHeight}px`;
                this.effectCanvas.style.width = `${calculatedWidth}px`;
                this.effectCanvas.style.height = `${calculatedHeight}px`;
            }
        } else { // 'inherit' from image's current rendered size
            calculatedWidth = this.originalImage.offsetWidth;
            calculatedHeight = this.originalImage.offsetHeight;
            this.wrapperElement.style.width = `${calculatedWidth}px`;
            this.wrapperElement.style.height = `${calculatedHeight}px`;
        }
        
        this.effectCanvas.width = calculatedWidth;
        this.effectCanvas.height = calculatedHeight;

        this.redrawEffect();
    }

    redrawEffect() {
        if (!this.renderContext || !this.originalImage.complete) return;

        this.renderContext.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);
        this.renderContext.drawImage(this.originalImage, 0, 0, this.effectCanvas.width, this.effectCanvas.height);

        if (this.currentConfiguration.transformKind === 'diffuse') {
            this.applyDiffuseEffect();
        } else {
            let pixelData;
            try {
                pixelData = this.renderContext.getImageData(0, 0, this.effectCanvas.width, this.effectCanvas.height);
            } catch (e) {
                console.warn("ImageAlterationProcessor: Could not get image data, likely due to cross-origin restrictions. Pixel effects will be skipped.", e);
                return;
            }

            const pixelArray = pixelData.data;

            switch (this.currentConfiguration.transformKind) {
                case "inverse":
                    this.invertPixelColors(pixelArray);
                    break;
                case "grayscale":
                default:
                    this.convertPixelToGrayscale(pixelArray);
                    break;
            }
            this.renderContext.putImageData(pixelData, 0, 0);
        }
    }

    applyInitialTransform() {
        if (this.originalImage.complete) {
            this.redrawEffect();
        }
    }

    invertPixelColors(pixelArray) {
        for (let idx = 0; idx < pixelArray.length; idx += 4) {
            pixelArray[idx] = 255 - pixelArray[idx];
            pixelArray[idx + 1] = 255 - pixelArray[idx + 1];
            pixelArray[idx + 2] = 255 - pixelArray[idx + 2];
        }
    }

    convertPixelToGrayscale(pixelArray) {
        for (let idx = 0; idx < pixelArray.length; idx += 4) {
            const luminance = pixelArray[idx] * 0.3 + pixelArray[idx + 1] * 0.59 + pixelArray[idx + 2] * 0.11;
            pixelArray[idx] = luminance;
            pixelArray[idx + 1] = luminance;
            pixelArray[idx + 2] = luminance;
        }
    }

    // This implements a Gaussian blur using a convolution matrix, a different strategy than repeated drawImage.
    applyDiffuseEffect() {
        if (!this.renderContext || !this.originalImage.complete) return;

        let originalPixelData;
        try {
            originalPixelData = this.renderContext.getImageData(0, 0, this.effectCanvas.width, this.effectCanvas.height);
        } catch (e) {
            console.warn("ImageAlterationProcessor: Could not get image data for diffuse effect, likely due to cross-origin restrictions.", e);
            return;
        }

        const width = this.effectCanvas.width;
        const height = this.effectCanvas.height;
        const originalPixels = originalPixelData.data;
        const outputPixelData = this.renderContext.createImageData(width, height);
        const outputPixels = outputPixelData.data;

        // 3x3 Gaussian blur kernel
        const kernel = [
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ];
        const kernelSum = 16;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelX = Math.min(width - 1, Math.max(0, x + kx));
                        const pixelY = Math.min(height - 1, Math.max(0, y + ky));

                        const kernelValue = kernel[(ky + 1) * 3 + (kx + 1)];
                        const pixelIndex = (pixelY * width + pixelX) * 4;

                        r += originalPixels[pixelIndex] * kernelValue;
                        g += originalPixels[pixelIndex + 1] * kernelValue;
                        b += originalPixels[pixelIndex + 2] * kernelValue;
                    }
                }

                const outputIndex = (y * width + x) * 4;
                outputPixels[outputIndex] = r / kernelSum;
                outputPixels[outputIndex + 1] = g / kernelSum;
                outputPixels[outputIndex + 2] = b / kernelSum;
                outputPixels[outputIndex + 3] = originalPixels[outputIndex + 3]; // Preserve alpha
            }
        }
        this.renderContext.putImageData(outputPixelData, 0, 0);
    }

    // Custom fade animation using requestAnimationFrame to replace jQuery's fadeIn/fadeOut
    animateOpacity(element, targetOpacity, durationMs) {
        if (this.activeAnimationId) {
            cancelAnimationFrame(this.activeAnimationId);
        }

        const startOpacity = parseFloat(element.style.opacity || '1');
        const startTime = performance.now();

        const animateFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;

            element.style.opacity = currentOpacity;
            // Set display to '' (default) if becoming visible, 'none' if completely transparent
            element.style.display = (currentOpacity > 0.001 || targetOpacity > 0.001) ? '' : 'none';

            if (progress < 1) {
                this.activeAnimationId = requestAnimationFrame(animateFrame);
            } else {
                element.style.opacity = targetOpacity;
                element.style.display = targetOpacity > 0.001 ? '' : 'none';
                this.activeAnimationId = null;
            }
        };

        this.activeAnimationId = requestAnimationFrame(animateFrame);
    }

    handleHoverEnter() {
        if (this.currentConfiguration.layerArrangement === "top") {
            this.animateOpacity(this.effectCanvas, 0, this.currentConfiguration.fadeDurationExit);
        } else { // 'bottom'
            this.animateOpacity(this.effectCanvas, 1, this.currentConfiguration.fadeDurationEnter);
        }
    }

    handleHoverLeave() {
        if (this.currentConfiguration.layerArrangement === "top") {
            this.animateOpacity(this.effectCanvas, 1, this.currentConfiguration.fadeDurationEnter);
        } else { // 'bottom'
            this.animateOpacity(this.effectCanvas, 0, this.currentConfiguration.fadeDurationExit);
        }
    }
}

// Helper function to provide an API similar to a jQuery plugin, but using native DOM
function applyImageTransformations(selectorForImages, settings = {}) {
    const selectedElements = document.querySelectorAll(selectorForImages);
    selectedElements.forEach(imageElement => {
        if (imageElement.complete) {
            new ImageAlterationProcessor(imageElement, settings);
        } else {
            imageElement.addEventListener('load', () => {
                new ImageAlterationProcessor(imageElement, settings);
            }, { once: true });
        }
    });
}