function   main
(
)
{
    let  N        ;
    let  maxN     ;

    //  In the original Go code, 'N' was read from standard input using 'fmt.Scan(&N)'.
    //  In JavaScript, direct standard input is not universally available (e.g., in browsers).
    //  If 'N' remains undefined, the comparison 'a - b === N' will always be false.
    //  For a runnable example, you might assign N a value here, e.g.:
    //  N = 12345;
    //  Or use a browser 'prompt': N = parseInt(prompt("Enter N:"), 10);
    //  Or Node.js 'readline' for command-line input.

    let n = 10;

    while
    (
        true
    )
    {
        let a = Math.pow
        (
            n,
            5
        );
        let b = Math.pow
        (
            n - 1,
            5
        )
        ;

        if
        (
            a
            -
            b
            >
            Math.pow
            (
                10,
                9
            )
        )
        {
            maxN = n + 1;
            break;
        }
        n
        ++
        ;
    }


    for
    (
        let i = -maxN;
        i < maxN;
        i++
    )
    {
        for
        (
            let j = -maxN;
            j < maxN;
            j++
        )
        {
            let a = Math.pow(i, 5)        ;
            let b = Math.pow(j, 5)        ;

            if
            (
                a
                -
                b
                ===
                N
            )
            {
                let A = i;
                let B = j;

                console.log(A, B);

                return;
            }
        }
    }


}

main
(
)
;