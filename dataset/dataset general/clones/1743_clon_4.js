const paginatorFactory = (displayContainer, configurationOptions) => {
    const defaultDisplaySettings = {
        itemColumns: 3,
        itemRows: 4,
        scrollDirection: 'horizontal',
        containerWidth: 'auto',
        containerHeight: 'auto',
        transitionDurationMs: 500,
        enableNavigationButtons: true,
        swipeInertiaFactor: 200
    };
    const activeSettings = Object.assign({}, defaultDisplaySettings, configurationOptions);

    if (!(displayContainer instanceof HTMLElement)) {
        console.error("Paginator requires a valid DOM element as its container.");
        return;
    }

    if (displayContainer.dataset.paginatorInitialized) {
        console.warn("This element already has an active paginator. Skipping re-initialization.");
        return displayContainer.paginator; // Return existing API if any
    }
    displayContainer.dataset.paginatorInitialized = 'true';

    const moduleState = {
        currentPageIndex: 0,
        totalPageCount: 1,
        currentTransformX: 0,
        currentTransformY: 0,
        isInteracting: false,
        interactionStartPoint: { x: 0, y: 0 },
        initialTransformOnInteraction: { x: 0, y: 0 },
        recentInteractionEvents: [],
        animationFrameId: null,
        animationStartTime: 0,
        animationStartValue: 0,
        animationEndValue: 0,
        animationAxis: '',
        animationDuration: 0
    };

    const originalItems = Array.from(displayContainer.children);

    const actualContainerWidth = activeSettings.containerWidth === 'auto' ? displayContainer.offsetWidth : activeSettings.containerWidth;
    const actualContainerHeight = activeSettings.containerHeight === 'auto' ? displayContainer.offsetHeight : activeSettings.containerHeight;

    const itemCellWidth = actualContainerWidth / activeSettings.itemColumns;
    const itemCellHeight = actualContainerHeight / activeSettings.itemRows;

    const externalWrapper = document.createElement('div');
    externalWrapper.className = 'paginator-outer-frame';
    externalWrapper.style.cssText = `
        position: relative;
        overflow: hidden;
        width: ${actualContainerWidth}px;
        height: ${actualContainerHeight}px;
    `;

    displayContainer.parentNode.insertBefore(externalWrapper, displayContainer);
    externalWrapper.appendChild(displayContainer);

    displayContainer.style.cssText = `
        position: absolute;
        display: flex;
        flex-wrap: nowrap;
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: visible;
        top: 0;
        left: 0;
        height: auto;
        width: auto;
        transition: transform ${activeSettings.transitionDurationMs}ms ease-out;
    `;
    if (activeSettings.scrollDirection === 'vertical') {
        displayContainer.style.flexDirection = 'column';
    } else {
        displayContainer.style.flexDirection = 'row';
    }

    while (displayContainer.firstChild) {
        displayContainer.removeChild(displayContainer.firstChild);
    }

    const pageContainers = [];
    let currentItemCol = 0;
    let currentItemRow = 0;
    let currentPageNum = 0;

    let activePageDiv = null;

    originalItems.forEach((item, index) => {
        currentItemCol++;
        if (currentItemCol > activeSettings.itemColumns) {
            currentItemCol = 1;
            currentItemRow++;
        }
        if (currentItemRow > activeSettings.itemRows) {
            currentItemRow = 1;
            currentItemCol = 1;
            currentPageNum++;
        }

        if (!activePageDiv || currentPageNum !== pageContainers.length) {
            activePageDiv = document.createElement('div');
            activePageDiv.className = `paginator-page paginator-page-${currentPageNum}`;
            activePageDiv.style.cssText = `
                position: relative;
                width: ${actualContainerWidth}px;
                height: ${actualContainerHeight}px;
                flex-shrink: 0;
                box-sizing: border-box;
            `;
            pageContainers.push(activePageDiv);
            displayContainer.appendChild(activePageDiv);
        }

        item.dataset.layoutCol = currentItemCol;
        item.dataset.layoutRow = currentItemRow;
        item.dataset.layoutPage = currentPageNum;

        const itemLeftPosition = Math.round((currentItemCol * itemCellWidth - itemCellWidth / 2));
        const itemTopPosition = Math.round((currentItemRow * itemCellHeight - itemCellHeight / 2));

        item.style.cssText = `
            position: absolute;
            display: block;
            margin: 0;
            top: ${itemTopPosition}px;
            left: ${itemLeftPosition}px;
            transform: translate(-50%, -50%);
        `;

        activePageDiv.appendChild(item);

        const imgElement = item.querySelector('img');
        if (imgElement && !imgElement.complete) {
            imgElement.addEventListener('load', () => {
                // The transform: translate(-50%, -50%) handles recentering automatically
                // once the item's dimensions are known. No explicit repositioning needed here.
            });
        }
    });

    moduleState.totalPageCount = pageContainers.length;

    if (activeSettings.scrollDirection === 'vertical') {
        displayContainer.style.width = `${actualContainerWidth}px`;
        displayContainer.style.height = `${actualContainerHeight * moduleState.totalPageCount}px`;
    } else {
        displayContainer.style.width = `${actualContainerWidth * moduleState.totalPageCount}px`;
        displayContainer.style.height = `${actualContainerHeight}px`;
    }

    let navigationControls = null;
    if (moduleState.totalPageCount > 1 && activeSettings.enableNavigationButtons) {
        navigationControls = document.createElement('div');
        navigationControls.className = 'paginator-navigation-controls';
        externalWrapper.appendChild(navigationControls);

        for (let i = 0; i < moduleState.totalPageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = `Page ${i + 1}`;
            pageButton.dataset.pageIndex = i;
            if (i === 0) {
                pageButton.classList.add('active-page');
            }
            pageButton.addEventListener('click', () => navigateToPage(parseInt(pageButton.dataset.pageIndex, 10)));
            navigationControls.appendChild(pageButton);
        }
    }

    const applyTransform = (translateX, translateY, durationMs = activeSettings.transitionDurationMs, ease = 'ease-out') => {
        moduleState.currentTransformX = translateX;
        moduleState.currentTransformY = translateY;
        displayContainer.style.transition = `transform ${durationMs}ms ${ease}`;
        displayContainer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    };

    const navigateToPage = (targetPageIndex, customDuration = activeSettings.transitionDurationMs, customEase = 'ease-out') => {
        if (targetPageIndex < 0) {
            targetPageIndex = 0;
        } else if (targetPageIndex >= moduleState.totalPageCount) {
            targetPageIndex = moduleState.totalPageCount - 1;
        }

        moduleState.currentPageIndex = targetPageIndex;

        let targetTranslateX = 0;
        let targetTranslateY = 0;

        if (activeSettings.scrollDirection === 'vertical') {
            targetTranslateY = -targetPageIndex * actualContainerHeight;
        } else {
            targetTranslateX = -targetPageIndex * actualContainerWidth;
        }

        applyTransform(targetTranslateX, targetTranslateY, customDuration, customEase);

        if (navigationControls) {
            Array.from(navigationControls.children).forEach((btn, idx) => {
                if (idx === targetPageIndex) {
                    btn.classList.add('active-page');
                } else {
                    btn.classList.remove('active-page');
                }
            });
        }
    };

    const paginatorActions = {
        goToPage: (index) => navigateToPage(index - 1),
        showNext: () => navigateToPage(moduleState.currentPageIndex + 1),
        showPrevious: () => navigateToPage(moduleState.currentPageIndex - 1)
    };

    displayContainer.paginator = paginatorActions;

    let pointerDownCoordinates = { x: 0, y: 0 };
    let startingTransformForInteraction = { x: 0, y: 0 };

    const interactionStart = (event) => {
        if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'A' && event.target.tagName !== 'INPUT') {
            event.preventDefault();
        }

        displayContainer.style.transition = 'none';

        moduleState.isInteracting = true;
        moduleState.recentInteractionEvents = [];

        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        pointerDownCoordinates = { x: clientX, y: clientY };

        const currentTransformMatrix = window.getComputedStyle(displayContainer).transform;
        const matrixValues = currentTransformMatrix.match(/matrix.*\((.+)\)/);
        if (matrixValues && matrixValues[1]) {
            const values = matrixValues[1].split(', ');
            startingTransformForInteraction = {
                x: parseFloat(values[12] || values[4]),
                y: parseFloat(values[13] || values[5])
            };
        } else {
             startingTransformForInteraction = { x: 0, y: 0 }; // Default if no transform applied yet
        }

        if (event.type === 'touchstart') {
            document.addEventListener('touchmove', interactionMove, { passive: false });
            document.addEventListener('touchend', interactionEnd);
            document.addEventListener('touchcancel', interactionEnd);
        } else {
            document.addEventListener('mousemove', interactionMove);
            document.addEventListener('mouseup', interactionEnd);
        }
    };

    const interactionMove = (event) => {
        if (!moduleState.isInteracting) return;
        event.preventDefault();

        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        const deltaX = clientX - pointerDownCoordinates.x;
        const deltaY = clientY - pointerDownCoordinates.y;

        let newTranslateX = startingTransformForInteraction.x;
        let newTranslateY = startingTransformForInteraction.y;

        if (activeSettings.scrollDirection === 'vertical') {
            newTranslateY = startingTransformForInteraction.y + deltaY;
        } else {
            newTranslateX = startingTransformForInteraction.x + deltaX;
        }

        displayContainer.style.transform = `translate3d(${newTranslateX}px, ${newTranslateY}px, 0)`;

        const currentTime = Date.now();
        moduleState.recentInteractionEvents.push({ time: currentTime, x: clientX, y: clientY });
        while (moduleState.recentInteractionEvents.length > 5) {
            moduleState.recentInteractionEvents.shift();
        }
    };

    const easeOutQuad = (t) => t * (2 - t);

    const animateInertia = () => {
        const elapsed = Date.now() - moduleState.animationStartTime;
        const progress = Math.min(1, elapsed / moduleState.animationDuration);
        const easedProgress = easeOutQuad(progress);

        const currentValue = moduleState.animationStartValue + (moduleState.animationEndValue - moduleState.animationStartValue) * easedProgress;

        let currentX = moduleState.currentTransformX;
        let currentY = moduleState.currentTransformY;

        if (moduleState.animationAxis === 'x') {
            currentX = currentValue;
        } else {
            currentY = currentValue;
        }

        displayContainer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        moduleState.currentTransformX = currentX;
        moduleState.currentTransformY = currentY;

        if (progress < 1) {
            moduleState.animationFrameId = requestAnimationFrame(animateInertia);
        } else {
            displayContainer.style.transform = `translate3d(${
                moduleState.animationAxis === 'x' ? moduleState.animationEndValue : moduleState.currentTransformX
            }px, ${
                moduleState.animationAxis === 'y' ? moduleState.animationEndValue : moduleState.currentTransformY
            }px, 0)`;
            moduleState.currentTransformX = moduleState.animationAxis === 'x' ? moduleState.animationEndValue : moduleState.currentTransformX;
            moduleState.currentTransformY = moduleState.animationAxis === 'y' ? moduleState.animationEndValue : moduleState.currentTransformY;
        }
    };

    const interactionEnd = (event) => {
        if (!moduleState.isInteracting) return;

        moduleState.isInteracting = false;
        displayContainer.style.transition = '';

        if (event.type === 'touchend' || event.type === 'touchcancel') {
            document.removeEventListener('touchmove', interactionMove);
            document.removeEventListener('touchend', interactionEnd);
            document.removeEventListener('touchcancel', interactionEnd);
        } else {
            document.removeEventListener('mousemove', interactionMove);
            document.removeEventListener('mouseup', interactionEnd);
        }

        const currentTransformMatrix = window.getComputedStyle(displayContainer).transform;
        const matrixValues = currentTransformMatrix.match(/matrix.*\((.+)\)/);
        const finalX = parseFloat(matrixValues[12] || matrixValues[4]);
        const finalY = parseFloat(matrixValues[13] || matrixValues[5]);

        let velocity = { x: 0, y: 0 };
        if (moduleState.recentInteractionEvents.length > 1) {
            const firstEvent = moduleState.recentInteractionEvents[0];
            const lastEvent = moduleState.recentInteractionEvents[moduleState.recentInteractionEvents.length - 1];
            const timeDelta = lastEvent.time - firstEvent.time;

            if (timeDelta > 0) {
                velocity.x = (lastEvent.x - firstEvent.x) / timeDelta;
                velocity.y = (lastEvent.y - firstEvent.y) / timeDelta;
            }
        }

        let inertiaOffset = 0;
        let targetTranslatePosition = 0;
        let currentPositionValue = 0;
        let dimensionPerItem = 0;
        let maxTranslateValue = 0;

        if (activeSettings.scrollDirection === 'vertical') {
            inertiaOffset = velocity.y * activeSettings.swipeInertiaFactor;
            currentPositionValue = finalY;
            dimensionPerItem = actualContainerHeight;
            maxTranslateValue = -(moduleState.totalPageCount - 1) * dimensionPerItem;
        } else {
            inertiaOffset = velocity.x * activeSettings.swipeInertiaFactor;
            currentPositionValue = finalX;
            dimensionPerItem = actualContainerWidth;
            maxTranslateValue = -(moduleState.totalPageCount - 1) * dimensionPerItem;
        }

        targetTranslatePosition = currentPositionValue + inertiaOffset;

        if (targetTranslatePosition > 0) {
            targetTranslatePosition = 0;
        } else if (targetTranslatePosition < maxTranslateValue) {
            targetTranslatePosition = maxTranslateValue;
        }

        if (activeSettings.enableNavigationButtons) {
            let snapPageIndex = 0;
            if (dimensionPerItem > 0) {
                snapPageIndex = Math.round(-targetTranslatePosition / dimensionPerItem);
            }
            navigateToPage(snapPageIndex);
        } else {
            moduleState.animationAxis = activeSettings.scrollDirection === 'horizontal' ? 'x' : 'y';
            moduleState.animationStartValue = activeSettings.scrollDirection === 'horizontal' ? finalX : finalY;
            moduleState.animationEndValue = targetTranslatePosition;
            moduleState.animationDuration = Math.max(100, Math.abs(inertiaOffset));
            moduleState.animationStartTime = Date.now();

            cancelAnimationFrame(moduleState.animationFrameId);
            moduleState.animationFrameId = requestAnimationFrame(animateInertia);
        }
    };

    displayContainer.addEventListener('mousedown', interactionStart);
    displayContainer.addEventListener('touchstart', interactionStart, { passive: false });

    navigateToPage(0, 0);

    return paginatorActions;
};