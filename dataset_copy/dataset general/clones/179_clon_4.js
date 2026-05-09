document.addEventListener('DOMContentLoaded', function() {

    const visualAssetMappings = [
        {
            label: 'tiny',
            sourceURI: 'http://placehold.it/320x240',
            minimumWidth: null,
            maximumWidth: 319
        },
        {
            label: 'mid',
            sourceURI: 'http://placehold.it/640x460',
            minimumWidth: 320,
            maximumWidth: 639
        },
        {
            label: 'vast',
            sourceURI: 'http://placehold.it/800x600',
            minimumWidth: 640,
            maximumWidth: null
        }
    ];

    function generateMediaDescriptor() {
        return visualAssetMappings.map(asset => {
            let parts = [];
            if (asset.minimumWidth !== null) {
                parts.push(`min-width: ${asset.minimumWidth}`);
            }
            if (asset.maximumWidth !== null) {
                parts.push(`max-width: ${asset.maximumWidth}`);
            }
            const mediaQuery = parts.length > 0 ? `(${parts.join(', ')})` : '';
            return `[${asset.sourceURI}, ${mediaQuery}]`;
        }).join(', ');
    }

    class ResponsiveImageProcessor {
        static activeProcessors = new Set();

        constructor(imageElement, options = {}) {
            if (!(imageElement instanceof HTMLImageElement)) {
                console.error("ResponsiveImageProcessor requires an HTMLImageElement.");
                return;
            }

            this.targetImage = imageElement;
            this.configuration = {
                onBeforeChange: options.onBeforeChange || null,
                onAfterChange: options.onAfterChange || null
            };
            this.rules = this._parseRules(this.targetImage.getAttribute('data-processor-config') || '');

            ResponsiveImageProcessor.activeProcessors.add(this);
            this.evaluateSource();
        }

        _parseRules(dataAttributeString) {
            const rulePattern = /\[([^,]+),\s*\(([^)]*)\)\]/g;
            let match;
            const parsedRules = [];

            while ((match = rulePattern.exec(dataAttributeString)) !== null) {
                const src = match[1].trim();
                const mediaQueryString = match[2].trim();
                let min = null;
                let max = null;

                const minMatch = /min-width:\s*(\d+)/.exec(mediaQueryString);
                if (minMatch) min = parseInt(minMatch[1], 10);

                const maxMatch = /max-width:\s*(\d+)/.exec(mediaQueryString);
                if (maxMatch) max = parseInt(maxMatch[1], 10);

                parsedRules.push({ src, min, max });
            }

            if (parsedRules.length === 0) {
                 visualAssetMappings.forEach(asset => {
                    parsedRules.push({
                        src: asset.sourceURI,
                        min: asset.minimumWidth,
                        max: asset.maximumWidth
                    });
                });
            }

            return parsedRules;
        }

        _getCurrentContainerWidth() {
            const parent = this.targetImage.parentElement;
            return parent ? parent.offsetWidth : this.targetImage.offsetWidth;
        }

        evaluateSource() {
            const currentWidth = this._getCurrentContainerWidth();
            let newSource = this.targetImage.src;
            let matchedRule = null;

            for (const rule of this.rules) {
                const minMatch = rule.min === null || currentWidth >= rule.min;
                const maxMatch = rule.max === null || currentWidth <= rule.max;

                if (minMatch && maxMatch) {
                    newSource = rule.src;
                    matchedRule = rule;
                    break;
                }
            }

            const initialSource = this.targetImage.src;
            let prevented = false;
            const preventDefaultHandler = () => { prevented = true; };

            const onBeforeChangeTriggered = typeof this.configuration.onBeforeChange === 'function';
            if (onBeforeChangeTriggered) {
                this.configuration.onBeforeChange({
                    targetElement: this.targetImage,
                    currentSource: initialSource,
                    proposedSource: newSource,
                    preventDefault: preventDefaultHandler
                });
            }

            if (!prevented && newSource !== initialSource) {
                this.targetImage.src = newSource;
            }

            if (typeof this.configuration.onAfterChange === 'function') {
                this.configuration.onAfterChange({
                    targetElement: this.targetImage,
                    newSource: this.targetImage.src,
                    matchedRule: (prevented || newSource === initialSource) ? null : matchedRule
                });
            }
        }

        static reflowAllManagedImages() {
            ResponsiveImageProcessor.activeProcessors.forEach(processor => processor.evaluateSource());
        }

        deactivate() {
            ResponsiveImageProcessor.activeProcessors.delete(this);
        }
    }

    const testFailureRecords = [];

    QUnit.done(function (resultsSummary) {
        const compiledTests = [];
        for (let idx = 0; idx < testFailureRecords.length; idx++) {
            const item = testFailureRecords[idx];
            compiledTests.push({
                name: item.name,
                result: item.result,
                expected: item.expected,
                actual: item.actual,
                source: item.source
            });
        }
        resultsSummary.tests = compiledTests;
        window.overallTestResults = resultsSummary;
    });

    QUnit.testStart(function(details) {
        QUnit.log(function(logDetails) {
            if (!logDetails.result) {
                logDetails.name = details.name;
                testFailureRecords.push(logDetails);
            }
        });
    });

    function setupTestEnvironment(testId, initialWidth = null) {
        const containerElement = document.getElementById(testId);
        if (initialWidth !== null) {
            containerElement.style.width = `${initialWidth}px`;
        }
        let imageElement = containerElement.querySelector('img');
        return {
            container: containerElement,
            image: imageElement
        };
    }

    QUnit.test('static-full', function(assertion) {
        const env = setupTestEnvironment('test-static-full');
        const doneAsync = assertion.async();

        new ResponsiveImageProcessor(env.image, {
            onAfterChange: function(actionContext) {
                assertion.equal(visualAssetMappings[2].sourceURI, actionContext.targetElement.src, 'static image should be using larger image source');
                doneAsync();
            }
        });
    });

    QUnit.test('static-half', function(assertion) {
        const env = setupTestEnvironment('test-static-half');
        const doneAsync = assertion.async();

        new ResponsiveImageProcessor(env.image, {
            onAfterChange: function(actionContext) {
                assertion.equal(visualAssetMappings[1].sourceURI, actionContext.targetElement.src, 'static image should be using smaller image source');
                doneAsync();
            }
        });
    });

    QUnit.test('async-full', function(assertion) {
        const env = setupTestEnvironment('test-async-full');
        const doneAsync = assertion.async();

        const dynamicImage = document.createElement('img');
        dynamicImage.setAttribute('data-processor-config', generateMediaDescriptor());
        env.container.appendChild(dynamicImage);

        new ResponsiveImageProcessor(dynamicImage, {
            onAfterChange: function(actionContext) {
                assertion.equal(visualAssetMappings[2].sourceURI, actionContext.targetElement.src, 'async added image should be using larger image source');
                doneAsync();
            }
        });
    });

    QUnit.test('async-half', function(assertion) {
        const env = setupTestEnvironment('test-async-half');
        const doneAsync = assertion.async();

        const dynamicImage = document.createElement('img');
        dynamicImage.setAttribute('data-processor-config', generateMediaDescriptor());
        env.container.appendChild(dynamicImage);

        new ResponsiveImageProcessor(dynamicImage, {
            onAfterChange: function(actionContext) {
                assertion.equal(visualAssetMappings[1].sourceURI, actionContext.targetElement.src, 'async added image should be using smaller image source');
                doneAsync();
            }
        });
    });

    QUnit.test('static-resize', function(assertion) {
        const env = setupTestEnvironment('test-static-resize', 200);
        const doneVast = assertion.async();
        const doneMid = assertion.async();
        const doneTiny = assertion.async();

        let resizeStep = 0;

        new ResponsiveImageProcessor(env.image, {
            onAfterChange: function(actionContext) {
                const currentContainerWidth = env.container.offsetWidth;

                if (currentContainerWidth === 200 && resizeStep === 0) {
                    assertion.equal(visualAssetMappings[0].sourceURI, actionContext.targetElement.src, 'tiny image source should be used when container is 200px wide');
                    doneTiny();
                    env.container.style.width = '500px';
                    ResponsiveImageProcessor.reflowAllManagedImages();
                    resizeStep++;
                } else if (currentContainerWidth === 500 && resizeStep === 1) {
                    assertion.equal(visualAssetMappings[1].sourceURI, actionContext.targetElement.src, 'mid image source should be used when container is 500px wide');
                    doneMid();
                    env.container.style.width = '700px';
                    ResponsiveImageProcessor.reflowAllManagedImages();
                    resizeStep++;
                } else if (currentContainerWidth === 700 && resizeStep === 2) {
                    assertion.equal(visualAssetMappings[2].sourceURI, actionContext.targetElement.src, 'vast image source should be used when container is 700px wide');
                    doneVast();
                    resizeStep++;
                }
            }
        });
    });

    QUnit.test('prevent-default', function(assertion) {
        const env = setupTestEnvironment('test-prevent-default');
        const doneAsync = assertion.async();

        new ResponsiveImageProcessor(env.image, {
            onBeforeChange: function(actionContext) {
                actionContext.preventDefault();
            },
            onAfterChange: function(actionContext) {
                assertion.equal('http://placehold.it/50x50', actionContext.targetElement.src);
                doneAsync();
            }
        });
    });

    QUnit.start();
});