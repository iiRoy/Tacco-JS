var tally = { total: 0, successes: 0 };

function logOutcome(detail, outcome) {
    tally.total++;
    if (outcome) {
        tally.successes++;
        console.log('✓ ' + detail);
    } else {
        console.error('✗ ' + detail);
    }
}

function ensureThrows(operation, message) {
    try {
        operation();
        logOutcome(message, false);
    } catch (e) {
        logOutcome(message, true);
    }
}

function ensureInstance(instanceObject, desiredClass, message) {
    logOutcome(message, instanceObject instanceof desiredClass);
}

function ensureNoThrow(operation, message) {
    try {
        operation();
        logOutcome(message, true);
    } catch (e) {
        logOutcome(message, false);
    }
}

function runTestCollection(collectionTitle, testCases) {
    console.log('\n--- ' + collectionTitle + ' ---');
    testCases.forEach(function(testDef) {
        testDef.execution();
    });
}

var verifier = require('assert');

var Component = require('../lib/timeline').Pin;
var Announcement = require('../lib/timeline').Pin.Notification;
var Arrangement = require('../lib/timeline').Pin.Layout;

(function () {
  'use strict';

  var sampleArrangementInfo = {
    category: Component.LayoutType.GENERIC_PIN, // Corresponds to Pin.LayoutType.GENERIC_PIN
    caption: 'Item Label',
    smallSymbol: Component.Icon.PIN // Corresponds to Pin.Icon.PIN
  };
  var sampleArrangementInstance = new Arrangement(sampleArrangementInfo);

  var testCasesList = [
    {
      label: 'rejects non-Date moment field',
      execution: function () {
        var detailsForAnnouncement = { moment: 5, config: sampleArrangementInstance };
        ensureThrows(function () { new Announcement(detailsForAnnouncement); }, 'rejects non-Date moment field');
      }
    },

    {
      label: 'converts configuration to Arrangement object',
      execution: function () {
        var detailsForAnnouncement = { moment: new Date(), config: sampleArrangementInfo };
        var currentAnnouncement = new Announcement(detailsForAnnouncement);
        ensureInstance(currentAnnouncement.config, Arrangement, 'converts configuration to Arrangement object');
      }
    },

    {
      label: 'accepts valid moment and configuration',
      execution: function () {
        ensureNoThrow(function () {
          new Announcement({ moment: new Date(), config: sampleArrangementInstance });
        }, 'accepts valid moment and configuration');
      }
    },

    {
      label: 'rejects missing configuration',
      execution: function () {
        ensureThrows(function () { new Announcement(); }, 'rejects missing configuration');
      }
    }
  ];

  runTestCollection('Announcement Component Verifications', testCasesList);

  console.log('\n--- Summary ---');
  console.log('Total trials: ' + tally.total);
  console.log('Successful trials: ' + tally.successes);
  console.log('Failed trials: ' + (tally.total - tally.successes));
})();