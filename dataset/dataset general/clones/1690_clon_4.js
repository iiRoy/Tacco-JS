const mergeObjects = (baseObject, ...sourceObjects) => {
    const combinedObject = { ...baseObject };
    for (const currentSource of sourceObjects) {
        if (currentSource && typeof currentSource === 'object') {
            for (const propertyKey in currentSource) {
                if (Object.prototype.hasOwnProperty.call(currentSource, propertyKey)) {
                    combinedObject[propertyKey] = currentSource[propertyKey];
                }
            }
        }
    }
    return combinedObject;
};

const defaultDisplaySettings = {
    positionStrategy: "screen",
    generateUniqueName: true,
    verticalDimension: 500,
    horizontalOffset: 0,
    showAddressBar: false,
    showMenuBar: false,
    displayTitle: null,
    onDisplayClose: null,
    allowResizing: false,
    enableScrollBars: false,
    showStatusBar: false,
    showToolBar: false,
    verticalOffset: 0,
    horizontalDimension: 500
};

function monitorDisplayClosure(displayHandle, closureCallback) {
    if (!displayHandle || displayHandle.closed) {
        closureCallback();
        return;
    }
    setTimeout(() => monitorDisplayClosure(displayHandle, closureCallback), 50);
}

function launchAuxiliaryWindow(resourceLocator, userDisplayPreferences) {
    const finalDisplayConfiguration = mergeObjects(defaultDisplaySettings, userDisplayPreferences);

    if (finalDisplayConfiguration.positionStrategy === "parent") {
        const parentWindowTopPosition = window.screenY;
        const parentWindowLeftPosition = window.screenX;
        const parentWindowContentHeight = window.innerHeight;
        const parentWindowContentWidth = window.innerWidth;

        finalDisplayConfiguration.verticalOffset = parentWindowTopPosition + Math.round((parentWindowContentHeight - finalDisplayConfiguration.verticalDimension) / 2);
        finalDisplayConfiguration.horizontalOffset = parentWindowLeftPosition + Math.round((parentWindowContentWidth - finalDisplayConfiguration.horizontalDimension) / 2);
    } else if (finalDisplayConfiguration.positionStrategy === true || finalDisplayConfiguration.positionStrategy === "screen") {
        const currentMonitorLeft = (typeof window.screenX !== 'undefined') ? window.screenX : screen.left;
        
        finalDisplayConfiguration.verticalOffset = (screen.height - finalDisplayConfiguration.verticalDimension) / 2 - 50;
        finalDisplayConfiguration.horizontalOffset = currentMonitorLeft + (screen.width - finalDisplayConfiguration.horizontalDimension) / 2;
    }

    const windowFeatureMap = new Map();
    windowFeatureMap.set('location', finalDisplayConfiguration.showAddressBar ? 'yes' : 'no');
    windowFeatureMap.set('menubar', finalDisplayConfiguration.showMenuBar ? 'yes' : 'no');
    windowFeatureMap.set('toolbar', finalDisplayConfiguration.showToolBar ? 'yes' : 'no');
    windowFeatureMap.set('scrollbars', finalDisplayConfiguration.enableScrollBars ? 'yes' : 'no');
    windowFeatureMap.set('status', finalDisplayConfiguration.showStatusBar ? 'yes' : 'no');
    windowFeatureMap.set('resizable', finalDisplayConfiguration.allowResizing ? 'yes' : 'no');
    windowFeatureMap.set('height', finalDisplayConfiguration.verticalDimension);
    windowFeatureMap.set('width', finalDisplayConfiguration.horizontalDimension);
    windowFeatureMap.set('left', finalDisplayConfiguration.horizontalOffset);
    windowFeatureMap.set('top', finalDisplayConfiguration.verticalOffset);

    const featureString = Array.from(windowFeatureMap.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

    const uniqueSeed = Date.now();
    const displayIdentifier = finalDisplayConfiguration.displayTitle || (finalDisplayConfiguration.generateUniqueName ? `auxiliary_display_${uniqueSeed}` : 'auxiliary_display');

    const openedDisplay = window.open(resourceLocator, displayIdentifier, featureString);

    if (finalDisplayConfiguration.onDisplayClose && typeof finalDisplayConfiguration.onDisplayClose === 'function') {
        monitorDisplayClosure(openedDisplay, finalDisplayConfiguration.onDisplayClose);
    }

    if (openedDisplay && openedDisplay.focus) {
        openedDisplay.focus();
    }

    return openedDisplay;
}