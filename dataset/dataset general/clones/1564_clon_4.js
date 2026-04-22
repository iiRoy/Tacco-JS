let remoteLinkAgent = null;
window.testingCompletionStatus = false;
const initializationRoutines = new Set();

const TestOrchestrator = {};
TestOrchestrator.registerRoutine = function(procedure){
  initializationRoutines.add(procedure);
};
TestOrchestrator.CollectionReportAdapter = MochaWeb.MeteorCollectionTestReporter;

window.ReplicationEndpoints = new Meteor.Collection("replicationTargets");

// Global alias for the external VelocityMirrors collection
const VelocityReplicationStore = VelocityMirrors;

// Helper to wrap Meteor.call in a Promise
const invokeMeteorMethod = (methodName, ...args) => {
  return new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

// Helper to wrap Meteor.subscribe in a Promise
const subscribeToData = (publicationName, ...args) => {
  return new Promise((resolve, reject) => {
    const handle = Meteor.subscribe(publicationName, ...args, {
      onReady: () => resolve(handle),
      onError: (err) => reject(err)
    });
  });
};

// Main application initiation logic - using async/await and a different flow
Meteor.startup(async () => {
  try {
    const replicationDetails = await invokeMeteorMethod("mirrorInfo");

    const flowControlMap = new Map();

    // Strategy for conditional logic: using a map for flow control
    flowControlMap.set(true, async () => {
      Session.set("replicationModeActive", true);
      // Using microtask queue for async execution, equivalent to setTimeout(..., 0)
      await Promise.resolve();

      remoteLinkAgent = DDP.connect(replicationDetails.parentUrl);
      chai.Assertion.includeStack = true;

      mocha.setup({reporter: TestOrchestrator.CollectionReportAdapter, ui: "bdd"});

      // Iterating through routines differently
      for (const routine of initializationRoutines) {
        routine();
      }

      // Wrapping mocha.run in a Promise
      await new Promise(resolve => {
        mocha.run(() => {
          resolve();
        });
      });

      window.testingCompletionStatus = true;
      try {
        await invokeMeteorMethod("clientTestsComplete");
      } catch (err) {
        console.error("ERROR DURING TEST COMPLETION SIGNAL", err);
      }
    });

    flowControlMap.set(false, async () => {
      Session.set("replicationModeActive", false);
      await subscribeToData("mirrorUrls");
    });

    // Execute the appropriate strategy based on replicationDetails.isMirror
    const executeStrategy = flowControlMap.get(replicationDetails.isMirror);
    if (executeStrategy) {
      await executeStrategy();
    } else {
      console.warn("No strategy found for mirror status:", replicationDetails.isMirror);
    }

  } catch (error) {
    console.error("APPLICATION BOOTSTRAP ERROR:", error);
  }
});

// Renaming Template.mochaweb.helpers
Template.mochaweb.helpers({
  embeddedTestFrameLink: () => {
    // The query keys (framework, state) and properties of the returned object (rootUrl, rootUrlPath, lastModified)
    // must remain unchanged as they are part of the external VelocityMirrors API/data structure.
    const replicationEntity = VelocityReplicationStore.findOne({framework: "mocha", state: "ready"});
    if (replicationEntity && replicationEntity.rootUrl){
      // Using template literal for URL construction
      return `${replicationEntity.rootUrl}${replicationEntity.rootUrlPath}&lastModified=${replicationEntity.lastModified}`;
    }
    return null;
  }
});