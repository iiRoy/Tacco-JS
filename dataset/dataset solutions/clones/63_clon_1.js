import   java.math.BigInteger;
import java.util.Scanner;


public    class   Main
{


  public   static   void   main(String... args)
        throws   Exception
  {

    // Declare a Scanner object, initially null.
    Scanner   scanner   =   null   ;


    try
    {
      // Initialize the scanner to read from standard input.
      scanner   =   new   Scanner(System.in)   ;


      // The first line of input specifies the number of data sets to process.
      int   dataSetNums   =   scanner.nextInt()   ;


      // Iterate through each data set.
      for   (int   i   =   0   ;   i   <   dataSetNums   ;   i++   )
      {
        // Read the first large integer for the current data set.
        BigInteger   firstNumber   =   scanner.nextBigInteger()   ;

        // Read the second large integer for the current data set.
        BigInteger   secondNumber   =   scanner.nextBigInteger()   ;


        // Perform addition using BigInteger to handle potentially very large numbers
        // without overflow issues that standard primitive types might encounter.
        String   result   =   firstNumber.add(secondNumber).toString()   ;

        // Print the sum. If the string representation of the sum exceeds 80 characters,
        // print "overflow" instead, as per problem requirements.
        System.out.println(result.length()   >   80   ?   "overflow"   :   result)   ;
      }

    }
    finally
    {
      // Ensure the scanner is closed to prevent resource leaks.
      // This block executes regardless of whether an exception occurred in the try block.
      if   (scanner   !=   null)
      {
        // Close the underlying input stream.
        scanner.close()   ;
      }
    }

  }

}