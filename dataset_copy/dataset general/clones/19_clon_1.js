/*
 * This file contains a suite of tests for the opening_hours.js library.
 * It's structured to verify various time interval and date parsing functionalities.
 * All tests are designed to be self-contained and validate specific scenarios.
 */

var  opening_hours  =  require ( './opening_hours.js' ) ; // Import the main library dependency.

var  test  =  new  opening_hours_test ( ) ; // Initialize the test runner instance.


// Test case: Basic time intervals and combinations.
test . addTest ( 'Time intervals' ,
    [
        '10:00-12:00' ,
        '10:00-11:00,11:00-12:00' ,
        '10:00-11:00;11:00-12:00' ,
        '10:00-14:00;12:00-14:00 off' ,
        '10:00-12:00;10:30-11:30' ,
    ] ,
    '2012.10.01 0:00' , // Start date for the test range.
    '2012.10.08 0:00' , // End date for the test range.
    [
        [ '2012.10.01 10:00' , '2012.10.01 12:00' ] ,
        [ '2012.10.02 10:00' , '2012.10.02 12:00' ] ,
        [ '2012.10.03 10:00' , '2012.10.03 12:00' ] ,
        [ '2012.10.04 10:00' , '2012.10.04 12:00' ] ,
        [ '2012.10.05 10:00' , '2012.10.05 12:00' ] ,
        [ '2012.10.06 10:00' , '2012.10.06 12:00' ] ,
        [ '2012.10.07 10:00' , '2012.10.07 12:00' ] ,
    ] ,
    1000 * 60 * 60 * 2 * 7 , // Expected total duration in milliseconds.
    true // Is week stable?
) ;

// This test case examines time ranges that cross the midnight boundary,
// such as 22:00-02:00 or using 24+ hour format like 22:00-26:00.
test . addTest ( 'Time ranges spanning midnight' ,
    [
        '22:00-02:00' ,
        '22:00-26:00' , // 26:00 is equivalent to 02:00 the next day.
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 00:00' , '2012.10.01 02:00' ] ,
        [ '2012.10.01 22:00' , '2012.10.02 02:00' ] ,
        [ '2012.10.02 22:00' , '2012.10.03 02:00' ] ,
        [ '2012.10.03 22:00' , '2012.10.04 02:00' ] ,
        [ '2012.10.04 22:00' , '2012.10.05 02:00' ] ,
        [ '2012.10.05 22:00' , '2012.10.06 02:00' ] ,
        [ '2012.10.06 22:00' , '2012.10.07 02:00' ] ,
        [ '2012.10.07 22:00' , '2012.10.08 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 4 * 7 ,
    true
) ;


// Testing various weekday specifications, including ranges and 'off' rules.
test . addTest ( 'Weekdays' ,
    [
        'Mo,Th,Sa,Su 10:00-12:00' ,
        'Mo,Th,Sa-Su 10:00-12:00' ,
        'Th,Sa-Mo 10:00-12:00' ,
        '10:00-12:00; Tu-We 00:00-24:00 off; Fr 00:00-24:00 off' ,
        '10:00-12:00; Tu-We off; Fr off' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 10:00' , '2012.10.01 12:00' ] ,
        [ '2012.10.04 10:00' , '2012.10.04 12:00' ] ,
        [ '2012.10.06 10:00' , '2012.10.06 12:00' ] ,
        [ '2012.10.07 10:00' , '2012.10.07 12:00' ] ,
    ] ,
    1000 * 60 * 60 * 2 * 4 ,
    true
) ;

// Test cases where time is omitted, implying 00:00-24:00.
test . addTest ( 'Omitted time' ,
    [
        'Mo,We' ,
        'Mo-We; Tu off' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 0:00' , '2012.10.02 0:00' ] ,
        [ '2012.10.03 0:00' , '2012.10.04 0:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 2 ,
    true
) ;

// Combination of time ranges spanning midnight with specific weekdays.
test . addTest ( 'Time ranges spanning midnight w/weekdays' ,
    [
        'We 22:00-02:00' ,
        'We 22:00-26:00' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.03 22:00' , '2012.10.04 02:00' ] ,
    ] ,
    1000 * 60 * 60 * 4 ,
    true
) ;

// Test cases for rules that should result in a full 24/7 opening.
test . addTest ( 'Full range' ,
    [
        '00:00-24:00' ,
        'Mo-Su 00:00-24:00' ,
        'Tu-Mo 00:00-24:00' ,
        'We-Tu 00:00-24:00' ,
        'Th-We 00:00-24:00' ,
        'Fr-Th 00:00-24:00' ,
        'Sa-Fr 00:00-24:00' ,
        'Su-Sa 00:00-24:00' ,
        '24/7' ,
        'Jan-Dec' , // week stable actually, but check for that needs extra logic
        'Feb-Jan' , // week stable actually, but check for that needs extra logic
        'Jan 01-Dec 31' , // week stable actually, but check for that needs extra logic
        'week 1-54' , // week stable actually, but check for that needs extra logic
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 0:00' , '2012.10.08 0:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 7 ,
    undefined
) ;

// Verifying the '24/7' alias specifically.
test . addTest ( '24/7 as time interval alias' ,
    [
        'Mo,We 24/7' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 0:00' , '2012.10.02 0:00' ] ,
        [ '2012.10.03 0:00' , '2012.10.04 0:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 2 ,
    true
) ;

// Tests for constrained weekdays (e.g., 4th Wednesday of the month).
test . addTest ( 'Constrained weekdays' ,
    [
        'We[4,5] 10:00-12:00' ,
        'We[4-5] 10:00-12:00' ,
        'We[4],We[5] 10:00-12:00' ,
        'We[4] 10:00-12:00; We[-1] 10:00-12:00' ,
        'We[-1,-2] 10:00-12:00' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.11.01 0:00' ,
    [
        [ '2012.10.24 10:00' , '2012.10.24 12:00' ] ,
        [ '2012.10.31 10:00' , '2012.10.31 12:00' ] ,
    ] ,
    1000 * 60 * 60 * 2 * 2 ,
    false
) ;

// Tests for exception rules where a specific day overrides a general rule.
test . addTest ( 'Exception rules' ,
    [
        'Mo-Fr 10:00-16:00; We 12:00-18:00'
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 10:00' , '2012.10.01 16:00' ] ,
        [ '2012.10.02 10:00' , '2012.10.02 16:00' ] ,
        [ '2012.10.03 12:00' , '2012.10.03 18:00' ] , // Not 10:00-18:00
        [ '2012.10.04 10:00' , '2012.10.04 16:00' ] ,
        [ '2012.10.05 10:00' , '2012.10.05 16:00' ] ,
    ] ,
    1000 * 60 * 60 * 6 * 5 ,
    true
) ;

// Month ranges, including spanning year boundaries implicitly.
test . addTest ( 'Month ranges' ,
    [
        'Nov-Feb 00:00-24:00' ,
        'Jan,Feb,Nov,Dec 00:00-24:00' ,
        '00:00-24:00; Mar-Oct off' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.01 00:00' , '2012.03.01 00:00' ] ,
        [ '2012.11.01 00:00' , '2013.01.01 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * ( 31 + 29 + 30 + 31 ) , // Leap year Feb (29 days)
    false
) ;

// Week ranges, including periodical specifications.
test . addTest ( 'Week ranges' ,
    [
        'week 1,3 00:00-24:00' ,
        'week 1-3/2 00:00-24:00' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.01 00:00' , '2012.01.02 00:00' ] ,
        [ '2012.01.09 00:00' , '2012.01.16 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * ( 1 + 7 ) ,
    false
) ;

// More week range tests.
test . addTest ( 'Week ranges' ,
    [
        'week 2,4 00:00-24:00' ,
        'week 2-4/2 00:00-24:00' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.02 00:00' , '2012.01.09 00:00' ] ,
        [ '2012.01.16 00:00' , '2012.01.23 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * ( 7 + 7 ) ,
    false
) ;

// Testing the limits of week ranges, including invalid week numbers.
test . addTest ( 'Week range limit' ,
    [
        'week 2-54 00:00-24:00' ,
        'week 2-57' ,
    ] ,
    '2012.01.01 0:00' ,
    '2014.01.01 0:00' ,
    [
        [ '2012.01.02 00:00' , '2013.01.01 00:00' ] ,
        [ '2013.01.07 00:00' , '2014.01.01 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 724 ,
    false
) ;

// Monthday ranges, possibly spanning across months.
test . addTest ( 'Monthday ranges' ,
    [
        'Jan 23-31 00:00-24:00; Feb 1-12 00:00-24:00' ,
        'Jan 23-Feb 12 00:00-24:00' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.23 0:00' , '2012.02.13 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 21 ,
    false
) ;

// Monthday ranges that explicitly cross a year boundary.
test . addTest ( 'Monthday ranges spanning year boundary' ,
    [
        'Dec 31-Jan 01' ,
    ] ,
    '2012.01.01 0:00' ,
    '2014.01.01 0:00' ,
    [
        [ '2012.01.01 0:00' , '2012.01.02 00:00' ] ,
        [ '2012.12.31 0:00' , '2013.01.02 00:00' ] ,
        [ '2013.12.31 0:00' , '2014.01.01 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 4 ,
    false
) ;

// Periodical monthdays (e.g., every 8 days from the 1st).
test . addTest ( 'Periodical monthdays' ,
    [
        'Jan 01-31/8 00:00-24:00' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.01 0:00' , '2012.01.02 00:00' ] ,
        [ '2012.01.09 0:00' , '2012.01.10 00:00' ] ,
        [ '2012.01.17 0:00' , '2012.01.18 00:00' ] ,
        [ '2012.01.25 0:00' , '2012.01.26 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 4 ,
    false
) ;

// Another set of periodical monthdays.
test . addTest ( 'Periodical monthdays' ,
    [
        'Jan 10-31/7' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.10 0:00' , '2012.01.11 00:00' ] ,
        [ '2012.01.17 0:00' , '2012.01.18 00:00' ] ,
        [ '2012.01.24 0:00' , '2012.01.25 00:00' ] ,
        [ '2012.01.31 0:00' , '2012.02.01 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 4 ,
    false
) ;

// Test to ensure selector order does not affect the outcome.
test . addTest ( 'Selector order' ,
    [ // result should not depend on selector order
        'Feb week 6' ,
        'week 6 Feb' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.02.01 0:00' , '2012.02.06 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 5 ,
    false
) ;

// Another selector order test.
test . addTest ( 'Selector order' ,
    [
        'Feb week 7' ,
        'week 7 Feb' ,
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.02.06 0:00' , '2012.02.13 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 7 ,
    false
) ;

// Input tolerance: testing various casing and whitespace in rules.
test . addTest ( 'Input tolerance: case and whitespace' ,
    [
        '   mo,    Tu, wE,   TH    12:00 - 20:00  ; 14:00-16:00    Off  ' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 12:00' , '2012.10.01 14:00' ] ,
        [ '2012.10.01 16:00' , '2012.10.01 20:00' ] ,
        [ '2012.10.02 12:00' , '2012.10.02 14:00' ] ,
        [ '2012.10.02 16:00' , '2012.10.02 20:00' ] ,
        [ '2012.10.03 12:00' , '2012.10.03 14:00' ] ,
        [ '2012.10.03 16:00' , '2012.10.03 20:00' ] ,
        [ '2012.10.04 12:00' , '2012.10.04 14:00' ] ,
        [ '2012.10.04 16:00' , '2012.10.04 20:00' ] ,
    ] ,
    1000 * 60 * 60 * 6 * 4 ,
    true
) ;

// Input tolerance: allowing dots as time separators (e.g., 10.00 instead of 10:00).
test . addTest ( 'Input tolerance: dot as time separator' ,
    [
        '10.00-12.00' ,
        '10.00-11.00,11.00-12.00' ,
        '10.00-11.00;11.00-12.00' ,
        '10.00-14.00;12.00-14.00 off' ,
        '10.00-12.00;10.30-11.30' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 10:00' , '2012.10.01 12:00' ] ,
        [ '2012.10.02 10:00' , '2012.10.02 12:00' ] ,
        [ '2012.10.03 10:00' , '2012.10.03 12:00' ] ,
        [ '2012.10.04 10:00' , '2012.10.04 12:00' ] ,
        [ '2012.10.05 10:00' , '2012.10.05 12:00' ] ,
        [ '2012.10.06 10:00' , '2012.10.06 12:00' ] ,
        [ '2012.10.07 10:00' , '2012.10.07 12:00' ] ,
    ] ,
    1000 * 60 * 60 * 2 * 7 ,
    true
) ;

// Extended syntax for complex monthday ranges.
test . addTest ( 'Extensions: complex monthday ranges' ,
    [
        'Jan 23-31,Feb 1-12 00:00-24:00' ,
        'Jan 23-Feb 11,Feb 12 00:00-24:00' ,
        ignored ( 'Jan 23-30,31-Feb 1-2,3-12 12 00:00-24:00' ) , // This one is ignored as it's complex.
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.23 0:00' , '2012.02.13 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 21 ,
    false
) ;

// Extensions: Handling missing time range separators (implicit comma).
test . addTest ( 'Extensions: missing time range separators' ,
    [
        'Mo 12:00-14:00 16:00-18:00 20:00-22:00' ,
    ] ,
    '2012.10.01 0:00' ,
    '2012.10.08 0:00' ,
    [
        [ '2012.10.01 12:00' , '2012.10.01 14:00' ] ,
        [ '2012.10.01 16:00' , '2012.10.01 18:00' ] ,
        [ '2012.10.01 20:00' , '2012.10.01 22:00' ] ,
    ] ,
    1000 * 60 * 60 * 6 ,
    true
) ;

// Testing combinations of different selectors (week + weekday, week + monthday).
test . addTest ( 'Selector combination' ,
    [
        'week 3 We' , // week + weekday
        'week 3 Jan 11-Jan 11' , // week + monthday
        'week 3 Jan 11' , // week + monthday
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.11 0:00' , '2012.01.12 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 ,
    false
) ;

// More selector combinations (month + monthday, week + month).
test . addTest ( 'Selector combination' ,
    [
        'Jan-Feb Jan 9-Jan 15' , // month + monthday
        'Jan-Feb Jan 9-15' , // month + monthday
        'week 3 Jan' , // week + month, this line moved down
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.09 0:00' , '2012.01.16 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 7 ,
    false
) ;

// Final selector combination tests (month + weekday, weekday + monthday).
test . addTest ( 'Selector combination' ,
    [
        'Jan We' , // month + weekday
        'Jan 2-27 We' , // weekday + monthday
        'Dec 30-Jan 27 We' , // weekday + monthday
    ] ,
    '2012.01.01 0:00' ,
    '2013.01.01 0:00' ,
    [
        [ '2012.01.04 0:00' , '2012.01.05 00:00' ] ,
        [ '2012.01.11 0:00' , '2012.01.12 00:00' ] ,
        [ '2012.01.18 0:00' , '2012.01.19 00:00' ] ,
        [ '2012.01.25 0:00' , '2012.01.26 00:00' ] ,
    ] ,
    1000 * 60 * 60 * 24 * 4 ,
    false
) ;

// Execute all tests and return the appropriate exit code.
process . exit ( test . run ( ) ? 0 : 1 ) ;


/**********************************************************************
 * Test framework implementation for opening_hours.js
 * This section defines the utility functions for running and reporting tests.
 * This framework is kept separate from the main library logic.
 **********************************************************************/
function  opening_hours_test ( )
{
    var  tests  =  [ ] ; // Array to store all registered test cases.

    // Helper function to execute a single test case.
    function  runSingleTest ( name ,  value ,  from ,  to ,  expected_intervals ,  expected_duration ,  expected_weekstable )
    {
        var  ignored  =  typeof  value  !==  'string' ;
        if  ( ignored )
        {
            ignored  =  value [ 1 ] ;
            value    =  value [ 0 ] ;
        }

        var  oh ,  intervals ,  duration ,  weekstable ,  intervals_ok ,  duration_ok ,  weekstable_ok ,  crashed  =  true ;

        try
        {
            oh  =  new  opening_hours ( value ) ; // Create a new opening_hours instance with the given rule.

            intervals    =  oh . getOpenIntervals ( new  Date ( from ) ,  new  Date ( to ) ) ; // Get open intervals.
            duration     =  oh . getOpenDuration ( new  Date ( from ) ,  new  Date ( to ) ) ; // Get total open duration.
            weekstable   =  oh . isWeekStable ( ) ; // Check if the rule is week-stable.

            intervals_ok   =  typeof  expected_intervals    ===  'undefined'  ||  intervals . length  ==  expected_intervals . length ;
            duration_ok    =  typeof  expected_duration     ===  'undefined'  ||  duration  ===  expected_duration ;
            weekstable_ok  =  typeof  expected_weekstable   ===  'undefined'  ||  weekstable  ===  expected_weekstable ;

            crashed  =  false ; // If we reached here, no crash occurred during execution.
        }
        catch  ( err )
        {
            crashed  =  err ; // Store the error if a crash happens during parsing or evaluation.
        }

        if  ( intervals_ok )
        {
            for  ( var  interval  =  0 ;  interval  <  intervals . length ;  interval ++ )
            {
                var  expected_from  =  new  Date ( expected_intervals [ interval ] [ 0 ] ) ;
                var  expected_to    =  new  Date ( expected_intervals [ interval ] [ 1 ] ) ;

                if  ( intervals [ interval ] [ 0 ] . getTime ( )  !=  expected_from . getTime ( )  ||
                      intervals [ interval ] [ 1 ] . getTime ( )  !=  expected_to . getTime ( ) )
                {
                    intervals_ok  =  false ; // Mark as not OK if any interval's start or end time does not match.
                    break ; // Exit loop early on first mismatch.
                }
            }
        }

        var  passed  =  false ;
        var  str     =  '"'  +  name  +  '" for "'  +  value  +  '": ' ;
        if  ( intervals_ok  &&  duration_ok  &&  weekstable_ok )
        {
            str  +=  '[1;32mPASSED[0m' ;
            if  ( ignored )
            {
                str  +=  ', [1;33malso ignored, please unignore since the test passes![0m' ;
            }
            passed  =  true ;
        }
        else  if  ( ignored )
        {
            str  +=  '[1;33mIGNORED[0m, reason: '  +  ignored ;
            passed  =  true ;
        }
        else  if  ( crashed )
        {
            str  +=  '[1;35mCRASHED[0m, reason: '  +  crashed ;
        }
        else
        {
            str  +=  '[1;31mFAILED[0m' ;
            if  ( ! duration_ok )
            {
                str  +=  ', bad duration: '  +  duration  +  ', expected '  +  expected_duration ;
            }
            if  ( ! intervals_ok )
            {
                str  +=  ', bad intervals: \n'  +  intervalsToString ( intervals )  +  '\nexpected:\n'  +  intervalsToString ( expected_intervals ) ;
            }
            if  ( ! weekstable_ok )
            {
                str  +=  ', bad weekstable flag: '  +  weekstable  +  ', expected '  +  expected_weekstable ;
            }
        }

        console . log ( str ) ; // Output the test result to the console.
        return  passed ;
    }

    // Converts an array of interval pairs into a human-readable string format.
    function  intervalsToString ( intervals )
    {
        var  res  =  '' ;

        if  ( intervals . length  ==  0 )
        {
            return  '(none)' ;
        }

        for  ( var  interval  =  0 ;  interval  <  intervals . length ;  interval ++ )
        {
            var  from  =  formatDate ( intervals [ interval ] [ 0 ] ) ;
            var  to    =  formatDate ( intervals [ interval ] [ 1 ] ) ;

            if  ( interval  !=  0 )
            {
                res  +=  '\n' ;
            }

            res  +=  '[ '  +  from  +  ' - '  +  to  +  ' ]' ;
        }

        return  res ;
    }

    // Formats a Date object into a specific 'YYYY.MM.DD HH:mm' string format.
    function  formatDate ( date )
    {
        if  ( typeof  date  ===  'string' )
        {
            return  date ;
        }

        var  res  =  '' ;
        res  +=  date . getFullYear ( )  +  '.' ;
        res  +=  ( '0'  +  ( date . getMonth ( )  +  1 ) ) . substr ( -2 ,  2 )  +  '.' ;
        res  +=  ( '0'  +  date . getDate ( ) ) . substr ( -2 ,  2 )  +  ' ' ;
        res  +=  ( '0'  +  date . getHours ( ) ) . substr ( -2 ,  2 )  +  ':' ;
        res  +=  ( '0'  +  date . getMinutes ( ) ) . substr ( -2 ,  2 ) ;
        return  res ;
    }

    // Public method to run all registered tests and report overall success.
    this . run  =  function ( )
    {
        var  success  =  0 ;
        for  ( var  test  =  0 ;  test  <  tests . length ;  test ++ )
        {
            if  ( runSingleTest ( tests [ test ] [ 0 ] ,  tests [ test ] [ 1 ] ,  tests [ test ] [ 2 ] ,  tests [ test ] [ 3 ] ,  tests [ test ] [ 4 ] ,  tests [ test ] [ 5 ] ,  tests [ test ] [ 6 ] ) )
            {
                success ++ ;
            }
        }

        console . log ( success  +  '/'  +  tests . length  +  ' tests passed' ) ;

        return  success  ==  tests . length ;
    }

    // Public method to add a new test case to the test suite.
    this . addTest  =  function ( name ,  values ,  from ,  to ,  expected_intervals ,  expected_duration ,  expected_weekstable )
    {
        if  ( typeof  values  ===  'string' )
        {
            // If 'values' is a single string, add it as one test case.
            tests . push ( [ name ,  values ,  from ,  to ,  expected_intervals ,  expected_duration ,  expected_weekstable ] ) ;
        }
        else
        {
            // If 'values' is an array, create a separate test case for each value.
            for  ( var  value  =  0 ;  value  <  values . length ;  value ++ )
            {
                tests . push ( [ name ,  values [ value ] ,  from ,  to ,  expected_intervals ,  expected_duration ,  expected_weekstable ] ) ;
            }
        }
    }
}

// Utility function to mark a test case as ignored, providing a reason.
function  ignored ( value ,  reason )
{
    if  ( typeof  reason  ===  'undefined' )
    {
        reason  =  'not implemented yet' ; // Default reason if none is provided.
    }
    return  [ value ,  reason ] ;
}