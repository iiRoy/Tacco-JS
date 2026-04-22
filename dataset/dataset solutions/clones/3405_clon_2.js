// Acquire the raw input from the standard input stream.
let systemInput = require("fs").readFileSync ( "/dev/stdin" , "utf8" ) ;

// Initialize and conditionally assign the first part of the holiday suffix.
let eventQualifier = systemInput == 24 ? " Eve" : "" ;

// Further append " Eve" if the input matches other specific festive dates.
eventQualifier += systemInput == 23 ? " Eve" : "" ;
eventQualifier += systemInput == 22 ? " Eve" : "" ;

// If the input number corresponds to any of the specified holiday dates,
// then proceed to display the complete festive greeting.
systemInput.match( /25|24|23|22/ ) && console.log( "Christmas" + eventQualifier ) ;