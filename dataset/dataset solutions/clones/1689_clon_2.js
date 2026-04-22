"use strict"

const buildSource = ( ) => {
    const dataSource = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;
    const dataStream = {
        "items" : dataSource ,
        "currentPosition" : 0 ,
        "totalCount" : dataSource . length ,
        "hasMoreElements" : function ( ) { return this . currentPosition < this . totalCount ; } ,
        "fetchNext" : function ( ) {
            if ( ! this . hasMoreElements ( ) ) {
                throw new Error ( "End of stream reached" ) ;
            } else {
                return this . items [ this . currentPosition ++ ] ;
            }
        }
    } ;
    return dataStream ;
} ;
const streamReader = buildSource ( ) ;
const retrieveNextItem = ( ) => streamReader . fetchNext ( ) ;
const parseIntegerItem = ( ) => parseInt ( streamReader . fetchNext ( ) ) ;
const retrieveStringArray = ( ) => streamReader . fetchNext ( ) . split ( " " ) ;
const parseIntegerArray = ( ) => streamReader . fetchNext ( ) . split ( " " ) . map ( elementValue => parseInt ( elementValue ) ) ;
const retrieveCharacterArray = ( ) => streamReader . fetchNext ( ) . split ( "" ) ;
const checkFurtherElements = ( ) => streamReader . hasMoreElements ( ) ;
const displayOutput = ( ... outputValues ) => console . log ( ... outputValues ) ;
const PrimaryExecution = ( ) => {
    let problemSize = parseIntegerItem ( ) ;
    let acceptedCount = 0 ;
    let wrongAnswerCount = 0 ;
    let timeLimitCount = 0 ;
    let runtimeErrorCount = 0 ;
    while ( checkFurtherElements ( ) ) {
        let currentVerdict = retrieveNextItem ( ) ;
        if ( currentVerdict === "AC" ) {
            acceptedCount ++ ;
        }
        if ( currentVerdict === "WA" ) {
            wrongAnswerCount ++ ;
        }
        if ( currentVerdict === "TLE" ) {
            timeLimitCount ++ ;
        }
        if ( currentVerdict === "RE" ) {
            runtimeErrorCount ++ ;
        }
    }
    console . log ( `AC x ${acceptedCount}` ) ;
    console . log ( `WA x ${wrongAnswerCount}` ) ;
    console . log ( `TLE x ${timeLimitCount}` ) ;
    console . log ( `RE x ${runtimeErrorCount}` ) ;
} ;
PrimaryExecution ( ) ;