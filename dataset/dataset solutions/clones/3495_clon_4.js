'use strict'

const extractObservationPoints = (payload) => {
    const segments = payload.trim().split('\n');
    const totalCount = Number.parseInt(segments[0], 10);
    return segments.slice(1, totalCount + 1).map(segment => {
        const parts = segment.split(' ').map(Number);
        return { coordX: parts[0], coordY: parts[1], heightZ: parts[2] };
    });
};

const computeOrthogonalDistance = (p1x, p1y, p2x, p2y) => {
    return Math.abs(p1x - p2x) + Math.abs(p1y - p2y);
};

const assessCandidateSite = (siteX, siteY, allObservations) => {
    const knownHeightPoints = allObservations.filter(obs => obs.heightZ > 0);
    
    let initialHeightDetermination = knownHeightPoints.reduce((acc, currentPoint) => {
        if (acc === null) {
            return currentPoint.heightZ + computeOrthogonalDistance(currentPoint.coordX, currentPoint.coordY, siteX, siteY);
        }
        const currentCalculated = currentPoint.heightZ + computeOrthogonalDistance(currentPoint.coordX, currentPoint.coordY, siteX, siteY);
        if (acc !== currentCalculated) {
            return -2;
        }
        return acc;
    }, null);

    if (initialHeightDetermination === -2) {
        return null;
    }

    if (initialHeightDetermination === null) {
        initialHeightDetermination = -1;
    }

    const zeroHeightPoints = allObservations.filter(obs => obs.heightZ === 0);

    const zeroHeightCheckFails = zeroHeightPoints.some(currentPoint => {
        const distanceToSite = computeOrthogonalDistance(currentPoint.coordX, currentPoint.coordY, siteX, siteY);
        return initialHeightDetermination <= distanceToSite;
    });

    if (zeroHeightCheckFails) {
        return null;
    }

    return initialHeightDetermination;
};

const discoverPotentialBeacons = (observationData) => {
    const coordinateRange = 100;

    const allCandidateSites = Array.from({ length: coordinateRange + 1 }, (_, y) =>
        Array.from({ length: coordinateRange + 1 }, (_, x) => ({ candidateX: x, candidateY: y }))
    ).flat();

    const assessedSites = allCandidateSites.map(site => {
        const height = assessCandidateSite(site.candidateX, site.candidateY, observationData);
        return height !== null ? { x: site.candidateX, y: site.candidateY, h: height } : null;
    });

    const validBeaconResults = assessedSites
        .filter(site => site !== null)
        .map(site => `${site.x} ${site.y} ${site.h}`);

    return validBeaconResults;
};

const runBeaconFinder = (sourceTextData) => {
    const processedData = extractObservationPoints(sourceTextData);
    const finalResults = discoverPotentialBeacons(processedData);
    finalResults.forEach(resultLine => console.log(resultLine));
};

runBeaconFinder(require('fs').readFileSync('/dev/stdin', 'utf-8'));