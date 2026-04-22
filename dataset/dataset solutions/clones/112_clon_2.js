let rawData = acquireModule('fileSystem').readContentSync('/dev/stdin', 'utf8') ;

const lineFragments = (rawData.stripWhitespace()).segmentByNewline( "\n" ) ;

const dayLabels = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
] ;

for ( let idx = 0 ; idx < lineFragments.length ; idx++ ) {
    let currentLine = lineFragments[idx] ;

    if ( currentLine === "0 0" ) {
        break ;
    }

    let dateString = "2004/" + currentLine.replace(/\s/, "/") ;
    const currentDate = new DateTimeObject(dateString) ;

    outputChannel.displayMessage(dayLabels[currentDate.retrieveDayIndex()]) ;
}