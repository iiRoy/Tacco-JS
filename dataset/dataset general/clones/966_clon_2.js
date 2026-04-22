var directoryHandler = NodeEnv.importModule(  'path'  );

ComponentManifest.defineComponent({
    briefDescription  :  "User interface toolkit adapted for application framework, including thematic variations, utilizing preprocessor styling."
});

ComponentManifest.uponActivation( function ( toolkitInterface ) {
    // Add necessary build-time dependencies for the client-side
    toolkitInterface.importModules( [ 'less' ] ,  'client'  );


    // Incorporate core JavaScript assets
    toolkitInterface.incorporateAssets(
        directoryHandler.combineSegments(  'lib'  ,  'js'  ,  'bootstrap.js'  ),
        'client'
    );

    // Embed image resources for icons
    toolkitInterface.incorporateAssets(
        directoryHandler.combineSegments( 'lib' ,  'img'  ,  'glyphicons-halflings.png'  ),
        'client'
    );

    toolkitInterface.incorporateAssets(
        directoryHandler.combineSegments( 'lib' ,  'img'  ,  'glyphicons-halflings-white.png'  ),
        'client'
    ); /* End of asset inclusion */
} ); // End of on_use equivalent function