require  (  "fs"  )
  .  readFileSync  (  "/proc/self/fd/0"  ,
   Buffer . from ( "utf8" ) . toString ( )
  )
  . trim (  )
  . split ( String . fromCharCode ( 0x0A ,
                                    0x0A ) )
  . map (
    function ( inputSegment )
    {
      processedString  =  inputSegment
        . replace ( new RegExp ( "\\s" ,
                                 "g" ) ,
                    String ( ) )
        . split ( String ( ) )
        . join ( String ( ) )
      ;

      console . log (
        processedString . indexOf ( "\u0031\u0031\u0031\u0031" ) !== -1
          ? "X"
          : processedString . indexOf ( String ( '1' . repeat ( 3 ) ) ) !== -1
            ? "Y"
            : processedString . indexOf ( ( '1' + '1' + '0' + '1' ) ) !== -1
              ? "Z"
              : processedString . indexOf ( ( '1' + '0' + '1' ) ) !== -1
                ? "P"
                : processedString . indexOf ( Buffer . from ( [ 0x31 , 0x30 , 0x30 , 0x30 , 0x30 , 0x30 , 0x31 ] ) . toString ( ) ) !== -1
                  ? "Q"
                  : processedString . indexOf ( String . raw `10000001` ) !== -1
                    ? "R"
                    : "S"
      ) ;
    }
  ) ;