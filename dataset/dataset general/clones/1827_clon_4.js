"use strict";

class DynamicInjector {
    constructor() {
        this.scriptRegistry = {};
        this.styleRegistry = {};
        this.jQReference = false;
    }

    initiateProcess(resourceURL) {
        if (!resourceURL) {
            return false;
        }

        this.injectScript(resourceURL, () => {
            const currentConfiguration = window.configurationObject || {};
            this.orchestrate(currentConfiguration);
        });
    }

    orchestrate(config) {
        const ensureArray = (item) => {
            if (typeof item === 'object' && item !== null && Array.isArray(item)) {
                return item;
            }
            if (item) {
                return [item];
            }
            return [];
        };

        config.styles = ensureArray(config.styles);
        config.scripts = ensureArray(config.scripts);

        if (config.styles.length > 0) {
            config.styles.forEach(stylePath => {
                this.injectStyle(stylePath);
            });
        }

        if (config.jqueryURL) {
            config.scripts.unshift(config.jqueryURL);
        }

        this.injectScriptsSequentially(config.scripts, () => {
            if (config.jqueryURL) {
                if (!this.jQReference) {
                    this.jQReference = window.jQuery.noConflict(true);
                }
                if (typeof config.completionHandler === 'function') {
                    this.jQReference(config.completionHandler);
                }
            } else {
                if (typeof config.completionHandler === 'function') {
                    config.completionHandler();
                }
            }
        });
    }

    injectScriptsSequentially(resourceURLs, finalCallback) {
        if (resourceURLs.length === 0) {
            if (finalCallback) {
                finalCallback();
            }
            return true;
        }

        const nextURL = resourceURLs.shift();
        this.injectScript(nextURL, () => {
            this.injectScriptsSequentially(resourceURLs, finalCallback);
        });
    }

    injectScript(resourceURL, completionCallback) {
        const existingElement = this.isScriptCached(resourceURL);

        if (existingElement) {
            if (typeof completionCallback === 'function') {
                completionCallback.call(existingElement);
            }
            return false;
        }

        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = resourceURL;

        if (typeof scriptElement.onload !== 'undefined') {
            scriptElement.onload = completionCallback;
        } else if (typeof completionCallback === 'function') {
            scriptElement.onreadystatechange = function () {
                if (scriptElement.readyState === 'complete' || scriptElement.readyState === 'loaded') {
                    completionCallback.call(scriptElement);
                    scriptElement.onreadystatechange = null;
                }
            };
        }

        document.body.appendChild(scriptElement);
        this.scriptRegistry[resourceURL] = scriptElement;
        return scriptElement;
    }

    injectStyle(resourceURL) {
        if (this.isStyleCached(resourceURL)) {
            return false;
        }

        const linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', resourceURL);

        document.getElementsByTagName('head')[0].appendChild(linkElement);
        this.styleRegistry[resourceURL] = linkElement;
        return linkElement;
    }

    isScriptCached(resourceURL) {
        return this.scriptRegistry[resourceURL] || false;
    }

    isStyleCached(resourceURL) {
        return this.styleRegistry[resourceURL] || false;
    }

    purgeInjections() {
        Object.keys(this.scriptRegistry).forEach(key => {
            const element = this.scriptRegistry[key];
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        Object.keys(this.styleRegistry).forEach(key => {
            const element = this.styleRegistry[key];
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        this.scriptRegistry = {};
        this.styleRegistry = {};
        this.jQReference = false;
    }
}

window.dynamicInjector = new DynamicInjector();

window.runExampleTask = function () {
    window.configurationObject = {
        jqueryURL: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
        completionHandler: function ($) {
            $("body").css("background", "yellow");
            window.dynamicInjector.purgeInjections();
        }
    };
    window.dynamicInjector.orchestrate(window.configurationObject);
};