class VisualAdjuster {
    #visualTargetElement;
    #windowAccess;
    #imageRetrievalService;
    #layoutCalculationService;

    #naturalImageWidth = 0;
    #naturalImageHeight = 0;

    constructor(targetElement, windowObject, imgLoader, sizeCalculator) {
        if (!(targetElement instanceof HTMLImageElement)) {
            throw new Error('Provided element must be an HTMLImageElement.');
        }
        this.#visualTargetElement = targetElement;
        this.#windowAccess = windowObject;
        this.#imageRetrievalService = imgLoader;
        this.#layoutCalculationService = sizeCalculator;

        this.#windowAccess.addEventListener('resize', this.#adjustVisualLayout.bind(this));
    }

    #determineOptimalDimensions(originalWidth, originalHeight, boundaryConstraints) {
        const { minimumDimensionX, minimumDimensionY, maximumDimensionX, maximumDimensionY } = boundaryConstraints;
        const currentImageAspectRatio = originalWidth / originalHeight;
        const maxContainerAspectRatio = maximumDimensionX / maximumDimensionY;

        // Function factory for applying 'too small' logic
        const createMinSizeAdjuster = (w, h) => {
            if (w < minimumDimensionX && h < minimumDimensionY) {
                if (currentImageAspectRatio > maxContainerAspectRatio) {
                    return (currentW, currentH) => ({
                        width: Math.round(originalWidth * minimumDimensionY / originalHeight),
                        height: minimumDimensionY
                    });
                } else {
                    return (currentW, currentH) => ({
                        width: minimumDimensionX,
                        height: Math.round(originalHeight * minimumDimensionX / originalWidth)
                    });
                }
            } else if (w < minimumDimensionX) {
                return (currentW, currentH) => ({
                    width: minimumDimensionX,
                    height: Math.round(originalHeight * minimumDimensionX / originalWidth)
                });
            } else if (h < minimumDimensionY) {
                return (currentW, currentH) => ({
                    width: Math.round(originalWidth * minimumDimensionY / originalHeight),
                    height: minimumDimensionY
                });
            }
            return (currentW, currentH) => ({ width: currentW, height: currentH }); // No adjustment needed
        };

        let { width: intermediateWidth, height: intermediateHeight } =
            createMinSizeAdjuster(originalWidth, originalHeight)(originalWidth, originalHeight);

        // Function factory for applying 'too large' logic
        const createMaxSizeAdjuster = (w, h) => {
            if (w > maximumDimensionX && h > maximumDimensionY) {
                if (currentImageAspectRatio > maxContainerAspectRatio) {
                    return (currentW, currentH) => ({
                        width: maximumDimensionX,
                        height: Math.round(originalHeight * maximumDimensionX / originalWidth)
                    });
                } else {
                    return (currentW, currentH) => ({
                        width: Math.round(originalWidth * maximumDimensionY / originalHeight),
                        height: maximumDimensionY
                    });
                }
            } else if (w > maximumDimensionX) {
                return (currentW, currentH) => ({
                    width: maximumDimensionX,
                    height: Math.round(originalHeight * maximumDimensionX / originalWidth)
                });
            } else if (h > maximumDimensionY) {
                return (currentW, currentH) => ({
                    width: Math.round(originalWidth * maximumDimensionY / originalHeight),
                    height: maximumDimensionY
                });
            }
            return (currentW, currentH) => ({ width: currentW, height: currentH }); // No adjustment needed
        };

        let { width: finalDisplayWidth, height: finalDisplayHeight } =
            createMaxSizeAdjuster(originalWidth, originalHeight)(intermediateWidth, intermediateHeight);

        return {
            computedWidth: finalDisplayWidth || 0,
            computedHeight: finalDisplayHeight || 0
        };
    }

    #adjustVisualLayout() {
        const currentViewportWidth = this.#windowAccess.innerWidth;
        const currentViewportHeight = this.#windowAccess.innerHeight;

        const dimensionLimits = this.#layoutCalculationService.retrieveImageBoundaryLimits({
            viewportWidth: currentViewportWidth,
            viewportHeight: currentViewportHeight,
            imageNaturalWidth: this.#naturalImageWidth,
            imageNaturalHeight: this.#naturalImageHeight
        });

        const imagePresentationDimensions = this.#determineOptimalDimensions(
            this.#naturalImageWidth,
            this.#naturalImageHeight,
            Object.assign({
                minimumDimensionX: 1,
                minimumDimensionY: 1,
                maximumDimensionX: 3000,
                maximumDimensionY: 3000,
            }, {
                minimumDimensionX: dimensionLimits.minimumWidth,
                minimumDimensionY: dimensionLimits.minimumHeight,
                maximumDimensionX: dimensionLimits.maximumWidth,
                maximumDimensionY: dimensionLimits.maximumHeight,
            })
        );

        const parentContainerDimensions = this.#layoutCalculationService.calculateParentContainerSizes({
            viewportWidth: currentViewportWidth,
            viewportHeight: currentViewportHeight,
            displayedImageWidth: imagePresentationDimensions.computedWidth,
            displayedImageHeight: imagePresentationDimensions.computedHeight
        });

        this.#visualTargetElement.style.width = imagePresentationDimensions.computedWidth + 'px';
        this.#visualTargetElement.style.height = imagePresentationDimensions.computedHeight + 'px';

        const dialogComponent = this.#windowAccess.document.querySelector('.lightbox-modal .modal-dialog');
        const contentComponent = this.#windowAccess.document.querySelector('.lightbox-modal .modal-content');

        if (dialogComponent) {
            dialogComponent.style.width = parentContainerDimensions.containerWidth + 'px';
        }
        if (contentComponent) {
            contentComponent.style.height = parentContainerDimensions.containerHeight + 'px';
        }
    }

    applyImageSource(newImageUrl) {
        this.#visualTargetElement.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Clear image with transparent GIF

        this.#imageRetrievalService.fetchImageData(newImageUrl).then(imageData => {
            this.#naturalImageWidth = imageData.naturalWidth;
            this.#naturalImageHeight = imageData.naturalHeight;

            this.#adjustVisualLayout();

            this.#visualTargetElement.src = newImageUrl;
        });
    }

    releaseResources() {
        this.#windowAccess.removeEventListener('resize', this.#adjustVisualLayout.bind(this));
    }
}

// Mock/Interface definitions for external services, replicating their expected behavior.
// These are not part of the core Type IV clone but are necessary for the clone to be functional.

const mockImageRetrievalService = {
    fetchImageData: function(resourceURL) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
            img.onerror = () => resolve({ naturalWidth: 0, naturalHeight: 0 });
            img.src = resourceURL;
        });
    }
};

const mockLayoutCalculationService = {
    retrieveImageBoundaryLimits: function(layoutParameters) {
        // This function's logic would mirror Lightbox.calculateImageDimensionLimits
        // These are placeholder values to demonstrate the structure.
        return {
            minimumWidth: 100,
            minimumHeight: 100,
            maximumWidth: layoutParameters.viewportWidth * 0.9,
            maximumHeight: layoutParameters.viewportHeight * 0.8
        };
    },
    calculateParentContainerSizes: function(layoutParameters) {
        // This function's logic would mirror Lightbox.calculateModalDimensions
        // These are placeholder values to demonstrate the structure.
        return {
            containerWidth: layoutParameters.displayedImageWidth + 60,
            containerHeight: layoutParameters.displayedImageHeight + 80
        };
    }
};