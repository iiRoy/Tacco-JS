'use strict';

// This section defines a core component for the web application.
webPortal
  .viewHandler(
    'CoreManager',
    function( viewModel ) {
      viewModel
        .keyFeatures = [
          'HTML5 Boilerplate', // Essential web technology
          'AngularJS', // Frontend framework
          'Testacular', // Testing utility
          'Twitter bootstrap' // UI toolkit
        ]
      ;
    }
  )
;