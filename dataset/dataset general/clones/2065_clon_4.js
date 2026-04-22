(function() {
    const obtainElement = (identity) => document.querySelector(identity);
    const obtainManyElements = (identity) => document.querySelectorAll(identity);

    class PointManipulator {
        constructor(viewSurface, xCoordInput, yCoordInput, initialXValue = 0.5, initialYValue = 0.5) {
            if (!viewSurface || !xCoordInput || !yCoordInput) {
                console.error("Critical components missing for PointManipulator initialization.");
                return;
            }
            this.viewSurface = viewSurface;
            this.xCoordInput = xCoordInput;
            this.yCoordInput = yCoordInput;
            this.initialX = initialXValue;
            this.initialY = initialYValue;

            this.imageDisplay = this.viewSurface.querySelector('img');
            if (!this.imageDisplay) {
                console.error("Image element not found within the viewSurface.");
                return;
            }

            this.imageWidth = 0;
            this.imageHeight = 0;

            this.indicatorDot = null;
            this.indicatorFrame = null;
            this.dotWidth = 0;
            this.dotHeight = 0;

            this.isCurrentlyDragging = false;
            this.dragStartOffsetX = 0;
            this.dragStartOffsetY = 0;

            this._establishVisualElements();
            this._registerEventHandlers();
            this.updateDotFromInputs();
            this._checkInitialVisibility();
        }

        _establishVisualElements() {
            this.indicatorDot = document.createElement('span');
            this.indicatorDot.className = 'focal-point';
            this.indicatorFrame = document.createElement('span');
            this.indicatorFrame.className = 'focal-point-container';

            this.indicatorFrame.appendChild(this.indicatorDot);
            this.viewSurface.appendChild(this.indicatorFrame);

            this._refreshDimensions();

            this.indicatorFrame.style.width = `${this.imageWidth + this.dotWidth}px`;
            this.indicatorFrame.style.height = `${this.imageHeight + this.dotHeight}px`;
            this.indicatorFrame.style.left = `${-this.dotWidth / 2}px`;
            this.indicatorFrame.style.top = `${-this.dotHeight / 2}px`;
            this.indicatorFrame.style.position = 'absolute';
            this.indicatorFrame.style.overflow = 'hidden';
            this.indicatorDot.style.position = 'relative';
        }

        _refreshDimensions() {
            this.imageWidth = this.imageDisplay.naturalWidth || this.imageDisplay.offsetWidth;
            this.imageHeight = this.imageDisplay.naturalHeight || this.imageDisplay.offsetHeight;
            this.dotWidth = this.indicatorDot.offsetWidth;
            this.dotHeight = this.indicatorDot.offsetHeight;
        }

        _registerEventHandlers() {
            this.xCoordInput.addEventListener('change', () => this.updateDotFromInputs());
            this.yCoordInput.addEventListener('change', () => this.updateDotFromInputs());

            this.indicatorDot.addEventListener('mousedown', (evt) => this._initiateDrag(evt));
            document.addEventListener('mousemove', (evt) => this._continueDrag(evt));
            document.addEventListener('mouseup', () => this._terminateDrag());

            const associatedControlGroup = this.xCoordInput.closest('fieldset');
            if (associatedControlGroup) {
                const foldToggle = associatedControlGroup.querySelector('.collapse-toggle');
                if (foldToggle) {
                    foldToggle.addEventListener('click', () => this._toggleDotDisplay());
                }
            }
        }

        _initiateDrag(evt) {
            evt.preventDefault();
            this.isCurrentlyDragging = true;
            const dotBounds = this.indicatorDot.getBoundingClientRect();
            this.dragStartOffsetX = evt.clientX - dotBounds.left;
            this.dragStartOffsetY = evt.clientY - dotBounds.top;
            this.indicatorDot.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }

        _continueDrag(evt) {
            if (!this.isCurrentlyDragging) return;

            const surfaceBounds = this.viewSurface.getBoundingClientRect();
            let newXPixels = evt.clientX - surfaceBounds.left - this.dragStartOffsetX;
            let newYPixels = evt.clientY - surfaceBounds.top - this.dragStartOffsetY;

            newXPixels = Math.max(0, Math.min(newXPixels, this.imageWidth - this.dotWidth));
            newYPixels = Math.max(0, Math.min(newYPixels, this.imageHeight - this.dotHeight));

            this.indicatorDot.style.left = `${newXPixels}px`;
            this.indicatorDot.style.top = `${newYPixels}px`;

            const currentNormalized = this._fetchDotCoordinates(3);
            this._updateInputValues(currentNormalized.x, currentNormalized.y);
        }

        _terminateDrag() {
            this.isCurrentlyDragging = false;
            this.indicatorDot.style.cursor = 'grab';
            document.body.style.userSelect = '';
        }

        _normalizeDimension(value, maximum) {
            return Math.min(1, Math.max(0, value / maximum));
        }

        _denormalizeDimension(normalizedValue, maximum) {
            return normalizedValue * maximum;
        }

        adjustDotPosition(normalizedX, normalizedY) {
            this._refreshDimensions();
            const pixelX = this._denormalizeDimension(normalizedX, this.imageWidth);
            const pixelY = this._denormalizeDimension(normalizedY, this.imageHeight);

            this.indicatorDot.style.left = `${pixelX - this.dotWidth / 2}px`;
            this.indicatorDot.style.top = `${pixelY - this.dotHeight / 2}px`;
        }

        _fetchDotCoordinates(decimalPlaces = 0) {
            this._refreshDimensions();
            const currentPixelX = this.indicatorDot.offsetLeft + this.dotWidth / 2;
            const currentPixelY = this.indicatorDot.offsetTop + this.dotHeight / 2;

            let normalizedX = this._normalizeDimension(currentPixelX, this.imageWidth);
            let normalizedY = this._normalizeDimension(currentPixelY, this.imageHeight);

            if (decimalPlaces) {
                const factor = Math.pow(10, decimalPlaces);
                normalizedX = Math.round(normalizedX * factor) / factor;
                normalizedY = Math.round(normalizedY * factor) / factor;
            }
            return { x: normalizedX, y: normalizedY };
        }

        _updateInputValues(xValue, yValue) {
            this.xCoordInput.value = xValue;
            this.yCoordInput.value = yValue;
        }

        updateDotFromInputs() {
            let xText = this.xCoordInput.value.replace(/[^0-9\.]/g, '');
            let yText = this.yCoordInput.value.replace(/[^0-9\.]/g, '');

            const isXEmpty = xText === '';
            const isYEmpty = yText === '';

            let processedX = isXEmpty ? this.initialX : parseFloat(xText);
            let processedY = isYEmpty ? this.initialY : parseFloat(yText);

            processedX = Math.min(1, Math.max(0, processedX));
            processedY = Math.min(1, Math.max(0, processedY));

            if (!isXEmpty) this.xCoordInput.value = processedX;
            if (!isYEmpty) this.yCoordInput.value = processedY;

            this.adjustDotPosition(processedX, processedY);
        }

        _toggleDotDisplay() {
            const currentDisplay = this.indicatorDot.style.display;
            if (currentDisplay === 'none') {
                this.indicatorDot.style.display = '';
                this.indicatorFrame.style.display = '';
            } else {
                this.indicatorDot.style.display = 'none';
                this.indicatorFrame.style.display = 'none';
            }
        }

        _checkInitialVisibility() {
            const associatedControlGroup = this.xCoordInput.closest('fieldset');
            if (associatedControlGroup && associatedControlGroup.classList.contains('collapsed')) {
                this.indicatorDot.style.display = 'none';
                this.indicatorFrame.style.display = 'none';
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const candidateSurfaces = obtainManyElements('.form-row.file .thumbnail, .form-row.field-file .thumbnail');

        if (candidateSurfaces.length > 0) {
            const targetXInput = obtainElement('#id_focal_x');
            const targetYInput = obtainElement('#id_focal_y');

            // The original jQuery code implicitly handles only the first matched thumbnail
            // if global input IDs are used. We replicate this behavior.
            if (targetXInput && targetYInput) {
                new PointManipulator(candidateSurfaces[0], targetXInput, targetYInput);
            }
        }
    });

})();