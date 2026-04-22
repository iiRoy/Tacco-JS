const cliHandler = require('yargs');
const fileAccessor = require('node:fs/promises');
const streamCreator = require('node:fs');
const lineIterator = require('node:readline');

const parsedInput = cliHandler
  .scriptName('geo-data-processor')
  .usage('Operation: $0 --input-source [dataFile] --configuration-file [settingsFile]')
  .option('input-source', {
    alias: 'i',
    describe: 'Full path to the Geonames postal code data file, e.g. /data/US.txt',
    type: 'string',
    demandOption: true
  })
  .option('configuration-file', {
    alias: 'k',
    describe: 'Full path to the application configuration file (JSON format), e.g. /etc/app.json',
    type: 'string',
    demandOption: true
  })
  .help()
  .argv;

(async () => {
  let dataPersistenceService;
  let targetDataStore;
  let processedEntryCount = 0;

  try {
    console.log(`Loading application settings from: ${parsedInput.configurationFile}`);
    const settingsContent = await fileAccessor.readFile(parsedInput.configurationFile, { encoding: 'utf8' });
    const applicationSettings = JSON.parse(settingsContent);

    dataPersistenceService = require('../lib/data-persistence-module');
    targetDataStore = (await dataPersistenceService.establishConnection(applicationSettings)).getCollectionReference(applicationSettings.database.collection);

    await dataPersistenceService.setupDataIndexes(targetDataStore);

    console.log(`Initiating processing of geographic data from: ${parsedInput.inputSource}`);

    const inputStream = streamCreator.createReadStream(parsedInput.inputSource, { encoding: 'utf8' });
    const lineReader = lineIterator.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    const geonamesFieldNames = [
      'iso_country_code', 'postal_id', 'full_place_name', 'admin_level1_name', 'admin_level1_code',
      'admin_level2_name', 'admin_level2_code', 'admin_level3_name', 'admin_level3_code',
      'latitude_value', 'longitude_value', 'precision_metric'
    ];

    const convertRecordStructure = (rawFieldArray) => {
      if (rawFieldArray.length !== geonamesFieldNames.length) {
        throw new Error(`Column mismatch: expected ${geonamesFieldNames.length}, found ${rawFieldArray.length}`);
      }

      const temporaryRecordMap = {};
      geonamesFieldNames.forEach((fieldName, idx) => {
        temporaryRecordMap[fieldName] = rawFieldArray[idx];
      });

      return {
        countryIdentifier: temporaryRecordMap.iso_country_code,
        zipCode: temporaryRecordMap.postal_id,
        cityName: temporaryRecordMap.full_place_name,
        stateLongName: temporaryRecordMap.admin_level1_name,
        stateShortCode: temporaryRecordMap.admin_level1_code,
        geoCoordinates: [
          parseFloat(temporaryRecordMap.longitude_value),
          parseFloat(temporaryRecordMap.latitude_value)
        ]
      };
    };

    for await (const currentDataLine of lineReader) {
      if (!currentDataLine.trim()) continue;

      const rawLineFields = currentDataLine.split('\t');
      const transformedEntry = convertRecordStructure(rawLineFields);
      await dataPersistenceService.persistGeoEntry(targetDataStore, transformedEntry);
      processedEntryCount++;
    }

    console.log(`Operation completed. Records processed: ${processedEntryCount}`);
    process.exit(0);
  } catch (operationFailure) {
    console.error(`A critical error occurred: ${operationFailure.message}`);
    process.exit(1);
  }
})();