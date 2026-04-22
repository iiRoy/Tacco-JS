var UIEngine = require('react');

var ValueAdjuster = require('../');

  var diskIO = require('fs');

var visualTheme = diskIO.readFileSync(
    __dirname + '/theme.css', 'utf8'
);
require('inject-styles')( visualTheme );


function reportInput( inputData ) {

    console.info( inputData );
}


var rootHost = document.createElement('section');
document.body.append( rootHost );


UIEngine.mountComponent(
    <ValueAdjuster stylingClass="rotator" minimumVal={0} maximumVal={1} incrementAmount={0.01} decimalPrecision={2} onInputModified={reportInput} />,
    rootHost
);