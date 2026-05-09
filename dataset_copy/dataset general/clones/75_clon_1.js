d3_layout_timeline =    function ( ) {

  /*
   * This section declares all the internal variables used by the timeline layout.
   * Many of these variables store configuration or internal state.
   */
  var topLayer = 0
    , bottomLayer = 0
    , eventRelations = []
    , temporalProjection
    , eventHash = {}
    , tlWidth = 100
    , tlHeight = 100
    , temporalRange = [0, 1]
    , temporalType = "date"
    , timeScale = 1
    , featureCollection
    , temporalPeriods = []
    , timeSegments
    , numLanes = 1
    , earliestDate = 1
    , latestDate = 10
  ; /* End of initial variable declarations */


  var periodHash = {}
    , lanes = {}
    , stats = {}
  ;

  var relationsList = [];

  var durationHash = {
      d: 1
    , h: 1 / 24
    , w: 7
    , m: 365.25 / 12
    , y: 365.25
  };

  var temporalRelations;

  /*
   * Slightly greater than zero values to get around the undefined test later.
   * This is a known hack and needs to be addressed in future versions.
   * It helps with uncertainty point calculations.
   */
  var tsOperatorHash = {
      "<": { subspan: "s", uncertaintyPoint: { "s": -1, "e": .001 } }
    , ">": { subspan: "e", uncertaintyPoint: { "s": .001, "e": 1 } }
    , "~": { uncertaintyPoint: { "s": -0.5, "e": -0.5 } }
  };

  var tSpanOperators = "[<|>|=|d|~]";

  var currentProcessedPeriods = [];


  uncertaintyValue = 365;

  sortTimes = 0;

  this.timeSegments = [];


  this.periodStatistics = stats;


  /*
   * Getter/setter for timePeriods.
   * If newTimePeriods is provided, it updates the internal temporalPeriods array.
   * Otherwise, it returns the current temporalPeriods array.
   */
  this.timePeriods = function (newTimePeriods) {
    if (newTimePeriods) {

      temporalPeriods = newTimePeriods;

      return this;
    }
    else {

      return temporalPeriods;
    }
  };


  /*
   * Getter/setter for periodRelations.
   * Allows external code to set or retrieve the temporal relations data.
   */
  this.periodRelations = function (newPeriodRelations) {
    if (newPeriodRelations) {

      temporalRelations = newPeriodRelations;

      return this;
    }
    else {

      return temporalRelations;
    }
  };


  this.laneArray = function () {
    return lanes;
  };


  /*
   * Sets or gets the width of the timeline visualization.
   * If a new width is provided, it updates tlWidth and re-processes featureCollection if it exists.
   */
  this.width = function (newWidth) {
    if (newWidth) {
      tlWidth = newWidth;
      if (featureCollection) {
        this.featureCollection(featureCollection);
      }
      return this;
    }
    else {
      return tlWidth;
    }
  };


  /*
   * Sets or gets the height of the timeline visualization.
   * Similar to width, it updates tlHeight and potentially re-processes featureCollection.
   */
  this.height = function (newHeight) {
    if (newHeight) {
      tlHeight = newHeight;
      if (featureCollection) {
        this.featureCollection(featureCollection);
      }
      return this;
    }
    else {
      return newHeight;
    }
  };


  this.lanes = function () {
    return lanes;
  };


  /*
   * Manages the layer boundaries for the visualization.
   * Expects an array [topLayerValue, bottomLayerValue].
   */
  this.layers = function (newLayers) {
    if (newLayers) {
      topLayer = newLayers[0];
      bottomLayer = newLayers[1];
      return this;
    }
    else {
      return [topLayer, bottomLayer];
    }
  };


  /*
   * Configures the temporal projection object.
   * If a new projection is provided, it updates temporalProjection and triggers an update.
   */
  this.projection = function (newProjection) {
    if (newProjection) {
      temporalProjection = newProjection;
      this.update(); // Call update to re-render with the new projection
      return this;
    }
    else {
      return temporalProjection;
    }
  };


  /*
   * Sets or gets the temporal range for the timeline.
   * Typically an array [start_time, end_time].
   */
  this.range = function (newRange) {
    if (newRange) {
      temporalRange = newRange;
      return this;
    }
    else {
      return temporalRange;
    }
  };


  /*
   * Specifies the type of date being used (e.g., "date", "year").
   */
  this.dateType = function (newDateType) {
    if (newDateType) {
      temporalType = newDateType;
      return this;
    }
    else {
      return temporalType;
    }
  };


  /*
   * Processes a collection of periods and their associated relations.
   * This is a central function for loading data into the timeline.
   */
  this.periodCollection = function (newCollection) {
    var periods = [];
    var events = [];

    if (!temporalProjection) {
      temporalProjection = new d3_chrono_projection();
      if (newCollection.projection) {
        if (newCollection.projection.origin) {
          temporalProjection.origin(newCollection.projection.origin);
        }
        if (newCollection.projection.atom) {
          temporalProjection.atom(newCollection.projection.atom);
        }
        if (newCollection.projection.datetype) {
          temporalProjection.type(newCollection.projection.datetype);
        }
      }
    }

    if (newCollection.periods) {
      temporalPeriods = newCollection.periods;
    }
    else {
      temporalPeriods = newCollection;
    }

    formatPeriodArray();

    if (newCollection.relations) {
      temporalRelations = newCollection.relations;
      processRelations();
    }

    sortLanes();

  };


  /*
   * Arranges periods into visual lanes to avoid overlaps.
   * This involves binning periods and determining their lane ranges based on relations.
   */
  function sortLanes() {
    // Sort periods into lanes based on their temporal extent.
    for (x in temporalPeriods) {
      if (temporalPeriods[x]) {
        laneBinning(temporalPeriods[x]);
      }
    }

    // Find the full lane range for each period, considering relations.
    if (temporalRelations) {
      for (x in temporalPeriods) {
        if (temporalPeriods[x]) {
          temporalPeriods[x].lanerange = determineLaneRange(temporalPeriods[x], relationsList);
        }
      }
    }
    else {
      // If no relations, lane range is just the period's assigned lane.
      for (x in temporalPeriods) {
        if (temporalPeriods[x]) {
          temporalPeriods[x].lanerange = [temporalPeriods[x].lane, temporalPeriods[x].lane];
        }
      }
    }
  }


  /*
   * Determines the vertical lane range occupied by a given period,
   * especially considering 'participates_in' relations.
   */
  function determineLaneRange(incPeriod, incRelList) {
    var laneRange = [parseInt(incPeriod.lane), parseInt(incPeriod.lane)];
    for (x in incRelList) {
      if (incRelList[x]) {
        if (incRelList[x].target === incPeriod && incRelList[x].type == "participates_in") {
          laneRange[0] = Math.min(laneRange[0], incRelList[x].source.lane);
          laneRange[1] = Math.max(laneRange[1], incRelList[x].source.lane);
        }
      }
    }
    return laneRange;
  }


  /*
   * Processes the raw temporal relations data to create an easily traversable relationsList.
   * It also determines the 'level' for each period based on 'has_part' relations.
   */
  function processRelations() {
    relationsList = [];
    for (x in temporalRelations) {
      if (temporalRelations[x]) {
        // Ensure both source and target periods exist before creating a relation object.
        if (periodHash[temporalRelations[x].rel[0]] && periodHash[temporalRelations[x].rel[2]]) {
          var newRelation = {
            source: periodHash[temporalRelations[x].rel[0]],
            target: periodHash[temporalRelations[x].rel[2]],
            type: temporalRelations[x].rel[1]
          };
          relationsList.push(newRelation);
        }
      }
    }

    // After processing all relations, determine the level for each period.
    for (x in temporalPeriods) {
      if (temporalPeriods[x]) {
        temporalPeriods[x].level = determineLevel(temporalPeriods[x], relationsList);
      }
    }
  }


  /*
   * Recursively determines the hierarchical level of a period based on 'has_part' relations.
   * A period with no 'has_part' relations is at level 1.
   */
  function determineLevel(incPeriod, incRelList) {
    for (x in incRelList) {
      if (incRelList[x]) {
        if (incRelList[x].target === incPeriod && incRelList[x].type == "has_part") {
          incRelList[x].target.partof = incRelList[x].source;
          return (determineLevel(incRelList[x].source, incRelList) + 1);
        }
      }
    }
    return 1;
  }


  /*
   * Formats the raw temporalPeriods array:
   *  - Creates a periodHash for quick lookup by ID.
   *  - Initializes default properties for each period (lane, level, etc.).
   *  - Projects the tSpans of each period into a common temporal coordinate system.
   *  - Sorts periods by their start time.
   *  - Recalculates statistics.
   */
  function formatPeriodArray() {
    // Build a period hash for efficient access by ID.
    for (x in temporalPeriods) {
      if (temporalPeriods[x]) {
        // If period has 's' or 'e' properties, convert them into a tSpans array structure.
        if (temporalPeriods[x].s || temporalPeriods[x].e) {
          temporalPeriods[x].tSpans = [{}];
          if (temporalPeriods[x].s.length > 0) {
            temporalPeriods[x].tSpans[0].s = temporalPeriods[x].s;
          }
          if (temporalPeriods[x].ls.length > 0) {
            temporalPeriods[x].tSpans[0].ls = temporalPeriods[x].ls;
          }
          if (temporalPeriods[x].e.length > 0) {
            temporalPeriods[x].tSpans[0].e = temporalPeriods[x].e;
          }
          if (temporalPeriods[x].ee.length > 0) {
            temporalPeriods[x].tSpans[0].ee = temporalPeriods[x].ee;
          }
          if (temporalPeriods[x].duration.length > 0) {
            temporalPeriods[x].tSpans[0].duration = temporalPeriods[x].duration;
          }
          if (temporalPeriods[x].cstep.length > 0) {
            temporalPeriods[x].tSpans[0].cstep = temporalPeriods[x].cstep;
          }
          if (temporalPeriods[x].cduration.length > 0) {
            temporalPeriods[x].tSpans[0].cduration = temporalPeriods[x].cduration;
          }
          /*
           * Commented out minduration for now, might be used later.
           * if(temporalPeriods[x].minduration.length > 0) {
           *     temporalPeriods[x].tSpans[0].minduration = temporalPeriods[x].minduration;
           * }
           */
          if (temporalPeriods[x].during.length > 0) {
            temporalPeriods[x].tSpans[0].during = temporalPeriods[x].during;
          }

        }
        // Initialize default properties for the period.
        temporalPeriods[x].lane = -1;
        temporalPeriods[x].level = 1;
        temporalPeriods[x].lanerange = [];
        temporalPeriods[x].partof; // Parent period if it's a part of something
        temporalPeriods[x].x = 0;
        temporalPeriods[x].projectedTSpans = [];
        temporalPeriods[x].contingent = false;
        temporalPeriods[x].estimated = false;
        temporalPeriods[x].relations = [];

        // Store in hash for quick lookups.
        periodHash[temporalPeriods[x].id] = temporalPeriods[x];
      }
    }

    // Project the tSpans for all periods.
    for (x in temporalPeriods) {
      if (temporalPeriods[x]) {
        projectTSpan(temporalPeriods[x]);
      }
    }

    // Sort the periods based on their projected start times.
    temporalPeriods.sort(function (a, b) {
      var aS = d3.min(a.projectedTSpans, function (p) { return p.s; });
      var bS = d3.min(b.projectedTSpans, function (p) { return p.s; });
      if (aS < bS) {
        return -1;
      }
      else if (aS > bS) {
        return 1;
      }
      else {
        return 1; // Maintain original order for equal starts, or just consistent sort
      }
    });

    newStatistics(); // Update internal statistics after projection and sorting.
  }


  /*
   * Assigns incomingPeriod to a visual lane, trying to minimize overlaps.
   * Periods are binned based on their `partof` relationship.
   */
  function laneBinning(incomingPeriod) {
    var incBounds = temporalBoundingBox(incomingPeriod.projectedTSpans);
    var placed = false;

    // Determine the lane guide (parent period ID or "base" if no parent).
    if (incomingPeriod.partof) {
      laneGuide = incomingPeriod.partof.id;
    }
    else {
      laneGuide = "base";
    }

    // Initialize the lane group if it doesn't exist.
    if (!lanes[laneGuide]) {
      lanes[laneGuide] = [];
    }

    // Try to place the period in an existing lane without overlap.
    for (x in lanes[laneGuide]) {
      if (lanes[laneGuide][x]) {
        var overlap = false;
        for (y in lanes[laneGuide][x]) {
          var thisBounds = temporalBoundingBox(lanes[laneGuide][x][y].projectedTSpans);
          // Check for temporal overlap.
          if ((incBounds.s <= thisBounds.e && incBounds.e >= thisBounds.s)) {
            overlap = true;
            break; // Overlap found, cannot place in this lane.
          }
        }
        if (overlap == false) {
          lanes[laneGuide][x].push(incomingPeriod);
          incomingPeriod.lane = x;
          placed = true;
          break; // Period placed successfully.
        }
      }
    }

    // If no suitable existing lane was found, create a new lane.
    if (placed == false) {
      incomingPeriod.lane = lanes[laneGuide].length;
      lanes[laneGuide].push([incomingPeriod]);
    }
  }


  /*
   * Calculates the overall temporal bounding box (min start, max end)
   * for an array of projected time spans.
   */
  function temporalBoundingBox(incomingTSpanArray) {
    var bounds = { s: 0, e: 0 };
    bounds.s = d3.min(incomingTSpanArray, function (d) { return d.s; });
    bounds.e = d3.max(incomingTSpanArray, function (d) { return d.e; });
    return bounds;
  }


  /*
   * Estimates missing start or end dates for a TSpan.
   * This is a temporary measure and should be updated more robustly.
   */
  function estimatePeriodOnTheFly(incomingTSpan) {
    // TO DO: Update estimates later once all the periods have been projected.
    // You need updated mean values for estimated periods.
    stats.medianS = d3.max(temporalPeriods, function (d, i) { return i < (temporalPeriods.length * .5) ? d3.mean(d.projectedTSpans, function (p) { return p.s; }) : null; });
    stats.mean = d3.mean(temporalPeriods, function (d) { return d3.mean(d.projectedTSpans, function (p) { return p.e - p.s; }); });

    if (!incomingTSpan.s) {
      incomingTSpan.s = stats.medianS;
    }
    if (!incomingTSpan.e) {
      incomingTSpan.e = incomingTSpan.s + stats.mean;
    }
  }


  /*
   * Projects the time spans of an incomingPeriod into a numerical coordinate system.
   * Handles direct values, contingent values (e.g., "<period_id.s"), and durations.
   */
  function projectTSpan(incomingPeriod) {
    // If this period has already been projected, return true to avoid re-processing.
    if (incomingPeriod.projectedTSpans[0]) {
      return true;
    }

    // A tSpan is always an array, even if it only has (typically) one object in that array.
    if (incomingPeriod.tSpans && currentProcessedPeriods.indexOf(incomingPeriod) == -1) {
      var isCyclical = false;
      currentProcessedPeriods.push(incomingPeriod); // Mark as currently being processed to detect cycles.

      for (x in incomingPeriod.tSpans) {
        var processedTSpan = {};

        // Process start time 's'
        if (incomingPeriod.tSpans[x].s) {
          if (!String(incomingPeriod.tSpans[x].s).match(tSpanOperators)) {
            // Direct value, project it.
            processedTSpan["s"] = temporalProjection.project(incomingPeriod.tSpans[x].s);
          }
          else {
            // Contingent value, parse operator and target period.
            var contingentValue = String(incomingPeriod.tSpans[x].s);
            var foundOperator = contingentValue.match(tSpanOperators)[0];
            var targetPeriod = contingentValue.substring(1).split(".")[0];
            var specificTSpan = contingentValue.substring(1).split(".")[1];

            // If no specific subspan is referenced, determine it based on the operator.
            if (!specificTSpan) {
              specificTSpan = tsOperatorHash[foundOperator].subspan ? tsOperatorHash[foundOperator].subspan : "s";
            }

            // Recursively project the target period first.
            projectTSpan(periodHash[targetPeriod]);

            // Apply the operator and uncertainty if applicable.
            if (processedTSpan["ls"] || !tsOperatorHash[foundOperator].uncertaintyPoint) {
              processedTSpan["s"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan];
            }
            else {
              processedTSpan["s"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan] + (uncertaintyValue * tsOperatorHash[foundOperator].uncertaintyPoint["s"]);
              processedTSpan["ls"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan] + uncertaintyValue + (uncertaintyValue * tsOperatorHash[foundOperator].uncertaintyPoint["s"]);
            }
          }
        }
        // If no start date is provided, mark for estimation.
        else {
          incomingPeriod.estimated = true;
        }

        // Process 'ls' (latest start)
        if (incomingPeriod.tSpans[x].ls) {
          if (!String(incomingPeriod.tSpans[x].ls).match(tSpanOperators)) {
            processedTSpan["ls"] = temporalProjection.project(incomingPeriod.tSpans[x].ls);
          }
          else {
            var contingentValue = String(incomingPeriod.tSpans[x].ls);
            var foundOperator = contingentValue.match(tSpanOperators)[0];
            var targetPeriod = contingentValue.substring(1).split(".")[0];
            var specificTSpan = contingentValue.substring(1).split(".")[1];
            if (!specificTSpan) {
              specificTSpan = tsOperatorHash[foundOperator].subspan ? tsOperatorHash[foundOperator].subspan : "ls";
            }
            projectTSpan(periodHash[targetPeriod]);
            processedTSpan["ls"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan];
          }
        }

        // Process end time 'e'
        if (incomingPeriod.tSpans[x].e) {
          if (!String(incomingPeriod.tSpans[x].e).match(tSpanOperators)) {
            processedTSpan["e"] = temporalProjection.project(incomingPeriod.tSpans[x].e);
          }
          else {
            var contingentValue = String(incomingPeriod.tSpans[x].e);
            var foundOperator = contingentValue.match(tSpanOperators)[0];
            var targetPeriod = contingentValue.substring(1).split(".")[0];
            var specificTSpan = contingentValue.substring(1).split(".")[1];
            if (!specificTSpan) {
              specificTSpan = tsOperatorHash[foundOperator].subspan ? tsOperatorHash[foundOperator].subspan : "e";
            }
            projectTSpan(periodHash[targetPeriod]);
            if (processedTSpan["ee"] || !tsOperatorHash[foundOperator].uncertaintyPoint) {
              processedTSpan["e"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan];
            }
            else {
              processedTSpan["e"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan] + (uncertaintyValue * tsOperatorHash[foundOperator].uncertaintyPoint["e"]);
              processedTSpan["ee"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan] - uncertaintyValue + (uncertaintyValue * tsOperatorHash[foundOperator].uncertaintyPoint["e"]);
            }

          }
        }

        // Process 'ee' (earliest end)
        if (incomingPeriod.tSpans[x].ee) {
          if (!String(incomingPeriod.tSpans[x].ee).match(tSpanOperators)) {
            processedTSpan["ee"] = temporalProjection.project(incomingPeriod.tSpans[x].ee);
          }
          else {
            var contingentValue = String(incomingPeriod.tSpans[x].ee);
            var foundOperator = contingentValue.match(tSpanOperators)[0];
            var targetPeriod = contingentValue.substring(1).split(".")[0];
            var specificTSpan = contingentValue.substring(1).split(".")[1];
            if (!specificTSpan) {
              specificTSpan = tsOperatorHash[foundOperator].subspan ? tsOperatorHash[foundOperator].subspan : "ee";
            }
            projectTSpan(periodHash[targetPeriod]);
            processedTSpan["ee"] = periodHash[targetPeriod]["projectedTSpans"][0][specificTSpan];
          }
        }

        // Process duration if 'during' is true (absolute duration).
        if (incomingPeriod.tSpans[x].duration && incomingPeriod.tSpans[x].during == true) {
          var durVal = incomingPeriod.tSpans[x].duration;
          var durType = durVal.substring(durVal.length - 1, durVal.length);
          if (durationHash[durType]) {
            durVal = parseInt(durVal) * durationHash[durType];
          }
          else {
            durVal = parseInt(durVal);
          }
          processedTSpan["d"] = durVal;
        }
        // Process duration if 'during' is false or undefined (relative duration).
        else if (incomingPeriod.tSpans[x].duration) {
          if (incomingPeriod.tSpans[x].duration.substring(0, 1) != "=") {
            // Rightmost character indicates the length unit, or it's in days by default.
            var durVal = incomingPeriod.tSpans[x].duration;
            var durType = durVal.substring(durVal.length - 1, durVal.length);
            if (durationHash[durType]) {
              durVal = parseInt(durVal) * durationHash[durType];
            }
            else {
              durVal = parseInt(durVal);
            }
            if (incomingPeriod.tSpans[x].s) {
              processedTSpan["e"] = processedTSpan["s"] + durVal;
            }
            else if (incomingPeriod.tSpans[x].e) {
              processedTSpan["s"] = processedTSpan["e"] - durVal;
            }
          }
          else {
            // Handle duration specified as a relation (e.g., "=period_id.duration").
            // This part is currently empty and might need implementation.
          }
        }

        // Process cyclical step.
        if (incomingPeriod.tSpans[x].cstep) {
          isCyclical = true;
          if (incomingPeriod.tSpans[x].cstep.substring(0, 1) != "=") {
            var cycleBounds = processedTSpan;
            var durVal = incomingPeriod.tSpans[x].cduration;
            var durType = durVal.substring(durVal.length - 1, durVal.length);
            if (durationHash[durType]) {
              durVal = parseInt(durVal) * durationHash[durType];
            }
            else {
              durVal = parseInt(durVal);
            }
            var stepVal = incomingPeriod.tSpans[x].cstep;
            var stepType = stepVal.substring(stepVal.length - 1, stepVal.length);