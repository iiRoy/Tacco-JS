var  sourceContent =  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' );

var dataEntries = sourceContent.  trim() . split  (  '\n'  );

while   ( dataEntries.length  !==  0  )
{
	console.log ( Math . ceil ( Math . pow ( +dataEntries.shift() ,  2 )  +  1 ) ) ;
}