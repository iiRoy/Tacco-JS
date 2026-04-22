class ACGTHashList /* This class manages a hash list for ACGT sequences. */ {

  static get MAP() /* Retrieves the mapping for ACGT characters to numerical values. */
  {
    return {
      'A': 1, /* Adenine */
      'C': 2, /* Cytosine */
      'G': 3, /* Guanine */
      'T': 4, /* Thymine */
    };
  }

  constructor(M)
  {
    // Initialize the hash list with a given capacity M.
    this.M = M; // Store the capacity.

    this.H = []; // Initialize the hash array.

    /* Populate the hash array with empty strings. */
    for (let i = 0; i < M; i++)
    {
      this.H[i] = '';
    }
  }


  static _getKey(str) /* Computes a numerical key for a given DNA sequence string. */
  {
    let sum = 0; // Initialize sum for key calculation.
    let p   = 1; // Initialize power multiplier.

    // Iterate through the string to calculate the weighted sum.
    for (let i = 0, p = 1; i < str.length; i++, p *= 5)
    {
      sum += p * ACGTHashList.MAP[str[i]];
    }

    return sum; // Return the calculated key.
  }


  _h1(key) /* Primary hash function. */
  {
    return key % this.M;
  }


  _h2(key) /* Secondary hash function for double hashing. */
  {
    return 1 + key % (this.M - 1);
  }


  find(str) /* Searches for a string in the hash list. */
  {
    let key = ACGTHashList._getKey(str); // Get the numerical key for the string.

    let h; // Variable to store current hash index.

    // Compute initial hash values using primary and secondary hash functions.
    const h1 = this._h1(key),
          h2 = this._h2(key);

    /* Loop indefinitely to find the string or an empty slot. */
    for (let i = 0;; i++)
    {
      h = (h1 + i * h2) % this.M; // Calculate the probe position using double hashing.

      if (this.H[h] === str)
      {
        return 1; // String found.
      }
      else if (this.H[h] === '')
      {
        return 0; // Empty slot encountered, string not in list.
      }
      // If neither, continue to the next probe.
    }

    return 0; // Should not be reached in an infinite loop, but good practice.
  }


  insert(str) /* Inserts a string into the hash list. */
  {
    let key = ACGTHashList._getKey(str); // Obtain the key for the string.

    let h; // Index for the hash table.

    // Calculate initial hash indices.
    const h1 = this._h1(key),
          h2 = this._h2(key);

    /* Begin probing for an available slot or existing string. */
    for (let i = 0;; i++)
    {
      h = (h1 + i * h2) % this.M; // Determine the current probe position.

      if (this.H[h] === str)
      {
        return 1; // String already exists, no insertion needed.
      }
      else if (this.H[h] === '')
      {
        this.H[h] = str; // Found an empty slot, insert the string.
        return 0; // Indicate successful insertion.
      }
    }

    return 0; // Fallback return, theoretically unreachable.
  }

}


(function main() // Main execution block.
{
  // Read all lines from standard input.
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Trim whitespace, split into lines, and remove the first line (likely count).
  var Arr = (lines.trim()).split("\n").slice(1);

  // Parse each line into a command array (e.g., ['insert', 'ACGT']).
  const commands = Arr.map(l => l.split(' '));


  // Initialize the hash list with a large prime capacity.
  let hl = new ACGTHashList(1046527);


  // Process each command.
  commands.forEach(cmd => {
    // Check if the command is 'insert' (starts with 'i').
    if (cmd[0][0] === 'i')
    {
      hl.insert(cmd[1]); // Perform insertion.
    }
    else // Otherwise, it's a 'find' command.
    {
      // Log 'yes' if found, 'no' otherwise.
      console.log(hl.find(cmd[1]) ? 'yes' : 'no');
    }
  });

})(); // Execute the main function immediately.