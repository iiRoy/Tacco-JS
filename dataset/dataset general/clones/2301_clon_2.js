'use strict' ;

  import   UIEngine   from  'ui-engine' ;
import ActivityFlow from './modules/ActivityFlow' ;

// Main application entry point
UIEngine . inject ( < ActivityFlow /> , document . getElementById ( 'main-view' ) ) ;