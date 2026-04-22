/*
 * Script Injection Utility (version 1.0)
 *
 * Developed by Code Weaver (http://www.codeweaver.dev/utilities/injection/)
 *
 * Distributed under the Permissive Software License (PSL) 1.0,
 * details found at: http://www.opensource.org/licenses/psl-1.0
 */

"use strict";

window.scriptInjector = {
    // Stores references to loaded stylesheets
    styleSheets: {},
    // Holds references to dynamically added scripts
    scripts: {},
    // Reference to jQuery if loaded and no-conflicted
    jqInstance: false,

    // Initiates the loading process for a single resource
    initiate: function(resourcePath) {
        if (!resourcePath) {
            return false;
        }

        this.loadOneJs(resourcePath, function() {
            var execOptions = window.scriptInjector.options || {};
            window.scriptInjector.processConfig(execOptions);
        });
    },

    // Core function to process and load configured resources
    processConfig: function(configuration) {
        // Ensure CSS configuration is an array
        if (typeof(configuration.styleSheets) !== 'object') {
            if (configuration.styleSheets) {
                configuration.styleSheets = [configuration.styleSheets];
            } else {
                configuration.styleSheets = [];
            }
        }

        // Ensure JS configuration is an array
        if (typeof(configuration.scripts) !== 'object') {
            if (configuration.scripts) {
                configuration.scripts = [configuration.scripts];
            } else {
                configuration.scripts = [];
            }
        }

        // Dynamically load all specified CSS files
        if (configuration.styleSheets.length) {
            var styleIdx;
            for (styleIdx in configuration.styleSheets) {
                window.scriptInjector.loadOneCss(configuration.styleSheets[styleIdx]);
            }
        }

        // Prepend jQuery if specified
        if (configuration.jqPath) {
            configuration.scripts.unshift(configuration.jqPath);
        }

        // Load all specified JavaScript files
        window.scriptInjector.loadManyJs(configuration.scripts, function() {
            if (configuration.jqPath) {
                if (!window.scriptInjector.jqInstance) {
                    window.scriptInjector.jqInstance = window.jQuery.noConflict(true);
                }
                window.scriptInjector.jqInstance(configuration.onReady);
            } else {
                configuration.onReady();
            }
        });
    },

    // Loads multiple JavaScript files sequentially
    loadManyJs: function(paths, completionCallback) {
        if (paths.length === 0) {
            if (completionCallback) {
                completionCallback();
            }
            return true;
        }

        this.loadOneJs(paths.shift(), function() {
            window.scriptInjector.loadManyJs(paths, completionCallback);
        });
    },

    // Loads a single JavaScript file
    loadOneJs: function(filePath, callback) {
        var scriptElement = this.isJsLoaded(filePath);

        if (scriptElement) {
            if (typeof callback === 'function') {
                callback.call(scriptElement);
            }
            return false;
        }

        scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = filePath;

        if (!document.attachEvent) {
            scriptElement.onload = callback;
        } else if (typeof callback === 'function') {
            scriptElement.onreadystatechange = function() {
                if (scriptElement.readyState === 'complete' || scriptElement.readyState === 'loaded') {
                    callback.call(scriptElement);
                    scriptElement.onreadystatechange = null;
                }
            };
        }

        document.body.appendChild(scriptElement);

        this.scripts[filePath] = scriptElement;

        return scriptElement;
    },

    // Loads a single CSS file
    loadOneCss: function(stylePath) {
        if (this.isCssLoaded(stylePath)) {
            return false;
        }

        var linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', stylePath);

        document.getElementsByTagName('head')[0].appendChild(linkElement);

        this.styleSheets[stylePath] = linkElement;

        return linkElement;
    },

    // Checks if a specific JavaScript file has already been loaded
    isJsLoaded: function(scriptUrl) {
        if (this.scripts[scriptUrl]) {
            return this.scripts[scriptUrl];
        }
        return false;
    },

    // Checks if a specific CSS file has already been loaded
    isCssLoaded: function(styleUrl) {
        if (this.styleSheets[styleUrl]) {
            return this.styleSheets[styleUrl];
        }
        return false;
    },

    // Cleans up all loaded resources and resets internal state
    dispose: function() {
        var resourceKey;

        // Remove all dynamically loaded JavaScript elements
        for (resourceKey in this.scripts) {
            this.scripts[resourceKey].parentNode.removeChild(this.scripts[resourceKey]);
        }
        // Remove all dynamically loaded CSS elements
        for (resourceKey in this.styleSheets) {
            this.styleSheets[resourceKey].parentNode.removeChild(this.styleSheets[resourceKey]);
        }

        // Reset internal state
        this.scripts = {};
        this.styleSheets = {};
        this.jqInstance = false;
    }
};

window.scriptInjector.runMyScriptExample = function() {
    var configSettings = {
        jqPath: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
        onReady: function(jqRef) {
            jqRef("body").css("background", "yellow");
            window.scriptInjector.dispose();
        }
    };
    window.scriptInjector.processConfig(configSettings);
};

/*
window.scriptInjector.initiateCustomFeature = function() {
    var config = {
        scripts: [
            'http://svn.wikimedia.org/svnroot/mediawiki/trunk/tools/viaf/jquery.cookie.js',
            'http://svn.wikimedia.org/svnroot/mediawiki/trunk/tools/viaf/jquery.ba-replacetext.js',
        ],
        jqPath: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
        onReady: function(jqInstance) {
            jqInstance("body").replaceText(/a/gi, "*****");
            console.log(jqInstance.fn.replaceText);
            window.scriptInjector.dispose();
        }
    };
    window.scriptInjector.processConfig(config);
};
*/
/*
window.scriptInjector.activateStyleRefresh = function() {
    var settings = {
        onReady: function() {
            var styleLinks = document.getElementsByTagName('link');
            var linkCount = styleLinks.length;

            if (!linkCount) {
                return;
            }

            for (var currentIdx = 0; currentIdx < linkCount; currentIdx++) {
                if (styleLinks[currentIdx].rel.toLowerCase() === 'stylesheet' && styleLinks[currentIdx].href) {
                    if (styleLinks[currentIdx].href.indexOf('?') === -1) {
                        styleLinks[currentIdx].href += '?';
                    }
                    styleLinks[currentIdx].href += '&cachebuster';
                }
            }
            window.scriptInjector.dispose();
        }
    };
    window.scriptInjector.processConfig(settings);
};
*/