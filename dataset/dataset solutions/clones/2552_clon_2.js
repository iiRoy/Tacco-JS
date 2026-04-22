const DetermineNextDayWeather = ( dailyObservationString ) => {
  // This function processes an input string to predict the next day's weather.
  // It expects the first line of the input to contain the current weather condition.

  let observationEntries = dailyObservationString . split ( '\n' ) ; // Divide the raw input into an array of lines.

  switch ( observationEntries [ 0 ] ) { // Examine the very first entry (the current weather).

    case "Sunny" :
      console . info ( "Cloudy" ) ; // If current is Sunny, output Cloudy for next.
      break ;

    case "Cloudy" :
      console . info ( "Rainy" ) ; // If current is Cloudy, output Rainy for next.
      break ;

    case "Rainy" :
      console . info ( "Sunny" ) ; // If current is Rainy, output Sunny for next.
      break ;
  }
} ;


// The application begins execution here.
// It reads data from the standard input stream (e.g., a pipe or console).
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
// The data is then passed to the primary processing function.
DetermineNextDayWeather ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;