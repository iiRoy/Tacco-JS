function createMeasurement(measurements) {
  const [w, h, t, r, b, l] = measurements;
  const iW = w - (l + r);
  const iH = h - (t + b);
  const cX = iW / 2 + l;
  const cY = iH / 2 + t;

  const dataMap = new Map();
  dataMap.set('overallWidth', w);
  dataMap.set('overallHeight', h);
  dataMap.set('interiorWidth', iW);
  dataMap.set('interiorHeight', iH);
  dataMap.set('topOffset', t);
  dataMap.set('rightOffset', r);
  dataMap.set('bottomOffset', b);
  dataMap.set('leftOffset', l);
  dataMap.set('centerX', cX);
  dataMap.set('centerY', cY);

  return dataMap;
}

const mainMeasurement = createMeasurement([620, 400, 30, 30, 30, 30]);
const plotQuadrantMeasurement = createMeasurement([220, 200, 30, 30, 30, 30]);
const plotVelocityMeasurement = plotQuadrantMeasurement;
const plotImpactMeasurement = plotQuadrantMeasurement;
const plotScatterMeasurement = createMeasurement([220, 200, 30, 30, 30, 50]);
const scatterEffectiveMeasurement = createMeasurement([540, 300, 30, 30, 30, 50]);
const positionEffectiveMeasurement = createMeasurement([540, 200, 30, 30, 30, 40]);
const speedEffectiveMeasurement = positionEffectiveMeasurement;
const histMeasurement = createMeasurement([540, 300, 30, 30, 30, 50]);

const ACTIVE_DURATION = 1000;
const MAX_OBSERVATION_PERIOD = 2000;
const RENDER_THROTTLE = MAX_OBSERVATION_PERIOD;
const MAX_VELOCITY = 6;

function calculateImpactRadius(currentRadius, targetRadius) {
  return (plotImpactMeasurement.get('interiorWidth') / 2 / targetRadius) * currentRadius;
}

function deriveColor(currentVelocity) {
  const red = Math.min(255, Math.max(0, Math.floor((currentVelocity / MAX_VELOCITY) * 255)));
  return `rgb(${red}, 0, 0)`;
}

const scatterCoordX = d3.scale.linear()
  .domain([0.5, 5.5])
  .range([0, plotScatterMeasurement.get('interiorWidth')]);

const scatterCoordY = d3.scale.linear()
  .domain([MAX_OBSERVATION_PERIOD, 0])
  .range([0, plotScatterMeasurement.get('interiorHeight')]);

const timeScale = d3.scale.linear()
  .domain([0, 1000])
  .range([0, plotVelocityMeasurement.get('interiorWidth')]);

const velocityScale = d3.scale.linear()
  .domain([0, MAX_VELOCITY])
  .range([plotVelocityMeasurement.get('interiorHeight'), 0]);

const coordX = d3.scale.linear()
  .domain([-20, 300])
  .range([0, plotQuadrantMeasurement.get('interiorWidth')]);

const coordY = d3.scale.linear()
  .domain([-50, 50])
  .range([plotQuadrantMeasurement.get('interiorHeight'), 0]);

const effScatterCoordX = d3.scale.linear()
  .domain([0.5, 6.5])
  .range([0, scatterEffectiveMeasurement.get('interiorWidth')]);

const effScatterCoordY = d3.scale.linear()
  .domain([MAX_OBSERVATION_PERIOD, 0])
  .range([0, scatterEffectiveMeasurement.get('interiorHeight')]);

const effPositionCoordX = d3.scale.linear()
  .domain([-60, 400])
  .range([0, positionEffectiveMeasurement.get('interiorWidth')]);

const effPositionCoordY = d3.scale.linear()
  .domain([-50, 50])
  .range([positionEffectiveMeasurement.get('interiorHeight'), 0]);

const effSpeedCoordX = d3.scale.linear()
  .domain([0, MAX_OBSERVATION_PERIOD])
  .range([0, speedEffectiveMeasurement.get('interiorWidth')]);

const effSpeedCoordY = d3.scale.linear()
  .domain([0, MAX_VELOCITY])
  .range([speedEffectiveMeasurement.get('interiorHeight'), 0]);

const exerciseRegime = (() => {
  let currentTarget = { x: 0, y: 0, r: 10 };
  let initialPoint = { x: 0, y: 0, t: 0 };
  let previousPoint = {};

  let targetLocations = [];
  let currentTargetIndex = 0;
  let successCounter = 0;
  let failureCounter = 0;
  const locationConstraints = { minDistance: 120, maxDistance: 300, minWidth: 10, maxWidth: 100 };
  const locationParameters = { count: 9, separation: 200, size: 50, randomize: true };

  let recordedPath = [];
  let isActive = false;

  const collectedData = [];
  let currentDataSeries = 0;
  let dataSeriesCount = 0;

  const seriesColor = d3.scale.category10();

  let totalID = 0;
  let totalTime = 0;

  let renderTimerHandle;

  const generateTargetElement = () => {
    currentTarget = targetLocations[currentTargetIndex];
    currentTarget.separation = locationParameters.separation;
    currentTargetIndex = (currentTargetIndex + Math.ceil(targetLocations.length / 2)) % targetLocations.length;

    const targetSelection = testAreaSVG.selectAll('#focusTarget').data([currentTarget]);

    const applyAttributes = (d) => {
      d.attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', (d) => d.w / 2);
    };

    targetSelection.enter()
      .append('circle')
      .attr('id', 'focusTarget')
      .style('fill', 'red')
      .call(applyAttributes);

    targetSelection.transition()
      .call(applyAttributes);

    isActive = true;
  };

  const updateTargetCircles = () => {
    successCounter = 0;

    generateTargetLocations(locationParameters.count,
      locationParameters.separation,
      locationParameters.size);

    const circles = testAreaSVG.selectAll('circle.guide').data(targetLocations);

    const applyAttributes = (d) => {
      d.attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', (d) => d.w / 2);
    };

    circles.enter()
      .append('circle')
      .attr('class', 'guide')
      .call(applyAttributes);

    circles.transition()
      .call(applyAttributes);

    circles.exit()
      .transition()
      .attr('r', 0)
      .remove();

    currentTargetIndex = 0;
    generateTargetElement();
    isActive = false;
  };

  const generateTargetLocations = (num, d, w) => {
    plotImpactGroup.selectAll('circle.impact')
      .transition()
      .duration(ACTIVE_DURATION)
      .ease('linear')
      .attr('r', 2)
      .style('opacity', 0)
      .remove();

    plotQuadrantGroup.selectAll('line.trace')
      .transition()
      .duration(ACTIVE_DURATION)
      .style('stroke-opacity', 0)
      .remove();

    plotVelocityGroup.selectAll('line.trace')
      .transition()
      .duration(ACTIVE_DURATION)
      .style('stroke-opacity', 0)
      .remove();

    targetLocations = [];

    for (let i = 0; i < num; i++) {
      targetLocations[i] = {
        x: mainMeasurement.get('centerX') + ((d / 2) * Math.cos((2 * Math.PI * i) / num)),
        y: mainMeasurement.get('centerY') + ((d / 2) * Math.sin((2 * Math.PI * i) / num)),
        w: w
      };
    }
  };

  const clearTarget = () => {
    testAreaSVG.selectAll('#focusTarget').data([])
      .exit()
      .remove();

    isActive = false;
    recordedPath = [];
  };

  const handleMouseClick = (x, y) => {
    if (geometricDistance({ x: x, y: y }, currentTarget) < (currentTarget.w / 2)) {
      addObservationPoint({
        initial: initialPoint,
        target: currentTarget,
        path: recordedPath,
        impact: { x: x, y: y, t: (new Date()).getTime() }
      });
      clearTarget();

      if (locationParameters.randomize && successCounter >= targetLocations.length) {
        randomizeParameters();
        successCounter = 0;
        currentTargetIndex = 0;
        failureCounter = 0;
        updateTargetCircles();
        generateTargetElement();
        isActive = false;
      } else {
        successCounter++;
        generateTargetElement();
      }

      previousPoint = { x: x, y: y, t: (new Date()).getTime() };
      initialPoint = previousPoint;
      recordedPath.push(previousPoint);
    } else {
      failureCounter++;
    }
  };

  const handleMouseMove = (x, y) => {
    if (isActive) {
      if (x === previousPoint.x && y === previousPoint.y) {
        return;
      }

      if (renderTimerHandle) {
        window.clearTimeout(renderTimerHandle);
      }
      renderTimerHandle = window.setTimeout(updateCharts, RENDER_THROTTLE, exerciseRegime);

      const newPoint = { x: x, y: y, t: (new Date()).getTime() };
      recordedPath.push(newPoint);

      const timeDiff = newPoint.t - previousPoint.t;
      const distanceMoved = geometricDistance(previousPoint, { x: x, y: y });
      const currentSpeed = timeDiff > 0 ? distanceMoved / timeDiff : 0;

      testAreaSVG.append('line')
        .attr('x1', previousPoint.x)
        .attr('x2', newPoint.x)
        .attr('y1', previousPoint.y)
        .attr('y2', newPoint.y)
        .style('stroke', deriveColor(currentSpeed))
        .transition()
        .duration(5000)
        .style('stroke-opacity', 0)
        .remove();

      previousPoint = newPoint;
    }
  };

  const addObservationPoint = (data) => {
    if (isActive === false) return;

    const timeTaken = data.impact.t - data.initial.t;

    if (timeTaken < MAX_OBSERVATION_PERIOD) {
      const targetDistance = geometricDistance(data.target, data.initial);
      const informationDensity = shannonIndex(targetDistance, data.target.w);

      collectedData[currentDataSeries].data.push({
        time: timeTaken,
        distance: data.target.separation,
        width: data.target.w,
        impact: data.impact,
        initial: data.initial,
        target: data.target,
        path: data.path
      });

      scatterGroup.append('circle')
        .attr('class', `series${currentDataSeries}`)
        .style('fill', collectedData[currentDataSeries].color)
        .attr('cx', scatterCoordX(informationDensity))
        .attr('cy', scatterCoordY(timeTaken))
        .attr('r', 0)
        .transition()
        .duration(200)
        .ease('bounce')
        .attr('r', 3);

      const startPoint = data.initial;
      const endPoint = data.target;
      const trajectory = data.path;

      const impactDetails = {};
      const projectedImpact = projectPoint(startPoint, endPoint, data.impact);
      impactDetails.x = geometricDistance(projectedImpact, endPoint) * Math.sign(projectedImpact.t - 1);
      impactDetails.y = geometricDistance(projectedImpact, data.impact) * isLeftOfLine(startPoint, endPoint, data.impact);

      plotImpactGroup.append('circle')
        .attr('class', 'impact')
        .attr('cx', calculateImpactRadius(impactDetails.x, data.target.w / 2))
        .attr('cy', calculateImpactRadius(impactDetails.y, data.target.w / 2))
        .attr('r', 6)
        .style('fill', 'red')
        .style('opacity', 1)
        .transition()
        .duration(500)
        .ease('linear')
        .attr('r', 3);

      let lastSegment = { x: 0, y: 0, t: data.initial.t, v: 0 };
      for (let i = 0; i < trajectory.length; i++) {
        const currentSegment = trajectory[i];

        const projectedCurrent = projectPoint(startPoint, endPoint, currentSegment);
        const transformedX = geometricDistance(projectedCurrent, startPoint) * Math.sign(projectedCurrent.t);
        const transformedY = geometricDistance(projectedCurrent, currentSegment) * isLeftOfLine(startPoint, endPoint, currentSegment);

        const segmentTimeDiff = currentSegment.t - lastSegment.t;
        const segmentDistance = geometricDistance(lastSegment, { x: transformedX, y: transformedY });
        const segmentSpeed = segmentTimeDiff > 0 ? segmentDistance / segmentTimeDiff : 0;

        plotQuadrantGroup.append('svg:line')
          .attr('class', 'trace')
          .attr('x1', coordX(lastSegment.x))
          .attr('x2', coordX(transformedX))
          .attr('y1', coordY(lastSegment.y))
          .attr('y2', coordY(transformedY))
          .style('stroke', deriveColor(segmentSpeed))
          .transition()
          .duration(ACTIVE_DURATION)
          .style('stroke-opacity', 0.5);

        plotVelocityGroup.append('svg:line')
          .attr('class', 'trace')
          .attr('x1', timeScale(lastSegment.t - data.initial.t))
          .attr('x2', timeScale(currentSegment.t - data.initial.t))
          .attr('y1', velocityScale(lastSegment.v))
          .attr('y2', velocityScale(segmentSpeed))
          .style('stroke', deriveColor(segmentSpeed))
          .transition()
          .duration(ACTIVE_DURATION)
          .style('stroke-opacity', 0.5);

        lastSegment = {
          x: transformedX,
          y: transformedY,
          t: currentSegment.t,
          v: segmentSpeed
        };
      }
    }
  };

  const randomizeParameters = () => {
    locationParameters.separation = Math.floor(generateRandom(locationConstraints.minDistance, locationConstraints.maxDistance));
    locationParameters.size = Math.floor(generateRandom(locationConstraints.minWidth, locationConstraints.maxWidth));

    $('#sliderDistance').slider('value', locationParameters.separation);
    $('#sliderWidth').slider('value', locationParameters.size);

    updateTargetCircles();
    d3.select('#sliderDistanceValue').text(locationParameters.separation);
    d3.select('#sliderWidthValue').text(locationParameters.size);
  };

  const addNewDataSeries = () => {
    updateCharts(exerciseRegime);

    dataSeriesCount++;
    const seriesId = dataSeriesCount;
    const seriesColorValue = seriesColor(generateRandom(0, 10));

    collectedData[seriesId] = { data: [], color: seriesColorValue };

    currentDataSeries = seriesId;
    const seriesDiv = d3.select('#dataSets').append('div')
      .attr('id', `dataSeries${seriesId}`)
      .text(`Data Series ${seriesId} `)
      .style('background-color', seriesColorValue);

    const deleteButtonId = `removeDataSeries${seriesId}`;
    seriesDiv.append('button')
      .attr('id', deleteButtonId)
      .attr('type', 'button')
      .text('delete!');

    const self = exerciseRegime;

    $(`#${deleteButtonId}`).click(() => {
      self.deleteDataSeries(seriesId);
      exerciseRegime.active = false;
    });

    $(`#dataSeries${seriesId}`).click(() => {
      if (checkKeyExists(seriesId, self.collectedData)) {
        self.currentDataSeries = seriesId;
        self.highlightDataSeries(seriesId);
      }
      exerciseRegime.active = false;
    });

    highlightDataSeries(seriesId);
  };

  const deleteDataSeries = (seriesId) => {
    if (countKeys(collectedData) === 1) {
      alert('Cannot delete data series! Create another data series first.');
    } else {
      d3.select(`#dataSeries${seriesId}`).remove();
      delete collectedData[seriesId];

      scatterGroup.selectAll(`.series${seriesId}`)
        .transition()
        .duration(500)
        .attr('r', 0)
        .remove();

      scatterEffectiveGroup.selectAll(`.series${seriesId}`)
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

      throughputGroup.selectAll(`rect.series${seriesId}`)
        .transition()
        .duration(500)
        .attr('width', 0)
        .remove();

      positionEffectiveGroup.selectAll(`line.series${seriesId}`)
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

      speedEffectiveGroup.selectAll(`line.series${seriesId}`)
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

      if (seriesId === currentDataSeries) {
        const firstKey = getFirstKey(collectedData);
        currentDataSeries = parseInt(firstKey);
        highlightDataSeries(currentDataSeries);
      }

      updateCharts(exerciseRegime);
    }
  };

  return {
    generateTarget: generateTargetElement,
    updateISOCircles: updateTargetCircles,
    generateISOPositions: generateTargetLocations,
    removeTarget: clearTarget,
    mouseClicked: handleMouseClick,
    mouseMoved: handleMouseMove,
    addDataPoint: addObservationPoint,
    randomizeParams: randomizeParameters,
    addDataSet: addNewDataSeries,
    deleteDataSet: deleteDataSeries,
    target: currentTarget,
    start: initialPoint,
    last: previousPoint,
    isoPositions: targetLocations,
    currentPosition: currentTargetIndex,
    currentCount: successCounter,
    miss: failureCounter,
    isoLimits: locationConstraints,
    isoParams: locationParameters,
    currentPath: recordedPath,
    active: isActive,
    data: collectedData,
    currentDataSet: currentDataSeries,
    dataCnt: dataSeriesCount,
    colour: seriesColor,
    sumID: totalID,
    sumTime: totalTime,
    updateTimeoutHandle: renderTimerHandle,
  };
})();