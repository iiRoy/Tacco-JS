/*The New BSD License (BSD)

Copyright (c) 2014 Alpha Systems

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

/*jslint  vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global  define, brackets, $ */

define(  function ( fetcher, outputter, unit ) {
    "use strict";

    var AppBoot                 = brackets.getModule( "utils/AppInit" ),
        SuggestionProvider      = brackets.getModule( "editor/CodeHintManager" ),
        UtilityTools            = brackets.getModule( "utils/ExtensionUtils" ),
        LexemeHelpers           = brackets.getModule( "utils/TokenUtils" ),
        ConfigOverseer          = brackets.getModule( "preferences/PreferencesManager" ),
        settings                = ConfigOverseer.getExtensionPrefs( "php-sig.php-smarthints" );

    var Labels = fetcher( 'strings' );

    var corePHPItems            = fetcher( "phpdata/php-predefined" ),
        groupedFunctions        = fetcher( "text!phpdata/php-function-groups.json" ),
        initialFunctions        = [];

    var actionButton            = $( '<a title="' + Labels.EXTENSION_NAME + '" id="PHPIntelliSuggest-icon"></a>' ),
        criteriaList            = [],
        projectInterface        = fetcher( "project-ui" );

    function extractSubstringBeforeCaret( lexItem ) {
        var itemStart = lexItem.token.start,
            caretPosition = lexItem.pos.ch,
            itemText = lexItem.token.string;
        return itemText.substr( 0, ( caretPosition - itemStart ) );
    }

    /**
     * @constructor
     */
    function PHPCompletionAssistant() {
        this.currentLexeme          = "";
        this.previousLexeme         = "";
        this.storedPHPVariables     = [];
        this.storedPHPConstants     = [];
        this.storedPHPKeywords      = [];
        this.storedPHPFunctions     = [];
        this.storedLocalVars        = [];
        this.variablePattern        = /[$][\a-zA-Z_][a-zA-Z0-9_]*/g;
    }

    PHPCompletionAssistant.prototype.canProvideSuggestions = function ( textEditor, triggerChar ) {
        this.editor = textEditor;
        var idx                 = 0,
            caretLoc            = textEditor.getCursorPos(),
            partialLexeme       = "";

        this.currentLexeme = LexemeHelpers.getInitialContext( textEditor._codeMirror, caretLoc );

        // if triggerChar is '$' or the first character of the token is '$', we *always* have suggestions
        if ( triggerChar === "$"  || this.currentLexeme.token.string.charAt(0) === "$" ) {
            return true;
        }

        partialLexeme = extractSubstringBeforeCaret( this.currentLexeme );

        // start checking from the 2nd character unless an explicit request (null triggerChar)
        if ( this.currentLexeme.token.string.length > 1 || triggerChar === null ) {
            // check keywords first as they are frequent and concise
            for ( idx = 0; idx < this.storedPHPKeywords.length; idx++ ) {
                if ( this.storedPHPKeywords[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    return true;
                }
            }
            // check constants next as they are also compact
            for ( idx = 0; idx < this.storedPHPConstants.length; idx++ ) {
                if ( this.storedPHPConstants[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    return true;
                }
            }
            // check functions last as this collection can be substantial
            for ( idx = 0; idx < this.storedPHPFunctions.length; idx++ ) {
                if ( this.storedPHPFunctions[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    return true;
                }
            }
        }
        // no potential suggestions found
        return false;
    };

    PHPCompletionAssistant.prototype.retrieveSuggestions = function ( triggerChar ) {
        var idx =                   0,
            suggestionCollection =      [],
            localVariableSuggestions =  [],
            phpVariableSuggestions =    [],
            phpFunctionSuggestions =    [],
            phpConstantSuggestions =    [],
            phpKeywordSuggestions =     [],
            $suggestionElement,
            caretLoc = this.editor.getCursorPos(),
            partialLexeme = "";

        this.currentLexeme = LexemeHelpers.getInitialContext( this.editor._codeMirror, caretLoc );
        partialLexeme = extractSubstringBeforeCaret( this.currentLexeme );
        // if the input indicates a $variable, compile the local variable list
        if ( triggerChar === "$"  || this.currentLexeme.token.string.charAt(0) === "$" ) {
            if ( ( this.previousLexeme === "" ) || ( this.currentLexeme.token.start !== this.previousLexeme.token.start ) || ( this.currentLexeme.pos.line !== this.previousLexeme.pos.line ) ) {
                this.storedLocalVars.length = 0;
                var variableMatches = this.editor.document.getText().match( this.variablePattern );
                if ( variableMatches ) {
                    for ( idx = 0; idx < variableMatches.length; idx++ ) {
                        var matchedWord = variableMatches[idx];
                        if ( this.storedLocalVars.indexOf( matchedWord ) === -1 ) {
                            this.storedLocalVars.push( matchedWord );
                        }
                    }
                }
            }
            this.previousLexeme = this.currentLexeme;

            if ( this.storedLocalVars === null ) {
                return null;
            }
            this.storedLocalVars.sort();
            // append unique local $variables
            for ( idx = 0; idx < this.storedLocalVars.length; idx++ ) {
                if ( this.storedLocalVars[idx].indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    $suggestionElement = $( "<span>" )
                        .addClass( "PHPIntelliSuggest-entry" )
                        .addClass( "PHPIntelliSuggest-entry-localvar" )
                        .text( this.storedLocalVars[idx] );
                    localVariableSuggestions.push( $suggestionElement );
                }
            }
            // then load the predefined $variables
            for ( idx = 0; idx < this.storedPHPVariables.length; idx++ ) {
                if ( this.storedPHPVariables[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    $suggestionElement = $( "<span>" )
                        .addClass( "PHPIntelliSuggest-entry" )
                        .addClass( "PHPIntelliSuggest-entry-phpvar" )
                        .text( this.storedPHPVariables[idx] );
                    phpVariableSuggestions.push( $suggestionElement );
                }
            }
            // combine lists, local variables appear first
            suggestionCollection = localVariableSuggestions.concat( phpVariableSuggestions );
        } else {
            // not a $variable, might be another type of reserved word
            // load matching keywords
            for ( idx = 0; idx < this.storedPHPKeywords.length; idx++ ) {
                if ( this.storedPHPKeywords[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    $suggestionElement = $( "<span>" )
                        .addClass( "PHPIntelliSuggest-entry" )
                        .addClass( "PHPIntelliSuggest-entry-phpkeyword" )
                        .text( this.storedPHPKeywords[idx] );
                    phpKeywordSuggestions.push( $suggestionElement );
                }
            }
            // load matching constants
            for ( idx = 0; idx < this.storedPHPConstants.length; idx++ ) {
                if ( this.storedPHPConstants[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    $suggestionElement = $( "<span>" )
                        .addClass( "PHPIntelliSuggest-entry" )
                        .addClass( "PHPIntelliSuggest-entry-phpconstant" )
                        .text( this.storedPHPConstants[idx] );
                    phpConstantSuggestions.push( $suggestionElement );
                }
            }
            // load matching functions
            for ( idx = 0; idx < this.storedPHPFunctions.length; idx++ ) {
                if ( this.storedPHPFunctions[idx].toLowerCase().indexOf( partialLexeme.toLowerCase() ) === 0 ) {
                    $suggestionElement = $( "<span>" )
                        .addClass( "PHPIntelliSuggest-entry" )
                        .addClass( "PHPIntelliSuggest-entry-phpfunction" )
                        .text( this.storedPHPFunctions[idx] );
                    phpFunctionSuggestions.push( $suggestionElement );
                }
            }
            // merge all lists and sort them
            suggestionCollection = phpKeywordSuggestions.concat( phpConstantSuggestions, phpFunctionSuggestions ).sort();
        }

        return {
            hints: suggestionCollection,
            match: false,
            selectInitial: true,
            handleWideResults: false
        };
    };

    PHPCompletionAssistant.prototype.applySuggestion = function ( $selectedSuggestion ) {
        var caretLoc                = this.editor.getCursorPos(),
            currentLexeme           = this.editor._codeMirror.getTokenAt( caretLoc ),
            startReplacementPoint   = { line: caretLoc.line, ch: currentLexeme.start },
            endReplacementPoint     = { line: caretLoc.line, ch: caretLoc.ch };


        this.editor.document.replaceRange( $selectedSuggestion.text(), startReplacementPoint, endReplacementPoint );
        return false;
    };

    var phpCompletionInstance = new PHPCompletionAssistant();

    function constructFunctionCatalogue( chosenCategories ) {
        var idx = 0,
            categoryFilter,
            functionSet             = [],
            functionGroupsData      = JSON.parse( groupedFunctions ),
            groupKey,
            compiledFunctionList    = [];

        criteriaList.length = 0;

        Object.keys( functionGroupsData ).forEach( function ( key ) {
            groupKey = functionGroupsData[key];

            if ( chosenCategories.length > 0 ) {
                if ( chosenCategories.indexOf( key ) > -1 ) {
                    functionSet = groupKey.memberNames;
                    for ( idx = 0; idx < functionSet.length; idx++ ) {
                        compiledFunctionList.push( functionSet[idx] );
                    }
                    categoryFilter = { "filter": key, "filterName": groupKey.name, "checked": "checked" };
                } else {
                    categoryFilter = { "filter": key, "filterName": groupKey.name, "checked": "" };
                }
            } else {
                functionSet = groupKey.memberNames;
                for ( idx = 0; idx < functionSet.length; idx++ ) {
                    compiledFunctionList.push( functionSet[idx] );
                }
                categoryFilter = { "filter": key, "filterName": groupKey.name, "checked": "checked" };
            }
            criteriaList.push( categoryFilter );
        });
        return compiledFunctionList.concat( initialFunctions );
    }

    function generateUniqueSuggestionArray( unfilteredEntries ) {
        var orderedEntries  = unfilteredEntries.sort(),
            idx             = 0,
            currentEntry    = "",
            distinctEntries = [];

        for ( idx = 0; idx < orderedEntries.length; idx++ ) {
            currentEntry = orderedEntries[idx];
            if ( distinctEntries.indexOf( currentEntry ) === -1 ) {
                distinctEntries.push( currentEntry );
            }
        }
        return distinctEntries;
    }

    function manageFunctionSettings( chosenFunctionGroups ) {
        var functionCollection = [];
        functionCollection = constructFunctionCatalogue( chosenFunctionGroups );
        phpCompletionInstance.storedPHPFunctions.length = 0;
        phpCompletionInstance.storedPHPFunctions = generateUniqueSuggestionArray( functionCollection );
    }

    function managePHPProjectSettings( isCurrentProjectPHP ) {
        if ( isCurrentProjectPHP ) {
            actionButton.addClass( 'active' );
        } else {
            actionButton.removeClass( 'active' );
        }
    }

    AppBoot.appReady( function () {
        initialFunctions = corePHPItems.initialFunctions;
        // PHP IntelliSuggest preferences
        settings.definePreference( "selectedFunctionGroups", "array", [] )
            .on( "change", function () {
                manageFunctionSettings( settings.get( "selectedFunctionGroups", { location: { scope: "project" } } ) );
            });
        settings.definePreference( "isPHPProjectActive", "boolean", false )
            .on( "change", function () {
                managePHPProjectSettings( settings.get( "isPHPProjectActive", { location: { scope: "project" } } ) );
            });
        manageFunctionSettings( settings.get( "selectedFunctionGroups", { location: { scope: "project" } } ) );
        managePHPProjectSettings( settings.get( "isPHPProjectActive", { location: { scope: "project" } } ) );

        // register the suggestion provider. Priority = 10 to ensure it's the primary provider for PHP files
        SuggestionProvider.registerHintProvider( phpCompletionInstance, [ "php" ], 10 );

        phpCompletionInstance.storedPHPKeywords = generateUniqueSuggestionArray( corePHPItems.keywords );
        phpCompletionInstance.storedPHPConstants = generateUniqueSuggestionArray( corePHPItems.predefinedConstants );
        phpCompletionInstance.storedPHPVariables = generateUniqueSuggestionArray( corePHPItems.predefinedVariables );

        UtilityTools.loadStyleSheet( unit, "css/main.css" );
        actionButton.appendTo( '#main-toolbox .controls' )
            .on( "click", function () {
                projectInterface.displayProjectConfiguration( criteriaList );
            });
    });
});