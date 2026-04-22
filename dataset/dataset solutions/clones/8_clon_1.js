var    input    =    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    ;    //    Reads    the    entire    content    of    /dev/stdin    as    a    UTF-8    string.

/*
 *    The    'this.result'    property    is    assumed    to    hold    the    actual    data    to    be    processed.
 *    This    line    splits    the    string    by    newline    characters    into    an    array    of    individual    heights.
 */
var    heights    =    this    .    result    .    split    (    '\n'    )    ;

heights    .    sort    (    function    (    a    ,    b    )    {    /*    Anonymous    function    for    custom    sorting    logic    */
    //    This    comparison    function    sorts    the    heights    in    descending    numerical    order.
    return    b    -    a    ;    //    If    b    is    greater    than    a,    b    comes    before    a.
}    )    ;

//    Now,    the    'heights'    array    is    sorted,    with    the    largest    values    at    the    beginning.

for    (    var    i    =    0    ;    i    <    3    ;    i    ++    )    /*    Loop    to    iterate    through    the    first    three    elements    */
{
    //    Prints    each    of    the    top    three    heights    to    the    console.
    console    .    log    (    heights    [    i    ]    )    ;
}

//    End    of    the    script.