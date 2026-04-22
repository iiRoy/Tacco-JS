var mimicryCraft = (function() {
    const issueReporter = {
        raiseIssue: function(details) {
            if (mimicryCraft.configuration.logToConsole && typeof console !== 'undefined' && console.error) {
                console.error('Mimicry Error: ' + details);
            }
            if (mimicryCraft.configuration.throwExceptions) {
                throw new Error('Mimicry Error: ' + details);
            }
        }
    };

    const valueInspector = {
        obtainPrimitiveTypeTag: function(item) {
            if (item === null) return 'Null';
            if (item === undefined) return 'Undefined';
            const typeString = Object.prototype.toString.call(item);
            return typeString.substring(8, typeString.length - 1);
        },

        evaluateDeepEquality: function(valA, valB) {
            if (valA === valB) return true;

            if (valA === null || valA === undefined || valB === null || valB === undefined) {
                return valA === valB;
            }

            const typeA = valueInspector.obtainPrimitiveTypeTag(valA);
            const typeB = valueInspector.obtainPrimitiveTypeTag(valB);

            if (typeA !== typeB) return false;

            if (typeA === 'Array') {
                if (valA.length !== valB.length) return false;
                for (let k = 0; k < valA.length; k++) {
                    if (!valueInspector.evaluateDeepEquality(valA[k], valB[k])) return false;
                }
                return true;
            }

            if (typeA === 'Object') {
                const keysA = Object.keys(valA);
                const keysB = Object.keys(valB);

                if (keysA.length !== keysB.length) return false;

                for (const key of keysA) {
                    if (!Object.prototype.hasOwnProperty.call(valB, key) || !valueInspector.evaluateDeepEquality(valA[key], valB[key])) {
                        return false;
                    }
                }
                return true;
            }

            // Mimic original's behavior for Date: only equal if same reference
            if (typeA === 'Date') {
                return valA === valB;
            }

            // Mimic original's behavior for RegExp: compare source and flags
            if (typeA === 'RegExp') {
                return valA.source === valB.source && valA.flags === valB.flags;
            }

            return false;
        }
    };

    function InteractionContract() {
        let callAttemptLimit = null;
        let inputConstraints = [];
        let outcomeCollection = [];
        let postExecutionHook = null; // { action: fn, note: string }
        let performedAttempts = 0;

        this.getAttemptCount = () => performedAttempts;
        this.recordAttempt = () => performedAttempts++;

        this.getLimit = () => callAttemptLimit;
        this.setLimit = (count) => { callAttemptLimit = count; };

        this.getInputConstraints = () => inputConstraints;
        this.setInputConstraints = (args) => { inputConstraints = Array.from(args); };

        this.getOutcomes = () => outcomeCollection;
        this.setOutcomes = (args) => { outcomeCollection = Array.from(args); };

        this.getHook = () => postExecutionHook;
        this.setHook = (action, note) => { postExecutionHook = { action, note }; };
    }

    function processMockedInvocation(methodAlias, receivedArguments, interactionRegistry) {
        const contracts = interactionRegistry.get(methodAlias);
        if (!contracts || contracts.length === 0) {
            issueReporter.raiseIssue(`Invocation of '${methodAlias}' had no registered interaction contracts.`);
            return undefined;
        }

        let matchedContract = null;
        for (const contract of contracts) {
            const expectedInputs = contract.getInputConstraints();
            if (expectedInputs.length !== receivedArguments.length) {
                continue;
            }

            let inputsMatch = true;
            for (let i = 0; i < expectedInputs.length; i++) {
                const expectedInput = expectedInputs[i];
                const receivedInput = receivedArguments[i];

                // Original `amok` checks for `!args[i]` (meaning `undefined`)
                if (expectedInput !== undefined && receivedInput === undefined) {
                    issueReporter.raiseIssue(`Invocation of '${methodAlias}' for argument ${i + 1}: expected value '${JSON.stringify(expectedInput)}', but received undefined.`);
                    inputsMatch = false;
                    break;
                }
                
                // Original `amok` checks if expected argument is a base type constructor (e.g., `String`, `Number`)
                const expectedInputTypeTag = valueInspector.obtainPrimitiveTypeTag(expectedInput);
                const receivedInputTypeTag = valueInspector.obtainPrimitiveTypeTag(receivedInput);

                const isExpectedConstructor = (expectedInputTypeTag === 'Function' &&
                                               (expectedInput === String || expectedInput === Number || expectedInput === Array ||
                                                expectedInput === Date || expectedInput === Boolean || expectedInput === Object ||
                                                expectedInput === Function || expectedInput === RegExp));

                if (isExpectedConstructor) {
                    if (receivedInputTypeTag !== expectedInput.name) {
                        issueReporter.raiseIssue(`Invocation of '${methodAlias}' for argument ${i + 1}: expected type '${expectedInput.name}', received type '${receivedInputTypeTag}'.`);
                        inputsMatch = false;
                        break;
                    }
                } else {
                    if (!valueInspector.evaluateDeepEquality(expectedInput, receivedInput)) {
                        issueReporter.raiseIssue(`Invocation of '${methodAlias}' for argument ${i + 1}: expected value '${JSON.stringify(expectedInput)}', received value '${JSON.stringify(receivedInput)}'.`);
                        inputsMatch = false;
                        break;
                    }
                }
            }
            if (inputsMatch) {
                matchedContract = contract;
                break;
            }
        }

        if (!matchedContract) {
            issueReporter.raiseIssue(`Invocation of '${methodAlias}' with arguments ${JSON.stringify(Array.from(receivedArguments))} did not match any configured contract.`);
            return undefined;
        }

        matchedContract.recordAttempt();

        const limit = matchedContract.getLimit();
        if (limit !== null && matchedContract.getAttemptCount() > limit) {
            issueReporter.raiseIssue(`Invocation of '${methodAlias}' has exceeded its configured limit of ${limit}.`);
            return undefined;
        }

        const hook = matchedContract.getHook();
        if (hook) {
            hook.action(hook.note);
        }

        const outcomes = matchedContract.getOutcomes();
        if (outcomes.length > 0) {
            const index = matchedContract.getAttemptCount() - 1;
            return outcomes[index] !== undefined ? outcomes[index] : outcomes[outcomes.length - 1];
        }

        return undefined;
    }

    function InteractionConfiguratorBuilder(methodAlias, entityRef, interactionRegistryRef) {
        const currentContract = new InteractionContract();

        let methodContracts = interactionRegistryRef.get(methodAlias);
        if (!methodContracts) {
            methodContracts = [];
            interactionRegistryRef.set(methodAlias, methodContracts);
        }
        methodContracts.push(currentContract);

        // Define the mocked method on the entity if it doesn't exist
        if (!(methodAlias in entityRef)) {
            Object.defineProperty(entityRef, methodAlias, {
                value: function(...args) {
                    return processMockedInvocation(methodAlias, args, interactionRegistryRef);
                },
                configurable: true,
                enumerable: true,
                writable: true
            });
        }

        this.withInputs = function(...args) {
            currentContract.setInputConstraints(args);
            return this;
        };

        this.maximumCalls = function(count) {
            currentContract.setLimit(count);
            return this;
        };

        this.returnsValues = function(...values) {
            currentContract.setOutcomes(values);
            return this;
        };

        this.executesCallback = function(callbackFunction, message) {
            currentContract.setHook(callbackFunction, message);
            return this;
        };
    }

    const coreDSL = {
        expectMethod: function(methodAlias) {
            // The original `amok.Util.hasMethod` was effectively a no-op due to a bug.
            // This implementation mirrors that by not performing any method existence check here.
            return new InteractionConfiguratorBuilder(methodAlias, this, this.__interactionLedger__);
        }
    };

    return {
        configuration: {
            logToConsole: true,
            throwExceptions: true
        },

        manufacture: function(originalSubject) {
            const mimickedEntity = {};
            
            // Store the interaction ledger as a non-enumerable property on the mimicked entity
            Object.defineProperty(mimickedEntity, '__interactionLedger__', {
                value: new Map(),
                configurable: false,
                enumerable: false,
                writable: false
            });

            // Mixin core DSL methods. 'this' in DSL methods will refer to mimickedEntity.
            Object.assign(mimickedEntity, coreDSL);

            return mimickedEntity;
        }
    };
})();