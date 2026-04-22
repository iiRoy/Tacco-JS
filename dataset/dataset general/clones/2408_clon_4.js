const makeCalculusEngine = () => {
    const retrieveMaximum = (val1, val2) => (val1 > val2 ? val1 : val2);
    const retrieveMinimum = (val1, val2) => (val1 < val2 ? val1 : val2);
    const computePower = (baseVal, exponentVal) => {
        if (exponentVal === 0) return 1;
        if (exponentVal === 1) return baseVal;
        let outcome = 1;
        for (let idx = 0; idx < exponentVal; idx++) {
            outcome *= baseVal;
        }
        return outcome;
    };
    const deriveSquareRoot = (valueToRoot) => {
        if (valueToRoot < 0) throw new Error("Negative input for square root is not permissible");
        if (valueToRoot === 0) return 0;
        let approximation = valueToRoot / 2;
        for (let iteration = 0; iteration < 10; iteration++) {
            approximation = (approximation + valueToRoot / approximation) / 2;
        }
        return approximation;
    };
    const forgeUniqueDesignator = (preface) => preface + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const acquireRandomFraction = () => Math.random();

    return {
        retrieveMaximum,
        retrieveMinimum,
        computePower,
        deriveSquareRoot,
        forgeUniqueDesignator,
        acquireRandomFraction
    };
};
const calculusEngine = makeCalculusEngine();

const createNavigationSystem = () => {
    // These functions act as an interface to the original Trajectory object.
    // In a full Type IV clone, Trajectory itself would be rewritten.
    // For cloning only the Car class, we delegate to the original for equivalent functionality.

    const fetchSpatialCoordinates = (navigationRecord) => navigationRecord.currentPosition;
    const fetchDirectionalBearing = (navigationRecord) => navigationRecord.currentDirection;
    const fetchProximityData = (navigationRecord) => ({
        separationToFront: navigationRecord.nextCarDistance.distance,
        frontVehicleState: navigationRecord.nextCarDistance.car
    });
    const fetchDistanceToBoundary = (navigationRecord) => navigationRecord.distanceToStopLine;
    const initiatePathAlteration = (navigationRecord, newRouteSegment) => ({
        ...navigationRecord,
        isUndergoingAlteration: true,
        targetRouteSegment: newRouteSegment,
        originalTrajectory: (function() {
            navigationRecord.originalTrajectory.changeLane(newRouteSegment);
            return navigationRecord.originalTrajectory;
        })()
    });
    const checkPathAlterationStatus = (navigationRecord) => navigationRecord.originalTrajectory.isChangingLanes;
    const checkBoundaryApproach = (navigationRecord, travelExtent) => navigationRecord.originalTrajectory.timeToMakeTurn(travelExtent);
    const progressAlongPath = (navigationRecord, travelExtent) => {
        navigationRecord.originalTrajectory.moveForward(travelExtent);
        return {
            ...navigationRecord,
            currentPosition: navigationRecord.originalTrajectory.coords,
            currentDirection: navigationRecord.originalTrajectory.direction,
            nextCarDistance: navigationRecord.originalTrajectory.nextCarDistance,
            distanceToStopLine: navigationRecord.originalTrajectory.distanceToStopLine,
        };
    };
    const releaseNavigationSegment = (navigationRecord) => {
        navigationRecord.originalTrajectory.release();
        return { ...navigationRecord,
            segmentReleased: true
        };
    };

    const establishInitialNavigationRecord = (startRoute, startCoordinates, linkedUnit) => {
        // The original Trajectory constructor expects a 'car' object.
        // We pass the 'linkedUnit' (our cloned car state) which must expose 'speed'
        // for the Trajectory's internal calculations (e.g., nextCarDistance.car.speed).
        const originalPathObject = new Trajectory(linkedUnit, startRoute, startCoordinates); // Using original Trajectory class
        return {
            systemDesignator: calculusEngine.forgeUniqueDesignator('nav'),
            originalTrajectory: originalPathObject,
            currentPosition: originalPathObject.coords,
            currentDirection: originalPathObject.direction,
            nextCarDistance: originalPathObject.nextCarDistance,
            distanceToStopLine: originalPathObject.distanceToStopLine,
            isUndergoingAlteration: false,
            targetRouteSegment: null,
        };
    };

    return {
        fetchSpatialCoordinates,
        fetchDirectionalBearing,
        fetchProximityData,
        fetchDistanceToBoundary,
        initiatePathAlteration,
        checkPathAlterationStatus,
        checkBoundaryApproach,
        progressAlongPath,
        releaseNavigationSegment,
        establishInitialNavigationRecord
    };
};
const navigationSystem = createNavigationSystem();

const createRouteNetworkManager = () => {
    // These functions act as an interface to the original Lane object.
    // In a full Type IV clone, Lane itself would be rewritten.
    // For cloning only the Car class, we delegate to the original for equivalent functionality.

    const obtainCurrentRouteSegment = (navigationRecord) => navigationRecord.originalTrajectory.current.lane;
    const ascertainTurnInstruction = (currentRoute, desiredRoute) => currentRoute.getTurnDirection(desiredRoute);
    const retrieveAdjacentRouteSegment = (currentRoute, turnInstruction) => {
        switch (turnInstruction) {
            case 0: // Left
                return currentRoute.leftmostAdjacent;
            case 2: // Right
                return currentRoute.rightmostAdjacent;
            default: // Straight or invalid
                return currentRoute;
        }
    };
    return {
        obtainCurrentRouteSegment,
        ascertainTurnInstruction,
        retrieveAdjacentRouteSegment
    };
};
const routeNetworkManager = createRouteNetworkManager();

const produceVehicleEntity = (startingRoute, initialCoordinates) => {
    let unitInternalState = {
        unitLabel: calculusEngine.forgeUniqueDesignator('unit'),
        colorShade: (300 + 240 * calculusEngine.acquireRandomFraction() | 0) % 360,
        currentKineticEnergy: 0,
        bodyWidth: 1.7,
        bodyLength: 3 + 2 * calculusEngine.acquireRandomFraction(),
        maxKineticEnergy: 30,
        staticSeparation: 2,
        temporalGap: 1.5,
        maxPositiveThrust: 1,
        maxNegativeThrust: 3,
        navigationRecord: null,
        operationalStatus: true,
        preferredRouteSegment: null
    };

    // To mimic the original `Trajectory` requiring `this` (the Car object)
    // we need to make `unitInternalState` accessible with a `speed` property.
    // This is a bridge for the stub to work with the original `Trajectory` class.
    Object.defineProperty(unitInternalState, 'speed', {
        get: () => unitInternalState.currentKineticEnergy,
        set: (val) => {
            unitInternalState.currentKineticEnergy = calculusEngine.retrieveMaximum(0, calculusEngine.retrieveMinimum(unitInternalState.maxKineticEnergy, val));
        }
    });

    unitInternalState.navigationRecord = navigationSystem.establishInitialNavigationRecord(startingRoute, initialCoordinates, unitInternalState);

    const getUnitPosition = () => navigationSystem.fetchSpatialCoordinates(unitInternalState.navigationRecord);
    const getUnitVelocity = () => unitInternalState.currentKineticEnergy; // Clamping is handled by the 'speed' setter
    const getUnitOrientation = () => navigationSystem.fetchDirectionalBearing(unitInternalState.navigationRecord);

    const releaseUnitPath = () => {
        unitInternalState = { ...unitInternalState,
            navigationRecord: navigationSystem.releaseNavigationSegment(unitInternalState.navigationRecord)
        };
    };

    const computePropulsiveForce = () => {
        const {
            maxPositiveThrust: positiveRate,
            maxNegativeThrust: negativeRate,
            maxKineticEnergy: maximumVel,
            staticSeparation: initialSep,
            temporalGap: timeGapValue,
            currentKineticEnergy: currentVel,
        } = unitInternalState;

        const proximityData = navigationSystem.fetchProximityData(unitInternalState.navigationRecord);
        const precedingGap = calculusEngine.retrieveMaximum(proximityData.separationToFront, 0);
        const precedingVel = proximityData.frontVehicleState ? proximityData.frontVehicleState.speed : 0;

        const differentialVel = currentVel - precedingVel;

        const freeFlowCoefficient = calculusEngine.computePower(currentVel / maximumVel, 4);

        const requiredSafeDistance = initialSep + currentVel * timeGapValue + (currentVel * differentialVel) / (2 * calculusEngine.deriveSquareRoot(positiveRate * negativeRate));
        const congestedFlowCoefficient = calculusEngine.computePower(requiredSafeDistance / precedingGap, 2);

        const distanceToIntersectionPoint = navigationSystem.fetchDistanceToBoundary(unitInternalState.navigationRecord);
        const criticalIntersectionDistance = 1 + currentVel * timeGapValue + calculusEngine.computePower(currentVel, 2) / (2 * negativeRate);
        const intersectionInfluenceCoefficient = calculusEngine.computePower(criticalIntersectionDistance / distanceToIntersectionPoint, 2);

        const aggregatedCoefficient = 1 - freeFlowCoefficient - congestedFlowCoefficient - intersectionInfluenceCoefficient;

        return positiveRate * aggregatedCoefficient;
    };

    const advanceUnitState = (timeIncrement) => {
        const calculatedThrust = computePropulsiveForce();
        unitInternalState.speed += calculatedThrust * timeIncrement; // Use the 'speed' setter for clamping

        if (!navigationSystem.checkPathAlterationStatus(unitInternalState.navigationRecord) && unitInternalState.preferredRouteSegment) {
            const currentRoute = routeNetworkManager.obtainCurrentRouteSegment(unitInternalState.navigationRecord);
            const turnDirective = routeNetworkManager.ascertainTurnInstruction(currentRoute, unitInternalState.preferredRouteSegment);

            const designatedRoute = routeNetworkManager.retrieveAdjacentRouteSegment(currentRoute, turnDirective);

            if (designatedRoute !== currentRoute) {
                unitInternalState.navigationRecord = navigationSystem.initiatePathAlteration(unitInternalState.navigationRecord, designatedRoute);
            }
        }

        const travelExtent = unitInternalState.currentKineticEnergy * timeIncrement + 0.5 * calculatedThrust * calculusEngine.computePower(timeIncrement, 2);

        const proximityReport = navigationSystem.fetchProximityData(unitInternalState.navigationRecord);
        if (proximityReport.separationToFront < travelExtent) {
            console.warn('Inadequate forward separation detected for unit:', unitInternalState.unitLabel);
        }

        if (navigationSystem.checkBoundaryApproach(unitInternalState.navigationRecord, travelExtent)) {
            if (unitInternalState.preferredRouteSegment == null) {
                unitInternalState.operationalStatus = false;
            }
        }

        unitInternalState.navigationRecord = navigationSystem.progressAlongPath(unitInternalState.navigationRecord, travelExtent);
    };

    return {
        getUnitState: () => ({ ...unitInternalState,
            speed: unitInternalState.speed
        }), // Expose a copy of the state
        getUnitPosition,
        getUnitVelocity,
        getUnitOrientation,
        releaseUnitPath,
        advanceUnitState,
        setPreferredRoute: (segment) => {
            unitInternalState.preferredRouteSegment = segment;
        },
        setOperationalStatus: (status) => {
            unitInternalState.operationalStatus = status;
        }
    };
};

// This export replaces the original `module.exports = Car;`
// It provides a factory function to create vehicle entities.
// The external user would call `const myVehicle = produceVehicleEntity(lane, position);`
// and then `myVehicle.advanceUnitState(delta);`
// and `myVehicle.getUnitVelocity();` etc.
module.exports = produceVehicleEntity;