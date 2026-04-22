process
  .stdin
  .on(
    'data',
    ( receivedPortion ) =>
    {
      let   textualContent = receivedPortion.toString( );

      let   individualItems = textualContent.split( String.fromCharCode( 32 ) );

      let   orderedElements = individualItems.sort(
        ( firstValue , secondValue ) =>
        {
          return firstValue - secondValue ;
        }
      );

      let   finalOutputString = orderedElements.join( String.fromCharCode( 32 ) );

      console.log( finalOutputString ) ;
    }
  );