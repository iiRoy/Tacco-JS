using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
class ProblemSolutionEntry
{
    static int _testCaseNumber = 0; // Tracks the current test case count.
#if LOCAL_ENVIRONMENT
    static string _dataMarker = "###"; // Special string to identify test case boundaries.
#endif
    static void ExecuteProgram(string[] commandLineArguments)
    {
#if LOCAL_ENVIRONMENT
        // Redirect standard input for local testing.
        System.IO.StreamReader inputFileReader = new System.IO.StreamReader("inputdata.txt");
        string entireInputContent = inputFileReader.ReadToEnd();
        inputFileReader.Close();
        int markerPosition = entireInputContent.IndexOf(_dataMarker, 0);
        while (markerPosition != -1)
        {
            markerPosition = entireInputContent.IndexOf(_dataMarker, markerPosition + _dataMarker.Length);
            _testCaseNumber++; // Increment count for each marker found.
        }
        if (_testCaseNumber > 0)
        {
            System.Console.Write("Enter test data number (1-{0})? ", _testCaseNumber);
            System.Console.Out.Flush();
            // Attempt to parse user input, default to 1 if invalid.
            if (!int.TryParse(System.Console.ReadLine(), out _testCaseNumber)) _testCaseNumber = 1;
            System.Console.WriteLine("Selected test set: {0}", _testCaseNumber);
        }
        var standardInputRedirector = new System.IO.StreamReader("inputdata.txt");
        System.Console.SetIn(standardInputRedirector); // Set the console's input stream.
#endif
        InputReaderUtility dataParser = new InputReaderUtility(_testCaseNumber);
        int polygonSidesCount = dataParser.ReadNextInteger(); // Read the number of sides for the polygon.
        // Calculate the sum of interior angles for a polygon with 'n' sides.
        System.Console.WriteLine((polygonSidesCount - 2) * 180);
    } // End of main execution method.

    public static int RetrieveMinimumIndex<TElement>(TElement[] targetCollection, int startIndex, int endIndex, TElement searchCriterion, IComparer<TElement> comparisonLogic)
    {
        int lowerPtr = startIndex, upperPtr = endIndex, middlePtr;
        // Perform a binary search to find the lower bound.
        while (lowerPtr < upperPtr)
        {
            middlePtr = ((upperPtr - lowerPtr) >> 1) + lowerPtr;
            if (comparisonLogic.Compare(targetCollection[middlePtr], searchCriterion) < 0)
                lowerPtr = middlePtr + 1;
            else
                upperPtr = middlePtr;
        }
#if LOCAL_ENVIRONMENT
        System.Console.Error.WriteLine($"Lower bound search (collection:{targetCollection.FormatArrayAsString()}");
        System.Console.Error.WriteLine($"Lower bound search (start:{startIndex}, end:{endIndex}, value:{searchCriterion.ToString()}) result:{lowerPtr}");
#endif
        return lowerPtr; // Return the first index where the value could be inserted.
    }
    public static int RetrieveMinimumIndex<TElement>(TElement[] targetCollection, TElement searchCriterion) where TElement : IComparable
    {
        // Overload for lower bound using default comparer and full array.
        return RetrieveMinimumIndex(targetCollection, 0, targetCollection.Length, searchCriterion, Comparer<TElement>.Default);
    }

    public class BinaryIndexedDataStructure
    {
        int totalElements; // Size of the Fenwick tree.
        int[] internalStorage; // Array holding the BIT data.
        public BinaryIndexedDataStructure(int capacity)
        {
            totalElements = capacity + 1;
            internalStorage = new int[totalElements];
        }
        public void updateValue(int elementIndex, int deltaValue)
        {
            // Add a value to the element at the given index and update ancestors.
            while (elementIndex < totalElements)
            {
                internalStorage[elementIndex] += deltaValue;
                elementIndex += elementIndex & -elementIndex; // Move to the next relevant parent.
            }
        }
        public int queryPrefixSum(int upToIndex)
        {
            int accumulatedSum = 0; // Accumulator for the sum.
            // Query the prefix sum up to the given index.
            while (upToIndex > 0)
            {
                accumulatedSum += internalStorage[upToIndex];
                upToIndex -= upToIndex & -upToIndex; // Move to the next relevant parent.
            }
            return accumulatedSum;
        }
    }

    public class ComparableElement : IEquatable<ComparableElement>, IComparable<ComparableElement>
    {
        public long firstComponent { get; set; } // First long value.
        public long secondComponent { get; set; } // Second long value.
        public ComparableElement(long compA, long compB)
        {
            this.firstComponent = compA;
            this.secondComponent = compB;
        }
        public override string ToString()
        {
            // Custom string representation for debugging.
            return $"[firstComponent:{this.firstComponent}, secondComponent:{this.secondComponent}]";
        }
        public bool AreEquivalent(ComparableElement otherObject)
        {
            if (otherObject == null) return false;
            // Check for equality based on both components.
            return this.firstComponent == otherObject.firstComponent && this.secondComponent == otherObject.secondComponent;
        }
        public override bool Equals(Object genericObject)
        {
            if (genericObject == null) return false;
            ComparableElement typedObject = genericObject as ComparableElement;
            if (typedObject == null) return false; // Not a ComparableElement.
            else return AreEquivalent(typedObject);
        }
        public override int GetHashCode()
        {
            long hashValue = this.firstComponent * this.secondComponent; // Simple hash combination.
            return hashValue.GetHashCode();
        }
        public int CompareWith(ComparableElement otherObject)
        {
            if (otherObject == null) return -1; // Null is considered smaller.
            if (this.firstComponent == otherObject.firstComponent)
                return this.secondComponent.CompareTo(otherObject.secondComponent); // Compare second if first is equal.
            else
                return this.firstComponent.CompareTo(otherObject.firstComponent); // Compare first component.
        }
        public int PerformComparison(ComparableElement firstItem, ComparableElement secondItem)
        {
            if (firstItem == null) return 1; // Null first item is greater.
            else return firstItem.CompareWith(secondItem); // Delegate to CompareWith.

        }
    }

    public class InputReaderUtility
    {
        private int currentPosition; // Current index in the tokenized input array.
        private string[] tokenizedInputs; // Array of input tokens.
        public InputReaderUtility(int initialOffset = 0)
        {
            this.currentPosition = 0;
            var stringBuilderCache = new StringBuilder();
            var currentLine = System.Console.ReadLine();
            // Read all lines from standard input until EOF.
            while (currentLine != null)
            {
                stringBuilderCache.Append(currentLine + " ");
                currentLine = System.Console.ReadLine();
            }
            this.tokenizedInputs = stringBuilderCache.ToString().Split(' '); // Split into tokens.
#if LOCAL_ENVIRONMENT
            if (initialOffset > 0)
            {
                // Find the starting position for the selected test case.
                int dataSetIndex = System.Array.IndexOf(this.tokenizedInputs, _dataMarker + initialOffset.ToString());
                this.currentPosition = dataSetIndex + 1;
            }
            System.Console.Error.WriteLine("DataStreamProcessor.currentPosition: {0}", this.currentPosition);
            System.Console.Error.WriteLine("DataStreamProcessor.tokenizedInputs: {0}", this.tokenizedInputs.FormatArrayAsString());
#endif
        }
        public void SetReadPosition(int newPosition) { this.currentPosition = newPosition; } // Manually set the read index.
        public int ReadNextInteger()
        {
            // Parse and return the next integer token.
            return int.Parse(this.tokenizedInputs[this.currentPosition++]);
        }
        public long ReadNextLong()
        {
            // Parse and return the next long integer token.
            return long.Parse(this.tokenizedInputs[this.currentPosition++]);
        }
        public string ReadNextString()
        {
            // Return the next string token.
            return this.tokenizedInputs[this.currentPosition++];
        }
        public int[] ReadIntegerArray(int numElements)
        {
            if (numElements < 1) throw new IndexOutOfRangeException("Number of elements must be 1 or greater!");
            var resultCollection = new int[numElements];
            for (var index = 0; index < numElements; index++) resultCollection[index] = this.ReadNextInteger();
#if LOCAL_ENVIRONMENT
            System.Console.Error.WriteLine("{0}", resultCollection.FormatArrayAsString());
#endif
            return resultCollection;
        }
        public long[] ReadLongArray(int numElements)
        {
            if (numElements < 1) throw new IndexOutOfRangeException("Number of elements must be 1 or greater!");
            var resultCollection = new long[numElements];
            for (var index = 0; index < numElements; index++) resultCollection[index] = this.ReadNextLong();
#if LOCAL_ENVIRONMENT
            System.Console.Error.WriteLine("{0}", resultCollection.FormatArrayAsString());
#endif
            return resultCollection;
        }
        public string[] ReadStringArray(int numElements)
        {
            if (numElements < 1) throw new IndexOutOfRangeException("Number of elements must be 1 or greater!");
            var resultCollection = new string[numElements];
            for (var index = 0; index < numElements; index++) resultCollection[index] = this.ReadNextString();
#if LOCAL_ENVIRONMENT
            System.Console.Error.WriteLine("{0}", resultCollection.FormatArrayAsString());
#endif
            return resultCollection;
        }
        public int[][] ReadTwoColumnIntegers(int numRows)
        {
            const int columnCount = 2; // Fixed number of columns.
            if (numRows < 1) throw new IndexOutOfRangeException("Number of rows must be 1 or greater!");
            int[][] parsedMatrix = new int[columnCount][] {
                new int[numRows],
                new int[numRows],
            };
            // Read two integer values for each row.
            for (var rowIndex = 0; rowIndex < numRows; rowIndex++)
            {
                parsedMatrix[0][rowIndex] = this.ReadNextInteger();
                parsedMatrix[1][rowIndex] = this.ReadNextInteger();
            }
#if LOCAL_ENVIRONMENT
            System.Console.Error.WriteLine("ReadTwoColumnIntegers: [");
            for (var colIndex = 0; colIndex < columnCount; colIndex++)
                System.Console.Error.WriteLine("  {0},", parsedMatrix[colIndex].FormatArrayAsString());
            System.Console.Error.WriteLine("]");
#endif
            return parsedMatrix;
        }
    }

}
static class ArrayFormattingExtensions
{
    public static string FormatArrayAsString<TElement>(this TElement[] inputArray, string itemSeparator = ", ", string enclosingBrackets = "[]")
    {
        string leftBracketChar = enclosingBrackets.Length > 0 ? enclosingBrackets[0].ToString() : "";
        string rightBracketChar = enclosingBrackets.Length > 1 ? enclosingBrackets[1].ToString() : "";
        // Join array elements with a separator and enclose in brackets.
        return leftBracketChar + System.String.Join(itemSeparator, inputArray) + rightBracketChar;
    }
}