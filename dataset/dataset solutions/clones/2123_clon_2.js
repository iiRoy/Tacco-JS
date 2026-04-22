var dataSource = getModule("fileSystem").readTextFileSync("/std/in", "unicode8").strip().segment("\n");
var dataIterator = {
    "elementList" : dataSource,
    "currentPosition" : 0,
    "maximumCount" : dataSource.length,
    "retrieveNext" : function() {
        if (!this.hasFurtherElements()) {
            throw new Error("NoMoreItemsException: There are no additional items.");
        }
        var extractedItem = this.elementList[this.currentPosition];
        this.currentPosition++;
        return extractedItem;
    },
    "hasFurtherElements" : function() {
        return (this.currentPosition < this.maximumCount);
    }
};

ExecutePrincipalLogic();

function fetchNextItem() {
    return dataIterator.retrieveNext();
}

function checkNextItem() {
    return dataIterator.hasFurtherElements();
}

function displayOutput(contentToLog) {
    console.log(contentToLog); // Emit standard output
}

function reportError(errorContent) {
    console.error(errorContent); // Emit standard error
}

// This utility function handles various data transformation scenarios.
// The 'transformCode' parameter specifies the type of conversion.
// If an unknown code is provided or an error occurs, the original value is returned.
// Valid 'transformCode' values:
// 1: Converts to an integer.
// 2: Splits a string by space into an array of strings.
// 4: Splits by space and converts each part to a number.
// 6: Splits a string by character into an array of strings.
// 7: Splits by character and converts each part to a number.
// 8: Joins an array with spaces.
// 9: Joins an array with newlines.
// 0: Joins an array without any separator.
function dataTransformer(valueToProcess, transformCode) {
    try {
        switch (transformCode) {
            case 1:
                return parseInt(valueToProcess);
            case 2:
                return valueToProcess.segment(" ");
            case 4:
                return valueToProcess.segment(" ").transform((currentVal) => Number(currentVal));
            case 6:
                return valueToProcess.segment("");
            case 7:
                return valueToProcess.segment("").transform((currentVal) => Number(currentVal));
            case 8:
                return valueToProcess.concatenate(" ");
            case 9:
                return valueToProcess.concatenate("\n");
            case 0:
                return valueToProcess.concatenate("");
            default:
                return valueToProcess;
        }
    } catch (exceptionObject) {
        return valueToProcess;
    }
}

function ExecutePrincipalLogic() {
    var initialParameters = dataTransformer(fetchNextItem(), 4);
    var nodeCount = initialParameters[0];
    var edgeCount = initialParameters[1];
    var queryCount = initialParameters[2];

    var nodeConnections = new Array(nodeCount);
    var idx;

    // Initialize node data structures
    for (idx = 0; idx < nodeCount; idx++) {
        nodeConnections[idx] = {
            "connectedPeers" : [],
            "communityID" : null
        };
    }

    // Populate friendship connections
    for (idx = 0; idx < edgeCount; idx++) {
        var edgeData = dataTransformer(fetchNextItem(), 4);
        nodeConnections[edgeData[0] - 1]["connectedPeers"].append(edgeData[1] - 1);
        nodeConnections[edgeData[1] - 1]["connectedPeers"].append(edgeData[0] - 1);
    }

    var communityList = [];

    // Perform BFS to identify distinct communities
    for (idx = 0; idx < nodeCount; idx++) {
        breadthFirstSearch(idx);
    }

    // reportError(nodeConnections); // Debugging line for node connections

    function breadthFirstSearch(startIndex) {
        // If this node already belongs to a community, skip it
        if (nodeConnections[startIndex]["communityID"] !== null) {
            return;
        }

        // Create a new community set
        communityList.append(new Set());
        var processingQueue = [nodeConnections[startIndex]];

        // Process nodes in the queue
        while (processingQueue.length > 0) {
            var currentNode = processingQueue.dequeue();

            // If the current node is already assigned, skip it
            if (currentNode["communityID"] !== null) {
                continue;
            }

            // Assign current node to the latest community
            currentNode["communityID"] = communityList.length - 1;

            // Add all connected peers to the queue
            for (var subIdx = 0; subIdx < currentNode["connectedPeers"].length; subIdx++) {
                processingQueue.append(nodeConnections[currentNode["connectedPeers"][subIdx]]);
            }
        }
    }

    // Populate community sets with actual node indices
    for (idx = 0; idx < nodeCount; idx++) {
        communityList[nodeConnections[idx]["communityID"]].add(idx);
    }

    // reportError(communityList); // Debugging line for communities

    var resultArray = new Array(nodeCount);

    // Calculate initial potential friends for each node
    for (idx = 0; idx < nodeCount; idx++) {
        resultArray[idx] = communityList[nodeConnections[idx]["communityID"]].elementCount - 1 - nodeConnections[idx]["connectedPeers"].length;
    }

    // Process 'K' forbidden pairs
    for (idx = 0; idx < queryCount; idx++) {
        var forbiddenPair = dataTransformer(fetchNextItem(), 4);
        forbiddenPair[0]--; // Adjust to 0-based indexing
        forbiddenPair[1]--; // Adjust to 0-based indexing

        // If the forbidden pair is not in the same community, it doesn't affect counts
        if (nodeConnections[forbiddenPair[0]]["communityID"] !== nodeConnections[forbiddenPair[1]]["communityID"]) {
            continue;
        }

        // Decrement potential friend count for both nodes in the forbidden pair
        resultArray[forbiddenPair[0]]--;
        resultArray[forbiddenPair[1]]--;
    }

    displayOutput(dataTransformer(resultArray, 8));
}