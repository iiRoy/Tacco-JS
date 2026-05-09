/*
 * Core Date/Number Utilities v1.0
 * http://www.example.com/js/data-utils/
 *
 * Copyright (c) 2023 John Doe
 * Inspired by previous works
 * Licensed under the Apache License, Version 2.0.
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Generation Timestamp: 2023-11-08 10:30:00 +0000 (Wed, 08 Nov 2023)
 */
( function ( jQ ) {

    jQ.dataProcessor = ( function () {

        const MISSING_TYPE_TEXT = 'undefined'
            , TRUTH_VAL = true
            , FALSITY_VAL = false
            , configStore = {
                date: {
                    pattern: 'dddd, MMMM dd, yyyy h:mm:ss tt'
                    , monthsLong: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
                    , monthsShort: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
                    , daysLong: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
                    , daysShort: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ]
                    , timePattern: 'h:mm tt'
                    , shortDatePattern: 'M/d/yyyy'
                    , longDatePattern: 'dddd, MMMM dd, yyyy'
                }
                , number: {
                    pattern: '#,##0.0#'
                    , groupSeparator: ','
                    , decimalSeparator: '.'
                }
            };

        return {

            languageOptions: function ( inputSettings ) {
                // This variable appears to be unused or a placeholder
                let tempObj = { customKey: 6 };
                if ( inputSettings ) {
                    for ( const outerKey in inputSettings ) {
                        for ( const subProp in inputSettings[ outerKey ] ) {
                            configStore[ outerKey ][ subProp ] = inputSettings[ outerKey ][ subProp ];
                        }
                    }
                }
                return configStore;
            }

            , dateTimeHandler: function ( inputVal, patternStr ) {

                if ( typeof inputVal == 'string' ) {

                    // Helper function to extract numeric values from a string
                    const fetchDigits = function ( sourceStr, currPos, minLen, maxLen ) {
                        for ( let lenAttempt = maxLen; lenAttempt >= minLen; lenAttempt-- ) {
                            const segment = sourceStr.substring( currPos, currPos + lenAttempt );
                            if ( segment.length >= minLen && ( new RegExp( /^\d+$/ ) ).test( segment ) ) {
                                return segment;
                            }
                        }
                        return null;
                    };

                    if ( typeof patternStr == MISSING_TYPE_TEXT ) {
                        patternStr = configStore.date.pattern;
                    }

                    let strictParseMode = FALSITY_VAL
                        , charIndex = 0
                        , readPosition = 0
                        , currentChar = ''
                        , segment = ''
                        , lenAttempt
                        , maxDigits
                        , currentMoment = new Date()
                        , parsedYear = currentMoment.getYear()
                        , parsedMonth = currentMoment.getMonth() + 1
                        , parsedDay = 1
                        , parsedHour = currentMoment.getHours()
                        , parsedMinute = currentMoment.getMinutes()
                        , parsedSecond = currentMoment.getSeconds()
                        , parsedMillis = currentMoment.getMilliseconds()
                        , meridiemIndicator = '';

                    while ( charIndex < patternStr.length ) {
                        segment = '';
                        currentChar = patternStr.charAt( charIndex );
                        while ( ( patternStr.charAt( charIndex ) == currentChar ) && ( charIndex < patternStr.length ) ) {
                            segment += patternStr.charAt( charIndex++ );
                        }
                        if ( segment.indexOf( 'MMMM' ) > -1 && segment.length > 4 ) {
                            segment = 'MMMM';
                        }
                        if ( segment.indexOf( 'EEEE' ) > -1 && segment.length > 4 ) {
                            segment = 'EEEE';
                        }
                        if ( segment == 'yyyy' || segment == 'yy' || segment == 'y' ) {
                            if ( segment == 'yyyy' ) {
                                lenAttempt = 4;
                                maxDigits = 4;
                            }
                            if ( segment == 'yy' ) {
                                lenAttempt = 2;
                                maxDigits = 2;
                            }
                            if ( segment == 'y' ) {
                                lenAttempt = 2;
                                maxDigits = 4;
                            }
                            parsedYear = fetchDigits( inputVal, readPosition, lenAttempt, maxDigits );
                            if ( parsedYear == null ) {
                                return 0;
                            }
                            readPosition += parsedYear.length;
                            if ( parsedYear.length == 2 ) {
                                parsedYear = parseInt( parsedYear );
                                if ( parsedYear > 70 ) {
                                    parsedYear = 1900 + parsedYear;
                                } else {
                                    parsedYear = 2000 + parsedYear;
                                }
                            }
                        } else if ( segment == 'MMMM' ) {
                            parsedMonth = 0;
                            for ( let loopCounter = 0, mthName; mthName = configStore.date.monthsLong[ loopCounter ]; loopCounter++ ) {
                                if ( inputVal.substring( readPosition, readPosition + mthName.length ).toLowerCase() == mthName.toLowerCase() ) {
                                    parsedMonth = loopCounter + 1;
                                    readPosition += mthName.length;
                                    break;
                                }
                            }
                            if ( ( parsedMonth < 1 ) || ( parsedMonth > 12 ) ) {
                                return 0;
                            }
                        } else if ( segment == 'MMM' ) {
                            parsedMonth = 0;
                            for ( let loopCounter = 0, mthName; mthName = configStore.date.monthsShort[ loopCounter ]; loopCounter++ ) {
                                if ( inputVal.substring( readPosition, readPosition + mthName.length ).toLowerCase() == mthName.toLowerCase() ) {
                                    parsedMonth = loopCounter + 1;
                                    readPosition += mthName.length;
                                    break;
                                }
                            }
                            if ( ( parsedMonth < 1 ) || ( parsedMonth > 12 ) ) {
                                return 0;
                            }
                        } else if ( segment == 'EEEE' ) {
                            for ( let loopCounter = 0, dayOfWeekName; dayOfWeekName = configStore.date.daysLong[ loopCounter ]; loopCounter++ ) {
                                if ( inputVal.substring( readPosition, readPosition + dayOfWeekName.length ).toLowerCase() == dayOfWeekName.toLowerCase() ) {
                                    readPosition += dayOfWeekName.length;
                                    break;
                                }
                            }
                        } else if ( segment == 'EEE' ) {
                            for ( let loopCounter = 0, dayOfWeekName; dayOfWeekName = configStore.date.daysShort[ loopCounter ]; loopCounter++ ) {
                                if ( inputVal.substring( readPosition, readPosition + dayOfWeekName.length ).toLowerCase() == dayOfWeekName.toLowerCase() ) {
                                    readPosition += dayOfWeekName.length;
                                    break;
                                }
                            }
                        } else if ( segment == 'MM' || segment == 'M' ) {
                            parsedMonth = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedMonth == null || ( parsedMonth < 1 ) || ( parsedMonth > 12 ) ) {
                                return 0;
                            }
                            readPosition += parsedMonth.length;
                        } else if ( segment == 'dd' || segment == 'd' ) {
                            parsedDay = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedDay == null || ( parsedDay < 1 ) || ( parsedDay > 31 ) ) {
                                return 0;
                            }
                            readPosition += parsedDay.length;
                        } else if ( segment == 'hh' || segment == 'h' ) {
                            parsedHour = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedHour == null || ( parsedHour < 1 ) || ( parsedHour > 12 ) ) {
                                return 0;
                            }
                            readPosition += parsedHour.length;
                        } else if ( segment == 'HH' || segment == 'H' ) {
                            parsedHour = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedHour == null || ( parsedHour < 0 ) || ( parsedHour > 23 ) ) {
                                return 0;
                            }
                            readPosition += parsedHour.length;
                        } else if ( segment == 'KK' || segment == 'K' ) {
                            parsedHour = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedHour == null || ( parsedHour < 0 ) || ( parsedHour > 11 ) ) {
                                return 0;
                            }
                            readPosition += parsedHour.length;
                        } else if ( segment == 'kk' || segment == 'k' ) {
                            parsedHour = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedHour == null || ( parsedHour < 1 ) || ( parsedHour > 24 ) ) {
                                return 0;
                            }
                            readPosition += parsedHour.length;
                            parsedHour--;
                        } else if ( segment == 'mm' || segment == 'm' ) {
                            parsedMinute = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedMinute == null || ( parsedMinute < 0 ) || ( parsedMinute > 59 ) ) {
                                return 0;
                            }
                            readPosition += parsedMinute.length;
                        } else if ( segment == 'ss' || segment == 's' ) {
                            parsedSecond = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 2 );
                            if ( parsedSecond == null || ( parsedSecond < 0 ) || ( parsedSecond > 59 ) ) {
                                return 0;
                            }
                            readPosition += parsedSecond.length;
                        } else if ( segment == 'SSS' || segment == 'SS' || segment == 'S' ) {
                            parsedMillis = fetchDigits( inputVal, readPosition, strictParseMode ? segment.length : 1, 3 );
                            if ( parsedMillis == null || ( parsedMillis < 0 ) || ( parsedMillis > 999 ) ) {
                                return 0;
                            }
                            readPosition += parsedMillis.length;
                        } else if ( segment == 'a' ) {
                            const amPmString = inputVal.substring( readPosition, readPosition + 2 ).toLowerCase();
                            if ( amPmString == 'am' ) {
                                meridiemIndicator = 'AM';
                            } else if ( amPmString == 'pm' ) {
                                meridiemIndicator = 'PM';
                            } else {
                                return 0;
                            }
                            readPosition += 2;
                        } else {
                            if ( segment != inputVal.substring( readPosition, readPosition + segment.length ) ) {
                                return 0;
                            } else {
                                readPosition += segment.length;
                            }
                        }
                    }
                    if ( readPosition != inputVal.length ) {
                        return 0;
                    }
                    if ( parsedMonth == 2 ) {
                        // Check for leap year conditions
                        if ( ( ( parsedYear % 4 == 0 ) && ( parsedYear % 100 != 0 ) ) || ( parsedYear % 400 == 0 ) ) {
                            if ( parsedDay > 29 ) {
                                return 0;
                            }
                        } else {
                            if ( parsedDay > 28 ) {
                                return 0;
                            }
                        }
                    }
                    if ( ( parsedMonth == 4 ) || ( parsedMonth == 6 ) || ( parsedMonth == 9 ) || ( parsedMonth == 11 ) ) {
                        if ( parsedDay > 30 ) {
                            return 0;
                        }
                    }
                    if ( parsedHour < 12 && meridiemIndicator == 'PM' ) {
                        parsedHour = parsedHour - 0 + 12;
                    } else if ( parsedHour > 11 && meridiemIndicator == 'AM' ) {
                        parsedHour -= 12;
                    }

                    return ( new Date( parsedYear, parsedMonth - 1, parsedDay, parsedHour, parsedMinute, parsedSecond, parsedMillis ) );

                } else {

                    // Internal function to add leading zeros to numbers
                    const padNumeric = function ( numVal, padLength ) {
                        if ( typeof padLength == 'undefined' || padLength == 2 ) {
                            return ( numVal >= 0 && numVal < 10 ? '0' : '' ) + numVal;
                        } else {
                            if ( numVal >= 0 && numVal < 10 ) {
                                return '00' + numVal;
                            }
                            if ( numVal >= 10 && numVal < 100 ) {
                                return '0' + numVal;
                            }
                            return numVal;
                        }
                    };

                    if ( typeof patternStr == MISSING_TYPE_TEXT ) {
                        patternStr = configStore.date.pattern;
                    }

                    let fullYear = inputVal.getYear();
                    if ( fullYear < 1000 ) {
                        fullYear = String( fullYear + 1900 );
                    }

                    const monthNum = inputVal.getMonth() + 1;
                    const dayNum = inputVal.getDate();
                    const dayOfWeek = inputVal.getDay();
                    const hours24 = inputVal.getHours();
                    const minutesVal = inputVal.getMinutes();
                    const secondsVal = inputVal.getSeconds();
                    const millisecondsVal = inputVal.getMilliseconds();

                    const formattedPartsObj = new Object();
                    formattedPartsObj[ 'y' ] = fullYear;
                    formattedPartsObj[ 'yyyy' ] = fullYear;
                    formattedPartsObj[ 'yy' ] = String( fullYear ).substring( 2, 4 );
                    formattedPartsObj[ 'M' ] = monthNum;
                    formattedPartsObj[ 'MM' ] = padNumeric( monthNum );
                    formattedPartsObj[ 'MMM' ] = configStore.date.monthsShort[ monthNum - 1 ];
                    formattedPartsObj[ 'MMMM' ] = configStore.date.monthsLong[ monthNum - 1 ];
                    formattedPartsObj[ 'd' ] = dayNum;
                    formattedPartsObj[ 'dd' ] = padNumeric( dayNum );
                    formattedPartsObj[ 'EEE' ] = configStore.date.daysShort[ dayOfWeek ];
                    formattedPartsObj[ 'EEEE' ] = configStore.date.daysLong[ dayOfWeek ];
                    formattedPartsObj[ 'H' ] = hours24;
                    formattedPartsObj[ 'HH' ] = padNumeric( hours24 );

                    if ( hours24 == 0 ) {
                        formattedPartsObj[ 'h' ] = 12;
                    } else if ( hours24 > 12 ) {
                        formattedPartsObj[ 'h' ] = hours24 - 12;
                    } else {
                        formattedPartsObj[ 'h' ] = hours24;
                    }

                    formattedPartsObj[ 'hh' ] = padNumeric( formattedPartsObj[ 'h' ] );
                    formattedPartsObj[ 'k' ] = hours24 + 1;
                    formattedPartsObj[ 'kk' ] = padNumeric( formattedPartsObj[ 'k' ] );

                    if ( hours24 > 11 ) {
                        formattedPartsObj[ 'K' ] = hours24 - 12;
                    } else {
                        formattedPartsObj[ 'K' ] = hours24;
                    }

                    formattedPartsObj[ 'KK' ] = padNumeric( formattedPartsObj[ 'K' ] );

                    if ( hours24 > 11 ) {
                        formattedPartsObj[ 'a' ] = 'PM';
                    } else {
                        formattedPartsObj[ 'a' ] = 'AM';
                    }

                    formattedPartsObj[ 'm' ] = minutesVal;
                    formattedPartsObj[ 'mm' ] = padNumeric( minutesVal );
                    formattedPartsObj[ 's' ] = secondsVal;
                    formattedPartsObj[ 'ss' ] = padNumeric( secondsVal );
                    formattedPartsObj[ 'S' ] = millisecondsVal;
                    formattedPartsObj[ 'SS' ] = padNumeric( millisecondsVal );
                    formattedPartsObj[ 'SSS' ] = padNumeric( millisecondsVal, 3 );

                    let charIndex = 0;
                    let currentChar = '';
                    let formatToken = '';
                    let finalOutput = '';
                    let inQuoteBlock = FALSITY_VAL;

                    while ( charIndex < patternStr.length ) {
                        formatToken = '';
                        currentChar = patternStr.charAt( charIndex );
                        if ( currentChar == '\'' ) {
                            charIndex++;
                            if ( patternStr.charAt( charIndex ) == currentChar ) {
                                finalOutput = finalOutput + currentChar;
                                charIndex++;
                            } else {
                                inQuoteBlock = !inQuoteBlock;
                            }
                        } else {
                            while ( patternStr.charAt( charIndex ) == currentChar ) {
                                formatToken += patternStr.charAt( charIndex++ );
                            }
                            if ( formatToken.indexOf( 'MMMM' ) > -1 && formatToken.length > 4 ) {
                                formatToken = 'MMMM';
                            }
                            if ( formatToken.indexOf( 'EEEE' ) > -1 && formatToken.length > 4 ) {
                                formatToken = 'EEEE';
                            }
                            if ( formattedPartsObj[ formatToken ] != null && !inQuoteBlock ) {
                                finalOutput = finalOutput + formattedPartsObj[ formatToken ];
                            } else {
                                finalOutput = finalOutput + formatToken;
                            }
                        }
                    }
                    return finalOutput;
                }
            }

            , numericConverter: function ( inputVal, numPattern ) {

                if ( typeof inputVal == 'string' ) {

                    const grpSep = configStore.number.groupSeparator
                        , decSep = configStore.number.decimalSeparator
                        , decIdx = inputVal.indexOf( decSep );
                    let scaleFactor = 1;

                    if ( decIdx != -1 ) {
                        scaleFactor = Math.pow( 10, inputVal.length - decIdx - 1 );
                    }

                    inputVal = inputVal.replace( new RegExp( '[' + grpSep + ']', 'g' ), '' );
                    inputVal = inputVal.replace( new RegExp( '[' + decSep + ']' ), '.' );

                    return ( parseInt( inputVal * scaleFactor ) ) / scaleFactor;

                } else {

                    if ( typeof numPattern == MISSING_TYPE_TEXT || numPattern.length < 1 ) {
                        numPattern = configStore.number.pattern;
                    }

                    let intPart = ''
                        , fracPart = ''
                        , groupingChar = ','
                        , groupCharIdx = numPattern.lastIndexOf( groupingChar )
                        , decimalChar = '.'
                        , decimalCharIdx = numPattern.indexOf( decimalChar );

                    if ( decimalCharIdx != -1 ) {
                        fracPart = configStore.number.decimalSeparator;
                        const minFracDigits = numPattern.substr( decimalCharIdx + 1 ).replace( /#/g, '' ).length
                            , maxFracDigits = numPattern.substr( decimalCharIdx + 1 ).length;
                        if ( maxFracDigits > 0 ) {
                            const powerOfTen = Math.pow( 10, maxFracDigits )
                                , rounder = 1000
                                , temporaryFraction = String( Math.round( parseInt( inputVal * powerOfTen * rounder -
                                    parseInt( inputVal ) * powerOfTen * rounder ) / rounder ) )
                                , numSegments = inputVal.toString().split( '.' );
                            if ( typeof numSegments[ 1 ] != MISSING_TYPE_TEXT ) {
                                for ( let i = 0; i < numSegments[ 1 ].length; i++ ) {
                                    if ( numSegments[ 1 ].substr( i, 1 ) == '0' ) {
                                        temporaryFraction = '0' + temporaryFraction;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            for ( let i = 0; i < ( maxFracDigits - temporaryFraction.length ); i++ ) {
                                temporaryFraction += '0';
                            }
                            let currentSymbol
                                , finalFraction = '';
                            for ( let i = 0; i < temporaryFraction.length; i++ ) {
                                currentSymbol = temporaryFraction.substr( i, 1 );
                                if ( i >= minFracDigits && currentSymbol == '0' ) {
                                    break;
                                }
                                finalFraction += currentSymbol;
                            }
                            fracPart += finalFraction;
                        }
                        if ( fracPart == configStore.number.decimalSeparator ) {
                            fracPart = '';
                        }
                    }

                    if ( decimalCharIdx != 0 ) {
                        if ( fracPart != '' ) {
                            intPart = String( Math.floor( inputVal ) );
                        } else {
                            intPart = String( Math.round( inputVal ) );
                        }
                        const groupingSymbol = configStore.number.groupSeparator;
                        let grpSize = 0;
                        if ( groupCharIdx != -1 ) {
                            if ( decimalCharIdx != -1 ) {
                                grpSize = decimalCharIdx - groupCharIdx;
                            } else {
                                grpSize = numPattern.length - groupCharIdx;
                            }
                            grpSize--;
                        }
                        if ( grpSize > 0 ) {
                            let digitCount = 0
                                , finalInteger = ''
                                , i = intPart.length;
                            while ( i-- ) {
                                if ( digitCount != 0 && digitCount % grpSize == 0 ) {
                                    finalInteger = groupingSymbol + finalInteger;
                                }
                                finalInteger = intPart.substr( i, 1 ) + finalInteger;
                                digitCount++;
                            }
                            intPart = finalInteger;
                        }
                        let maxIntDigits;
                        if ( decimalCharIdx != -1 ) {
                            maxIntDigits = numPattern.substr( 0, decimalCharIdx ).replace( new RegExp( '#|' + groupingSymbol, 'g' ), '' ).length;
                        } else {
                            maxIntDigits = numPattern.replace( new RegExp( '#|' + groupingSymbol, 'g' ), '' ).length;
                        }
                        const currentIntLen = intPart.length;
                        for ( let i = currentIntLen; i < maxIntDigits; i++ ) {
                            intPart = '0' + intPart;
                        }
                    }
                    const finalFormattedNumber = intPart + fracPart;
                    return finalFormattedNumber;
                }
            }
        };
    } )();

}( jQuery ) );