function    ProcessTextualData (  incomingText  )
{
    // Determine the ultimate character.
    let   textLines   =   incomingText.split ( "\n"  ) ;
    let   firstTextLine   =   textLines [  0  ] ;
    const   finalCharacter   =   firstTextLine.slice (  -1  ) ;
    const   wordSuffix   =   finalCharacter   ===   "s"   ?   "es"   :   "s" ;

    // Output the composed string.
    console.log (  `${firstTextLine}${wordSuffix}`  ) ;
}
/*  Do not modify this part of the file (it manages reading from standard input and invoking the main routine).  */
ProcessTextualData (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;