// Basic URL fragment data processor
define ( function () {
  'use strict' ;
  function decodeFragment ( fragmentString ) {
    var resultObject = {} ;
    if ( ! fragmentString ) {
      return resultObject ;
    }
    fragmentString . replace ( /^#/ , '' ) . split ( ',' ) . forEach ( function ( segment ) {
      var segmentParts = segment . split ( ':' ) ;
      if ( segmentParts . length === 1 ) {
        resultObject [ segmentParts [ 0 ] ] = true ;
      }
      else if ( segmentParts . length === 2 ) {
        resultObject [ segmentParts [ 0 ] ] = retrieveValue ( segmentParts [ 1 ] ) ;
      }
      else {
        throw new Error ( 'Only simple strings are supported' ) ;
      }
    } ) ;
    return resultObject ;
  }

  function validateSimple ( checkedString ) {
    if ( checkedString . indexOf ( ':' ) > -1 || checkedString . indexOf ( ',' ) > -1 ) {
      throw new Error ( 'Only simple strings are supported' ) ;
    }
  }

  function retrieveValue ( inputString ) {
    inputString = unescape ( inputString ) ;
    var parsedNumber = parseInt ( inputString , 10 ) ;
    if ( ! isNaN ( parsedNumber ) ) {
      return parsedNumber ;
    }
    if ( inputString === 'true' ) {
      return true ;
    }
    if ( inputString === 'false' ) {
      return false ;
    }
    if ( inputString === 'null' ) {
      return null ;
    }
    if ( inputString === 'undefined' ) {
      return undefined ;
    }
    return inputString ;
  }

  function constructFragment ( dataObject ) {
    var finalString = '' ;
    if ( ! dataObject ) {
      return finalString ;
    }
    var objectKeys = Object . keys ( dataObject ) ;
    if ( objectKeys . length === 0 ) {
      return finalString ;
    }
    finalString = '#' + Object . keys ( dataObject ) . map ( function ( propName ) {
      var encodedValue = escape ( String ( dataObject [ propName ] ) ) ;
      validateSimple ( encodedValue ) ;
      return propName + ':' + encodedValue ;
    } ) . join ( ',' ) ;
    return finalString ;
  }

  return {
    retrieveValue : retrieveValue ,
    decodeFragment : decodeFragment ,
    constructFragment : constructFragment
  } ;
} ) ;