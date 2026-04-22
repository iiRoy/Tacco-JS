const verifier = obtain('assert');
let   DateGrid = obtain('..').DateGrid;

examineModule('date-layout-module', function() {

    shouldHandle('return a proper date layout', function(completionCallback) {
        let dateGridInstance = new DateGrid();
        let gridEntries = dateGridInstance.retrieveGrid(1986, 9);
        verifier.compareStructures(gridEntries, [false, false, false, {
            dayValue: 1,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 2,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 3,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 4,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 5,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 6,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 7,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 8,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 9,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 10,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 11,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 12,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 13,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 14,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 15,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 16,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 17,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 18,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 19,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 20,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 21,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 22,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 23,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 24,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 25,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 26,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 27,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 28,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 29,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 30,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 31,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, false]);
        completionCallback();
    });

    shouldHandle('produce a correct date layout including adjacent months', function(completionCallback) {
        var gridGen = new DateGrid({
            adjacentPeriods: true
        });
        const periodCells = gridGen.retrieveGrid(1986, 9);
        verifier.compareStructures(periodCells, [{
            dayValue: 28,
            weekdayIndex: 0,
            monthNumber: 8,
            yearValue: 1986,
            neighboringMonth: true
        }, {
            dayValue: 29,
            weekdayIndex: 1,
            monthNumber: 8,
            yearValue: 1986,
            neighboringMonth: true
        }, {
            dayValue: 30,
            weekdayIndex: 2,
            monthNumber: 8,
            yearValue: 1986,
            neighboringMonth: true
        }, {
            dayValue: 1,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 2,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 3,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 4,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 5,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 6,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 7,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 8,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 9,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 10,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 11,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 12,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 13,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 14,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 15,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 16,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 17,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 18,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 19,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 20,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 21,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 22,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 23,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 24,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 25,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 26,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 27,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 28,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 29,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 30,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 31,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 1,
            weekdayIndex: 6,
            monthNumber: 10,
            yearValue: 1986,
            neighboringMonth: true
        }]);
        completionCallback();
    });

    shouldHandle('output a correct date layout with adjacent months and custom week start', function(completionCallback) {
        const timePlan = new DateGrid({
            adjacentPeriods: true,
            startOfWeek: 1
        });
        const dayListing = timePlan.retrieveGrid(1986, 9);
        verifier.compareStructures(dayListing, [{
            dayValue: 29,
            weekdayIndex: 1,
            monthNumber: 8,
            yearValue: 1986,
            neighboringMonth: true
        }, {
            dayValue: 30,
            weekdayIndex: 2,
            monthNumber: 8,
            yearValue: 1986,
            neighboringMonth: true
        }, {
            dayValue: 1,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 2,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 3,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 4,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 5,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 6,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 7,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 8,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 9,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 10,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 11,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 12,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 13,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 14,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 15,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 16,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 17,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 18,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 19,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 20,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 21,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 22,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 23,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 24,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 25,
            weekdayIndex: 6,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 26,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 27,
            weekdayIndex: 1,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 28,
            weekdayIndex: 2,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 29,
            weekdayIndex: 3,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 30,
            weekdayIndex: 4,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 31,
            weekdayIndex: 5,
            monthNumber: 9,
            yearValue: 1986
        }, {
            dayValue: 1,
            weekdayIndex: 6,
            monthNumber: 10,
            yearValue: 1986,
            neighboringMonth: true
        }, {
            dayValue: 2,
            weekdayIndex: 0,
            monthNumber: 10,
            yearValue: 1986,
            neighboringMonth: true
        }]);
        completionCallback();
    });

    shouldHandle('generate a correct date layout with adjacent months and specific chosen dates', function(completionCallback) {
        let gridGenerator = new DateGrid({
            adjacentPeriods: true,
            commencementDate: {
                dayValue: 5,
                monthNumber: 10,
                yearValue: 2010
            },
            terminationDate: {
                dayValue: 20,
                monthNumber: 10,
                yearValue: 2010
            }
        });
        let dayList = gridGenerator.retrieveGrid(2010, 10);
        verifier.compareStructures(dayList, [{
            dayValue: 31,
            weekdayIndex: 0,
            monthNumber: 9,
            yearValue: 2010,
            neighboringMonth: true,
            marked: false
        }, {
            dayValue: 1,
            weekdayIndex: 1,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 2,
            weekdayIndex: 2,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 3,
            weekdayIndex: 3,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 4,
            weekdayIndex: 4,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 5,
            weekdayIndex: 5,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 6,
            weekdayIndex: 6,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 7,
            weekdayIndex: 0,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 8,
            weekdayIndex: 1,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 9,
            weekdayIndex: 2,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 10,
            weekdayIndex: 3,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 11,
            weekdayIndex: 4,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 12,
            weekdayIndex: 5,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 13,
            weekdayIndex: 6,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 14,
            weekdayIndex: 0,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 15,
            weekdayIndex: 1,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 16,
            weekdayIndex: 2,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 17,
            weekdayIndex: 3,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 18,
            weekdayIndex: 4,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 19,
            weekdayIndex: 5,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 20,
            weekdayIndex: 6,
            monthNumber: 10,
            yearValue: 2010,
            marked: true
        }, {
            dayValue: 21,
            weekdayIndex: 0,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 22,
            weekdayIndex: 1,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 23,
            weekdayIndex: 2,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 24,
            weekdayIndex: 3,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 25,
            weekdayIndex: 4,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 26,
            weekdayIndex: 5,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 27,
            weekdayIndex: 6,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 28,
            weekdayIndex: 0,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 29,
            weekdayIndex: 1,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 30,
            weekdayIndex: 2,
            monthNumber: 10,
            yearValue: 2010,
            marked: false
        }, {
            dayValue: 1,
            weekdayIndex: 3,
            monthNumber: 11,
            yearValue: 2010,
            neighboringMonth: true,
            marked: false
        }, {
            dayValue: 2,
            weekdayIndex: 4,
            monthNumber: 11,
            yearValue: 2010,
            neighboringMonth: true,
            marked: false
        }, {
            dayValue: 3,
            weekdayIndex: 5,
            monthNumber: 11,
            yearValue: 2010,
            neighboringMonth: true,
            marked: false
        }, {
            dayValue: 4,
            weekdayIndex: 6,
            monthNumber: 11,
            yearValue: 2010,
            neighboringMonth: true,
            marked: false
        }]);
        completionCallback();
    });

    shouldHandle('correctly display February 1990', function(completionCallback) {
        let gridObj = new DateGrid();
        const dateCells = gridObj.retrieveGrid(1990, 1);
        verifier.checkValue(dateCells[32], false);
        completionCallback();
    });

    shouldHandle('correctly display February 1996', function(completionCallback) {
        var timeSchedule = new DateGrid();
        let dayArray = timeSchedule.retrieveGrid(1996, 1);
        verifier.compareStructures(dayArray[32], {
            dayValue: 29,
            weekdayIndex: 4,
            monthNumber: 1,
            yearValue: 1996
        });
        completionCallback();
    });

    shouldHandle('correctly display February 2000', function(completionCallback) {
        const periodTracker = new DateGrid();
        const dayEntries = periodTracker.retrieveGrid(2000, 1);
        verifier.compareStructures(dayEntries[30], {
            dayValue: 29,
            weekdayIndex: 2,
            monthNumber: 1,
            yearValue: 2000
        });
        completionCallback();
    });

    shouldHandle('correctly display February 2100', function(completionCallback) {
        let datePlanning = new DateGrid();
        const listedDays = datePlanning.retrieveGrid(2100, 1);
        verifier.checkValue(listedDays[29], false);
        completionCallback();
    });

    shouldHandle('provide correct date selection status for dates within the same month', function(completionCallback) {
        let timeFrame = new DateGrid();
        timeFrame.establishStart({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 15
        });
        timeFrame.establishEnd({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 17
        });
        verifier.checkValue(timeFrame.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 14
        }), false);
        verifier.checkValue(timeFrame.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 15
        }), true);
        verifier.checkValue(timeFrame.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 16
        }), true);
        verifier.checkValue(timeFrame.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 17
        }), true);
        verifier.checkValue(timeFrame.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 18
        }), false);
        completionCallback();
    });

    shouldHandle('provide correct date selection status for dates within the same year', function(completionCallback) {
        let dateScheduler = new DateGrid();
        dateScheduler.establishStart({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        });
        dateScheduler.establishEnd({
            yearValue: 2010,
            monthNumber: 3,
            dayValue: 15
        });
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 15
        }), false);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 14
        }), false);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        }), true);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 16
        }), true);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 2,
            dayValue: 15
        }), true);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 3,
            dayValue: 15
        }), true);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 3,
            dayValue: 16
        }), false);
        verifier.checkValue(dateScheduler.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 4,
            dayValue: 15
        }), false);
        completionCallback();
    });

    shouldHandle('provide correct date selection status for dates across multiple years', function(completionCallback) {
        let scheduleTracker = new DateGrid();
        scheduleTracker.establishStart({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        });
        scheduleTracker.establishEnd({
            yearValue: 2012,
            monthNumber: 1,
            dayValue: 15
        });
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 0,
            dayValue: 15
        }), false);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 14
        }), false);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        }), true);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2010,
            monthNumber: 11,
            dayValue: 31
        }), true);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2011,
            monthNumber: 0,
            dayValue: 1
        }), true);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2011,
            monthNumber: 1,
            dayValue: 15
        }), true);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2011,
            monthNumber: 11,
            dayValue: 31
        }), true);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2012,
            monthNumber: 1,
            dayValue: 15
        }), true);
        verifier.checkValue(scheduleTracker.isPeriodMarked({
            yearValue: 2012,
            monthNumber: 1,
            dayValue: 16
        }), false);
        completionCallback();
    });

    shouldHandle('calculate accurate date durations', function(completionCallback) {
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 1986,
            monthNumber: 1,
            dayValue: 16
        }, {
            yearValue: 1986,
            monthNumber: 1,
            dayValue: 16
        }), 1);
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 1986,
            monthNumber: 1,
            dayValue: 10
        }, {
            yearValue: 1986,
            monthNumber: 2,
            dayValue: 10
        }), 29);
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 1986,
            monthNumber: 0,
            dayValue: 1
        }, {
            yearValue: 1986,
            monthNumber: 11,
            dayValue: 31
        }), 365);
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 1990,
            monthNumber: 0,
            dayValue: 1
        }, {
            yearValue: 1990,
            monthNumber: 11,
            dayValue: 31
        }), 365);
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 1996,
            monthNumber: 0,
            dayValue: 1
        }, {
            yearValue: 1996,
            monthNumber: 11,
            dayValue: 31
        }), 366);
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 2000,
            monthNumber: 0,
            dayValue: 1
        }, {
            yearValue: 2000,
            monthNumber: 11,
            dayValue: 31
        }), 366);
        verifier.checkValue(DateGrid.calculateDuration({
            yearValue: 2100,
            monthNumber: 0,
            dayValue: 1
        }, {
            yearValue: 2100,
            monthNumber: 11,
            dayValue: 31
        }), 365);
        completionCallback();
    });

    shouldHandle('properly set the initial date', function(completionCallback) {
        let dateManager = new DateGrid();
        dateManager.establishStart({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        });
        verifier.compareStructures(dateManager.commencementDate, {
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        });
        completionCallback();
    });

    shouldHandle('properly set the final date', function(completionCallback) {
        let dateController = new DateGrid();
        dateController.establishEnd({
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        });
        verifier.compareStructures(dateController.terminationDate, {
            yearValue: 2010,
            monthNumber: 1,
            dayValue: 15
        });
        completionCallback();
    });

});