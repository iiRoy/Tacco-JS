const layoutExtensionRegistry = {};

function establishLayoutExtension(extensionDefinitionMap) {
    for (const moniker in extensionDefinitionMap) {
        if (Object.prototype.hasOwnProperty.call(extensionDefinitionMap, moniker)) {
            layoutExtensionRegistry[moniker] = extensionDefinitionMap[moniker];
        }
    }
}

const gridPositioningFacilitator = function(instanceConfiguration, boundaryElement) {
    const self = {
        _behaviorCallbacks: {},

        enrollBehavior: function(signalIdentifier, actionProcessor) {
            self._behaviorCallbacks[signalIdentifier] = actionProcessor;
        },

        processArrangementUpdate: function(arrangementSnapshot) {
            const contentOverallDimension = boundaryElement.getCustomProperty('wall-width') * 1;
            const actualRenderedDimension = boundaryElement.getVisualWidth();

            const horizontalCorrection = (actualRenderedDimension - contentOverallDimension) / 2;

            if (arrangementSnapshot && arrangementSnapshot.internalExecutionData && arrangementSnapshot.internalExecutionData.layoutUnits) {
                Object.values(arrangementSnapshot.internalExecutionData.layoutUnits).forEach(unit => {
                    if (unit.horizontalCoordinate !== undefined && unit.horizontalCoordinate !== null) {
                        unit.horizontalCoordinate += horizontalCorrection;
                    }
                });
            }
        }
    };

    self.enrollBehavior("layoutCompletionNotification", self.processArrangementUpdate);

    return self;
};

establishLayoutExtension({
    alignmentService: gridPositioningFacilitator
});