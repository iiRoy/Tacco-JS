/*
 * This section contains utility functions for input/output processing.
 * It's generally boilerplate code for competitive programming environments.
 */
var  read  =  require('readline').createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);


var  obj;
var  inLine  =  []; /* This array stores each line of input received. */

read.on('line',  function (  input  )  {
  inLine.push(  input  );
});


read.on(
  'close',
  function (  )  {
    obj  =  init(  inLine  );
    console.error(  '\n↑入力 ↓出力'  ); /* Debug message indicating input/output flow. */
    Main(  );
  }
);


/**
 * Creates a deep clone of an object. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone(  obj  )  {
  return  (  obj  instanceof  Set  )  ?
    new  Set(  Array.from(  obj  )  )  :
    JSON.parse(  JSON.stringify(  obj  )  );
}


/* Input parsing utility functions. */
function  nextInt(  )  {
  return  myconv(  next(),  1  );
}

function  nextStrArray(  )  {
  return  myconv(  next(),  2  );
}

function  nextIntArray(  )  {
  return  myconv(  next(),  4  );
}

function  nextCharArray(  )  {
  return  myconv(  next(),  6  );
}


function  next(  )  {
  return  obj.next(  );
}

function  hasNext(  )  {
  return  obj.hasNext(  );
}


/**
 * Initializes the input reader object.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with methods to access input lines.
 */
function  init(  input  )  {  
  return  {
    list  :  input,
    index  :  0,
    max  :  input.length,

    hasNext  :  function(  )  {
      return  (  this.index  <  this.max  );
    },

    next  :  function(  )  {
      if  (  this.hasNext(  )  )  {
        return  this.list[  this.index++  ];
      }  else  {
        throw  'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}


/**
 * Outputs a string to the console, followed by a newline.
 * @param {string} s - The string to output.
 */
function  myout(  s  )  {
  console.log(  s  );
}

/**
 * Outputs a debug message to the error console.
 * @param {any} s - The data to inspect and output.
 */
function  myerr(  s  )  {
  console.error(  'debug:'  +  require('util').inspect(  s,  false,  null  )  );
}

/*
 * Parameter "no" for myconv determines the conversion type:
 * - Default / Unknown / Outlier: Returns the input 'i' as is.
 * - 1: Parses 'i' as an integer.
 * - 2: Splits 'i' by spaces into a string array.
 * - 4: Splits 'i' by spaces and converts each part to a number.
 * - 6: Splits 'i' into a character array.
 * - 7: Splits 'i' into a character array and converts each char to a number.
 * - 8: Joins array 'i' elements with a space.
 * - 9: Joins array 'i' elements with a newline.
 * - 0: Joins array 'i' elements without any separator.
 */
function  myconv(  i,  no  )  {
  try  {
    switch  (  no  )  {
      case  1:
        return  parseInt(  i  );
      case  2:
        return  i.split(  ' '  );
      case  4:
        return  i.split(  ' '  ).map(  Number  );
      case  6:
        return  i.split(  ''  );
      case  7:
        return  i.split(  ''  ).map(  Number  );
      case  8:
        return  i.join(  ' '  );
      case  9:
        return  i.join(  '\n'  );
      case  0:
        return  i.join(  ''  );
      default:
        return  i;
    }
  }  catch  (  e  )  {
    return  i; /* Fallback in case of conversion error. */
  }
}

/*
 * End of utility functions.
 * Main program logic starts below.
 */
function  Main(  )  {
  var  one  =  nextIntArray(  ); /* Reads the first line of input as an array of integers. */
  var  N  =  one[0]; /* N represents the number of intervals. */
  var  C  =  one[1]; /* C is likely a constant, but its usage is not evident in the snippet. */

  /* Initialize a difference array or frequency array of a certain size. */
  var  list  =  new  Array(  100005  ).fill(  0  );

  /* Process N intervals. */
  for  (  var  i  =  0;  i  <  N;  i++  )  {
    var  tmp  =  nextIntArray(  ); /* Read each interval's start and end points. */
    list[  tmp[0]  ]++; /* Increment at the start point. */
    list[  tmp[1]  +  1  ]--; /* Decrement at the point after the end. */
  }

  var  output  =  1; /* Initialize output with a base value. */

  /* Compute prefix sums to find the maximum overlapping intervals. */
  for  (  var  i  =  1;  i  <  100005;  i++  )  {
    list[  i  ]  +=  list[  i  -  1  ]; /* Accumulate sums. */
    output  =  Math.max(  output,  list[  i  ]  ); /* Update maximum overlap. */
  }

  myout(  output  ); /* Print the final result. */
}