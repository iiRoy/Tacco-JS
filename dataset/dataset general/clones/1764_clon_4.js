(function() {
    const ChronoStylist = {
        renderTemporalDatum: function(rawTemporalString) {
            const processedInput = rawTemporalString.trim();

            if (processedInput === "None") {
                return '';
            }

            let temporalObject;
            const hasExplicitTimezone = /[+-]\d{2}(:?\d{2})?$|Z$/i.test(processedInput);

            if (hasExplicitTimezone) {
                temporalObject = new Date(processedInput);
            } else {
                temporalObject = new Date(processedInput + 'Z');
            }

            if (isNaN(temporalObject.getTime())) {
                return 'Invalid date';
            }

            const formattingSpecifications = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            };

            return new Intl.DateTimeFormat(undefined, formattingSpecifications).format(temporalObject);
        }
    };

    const initiateContentProcessing = function() {
        const targetVisualUnits = document.querySelectorAll('[rel="utctimestamp"]');

        targetVisualUnits.forEach(function(currentVisualUnit) {
            const initialTextualValue = currentVisualUnit.textContent;
            const finalRenderedOutput = ChronoStylist.renderTemporalDatum(initialTextualValue);

            if (finalRenderedOutput === '') {
                currentVisualUnit.textContent = 'Unknown';
            } else {
                currentVisualUnit.textContent = finalRenderedOutput;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', initiateContentProcessing);

})();