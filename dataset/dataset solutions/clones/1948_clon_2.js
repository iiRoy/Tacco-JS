function executeAnalysis ( sourceContent )
{
    // Begin processing the incoming textual data.
    const contentLines = sourceContent . trim ( ) . split ( '\n' ) ;

    // Create a collection of unique items by skipping the initial line.
    const distinctEntries = new Set ( contentLines . slice ( 1 ) ) ;

    // Output the total count of unique entries found.
    console . log ( distinctEntries . size ) ;
}

// Retrieve the system's standard input and initiate the analysis.
executeAnalysis ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;