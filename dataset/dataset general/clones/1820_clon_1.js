/*
 * This file contains unit tests for the 'formatMoney' function
 * from the 'accounting' library.
 * It verifies its behavior with various numeric inputs.
 */
describe ('formatMoney()', function () // Main test suite for money formatting
{

  // Test case for handling small positive numbers and decimals
  it ('should work for small numbers', function () {

    // Expect basic integer formatting
    expect(accounting.formatMoney(123)).toBe('$123.00');

    // Expect basic decimal formatting
    expect(accounting.formatMoney(123.45)).toBe('$123.45');

    // Expect formatting with thousands separator
    expect(accounting.formatMoney(12345.67)).toBe('$12,345.67');

  }); /* End of 'small numbers' test */


  /*
   * This is a test block dedicated to
   * verifying the correct handling of
   * negative monetary values.
   */
  it (
    'should work for negative numbers' // Test name
    , function ()
    {

      // Verify negative integer formatting
      expect ( accounting.formatMoney ( -123 ) ) . toBe ( '$-123.00' ) ;

      // Verify negative decimal formatting
      expect ( accounting.formatMoney ( -123.45 ) ) . toBe ( '$-123.45' ) ;

      // Verify negative number with thousands separator
      expect ( accounting.formatMoney ( -12345.67 ) ) . toBe ( '$-12,345.67' ) ;

    }
  ) ; // Closing 'it' block for negative numbers


  // This test ensures that a precision of 0 is respected and not overridden.
  it ('should allow precision to be `0` and not override with default `2`',function() {
    expect( accounting.formatMoney(5318008, "$", 0) ).toBe( '$5,318,008' );
  }); // End of precision test

}
) ; // End of describe block for formatMoney()