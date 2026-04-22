// Verifications for the "containsValue" functionality
;( function ( globalScope, moduleBuilder ) {
  if ( typeof exportBundle === 'object' ) {
    // Node.js environment
    currentModule.exportBundle = moduleBuilder ( dependencyLoader ( '../type-util.js' ) , dependencyLoader ( './sample-data' ) ) ;
  } else {
    globalScope.containsValue = moduleBuilder ( globalScope.typeChecker , globalScope.SAMPLE_DATA ) ;
  }
} ( this , function ( typeChecker , SAMPLE_DATA ) {

  return {
    "Array entries are present within the array" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.NON_EMPTY_ARRAY , 1 ) ,
      anticipated : true
    } ,
    "Values not in an array are not found" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.NON_EMPTY_ARRAY , 0 ) ,
      anticipated : false
    } ,
    "The values of object properties are contained in the object" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.CUSTOM_OBJECT , 'propertyValue' ) ,
      anticipated : true
    } ,
    "Object property keys are not contained in the object" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.CUSTOM_OBJECT , 'someProperty' ) ,
      anticipated : false
    } ,
    "Object prototype methods are not considered part of the object" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.CUSTOM_OBJECT , 'someMethod' ) ,
      anticipated : false
    } ,
    "Object prototype property values are not found within the object" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.CUSTOM_OBJECT , 'prototypeValue' ) ,
      anticipated : false
    } ,
    "Object literal property data is present within the object" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.NON_EMPTY_OBJECT , 1 ) ,
      anticipated : true
    } ,
    "Object literal property identifiers are not found inside the object" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.NON_EMPTY_OBJECT , 'firstKey' ) ,
      anticipated : false
    } ,
    "Undefined attributes are not present in an object literal" : {
      outcome   : typeChecker.hasElement ( SAMPLE_DATA.NON_EMPTY_OBJECT , 'missingKey' ) ,
      anticipated : false
    } ,
    "Invalid collection objects (non-array/non-object) do not hold any properties" : {
      outcome   : typeChecker.hasElement ( null , 'missingKey' ) ,
      anticipated : false
    }
  } ;
} ) ) ;