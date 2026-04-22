'use strict';

const processAntDynamics = () => {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

    const [countOfEntities, trackCircumference, travelDuration] = rawData[0].split(' ').map(Number);

    const entityConfigurations = rawData.slice(1, 1 + countOfEntities).map(lineContent => {
        const [initialPoint, movementIndicator] = lineContent.split(' ').map(Number);
        // Map movementIndicator (1 or 2) to actual direction (1 or -1)
        return [initialPoint, movementIndicator === 1 ? 1 : -1];
    });

    // Compute the final positions for each entity assuming they pass through each other
    // The (travelDuration % trackCircumference) optimization is valid for calculating final position modulo L
    const hypotheticalFinalPositions = entityConfigurations.map(([initialPoint, direction]) => {
        const displacedPoint = initialPoint + direction * (travelDuration % trackCircumference);
        // Ensure result is always positive within [0, trackCircumference-1]
        return (displacedPoint % trackCircumference + trackCircumference) % trackCircumference;
    });

    const [firstEntityInitialPoint, firstEntityDirection] = entityConfigurations[0];
    const firstEntityHypotheticalFinalPosition = hypotheticalFinalPositions[0];

    // Determine the number of times the first entity effectively "crosses" other entities
    // This is crucial for calculating the identity shift.
    let collisionAggregate = 0;
    for (let currentEntityIndex = 1; currentEntityIndex < countOfEntities; ++currentEntityIndex) {
        const [otherEntityInitialPoint, otherEntityDirection] = entityConfigurations[currentEntityIndex];

        // If entities move in the same direction, their relative order doesn't change due to "crossing"
        if (otherEntityDirection === firstEntityDirection) {
            continue;
        }

        // Calculate the initial distance between the first entity and the current other entity
        // Direction of the first entity affects how 'distance' is perceived.
        const initialRelativeDistance = (firstEntityDirection * (otherEntityInitialPoint - firstEntityInitialPoint) + trackCircumference) % trackCircumference;

        // Calculate how many full "laps" of relative distance are covered, plus one for the current segment
        // The effective relative speed is 2 when moving towards each other.
        // Math.trunc is used for integer division, consistent with bitwise OR 0 in original.
        const relativePasses = Math.trunc((2 * travelDuration - initialRelativeDistance) / trackCircumference) + 1;
        collisionAggregate = (collisionAggregate + relativePasses) % countOfEntities;
    }

    // Calculate the total identity shift for the first entity based on its direction and collisions
    const entityIdentityOffset = (firstEntityDirection * collisionAggregate + countOfEntities) % countOfEntities;

    // Create a sorted list of all hypothetical final positions
    const sortedHypotheticalFinalPositions = [...hypotheticalFinalPositions].sort((a, b) => a - b);

    // Find the index of the first entity's hypothetical final position within the sorted list
    const firstEntitySortedPositionIndex = sortedHypotheticalFinalPositions.indexOf(firstEntityHypotheticalFinalPosition);

    // Calculate the overall rotation needed to align the sorted positions with the actual entity identities
    // This is the difference between where the first entity's position is in the sorted list
    // and how many entities it effectively passed.
    const finalArrangementRotationAmount = (firstEntitySortedPositionIndex - entityIdentityOffset + countOfEntities) % countOfEntities;

    // Helper function to rotate an array
    const circularShift = (collection, shiftValue) => {
        const effectiveShift = (shiftValue % collection.length + collection.length) % collection.length;
        return collection.slice(effectiveShift).concat(collection.slice(0, effectiveShift));
    };

    // Apply the calculated rotation to the sorted positions to get the final arrangement
    const actualFinalPositions = circularShift(sortedHypotheticalFinalPositions, finalArrangementRotationAmount);

    // Output the final positions, each on a new line
    console.log(actualFinalPositions.join('\n'));
};

processAntDynamics();