(function() {

    const defaultParameters = {
        classDesignator: "active-font-"
    };

    const fallbackTypes = ["monospace", "sans-serif", "serif", "cursive", "fantasy"];

    function formatClassSuffix(rawText) {
        return rawText.replace(/[\s\-.!~*'()"]/g, "").toLowerCase();
    }

    function evaluateFontRendering(desiredFace, referenceFace) {
        const measurementProbe = document.createElement('span');
        measurementProbe.textContent = 'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmml';
        Object.assign(measurementProbe.style, {
            fontFamily: referenceFace,
            fontSize: '144px',
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            visibility: 'hidden'
        });

        document.body.appendChild(measurementProbe);

        const initialDimension = measurementProbe.offsetWidth;
        measurementProbe.style.fontFamily = `${desiredFace}, ${referenceFace}`;
        const testedDimension = measurementProbe.offsetWidth;

        document.body.removeChild(measurementProbe);

        return initialDimension !== testedDimension;
    }

    function extractFontNames(styleString) {
        return styleString.match(/[^'",;\s][^'",;]*/g) || [];
    }

    function determineOptimalFont(currentElement, fontSequence, classPrefix) {
        let currentSequence = [...fontSequence];
        let sequenceLength = currentSequence.length;

        const ultimateFallback = currentSequence[sequenceLength - 1];
        if (!fallbackTypes.includes(ultimateFallback)) {
            currentSequence.push(fallbackTypes[0]);
            sequenceLength++;
        }

        let referenceType = (currentSequence[sequenceLength - 1] === fallbackTypes[0]) ?
                            fallbackTypes[1] : fallbackTypes[0];

        const foundFont = currentSequence.slice(0, sequenceLength - 1).find(fontCandidate =>
            evaluateFontRendering(fontCandidate.trim(), referenceType)
        );

        if (foundFont) {
            const classRemovalPattern = new RegExp(`\\b${classPrefix}[^\\s]*\\b`, "g");
            currentElement.className = currentElement.className.replace(classRemovalPattern, "").trim();

            const sanitizedLabel = formatClassSuffix(foundFont);
            currentElement.classList.add(`${classPrefix}${sanitizedLabel}`);
        }
    }

    function identifyRenderedFont(elementInput, userSettings = {}) {
        const currentSettings = Object.assign({}, defaultParameters, userSettings);

        if (currentSettings.classDesignator === "") {
            currentSettings.classDesignator = defaultParameters.classDesignator;
        }

        let targetItems;
        if (typeof elementInput === 'string') {
            targetItems = document.querySelectorAll(elementInput);
        } else if (elementInput instanceof HTMLElement) {
            targetItems = [elementInput];
        } else if (elementInput instanceof NodeList || elementInput instanceof HTMLCollection) {
            targetItems = elementInput;
        } else {
            targetItems = document.querySelectorAll('body');
        }

        Array.from(targetItems).forEach(item => {
            const computedStyle = getComputedStyle(item);
            const fontFamilyValue = computedStyle.getPropertyValue('font-family');

            const fontSequence = extractFontNames(fontFamilyValue);
            if (fontSequence.length > 0) {
                determineOptimalFont(item, fontSequence, currentSettings.classDesignator);
            }
        });
    }

    window.FontDetective = identifyRenderedFont;

})();