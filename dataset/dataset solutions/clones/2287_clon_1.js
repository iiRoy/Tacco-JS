"use strict"
    ;   //  Enable strict mode for cleaner code.
/*
    This program processes some input data.
    It reads from standard input, parses numbers,
    and performs calculations to find a specific count.
*/
function    main  (   arg   )
    {

        //  Initialize data by trimming whitespace and splitting by newline.
        var    data    =    arg  .  trim  (  )  .  split  (  "\n"  )
        ;


        //  Extract 'm' from the first line of data.
        var    m    =    data  [  0  ]  .  split  (  " "  )  .  map  (  Number  )  [  1  ]
        ;


        //  Process the second line: split, map to numbers, sort in descending order.
        var    _a    =    data  [  1  ]  .  split  (  " "  )  .  map  (  Number  )  .  sort  (  (  a  ,  b  )  =>    b    -    a  )
        ;

        /*
            Filter out duplicate elements from _a to create array 'a'.
            This ensures 'a' contains only unique sorted numbers.
        */
        var    a    =    _a  .  filter  (  function    (  x  ,  i  ,  self  )
        {
            return    self  .  indexOf  (  x  )    ===    i  ;
        }  )
        ;


        //  Extract the first element of 'a' as 'base' and remove it from 'a'.
        var    base    =    a  .  shift  (  )
        ;


        //  Initialize an empty array for records (though not used later, it was in original).
        var    records    =    [  ]
        ;


        //  Initialize the answer counter.
        var    ans    =    0
        ;


        //  Main loop to iterate through possible 'p' values.
        for    (    var    p    =    1  ;  ;    p  ++    )
        {
            /*
                Calculate 'x' based on 'base' and 'p'.
                This formula is critical to the problem's logic.
            */
            var    x    =    base    *    (  p    +    0.5  )
            ;

            //  If 'x' exceeds 'm', we've gone too far; break the loop.
            if    (    x    >    m    )
            {
                break
                ;
            }

            //  Flag to check for errors in the inner loop.
            var    has_error    =    false
            ;

            //  Inner loop: iterate through elements of 'a'.
            for    (    var    i    =    0  ;    i    <    a  .  length  ;    i  ++    )
            {
                //  Calculate '_p' using 'x' and current element 'a[i]'.
                var    _p    =    x    /    a  [  i  ]    -    0.5
                ;

                /*
                    Check if '_p' is not an integer.
                    If it's not, set has_error and break the inner loop.
                */
                if    (    !    Number  .  isInteger  (  _p  )    )
                {
                    has_error    =    true
                    ;
                    break
                    ;
                }
            }

            //  If no errors were found in the inner loop, increment the answer.
            if    (    !  has_error    )
            {
                ans  ++
                ;
            }
        }

        //  Output the final calculated answer to the console.
        console  .  log  (  ans  )
        ;

    }

//  Read input from standard input and pass it to the main function.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )
;