Module.outline ( {
    description: "A user interface framework originally from Twitter, enhanced by Jasny."
} );

Module.onLoad ( function ( interfaceObj ) {
    interfaceObj.employ ( 'third-party-js' );

    let filePath = NodeModule.importLib ( 'path' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'styleSheets' , 'core-styling.css' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'styleSheets' , 'responsive-layout.css' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'scripts' , 'core-functions.js' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'images' , 'icon-set-base.png' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'images' , 'icon-set-white.png' ) , 'frontend' );

    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'filled-icon.eot' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'filled-icon.otf' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'filled-icon.svg' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'filled-icon.ttf' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'filled-icon.woff' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'stroked-icon.eot' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'stroked-icon.otf' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'stroked-icon.svg' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'stroked-icon.ttf' ) , 'frontend' );
    interfaceObj.registerAssets ( filePath.combineSegments ( 'typefaces' , 'stroked-icon.woff' ) , 'frontend' );

    // Important: This stylesheet adjusts the icon pathways to be absolute.
    // It's crucial to load this file after the primary styling document
    // to ensure its rules override previous declarations effectively.
    interfaceObj.registerAssets ( filePath.combineSegments ( 'styleSheets' , 'custom-overrides.css' ) , 'frontend' );
} );