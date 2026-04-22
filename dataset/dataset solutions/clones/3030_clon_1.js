function       Main         (       input       )       {

    input       =       input.trim      (  )      ;

    input       =       input.split     (    " "    )    .    map     (    Number    )    ;

    if
    (
        (  input[0]          >=          input[2]          &&          input[2]          >=          input[1]  )
        ||
        (  input[0]          <=          input[2]          &&          input[2]          <=          input[1]  )
    )
    console.log       (       "Yes"       )       ;
    else
    console.log       (       "No"       )       ;

}
Main
(
    require
    (
        "fs"
    )
    .
    readFileSync
    (
        "/dev/stdin"  ,  "utf8"
    )
)
;