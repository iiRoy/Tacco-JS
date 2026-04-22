(function (rootContext) {
    function MarkupProcessorCore() {
        this.transformationSteps = {
            processingSequence: []
        };
    }
    MarkupProcessorCore.prototype.registerPostConversionHook = function(handlerFunction) {
        this.transformationSteps.processingSequence.push(handlerFunction);
    };
    MarkupProcessorCore.prototype.applyTransformations = function(sourceInput) {
        let currentResult = sourceInput;
        for (let i = 0; i < this.transformationSteps.processingSequence.length; i++) {
            currentResult = this.transformationSteps.processingSequence[i](currentResult);
        }
        return currentResult;
    };

    const ContentHardener = {
        createSecureContentHandler: function () {
            const processingUnit = new MarkupProcessorCore();
            processingUnit.registerPostConversionHook(scrutinizeMarkup);
            processingUnit.registerPostConversionHook(rectifyStructure);
            return processingUnit;
        }
    };

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = ContentHardener;
    } else {
        rootContext.SecureMarkupUtility = ContentHardener;
    }

    const allowedTagExpressions = [
        /^(<\/?(b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|i|kbd|li|ol(?: start="\d+")?|p|pre|s|sup|sub|strong|strike|ul)>|<(br|hr)\s?\/?>)$/i,
        /^(<a\shref="((https?|ftp):\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\stitle="[^"<>]+")?\s?>|<\/a>)$/i,
        /^(<img\ssrc="(https?:\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\swidth="\d{1,3}")?(\sheight="\d{1,3}")?(\salt="[^"<>]*")?(\stitle="[^"<>]*")?\s?\/?>)$/i
    ];

    function evaluateElement(elementInput) {
        for (let i = 0; i < allowedTagExpressions.length; i++) {
            if (allowedTagExpressions[i].test(elementInput)) {
                return elementInput;
            }
        }
        return "";
    }

    function scrutinizeMarkup(contentSource) {
        const tagDelimiter = /(<[^>]*>)/gi;
        const segments = contentSource.split(tagDelimiter);

        const processedSegments = segments.map((segment, index) => {
            if (index % 2 !== 0) {
                return evaluateElement(segment);
            } else {
                return segment;
            }
        });

        return processedSegments.join('');
    }

    function rectifyStructure(contentSource) {
        if (!contentSource) return "";

        const tagMatcher = /<\/?(\w+)([^>]*)>/g;
        const resultAccumulator = [];
        const openElementRegistry = [];
        const ignorableElements = new Set(["p", "img", "br", "li", "hr"]); 

        let lastPosition = 0;
        let currentTagMatch;

        while ((currentTagMatch = tagMatcher.exec(contentSource)) !== null) {
            const elementName = currentTagMatch[1].toLowerCase();
            const fullElementString = currentTagMatch[0];
            const isClosingElement = fullElementString.startsWith("</");

            if (currentTagMatch.index > lastPosition) {
                resultAccumulator.push(contentSource.substring(lastPosition, currentTagMatch.index));
            }

            if (ignorableElements.has(elementName)) {
                resultAccumulator.push(fullElementString);
            } else if (!isClosingElement) {
                openElementRegistry.push({ name: elementName, resultIndex: resultAccumulator.length });
                resultAccumulator.push(fullElementString);
            } else {
                let matched = false;
                for (let i = openElementRegistry.length - 1; i >= 0; i--) {
                    if (openElementRegistry[i].name === elementName) {
                        openElementRegistry.splice(i, 1);
                        resultAccumulator.push(fullElementString);
                        matched = true;
                        break;
                    }
                }
            }
            lastPosition = tagMatcher.lastIndex;
        }

        if (lastPosition < contentSource.length) {
            resultAccumulator.push(contentSource.substring(lastPosition));
        }

        for (const unclosedElement of openElementRegistry) {
            resultAccumulator[unclosedElement.resultIndex] = "";
        }

        return resultAccumulator.join('');
    }

})(this);