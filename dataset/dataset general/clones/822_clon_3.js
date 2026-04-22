/**
 * This module is designed to re-initialize a specific MongoDB collection.
 * It connects to the database, clears out any existing data in the target collection,
 * and then populates it with a predefined set of seed records.
 * Useful for development environment setup or testing data reset.
 */

const dataStoreClient = require('mongodb');

// Determine the database connection endpoint. Prioritizes environment variables.
const databaseConnectionURI =
    process.env.PRIMARY_DB_CONNECTION ||
    process.env.SECONDARY_DB_ENDPOINT ||
    'mongodb://localhost/my_application_data';

// --- Data Validation: Ensure a connection string is available ---
if (!databaseConnectionURI || typeof databaseConnectionURI !== 'string') {
    console.error('CRITICAL: Database connection URI is undefined or invalid. Exiting process.');
    process.exit(1);
}

// --- Seed Data Definition: Initial set of documents to insert ---
const initialDocumentSet = [
    {
        profile_img_link: "https://images.example.com/members/profile_001.jpeg",
        poster_name: "Harlan Harris",
        poster_profile_link: "https://www.linkedin.com/in/harlan-harris-data",
        contact_email: "harlan.h@corporate.org",
        company_web_address: "https://careers.sentrana.com",
        job_description: "Sentrana is actively recruiting skilled software developers.",
        listing_status: "pending_validation",
        submission_timestamp: 1672531200, // Jan 1, 2023
        source_platform: "JobBoardX",
        validation_code: "v4l1dK3yA"
    },
    {
        profile_img_link: "https://images.example.com/members/profile_002.jpeg",
        poster_name: "Harlan Harris",
        poster_profile_link: "https://www.linkedin.com/in/harlan-harris-data",
        contact_email: "harlan.h@corporate.org",
        company_web_address: "https://careers.sentrana.com",
        job_description: "Sentrana is seeking talented junior data analysts.",
        listing_status: "under_review",
        submission_timestamp: 1672617600, // Jan 2, 2023
        source_platform: "Indeed"
        // validation_code omitted for this entry
    },
    {
        profile_img_link: "https://images.example.com/members/profile_003.jpeg",
        poster_name: "Harlan Harris",
        poster_profile_link: "https://www.linkedin.com/in/harlan-harris-data",
        contact_email: "harlan.h@corporate.org",
        company_web_address: "https://careers.sentrana.com",
        job_description: "Sentrana is hiring senior AI/ML researchers.",
        listing_status: "active",
        submission_timestamp: 1672704000, // Jan 3, 2023
        source_platform: "CompanyWebsite",
        validation_code: "v4l1dK3yC"
    },
    {
        profile_img_link: "https://images.example.com/members/profile_004.jpeg",
        poster_name: "Harlan Harris",
        poster_profile_link: "https://www.linkedin.com/in/harlan-harris-data",
        contact_email: "harlan.h@corporate.org",
        company_web_address: "https://careers.sentrana.com",
        job_description: "Sentrana is looking for experienced UX/UI designers.",
        listing_status: "archived",
        submission_timestamp: 1672790400, // Jan 4, 2023
        source_platform: "Glassdoor"
        // validation_code omitted for this entry
    }
];

// --- Helper function for consistent error handling ---
const handleOperationFault = (fault, contextMessage) => {
    if (fault) {
        console.error(`Database Operation Error: ${contextMessage}`, fault);
        // Depending on severity, might want to re-throw or just log.
        // For this script, we'll re-throw to stop execution on critical errors.
        throw fault;
    }
};

// --- Main Database Initialization Logic ---
const targetCollectionName = 'job_advertisements';

dataStoreClient.MongoClient.connect(databaseConnectionURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async (activeClient) => {
        console.log('Successfully connected to the MongoDB instance.');
        const primaryDatabase = activeClient.db(); // Access the default database

        try {
            // Attempt to drop the collection to ensure a clean state
            await primaryDatabase.dropCollection(targetCollectionName);
            console.log(`Existing collection '${targetCollectionName}' successfully removed.`);
        } catch (dropError) {
            // MongoDB error code 26 means "ns not found" (collection doesn't exist).
            // This is acceptable if we're trying to drop a non-existent collection.
            if (dropError.code === 26) {
                console.log(`Collection '${targetCollectionName}' did not exist. Proceeding with creation.`);
            } else {
                // For any other drop error, consider it critical.
                handleOperationFault(dropError, `Failed to drop collection '${targetCollectionName}'.`);
            }
        }

        // Access the specific collection for data manipulation
        const documentRepository = primaryDatabase.collection(targetCollectionName);

        // Insert the predefined seed data into the collection
        const insertionResult = await documentRepository.insertMany(initialDocumentSet);

        // --- Post-insertion validation and reporting ---
        if (insertionResult && insertionResult.insertedCount === initialDocumentSet.length) {
            console.log(`Successfully populated '${targetCollectionName}' with ${insertionResult.insertedCount} new records.`);
        } else {
            console.warn(`Warning: Expected to insert ${initialDocumentSet.length} records, but only ${insertionResult ? insertionResult.insertedCount : 0} were inserted.`);
        }

        // Close the database connection
        await activeClient.close();
        console.log('Database connection gracefully terminated.');

    })
    .catch((connectionFault) => {
        // Catch any errors that occur during connection or subsequent async operations
        handleOperationFault(connectionFault, 'An error occurred during database connection or operation.');
        // Exit process on critical failure
        process.exit(1);
    });