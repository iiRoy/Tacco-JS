(function(scriptSource) {
    function DepotStructure() {
        let headNode = null;
        let elementCount = 0;

        this.placeElement = function(elementValue) {
            headNode = {
                data: elementValue,
                nextLink: headNode
            };
            elementCount++;
        };

        this.removeElement = function() {
            if (headNode === null) {
                return undefined;
            }
            const fetchedData = headNode.data;
            headNode = headNode.nextLink;
            elementCount--;
            return fetchedData;
        };
    }

    const outputDisplay = {
        transmit: function(contentToDisplay) {
            console.log(contentToDisplay);
        }
    };

    const commandRegistry = {
        "enroll": function(valueArgument, storageInstance, outputInstance) {
            storageInstance.placeElement(valueArgument);
        },
        "eject": function(valueArgument, storageInstance, outputInstance) {
            const retrievedValue = storageInstance.removeElement();
            outputInstance.transmit(retrievedValue);
        },
        "cease": function() {
        }
    };

    function processInstructions(instructionLines, currentPosition, dataDepot, displayUnit, actionMap) {
        if (currentPosition >= instructionLines.length) {
            return;
        }

        const currentLineContent = instructionLines[currentPosition].trim();
        if (currentLineContent === "") {
            processInstructions(instructionLines, currentPosition + 1, dataDepot, displayUnit, actionMap);
            return;
        }

        const lineSegments = currentLineContent.split(" ");
        const mainAction = lineSegments[0];
        const associatedValue = lineSegments[1];

        if (mainAction === "cease") {
            return;
        }

        const requestedOperation = actionMap[mainAction];
        if (requestedOperation) {
            requestedOperation(associatedValue, dataDepot, displayUnit);
        }

        processInstructions(instructionLines, currentPosition + 1, dataDepot, displayUnit, actionMap);
    }

    const programLines = scriptSource.split("\n");
    const programStorage = new DepotStructure();

    processInstructions(programLines, 0, programStorage, outputDisplay, commandRegistry);

})(require("fs").readFileSync("/dev/stdin", "utf8"));