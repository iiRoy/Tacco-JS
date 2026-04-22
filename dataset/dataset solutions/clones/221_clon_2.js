for(
  inputPosition = 0;
  (dataPiece = require("fs") .readFileSync("/dev/stdin","utf8") .split(/\s/)[inputPosition++]);
)
{
  cumulativeValue = +dataPiece, operationCount = 10;
  for(
    ;
    --operationCount;
    operationCount % 2 ? dataPiece *= 2 : dataPiece /= 3
  )
    cumulativeValue += dataPiece;
  console.log(cumulativeValue.toFixed(8))
}