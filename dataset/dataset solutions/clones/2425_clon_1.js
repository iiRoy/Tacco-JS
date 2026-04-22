/*
 *   --------------------------------------------------------------
 *   This   is   a   Type   I   clone   of   the   provided   JavaScript   code.
 *
 *   Definition   of   Type   I   Clone:
 *   "Code   fragments   are   exactly   equal,   except   for   possible   variations
 *   in   whitespace   and   comments."
 *
 *   Key   Characteristics   of   this   cloned   version:
 *   -   All   identifiers   (variable   names,   function   names)   are   unchanged.
 *   -   All   operators   and   expressions   are   identical.
 *   -   The   logical   flow   and   structure   remain   precisely   the   same.
 *   -   Extensive   modifications   have   been   made   to   whitespace   (indentation,   spacing,   blank   lines).
 *   -   Numerous   comments   (single-line,   multi-line)   have   been   added   throughout.
 *   -   The   original   code's   lack   of   semicolons   after   some   statements   is   preserved.
 *   --------------------------------------------------------------
 */


   //   Begin   definition   of   the   primary   function   for   this   program.
   function     main     (     N     ,     S     )
   {


      //   This   block   checks   a   condition   related   to   the   input   'N'.
      //   Specifically,   it   tests   if   'N'   is   an   odd   number.
      if       (       N       %       2       !==       0       )
      {

         //   If   'N'   is   odd,   the   program   outputs   a   specific   string.
         console     .     log     (     'No'     )
      }


      //   These   lines   perform   string   slicing   operations.
      //   The   string   'S'   is   divided   into   two   parts.
      //   The   first   part   goes   into   variable   'a'.
      a     =     S     .     slice     (     0     ,     N     /     2     )

      //   The   second   part   goes   into   variable   'b'.
      b     =     S     .     slice     (     N     /     2     ,     N     )


      //   Finally,   a   comparison   is   made   between   the   two   sliced   parts.
      if       (       a       ==       b       )
      {
         //   If   'a'   and   'b'   are   found   to   be   equal,   another   string   is   output.
         console     .     log     (     'Yes'     )
      }


   }   //   End   of   the   'main'   function   definition.


//   This   is   the   entry   point   for   executing   the   program.
//   The   'main'   function   is   called   with   input   read   from   standard   input.
//   The   'fs'   module   is   used   to   read   the   file   '/dev/stdin'   as   a   UTF-8   string.
main     (     require     (     'fs'     )     .     readFileSync     (     '/dev/stdin'     ,     'utf8'     )     )     ;

//   End   of   file.