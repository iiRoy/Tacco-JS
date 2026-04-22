describe ( 'PianoCtrl', function ( ) {
    // Declare test variables for scope and controller.
    var scope , controller ;

    // This block runs before each test specification.
    beforeEach ( function ( ) {
        // Add a custom Jasmine matcher for comparison.
        this . addMatchers ( {
            toBeGreaterThanOrEqualTo : function ( expected ) {
                // The actual value should be greater than or equal to the expected value.
                return this . actual >= expected ;
            }
        } ) ;

        // Initialize the Angular scope for testing.
        scope = angular . scope ( ) ;

        // Create a new controller instance within the scope.
        controller = scope . $new ( PianoCtrl ) ;
    } ) ; // End of beforeEach block.


    // Test case: should measure latency on each send operation.
    it ( 'should measure latency on each send', function ( ) {
        // Get the XHR service from the browser mock.
        var xhr = scope . $service ( '$browser' ) . xhr ;

        // Define the MIDI command data to be sent.
        var data = { channel : 0 , command : 144 , note : 77 , velocity : 60 } ;

        // Expect a POST request to '/data/midi/send' with the specified data, and respond with the same data.
        xhr . expectPOST ( '/data/midi/send' , data ) . respond ( data ) ;

        // Initialize controller latency to -1 before sending.
        controller . latency = -1 ;

        // Send a MIDI Note ON command.
        controller . sendMidiCommand ( controller . NOTE_ON , 77 ) ;

        // Flush pending XHR requests to trigger the response.
        xhr . flush ( ) ;

        // Assert that the recorded latency is non-negative.
        expect ( controller . latency ) . toBeGreaterThanOrEqualTo ( 0 ) ;
    } ) ; // End of 'it' block.

} ) ; // End of describe block.