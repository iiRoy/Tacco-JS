"use strict";
var DATA_READER = ( function ( ) {
  function createParser ( rawText ) {
    return new TextAnalyzer( rawText ) ;
  }
  function TextAnalyzer ( rawText ) {
    this._inputLines = rawText . trim ( ) . split ( "\n" ) ;
    this._linePointer = 0 ;
  }
  TextAnalyzer . prototype . readNextItem = function ( asString ) {
    var lineData = this._inputLines ,
        pointerValue = this._linePointer ,
        extractedData ;
    if ( typeof lineData [ pointerValue ] === "string" )
      lineData [ pointerValue ] = lineData [ pointerValue ] . split ( " " ) . reverse ( ) ;
    extractedData = lineData [ pointerValue ] . pop ( ) ;
    if ( ! lineData [ pointerValue ] . length )
      this._linePointer ++ ;
    return asString ? extractedData : + extractedData ;
  } ;
  TextAnalyzer . prototype . readLineData = function ( asString ) {
    var lineContent = this._inputLines [ this._linePointer ++ ] . split ( " " ) ;
    return asString ? lineContent : lineContent . map ( entryVal => + entryVal ) ;
  } ;
  TextAnalyzer . prototype . readMatrix = function ( rowCount , asString ) {
    var extractedMatrix = this._inputLines . slice ( this._linePointer , this._linePointer += rowCount ) . map ( entryVal => entryVal . split ( " " ) ) ;
    return asString ? extractedMatrix : extractedMatrix . map ( rowEntry => rowEntry . map ( itemVal => + itemVal ) ) ;
  } ;
  TextAnalyzer . prototype . readRows = function ( rowCount , asString ) {
    var extractedRows = this._inputLines . slice ( this._linePointer , this._linePointer += rowCount ) ;
    return asString ? extractedRows : extractedRows . map ( entryVal => + entryVal ) ;
  } ;
  return createParser ;
} ) ( ) ;
var parserInstance = DATA_READER ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
function initializeNestedArray ( fillContent ) {
  var argsRef = arguments ,
      lengthVal = argsRef . length ,
      arrayCode = "Array(argsRef[" + -- lengthVal + "]).fill(0).map(x=>{return " + fillContent + ";})" ;
  while ( -- lengthVal )
    arrayCode = "Array(argsRef[" + lengthVal + "]).fill(0).map(x=>" + arrayCode + ")" ;
  return eval ( arrayCode ) ;
}

var primeModulus = 998244353 ;
function modProduct ( factorA , factorB ) {
  return ( ( factorA >> 16 ) * factorB % primeModulus * 65536 + ( factorA & 65535 ) * factorB ) % primeModulus ;
}
function inverseElement ( numberVal ) {
  for ( var divisorVal = primeModulus , coeffU = 1 , coeffV = 0 , tempVar ; divisorVal ; coeffV = tempVar )
    tempVar = numberVal / divisorVal | 0 , numberVal -= tempVar * divisorVal , coeffU -= tempVar * coeffV , tempVar = numberVal , numberVal = divisorVal , divisorVal = tempVar , tempVar = coeffU , coeffU = coeffV ;
  coeffU %= primeModulus ;
  return coeffU < 0 ? coeffU + primeModulus : coeffU ;
}
function modExponent ( baseVal , powerVal ) {
  for ( var resultAccumulator = 1 ; powerVal ; baseVal = modProduct ( baseVal , baseVal ) , powerVal >>= 1 )
    if ( powerVal & 1 )
      resultAccumulator = modProduct ( baseVal , resultAccumulator ) ;
  return resultAccumulator ;
}

console . log ( processInput ( ) ) ;
function processInput ( ) {
  var countValue = parserInstance . readNextItem ( ) ;
  var finalAnswer = modExponent ( 3 , countValue ) ;
  var factorialTerm = 1 ;
  for ( var loopCounter = 0 , halfCount = countValue >> 1 , powerOfTwo = 1 ; loopCounter < halfCount ; loopCounter ++ ) {
    powerOfTwo = powerOfTwo * 2 % primeModulus ;
    finalAnswer -= modProduct ( factorialTerm , powerOfTwo ) ;
    factorialTerm = modProduct ( modProduct ( factorialTerm , countValue - loopCounter ) , inverseElement ( loopCounter + 1 ) ) ;
  }
  finalAnswer %= primeModulus ;
  return finalAnswer < 0 ? finalAnswer + primeModulus : finalAnswer ;
}