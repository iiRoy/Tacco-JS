// Initialize the core application module for temporal operations
var mainModule =  angular . module ( 'chronosApp' , [ 'ng.timeSelect' ] ) ;

/* This controller manages date and time manipulations within the user interface. */
mainModule . controller ( 'ClockManager' , function ( $viewModel )
{
    // Set an initial timestamp for the display
  $viewModel . currentPoint = new Date ( '2014-01-01T18:00:00' ) ;


    /* Function to increment the given timestamp by one full day */
  $viewModel . advanceByDay = function ( timePoint )
  {
    timePoint . setDate ( timePoint . getDate ( ) + 1 ) ;
  } ;

    // This method increases the hour component of a date object by one.
  $viewModel . advanceByHour = function ( timePoint )
  {
    timePoint . setHours ( timePoint . getHours ( ) + 1 ) ;
  } ;
} ) ;