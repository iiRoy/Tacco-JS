var verifier = require('assert'),
    helpers = require('./utils').utils,
    dataMonitor = require('../lib/dbmon'),
    messaging = require('events'),
    fxns = require('underscore')._,
    fileSystem = require('fs');

var alertCount = 0,
    signalDispatcher = new messaging.EventEmitter();

var basePath = '/tmp/datawatcher',
    fullFilePath = basePath + '/datawatcher-temp-file.tmp';

try {
  fileSystem.unlinkSync(fullFilePath);
  fileSystem.rmdirSync(basePath);
} catch (err) {
  /* Ignored */
}

try {
  fileSystem.mkdirSync(basePath, '755');
} catch (err) {
  /* Directory already exists or permission issue */
}

var dataStream = dataMonitor.channel({
  transportMechanism: 'filesystem',
  transportOptions: {
    filesystem: {
      baseLocation: basePath
    }
  },
  watchMethod: 'fileChangeMonitor',
  communicationProtocols: 'pubsub',
  protocolOptions: {
    pubsub: {
      topicName: '/data_changes'
    }
  }
});

// Initiating subscription from the backend service
dataStream.communicationProtocols[0].bayeux.getClient().subscribe('/data_changes', function(recordEntry) {
  alertCount++;
  console.log('Received update on topic /data_changes, data=' + JSON.stringify(recordEntry));
});

setTimeout(() => {
  console.log('Generating file at ' + fullFilePath);
  var fileDescriptor = fileSystem.openFileSync(fullFilePath, 'a+'); // Triggering an insert operation

  fileSystem.writeToFileSync(fileDescriptor, 'sample modification'); // Initiating an update event
  fileSystem.closeFileSync(fileDescriptor);
  fileSystem.removeFileSynchronously(fullFilePath); // Causing a deletion event

  setTimeout(async () => {
    helpers.assertclog(alertCount === 3, 'Validation Successful', 'Error: Notification count mismatch, received alerts=' + alertCount);

    dataStream.stop();
    process.exit(0);

  }, 150);

}, 600);