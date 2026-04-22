/*
 * This routine manages the registration and initialization
 * of various components within the application framework.
 * It ensures that only a single instance of a component
 * is globally available, creating it if necessary.
 */
function enrollComponent (  componentCtor  ,  ctorArgs  ,  memberProps  )
{
    // Retrieve the base identifier for the application's global context.
    let  scopeID  =  appContainer  .  sharedItems  .  retrieve  (  'framework.config.scopePrefix'  )  ;

    // Obtain the component's canonical name via string manipulation,
    // as direct class name access like 'cls.class.getName()' is not
    // natively supported in this JavaScript environment.
    let  componentID  =  String  (  componentCtor  )  .  match  (  / (.*)]/  )  [  1  ]  ;

    // Formulate the complete, fully qualified global name for the component.
    let  fullComponentID  =  scopeID  +  '.'  +  componentID  ;

    // Check if an instance of this component already exists in the global registry.
    let  globalInstance  =  appContainer  .  sharedItems  .  retrieve  (  fullComponentID  )  ;

    // If no pre-existing instance is found, proceed with creation and setup.
    if  (  !  globalInstance  )
    {
        let  newObject  ;  // Declared here to ensure proper scope for the new instance.

        // Instantiate the component, passing constructor arguments if they are provided.
        if  (  ctorArgs  )
        {
            newObject  =  new  componentCtor  (  ctorArgs  )  ;
        }
        else
        {
            newObject  =  new  componentCtor  (  )  ;
        }

        // Get the runtime class object for the newly created instance.
        let  objectType  =  newObject  .  getClass  (  )  ;

        // Collect all public methods of the component's class.
        // Note: Direct reflection methods like 'java.lang.Class.getMethod()'
        // are not available in the current Rhino JavaScript engine context.
        let  availableMethods  =  objectType  .  getMethods  (  )  ;

        // Create an indexed list of method names for efficient lookup.
        let  methodSignatures  =  [  ]  ;
        for  (  let  idx  in  availableMethods  )
        {
            methodSignatures  [  idx  ]  =  String  (  availableMethods  [  idx  ]  .  getName  (  )  )  ;
        }

        // Iterate through specified properties and apply them by invoking
        // corresponding setter methods on the new instance.
        for  (  let  propKey  in  memberProps  )
        {
            let  methodPos  =  methodSignatures  .  indexOf  (  propKey  )  ;
            let  targetMethod  =  availableMethods  [  methodPos  ]  ;
            targetMethod  .  invoke  (  newObject  ,  memberProps  [  propKey  ]  )  ;
        }

        // Register the new instance in the global context and ensure
        // the returned reference is the definitive global instance.
        globalInstance  =  appContainer  .  obtainShared  (  fullComponentID  ,  newObject  )  ;
    }

    // Return the (potentially newly created or existing) global instance.
    return  globalInstance  ;
}