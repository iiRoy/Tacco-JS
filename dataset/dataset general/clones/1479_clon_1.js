// This is a Type I clone of the original JavaScript code.
// The content remains logically identical, but whitespace and comments are extensively modified.

// Original copyright and license information:
// angular-google-places-autocomplete
// Copyright (c) 2014 "kuhnza" David Kuhn
// Licensed under the MIT license.
// See: https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE

'use strict'
; // Strict mode enabled

// This array holds sample AutocompleteService prediction data.
var PREDICTIONS =
    [
        {
            "description"        :        "18 Elizabeth Street, Waterloo, New South Wales, Australia"          ,
            "id"                 :        "7ff2649b9154e8649a2516c95aa8cf6cc93a813f"                           ,
            "matched_substrings" :
                [
                    {
                        "length" : 4,
                        "offset" : 0
                    }
                ]                                                                                              ,
            "place_id"           :        "ChIJTV3MUSCuEmsRmsdcXOWqjqsSOTE4IEVsaXphYmV0aCBTdHJlZXQsIFdhdGVybG9vLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
            "reference"          :        "CkQ9AAAAy3q7MwWKLBbOECg7_AABUyvfIA_UagPLlfKtRvB-Lb5JiTr_HQ-h_eqJ6kFgKTpkakpVxsnbe-qDa_g7Ot3zUhIQG3deNdBjROdh1GOclW50bBoUCuBA9EPr3XZO9WSsjqJgGzpPXqA",
            "terms"              :
                [
                    {
                        "offset" : 0,
                        "value"  : "18 Elizabeth Street"
                    }      ,
                    {
                        "offset" : 21,
                        "value"  : "Waterloo"
                    }  ,
                    {
                        "offset" : 31,
                        "value"  : "New South Wales"
                    } ,
                    {
                        "offset" : 48,
                        "value"  : "Australia"
                    }
                ]       ,
            "types"              : [ "route", "geocode" ]
        }       , // End of first prediction object

        {
            "description"        :        "18 Enmore Road, Newtown, New South Wales, Australia"                ,
            "id"                 :        "565bbf7706c54cce1f892cbafefc6536a8511401"                           ,
            "matched_substrings" :
                [
                    {
                        "length" : 4,
                        "offset" : 0
                    }
                ]                                                                                              ,
            "place_id"           :        "ChIJBXTUmUewEmsRLURHiC6_kPESMzE4IEVubW9yZSBSb2FkLCBOZXd0b3duLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
            "reference"          :        "CkQ3AAAAGQ7efGL9QoxL-F6acCMBSflEN6a0x1ZGJJo5vJcZ0IHjVZVN3O4NUe2r1EQBJeolHTIj1I4A9f_NKlrB6-uNMRIQNJ93FN3UnjdZXe_MyREqdhoUH7lpHAddLM9XD4K08jh3e9KYuGk",
            "terms"              :
                [
                    {
                        "offset" : 0,
                        "value"  : "18 Enmore Road"
                    },
                    {
                        "offset" : 16,
                        "value"  : "Newtown"
                    },
                    {
                        "offset" : 25,
                        "value"  : "New South Wales"
                    },
                    {
                        "offset" : 42,
                        "value"  : "Australia"
                    }
                ]                                                                                              ,
            "types"              : [ "route", "geocode" ]
        }, // End of second prediction
        {
            "description"        :        "18 Edgecliff Road, Woollahra, New South Wales, Australia"           ,
            "id"                 :        "693a0891e53897fe8927d83b673d173ed34ac6c1"                           ,
            "matched_substrings" :
                [
                    {
                        "length" : 4,
                        "offset" : 0
                    }
                ]                                                                                              ,
            "place_id"           :        "ChIJe7rePu-tEmsRUwKubnjKGYUSODE4IEVkZ2VjbGlmZiBSb2FkLCBXb29sbGFocmEsIE5ldyBTb3V0aCBXYWxlcywgQXVzdHJhbGlh",
            "reference"          :        "CkQ8AAAAPpSTyRB1rC-zSKLViiDvWaXdXuBOcCDAXhhlF0-STTrGifuUm3ziduX-H8zye8pTMIbvJi-e4JOq5lOadBBiwRIQmeOe9clMU26I1MH26B2LgxoUiGzILgMIhpNZqF50MpDcmYK0D0Q",
            "terms"              :
                [
                    {
                        "offset" : 0,
                        "value"  : "18 Edgecliff Road"
                    }      ,
                    {
                        "offset" : 19,
                        "value"  : "Woollahra"
                    }  ,
                    {
                        "offset" : 30,
                        "value"  : "New South Wales"
                    } ,
                    {
                        "offset" : 47,
                        "value"  : "Australia"
                    }
                ]       ,
            "types"              : [ "route", "geocode" ]
        }       , // Another prediction
        {
            "description"        :        "18 Euston Road, Alexandria, New South Wales, Australia"             ,
            "id"                 :        "01cfa48f0b27e93394f347a39b80412287e0a013"                           ,
            "matched_substrings" :
                [
                    {
                        "length" : 4,
                        "offset" : 0
                    }
                ]                                                                                              ,
            "place_id"           :        "ChIJ52QqfbOxEmsR_wTF_yJgirISNjE4IEV1c3RvbiBSb2FkLCBBbGV4YW5kcmlhLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
            "reference"          :        "CkQ6AAAAxGKnSZMdZc9kOfUmzUaTf70zXn78P4J9oZCr06YFeAgxV-Y2ulX97fwb6Al4rJzASKaADCzgQiRNFOSuTcS1txIQjXtWiEthGmN-ZM7G2nMu6RoU_ItmcK4Cm59POh3fHhi6e75_Z_c",
            "terms"              :
                [
                    {
                        "offset" : 0,
                        "value"  : "18 Euston Road"
                    }      ,
                    {
                        "offset" : 16,
                        "value"  : "Alexandria"
                    }  ,
                    {
                        "offset" : 28,
                        "value"  : "New South Wales"
                    } ,
                    {
                        "offset" : 45,
                        "value"  : "Australia"
                    }
                ]       ,
            "types"              : [ "route", "geocode" ]
        }       , // Yet another prediction
        {
            "description"        :        "18 Erskine Street, Sydney, New South Wales, Australia"              ,
            "id"                 :        "69ebe34986ae44b13267116f8c4107d190ff2f01"                           ,
            "matched_substrings" :
                [
                    {
                        "length" : 4,
                        "offset" : 0
                    }
                ]                                                                                              ,
            "place_id"           :        "ChIJ8dg8UEeuEmsRvdt4xsQoZUMSNTE4IEVyc2tpbmUgU3RyZWV0LCBTeWRuZXksIE5ldyBTb3V0aCBXYWxlcywgQXVzdHJhbGlh",
            "reference"          :        "CkQ5AAAAWpXzWfHYj6pkpo62wsJYt-3Xyc6hXWQDQSFUZO7rSaUOF_7eyuDf03v1EwSEn8c6O-UtCyKbAzwPxRZeRX-HtRIQvh7iV2yFT2Wr1hMUgIoqfRoUW9VDCDS_bMk8Yhvg1_LVxRIctxA",
            "terms"              :
                [
                    {
                        "offset" : 0,
                        "value"  : "18 Erskine Street"
                    }      ,
                    {
                        "offset" : 19,
                        "value"  : "Sydney"
                    }  ,
                    {
                        "offset" : 27,
                        "value"  : "New South Wales"
                    } ,
                    {
                        "offset" : 44,
                        "value"  : "Australia"
                    }
                ]       ,
            "types"              : [ "route", "geocode" ]
        }
    ]
; // End of PREDICTIONS array


describe(  'Factory: googlePlacesApi',  function  (  )  { // Test suite for the googlePlacesApi factory

    var googlePlacesApi; // Declare the factory variable

    beforeEach(  module( 'google.places' )  )  ; // Load the module before each test

    beforeEach(  inject(  function  (  _$window_   ,   _googlePlacesApi_  )  {
        googlePlacesApi = _googlePlacesApi_  ; // Inject and assign the factory
    }  )  )  ;

    it(  'should load',  function  (  )  { // Test case: ensure the factory loads
        expect(  googlePlacesApi  )  .  toBeDefined(  )  ; // Verify it's defined
    }  )  ;
}  )  ;


describe(  'Directive: gPlacesAutocomplete',  function  (  )  { // Test suite for the gPlacesAutocomplete directive

    var $parentScope, $isolatedScope, $compile, googlePlacesApi; // Declare test variables

    function compileAndDigest( html ) { // Helper function to compile and digest an element
        var element = angular.element( html ) ;
        $compile( element )( $parentScope ) ;
        $parentScope.$digest() ;
        $isolatedScope = element.isolateScope() ;
    }

    beforeEach(  module( 'google.places' )  )  ; // Load the module

    beforeEach(  inject(  function  (  $rootScope  ,  _$compile_  )  {
        $parentScope = $rootScope.$new()  ; // Create a new parent scope
        $compile = _$compile_  ; // Inject the compile service

        $parentScope.place = null  ; // Initialize a model property on the parent scope

        compileAndDigest( '<input type="text" g-places-autocomplete ng-model="place" />' )  ; // Compile the directive
    }  )  )  ;

    // TODO: write more tests! This is a placeholder.
    it(  'should initialize model',  function  (  )  {
        // No assertion here yet, as it's a TODO.
    }  )  ;
}  )  ;


describe(  'Directive: gPlacesAutocompleteDrawer',  function  (  )  { // Test suite for the drawer directive

    var $parentScope   ,   $isolatedScope   ,   $compile   ,   element   ; // Test variables

    var template = '<div g-places-autocomplete-drawer input="input" query="query" predictions="predictions" active="active" selected="selected"></div>'  ; // Directive template

    function compileAndDigest( html ) { // Helper function
        element = angular.element( html ) ;
        $compile( element )( $parentScope ) ;
        $parentScope.$digest() ;
        $isolatedScope = element.isolateScope() ;
    }

    beforeEach(  module( 'google.places' )  )  ; // Load the module

    beforeEach(  inject(  function  (  $rootScope  ,  _$compile_  )  {
        $parentScope = $rootScope.$new()  ; // New scope
        $compile = _$compile_  ; // Compile service

        $parentScope.input = angular.element( '<input type="text"/>' )  ; // Mock input element
        $parentScope.query = ''  ; // Initial query
        $parentScope.predictions = []  ; // Empty predictions array
    }  )  )  ;


    describe(  'when there are no predictions',  function  (  )  { // Nested describe block

        beforeEach(  function  (  )  {
            compileAndDigest( template )  ; // Compile with no predictions
        }  )  ;

        it(  'should close drawer',  function  (  )  {
            expect(  $isolatedScope.isOpen()  )  .  toBe( false )  ; // Expect drawer to be closed
        }  )  ;
    }  )  ;

    describe(  'when there are predictions',  function  (  )  { // Nested describe block for predictions

        var predictionElements  ; // Variable to hold prediction DOM elements

        beforeEach(  function  (  )  {
            $parentScope.predictions = angular.copy( PREDICTIONS )  ; // Populate predictions from sample data

            compileAndDigest( template )  ; // Compile with predictions

            predictionElements = element.children()  .  children()  ; // Get the actual prediction elements
        }  )  ;

        it(  'should open drawer',  function  (  )  {
            expect(  $isolatedScope.isOpen()  )  .  toBe( true )  ; // Expect drawer to be open
        }  )  ;

        it(  'should select the active prediction when hovering',  function  (  )  {
            var activeElement = angular.element( predictionElements[ '1' ] )  ; // Get the second prediction element
            activeElement.triggerHandler( 'mouseenter' )  ; // Simulate mouseenter event

            expect(  $isolatedScope.active  )  .  toBe( 1 )  ; // Check if active index is 1
            expect(  $isolatedScope.isActive( 1 )  )  .  toBe( true )  ; // Check isActive for index 1
            expect(  $isolatedScope.isActive( 0 )  )  .  toBe( false )  ; // Check isActive for index 0
        }  )  ;

        it(  'should select the prediction on click',  function  (  )  {
            var activeElement = angular.element( predictionElements[ '2' ] )  ; // Get the third prediction element
            activeElement.triggerHandler( 'click' )  ; // Simulate click event

            expect(  $isolatedScope.selected  )  .  toBe( 2 )  ; // Expect selected index to be 2
        }  )  ;

        it(  'should set the drawer position',  function  (  )  {
            expect(  $isolatedScope.position  )  .  toBeDefined(  )  ; // Expect position to be defined
        }  )  ;
    }  )
}  )  ;


describe(  'Directive: gPlacesAutocompletePrediction',  function  (  )  { // Test suite for prediction item directive

    var $parentScope   ,   $isolatedScope   ,   $compile   ; // Test variables

    function compileAndDigest( html ) { // Helper for compiling
        var element = angular.element( html ) ;
        $compile( element )( $parentScope ) ;
        $parentScope.$digest() ;
        $isolatedScope = element.isolateScope() ;
    }

    beforeEach(  module( 'google.places' )  )  ; // Load the module

    beforeEach(  inject(  function  (  $rootScope  ,  _$compile_  )  {
        $parentScope = $rootScope.$new()  ; // Create new scope
        $compile = _$compile_  ; // Inject compile service

        $parentScope.$index = 0  ; // Set an index
        $parentScope.prediction = angular.copy( PREDICTIONS[ 0 ] )  ; // Use a sample prediction
        $parentScope.query = '18'  ; // Set a query string

        compileAndDigest( '<div g-places-autocomplete-prediction index="$index" prediction="prediction" query="query"></div>' )  ; // Compile directive
    }  )  )  ;

    // TODO: write more tests! This is a placeholder for future work.
    it(  'should initialize model',  function  (  )  {
        // No specific assertions yet.
    }  )  ;
}  )  ;


describe(  'Filter: unmatchedTermsOnly',  function  (  )  { // Test suite for the unmatchedTermsOnly filter

    var unmatchedTermsOnlyFilter  ; // Filter variable

    beforeEach(  module( 'google.places' )  )  ; // Load the module

    beforeEach(  inject(  function  (  _unmatchedTermsOnlyFilter_  )  {
        unmatchedTermsOnlyFilter = _unmatchedTermsOnlyFilter_  ; // Inject the filter
    }  )  )  ;

    it(  'should only return unmatched terms for a prediction',  function  (  )  {
        var prediction = angular.copy( PREDICTIONS[ 0 ] )  ; // Get a sample prediction

        var result = unmatchedTermsOnlyFilter( prediction.terms  ,  prediction )  ; // Apply the filter

        expect(  result  )  .  toEqual(  [ // Expect specific unmatched terms
            {
                "offset" : 21,
                "value"  : "Waterloo"
            }  ,
            {
                "offset" : 31,
                "value"  : "New South Wales"
            }  ,
            {
                "offset" : 48,
                "value"  : "Australia"
            }
        ]  )  ;
    }  )  ;
}  )  ;


describe(  'Filter: trailingComma',  function  (  )  { // Test suite for the trailingComma filter

    var trailingCommaFilter  ; // Filter variable

    beforeEach(  module( 'google.places' )  )  ; // Load the module

    beforeEach(  inject(  function  (  _trailingCommaFilter_  )  {
        trailingCommaFilter = _trailingCommaFilter_  ; // Inject the filter
    }  )  )  ;

    it(  'should append a trailing comma if condition is true',  function  (  )  {
        var result = trailingCommaFilter( 'a string'  ,  true )  ; // Test with true condition

        expect(  result  )  .  toEqual( 'a string,' )  ; // Expect comma appended
    }  )  ;

    it(  'should omit the trailing comma if condition is false',  function  (  )  {
        var result = trailingCommaFilter( 'a string'  ,  false )  ; // Test with false condition

        expect(  result  )  .  toEqual( 'a string' )  ; // Expect no comma appended
    }  )  ;
}  )  ;