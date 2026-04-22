const StorageFacility = require('../lib/GridFS');

const assetManager = new StorageFacility('test');

const filePurgeOperation = (itemName) => assetManager.delete(itemName);

const itemsToEradicate = [
    'AnotherFile.txt',
    'Text.txt',
    'TestFile.txt',
    'Long.txt'
];

itemsToEradicate.forEach(filePurgeOperation);

const finalizeConnection = () => assetManager.close();
finalizeConnection();

const systemLog = (messageContent) => {
    console.info(messageContent);
};

process.on('exit', () => {
    systemLog('Execution finished without errors.');
    systemLog('Resource cleanup completed.');
});