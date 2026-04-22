( function( )
{
    // Define the global object, typically 'window' in browsers or 'global' in Node.js environments.
    var  global  =  this,

        // Determine the root Rx object. If 'ProvideCustomRxRootObject' is not defined,
        // use 'global.Rx'; otherwise, invoke 'ProvideCustomRxRootObject' to get the root.
        root = (
                    typeof  ProvideCustomRxRootObject  ==  "undefined"
               )
               ?
               global.Rx
               :
               ProvideCustomRxRootObject( )
               ;


    // Extract the Observable constructor from the determined root object.
    var  observable  =  root.Observable
    ;

    // Get the 'Create' method from the Observable constructor for creating new observables.
    var  observableCreate  =  observable.Create
    ;


    /**
     * @function FromAngularScope
     * @description Creates an observable from an AngularJS scope property.
     *              It watches the specified property and emits its value whenever it changes.
     * @param {Object} angularScope - The AngularJS scope object.
     * @param {string} propertyName - The name of the property to watch on the scope.
     * @returns {Observable} An observable that emits the property's value on change.
     */
    observable.FromAngularScope  =  function
    (
        angularScope,
        propertyName
    )
    {
        // Use observableCreate to build the new observable.
        return  observableCreate
        (
            function
            (
                observer
            )
            {
                // Set up an AngularJS watch on the specified property.
                var  unwatch  =  angularScope.$watch
                (
                    // Watch expression: returns the value of the specified property.
                    function
                    (
                    )
                    {
                        return  angularScope[ propertyName ]
                        ;
                    },

                    // Listener function: called when the watched property changes.
                    function
                    (
                    )
                    {
                        // Emit the new value through the observer.
                        observer.OnNext( angularScope[ propertyName ] )
                        ;
                    }
                )
                ;

                // Return a disposal function that will unwatch the property when the observable is unsubscribed.
                return  function
                (
                )
                {
                    unwatch( )
                    ;
                }
                ;
            }
        )
        // Skip the initial evaluation of the $watch function.
        // In AngularJS versions like 0.10.x, $watch immediately evaluates once.
        // This ensures the observable only emits on *actual* changes after the first run.
        .Skip( 1 )
        ;
    }
    ;


    /**
     * @method ToOutputProperty
     * @description Subscribes an observable to an AngularJS scope property, updating it with emitted values.
     *              Ensures proper disposal when the scope is destroyed.
     * @param {Object} scope - The AngularJS scope object where the property resides.
     * @param {string} propertyName - The name of the property to update on the scope.
     */
    observable.prototype.ToOutputProperty  =  function
    (
        scope,
        propertyName
    )
    {
        // Subscribe to the observable and update the scope property with each emitted data item.
        var  disposable  =  this.Subscribe
        (
            function
            (
                data
            )
            {
                scope[ propertyName ]  =  data
                ;
                // Trigger a digest cycle to ensure changes are reflected in the UI.
                scope.$apply( )
                ;
            }
        )
        ;


        // Register a listener for the '$destroy' event on the scope.
        scope.$on
        (
            '$destroy',
            function
            (
                event
            )
            {
                // It is crucial to ensure that we only dispose of our observable subscription
                // when the '$destroy' event specifically pertains to *our* scope.
                // This prevents unintended disposal if a child or parent scope is destroyed.

                // TODO: Further investigation might be needed to fully guarantee this behavior.
                // For instance, what happens if a child scope is destroyed; does it affect our
                // observable? Or if a higher-level scope is destroyed (implicitly destroying ours),
                // will '$destroy' still be called on *our* specific scope, or will it be bypassed?

                if
                (
                    event.targetScope  ===  scope
                )
                {
                    // If the event's target scope matches our current scope, dispose the subscription.
                    disposable.Dispose( )
                    ;
                }
            }
        )
        ;
    }
    ;

}
)( )
;