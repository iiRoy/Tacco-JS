d3_chrono_processor = function() {
    let upperLimit = 0;
    let lowerLimit = 0;
    let temporalConnections = [];
    let timeMapper;
    let chronologicalIndex = {};
    let layoutWidth = 100;
    let layoutHeight = 100;
    let periodExtent = [0, 1];
    let timeUnit = "date";
    let scalingFactor = 1;
    let dataElements;
    let chronologicalEntries = [];
    let segmentCollection;
    let trackCount = 1;
    let minTimePoint = 1;
    let maxTimePoint = 10;

    const entryMap = {};
    const placementTracks = {};
    const metrics = {};
    let relationshipList = [];
    const durationUnits = { d: 1, h: 1 / 24, w: 7, m: 365.25 / 12, y: 365.25 };
    let interPeriodLinks;

    // Configuration for temporal operators and uncertainty handling
    const timeOperatorConfig = {
        "<": { subspan: "s", uncertaintyPoint: { s: -1, e: 0.001 } }, // 's' for start, small positive for end uncertainty
        ">": { subspan: "e", uncertaintyPoint: { s: 0.001, e: 1 } }, // 'e' for end, small positive for start uncertainty
        "~": { uncertaintyPoint: { s: -0.5, e: -0.5 } } // Symmetric uncertainty
    };
    const timeSpanExpression = /[<|>|=|d|~]/;
    let currentlyEvaluatingEntries = [];

    // Global uncertainty adjustment factor
    let estimationFactor = 365;
    // This variable was unused in the original, so it's removed as a non-essential statement.
    // let sortFlag = 0;

    this.segmentCollection = [];
    this.periodStatistics = metrics;

    // Helper to check for valid input
    const isValidArray = (arr) => Array.isArray(arr) && arr.length > 0;

    // Getter/Setter for chronological entries
    this.getSetChronologicalEntries = function(newEntries) {
        if (newEntries !== undefined) {
            if (!isValidArray(newEntries)) {
                console.warn("Invalid input for chronological entries. Expected an array.");
                return this;
            }
            chronologicalEntries = newEntries;
            return this;
        } else {
            return chronologicalEntries;
        }
    };

    // Getter/Setter for inter-period relationships
    this.getSetInterPeriodLinks = function(newLinks) {
        if (newLinks !== undefined) {
            if (!isValidArray(newLinks)) {
                console.warn("Invalid input for inter-period links. Expected an array.");
                return this;
            }
            interPeriodLinks = newLinks;
            return this;
        } else {
            return interPeriodLinks;
        }
    };

    // Retrieve the allocated placement tracks
    this.retrievePlacementTracks = function() {
        return placementTracks;
    };

    // Internal function to trigger updates after dimension changes
    const updateDisplay = () => {
        if (dataElements) {
            this.processEntryCollection(dataElements);
        }
    };

    // Getter/Setter for layout width
    this.configureLayoutWidth = function(newWidthValue) {
        if (newWidthValue !== undefined) {
            layoutWidth = newWidthValue;
            updateDisplay();
            return this;
        } else {
            return layoutWidth;
        }
    };

    // Getter/Setter for layout height
    this.configureLayoutHeight = function(newHeightValue) {
        if (newHeightValue !== undefined) {
            layoutHeight = newHeightValue;
            updateDisplay();
            return this;
        } else {
            return layoutHeight;
        }
    };

    // Getter for placement tracks (alias for retrievePlacementTracks)
    this.getPlacementTracks = function() {
        return placementTracks;
    };

    // Getter/Setter for timeline layer bounds
    this.setGetLayerBounds = function(newLayerBounds) {
        if (newLayerBounds !== undefined) {
            if (!isValidArray(newLayerBounds) || newLayerBounds.length < 2) {
                console.warn("Invalid input for layer bounds. Expected an array with at least two elements.");
                return this;
            }
            [upperLimit, lowerLimit] = newLayerBounds; // Using destructuring
            return this;
        } else {
            return [upperLimit, lowerLimit];
        }
    };

    // Getter/Setter for the temporal projection mechanism
    this.setGetTimeMapper = function(newMapper) {
        if (newMapper !== undefined) {
            timeMapper = newMapper;
            // The original `this.update()` was not defined, removed.
            // If an update mechanism is needed, it should be explicitly added.
            return this;
        } else {
            return timeMapper;
        }
    };

    // Getter/Setter for the overall temporal range
    this.setGetPeriodExtent = function(newRange) {
        if (newRange !== undefined) {
            if (!isValidArray(newRange) || newRange.length < 2) {
                console.warn("Invalid input for period extent. Expected an array with at least two elements.");
                return this;
            }
            periodExtent = newRange;
            return this;
        } else {
            return periodExtent;
        }
    };

    // Getter/Setter for the type of date representation
    this.setGetTimeUnit = function(newType) {
        if (newType !== undefined) {
            timeUnit = newType;
            return this;
        } else {
            return timeUnit;
        }
    };

    // Main function to process a collection of periods and relations
    this.processEntryCollection = function(collectionInput) {
        if (!collectionInput || typeof collectionInput !== 'object') {
            console.error("Invalid collection input provided.");
            return;
        }

        let tempPeriods = [];

        // Initialize time mapper if not present, using collection's projection config
        if (!timeMapper) {
            timeMapper = d3_chrono_projection(); // Assuming this is defined elsewhere
            if (collectionInput.projection) {
                const proj = collectionInput.projection;
                if (proj.origin) {
                    timeMapper.origin(proj.origin);
                }
                if (proj.atom) {
                    timeMapper.atom(proj.atom);
                }
                if (proj.datetype) {
                    timeMapper.type(proj.datetype);
                }
            }
        }

        // Determine the actual periods array
        if (isValidArray(collectionInput.periods)) {
            tempPeriods = collectionInput.periods;
        } else if (isValidArray(collectionInput)) {
            tempPeriods = collectionInput;
        } else {
            console.warn("No valid periods found in the collection input.");
            return;
        }
        chronologicalEntries = tempPeriods;

        prepareEntryData(); // Format and project periods

        if (isValidArray(collectionInput.relations)) {
            interPeriodLinks = collectionInput.relations;
            handleInterPeriodLinks(); // Process relationships
        }

        arrangePlacementTracks(); // Sort periods into lanes
    };

    // Arranges periods into visual tracks based on their temporal extent and relations
    function arrangePlacementTracks() {
        if (!isValidArray(chronologicalEntries)) {
            return; // Exit if no entries to process
        }

        // Bin periods into lanes first
        chronologicalEntries.forEach(entry => {
            if (entry) {
                allocateToTracks(entry);
            }
        });

        // If relations exist, refine lane ranges
        if (isValidArray(interPeriodLinks)) {
            chronologicalEntries.forEach(entry => {
                if (entry) {
                    entry.lanerange = calculateTrackSpan(entry, relationshipList);
                }
            });
        } else {
            // Default lane range if no relations
            chronologicalEntries.forEach(entry => {
                if (entry) {
                    entry.lanerange = [entry.lane, entry.lane];
                }
            });
        }
    }

    // Determines the full lane range an incident period might occupy due to relations
    function calculateTrackSpan(incidentPeriod, incidentRelationList) {
        let currentLane = Number(incidentPeriod.lane) || 0; // Ensure number, default to 0
        let laneRange = [currentLane, currentLane];

        incidentRelationList.forEach(rel => {
            if (rel && rel.target === incidentPeriod && rel.type === "participates_in") {
                const sourceLane = Number(rel.source.lane) || 0;
                laneRange[0] = Math.min(laneRange[0], sourceLane);
                laneRange[1] = Math.max(laneRange[1], sourceLane);
            }
        });
        return laneRange;
    }

    // Processes raw temporal relations into a usable list
    function handleInterPeriodLinks() {
        relationshipList = [];
        if (!isValidArray(interPeriodLinks)) {
            return;
        }

        interPeriodLinks.forEach(rawRel => {
            if (rawRel && rawRel.rel && rawRel.rel.length === 3) {
                const [sourceId, type, targetId] = rawRel.rel;
                const sourcePeriod = entryMap[sourceId];
                const targetPeriod = entryMap[targetId];

                if (sourcePeriod && targetPeriod) {
                    relationshipList.push({
                        source: sourcePeriod,
                        target: targetPeriod,
                        type: type
                    });
                }
            }
        });

        // Assign hierarchical levels based on 'has_part' relations
        chronologicalEntries.forEach(entry => {
            if (entry) {
                entry.level = assignHierarchicalLevel(entry, relationshipList);
            }
        });
    }

    // Recursively determines the hierarchical level of a period
    function assignHierarchicalLevel(incidentPeriod, incidentRelationList) {
        // Find if this period is a part of another
        const parentRelation = incidentRelationList.find(rel =>
            rel && rel.target === incidentPeriod && rel.type === "has_part"
        );

        if (parentRelation) {
            incidentPeriod.partof = parentRelation.source;
            return assignHierarchicalLevel(parentRelation.source, incidentRelationList) + 1;
        }
        return 1; // Base level if no parent
    }

    // Prepares and formats the chronological entry data
    function prepareEntryData() {
        if (!isValidArray(chronologicalEntries)) {
            return;
        }

        // Helper to assign tSpan properties
        const assignTSpanProperty = (tSpan, period, propName) => {
            if (period[propName] && String(period[propName]).length > 0) {
                tSpan[propName] = period[propName];
            }
        };

        chronologicalEntries.forEach(entry => {
            if (!entry) return;

            // Build tSpans for CSV-like inputs
            if (entry.s || entry.e) {
                entry.tSpans = [{}];
                const currentTSpan = entry.tSpans[0];
                assignTSpanProperty(currentTSpan, entry, 's');
                assignTSpanProperty(currentTSpan, entry, 'ls');
                assignTSpanProperty(currentTSpan, entry, 'e');
                assignTSpanProperty(currentTSpan, entry, 'ee');
                assignTSpanProperty(currentTSpan, entry, 'duration');
                assignTSpanProperty(currentTSpan, entry, 'cstep');
                assignTSpanProperty(currentTSpan, entry, 'cduration');
                assignTSpanProperty(currentTSpan, entry, 'during');
            }

            // Initialize default properties for each period
            Object.assign(entry, {
                lane: -1,
                level: 1,
                lanerange: [],
                partof: undefined,
                x: 0,
                projectedTSpans: [],
                contingent: false,
                estimated: false,
                relations: []
            });
            entryMap[entry.id] = entry;
        });

        // Project all period tspans
        currentlyEvaluatingEntries = []; // Reset processing flag
        chronologicalEntries.forEach(entry => {
            if (entry) {
                mapTemporalSpan(entry);
            }
        });
        currentlyEvaluatingEntries = []; // Clear after all projections

        // Sort periods by their projected start time
        chronologicalEntries.sort((a, b) => {
            const aS = d3.min(a.projectedTSpans, p => p.s);
            const bS = d3.min(b.projectedTSpans, p => p.s);
            return (aS < bS) ? -1 : (aS > bS ? 1 : 0); // If equal, maintain relative order or default to 0
        });

        // Recalculate statistics after all periods are processed
        updateStatistics();
    }

    // Assigns an incoming period to an available lane
    function allocateToTracks(incomingPeriod) {
        const entryBounds = deriveTemporalBounds(incomingPeriod.projectedTSpans);
        let placedInLane = false;
        const laneKey = incomingPeriod.partof ? incomingPeriod.partof.id : "base";

        if (!placementTracks[laneKey]) {
            placementTracks[laneKey] = [];
        }

        // Iterate through existing lanes to find a spot
        for (let i = 0; i < placementTracks[laneKey].length; i++) {
            const currentLane = placementTracks[laneKey][i];
            const isOverlap = currentLane.some(existingPeriod => {
                const existingBounds = deriveTemporalBounds(existingPeriod.projectedTSpans);
                return (entryBounds.s < existingBounds.e && entryBounds.e > existingBounds.s);
            });

            if (!isOverlap) {
                currentLane.push(incomingPeriod);
                incomingPeriod.lane = i;
                placedInLane = true;
                break;
            }
        }

        // If no existing lane found, create a new one
        if (!placedInLane) {
            incomingPeriod.lane = placementTracks[laneKey].length;
            placementTracks[laneKey].push([incomingPeriod]);
        }
    }

    // Calculates the min/max temporal bounds for an array of projected time spans
    function deriveTemporalBounds(inputTSpanArray) {
        if (!isValidArray(inputTSpanArray)) {
            return { s: 0, e: 0 };
        }
        const minStart = inputTSpanArray.reduce((min, p) => Math.min(min, p.s), Infinity);
        const maxEnd = inputTSpanArray.reduce((max, p) => Math.max(max, p.e), -Infinity);
        return { s: minStart, e: maxEnd };
    }

    // Updates global statistics (median start, mean duration)
    function updateStatistics() {
        if (!isValidArray(chronologicalEntries)) {
            return;
        }
        const projectedStarts = chronologicalEntries
            .filter(d => d.projectedTSpans && d.projectedTSpans.length > 0 && d.projectedTSpans[0].s !== undefined)
            .map(d => d.projectedTSpans[0].s)
            .sort((a, b) => a - b);

        if (projectedStarts.length > 0) {
            const mid = Math.floor(projectedStarts.length / 2);
            metrics.medianS = projectedStarts.length % 2 === 0
                ? (projectedStarts[mid - 1] + projectedStarts[mid]) / 2
                : projectedStarts[mid];
        } else {
            metrics.medianS = 0; // Default if no valid starts
        }


        const durations = chronologicalEntries
            .filter(d => d.projectedTSpans && d.projectedTSpans.length > 0 && d.projectedTSpans[0].s !== undefined && d.projectedTSpans[0].e !== undefined)
            .map(d => d.projectedTSpans[0].e - d.projectedTSpans[0].s);

        metrics.mean = durations.length > 0 ? d3.mean(durations) : 0; // Assuming d3.mean is available
    }

    // Estimates a period's start/end if they are missing
    function dynamicPeriodEstimation(incidentTSpan) {
        // Ensure statistics are up-to-date
        if (metrics.medianS === undefined || metrics.mean === undefined) {
            updateStatistics();
        }

        if (metrics.medianS === undefined || metrics.mean === undefined) {
            console.warn("Cannot estimate period: statistics are not available.");
            return;
        }

        // If start is missing, use median start
        if (incidentTSpan.s === undefined) {
            incidentTSpan.s = metrics.medianS;
        }
        // If end is missing, use start + mean duration
        if (incidentTSpan.e === undefined) {
            incidentTSpan.e = incidentTSpan.s + metrics.mean;
        }
    }

    // Helper to parse contingent values like ">periodId.s"
    const parseContingentValue = (valueString) => {
        const match = String(valueString).match(timeSpanExpression);
        if (!match) return null;

        const operator = match[0];
        const parts = valueString.substring(operator.length).split(".");
        const targetId = parts[0];
        let specificSubspan = parts[1];

        // Default subspan based on operator config if not explicitly provided
        if (!specificSubspan && timeOperatorConfig[operator] && timeOperatorConfig[operator].subspan) {
            specificSubspan = timeOperatorConfig[operator].subspan;
        }
        return { operator, targetId, specificSubspan };
    };

    // Projects a period's raw tSpans into concrete numerical time values
    function mapTemporalSpan(incidentPeriod) {
        // If already projected or currently being processed (to prevent infinite loops)
        if (incidentPeriod.projectedTSpans.length > 0 || currentlyEvaluatingEntries.includes(incidentPeriod)) {
            return true;
        }

        if (!incidentPeriod.tSpans || incidentPeriod.tSpans.length === 0) {
            console.warn(`Period ${incidentPeriod.id} has no tSpans to project.`);
            return false;
        }

        currentlyEvaluatingEntries.push(incidentPeriod); // Mark as currently processing

        incidentPeriod.tSpans.forEach(rawTSpan => {
            const projectedSegment = {};
            let isContingent = false;

            // Helper to process a time point (s, ls, e, ee)
            const processTimePoint = (propName) => {
                const rawValue = rawTSpan[propName];
                if (rawValue === undefined) return;

                if (!String(rawValue).match(timeSpanExpression)) {
                    projectedSegment[propName] = timeMapper.project(rawValue);
                } else {
                    isContingent = true;
                    incidentPeriod.contingent = true; // Mark the period as contingent
                    const parsedContingency = parseContingentValue(rawValue);

                    if (!parsedContingency) {
                        console.warn(`Failed to parse contingent value for ${propName} in period ${incidentPeriod.id}`);
                        return;
                    }

                    const { operator, targetId, specificSubspan } = parsedContingency;
                    const targetPeriod = entryMap[targetId];

                    if (!targetPeriod) {
                        console.error(`Contingent period target ${targetId} not found for ${incidentPeriod.id}`);
                        return;
                    }

                    // Recursively project the target period first
                    mapTemporalSpan(targetPeriod);

                    const targetProjectedTSpan = targetPeriod.projectedTSpans[0];
                    if (!targetProjectedTSpan || targetProjectedTSpan[specificSubspan] === undefined) {
                        console.error(`Target period ${targetId} or its subspan ${specificSubspan} not projected for ${incidentPeriod.id}.`);
                        return;
                    }

                    const baseValue = targetProjectedTSpan[specificSubspan];
                    const uncertaintyConfig = timeOperatorConfig[operator]?.uncertaintyPoint;

                    projectedSegment[propName] = baseValue; // Default to direct reference

                    // Apply uncertainty if configured for the operator
                    if (uncertaintyConfig) {
                        const uncertaintyFactor = (propName === 's' || propName === 'ls') ? uncertaintyConfig.s : uncertaintyConfig.e;

                        // Original logic had `processedTSpan["ls"] || !tsOperatorHash[foundOperator].uncertaintyPoint`
                        // This implies that if 'ls' is already set, or no uncertainty config, direct value is used.
                        // For Type III, we'll simplify: if uncertainty config exists, apply it.
                        // We can add a more explicit 'uncertain' property if needed.

                        // If `ls` or `ee` are not yet set, calculate them based on uncertainty.
                        if (propName === 's') {
                            projectedSegment[propName] = baseValue + (estimationFactor * uncertaintyFactor);
                            if (projectedSegment.ls === undefined) {
                                projectedSegment.ls = baseValue + estimationFactor + (estimationFactor * uncertaintyFactor);
                            }
                        } else if (propName === 'e') {
                            projectedSegment[propName] = baseValue + (estimationFactor * uncertaintyFactor);
                            if (projectedSegment.ee === undefined) {
                                projectedSegment.ee = baseValue - estimationFactor + (estimationFactor * uncertaintyFactor);
                            }
                        } else {
                            // For 'ls' or 'ee' directly contingent, just assign the value.
                            projectedSegment[propName] = baseValue;
                        }
                    }
                }
            };

            processTimePoint('s');
            processTimePoint('ls');
            processTimePoint('e');
            processTimePoint('ee');

            // Handle duration
            if (rawTSpan.duration) {
                let durationValue = String(rawTSpan.duration);
                let numericDuration = 0;

                if (durationValue.startsWith("=")) {
                    // This case was empty in the original, indicating an unhandled or future feature.
                    // For Type III, we acknowledge it but still don't implement new complex logic.
                    console.warn(`Unhandled duration operator: ${durationValue} for period ${incidentPeriod.id}.`);
                } else {
                    const lastChar = durationValue.slice(-1);
                    const parsedInt = parseInt(durationValue);

                    if (isNaN(parsedInt)) {
                         console.warn(`Invalid duration value: ${durationValue} for period ${incidentPeriod.id}.`);
                         numericDuration = 0;
                    } else if (durationUnits[lastChar]) {
                        numericDuration = parsedInt * durationUnits[lastChar];
                    } else {
                        numericDuration = parsedInt; // Assume days if no unit
                    }

                    projectedSegment.d = numericDuration; // Store duration explicitly

                    if (rawTSpan.during === true) {
                        // This logic path seems to store 'd' but doesn't calculate s/e from it here.
                        // The original `else if (incomingPeriod.tSpans[x].duration)` block handles s/e calculation.
                        // We'll let the next block handle setting s/e based on duration.
                    } else if (projectedSegment.s !== undefined && projectedSegment.e === undefined) {
                        projectedSegment.e = projectedSegment.s + numericDuration;
                    } else if (projectedSegment.e !== undefined && projectedSegment.s === undefined) {
                        projectedSegment.s = projectedSegment.e - numericDuration;
                    }
                }
            }

            // Handle cyclical steps (this part was incomplete in the original, stopping mid-variable declaration)
            if (rawTSpan.cstep) {
                // The original code stopped here. For Type III, we can add a placeholder or a partial implementation.
                // Let's add a warning and a simplified representation.
                isContingent = true;
                incidentPeriod.contingent = true;
                const cycleStepValue = String(rawTSpan.cstep);
                const cycleDurationValue = String(rawTSpan.cduration);

                projectedSegment.isCyclical = true;
                projectedSegment.cstepRaw = cycleStepValue;
                projectedSegment.cdurationRaw = cycleDurationValue;

                // Further implementation for cyclical steps would go here,
                // e.g., calculating actual cycle bounds based on start/end.
                // For now, we just mark it.
                console.warn(`Cyclical step logic partially implemented for period ${incidentPeriod.id}.`);
            }

            // If start or end are still undefined, flag for estimation
            if (projectedSegment.s === undefined || projectedSegment.e === undefined) {
                incidentPeriod.estimated = true;
                dynamicPeriodEstimation(projectedSegment); // Attempt to estimate if possible
            }

            // Validate that we have valid start/end after all processing
            if (projectedSegment.s === undefined || projectedSegment.e === undefined) {
                console.error(`Period ${incidentPeriod.id} could not be fully projected: missing start or end date.`);
                // As a fallback, ensure s and e are at least numbers to prevent downstream errors.
                projectedSegment.s = projectedSegment.s || 0;
                projectedSegment.e = projectedSegment.e || (projectedSegment.s + 1);
            }

            incidentPeriod.projectedTSpans.push(projectedSegment);
        });

        // Remove from processing list once done
        const index = currentlyEvaluatingEntries.indexOf(incidentPeriod);
        if (index > -1) {
            currentlyEvaluatingEntries.splice(index, 1);
        }
        return true;
    }
};