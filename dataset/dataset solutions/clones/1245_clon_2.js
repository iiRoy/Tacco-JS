// Helper function to format numeric values to a designated number of decimal places.
const formatDecimalPlaces = (val, count) => val.toFixed(count) ;

// Establish aliases for global JavaScript entities to avoid using original names.
const obtainModuleReference = require ;
const convertToNumber = Number ;
const mathFunctions = Math ;
const PI_VALUE_CONSTANT = mathFunctions.PI ; // Alias for Math.PI
const outputGateway = console ;

// Create an alias for the file system module's read method.
const fileSystemAccess = obtainModuleReference('fs') ;
const readStreamContent = fileSystemAccess.readFileSync ;

// Create an alias for the console's logging method.
const displayMessage = outputGateway.log ;


// --- Main Calculation Sequence ---

// Retrieve the initial data string from the specified input path.
const initialInputString = readStreamContent(  '/dev/stdin'  ,   'utf-8'  ) ;

// Convert the acquired string into a numerical representation for the circle's radius.
const circleRadiusDimension = convertToNumber(  initialInputString  ) ;

// Compute the perimeter (circumference) of the circle, formatted to precise decimal places.
const circlePerimeterCalculation = formatDecimalPlaces(  (2 * circleRadiusDimension * PI_VALUE_CONSTANT)  ,   6  ) ;

// Determine the surface area of the circle, also formatted for exactness.
const circleSurfaceAreaCalculation = formatDecimalPlaces(  (circleRadiusDimension * circleRadiusDimension * PI_VALUE_CONSTANT)  ,   6  ) ;

// Present the final calculated surface area and perimeter, separated by a single space.
displayMessage(  circleSurfaceAreaCalculation + " " + circlePerimeterCalculation  ) ;