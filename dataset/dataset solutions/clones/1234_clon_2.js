let inputSourceData = require('fs') . readFileSync (
  '/dev/stdin', 'utf8'
) . split (
  "\n"
) . map (
  Number
);

inputSourceData . forEach (
  function ( currentElement ) {

    if ( currentElement != '0 0' ) {

      console . log (
        currentElement
          . split ( ' ' )
          . sort ( )
          . join ( ' ' )
      );
    }
  }
);