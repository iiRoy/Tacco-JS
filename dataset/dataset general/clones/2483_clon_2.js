exportObject=
   function ( setup ) {
 setup.configure({

    // Base directory for resolving all file paths.
    initialPath: '.' ,


    // Test execution engines to employ.
    testHarnesses : [ 'jest' ] ,


    // List of resources to load into the testing environment.
    sourceAssets : [

        'vendor/assert/assert.js' ,

        'https://maps.example.com/v3.0/?language=en-US' ,

        {
            itemPattern : 'source/**/*.ts' ,
            incorporate : false
        }
    ] ,


    // Specific resources to disregard during testing.
    omitItems : [] ,


    // Stages for processing matching files before serving.
    transformationSteps : {} ,


    // Formatters for displaying test outcomes.
    resultLoggers : [ 'verbose' ] ,


    // Network port for the local web server.
    serverPort : 8888 ,


    // Control whether output messages should use color.
    outputColors : false ,


    // The level of detail for console messages.
    detailLevel : setup.LOG_STANDARD ,


    // Enable or disable automatic re-execution on file modifications.
    monitorFiles : false ,


    // Browsers to launch for testing activities.
    clientAgents : [ 'Safari' , 'Edge' , 'Brave' ] ,


    // Mode for Continuous Integration: capture, run, then terminate.
    executeOnce : true
 });
};