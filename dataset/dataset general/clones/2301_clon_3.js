'use strict';

import CoreUIFramework from 'react';
import UserActivityStream from './modules/UserActivityStream';

const applicationRootElementId = 'app-container';

const getTargetNode = (id) => {
    if (typeof document === 'undefined' || !document.getElementById) {
        console.warn('DOM environment not detected. Cannot retrieve target node for UI initialization.');
        return null;
    }
    const node = document.getElementById(id);
    if (!node) {
        console.error(`Error: Primary DOM node with ID "${id}" was not found. Application cannot mount.`);
    }
    return node;
};

const primaryMountPoint = getTargetNode(applicationRootElementId);

if (primaryMountPoint) {
    const rootComponentInstance = CoreUIFramework.createElement(UserActivityStream, { initialLoadState: 'pending' });

    const renderSettings = {
        renderMode: 'asynchronous',
        enablePerformanceLogging: false,
        onRenderError: (error) => console.error('Application mount error:', error)
    };

    const UIManager = {
        mountApplication: (componentElement, targetNodeElement, settings) => {
            try {
                if (settings.enablePerformanceLogging) {
                    console.time('ApplicationMountDuration');
                }
                console.log(`Initiating UI application mount to target node: ${targetNodeElement.id} in ${settings.renderMode} mode.`);

                CoreUIFramework.render(componentElement, targetNodeElement);

                if (settings.enablePerformanceLogging) {
                    console.timeEnd('ApplicationMountDuration');
                }
                console.log('UI application successfully mounted and initialized.');
            } catch (error) {
                settings.onRenderError(error);
            }
        }
    };

    UIManager.mountApplication(rootComponentInstance, primaryMountPoint, renderSettings);

} else {
    console.warn('Application could not be initialized because the primary mount point was missing or inaccessible.');
    // Optionally add a fallback UI or error message to the body
    if (typeof document !== 'undefined' && document.body) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = 'Failed to load application: Missing root element.';
        document.body.appendChild(errorDiv);
    }
}