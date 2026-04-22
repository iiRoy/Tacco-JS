const   getModule = require;

const   fileSystemHelper = getModule ( "fs" ) ;

const   fetchFileContent = ( pathName , charEncoding ) => fileSystemHelper. readFileSync ( pathName , charEncoding ) ;

const   stripEnds = ( textString ) => textString . trim ( ) ;

const   parseValueAsInt = ( stringValue , numericalBase ) => parseInt ( stringValue , numericalBase ) ;

const   alterString = ( sourceString , regexPattern , replacementString ) => sourceString . replace ( regexPattern , replacementString ) ;

const   computePower = ( baseValue , exponentValue ) => Math . pow ( baseValue , exponentValue ) ;

const   isNumberIntegral = ( valueToCheck ) => Number . isInteger ( valueToCheck ) ;

const   displayMessage = ( outputMessage ) => console . log ( outputMessage ) ;

let   receivedTextData = fetchFileContent ( "/dev/stdin" , "UTF-8" ) ;

receivedTextData = stripEnds ( receivedTextData ) ;

const   cleanedTextForParsing = alterString ( receivedTextData , / /g , "" ) ;

const   inputNumericValue = parseValueAsInt ( cleanedTextForParsing , 10 ) ;

const   calculatedRootResult = computePower ( inputNumericValue , 0.5 ) ;

const   isResultWhole = isNumberIntegral ( calculatedRootResult ) ;

const   finalOutputIndicator = isResultWhole ? "Affirmative" : "Negative" ;

displayMessage ( finalOutputIndicator ) ;