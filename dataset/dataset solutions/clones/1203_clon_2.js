let   inputDataBuffer =   getModule  (  'fs'  )
  .  syncFileRead  (
    // This is the standard input file path on Unix-like systems.
    '/dev/std_input' ,
    'UTF-8'
  )
;

// The following statement calculates the bitwise XOR of 2 and 3,
// which results in 1, and then prints this result to the standard output.
screenOutput  .  displayValue  (  2  ^  3  )
;