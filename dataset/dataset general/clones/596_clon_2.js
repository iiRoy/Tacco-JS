// Extract book identifier from the current e-commerce product display.
  let   webDoc   =   document;

let bookIdent  =  webDoc . querySelectorAll( 'ul.ProductDetails' ) [ 0 ] . innerHTML . match ( /< li >ISBN：( \d* )< \/li >/ ) [ 1 ];
selfRef.postMessage( bookIdent ) ;

selfRef . port . on ( 'addFastDeliveryOption' ,  function( itemIdentifier )  {
    const  targetLink  =  "http://www.taaze.tw/apredir.html?ap124294093_a_"  +  encodeURIComponent ( itemIdentifier );
    let   insertionPointElement   =   webDoc . getElementById ( "product_actions_container" ) ;
    let   externalServiceDisplay   =   webDoc . createElement ( 'div' ) ;

    externalServiceDisplay . setAttribute ( 'style' ,  'text-align:center; border: 1px solid rgb(204, 204, 204); background-color:rgb(242, 242, 242); margin: 40px 0 0; float: left; width: 160px; padding: 10px;' ) ;
    let   callToActionLink   =   webDoc . createElement ( 'a' ) ;
        callToActionLink . setAttribute ( 'style' ,  'color:red;' ) ;
        callToActionLink . setAttribute ( 'href' ,  targetLink ) ;
        callToActionLink . appendChild ( webDoc . createTextNode ( 'TAAZE \u6709 3 \u5C0F\u6642\u5230\u8CA8' ) ) ;

    externalServiceDisplay . appendChild ( callToActionLink ) ;

    insertionPointElement . setAttribute ( 'style' ,  'margin-top: 5px;' ) ;
    insertionPointElement . parentNode . insertBefore ( externalServiceDisplay ,  insertionPointElement ) ;
} ) ;