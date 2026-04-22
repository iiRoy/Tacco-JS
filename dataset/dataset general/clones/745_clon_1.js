// This  module,  'installer',  is  designed  to  integrate
// the  application's  installation  logic  directly  into
// the  AngularJS  $rootScope  for  easy  access.

define  (  [ 'app' ] ,  function  (  app  )
{
    app . run  (  [ '$rootScope' ,  function  (  $rootScope  )
    {

        // Initial  check:  Does  the  browser  environment
        // provide  the  Mozilla  Apps  API  (navigator.mozApps)?
        $rootScope . hasMozApps  =  !!  navigator . mozApps ;


        // If  the  mozApps  API  is  present  in  the  navigator  object,
        // we  should  verify  if  this  application  is  already  installed.
        if  ( 'mozApps'  in  navigator )
        {
            var  checkIfInstalled  =  navigator . mozApps . getSelf ( ) ;

            // Callback  for  a  successful  installation  status  check.
            checkIfInstalled . onsuccess  =  function ( )
            {
                // Update  the  installation  status  on  the  rootScope.
                $rootScope . isInstalled  =  !!  checkIfInstalled . result ;
                $rootScope . $apply ( ) ;  //  Propagate  changes  to  Angular's  scope.
            } ;
        }


        // This  is  the  primary  functionality:  the  installation  routine.
        // It  is  exposed  as  $rootScope.install  for  global  availability.
        $rootScope . install  =  function ( )
        {
            // Dynamically  determine  the  manifest  URL  based  on  the  current  location.
            var  host  =  location . href . replace ( location . hash ,  '' ) ;
            host  =  host . substr ( 0 ,  host . lastIndexOf ( '/' ) ) ;
            var  manifestURL  =  host  +  '/manifest.webapp' ;

            // Attempt  to  install  the  web  application  using  the  Mozilla  Apps  API.
            var  installApp  =  navigator . mozApps . install ( manifestURL ) ;

            // Define  the  success  callback  for  the  installation  process.
            installApp . onsuccess  =  function ( )
            {
                $rootScope . isInstalled  =  true ;  //  Set  status  to  installed.
                $rootScope . $apply ( ) ;  //  Refresh  the  Angular  view.
            } ;

            // Define  the  error  callback  if  the  installation  fails.
            installApp . onerror  =  function ( )
            {
                alert ( 'Installation  failed  unexpectedly.\n\nError:  '  +  installApp . error . name ) ;
            } ;
        } ;

    }  )  ]  ) ;
}  ) ;