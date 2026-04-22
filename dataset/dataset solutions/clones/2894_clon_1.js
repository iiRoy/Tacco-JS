function   Main (  input )   {
    // This is the main entry point for the program
    // It processes the given input string
    lines = input . split ( "\n" )


    // The first line of input represents the number of elements, N
    N = lines . shift ( ) * 1



    // Initialize an object (hash map) 't' to store counts or mappings
    t = { }

    // Populate 't' with initial values, typically zeros, for N elements
    // This loop ensures each element from 1 to N is present in 't'
    for  ( i = 1 ;  i <= N ;  i++  )
    {
        t [ i ]  =  0
    }

    // Process the input lines to count occurrences or relationships
    // This loop iterates through all lines except the last one
    for  ( i = 0 ;  i < lines . length - 1 ;  i++  )
    {
        // Split each line into parts based on space
        s = lines [ i ] . split ( ' ' )

        // Increment the count for the first part of the split line
        t [ s [ 0 ] ]  =  t [ s [ 0 ] ] + 1

        // Increment the count for the second part of the split line
        t [ s [ 1 ] ]  =  t [ s [ 1 ] ] + 1
    }

    /*
     * After processing, 't' contains counts for each element.
     * Now, we extract the keys from 't' and sort them based on their values.
     * The sorting function ensures elements with smaller counts come first.
     */
    k = Object . keys ( t ) . sort ( function ( a , b )
    {
        return t [ a ] - t [ b ]
    } )


    // The last line of input contains a list of values 'c'
    // These values are also sorted in ascending order
    c = lines [ lines . length - 1 ] . split ( ' ' ) . sort ( function ( a , b )
    {
        return a - b
    } )


    // Assign the sorted values from 'c' to the elements in 't'
    // The assignment follows the order determined by 'k' (sorted by original counts)
    for  ( i = 0 ;  i < k . length ;  i++  )
    {
        t [ k [ i ] ]  =  c [ i ]
    }


    // Initialize a variable 'ans' to accumulate a sum
    ans = 0

    // Iterate through the processed lines again (excluding the last one)
    for  ( i = 0 ;  i < lines . length - 1 ;  i++  )
    {
        // Split the current line
        s = lines [ i ] . split ( ' ' )

        // Add the minimum of the assigned values for the two elements to 'ans'
        ans  +=  Math . min ( t [ s [ 0 ] ] , t [ s [ 1 ] ] )
    }


    // Output the final accumulated answer as a string
    console . log ( ans  +  '' )


    // Prepare the string representation of the assigned values in 't'
    // Start with the value for element 1
    ans = t [ 1 ]

    // Concatenate the values for subsequent elements, separated by spaces
    for  ( i = 2 ;  i <= k . length ;  i++  )
    {
        ans  =  ans  +  ' '  +  t [ i ]
    }

    // Output the concatenated string of assigned values
    console . log ( ans )
}

// Call the main function with input read from stdin
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;