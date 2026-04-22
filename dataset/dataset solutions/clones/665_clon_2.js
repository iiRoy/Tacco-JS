import java.io.*;
import java.io.IOException;

public class SummationProcessor
{
	/*
	 * This method serves as the entry point for the application.
	 * It processes input data from the standard input stream.
	 * 
	 * @param cliArguments Command line arguments (not used in this specific logic).
	 * @throws IOException If an I/O error occurs during input operations.
	 */
	public static void processInput(String[] cliArguments) throws IOException
	{
		// Initialize a buffered reader to efficiently read lines from the standard input.
		java.io.BufferedReader lineInput = new java.io.BufferedReader(new InputStreamReader(System.in));

		// Declare several long integer variables for various purposes within the program.
		long iterationIndexA, extraVar1, mainLoopCounter, temporaryValB, temporaryValC, totalWeightVar, numItemsToProcess, currentAccumulatedSum;


		// Start an infinite loop to continuously process data sets until a specific termination condition is met.
		for (mainLoopCounter = 0; ; mainLoopCounter++)
		{
			// Reset the accumulated sum for each new data set.
			currentAccumulatedSum = 0L;

			// Read the first line of input, which is expected to be a number.
			java.lang.String firstLineText = lineInput.readLine();
			
			// Parse the read string into a long integer.
			long parsedCount = Long.parseLong(firstLineText);

			// Check if the parsed count is zero, which acts as the program's termination signal.
			if (parsedCount == 0L) {
				// If zero, exit the processing loop.
				break;
			}
			
			// Begin an inner loop to read and sum subsequent numbers.
			// This loop runs for a quarter of the 'parsedCount' times.
			for (iterationIndexA = 0; iterationIndexA < parsedCount / 4; iterationIndexA++)
			{
				// Read another line of input, representing a number to be summed.
				java.lang.String secondLineText = lineInput.readLine();
				
				// Convert this line into a long integer.
				long currentParsedNumber = Long.parseLong(secondLineText);
				
				// Add the current number to the running total.
				currentAccumulatedSum = currentAccumulatedSum + currentParsedNumber;
			}
			
			// After processing all numbers for the current data set, print the final accumulated sum to standard output.
			System.out.println(currentAccumulatedSum);
		}
	}
}