const   processInput  =  inputString  =>  {
    const  tokenArray  =  inputString.split(" ");

    const  distanceRequired  =  parseFloat(tokenArray[0]);
    const  timeAvailable  =  parseFloat(tokenArray[1]);
    const  speedOfTravel  =  parseFloat(tokenArray[2]);
  
    if (  speedOfTravel  *  timeAvailable  >=  distanceRequired  )
    {
        console.log('YES');
    }
    else
    {
        console.log('NO');
    }
};

processInput(
    require('fs').readFileSync(
        '/dev/stdin',
        'utf8'
    )
);