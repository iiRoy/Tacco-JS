(function () {
    'use strict';

    let displayContainerBase;
    let visualStorySystem;

    const customValidationEngine = (() => {
        let currentSuiteInitializer = () => {};
        let currentSuiteFinalizer = () => {};

        const logResult = (descriptionText, passStatus, messageDetail) => {
            console.log(`[${passStatus ? 'OK' : 'FAIL'}] ${descriptionText}: ${messageDetail}`);
        };

        const verifyEquivalence = (actualValue, expectedValue, assertionDescription) => {
            const outcome = (actualValue === expectedValue);
            logResult(assertionDescription, outcome, `Expected: ${expectedValue}, Found: ${actualValue}`);
            return outcome;
        };

        const defineValidationSuite = (suiteTitle, suiteOptions, testCasesCollection) => {
            currentSuiteInitializer = suiteOptions.prepareEnvironment || (() => {});
            currentSuiteFinalizer = suiteOptions.cleanEnvironment || (() => {});
            console.log(`\n=== Starting Validation Suite: ${suiteTitle} ===`);
            testCasesCollection.forEach(singleTest => {
                currentSuiteInitializer();
                console.log(`  Executing Test: ${singleTest.description}`);
                singleTest.execute(verifyEquivalence);
                currentSuiteFinalizer();
            });
            console.log(`=== Finished Validation Suite: ${suiteTitle} ===\n`);
        };

        return {
            defineValidationSuite,
            createValidationStep: (descriptionText, verificationLogic) => ({ description: descriptionText, execute: verificationLogic })
        };
    })();

    function configureDisplayMechanism() {
        displayContainerBase = document.getElementById('qunit-fixture');
        if (displayContainerBase) {
            displayContainerBase.innerHTML = '';
        } else {
            console.error("Target DOM element 'qunit-fixture' not found for display configuration.");
            return;
        }

        const renderingSurface = document.createElement('canvas');
        renderingSurface.id = 'story-visualizer-canvas';
        displayContainerBase.appendChild(renderingSurface);

        visualStorySystem = new ComicBook(
            'story-visualizer-canvas',
            ['content/image_a.webp', 'content/image_b.webp', 'content/image_c.webp', 'content/image_d.webp', 'content/image_e.webp', 'content/image_f.webp'],
            { assetBase: './assets_root/' }
        );
    }

    const prepareForInitialState = () => {
        configureDisplayMechanism();
    };

    const prepareForRenderedState = () => {
        configureDisplayMechanism();
        visualStorySystem.draw();
    };

    document.addEventListener('DOMContentLoaded', () => {

        customValidationEngine.defineValidationSuite(
            'Interface Elements Before Rendering',
            { prepareEnvironment: prepareForInitialState },
            [
                customValidationEngine.createValidationStep(
                    'No navigation or utility components should exist initially',
                    (assertionFunction) => {
                        const interfaceComponents = document.querySelectorAll('.interaction-panel, .navigation-bar');
                        assertionFunction(interfaceComponents.length, 0, 'Expected zero UI components before rendering.');
                    }
                )
            ]
        );

        customValidationEngine.defineValidationSuite(
            'Interface Elements After Rendering',
            { prepareEnvironment: prepareForRenderedState, cleanEnvironment: () => {} },
            [
                customValidationEngine.createValidationStep(
                    'All necessary navigation and utility components should be present',
                    (assertionFunction) => {
                        const interfaceComponents = document.querySelectorAll('.interaction-panel, .navigation-bar');
                        assertionFunction(interfaceComponents.length, 5, 'Expected five UI components after the rendering process.');
                    }
                )
            ]
        );
    });

})();