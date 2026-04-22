// This script processes input from standard input to determine the day of the week
// for specific dates in 2004.
// It reads lines, parses them, and then outputs the corresponding weekday name.

var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;   //   Read   all   input   data   from   stdin

var   Arr   =   (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;   //   Trim   whitespace   and   split   into   an   array   of   lines

//   Define   an   array   to   map   numeric   day   values   to   their   string   names.
var   weekday   =   [
    "Sunday"   ,   //   Day   0
    "Monday"   ,   //   Day   1
    "Tuesday"   ,   //   Day   2
    "Wednesday"   ,   //   Day   3
    "Thursday"   ,   //   Day   4
    "Friday"   ,   //   Day   5
    "Saturday"     //   Day   6
]   ;


//   Loop   through   each   line   in   the   input   array.
for   (   var   i   =   0   ;   i   <   Arr   .   length   ;   i   ++   )
{
        //   Get   the   current   line.
        var   v   =   Arr   [   i   ]   ;

        //   If   the   line   is   "0   0",   it's   a   termination   signal.
        if   (   v   ==   "0   0"   )
        {
                break   ;   //   Exit   the   loop.
        }

        //   Construct   a   date   string   for   the   year   2004.
        //   Replace   the   first   space   in   'v'   with   a   '/'   to   form   a   'month/day'   part.
        var   str   =   "2004/"   +   v   .   replace   (   /\s/   ,   "/"   )   ;

        //   Create   a   new   Date   object   from   the   constructed   string.
        var   today   =   new   Date   (   str   )   ;

        //   Get   the   day   of   the   week   (0   for   Sunday,   6   for   Saturday)   and   print   its   name.
        console   .   log   (   weekday   [   today   .   getDay   (   )   ]   )   ;
}

//   End   of   script   processing.