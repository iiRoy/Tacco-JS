const calculateMinCoordinate = (dataArray, accessorFunction) => dataArray.reduce((minimum, item) => Math.min(minimum, accessorFunction(item)), Infinity);
const calculateMaxCoordinate = (dataArray, accessorFunction) => dataArray.reduce((maximum, item) => Math.max(maximum, accessorFunction(item)), -Infinity);
const calculateAverageValue = (dataArray, accessorFunction) => {
    if (!dataArray || dataArray.length === 0) return 0;
    const sum = dataArray.reduce((total, item) => total + accessorFunction(item), 0);
    return sum / dataArray.length;
};

const EventSequenceProcessor = function() {
    let upperLayerBoundary = 0, lowerLayerBoundary = 0, eventConnectionRecords = [], temporalCoordinateProjector, itemIdentifierMap = {}, displayAreaWidth = 100, displayAreaHeight = 100, temporalSpan = [0, 1], temporalDataType = "date", scaleFactor = 1, visualElementCollection, chronologicalSegments = [], intervalDivisions, laneQuantity = 1, earliestPoint = 1, latestPoint = 10;

    let segmentDataMap = {}, trackArrangements = {}, computedStatistics = {};
    let activeRelationshipList = [];
    let periodDurationMultipliers = { d: 1, h: 1 / 24, w: 7, m: 365.25 / 12, y: 365.25 };
    let segmentRelationshipDefinitions;

    let operatorConfiguration = { "<": { subSpanReference: "start", uncertaintyOffset: { start: -1, end: 0.001 } }, ">": { subSpanReference: "end", uncertaintyOffset: { start: 0.001, end: 1 } }, "~": { uncertaintyOffset: { start: -0.5, end: -0.5 } } };
    let operatorRegexPattern = /[<|>|=|d|~]/;
    let currentlyEvaluatingSegments = [];

    let uncertaintyMagnitude = 365;
    let sortingPreference = 0;

    this.activeChronologicalSegments = [];
    this.analysisStatistics = computedStatistics;

    temporalCoordinateProjector = new (function() { // Mock for d3_chrono_projection
        let originValue = null;
        let atomUnit = null;
        let dataType = null;
        this.setOrigin = function(val) { originValue = val; return this; };
        this.setAtom = function(val) { atomUnit = val; return this; };
        this.setType = function(val) { dataType = val; return this; };
        this.project = function(value) {
            if (typeof value === 'string' || value instanceof Date) {
                return new Date(value).getTime();
            }
            return value;
        };
    })();
    intervalDivisions = [];

    const formatIncomingSegment = (rawEntry) => {
        const segment = { ...rawEntry };

        if (segment.s || segment.e) {
            segment.timeDefinitions = [{}];
            if (segment.s) segment.timeDefinitions[0].s = segment.s;
            if (segment.ls) segment.timeDefinitions[0].ls = segment.ls;
            if (segment.e) segment.timeDefinitions[0].e = segment.e;
            if (segment.ee) segment.timeDefinitions[0].ee = segment.ee;
            if (segment.duration) segment.timeDefinitions[0].duration = segment.duration;
            if (segment.cstep) segment.timeDefinitions[0].cstep = segment.cstep;
            if (segment.cduration) segment.timeDefinitions[0].cduration = segment.cduration;
            if (segment.during) segment.timeDefinitions[0].during = segment.during;
        } else {
            segment.timeDefinitions = segment.timeDefinitions || [{}];
        }

        segment.assignedTrack = -1;
        segment.hierarchicalLevel = 1;
        segment.trackSpan = [];
        segment.parentComponent = null;
        segment.horizontalPosition = 0;
        segment.projectedTimeIntervals = [];
        segment.isDependent = false;
        segment.isApproximated = false;
        segment.relatedEntities = [];
        segment.uniqueId = segment.id;

        return segment;
    };

    const processSegmentRelationships = () => {
        activeRelationshipList = segmentRelationshipDefinitions
            .filter(conn => segmentDataMap[conn.rel[0]] && segmentDataMap[conn.rel[2]])
            .map(conn => ({
                sourceSegment: segmentDataMap[conn.rel[0]],
                targetSegment: segmentDataMap[conn.rel[2]],
                connectionType: conn.rel[1]
            }));

        chronologicalSegments.forEach(segment => {
            segment.hierarchicalLevel = determineComponentLevel(segment, activeRelationshipList);
        });
    };

    const determineComponentLevel = (currentSegment, allRelationships) => {
        const parentLink = allRelationships.find(rel =>
            rel.targetSegment === currentSegment && rel.connectionType === "has_part"
        );

        if (parentLink) {
            currentSegment.parentComponent = parentLink.sourceSegment;
            return determineComponentLevel(parentLink.sourceSegment, allRelationships) + 1;
        }
        return 1;
    };

    const organizeTracks = () => {
        trackArrangements = {};

        chronologicalSegments.forEach(segment => assignToTracks(segment));

        if (segmentRelationshipDefinitions && activeRelationshipList.length > 0) {
            chronologicalSegments.forEach(segment => {
                segment.trackSpan = calculateTrackBoundaries(segment, activeRelationshipList);
            });
        } else {
            chronologicalSegments.forEach(segment => {
                segment.trackSpan = [segment.assignedTrack, segment.assignedTrack];
            });
        }
    };

    const assignToTracks = (incomingSegment) => {
        const segmentSpatialBounds = computeTemporalBoundingBox(incomingSegment.projectedTimeIntervals);
        let placementAchieved = false;
        const trackGroupKey = incomingSegment.parentComponent ? incomingSegment.parentComponent.uniqueId : "base";

        if (!trackArrangements[trackGroupKey]) {
            trackArrangements[trackGroupKey] = [];
        }

        for (let i = 0; i < trackArrangements[trackGroupKey].length; i++) {
            const currentTrackItems = trackArrangements[trackGroupKey][i];
            const overlapDetected = currentTrackItems.some(existingSegment => {
                const existingBounds = computeTemporalBoundingBox(existingSegment.projectedTimeIntervals);
                return (segmentSpatialBounds.startCoordinate <= existingBounds.endCoordinate && segmentSpatialBounds.endCoordinate >= existingBounds.startCoordinate);
            });

            if (!overlapDetected) {
                currentTrackItems.push(incomingSegment);
                incomingSegment.assignedTrack = i;
                placementAchieved = true;
                break;
            }
        }

        if (!placementAchieved) {
            incomingSegment.assignedTrack = trackArrangements[trackGroupKey].length;
            trackArrangements[trackGroupKey].push([incomingSegment]);
        }
    };

    const computeTemporalBoundingBox = (intervalCollection) => {
        const startCoordinate = calculateMinCoordinate(intervalCollection, d => d.start);
        const endCoordinate = calculateMaxCoordinate(intervalCollection, d => d.end);
        return { startCoordinate, endCoordinate };
    };

    const calculateTrackBoundaries = (currentSegment, allRelationships) => {
        let minTrackIndex = parseInt(currentSegment.assignedTrack);
        let maxTrackIndex = parseInt(currentSegment.assignedTrack);

        allRelationships.forEach(rel => {
            if (rel.targetSegment === currentSegment && rel.connectionType === "participates_in") {
                minTrackIndex = Math.min(minTrackIndex, rel.sourceSegment.assignedTrack);
                maxTrackIndex = Math.max(maxTrackIndex, rel.sourceSegment.assignedTrack);
            }
        });
        return [minTrackIndex, maxTrackIndex];
    };

    const updateCalculatedStatistics = () => {
        const aggregatedStarts = chronologicalSegments
            .filter(s => s.projectedTimeIntervals.length > 0)
            .map(s => calculateAverageValue(s.projectedTimeIntervals, p => p.start))
            .sort((a, b) => a - b);

        computedStatistics.medianStartPoint = aggregatedStarts[Math.floor(aggregatedStarts.length / 2)] || 0;
        computedStatistics.averageSegmentDuration = calculateAverageValue(chronologicalSegments, s =>
            s.projectedTimeIntervals.length > 0 ? (calculateAverageValue(s.projectedTimeIntervals, p => p.end) - calculateAverageValue(s.projectedTimeIntervals, p => p.start)) : 0
        );
    };

    const transformTimeInterval = (currentSegment) => {
        if (currentSegment.projectedTimeIntervals.length > 0 && currentSegment.projectedTimeIntervals[0]) {
            return;
        }

        if (currentlyEvaluatingSegments.includes(currentSegment)) {
            currentSegment.isDependent = true;
            return;
        }
        currentlyEvaluatingSegments.push(currentSegment);

        currentSegment.timeDefinitions.forEach(timeSpanDefinition => {
            const processedTimeInterval = {};

            const resolveContingentExpression = (expressionString, defaultSubKey, targetPropertyKey, isStartPoint) => {
                const matchedOperator = expressionString.match(operatorRegexPattern)?.[0];
                if (!matchedOperator) return null;

                const targetSegmentIdentifier = expressionString.substring(1).split(".")[0];
                const specificSubSpanKey = expressionString.substring(1).split(".")[1];

                const targetDataSegment = segmentDataMap[targetSegmentIdentifier];
                if (!targetDataSegment) return null;

                transformTimeInterval(targetDataSegment);

                const operatorConfig = operatorConfiguration[matchedOperator];
                const effectiveSubKey = specificSubSpanKey || (operatorConfig?.subSpanReference || defaultSubKey);

                if (!targetDataSegment.projectedTimeIntervals[0]) {
                    return null;
                }

                const baseValue = targetDataSegment.projectedTimeIntervals[0][effectiveSubKey];
                let determinedValue = baseValue;

                if (operatorConfig?.uncertaintyOffset && !(targetPropertyKey === 'lessPreciseStart' || targetPropertyKey === 'lessPreciseEnd')) {
                    const offsetKey = isStartPoint ? 'start' : 'end';
                    if (operatorConfig.uncertaintyOffset[offsetKey] !== undefined) {
                        determinedValue = baseValue + (uncertaintyMagnitude * operatorConfig.uncertaintyOffset[offsetKey]);
                        if (isStartPoint && !processedTimeInterval.lessPreciseStart) {
                            processedTimeInterval.lessPreciseStart = baseValue + uncertaintyMagnitude + (uncertaintyMagnitude * operatorConfig.uncertaintyOffset.start);
                        } else if (!isStartPoint && !processedTimeInterval.lessPreciseEnd) {
                            processedTimeInterval.lessPreciseEnd = baseValue - uncertaintyMagnitude + (uncertaintyMagnitude * operatorConfig.uncertaintyOffset.end);
                        }
                    }
                }
                return determinedValue;
            };

            if (timeSpanDefinition.s) {
                if (!String(timeSpanDefinition.s).match(operatorRegexPattern)) {
                    processedTimeInterval.start = temporalCoordinateProjector.project(timeSpanDefinition.s);
                } else {
                    processedTimeInterval.start = resolveContingentExpression(String(timeSpanDefinition.s), "start", "start", true);
                    currentSegment.isDependent = true;
                }
            } else {
                currentSegment.isApproximated = true;
            }

            if (timeSpanDefinition.ls) {
                if (!String(timeSpanDefinition.ls).match(operatorRegexPattern)) {
                    processedTimeInterval.lessPreciseStart = temporalCoordinateProjector.project(timeSpanDefinition.ls);
                } else {
                    processedTimeInterval.lessPreciseStart = resolveContingentExpression(String(timeSpanDefinition.ls), "lessPreciseStart", "lessPreciseStart", true);
                    currentSegment.isDependent = true;
                }
            }

            if (timeSpanDefinition.e) {
                if (!String(timeSpanDefinition.e).match(operatorRegexPattern)) {
                    processedTimeInterval.end = temporalCoordinateProjector.project(timeSpanDefinition.e);
                } else {
                    processedTimeInterval.end = resolveContingentExpression(String(timeSpanDefinition.e), "end", "end", false);
                    currentSegment.isDependent = true;
                }
            }

            if (timeSpanDefinition.ee) {
                if (!String(timeSpanDefinition.ee).match(operatorRegexPattern)) {
                    processedTimeInterval.lessPreciseEnd = temporalCoordinateProjector.project(timeSpanDefinition.ee);
                } else {
                    processedTimeInterval.lessPreciseEnd = resolveContingentExpression(String(timeSpanDefinition.ee), "lessPreciseEnd", "lessPreciseEnd", false);
                    currentSegment.isDependent = true;
                }
            }

            if (timeSpanDefinition.duration) {
                let durationString = String(timeSpanDefinition.duration);
                if (!durationString.startsWith("=")) {
                    const typeOfDuration = durationString.slice(-1);
                    const baseDurationValue = parseFloat(durationString);
                    const multiplier = periodDurationMultipliers[typeOfDuration] || 1;
                    const calculatedTotalDuration = baseDurationValue * multiplier;

                    if (timeSpanDefinition.during === true) {
                        processedTimeInterval.duration = calculatedTotalDuration;
                    } else {
                        if (processedTimeInterval.start !== undefined && processedTimeInterval.end === undefined) {
                            processedTimeInterval.end = processedTimeInterval.start + calculatedTotalDuration;
                        } else if (processedTimeInterval.end !== undefined && processedTimeInterval.start === undefined) {
                            processedTimeInterval.start = processedTimeInterval.end - calculatedTotalDuration;
                        }
                    }
                }
            }

            if (timeSpanDefinition.cstep) {
                currentSegment.isDependent = true;
            }

            currentSegment.projectedTimeIntervals.push(processedTimeInterval);
        });

        const segmentIndex = currentlyEvaluatingSegments.indexOf(currentSegment);
        if (segmentIndex > -1) {
            currentlyEvaluatingSegments.splice(segmentIndex, 1);
        }
    };

    this.configureTimeSegments = function(newSegments) {
        if (newSegments) {
            chronologicalSegments = newSegments;
            return this;
        }
        return chronologicalSegments;
    };

    this.configureSegmentConnections = function(newConnections) {
        if (newConnections) {
            segmentRelationshipDefinitions = newConnections;
            return this;
        }
        return segmentRelationshipDefinitions;
    };

    this.getTrackArrangements = function() {
        return trackArrangements;
    };

    this.configureWidth = function(newWidth) {
        if (newWidth) {
            displayAreaWidth = newWidth;
            if (visualElementCollection) {
                // this.processInputCollection(visualElementCollection);
            }
            return this;
        }
        return displayAreaWidth;
    };

    this.configureHeight = function(newHeight) {
        if (newHeight) {
            displayAreaHeight = newHeight;
            if (visualElementCollection) {
                // this.processInputCollection(visualElementCollection);
            }
            return this;
        }
        return newHeight;
    };

    this.retrieveTrackArrangements = function() {
        return trackArrangements;
    };

    this.setLayerBoundaries = function(newBounds) {
        if (newBounds) {
            upperLayerBoundary = newBounds[0];
    lowerLayerBoundary = newBounds[1];
            return this;
        }
        return [upperLayerBoundary, lowerLayerBoundary];
    };

    this.setTemporalCoordinateProjector = function(newProjector) {
        if (newProjector) {
            temporalCoordinateProjector = newProjector;
            this.refreshProcessorState();
            return this;
        }
        return temporalCoordinateProjector;
    };

    this.setTemporalSpan = function(newSpan) {
        if (newSpan) {
            temporalSpan = newSpan;
            return this;
        }
        return temporalSpan;
    };

    this.setTemporalDataType = function(newType) {
        if (newType) {
            temporalDataType = newType;
            return this;
        }
        return temporalDataType;
    };

    this.processInputCollection = function(inputCollectionData) {
        if (!temporalCoordinateProjector) {
            temporalCoordinateProjector = new (function() { // Mock for d3_chrono_projection
                let originValue = null;
                let atomUnit = null;
                let dataType = null;
                this.setOrigin = function(val) { originValue = val; return this; };
                this.setAtom = function(val) { atomUnit = val; return this; };
                this.setType = function(val) { dataType = val; return this; };
                this.project = function(value) {
                    if (typeof value === 'string' || value instanceof Date) {
                        return new Date(value).getTime();
                    }
                    return value;
                };
            })();
        }
        if (inputCollectionData.projection) {
            if (inputCollectionData.projection.origin) temporalCoordinateProjector.setOrigin(inputCollectionData.projection.origin);
            if (inputCollectionData.projection.atom) temporalCoordinateProjector.setAtom(inputCollectionData.projection.atom);
            if (inputCollectionData.projection.datetype) temporalCoordinateProjector.setType(inputCollectionData.projection.datetype);
        }

        chronologicalSegments = inputCollectionData.periods || inputCollectionData;

        chronologicalSegments = chronologicalSegments.map(formatIncomingSegment);

        segmentDataMap = chronologicalSegments.reduce((map, segment) => {
            map[segment.uniqueId] = segment;
            return map;
        }, {});

        currentlyEvaluatingSegments = [];
        chronologicalSegments.forEach(segment => transformTimeInterval(segment));

        chronologicalSegments.sort((a, b) => {
            const aStart = calculateMinCoordinate(a.projectedTimeIntervals, p => p.start);
            const bStart = calculateMinCoordinate(b.projectedTimeIntervals, p => p.start);
            return aStart < bStart ? -1 : (aStart > bStart ? 1 : 0);
        });

        updateCalculatedStatistics();

        if (inputCollectionData.relations) {
            segmentRelationshipDefinitions = inputCollectionData.relations;
            processSegmentRelationships();
        }

        organizeTracks();
    };

    this.refreshProcessorState = function() {
        if (chronologicalSegments.length > 0) {
            segmentDataMap = {};
            trackArrangements = {};
            currentlyEvaluatingSegments = [];
            chronologicalSegments.forEach(s => {
                s.projectedTimeIntervals = [];
                s.assignedTrack = -1;
                s.trackSpan = [];
                s.hierarchicalLevel = 1;
                s.parentComponent = null;
                s.isDependent = false;
                s.isApproximated = false;
                segmentDataMap[s.uniqueId] = s;
            });
            chronologicalSegments.forEach(segment => transformTimeInterval(segment));
            chronologicalSegments.sort((a, b) => {
                const aStart = calculateMinCoordinate(a.projectedTimeIntervals, p => p.start);
                const bStart = calculateMinCoordinate(b.projectedTimeIntervals, p => p.start);
                return aStart < bStart ? -1 : (aStart > bStart ? 1 : 0);
            });
            updateCalculatedStatistics();
            if (segmentRelationshipDefinitions) {
                processSegmentRelationships();
            }
            organizeTracks();
        }
    };
};