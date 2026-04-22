const DOM_UTILITIES = {
    attachClick: (selector, handler) => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener('click', handler);
        }
    }
};

const SYSTEM_PARAMETERS = {
    templateLocation: "../../templates/",
    configurationSource: "./config.json"
};

const CORE_APPLICATION_MODULE = (initialSetupFn) => {
    let currentLanguageCode = "en";
    let activeVisualPage = null;
    const refreshHandlers = [];

    const core = {
        get currentLocale() {
            return currentLanguageCode;
        },
        set currentLocale(code) {
            currentLanguageCode = code;
        },
        get currentVisual() {
            return activeVisualPage;
        },
        set currentVisual(path) {
            activeVisualPage = path;
        },
        notifyRefresh: () => {
            refreshHandlers.forEach(handler => handler());
        },
        registerRefreshCallback: (callback) => {
            refreshHandlers.push(callback);
        }
    };

    if (typeof initialSetupFn === 'function') {
        initialSetupFn(core);
    }

    return core;
};

const VIEW_COMPOSITION_MODULE = (coreReference) => {
    return {
        showView: (viewPath) => {
            coreReference.currentVisual = viewPath;
        }
    };
};

(function() {
    const applicationInitializer = (appCore) => {
        const visualComposer = VIEW_COMPOSITION_MODULE(appCore);

        visualComposer.showView("public/login.html");
        visualComposer.showView("public/language.html");

        const languageMap = {
            "#ger": "de",
            "#en": "en"
        };

        appCore.registerRefreshCallback(() => {
            visualComposer.showView(appCore.currentVisual);
        });

        for (const selector in languageMap) {
            DOM_UTILITIES.attachClick(selector, () => {
                appCore.currentLocale = languageMap[selector];
                appCore.notifyRefresh();
            });
        }
    };

    CORE_APPLICATION_MODULE(applicationInitializer);
})();