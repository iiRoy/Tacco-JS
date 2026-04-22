function initializeOffCanvasSystem() {
    let panelDisplayStatus = false;

    const movementDuration = 300;

    const actionTrigger = document.querySelector('.toggle-button');
    const offCanvasContainer = document.querySelector('.off-canvas-panel');
    const innerContentSizer = document.querySelector('.off-canvas-panel .panel-inner-content');
    const primaryDocumentBody = document.body;

    function handleToggleAction(triggerEvent) {
        triggerEvent.preventDefault();

        const computedPanelSize = innerContentSizer.offsetWidth;

        if (!panelDisplayStatus) {
            offCanvasContainer.style.width = computedPanelSize + 'px';
            primaryDocumentBody.style.marginLeft = computedPanelSize + 'px';
            primaryDocumentBody.style.marginRight = '-' + computedPanelSize + 'px';

            setTimeout(() => {
                panelDisplayStatus = true;
            }, movementDuration);

        } else {
            offCanvasContainer.style.width = '0px';
            primaryDocumentBody.style.marginLeft = '0px';
            primaryDocumentBody.style.marginRight = '0px';

            const widthResetTransitionListener = (eventObject) => {
                if (eventObject.propertyName === 'width' && eventObject.target === offCanvasContainer) {
                    if (parseFloat(window.getComputedStyle(offCanvasContainer).width) < 1) {
                        offCanvasContainer.style.width = '';
                    }
                    offCanvasContainer.removeEventListener('transitionend', widthResetTransitionListener);
                }
            };
            offCanvasContainer.addEventListener('transitionend', widthResetTransitionListener);

            setTimeout(() => {
                panelDisplayStatus = false;
            }, movementDuration);
        }
    }

    if (actionTrigger) {
        actionTrigger.addEventListener('click', handleToggleAction);
    }
}

window.addEventListener('DOMContentLoaded', initializeOffCanvasSystem);