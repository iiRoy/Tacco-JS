const appConfig = {
    initialResource: "https://my.slack.com",
    interfaceFile: "view.html",
    mainDimensions: {
        horizontal: 1100,
        vertical: 700
    }
};

class WindowManager {
    constructor(configuration) {
        this.settings = configuration;
    }

    static deriveWindowGeometry(xDim, yDim) {
        const desktopWidth = screen.availWidth;
        const desktopHeight = screen.availHeight;

        const leftOffset = Math.round((desktopWidth - xDim) / 2);
        const topOffset = Math.round((desktopHeight - yDim) / 2);

        return {
            bounds: {
                width: xDim,
                height: yDim,
                left: leftOffset,
                top: topOffset
            },
            innerBounds: {
                minWidth: xDim,
                minHeight: yDim
            }
        };
    }

    launchInterface() {
        const geometry = WindowManager.deriveWindowGeometry(
            this.settings.mainDimensions.horizontal,
            this.settings.mainDimensions.vertical
        );

        chrome.app.window.create(
            this.settings.interfaceFile,
            geometry,
            (activeFrame) => this._postCreationSetup(activeFrame, this.settings.initialResource)
        );
    }

    _postCreationSetup(activeFrame, initialContentSource) {
        activeFrame.contentWindow.onload = () => {
            const displayPanel = activeFrame.contentWindow.document.querySelector('webview');
            if (!displayPanel) {
                console.error("Webview element not found in the window content.");
                return;
            }

            this._attachResizingBehavior(activeFrame, displayPanel);
            this._setupContentLoading(displayPanel, initialContentSource);
            this._establishFocusManagement(displayPanel, activeFrame.contentWindow);
            this._handleExternalNavigation(displayPanel);
        };
    }

    _attachResizingBehavior(appFrame, panelElement) {
        appFrame.onBoundsChanged.addListener(() => {
            const currentFrameBounds = appFrame.getBounds();
            panelElement.style.height = `${currentFrameBounds.height}px`;
            panelElement.style.width = `${currentFrameBounds.width}px`;
        });
    }

    _setupContentLoading(panelElement, contentSource) {
        panelElement.src = contentSource;
        panelElement.addEventListener("contentload", () => {
            panelElement.focus();
        });
    }

    _establishFocusManagement(panelElement, parentWindow) {
        parentWindow.onfocus = () => {
            panelElement.focus();
        };
    }

    _handleExternalNavigation(panelElement) {
        panelElement.addEventListener('newwindow', (navEvent) => {
            navEvent.preventDefault();
            window.open(navEvent.targetUrl);
        });
    }
}

chrome.app.runtime.onLaunched.addListener(() => {
    const appInitiator = new WindowManager(appConfig);
    appInitiator.launchInterface();
});