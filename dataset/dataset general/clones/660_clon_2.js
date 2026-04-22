(function () {
    // Establish the current execution context, which could be the global object.
    var currentContext = this,
        // Determine the base object for our reactive stream library.
        // It checks if a custom provider function exists; if not, it defaults to 'ReactiveStream'
        // found within the current context.
        baseObject = (typeof SupplyAlternateReactiveBase == "undefined") ? currentContext.ReactiveStream : SupplyAlternateReactiveBase();

    // Alias the main EventStream constructor from the base object.
    var streamFactory = baseObject.EventStream;
    // Alias the method used to create new event streams.
    var streamCreator = streamFactory.GenerateStream;

    /**
     * Creates a new event stream that emits values whenever a specific property
     * on an AngularJS scope changes.
     * @param {object} ngScope - The AngularJS scope object to monitor.
     * @param {string} targetPropName - The name of the property to watch on the scope.
     * @returns {object} An EventStream that emits the property's value on change.
     */
    streamFactory.FromNgScopeProperty = function (ngScope, targetPropName) {
        // Construct a new event stream using the stream creator.
        return streamCreator(function (dataConsumer) {
            // Set up an AngularJS watch on the specified property.
            var cancelWatch = ngScope.$watch(function () {
                // Return the current value of the property being observed.
                return ngScope[targetPropName];
            },
                // This callback fires when the property's value changes.
                function () {
                    // Emit the new value to all subscribers of this event stream.
                    dataConsumer.EmitNext(ngScope[targetPropName]);
                });
            // Provide a cleanup function to be called when the stream is disposed.
            return function () {
                cancelWatch(); // Deregister the AngularJS watch.
            };
        })
            // In earlier AngularJS versions (e.g., 0.10.x), $watch always triggers an
            // immediate evaluation. We want to ignore this initial trigger
            // and only react to subsequent changes.
            .OmitInitial(1);
    };

    /**
     * Binds the values emitted by this event stream to a property on an AngularJS scope.
     * Each emitted value will update the specified scope property and trigger a digest cycle.
     * @param {object} targetScope - The AngularJS scope object to update.
     * @param {string} targetPropName - The name of the property on the scope to set.
     */
    streamFactory.prototype.BindToScopeProperty = function (targetScope, targetPropName) {
        // Subscribe to this event stream to receive incoming values.
        var subscriptionHandle = this.ObserveStream(function (incomingValue) {
            // Update the scope property with the latest value from the stream.
            targetScope[targetPropName] = incomingValue;
            // Manually trigger an AngularJS digest cycle to reflect the changes in the view.
            targetScope.$apply();
        });

        // Listen for the AngularJS scope's destroy event to clean up resources.
        targetScope.$on('$destroy', function (destructionEvent) {
            // It's crucial to ensure that we only dispose of our subscription
            // if the scope being destroyed is indeed the one we are bound to.

            // Consideration: What if a parent scope is destroyed, implicitly destroying
            // this scope, but without explicitly calling '$destroy' on it?
            // Or what if a child scope's destruction event bubbles up?
            // This check ensures we act only when the event originates from our target scope.
            if (destructionEvent.targetScope === targetScope) {
                // Release the resources held by our subscription to prevent memory leaks.
                subscriptionHandle.ReleaseResources();
            }
        });
    };

})();