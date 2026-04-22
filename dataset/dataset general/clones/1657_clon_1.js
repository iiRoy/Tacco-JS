/*
 * This JavaScript client establishes a Socket.IO connection to a specified server.
 * Its primary purpose is to continuously echo a predefined message back to the server
 * upon reception, thereby creating a loop and measuring the round-trip latency
 * of each message exchange. This serves as a basic performance test or demonstration.
 */


var    io    =    require   (   'socket.io-client'   )   ;    //    Import    the    essential    Socket.IO    client    library    for    network    communication.


//    Declare    a    global    variable    to    hold    the    string    message    that    will    be    transmitted    and    echoed.
//    This    particular    message    is    a    well-known    Portuguese    tongue-twister.
var    message    =    "o bispo de constantinopla nao quer se desconstantinopolizar"    ;


//    Define    the    main    'user'    function    which    encapsulates    the    client's    connection    and    messaging    logic.
//    It    takes    the    target    server's    host    and    port    as    arguments.
function    user    (    host    ,    port    )    {

        //    Initialize    a    'Date'    object    to    mark    the    beginning    of    a    latency    measurement    cycle.
        //    This    will    be    updated    each    time    a    message    is    sent    or    received.
    var    start    =    new    Date    (    )    ;


        //    Establish    a    new    Socket.IO    connection    to    the    server    at    the    given    host    and    port.
        //    The    'force new connection: true'    option    ensures    a    fresh    socket    instance    is    created    every    time.
    var    socket    =    io . connect    (    'http://'    +    host    +    ':'    +    port    ,    {    'force new connection'    :    true    }    )    ;


        //    Register    an    event    listener    that    triggers    when    the    socket    successfully    connects    to    the    server.
    socket . on    (    'connect'    ,    function    (    )    {

                //    Upon    a    successful    connection,    the    client    sends    its    initial    message.
                //    This    action    initiates    the    message    echo    loop    with    the    server.
        socket . send    (    message    )    ;


                //    Set    up    another    event    listener    to    handle    any    incoming    'message'    events    from    the    server.
        socket . on    (    'message'    ,    function    (    message    )    {

                        //    Calculate    the    time    difference    (in    milliseconds)    between    the    current    moment    and    the    'start'    timestamp.
                        //    This    value    represents    the    round-trip    latency    for    the    last    message    exchange.
            console . log    (    new    Date    (    )    -    start    )    ;

                        //    Update    the    'start'    timestamp    to    the    current    time.
                        //    This    resets    the    timer    for    measuring    the    latency    of    the    next    message    cycle.
            start    =    new    Date    (    )    ;

                        //    Echo    the    received    message    back    to    the    server.
                        //    This    action    completes    one    iteration    of    the    message    loop    and    prompts    the    server    to    respond    again.
            socket . send    (    message    )    ;
        }    )    ;

    }    )    ;

}    ;    //    End    of    the    'user'    function    definition.


//    ----------------------------------------------------------------------------------------------------
//    Command-line    argument    parsing    and    client    invocation.
//    ----------------------------------------------------------------------------------------------------

//    'process.argv'    is    an    array    containing    command-line    arguments.
//    'argvIndex'    is    set    to    2    because    the    first    two    elements    are    'node'    and    the    script    file    path.
var    argvIndex    =    2    ;

//    Extract    the    host    address    from    the    command-line    arguments.
//    If    an    argument    is    provided    at    'argvIndex',    it's    used;    otherwise,    'localhost'    is    the    default.
var    host    =    process . argv    [    argvIndex    ++    ]    ?    process . argv    [    argvIndex    -    1    ]    :    'localhost'    ;

//    Extract    the    port    number    from    the    command-line    arguments.
//    If    an    argument    is    provided    at    the    (now    incremented)    'argvIndex',    it's    used;    otherwise,    '3000'    is    the    default.
var    port    =    process . argv    [    argvIndex    ++    ]    ?    process . argv    [    argvIndex    -    1    ]    :    '3000'    ;


//    Finally,    invoke    the    'user'    function    with    the    determined    host    and    port.
//    This    initiates    the    Socket.IO    client    and    starts    its    operation.
user    (    host    ,    port    )    ;