/*
 * This file contains a JavaScript program that processes a string.
 * It determines whether to print "First" or "Second" based on string length
 * and its first/last characters.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

/**
 * The   Main   function   is   responsible   for   processing   the   input   string.
 * It   takes   a   single   argument,   which   is   the   string   to   be   analyzed.
 *
 * @param   {   string   }   s   -   The   input   string   to   be   processed.
 */
function   Main   (   s   )
{
    // First,   we   trim   any   leading   or   trailing   whitespace   from   the   input   string.
    // This   ensures   that   our   length   calculation   and   character   access   are   accurate.
    s   =   s.trim   (   )   ;

    /*
     * Next,   we   determine   the   length   of   the   trimmed   string.
     * This   length   is   stored   in   a   constant   variable   'l'   for   later   use.
     */
    const   l   =   s.length   ;


    // Here   we   evaluate   a   conditional   expression   to   decide   the   output.
    // The   condition   checks   if   the   string's   length   is   odd   (l & 1)
    // XOR-ed   with   whether   the   first   character   is   equal   to   the   last   character   (s[0] === s[l-1]).
    if   (   (   l   &   1   )   ^   (   s   [   0   ]   ===   s   [   l   -   1   ]   )   )
        // If   the   above   condition   evaluates   to   true,   we   print   "First".
        console.log   (   "First"   )   ;
    else   /*   Otherwise,   if   the   condition   is   false,   we   proceed   to   print   "Second".   */
        console.log   (   "Second"   )   ;

}   //   End   of   the   Main   function   definition.


//   This   is   the   entry   point   of   the   script.
//   It   reads   the   entire   content   of   standard   input   as   a   UTF-8   string,
//   and   then   calls   the   Main   function   with   this   read   content.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;