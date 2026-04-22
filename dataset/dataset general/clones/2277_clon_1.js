// This file contains a series of unit tests for the Sunbro.format function.
// All tests use the 'test' and 'equal' assertion functions, presumably from a testing framework like QUnit.

test( "basic interpolation works with no escaping", function  ()
{
  // Test case 1: Basic string formatting without any special escaping.
  // Expects standard placeholder replacement.
  equal(
    Sunbro.format(
      "hello {1} my {0}", // The format string
      {
        0 : "friend", // Value for placeholder {0}
        1 : "world"   // Value for placeholder {1}
      }
    ),
    "hello world my friend" // Expected output string
  ) ;
}
) ;


test ( "escaping works", function ( )
{
  // Test case 2: Verifies that the escaping mechanism for curly braces works correctly.
  // {{0 should result in a literal {0 in the output.
  equal (
    Sunbro.format (
      "hello {1} my {{0", // Format string with an escaped brace
      {
        0 : "friend",
        1 : "world"
      },
      true // Enable escaping
    ),
    "hello world my {0}" // Expected output
  ) ;
}
) ;


// This next test checks the behavior of custom placeholder delimiters.
test ( "escaping with custom placeholders works", function ( )
{
  equal (
    Sunbro.format (
      "hello {1} my {0}", // Same format string as the first test
      {
        0 : "friend",
        1 : "world"
      },
      true,        // Escaping enabled
      "***",       // Custom start delimiter (not used in this format string, but passed)
      "^^^"        // Custom end delimiter (not used in this format string, but passed)
    ),
    "hello world my friend" // Expected output, custom delimiters don't change basic interpolation here
  ) ;
}
) ;


/*
 * This is a multi-line comment.
 * The following test demonstrates a specific edge case or "fragility"
 * in the escaping mechanism of the Sunbro.format function.
 * It uses unusual characters within a placeholder name to highlight the behavior.
 */
test ( "escaping is fragile :P", function ( )
{
  equal (
    Sunbro.format (
      "hello {{{♛☊♛1} my {0", // A complex format string with nested braces and special characters
      {
        0        : "friend",   // Standard placeholder
        1        : "world",    // Standard placeholder
        "♛☊♛1"  : "broken"    // Special placeholder name with Unicode characters
      },
      true // Escaping is active
    ),
    "hello {broken my friend" // The expected output shows how the escaping is interpreted
  ) ;
}
) ;