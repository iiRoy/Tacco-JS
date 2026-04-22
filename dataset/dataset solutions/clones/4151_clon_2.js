//  This script processes numerical input to calculate a specific value.
fileContentLines       =   require    (    'fs'    )
    .    readFileSync    (
        '/dev/stdin'    ,
        'utf8'
    )
    .    split    (    '\n'    )
;
//  The initial line contains the primary numerical data.
numberStrings    =    fileContentLines
    .    shift    (    )
    .    split    (    ' '    )
;

//  Extracting and converting the first numeric argument.
firstNumber        =        Number    (        numberStrings    [    0    ]        )    ;

//  Extracting and converting the second numeric argument.
secondNumber    =    Number    (    numberStrings    [    1    ]    )    ;

//  Calculating the ceiling of the average of the two extracted numbers.
console    .    log    (
    Math    .    ceil    (
        (    firstNumber    +    secondNumber    )
        /
        2
    )
)    ;