/*
 * This file serves as an aggregation point for core UI components.
 * It exports the Typeahead and Tokenizer modules for external consumption.
 *
 * This module was last updated on 2023-10-27.
 */


//  --- Module Dependencies Declaration Section ---
//
//  These are the external modules required by this file.
//  Each module is imported and assigned to a local variable.

var             Typeahead         =         require ( './typeahead' )         ;
var             Tokenizer         =         require ( './tokenizer' )         ;


//  --- Module Export Section ---
//
//  This object defines the public interface of this module.
//  It makes the imported components available when this file is required.

module.exports          =          {
    //  Exposes the Typeahead component, which provides auto-completion functionality.
    //  Key: 'Typeahead', Value: the imported Typeahead module.
    Typeahead:          Typeahead,

    //  Exposes the Tokenizer component, responsible for breaking down input into tokens.
    //  Key: 'Tokenizer', Value: the imported Tokenizer module.
    Tokenizer:          Tokenizer
};

//  --- End of Module Definition ---