(function() {
    window.createTimeSequencer = function(initialConfiguration) {

        var internalSettings = {
            'progressRoundingMethod': 'floor',
            'percentageStepInterval': 5
        };
        if (initialConfiguration) {
            for (var currentKey in initialConfiguration) {
                if (initialConfiguration.hasOwnProperty(currentKey)) {
                    internalSettings[currentKey] = initialConfiguration[currentKey];
                }
            }
        }

        var sequencerVersion = "1.0.3";

        var eventTriggerMap = new Map();

        var triggeredMarks = new Set();

        var currentSequenceSpan = 0;
        var leftoverSpan = 0;
        var currentProgressionPoint = 0;
        var sequenceStartMoment = 0;
        var animationFrameHandle = null;

        var sequencerInstance;

        var normalizePercentageInput = function(input) {
            var numericValue = parseInt(String(input).match(/[0-9]+/g), 10);
            return isNaN(numericValue) ? -1 : numericValue;
        };

        var getRoundedProgressValue = function(rawPercentageValue) {
            if (internalSettings.progressRoundingMethod === "nearest") {
                return Math.round(rawPercentageValue / internalSettings.percentageStepInterval) * internalSettings.percentageStepInterval;
            } else {
                return Math.floor(rawPercentageValue / internalSettings.percentageStepInterval) * internalSettings.percentageStepInterval;
            }
        };

        var animationTick = function(timestamp) {
            if (!sequencerInstance.isCurrentlyActive) {
                return;
            }

            currentProgressionPoint = timestamp - sequenceStartMoment;
            var currentPercentage = (currentProgressionPoint / currentSequenceSpan) * 100;

            if (currentProgressionPoint >= currentSequenceSpan) {
                currentPercentage = 100;
                currentProgressionPoint = currentSequenceSpan;
                sequencerInstance.reinitializeSequencer();
                return;
            }

            var roundedPercentage = getRoundedProgressValue(currentPercentage);

            if (!triggeredMarks.has(roundedPercentage) && eventTriggerMap.has(roundedPercentage)) {
                triggeredMarks.add(roundedPercentage);
                eventTriggerMap.get(roundedPercentage)();
            }

            animationFrameHandle = requestAnimationFrame(animationTick);
        };


        return sequencerInstance = {

            isCurrentlyActive: false,

            addTriggerPoint: function(triggerPercentage, actionHandler) {
                var normalizedPoint = normalizePercentageInput(triggerPercentage);

                if (normalizedPoint >= 0 && normalizedPoint <= 100) {
                    var priorHandler = eventTriggerMap.get(normalizedPoint);

                    if (typeof priorHandler !== 'function') {
                        eventTriggerMap.set(normalizedPoint, actionHandler);
                    } else {
                        eventTriggerMap.set(normalizedPoint, function() {
                            priorHandler();
                            actionHandler();
                        });
                    }
                }
            },

            removeTriggerPoint: function(triggerPercentage) {
                var normalizedPoint = normalizePercentageInput(triggerPercentage);
                if (normalizedPoint >= 0 && normalizedPoint <= 100) {
                    eventTriggerMap.delete(normalizedPoint);
                }
            },

            configureTriggerPoints: function(triggerPointMap) {
                for (var pointKey in triggerPointMap) {
                    if (triggerPointMap.hasOwnProperty(pointKey)) {
                        var handler = triggerPointMap[pointKey];
                        if (typeof handler === "function") {
                            this.addTriggerPoint(pointKey, handler);
                        }
                    }
                }
            },

            retrieveTriggerPoints: function() {
                var plainMap = {};
                eventTriggerMap.forEach(function(value, key) {
                    plainMap[key + '%'] = value;
                });
                return plainMap;
            },

            reinitializeSequencer: function() {
                if (animationFrameHandle) {
                    cancelAnimationFrame(animationFrameHandle);
                }

                currentSequenceSpan = 0;
                leftoverSpan = 0;
                currentProgressionPoint = 0;
                sequenceStartMoment = 0;
                triggeredMarks.clear();
                this.isCurrentlyActive = false;
            },

            suspendSequence: function() {
                if (!this.isCurrentlyActive) {
                    return;
                }
                this.isCurrentlyActive = false;

                if (animationFrameHandle) {
                    cancelAnimationFrame(animationFrameHandle);
                    animationFrameHandle = null;
                }

                leftoverSpan = currentSequenceSpan - currentProgressionPoint;
            },

            initiateSequence: function(sequenceDuration, completionAction) {

                if (this.isCurrentlyActive) {
                    return;
                }
                this.isCurrentlyActive = true;

                sequenceDuration = parseInt(sequenceDuration, 10) || 500;

                if (sequenceDuration < 500) {
                    internalSettings.percentageStepInterval = 10;
                }

                if (leftoverSpan > 0) {
                    currentSequenceSpan = leftoverSpan;
                    sequenceStartMoment = performance.now() - currentProgressionPoint;
                    leftoverSpan = 0;
                } else {
                    currentSequenceSpan = sequenceDuration;
                    sequenceStartMoment = performance.now();
                    currentProgressionPoint = 0;
                    triggeredMarks.clear();
                }

                if (typeof completionAction === "function") {
                    this.addTriggerPoint(100, completionAction);
                }

                animationFrameHandle = requestAnimationFrame(animationTick);
            }
        };
    };
})();