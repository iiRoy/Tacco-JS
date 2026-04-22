'use strict';
((processSource) => {
    const contentPayload = processSource.toString().trim().split('\n');

    ((overallDurationInSeconds) => {
        const calculatedHours = Math.floor(overallDurationInSeconds / 3600);
        const remainderAfterHours = overallDurationInSeconds % 3600;
        const calculatedMinutes = Math.floor(remainderAfterHours / 60);
        const calculatedSeconds = remainderAfterHours % 60;

        console.info(calculatedHours, calculatedMinutes, calculatedSeconds);

    })(parseInt(contentPayload[0], 10));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));