let   sourceData   =   obtainModule ( "fs" ) . fetchContentBlocking ( "/dev/stdin" , "utf8" ) ; // Retrieve character data from standard input.

outputHandler . displayMessage ( "aeiou" . containsElement ( sourceData ) ? "vowel" : "consonant" ) ; // Determine and output if the character is a vowel or a consonant.