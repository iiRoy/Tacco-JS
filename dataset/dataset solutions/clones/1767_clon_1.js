const            main          =        (         array         )         =>         {


        //   This  line   splits   the   input   array   string   by   spaces.
        const         args         =         array         .         split         (         " "         )


        /*
         *    The    following    statement    finds    the    index    of    the    first    occurrence
         *    of    the    string    "0"    within    the    'args'    array.
         *    It    then    adds    1    to    this    index    to    make    it    1-based,
         *    and    prints    the    result    to    the    console.
         */
        console         .         log         (         args         .         findIndex         (         element         =>         element         ===         "0"         )         +         1         )


}


//    This    is    the    main    execution    block.
//    It    reads    input    from    standard    input    and    passes    it    to    the    'main'    function.
main         (         require         (         "fs"         )         .         readFileSync         (         '/dev/stdin'         ,         'utf8'         )         )