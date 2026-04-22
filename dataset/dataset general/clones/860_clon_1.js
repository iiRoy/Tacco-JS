/*******************************************************************************
 * bootstrap-transition.js v2.0.4
 * Original URL: http://twitter.github.com/bootstrap/javascript.html#transitions
 *
 * Copyright 2012 Twitter, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This file handles CSS3 transition detection for Bootstrap components.
 ******************************************************************************/


! function ( $ ) {

    $( function ( ) {

        "use strict" ; // This enables strict mode for JavaScript.

        // CSS TRANSITION SUPPORT (Based on Modernizr's implementation)
        // ====================================================================

        $.support.transition = ( function ( ) {

            var transitionEnd = ( function ( ) {

                var el = document.createElement ( 'bootstrap' )
                  , transEndEventNames = {
                       'WebkitTransition' : 'webkitTransitionEnd'
                    ,  'MozTransition'    : 'transitionend'
                    ,  'OTransition'      : 'oTransitionEnd'
                    ,  'msTransition'     : 'MSTransitionEnd'
                    ,  'transition'       : 'transitionend'
                    }
                  , name ;

                // Check for transition event support
                for ( name in transEndEventNames ) {
                  if ( el.style [ name ] !== undefined ) {
                    return transEndEventNames [ name ] ;
                  }
                }

            } ( ) ) ;

            return transitionEnd && {
                end: transitionEnd
            } ;

        } ) ( ) ;

    } ) ;

} ( window.jQuery ) ;


/*******************************************************************************
 * bootstrap-modal.js v2.0.4
 * Original URL: http://twitter.github.com/bootstrap/javascript.html#modals
 *
 * Copyright 2012 Twitter, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This file provides the Modal component functionality.
 ******************************************************************************/


! function ( $ ) {

    "use strict" ; // Use strict mode.

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function ( content, options ) {
        this.options = options ;
        this.$element = $ ( content )
            .delegate ( '[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy ( this.hide, this ) ) ;
    } ;

    Modal.prototype = {

        constructor: Modal

      , toggle: function ( ) {
            return this [ ! this.isShown ? 'show' : 'hide' ] ( ) ;
        }

      , show: function ( ) {
            var that = this
              , e = $.Event ( 'show' ) ;

            this.$element.trigger ( e ) ;

            if ( this.isShown || e.isDefaultPrevented ( ) ) return ;

            $ ( 'body' ) .addClass ( 'modal-open' ) ;

            this.isShown = true ;

            escape.call ( this ) ;
            backdrop.call ( this, function ( ) {
                var transition = $.support.transition && that.$element.hasClass ( 'fade' ) ;

                if ( ! that.$element.parent ( ) .length ) {
                    that.$element.appendTo ( document.body ) ; // don't move modals dom position
                }

                that.$element
                    .show ( ) ;

                if ( transition ) {
                    that.$element [ 0 ] .offsetWidth ; // force reflow
                }

                that.$element.addClass ( 'in' ) ;

                transition ?
                    that.$element.one ( $.support.transition.end, function ( ) { that.$element.trigger ( 'shown' ) ; } ) :
                    that.$element.trigger ( 'shown' ) ;

            } ) ;
        }

      , hide: function ( e ) {
            e && e.preventDefault ( ) ;

            var that = this ;

            e = $.Event ( 'hide' ) ;

            this.$element.trigger ( e ) ;

            if ( ! this.isShown || e.isDefaultPrevented ( ) ) return ;

            this.isShown = false ;

            $ ( 'body' ) .removeClass ( 'modal-open' ) ;

            escape.call ( this ) ;

            this.$element.removeClass ( 'in' ) ;

            $.support.transition && this.$element.hasClass ( 'fade' ) ?
                hideWithTransition.call ( this ) :
                hideModal.call ( this ) ;
        }

    } ;


    // MODAL PRIVATE METHODS
    // =====================

    function hideWithTransition ( ) {
        var that = this
          , timeout = setTimeout ( function ( ) {
                that.$element.off ( $.support.transition.end ) ;
                hideModal.call ( that ) ;
            }, 500 ) ;

        this.$element.one ( $.support.transition.end, function ( ) {
            clearTimeout ( timeout ) ;
            hideModal.call ( that ) ;
        } ) ;
    }

    function hideModal ( that ) {
        this.$element
            .hide ( )
            .trigger ( 'hidden' ) ;

        backdrop.call ( this ) ;
    }

    function backdrop ( callback ) {
        var that = this
          , animate = this.$element.hasClass ( 'fade' ) ? 'fade' : '' ;

        if ( this.isShown && this.options.backdrop ) {
            var doAnimate = $.support.transition && animate ;

            this.$backdrop = $ ( '<div class="modal-backdrop ' + animate + '" />' )
                .appendTo ( document.body ) ;

            if ( this.options.backdrop != 'static' ) {
                this.$backdrop.click ( $.proxy ( this.hide, this ) ) ;
            }

            if ( doAnimate ) this.$backdrop [ 0 ] .offsetWidth ; // force reflow

            this.$backdrop.addClass ( 'in' ) ;

            doAnimate ?
                this.$backdrop.one ( $.support.transition.end, callback ) :
                callback ( ) ;

        } else if ( ! this.isShown && this.$backdrop ) {
            this.$backdrop.removeClass ( 'in' ) ;

            $.support.transition && this.$element.hasClass ( 'fade' ) ?
                this.$backdrop.one ( $.support.transition.end, $.proxy ( removeBackdrop, this ) ) :
                removeBackdrop.call ( this ) ;

        } else if ( callback ) {
            callback ( ) ;
        }
    }

    function removeBackdrop ( ) {
        this.$backdrop.remove ( ) ;
        this.$backdrop = null ;
    }

    function escape ( ) {
        var that = this ;
        if ( this.isShown && this.options.keyboard ) {
            $ ( document ) .on ( 'keyup.dismiss.modal', function ( e ) {
                e.which == 27 && that.hide ( ) ;
            } ) ;
        } else if ( ! this.isShown ) {
            $ ( document ) .off ( 'keyup.dismiss.modal' ) ;
        }
    }


    // MODAL PLUGIN DEFINITION
    // =======================

    $.fn.modal = function ( option ) {
        return this.each ( function ( ) {
            var $this = $ ( this )
              , data = $this.data ( 'modal' )
              , options = $.extend ( { }, $.fn.modal.defaults, $this.data ( ), typeof option == 'object' && option ) ;
            if ( ! data ) $this.data ( 'modal', ( data = new Modal ( this, options ) ) ) ;
            if ( typeof option == 'string' ) data [ option ] ( ) ;
            else if ( options.show ) data.show ( ) ;
        } ) ;
    } ;

    $.fn.modal.defaults = {
        backdrop: true
      , keyboard: true
      , show: true
    } ;

    $.fn.modal.Constructor = Modal ;


    // MODAL DATA-API
    // ==============

    $ ( function ( ) {
        $ ( 'body' ) .on ( 'click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
            var $this = $ ( this )
              , href
              , $target = $ ( $this.attr ( 'data-target' ) || ( href = $this.attr ( 'href' ) ) && href.replace ( /.*(?=#[^\s]+$)/, '' ) ) // strip for ie7
              , option = $target.data ( 'modal' ) ? 'toggle' : $.extend ( { }, $target.data ( ), $this.data ( ) ) ;

            e.preventDefault ( ) ;
            $target.modal ( option ) ;
        } ) ;
    } ) ;

} ( window.jQuery ) ;


/*******************************************************************************
 * bootstrap-dropdown.js v2.0.4
 * Original URL: http://twitter.github.com/bootstrap/javascript.html#dropdowns
 *
 * Copyright 2012 Twitter, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This file provides the Dropdown component functionality.
 ******************************************************************************/


! function ( $ ) {

    "use strict" ; // Strict mode enabled.

    // DROPDOWN CLASS DEFINITION
    // =========================

    var toggle = '[data-toggle="dropdown"]'
      , Dropdown = function ( element ) {
            var $el = $ ( element ) .on ( 'click.dropdown.data-api', this.toggle ) ;
            $ ( 'html' ) .on ( 'click.dropdown.data-api', function ( ) {
                $el.parent ( ) .removeClass ( 'open' ) ;
            } ) ;
        } ;

    Dropdown.prototype = {

        constructor: Dropdown

      , toggle: function ( e ) {
            var $this = $ ( this )
              , $parent
              , selector
              , isActive ;

            if ( $this.is ( '.disabled, :disabled' ) ) return ;

            selector = $this.attr ( 'data-target' ) ;

            if ( ! selector ) {
                selector = $this.attr ( 'href' ) ;
                selector = selector && selector.replace ( /.*(?=#[^\s]*$)/, '' ) ; // strip for ie7
            }

            $parent = $ ( selector ) ;
            $parent.length || ( $parent = $this.parent ( ) ) ;

            isActive = $parent.hasClass ( 'open' ) ;

            clearMenus ( ) ;

            if ( ! isActive ) $parent.toggleClass ( 'open' ) ;

            return false ;
        }

    } ;

    function clearMenus ( ) {
        $ ( toggle ) .parent ( ) .removeClass ( 'open' ) ;
    }


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    $.fn.dropdown = function ( option ) {
        return this.each ( function ( ) {
            var $this = $ ( this )
              , data = $this.data ( 'dropdown' ) ;
            if ( ! data ) $this.data ( 'dropdown', ( data = new Dropdown ( this ) ) ) ;
            if ( typeof option == 'string' ) data [ option ] .call ( $this ) ;
        } ) ;
    } ;

    $.fn.dropdown.Constructor = Dropdown ;


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $ ( function ( ) {
        $ ( 'html' ) .on ( 'click.dropdown.data-api', clearMenus ) ;
        $ ( 'body' )
            .on ( 'click.dropdown', '.dropdown form', function ( e ) { e.stopPropagation ( ) ; } )
            .on ( 'click.dropdown.data-api', toggle, Dropdown.prototype.toggle ) ;
    } ) ;

} ( window.jQuery ) ;


/*******************************************************************************
 * bootstrap-scrollspy.js v2.0.4
 * Original URL: http://twitter.github.com/bootstrap/javascript.html#scrollspy
 *
 * Copyright 2012 Twitter, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This file provides the Scrollspy component functionality.
 ******************************************************************************/


! function ( $ ) {

    "use strict" ; // Strict mode.

    // SCROLLSPY CLASS DEFINITION
    // ==========================

    function ScrollSpy ( element, options ) {
        var process = $.proxy ( this.process, this )
          , $element = $ ( element ) .is ( 'body' ) ? $ ( window ) : $ ( element )
          , href ;
        this.options = $.extend ( { }, $.fn.scrollspy.defaults, options ) ;
        this.$scrollElement = $element.on ( 'scroll.scroll.data-api', process ) ;
        this.selector = ( this.options.target
          || ( ( href = $ ( element ) .attr ( 'href' ) ) && href.replace ( /.*(?=#[^\s]+$)/, '' ) ) // strip for ie7
          || '' ) + ' .nav li > a' ;
        this.$body = $ ( 'body' ) ;
        this.refresh ( ) ;
        this.process ( ) ;
    }

    ScrollSpy.prototype = {

        constructor: ScrollSpy

      , refresh: function ( ) {
            var self = this
              , $targets ;

            this.offsets = $ ( [ ] ) ;
            this.targets = $ ( [ ] ) ;

            $targets = this.$body
                .find ( this.selector )
                .map ( function ( ) {
                    var $el = $ ( this )
                      , href = $el.data ( 'target' ) || $el.attr ( 'href' )
                      , $href = /^#\w/.test ( href ) && $ ( href ) ;
                    return ( $href
                      && href.length
                      && [ [ $href.position ( ) .top, href ] ] ) || null ;
                } )
                .sort ( function ( a, b ) { return a [ 0 ] - b [ 0 ] ; } )
                .each ( function ( ) {
                    self.offsets.push ( this [ 0 ] ) ;
                    self.targets.push ( this [ 1 ] ) ;
                } ) ;
        }

      , process: function ( ) {
            var scrollTop = this.$scrollElement.scrollTop ( ) + this.options.offset
              , scrollHeight = this.$scrollElement [ 0 ] .scrollHeight || this.$body [ 0 ] .scrollHeight
              , maxScroll = scrollHeight - this.$scrollElement.height ( )
              , offsets = this.offsets
              , targets = this.targets
              , activeTarget = this.activeTarget
              , i ;

            if ( scrollTop >= maxScroll ) {
                return activeTarget != ( i = targets.last ( ) [ 0 ] )
                  && this.activate ( i ) ;
            }

            for ( i = offsets.length; i--; ) {
                activeTarget != targets [ i ]
                  && scrollTop >= offsets [ i ]
                  && ( ! offsets [ i + 1 ] || scrollTop <= offsets [ i + 1 ] )
                  && this.activate ( targets [ i ] ) ;
            }
        }

      , activate: function ( target ) {
            var active
              , selector ;

            this.activeTarget = target ;

            $ ( this.selector )
                .parent ( '.active' )
                .removeClass ( 'active' ) ;

            selector = this.selector
              + '[data-target="' + target + '"],'
              + this.selector + '[href="' + target + '"]' ;

            active = $ ( selector )
                .parent ( 'li' )
                .addClass ( 'active' ) ;

            if ( active.parent ( '.dropdown-menu' ) ) {
                active = active.closest ( 'li.dropdown' ) .addClass ( 'active' ) ;
            }

            active.trigger ( 'activate' ) ;
        }

    } ;


    // SCROLLSPY PLUGIN DEFINITION
    // ===========================