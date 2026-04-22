// --- Mocking the underlying utility for testing purposes ---
// This class represents a re-imagined responsive image handling system,
// completely distinct from a jQuery plugin, using modern JS patterns.
class ImageResizerModule {
    constructor(configuration = {}) {
        this.configuration = { identifierPrefix: '', enableLogging: false, ...configuration };
        // Default responsive state, mimicking initial plugin state
        this.currentResponsiveState = {
            activeBreakpoint: 'small',
            allBreakpoints: ['small'],
            activePosition: 0
        };
        // Internal storage for event callbacks (analogous to deferreds)
        this.eventObservers = {
            onCompletion: [], // Corresponds to 'always'
            onSuccess: [],    // Corresponds to 'done'
            onFailure: [],    // Corresponds to 'fail'
            onProgress: []    // Corresponds to 'progress'
        };
        this.processingPromise = null;
        this.currentProcessingStatus = 'initial'; // 'initial', 'pending', 'resolved', 'rejected'
        this.lastImageLoadReport = null; // Stores imagesLoaded-like data
    }

    // Clone for the `removeQuotes` utility method
    normalizeJsonString(inputData) {
        if (typeof inputData !== 'string') {
            return JSON.stringify(inputData);
        }
        try {
            // Comprehensive cleaning for various malformed JSON string inputs
            let cleanedContent = inputData.trim();

            // Remove outer quotes if present
            if (cleanedContent.startsWith('"') && cleanedContent.endsWith('"')) {
                cleanedContent = cleanedContent.substring(1, cleanedContent.length - 1);
            }
            // Handle specific trailing characters observed in original tests
            if (cleanedContent.endsWith('; }')) {
                cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3) + '}';
            } else if (cleanedContent.endsWith('} ; }')) {
                cleanedContent = cleanedContent.substring(0, cleanedContent.length - 5) + '}';
            } else if (cleanedContent.endsWith(';')) {
                cleanedContent = cleanedContent.substring(0, cleanedContent.length - 1);
            }

            // Unescape any inner escaped quotes to ensure valid JSON parsing
            cleanedContent = cleanedContent.replace(/\\"/g, '"');

            const parsedResult = JSON.parse(cleanedContent);
            return JSON.stringify(parsedResult);
        } catch (e) {
            if (this.configuration.enableLogging) {
                console.error("String parsing failed:", inputData, e);
            }
            // For robust testing, return an empty JSON object string on unrecoverable parse errors
            return JSON.stringify({});
        }
    }

    // Clone for the `findSource` utility method
    determineImagePath(visualElement, responsiveStateData) {
        const stateInfo = responsiveStateData || this.currentResponsiveState;
        const currentTag = stateInfo.activeBreakpoint;
        const allTags = stateInfo.allBreakpoints;
        const dataPrefix = this.configuration.identifierPrefix;

        const retrieveAttribute = (element, tag) => {
            const attributeName = `data-${dataPrefix}${tag}`;
            return element.getAttribute(attributeName);
        };

        // Prioritize the active breakpoint
        let resolvedPath = retrieveAttribute(visualElement, currentTag);
        if (resolvedPath) {
            return resolvedPath;
        }

        // If not found, iterate through breakpoints in descending order of position
        for (let i = stateInfo.activePosition; i >= 0; i--) {
            const tag = allTags[i];
            resolvedPath = retrieveAttribute(visualElement, tag);
            if (resolvedPath) {
                return resolvedPath;
            }
        }
        return undefined;
    }

    // Clone for the `setSource` utility method
    assignImageSource(targetElement, responsiveStateData) {
        const path = this.determineImagePath(targetElement, responsiveStateData);
        if (path !== undefined) {
            targetElement.setAttribute('src', path);
        } else {
            targetElement.removeAttribute('src'); // Explicitly remove 'src' if no match
        }
        return targetElement;
    }

    // Simulates the main plugin call's asynchronous behavior and API return
    initiateImageLoadProcedure(elementsToProcess = [], finalCallback = null) {
        const self = this;
        this.currentProcessingStatus = 'pending';

        this.processingPromise = new Promise((resolve, reject) => {
            if (elementsToProcess.length === 0) {
                // If no elements, resolve immediately (mimics original plugin's behavior)
                self.currentProcessingStatus = 'resolved';
                self.lastImageLoadReport = { images: [] };
                resolve([self.currentResponsiveState, self.lastImageLoadReport]);
                return;
            }

            let successfulLoads = 0;
            let failedLoads = 0;
            // Simulate imagesLoaded behavior with random success/failure
            const simulatedImageReports = elementsToProcess.map(el => {
                const isLoadSuccessful = Math.random() < 0.7; // 70% chance of success
                return {
                    img: el,
                    isLoaded: isLoadSuccessful,
                    status: isLoadSuccessful ? 'loaded' : 'error'
                };
            });
            self.lastImageLoadReport = { images: simulatedImageReports };

            simulatedImageReports.forEach((imageReport) => {
                if (imageReport.isLoaded) {
                    successfulLoads++;
                } else {
                    failedLoads++;
                }
                // Notify progress listeners for each image
                self.eventObservers.onProgress.forEach(cb => cb(self.currentResponsiveState, self.lastImageLoadReport, imageReport));
            });

            // Determine final promise state
            if (failedLoads === 0) {
                self.currentProcessingStatus = 'resolved';
                resolve([self.currentResponsiveState, self.lastImageLoadReport]);
            } else {
                self.currentProcessingStatus = 'rejected';
                reject([self.currentResponsiveState, self.lastImageLoadReport]);
            }
        });

        // Attach internal event observers to the promise
        this.processingPromise.then(args => {
            self.eventObservers.onSuccess.forEach(cb => cb(...args));
            self.eventObservers.onCompletion.forEach(cb => cb(...args));
        }).catch(args => {
            self.eventObservers.onFailure.forEach(cb => cb(...args));
            self.eventObservers.onCompletion.forEach(cb => cb(...args));
        });

        // If a direct callback is provided, attach it to both success and failure (like 'always')
        if (finalCallback && typeof finalCallback === 'function') {
            this.processingPromise.then(args => finalCallback(...args)).catch(args => finalCallback(...args));
        }

        // Return a promise-like object that also includes instance properties
        const enhancedAPI = {
            // Expose core utility methods directly
            normalizeJsonString: this.normalizeJsonString.bind(this),
            determineImagePath: this.determineImagePath.bind(this),
            assignImageSource: this.assignImageSource.bind(this),
            // Expose current breakpoint info (analogous to `test.breakpoint`)
            get breakpointInfo() { return self.currentResponsiveState; },
            // Deferred-like API methods
            getProcessingStatus: () => self.currentProcessingStatus, // 'state'
            onCompletion: (cb) => { self.eventObservers.onCompletion.push(cb); return enhancedAPI; }, // 'always'
            onSuccess: (cb) => { self.eventObservers.onSuccess.push(cb); return enhancedAPI; },       // 'done'
            onFailure: (cb) => { self.eventObservers.onFailure.push(cb); return enhancedAPI; },       // 'fail'
            onProgress: (cb) => { self.eventObservers.onProgress.push(cb); return enhancedAPI; },     // 'progress'
            // For Jest's async/await
            awaitProcessingFinish: () => self.processingPromise
        };

        return enhancedAPI;
    }

    // Method to allow tests to dynamically change breakpoint state
    updateResponsiveState(newState) {
        this.currentResponsiveState = { ...this.currentResponsiveState, ...newState };
    }
}

// --- Helper function to simulate DOM elements for testing ---
// This provides a simple object that mimics key DOM element behaviors
// like `getAttribute`, `setAttribute`, `removeAttribute`.
function createMockHtmlElement(htmlSnippet) {
    const elementAttributes = {};
    const dataAttributeRegex = /data-([a-zA-Z0-9-]+)="([^"]*)"/g;
    let match;
    while ((match = dataAttributeRegex.exec(htmlSnippet)) !== null) {
        elementAttributes[`data-${match[1]}`] = match[2];
    }
    const sourceAttributeRegex = /src="([^"]*)"/;
    const sourceMatch = htmlSnippet.match(sourceAttributeRegex);
    if (sourceMatch) {
        elementAttributes.src = sourceMatch[1];
    }

    return {
        _attributes: elementAttributes,
        getAttribute: function(name) {
            return this._attributes[name];
        },
        setAttribute: function(name, value) {
            this._attributes[name] = value;
        },
        removeAttribute: function(name) {
            delete this._attributes[name];
        }
    };
}

// --- Factory function to obtain the responsive image handler instance ---
// This mimics the flexible invocation of `$.fn.breakpoint(...)`
function obtainResponsiveHandler(...invocationArguments) {
    let elements = [];
    let configOptions = {};
    let completionCallback = null;

    // Parse arguments flexibly
    if (invocationArguments.length === 1) {
        if (Array.isArray(invocationArguments[0])) { // (elementsArray)
            elements = invocationArguments[0];
        } else if (typeof invocationArguments[0] === 'function') { // (callbackFunction)
            completionCallback = invocationArguments[0];
        } else if (typeof invocationArguments[0] === 'object') { // ({ configOptions })
            configOptions = invocationArguments[0];
        }
    } else if (invocationArguments.length === 2) {
        if (Array.isArray(invocationArguments[0])) { // (elementsArray, config/callback)
            elements = invocationArguments[0];
            if (typeof invocationArguments[1] === 'function') {
                completionCallback = invocationArguments[1];
            } else if (typeof invocationArguments[1] === 'object') {
                configOptions = invocationArguments[1];
            }
        } else if (typeof invocationArguments[0] === 'object' && typeof invocationArguments[1] === 'function') { // (config, callback)
            configOptions = invocationArguments[0];
            completionCallback = invocationArguments[1];
        }
    } else if (invocationArguments.length === 3) { // (elementsArray, config, callback)
        elements = invocationArguments[0];
        configOptions = invocationArguments[1];
        completionCallback = invocationArguments[2];
    }

    const handler = new ImageResizerModule(configOptions);

    if (elements.length > 0 || completionCallback) {
        return handler.initiateImageLoadProcedure(elements, completionCallback);
    }
    return handler; // Return the configurable instance if no processing is immediately requested
}


// --- Jest Test Suite ---

describe('Core Helper Functionality', () => {
    let handlerInstance;

    beforeEach(() => {
        // Ensure a fresh instance for each test to prevent state leakage
        handlerInstance = obtainResponsiveHandler({ enableLogging: true });
    });

    it('should correctly process and normalize various JSON string formats', () => {
        const expectedNormalizedJson = JSON.stringify({ "current": "small", "all": ["small", "medium", "large"], "position": 0 });

        // Test 1: Standard JSON string
        expect(handlerInstance.normalizeJsonString('{"current":"small","all":["small","medium","large"],"position":0}')).toEqual(expectedNormalizedJson);
        // Test 2: JSON string enclosed in double quotes (common in CSS values)
        expect(handlerInstance.normalizeJsonString("{\"current\":\"small\",\"all\":[\"small\",\"medium\",\"large\"],\"position\":0}")).toEqual(expectedNormalizedJson);
        // Test 3: JSON string with extraneous whitespace
        expect(handlerInstance.normalizeJsonString("{\"current\" : \"small\", \"all\" : [\"small\",\"medium\",\"large\"], \"position\" : 0 }")).toEqual(expectedNormalizedJson);
        // Test 4: JSON string with whitespace and a trailing semicolon/brace artifact
        expect(handlerInstance.normalizeJsonString("{\"current\" : \"small\", \"all\" : [\"small\",\"medium\",\"large\"], \"position\" : 0 } ; }")).toEqual(expectedNormalizedJson);
    });

    it('should accurately locate the image path from relevant data attributes', () => {
        const mockImageElementA = createMockHtmlElement('<img data-small="path/to/small.jpg">');
        const mockImageElementB = createMockHtmlElement('<img>'); // No data attributes

        // Default responsive state is 'small'
        const currentResponsiveState = handlerInstance.currentResponsiveState;

        expect(handlerInstance.determineImagePath(mockImageElementA, currentResponsiveState)).toBe('path/to/small.jpg');
        expect(handlerInstance.determineImagePath(mockImageElementB, currentResponsiveState)).toBeUndefined();
    });

    it('should fall back through breakpoint labels if the primary match is absent', () => {
        // Configure the handler to be at 'medium' breakpoint but only 'small' data is present
        handlerInstance.updateResponsiveState({ activeBreakpoint: 'medium', allBreakpoints: ['small', 'medium'], activePosition: 1 });
        const mockImageElement = createMockHtmlElement('<img data-small="path/to/backup.jpg">');

        // Should find 'small.jpg' by walking down from 'medium' to 'small'
        expect(handlerInstance.determineImagePath(mockImageElement, handlerInstance.currentResponsiveState)).toBe('path/to/backup.jpg');
    });

    it('should correctly interpret a custom identifier prefix for data attributes', () => {
        const prefixedHandler = obtainResponsiveHandler({ enableLogging: true, identifierPrefix: 'custom-' });
        const mockImageElementWithPrefix = createMockHtmlElement('<img data-custom-small="path/to/custom-small.jpg">');
        const mockImageElementWithoutPrefix = createMockHtmlElement('<img data-small="path/to/small.jpg">');

        expect(prefixedHandler.determineImagePath(mockImageElementWithPrefix, prefixedHandler.currentResponsiveState)).toBe('path/to/custom-small.jpg');
        expect(prefixedHandler.determineImagePath(mockImageElementWithoutPrefix, prefixedHandler.currentResponsiveState)).toBeUndefined(); // Should not find without prefix
    });

    it('should assign the resolved image path to the target element\'s source attribute', () => {
        const inputElementOne = createMockHtmlElement('<img data-small="path/to/image1.jpg">');
        const inputElementTwo = createMockHtmlElement('<img data-medium="path/to/image2.jpg">'); // No 'small' data-attr

        const outputElementOne = handlerInstance.assignImageSource(inputElementOne, handlerInstance.currentResponsiveState);
        const outputElementTwo = handlerInstance.assignImageSource(inputElementTwo, handlerInstance.currentResponsiveState);

        expect(outputElementOne.getAttribute('src')).toBe('path/to/image1.jpg');
        expect(outputElementTwo.getAttribute('src')).toBeUndefined(); // 'src' attribute should be removed if no match
    });
});

describe('Asynchronous Operations and Returned Data Structures', () => {
    let responsiveTool;
    let originalMathRandom;

    beforeEach(() => {
        responsiveTool = obtainResponsiveHandler(); // Fresh instance for each test
        originalMathRandom = Math.random; // Store original Math.random
    });

    afterEach(() => {
        Math.random = originalMathRandom; // Restore Math.random
    });

    it('should expose the current responsive breakpoint state directly on the instance', () => {
        const instanceDefaultState = obtainResponsiveHandler();
        expect(instanceDefaultState.breakpointInfo.activeBreakpoint).toBe('small');
        expect(instanceDefaultState.breakpointInfo.allBreakpoints).toEqual(['small']);
        expect(instanceDefaultState.breakpointInfo.activePosition).toBe(0);
    });

    it('should consistently invoke the completion callback regardless of outcome', async () => {
        // Simulate a scenario with no images, which resolves immediately
        const operationWithoutImages = obtainResponsiveHandler([]);
        expect(operationWithoutImages.getProcessingStatus()).toBe('resolved');

        let completionCallbackTriggered = false;
        await operationWithoutImages.onCompletion((bpState) => {
            completionCallbackTriggered = true;
            expect(bpState.activeBreakpoint).toBe('small');
            expect(bpState.allBreakpoints).toEqual(['small']);
            expect(bpState.activePosition).toBe(0);
        }).awaitProcessingFinish();

        expect(completionCallbackTriggered).toBeTruthy();
    });

    it('should always trigger completion callback even with mixed image loading statuses', async () => {
        // The mock's `initiateImageLoadProcedure` uses random success/failure.
        // This test ensures `onCompletion` is called regardless of the random outcome.
        const imageList = [
            createMockHtmlElement('<img data-small="http://example.com/good.jpg">'),
            createMockHtmlElement('<img data-small="http://example.com/bad.jpg">')
        ];
        const processingResult = obtainResponsiveHandler(imageList);

        expect(processingResult.getProcessingStatus()).toBe('pending');

        let allDone = false;
        await processingResult.onCompletion(() => {
            allDone = true;
        }).awaitProcessingFinish();

        expect(allDone).toBeTruthy();
    });

    it('should trigger success callback with breakpoint and image load details on successful processing', async () => {
        Math.random = () => 0.1; // Force all image loads to succeed

        const singleImage = createMockHtmlElement('<img data-small="http://example.com/success.jpg">');
        const processingResult = obtainResponsiveHandler([singleImage]);

        expect(processingResult.getProcessingStatus()).toBe('pending');

        let successHandlerCalled = false;
        await processingResult.onSuccess((bpState, imageLoadReport) => {
            successHandlerCalled = true;
            expect(processingResult.getProcessingStatus()).toBe('resolved');
            expect(bpState.activeBreakpoint).toBe('small');
            expect(bpState.allBreakpoints).toEqual(['small']);
            expect(bpState.activePosition).toBe(0);
            expect(imageLoadReport.images[0].img).toBe(singleImage);
        }).awaitProcessingFinish();

        expect(successHandlerCalled).toBeTruthy();
    });

    it('should trigger failure callback with breakpoint and image load details on failed processing', async () => {
        Math.random = () => 0.9; // Force all image loads to fail

        const problematicImage = createMockHtmlElement('<img data-small="http://example.com/failure.jpg">');
        const processingResult = obtainResponsiveHandler([problematicImage]);

        expect(processingResult.getProcessingStatus()).toBe('pending');

        let failureHandlerCalled = false;
        await processingResult.onFailure((bpState, imageLoadReport) => {
            failureHandlerCalled = true;
            expect(processingResult.getProcessingStatus()).toBe('rejected');
            expect(bpState.activeBreakpoint).toBe('small');
            expect(bpState.allBreakpoints).toEqual(['small']);
            expect(bpState.activePosition).toBe(0);
            expect(imageLoadReport.images[0].isLoaded).toBe(false);
        }).awaitProcessingFinish();

        expect(failureHandlerCalled).toBeTruthy();
    });

    it('should trigger progress callback for each image as its loading state is determined', async () => {
        Math.random = () => 0.1; // Force all images to "load" for predictable progress

        const multipleImages = [
            createMockHtmlElement('<img data-small="http://example.com/img1.jpg">'),
            createMockHtmlElement('<img data-small="http://example.com/img2.jpg">'),
            createMockHtmlElement('<img data-small="http://example.com/img3.jpg">'),
            createMockHtmlElement('<img data-small="http://example.com/img4.jpg">')
        ];
        const processingResult = obtainResponsiveHandler(multipleImages);
        let progressEventCount = 0;
        let finalBpState;

        // Use a manual Promise to await all progress events before concluding the test
        await new Promise(resolve => {
            processingResult.onProgress((bpState, imgLoadReport, currentImage) => {
                expect(currentImage.isLoaded).toBeTruthy();
                expect(imgLoadReport.images[progressEventCount].img).toBe(multipleImages[progressEventCount]);
                progressEventCount++;
                if (progressEventCount >= multipleImages.length) {
                    finalBpState = bpState;
                    resolve(); // All progress events received
                }
            });
            // Ensure the main processing promise also completes
            processingResult.awaitProcessingFinish();
        });

        expect(progressEventCount).toBe(multipleImages.length);
        expect(finalBpState.activeBreakpoint).toBe('small');
    });

    it('should execute a general callback function with breakpoint info when no images are processed', async () => {
        let generalCallbackExecuted = false;
        await new Promise(resolve => {
            // Invocation style: obtainResponsiveHandler(callbackFunction)
            obtainResponsiveHandler((bpState) => {
                generalCallbackExecuted = true;
                expect(bpState.activeBreakpoint).toBe('small');
                expect(bpState.allBreakpoints).toEqual(['small']);
                expect(bpState.activePosition).toBe(0);
                resolve();
            });
        });
        expect(generalCallbackExecuted).toBeTruthy();
    });

    it('should execute an image-specific callback with breakpoint and image load data', async () => {
        Math.random = () => 0.1; // Force success for the image
        const targetImage = createMockHtmlElement('<img data-small="http://example.com/specific.jpg">');
        let specificCallbackExecuted = false;

        await new Promise(resolve => {
            // Invocation style: obtainResponsiveHandler(elementsArray, callbackFunction)
            obtainResponsiveHandler([targetImage], (bpState, imageLoadReport) => {
                specificCallbackExecuted = true;
                expect(bpState.activeBreakpoint).toBe('small');
                expect(bpState.allBreakpoints).toEqual(['small']);
                expect(bpState.activePosition).toBe(0);
                expect(imageLoadReport.images[0].img).toBe(targetImage);
                resolve();
            });
        });
        expect(specificCallbackExecuted).toBeTruthy();
    });
});