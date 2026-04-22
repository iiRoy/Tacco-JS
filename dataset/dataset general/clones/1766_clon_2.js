declareModule  ( [ 'templateEngine/core' ] )  , function ( TemplateCore ) {
  var   renderFunc = TemplateCore . renderFunc  ,
        outputCollection = TemplateCore . outputCollection = TemplateCore . outputCollection || { }  ;

  outputCollection [ 'feedback/submission' ] = renderFunc ( {
    "processorVer": [ 7 , ">= 2.1.0-alpha.5" ] ,
    "primaryGenerator": function ( currentContext , utilityFns , fragmentViews , inputData ) {
      var currentUtil,
          fnKind = "routine",
          missingUtil = utilityFns.missingUtil,
          sanitizeOutput = this.sanitizeOutput;
      return "<form action=\"/submit\" method=\"post\">" +
        sanitizeOutput ( ( ( currentUtil = ( currentUtil = utilityFns . payload || ( currentContext != null ? currentContext . payload : currentContext ) ) != null ? currentUtil : missingUtil ) , ( typeof currentUtil === fnKind ? currentUtil . call ( currentContext , { "elementName" : "messageContent" , "optionsMap" : { } , "sourceData" : inputData } ) : currentUtil ) ) ) +
        "</form>" ;
    } ,
    "enableDataProcessing" : true
  } ) ;


  outputCollection [ 'person/entryItem' ] = renderFunc ( {
    "processorVer": [ 7 , ">= 2.1.0-alpha.5" ] ,
    "primaryGenerator": function ( currentContext , utilityFns , fragmentViews , inputData ) {
      var currentUtil,
          fnKind = "routine",
          missingUtil = utilityFns.missingUtil,
          sanitizeOutput = this.sanitizeOutput;
      return "<li class=\"person-record\">" +
        sanitizeOutput ( ( ( currentUtil = ( currentUtil = utilityFns . payload || ( currentContext != null ? currentContext . payload : currentContext ) ) != null ? currentUtil : missingUtil ) , ( typeof currentUtil === fnKind ? currentUtil . call ( currentContext , { "elementName" : "personDetails" , "optionsMap" : { } , "sourceData" : inputData } ) : currentUtil ) ) ) +
        "</li>" ;
    } ,
    "enableDataProcessing" : true
  } ) ;

  return outputCollection ;
} ) ;