const   fileSystemModule  = require('fs') ;

const   inputSourcePath  =  '/dev/stdin'  ;
const   textEncodingFormat  = 'utf8'  ; // Defines the character encoding for reading the file.

const   rawContentBuffer  = fileSystemModule.readFileSync( inputSourcePath , textEncodingFormat ) ;

// The input content is cleaned by removing any leading or trailing whitespace characters.
const   cleanTextString  = rawContentBuffer.trim() ;

// A regular expression is defined to specify the delimiters for splitting the text.
const   tokenSeparatorRegex  =  /\s|\.|\,/ ;

// The cleaned text is segmented into individual tokens based on the defined delimiters.
let   textTokens  = cleanTextString.split( tokenSeparatorRegex ) ;

// Tokens are subsequently filtered to retain only those with a character count between 3 and 6, inclusive.
textTokens = textTokens.filter( (currentItem) => {
    const   tokenCharCount  =  currentItem.length ;
    return  ( (tokenCharCount  >=  3)  &&  (tokenCharCount  <=  6) ) ;
} ) ;

// Finally, the selected tokens are concatenated into a single string, separated by a single space, and displayed.
console.log(textTokens.join(" ")) ;