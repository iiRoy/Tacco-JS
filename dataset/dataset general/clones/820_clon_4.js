(function() {
    const revealTime = 0.3;
    const concealTime = 0.1;
    const postponeDelay = 0;

    const displayActiveMark = 'display-active';
    const pendingRemovalMark = 'pending-removal';
    const removalInProgressMark = 'removal-in-progress';

    const elementTimers = new WeakMap();

    function obtainTargetPanel(eventSource) {
        if (eventSource.matches('a.trigger-link')) {
            return eventSource.nextElementSibling;
        } else if (eventSource.matches('ul.content-panel')) {
            return eventSource;
        }
        return null;
    }

    function initiatePanelDisplay(targetPanel, durationInSeconds) {
        if (!targetPanel || targetPanel.classList.contains(displayActiveMark)) {
            return;
        }

        clearTimeout(elementTimers.get(targetPanel));
        elementTimers.delete(targetPanel);

        targetPanel.classList.remove(pendingRemovalMark);
        targetPanel.classList.remove(removalInProgressMark);

        targetPanel.style.setProperty('--panel-transition-duration', `${durationInSeconds}s`);

        targetPanel.classList.add(displayActiveMark);
    }

    function initiatePanelConcealment(targetPanel, durationInSeconds) {
        if (!targetPanel || !targetPanel.classList.contains(displayActiveMark)) {
            return;
        }

        targetPanel.style.setProperty('--panel-transition-duration', `${durationInSeconds}s`);

        targetPanel.classList.add(removalInProgressMark);
        targetPanel.classList.remove(displayActiveMark);

        setTimeout(() => {
            targetPanel.classList.remove(pendingRemovalMark);
            targetPanel.classList.remove(removalInProgressMark);
        }, durationInSeconds * 1000);
    }

    function handleAnchorEntry(event) {
        const currentLink = event.currentTarget;
        const panelElement = obtainTargetPanel(currentLink);

        if (!panelElement) {
            return;
        }

        clearTimeout(elementTimers.get(panelElement));
        elementTimers.delete(panelElement);

        panelElement.classList.remove(pendingRemovalMark);

        if (!panelElement.classList.contains(displayActiveMark)) {
            initiatePanelDisplay(panelElement, revealTime);
        }
    }

    function handleAnchorExit(event) {
        const currentLink = event.currentTarget;
        const panelElement = obtainTargetPanel(currentLink);

        if (panelElement && panelElement.classList.contains(displayActiveMark)) {
            queuePanelConcealment(panelElement);
        }
    }

    function handlePanelEntry(event) {
        const currentPanel = event.currentTarget;
        const panelElement = obtainTargetPanel(currentPanel);

        if (panelElement && !panelElement.classList.contains(removalInProgressMark)) {
            clearTimeout(elementTimers.get(panelElement));
            elementTimers.delete(panelElement);
            panelElement.classList.remove(pendingRemovalMark);
        }
    }

    function handlePanelExit(event) {
        const currentPanel = event.currentTarget;
        const panelElement = obtainTargetPanel(currentPanel);

        if (panelElement && panelElement.classList.contains(displayActiveMark)) {
            queuePanelConcealment(panelElement);
        }
    }

    function queuePanelConcealment(panelElement) {
        panelElement.classList.add(pendingRemovalMark);
        if (!panelElement.classList.contains(removalInProgressMark)) {
            if (!elementTimers.has(panelElement)) {
                const timerIdentifier = setTimeout(() => {
                    executeQueuedConcealment(panelElement);
                }, postponeDelay * 1000);
                elementTimers.set(panelElement, timerIdentifier);
            }
        }
    }

    function executeQueuedConcealment(panelElement) {
        elementTimers.delete(panelElement);

        if (panelElement.classList.contains(pendingRemovalMark)) {
            initiatePanelConcealment(panelElement, concealTime);
        }
    }

    function setupInteractionSystem() {
        document.querySelectorAll('a.trigger-link').forEach(link => {
            link.addEventListener('mousemove', handleAnchorEntry);
            link.addEventListener('mouseout', handleAnchorExit);
        });

        document.querySelectorAll('ul.content-panel').forEach(panel => {
            panel.addEventListener('mousemove', handlePanelEntry);
            panel.addEventListener('mouseout', handlePanelExit);
        });
    }

    document.addEventListener('DOMContentLoaded', setupInteractionSystem);

    const injectedStyle = document.createElement('style');
    injectedStyle.textContent = `
        .content-panel {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--panel-transition-duration, 0.3s) ease-in-out, 
                        opacity var(--panel-transition-duration, 0.3s) ease-in-out;
        }

        .content-panel.display-active {
            max-height: 500px; 
            opacity: 1;
        }
    `;
    document.head.appendChild(injectedStyle);

})();