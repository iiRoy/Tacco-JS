const sourceData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( / \n / );

for ( let lineIdx = 0 ; lineIdx < sourceData.length ; lineIdx ++ )
{
  const lineElements = sourceData [ lineIdx ] . split ( / \s / );
  let evalStack = [];

  for ( let elementIdx = 0 ; elementIdx < lineElements.length ; elementIdx ++ )
  {
    const currentElement = lineElements [ elementIdx ];

    switch ( currentElement )
    {
      case '+' :
        evalStack.push ( evalStack.pop() + evalStack.pop() );
        break;
      case '-' :
        evalStack.push ( -evalStack.pop() + evalStack.pop() );
        break;
      case '*' :
        evalStack.push ( evalStack.pop() * evalStack.pop() );
        break;
      case '/' :
        evalStack.push ( 1 / evalStack.pop() * evalStack.pop() );
        break;
      default :
        evalStack.push ( isNaN ( currentElement ) ? 0 : parseFloat ( currentElement ) );
    }
  }

  console.log ( evalStack [ 0 ] . toFixed ( 6 ) );
}