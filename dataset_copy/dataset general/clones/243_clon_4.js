const temporalProcessor = function() {
    let currentChronology = new Date('2014-01-01T18:00:00');

    const incrementByDayCycle = function(targetMoment) {
        const dailySpan = 24 * 60 * 60 * 1000;
        targetMoment.setTime(targetMoment.getTime() + dailySpan);
    };

    const incrementBySolarHour = function(targetMoment) {
        const hourlySpan = 60 * 60 * 1000;
        targetMoment.setTime(targetMoment.getTime() + hourlySpan);
    };

    return {
        initialChronologicalPoint: currentChronology,
        advanceOneFullDay: incrementByDayCycle,
        advanceOneFullHour: incrementBySolarHour
    };
};