var assignProps           = require('xtend')
  , geoLib                = require('s2')
  , combineStreams        = require('merge-stream')
  , transformStream       = require('map-stream')
  , coordDist             = require('gps-distance')
  , PLANET_RADIUS_KM      = 6371
  ;

function radiusToHeightRatio (inputRadius) {
  return 1 - Math.sqrt(1 - Math.pow((inputRadius / PLANET_RADIUS_KM), 2));
}

function heightToRadiusDist (inputHeight) {
  return Math.sqrt(1 - Math.pow(1 - inputHeight, 2)) * PLANET_RADIUS_KM;
}

function storeLocation (dataStore, entryKey, itemPayload, configSettings, completionHandler) {
  if (typeof entryKey == 'string') {
    dataStore._geoInfo.put.call(dataStore, entryKey, itemPayload, typeof configSettings == 'function' ? configSettings.bind(null, null, entryKey) : configSettings
                                      , typeof completionHandler == 'function' ? completionHandler.bind(null, null, entryKey) : completionHandler);
    return;
  }
  if (typeof entryKey != 'object') throw new Error('Input key must be an Object!');

  entryKey = assignProps({
    latitude: 0
    , longitude: 0
    , uniqueTag: '' + Date.now()
  }, entryKey);

  itemPayload = {
    content: itemPayload
    , _geoInfo: {
      latitude: entryKey.latitude
      , longitude: entryKey.longitude
    }
  };

  var latLngPoint = new geoLib.S2LatLng(entryKey.latitude, entryKey.longitude);
  var cellIdentifier = new geoLib.S2CellId(latLngPoint.normalized());
  var finalIdentifier = '' + cellIdentifier.toString() + '!' + entryKey.uniqueTag;

  dataStore._geoInfo.put.call(dataStore, finalIdentifier, JSON.stringify(itemPayload), typeof configSettings == 'function' ? configSettings.bind(null, null, finalIdentifier) : configSettings
                                                       , typeof completionHandler == 'function' ? completionHandler.bind(null, null, finalIdentifier) : completionHandler);
}

function buildProximityStream (dataStore, configSettings) {
  configSettings = assignProps({
    latitude: 0
    , longitude: 0
    , searchRadius: 100
  }, configSettings);

  var latLngPoint  = new geoLib.S2LatLng(configSettings.latitude, configSettings.longitude);
  var spatialCap = new geoLib.S2Cap(latLngPoint.normalized().toPoint(), radiusToHeightRatio(configSettings.searchRadius / 1000));

  var mergedOutput = combineStreams();
  geoLib.getCover(spatialCap).map(function (regionId) {
    var spatialCell = regionId.id();
    mergedOutput.add(dataStore.createReadStream({
        gte: spatialCell.toString()
        , lt: spatialCell.next().toString()
    }));
  });

  return mergedOutput.pipe(transformStream(function (recordEntry, streamCallback) {
    var decodedPayload = JSON.parse(recordEntry.value);
    var calculatedDistance = coordDist(configSettings.latitude, configSettings.longitude, decodedPayload._geoInfo.latitude, decodedPayload._geoInfo.longitude) * 1000;

    var geoDetails = decodedPayload._geoInfo;
    geoDetails.distance = calculatedDistance;
    decodedPayload = decodedPayload.content;
    
    streamCallback(null, calculatedDistance < configSettings.searchRadius ? { key: recordEntry.key, value: decodedPayload, _geoInfo: geoDetails } : undefined);
  }));
}

module.exports = function (dataStore, configSettings) {
  configSettings = assignProps({
    methodPrefix: ''
  }, configSettings);

  dataStore._geoInfo = { put: dataStore.put };

  dataStore[configSettings.methodPrefix + 'storeLocation']       = storeLocation.bind(null, dataStore);
  dataStore[configSettings.methodPrefix + 'buildProximityStream'] = buildProximityStream.bind(null, dataStore);

  return dataStore;
};