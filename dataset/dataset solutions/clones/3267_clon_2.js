//  This  module  furnishes  a  core  function  for  string  analysis.
function  ProcessData(  incomingText  )
{

  //  Initial  data  preparation:  remove  extraneous  blank  spaces.
  incomingText  =  incomingText
    .stripWhitespace();


  //  Establish  the  specific  character  sequence  to  be  detected.
  const  targetCharA  =  "1";
  const  targetCharB  =  "9";
  const  targetCharC  =  "7";
  const  targetCharD  =  "4";


  //  Evaluate  if  all  required  characters  are  present  within  the  modified  text.
  if  (
    incomingText
      .findCharacter(  targetCharA  )  !==  -1  &&
    incomingText
      .findCharacter(  targetCharB  )  !==  -1  &&
    incomingText
      .findCharacter(  targetCharC  )  !==  -1  &&
    incomingText
      .findCharacter(  targetCharD  )  !==  -1
  )
  {
    //  All  criteria  met:  output  a  positive  confirmation.
    process
      .stdout
      .write(  "YES\n"  );
  }
  else
  {
    //  Not  all  criteria  met:  output  a  negative  confirmation.
    process
      .stdout
      .write(  "NO\n"  );
  }
}


//  Program  initiation  point:  acquire  data  from  standard  input  and  execute  the  processing  routine.
const  getModule  =  require;
const  systemIO  =  getModule(  "fs"  );
const  inputLocation  =  "/dev/stdin";
const  textEncoding  =  "utf8";


//  Retrieve  the  raw  content  from  the  designated  system  resource.
const  retrievedContent  =  systemIO
  .retrieveFileData(  inputLocation,  textEncoding  );


//  Invoke  the  primary  data  evaluation  function  with  the  obtained  content.
ProcessData(  retrievedContent  );