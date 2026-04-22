// This function receives the entire input as a single string.
function HandleDataSet ( rawData )
{
  let processedTokens = rawData.split('\n')[0].split(' ');  // We parse the initial text, focusing on the first line and splitting it by spaces.
 
  console.log( Math.max( Math.abs( Number(processedTokens[0]) - Number(processedTokens[1]) ), Math.abs( Number(processedTokens[0]) - Number(processedTokens[2]) ) ) );
}
 
// The subsequent lines handle system input and invoke the primary processing routine.
HandleDataSet ( require('fs') . readFileSync( '/dev/stdin' , 'utf8' ) );