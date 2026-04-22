class ScreenHeader {
    constructor() {
        this.displayContainer = jQuery('<div></div>');
        this.composeLayout();
    }

    composeLayout() {
        this.displayContainer.html(`
            <nav>
                <ul class="nav-links">
                    <li id="main-link"><a href="#/">Dashboard</a></li>
                    <li id="panels-link"><a href="#/panels">Modules</a></li>
                </ul>
            </nav>
        `);
        return this.displayContainer;
    }

    activateNavigationItem(labelKey) {
        this.displayContainer.find('.active').removeClass('active');
        this.displayContainer.find(`#${labelKey}`).addClass('active');
    }

    get element() {
        return this.displayContainer;
    }
}

class MainDisplay {
    constructor() {
        this.displayContainer = jQuery('<div><h3>Welcome to the Dashboard!</h3><p>This is your primary content area.</p></div>');
    }

    get element() {
        return this.displayContainer;
    }
}

class PanelDisplay {
    constructor() {
        this.displayContainer = jQuery('<div><h3>Modules Overview</h3><p>Manage your application modules here.</p></div>');
    }

    get element() {
        return this.displayContainer;
    }
}

class ApplicationEngine {
    constructor() {
        this._headerComponent = null;
        this._mainComponent = null;
        this._panelComponent = null;

        this._pathHandlers = {
            "": this.presentMainView.bind(this),
            "panels": this.presentPanelView.bind(this)
        };

        this.initiateSystem();
    }

    initiateSystem() {
        this._headerComponent = new ScreenHeader();
        jQuery('.top-bar').html(this._headerComponent.element);
    }

    _evaluateCurrentPath() {
        const pathIdentifier = window.location.hash.slice(1).split('?')[0];
        const handlerFunction = this._pathHandlers[pathIdentifier];
        if (handlerFunction) {
            handlerFunction();
        } else {
            this._pathHandlers[""](); // Default to main if path not found
        }
    }

    _beginRouting() {
        window.addEventListener('hashchange', this._evaluateCurrentPath.bind(this));
        this._evaluateCurrentPath(); // Process initial path
    }

    presentMainView() {
        if (!this._mainComponent) {
            this._mainComponent = new MainDisplay();
        }
        jQuery('#main-area').html(this._mainComponent.element);
        this._headerComponent.activateNavigationItem('main-link');
    }

    presentPanelView() {
        if (!this._panelComponent) {
            this._panelComponent = new PanelDisplay();
        }
        jQuery('#main-area').html(this._panelComponent.element);
        this._headerComponent.activateNavigationItem('panels-link');
    }
}

function launchApplication() {
    const coreApplication = new ApplicationEngine();
    coreApplication._beginRouting();
}

// Simulate asynchronous resource loading before app start
setTimeout(launchApplication, 0);