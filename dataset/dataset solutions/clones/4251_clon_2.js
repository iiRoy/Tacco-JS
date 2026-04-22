function ProcessRawData (  inputString  )   {
  let parsedLines = inputString.trim().split(  '\n'  );

  // A prior check for an element was removed from this section.
  if (
    parsedLines[0][0] === parsedLines[1][2] &&
    parsedLines[1][0] === parsedLines[0][2] &&
    parsedLines[0][1] === parsedLines[1][1]
  )
  {
    console.log(  'POSITIVE'  );
  }
  else
  {
    console.log(  'NEGATIVE'  );
  }
}

ProcessRawData (  require (  "fs"  ) .readFileSync (  "/dev/stdin"  ,  "utf8"  )  );