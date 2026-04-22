import java.util.Scanner;

public  class  NumericComparisonUtility  {

  public static void  evaluateNumbers ( String [ ]  cliArguments )
  {
    // Establish an input reader to obtain data from the standard system input
    Scanner  sourceReader  =  new  java.util.Scanner ( System.in ) ;

    // Retrieve the initial numerical value from the user input
    long  firstOperand  =  sourceReader.nextLong ( ) ;

    // Obtain the subsequent numerical value from the user input
    long  secondOperand  =  sourceReader.nextLong ( ) ;

    // Perform a comparative analysis of the two received values
    if ( firstOperand  <  secondOperand )
    {
      // Display a message indicating the first value is strictly smaller
      System.out.println ( "The first value is less than the second." ) ;
    }
    else  if ( firstOperand  >  secondOperand )
    {
      // Display a message indicating the first value is strictly larger
      System.out.println ( "The first value is greater than the second." ) ;
    }
    else
    {
      // Display a message indicating both values are identical
      System.out.println ( "The first value is equal to the second." ) ;
    }
  }

}