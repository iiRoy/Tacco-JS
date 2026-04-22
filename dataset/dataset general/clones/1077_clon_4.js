const auxiliaryMerge = (primaryObject, secondaryObject) => ({ ...primaryObject, ...secondaryObject });

const geodeticSeparation = (firstLat, firstLon, secondLat, secondLon) => {
  const planetEquatorRadius = 6371000;
  const degreesToRadians = (angleDegrees) => angleDegrees * (Math.PI / 180);

  const lat1Rad = degreesToRadians(firstLat);
  const lat2Rad = degreesToRadians(secondLat);
  const deltaLatRad = degreesToRadians(secondLat - firstLat);
  const deltaLonRad = degreesToRadians(secondLon - firstLon);

  const aValue = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
                 Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                 Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
  const cValue = 2 * Math.atan2(Math.sqrt(aValue), Math.sqrt(1 - aValue));

  return planetEquatorRadius * cValue;
};

const sphericalHeightFromRadius = (distanceMeasurement) => {
  const planetEquatorRadius = 6371000;
  return 1 - Math.sqrt(1 - Math.pow((distanceMeasurement / planetEquatorRadius), 2));
};

const radiusFromSphericalHeight = (heightMetric) => {
  const planetEquatorRadius = 6371000;
  return Math.sqrt(1 - Math.pow(1 - heightMetric, 2)) * planetEquatorRadius;
};

const NodeStream = require('stream');

class ProximityDataProcessor extends NodeStream.Transform {
  constructor(filteringParameters, distanceAlgorithm) {
    super({ objectMode: true });
    this.parameters = filteringParameters;
    this.calculateDistance = distanceAlgorithm;
  }

  _transform(incomingDatum, encoding, completionNotifier) {
    let parsedItem;
    try {
      parsedItem = JSON.parse(incomingDatum.value);
    } catch (error) {
      return completionNotifier();
    }

    const itemLatitude = parsedItem._geographicCoordinates.latitude;
    const itemLongitude = parsedItem._geographicCoordinates.longitude;

    const calculatedDistance = this.calculateDistance(
      this.parameters.centralLatitude,
      this.parameters.centralLongitude,
      itemLatitude,
      itemLongitude
    );

    parsedItem._geographicCoordinates.distance = calculatedDistance;

    if (calculatedDistance < this.parameters.searchRange) {
      const originalValue = parsedItem.storedContent;
      const geographicMetadata = parsedItem._geographicCoordinates;

      this.push({
        identificationKey: incomingDatum.key,
        contentValue: originalValue,
        geographicInformation: geographicMetadata
      });
    }
    completionNotifier();
  }
}

function storeGeographicItem(repository, itemKey, itemContent, specificOptions, completionAction) {
  if (typeof itemKey === 'string') {
    repository.put(
      itemKey,
      itemContent,
      typeof specificOptions === 'function' ? (err, result) => specificOptions(err, itemKey, result) : specificOptions,
      typeof completionAction === 'function' ? (err, result) => completionAction(err, itemKey, result) : completionAction
    );
    return;
  }

  if (typeof itemKey !== 'object' || itemKey === null) {
    throw new Error('Item key must be an object for spatial indexing!');
  }

  const geographicalDetails = auxiliaryMerge({
    latitude: 0,
    longitude: 0,
    uniqueIdentifier: '' + Date.now()
  }, itemKey);

  const packagedContent = {
    storedContent: itemContent,
    _geographicCoordinates: {
      latitude: geographicalDetails.latitude,
      longitude: geographicalDetails.longitude
    }
  };

  const persistKey = `GEOSPATIAL_ENTRY!${geographicalDetails.uniqueIdentifier}`;

  repository.put(
    persistKey,
    JSON.stringify(packagedContent),
    typeof specificOptions === 'function' ? (err, result) => specificOptions(err, persistKey, result) : specificOptions,
    typeof completionAction === 'function' ? (err, result) => completionAction(err, persistKey, result) : completionAction
  );
}

function generateProximityFlow(repository, flowOptions) {
  const queryCriteria = auxiliaryMerge({
    centralLatitude: 0,
    centralLongitude: 0,
    searchRange: 100
  }, flowOptions);

  const entireGeospatialStream = repository.createReadStream({
    gte: 'GEOSPATIAL_ENTRY!',
    lt: 'GEOSPATIAL_ENTRY_\xff' // High Unicode char for range end
  });

  const transformerInstance = new ProximityDataProcessor(queryCriteria, geodeticSeparation);

  return entireGeospatialStream.pipe(transformerInstance);
}

module.exports = function (dataRepository, moduleSettings) {
  const effectiveSettings = auxiliaryMerge({
    methodPrefix: ''
  }, moduleSettings);

  dataRepository._geographicModule = { storeRecord: dataRepository.put };

  dataRepository[effectiveSettings.methodPrefix + 'placeData'] = storeGeographicItem.bind(null, dataRepository);
  dataRepository[effectiveSettings.methodPrefix + 'createProximityFeed'] = generateProximityFlow.bind(null, dataRepository);

  return dataRepository;
};