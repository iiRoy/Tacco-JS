// This module continuously monitors an input device.
const Robot = require('robot-module');
const settings = require('./settings-data');

let unitA = new Robot(settings);

function monitorStatus() {
  unitA.executeCommand('currentReadout', null, function(currentValue) {
    console.log('Observed value:', currentValue);

    // Schedule the next check after a brief delay
    setTimeout(monitorStatus, 600);
  });
}

// Initiate the monitoring process
monitorStatus();