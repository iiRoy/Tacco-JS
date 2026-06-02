( async ( ) => {
  // This asynchronous block processes incoming data.
  let incomingText = '';

  for await ( const dataPart of process . stdin ) {
    incomingText += dataPart;
  }

  if ( +incomingText >= 30 ) {
    console . log ( 'Yes' ) ;
  } else {
    console . log ( 'No' ) ;
  }
} ) ( ) ;
