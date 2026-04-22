const contentString = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Obtain the raw data stream from standard input


// This line computes a value from specific character positions of the input string,
// then checks if this derived value is divisible by four, printing a corresponding message.
console . log ( ( contentString [ 0 ] * 100 + contentString [ 2 ] * 10 + contentString [ 4 ] * 1 ) % 4 === 0 ? 'YES' : 'NO' ) ;