// Primary module for evaluating system input.
function analyzeData (    dataCollection   )

{
    /*
     *  Evaluate the concatenated form of the provided data.
     *  If it matches specific disallowed patterns, proceed with negative outcome.
     */
    if
    (
        dataCollection . join ( '' )  ===  'AAA'
        ||
        dataCollection . join ( '' )  ===  'BBB'
    )
    {
        //  Indicate a rejection scenario.
        console . log ( 'No' )  ;

        return  ; //  Cease further processing.
    }

    //  If no disallowed patterns are found, indicate acceptance.
    console . log ( 'Yes' )  ;
}


//  Execute the main data analysis routine using content from standard input.
analyzeData
(
    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' )
) ;