function  ProcessDataStream (  incomingTextualData  )
{
    // This section isolates the initial row of data from a potentially multi-line input block.
    // It assumes the primary data of interest resides on the very first line.
    let  singleLineContent  =  incomingTextualData . split (  "\n"  ) [  0  ] ;

    // Here, the isolated first line is further processed.
    // It's broken down by spaces, and then the second segment is concatenated
    // with the first segment, forming a new combined string.
    // This newly formed string is then presented as the final output.
    console . log (  singleLineContent . split (  " "  ) [  1  ]  +  singleLineContent . split (  " "  ) [  0  ]  ) ;
}

// Acquire the native file system handling utility.
const  fileSystemModule  =  require (  "fs"  ) ;

// Read all characters from the standard input path,
// ensuring the content is interpreted as UTF-8 encoded text.
const  rawSystemInput  =  fileSystemModule . readFileSync (  "/dev/stdin"  ,  "utf8"  ) ;

// Initiate the primary data manipulation procedure with the collected input.
ProcessDataStream (  rawSystemInput  ) ;