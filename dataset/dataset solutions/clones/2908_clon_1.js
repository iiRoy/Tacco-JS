/*
 * This is the main entry point of the program.
 * It processes the input and prints results.
 */
const    Main   =    (   input   )    =>
{
    // Split the entire input string by newline characters
    const   inputArr    =    input . split (   '\n'   )

    // The first element of the array is 'num', though it's not used later.
    const   num =    inputArr [   0   ]


    // Filter out the first element (which is 'num') and then map the rest.
    // Each row is transformed into an array starting with its 1-based index,
    // followed by the elements obtained by splitting the original row string.
    const   scoredRestaurants    =    inputArr
        .  filter  (  (   ele ,   i   )   =>   !!i   )  //  Filter  out  the  header  /  first  line
        .  map  (  (   row ,   i   )   =>   [   i   +   1   ] . concat (   row . split (   ' '   )   )   )


    // Sort the processed restaurant data using the custom 'compare' function.
    const   sorted    =    scoredRestaurants . sort (   compare   )

    // Iterate over the sorted restaurants and print the first element (the original index)
    // if the second element (restaurant name) is not an empty string.
    sorted . forEach (   (   ele ,   i   )   =>
    {
        // Check if the restaurant name is not empty
        if   (   ele [   1   ]   !==   ''   )
        {
            console . log (   ele [   0   ]   )   //  Output  the  original  index
        }
    }   )
}


/**
 *  Compares two restaurant entries for sorting purposes.
 *  Primary sort key is the restaurant name (alphabetical ascending).
 *  Secondary sort key is the score (numerical descending).
 *
 *  @param {Array} a - The first restaurant entry.
 *  @param {Array} b - The second restaurant entry.
 *  @returns {number} - A negative, zero, or positive value indicating the sort order.
 */
const    compare    =    (   a ,   b   )    =>
{
    const   aName    =    a [   1   ]   //  Extract  name  of  restaurant  'a'
    const   bName    =    b [   1   ]   //  Extract  name  of  restaurant  'b'

    return   aName   ===   bName
        ?   scoreCompare (   a ,   b   )   //  If  names  are  equal,  compare  scores
        :   aName   <   bName
            ?   -1   //  'a'  comes  before  'b'  alphabetically
            :   1    //  'b'  comes  before  'a'  alphabetically
}


//  This  function  compares  the  scores  of  two  restaurants.
//  It  is  used  as  a  secondary  sort  key  when  restaurant  names  are  identical.
const    scoreCompare    =    (   a ,   b   )    =>
{
    const   aScore    =    parseInt (   a [   2   ] ,   10   )   //  Parse  score  for  'a'
    const   bScore    =    parseInt (   b [   2   ] ,   10   )   //  Parse  score  for  'b'

    return   aScore   ===   bScore
        ?   0    //  Scores  are  equal
        :   aScore   <   bScore
            ?   1    //  'a'  has  a  lower  score,  so  'b'  comes  first  (descending  sort)
            :   -1   //  'a'  has  a  higher  score,  so  'a'  comes  first  (descending  sort)
}

//  Execute  the  main  function  with  input  read  from  standard  input.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin" ,   "utf8"   )   )