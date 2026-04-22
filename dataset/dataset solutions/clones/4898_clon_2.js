import java.io.*;

/*
 * This class contains the primary logic for processing a string.
 */
public class ProgramExecutor {

    /**
     * The entry point of the application.
     *
     * @param commandLineArguments Command line arguments (not used in this program).
     * @throws IOException If an I/O error occurs during input reading.
     */
    public static void executeTask( String[] commandLineArguments ) throws IOException {
        // Declare and initialize essential integer variables for tracking status and position.
        int    loopCounter, positionTracker = 0, firstMarkerFound = 0, secondMarkerFound = 0;

        // Set up input stream reader for standard input.
        InputStreamReader inputSource = new InputStreamReader( System.in );
        // Wrap the reader in a buffered reader for efficient line-by-line input.
        BufferedReader bufferReader = new BufferedReader( inputSource );

        // Read a single line of text from the console.
        String inputString = bufferReader.readLine();

        // Iterate through each character of the received string.
        for ( loopCounter = 0; loopCounter < inputString.length(); loopCounter++ ) {
            char currentChar = inputString.charAt( loopCounter ); // Get the character at the current index.

            // Check if the current character is the first target character ('C').
            if ( currentChar == 'C' ) {
                firstMarkerFound = 1; // Mark that the first character has been located.
                positionTracker = loopCounter; // Store the index where 'C' was found.
            }
        }

        // Begin a second pass from the position where 'C' was last found.
        while ( positionTracker < inputString.length() ) {
            char currentChar = inputString.charAt( positionTracker ); // Retrieve the character at the tracked position.

            // Check if the current character is the second target character ('F').
            if ( currentChar == 'F' ) {
                secondMarkerFound = 1; // Indicate that the second character has been located.
            }
            positionTracker++; // Move to the next character in the string.
        }

        // Compare the status of both markers.
        if ( firstMarkerFound == secondMarkerFound ) {
            System.out.println( "Yes" ); // Output "Yes" if both markers were found or neither was found.
        } else {
            System.out.println( "No" ); // Output "No" if only one marker's status is different.
        }
    }
}