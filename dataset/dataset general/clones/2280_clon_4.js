document.addEventListener('DOMContentLoaded', function() {

    let activePanelCount = 12;

    const constructLayout = (panelQuantity) => {
        const separatorDimension = 1;
        const separatorCount = panelQuantity - 1;

        const calculatedPanelWidth = (100 - (separatorCount * separatorDimension)) / panelQuantity;

        let currentCanvas = document.getElementById('main-canvas');
        if (currentCanvas) {
            currentCanvas.remove();
        }

        const newCanvas = document.createElement('div');
        newCanvas.setAttribute('id', 'main-canvas');
        newCanvas.classList.add('main-canvas-style');
        document.body.appendChild(newCanvas);

        const sizeAdjuster = document.getElementById('size-adjuster');
        if (sizeAdjuster) {
            newCanvas.style.width = sizeAdjuster.value + '%';
        } else {
            newCanvas.style.width = '100%';
        }

        newCanvas.style.display = 'flex';
        newCanvas.style.height = '100%';

        for (let segmentIndex = 0; segmentIndex < panelQuantity; segmentIndex++) {
            const panelElement = document.createElement('div');
            panelElement.setAttribute('id', `panel-item-${segmentIndex}`);
            panelElement.classList.add('panel-segment-style');
            panelElement.style.width = calculatedPanelWidth + '%';
            panelElement.style.height = '100%';
            newCanvas.appendChild(panelElement);

            if (segmentIndex < panelQuantity - 1) {
                const separatorElement = document.createElement('div');
                separatorElement.setAttribute('id', `separator-item-${segmentIndex}`);
                separatorElement.classList.add('panel-separator-style');
                separatorElement.style.width = separatorDimension + '%';
                separatorElement.style.height = '100%';
                newCanvas.appendChild(separatorElement);
            }
        }
    };

    const sizeAdjusterElement = document.getElementById('size-adjuster');
    if (sizeAdjusterElement) {
        sizeAdjusterElement.value = 100;
        sizeAdjusterElement.addEventListener('input', (event) => {
            const currentCanvas = document.getElementById('main-canvas');
            if (currentCanvas) {
                currentCanvas.style.width = event.target.value + '%';
            }
        });
    }

    const decrementButton = document.querySelector('button[data-action="remove-panel"]');
    if (decrementButton) {
        decrementButton.addEventListener('click', () => {
            if (activePanelCount > 1) {
                activePanelCount--;
                constructLayout(activePanelCount);
            }
        });
    }

    const incrementButton = document.querySelector('button[data-action="add-panel"]');
    if (incrementButton) {
        incrementButton.addEventListener('click', () => {
            activePanelCount++;
            constructLayout(activePanelCount);
        });
    }

    constructLayout(activePanelCount);
});