/*
 * This file contains a JavaScript program designed to solve a specific
 * problem often encountered in competitive programming contexts.
 * The primary goal is to determine participant eligibility based on scores.
 */


const    main    =    (    input    )    =>    {

    //  The first line of input provides three critical parameters:
    //  N: The total number of participants.
    //  K: The minimum score required to pass (or rather, the maximum penalty allowed).
    //  Q: The total number of questions asked in the contest.

    var    N    =    input[0]    .    split    (    " "    )    [0]    ;
    var    K    =    input[0]    .    split    (    " "    )    [1]    ;
    var    Q    =    input[0]    .    split    (    " "    )    [2]    ;


    //  Initialize an empty object, which will serve as a hash map (or dictionary).
    //  This map will store the count of correct answers for each participant.
    var    map    =    {    }    ;


    //  Begin a loop to process each of the Q questions.
    //  The loop iterates from 1 up to Q, corresponding to input lines after the first.
    for    (    var    i    =    1    ;    i    <=    Q    ;    i++    )    {

        //  'x' represents the participant ID who answered the i-th question correctly.
        var    x    =    input[i]    ;

        //  Increment the score for participant 'x' in our map.
        //  If 'x' is not yet in the map, its initial score is considered 0 before incrementing.
        map[x]    =    (    map[x]    ||    0    )    +    1    ;
    }


    //  After all questions have been processed and scores tallied,
    //  iterate through each participant from 1 to N to determine their final status.
    for    (    var    i    =    1    ;    i    <=    N    ;    i++    )    {

        //  Calculate the penalty for the current participant 'i'.
        //  This is Q (total questions) minus the number of questions they answered correctly.
        //  If a participant has no entries in the map (i.e., no correct answers), their score defaults to 0.
        //  Then, compare this penalty with the threshold K.
        //  If the penalty is less than K, the participant passes ("Yes"), otherwise ("No").
        console.log    (    Q    -    (    map[i]    ||    0    )    <    K    ?    "Yes"    :    "No"    )    ;
    }

}


//  This is the entry point for the program execution.
//  It reads the entire content of standard input, decodes it as UTF-8,
//  removes leading/trailing whitespace, and then splits it into an array
//  of strings based on newline characters. This array is then passed
//  as the 'input' argument to the 'main' function.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'UTF-8'    )    .    trim    (    )    .    split    (    "\n"    )    )    ;