var     obj     =     init( )     ;

Main( )     ;

/*
 * nextInt: Converts the next input token to an integer.
 */
function     nextInt( )     {     return     myconv(     next( )     ,     1     )     ;     }

// This function gets the next string array, split by spaces.
function     nextStrArray( )     {     return     myconv(     next( )     ,     2     )     ;     }

function     nextIntArray( )     {     return     myconv(     next( )     ,     4     )     ;     }     // Splits by space and converts to numbers.

function     nextCharArray( )     {     return     myconv(     next( )     ,     6     )     ;     }     // Splits into individual characters.

function     next( )     {     return     obj.next( )     ;     }

function     hasNext( )     {     return     obj.hasNext( )     ;     }

function     myin( )
{
    return     require( "fs" ).readFileSync( "/dev/stdin" ,     "utf8" ).trim( ).split( "\n" )     ;
}


function     init( )
{
    var     inputFile     =     myin( )     ;

    var     returnObj     =
    {
        "list"     :     inputFile     ,
        "index"     :     0     ,
        "max"     :     inputFile.length     ,

        "hasNext"     :     function( )
        {
            return     (     this.index     <     this.max     )     ;     // Checks if there are more elements.
        }     ,

        "next"     :     function( )
        {
            if     (     !     this.hasNext( )     )
            {
                throw     "ArrayIndexOutOfBoundsException これ以上ないよ"     ;     // Error if no more elements.
            }
            else
            {
                var     returnInput     =     this.list[     this.index     ]     ;
                this.index     ++     ;
                return     returnInput     ;
            }
        }
    }     ;

    return     returnObj     ;
}


function     myout( t )     {     console.log(     t     )     ;     }     // Outputs to standard output.

function     myerr( t )     {     console.error(     t     )     ;     }     // Outputs to standard error.


/*
 * This function handles various conversions based on the 'no' parameter.
 * Cases:
 *  1: Convert to integer.
 *  2: Split by space.
 *  4: Split by space and map to numbers.
 *  6: Split into individual characters.
 *  7: Split into individual characters and map to numbers.
 *  8: Join array elements with space.
 *  9: Join array elements with newline.
 *  0: Join array elements without any separator.
 *  Default/Error: Return input as is.
 */
function     myconv(     i     ,     no     )
{
    try
    {
        switch     (     no     )
        {
            case     1     :     return     parseInt(     i     )     ;
            case     2     :     return     i.split(     " "     )     ;
            case     4     :     return     i.split(     " "     ).map(     (     a     )     =>     Number(     a     )     )     ;
            case     6     :     return     i.split(     ""     )     ;
            case     7     :     return     i.split(     ""     ).map(     (     a     )     =>     Number(     a     )     )     ;
            case     8     :     return     i.join(     " "     )     ;
            case     9     :     return     i.join(     "\n"     )     ;
            case     0     :     return     i.join(     ""     )     ;
            default     :     return     i     ;
        }
    }
    catch     (     e     )
    {
        return     i     ;
    }
}


function     Main( )
{
    var     output     =     0     ;

    var     one     =     nextIntArray( )     ;

    var     N     =     one[     0     ]     ;
    var     M     =     one[     1     ]     ;

    if     (     N     >=     M     /     2     )
    {
        output     =     Math.floor(     M     /     2     )     ;
    }
    else
    {
        output     =     Math.floor(     N     +     (     (     M     -     (     N     *     2     )     )     /     4     )     )     ;
    }

    myout(     output     )     ;
}