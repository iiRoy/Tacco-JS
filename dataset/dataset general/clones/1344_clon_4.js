class PictureFocalPointManager {
    constructor(setupOptions) {
        this.primaryImageSource = setupOptions.primaryImageSource;
        this.outputAttrDisplay = document.querySelector(setupOptions.outputAttrSelector);
        this.outputStyleDisplay = document.querySelector(setupOptions.outputStyleSelector);
        this.interactiveDisplayImage = document.querySelector(setupOptions.interactiveImageSelector);
        this.displayContainerElements = [];
        this.displayPictureElements = [];
        this.sourceUpdateInput = document.querySelector(setupOptions.sourceUpdateSelector);
        this.focalTargetMarker = document.querySelector(setupOptions.focalTargetSelector);

        this.currentFocalData = {
            xCoord: 0,
            yCoord: 0,
            initialWidth: 0,
            initialHeight: 0
        };

        this.initializeInterface();
        this.bindEvents();
        this.updatePictureSource(this.primaryImageSource);
    }

    initializeInterface() {
        const gridContainer = document.getElementById('Frames');
        if (!gridContainer) return;

        for (let i = 1; i <= 9; i++) {
            const containerDiv = document.createElement('div');
            containerDiv.id = `View${i}`;
            containerDiv.className = 'visual-aligner';
            const imgElement = document.createElement('img');
            containerDiv.appendChild(imgElement);
            gridContainer.appendChild(containerDiv);
            this.displayContainerElements.push(containerDiv);
            this.displayPictureElements.push(imgElement);
        }
    }

    bindEvents() {
        this.interactiveDisplayImage.addEventListener('click', (evt) => this.handleDisplayClick(evt));
        this.sourceUpdateInput.addEventListener('paste', (evt) => this.handleSourceChange(evt));
        this.sourceUpdateInput.addEventListener('blur', (evt) => this.handleSourceChange(evt));
    }

    updatePictureSource(url) {
        const temporaryImage = new Image();
        temporaryImage.onload = () => {
            this.currentFocalData.initialWidth = temporaryImage.naturalWidth;
            this.currentFocalData.initialHeight = temporaryImage.naturalHeight;

            this.interactiveDisplayImage.src = url;
            this.displayPictureElements.forEach(img => img.src = url);

            this.displayContainerElements.forEach(container => {
                container.dataset.xPoint = this.currentFocalData.xCoord;
                container.dataset.yPoint = this.currentFocalData.yCoord;
                container.dataset.imgW = this.currentFocalData.initialWidth;
                container.dataset.imgH = this.currentFocalData.initialHeight;
            });

            this.applyImageAlignment();
            this.renderAttributeOutput();
        };
        temporaryImage.onerror = () => {
            console.error('Failed to load image at:', url);
        };
        temporaryImage.src = url;
    }

    renderAttributeOutput() {
        if (this.outputAttrDisplay) {
            const { xCoord, yCoord, initialWidth, initialHeight } = this.currentFocalData;
            this.outputAttrDisplay.value = `data-x-point="${xCoord.toFixed(2)}" data-y-point="${yCoord.toFixed(2)}" data-img-w="${initialWidth}" data-img-h="${initialHeight}"`;
        }
    }

    handleDisplayClick(evt) {
        const targetBounds = evt.currentTarget.getBoundingClientRect();
        const effectiveDisplayWidth = targetBounds.width;
        const effectiveDisplayHeight = targetBounds.height;

        const cursorX = evt.clientX - targetBounds.left;
        const cursorY = evt.clientY - targetBounds.top;

        const normalizedXVal = (cursorX / effectiveDisplayWidth - 0.5) * 2;
        const normalizedYVal = (cursorY / effectiveDisplayHeight - 0.5) * -2;

        this.currentFocalData.xCoord = normalizedXVal;
        this.currentFocalData.yCoord = normalizedYVal;

        this.renderAttributeOutput();
        this.updateViewports();

        const percentX = (cursorX / effectiveDisplayWidth) * 100;
        const percentY = (cursorY / effectiveDisplayHeight) * 100;
        const cssPositionString = `background-position: ${percentX.toFixed(0)}% ${percentY.toFixed(0)}%;`;
        if (this.outputStyleDisplay) {
            this.outputStyleDisplay.value = cssPositionString;
        }

        if (this.focalTargetMarker) {
            this.focalTargetMarker.style.top = `${percentY}%`;
            this.focalTargetMarker.style.left = `${percentX}%`;
        }
    }

    handleSourceChange(evt) {
        setTimeout(() => {
            const newSourceValue = evt.target.value;
            this.updatePictureSource(newSourceValue);
        }, 100);
    }

    updateViewports() {
        this.displayContainerElements.forEach(container => {
            container.dataset.xPoint = this.currentFocalData.xCoord;
            container.dataset.yPoint = this.currentFocalData.yCoord;
        });
        this.applyImageAlignment();
    }

    applyImageAlignment() {
        this.displayContainerElements.forEach(container => {
            const imageInContainer = container.querySelector('img');
            if (!imageInContainer) return;

            const focalX = parseFloat(container.dataset.xPoint || 0);
            const focalY = parseFloat(container.dataset.yPoint || 0);
            const origW = parseFloat(container.dataset.imgW || 1);
            const origH = parseFloat(container.dataset.imgH || 1);

            const containerW = container.clientWidth;
            const containerH = container.clientHeight;

            let finalImgW, finalImgH;
            const sourceRatio = origW / origH;
            const containerRatio = containerW / containerH;

            if (sourceRatio > containerRatio) {
                finalImgH = containerH;
                finalImgW = origW * (containerH / origH);
            } else {
                finalImgW = containerW;
                finalImgH = origH * (containerW / origW);
            }

            const excessHorizontal = finalImgW - containerW;
            const excessVertical = finalImgH - containerH;

            const shiftHorizontal = (focalX * excessHorizontal) / 2;
            const shiftVertical = (focalY * excessVertical) / 2;

            imageInContainer.style.width = `${finalImgW}px`;
            imageInContainer.style.height = `${finalImgH}px`;
            imageInContainer.style.left = `${-shiftHorizontal - excessHorizontal / 2}px`;
            imageInContainer.style.top = `${-shiftVertical - excessVertical / 2}px`;

            imageInContainer.style.position = 'absolute';
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const applicationSettings = {
        primaryImageSource: '../img/city_from_unsplash.jpg',
        outputAttrSelector: '.helper-tool-data-attr',
        outputStyleSelector: '.helper-tool-css3-val',
        interactiveImageSelector: 'img.helper-tool-img, img.target-overlay',
        sourceUpdateSelector: 'input.helper-tool-set-src',
        focalTargetSelector: '.focal-target-marker'
    };

    new PictureFocalPointManager(applicationSettings);
});