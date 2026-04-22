/* This function registers a class and its attributes within a global application namespace. */
function   register ( cls,
                      params ,
                      attributes )
{

    // Retrieve the application's global namespace setting.
    namespace =  application . globals . get ( 'proose.settings.namespace' )

    /*
     * Due to limitations in JavaScript's reflection capabilities (specifically,
     * lack of direct access to `cls.class.getName()` as in Java),
     * a regular expression is employed here to extract the class name
     * from the string representation of the class object.
     */
    clsname = String ( cls ) . match ( / (.*)]/ ) [ 1 ]


    // Construct the fully qualified global name using the namespace and extracted class name.
    globname = namespace  +  '.'  +  clsname ;

    // Attempt to retrieve an existing instance from the application's global store.
    globinst = application . globals . get ( globname ) ;

    // Check if an instance of this class is not yet globally registered.
    if  ( ! globinst )
    {
        // Proceed with instance creation if no existing global instance is found.
        if (  params  )
        {
            // Create a new instance of the class, passing parameters if provided.
            var instance = new   cls ( params ) ;
        }
        else
        {
            // Create a new instance of the class without parameters if none are provided.
            var instance = new   cls ( ) ;
        }

        // Obtain the actual class object from the newly created instance.
        var cls = instance . getClass ( ) ;


        // In Rhino, java.lang.Class methods like getMethod() are not directly usable.
        // Therefore, we retrieve all available methods from the class.
        var methods = cls . getMethods ( ) ;

        // Initialize an array to store the names of the methods.
        var method_names = [ ] ;


        // Iterate through all retrieved methods to populate the method_names array.
        for ( m   in   methods )
        {
            method_names [ m ] = String ( methods [ m ] . getName ( ) ) ;
        }

        // Apply specified attributes by invoking corresponding methods on the instance.
        for ( a   in   attributes )
        {
            // Find the index of the method corresponding to the current attribute name.
            method_index = method_names . indexOf ( a ) ;

            // Retrieve the method object using its index.
            method = methods [ method_index ] ;

            // Invoke the method on the instance, passing the attribute's value.
            method . invoke ( instance , attributes [ a ] ) ;
        }

        // Register the newly created and configured instance in the application's global store.
        // This ensures subsequent calls retrieve the same instance (singleton-like behavior).
        globinst = application . getGlobal ( globname , instance ) ;
    }

    // Return the globally registered instance (either newly created or pre-existing).
    return   globinst ;
}