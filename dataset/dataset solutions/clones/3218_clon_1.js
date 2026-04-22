/*
 *   This   is   the   primary   function   that   takes   the   entire
 *   input   payload   as   a   single   string   argument.
 *   It   then   parses   this   input   to   perform   a   calculation.
 */
function   Main
(

    input

)
{
    //   The   incoming   'input'   string   is   first   segmented   into   an   array
    //   of   individual   lines,   using   the   newline   character   as   a   delimiter.
    input   =   input   .   split   (
        "\n"
    )   ;


    //   Accessing   the   very   first   line   of   the   parsed   input   array.
    //   This   line   is   then   further   split   by   spaces   to   obtain   its   components.
    tmp0   =   input   [   0   ]   .   split   (
        " "
    )   ;


    //   The   first   component   (at   index   0)   from   the   'tmp0'   array   is   extracted
    //   and   assigned   to   the   variable   'T'.
    T   =   tmp0   [   0   ]   ;


    //   Similarly,   the   second   component   (at   index   1)   from   'tmp0'
    //   is   assigned   to   the   variable   'X'.
    X   =   tmp0   [   1   ]   ;


    //   Finally,   the   result   of   dividing   'T'   by   'X'   is   outputted   to   the   console.
    //   JavaScript   will   automatically   coerce   'T'   and   'X'   to   numbers   for   this   operation.
    console   .   log   (
        T   /   X
    )   ;

}


/*
 *   =============================================================================
 *   !!!   WARNING:   DO   NOT   MODIFY   THE   FOLLOWING   BLOCK   OF   CODE   !!!
 *   This   section   is   responsible   for   reading   all   standard   input
 *   and   then   passing   it   to   the   'Main'   function   for   processing.
 *   Any   alterations   here   might   break   the   execution   environment.
 *   =============================================================================
 */
Main   (
    require   (   "fs"   )   .   readFileSync   (
        "/dev/stdin"   ,
        "utf8"
    )
)   ;