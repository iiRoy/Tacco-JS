function acquireScriptResource(resourcePath) {
    return new Promise((resolveCompletion, rejectFailure) => {
        const scriptElementNode = document.createElement('script');
        scriptElementNode.src = resourcePath;
        scriptElementNode.onload = () => resolveCompletion(resourcePath);
        scriptElementNode.onerror = (event) => rejectFailure(new Error(`Asset download issue: ${resourcePath}`));
        document.head.appendChild(scriptElementNode);
    });
}

async function orchestrateApplicationStartup() {
    try {
        await Promise.all([
            acquireScriptResource("/assets/javascripts/lib/haml/haml.js"),
            acquireScriptResource("/assets/javascripts/lib/sammy/sammy.js")
        ]);

        await Promise.all([
            acquireScriptResource("/assets/javascripts/lib/sammy/sammy.haml.js"),
            acquireScriptResource("/assets/javascripts/lib/sammy/sammy.title.js"),
            acquireScriptResource("/assets/javascripts/lib/knockout/knockout-latest.js"),
            acquireScriptResource("/assets/javascripts/lib/knockout/knockout.mapping-latest.js")
        ]);

        await Promise.all([
            acquireScriptResource("/assets/javascripts/lib/knockout/knockout.unobtrusive.js"),
            acquireScriptResource("/assets/javascripts/lib/Class/Class.js"),
            acquireScriptResource("/assets/javascripts/src/base/Router.js"),
            acquireScriptResource("/assets/javascripts/src/base/Screen.js")
        ]);

        await Promise.all([
            acquireScriptResource("/assets/javascripts/src/screens/Menu.js"),
            acquireScriptResource("/assets/javascripts/src/base/ScreenFactory.js"),
            acquireScriptResource("/assets/javascripts/src/base/APP.js"),
            acquireScriptResource("/assets/javascripts/plugins.js"),
            acquireScriptResource("/assets/javascripts/script.js")
        ]);

        await Promise.all([
            acquireScriptResource("/assets/javascripts/src/screens/Index.js"),
            acquireScriptResource("/assets/javascripts/src/screens/Content.js")
        ]);

        document.addEventListener('DOMContentLoaded', () => {
            APP.setBindings({
                dataFields: ['primaryAttribute', 'secondaryAttribute']
            });
            APP.register("mainEntry", new Index());
            APP.register("contentDisplay", new Content());
            APP.initMenu("#applicationNavigation");
            APP.init("Core Application - ", "#mainContentArea");
        });

    } catch (loadingError) {
        console.error("Application initialization sequence failed:", loadingError);
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #fee; color: #a00; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 24px; text-align: center;';
        errorContainer.textContent = 'Failed to load essential application components. Please refresh.';
        document.body.appendChild(errorContainer);
    }
}

orchestrateApplicationStartup();