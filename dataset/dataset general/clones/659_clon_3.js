const processArguments = require('optimist')
  .usage('This utility processes geographic location data. \nUsage: $0 --source [geoDataFile] --settings [configurationFile]')
  .demand(['source', 'settings'])
  .alias('source', 's')
  .describe('source', 'Full path to the GeoNames postal codes text file, e.g., /opt/data/US_Postal.txt')
  .alias('settings', 'c')
  .describe('settings', 'Location of the application configuration JSON, e.g., /etc/app/geo_config.json')
  .alias('verbose', 'v')
  .describe('verbose', 'Enable verbose logging for detailed operation output')
  .default('verbose', false)
  .argv;

// A simple custom logging utility for varied output levels.
const logMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  if (level === 'error') {
    console.error(`[${timestamp}] [ERROR] ${message}`, ...args);
  } else if (level === 'warn') {
    console.warn(`[${timestamp}] [WARN] ${message}`, ...args);
  } else if (level === 'info' || processArguments.verbose) {
    console.log(`[${timestamp}] [INFO] ${message}`, ...args);
  }
};

// Essential modules for file system interaction and data handling:
const fileSystem = require('fs');
const dataStoreManager = require('../lib/mongo-postal'); // Assuming path remains same for the library
const tabularProcessor = require('csv');

// --- Input Validation and Configuration Loading ---

// Verify existence of provided files upfront for better error handling.
const configFilePath = processArguments.settings;
const dataFilePath = processArguments.source;

if (!fileSystem.existsSync(configFilePath)) {
  logMessage('error', `Configuration file not found at: ${configFilePath}. Exiting.`);
  process.exit(1);
}
if (!fileSystem.existsSync(dataFilePath)) {
  logMessage('error', `Geonames data file not found at: ${dataFilePath}. Exiting.`);
  process.exit(1);
}

let appConfiguration;
try {
  const rawConfig = fileSystem.readFileSync(configFilePath, 'utf-8');
  appConfiguration = JSON.parse(rawConfig);
  if (!appConfiguration || !appConfiguration.mongo || !appConfiguration.mongo.collection) {
    throw new Error("Invalid configuration structure: 'mongo.collection' is missing.");
  }
} catch (parsingError) {
  logMessage('error', `Failed to load or parse configuration file '${configFilePath}': ${parsingError.message}. Exiting.`);
  process.exit(1);
}

logMessage('info', `Utilizing database settings from: %s`, configFilePath);

// --- Database Connection and Setup ---

let targetDataCollection;
try {
  const dbConnectionInstance = dataStoreManager.initDb(appConfiguration);
  targetDataCollection = dbConnectionInstance.collection(appConfiguration.mongo.collection);
  logMessage('info', `Database connection established. Target collection: '${appConfiguration.mongo.collection}'`);
} catch (dbError) {
  logMessage('error', `Failed to connect to database or get collection: ${dbError.message}. Exiting.`);
  process.exit(1);
}

// Prepare the database for geospatial queries.
dataStoreManager.setUpIndexing(targetDataCollection);
logMessage('info', `Ensured geospatial indexing is configured for the target collection.`);

// --- Data Processing and Ingestion ---

logMessage('info', `Initiating read of location data from: %s`, dataFilePath);

const BATCH_SAVE_SIZE = 5000; // Define a batch size for bulk inserts
let recordBatch = [];
let totalRecordsProcessed = 0;

// Helper function to save any pending records in the batch.
const flushBatch = async () => {
  if (recordBatch.length > 0) {
    try {
      await dataStoreManager.savePostalCode(targetDataCollection, recordBatch); // Assuming savePostalCode can handle an array for bulk insert
      logMessage('info', `Successfully persisted a batch of ${recordBatch.length} records. Total processed: ${totalRecordsProcessed}`);
      recordBatch = []; // Clear the batch after successful save
    } catch (saveErr) {
      logMessage('error', `Error during batch save: ${saveErr.message}`);
      // Decide if you want to continue or exit on batch save failure
    }
  }
};

tabularProcessor()
  .fromPath(dataFilePath, {
    delimiter: '\t',
    columns: [
      'iso_country_code',
      'zip_code_id',
      'primary_place_name',
      'admin_area_1_name',
      'admin_area_1_code',
      'admin_area_2_name',
      'admin_area_2_code',
      'admin_area_3_name',
      'admin_area_3_code',
      'latitude_val',
      'longitude_val',
      'accuracy_level' // Renamed and reordered
    ],
    trim: true // Add trimming to remove leading/trailing whitespace
  })
  .transform(function(rawRecordEntry) {
    // Transform raw CSV data into a structured document for storage.
    // Reorder fields, add new ones, and convert data types.
    const longitude = Number(rawRecordEntry.longitude_val);
    const latitude = Number(rawRecordEntry.latitude_val);

    // Basic validation for coordinates
    if (isNaN(longitude) || isNaN(latitude)) {
      logMessage('warn', `Skipping record due to invalid coordinates: ${JSON.stringify(rawRecordEntry)}`);
      return null; // Return null to skip this record
    }

    return {
      ingestionTimestamp: new Date(), // Add a new field
      locationIdentifier: rawRecordEntry.zip_code_id,
      cityName: rawRecordEntry.primary_place_name,
      countryCode: rawRecordEntry.iso_country_code,
      adminAreaInfo: { // Group related fields
        level1Long: rawRecordEntry.admin_area_1_name,
        level1Short: rawRecordEntry.admin_area_1_code,
        level2Long: rawRecordEntry.admin_area_2_name,
        level2Short: rawRecordEntry.admin_area_2_code,
        level3Long: rawRecordEntry.admin_area_3_name,
        level3Short: rawRecordEntry.admin_area_3_code,
      },
      geoPoint: [ // MongoDB geospatial 'loc' format
        longitude,
        latitude
      ],
      dataPrecision: rawRecordEntry.accuracy_level ? Number(rawRecordEntry.accuracy_level) : -1 // Default value for accuracy
    };
  })
  .on('data', async function(processedDocument) {
    // Handle each transformed data record.
    if (!processedDocument) return; // Skip null records from transform
    
    recordBatch.push(processedDocument);
    totalRecordsProcessed++;

    if (recordBatch.length >= BATCH_SAVE_SIZE) {
      // If batch size is reached, flush records to the database.
      await flushBatch();
    }
  })
  .on('end', async function(totalRowsRead) {
    // All data has been read from the file.
    logMessage('info', `Finished reading all ${totalRowsRead} rows from the source file.`);
    
    // Ensure any remaining records in the batch are saved.
    await flushBatch();

    logMessage('info', `Total unique location records processed and stored: ${totalRecordsProcessed}`);
    logMessage('info', `Data ingestion process completed successfully.`);

    // Delay exit slightly to ensure all async operations (like batch flush) complete.
    setTimeout(() => process.exit(0), 100);
  })
  .on('error', function(processingError) {
    // Report any errors encountered during CSV parsing or processing.
    logMessage('error', `An unexpected error occurred during data processing: ${processingError.message}`);
    logMessage('error', processingError.stack); // Provide stack trace for debugging.
    process.exit(1);
  });