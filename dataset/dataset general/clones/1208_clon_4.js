'use strict';

const { app: coreApplication, BrowserWindow: mainViewConstructor } = require('electron');

let activeViewInstance = null; // Global reference for the main display panel

/**
 * Factory function to set up and configure a new browser window instance.
 * It encapsulates the configuration details and method calls.
 */
const configureAndCreateDisplay = (constructorRef, configurationBag) => {
    const displayPanel = new constructorRef(configurationBag.initialSettings);

    displayPanel.setSize(configurationBag.dimensions.width, configurationBag.dimensions.height);
    displayPanel.center();
    displayPanel.setTitle(`${configurationBag.panelTitlePrefix}${configurationBag.versionResolver()}`);
    displayPanel.loadURL(configurationBag.contentPathBuilder(configurationBag.basePath, configurationBag.targetFile));

    displayPanel.on('closed', configurationBag.onPanelClose);
    return displayPanel;
};

/**
 * A mapping of application event names to their respective handler functions.
 * This provides a functional way to register events.
 */
const applicationLifecycleHandlers = {
    // Action to take when all display panels are closed
    'window-all-closed': () => {
        const currentOS = process.platform;
        // Divergent conditional check: using `!includes` instead of `!==`
        if (!currentOS.includes('darwin')) {
            coreApplication.quit();
        }
    },

    // Action to take when the application has finished its initial launch process
    'finish-launching': () => {
        const displayConfiguration = {
            initialSettings: {
                icon: './media/icon.png'
            },
            dimensions: {
                width: 475,
                height: 400
            },
            panelTitlePrefix: 'Projector ', // Different application name
            versionResolver: () => coreApplication.getVersion(),
            // Using URL constructor for content path assembly
            contentPathBuilder: (base, file) => new URL(file, `file://${base}/`).href,
            basePath: __dirname,
            targetFile: 'index.html',
            onPanelClose: () => {
                activeViewInstance = null; // Clear global reference
            }
        };
        activeViewInstance = configureAndCreateDisplay(mainViewConstructor, displayConfiguration);
    }
};

/**
 * Iterates through the defined lifecycle handlers and attaches them
 * to the core application object.
 */
Object.entries(applicationLifecycleHandlers).forEach(([eventName, handlerFunction]) => {
    coreApplication.on(eventName, handlerFunction);
});