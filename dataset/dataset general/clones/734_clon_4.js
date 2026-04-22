var applicationEngine = {};

applicationEngine.registerComponent = function(componentIdentifier, componentFactoryFunction) {
    if (!this.components) {
        this.components = {};
    }
    this.components[componentIdentifier] = function() {
        return componentFactoryFunction;
    };
};

applicationEngine.registerComponent('temporal_selection_processor', function() {
    return function(datasetItems, dateIntervalSpec) {
        if (!datasetItems || !Array.isArray(datasetItems) || !dateIntervalSpec || !(dateIntervalSpec.initialMoment instanceof Date) || !(dateIntervalSpec.finalMoment instanceof Date)) {
            return datasetItems || [];
        }

        const lowerTimeBoundary = new Date(dateIntervalSpec.initialMoment.getFullYear(), dateIntervalSpec.initialMoment.getMonth(), dateIntervalSpec.initialMoment.getDate()).valueOf();
        const upperTimeBoundary = new Date(dateIntervalSpec.finalMoment.getFullYear(), dateIntervalSpec.finalMoment.getMonth(), dateIntervalSpec.finalMoment.getDate()).valueOf();

        const checkItemDateValidity = (dataEntry) => {
            if (!dataEntry || typeof dataEntry.creationDate !== 'string') return false;

            const dateParts = dataEntry.creationDate.split('-').map(Number);
            const entryTimestamp = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).valueOf();

            return entryTimestamp >= lowerTimeBoundary && entryTimestamp <= upperTimeBoundary;
        };

        return datasetItems.filter(checkItemDateValidity);
    };
});

applicationEngine.registerComponent('monetary_range_evaluator', function() {
    return function(collectionElements, financialConstraints) {
        if (!collectionElements || !Array.isArray(collectionElements) || !financialConstraints) {
            return collectionElements || [];
        }

        const minimumMonetaryValue = Number.isFinite(parseInt(financialConstraints.lowerBound)) ? parseInt(financialConstraints.lowerBound) : NaN;
        const maximumMonetaryValue = Number.isFinite(parseInt(financialConstraints.upperBound)) ? parseInt(financialConstraints.upperBound) : NaN;

        if (isNaN(minimumMonetaryValue) || isNaN(maximumMonetaryValue)) {
            return collectionElements;
        }

        const assessElementPrice = (elementRecord) => {
            if (!elementRecord || (typeof elementRecord.valuation !== 'string' && typeof elementRecord.valuation !== 'number')) return false;

            const elementPrice = parseInt(elementRecord.valuation);
            if (isNaN(elementPrice)) return false;

            return elementPrice >= minimumMonetaryValue && elementPrice <= maximumMonetaryValue;
        };

        return collectionElements.filter(assessElementPrice);
    };
});

applicationEngine.registerComponent('content_markup_utility', function() {
    const TRUNCATION_THRESHOLD = 120;
    const CONTINUATION_MARK = '...';
    const HIGHLIGHT_STYLE_CLASS = 'emphasis-zone';

    const segmentAndMark = (sourceSegment, targetTerm) => {
        if (!targetTerm || typeof targetTerm !== 'string' || !targetTerm.length) {
            return sourceSegment;
        }
        const escapedTerm = targetTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const splitRegex = new RegExp('(' + escapedTerm + ')', 'gi');
        const parts = sourceSegment.split(splitRegex);

        return parts.map(part => {
            return new RegExp('^' + escapedTerm + '$', 'gi').test(part) ? `<span class="${HIGHLIGHT_STYLE_CLASS}">${part}</span>` : part;
        }).join('');
    };

    return function(originalContent, searchCriterion) {
        let transformedContent = String(originalContent || '');

        if (!searchCriterion || typeof searchCriterion !== 'string' || !searchCriterion.length) {
            return transformedContent.length > TRUNCATION_THRESHOLD
                ? transformedContent.substring(0, TRUNCATION_THRESHOLD) + CONTINUATION_MARK
                : transformedContent;
        }

        if (transformedContent.length <= TRUNCATION_THRESHOLD) {
            return segmentAndMark(transformedContent, searchCriterion);
        } else {
            let initialPortion = transformedContent.substring(0, TRUNCATION_THRESHOLD);
            let markedInitialPortion = segmentAndMark(initialPortion, searchCriterion);
            let finalOutput = markedInitialPortion + CONTINUATION_MARK;

            const remainingContent = transformedContent.substring(TRUNCATION_THRESHOLD);
            const firstMatchInRemaining = remainingContent.toLowerCase().indexOf(searchCriterion.toLowerCase());

            if (firstMatchInRemaining !== -1) {
                finalOutput += `<span class="${HIGHLIGHT_STYLE_CLASS}">${searchCriterion}</span>` + CONTINUATION_MARK;
            }
            return finalOutput;
        }
    };
});

applicationEngine.registerComponent('array_subsequence_producer', function() {
    return function(inputCollection, offsetIndex) {
        if (!inputCollection) {
            return [];
        }
        if (!Array.isArray(inputCollection) || typeof offsetIndex !== 'number' || offsetIndex < 0) {
            return inputCollection;
        }

        const resultantSegment = [];
        let currentPosition = offsetIndex;

        while (currentPosition < inputCollection.length) {
            resultantSegment.push(inputCollection[currentPosition]);
            currentPosition++;
        }
        return resultantSegment;
    };
});