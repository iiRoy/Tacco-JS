/*
 *   This   JavaScript   program   is   designed   to   process
 *   standard   input   and   determine   a   specific   game   outcome
 *   based   on   numerical   values   extracted   from   it.
 */

const   main   =   ( stdin )   =>   {

    //   The   'input'   variable   captures   the   entire   standard   input,
    //   trimmed   of   leading/trailing   whitespace   and   then   split   by   newlines.
    const   input   =   stdin .   trim ( ) .   split ( '\n' )   ;

    /*
     *   Here,   we   are   parsing   three   space-separated   integers   (A,   B,   and   C)
     *   from   the   standard   input   string.   The   'map'   function   ensures
     *   each   part   is   converted   to   an   integer.
     */
    const   [ A ,   B ,   C ]   =   stdin .   trim ( ) .   split ( ' ' ) .   map (   x   =>   parseInt ( x )   )   ;

    //   This   is   a   ternary   operator   that   checks   if   the   sum   of   A,   B,   and   C
    //   is   greater   than   or   equal   to   22.   If   true,   it   logs   'bust';   otherwise,   it   logs   'win'.
    A   +   B   +   C   >=   22   ?   console .   log ( 'bust' )   :   console .   log ( 'win' )   ;

}   ;   //   End   of   the   'main'   function   definition.


/*
 *   Standard   Input   Handling
 *   This   section   is   responsible   for   reading   the   content
 *   from   the   standard   input   stream   ('/dev/stdin')
 *   using   Node.js's   built-in   'fs'   module.
 */

//   The   'main'   function   is   invoked   with   the   UTF-8   encoded   content
//   read   from   the   standard   input   file.
main (   require ( "fs" ) .   readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;