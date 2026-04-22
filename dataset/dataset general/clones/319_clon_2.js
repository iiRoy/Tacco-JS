const classificationMap = {
    paramList:    [ ( function ( ) { return arguments; } ) ( ) ],
    itemCollection:   [ [ 1, 2, 3 ] ],
    binaryFlag:      [ false, true ],
    timestamp:       [ new Date ( ) ],
    domNode:         [ document.createElement ( 'div' ) ],
    boundedNum:       [ Infinity, -Infinity ],
    procedure:      [ function ( ) { } ],
    notANumber:         [ NaN ],
    nothing:          [ null ],
    numericVal:      [ 0, 1, 1.22, -1.33 ],
    genericObj:       [ window, Math ],
    simpleObj:    [ { firstKey: 1, secondKey: 2 } ],
    regexPattern:     [ / ( . ) / ],
    textString:     [ 'Ocean Predator' ],
    unsetVal:    [ undefined ]
};

const truthyClassificationMap = {
    paramList:    [ ( function ( ) { return arguments; } ) ( ) ],
    itemCollection:   [ [ 1, 2, 3 ] ],
    binaryFlag:      [ true ],
    timestamp:       [ new Date ( ) ],
    domNode:         [ document.createElement ( 'span' ) ],
    boundedNum:       [ Infinity, -Infinity ],
    procedure:      [ function ( ) { } ],
    numericVal:      [ 1, 1.22, -1.33 ],
    genericObj:       [ window, Math ],
    simpleObj:    [ { firstKey: 1, secondKey: 2 } ],
    regexPattern:     [ / ( . ) / ],
    textString:     [ 'Ocean Predator' ],
};

const sampleDataCollection = {
    sectionAlpha: {
        alpha_first: [ 1, 2 ],
        alpha_second: [ ],
        alpha_third: {
            alpha_three_one: [ 1, 2 ],
            alpha_three_two_func: function ( ) { return 'alpha_three_two_result'; },
            alpha_three_three_nan: NaN,
            alpha_three_four_null: null,
            alpha_three_five_num: 99,
            alpha_three_six_math: Math,
            alpha_three_seven_str: 'Azure',
            alpha_three_eight_undef: undefined,
            alpha_three_nine_regex: / ( . ) / g
        },
        alpha_fourth_bool: false,
        alpha_fifth_bool: true,
        alpha_sixth: {
            alpha_six_one_bool: true,
            alpha_six_two_func: function ( ) { return 'alpha_six_two_outcome'; },
            alpha_six_three_date: new Date ( ),
            alpha_six_four_elem: document.createElement ( 'p' )
        },
        alpha_seventh_func: function ( ) { return 'alpha_seven_outcome'; },
        alpha_eighth_date: new Date ( ),
        alpha_ninth_elem: document.createElement ( 'a' ),
        alpha_tenth_nan: NaN,
        alpha_eleventh_null: null,
        alpha_twelfth_num: 99,
        alpha_thirteenth_math: Math,
        alpha_fourteenth_str: 'Azure',
        alpha_fifteenth_undef: undefined,
        alpha_sixteenth_regex: / ( . ) / g
    },
    sectionBeta: [ 1, 2, 3 ],
    sectionGamma: false,
    sectionDelta: function ( ) { return 'delta_outcome'; },
    sectionEpsilon: new Date ( ),
    sectionZeta: document.createElement ( 'img' ),
    sectionEta: NaN,
    sectionTheta: null,
    sectionIota: 99,
    sectionKappa: Math,
    sectionLambda: 'Crimson',
    sectionMu: undefined,
    sectionNu: / ( . ) / g
};

// ARRAY OPERATIONS
scenario ( "fetchAt", function ( ) {
    verifyDeepEquality ( util.fetchAt ( [ 1, 2, 3 ], 1 ), [ 2 ], 'yields an array containing the item at a specific numeric index' );

    verifyDeepEquality ( util.fetchAt ( [ 1, 2, 3 ], [ 0, 1 ] ), [ 1, 2 ], 'produces an array with items at specified indices when an array of indices is provided' );

    verifyDeepEquality ( util.fetchAt ( [ 1, 2, 3, [ 4, 5, 6 ] ], [ 0, 1 ], true ), [ 1, 2, 4, 5 ], 'recursively retrieves items at indices when an array of indices is supplied' );

    verifyDeepEquality ( util.fetchAt ( [ 1, 2, [ 3 ] ], 0, true ), [ 1, 3 ], 'recursively retrieves items at a single index when a numeric index is supplied' );

    verifyDeepEquality ( util.fetchAt ( [ 1, 2, [ 3, [ 4, 5, [ 6, 7 ] ] ] ], 0, 2 ), [ 1, 3 ], 'recursively retrieves items at a single index up to a certain depth' );
} );

scenario ( "pruneFalsy", function ( ) {
    verifyDeepEquality ( util.pruneFalsy ( [ 0, null, undefined, '', NaN, false, { }, [ ], 'Crimson' ] ), [ { }, [ ], 'Crimson' ], 'removes all falsy values from the array' );

    verifyDeepEquality ( util.pruneFalsy ( [ 0, null, undefined, '', NaN, false, { }, [ ], 'Crimson' ], true ), [ 'Crimson' ], 'eliminates all falsy values, including empty arrays and object literals' );

    verifyDeepEquality ( util.pruneFalsy ( [ 0, 1, false, [ 2, [ ], 3, { } ] ], true, true ), [ 1, [ 2, [ ], 3, { } ], 2, 3 ], 'recursively removes all falsy values, empty arrays, and empty objects' );

    verifyDeepEquality ( util.pruneFalsy ( [ 0, 1, false, [ 2, [ ], 3, { } ] ], false, true ), [ 1, [ 2, [ ], 3, { } ], 2, [ ], 3, { } ], 'recursively removes only falsy values' );

    verifyDeepEquality ( util.pruneFalsy ( [ 0, 1, false, [ 2, [ ], 3, { } ] ], true, 1 ), [ 1, [ 2, [ ], 3, { } ] ], 'recursively prunes falsy values up to a specified level' );
} );

scenario ( "findDiscrepancy", function ( ) {
    verifyDeepEquality ( util.findDiscrepancy ( [ 'Crimson', 'Emerald', 'Azure' ], [ 'Crimson', 'Emerald' ] ), [ 'Azure' ], 'finds values present in the target array but not in comparison array(s)' );

    verifyDeepEquality ( util.findDiscrepancy ( [ 1, 2, 3 ], [ 2, 3, 4 ], [ 3, 4, 5 ] ), [ 1 ], 'identifies unique values in the primary array across multiple comparison arrays' );

    verifyDeepEquality ( util.findDiscrepancy ( [ 1, 2, 3, [ 6 ] ], [ 2, 3, 4 ], [ 3, 4, 5 ], true ), [ 1, 6 ], 'recursively finds distinct values in the target array, including nested elements' );

    verifyDeepEquality ( util.findDiscrepancy ( [ 1, 2, 3, [ 6, [ 7 ] ] ], [ 2, 3, 4 ], [ 3, 4, 5 ], 1 ), [ 1, [ 6, [ 7 ] ] ], 'recursively finds distinct values up to a specific depth in the target array' );
} );

scenario ( "getLeading", function ( ) {
    verifyDeepEquality ( util.getLeading ( [ 1, 2, 3 ] ), [ 1 ], 'obtains an array containing the initial value from the target array' );

    verifyDeepEquality ( util.getLeading ( [ 1, 2, 3 ], 2 ), [ 1, 2 ], 'obtains an array containing the first N values from the target array' );

    verifyDeepEquality ( util.getLeading ( [ 1, 2, 3 ], 2 ), [ 1, 2 ], 'obtains an array containing the first N values from the target array and nested arrays' );

    verifyDeepEquality ( util.getLeading ( [ 1, 2, 3, [ 4, 5, 6, [ 7, 8, 9 ] ] ], 1, true ), [ 1, 4, 7 ], 'obtains an array containing the first N values from the target array and nested arrays up to a specific depth' );
} );

scenario ( "locateIndex", function ( ) {
    verifyDeepEquality ( util.locateIndex ( [ 1, 2, 3 ], 2 ), 1, 'returns the index of the first occurrence of the specified value' );

    verifyDeepEquality ( util.locateIndex ( [ 1, 2, 3, 1, 2, 3 ], 2, 3 ), 4, 'returns the index of the first occurrence of the value, starting search after a given index' );

    verifyDeepEquality ( util.locateIndex ( [ 1, 2, [ 3 ] ], 3, true ), '2.0', 'returns the deep path string for the first matching nested value' );
} );

scenario ( "getInitialElements", function ( ) {
    verifyDeepEquality ( util.getInitialElements ( [ 1, 2, 3 ] ), [ 1, 2 ], 'returns all elements except the last one in the collection' );

    verifyDeepEquality ( util.getInitialElements ( [ 1, 2, 3 ], 2 ), [ 1 ], 'returns all elements except the last N elements in the collection' );

    verifyDeepEquality ( util.getInitialElements ( [ 1, 2, 3, [ 4, 5, 6 ] ], 2, true ), [ 1, 2, 4 ], 'recursively returns all but the last N elements in the collection' );
} );

scenario ( "findOverlap", function ( ) {
    verifyDeepEquality ( util.findOverlap ( [ 1, 2, 3, 4 ], [ 1, 2, 101, 102 ] ), [ 1, 2 ], 'produces an array containing values common to all input arrays' );

    verifyDeepEquality ( util.findOverlap ( [ 7, 8, 9 ], [ 9, 10, 11 ] ), [ 9 ], 'produces an array containing common values from intersecting sets' );

    verifyDeepEquality ( util.findOverlap ( [ 7, 8, 9 ], [ [ 9 ], 10, 11 ], true ), [ 9 ], 'produces an array containing common values, including those within nested arrays' );
} );

scenario ( "getTrailing", function ( ) {
    verifyDeepEquality ( util.getTrailing ( [ 1, 2, 3 ] ), [ 3 ], 'returns an array with the final value from the target collection' );

    verifyDeepEquality ( util.getTrailing ( [ 1, 2, 3 ], 2 ), [ 2, 3 ], 'returns an array with the last N values from the target collection' );

    verifyDeepEquality ( util.getTrailing ( [ 1, 2, 3, [ 4, 5, 6 ] ], 2, true ), [ 2, 3, 5, 6 ], 'returns an array with the last N values from the target collection, including nested values' );
} );

scenario ( "locateLastIndex", function ( ) {
    verifyDeepEquality ( util.locateLastIndex ( [ 1, 2, 3, 1, 2, 3 ], 3 ), 5, 'returns the last index where the target value is found in the array' );

    verifyDeepEquality ( util.locateLastIndex ( [ 'MotorsCorp', 'AutoWorks', 'MotorsCorp', 'JapanMotors', 'MotoCorp' ], 'MotorsCorp', 2 ), 2, 'returns the last index of the target value, searching backward from Nth element' );

    verifyDeepEquality ( util.locateLastIndex ( [ 'MotorsCorp', 'AutoWorks', [ 'MotorsCorp', 'JapanMotors', 'MotoCorp' ] ], 'MotorsCorp', 2, true ), "2.0", 'returns the deep path string for the last matching nested value, searching backward from Nth element' );
} );

scenario ( "createObject", function ( ) {
    verifyDeepEquality ( util.createObject ( [ 'firstKey', 1, 'secondKey', 2, 'thirdKey', 3 ] ), { firstKey: 1, secondKey: 2, thirdKey: 3 }, 'successfully constructs an object from a single array, alternating keys and values' );

    verifyDeepEquality ( util.createObject ( [ 'firstKey', 'secondKey', 'thirdKey' ], [ 1, 2, 3 ] ), { firstKey: 1, secondKey: 2, thirdKey: 3 }, 'successfully constructs an object from two arrays, one for keys and one for values' );

    verifyDeepEquality ( util.createObject ( [ 'firstKey', 1 ], [ 'secondKey', 2 ], [ 'thirdKey', 3 ] ), { firstKey: 1, secondKey: 2, thirdKey: 3 }, 'successfully constructs an object from multiple arrays, where each array provides a key-value pair' );

    verifyDeepEquality ( util.convertToObj ( [ 'firstKey', 1, 'secondKey', 2, 'thirdKey', 3 ] ), { firstKey: 1, secondKey: 2, thirdKey: 3 }, 'successfully aliased with convertToObj' );
} );

scenario ( "getRemaining", function ( ) {
    verifyDeepEquality ( util.getRemaining ( [ 1, 2, 3 ] ), [ 2, 3 ], 'returns an array containing all elements after the first element of the target array' );

    verifyDeepEquality ( util.getRemaining ( [ 1, 2, 3 ] ), [ 2, 3 ], 'returns an array containing all elements after the first element of the target array (re-test)' );

    verifyDeepEquality ( util.getRemaining ( [ 1, 2, 3 ], 2 ), [ 3 ], 'returns an array containing all elements after the Nth element of the target array' );

    verifyDeepEquality ( util.getRemainder ( [ 1, 2, 3 ], 2 ), [ 3 ], 'successfully aliased with getRemainder' );

    verifyDeepEquality ( util.getRemaining ( [ 1, 2, [ 3, 4, 5 ] ], 1, true ), [ 2, 4, 5 ], 'recursively returns an array containing all elements after the Nth element of the target array' );
} );

scenario ( "combineUnique", function ( ) {
    verifyDeepEquality ( util.combineUnique ( [ 1, 2, 3 ], [ 2, 3, 4 ], [ 3, 4, 5 ] ), [ 1, 2, 3, 4, 5 ], 'returns an array containing the union of unique values from all provided arrays' );
} );

scenario ( "uniqueElements", function ( ) {
    verifyDeepEquality ( util.uniqueElements ( [ 1, 2, 3, 4, 5, 6, 1, 2, 3 ] ), [ 1, 2, 3, 4, 5, 6 ], 'returns an array with non-duplicate simple values from the target array' );

    verifyDeepEquality ( util.uniqueElements ( [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 1, 2, 3 ], [ 4, 5, 6 ] ] ), [ [ 1, 2, 3 ], [ 4, 5, 6 ] ], 'returns an array with non-duplicate complex values from the target array' );

    verifyDeepEquality ( util.uniqueElements ( [ 1, 2, 3, 3 ], function ( itemVal ) { return itemVal * 2; } ), [ 2, 4, 6 ], 'returns an array with unique computed values based on an iterator function' );

    verifyDeepEquality ( util.uniqueElements ( [ 1, 2, 3, 3 ], function ( itemVal ) { return itemVal * this.factor; }, { factor: 3 } ), [ 3, 6, 9 ], 'returns an array with unique computed values using an iterator bound to a context object' );

    verifyDeepEquality ( util.uniqueElements ( [ 1, 1, 2, 2, [ 3, 3, 4, 4 ] ], true ), [ 1, 2, 3, 4 ], 'recursively returns an array with non-duplicate simple values from the target array' );
} );

scenario ( "excludeValues", function ( ) {
    verifyDeepEquality ( util.excludeValues ( [ 1, 2, 3, 4 ], [ 3, 4 ] ), [ 1, 2 ], 'returns an array containing all values except those present in the exclusion array' );

    verifyDeepEquality ( util.excludeValues ( [ [ 1 ], [ 2 ], [ 3 ], [ 4 ] ], [ [ 3 ], [ 4 ] ] ), [ [ 1 ], [ 2 ] ], 'returns an array containing all complex values except those in the exclusion array' );

    verifyDeepEquality ( util.excludeValues ( [ 1, 2, 3, 4 ], [ 3, [ 4 ] ], true ), [ 1, 2 ], 'recursively returns an array containing all values except those in the exclusion array' );

    verifyDeepEquality ( util.omit ( [ 1, 2, 3, 4 ], [ 3, [ 4 ] ], true ), [ 1, 2 ], 'successfully aliased with omit' );
} );

scenario ( "interleave", function ( ) {
    verifyDeepEquality ( util.interleave ( [ 'Crimson', 'Azure' ], [ '#F00', '#00F' ] ), [ [ "Crimson", "#F00" ], [ "Azure", "#00F" ] ], 'returns a new array formed by interleaving elements from multiple arrays' );
} );

// COLLECTION OPERATIONS
scenario ( "insertValue", function ( ) {
    verifyDeepEquality ( util.insertValue ( [ 1, 2, 3 ], 3, 4 ), [ 1, 2, 3, 4 ], 'successfully adds a value to an array at a specific index' );

    verifyDeepEquality ( util.insertValue ( { 0: 1, 1: 2, 2: 3 }, 3, 4 ), { 0: 1, 1: 2, 2: 3, 3: 4 }, 'successfully adds a value to an object literal at a given key' );

    verifyDeepEquality ( util.insertValue ( [ 1, 2, 3 ], 2, 4 ), [ 1, 2, 3 ], 'does not add a value to an array if the index already exists' );

    verifyDeepEquality ( util.insertValue ( [ 1, 2, [ ] ], 0, 3, true ), [ 1, 2, [ 3 ] ], 'recursively inserts a value at a specified index in a nested array' );

    verifyDeepEquality ( util.insertValue ( { 0: 1, 1: 2, 2: 3, 4: { } }, 3, 4, true ), { 0: 1, 1: 2, 2: 3, 3: 4, 4: { 3: 4 } }, 'successfully recursively adds a value to a nested object literal at a given key' );
} );

scenario ( "checkAll", function ( ) {
    verifyEquality ( util.checkAll ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal ); } ), true, 'all members of the array passed the predicate test' );

    verifyEquality ( util.checkAll ( { 0: 1, 1: 1 }, function ( itemVal ) { return util.isNumeric ( itemVal ); } ), true, 'all members of the object literal passed the predicate test' );

    verifyEquality ( util.checkAll ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal * this.factor ); }, { factor: 2 } ), true, 'all members passed the predicate test when bound to a specific scope' );

    verifyEquality ( util.testEvery ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal ); } ), true, 'successfully aliased with testEvery' );

    verifyEquality ( util.checkAll ( [ 1, 2, 3, [ 4, 5, 6 ] ], function ( itemVal ) { return util.isNumeric ( itemVal ); }, true ), true, 'all members (including deep members) in the array passed the predicate test' );

    verifyEquality ( util.checkAll ( { 0: 1, 1: { 0: 1, 1: 2 } }, function ( itemVal ) { return util.isNumeric ( itemVal ); }, true ), true, 'all members (including deep members) in the object literal passed the predicate test' );
} );

scenario ( "checkAny", function ( ) {
    verifyEquality ( util.checkAny ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal ); } ), true, 'at least one member of the array passed the predicate test' );

    verifyEquality ( util.checkAny ( { 0: 1, 1: 1 }, function ( itemVal ) { return util.isNumeric ( itemVal ); } ), true, 'at least one member of the object literal passed the predicate test' );

    verifyEquality ( util.checkAny ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal * this.factor ); }, { factor: 2 } ), true, 'at least one member passed the predicate test when bound to a specific scope' );

    verifyEquality ( util.testSome ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal ); } ), true, 'successfully aliased with testSome' );

    verifyEquality ( util.checkAny ( [ 1, 2, 3, [ 4, 5, 6 ] ], function ( itemVal ) { return util.isNumeric ( itemVal ); }, true ), true, 'at least one member (including deep members) in the array passed the predicate test' );

    verifyEquality ( util.checkAny ( { 0: 1, 1: { 0: 1, 1: 2 } }, function ( itemVal ) { return util.isNumeric ( itemVal ); }, true ), true, 'at least one member (including deep members) in the object literal passed the predicate test' );
} );

scenario ( "calculateMean", function ( ) {
    verifyEquality ( util.calculateMean ( [ 1, 2, 3 ] ), 2, 'the average value of an array was successfully computed' );

    verifyEquality ( util.calculateMean ( { 0: 1, 1: 2, 2: 3 } ), 2, 'the average value of an object literal\'s values was successfully computed' );

    verifyEquality ( util.calculateMean ( [ 1, 2, [ 3 ] ], true ), 2, 'the average value of an array with nested members was computed' );

    verifyEquality ( util.calculateMean ( [ 1, 2, [ 3 ] ], function ( itemVal ) { return itemVal * 2; }, true ), 4, 'the average value of an array with deep members was computed after applying a callback function' );
} );

scenario ( "emptyContents", function ( ) {
    verifyDeepEquality ( util.emptyContents ( [ 1, 2 ] ), [ undefined, undefined ], 'an array of values was successfully cleared to undefined' );

    verifyDeepEquality ( util.emptyContents ( { 0: 1, 1: 2 } ), { 0: undefined, 1: undefined }, 'an object literal\'s values were successfully cleared to undefined' );
} );

scenario ( "duplicateStructure", function ( ) {
    verifyDeepEquality ( util.duplicateStructure ( [ 1, 2, [ 3 ] ] ), [ 1, 2, [ 3 ] ], 'an array was successfully shallow cloned' );

    verifyDeepEquality ( util.duplicateStructure ( { 0: 1, 1: 2 } ), { 0: 1, 1: 2 }, 'an object literal was successfully shallow cloned' );

    const originalArray = [ 1, 2, [ 3 ] ];
    const clonedDeepArray = util.duplicateStructure ( originalArray, true );
    originalArray [ 2 ] [ 0 ] = 4;
    verifyDeepEquality ( util.duplicateStructure ( clonedDeepArray, true ), [ 1, 2, [ 3 ] ], 'an array was successfully deep cloned, preventing mutation from original' );
} );

scenario ( "includesValue", function ( ) {
    verifyDeepEquality ( util.includesValue ( [ 1, 2 ], 2 ), true, 'found a simple value within an array' );

    verifyDeepEquality ( util.includesValue ( { 0: 1, 1: 2 }, 2 ), true, 'found a simple value within an object literal' );

    verifyDeepEquality ( util.includesValue ( { 0: 1, 1: [ 2 ] }, [ 2 ] ), true, 'found a complex value within an object literal' );

    verifyDeepEquality ( util.foundInCollection ( { 0: 1, 1: 2 }, 2 ), true, 'successfully aliased with foundInCollection' );

    verifyDeepEquality ( util.includesValue ( { 0: 1, 1: [ 2 ] }, 2, true ), true, 'successfully deeply found a value within a collection' );
} );

scenario ( "tallyItems", function ( ) {
    verifyEquality ( util.tallyItems ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal ); } ), 3, 'successfully counted array values that met the iterator\'s condition' );

    verifyEquality ( util.tallyItems ( { 0: 1, 1: 2 }, function ( itemVal ) { return util.isNumeric ( itemVal ); } ), 2, 'successfully counted object literal values that met the iterator\'s condition' );

    verifyEquality ( util.tallyItems ( [ 1, 2, 3 ], function ( itemVal ) { return util.isNumeric ( itemVal + this.factor ); }, { factor: 2 } ), 3, 'successfully counted values in array that passed iterator\'s test and were bound to context' );

    verifyEquality ( util.tallyItems ( [ 1, 2, [ 3 ] ], function ( itemVal ) { return util.isNumeric ( itemVal ); }, true ), 3, 'successfully counted values (including nested members) in array that met the iterator\'s condition' );
} );

scenario ( "groupAndCount", function ( ) {
    const calculatedLength = util.measureLength ( util.groupAndCount ( [ 'Feline', 'Canine', 'Reptile' ], function ( strElement ) { return strElement.length; } ) );
    verifyEquality ( calculatedLength, 2, 'grouped array elements by property length using a mapping function' );

    const calculatedLength2 = util.measureLength ( util.groupAndCount ( [ { elementSymbol: 'K', kind: 'metallic' }, { elementSymbol: 'Ca', kind: 'metallic' }, { elementSymbol: 'Ne', kind: 'gaseous' } ], 'kind' ) );
    verifyEquality ( calculatedLength2, 2, 'grouped object literals within an array by a specific property' );
} );

scenario ( "traverseDeep", function ( ) {

    util.traverseDeep ( [ 1, 2, 3 ], function ( currentDepth, currentIndex, actualValue, rootCollection ) {
        verifyEquality ( actualValue, parseInt ( currentIndex ) + 1, 'each iteration provided index and value from a flat array' );
    } );

    util.traverseDeep ( [ 1, 2, [ 3, [ 4 ] ] ], function ( currentDepth, currentIndex, actualValue, rootCollection ) {
        verifyEquality ( actualValue, actualValue, 'each iteration provided index and value from a deeply nested array' );
    } );

    let lastVisitedValue = 0;
    util.traverseDeep ( [ 1, 2, [ 3, [ 4 ] ] ], function ( currentDepth, currentIndex, actualValue, rootCollection ) { lastVisitedValue = actualValue; }, 2 );
    verifyDeepEquality ( lastVisitedValue, [ 4 ], 'iterated to a specified depth within an array' );

    const currentArray = [ 1, 2 ];
    util.traverseDeep ( [ 1, 2 ], function ( currentDepth, currentIndex, actualValue, rootCollection ) {
        verifyDeepEquality ( currentArray, rootCollection, 'each iteration provides a reference to the original collection' );
    } );

    util.traverseDeep ( { 0: 1, 1: 2 }, function ( currentDepth, currentIndex, actualValue, rootCollection ) {
        verifyEquality ( actualValue, parseInt ( currentIndex ) + 1, 'each iteration provided index and value from an object literal' );
    } );

    lastVisitedValue = 0;
    util.traverseDeep ( { 0: { hue: 'Crimson' }, 1: [ 1, 2, 3 ] }, function ( currentDepth, currentIndex, actualValue, rootCollection ) {
        lastVisitedValue = actualValue;
    }, true );
    verifyDeepEquality ( lastVisitedValue, [ 1, 2, 3 ], 'did not iterate into arrays when the noArrays flag was active' );

    lastVisitedValue = 0;
    util.traverseDeep ( { collection: { 0: [ 1, 2, 3 ], 1: { hue: 'Crimson' } }, callback: function ( currentDepth, currentIndex, actualValue, rootCollection ) {
        lastVisitedValue = actualValue;
    }, noArrays: false, noObjects: true } );
    verifyDeepEquality ( lastVisitedValue, { hue: 'Crimson' }, 'did not iterate into object literals when the noObjects flag was active' );

    const passedArguments = [ 'test' ];
    util.traverseDeep ( { collection: [ 1, 2 ], callback: function ( currentDepth, currentIndex, actualValue, rootCollection, additionalArg ) {
        verifyEquality ( "test", additionalArg, 'successfully passed additional arguments to the iterator callback' );
    }, args: passedArguments } );
} );

scenario ( "forEachItem", function ( ) {
    util.forEachItem ( [ 1, 2, 3 ], function ( actualValue, currentIndex ) {
        verifyEquality ( actualValue, parseInt ( currentIndex ) + 1, 'each iteration provided the current index and value from an array' );
    } );

    let resultValues = [ ];
    util.forEachItem ( [ 1, 2, 3 ], function ( actualValue, currentIndex ) { resultValues.push ( actualValue * this.scaleFactor ); }, { scaleFactor: 5 } );
    verifyEquality ( resultValues.join ( ', ' ), '5, 10, 15', 'property from the scope object was accessed during iteration' );

    resultValues = false;
    util.forEachItem ( [ 1, 2, 3 ], function ( actualValue, currentIndex, collectionRef ) { if ( util.includesValue ( collectionRef, actualValue ) ) resultValues = true; } );
    verifyEquality ( true, resultValues, 'the original collection can be referenced from within the iterator function' );

    resultValues = [ ];
    util.iterateOver ( [ 1, 2, 3 ], function ( actualValue, currentIndex ) { resultValues.push ( actualValue ); } );
    verifyEquality ( resultValues.join ( ', ' ), '1, 2, 3', 'can be aliased with iterateOver' );

    resultValues = [ '#F00', '#0F0', '#00F' ];
    util.forEachItem ( { crimson: '#F00', emerald: '#0F0', azure: '#00F' }, function ( actualValue, currentIndex ) {
        verifyEquality ( util.foundInCollection ( resultValues, actualValue ), true, 'each iteration provided the current index and value from an object literal' );
    } );

} );

scenario ( "setUndefined", function ( ) {
    verifyDeepEquality ( util.setUndefined ( [ 1, 2 ] ), [ undefined, undefined ], 'successfully set all array elements to undefined' );

    verifyDeepEquality ( util.setUndefined ( { 0: 1, 1: 2 } ), { 0: undefined, 1: undefined }, 'successfully set all object literal values to undefined' );

    verifyDeepEquality ( util.setUndefined ( [ 1, [ 2 ] ], true ), [ undefined, [ undefined ] ], 'successfully set all elements to undefined in a nested array' );

    verifyDeepEquality ( util.setUndefined ( [ 1, { 0: 2 } ], true ), [ undefined, { 0: undefined } ], 'successfully set all elements to undefined in an array with nested object literals' );

    verifyDeepEquality ( util.setUndefined ( { 0: 1, 1: [ 2 ] }, true ), { 0: undefined, 1: [ undefined ] }, 'successfully set all elements to undefined in an object literal with nested arrays' );

    verifyDeepEquality ( util.setUndefined ( { 0: 1, 1: { 0: 2 } }, true ), { 0: undefined, 1: { 0: undefined } }, 'successfully set all elements to undefined in an object literal with nested object literals' );
} );

scenario ( "selectItems", function ( ) {
    verifyDeepEquality ( util.selectItems ( [ 1, 2 ], function ( itemVal ) { return itemVal >= 2; } ), [ 2 ], 'successfully filtered an array based on a condition' );

    verifyDeepEquality ( util.selectItems ( { 0: 1, 1: 2 }, function ( itemVal ) { return itemVal >= 2; } ), [ 2 ], 'successfully filtered an object literal based on a condition' );

    verifyDeepEquality ( util.selectItems ( [ 1, 2 ], function ( itemVal ) { return itemVal == this.factor; }, { factor: 2 } ), [ 2 ], 'successfully filtered an array with a condition applied within a specific scope' );
} );

scenario ( "discoverItem", function ( ) {
    verifyEquality ( util.discoverItem ( [ 1, 2 ], function ( itemVal ) { return itemVal === 2; } ), 2, 'successfully found a matching value in an array' );

    verifyEquality ( util.discoverItem ( { 0: 1, 1: 2 }, function ( itemVal ) { return itemVal === 2; } ), 2, 'successfully found a matching value in an object literal' );

    verifyEquality ( util.discoverItem ( [ 1, 2 ], function ( itemVal ) { return itemVal === this.factor; }, { factor: 2 } ), 2, 'successfully found a matching value in an array with a bound scope' );

    verifyEquality ( util.discoverItem ( [ 1, { 0: 2 } ], function ( itemVal ) { return itemVal === 2; }, true ), 2, 'successfully deeply found a matching value in an array' );
} );

scenario ( "discoverKey", function ( ) {
    verifyEquality ( util.discoverKey ( [ 1, 2 ], function ( currentKey ) { return currentKey == 1; } ), 2, 'successfully found a value in an array at a specific key' );

    verifyEquality ( util.discoverKey ( { 0: 1, 1: 2 }, function ( currentKey ) { return currentKey == 1; } ), 2, 'successfully found a value in an object literal at a specific key' );

    verifyEquality ( util.discoverKey ( [ 1, 2 ], function ( currentKey ) { return currentKey == this.factor; }, { factor: 1 } ), 2, 'successfully found a value in an array at a specific key with a bound scope' );

    verifyEquality ( util.discoverKey ( [ 1, [ 2, 3, 4 ] ], function ( currentKey ) { return currentKey == 2; }, true ), 4, 'successfully deeply found a value in an array at a specific key' );
} );

scenario ( "unrollStructure", function ( ) {
    verifyDeepEquality ( util.unrollStructure ( [ 1, [ 2 ] ] ), [ 1, 2 ], 'successfully flattened a simple nested array' );

    verifyDeepEquality ( util.unrollStructure ( { 0: 1, 1: { 1: 2 } } ), [ 1, 2 ], 'successfully flattened an object literal with nested objects' );

    verifyDeepEquality ( util.unrollStructure ( { 0: 1, 1: [ 2 ] } ), [ 1, 2 ], 'successfully flattened an object literal with nested arrays' );

    verifyDeepEquality ( util.unrollStructure ( [ 1, [ 2, { 0: 3 } ] ] ), [ 1, 2, 3 ], 'successfully flattened an array with nested object literals' );

    verifyDeepEquality ( util.unrollStructure ( { 0: 1, 1: 2, 2: [ 3, [ 4 ] ] }, 1 ), [ 1, 2, [ 3, [ 4 ] ] ], 'successfully flattened an object literal with nested arrays to a specified depth' );

    verifyDeepEquality ( util.unrollStructure ( [ 1, 2, { 0: 3, 1: [ 4 ] } ], 1 ), [ 1, 2, { 0: 3, 1: [ 4 ] } ], 'successfully flattened an array with nested object literals to a specified depth' );

    verifyDeepEquality ( util.unrollStructure ( [ 1, [ 2, [ 3 ] ] ], 2 ), [ 1, 2, [ 3 ] ], 'successfully flattened an array to a specified depth' );
} );

scenario ( "categorizeBy", function ( ) {
    const groupLength = util.measureLength ( util.categorizeBy ( [ 'Feline', 'Canine', 'Reptile' ], function ( strElement ) { return strElement.length; } ) );
    verifyEquality ( groupLength, 2, 'grouped array elements by a property length using a custom function' );

    const groupLength2 = util.measureLength ( util.categorizeBy ( [ { elementSymbol: 'K', kind: 'metallic' }, { elementSymbol: 'Ca', kind: 'metallic' }, { elementSymbol: 'Ne', kind: 'gaseous' } ], 'kind' ) );
    verifyEquality ( groupLength2, 2, 'grouped object literals within an array by a specific string property' );
} );

scenario ( "chunkInto", function ( ) {
    let chunkCount = util.measureLength ( util.chunkInto ( [ 1, 2, 3, 4 ], 2 ) );
    verifyEquality ( chunkCount, 2, 'grouped array elements into chunks of 2' );

    chunkCount = util.measureLength ( util.chunkInto ( [ 1, 2, 3, 4, 5 ], 2, '*' ) );
    verifyEquality ( chunkCount, 3, 'grouped array elements into chunks of 2 with padding' );

    chunkCount = util.measureLength ( util.chunkInto ( { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 }, 2 ) );
    verifyEquality ( chunkCount, 3, 'grouped object literal values into chunks of 2' );

    chunkCount = util.measureLength ( util.chunkInto ( { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 }, 2, '*' ) );
    verifyEquality ( chunkCount, 4, 'grouped object literal values into chunks of 2 with padding' );
} );

scenario ( "ownsProperty", function ( ) {
    const testObject = { 'firstKey': 1, 'secondKey': 2 };
    verifyEquality ( util.ownsProperty ( testObject, 'secondKey' ), true, 'object literal successfully checked for existing key' );

    verifyEquality ( util.ownsProperty ( [ 1, 2 ], 0 ), true, 'array successfully checked for existing index' );

    verifyEquality ( util.ownsProperty ( testObject, 'thirdKey' ), false, 'object literal successfully checked for non-existent key' );

    verifyEquality ( util.propertyExists ( testObject, 'secondKey' ), true, 'successfully aliased by propertyExists' );

    verifyEquality ( util.ownsProperty ( { 0: 1, 1: { hue: '#F00' } }, 'hue', true ), true, 'successfully deeply checked if an object literal has a key' );
} );

scenario ( "reverseMapping", function ( ) {
    const testObject = { 'firstKey': 1, 'secondKey': 2 };
    verifyDeepEquality ( util.reverseMapping ( testObject ), { 1: 'firstKey', 2: 'secondKey' }, 'successfully inverted object literal key/value pairs' );

    verifyDeepEquality ( util.reverseMapping ( [ 1, 2 ] ), { 1: '0', 2: '1' }, 'successfully inverted array to object literal with reversed key/value pairs' );
} );

scenario ( "executeFunction", function ( ) {
    verifyDeepEquality ( util.executeFunction ( { 0: 'FlowerA', 1: 'FlowerB' }, function ( actualValue, additionalArg ) { return actualValue + additionalArg; }, [ ' is a bloom.' ] ), [ "FlowerA is a bloom.", "FlowerB is a bloom." ], 'successfully invoked iterator on all values in object literal with additional arguments' );
} );

scenario ( "isCollectionEmpty", function ( ) {
    verifyEquality ( util.isCollectionEmpty ( { } ), true, 'successfully determined if an object literal is empty' );

    verifyEquality ( util.isCollectionEmpty ( [ ] ), true, 'successfully determined if an array is empty' );

    verifyEquality ( util.isCollectionEmpty ( { 0: 1 } ), false, 'successfully determined if an object literal is not empty' );

    verifyEquality ( util.isCollectionEmpty ( [ 1 ] ), false, 'successfully determined if an array is not empty' );
} );

scenario ( "hasUniqueValue", function ( ) {
    verifyDeepEquality ( util.hasUniqueValue ( [ 1, 2, 3, 4, 4 ], 4 ), false, 'successfully determined if a value in an array is not unique' );

    verifyDeepEquality ( util.hasUniqueValue ( [ [ 1, 2 ], [ 1, 4 ] ], [ 1, 2 ] ), true, 'successfully determined if a complex value in an array is unique' );

    verifyDeepEquality ( util.hasUniqueValue ( { 0: [ 1, 2 ], 1: [ 1, 4 ] }, [ 1, 2 ] ), true, 'successfully determined if a complex value in an object literal is unique' );
} );