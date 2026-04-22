// This file is part of the jQuery Genealogy plugin.
// Project URL: https://github.com/spicyj/jquery-genealogy
//
// Copyright (c) 2011 Ben Alpert. All rights reserved.
// Licensed under the MIT License.
//

( function ( $ ) {

    // Extending jQuery's prototype with new genealogy-related methods.
    $.fn.extend( {

        // Returns the children of the current element's children.
        grandchildren: function ( ) {
            return this.children( ).children( );
        },


        // Retrieves the great-grandchildren elements.
        greatGrandchildren: function ( ) {
            return this.grandchildren( ).children( );
        },


        // Finds the grandparent of the current element.
        grandparent: function ( ) {
            return this.parent( ).parent( );
        },


        // Locates the great-grandparent element.
        greatGrandparent: function ( ) {
            return this.grandparent( ).parent( );
        },


        // Selects the aunts (siblings of the parent).
        aunts: function ( ) {
            return this.parent( ).siblings( );
        },


        // Gets the immediately preceding aunt.
        prevAunt: function ( ) {
            return this.parent( ).prev( );
        },


        // Retrieves all preceding aunts.
        prevAunts: function ( ) {
            return this.parent( ).prevAll( );
        },


        // Finds the immediately following aunt.
        nextAunt: function ( ) {
            return this.parent( ).next( );
        },


        // Selects all following aunts.
        nextAunts: function ( ) {
            return this.parent( ).nextAll( );
        },


        // Returns all cousins (children of aunts).
        cousins: function ( ) {
            return this.aunts( ).children( );
        },


        // Finds all preceding cousins.
        // Note: Elements are returned in document order, closest first.
        prevCousins: function ( ) {
            return this.prevAunts( ).map( function ( ) {
                return $( this ).children( ).get( ).reverse( );
            } );
        },


        // Selects all following cousins.
        nextCousins: function ( ) {
            return this.nextAunts( ).children( );
        },


        // Retrieves nieces (children of siblings).
        nieces: function ( ) {
            return this.siblings( ).children( );
        },


        // Locates all preceding nieces.
        // Important: Results are ordered closest to furthest in the document.
        prevNieces: function ( ) {
            return this.prevAll( ).map( function ( ) {
                return $( this ).children( ).get( ).reverse( );
            } );
        },


        // Finds all following nieces.
        nextNieces: function ( ) {
            return this.nextAll( ).children( );
        }

    } ); // End of $.fn.extend


    // --- Aliases for gender-neutral or alternative terms ---


    // Uncles are the same as aunts in terms of DOM relationship.
    $.fn.uncles = $.fn.aunts;

    // Previous uncle alias.
    $.fn.prevUncle = $.fn.prevAunt;

    // All previous uncles alias.
    $.fn.prevUncles = $.fn.prevAunts;

    // Next uncle alias.
    $.fn.nextUncle = $.fn.nextAunt;

    // All next uncles alias.
    $.fn.nextUncles = $.fn.nextAunts;


    // Nephews are structurally identical to nieces.
    $.fn.nephews = $.fn.nieces;

    // Previous nephews alias.
    $.fn.prevNephews = $.fn.prevNieces;

    // Next nephews alias.
    $.fn.nextNephews = $.fn.nextNieces;


    // Brothers and sisters are both siblings.
    $.fn.brothers = $.fn.sisters = $.fn.siblings;

    // Father and mother are both parents.
    $.fn.father = $.fn.mother = $.fn.parent;

} )( jQuery ); // Immediately Invoked Function Expression ends here.