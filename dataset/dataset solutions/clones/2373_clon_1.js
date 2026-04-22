"use strict"
;

/*
 * This function generates all possible permutations of a given set of options,
 * allowing for repetitions.
 *
 * @param {Array<any>} permutationOptions - The array of elements to choose from.
 * @param {number} [permutationLength] - The desired length of each permutation.
 *                                       Defaults to the length of permutationOptions.
 * @returns {Array<Array<any>>} An array containing all generated permutations.
 */
const    permutateWithRepetitions     =
(
    permutationOptions
    ,
    permutationLength = permutationOptions.length
)  =>
{

    if
    (
        permutationLength
        ===
        1
    )
    {
        return    permutationOptions
            .map
            (
                permutationOption => [permutationOption]
            )
        ;
    }


    //  Initialize an empty array to store all generated permutations.
    const
        permutations
        =
        []
    ;


    // Recursively obtain smaller permutations
    // by reducing the desired permutation length by one.
    const
        smallerPermutations
        =
        permutateWithRepetitions
        (
            permutationOptions
            ,
            permutationLength
            -
            1
        )
    ;


    // Iterate through each available option to combine it with the smaller permutations.
    permutationOptions
        .forEach
        (
            (currentOption) =>
            {
                smallerPermutations
                    .forEach
                    (
                        (smallerPermutation) =>
                        {
                            permutations
                                .push
                                (
                                    [currentOption]
                                        .concat
                                        (smallerPermutation)
                                )
                            ;
                        }
                    )
                ;
            }
        )
    ;


    return    permutations
    ;
}


;

const main = arg => {
    arg = arg.trim()
        .split
        (
            "\n"
        )
    ;
    const N = parseInt
    (
        arg[0]
    )
    ;
    const S = arg[1]
        .split
        (
            ""
        )
        .map
        (
            n=>parseInt(n)
        )
    ;

    // The maximum possible number of combinations for a 3-digit number is 10^3 = 1000.
    // This comment indicates the problem constraints or an observation.
    const digits = [0,1,2,3,4,5,6,7,8,9]
    ;
    
    const combos = permutateWithRepetitions
    (
        digits, 3
    )
    ;
    
    let cnt = 0
    ;
    let list = []
    ;
    // The following line is commented out, likely for debugging purposes.
    // console.log(combos.join("\n"));
    
    for
    (
        let i in combos
    )
    {
        let digit1 = combos[i][0]
        ;
        let digit2 = combos[i][1]
        ;
        let digit3 = combos[i][2]
        ;
        
        // This variable 'nowCheking' is declared but not used later.
        let nowCheking = digit1
        ;
        let trueCnt = 0
        ; // This 'trueCnt' variable also appears to be unused.
        let flag1 = false
        ;
        let flag2 = false
        ;
        let flag3 = false
        ;
        
        // 'temp' is another variable declared but not utilized in the subsequent logic.
        let temp = []
        ;
        
        
        for
        (
            let j in S
        )
        {
            if
            (
                S[j] === digit1
                &&
                flag1 !== true
            )
            {
                flag1 = true
                ;
            }
            else
            if
            (
                S[j] === digit2
                &&
                flag1
                &&
                flag2 !== true
            )
            {
                flag2 = true
                ;
            }
            else
            if
            (
                S[j] === digit3
                &&
                flag1
                &&
                flag2
            )
            {
                flag3 = true
                ;
            }
        }
        
        
        if
        (
            flag1
            &&
            flag2
            &&
            flag3
        )
        {
            // Debugging output for found combinations.
            // console.log("3桁を作ることが出来る");
            // console.log("digit1:" + digit1);
            // console.log("digit2:" + digit2);
            // console.log("digit3:" + digit3);
            // console.log("-------");
            cnt++
            ;
        }
    }
    
    console
        .log
        (cnt)
    ;
}
main
(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
)
;