/*jslint bitwise: true, node: true, evil: true */

( function ( jQueryObj, globalWindow, currentDoc, undefinedVal ) {
  'use strict';

  AppCore.modules.modalDisplay = {
    name : 'modalDisplay',

    version : '1.0.0',

    isBusy : false,

    config : {
      animationType : 'slideAndFade',
      animationDuration : 300,
      dismissOnOverlayClick : true,
      dismissOnEscapeKey : true,
      dismissModalClass : 'close-display-view',
      overlayClass : 'display-view-overlay',
      onShow : function () {},
      afterShow : function () {},
      onHide : function () {},
      afterHide : function () {},
      overlayElem : jQueryObj( '.display-view-overlay' ),
      styles : {
        show : {
          'opacityLevel' : 0,
          'visibilityState' : 'visible',
          'displayMode' : 'block'
        },
        hide : {
          'opacityLevel' : 1,
          'visibilityState' : 'hidden',
          'displayMode' : 'none'
        }
      }
    },

    initialize : function ( contextObj, actionType, customOpts ) {
      AppCore.inherits( this, 'config_params deferExecute' );

      if ( typeof actionType === 'object' ) {
        jQueryObj.extend( true, this.config, actionType );
      } else if ( typeof customOpts !== 'undefinedVal' ) {
        jQueryObj.extend( true, this.config, customOpts );
      }

      if ( typeof actionType != 'string' ) {
        this.bindEvents();

        return this.config.initialize;
      } else {
        return this[ actionType ].call( this, customOpts );
      }
    },

    bindEvents : function () {
      var moduleRef = this;

      jQueryObj( this.contextObj )
        .off( '.appcore.modaldisplay' )
        .on( 'click.appcore.modaldisplay', '[data-modal-target]', function ( evt ) {
          evt.preventDefault();

          if ( !moduleRef.isBusy ) {
            var clickedElement = jQueryObj( this ),
              remoteContent = clickedElement.data( 'modal-remote' );

            moduleRef.isBusy = true;

            if ( typeof remoteContent === 'undefinedVal' ) {
              moduleRef.showModal.call( moduleRef, clickedElement );
            } else {
              var contentUrl = remoteContent === true ? clickedElement.attr( 'href' ) : remoteContent;

              moduleRef.showModal.call( moduleRef, clickedElement, { contentUrl : contentUrl } );
            }
          }
        })
        .on( 'click.appcore.modaldisplay touchend.click.appcore.modaldisplay', this.getDismissTargets(), function ( evt ) {
          evt.preventDefault();
          if ( !moduleRef.isBusy ) {
            var currentConfig = jQueryObj.extend( {}, moduleRef.config, moduleRef.config_params( jQueryObj( '.modal-view.active' ) ) );
            if ( jQueryObj( evt.target )[ 0 ] === jQueryObj( '.' + currentConfig.overlayClass )[ 0 ] && !currentConfig.dismissOnOverlayClick ) {
              return;
            }

            moduleRef.isBusy = true;
            moduleRef.hideModal.call( moduleRef, jQueryObj( this ).closest( '.modal-view' ) );
          }
        })
        .on( 'show.appcore.modaldisplay', '.modal-view', this.config.onShow )
        .on( 'afterShow.appcore.modaldisplay', '.modal-view', this.config.afterShow )
        .on( 'afterShow.appcore.modaldisplay', '.modal-view', this.playMedia )
        .on( 'hide.appcore.modaldisplay', '.modal-view', this.config.onHide )
        .on( 'afterHide.appcore.modaldisplay', '.modal-view', this.config.afterHide )
        .on( 'afterHide.appcore.modaldisplay', '.modal-view', this.pauseMedia );

      jQueryObj( 'body' ).bind( 'keyup.modaldisplay', function ( keyboardEvt ) {
        var activeModal = jQueryObj( '.modal-view.active' ),
          currentConfig = jQueryObj.extend( {}, moduleRef.config, moduleRef.config_params( activeModal ) );
        if ( keyboardEvt.which === 27 && currentConfig.dismissOnEscapeKey ) {
          activeModal.appcore( 'modalDisplay', 'hideModal' );
        }
      });

      return true;
    },

    showModal : function ( triggerElem, remoteSettings ) {
      if ( triggerElem ) {
        if ( typeof triggerElem.selector !== 'undefinedVal' ) {
          var displayView = jQueryObj( '#' + triggerElem.data( 'modal-target' ) );
        } else {
          var displayView = jQueryObj( this.contextObj );

          remoteSettings = triggerElem;
        }
      } else {
        var displayView = jQueryObj( this.contextObj );
      }

      if ( !displayView.hasClass( 'active' ) ) {
        var activeModal = jQueryObj( '.modal-view.active' );

        if ( typeof displayView.data( 'style-top' ) === 'undefinedVal' ) {
          displayView.data( 'style-top', parseInt( displayView.css( 'top' ), 10 ) )
            .data( 'vertical-offset', this.calculateVerticalOffset( displayView ) );
        }

        displayView.trigger( 'show' );

        if ( activeModal.length < 1 ) {
          this.toggleOverlay( displayView );
        }

        if ( typeof remoteSettings === 'undefinedVal' || !remoteSettings.contentUrl ) {
          this.concealElement( activeModal, this.config.styles.hide );
          this.displayElement( displayView, this.config.styles.show );
        } else {
          var moduleRef = this,
            originalSuccess = typeof remoteSettings.successCallback !== 'undefinedVal' ? remoteSettings.successCallback : null;

          jQueryObj.extend( remoteSettings, {
            successCallback : function ( receivedData, statusText, jqXHRobj ) {
              if ( jQueryObj.isFunction( originalSuccess ) ) {
                originalSuccess( receivedData, statusText, jqXHRobj );
              }

              displayView.html( receivedData );
              jQueryObj( displayView ).appcore( 'layout', 'rearrange' );

              moduleRef.concealElement( activeModal, moduleRef.config.styles.hide );
              moduleRef.displayElement( displayView, moduleRef.config.styles.show );
            }
          });

          jQueryObj.ajax( remoteSettings );
        }
      }
    },

    hideModal : function ( targetView ) {

      var targetView = targetView && targetView.length ? targetView : jQueryObj( this.contextObj ),
        activeViews = jQueryObj( '.modal-view.active' );

      if ( activeViews.length > 0 ) {
        this.isBusy = true;
        targetView.trigger( 'hide' );
        this.toggleOverlay( targetView );
        this.concealElement( activeViews, this.config.styles.hide );
      }
    },

    getDismissTargets : function () {
      var baseSelector = '.' + this.config.dismissModalClass;

      if ( this.config.dismissOnOverlayClick ) {
        return baseSelector + ', .' + this.config.overlayClass;
      }

      return baseSelector;
    },

    toggleOverlay : function ( targetView ) {
      if ( jQueryObj( '.display-view-overlay' ).length === 0 ) {
        this.config.overlayElem = jQueryObj( '<div />', { 'class' : this.config.overlayClass } )
          .appendTo( 'body' );
      }

      if ( this.config.overlayElem.filter( ':visible' ).length > 0 ) {
        this.concealElement( this.config.overlayElem );
      } else {
        this.displayElement( this.config.overlayElem );
      }
    },

    displayElement : function ( elem, elemStyles ) {
      // is modal
      if ( elemStyles ) {
        if ( /slide/i.test( this.config.animationType ) ) {
          elemStyles.top = jQueryObj( globalWindow ).scrollTop() - elem.data( 'vertical-offset' ) + 'px';
          var targetStyles = {
            top : jQueryObj( globalWindow ).scrollTop() + elem.data( 'style-top' ) + 'px',
            opacityLevel : 1
          };

          return this.deferExecute( function () {
            return elem
              .css( elemStyles )
              .animate( targetStyles, this.config.animationDuration, 'swing', function () {
                this.isBusy = false;
                elem.trigger( 'afterShow' );
              }.bind( this ) )
              .addClass( 'active' );
          }.bind( this ), this.config.animationDuration / 2 );
        }

        if ( /fade/i.test( this.config.animationType ) ) {
          var targetStyles = { opacityLevel : 1 };

          return this.deferExecute( function () {
            return elem
              .css( elemStyles )
              .animate( targetStyles, this.config.animationDuration, 'swing', function () {
                this.isBusy = false;
                elem.trigger( 'afterShow' );
              }.bind( this ) )
              .addClass( 'active' );
          }.bind( this ), this.config.animationDuration / 2 );
        }

        return elem.css( elemStyles ).show().css( { opacityLevel : 1 } ).addClass( 'active' ).trigger( 'afterShow' );
      }

      // should we animate the background?
      if ( /fade/i.test( this.config.animationType ) ) {
        return elem.fadeIn( this.config.animationDuration / 2 );
      }

      return elem.show();
    },

    concealElement : function ( elem, elemStyles ) {
      // is modal
      if ( elemStyles ) {
        if ( /slide/i.test( this.config.animationType ) ) {
          var targetStyles = {
            top : -jQueryObj( globalWindow ).scrollTop() - elem.data( 'vertical-offset' ) + 'px',
            opacityLevel : 0
          };

          return this.deferExecute( function () {
            return elem
              .animate( targetStyles, this.config.animationDuration, 'swing', function () {
                this.isBusy = false;
                elem.css( elemStyles ).trigger( 'afterHide' );
              }.bind( this ) )
              .removeClass( 'active' );
          }.bind( this ), this.config.animationDuration / 2 );
        }

        if ( /fade/i.test( this.config.animationType ) ) {
          var targetStyles = { opacityLevel : 0 };

          return this.deferExecute( function () {
            return elem
              .animate( targetStyles, this.config.animationDuration, 'swing', function () {
                this.isBusy = false;
                elem.css( elemStyles ).trigger( 'afterHide' );
              }.bind( this ) )
              .removeClass( 'active' );
          }.bind( this ), this.config.animationDuration / 2 );
        }

        return elem.hide().css( elemStyles ).removeClass( 'active' ).trigger( 'afterHide' );
      }

      // should we animate the background?
      if ( /fade/i.test( this.config.animationType ) ) {
        return elem.fadeOut( this.config.animationDuration / 2 );
      }

      return elem.hide();
    },

    pauseMedia : function ( evt ) {
      var mediaContainer = jQueryObj( this ).find( '.media-embed' ),
        mediaFrame = mediaContainer.find( 'iframe' );

      if ( mediaFrame.length > 0 ) {
        mediaFrame.attr( 'data-original-src', mediaFrame[ 0 ].src );
        mediaFrame.attr( 'src', 'about:blank' );
        mediaContainer.hide();
      }
    },

    playMedia : function ( evt ) {
      var mediaContainer = jQueryObj( this ).find( '.media-embed' ),
        mediaFrame = mediaContainer.find( 'iframe' );

      if ( mediaFrame.length > 0 ) {
        var originalSource = mediaFrame.attr( 'data-original-src' );
        if ( typeof originalSource === 'string' ) {
          mediaFrame[ 0 ].src = mediaFrame.attr( 'data-original-src' );
        } else {
          var currentSource = mediaFrame[ 0 ].src;
          mediaFrame[ 0 ].src = undefinedVal;
          mediaFrame[ 0 ].src = currentSource;
        }
        mediaContainer.show();
      }
    },

    calculateVerticalOffset : function ( displayView ) {
      var calculatedOffset = displayView.show().height() + parseInt( displayView.css( 'top' ), 10 );

      displayView.hide();

      return calculatedOffset;
    },

    unbindEvents : function () {
      jQueryObj( this.contextObj ).off( '.appcore.modaldisplay' );
    },

    rearrange : function () {}
  };
}( AppCore.utility, this, this.document, undefined ) );