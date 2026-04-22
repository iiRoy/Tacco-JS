let          parsedElements          =          prompt() . split ( ' ' ) . map ( Number ) ;

parsedElements . sort ( ( firstValue , secondValue ) => firstValue - secondValue ) ;

if (
       parsedElements [ 0 ] + parsedElements [ 1 ] === parsedElements [ 2 ]
    || parsedElements [ 0 ] === parsedElements [ 1 ] + parsedElements [ 2 ]
)
{
    console . log ( 'Yes' ) ;
}
else
{
    console . log ( 'No' ) ;
}