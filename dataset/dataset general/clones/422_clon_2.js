'use strict';

appModule.factory
(
    'userStateStore',
    [
        '$http',
        function
        (
            webService
        )
        {
            return {
                storeEntry : function ( itemIdentifier, itemValue )
                {
                    return  sessionStorage.setItem( itemIdentifier, itemValue );
                } ,

                fetchEntry : function ( itemIdentifier )
                {
                    return sessionStorage.getItem( itemIdentifier );
                } ,

                clearEntry : function ( itemIdentifier )
                {
                    webService.post ( 'data/destroy_session.php' ) ;
                    return sessionStorage.removeItem( itemIdentifier ) ;
                }
            } ;
        }
    ]
)