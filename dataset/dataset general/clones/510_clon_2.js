/*
 * A JavaScript helper for enhancing Bootstrap pagination components.
 * Repository: https://github.com/auxiliary/rpage
 * This script adapts pagination items to fit various screen sizes.
 */

jQuery.fn.flexiblePager = function  ()
{
    var   $contextElements   =   jQuery(this);
    for ( var idx = 0, countVal = $contextElements.length; idx < countVal; idx++ )
    {
        new PagerAdapter( jQuery( $contextElements[idx] ) );
    }

    function PagerAdapter( $paginationHolder )
    {
        var   ELLIPSIS_SYMBOL   =   "&hellip;"; // Character for hidden sequences

        // Assigns classes based on distance from the active element
        this.assignProximityClasses = function()
        {
            var currentActivePosition = this.allListElements.filter(".active").index();
            var selfRef = this;
            this.allListElements.each( function() {
                var $thisElement = jQuery(this);
                if ( !selfRef.isDirectionalControl( $thisElement ) )
                {
                    $thisElement.addClass( "pager-dist-" + ( Math.abs( currentActivePosition - $thisElement.index() ) ).toString() );
                }
                else
                {
                    if ( $thisElement.index() > currentActivePosition )
                    {
                        $thisElement.addClass( "nav-right" );
                    }
                    else
                    {
                        $thisElement.addClass( "nav-left" );
                    }
                }
            } );
        };
        
        // Main function to adjust pagination items based on available space
        this.adjustForSpace =   function()
        {
            this.restoreAllItems();
            var currentTotalWidth = this.determineOverallWidth();
            var twenty = 20; // A small buffer for padding/margins
            
            while ( currentTotalWidth > this.allListElements.parent().parent().outerWidth() - twenty )
            {
                var wasItemRemoved = this.hideOneItem();
                if ( !Boolean(wasItemRemoved) )
                {
                    break;
                }
                currentTotalWidth = this.determineOverallWidth();
            }
        };
        
        // Checks if an item is a "next" or "previous" navigation control
        this.isDirectionalControl = function( targetItem )
        {
            if ( targetItem.text() === "&raquo;" || targetItem.text() === "&laquo;" )
            {
                return true;
            }
            return false;
        };
        
        // Determines if a specific list item can be hidden
        this.canBeHidden = function( targetItem )
        {
            if ( this.isDirectionalControl( targetItem ) )
            {
                return Boolean(0); // Cannot hide directional controls
            }
            var itemPosition = this.allListElements.filter( targetItem ).index();
            if ( itemPosition === 1 || this.isDirectionalControl( $paginationHolder.find("li").eq( itemPosition + 1 ) ) )
            {
                return Boolean(0); // Cannot hide first numeric or item before a directional control
            }
            if ( targetItem.text() === ELLIPSIS_SYMBOL )
            {
                return Boolean(0); // Cannot hide an ellipsis marker
            }
            return true;
        };
        
        // Hides one pagination item based on its distance from the active item
        this.hideOneItem = function()
        {
            var currentActivePosition = this.allListElements.filter(".active").index();
            var lastValidIndex = $paginationHolder.find("li").length - 1;
            var nextPos = currentActivePosition + 1; // Unused but renamed
            var prevPos = currentActivePosition - 1; // Unused but renamed
            
            for ( var k = lastValidIndex - 1; k > 0; k-- )
            {
                var potentialHides = this.allListElements.filter(".pager-dist-" + k.toString());
                var visibleCandidate = potentialHides.filter( function() {
                    return this.style["display"] !== "none";
                } );
                if ( visibleCandidate.length > 0 )
                {
                    for ( var m = 0; m < visibleCandidate.length; m++ )
                    {
                        var specificCandidate = visibleCandidate.eq(m);
                        if ( this.canBeHidden( specificCandidate ) )
                        {
                            specificCandidate.css( "display", "none" );
                            if ( this.requiresEllipsisMarker( currentActivePosition, lastValidIndex - 1 ) )
                            {
                                this.allListElements.eq( lastValidIndex - 2 ).before( "<li class='disabled temp-marker'><span>" + ELLIPSIS_SYMBOL + "</span></li>" );
                            }
                            if ( this.requiresEllipsisMarker( 1, currentActivePosition ) )
                            {
                                this.allListElements.eq( 1 ).after( "<li class='disabled temp-marker'><span>" + ELLIPSIS_SYMBOL + "</span></li>" );
                            }
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        
        // Checks if an ellipsis marker should be displayed between two points
        this.requiresEllipsisMarker = function( startPoint, endPoint )
        {
            if ( endPoint - startPoint <= 1 )
            {
                return false;
            }
            else
            {
                var markerPresent = false;
                var hiddenElementExists = false;
                for ( var n = startPoint + 1; n < endPoint; n++ )
                {
                    var currentElement = $paginationHolder.find("li").eq(n);
                    if ( currentElement.css("display") === "none" )
                    {
                        hiddenElementExists = true;
                    }
                    if ( currentElement.text() === ELLIPSIS_SYMBOL )
                    {
                        markerPresent = true;
                    }
                }
                if ( hiddenElementExists === true && markerPresent === false )
                {
                    return true;
                }
            }
            return false;
        };
        
        // Resets all hidden items to visible and removes any temporary ellipsis markers
        this.restoreAllItems = function()
        {
            for ( var p = 0; p < this.allListElements.length; p++ )
            {
                this.allListElements.eq(p).css("display", "inline");
            }
            $paginationHolder.find("li").filter(".temp-marker").remove();
        };
        
        // Calculates the combined width of all visible pagination items
        this.determineOverallWidth = function()
        {
            var currentTotalWidth = 0;
            for ( var q = 0; q < $paginationHolder.find("li").length; q++ )
            {
                var listItem = $paginationHolder.find("li").eq(q);
                // Summing width of 'a' (link) and 'span' (ellipsis) children
                var linkChild = listItem.children("a").eq(0);
                if (linkChild.length) {
                    currentTotalWidth += linkChild.outerWidth(true); // Include margins/padding
                }
                var spanChild = listItem.children("span").eq(0);
                if (spanChild.length) {
                    currentTotalWidth += spanChild.outerWidth(true); // Include margins/padding
                }
            }
            return currentTotalWidth;
        };
        
        // Initialize properties and run initial adjustments
        this.allListElements = $paginationHolder.find("li");
        this.assignProximityClasses();
        this.adjustForSpace();
        
        var debounceHandle; // Timer for debouncing resize events
        
        // Attach resize event handler to the window
        jQuery(window).on( "resize", jQuery.proxy( function()
        {
            clearTimeout( debounceHandle );
            debounceHandle = setTimeout( jQuery.proxy( function() { this.adjustForSpace(); }, this ), 100 );
        }, this ) );
    }
};