const verifier = require('assert'); // Module for performing various assertion checks
const TemporalGridGen = require('./lib/temporal-grid-gen').TemporalGridGen; // Custom library for generating date grids

// Initiates a test suite for the core functionalities of the TemporalGridGen component.
testSuite('temporal-grid-generator-core-features', () => {

	/**
	 * Helper function to structure expected date objects, applying renamed properties.
	 * @param {number} day - Day of the month.
	 * @param {number} weekDay - Day of the week (0 for Sunday).
	 * @param {number} month - Month index (0-11).
	 * @param {number} year - Full year.
	 * @param {boolean} [isAdjacentMonth] - True if it's a day from an adjacent month.
	 * @param {boolean} [isSelected] - True if the date is within a selected range.
	 * @returns {object} Formatted date object.
	 */
	const createExpectedDateCell = (day, weekDay, month, year, isAdjacentMonth = undefined, isSelected = undefined) => {
		const cell = {
			dayOfMonth: day,
			weekDayIndex: weekDay,
			monthIndex: month,
			fullYear: year
		};
		if (isAdjacentMonth !== undefined) {
			cell.isAdjacentMonth = isAdjacentMonth;
		}
		if (isSelected !== undefined) {
			cell.isSelected = isSelected;
		}
		return cell;
	};

	// Test Case 1: Verifies the generation of a standard calendar grid for a specific month without sibling days.
	testCase('should produce a standard monthly grid for a given date', (completionHandler) => {
		// Define target temporal coordinates
		const queryYear = 1986;
		const queryMonth = 9; // October (0-indexed)

		// Instantiate the grid generator
		const gridManager = new TemporalGridGen();

		// Generate the date grid
		const resultantGrid = gridManager.retrieveCalendarGrid(queryYear, queryMonth);

		// Expected grid structure for October 1986, without adjacent month days.
		const expectedGrid = [
			null, null, null,
			createExpectedDateCell(1, 3, 9, 1986), createExpectedDateCell(2, 4, 9, 1986), createExpectedDateCell(3, 5, 9, 1986), createExpectedDateCell(4, 6, 9, 1986),
			createExpectedDateCell(5, 0, 9, 1986), createExpectedDateCell(6, 1, 9, 1986), createExpectedDateCell(7, 2, 9, 1986), createExpectedDateCell(8, 3, 9, 1986),
			createExpectedDateCell(9, 4, 9, 1986), createExpectedDateCell(10, 5, 9, 1986), createExpectedDateCell(11, 6, 9, 1986), createExpectedDateCell(12, 0, 9, 1986),
			createExpectedDateCell(13, 1, 9, 1986), createExpectedDateCell(14, 2, 9, 1986), createExpectedDateCell(15, 3, 9, 1986), createExpectedDateCell(16, 4, 9, 1986),
			createExpectedDateCell(17, 5, 9, 1986), createExpectedDateCell(18, 6, 9, 1986), createExpectedDateCell(19, 0, 9, 1986), createExpectedDateCell(20, 1, 9, 1986),
			createExpectedDateCell(21, 2, 9, 1986), createExpectedDateCell(22, 3, 9, 1986), createExpectedDateCell(23, 4, 9, 1986), createExpectedDateCell(24, 5, 9, 1986),
			createExpectedDateCell(25, 6, 9, 1986), createExpectedDateCell(26, 0, 9, 1986), createExpectedDateCell(27, 1, 9, 1986), createExpectedDateCell(28, 2, 9, 1986),
			createExpectedDateCell(29, 3, 9, 1986), createExpectedDateCell(30, 4, 9, 1986), createExpectedDateCell(31, 5, 9, 1986),
			null
		];

		// Assert that the generated grid matches the expected structure and values.
		verifier.deepStrictEqual(resultantGrid, expectedGrid, 'The basic calendar grid should correctly represent October 1986.');
		completionHandler(); // Indicate test completion
	});

	// Test Case 2: Verifies calendar generation including days from preceding and succeeding months.
	testCase('should include adjacent month days in the grid when configured', (completionHandler) => {
		// Configuration options for the generator
		const generatorOptions = { includeAdjacentMonths: true };
		const queryYear = 1986;
		const queryMonth = 9; // October (0-indexed)

		const gridManager = new TemporalGridGen(generatorOptions);
		const resultantGrid = gridManager.retrieveCalendarGrid(queryYear, queryMonth);

		// Expected grid with adjacent months for October 1986 (default week start: Sunday)
		const expectedGrid = [
			createExpectedDateCell(28, 0, 8, 1986, true), createExpectedDateCell(29, 1, 8, 1986, true), createExpectedDateCell(30, 2, 8, 1986, true),
			createExpectedDateCell(1, 3, 9, 1986), createExpectedDateCell(2, 4, 9, 1986), createExpectedDateCell(3, 5, 9, 1986), createExpectedDateCell(4, 6, 9, 1986),
			createExpectedDateCell(5, 0, 9, 1986), createExpectedDateCell(6, 1, 9, 1986), createExpectedDateCell(7, 2, 9, 1986), createExpectedDateCell(8, 3, 9, 1986),
			createExpectedDateCell(9, 4, 9, 1986), createExpectedDateCell(10, 5, 9, 1986), createExpectedDateCell(11, 6, 9, 1986), createExpectedDateCell(12, 0, 9, 1986),
			createExpectedDateCell(13, 1, 9, 1986), createExpectedDateCell(14, 2, 9, 1986), createExpectedDateCell(15, 3, 9, 1986), createExpectedDateCell(16, 4, 9, 1986),
			createExpectedDateCell(17, 5, 9, 1986), createExpectedDateCell(18, 6, 9, 1986), createExpectedDateCell(19, 0, 9, 1986), createExpectedDateCell(20, 1, 9, 1986),
			createExpectedDateCell(21, 2, 9, 1986), createExpectedDateCell(22, 3, 9, 1986), createExpectedDateCell(23, 4, 9, 1986), createExpectedDateCell(24, 5, 9, 1986),
			createExpectedDateCell(25, 6, 9, 1986), createExpectedDateCell(26, 0, 9, 1986), createExpectedDateCell(27, 1, 9, 1986), createExpectedDateCell(28, 2, 9, 1986),
			createExpectedDateCell(29, 3, 9, 1986), createExpectedDateCell(30, 4, 9, 1986), createExpectedDateCell(31, 5, 9, 1986),
			createExpectedDateCell(1, 6, 10, 1986, true)
		];

		verifier.deepStrictEqual(resultantGrid, expectedGrid, 'Grid should correctly show adjacent month days.');
		completionHandler();
	});

	// Test Case 3: Confirms correct calendar generation with adjacent months and a custom week start day.
	testCase('should handle adjacent months and a different week start day', (completionHandler) => {
		const generatorOptions = { includeAdjacentMonths: true, startDayOfWeek: 1 }; // Monday is 1
		const queryYear = 1986;
		const queryMonth = 9; // October (0-indexed)

		const gridManager = new TemporalGridGen(generatorOptions);
		const resultantGrid = gridManager.retrieveCalendarGrid(queryYear, queryMonth);

		// Expected grid for October 1986, with adjacent months, week starting Monday (1)
		const expectedGrid = [
			createExpectedDateCell(29, 1, 8, 1986, true), createExpectedDateCell(30, 2, 8, 1986, true),
			createExpectedDateCell(1, 3, 9, 1986), createExpectedDateCell(2, 4, 9, 1986), createExpectedDateCell(3, 5, 9, 1986), createExpectedDateCell(4, 6, 9, 1986), createExpectedDateCell(5, 0, 9, 1986),
			createExpectedDateCell(6, 1, 9, 1986), createExpectedDateCell(7, 2, 9, 1986), createExpectedDateCell(8, 3, 9, 1986), createExpectedDateCell(9, 4, 9, 1986), createExpectedDateCell(10, 5, 9, 1986), createExpectedDateCell(11, 6, 9, 1986), createExpectedDateCell(12, 0, 9, 1986),
			createExpectedDateCell(13, 1, 9, 1986), createExpectedDateCell(14, 2, 9, 1986), createExpectedDateCell(15, 3, 9, 1986), createExpectedDateCell(16, 4, 9, 1986), createExpectedDateCell(17, 5, 9, 1986), createExpectedDateCell(18, 6, 9, 1986), createExpectedDateCell(19, 0, 9, 1986),
			createExpectedDateCell(20, 1, 9, 1986), createExpectedDateCell(21, 2, 9, 1986), createExpectedDateCell(22, 3, 9, 1986), createExpectedDateCell(23, 4, 9, 1986), createExpectedDateCell(24, 5, 9, 1986), createExpectedDateCell(25, 6, 9, 1986), createExpectedDateCell(26, 0, 9, 1986),
			createExpectedDateCell(27, 1, 9, 1986), createExpectedDateCell(28, 2, 9, 1986), createExpectedDateCell(29, 3, 9, 1986), createExpectedDateCell(30, 4, 9, 1986), createExpectedDateCell(31, 5, 9, 1986),
			createExpectedDateCell(1, 6, 10, 1986, true), createExpectedDateCell(2, 0, 10, 1986, true)
		];

		verifier.deepStrictEqual(resultantGrid, expectedGrid, 'Grid should adjust week start day correctly with adjacent months.');
		completionHandler();
	});

	// Test Case 4: Checks calendar generation with sibling months and specified date selections.
	testCase('should mark selected dates correctly within the grid, including adjacent months', (completionHandler) => {
		const selectionBeginDate = { dayOfMonth: 5, monthIndex: 9, fullYear: 2010 }; // Oct 5, 2010
		const selectionEndDate = { dayOfMonth: 20, monthIndex: 9, fullYear: 2010 }; // Oct 20, 2010

		const generatorOptions = {
			includeAdjacentMonths: true,
			selectionStart: selectionBeginDate,
			selectionEnd: selectionEndDate
		};
		const queryYear = 2010;
		const queryMonth = 9; // October (0-indexed)

		const gridManager = new TemporalGridGen(generatorOptions);
		const resultantGrid = gridManager.retrieveCalendarGrid(queryYear, queryMonth);

		// Expected grid for October 2010, with selected dates and adjacent months
		const expectedGrid = [
			createExpectedDateCell(31, 0, 8, 2010, true, false),
			createExpectedDateCell(1, 1, 9, 2010, false, false), createExpectedDateCell(2, 2, 9, 2010, false, false), createExpectedDateCell(3, 3, 9, 2010, false, false), createExpectedDateCell(4, 4, 9, 2010, false, false),
			createExpectedDateCell(5, 5, 9, 2010, false, true), createExpectedDateCell(6, 6, 9, 2010, false, true), createExpectedDateCell(7, 0, 9, 2010, false, true), createExpectedDateCell(8, 1, 9, 2010, false, true), createExpectedDateCell(9, 2, 9, 2010, false, true), createExpectedDateCell(10, 3, 9, 2010, false, true), createExpectedDateCell(11, 4, 9, 2010, false, true),
			createExpectedDateCell(12, 5, 9, 2010, false, true), createExpectedDateCell(13, 6, 9, 2010, false, true), createExpectedDateCell(14, 0, 9, 2010, false, true), createExpectedDateCell(15, 1, 9, 2010, false, true), createExpectedDateCell(16, 2, 9, 2010, false, true), createExpectedDateCell(17, 3, 9, 2010, false, true), createExpectedDateCell(18, 4, 9, 2010, false, true),
			createExpectedDateCell(19, 5, 9, 2010, false, true), createExpectedDateCell(20, 6, 9, 2010, false, true), createExpectedDateCell(21, 0, 9, 2010, false, false), createExpectedDateCell(22, 1, 9, 2010, false, false), createExpectedDateCell(23, 2, 9, 2010, false, false), createExpectedDateCell(24, 3, 9, 2010, false, false), createExpectedDateCell(25, 4, 9, 2010, false, false),
			createExpectedDateCell(26, 5, 9, 2010, false, false), createExpectedDateCell(27, 6, 9, 2010, false, false), createExpectedDateCell(28, 0, 9, 2010, false, false), createExpectedDateCell(29, 1, 9, 2010, false, false), createExpectedDateCell(30, 2, 9, 2010, false, false),
			createExpectedDateCell(1, 3, 10, 2010, true, false), createExpectedDateCell(2, 4, 10, 2010, true, false), createExpectedDateCell(3, 5, 10, 2010, true, false), createExpectedDateCell(4, 6, 10, 2010, true, false)
		];

		verifier.deepStrictEqual(resultantGrid, expectedGrid, 'Calendar should correctly reflect date selections.');
		completionHandler();
	});

	// Test Case 5: Validates February 1990, a non-leap year.
	testCase('should correctly generate February 1990 (non-leap year)', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		const resultantGrid = gridManager.retrieveCalendarGrid(1990, 1); // February (0-indexed)

		// The 33rd element (index 32) should be null as Feb 1990 has 28 days and ends on a Thursday
		// followed by 3 nulls to complete the 6x7 grid (total 42 elements).
		// The 29th day would be index 28 (1st is index 0 for the month, if no preceding days).
		// Counting from the start of the array, the 29th actual day of the month.
		// Original logic was `calendarDays[32]`, let's replicate that index.
		// For Feb 1990, it starts on Friday (weekday 5).
		// 28 days + 5 leading nulls = 33 elements. So index 32 is the last day. The 33rd element is the first null.
		verifier.strictEqual(resultantGrid[32], null, 'February 1990 should have 28 days, making the 33rd cell null.');
		completionHandler();
	});

	// Test Case 6: Validates February 1996, a leap year.
	testCase('should correctly generate February 1996 (leap year)', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		const resultantGrid = gridManager.retrieveCalendarGrid(1996, 1); // February (0-indexed)

		// February 1996 has 29 days. It starts on a Thursday (weekDay: 4).
		// This means 4 leading nulls. Day 1 is index 4. Day 29 is index 4 + 28 = 32.
		// So the element at index 32 should be Feb 29.
		const expectedDayCell = createExpectedDateCell(29, 4, 1, 1996);
		verifier.deepStrictEqual(resultantGrid[32], expectedDayCell, 'February 1996 should include a 29th day.');
		completionHandler();
	});

	// Test Case 7: Validates February 2000, a leap year (century rule).
	testCase('should correctly generate February 2000 (century leap year)', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		const resultantGrid = gridManager.retrieveCalendarGrid(2000, 1); // February (0-indexed)

		// February 2000 has 29 days. It starts on a Tuesday (weekDay: 2).
		// This means 2 leading nulls. Day 1 is index 2. Day 29 is index 2 + 28 = 30.
		// So the element at index 30 should be Feb 29.
		const expectedDayCell = createExpectedDateCell(29, 2, 1, 2000);
		verifier.deepStrictEqual(resultantGrid[30], expectedDayCell, 'February 2000 should include a 29th day due to century leap year rule.');
		completionHandler();
	});

	// Test Case 8: Validates February 2100, a non-leap year (century rule).
	testCase('should correctly generate February 2100 (non-leap century)', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		const resultantGrid = gridManager.retrieveCalendarGrid(2100, 1); // February (0-indexed)

		// February 2100 has 28 days. It starts on a Tuesday (weekDay: 2).
		// This means 2 leading nulls. Day 1 is index 2. Day 28 is index 2 + 27 = 29.
		// So the element at index 29 should be null, as it would be the 29th day.
		verifier.strictEqual(resultantGrid[29], null, 'February 2100 should not have a 29th day as it is not a leap year.');
		completionHandler();
	});

	// Test Case 9: Verifies date selection status within the same month.
	testCase('should determine date selection status accurately for dates within the same month', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		gridManager.setSelectionStart({ fullYear: 2010, monthIndex: 0, dayOfMonth: 15 }); // Jan 15, 2010
		gridManager.setSelectionEnd({ fullYear: 2010, monthIndex: 0, dayOfMonth: 17 });   // Jan 17, 2010

		// Helper for concise date object creation for checks
		const createTestDate = (day) => ({ fullYear: 2010, monthIndex: 0, dayOfMonth: day });

		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(14)), false, 'Jan 14, 2010 should not be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(15)), true, 'Jan 15, 2010 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(16)), true, 'Jan 16, 2010 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(17)), true, 'Jan 17, 2010 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(18)), false, 'Jan 18, 2010 should not be selected.');

		// Adding an edge case check: same start and end date
		gridManager.setSelectionStart(createTestDate(10));
		gridManager.setSelectionEnd(createTestDate(10));
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(10)), true, 'Jan 10, 2010 should be selected when start and end are identical.');

		completionHandler();
	});

	// Test Case 10: Verifies date selection status across multiple months within the same year.
	testCase('should determine date selection status accurately for dates across multiple months in the same year', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		gridManager.setSelectionStart({ fullYear: 2010, monthIndex: 1, dayOfMonth: 15 }); // Feb 15, 2010
		gridManager.setSelectionEnd({ fullYear: 2010, monthIndex: 3, dayOfMonth: 15 });   // Apr 15, 2010

		// Helper for concise date object creation for checks
		const createTestDate = (month, day) => ({ fullYear: 2010, monthIndex: month, dayOfMonth: day });

		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(0, 15)), false, 'Jan 15, 2010 should not be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(1, 14)), false, 'Feb 14, 2010 should not be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(1, 15)), true, 'Feb 15, 2010 should be selected (start date).');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(1, 16)), true, 'Feb 16, 2010 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2, 15)), true, 'Mar 15, 2010 should be selected (middle month).');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(3, 15)), true, 'Apr 15, 2010 should be selected (end date).');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(3, 16)), false, 'Apr 16, 2010 should not be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(4, 15)), false, 'May 15, 2010 should not be selected.');
		completionHandler();
	});

	// Test Case 11: Verifies date selection status across multiple years.
	testCase('should determine date selection status accurately for dates spanning multiple years', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		gridManager.setSelectionStart({ fullYear: 2010, monthIndex: 1, dayOfMonth: 15 }); // Feb 15, 2010
		gridManager.setSelectionEnd({ fullYear: 2012, monthIndex: 1, dayOfMonth: 15 });   // Feb 15, 2012

		// Helper for concise date object creation for checks
		const createTestDate = (year, month, day) => ({ fullYear: year, monthIndex: month, dayOfMonth: day });

		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2010, 0, 15)), false, 'Jan 15, 2010 should not be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2010, 1, 14)), false, 'Feb 14, 2010 should not be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2010, 1, 15)), true, 'Feb 15, 2010 should be selected (start date).');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2010, 11, 31)), true, 'Dec 31, 2010 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2011, 0, 1)), true, 'Jan 1, 2011 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2011, 1, 15)), true, 'Feb 15, 2011 should be selected (middle year).');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2011, 11, 31)), true, 'Dec 31, 2011 should be selected.');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2012, 1, 15)), true, 'Feb 15, 2012 should be selected (end date).');
		verifier.strictEqual(gridManager.checkDateSelectionStatus(createTestDate(2012, 1, 16)), false, 'Feb 16, 2012 should not be selected.');
		completionHandler();
	});

	// Test Case 12: Verifies the calculation of date intervals.
	testCase('should correctly calculate the number of days between two dates', (completionHandler) => {
		// Note: The `calculateDayDifference` method is assumed to be static on the class.
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 1986, monthIndex: 1, dayOfMonth: 16 }, { fullYear: 1986, monthIndex: 1, dayOfMonth: 16 }), 1, 'Interval for same day should be 1.');
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 1986, monthIndex: 1, dayOfMonth: 10 }, { fullYear: 1986, monthIndex: 2, dayOfMonth: 10 }), 29, 'Interval Feb 10 - Mar 10, 1986 should be 29 days.'); // Feb 1986 has 28 days. Feb 10 -> Mar 10 is 19 days in Feb + 10 in Mar = 29 days.
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 1986, monthIndex: 0, dayOfMonth: 1 }, { fullYear: 1986, monthIndex: 11, dayOfMonth: 31 }), 365, 'Interval for non-leap year 1986 should be 365 days.');
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 1990, monthIndex: 0, dayOfMonth: 1 }, { fullYear: 1990, monthIndex: 11, dayOfMonth: 31 }), 365, 'Interval for non-leap year 1990 should be 365 days.');
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 1996, monthIndex: 0, dayOfMonth: 1 }, { fullYear: 1996, monthIndex: 11, dayOfMonth: 31 }), 366, 'Interval for leap year 1996 should be 366 days.');
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 2000, monthIndex: 0, dayOfMonth: 1 }, { fullYear: 2000, monthIndex: 11, dayOfMonth: 31 }), 366, 'Interval for century leap year 2000 should be 366 days.');
		verifier.strictEqual(TemporalGridGen.calculateDayDifference({ fullYear: 2100, monthIndex: 0, dayOfMonth: 1 }, { fullYear: 2100, monthIndex: 11, dayOfMonth: 31 }), 365, 'Interval for non-leap century 2100 should be 365 days.');
		completionHandler();
	});

	// Test Case 13: Verifies the ability to set the starting date for selection.
	testCase('should allow setting a specific selection start date', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		const newStartDate = { fullYear: 2010, monthIndex: 1, dayOfMonth: 15 };
		gridManager.setSelectionStart(newStartDate);

		// Add a check for immutability (if applicable, though not strictly required by original)
		const retrievedStartDate = gridManager.selectionStart;
		verifier.notStrictEqual(retrievedStartDate, newStartDate, 'The stored start date object should not be the same instance as the input.');
		verifier.deepStrictEqual(retrievedStartDate, newStartDate, 'The retrieved start date should deeply match the set date.');
		completionHandler();
	});

	// Test Case 14: Verifies the ability to set the ending date for selection.
	testCase('should allow setting a specific selection end date', (completionHandler) => {
		const gridManager = new TemporalGridGen();
		const newEndDate = { fullYear: 2010, monthIndex: 1, dayOfMonth: 15 };
		gridManager.setSelectionEnd(newEndDate);

		// Add a check for immutability
		const retrievedEndDate = gridManager.selectionEnd;
		verifier.notStrictEqual(retrievedEndDate, newEndDate, 'The stored end date object should not be the same instance as the input.');
		verifier.deepStrictEqual(retrievedEndDate, newEndDate, 'The retrieved end date should deeply match the set date.');
		completionHandler();
	});

}); // End of test suite 'temporal-grid-generator-core-features'