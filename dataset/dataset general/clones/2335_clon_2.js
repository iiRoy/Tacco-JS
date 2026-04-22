;(function () {

    // Source hash: 114cf5304a74ff8f7c9ff1d21cf5652298af04b0

    // Generation timestamp: Wed Jul 18 2012 14:44:33 GMT-0700 (PDT)

    /*
     The following code is licensed under the Apache Software Foundation (ASF) License.
     This means you may use, distribute, and modify it under the terms of the Apache License, Version 2.0.
     A copy of the license can be found at:

     http://www.apache.org/licenses/LICENSE-2.0

     Unless explicitly stated otherwise, this software is provided "AS IS", WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
     Refer to the license for specific language governing permissions and limitations.
    */

    ;(function() {

        // Internal script: lib/scripts/loader.js
        var obtain,
            establish;

        (function () {
            var components = {};

            function constructModule(unit) {
                var producer = unit.producer;
                unit.emissions = {};
                delete unit.producer;
                producer(obtain, unit.emissions, unit);
                return unit.emissions;
            }

            obtain = function (keyIdentifier) {
                if (!components[keyIdentifier]) {
                    throw "code component " + keyIdentifier + " is not found";
                }
                return components[keyIdentifier].producer ? constructModule(components[keyIdentifier]) : components[keyIdentifier].emissions;
            };

            establish = function (keyIdentifier, producer) {
                if (components[keyIdentifier]) {
                    throw "code component " + keyIdentifier + " already established";
                }

                components[keyIdentifier] = {
                    keyIdentifier: keyIdentifier,
                    producer: producer
                };
            };

            establish.discard = function (keyIdentifier) {
                delete components[keyIdentifier];
            };

        })();

        // Expose for Node.js environments
        if (typeof module === "object" && typeof obtain === "function") {
            module.exports.obtain = obtain;
            module.exports.establish = establish;
        }
    })();

    // Internal script: lib/platform_api.js
    establish("platformAPI", function (obtain, emissions, unit) {
        var conduit = obtain('platformAPI/event_conduit');

        /**
         * Wait for the document to be fully loaded and then signal our event subscribers.
         */
        document.addEventListener('DOMContentLoaded', function () {
            conduit.onDOMContentReady.invoke();
        }, false);
        if (document.readyState == 'complete' || document.readyState == 'interactive') {
            conduit.onDOMContentReady.invoke();
        }

        /**
         * Intercept calls to addEventListener and removeEventListener, managing deviceready,
         * resume, and pause events.
         */
        var _originalDocAdd = document.addEventListener;
        var _originalDocRemove = document.removeEventListener;
        var _originalWinAdd = window.addEventListener;
        var _originalWinRemove = window.removeEventListener;

        /**
         * Holds custom event callbacks that replace default document and window event listeners.
         */
        var docEventRegistry = {},
            winEventRegistry = {};

        document.addEventListener = function (eventKind, callbackRoutine, capturePhase) {
            var kindLower = eventKind.toLowerCase();
            if (typeof docEventRegistry[kindLower] != 'undefined') {
                if (eventKind === 'deviceready') {
                    docEventRegistry[kindLower].registerOnce(callbackRoutine);
                } else {
                    docEventRegistry[kindLower].register(callbackRoutine);
                }
            } else {
                _originalDocAdd.call(document, eventKind, callbackRoutine, capturePhase);
            }
        };

        window.addEventListener = function (eventKind, callbackRoutine, capturePhase) {
            var kindLower = eventKind.toLowerCase();
            if (typeof winEventRegistry[kindLower] != 'undefined') {
                winEventRegistry[kindLower].register(callbackRoutine);
            } else {
                _originalWinAdd.call(window, eventKind, callbackRoutine, capturePhase);
            }
        };

        document.removeEventListener = function (eventKind, callbackRoutine, capturePhase) {
            var kindLower = eventKind.toLowerCase();
            // If detaching from an event managed by a plugin
            if (typeof docEventRegistry[kindLower] != "undefined") {
                docEventRegistry[kindLower].unregister(callbackRoutine);
            } else {
                _originalDocRemove.call(document, eventKind, callbackRoutine, capturePhase);
            }
        };

        window.removeEventListener = function (eventKind, callbackRoutine, capturePhase) {
            var kindLower = eventKind.toLowerCase();
            // If detaching from an event managed by a plugin
            if (typeof winEventRegistry[kindLower] != "undefined") {
                winEventRegistry[kindLower].unregister(callbackRoutine);
            } else {
                _originalWinRemove.call(window, eventKind, callbackRoutine, capturePhase);
            }
        };

        function generateEvent(eventType, payload) {
            var generatedEvent = document.createEvent('Events');
            generatedEvent.initEvent(eventType, false, false);
            if (payload) {
                for (var propertyKey in payload) {
                    if (payload.hasOwnProperty(propertyKey)) {
                        generatedEvent[propertyKey] = payload[propertyKey];
                    }
                }
            }
            return generatedEvent;
        }

        if (typeof window.console === "undefined") {
            window.console = {
                log: function () {
                }
            };
        }

        var platformAPI = {
            establish: establish,
            obtain: obtain,
            /**
             * Functions to add/remove your custom listener interception on document + window.
             */
            registerWinHandler: function (eventKind, configuration) {
                return (winEventRegistry[eventKind] = conduit.produceStream(eventKind, configuration));
            },
            registerDocHandler: function (eventKind, configuration) {
                return (docEventRegistry[eventKind] = conduit.produceStream(eventKind, configuration));
            },
            unregisterWinHandler: function (eventKind) {
                delete winEventRegistry[eventKind];
            },
            unregisterDocHandler: function (eventKind) {
                delete docEventRegistry[eventKind];
            },
            /**
             * Retrieve the original event handlers that were replaced by the Platform API.
             *
             * @returns {object} An object containing original document and window event methods.
             */
            retrieveNativeHandlers: function () {
                return {
                    'document': {'addEventListener': _originalDocAdd, 'removeEventListener': _originalDocRemove},
                    'window': {'addEventListener': _originalWinAdd, 'removeEventListener': _originalWinRemove}
                };
            },
            /**
             * Method to dispatch an event from native code.
             */
            triggerDocEvent: function (eventType, payload) {
                var generatedEvent = generateEvent(eventType, payload);
                if (typeof docEventRegistry[eventType] != 'undefined') {
                    setTimeout(function () {
                        docEventRegistry[eventType].invoke(generatedEvent);
                    }, 0);
                } else {
                    document.dispatchEvent(generatedEvent);
                }
            },
            triggerWinEvent: function (eventType, payload) {
                var generatedEvent = generateEvent(eventType, payload);
                if (typeof winEventRegistry[eventType] != 'undefined') {
                    setTimeout(function () {
                        winEventRegistry[eventType].invoke(generatedEvent);
                    }, 0);
                } else {
                    window.dispatchEvent(generatedEvent);
                }
            },
            // TODO: This part is specific to Android; consider a more generalized approach.
            systemTerminating: false,
            EmployPollingMechanism: false,
            // END TODO

            // TODO: This section is for iOS only.
            // This queue stores the currently executing command and all subsequent
            // commands executed via platformAPI.exec().
            instructionQueue: [],
            // Indicates if the command queue is currently being processed
            // on the native side.
            instructionQueueProcessing: false,
            // END TODO
            /**
             * Plugin callback management system.
             */
            responseID: 0,
            responseHandlers: {},
            responseOutcome: {
                NO_YIELD: 0,
                SUCCESS: 1,
                CLASS_MISSING_ERROR: 2,
                ACCESS_DENIED_ERROR: 3,
                INSTANTIATION_FAILURE: 4,
                BAD_URL_FORMAT: 5,
                IO_ERROR: 6,
                ILLEGAL_OPERATION: 7,
                JSON_PARSING_ERROR: 8,
                GENERIC_ERROR: 9
            },

            /**
             * Called by native code to report a successful action result.
             *
             * @param responseID The identifier for the callback.
             * @param resultInfo Object containing status and message.
             */
            notifySuccess: function (responseID, resultInfo) {
                if (platformAPI.responseHandlers[responseID]) {

                    // If the result needs to be sent to the callback
                    if (resultInfo.outcome == platformAPI.responseOutcome.SUCCESS) {
                        try {
                            if (platformAPI.responseHandlers[responseID].success) {
                                platformAPI.responseHandlers[responseID].success(resultInfo.details);
                            }
                        }
                        catch (err) {
                            console.log("Problem in success callback: " + responseID + " = " + err);
                        }
                    }

                    // Clear the handler if no more results are expected
                    if (!resultInfo.persistHandler) {
                        delete platformAPI.responseHandlers[responseID];
                    }
                }
            },

            /**
             * Called by native code to report an erroneous action result.
             *
             * @param responseID The identifier for the callback.
             * @param resultInfo Object containing status and message.
             */
            notifyError: function (responseID, resultInfo) {
                if (platformAPI.responseHandlers[responseID]) {
                    try {
                        if (platformAPI.responseHandlers[responseID].fail) {
                            platformAPI.responseHandlers[responseID].fail(resultInfo.details);
                        }
                    }
                    catch (err) {
                        console.log("Problem in error callback: " + responseID + " = " + err);
                    }

                    // Clear the handler if no more results are expected
                    if (!resultInfo.persistHandler) {
                        delete platformAPI.responseHandlers[responseID];
                    }
                }
            },
            registerInitializer: function (setupFunction) {
                conduit.onPlatformReady.registerOnce(function () {
                    try {
                        setupFunction();
                    } catch (err) {
                        console.log("Failed to execute initializer: " + err);
                    }
                });
            }
        };

        // Register pause, resume and deviceready streams as events on the document.
        conduit.onAppPause = platformAPI.registerDocHandler('pause');
        conduit.onAppResume = platformAPI.registerDocHandler('resume');
        conduit.onDeviceAvailable = platformAPI.registerDocHandler('deviceready');

        unit.emissions = platformAPI;

    });

    // Internal script: lib/common/structure_builder.js
    establish("platformAPI/structure_builder", function (obtain, emissions, unit) {
        var utilityKit = obtain('platformAPI/utility_kit');

        function processEach(itemCollection, operationFunc, execContext) {
            for (var propertyKey in itemCollection) {
                if (itemCollection.hasOwnProperty(propertyKey)) {
                    operationFunc.apply(execContext, [itemCollection[propertyKey], propertyKey]);
                }
            }
        }

        function incorporateItems(targetObject, itemCollection, overwriteExisting, combineProperties) {
            processEach(itemCollection, function (itemDescriptor, propertyName) {
                try {
                    var retrievedValue = itemDescriptor.sourcePath ? obtain(itemDescriptor.sourcePath) : {};

                    if (overwriteExisting) {
                        // Overwrite if the property doesn't exist.
                        if (typeof targetObject[propertyName] === 'undefined') {
                            targetObject[propertyName] = retrievedValue;
                        } else if (typeof itemDescriptor.sourcePath !== 'undefined') {
                            // If combining, deep combine properties onto target, otherwise, overwrite.
                            if (combineProperties) {
                                deepCombine(targetObject[propertyName], retrievedValue);
                            } else {
                                targetObject[propertyName] = retrievedValue;
                            }
                        }
                        retrievedValue = targetObject[propertyName];
                    } else {
                        // Set if not currently defined.
                        if (typeof targetObject[propertyName] == 'undefined') {
                            targetObject[propertyName] = retrievedValue;
                        } else if (combineProperties && typeof itemDescriptor.sourcePath !== 'undefined') {
                            // If combining, deep combine target onto retrievedValue
                            deepCombine(retrievedValue, targetObject[propertyName]);
                            targetObject[propertyName] = retrievedValue;
                        } else {
                            // Use existing value, so we can build child items into it if they exist.
                            retrievedValue = targetObject[propertyName];
                        }
                    }

                    if (itemDescriptor.children) {
                        incorporateItems(retrievedValue, itemDescriptor.children, overwriteExisting, combineProperties);
                    }
                } catch (err) {
                    utilityKit.alert('Error constructing platform API globals: ' + err + ' for property "' + propertyName + '"');
                }
            });
        }

        /**
         * Recursively merge properties from a source object onto a destination object.
         * Properties from the source will take precedence and overwrite existing destination properties.
         *
         * @param destination The object to merge properties into.
         * @param source The object to merge properties from.
         */
        function deepCombine(destination, source) {
            for (var propertyKey in source) {
                if (source.hasOwnProperty(propertyKey)) {
                    if (typeof destination.prototype !== 'undefined' && destination.prototype.constructor === destination) {
                        // If destination is a constructor, set property on its prototype.
                        destination.prototype[propertyKey] = source[propertyKey];
                    } else {
                        destination[propertyKey] = typeof source[propertyKey] === 'object' ? deepCombine(
                            destination[propertyKey], source[propertyKey]) : source[propertyKey];
                    }
                }
            }
            return destination;
        }

        emissions.constructStructure = function (itemCollection) {
            return {
                insertIfNotPresent: function (targetObject) {
                    incorporateItems(targetObject, itemCollection, false, false);
                },
                insertAndOverwrite: function (targetObject) {
                    incorporateItems(targetObject, itemCollection, true, false);
                },
                insertAndDeepMerge: function (targetObject) {
                    incorporateItems(targetObject, itemCollection, true, true);
                }
            };
        };

    });

    // Internal script: lib/common/event_conduit.js
    establish("platformAPI/event_conduit", function (obtain, emissions, unit) {
        var utilityKit = obtain('platformAPI/utility_kit');

        /**
         * A specialized publish-subscribe "event stream" that allows functions to be registered.
         * This object is crucial for defining and managing the triggering of events during
         * platform initialization.
         *
         * The sequence of events during page loading and Platform API startup is as follows:
         *
         * onDOMContentReady         Internal event fired when the web page is loaded and parsed.
         * onCoreSystemReady         Internal event indicating the native side of the platform is initialized.
         * onPlatformReady           Internal event fired when all Platform API JavaScript objects are created.
         * onPlatformInfoReady       Internal event fired when device properties become accessible.
         * onPlatformConnectionReady Internal event fired when the network connection property is set.
         * onDeviceAvailable         User-facing event indicating the platform is ready for use.
         * onAppResume               User-facing event signifying an application resume lifecycle event.
         * onAppPause                User-facing event signifying an application pause lifecycle event.
         * onAppDestroy              Internal event fired when the application is being terminated (users should use window.onunload).
         *
         * The primary events for which user code should register listeners are:
         *      deviceready           Native platform code is initialized; Platform API functions can be called.
         *      pause                 Application has transitioned to the background.
         *      resume                Application has returned to the foreground.
         *
         * Listeners can be set up like this:
         *      document.addEventListener("deviceready", myDeviceReadyCallback, false);
         *      document.addEventListener("resume", myResumeCallback, false);
         *      document.addEventListener("pause", myPauseCallback, false);
         *
         * For saving and restoring application state, the standard DOM lifecycle events should be used:
         *      window.onload
         *      window.onunload
         *
         */

        /**
         * EventStream
         * @constructor
         * @param streamType  String representing the name of the event stream.
         * @param configuration  Object containing options for the stream, currently supporting:
         *                     onAttach: A callback function that runs when a listener
         *                       is registered to this EventStream. Context is set to the EventStream.
         *                     onDetach: A callback function that runs when a listener
         *                       is unregistered from this EventStream. Context is set to the EventStream.
         */
        var EventStream = function (streamType, configuration) {
            this.streamType = streamType;
            this.listenerFunctions = {};
            this.listenerCount = 0;
            this.uniqueID = 1;
            this.hasTriggered = false;
            this.isActive = true;
            this.lifecycleHooks = {
                onAttach: null,
                onDetach: null
            };
            if (configuration) {
                if (configuration.onAttach) this.lifecycleHooks.onAttach = configuration.onAttach;
                if (configuration.onDetach) this.lifecycleHooks.onDetach = configuration.onDetach;
            }
        },
            conduit = {
                /**
                 * Executes the provided function only after all specified event streams
                 * have completed their triggering.
                 */
                join: function (completionRoutine, streamCollection) {
                    var counter = streamCollection.length;
                    var collectionLength = counter;
                    var countdownHandler = function () {
                        if (!(--counter)) completionRoutine();
                    };
                    for (var idx = 0; idx < collectionLength; idx++) {
                        !streamCollection[idx].hasTriggered ? streamCollection[idx].registerOnce(countdownHandler) : counter--;
                    }
                    if (!counter) completionRoutine();
                },
                produceStream: function (streamType, configuration) {
                    conduit[streamType] = new EventStream(streamType, configuration);
                    return conduit[streamType];
                },

                /**
                 * Platform API Event Streams that must invoke before "deviceready" is triggered.
                 */
                readyStreamsList: [],
                readyStreamsMap: {},

                /**
                 * Indicate that a specific feature requires initialization before it is ready for use.
                 * This will defer the Platform API's "deviceready" event until the feature has been fully initialized.
                 */
            };

        // EventStream prototype methods
        EventStream.prototype = {
            /**
             * Registers a callback to this event stream.
             * @param callbackRoutine The function to execute when the stream invokes.
             */
            register: function (callbackRoutine) {
                var handlerID = this.uniqueID++;
                this.listenerFunctions[handlerID] = callbackRoutine;
                this.listenerCount++;
                if (this.lifecycleHooks.onAttach) {
                    this.lifecycleHooks.onAttach.call(this);
                }
                return handlerID;
            },

            /**
             * Registers a callback to this event stream that will only be executed once.
             * @param callbackRoutine The function to execute once when the stream invokes.
             */
            registerOnce: function (callbackRoutine) {
                var self = this;
                var wrappedCallback = function () {
                    callbackRoutine();
                    self.unregister(wrappedCallback);
                };
                return this.register(wrappedCallback);
            },

            /**
             * Unregisters a callback from this event stream.
             * @param callbackRoutineOrID The function or its ID to unregister.
             */
            unregister: function (callbackRoutineOrID) {
                if (typeof callbackRoutineOrID === 'function') {
                    var found = false;
                    for (var idKey in this.listenerFunctions) {
                        if (this.listenerFunctions.hasOwnProperty(idKey) && this.listenerFunctions[idKey] === callbackRoutineOrID) {
                            delete this.listenerFunctions[idKey];
                            this.listenerCount--;
                            found = true;
                            break;
                        }
                    }
                    if (found && this.lifecycleHooks.onDetach) {
                        this.lifecycleHooks.onDetach.call(this);
                    }
                } else {
                    // Assuming it's an ID
                    if (this.listenerFunctions[callbackRoutineOrID]) {
                        delete this.listenerFunctions[callbackRoutineOrID];
                        this.listenerCount--;
                        if (this.lifecycleHooks.onDetach) {
                            this.lifecycleHooks.onDetach.call(this);
                        }
                    }
                }
            },

            /**
             * Invokes all registered callbacks for this event stream.
             * @param args Arguments to pass to the callbacks.
             */
            invoke: function (args) {
                if (this.isActive) {
                    for (var idKey in this.listenerFunctions) {
                        if (this.listenerFunctions.hasOwnProperty(idKey)) {
                            this.listenerFunctions[idKey](args);
                        }
                    }
                    this.hasTriggered = true;
                }
            },

            /**
             * Enables this event stream, allowing callbacks to be invoked.
             */
            enable: function () {
                this.isActive = true;
            },

            /**
             * Disables this event stream, preventing callbacks from being invoked.
             */
            disable: function () {
                this.isActive = false;
            }
        };

        // Define global event streams
        conduit.produceStream('onDOMContentReady');
        conduit.produceStream('onCoreSystemReady');
        conduit.produceStream('onPlatformReady');
        conduit.produceStream('onPlatformInfoReady');
        conduit.produceStream('onPlatformConnectionReady');
        conduit.produceStream('onDeviceAvailable', {
            onAttach: function () {
                conduit.readyStreamsList.push(this);
                conduit.readyStreamsMap[this.streamType] = this;
            },
            onDetach: function () {
                var idx = conduit.readyStreamsList.indexOf(this);
                if (idx > -1) {
                    conduit.readyStreamsList.splice(idx, 1);
                }
                delete conduit.readyStreamsMap[this.streamType];
            }
        });

        conduit.produceStream('onAppResume');
        conduit.produceStream('onAppPause');
        conduit.produceStream('onAppDestroy');

        // Fire onCoreSystemReady immediately if the native side is already initialized.
        if (typeof window.platformAPI !== 'undefined' && window.platformAPI.onNativeReady) {
            conduit.onCoreSystemReady.invoke();
        }

        unit.emissions = conduit;
    });

    // Internal script: lib/common/utility_kit.js
    establish("platformAPI/utility_kit", function (obtain, emissions, unit) {
        var utilityKit = {
            /**
             * Alerts a message to the user, attempting to use native alert or falling back to console.log.
             * @param msg The message string to alert.
             */
            alert: function (msg) {
                if (window.alert) {
                    window.alert(msg);
                } else {
                    console.log(msg);
                }
            },

            /**
             * Asynchronously executes a function.
             * @param func The function to execute.
             */
            nextTick: function (func) {
                setTimeout(func, 0);
            }
        };

        unit.emissions = utilityKit;
    });

})();