const pathUtility = require('url').parse;

function segmentizePattern(patternInput) {
    const parts = patternInput.split('/').filter(Boolean);
    const segments = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (part === '*') {
            segments.push({
                kind: 'catchall',
            });
            break; 
        }

        if (part.startsWith(':')) {
            segments.push({
                kind: 'identifier',
                tag: part.substring(1)
            });
            continue;
        }

        segments.push({
            kind: 'literal',
            value: part
        });
    }
    return segments;
}

class PathRegistry {
    constructor() {
        this.registeredPaths = [];
    }

    enrollPath(inputPattern, associatedData) {
        const patternSegments = segmentizePattern(inputPattern);
        const identifierDefinitions = patternSegments
            .filter((seg) => seg.kind === 'identifier')
            .map((seg, idx) => ({ label: seg.tag, position: idx }));

        this.registeredPaths.push({
            patternSegments: patternSegments,
            associatedData: associatedData,
            identifierDefinitions: identifierDefinitions,
            containsWildcard: patternSegments.some(s => s.kind === 'catchall')
        });
    }

    locateResource(requestPath) {
        const uriData = pathUtility(requestPath, true);
        const requestSegments = uriData.pathname.split('/').filter(Boolean);

        let bestOutcome = null;
        let highestSpecificity = -1;

        for (const registeredEntry of this.registeredPaths) {
            const patternSegments = registeredEntry.patternSegments;
            const requestSegmentCount = requestSegments.length;
            const patternSegmentCount = patternSegments.length;

            let currentIdentifierValues = {};
            let currentCatchallRemainder = null;
            let isCurrentCandidate = true;
            let currentSpecificity = 0;
            let matchedSegmentCount = 0;

            for (let i = 0; i < patternSegmentCount; i++) {
                const patternSegment = patternSegments[i];
                const requestSegment = requestSegments[i];

                if (patternSegment.kind === 'catchall') {
                    if (i < requestSegmentCount) {
                        currentCatchallRemainder = requestSegments.slice(i).join('/');
                    }
                    currentSpecificity += 1; 
                    matchedSegmentCount = requestSegmentCount; 
                    break; 
                }

                if (!requestSegment) { 
                    isCurrentCandidate = false;
                    break;
                }

                if (patternSegment.kind === 'literal') {
                    if (patternSegment.value !== requestSegment) {
                        isCurrentCandidate = false;
                        break;
                    }
                    currentSpecificity += 3;
                } else if (patternSegment.kind === 'identifier') {
                    currentIdentifierValues[patternSegment.tag] = requestSegment;
                    currentSpecificity += 2;
                }
                matchedSegmentCount++;
            }

            if (isCurrentCandidate) {
                if (!registeredEntry.containsWildcard && (matchedSegmentCount !== requestSegmentCount || matchedSegmentCount !== patternSegmentCount)) {
                    isCurrentCandidate = false;
                }
            }

            if (isCurrentCandidate) {
                if (currentSpecificity > highestSpecificity) {
                    highestSpecificity = currentSpecificity;
                    bestOutcome = {
                        requestUri: uriData,
                        retrievedPayload: registeredEntry.associatedData,
                        processedSegments: requestSegments,
                        extractedIdentifiers: currentIdentifierValues,
                        trailingRemainder: currentCatchallRemainder
                    };
                }
            }
        }

        if (!bestOutcome) {
             return {
                requestUri: uriData,
                retrievedPayload: null,
                processedSegments: requestSegments,
                extractedIdentifiers: null,
                trailingRemainder: null
            };
        }

        return bestOutcome;
    }
}

module.exports.PathRegistry = PathRegistry;