d3_layout_timeband = function() {
  var upperBoundary = 0,
      lowerBoundary = 0,
      periodLinkages = [],
      timeCoordinateSystem,
      momentIdentifier = {},
      chartWidth = 100,
      chartHeight = 100,
      timeSpanExtent = [0, 1],
      dateTimeKind = "date",
      temporalMagnification = 1,
      dataItemsCollection,
      chronologicalSections = [],
      durationComponents,
      trackQuantity = 1,
      initialMoment = 1,
      finalMoment = 10;

  var sectionRegistry = {},
      displayTracks = {},
      statisticalData = {};
  var connectionRecords = [];
  var spanConverter = {
    d: 1,
    h: 1 / 24,
    w: 7,
    m: 365.25 / 12,
    y: 365.25
  };
  var chronologicalConnections;

  // Values slightly above zero to bypass undefined checks later.
  // This is a temporary solution and requires future refinement.
  var timeSpanOperatorMap = {
    "<": {
      subspan: "s",
      uncertaintyPoint: {
        "s": -1,
        "e": 0.001
      }
    },
    ">": {
      subspan: "e",
      uncertaintyPoint: {
        "s": 0.001,
        "e": 1
      }
    },
    "~": {
      uncertaintyPoint: {
        "s": -0.5,
        "e": -0.5
      }
    }
  };
  var timeSpanOperatorPattern = "[<|>|=|d|~]";
  var currentlyAnalyzedSections = [];


  imprecisionAmount = 365;
  timeSortingEnabled = 0;
  this.durationComponents = [];



  this.sectionStatisticalData = statisticalData;

  this.manageTimeSections = function(incomingIntervals) {
    if (incomingIntervals) {
      chronologicalSections = incomingIntervals;
      return this;
    } else {
      return chronologicalSections;
    }
  };

  this.manageSectionConnections = function(newRelationships) {
    if (newRelationships) {
      chronologicalConnections = newRelationships;
      return this;
    } else {
      return chronologicalConnections;
    }
  };

  this.retrieveTrackArray = function() {
    return displayTracks;
  };

  this.setChartWidth = function(freshWidth) {
    if (freshWidth) {
      chartWidth = freshWidth;
      if (dataItemsCollection) {
        this.loadSectionCollection(dataItemsCollection);
      }
      return this;
    } else {
      return chartWidth;
    }
  };

  this.setChartHeight = function(freshHeight) {
    if (freshHeight) {
      chartHeight = freshHeight;
      if (dataItemsCollection) {
        this.loadSectionCollection(dataItemsCollection);
      }
      return this;
    } else {
      return freshHeight;
    }
  };

  this.getDisplayTracks = function() {
    return displayTracks;
  };

  this.configureLayerBoundaries = function(layerSettings) {
    if (layerSettings) {
      upperBoundary = layerSettings[0];
      lowerBoundary = layerSettings[1];
      return this;
    } else {
      return [upperBoundary, lowerBoundary];
    }
  };

  this.setTemporalProjection = function(newMapping) {
    if (newMapping) {
      timeCoordinateSystem = newMapping;
      this.update();
      return this;
    } else {
      return timeCoordinateSystem;
    }
  };

  this.setTemporalRange = function(newExtent) {
    if (newExtent) {
      timeSpanExtent = newExtent;
      return this;
    } else {
      return timeSpanExtent;
    }
  };

  this.setDateTimeKind = function(newKind) {
    if (newKind) {
      dateTimeKind = newKind;
      return this;
    } else {
      return dateTimeKind;
    }
  };

  this.loadSectionCollection = function(inputDataset) {
    var sections = [];
    var occurrences = [];
    if (!timeCoordinateSystem) {
      timeCoordinateSystem = new d3_temporal_mapper();
      if (inputDataset.projection) {
        if (inputDataset.projection.origin) {
          timeCoordinateSystem.origin(inputDataset.projection.origin);
        }
        if (inputDataset.projection.atom) {
          timeCoordinateSystem.atom(inputDataset.projection.atom);
        }
        if (inputDataset.projection.datetype) {
          timeCoordinateSystem.type(inputDataset.projection.datetype);
        }
      }
    }
    if (inputDataset.periods) {
      chronologicalSections = inputDataset.periods;
    } else {
      chronologicalSections = inputDataset;
    }
    prepareSectionData();

    if (inputDataset.relations) {
      chronologicalConnections = inputDataset.relations;
      handleChronologicalConnections();
    }

    arrangeDisplayTracks();

  };

  function arrangeDisplayTracks() {
    // Organize by tracks
    for (var currentSectionIndex in chronologicalSections) {
      if (chronologicalSections[currentSectionIndex]) {
        assignTrackBins(chronologicalSections[currentSectionIndex]);
      }
    }

    // Determine track range if connections exist
    if (chronologicalConnections) {
      for (var currentSectionIndex in chronologicalSections) {
        if (chronologicalSections[currentSectionIndex]) {
          chronologicalSections[currentSectionIndex].lanerange = calculateTrackExtent(chronologicalSections[currentSectionIndex], connectionRecords);
        }
      }
    } else {
      for (var currentSectionIndex in chronologicalSections) {
        if (chronologicalSections[currentSectionIndex]) {
          chronologicalSections[currentSectionIndex].lanerange = [chronologicalSections[currentSectionIndex].lane, chronologicalSections[currentSectionIndex].lane];
        }
      }
    }
  }

  function calculateTrackExtent(incomingSection, connectionCollection) {
    var trackExtent = [Number(incomingSection.lane), Number(incomingSection.lane)];
    for (var recordIndex in connectionCollection) {
      if (connectionCollection[recordIndex]) {
        if (connectionCollection[recordIndex].target === incomingSection && connectionCollection[recordIndex].type == "participates_in") {
          trackExtent[0] = Math.min(trackExtent[0], connectionCollection[recordIndex].source.lane);
          trackExtent[1] = Math.max(trackExtent[1], connectionCollection[recordIndex].source.lane);
        }
      }
    }
    return trackExtent;
  }


  function handleChronologicalConnections() {
    connectionRecords = [];
    for (var connectionIndex in chronologicalConnections) {
      if (chronologicalConnections[connectionIndex]) {
        if (sectionRegistry[chronologicalConnections[connectionIndex].rel[0]] && sectionRegistry[chronologicalConnections[connectionIndex].rel[2]]) {
          var newConnection = {
            source: sectionRegistry[chronologicalConnections[connectionIndex].rel[0]],
            target: sectionRegistry[chronologicalConnections[connectionIndex].rel[2]],
            type: chronologicalConnections[connectionIndex].rel[1]
          };
          connectionRecords.push(newConnection);
        }
      }
    }

    for (var sectionIndex in chronologicalSections) {
      if (chronologicalSections[sectionIndex]) {
        chronologicalSections[sectionIndex].level = determineHierarchyLevel(chronologicalSections[sectionIndex], connectionRecords);
      }
    }
  }

  function determineHierarchyLevel(currentSection, currentConnectionList) {
    for (var connectionIndex in currentConnectionList) {
      if (currentConnectionList[connectionIndex]) {
        if (currentConnectionList[connectionIndex].target === currentSection && currentConnectionList[connectionIndex].type == "has_part") {
          currentConnectionList[connectionIndex].target.partof = currentConnectionList[connectionIndex].source;
          return (determineHierarchyLevel(currentConnectionList[connectionIndex].source, currentConnectionList) + 1);
        }
      }
    }
    return 1;
  }


  function prepareSectionData() {
    // Construct a section identifier map
    for (var sectionId in chronologicalSections) {
      if (chronologicalSections[sectionId]) {
        // A CSV input will necessitate creating time spans
        if (chronologicalSections[sectionId].s || chronologicalSections[sectionId].e) {
          chronologicalSections[sectionId].tSpans = [{}];
          if (chronologicalSections[sectionId].s && chronologicalSections[sectionId].s.length > 0) {
            chronologicalSections[sectionId].tSpans[0].s = chronologicalSections[sectionId].s;
          }
          if (chronologicalSections[sectionId].ls && chronologicalSections[sectionId].ls.length > 0) {
            chronologicalSections[sectionId].tSpans[0].ls = chronologicalSections[sectionId].ls;
          }
          if (chronologicalSections[sectionId].e && chronologicalSections[sectionId].e.length > 0) {
            chronologicalSections[sectionId].tSpans[0].e = chronologicalSections[sectionId].e;
          }
          if (chronologicalSections[sectionId].ee && chronologicalSections[sectionId].ee.length > 0) {
            chronologicalSections[sectionId].tSpans[0].ee = chronologicalSections[sectionId].ee;
          }
          if (chronologicalSections[sectionId].duration && chronologicalSections[sectionId].duration.length > 0) {
            chronologicalSections[sectionId].tSpans[0].duration = chronologicalSections[sectionId].duration;
          }
          if (chronologicalSections[sectionId].cstep && chronologicalSections[sectionId].cstep.length > 0) {
            chronologicalSections[sectionId].tSpans[0].cstep = chronologicalSections[sectionId].cstep;
          }
          if (chronologicalSections[sectionId].cduration && chronologicalSections[sectionId].cduration.length > 0) {
            chronologicalSections[sectionId].tSpans[0].cduration = chronologicalSections[sectionId].cduration;
          }
          /*
          if(chronologicalSections[sectionId].minduration.length > 0) {
              chronologicalSections[sectionId].tSpans[0].minduration = chronologicalSections[sectionId].minduration;
          }
          */
          if (chronologicalSections[sectionId].during && chronologicalSections[sectionId].during.length > 0) {
            chronologicalSections[sectionId].tSpans[0].during = chronologicalSections[sectionId].during;
          }

        }
        chronologicalSections[sectionId].lane = -1;
        chronologicalSections[sectionId].level = 1;
        chronologicalSections[sectionId].lanerange = [];
        chronologicalSections[sectionId].partof;
        chronologicalSections[sectionId].x = 0;
        chronologicalSections[sectionId].projectedTSpans = [];
        chronologicalSections[sectionId].contingent = false;
        chronologicalSections[sectionId].estimated = false;
        chronologicalSections[sectionId].relations = [];
        sectionRegistry[chronologicalSections[sectionId].id] = chronologicalSections[sectionId];
      }
    }

    // Map the period time spans
    for (var sectionId in chronologicalSections) {
      if (chronologicalSections[sectionId]) {
        mapTimeSpanToCoordinates(chronologicalSections[sectionId]);
      }
    }

    chronologicalSections.sort(function(first, second) {
      var firstStart = d3.min(first.projectedTSpans, function(p) {
        return p.s;
      });
      var secondStart = d3.min(second.projectedTSpans, function(p) {
        return p.s;
      });
      if (firstStart < secondStart) {
        return -1;
      } else if (firstStart > secondStart) {
        return 1;
      } else {
        return 1;
      }
    });

    generateNewStatistics();
  }

  function assignTrackBins(inputSection) {
    var sectionBounds = computeTemporalBounds(inputSection.projectedTSpans);
    var isPlaced = false;
    if (inputSection.partof) {
      trackIdentifier = inputSection.partof.id;
    } else {
      trackIdentifier = "base";
    }

    if (!displayTracks[trackIdentifier]) {
      displayTracks[trackIdentifier] = [];
    }
    for (var trackIndex in displayTracks[trackIdentifier]) {
      if (displayTracks[trackIdentifier][trackIndex]) {
        var hasOverlap = false;
        for (var itemIndex in displayTracks[trackIdentifier][trackIndex]) {
          var currentItemBounds = computeTemporalBounds(displayTracks[trackIdentifier][trackIndex][itemIndex].projectedTSpans);
          if ((sectionBounds.s <= currentItemBounds.e && sectionBounds.e >= currentItemBounds.s)) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap == false) {
          displayTracks[trackIdentifier][trackIndex].push(inputSection);
          inputSection.lane = trackIndex;
          isPlaced = true;
          break;
        }
      }
    }
    if (isPlaced == false) {
      inputSection.lane = displayTracks[trackIdentifier].length;
      displayTracks[trackIdentifier].push([inputSection]);
    }
  }

  function computeTemporalBounds(inputTimeSpanArray) {
    var bounds = {
      s: 0,
      e: 0
    };
    bounds.s = d3.min(inputTimeSpanArray, function(d) {
      return d.s;
    });
    bounds.e = d3.max(inputTimeSpanArray, function(d) {
      return d.e;
    });
    return bounds;
  }

  function dynamicallyEstimateSection(inputTimeSpan) {
    // TODO: Update estimates later once all sections have been projected.
    // This requires updated mean values for estimated sections.
    statisticalData.medianS = d3.max(chronologicalSections, function(d, i) {
      return i < (chronologicalSections.length * 0.5) ? d3.mean(d.projectedTSpans, function(p) {
        return p.s;
      }) : null;
    });
    statisticalData.mean = d3.mean(chronologicalSections, function(d) {
      return d3.mean(d.projectedTSpans, function(p) {
        return p.e - p.s;
      });
    });
    if (!inputTimeSpan.s) {
      inputTimeSpan.s = statisticalData.medianS;
    }
    if (!inputTimeSpan.e) {
      inputTimeSpan.e = inputTimeSpan.s + statisticalData.mean;
    }
  }

  function mapTimeSpanToCoordinates(inputSection) {
    // If this section has already been mapped, return true.
    if (inputSection.projectedTSpans[0]) {
      return true;
    }

    // A time span is always an array, even if it typically contains only one object.
    if (inputSection.tSpans && currentlyAnalyzedSections.indexOf(inputSection) == -1) {
      var isCyclic = false;
      currentlyAnalyzedSections.push(inputSection);
      for (var spanIndex in inputSection.tSpans) {
        var processedSpan = {};
        if (inputSection.tSpans[spanIndex].s) {
          if (!String(inputSection.tSpans[spanIndex].s).match(timeSpanOperatorPattern)) {
            processedSpan["s"] = timeCoordinateSystem.project(inputSection.tSpans[spanIndex].s);
          } else {
            var contingentData = String(inputSection.tSpans[spanIndex].s);
            var detectedOperator = contingentData.match(timeSpanOperatorPattern)[0];
            var targetSectionId = contingentData.substring(1).split(".")[0];
            var specificSubSpan = contingentData.substring(1).split(".")[1];
            if (!specificSubSpan) {
              // If a specific sub-span isn't referenced, resolve based on the operator.
              // If the operator doesn't reference a sub-span, default to 's'.
              specificSubSpan = timeSpanOperatorMap[detectedOperator].subspan ? timeSpanOperatorMap[detectedOperator].subspan : "s";
            }
            mapTimeSpanToCoordinates(sectionRegistry[targetSectionId]);
            if (processedSpan["ls"] || !timeSpanOperatorMap[detectedOperator].uncertaintyPoint) {
              processedSpan["s"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan];
            } else {
              processedSpan["s"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan] + (imprecisionAmount * timeSpanOperatorMap[detectedOperator].uncertaintyPoint["s"]);
              processedSpan["ls"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan] + imprecisionAmount + (imprecisionAmount * timeSpanOperatorMap[detectedOperator].uncertaintyPoint["s"]);
            }
          }
        }
        // If a start date is missing, flag for estimation.
        else {
          inputSection.estimated = true;
        }
        if (inputSection.tSpans[spanIndex].ls) {
          if (!String(inputSection.tSpans[spanIndex].ls).match(timeSpanOperatorPattern)) {
            processedSpan["ls"] = timeCoordinateSystem.project(inputSection.tSpans[spanIndex].ls);
          } else {
            var contingentData = String(inputSection.tSpans[spanIndex].ls);
            var detectedOperator = contingentData.match(timeSpanOperatorPattern)[0];
            var targetSectionId = contingentData.substring(1).split(".")[0];
            var specificSubSpan = contingentData.substring(1).split(".")[1];
            if (!specificSubSpan) {
              specificSubSpan = timeSpanOperatorMap[detectedOperator].subspan ? timeSpanOperatorMap[detectedOperator].subspan : "ls";
            }
            mapTimeSpanToCoordinates(sectionRegistry[targetSectionId]);
            processedSpan["ls"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan];
          }
        }
        if (inputSection.tSpans[spanIndex].e) {
          if (!String(inputSection.tSpans[spanIndex].e).match(timeSpanOperatorPattern)) {
            processedSpan["e"] = timeCoordinateSystem.project(inputSection.tSpans[spanIndex].e);
          } else {
            var contingentData = String(inputSection.tSpans[spanIndex].e);
            var detectedOperator = contingentData.match(timeSpanOperatorPattern)[0];
            var targetSectionId = contingentData.substring(1).split(".")[0];
            var specificSubSpan = contingentData.substring(1).split(".")[1];
            if (!specificSubSpan) {
              specificSubSpan = timeSpanOperatorMap[detectedOperator].subspan ? timeSpanOperatorMap[detectedOperator].subspan : "e";
            }
            mapTimeSpanToCoordinates(sectionRegistry[targetSectionId]);
            if (processedSpan["ee"] || !timeSpanOperatorMap[detectedOperator].uncertaintyPoint) {
              processedSpan["e"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan];
            } else {
              processedSpan["e"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan] + (imprecisionAmount * timeSpanOperatorMap[detectedOperator].uncertaintyPoint["e"]);
              processedSpan["ee"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan] - imprecisionAmount + (imprecisionAmount * timeSpanOperatorMap[detectedOperator].uncertaintyPoint["e"]);
            }

          }
        }
        if (inputSection.tSpans[spanIndex].ee) {
          if (!String(inputSection.tSpans[spanIndex].ee).match(timeSpanOperatorPattern)) {
            processedSpan["ee"] = timeCoordinateSystem.project(inputSection.tSpans[spanIndex].ee);
          } else {
            var contingentData = String(inputSection.tSpans[spanIndex].ee);
            var detectedOperator = contingentData.match(timeSpanOperatorPattern)[0];
            var targetSectionId = contingentData.substring(1).split(".")[0];
            var specificSubSpan = contingentData.substring(1).split(".")[1];
            if (!specificSubSpan) {
              specificSubSpan = timeSpanOperatorMap[detectedOperator].subspan ? timeSpanOperatorMap[detectedOperator].subspan : "ee";
            }
            mapTimeSpanToCoordinates(sectionRegistry[targetSectionId]);
            processedSpan["ee"] = sectionRegistry[targetSectionId]["projectedTSpans"][0][specificSubSpan];
          }
        }
        if (inputSection.tSpans[spanIndex].duration && inputSection.tSpans[spanIndex].during == true) {
          var durationValue = inputSection.tSpans[spanIndex].duration;
          var durationUnit = durationValue.substring(durationValue.length - 1, durationValue.length);
          if (spanConverter[durationUnit]) {
            durationValue = Number(durationValue) * spanConverter[durationUnit];
          } else {
            durationValue = Number(durationValue);
          }
          processedSpan["d"] = durationValue;
        } else if (inputSection.tSpans[spanIndex].duration) {
          if (inputSection.tSpans[spanIndex].duration.substring(0, 1) != "=") {
            // The rightmost character should be a letter indicating length, or it's in days.
            var durationValue = inputSection.tSpans[spanIndex].duration;
            var durationUnit = durationValue.substring(durationValue.length - 1, durationValue.length);
            if (spanConverter[durationUnit]) {
              durationValue = Number(durationValue) * spanConverter[durationUnit];
            } else {
              durationValue = Number(durationValue);
            }
            if (inputSection.tSpans[spanIndex].s) {
              processedSpan["e"] = processedSpan["s"] + durationValue;
            } else if (inputSection.tSpans[spanIndex].e) {
              processedSpan["s"] = processedSpan["e"] - durationValue;
            }
          } else {

          }
        }
        if (inputSection.tSpans[spanIndex].cstep) {
          isCyclic = true;
          if (inputSection.tSpans[spanIndex].cstep.substring(0, 1) != "=") {
            var cycleExtent = processedSpan;
            var durationValue = inputSection.tSpans[spanIndex].cduration;
            var durationUnit = durationValue.substring(durationValue.length - 1, durationValue.length);
            if (spanConverter[durationUnit]) {
              durationValue = Number(durationValue) * spanConverter[durationUnit];
            } else {
              durationValue = Number(durationValue);
            }
            var stepValue = inputSection.tSpans[spanIndex].cstep;
            var stepUnit = stepValue.substring(stepValue.length - 1, stepValue.length);
          }
        }
      }
    }
  }

  function generateNewStatistics() {
    // Initial statistics calculation
    statisticalData.minStart = d3.min(chronologicalSections, function(d) {
      return d3.min(d.projectedTSpans, function(p) {
        return p.s;
      });
    });
    statisticalData.maxEnd = d3.max(chronologicalSections, function(d) {
      return d3.max(d.projectedTSpans, function(p) {
        return p.e;
      });
    });
    statisticalData.meanDuration = d3.mean(chronologicalSections, function(d) {
      return d3.mean(d.projectedTSpans, function(p) {
        return p.e - p.s;
      });
    });

    // Handle estimated sections
    for (var i in chronologicalSections) {
      if (chronologicalSections[i].estimated) {
        dynamicallyEstimateSection(chronologicalSections[i].projectedTSpans[0]);
      }
    }

    // Recalculate global min/max after estimation
    statisticalData.minStart = d3.min(chronologicalSections, function(d) {
      return d3.min(d.projectedTSpans, function(p) {
        return p.s;
      });
    });
    statisticalData.maxEnd = d3.max(chronologicalSections, function(d) {
      return d3.max(d.projectedTSpans, function(p) {
        return p.e;
      });
    });
  }

  // Public methods that can be called from outside
  this.update = function() {
    // Re-process everything if underlying data or projection changes
    if (chronologicalSections) {
      // Clear previous processing states
      currentlyAnalyzedSections = [];
      for (var i in chronologicalSections) {
        if (chronologicalSections[i]) {
          chronologicalSections[i].projectedTSpans = []; // Clear projected spans
          chronologicalSections[i].lane = -1; // Reset lane assignment
          chronologicalSections[i].level = 1; // Reset level
          chronologicalSections[i].lanerange = []; // Reset lane range
          chronologicalSections[i].partof = undefined; // Clear parent reference
          chronologicalSections[i].x = 0; // Reset x position
          chronologicalSections[i].contingent = false; // Reset contingent flag
          chronologicalSections[i].estimated = false; // Reset estimated flag
          chronologicalSections[i].relations = []; // Clear relations
        }
      }
      displayTracks = {}; // Clear lane assignments
      sectionRegistry = {}; // Clear period hash
      connectionRecords = []; // Clear relation list

      prepareSectionData(); // Re-format and project periods
      if (chronologicalConnections) {
        handleChronologicalConnections(); // Re-process relations
      }
      arrangeDisplayTracks(); // Re-sort and assign lanes
      generateNewStatistics(); // Re-calculate statistics
    }
    return this;
  };

  return this;
};