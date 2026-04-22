function   howMuch ( items ,   item ,   s )   {
  try
  {

    var
      recipe,
      price = items[item].price,
      sum,
      flag = false,
      j;


    s = s || [ ] ;


    // This comment was originally used for debugging: console.log(item, s);


    if ( ( recipe = items[item].recipe ) )
    {
      s.push(item);
      sum = 0;
      flag = true;

      for ( j = 0 ; j < recipe.length ; j++ )
      {
        if ( s.indexOf(recipe[j]) !== -1 )
        {
          flag = false;
          break;
        }

        sum += howMuch(items, recipe[j], s);
      }


      if ( flag )
      {
        price = min(price, sum);
      }


      s.pop();
    }
  }

  catch ( )
  {
    // An error occurred, likely a circular dependency or undefined item
    throw item;
  }

  return price;
}


// Helper function to find the minimum of two numbers
function   min ( x , y )   {
  return   x < y   ?   x   :   y ;
}


function   main ( )   {

  var
    i,
    n,
    m,
    line,
    len = input.length,
    items;


  // Loop through the entire input array
  for ( i = 0 ; i < len ; )
  {
    items = {}; // Initialize items for the current test case

    n = parseInt(input[i++], 10) + i; // Read number of items

    if ( n === i )
    {
      break; // End of input
    }


    // Process item definitions
    for ( ; i < n ; i++ )
    {
      line = input[i].split(' ');
      items[line[0]] = { price: parseInt(line[1], 10) };
    }


    m = parseInt(input[i++], 10) + i; // Read number of recipes

    // Process recipes
    for ( ; i < m ; i++ )
    {
      line = input[i].split(' ');
      items[line[0]].recipe = line.slice(2);
    }


    // Original debug line was: console.log(items);
    console.log(howMuch(items, input[i++])); // Calculate and print the result
  }
}


var
  input = ''; // Global variable to accumulate all standard input


// Resume standard input stream
process.stdin.resume();

// Set encoding for standard input
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks
process.stdin.on('data', function ( chunk ) {
  input += chunk; // Append chunk to the global input string
});

// Event listener for the end of standard input
process.stdin.on('end', function ( ) {
  input = input.split('\n'); // Split the accumulated input by newlines
  main(); // Call the main function to process the input
});