const databaseDriver = require('mongodb');

const makeRecord = (submissionTime, validationKeySuffix, announcementText, currentStatus) => ({
    display_image_uri: "http://photos4.meetupstatic.com/photos/member/5/3/f/4/member_57681492.jpeg",
    identity_handle: "Harlan Harris",
    identity_page_link: "http://www.meetup.com/Data-Science-DC/members/482161/",
    contact_email: "harlan@harris.name",
    organization_web_link: "http://sentrana.com",
    message_content: announcementText,
    current_state: currentStatus,
    entry_timestamp: submissionTime,
    verification_token: `valkey${validationKeySuffix}`
});

const sourceRecords = [
    makeRecord(1390696303, 1, "Sentrana is hiring software engineers", "unvalidated"),
    makeRecord(1390696304, 2, "Sentrana is hiring bunnies", "queued"),
    makeRecord(1390696305, 3, "Sentrana is hiring monkeys", "visible"),
    makeRecord(1390696306, 4, "Sentrana is hiring armadillos", "archived")
];

const connectionString = process.env.DB_SERVICE_URI ||
  process.env.MONGO_URL_ENV ||
  'mongodb://127.0.0.1/local_storage';

(async () => {
    let clientInstance;
    try {
        clientInstance = await databaseDriver.MongoClient.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        const currentDatabase = clientInstance.db();
        const targetCollectionName = 'announcements';

        await currentDatabase.collection(targetCollectionName).drop()
            .catch(removalError => {
                if (removalError.code !== 26) {
                    throw removalError;
                }
            });

        const collectionHandle = currentDatabase.collection(targetCollectionName);
        await collectionHandle.insertMany(sourceRecords);

    } catch (operationError) {
        process.exit(1);
    } finally {
        if (clientInstance) {
            await clientInstance.close();
        }
    }
})();