var    assert = require('assert') , // Node.js built-in assertion module
    Calendar = require( '..' ).Calendar; /* The Calendar class under test,
                                         * imported from the parent directory.
                                         */

// --- Test Suite: 'calendar-base' ---
describe(
    'calendar-base',
    function
    (
    )
    {

        // Test Case: Valid calendar without sibling months
        it(
            'should return a valid calendar',
            function ( done )
            {
                // Create a new Calendar instance
                var calendar = new Calendar();
                // Get calendar days for September 1986
                var calendarDays = calendar.getCalendar(
                    1986,
                    9
                )
                ;
                // Assert that the generated calendar matches the expected structure
                assert.deepEqual(
                    calendarDays,
                    [
                        false, false, false,
                        { day: 1, weekDay: 3, month: 9, year: 1986 },
                        { day: 2, weekDay: 4, month: 9, year: 1986 },
                        { day: 3, weekDay: 5, month: 9, year: 1986 },
                        { day: 4, weekDay: 6, month: 9, year: 1986 },
                        { day: 5, weekDay: 0, month: 9, year: 1986 },
                        { day: 6, weekDay: 1, month: 9, year: 1986 },
                        { day: 7, weekDay: 2, month: 9, year: 1986 },
                        { day: 8, weekDay: 3, month: 9, year: 1986 },
                        { day: 9, weekDay: 4, month: 9, year: 1986 },
                        { day: 10, weekDay: 5, month: 9, year: 1986 },
                        { day: 11, weekDay: 6, month: 9, year: 1986 },
                        { day: 12, weekDay: 0, month: 9, year: 1986 },
                        { day: 13, weekDay: 1, month: 9, year: 1986 },
                        { day: 14, weekDay: 2, month: 9, year: 1986 },
                        { day: 15, weekDay: 3, month: 9, year: 1986 },
                        { day: 16, weekDay: 4, month: 9, year: 1986 },
                        { day: 17, weekDay: 5, month: 9, year: 1986 },
                        { day: 18, weekDay: 6, month: 9, year: 1986 },
                        { day: 19, weekDay: 0, month: 9, year: 1986 },
                        { day: 20, weekDay: 1, month: 9, year: 1986 },
                        { day: 21, weekDay: 2, month: 9, year: 1986 },
                        { day: 22, weekDay: 3, month: 9, year: 1986 },
                        { day: 23, weekDay: 4, month: 9, year: 1986 },
                        { day: 24, weekDay: 5, month: 9, year: 1986 },
                        { day: 25, weekDay: 6, month: 9, year: 1986 },
                        { day: 26, weekDay: 0, month: 9, year: 1986 },
                        { day: 27, weekDay: 1, month: 9, year: 1986 },
                        { day: 28, weekDay: 2, month: 9, year: 1986 },
                        { day: 29, weekDay: 3, month: 9, year: 1986 },
                        { day: 30, weekDay: 4, month: 9, year: 1986 },
                        { day: 31, weekDay: 5, month: 9, year: 1986 },
                        false
                    ]
                )
                ;
                // Indicate test completion
                done();
            }
        )
        ;

        /*
         * Test Case: Calendar with sibling months
         * Verifies correct generation when 'siblingMonths' option is enabled.
         */
        it(
            'should return a valid calendar with sibling months',
            function ( done )
            {
                var calendar = new Calendar( { siblingMonths: true } ) ,
                    calendarDays = calendar.getCalendar( 1986, 9 );
                assert.deepEqual( calendarDays, [ { day: 28, weekDay: 0, month: 8, year: 1986, siblingMonth: true }, { day: 29, weekDay: 1, month: 8, year: 1986, siblingMonth: true }, { day: 30, weekDay: 2, month: 8, year: 1986, siblingMonth: true }, { day: 1, weekDay: 3, month: 9, year: 1986 }, { day: 2, weekDay: 4, month: 9, year: 1986 }, { day: 3, weekDay: 5, month: 9, year: 1986 }, { day: 4, weekDay: 6, month: 9, year: 1986 }, { day: 5, weekDay: 0, month: 9, year: 1986 }, { day: 6, weekDay: 1, month: 9, year: 1986 }, { day: 7, weekDay: 2, month: 9, year: 1986 }, { day: 8, weekDay: 3, month: 9, year: 1986 }, { day: 9, weekDay: 4, month: 9, year: 1986 }, { day: 10, weekDay: 5, month: 9, year: 1986 }, { day: 11, weekDay: 6, month: 9, year: 1986 }, { day: 12, weekDay: 0, month: 9, year: 1986 }, { day: 13, weekDay: 1, month: 9, year: 1986 }, { day: 14, weekDay: 2, month: 9, year: 1986 }, { day: 15, weekDay: 3, month: 9, year: 1986 }, { day: 16, weekDay: 4, month: 9, year: 1986 }, { day: 17, weekDay: 5, month: 9, year: 1986 }, { day: 18, weekDay: 6, month: 9, year: 1986 }, { day: 19, weekDay: 0, month: 9, year: 1986 }, { day: 20, weekDay: 1, month: 9, year: 1986 }, { day: 21, weekDay: 2, month: 9, year: 1986 }, { day: 22, weekDay: 3, month: 9, year: 1986 }, { day: 23, weekDay: 4, month: 9, year: 1986 }, { day: 24, weekDay: 5, month: 9, year: 1986 }, { day: 25, weekDay: 6, month: 9, year: 1986 }, { day: 26, weekDay: 0, month: 9, year: 1986 }, { day: 27, weekDay: 1, month: 9, year: 1986 }, { day: 28, weekDay: 2, month: 9, year: 1986 }, { day: 29, weekDay: 3, month: 9, year: 1986 }, { day: 30, weekDay: 4, month: 9, year: 1986 }, { day: 31, weekDay: 5, month: 9, year: 1986 }, { day: 1, weekDay: 6, month: 10, year: 1986, siblingMonth: true } ] );
                done();
            }
        )
        ;

        /* Test Case: Calendar with sibling months and custom week start
         * Checks if the calendar correctly adjusts for a different starting day of the week.
         */
        it(
            'should return a valid calendar with sibling months and week starting on a different day',
            function ( done )
            {
                var calendar = new Calendar( { siblingMonths: true, weekStart: 1 } ),
                    calendarDays = calendar.getCalendar( 1986, 9 );
                assert.deepEqual( calendarDays, [ { day: 29, weekDay: 1, month: 8, year: 1986, siblingMonth: true }, { day: 30, weekDay: 2, month: 8, year: 1986, siblingMonth: true }, { day: 1, weekDay: 3, month: 9, year: 1986 }, { day: 2, weekDay: 4, month: 9, year: 1986 }, { day: 3, weekDay: 5, month: 9, year: 1986 }, { day: 4, weekDay: 6, month: 9, year: 1986 }, { day: 5, weekDay: 0, month: 9, year: 1986 }, { day: 6, weekDay: 1, month: 9, year: 1986 }, { day: 7, weekDay: 2, month: 9, year: 1986 }, { day: 8, weekDay: 3, month: 9, year: 1986 }, { day: 9, weekDay: 4, month: 9, year: 1986 }, { day: 10, weekDay: 5, month: 9, year: 1986 }, { day: 11, weekDay: 6, month: 9, year: 1986 }, { day: 12, weekDay: 0, month: 9, year: 1986 }, { day: 13, weekDay: 1, month: 9, year: 1986 }, { day: 14, weekDay: 2, month: 9, year: 1986 }, { day: 15, weekDay: 3, month: 9, year: 1986 }, { day: 16, weekDay: 4, month: 9, year: 1986 }, { day: 17, weekDay: 5, month: 9, year: 1986 }, { day: 18, weekDay: 6, month: 9, year: 1986 }, { day: 19, weekDay: 0, month: 9, year: 1986 }, { day: 20, weekDay: 1, month: 9, year: 1986 }, { day: 21, weekDay: 2, month: 9, year: 1986 }, { day: 22, weekDay: 3, month: 9, year: 1986 }, { day: 23, weekDay: 4, month: 9, year: 1986 }, { day: 24, weekDay: 5, month: 9, year: 1986 }, { day: 25, weekDay: 6, month: 9, year: 1986 }, { day: 26, weekDay: 0, month: 9, year: 1986 }, { day: 27, weekDay: 1, month: 9, year: 1986 }, { day: 28, weekDay: 2, month: 9, year: 1986 }, { day: 29, weekDay: 3, month: 9, year: 1986 }, { day: 30, weekDay: 4, month: 9, year: 1986 }, { day: 31, weekDay: 5, month: 9, year: 1986 }, { day: 1, weekDay: 6, month: 10, year: 1986, siblingMonth: true }, { day: 2, weekDay: 0, month: 10, year: 1986, siblingMonth: true } ] );
                done();
            }
        )
        ;

        // Test Case: Calendar with selected dates
        it(
            'should return a valid calendar with sibling months and selected dates',
            function ( done )
            {
                var calendar = new Calendar( { siblingMonths: true, startDate: { day: 5, month: 10, year: 2010 }, endDate: { day: 20, month: 10, year: 2010 } } ),
                    calendarDays = calendar.getCalendar( 2010, 10 );
                assert.deepEqual( calendarDays, [ { day: 31, weekDay: 0, month: 9, year: 2010, siblingMonth: true, selected: false }, { day: 1, weekDay: 1, month: 10, year: 2010, selected: false }, { day: 2, weekDay: 2, month: 10, year: 2010, selected: false }, { day: 3, weekDay: 3, month: 10, year: 2010, selected: false }, { day: 4, weekDay: 4, month: 10, year: 2010, selected: false }, { day: 5, weekDay: 5, month: 10, year: 2010, selected: true }, { day: 6, weekDay: 6, month: 10, year: 2010, selected: true }, { day: 7, weekDay: 0, month: 10, year: 2010, selected: true }, { day: 8, weekDay: 1, month: 10, year: 2010, selected: true }, { day: 9, weekDay: 2, month: 10, year: 2010, selected: true }, { day: 10, weekDay: 3, month: 10, year: 2010, selected: true }, { day: 11, weekDay: 4, month: 10, year: 2010, selected: true }, { day: 12, weekDay: 5, month: 10, year: 2010, selected: true }, { day: 13, weekDay: 6, month: 10, year: 2010, selected: true }, { day: 14, weekDay: 0, month: 10, year: 2010, selected: true }, { day: 15, weekDay: 1, month: 10, year: 2010, selected: true }, { day: 16, weekDay: 2, month: 10, year: 2010, selected: true }, { day: 17, weekDay: 3, month: 10, year: 2010, selected: true }, { day: 18, weekDay: 4, month: 10, year: 2010, selected: true }, { day: 19, weekDay: 5, month: 10, year: 2010, selected: true }, { day: 20, weekDay: 6, month: 10, year: 2010, selected: true }, { day: 21, weekDay: 0, month: 10, year: 2010, selected: false }, { day: 22, weekDay: 1, month: 10, year: 2010, selected: false }, { day: 23, weekDay: 2, month: 10, year: 2010, selected: false }, { day: 24, weekDay: 3, month: 10, year: 2010, selected: false }, { day: 25, weekDay: 4, month: 10, year: 2010, selected: false }, { day: 26, weekDay: 5, month: 10, year: 2010, selected: false }, { day: 27, weekDay: 6, month: 10, year: 2010, selected: false }, { day: 28, weekDay: 0, month: 10, year: 2010, selected: false }, { day: 29, weekDay: 1, month: 10, year: 2010, selected: false }, { day: 30, weekDay: 2, month: 10, year: 2010, selected: false }, { day: 1, weekDay: 3, month: 11, year: 2010, siblingMonth: true, selected: false }, { day: 2, weekDay: 4, month: 11, year: 2010, siblingMonth: true, selected: false }, { day: 3, weekDay: 5, month: 11, year: 2010, siblingMonth: true, selected: false }, { day: 4, weekDay: 6, month: 11, year: 2010, siblingMonth: true, selected: false } ] );
                done();
            }
        )
        ;

        /*
         * Verify February 1990 (non-leap year)
         * Checks if the 29th day of Feb 1990 is correctly marked as false.
         */
        it(
            'should return a valid Feb 1990',
            function ( done )
            {
                var calendar = new Calendar(),
                    calendarDays = calendar.getCalendar(1990, 1);
                assert.equal( calendarDays[32], false );
                done();
            }
        )
        ;

        // Verify February 1996 (leap year)
        it(
            'should return a valid Feb 1996',
            function ( done )
            {
                var calendar = new Calendar(),
                    calendarDays = calendar.getCalendar( 1996, 1 );
                assert.deepEqual( calendarDays[32], { day: 29, weekDay: 4, month: 1, year: 1996 } );
                done();
            }
        )
        ;

        // Verify February 2000 (century leap year)
        it(
            'should return a valid Feb 2000',
            function ( done )
            {
                var calendar = new Calendar(),
                    calendarDays = calendar.getCalendar( 2000, 1 );
                assert.deepEqual( calendarDays[30], { day: 29, weekDay: 2, month: 1, year: 2000 } );
                done();
            }
        )
        ;

        /*
         * Verify February 2100 (non-leap century year)
         * Checks if the 29th day of Feb 2100 is correctly marked as false.
         */
        it(
            'should return a valid Feb 2100',
            function ( done )
            {
                var calendar = new Calendar(),
                    calendarDays = calendar.getCalendar( 2100, 1 );
                assert.equal( calendarDays[29], false );
                done();
            }
        )
        ;

        // Test date selection states within the same month
        it(
            'should return valid date selection states for same month',
            function ( done )
            {
                var calendar = new Calendar();
                calendar.setStartDate( { year: 2010, month: 0, day: 15 } );
                calendar.setEndDate( { year: 2010, month: 0, day: 17 } );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 14 } ), false );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 16 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 17 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 18 } ), false );
                done();
            }
        )
        ;

        // Test date selection states across multiple months within the same year
        it(
            'should return valid date selection states for same year',
            function ( done )
            {
                var calendar = new Calendar();
                calendar.setStartDate( { year: 2010, month: 1, day: 15 } );
                calendar.setEndDate( { year: 2010, month: 3, day: 15 } );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 15 } ), false );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 1, day: 14 } ), false );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 1, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 1, day: 16 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 2, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 3, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 3, day: 16 } ), false );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 4, day: 15 } ), false );
                done();
            }
        )
        ;

        /*
         * Test date selection states across multiple years.
         * Verifies correct selection logic for date ranges spanning years.
         */
        it(
            'should return valid date selection states for multiple years',
            function ( done )
            {
                var calendar = new Calendar();
                calendar.setStartDate( { year: 2010, month: 1, day: 15 } );
                calendar.setEndDate( { year: 2012, month: 1, day: 15 } );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 0, day: 15 } ), false );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 1, day: 14 } ), false );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 1, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2010, month: 11, day: 31 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2011, month: 0, day: 1 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2011, month: 1, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2011, month: 11, day: 31 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2012, month: 1, day: 15 } ), true );
                assert.equal( calendar.isDateSelected( { year: 2012, month: 1, day: 16 } ), false );
                done();
            }
        )
        ;

        // Test the static 'interval' method for date differences
        it(
            'should return valid date intervals',
            function ( done )
            {
                assert.equal( Calendar.interval( { year: 1986, month: 1, day: 16 }, { year: 1986, month: 1, day: 16 } ), 1 );
                assert.equal( Calendar.interval( { year: 1986, month: 1, day: 10 }, { year: 1986, month: 2, day: 10 } ), 29 );
                assert.equal( Calendar.interval( { year: 1986, month: 0, day: 1 }, { year: 1986, month: 11, day: 31 } ), 365 );
                assert.equal( Calendar.interval( { year: 1990, month: 0, day: 1 }, { year: 1990, month: 11, day: 31 } ), 365 );
                assert.equal( Calendar.interval( { year: 1996, month: 0, day: 1 }, { year: 1996, month: 11, day: 31 } ), 366 );
                assert.equal( Calendar.interval( { year: 2000, month: 0, day: 1 }, { year: 2000, month: 11, day: 31 } ), 366 );
                assert.equal( Calendar.interval( { year: 2100, month: 0, day: 1 }, { year: 2100, month: 11, day: 31 } ), 365 );
                done();
            }
        )
        ;

        // Test setting the start date property
        it(
            'should set starting date',
            function ( done )
            {
                var calendar = new Calendar();
                calendar.setStartDate( { year: 2010, month: 1, day: 15 } );
                assert.deepEqual( calendar.startDate, { year: 2010, month: 1, day: 15 } );
                done();
            }
        )
        ;

        // Test setting the end date property
        it(
            'should set ending date',
            function ( done )
            {
                var calendar = new Calendar();
                calendar.setEndDate( { year: 2010, month: 1, day: 15 } );
                assert.deepEqual( calendar.endDate, { year: 2010, month: 1, day: 15 } );
                done();
            }
        )
        ;

    }
)
; // End of describe block for 'calendar-base'