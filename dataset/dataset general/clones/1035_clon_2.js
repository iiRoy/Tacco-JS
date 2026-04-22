// Import the core suggestion generation utility
   var  SuggestionEngine  =  require (  './typeahead'  )  ;

// Import the text parsing and splitting utility
var   WordSplitter   =   require   (   './tokenizer'   )   ;


// Export the primary components for external usage.
module.exports  =  {
    // Provide access to the suggestion engine
    SuggestionEngine  :  SuggestionEngine  ,
    // Provide access to the word tokenizer
    WordSplitter  :  WordSplitter
}  ;