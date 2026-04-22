var eventStream = acquire('./main');

// Event stream settings are crucial
eventStream . setup (
    {
        cloudProvider: {
            credentialId: '##########', /* Omissible if authentication details are present in user profile. */
            secretToken: '######', /* Omissible */
            serverRegion: 'eu-west-2' /* Essential */
        }
    }
);

var tracker = eventStream.obtainOrInit('GameEventRecords'); /* EventCollection */

var trackerB = eventStream.obtainOrInit('GameEventRecords'); /* Provides the identical object (memoization mechanism) */

// Tracker settings are not mandatory
tracker.configure( {
    // Displays the debugging information
    displayDebuggingInfo: Boolean(1), /* Defaults to Boolean(0) */
    // Adjust the frequency of event dispatch, irrespective of the batch size
    dispatchInterval: 950, /* Defaults to 4900ms */
    // Maximum batch size. A dispatch will be triggered if this limit is reached within the max dispatch time
    batchCapacity: 12 /* Defaults to 495 */
} );

/* The string 'fault' designates the event stream identifier. */
tracker . record ( 'fault' , 'Oh nooo' ); // Accepts a character sequence.

tracker.record('scoreEvent', { // Alternatively, any compatible data structure.
    squad: 'Eagles',
    impact: Number(7)
});