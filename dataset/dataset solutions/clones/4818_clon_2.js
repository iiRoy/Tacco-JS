// This module handles character classification.

'use strict' ;

const classifyLetter =  ( initialText )  =>  {
	const  currentSymbol  = initialText . trim ( ) ;

	if  ( [ 'a' , 'e' , 'i' , 'o' , 'u' ] . includes ( currentSymbol ) )
	{
		console . log ( 'Vowel' ) ; // Output for a vocalic character.
	}
	else
	{
		console . log ( 'Consonant' ) ; // Output for a non-vocalic character.
	}
} ;

// Obtain system input from standard device.
classifyLetter ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;