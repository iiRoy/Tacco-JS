/* This comment indicates global variables. */
/*global gapi*/

(  function (  ) {


    var    app;      /* Variable to hold the Angular module. */

    // This comment declares the main ngAnalytics module for the application.
    app    = angular.module(  "ngAnalytics"  ,  [ ]  )  ;

    /* This service is designed to manage view selectors,
     * provide methods for getting and setting client IDs,
     * and offer general helper functionalities.
     */
    app.service  (  'ngAnalyticsService'  ,  [

        '$timeout'  ,

        function    (   $timeout   )   {

            var   clientId  ; /* Declares a variable to store the client ID. */


            this.ga    =    null    ;  // Initialize Google Analytics object to null.

            this.setClientId  =  function (  id  )  {
                clientId  =  id  ;
                return  id  ;
            }  ;


            this.getClientId  =  function   (   )   {
                return   clientId   ;
            }  ;


            this.authorize  =  function   (   container   )   {
                var   self  =  this  ; // Capture 'this' for use inside the timeout.


                $timeout  (  function (  )  {
                    self.ga.auth.authorize  (  {
                        container  :  container  ,
                        clientid  :  clientId  ,
                        userInfoLabel  :  self.authLabel
                    }  )  ;
                }  ,  0  )  ;
            }  ;

            this.viewSelectors  =  {  }  ; /* Object to store various view selectors. */
            this.isReady  =  false  ; // Flag indicating if the service is ready.
            this.authLabel  =  undefined  ;  // Label for authentication.
            this.authorized  =  false  ;   /* Boolean indicating authentication status. */
        }
    ]  )  ;


    app . directive  (  "ngAnalyticsAuth"  ,  [

        'ngAnalyticsService'  ,

        function  (  ngAnalyticsService  )  {

            return  {

                scope  :  { // Define isolated scope properties for the directive.
                    label  :  '@'  ,
                    authContainer  :  '@'  ,
                    hideOnAuth  :  '@'
                }  ,
                restrict  :  'E'  , // The directive can only be used as an element.
                templateUrl  :  'ngAnalytics-auth/template.html'  , // Path to the directive's template.

                link  :  function  (  $scope  )  {

                    ngAnalyticsService.authLabel  =  $scope.label  ;

                    $scope.authContainer  =  $scope.authContainer  ||  'embed-api-auth-container'  ;

                    var   watcher   =   $scope.$watch   (   function   (   )   {
                        return   ngAnalyticsService.isReady   ;
                    }   ,   function   (   isReady   )   {

                        if   (   isReady   )   { // Proceed only if the ngAnalyticsService is ready.

                            // Check if the hideOnAuth attribute is set to 'true'.
                            if   (   $scope.hideOnAuth   &&   $scope.hideOnAuth   ===   'true'   )   {

                                ngAnalyticsService.ga.auth.on   (   'success'   ,   function   (   )   {
                                    // When authorization is successful, hide the element.
                                    $scope.hide   =   true   ;
                                }   )   ;

                                $scope.$watch   (   function   (   )   {
                                    return   ngAnalyticsService.ga.auth.isAuthorized   (   )   ;
                                }   ,   function   (   isAuthorized   ,   old   )   { // Watch authorization status.

                                    if   (   isAuthorized   &&   old   !==   isAuthorized   )   {
                                        $scope.hide   =   true   ; // Hide if newly authorized.
                                    }

                                    else   if   (   !isAuthorized   &&   old   !==   isAuthorized   )   {
                                        $scope.hide   =   false   ; // Show if newly unauthorized.
                                    }
                                }   )   ;
                            }

                            /* After initialization, the watcher is no longer needed. */
                            watcher   (   )   ;
                        }
                    }   )   ;
                }
            }  ;
        }
    ]  )  ;


    app  .  directive  (  "ngAnalyticsChart"  ,  [

        'ngAnalyticsService'  ,

        function  (  ngAnalyticsService  )  {

            return  {

                scope  :  { // Define isolated scope for the chart directive.
                    viewSelectorContainer  :  '@'  ,
                    authContainer  :  '@'  ,
                    chart  :  '='
                }  ,

                restrict  :  'E'  , // This directive is used as an element.

                templateUrl  :  'ngAnalytics-chart/template.html'  ,

                link  :  function  (  $scope  )  {

                    var   first   =   !ngAnalyticsService.authorized   ?   true   :   false   ,
                          viewWatcher   ; // Declare viewWatcher here.

                    ngAnalyticsService.authorized   =   true   ; /* Mark service as authorized. */

                    // This watcher ensures functionality is added only when gapi is ready.
                    var   watcher   =   $scope.$watch   (   function   (   )   {
                        return   ngAnalyticsService.isReady   ;
                    }   ,   function   (   isReady   )   {

                        if   (   isReady   )   {

                            var   chart   ;

                            /*
                             * Authorize the user immediately if they have already granted access.
                             * If no access has been granted yet, render an authorization button
                             * inside the specified container, typically "embed-api-auth-container".
                             */
                            if   (   !ngAnalyticsService.ga.auth.isAuthorized   (   )   &&   first   )   {
                                ngAnalyticsService.authorize   (   $scope.authContainer   ||   'embed-api-auth-container'   )   ;
                            }

                            /*
                             * Create a new chart instance using Google Charts.
                             */
                            chart   =   new   ngAnalyticsService.ga.googleCharts.DataChart   (   $scope.chart   )   ;

                            // Check if a viewSelectorContainer is specified.
                            if   (   $scope.viewSelectorContainer   )   {

                                viewWatcher   =   $scope.$watch   (   function   (   )   {
                                    return   ngAnalyticsService.viewSelectors   [   $scope.viewSelectorContainer   ]   ;
                                }   ,   function   (   viewSelector   )   {

                                    if   (   viewSelector   )   {

                                        ngAnalyticsService.viewSelectors   [   $scope.viewSelectorContainer   ]   .on   (   'change'   ,   function   (   ids   )   {
                                            var   newIds   =   {
                                                query   :   {
                                                    ids   :   ids
                                                }
                                            }   ;

                                            chart   .   set   (   newIds   )   .   execute   (   )   ;
                                        }   )   ;

                                        /* Clear the view watcher once the view selector is found. */
                                        viewWatcher   (   )   ;
                                    }
                                }   )   ;
                            }

                            else   { // If no viewSelectorContainer is specified, run the chart directly upon authorization.

                                var   callback   =   function   (   )   {
                                    // Execute the chart to render it on the page.
                                    chart   .   execute   (   )   ;
                                }   ;

                                ngAnalyticsService.ga.auth.once   (   'success'   ,   callback   )   ; // Run callback on first success.

                                if   (   ngAnalyticsService.ga.auth.isAuthorized   (   )   )   {
                                    callback   (   )   ; // If already authorized, execute immediately.
                                }
                            }

                            // Clear the main watcher as gapi is now ready and setup is complete.
                            watcher   (   )   ;
                        }
                    }   )   ;
                }
            }  ;
        }
    ]  )  ;


    app  .  directive  (  "ngAnalyticsReport"  ,  [

        '$rootScope'  ,

        '$q'  ,

        'ngAnalyticsService'  ,

        function  (  $rootScope  ,  $q  ,  ngAnalyticsService  )  {

            return  {

                scope  :  { // Isolated scope definition for the report directive.
                    queries  :  '='  ,
                    authContainer  :  '@'  ,
                    viewSelectorContainer  :  '@'
                }  ,

                restrict  :  'E'  , // This directive is restricted to element usage.

                link  :  function  (  $scope  ,  element  )  {

                    var   first   =   !ngAnalyticsService.authorized   ?   true   :   false   ;

                    ngAnalyticsService.authorized   =   true   ; // Set the service as authorized.

                    /* This function encapsulates the logic for fetching a single report. */
                    function   getReport   (   query   )   {

                        var   promise   =   $q.defer   (   )   ; // Create a deferred object.

                        var   report   =   new   ngAnalyticsService.ga.report.Data   (   query   )   ;

                        report   .   once   (   'success'   ,   function   (   response   )   {
                            promise   .   resolve   (   response   )   ; // Resolve the promise on success.
                        }   )   ;

                        report   .   once   (   'error'   ,   function   (   response   )   {
                            promise   .   reject   (   response   )   ; // Reject the promise on error.
                        }   )   ;

                        report   .   execute   (   )   ; // Execute the report request.

                        return   promise   .   promise   ; // Return the promise.
                    }

                    // This watcher ensures that report functionality is added only when gapi is ready.
                    var   watcher   =   $scope.$watch   (   function   (   )   {
                        return   ngAnalyticsService.isReady   ;
                    }   ,   function   (   isReady   )   {

                        if   (   isReady   )   {

                            /*
                             * Authorize the user immediately if they have already granted access.
                             * If no access has been granted yet, render an authorization button
                             * inside the specified container, typically "embed-api-auth-container".
                             */
                            if   (   !ngAnalyticsService.ga.auth.isAuthorized   (   )   &&   first   )   {
                                ngAnalyticsService.authorize   (   $scope.authContainer   ||   'embed-api-auth-container'   )   ;
                            }

                            // Handle cases without a viewSelector connection.
                            if   (   !$scope.viewSelectorContainer   )   {

                                var   callback   =   function   (   )   {
                                    // Prepare to send the report requests.
                                    var   tasks   =   [   ]   ;

                                    angular   .   forEach   (   $scope.queries   ,   function   (   query   )   {
                                        tasks   .   push   (   getReport   (   query   )   )   ; // Add each report promise to tasks.
                                    }   )   ;

                                    $q   .   all   (   tasks   )   .   then   (   function   (   response   )   {
                                        $scope.report   =   response   ; // Assign successful report data to scope.
                                        $rootScope   .   $broadcast   (   '$gaReportSuccess'   ,   response   ,   element   )   ; // Broadcast success event.
                                    }   ,   function   (   response   )   {
                                        $scope.error   =   response   ; // Assign error data to scope.
                                        $rootScope   .   $broadcast   (   '$gaReportError'   ,   response   ,   element   )   ; // Broadcast error event.
                                    }   )   ;
                                }   ;

                                ngAnalyticsService.ga.auth.once   (   'success'   ,   callback   )   ; // Execute callback once authorization succeeds.

                                if   (   ngAnalyticsService.ga.auth.isAuthorized   (   )   )   {
                                    callback   (   )   ; // If already authorized, execute immediately.
                                }
                            }

                            else   { // Handle cases with a viewSelector connection.

                                var   viewWatcher   =   $scope.$watch   (   function   (   )   {
                                    return   ngAnalyticsService.viewSelectors   [   $scope.viewSelectorContainer   ]   ;
                                }   ,   function   (   viewSelector   )   {

                                    if   (   viewSelector   )   {

                                        ngAnalyticsService.viewSelectors   [   $scope.viewSelectorContainer   ]   .on   (   'change'   ,   function   (   ids   )   {
                                            var   tasks   =   [   ]   ;

                                            angular   .   forEach   (   $scope.queries   ,   function   (   query   )   {
                                                query.query.ids   =   ids   ; // Update query with new view IDs.
                                                tasks   .   push   (   getReport   (   query   )   )   ;
                                            }   )   ;

                                            $q   .   all   (   tasks   )   .   then   (   function   (   response   )   {
                                                $scope.report   =   response   ;
                                                $rootScope   .   $broadcast   (   '$gaReportSuccess'   ,   response   ,   element   )   ;
                                            }   ,   function   (   response   )   {
                                                $scope.error   =   response   ;
                                                $rootScope   .   $broadcast   (   '$gaReportError'   ,   response   ,   element   )   ;
                                            }   )   ;
                                        }   )   ;

                                        // Clear the view watcher once the view selector is available.
                                        viewWatcher   (   )   ;
                                    }
                                }   )   ;
                            }

                            // Clear the main watcher after setup is complete.
                            watcher   (   )   ;
                        }
                    }   )   ;
                }
            }  ;
        }
    ]  )  ;


    app  .  directive  (  "ngAnalyticsView"  ,  [

        'ngAnalyticsService'  ,

        function  (  ngAnalyticsService  )  {

            return  {

                scope  :  { // Define isolated scope for the view directive.
                    viewSelectorContainer  :  '@'  ,
                    authContainer  :  '@'  ,
                    charts  :  '='
                }  ,

                restrict  :  'E'  , // This directive is restricted to element usage.

                templateUrl  :  'ngAnalytics-view/template.html'  ,

                link  :  function  (  $scope  )  {

                    var   first   =   !ngAnalyticsService.authorized   ?   true   :   false   ;

                    ngAnalyticsService.authorized   =   true   ; // Set the service's authorization status.

                    // This watcher ensures that view functionality is added only when gapi is ready.
                    $scope.$watch   (   function   (   )   {
                        return   ngAnalyticsService.isReady   ;
                    }   ,   function   (   isReady   )   {

                        if   (   isReady   )   {

                            /*
                             * Authorize the user immediately if they have already granted access.
                             * If no access has been granted yet, render an authorization button
                             * inside the specified container, typically "embed-api-auth-container".
                             */
                            if   (   !ngAnalyticsService.ga.auth.isAuthorized   (   )   &&   first   )   {
                                ngAnalyticsService.authorize   (   $scope.authContainer   ||   'embed-api-auth-container'   )   ;
                            }

                            /*
                             * Create a new ViewSelector instance. This instance will be rendered
                             * inside an element with the ID specified by "view-selector-container".
                             * If not provided, it defaults to "view-selector-container".
                             */
                            $scope.viewSelectorContainer   =   $scope.viewSelectorContainer   ||   'view-selector-container'   ;

                            var   viewSelector   =   new   ngAnalyticsService.ga.ViewSelector   (   {
                                container   :   $scope.viewSelectorContainer
                            }   )   ;

                            /* Store the newly created view selector instance within the service. */
                            ngAnalyticsService.viewSelectors   [   $scope.viewSelectorContainer   ]   =   viewSelector   ;

                            var   callback   =   function   (   )   {
                                // Execute the view selector to render it on the page.
                                viewSelector   .   execute   (   )   ;
                            }   ;

                            ngAnalyticsService.ga.auth.once   (   'success'   (   )   ,   callback   )   ; // Execute callback once authorization succeeds.

                            if   (   ngAnalyticsService.ga.auth.isAuthorized   (   )   )   {
                                callback   (   )   ; // If already authorized, execute immediately.
                            }
                        }
                    }   )   ;
                }
            }  ;
        }
    ]  )  ;


    app  .  run  (  [

        '$templateCache'  ,

        '$timeout'  ,

        'ngAnalyticsService'  ,

        function  (  $templateCache  ,  $timeout  ,  ngAnalyticsService  )  {

            // This block dynamically adds the Google Analytics Embed API script to the page.
            var   gaCode   =   document   .   createTextNode   (   "(function(w,d,s,g,js,fs){ g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}}; js=d.createElement(s);fs=d.getElementsByTagName(s)[0]; js.src='https://apis.google.com/js/platform.js'; fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');}; }(window,document,'script'));"   )   ;

            var   scriptTag   =   document   .   createElement   (   'script'   )   ;

            scriptTag   .   type   =   'text/javascript'   ;

            scriptTag   .   appendChild   (   gaCode   )   ;

            document   .   body   .   appendChild   (   scriptTag   )   ;

            // When the Google Analytics Embed API is fully loaded and ready,
            // inform our ngAnalyticsService and update its status.
            gapi   .   analytics   .   ready   (   function   (   )   {

                $timeout   (   function   (   )   {
                    ngAnalyticsService.ga   =   gapi.analytics   ; // Assign the gapi.analytics object to the service.
                    ngAnalyticsService.isReady   =   true   ; // Mark the service as ready.
                }   ,   0   )   ;
            }   )   ;

            // Pre-fill Angular's template cache with the HTML templates required by the directives.
            $templateCache   .   put   (   'ngAnalytics-auth/template.html'   ,   '<div id="{{authContainer}}" ng-hide="hide"></div>'   )   ;

            $templateCache   .   put   (   'ngAnalytics-chart/template.html'   ,   '<div id="{{chart.chart.container}}"></div>'   )   ;

            $templateCache   .   put   (   'ngAnalytics-view/template.html'   ,   '<div id="{{viewSelectorContainer}}"></div>'   )   ;
        }
    ]  )  ;

}  )  .  call  (  this  )  ;