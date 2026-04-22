define(function () {
    'use strict';

    const stringToValueConverter = (inputString) => {
        const processedString = unescape(inputString);

        const numericalResult = parseInt(processedString, 10);
        if (!isNaN(numericalResult)) {
            return numericalResult;
        }

        const literalMappings = new Map([
            ['true', true],
            ['false', false],
            ['null', null],
            ['undefined', undefined]
        ]);

        if (literalMappings.has(processedString)) {
            return literalMappings.get(processedString);
        }

        return processedString;
    };

    const validateComponentContent = (componentText) => {
        if (componentText.includes(':') || componentText.includes(',')) {
            throw new Error('supports only simple strings');
        }
    };

    const fragmentDeconstructor = (sourceAddress) => {
        let finalMap = {};
        if (!sourceAddress) {
            return finalMap;
        }

        const cleanedAddress = sourceAddress.startsWith('#') ? sourceAddress.substring(1) : sourceAddress;
        if (!cleanedAddress) {
            return finalMap;
        }

        const componentSegments = cleanedAddress.split(',');

        finalMap = componentSegments.reduce((accumulator, currentSegment) => {
            const subParts = currentSegment.split(':');
            const subPartCount = subParts.length;

            if (subPartCount === 1) {
                accumulator[subParts[0]] = true;
            } else if (subPartCount === 2) {
                accumulator[subParts[0]] = stringToValueConverter(subParts[1]);
            } else {
                throw new Error('supports only simple strings');
            }
            return accumulator;
        }, {});

        return finalMap;
    };

    const fragmentConstructor = (inputData) => {
        if (!inputData || Object.keys(inputData).length === 0) {
            return '';
        }

        const constructedSegments = [];
        for (const keyIdentifier of Object.keys(inputData)) {
            const dataValue = inputData[keyIdentifier];
            const stringRepresentation = String(dataValue);
            const encodedRepresentation = escape(stringRepresentation);

            validateComponentContent(encodedRepresentation);

            constructedSegments.push(`${keyIdentifier}:${encodedRepresentation}`);
        }

        return '#' + constructedSegments.join(',');
    };

    return {
        stringToValueConverter: stringToValueConverter,
        fragmentDeconstructor: fragmentDeconstructor,
        fragmentConstructor: fragmentConstructor
    };
});