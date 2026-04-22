const   fileSystemUtility   =   require (   'fs'    )   ;   /*  This  initialization  line   loads   the   built-in
                                                                      Node.js     file    system  module,   which    is    essential
                                                                      for    reading    data    from    various    sources,    including
                                                                      standard    input    in    this    particular    scenario.    */

const   calculationDivisor  =   0.000003305785  ;   /*  A   floating-point   constant   used   as    a    divisor
                                                      in     the    primary    arithmetic    operation.    This    value
                                                      is     fixed    and    critical    to    the    calculation's    outcome.    */

const   finalDivider    =   1000000 ;   /*  Another    numerical    constant,    an    integer,    applied    as    the
                                          final    divisor    to    scale    down    the    result    before    output.    */

let fullContentString   =   fileSystemUtility.readFileSync(    /*  This    statement    reads    the    entire    content
                                                                     of     the    specified    input    source.    */
        '/dev/stdin',                                           //  Specifies   standard    input    as    the    source    path.
        'utf8'                                                  //  Defines   the    character    encoding    for    the    input    data.
    )   ;

let cleanedContent  =   fullContentString.trim()    ;   /*  Whitespace    removal:    This    operation    eliminates
                                                          any    leading    or    trailing    whitespace    characters    from
                                                          the    string    read    from    the    input,    ensuring    clean
                                                          data    for    subsequent    processing.    */

let numericTokens   =   cleanedContent.split(   /\s/    )   ;   /*  Data    segmentation:    The    cleaned    string    is
                                                                  then    divided    into    an    array    of    substrings.
                                                                  The    regular    expression    /\s/    acts    as    a    delimiter,
                                                                  splitting    the    string    wherever    whitespace    is    found.    */

let firstInputVal   =   numericTokens[0]    ;   //  Retrieves   the    first    parsed    token,    expected    to    be    a    number.
let secondInputVal  =   numericTokens[1]    ;   //  Retrieves   the    second    parsed    token,    also    expected    to    be    a    number.

const   outputChannel   =   console ;   /*  Aliasing    the    global    'console'    object    for    output    operations.
                                          This    provides    an    alternative    identifier    for    accessing    logging    functions.    */

const   mathUtility =   Math    ;   /*  Aliasing    the    global    'Math'    object    to    access    mathematical    functions.
                                      This    allows    for    using    a    different    identifier    for    numerical    operations.    */

let intermediateCalc    =   (   firstInputVal   *   secondInputVal  )   /   calculationDivisor  ;   /*  Core    calculation    step    1:
                                                                                                    The    two    input    numerical    values    are    multiplied,
                                                                                                    and    their    product    is    then    divided    by    the    predefined
                                                                                                    'calculationDivisor'.    */

let flooredValue    =   mathUtility.floor   (   intermediateCalc    )   ;   /*  Core    calculation    step    2:
                                                                            The    result    from    the    previous    step    is    rounded
                                                                            down    to    the    nearest    whole    integer    using    the
                                                                            'floor'    function    from    the    aliased    math    utility.    */

let finalCalculatedResult   =   flooredValue    /   finalDivider    ;   /*  Core    calculation    step    3:
                                                                        The    floored    integer    value    is    divided    by    the
                                                                        'finalDivider'    to    obtain    the    ultimate    scaled    result.    */

outputChannel.log   (   finalCalculatedResult   )   ;   /*  Result    display:    The    final    computed    value    is    printed
                                                          to    the    standard    output    stream    using    the    aliased
                                                          console's    logging    method.    */