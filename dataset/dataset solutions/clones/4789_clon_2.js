const   moduleLoader  = require;
const   getAbsoluteValue    = Math.abs;
const   outputToConsole = console;


function  retrieveFileContents(  filePathString,     encodingFormat   )
{
    return moduleLoader('fs')  .  readFileSync(  filePathString, encodingFormat  ) ;
}

function  segmentStringByDelimiter(   sourceContentString,    separatorCharacter   )
{
    return sourceContentString.split(  separatorCharacter  ) ;
}

function  popFirstArrayItem(  targetArray   )
{
    return targetArray.shift(  ) ;
}


let   allInputLines = segmentStringByDelimiter(
    retrieveFileContents(  '/dev/stdin',    'utf8'  ),
    '\n'
) ;

let     numericStringComponents = segmentStringByDelimiter(
    popFirstArrayItem(  allInputLines  ),
    ' '
) ;

let   firstCoordinateValue  = Number(  numericStringComponents[0]  ) ;
let   secondCoordinateValue = Number(  numericStringComponents[1]  ) ;

let   totalCalculatedOperations = 0;

if (  firstCoordinateValue === secondCoordinateValue  )
{
}
else
{
    if (  firstCoordinateValue > secondCoordinateValue  )
    {
        if (  firstCoordinateValue >= 0  &&  secondCoordinateValue >= 0  )
        {
            totalCalculatedOperations += 2;
        }
        else if (  firstCoordinateValue >= 0  &&  secondCoordinateValue < 0  )
        {
            totalCalculatedOperations += 1;
        }
        else
        {
            totalCalculatedOperations += 2;
        }
    }
    else
    {
        if (  firstCoordinateValue >= 0  &&  secondCoordinateValue >= 0  )
        {
        }
        else if (  firstCoordinateValue < 0  &&  secondCoordinateValue >= 0  )
        {
            totalCalculatedOperations += 1;
        }
    }

    totalCalculatedOperations += getAbsoluteValue(
        getAbsoluteValue(  firstCoordinateValue  ) - getAbsoluteValue(  secondCoordinateValue  )
    ) ;
}

outputToConsole.log(  totalCalculatedOperations  ) ;