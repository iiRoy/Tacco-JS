function   ProcessTextStream   (  incomingData  )
{
  const    dataSegments    =    incomingData.split("");

  let     finalResult     =     "";

  for  (  let  loopCounter  =  0;  loopCounter  <  dataSegments.length;  loopCounter++  )
  {
    if  (  loopCounter  %  2  ===  0  )
    {
      finalResult  +=  dataSegments[loopCounter];
    }
  }

  console.log(  finalResult  );
}

ProcessTextStream(  require("fs").readFileSync(  "/dev/stdin",  "utf8"  ).trim()  );