const AssertEquivalency = {
    deepValue: (current, anticipated) => {
        if (!compareDeeply(current, anticipated)) {
            throw new Error(`Value mismatch.\n  Anticipated: ${JSON.stringify(anticipated)}\n  Current: ${JSON.stringify(current)}`);
        }
    },
    value: (current, anticipated) => {
        if (current !== anticipated) {
            throw new Error(`Value mismatch.\n  Anticipated: ${anticipated}\n  Current: ${current}`);
        }
    }
};

function compareDeeply(valA, valB) {
    if (valA === valB) return true;
    if (valA && valB && typeof valA == 'object' && typeof valB == 'object') {
        if (Array.isArray(valA) && Array.isArray(valB)) {
            if (valA.length !== valB.length) return false;
            for (let i = 0; i < valA.length; i++) {
                if (!compareDeeply(valA[i], valB[i])) return false;
            }
            return true;
        }
        if (Array.isArray(valA) !== Array.isArray(valB)) return false; 
        
        const keysA = Object.keys(valA);
        const keysB = Object.keys(valB);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
            if (!keysB.includes(key) || !compareDeeply(valA[key], valB[key])) return false;
        }
        return true;
    }
    return false;
}

const TestContainer = (heading, executionFunc) => {
    console.log(`\nStarting Test Run: ${heading}`);
    executionFunc();
};

const TestSegment = (descriptionText, testFunc) => {
    try {
        testFunc(() => {}); 
        console.log(`  ✔ ${descriptionText}`);
    } catch (error) {
        console.error(`  ✖ ${descriptionText}`);
        console.error(`    Issue: ${error.message}`);
        process.exit(1); 
    }
};

class DateLayoutMachine {
    constructor(designOptions = {}) {
        this.includeAdjacentMonths = designOptions.siblingMonths || false;
        this.initialWeekday = designOptions.weekStart !== undefined ? designOptions.weekStart : 0; 
        this.rangeStartPoint = this.generateDateObject(designOptions.startDate);
        this.rangeEndPoint = this.generateDateObject(designOptions.endDate);
    }

    generateDateObject(dateParameters) {
        if (!dateParameters) return null;
        return new Date(dateParameters.year, dateParameters.month, dateParameters.day);
    }

    static formatOutputDate(dateInstance, isAdjacent = false, withinRange = null) {
        if (!dateInstance) return null;
        const formatted = {
            day: dateInstance.getDate(),
            month: dateInstance.getMonth(), 
            year: dateInstance.getFullYear(),
            weekDay: dateInstance.getDay()
        };
        if (isAdjacent) {
            formatted.siblingMonth = true;
        }
        if (withinRange !== null) {
            formatted.selected = withinRange;
        }
        return formatted;
    }

    static obtainDaysInMonth(yearValue, monthIndexValue) {
        return new Date(yearValue, monthIndexValue + 1, 0).getDate();
    }

    static measureDayInterval(pointOne, pointTwo) {
        const d_one = new Date(pointOne.year, pointOne.month, pointOne.day);
        const d_two = new Date(pointTwo.year, pointTwo.month, pointTwo.day);
        const dailyMilliseconds = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((d_two.getTime() - d_one.getTime()) / dailyMilliseconds)) + 1;
    }

    setRangeBeginning(point) {
        this.rangeStartPoint = this.generateDateObject(point);
    }

    setRangeEnd(point) {
        this.rangeEndPoint = this.generateDateObject(point);
    }

    isPointWithinRange(point) {
        if (!this.rangeStartPoint || !this.rangeEndPoint) return false;
        const checkPoint = this.generateDateObject(point);
        return checkPoint >= this.rangeStartPoint && checkPoint <= this.rangeEndPoint;
    }

    retrieveMonthLayout(targetYear, targetMonthOneIndexed) {
        const calendarGrid = [];
        const targetMonthZeroIndexed = targetMonthOneIndexed - 1; 

        const firstDayOfTargetMonth = new Date(targetYear, targetMonthZeroIndexed, 1);
        const firstDayWeekday = firstDayOfTargetMonth.getDay();

        const currentMonthTotalDays = DateLayoutMachine.obtainDaysInMonth(targetYear, targetMonthZeroIndexed);

        const leadingBlanks = (firstDayWeekday - this.initialWeekday + 7) % 7;

        const lastDayOfPreviousMonth = new Date(targetYear, targetMonthZeroIndexed, 0);
        const previousMonthYear = lastDayOfPreviousMonth.getFullYear();
        const previousMonthIndex = lastDayOfPreviousMonth.getMonth(); 
        const previousMonthTotalDays = lastDayOfPreviousMonth.getDate(); 

        for (let i = 0; i < leadingBlanks; i++) {
            if (this.includeAdjacentMonths) {
                const day = previousMonthTotalDays - leadingBlanks + i + 1;
                const date = new Date(previousMonthYear, previousMonthIndex, day);
                calendarGrid.push(DateLayoutMachine.formatOutputDate(date, true, this.isPointWithinRange({ year: previousMonthYear, month: previousMonthIndex, day: day })));
            } else {
                calendarGrid.push(false);
            }
        }

        for (let i = 1; i <= currentMonthTotalDays; i++) {
            const date = new Date(targetYear, targetMonthZeroIndexed, i);
            calendarGrid.push(DateLayoutMachine.formatOutputDate(date, false, this.isPointWithinRange({ year: targetYear, month: targetMonthZeroIndexed, day: i })));
        }

        const filledCells = leadingBlanks + currentMonthTotalDays;
        const remainingCells = 42 - filledCells; 

        const firstDayOfNextMonth = new Date(targetYear, targetMonthZeroIndexed + 1, 1);
        const nextMonthYear = firstDayOfNextMonth.getFullYear();
        const nextMonthIndex = firstDayOfNextMonth.getMonth(); 

        for (let i = 1; i <= remainingCells; i++) {
            if (this.includeAdjacentMonths) {
                const date = new Date(nextMonthYear, nextMonthIndex, i);
                calendarGrid.push(DateLayoutMachine.formatOutputDate(date, true, this.isPointWithinRange({ year: nextMonthYear, month: nextMonthIndex, day: i })));
            } else {
                calendarGrid.push(false);
            }
        }
        
        if (!this.includeAdjacentMonths) {
            const effectiveLength = Math.ceil((leadingBlanks + currentMonthTotalDays) / 7) * 7;
            while (calendarGrid.length > effectiveLength) {
                calendarGrid.pop();
            }
        }
        
        return calendarGrid;
    }
}

TestContainer( 'date-layout-engine', function ( ) {

	TestSegment( 'should return a valid calendar', function ( complete ) {
		var layoutEngine = new DateLayoutMachine(),
			layoutDays = layoutEngine.retrieveMonthLayout( 1986, 9 );
		AssertEquivalency.deepValue( layoutDays, [ false, false, false, { day: 1, weekDay: 3, month: 8, year: 1986 }, { day: 2, weekDay: 4, month: 8, year: 1986 }, { day: 3, weekDay: 5, month: 8, year: 1986 }, { day: 4, weekDay: 6, month: 8, year: 1986 }, { day: 5, weekDay: 0, month: 8, year: 1986 }, { day: 6, weekDay: 1, month: 8, year: 1986 }, { day: 7, weekDay: 2, month: 8, year: 1986 }, { day: 8, weekDay: 3, month: 8, year: 1986 }, { day: 9, weekDay: 4, month: 8, year: 1986 }, { day: 10, weekDay: 5, month: 8, year: 1986 }, { day: 11, weekDay: 6, month: 8, year: 1986 }, { day: 12, weekDay: 0, month: 8, year: 1986 }, { day: 13, weekDay: 1, month: 8, year: 1986 }, { day: 14, weekDay: 2, month: 8, year: 1986 }, { day: 15, weekDay: 3, month: 8, year: 1986 }, { day: 16, weekDay: 4, month: 8, year: 1986 }, { day: 17, weekDay: 5, month: 8, year: 1986 }, { day: 18, weekDay: 6, month: 8, year: 1986 }, { day: 19, weekDay: 0, month: 8, year: 1986 }, { day: 20, weekDay: 1, month: 8, year: 1986 }, { day: 21, weekDay: 2, month: 8, year: 1986 }, { day: 22, weekDay: 3, month: 8, year: 1986 }, { day: 23, weekDay: 4, month: 8, year: 1986 }, { day: 24, weekDay: 5, month: 8, year: 1986 }, { day: 25, weekDay: 6, month: 8, year: 1986 }, { day: 26, weekDay: 0, month: 8, year: 1986 }, { day: 27, weekDay: 1, month: 8, year: 1986 }, { day: 28, weekDay: 2, month: 8, year: 1986 }, { day: 29, weekDay: 3, month: 8, year: 1986 }, { day: 30, weekDay: 4, month: 8, year: 1986 }, { day: 31, weekDay: 5, month: 8, year: 1986 }, false ] );
		complete();
	} );

	TestSegment( 'should return a valid calendar with sibling months', function ( complete ) {
		var layoutEngine = new DateLayoutMachine( { siblingMonths: true } ),
			layoutDays = layoutEngine.retrieveMonthLayout( 1986, 9 );
		AssertEquivalency.deepValue( layoutDays, [ { day: 28, weekDay: 0, month: 7, year: 1986, siblingMonth: true }, { day: 29, weekDay: 1, month: 7, year: 1986, siblingMonth: true }, { day: 30, weekDay: 2, month: 7, year: 1986, siblingMonth: true }, { day: 1, weekDay: 3, month: 8, year: 1986 }, { day: 2, weekDay: 4, month: 8, year: 1986 }, { day: 3, weekDay: 5, month: 8, year: 1986 }, { day: 4, weekDay: 6, month: 8, year: 1986 }, { day: 5, weekDay: 0, month: 8, year: 1986 }, { day: 6, weekDay: 1, month: 8, year: 1986 }, { day: 7, weekDay: 2, month: 8, year: 1986 }, { day: 8, weekDay: 3, month: 8, year: 1986 }, { day: 9, weekDay: 4, month: 8, year: 1986 }, { day: 10, weekDay: 5, month: 8, year: 1986 }, { day: 11, weekDay: 6, month: 8, year: 1986 }, { day: 12, weekDay: 0, month: 8, year: 1986 }, { day: 13, weekDay: 1, month: 8, year: 1986 }, { day: 14, weekDay: 2, month: 8, year: 1986 }, { day: 15, weekDay: 3, month: 8, year: 1986 }, { day: 16, weekDay: 4, month: 8, year: 1986 }, { day: 17, weekDay: 5, month: 8, year: 1986 }, { day: 18, weekDay: 6, month: 8, year: 1986 }, { day: 19, weekDay: 0, month: 8, year: 1986 }, { day: 20, weekDay: 1, month: 8, year: 1986 }, { day: 21, weekDay: 2, month: 8, year: 1986 }, { day: 22, weekDay: 3, month: 8, year: 1986 }, { day: 23, weekDay: 4, month: 8, year: 1986 }, { day: 24, weekDay: 5, month: 8, year: 1986 }, { day: 25, weekDay: 6, month: 8, year: 1986 }, { day: 26, weekDay: 0, month: 8, year: 1986 }, { day: 27, weekDay: 1, month: 8, year: 1986 }, { day: 28, weekDay: 2, month: 8, year: 1986 }, { day: 29, weekDay: 3, month: 8, year: 1986 }, { day: 30, weekDay: 4, month: 8, year: 1986 }, { day: 31, weekDay: 5, month: 8, year: 1986 }, { day: 1, weekDay: 6, month: 9, year: 1986, siblingMonth: true } ] );
		complete();
	} );

	TestSegment( 'should return a valid calendar with sibling months and week starting on a different day', function ( complete ) {
		var layoutEngine = new DateLayoutMachine( { siblingMonths: true, weekStart: 1 } ),
			layoutDays = layoutEngine.retrieveMonthLayout( 1986, 9 );
		AssertEquivalency.deepValue( layoutDays, [ { day: 29, weekDay: 1, month: 7, year: 1986, siblingMonth: true }, { day: 30, weekDay: 2, month: 7, year: 1986, siblingMonth: true }, { day: 1, weekDay: 3, month: 8, year: 1986 }, { day: 2, weekDay: 4, month: 8, year: 1986 }, { day: 3, weekDay: 5, month: 8, year: 1986 }, { day: 4, weekDay: 6, month: 8, year: 1986 }, { day: 5, weekDay: 0, month: 8, year: 1986 }, { day: 6, weekDay: 1, month: 8, year: 1986 }, { day: 7, weekDay: 2, month: 8, year: 1986 }, { day: 8, weekDay: 3, month: 8, year: 1986 }, { day: 9, weekDay: 4, month: 8, year: 1986 }, { day: 10, weekDay: 5, month: 8, year: 1986 }, { day: 11, weekDay: 6, month: 8, year: 1986 }, { day: 12, weekDay: 0, month: 8, year: 1986 }, { day: 13, weekDay: 1, month: 8, year: 1986 }, { day: 14, weekDay: 2, month: 8, year: 1986 }, { day: 15, weekDay: 3, month: 8, year: 1986 }, { day: 16, weekDay: 4, month: 8, year: 1986 }, { day: 17, weekDay: 5, month: 8, year: 1986 }, { day: 18, weekDay: 6, month: 8, year: 1986 }, { day: 19, weekDay: 0, month: 8, year: 1986 }, { day: 20, weekDay: 1, month: 8, year: 1986 }, { day: 21, weekDay: 2, month: 8, year: 1986 }, { day: 22, weekDay: 3, month: 8, year: 1986 }, { day: 23, weekDay: 4, month: 8, year: 1986 }, { day: 24, weekDay: 5, month: 8, year: 1986 }, { day: 25, weekDay: 6, month: 8, year: 1986 }, { day: 26, weekDay: 0, month: 8, year: 1986 }, { day: 27, weekDay: 1, month: 8, year: 1986 }, { day: 28, weekDay: 2, month: 8, year: 1986 }, { day: 29, weekDay: 3, month: 8, year: 1986 }, { day: 30, weekDay: 4, month: 8, year: 1986 }, { day: 31, weekDay: 5, month: 8, year: 1986 }, { day: 1, weekDay: 6, month: 9, year: 1986, siblingMonth: true }, { day: 2, weekDay: 0, month: 9, year: 1986, siblingMonth: true } ] );
		complete();
	} );

	TestSegment( 'should return a valid calendar with sibling months and selected dates', function ( complete ) {
		var layoutEngine = new DateLayoutMachine( { siblingMonths: true, startDate: { day: 5, month: 9, year: 2010 }, endDate: { day: 20, month: 9, year: 2010 } } ),
			layoutDays = layoutEngine.retrieveMonthLayout( 2010, 10 );
		AssertEquivalency.deepValue( layoutDays, [ { day: 31, weekDay: 0, month: 9, year: 2010, siblingMonth: true, selected: false }, { day: 1, weekDay: 1, month: 9, year: 2010, selected: false }, { day: 2, weekDay: 2, month: 9, year: 2010, selected: false }, { day: 3, weekDay: 3, month: 9, year: 2010, selected: false }, { day: 4, weekDay: 4, month: 9, year: 2010, selected: false }, { day: 5, weekDay: 5, month: 9, year: 2010, selected: true }, { day: 6, weekDay: 6, month: 9, year: 2010, selected: true }, { day: 7, weekDay: 0, month: 9, year: 2010, selected: true }, { day: 8, weekDay: 1, month: 9, year: 2010, selected: true }, { day: 9, weekDay: 2, month: 9, year: 2010, selected: true }, { day: 10, weekDay: 3, month: 9, year: 2010, selected: true }, { day: 11, weekDay: 4, month: 9, year: 2010, selected: true }, { day: 12, weekDay: 5, month: 9, year: 2010, selected: true }, { day: 13, weekDay: 6, month: 9, year: 2010, selected: true }, { day: 14, weekDay: 0, month: 9, year: 2010, selected: true }, { day: 15, weekDay: 1, month: 9, year: 2010, selected: true }, { day: 16, weekDay: 2, month: 9, year: 2010, selected: true }, { day: 17, weekDay: 3, month: 9, year: 2010, selected: true }, { day: 18, weekDay: 4, month: 9, year: 2010, selected: true }, { day: 19, weekDay: 5, month: 9, year: 2010, selected: true }, { day: 20, weekDay: 6, month: 9, year: 2010, selected: true }, { day: 21, weekDay: 0, month: 9, year: 2010, selected: false }, { day: 22, weekDay: 1, month: 9, year: 2010, selected: false }, { day: 23, weekDay: 2, month: 9, year: 2010, selected: false }, { day: 24, weekDay: 3, month: 9, year: 2010, selected: false }, { day: 25, weekDay: 4, month: 9, year: 2010, selected: false }, { day: 26, weekDay: 5, month: 9, year: 2010, selected: false }, { day: 27, weekDay: 6, month: 9, year: 2010, selected: false }, { day: 28, weekDay: 0, month: 9, year: 2010, selected: false }, { day: 29, weekDay: 1, month: 9, year: 2010, selected: false }, { day: 30, weekDay: 2, month: 9, year: 2010, selected: false }, { day: 1, weekDay: 3, month: 10, year: 2010, siblingMonth: true, selected: false }, { day: 2, weekDay: 4, month: 10, year: 2010, siblingMonth: true, selected: false }, { day: 3, weekDay: 5, month: 10, year: 2010, siblingMonth: true, selected: false }, { day: 4, weekDay: 6, month: 10, year: 2010, siblingMonth: true, selected: false } ] );
		complete();
	} );

	TestSegment( 'should return a valid Feb 1990', function ( complete ) {
		var layoutEngine = new DateLayoutMachine(),
			layoutDays = layoutEngine.retrieveMonthLayout( 1990, 2 );
		AssertEquivalency.value( layoutDays[32], false );
		complete();
	} );

	TestSegment( 'should return a valid Feb 1996', function ( complete ) {
		var layoutEngine = new DateLayoutMachine(),
			layoutDays = layoutEngine.retrieveMonthLayout( 1996, 2 );
		AssertEquivalency.deepValue( layoutDays[32], { day: 29, weekDay: 4, month: 1, year: 1996 } );
		complete();
	} );

	TestSegment( 'should return a valid Feb 2000', function ( complete ) {
		var layoutEngine = new DateLayoutMachine(),
			layoutDays = layoutEngine.retrieveMonthLayout( 2000, 2 );
		AssertEquivalency.deepValue( layoutDays[30], { day: 29, weekDay: 2, month: 1, year: 2000 } );
		complete();
	} );

	TestSegment( 'should return a valid Feb 2100', function ( complete ) {
		var layoutEngine = new DateLayoutMachine(),
			layoutDays = layoutEngine.retrieveMonthLayout( 2100, 2 );
		AssertEquivalency.value( layoutDays[29], false );
		complete();
	} );

	TestSegment( 'should return valid date selection states for same month', function ( complete ) {
		var layoutEngine = new DateLayoutMachine();
		layoutEngine.setRangeBeginning( { year: 2010, month: 0, day: 15 } );
		layoutEngine.setRangeEnd( { year: 2010, month: 0, day: 17 } );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 14 } ), false );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 16 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 17 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 18 } ), false );
		complete();
	} );

	TestSegment( 'should return valid date selection states for same year', function ( complete ) {
		var layoutEngine = new DateLayoutMachine();
		layoutEngine.setRangeBeginning( { year: 2010, month: 1, day: 15 } );
		layoutEngine.setRangeEnd( { year: 2010, month: 3, day: 15 } );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 15 } ), false );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 1, day: 14 } ), false );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 1, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 1, day: 16 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 2, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 3, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 3, day: 16 } ), false );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 4, day: 15 } ), false );
		complete();
	} );

	TestSegment( 'should return valid date selection states for multiple years', function ( complete ) {
		var layoutEngine = new DateLayoutMachine();
		layoutEngine.setRangeBeginning( { year: 2010, month: 1, day: 15 } );
		layoutEngine.setRangeEnd( { year: 2012, month: 1, day: 15 } );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 0, day: 15 } ), false );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 1, day: 14 } ), false );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 1, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2010, month: 11, day: 31 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2011, month: 0, day: 1 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2011, month: 1, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2011, month: 11, day: 31 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2012, month: 1, day: 15 } ), true );
		AssertEquivalency.value( layoutEngine.isPointWithinRange( { year: 2012, month: 1, day: 16 } ), false );
		complete();
	} );

	TestSegment( 'should return valid date intervals', function ( complete ) {
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 1986, month: 1, day: 16 }, { year: 1986, month: 1, day: 16 } ), 1 );
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 1986, month: 1, day: 10 }, { year: 1986, month: 2, day: 10 } ), 29 );
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 1986, month: 0, day: 1 }, { year: 1986, month: 11, day: 31 } ), 365 );
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 1990, month: 0, day: 1 }, { year: 1990, month: 11, day: 31 } ), 365 );
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 1996, month: 0, day: 1 }, { year: 1996, month: 11, day: 31 } ), 366 );
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 2000, month: 0, day: 1 }, { year: 2000, month: 11, day: 31 } ), 366 );
		AssertEquivalency.value( DateLayoutMachine.measureDayInterval( { year: 2100, month: 0, day: 1 }, { year: 2100, month: 11, day: 31 } ), 365 );
		complete();
	} );

	TestSegment( 'should set starting date', function ( complete ) {
		var layoutEngine = new DateLayoutMachine();
		layoutEngine.setRangeBeginning( { year: 2010, month: 1, day: 15 } );
		AssertEquivalency.deepValue( layoutEngine.rangeStartPoint, new Date(2010, 1, 15) );
		complete();
	} );

	TestSegment( 'should set ending date', function ( complete ) {
		var layoutEngine = new DateLayoutMachine();
		layoutEngine.setRangeEnd( { year: 2010, month: 1, day: 15 } );
		AssertEquivalency.deepValue( layoutEngine.rangeEndPoint, new Date(2010, 1, 15) );
		complete();
	} );

} );