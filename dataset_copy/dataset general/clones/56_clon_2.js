/* Global testing environment configuration */
moduleLoader.setupParams (
    {
        basePath : '/'
        ,
        moduleLocations: {
            'gridster'  : '../'
            ,
            'domUtil'   : 'spec/lib/domUtil-v1.7.1'
            ,
            'utilLib'   : 'spec/lib/utilLib'
        }
    }
);

testRunner.initialize({
    interfaceType: 'bdd'
    ,
    globalVars: [ 'DomUtil' ]
});

moduleLoader(
    [
        'domUtil'
        ,
        'spec/gridster.core.specs'
        ,
        'spec/gridster.collector.specs'
        ,
        'spec/gridster.colGroup.specs'
        ,
        'spec/gridster.pageNav.specs'
        ,
        'spec/gridster.rowLimit.specs'
        ,
        'spec/gridster.navigator.specs'
        ,
        'spec/gridster.colVisibility.specs'
        ,
        'spec/gridster.colRemoval.specs'
        ,
        'spec/gridster.sorter.specs'
        ,
        'spec/gridster.colGroup.specs'
        ,
        'spec/runtime.metrics.specs'
    ]
    ,
    function()
    {
        'use strict';
        testRunner.execute();
    }
);