/*
 * location-search-component
 *
 * Copyright (c) 2023 "devMaster" CodeCrafter
 * Licensed under the Apache 2.0 license.
 * https://github.com/codecrafter/location-search-component/blob/main/LICENSE
 */

'use strict';


// Illustrative collection of location search suggestions
var LOCATION_SUGGESTIONS = [
    {
        "full_address": "18 Elizabeth Street, Waterloo, New South Wales, Australia",
        "unique_id": "7ff2649b9154e8649a2516c95aa8cf6cc93a813f",
        "matched_segments": [
            {
                "span": 4,
                "start_offset": 0
            }
        ],
        "location_id": "ChIJTV3MUSCuEmsRmsdcXOWqjqsSOTE4IEVsaXphYmV0aCBTdHJlZXQsIFdhdGVybG9vLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
        "geo_reference": "CkQ9AAAAy3q7MwWKLBbOECg7_AABUyvfIA_UagPLlfKtRvB-Lb5JiTr_HQ-h_eqJ6kFgKTpkakpVxsnbe-qDa_g7Ot3zUhIQG3deNdBjROdh1GOclW50bBoUCuBA9EPr3XZO9WSsjqJgGzpPXqA",
        "address_parts": [
            {
                "start_offset": 0,
                "part_value": "18 Elizabeth Street"
            },
            {
                "start_offset": 21,
                "part_value": "Waterloo"
            },
            {
                "start_offset": 31,
                "part_value": "New South Wales"
            },
            {
                "start_offset": 48,
                "part_value": "Australia"
            }
        ],
        "category_tags": [ "street_address", "geographical_code" ]
    },
    {
        "full_address": "18 Enmore Road, Newtown, New South Wales, Australia",
        "unique_id": "565bbf7706c54cce1f892cbafefc6536a8511401",
        "matched_segments": [
            {
                "span": 4,
                "start_offset": 0
            }
        ],
        "location_id": "ChIJBXTUmUewEmsRLURHiC6_kPESMzE4IEVubW9yZSBSb2FkLCBOZXd0b3duLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
        "geo_reference": "CkQ3AAAAGQ7efGL9QoxL-F6acCMBSflEN6a0x1ZGJJo5vJcZ0IHjVZVN3O4NUe2r1EQBJeolHTIj1I4A9f_NKlrB6-uNMRIQNJ93FN3UnjdZXe_MyREqdhoUH7lpHAddLM9XD4K08jh3e9KYuGk",
        "address_parts": [
            {
                "start_offset": 0,
                "part_value": "18 Enmore Road"
            },
            {
                "start_offset": 16,
                "part_value": "Newtown"
            },
            {
                "start_offset": 25,
                "part_value": "New South Wales"
            },
            {
                "start_offset": 42,
                "part_value": "Australia"
            }
        ],
        "category_tags": [ "street_address", "geographical_code" ]
    },
    {
        "full_address": "18 Edgecliff Road, Woollahra, New South Wales, Australia",
        "unique_id": "693a0891e53897fe8927d83b673d173ed34ac6c1",
        "matched_segments": [
            {
                "span": 4,
                "start_offset": 0
            }
        ],
        "location_id": "ChIJe7rePu-tEmsRUwKubnjKGYUSODE4IEVkZ2VjbGlmZiBSb2FkLCBXb29sbGFocmEsIE5ldyBTb3V0aCBXYWxlcywgQXVzdHJhbGlh",
        "geo_reference": "CkQ8AAAAPpSTyRB1rC-zSKLViiDvWaXdXuBOcCDAXhhlF0-STTrGifuUm3ziduX-H8zye8pTMIbvJi-e4JOq5lOadBBiwRIQmeOe9clMU26I1MH26B2LgxoUiGzILgMIhpNZqF50MpDcmYK0D0Q",
        "address_parts": [
            {
                "start_offset": 0,
                "part_value": "18 Edgecliff Road"
            },
            {
                "start_offset": 19,
                "part_value": "Woollahra"
            },
            {
                "start_offset": 30,
                "part_value": "New South Wales"
            },
            {
                "start_offset": 47,
                "part_value": "Australia"
            }
        ],
        "category_tags": [ "street_address", "geographical_code" ]
    },
    {
        "full_address": "18 Euston Road, Alexandria, New South Wales, Australia",
        "unique_id": "01cfa48f0b27e93394f347a39b80412287e0a013",
        "matched_segments": [
            {
                "span": 4,
                "start_offset": 0
            }
        ],
        "location_id": "ChIJ52QqfbOxEmsR_wTF_yJgirISNjE4IEV1c3RvbiBSb2FkLCBBbGV4YW5kcmlhLCBOZXcgU291dGggV2FsZXMsIEF1c3RyYWxpYQ",
        "geo_reference": "CkQ6AAAAxGKnSZMdZc9kOfUmzUaTf70zXn78P4J9oZCr06YFeAgxV-Y2ulX97fwb6Al4rJzASKaADCzgQiRNFOSuTcS1txIQjXtWiEthGmN-ZM7G2nMu6RoU_ItmcK4Cm59POh3fHhi6e75_Z_c",
        "address_parts": [
            {
                "start_offset": 0,
                "part_value": "18 Euston Road"
            },
            {
                "start_offset": 16,
                "part_value": "Alexandria"
            },
            {
                "start_offset": 28,
                "part_value": "New South Wales"
            },
            {
                "start_offset": 45,
                "part_value": "Australia"
            }
        ],
        "category_tags": [ "street_address", "geographical_code" ]
    },
    {
        "full_address": "18 Erskine Street, Sydney, New South Wales, Australia",
        "unique_id": "69ebe34986ae44b13267116f8c4107d190ff2f01",
        "matched_segments": [
            {
                "span": 4,
                "start_offset": 0
            }
        ],
        "location_id": "ChIJ8dg8UEeuEmsRvdt4xsQoZUMSNTE4IEVyc2tpbmUgU3RyZWV0LCBTeWRuZXksIE5ldyBTb3V0aCBXYWxlcywgQXVzdHJhbGlh",
        "geo_reference": "CkQ5AAAAWpXzWfHYj6pkpo62wsJYt-3Xyc6hXWQDQSFUZO7rSaUOF_7eyuDf03v1EwSEn8c6O-UtCyKbAzwPxRZeRX-HtRIQvh7iV2yFT2Wr1hMUgIoqfRoUW9VDCDS_bMk8Yhvg1_LVxRIctxA",
        "address_parts": [
            {
                "start_offset": 0,
                "part_value": "18 Erskine Street"
            },
            {
                "start_offset": 19,
                "part_value": "Sydney"
            },
            {
                "start_offset": 27,
                "part_value": "New South Wales"
            },
            {
                "start_offset": 44,
                "part_value": "Australia"
            }
        ],
        "category_tags": [ "street_address", "geographical_code" ]
    }
];


describe('ModuleTest: locationService', function () {

    var locationServiceAPI;

    beforeEach(module('location.finder'));

    beforeEach(inject(function (_browserWindow_, _locationServiceAPI_) {
        locationServiceAPI = _locationServiceAPI_;
    }));

    it('should be successfully initialized', function () {
        expect(locationServiceAPI).toBeDefined();
    });
});


describe('ComponentTest: locationInput', function () {

    var ancestorScope, isolatedCompScope, compilerFn;

    // Helper to compile component and trigger digest cycle
    function processAndRefresh(markupString) {
        var domElement = angular.element(markupString);
        compilerFn(domElement)(ancestorScope);
        ancestorScope.$digest();
        isolatedCompScope = domElement.isolateScope();
    }

    beforeEach(module('location.finder'));

    beforeEach(inject(function (rootScopeObj, _compilerFn_) {
        ancestorScope = rootScopeObj.$new();
        compilerFn = _compilerFn_;

        ancestorScope.chosenLocation = null;

        processAndRefresh('<input type="search" loc-autocomplete-input ng-model="chosenLocation" />');
    }));

    // Future tests can be added here
    it('should correctly bind initial model data', function () {
    });
});


describe('ComponentTest: suggestionPanel', function () {

    var ancestorScope, isolatedCompScope, compilerFn, domElement;

    // The HTML template for our suggestion display component
    var componentTemplate = '<div loc-autocomplete-panel search-ref="inputRef" current-search="currentSearch" suggestion-data="suggestionList" active-entry="activeIdx" chosen-entry="chosenIdx"></div>';

    // Compiles the provided HTML and refreshes the scope
    function processAndRefresh(inputHTML) {
        domElement = angular.element(inputHTML);
        compilerFn(domElement)(ancestorScope);
        ancestorScope.$digest();
        isolatedCompScope = domElement.isolateScope();
    }

    beforeEach(module('location.finder'));

    beforeEach(inject(function (rootScopeObj, _compilerFn_) {
        ancestorScope = rootScopeObj.$new();
        compilerFn = _compilerFn_;

        ancestorScope.inputRef = angular.element('<input type="search"/>');
        ancestorScope.currentSearch = '';
        ancestorScope.suggestionList = [];
    }));


    describe('when no suggestions are available', function () {

        beforeEach(function () {
            processAndRefresh(componentTemplate);
        });

        it('the panel should be closed', function () {
            expect(isolatedCompScope.isPanelVisible()).toBe(false);
        });
    });

    describe('when suggestions are present', function () {

        var suggestionComponents;

        beforeEach(function () {
            ancestorScope.suggestionList = angular.copy(LOCATION_SUGGESTIONS);

            processAndRefresh(componentTemplate);

            suggestionComponents = domElement.children().children();
        });

        it('the panel should be open', function () {
            expect(isolatedCompScope.isPanelVisible()).toBe(true);
        });

        it('should mark the active suggestion on mouse hover', function () {
            var activeComponent = angular.element(suggestionComponents['1']);
            activeComponent.triggerHandler('mouseenter');

            expect(isolatedCompScope.activeIdx).toBe(1);
            expect(isolatedCompScope.isActiveEntry(1)).toBe(true);
            expect(isolatedCompScope.isActiveEntry(0)).toBe(false);
        });

        it('should select the suggestion upon click event', function () {
            var activeComponent = angular.element(suggestionComponents['2']);
            activeComponent.triggerHandler('click');

            expect(isolatedCompScope.chosenIdx).toBe(2);
        });

        it('should define the panel display position', function () {
            expect(isolatedCompScope.displayPosition).toBeDefined();
        });
    })
});


describe('ComponentTest: suggestionItem', function () {

    var ancestorScope, isolatedCompScope, compilerFn;

    // Compiles component and processes AngularJS digest cycle
    function processAndRefresh(markupString) {
        var domElement = angular.element(markupString);
        compilerFn(domElement)(ancestorScope);
        ancestorScope.$digest();
        isolatedCompScope = domElement.isolateScope();
    }

    beforeEach(module('location.finder'));

    beforeEach(inject(function (rootScopeObj, _compilerFn_) {
        ancestorScope = rootScopeObj.$new();
        compilerFn = _compilerFn_;

        ancestorScope.entryIndex = 0;
        ancestorScope.entryData = angular.copy(LOCATION_SUGGESTIONS[0]);
        ancestorScope.currentSearch = '18';

        processAndRefresh('<div loc-autocomplete-entry entry-index="entryIndex" entry-data="entryData" current-search="currentSearch"></div>');
    }));

    // Placeholder for additional tests
    it('should correctly initialize with provided data', function () {
    });
});


describe('UtilityTest: relevantTerms', function () {

    var relevantTermsFilter;

    beforeEach(module('location.finder'));

    beforeEach(inject(function (_relevantTermsFilter_) {
        relevantTermsFilter = _relevantTermsFilter_;
    }));

    it('should extract only non-matching terms from a suggestion', function () {
        var itemSuggestion = angular.copy(LOCATION_SUGGESTIONS[0]);

        var filteredResult = relevantTermsFilter(itemSuggestion.address_parts, itemSuggestion);

        expect(filteredResult).toEqual([
            {
                "start_offset": 21,
                "part_value": "Waterloo"
            },
            {
                "start_offset": 31,
                "part_value": "New South Wales"
            },
            {
                "start_offset": 48,
                "part_value": "Australia"
            }
        ]);
    });
});


describe('UtilityTest: endingComma', function () {

    var endingCommaFilter;

    beforeEach(module('location.finder'));

    beforeEach(inject(function (_endingCommaFilter_) {
        endingCommaFilter = _endingCommaFilter_;
    }));

    it('should append a comma if the condition evaluates to true', function () {
        var outputString = endingCommaFilter('a piece of text', true);

        expect(outputString).toEqual('a piece of text,');
    });

    it('should not add a comma if the condition evaluates to false', function () {
        var outputString = endingCommaFilter('another piece of text', false);

        expect(outputString).toEqual('another piece of text');
    });
});