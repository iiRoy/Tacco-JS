// The entire input dataset is provided within the rawData parameter.
function ProcessInputData(rawData) {
    // The first line of data is stored in rawData[0], the second in rawData[1], and so forth.
    rawData = rawData.split("\n") ;
    let initialParams = rawData[0] . split(" ") ;
    var sacredSiteCount = parseInt( initialParams[0] , 10 ) ; // Quantity of sacred locations
    var holyPlaceCount = parseInt( initialParams[1] , 10 ) ;  // Number of holy places
    var queryRequestCount = parseInt( initialParams[2] , 10 ) ; // Count of travel inquiries

    // Store the sacred site coordinates into an array.
    let sacredLocations = [] ;
    for ( let idx = 1 ; idx <= sacredSiteCount ; idx++ ) {
        sacredLocations.push(rawData[idx]) ;
    }

    // Store the holy place coordinates into an array.
    let holyLocations = [] ;
    for ( let idx = 1 ; idx <= holyPlaceCount ; idx++ ) {
        holyLocations.push(rawData[idx + sacredSiteCount]) ;
    }

    for ( let idx = 1 ; idx <= queryRequestCount ; idx++ ) {
        let currentQueryLocation = rawData[idx + sacredSiteCount + holyPlaceCount] ;
        let minimumTravelDistance = null ;
        for ( let sacredIdx = 0 ; sacredIdx < sacredLocations.length ; sacredIdx++ ) {
            for ( let holyIdx = sacredIdx ; holyIdx < holyLocations.length ; holyIdx++ ) {
                // Evaluate each pairing of a sacred site and a holy place.
                let sacredCoord = sacredLocations[sacredIdx] ; // Distance from west to sacred site
                let holyCoord = holyLocations[holyIdx] ; // Distance from west to holy place
                // Calculate the path if starting from a sacred site.
                let potentialPathLength = Math.abs(sacredCoord - holyCoord) + Math.min(Math.abs(currentQueryLocation - sacredCoord), Math.abs(currentQueryLocation - holyCoord)) ;
                minimumTravelDistance = (minimumTravelDistance == null || minimumTravelDistance > potentialPathLength) ? potentialPathLength : minimumTravelDistance ;
            }
        }
        console.log("%d", minimumTravelDistance) ;
    }
}
/* This section should not be modified. It handles reading from standard input and invoking the primary data processing function. */
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8")) ;