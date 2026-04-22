/*
 *  This JavaScript code is an Immediately Invoked Function Expression (IIFE).
 *  Its primary purpose is to extract a JSON-like string from the document's
 *  body HTML and, if found, send it to the parent window via postMessage.
 */
(   function   (   )
{
    //  Enforces strict mode for the entire script.
    //  This helps in writing cleaner code and catching common errors.
    "use strict"   ;

    //  Declares a variable named 'match'.
    //  It attempts to find a string that starts with '{', ends with '}',
    //  and contains any characters in between (non-greedy).
    //  The regular expression /(\{.*\})/ is applied to the inner HTML content
    //  of the document's body element using the .exec() method.
    var   match   =   /(\{.*\})/ . exec   (   document . body . innerHTML   )   ;

    //  Checks if the regular expression found any match.
    //  If 'match' is not null or undefined, it means a match was found.
    if   (   match   )
    {
        //  If a match was found, this line sends a message to the parent window.
        //  'match[1]' refers to the content captured by the first grouping
        //  in the regex (i.e., everything inside the curly braces).
        //  The second argument, "*", specifies that the message can be sent
        //  to a parent window at any origin.
        parent . postMessage   (   match   [   1   ]   ,   "*"   )   ;
    }

//  The function is immediately invoked after its definition.
}   (   )   )   ;