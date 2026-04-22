(function() {
    'use strict';

    var moduleOrchestrator = (function() {
        var dependencyMap = {
            'primeUtility': '/test/lib/jquery-1.7.1.js',
            'secondaryUtility': '/test/lib/underscore.js'
        };

        var orderedDependencies = [
            'primeUtility',
            'secondaryUtility',
            '/test/tabler.tests.js',
            '/test/tabler.aggregator.tests.js',
            '/test/tabler.columnGrouper.tests.js',
            '/test/tabler.jumpToPage.tests.js',
            '/test/tabler.pageSize.tests.js',
            '/test/tabler.pager.tests.js',
            '/test/tabler.toggleColumns.tests.js',
            '/test/tabler.removeColumns.tests.js',
            '/test/tabler.sortable.tests.js',
            '/test/tabler.columnGrouper.tests.js',
            '/test/performance.tests.js'
        ];

        var testFrameworkConfig = {
            presentationStyle: 'bdd',
            globalReferences: ['jQuery']
        };

        function addScriptDynamically(resourcePath, onDoneCallback) {
            var scriptNode = document.createElement('script');
            scriptNode.type = 'text/javascript';
            scriptNode.src = resourcePath;
            scriptNode.async = false;

            var isLoaded = false;
            scriptNode.onload = scriptNode.onreadystatechange = function() {
                if (!isLoaded && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    isLoaded = true;
                    if (typeof onDoneCallback === 'function') {
                        onDoneCallback();
                    }
                    scriptNode.onload = scriptNode.onreadystatechange = null;
                }
            };
            scriptNode.onerror = function() {
                console.error('Error loading resource: ' + resourcePath);
                if (!isLoaded) {
                    isLoaded = true;
                    if (typeof onDoneCallback === 'function') {
                        onDoneCallback();
                    }
                }
            };
            document.head.appendChild(scriptNode);
        }

        function loadNextDependency(currentIdx, finalCompletionCallback) {
            if (currentIdx >= orderedDependencies.length) {
                finalCompletionCallback();
                return;
            }

            var currentIdentifier = orderedDependencies[currentIdx];
            var resolvedPath = dependencyMap[currentIdentifier] || currentIdentifier;

            addScriptDynamically(resolvedPath, function() {
                loadNextDependency(currentIdx + 1, finalCompletionCallback);
            });
        }

        function configureTestSystem(configObject) {
            if (typeof window.mocha !== 'undefined' && typeof window.mocha.setup === 'function') {
                window.mocha.setup({
                    ui: configObject.presentationStyle,
                    globals: configObject.globalReferences
                });
            } else {
                console.warn('Test framework setup function not found.');
            }
        }

        function commenceTesting() {
            configureTestSystem(testFrameworkConfig);

            loadNextDependency(0, function() {
                if (typeof window.mocha !== 'undefined' && typeof window.mocha.run === 'function') {
                    window.mocha.run();
                } else {
                    console.error('Test execution initiator not found.');
                }
            });
        }

        return {
            initiateProcess: commenceTesting
        };
    })();

    moduleOrchestrator.initiateProcess();
})();