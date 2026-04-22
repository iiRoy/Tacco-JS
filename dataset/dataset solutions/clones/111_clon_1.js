require ( "fs" )
  . readFileSync (
    "/dev/stdin" ,
    "utf8"
  )
    . split ( '\n' )

    . some (
      function ( i ) {

        // Split the current line 'i' by space to get two parts.
        // The result is assigned to 'c'.
        c = i . split ( ' ' ) ;

        // Assign the first part to 'm' (month) and the second to 'd' (day).
        // This uses the comma operator within a single statement.
        m = c [ 0 ] ,
        d = c [ 1 ] ;

        // Check if the month 'm' is not zero.
        // A month of 0 is treated as a termination condition or invalid input.
        if ( m != 0 )
        {
          // Array containing the prefixes for the days of the week.
          // The index corresponds to the value returned by Date.prototype.getDay()
          // (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
          const dayNames = [
            'Sun' ,
            'Mon' ,
            'Tues' ,
            'Wednes' ,
            'Thurs' ,
            'Fri' ,
            'Satur'
          ] ;

          // Create a new Date object for the year 2004,
          // using the given month (m-1 because months are 0-indexed in Date),
          // and the given day.
          // Then, get the day of the week (0-6).
          const dayOfWeek = new Date ( 2004 , m - 1 , d ) . getDay ( ) ;

          // Log the full day name to the console by
          // concatenating the prefix from the array with "day".
          console . log (
            dayNames [ dayOfWeek ] + 'day'
          ) ;
        }
        // The `some` method continues iterating through all elements
        // because the callback function implicitly returns `undefined` (a falsy value).
      }
    )
;