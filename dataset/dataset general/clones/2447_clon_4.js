(function() {
    'use strict';

    // Constants for time units in seconds, distinct from original
    const _minUnit = 60;
    const _hrUnit = _minUnit * 60;
    const _dayUnit = _hrUnit * 24;
    const _wkUnit = _dayUnit * 7;
    const _monUnit = _dayUnit * 30; // Approximation: 30 days for a month
    const _yrUnit = _dayUnit * 365; // Approximation: 365 days for a year

    // Default translation phrases, using different keys and placeholder
    const _translatedPhrases = {
        current_instant: 'just now',
        few_seconds_ago: '{{count}} seconds ago',
        one_minute_ago: 'a minute ago',
        multiple_minutes_ago: '{{count}} minutes ago',
        one_hour_ago: 'an hour ago',
        multiple_hours_ago: '{{count}} hours ago',
        one_day_ago: 'yesterday',
        multiple_days_ago: '{{count}} days ago',
        one_week_ago: 'a week ago',
        multiple_weeks_ago: '{{count}} weeks ago',
        one_month_ago: 'a month ago',
        multiple_months_ago: '{{count}} months ago',
        one_year_ago: 'a year ago',
        multiple_years_ago: '{{count}} years ago',
        beyond_one_year_ago: 'over a year ago',

        few_seconds_from: '{{count}} seconds from now',
        one_minute_from: 'a minute from now',
        multiple_minutes_from: '{{count}} minutes from now',
        one_hour_from: 'an hour from now',
        multiple_hours_from: '{{count}} hours from now',
        one_day_from: 'tomorrow',
        multiple_days_from: '{{count}} days from now',
        one_week_from: 'a week from now',
        multiple_weeks_from: '{{count}} weeks from now',
        one_month_from: 'a month from now',
        multiple_months_from: '{{count}} months from now',
        one_year_from: 'a year from now',
        multiple_years_from: '{{count}} years from now',
        beyond_one_year_from: 'over a year from now'
    };

    // Helper to fetch and format localized text, mimicking the original's $translate.instant behavior
    const _fetchLocalizedText = (baseIdentifier, countValue, contextOptions) => {
        let finalIdentifier;
        const isPastMoment = (contextOptions.referenceMoment >= contextOptions.targetMoment);

        if (baseIdentifier === 'current_instant') {
            finalIdentifier = baseIdentifier; // "just now" has no _ago/_from suffix
        } else if (isPastMoment) {
            finalIdentifier = baseIdentifier + '_ago';
        } else {
            finalIdentifier = baseIdentifier + '_from';
        }

        const translationMap = contextOptions.translationMap || _translatedPhrases;
        let phraseText = translationMap[finalIdentifier];

        // The original would throw if the key is missing. Replicating strict behavior.
        if (phraseText === undefined) {
             throw new Error(`Translation key not found: ${finalIdentifier}`);
        }

        return phraseText.replace('{{count}}', countValue);
    };

    // Main utility function, replacing the Angular filter
    function convertToFuzzyTime(pointInTime, configuration = {}) {
        // Prepare context for internal operations, distinct from original's injected 'now' and 'relativeDateTranslations'
        const operationContext = {
            referenceMoment: configuration.comparisonPoint || new Date(), // Equivalent to original's _now or new Date()
            translationMap: configuration.phraseSet || _translatedPhrases // Equivalent to original's relativeDateTranslations
        };

        // Ensure target date is a Date object
        let parsedPoint = (pointInTime instanceof Date) ? pointInTime : new Date(pointInTime);
        operationContext.targetMoment = parsedPoint; // Store for use in translation helper

        // Helper to calculate absolute difference in seconds, distinct from original's calculateDelta
        const determineIntervalSeconds = (firstDate, secondDate) => {
            return Math.round(Math.abs(firstDate.getTime() - secondDate.getTime()) / 1000);
        };

        let intervalInSeconds = determineIntervalSeconds(operationContext.referenceMoment, parsedPoint);

        // Replicate special date normalization: if delta is between a day and a week, normalize to midnight
        if (intervalInSeconds > _dayUnit && intervalInSeconds < _wkUnit) {
            parsedPoint = new Date(
                parsedPoint.getFullYear(),
                parsedPoint.getMonth(),
                parsedPoint.getDate(),
                0, 0, 0 // Set time to midnight
            );
            operationContext.targetMoment = parsedPoint; // Update target in context
            intervalInSeconds = determineIntervalSeconds(operationContext.referenceMoment, parsedPoint); // Recalculate delta
        }

        // Core logic: if/else if ladder, replacing the original's switch(false) statement
        if (intervalInSeconds < 30) {
            return _fetchLocalizedText('current_instant', null, operationContext);
        } else if (intervalInSeconds < _minUnit) {
            return _fetchLocalizedText('few_seconds', intervalInSeconds, operationContext);
        } else if (intervalInSeconds < 2 * _minUnit) {
            return _fetchLocalizedText('one_minute', null, operationContext);
        } else if (intervalInSeconds < _hrUnit) {
            return _fetchLocalizedText('multiple_minutes', Math.floor(intervalInSeconds / _minUnit), operationContext);
        } else if (Math.floor(intervalInSeconds / _hrUnit) === 1) { // Exactly 1 hour
            return _fetchLocalizedText('one_hour', null, operationContext);
        } else if (intervalInSeconds < _dayUnit) {
            return _fetchLocalizedText('multiple_hours', Math.floor(intervalInSeconds / _hrUnit), operationContext);
        } else if (intervalInSeconds < _dayUnit * 2) { // Less than 2 days (i.e., 1 day)
            return _fetchLocalizedText('one_day', null, operationContext);
        } else if (intervalInSeconds < _wkUnit) {
            return _fetchLocalizedText('multiple_days', Math.floor(intervalInSeconds / _dayUnit), operationContext);
        } else if (Math.floor(intervalInSeconds / _wkUnit) === 1) { // Exactly 1 week
            return _fetchLocalizedText('one_week', null, operationContext);
        } else if (intervalInSeconds < _monUnit) {
            return _fetchLocalizedText('multiple_weeks', Math.floor(intervalInSeconds / _wkUnit), operationContext);
        } else if (Math.floor(intervalInSeconds / _monUnit) === 1) { // Exactly 1 month (approx)
            return _fetchLocalizedText('one_month', null, operationContext);
        } else if (intervalInSeconds < _yrUnit) {
            return _fetchLocalizedText('multiple_months', Math.floor(intervalInSeconds / _monUnit), operationContext);
        } else if (Math.floor(intervalInSeconds / _yrUnit) === 1) { // Exactly 1 year (approx)
            return _fetchLocalizedText('one_year', null, operationContext);
        } else {
            return _fetchLocalizedText('beyond_one_year', null, operationContext);
        }
    }

    // This function is now defined within the IIFE, and is not globally exposed
    // unless explicitly assigned to `window` or `this` if in a browser context,
    // or exported in a module system. For a raw JS clone, it remains encapsulated.

}).call(this);