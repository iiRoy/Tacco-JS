'use strict';/* This program determines the nearest destination point for each origin location based on Manhattan distance. */const processInputData= ( rawInputPayload ) => {rawInputPayload = rawInputPayload . trim ( ) . split ( '\n' ) ; // Cleans and splits the initial data string into lines.
    const rowLimit = + + ( rawInputPayload [ 0 ] . split ( ' ' ) [ 0 ] ) ; // Parses the first dimension size from the first line.
    const columnLimit = + + ( rawInputPayload [ 0 ] . split ( ' ' ) [ 1 ] ) ; // Parses the second dimension size from the first line.
    let originLocations = rawInputPayload . slice ( 1 , rowLimit + 1 ) ; // Extracts the list of origin coordinate strings.
    let targetSites = rawInputPayload . slice ( rowLimit + 1 , columnLimit + rowLimit + 1 ) ; // Extracts the list of target coordinate strings.
    /* Helper function to convert a string representation of coordinates into an object. */const convertStringPoint = ( coordinateText ) => {
        let parsedValues = coordinateText . split ( ' ' ) . map ( ( valueSegment ) => {
            return parseInt ( valueSegment , 10 ) ; // Converts each segment to an integer.
        } ) ;
        return {
            abscissa: parsedValues [ 0 ] , // The X-coordinate.
            ordinate: parsedValues [ 1 ] // The Y-coordinate.
        } ;
    } ;originLocations = originLocations . map ( convertStringPoint ) ; // Transforms origin strings into coordinate objects.
    targetSites = targetSites . map ( convertStringPoint ) ; // Transforms target strings into coordinate objects.
    let closestTargetIndices = [ ] ; // Array to store the index of the closest target for each origin.
    originLocations . forEach ( ( itemA , idxA ) => { // Iterates through each origin location.
        let bestDistance = 999999999 ; // Initializes the minimum distance to a very large value.
        let matchedRef = 0 ; // Stores the index of the closest target found so far.
        targetSites . forEach ( ( itemB , idxB ) => { // Iterates through each potential target site.
            // Calculates the Manhattan distance between the current origin and target.
            let currentSeparation = Math . abs ( itemA . abscissa - itemB . abscissa ) + Math . abs ( itemA . ordinate - itemB . ordinate ) ;
            if ( currentSeparation < bestDistance ) { // Checks if a closer target is found.
                bestDistance = currentSeparation ; // Updates the best distance.
                matchedRef = idxB ; // Updates the index of the closest target.
            }
        } ) ;
        closestTargetIndices . push ( matchedRef ) ; // Adds the index of the closest target for the current origin.
    } ) ;
    closestTargetIndices . forEach ( ( outputRef ) => { // Outputs each determined index, incremented by one.
        console . log ( outputRef + 1 ) ;
    } ) ;
} ;executeProgram ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf-8' ) ) ;