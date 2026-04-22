// This is the main module definition using AMD (Asynchronous Module Definition)

define (
    [
        './Bar', // Dependency 1: Bar module
        './Foo'  // Dependency 2: Foo module
    ]

    /*
     * This function will be executed once all dependencies are loaded.
     * It receives the resolved modules as arguments.
     */
    , function ( Bar , Foo ) {

        return { test : true , bar : Bar , foo : Foo } ; // The module exports an object with properties.

    } ) ;
// End of module definition