(function () {
    // Establish the current execution context
    const currentExecutionEnv = this;

    // Determine the base reactive programming library.
    // Prioritizes a custom provider if available and callable, otherwise falls back to the global 'Rx' object.
    const getCustomReactiveBase = typeof ProvideCustomRxRootObject === "function" ? ProvideCustomRxRootObject : null;
    const reactiveBase = getCustomReactiveBase ? getCustomReactiveBase() : currentExecutionEnv.Rx;

    // Ensure the reactive base is valid before proceeding.
    if (!reactiveBase || !reactiveBase.Observable) {
        console.error("Reactive programming base (Rx.Observable) not found. Aborting setup.");
        return;
    }

    // Reference the core Observable class and its creation method.
    const reactiveStream = reactiveBase.Observable;
    const createStreamInstance = reactiveStream.Create;

    // --- Extension for integrating with AngularJS scopes ---

    /**
     * Creates an observable stream from changes to a specific property on an AngularJS scope.
     * The stream emits the property's value whenever it changes.
     * @param {object} scopeTarget The AngularJS scope object to watch.
     * @param {string} propertyPath The name of the property to observe on the scope.
     * @returns {object} An observable stream.
     */
    reactiveStream.fromScopeProperty = function (scopeTarget, propertyPath) {
        if (!scopeTarget || typeof scopeTarget.$watch !== 'function') {
            throw new Error("Invalid scopeTarget provided; it must be an AngularJS scope with a $watch method.");
        }
        if (typeof propertyPath !== 'string' || propertyPath.trim() === '') {
            throw new Error("Invalid propertyPath provided; it must be a non-empty string.");
        }

        const initialSkipCount = 1; // Standard practice to skip the initial $watch evaluation.

        return createStreamInstance(function (valueObserver) {
            // Define the watcher function for the AngularJS scope.
            const propertyWatcher = function () {
                return scopeTarget[propertyPath];
            };

            // Define the listener function that pushes new values to the observer.
            const changeListener = function (newValue, oldValue) {
                // Only emit if the value has actually changed, excluding the initial undefined/first value comparison.
                if (newValue !== oldValue) {
                    valueObserver.onNext(newValue);
                }
            };

            // Register the AngularJS watcher.
            const deregisterWatcher = scopeTarget.$watch(propertyWatcher, changeListener);

            // Return a cleanup function for the stream.
            return function () {
                deregisterWatcher(); // Unregisters the AngularJS watcher.
            };
        }).dropInitialValue(initialSkipCount); // Helper to avoid the first evaluation of $watch.
    };

    /**
     * Adds a helper method to Observable prototypes to skip an initial number of values.
     * This is a simple re-implementation for demonstration purposes.
     * @param {number} count The number of initial values to skip.
     * @returns {object} A new observable stream that skips the specified initial values.
     */
    reactiveStream.prototype.dropInitialValue = function (count) {
        let emittedCount = 0;
        return createStreamInstance(observer => {
            const subscription = this.subscribe({
                onNext: value => {
                    if (emittedCount >= count) {
                        observer.onNext(value);
                    }
                    emittedCount++;
                },
                onError: error => observer.onError(error),
                onCompleted: () => observer.onCompleted()
            });
            return () => subscription.unsubscribe();
        });
    };

    // --- Extension for binding observable data back to AngularJS scopes ---

    /**
     * Binds the emitted values of an observable stream directly to a property on an AngularJS scope.
     * Automatically triggers a digest cycle ($apply) after updating the property.
     * Sets up automatic disposal when the scope is destroyed.
     * @param {object} targetScope The AngularJS scope object where the property will be set.
     * @param {string} targetKey The name of the property on the scope to update.
     */
    reactiveStream.prototype.bindToScopeProperty = function (targetScope, targetKey) {
        if (!targetScope || typeof targetScope.$apply !== 'function' || typeof targetScope.$on !== 'function') {
            console.warn("Invalid targetScope provided for bindToScopeProperty. It must be an AngularJS scope.");
            return;
        }
        if (typeof targetKey !== 'string' || targetKey.trim() === '') {
            console.warn("Invalid targetKey provided for bindToScopeProperty. It must be a non-empty string.");
            return;
        }

        // Subscribe to the current observable stream.
        const activeSubscription = this.subscribe(function (incomingValue) {
            targetScope[targetKey] = incomingValue;
            // Ensure the AngularJS digest cycle runs to update the view.
            if (!targetScope.$$phase) { // Check if a digest cycle is already in progress.
                try {
                    targetScope.$apply();
                } catch (e) {
                    console.error("Error during $apply in bindToScopeProperty:", e);
                }
            }
        });

        // Register a cleanup handler for when the AngularJS scope is destroyed.
        // This ensures that the observable subscription is properly disposed of.
        targetScope.$on('$destroy', function (destroyEvent) {
            // Verify that the destruction event originates from or targets the current scope.
            // This helps prevent accidental disposal if a parent scope is destroyed.
            if (destroyEvent.targetScope === targetScope) {
                console.debug(`Disposing observable subscription for property '${targetKey}' on scope ${targetScope.$id}.`);
                activeSubscription.unsubscribe(); // Use standard RxJS unsubscribe.
            } else {
                console.debug(`Ignoring $destroy event for scope ${targetScope.$id} as it's not the target scope.`);
            }
        });
    };

})();