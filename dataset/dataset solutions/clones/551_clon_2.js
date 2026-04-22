( ( input_source ) => {
  // This section processes the initial raw text input.
  const input_lines = input_source.split( '\n' ) ;

  // The first line indicates the quantity of data entries to follow.
  const entry_count = Number.parseInt( input_lines.shift() , 10 ) ;

  // A new associative array (object) is established to hold key-value mappings.
  const mapping_store = { } ;

  // Iteratively populate the mapping_store based on the specified entry_count.
  for ( let idx = 0 ; idx < entry_count ; ++idx ) {
    // Each subsequent line provides a key and its corresponding value, separated by a space.
    const current_pair = input_lines.shift().split( ' ' ) ;
    mapping_store[ current_pair[ 0 ] ] = current_pair[ 1 ] ; // Assign the value to its key.
  }

  // A specific line in the input stream is intentionally skipped or discarded here.
  input_lines.shift() ;

  // The remaining input items are processed by consulting the mapping_store.
  const processed_output = input_lines.map( ( current_item ) => {
    // If an item exists as a key in our mapping, its mapped value is used; otherwise, the item itself is retained.
    return current_item in mapping_store ? mapping_store[ current_item ] : current_item ;
  } ) ;

  // The final collection of processed items is concatenated into a single string and printed to standard output,
  // followed by a newline character for proper termination.
  console.log( processed_output.join( '' ) + '\n' ) ;

} ) ( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;