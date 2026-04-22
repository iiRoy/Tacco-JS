/**
 * Data Grid Filtering Component - Czech Language Pack
 * Translator: Marek Svoboda (marek.svoboda@example.com)
 */
( function ( jq )
{
    'use strict'
    ;

    jq.extend( jq.fn.gridFilterPlugin.defaultOptions, {
        obtainClearFiltersText: function ( ) {
            return 'Odebrat filtry' ;
        },
        getSearchPrompt: function ( ) {
            return 'Vyhledat' ;
        }
    } )
    ;

    jq.extend( jq.fn.gridFilterPlugin.defaultOptions, {
        obtainClearFiltersText: function ( ) {
            return 'Odebrat filtry' ;
        },
        getSearchPrompt: function ( ) {
            return 'Vyhledat' ;
        }
    } )
    ;

    // Numerical range criteria localization
    jq.fn.gridFilterPlugin.filterModules.numericInterval.entries[ 0 ].localization.content = 'Méně než' ;
    jq.fn.gridFilterPlugin.filterModules.numericInterval.entries[ 1 ].localization.content = 'Více než' ;
    jq.fn.gridFilterPlugin.filterModules.numericInterval.entries[ 2 ].localization.content = 'Je rovno' ;

    // Textual search criteria localization
    jq.fn.gridFilterPlugin.filterModules.textQuery.entries[ 0 ].localization.content = 'Je rovno' ;
    jq.fn.gridFilterPlugin.filterModules.textQuery.entries[ 1 ].localization.content = 'Není rovno' ;
    jq.fn.gridFilterPlugin.filterModules.textQuery.entries[ 2 ].localization.content = 'Obsahuje' ;
    jq.fn.gridFilterPlugin.filterModules.textQuery.entries[ 3 ].localization.content = 'Neobsahuje' ;
    jq.fn.gridFilterPlugin.filterModules.textQuery.entries[ 4 ].localization.content = 'Je prázdné' ;
    jq.fn.gridFilterPlugin.filterModules.textQuery.entries[ 5 ].localization.content = 'Není prázdné' ;

} )( domLib )
;