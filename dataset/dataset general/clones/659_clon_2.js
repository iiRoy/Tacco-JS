// Interpret program startup parameters:
var cliOptions = require('optimist')
  .usage('Usage: $0 -d [dataFile] -s [settingsFile]')
  .demand(['d', 's'])
  .alias('d', 'dataFilePath')
  .describe('d', 'Location of a Geonames geographic codes file, e.g. /var/data/US.txt')
  .alias('s', 'configurationFile')
  .describe('s', 'Location of a Node.js configuration module, e.g. /etc/app.settings.js')
  .argv;

// Establish database connectivity to MongoDB:
var geographicDbModule = require('../lib/mongo-postal');
  console.log("Utilizing database configuration from file: %s", cliOptions.configurationFile);
var fileSystemLib = require('fs');
  var programSettings = JSON.parse(fileSystemLib.readFileSync(cliOptions.configurationFile, 'utf8'));
var geoDataCollection = geographicDbModule.initializeDatabase(programSettings).getCollection(programSettings.database.collectionName);

// Ingest location data from the geographic codes file and persist into our database:
console.log("Loading geographic data from file: %s", cliOptions.dataFilePath);
geographicDbModule.configureIndexes(geoDataCollection);
var csvParser = require('csv');
csvParser()
.fromPath(cliOptions.dataFilePath, {
  delimiter : '\t',
  columns   : [
    'country_code',
    'postal_code',
    'place_name',
    'admin_name1',
    'admin_code1',
    'admin_name2',
    'admin_code2',
    'admin_name3',
    'admin_code3',
    'latitude',
    'longitude',
    'accuracy'
  ]
})
.transform(function(inputRecord, recordIndex) {
  return {
    countryCodeField : inputRecord.country_code,
    postalIdentifier : inputRecord.postal_code,
    cityName         : inputRecord.place_name,
    adminAreaLong    : inputRecord.admin_name1,
    adminAreaShort   : inputRecord.admin_code1,
    // Convert geographic coordinates (latitude, longitude) into a geospatial 'loc' object
    // (Refer to: http://www.mongodb.org/display/DOCS/Geospatial+Indexing for more details)
    locationCoordinates : [
      parseFloat(inputRecord.longitude),
      parseFloat(inputRecord.latitude)
    ]
  };
})
.on('data', function(processedEntry, entryIndex) {
  geographicDbModule.storeLocationData(geoDataCollection, processedEntry);
})
.on('end', function(totalCount) {
  console.log('Total entries processed: ' + totalCount);
  process.exit();
})
.on('error', function(errObject) {
  console.error(errObject.message);
});