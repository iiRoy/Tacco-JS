/**
 * A basic DOM object wrapper supporting method chaining.
 */
function DOMNodeWrapper( nodeTag , initialProps )
{
    this.hostNode = document.createElement( nodeTag ) ;

    if ( initialProps !== void 0 )
    {
        this.modifyAttributes( initialProps ) ;
    }
}


/**
 * Appends a child element or collection of elements to the current wrapper's element.
 * @param {object} childItem - The item(s) to be appended.
 */
DOMNodeWrapper.prototype.addChildNode = ( function ( childItem )
{
    if ( childItem instanceof DOMNodeWrapper )
    {
        this.hostNode.appendChild( childItem.retrieveElement() ) ;
    }
    else if ( childItem instanceof ExternalCollection )
    {
        if ( childItem.itemCount > 1 )
        {
            const thisRef = this ;

            childItem.processEach( function ( idx , currentElement )
            {
                thisRef.hostNode.appendChild( currentElement ) ;
            } ) ;
        }
        else
        {
            this.hostNode.appendChild( childItem[0] ) ;
        }
    }
    else if ( childItem instanceof Element )
    {
        this.hostNode.appendChild( childItem ) ;
    }

    return this ;
} ) ;


/**
 * Sets styling properties for the wrapped DOM node.
 */
DOMNodeWrapper.prototype.applyStyles = ( function ( styleConfig , styleValue )
{
    if ( typeof styleConfig === 'string' )
    {
        this.hostNode.style[ styleConfig ] = styleValue ;
    }
    else if ( styleConfig && typeof styleConfig === 'object' )
    {
        for ( let styleKey in styleConfig )
        {
            if ( styleConfig.hasOwnProperty( styleKey ) )
            {
                this.hostNode.style[ styleKey ] = styleConfig[ styleKey ] ;
            }
        }
    }
    return this ;
} ) ;


/**
 * Manages the internal HTML content of the wrapped element.
 */
DOMNodeWrapper.prototype.setInnerContent = ( function ( contentString )
{
    if ( contentString === void 0 )
    {
        return this.hostNode.innerHTML ;
    }
    else
    {
        this.hostNode.innerHTML = contentString ;
        return this ;
    }
} ) ;


DOMNodeWrapper.prototype.modifyAttributes = ( function ( attrConfig , attrValue )
{
    if ( typeof attrConfig === 'string' )
    {
        this.hostNode.setAttribute( attrConfig , attrValue ) ;
    }
    else if ( attrConfig && typeof attrConfig === 'object' )
    {
        for ( let attributeKey in attrConfig )
        {
            if ( attrConfig.hasOwnProperty( attributeKey ) )
            {
                this.hostNode.setAttribute( attributeKey , attrConfig[ attributeKey ] ) ;
            }
        }
    }
    return this ;
} ) ;

/**
 * Retrieves the raw underlying DOM element.
 */
DOMNodeWrapper.prototype.retrieveElement = ( function ( )
{
    return this.hostNode ;
} ) ;