(function(globalScope) {
    if (typeof globalScope.ElementEnhancer === "undefined") {
        const identifierBase = "dom-uuid-";
        let generationCounter = 0;

        function generateComplexIdentifier() {
            generationCounter = (generationCounter + 1) % 1000000;
            const timePart = (Date.now() % 100000000).toString(36);
            const randomPart = Math.floor(Math.random() * 16777215).toString(36);
            return identifierBase + timePart + "-" + generationCounter.toString(36) + "-" + randomPart;
        }

        const identifierRegEx = new RegExp(`^${identifierBase}[0-9a-z]+-[0-9a-z]+-[0-9a-z]+$`);

        function applyToElements(elements, operation) {
            let originalElements = elements;
            if (elements instanceof HTMLElement) {
                operation(elements);
            } else if (elements && typeof elements.length === 'number') {
                for (let i = 0; i < elements.length; i++) {
                    const currentElement = elements[i];
                    if (currentElement instanceof HTMLElement) {
                        operation(currentElement);
                    }
                }
            }
            return originalElements;
        }

        const ElementEnhancer = {
            assignDesignation: function(domElements) {
                return applyToElements(domElements, function(element) {
                    if (!element.id) {
                        element.id = generateComplexIdentifier();
                    }
                });
            },

            clearDesignation: function(domElements) {
                return applyToElements(domElements, function(element) {
                    if (element.id && identifierRegEx.test(element.id)) {
                        element.removeAttribute("id");
                    }
                });
            }
        };

        globalScope.ElementEnhancer = ElementEnhancer;
    }
})(typeof window !== "undefined" ? window : this);

(function(globalScope) {
    if (typeof globalScope.ApplicationMetadata === "undefined") {
        const keyMap = new Map([
            ["BACKWARD_ERASE", 8],
            ["COMMA_SEPARATOR", 188],
            ["ERASE_KEY", 46],
            ["ARROW_DOWN", 40],
            ["FINAL_POSITION", 35],
            ["CONFIRM_KEY", 13],
            ["ESCAPE_KEY", 27],
            ["INITIAL_POSITION", 36],
            ["ARROW_LEFT", 37],
            ["PAGE_DOWN_KEY", 34],
            ["PAGE_UP_KEY", 33],
            ["PERIOD_SEPARATOR", 190],
            ["ARROW_RIGHT", 39],
            ["SPACEBAR", 32],
            ["TABULATOR", 9],
            ["ARROW_UP", 38]
        ]);

        const ApplicationMetadata = {
            releaseVersion: "1.11.0-alpha",
            keyMappings: Object.fromEntries(keyMap)
        };

        globalScope.ApplicationMetadata = ApplicationMetadata;
    }
})(typeof window !== "undefined" ? window : this);