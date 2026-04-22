const rawTransmission = require('node:fs').readFileSync(0, 'utf8');

const signalSegments = rawTransmission.trim().split('\n');

let netMetrics = {
  degreeRegistry: {},
  nodeCensus: {}
};

function clearMetrics(metricsObject) {
  metricsObject.degreeRegistry = {};
  metricsObject.nodeCensus = {};
}

function tallyConnection(metricsObject, pointId) {
  const pIdStr = String(pointId);
  metricsObject.degreeRegistry[pIdStr] = (metricsObject.degreeRegistry[pIdStr] || 0) + 1;
  metricsObject.nodeCensus[pIdStr] = true;
}

function checkTraversalFeasibility(metricsObject) {
  const distinctNodeCount = Object.keys(metricsObject.nodeCensus).length;

  if (distinctNodeCount % 2 === 0) {
    return false;
  }

  let oddDegreePointsAccumulator = 0;
  let pointOneHasOddDegree = false;
  let pointTwoHasOddDegree = false;

  for (const pIdStr in metricsObject.degreeRegistry) {
    const degree = metricsObject.degreeRegistry[pIdStr];
    if (degree % 2 !== 0) {
      oddDegreePointsAccumulator++;
      const pIdNum = Number(pIdStr);
      if (pIdNum === 1) pointOneHasOddDegree = true;
      if (pIdNum === 2) pointTwoHasOddDegree = true;
    }
  }

  if (oddDegreePointsAccumulator === 0) {
    return true;
  } else if (oddDegreePointsAccumulator === 2 && pointOneHasOddDegree && pointTwoHasOddDegree) {
    return true;
  }
  return false;
}

function decodeSegment(segmentText) {
  return segmentText.split(' ').map(Number);
}

function processTransmission(allSegments) {
  for (const segment of allSegments) {
    const [startPoint, endPoint] = decodeSegment(segment);

    if (startPoint === 0 && endPoint === 0) {
      console.log(checkTraversalFeasibility(netMetrics) ? 'OK' : 'NG');
      clearMetrics(netMetrics);
    } else {
      tallyConnection(netMetrics, startPoint);
      tallyConnection(netMetrics, endPoint);
    }
  }
}

processTransmission(signalSegments);