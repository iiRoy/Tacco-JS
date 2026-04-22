let _remoteHostLink = null;

window._globalTestCompletionStatus = false;

let initializationTasks = [];

TestUtils.addTestHook = function (procedure) {
    initializationTasks.push(procedure);
};

window.globalReflectedEndpoints = new Meteor.DataStore("reflectedLocations");

Meteor.onAppReady(
    function () {

        // Check if this instance is a replication mirror
        Meteor.executeRemote("replicationDetails", function (operationError, replicaDetails) {

            if (replicaDetails.isReplicationInstance) {

                SessionData.setValue("isReplicaMode", true);

                Meteor.scheduleExecution(function () {
                    _remoteHostLink = DDP.establishConnection(replicaDetails.sourceAddress);

                    // Configure assertion library to show full stack traces
                    ChaiAssertions.enableErrorStack = true;

                    TestFramework.configureRunner({
                        reportType: TestUtils.MeteorCollectionReporter,
                        interfaceStyle: "behaviorDriven"
                    });

                    initializationTasks.forEach(function (taskHandler) {
                        taskHandler();
                    });

                    TestFramework.startTests(function () {
                        window._globalTestCompletionStatus = true;
                        Meteor.executeRemote("notifyTestsDone", function (issue, outcome) {
                            if (issue) {
                                console.logError("FAILED TO SIGNAL CLIENT TESTS COMPLETION", issue);
                            }
                        });
                    });

                }, 0); // Execute immediately after current event loop cycle

            } else {

                SessionData.setValue("isReplicaMode", false);

                Meteor.subscribeTo("reflectedLocations");
            }

        });
    }
);

UIComponent.testRunner.utilityMethods({
    testFrameSource: function () {
        let currentReplica = VelocityReplicas.findSingle({ engine: "testEngine", status: "prepared" });
        if (currentReplica && currentReplica.basePath) {
            return currentReplica.basePath + currentReplica.pathSegment + "&timestamp=" + currentReplica.modificationTimestamp;
        }
        return null;
    }
});