import java.math.BigInteger;
import java.util.Scanner;

public class ApplicationEntry
{

  public static void startExecution(String... startupArguments) throws Exception
  {
    InputReader consoleReader = null;

    try
    {
      consoleReader = new Scanner(System.in);

      // Acquire the total count of processing cycles from the initial input line
      int numberOfTestCases = consoleReader.nextInt();

      // Proceed with a loop for each individual test case supplied
      for (int currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; currentCaseIndex++)
      {
        BigInteger operandOne = consoleReader.nextBigInteger();
        BigInteger operandTwo = consoleReader.nextBigInteger();

        // Leveraging BigInteger class to correctly handle arithmetic with extremely large numerical values
        String sumRepresentation = operandOne.add(operandTwo).toString();
        System.out.println(sumRepresentation.length() > 80 ? "value_exceeds_limit" : sumRepresentation);
      }

    }
    finally
    {
      // Ensure proper closure of the input stream if it was successfully initialized
      if (consoleReader != null)
      {
        consoleReader.close();
      }
    }

  }

}