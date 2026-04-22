(function() {

    function processSingleElement(targetContainer, settingsInput) {

        const defaultAttributes = {
            topOffset: 30,
            sideOffset: 30,
            initialHorizontal: 30,
            initialVertical: 30,
            orientationMode: "horizontal"
        };
        const activeAttributes = Object.assign({}, defaultAttributes, settingsInput);

        const parentContainer = targetContainer;
        const adjustableOverlay = parentContainer.querySelector('.changeable');
        const movementControl = parentContainer.querySelector('.handle');

        const parentWidth = parentContainer.offsetWidth;
        const parentHeight = parentContainer.offsetHeight;

        let currentHandleXCoord = null;
        let currentHandleYCoord = null;
        let startingPointerXCoord = null;
        let startingPointerYCoord = null;

        const minLeftBound = activeAttributes.sideOffset;
        const maxLeftBound = parentWidth - activeAttributes.sideOffset;
        const minTopBound = activeAttributes.topOffset;
        const maxTopBound = parentHeight - activeAttributes.topOffset;

        let effectiveInitialX = activeAttributes.initialHorizontal;
        let effectiveInitialY = activeAttributes.initialVertical;

        if (effectiveInitialX < minLeftBound) {
            effectiveInitialX = minLeftBound;
        }

        if (effectiveInitialY < minTopBound) {
            effectiveInitialY = minTopBound;
        }

        parentContainer.style.backgroundImage = `url(${parentContainer.dataset.backgroundPassive})`;
        adjustableOverlay.style.backgroundImage = `url(${parentContainer.dataset.backgroundActive})`;

        adjustableOverlay.style.height = `${parentContainer.offsetHeight}px`;

        const leftIndicator = document.createElement('span');
        leftIndicator.className = 'left directional-pointer-left';
        const rightIndicator = document.createElement('span');
        rightIndicator.className = 'right directional-pointer-right';
        movementControl.appendChild(leftIndicator);
        movementControl.appendChild(rightIndicator);

        movementControl.style.left = `${effectiveInitialX}px`;
        movementControl.style.top = `${effectiveInitialY}px`;

        if (activeAttributes.orientationMode === "horizontal") {
            adjustableOverlay.style.width = `${effectiveInitialX}px`;
            adjustableOverlay.style.borderRight = '1px dashed #FFF';
        } else if (activeAttributes.orientationMode === "vertical") {
            parentContainer.style.height = `${adjustableOverlay.offsetHeight}px`;
            adjustableOverlay.style.height = `${effectiveInitialY}px`;
            adjustableOverlay.style.borderBottom = '1px dashed #FFF';
            movementControl.classList.add('vertical-orientation-control');
        }

        let isControlEngaged = false;
        let activeControlReference = null;

        const startPointerInteraction = (event) => {
            event.preventDefault();
            isControlEngaged = true;
            activeControlReference = movementControl;
            activeControlReference.classList.add('currently-manipulating');

            currentHandleXCoord = parseInt(activeControlReference.style.left, 10);
            startingPointerXCoord = event.pageX;
            currentHandleYCoord = parseInt(activeControlReference.style.top, 10);
            startingPointerYCoord = event.pageY;

            parentContainer.addEventListener('pointermove', continuePointerInteraction);
            document.addEventListener('pointerup', endPointerInteraction);
        };

        const continuePointerInteraction = (event) => {
            if (!isControlEngaged || !activeControlReference) return;

            let newXPosition = currentHandleXCoord + (event.pageX - startingPointerXCoord);
            if (newXPosition < minLeftBound) newXPosition = minLeftBound;
            else if (newXPosition > maxLeftBound) newXPosition = maxLeftBound;

            activeControlReference.style.left = `${newXPosition}px`;

            let newYPosition = currentHandleYCoord + (event.pageY - startingPointerYCoord);
            if (newYPosition < minTopBound) newYPosition = minTopBound;
            else if (newYPosition > maxYBound) newYPosition = maxYBound;

            activeControlReference.style.top = `${newYPosition}px`;

            updateAdjustableDimensions(newXPosition, newYPosition);
        };

        const endPointerInteraction = () => {
            isControlEngaged = false;
            if (activeControlReference) {
                activeControlReference.classList.remove('currently-manipulating');
                activeControlReference = null;
            }
            parentContainer.removeEventListener('pointermove', continuePointerInteraction);
            document.removeEventListener('pointerup', endPointerInteraction);
        };

        const updateAdjustableDimensions = (dimensionA, dimensionB) => {
            if (activeAttributes.orientationMode === "horizontal") {
                adjustableOverlay.style.width = `${dimensionA}px`;
            } else if (activeAttributes.orientationMode === "vertical") {
                adjustableOverlay.style.height = `${dimensionB}px`;
            }
        };

        movementControl.addEventListener('pointerdown', startPointerInteraction);
    }

    window.initializeInteractiveLayer = function(targetSelector, optionsForLayer) {
        const selectedElements = document.querySelectorAll(targetSelector);
        selectedElements.forEach(element => {
            processSingleElement(element, optionsForLayer);
        });
        return selectedElements;
    };

})();