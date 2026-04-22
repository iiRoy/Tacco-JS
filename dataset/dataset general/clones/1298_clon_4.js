function workflowEngine(startingPoint, sharedContext) {
    const specificRouting = new Map();
    const anyStateRouting = new Map();
    let defaultRouting = null;

    const engineInstance = {
        currentPosition: startingPoint,
        sharedContext: sharedContext || {},
        enableLogging: true,
        lastExecutedAction: null,

        defineSpecificRoute: function(inputIdentifiers, sourcePositions, actionFunction, destinationPoint) {
            const identifiers = Array.isArray(inputIdentifiers) ? inputIdentifiers : [inputIdentifiers];
            const positions = Array.isArray(sourcePositions) ? sourcePositions : [sourcePositions];

            for (const identifier of identifiers) {
                for (const position of positions) {
                    const routeKey = `${identifier}::${position}`;
                    specificRouting.set(routeKey, [actionFunction, destinationPoint]);
                }
            }
        },

        defineGlobalRoute: function(inputIdentifiers, actionFunction, destinationPoint) {
            const identifiers = Array.isArray(inputIdentifiers) ? inputIdentifiers : [inputIdentifiers];
            for (const identifier of identifiers) {
                anyStateRouting.set(identifier, [actionFunction, destinationPoint]);
            }
        },

        setFallbackRoute: function(actionFunction, destinationPoint) {
            defaultRouting = [actionFunction, destinationPoint];
        },

        _resolveRoute: function(inputIdentifier, currentPos) {
            let chosenPath;

            chosenPath = specificRouting.get(`${inputIdentifier}::${currentPos}`);
            if (chosenPath) {
                return [chosenPath[0], chosenPath[1] || currentPos];
            }

            chosenPath = anyStateRouting.get(inputIdentifier);
            if (chosenPath) {
                return [chosenPath[0], chosenPath[1] || currentPos];
            }

            if (defaultRouting) {
                return [defaultRouting[0], defaultRouting[1] || currentPos];
            }

            throw new Error(`No defined pathway for input "${inputIdentifier}" from position "${currentPos}".`);
        },

        processInput: function(inputIdentifier, inputPayload) {
            const initialPosition = this.currentPosition;
            const [performer, nextPosition] = this._resolveRoute(inputIdentifier, initialPosition);

            if (this.enableLogging && typeof window !== 'undefined' && window.console && window.console.log) {
                const contextName = this.sharedContext.name ? `${this.sharedContext.name}: ` : 'WorkflowEngine: ';
                const payloadDetail = inputPayload ? '; with input payload' : '';
                const performerDetail = performer ? '; with action function' : '';
                window.console.log(`${contextName}${inputIdentifier}: ${initialPosition} -> ${nextPosition}${payloadDetail}${performerDetail}`);
            }

            this.currentPosition = nextPosition;
            this.lastExecutedAction = performer;

            if (performer) {
                performer.call(this, inputPayload);
            }
        },

        toggleLogging: function(status) {
            this.enableLogging = !!status;
        }
    };

    return engineInstance;
}