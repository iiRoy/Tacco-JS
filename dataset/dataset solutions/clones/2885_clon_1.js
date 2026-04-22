/* This file contains a Type I clone of the original C# code.
 * All identifiers, operators, and expressions are kept identical.
 * Significant changes have been made to whitespace and comments
 * to create a visually distinct but logically equivalent version.
 */

using System; // Required for basic system functionalities like Console.
using System.Collections.Generic; // For generic collections such as List<T>.
using System.IO; // For file and stream operations, e.g., StreamReader.
using System.Text; // For string manipulation, specifically StringBuilder.

/* Main program class for the Chokudai Speed Run 002 problem. */
class ChokudaiSpeedRun002
{
    // Static counter variable, potentially for test case management.
    static int __cnt = 0;

    // Conditional compilation for local environment settings.
#if LOCAL_ENVIRONMENT
    // Marker string used to identify test data sections in local files.
    static string __mark = "@@@";
#endif

    /*
     * The entry point of the application.
     * Handles program execution flow and problem solving.
     */
    static void Main(string[] args)
    {
        // --- Start of LOCAL_ENVIRONMENT specific setup ---
#if LOCAL_ENVIRONMENT
        // Initialize a StreamReader to read from a local input file named "stdin.txt".
        StreamReader __sr = new StreamReader("stdin.txt");

        // Read the entire content of the file into a string.
        string __str = __sr.ReadToEnd();

        // Close the StreamReader after reading.
        __sr.Close();

        // Find the first occurrence of the marker string.
        int __index = __str.IndexOf(__mark, 0);

        // Loop to count occurrences of the marker string, indicating test cases.
        while (__index != -1)
        {
            __index = __str.IndexOf(__mark, __index + __mark.Length); // Find next marker.
            __cnt++; // Increment test case counter.
        }

        // If multiple test cases are found, prompt user for selection.
        if (__cnt > 0)
        {
            Console.Write("Eenter test data no(1-{0})? ", __cnt); // Prompt message.
            Console.Out.Flush(); // Ensure output is displayed immediately.

            // Attempt to parse user input; default to 1 if parsing fails.
            if (!int.TryParse(Console.ReadLine(), out __cnt))
            {
                __cnt = 1; // Default to first test case.
            }

            // Inform user about the selected or default test data.
            Console.WriteLine("Select/Default test data: {0}", __cnt);
        }

        // Redirect standard input to the "stdin.txt" file for testing.
        var stdin = new System.IO.StreamReader("stdin.txt");
        Console.SetIn(stdin);
#endif
        // --- End of LOCAL_ENVIRONMENT specific setup ---

        // Create an instance of SimpleScanner to parse input.
        SimpleScanner sc = new SimpleScanner(__cnt);

        // Read an integer N from the input.
        int N = sc.NextInt();

        // Calculate and print the result: (N-2) * 180.
        // This formula is typically for the sum of interior angles of a polygon with N sides.
        Console.WriteLine( ( N - 2 ) * 180 );

    } // End of Main method.

    /*
     * Performs a binary search to find the lower bound of a value in a sorted array.
     * Returns the index of the first element not less than the specified value.
     *
     * @param array The array to search within.
     * @param start The starting index of the search range.
     * @param end The ending index (exclusive) of the search range.
     * @param value The value to search for.
     * @param comparer The comparer to use for element comparison.
     * @return The index of the lower bound.
     */
    public static int LowerBound<T>(T[] array, int start, int end, T value, IComparer<T> comparer)
    {
        int low = start, high = end, mid; // Initialize low, high, and mid variables.

        // Binary search loop.
        while (low < high)
        {
            mid = ( ( high - low ) >> 1 ) + low; // Calculate middle index efficiently.

            // If the element at mid is less than the value, search in the right half.
            if (comparer.Compare(array[mid], value) < 0)
            {
                low = mid + 1;
            }
            // Otherwise, search in the left half (including mid).
            else
            {
                high = mid;
            }
        }

        // Debugging output for local environment.
#if LOCAL_ENVIRONMENT
        Console.Error.WriteLine($"LowerBound(array:{array.ToStringA()}"); // Array content.
        Console.Error.WriteLine($"LowerBound(start:{start}, end:{end}, value:{value.ToString()}) return:{low}"); // Parameters and result.
#endif

        return low; // Return the calculated lower bound index.
    }

    /*
     * Overload for LowerBound that uses the default comparer and searches the entire array.
     *
     * @param array The array to search.
     * @param value The value to find the lower bound for.
     * @return The index of the lower bound.
     */
    public static int LowerBound<T>(T[] array, T value) where T : IComparable
    {
        // Call the main LowerBound method with default parameters.
        return LowerBound(array, 0, array.Length, value, Comparer<T>.Default);
    }


    /*
     * Implements a Binary Indexed Tree (BIT), also known as Fenwick tree.
     * Used for efficient prefix sum queries and point updates.
     */
    public class BIT
    {
        private int n; // Size of the BIT (1-indexed).
        private int[] data; // Array to store BIT data.

        /*
         * Constructor for the BIT.
         *
         * @param size The maximum index for which sums will be queried (0-indexed).
         */
        public BIT(int size)
        {
            n = size + 1; // BIT array size is 1-indexed, so add 1.
            data = new int[n]; // Initialize data array.
        }

        /*
         * Adds a value to the element at index i (1-indexed).
         *
         * @param i The index to update.
         * @param x The value to add.
         */
        public void add(int i, int x)
        {
            while (i < n)
            {
                data[i] += x; // Add x to current node.
                i += i & -i; // Move to the next parent node.
            }
        }

        /*
         * Calculates the prefix sum up to index i (1-indexed).
         *
         * @param i The upper bound index for the sum.
         * @return The sum of elements from index 1 to i.
         */
        public int sum(int i)
        {
            int ret = 0; // Accumulator for the sum.
            while (i > 0)
            {
                ret += data[i]; // Add current node's value.
                i -= i & -i; // Move to the next parent node.
            }
            return ret; // Return the total sum.
        }
    } // End of BIT class.


    /*
     * Represents an item with two long integer values.
     * Implements IEquatable and IComparable for custom comparison and equality checks.
     */
    public class Item : IEquatable<Item>, IComparable<Item>
    {
        public long value1 { get; set; } // First long integer value.
        public long value2 { get; set; } // Second long integer value.

        /*
         * Constructor for Item.
         *
         * @param value1 The initial value for value1.
         * @param value2 The initial value for value2.
         */
        public Item(long value1, long value2)
        {
            this.value1 = value1; // Assign value1.
            this.value2 = value2; // Assign value2.
        }

        /*
         * Overrides the ToString() method to provide a custom string representation.
         *
         * @return A formatted string showing value1 and value2.
         */
        public override string ToString()
        {
            return $"[value1:{this.value1}, value2:{this.value2}]";
        }

        /*
         * Implements the Equals method from IEquatable<Item>.
         * Checks if the current Item is equal to another Item.
         *
         * @param other The other Item to compare with.
         * @return True if items are equal, false otherwise.
         */
        public bool Equals(Item other)
        {
            if (other == null) // Null check.
                return false;

            // Equality is based on both value1 and value2 being equal.
            return this.value1 == other.value1 && this.value2 == other.value2;
        }

        /*
         * Overrides the base Object.Equals method.
         * Handles type checking before calling the type-specific Equals.
         *
         * @param obj The object to compare with.
         * @return True if objects are equal, false otherwise.
         */
        public override bool Equals(Object obj)
        {
            if (obj == null) return false; // Null check.

            Item item = obj as Item; // Attempt to cast to Item.

            if (item == null)
            {
                return false; // If cast fails, not an Item.
            }
            else
            {
                return Equals(item); // Call type-specific Equals.
            }
        }

        /*
         * Overrides the GetHashCode() method.
         * Provides a hash code consistent with Equals.
         *
         * @return The hash code for the Item.
         */
        public override int GetHashCode()
        {
            long hc = this.value1 * this.value2; // Simple hash calculation.
            return hc.GetHashCode(); // Return hash code of the combined value.
        }

        /*
         * Implements the CompareTo method from IComparable<Item>.
         * Compares the current Item with another Item.
         *
         * @param other The other Item to compare with.
         * @return A value indicating the relative order of the items.
         */
        public int CompareTo(Item other)
        {
            if (other == null)
            {
                return -1; // Null is considered "less" than any instance.
            }

            // Primary comparison by value1.
            if (this.value1 == other.value1)
            {
                // If value1s are equal, compare by value2.
                return this.value2.CompareTo(other.value2);
            }
            else
            {
                // Otherwise, compare by value1.
                return this.value1.CompareTo(other.value1);
            }
        }

        /*
         * Provides a custom comparison logic for two Item objects.
         * This method is usually part of IComparer<T>, but included here as a member.
         *
         * @param x The first Item to compare.
         * @param y The second Item to compare.
         * @return A value indicating the relative order of x and y.
         */
        public int Compare(Item x, Item y)
        {
            if (x == null)
            {
                return 1; // A null x is "greater" than any non-null y for sorting purposes.
            }
            else
            {
                return x.CompareTo(y); // Use x's CompareTo method.
            }
        }
    } // End of Item class.


    /*
     * A utility class for simplifying input reading operations.
     * Reads all input at once and provides methods to parse various data types.
     */
    public class SimpleScanner
    {
        private int cnt; // Internal counter for current item index.
        private string[] items; // Array of all input items (split by spaces).

        /*
         * Constructor for SimpleScanner.
         * Reads all lines from Console.In and splits them into items.
         *
         * @param cnt Initial count, used for local environment test selection.
         */
        public SimpleScanner(int cnt = 0)
        {
            this.cnt = 0; // Initialize item counter.
            var sb = new StringBuilder(); // Use StringBuilder for efficient string concatenation.
            var s = Console.ReadLine(); // Read the first line.

            // Read all lines until end of stream (null).
            while (s != null)
            {
                sb.Append(s + " "); // Append line and a space.
                s = Console.ReadLine(); // Read next line.
            }

            // Split the accumulated string by spaces into an array of items.
            this.items = sb.ToString().Split(' ');

            // --- Start of LOCAL_ENVIRONMENT specific logic for scanner ---
#if LOCAL_ENVIRONMENT
            if (cnt > 0)
            {
                // Find the index of the specific test case marker.
                int index = Array.IndexOf(this.items, __mark + cnt.ToString());
                this.cnt = index + 1; // Set scanner's internal counter to start after the marker.
            }
            Console.Error.WriteLine("SimpleScanner.cnt: {0}", this.cnt); // Debug output for counter.
            Console.Error.WriteLine("SimpleScanner.items: {0}", this.items.ToStringA()); // Debug output for all items.
#endif
            // --- End of LOCAL_ENVIRONMENT specific logic ---
        }

        /*
         * Sets the internal counter of the scanner.
         *
         * @param n The new value for the counter.
         */
        public void SetCnt(int n) { this.cnt = n; }

        /*
         * Reads and parses the next item as an integer.
         *
         * @return The parsed integer.
         */
        public int NextInt()
        {
            return int.Parse(this.items[this.cnt++]);
        }

        /*
         * Reads and parses the next item as a long integer.
         *
         * @return The parsed long integer.
         */
        public long NextLong()
        {
            return long.Parse(this.items[this.cnt++]);
        }

        /*
         * Reads the next item as a string.
         *
         * @return The next string item.
         */
        public string NextString()
        {
            return this.items[this.cnt++];
        }

        /*
         * Reads an array of n integers.
         *
         * @param n The number of integers to read.
         * @return An array containing the parsed integers.
         * @throws IndexOutOfRangeException if n is less than 1.
         */
        public int[] NextIntArray(int n)
        {
            if (n < 1)
            {
                throw new IndexOutOfRangeException("引数は1以上であること！"); // Argument must be 1 or greater.
            }

            var result = new int[n]; // Initialize result array.
            for (var i = 0; i < n; i++)
            {
                result[i] = this.NextInt(); // Populate array with next integers.
            }

            // Debug output for local environment.
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("{0}", result.ToStringA());
#endif
            return result;
        }

        /*
         * Reads an array of n long integers.
         *
         * @param n The number of long integers to read.
         * @return An array containing the parsed long integers.
         * @throws IndexOutOfRangeException if n is less than 1.
         */
        public long[] NextLongArray(int n)
        {
            if (n < 1)
            {
                throw new IndexOutOfRangeException("引数は1以上であること！"); // Argument must be 1 or greater.
            }

            var result = new long[n]; // Initialize result array.
            for (var i = 0; i < n; i++)
            {
                result[i] = this.NextLong(); // Populate array with next long integers.
            }

            // Debug output for local environment.
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("{0}", result.ToStringA());
#endif
            return result;
        }

        /*
         * Reads an array of n strings.
         *
         * @param n The number of strings to read.
         * @return An array containing the parsed strings.
         * @throws IndexOutOfRangeException if n is less than 1.
         */
        public string[] NextStringArray(int n)
        {
            if (n < 1)
            {
                throw new IndexOutOfRangeException("引数は1以上であること！"); // Argument must be 1 or greater.
            }

            var result = new string[n]; // Initialize result array.
            for (var i = 0; i < n; i++)
            {
                result[i] = this.NextString(); // Populate array with next strings.
            }

            // Debug output for local environment.
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("{0}", result.ToStringA());
#endif
            return result;
        }

        /*
         * Reads n pairs of integers, storing them into two separate arrays (columns).
         *
         * @param n The number of pairs to read.
         * @return A jagged array where result[0] is the first column and result[1] is the second column.
         * @throws IndexOutOfRangeException if n is less than 1.
         */
        public int[][] NextInt2Col(int n)
        {
            const int M = 2; // Number of columns.
            if (n < 1)
            {
                throw new IndexOutOfRangeException("引数は1以上であること！"); // Argument must be 1 or greater.
            }

            int[][] result = new int[M][]
            {
                new int[n], // First column array.
                new int[n], // Second column array.
            };

            // Read n pairs of integers.
            for (var i = 0; i < n; i++)
            {
                result[0][i] = this.NextInt(); // Read first integer of the pair.
                result[1][i] = this.NextInt(); // Read second integer of the pair.
            }

            // Debug output for local environment.
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("NextInt2Col: ["); // Start of debug array output.
            for (var i = 0; i < M; i++)
            {
                Console.Error.WriteLine("  {0},", result[i].ToStringA()); // Output each column.
            }
            Console.Error.WriteLine("]"); // End of debug array output.
#endif
            return result;
        }
    } // End of SimpleScanner class.

} // End of ChokudaiSpeedRun002 class.


/*
 * Static class providing extension methods for common data types.
 */
static class Extensions
{
    /*
     * Extension method to convert an array to a string representation.
     *
     * @param array The array to convert.
     * @param separator The string to use between elements (default: ", ").
     * @param braces The string containing opening and closing braces (default: "[]").
     * @return A string representation of the array.
     */
    public static string ToStringA<T>(this T[] array, string separator = ", ", string braces = "[]")
    {
        string bL = braces.Length > 0 ? braces[0].ToString() : ""; // Extract opening brace.
        string bR = braces.Length > 1 ? braces[1].ToString() : ""; // Extract closing brace.

        // Join array elements with the separator and enclose in braces.
        return bL + String.Join(separator, array) + bR;
    }
}