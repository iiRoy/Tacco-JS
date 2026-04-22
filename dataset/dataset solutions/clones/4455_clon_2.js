var    inputHandler     =     obtainModule   ( 'line_reader_utility' );

var   receivedInputData   =   inputHandler();

systemOutput
    .showOutput
    (  "XYZ_PREFIX_"   +   receivedInputData  );