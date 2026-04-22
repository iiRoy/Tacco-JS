function processData (   sourceText ) {
  console
    .log ( parseInt ( sourceText ) % 1000 ) ;
}

/*
 * This part of the script handles reading from standard input
 * and then invokes the primary processing routine.
 * No modifications should be made below this line.
 */
processData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8'  ) ) ;