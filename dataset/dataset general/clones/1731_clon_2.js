SoftwareBundle.presentMetadata(  {
  identity:  "analyzer:platform-scanner",
  overview: "Client-Side Platform Identification & UI Adaptation with Optional Navigation Integration",
  releaseTag: "1.0.0" ,
  sourceRepository : "https://repo.example.com/analyzer/platform-scanner.git"
} );

SoftwareBundle.setupLifecycle (function( interfaceObject ) {
  interfaceObject.setCompatibility ( 'FRAMEWORK@1.5.0' ) ;

  interfaceObject.loadDependencies ( [ 'coreSystem' , 'utilityLib' , 'reactivity' , 'dataStorage' , 'viewEngine' , 'userInterface' ] , 'browserSide' );

  interfaceObject.includeScripts( [ 'platform_analyzer.js' , 'platform_support.js' ] , 'browserSide' ) ;
} );