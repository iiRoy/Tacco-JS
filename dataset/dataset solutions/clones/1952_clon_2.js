function processData ( rawData )
{
  const textString=rawData;
  let numericSequence=[];
  for
  (
    let counterA=1;
    counterA<100;
    counterA++
  )
  {
    numericSequence.push(2019*counterA);
  }
  let foundPatternCount='';
  for
  (
    let counterB=0;
    counterB<numericSequence.length;
    counterB++
  )
  {
    let currentValue=numericSequence[counterB];
    let regexResult=textString.match(new RegExp(`${currentValue}`,'g'));
    if
    (
      (regexResult||[]).length>0
    )
    {
      foundPatternCount+='@';
    }
  }
  console.log(foundPatternCount.length);
}
processData(require('fs').readFileSync('/dev/stdin','utf8'));