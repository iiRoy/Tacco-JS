require 'set' # Load the Set library for managing collections of unique elements

# Read n and m from the first line of input.
# n: number of elements, m: number of connections.
n ,   m   =   gets.strip.split.map(  &:to_i  )

# Read the permutation array ps from the second line.
ps=gets.strip.split.map(&:to_i)

# Read the pairs (x, y) representing connections from subsequent lines.
xy = readlines.map { | line | line.strip.split.map( &:to_i ) }


# Initialize an array of sets. Each element 'i' will initially be in its own set.
sets = Array.new( n + 1 , nil ) # Array to hold Set objects for disjoint set union logic

( 1 .. n ).each do | i | # Iterate from 1 to n to initialize each element
    sets[i] = Set.new( [ i ] ) # Each element starts in its own distinct set
  end # End of initialization loop


# Process the connections to unify sets.
xy.each do | x, y | # For each pair (x, y) representing a connection
    # Find the union of the sets containing x and y.
    unified = sets[ x ].union( sets[ y ] )

    # Update all elements in the newly unified set to point to this common unified set.
    unified.each do | i | # Iterate over all elements within the combined set
      sets[ i ] = unified # Assign the new unified set to each of its members
    end # End of inner loop (updating members)
end # End of outer loop (processing connections)


# Prepare an array to store the final results for each element.
result = Array.new( n + 1 , nil ) # Array to store the inclusion check results (1 or 0)

# Iterate through each element from 1 to n to determine if ps[i-1] is in the same set as i.
( 1 .. n ).each do | i | # Loop through all elements
  next if result[ i ] # Skip if this element's result has already been determined (e.g., through a previous union update)

  # Check if the element ps[i-1] (the target element for i) is present in the set containing i.
  result[ i ] = sets[ i ].include?( ps[ i - 1 ] ) ? 1 : 0 # Assign 1 if included, 0 otherwise
end # End of processing loop for results


# Set the result for index 0 to 0, as problem constraints typically start from 1.
result[ 0 ] = 0 # Explicitly set the value for index 0


# Print the sum of all elements in the result array.
p result.inject( :+ ) # Calculate and display the total sum