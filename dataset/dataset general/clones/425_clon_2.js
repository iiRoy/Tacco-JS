angular . module ( 'inventoryApp' , [ 'itemSelectorModule' ] ) .
controller ( 'inventoryController' , [ '$modelScope' , function ( $modelScope ) {

    $modelScope . products = [ { sku : 1 , title : 'Laptop' } , { sku : 2 , title : 'Mouse' } , { sku : 3 , title : 'Keyboard' } ] ;
    $modelScope . chosenProduct = [ ] ;

    $modelScope . categories = [ { catId : 1 , categoryName : 'Electronics' } , { catId : 2 , categoryName : 'Books' } , { catId : 3 , categoryName : 'Apparel' } ] ;
    $modelScope . chosenCategory = null ;
} ] )