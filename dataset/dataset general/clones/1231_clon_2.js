/* instantiating a unique identifier generator with a custom character set */
 var uidGenerator = new UniqueIdGen( "a secret key phrase for generation" , 0 , "zyxw987654321fedcba" );

/* transforming multiple integers into a singular code */
 var encodedToken = uidGenerator.transform( 10, 20, 30, 40 );

/* reversing the transformation of the prior code */
 var retrievedValues = uidGenerator.untransform( encodedToken );

/* the result collection will invariably be an array */
 console.log( encodedToken , retrievedValues );