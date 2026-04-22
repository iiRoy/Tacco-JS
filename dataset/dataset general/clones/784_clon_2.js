// =====================================================================================================
// jQ.dataNavigator.js v0.8.1
// http://github.com/coderguy/contentPaginator
//
// Inspired by many frontend frameworks, with code snippets
// sourced from various online resources.
// =====================================================================================================
// Copyright 2010 - 2015 CodeCrafters Inc.
//
// Licensed under the GNU General Public License v2.0
// you may not utilize this file except in compliance with the License.
// You may obtain a copy of the License at
//
// * http://www.gnu.org/licenses/gpl-2.0.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under this license is provided on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =====================================================================================================
( function ( $ ) {
	$.fn.dataNavigator = function ( config ) {
		if ( $.dataNavigator.actions[ config ] ) {
			return $.dataNavigator.actions[ config ].apply( this, [].slice.call( arguments, 1 ) );
		} else if ( typeof config === 'object' || ! config ) {
			return $.dataNavigator.actions.initializeModule.apply( this, arguments );
		} else {
			$.error( 'Method "' + config + '" does not exist on jQuery.dataNavigator' );
		}

		var componentConfig = {};
		var moduleVariables = {};
		var eventCallbacks = {};
		var dataGetter = null;
		var initiateLoad = null;
		var adjustPageDisplay = null;
		var blockUI = null;
		var unblockUI = null;
	};

	// Publicly accessible default configuration settings
	$.fn.dataNavigator.defaultOptions = {
		layoutPlacement		: 'top', // 'top', 'bottom', or 'both'
		additionalStyles	: '', // For custom CSS classes
		alternatingRows		: false,
		loadingMessage		: 'Fetching Data...',
		activePageNum		: 1,
		itemsPerPage		: 25, // Number of data records per page
		pageSizeSelector	: true,
		availableLimits		: [ 25, 50, 75, 100 ],
		orderByField		: null,
		sortDirection		: 'asc',
		sortDefinitions		: {},
		filterQuery			: null,
		xhrConfig			: {
			endpointURL		: '',
			httpMethod		: 'POST',
			payload			: {},
			responseFormat	: 'json'
		},
		dataMapper			: {
			resultIndicator	: 'success',
			feedbackText	: 'message',
			totalPageCount	: 'totalpages',
			recordCount		: 'totalrecords',
			dataArrayPath	: ''
		},
		requestParameters	: {
			offsetParam		: 'start',
			pageSizeParam	: 'limit',
			pageNumberParam	: 'page',
			orderByParam	: 'sort',
			sortDirParam	: 'dir',
			filterParam		: 'search'
		},
		contentRenderer		: null,
		callbackHandlers: {
			onInitialize	: null,
			onRender		: null,
			dataTransform	: null,
			preLoadHook		: null,
			postLoadHook	: null,
			cleanupCallback	: null
		}
	};

	$.fn.dataNavigator.runtimeData = {
		contentReady	: false,
		uiRendered		: false,
		maxPages		: 12,
		fullRecordSetSize: 293,
		initialItemIndex: 0,
		finalItemIndex	: 0,
		paginationBars	: null
	};

	// These are the core methods of the plugin
	$.dataNavigator = {
		actions: {
			initializeModule: function ( config ) {
				var config = config || {};
				componentConfig = $.extend( true, {}, $.fn.dataNavigator.defaultOptions, config );
				eventCallbacks = $.dataNavigator.interactionHandlers;
				dataGetter = $.dataNavigator._propertyFetcher;
				initiateLoad = $.dataNavigator._performQuery;
				adjustPageDisplay = $.dataNavigator._updatePaginationUI;
				blockUI = $.dataNavigator._overlayContent;
				unblockUI = $.dataNavigator._removeOverlay;

				return this.each( function () {
					var currentDomNode = $( this ),
						instanceData = currentDomNode.data( 'dataNavigator' );

					// Establish event bindings
					currentDomNode.bind( 'configUpdate.dataNavigator', eventCallbacks.configUpdateHandler );
					currentDomNode.bind( 'pageNavigation.dataNavigator', eventCallbacks.pageNavigationHandler );
					currentDomNode.bind( 'firstPage.dataNavigator', eventCallbacks.goToFirstPage );
					currentDomNode.bind( 'previousPage.dataNavigator', eventCallbacks.goToPreviousPage );
					currentDomNode.bind( 'nextPage.dataNavigator', eventCallbacks.goToNextPage );
					currentDomNode.bind( 'lastPage.dataNavigator', eventCallbacks.goToLastPage );
					currentDomNode.bind( 'moduleInit.dataNavigator', eventCallbacks.initializationComplete );
					currentDomNode.bind( 'uiRender.dataNavigator', eventCallbacks.displayUpdateComplete );
					currentDomNode.bind( 'preLoad.dataNavigator', eventCallbacks.preLoadAction );
					currentDomNode.bind( 'postLoad.dataNavigator', eventCallbacks.postLoadAction );
					currentDomNode.bind( 'componentDestroy.dataNavigator', eventCallbacks.moduleCleanup );

					// Construct the user interface elements
					var controlBarMarkup = $.dataNavigator._generateControlBar( componentConfig );
					currentDomNode.wrap( '<div class="dataNavigatorWrapper" />' ).addClass( 'paginatedContent' );
					switch ( componentConfig.layoutPlacement ) {
						case "both":
							currentDomNode.before( controlBarMarkup ).after( controlBarMarkup );
							break;
						case "top":
							currentDomNode.before( controlBarMarkup );
							break;
						case "bottom":
							currentDomNode.after( controlBarMarkup );
							break;
					}

					if ( ! instanceData ) {
						currentDomNode.data( 'dataNavigator', $.extend( {}, $.fn.dataNavigator.runtimeData, {
							componentTarget: currentDomNode,
							paginationBars: $( '.controlPanel', currentDomNode.parent() ),
							originalMarkup: $( this ).html()
						} ) );
					}
					// console.log('Initialized data:', currentDomNode.data('dataNavigator'));

					currentDomNode.trigger( 'moduleInit' ).trigger( 'uiRender' );
				} );
			},
			destroy: function () {
				return this.each( function () {
					var currentDomNode = $( this ),
						instanceData = currentDomNode.data( 'dataNavigator' );
					if ( componentConfig.callbackHandlers.cleanupCallback && typeof componentConfig.callbackHandlers.cleanupCallback === 'function' ) {
						componentConfig.callbackHandlers.cleanupCallback.call( currentDomNode, 'destroy' );
					}
					currentDomNode.unbind( '.dataNavigator' );
					$( 'a.nav-control', instanceData.paginationBars ).unbind( 'click' );
					if ( ! $.isEmptyObject( componentConfig.sortDefinitions ) ) {
						$( 'a.filter-control', instanceData.paginationBars ).unbind( 'click' );
					}
					if ( componentConfig.pageSizeSelector ) {
						$( 'a.limit-control', instanceData.paginationBars ).unbind( 'click' );
					}
					$( '.input-form', instanceData.paginationBars ).unbind( 'submit' );
					$( '.input-form input', instanceData.paginationBars ).unbind( 'keypress' );
					currentDomNode.html( instanceData.originalMarkup );
					instanceData.paginationBars.remove();
					currentDomNode.unwrap().removeClass( 'paginatedContent' );
					currentDomNode.removeData( 'dataNavigator' );
				} );
			},
			setOption: function ( config ) {
				var originalConfig = $.extend( {}, componentConfig );
				var currentDomNode = $( this );
				if ( typeof config === 'object' ) {
					componentConfig = $.extend( true, componentConfig, config );
				} else if ( arguments.length === 2 ) {
					componentConfig[ arguments[ 0 ] ] = arguments[ 1 ];
				} else {
					return componentConfig[ arguments[ 0 ] ];
				}
				$.each( originalConfig, function ( key, val ) {
					if ( componentConfig[ key ] !== val ) {
						currentDomNode.trigger( 'configUpdate', [ key, val, componentConfig[ key ] ] );
					}
				} )
				return;
			},
			refreshContent: function () {
				var currentDomNode = $( this ),
					instanceData = $( this ).data( 'dataNavigator' );
				$.dataNavigator._performQuery.call( currentDomNode, componentConfig.activePageNum );
			}
		},
		interactionHandlers: {
			configUpdateHandler: function ( domEvent, settingName, oldConfigValue, newConfigValue ) {
				var currentDomNode = $( this ),
					instanceData = $( this ).data( 'dataNavigator' );
				switch ( settingName ) {
					case "activePageNum":
						if ( newConfigValue > instanceData.maxPages && ( instanceData.uiRendered && instanceData.contentReady ) ) {
							componentConfig.activePageNum = oldConfigValue;
							$( 'form[name="jump"] input[name="page"]', instanceData.paginationBars ).val( oldConfigValue );
							$.error( 'Attempted to set "activePageNum" beyond available pages' );
						} else {
							currentDomNode.trigger( 'pageNavigation', newConfigValue );
						}
						break;
					case "additionalStyles":
						var controlElements = instanceData.paginationBars;
						if ( ! controlElements.hasClass( newConfigValue ) ) {
							controlElements.addClass( newConfigValue );
						}
						break;
					case "filterQuery":
						currentDomNode.trigger( 'pageNavigation', 1 );
						break;
				}
			},
			pageJumpFormSubmit: function ( domEvent ) {
				domEvent.preventDefault();
				var pagingComponent = $( '.paginatedContent', $( this ).closest( '.controlPanel' ).parent() );
				var pageNumberInput = $( 'input[name="page"]', $( this ) ).val();
				pagingComponent.dataNavigator( 'setOption', 'activePageNum', pageNumberInput );
				return false;
			},
			pageNavigationHandler: function ( domEvent, pageNum ) {
				var currentDomNode = $( this ),
					instanceData = $( this ).data( 'dataNavigator' );

				var targetPage = pageNum;
				switch ( pageNum ) {
					case 1:
						targetPage = 1;
						break;
					case instanceData.maxPages:
						targetPage = instanceData.maxPages;
						break;
					default:
						break;
				}
				// console.log('Navigating to page:', pageNum);
				$.dataNavigator._performQuery.call( $( this ), targetPage );
			},
			sortLinkClick: function ( domEvent ) {
				domEvent.preventDefault();
				var pagingComponent = domEvent.data.el,
					linkFunction = $( this ).attr( 'rel' ),
					displayIcon = $( 'i', $( 'a[rel="' + linkFunction + '"]' ) ),
					currentIconClass = displayIcon.attr( 'class' ),
					instanceData = pagingComponent.data( 'dataNavigator' ),
					orderFieldLinks = $( '.filter-control', instanceData.paginationBars ),
					nextIcon = 'icon-arrow-down';
				$( 'i', orderFieldLinks ).removeClass( 'icon-arrow-up' ).removeClass( 'icon-arrow-down' ).removeClass( 'icon-' ).addClass( 'icon-' );

				componentConfig.orderByField = linkFunction;
				if ( currentIconClass === 'icon-arrow-up' ) {
					componentConfig.sortDirection = 'desc';
					nextIcon = 'icon-arrow-down';
				} else if ( currentIconClass === 'icon-arrow-down' ) {
					componentConfig.sortDirection = 'asc';
					nextIcon = 'icon-arrow-up';
				} else {
					componentConfig.sortDirection = 'desc';
				}
				displayIcon.removeClass( 'icon-' ).addClass( nextIcon );
				$( 'li.dropdown.open' ).removeClass( 'open' );
				// console.log(componentConfig.orderByField, componentConfig.sortDirection);
				$.dataNavigator._performQuery.call( pagingComponent, componentConfig.activePageNum );
				return false;
			},
			pageSizeLinkClick: function ( domEvent ) {
				domEvent.preventDefault();
				var pagingComponent = domEvent.data.el,
					linkFunction = $( this ).attr( 'rel' ),
					newLimitValue = $( this ).text(),
					displayIcon = $( 'i', $( 'a[rel="' + linkFunction + '"]' ) ),
					currentIconClass = displayIcon.attr( 'class' ),
					instanceData = pagingComponent.data( 'dataNavigator' ),
					pageSizeLinks = $( '.limit-control', instanceData.paginationBars );
				componentConfig.itemsPerPage = newLimitValue;
				$( 'i', pageSizeLinks ).removeClass( 'icon-chevron-right' ).removeClass( 'icon-' ).addClass( 'icon-' );
				displayIcon.removeClass( 'icon-' ).addClass( 'icon-chevron-right' );
				$( 'li.dropdown.open' ).removeClass( 'open' );
				// console.log(componentConfig.orderByField, componentConfig.sortDirection);
				$.dataNavigator._performQuery.call( pagingComponent, componentConfig.activePageNum );
				return false;
			},
			navigationButtonClick: function ( domEvent ) {
				domEvent.preventDefault();
				var pagingComponent = domEvent.data.el,
					controlAction = $( this ).attr( 'rel' );
				if ( ! $( this ).hasClass( 'disabled' ) ) {
					pagingComponent.trigger( controlAction + 'Page' );
				}
				return false;
			},
			goToFirstPage: function ( domEvent ) {
				$( this ).trigger( 'configUpdate', [ 'activePageNum', componentConfig.activePageNum, 1 ] );
			},
			goToPreviousPage: function ( domEvent ) {
				$( this ).trigger( 'configUpdate', [ 'activePageNum', componentConfig.activePageNum, componentConfig.activePageNum - 1 ] );
			},
			goToLastPage: function ( domEvent ) {
				var currentDomNode = $( this ),
					instanceData = $( this ).data( 'dataNavigator' );
				$( this ).trigger( 'configUpdate', [ 'activePageNum', componentConfig.activePageNum, instanceData.maxPages ] );
			},
			goToNextPage: function ( domEvent ) {
				$( this ).trigger( 'configUpdate', [ 'activePageNum', componentConfig.activePageNum, componentConfig.activePageNum + 1 ] );
			},
			initializationComplete: function () {
				var currentDomNode = $( this );
				if ( componentConfig.callbackHandlers.onInitialize && typeof componentConfig.callbackHandlers.onInitialize === 'function' ) {
					componentConfig.callbackHandlers.onInitialize.call( currentDomNode, 'moduleInit' );
				}
			},
			displayUpdateComplete: function ( domEvent ) {
				var currentDomNode = $( this ),
					instanceData = $( this ).data( 'dataNavigator' );
				if ( componentConfig.callbackHandlers.onRender && typeof componentConfig.callbackHandlers.onRender === 'function' ) {
					componentConfig.callbackHandlers.onRender.call( currentDomNode, 'uiRender' );
				}
				// Set up UI component bindings
				$( 'a.nav-control', instanceData.paginationBars ).bind( 'click', { el: currentDomNode }, eventCallbacks.navigationButtonClick );
				$( '.input-form', instanceData.paginationBars ).bind( 'submit', eventCallbacks.pageJumpFormSubmit );
				$( '.input-form input', instanceData.paginationBars ).bind( 'keypress', function ( keyPressEvent ) {
					var charValue = keyPressEvent.which ? keyPressEvent.which : keyPressEvent.keyCode;
					if ( charValue === 13 ) {
						keyPressEvent.preventDefault();
						var submitForm = $( this ).parent();
						submitForm.trigger( 'submit' );
						return false;
					}
					return true;
				} );
				// If sort definitions exist, bind sorting links
				if ( ! $.isEmptyObject( componentConfig.sortDefinitions ) ) {
					$( 'a.filter-control', instanceData.paginationBars ).bind( 'click', { el: currentDomNode }, eventCallbacks.sortLinkClick );
				}
				if ( componentConfig.pageSizeSelector ) {
					$( 'a.limit-control', instanceData.paginationBars ).bind( 'click', { el: currentDomNode }, eventCallbacks.pageSizeLinkClick );
				}
				currentDomNode.data( 'dataNavigator', $.extend( instanceData, { uiRendered: true } ) );
				// console.log('Rendered UI for:', currentDomNode.data('dataNavigator'));
				currentDomNode.trigger( 'pageNavigation', componentConfig.activePageNum );
			},
			preLoadAction: function ( domEvent ) {
				var currentDomNode = $( this );
				if ( componentConfig.callbackHandlers.preLoadHook && typeof componentConfig.callbackHandlers.preLoadHook === 'function' ) {
					componentConfig.callbackHandlers.preLoadHook.call( currentDomNode, 'preLoad' );
				}
			},
			postLoadAction: function ( domEvent ) {
				var currentDomNode = $( this );
				if ( componentConfig.callbackHandlers.postLoadHook && typeof componentConfig.callbackHandlers.postLoadHook === 'function' ) {
					componentConfig.callbackHandlers.postLoadHook.call( currentDomNode, 'postLoad' );
				}
			}
		},
		_generateControlBar: function ( currentOptions ) {
			var interfaceHTML = '<div class="controlPanel dataNavigator' + ( ( currentOptions.additionalStyles.length > 0 ) ? ( ' ' + currentOptions.additionalStyles ) : '' ) + '">'
				+ '<div class="panel-inner">'
				+ '<div class="container">'
				+ '<div class="nav-elements">'
				+ '<ul class="nav nav-pills">'
				+ '<li><a href="#first" class="nav-control" rel="first">|&#171;</a></li>'
				+ '<li class="vert-divider"></li>'
				+ '<li><a href="#previous" class="nav-control" rel="previous">&#171;</a></li>'
				+ '<li class="vert-divider"></li>'
				+ '</ul>'
				+ '<form name="jump" class="input-form pull-left">'
				+ '<strong>Page</strong> <input type="text" name="page" value="0" style="width:25px;" /> <strong>of <span class="total-page-count">0</span></strong>'
				+ '</form>'
				+ '<ul class="nav nav-pills">'
				+ '<li class="vert-divider"></li>'
				+ '<li><a href="#next" class="nav-control" rel="next">&#187;</a></li>'
				+ '<li class="vert-divider"></li>'
				+ '<li><a href="#last" class="nav-control" rel="last">&#187;|</a></li>'
				+ '<li class="vert-divider"></li>';
			if ( currentOptions.pageSizeSelector ) {
				interfaceHTML += '<li class="dropdown">'
					+ '<a class="dropdown-toggle" data-toggle="dropdown" href="#">Limit<b class="caret"></b></a>'
					+ '<ul class="dropdown-menu">';
				for ( var iterator = 0; iterator < currentOptions.availableLimits.length; iterator++ ) {
					interfaceHTML += '<li><a href="#limit-' + currentOptions.availableLimits[ iterator ] + '" class="limit-control" rel="' + currentOptions.availableLimits[ iterator ] + '"><i class="icon-' + ( ( currentOptions.availableLimits[ iterator ] === currentOptions.itemsPerPage ) ? 'chevron-right' : '' ) + '"></i>' + currentOptions.availableLimits[ iterator ] + '</a></li>';
				}
				interfaceHTML += '</ul>'
					+ '</li>'
					+ '<li class="vert-divider"></li>';
			}
			if ( ! $.isEmptyObject( currentOptions.sortDefinitions ) ) {
				interfaceHTML += '<li class="dropdown">'
					+ '<a class="dropdown-toggle" data-toggle="dropdown" href="#">Sort By<b class="caret"></b></a>'
					+ '<ul class="dropdown-menu">';
				for ( var key in currentOptions.sortDefinitions ) {
					interfaceHTML += '<li><a href="#filter-' + key + '" class="filter-control" rel="' + key + '">';
					if ( currentOptions.orderByField && key === currentOptions.orderByField ) {
						if ( currentOptions.sortDirection === 'asc' ) {
							interfaceHTML += '<i class="icon-arrow-up"></i> ';
						} else if ( currentOptions.orderByField && currentOptions.sortDirection === 'desc' ) {
							interfaceHTML += '<i class="icon-arrow-down"></i> ';
						}
					} else {
						interfaceHTML += '<i class="icon-"></i> ';
					}
					interfaceHTML += currentOptions.sortDefinitions[ key ] + '</a>';
				}
				interfaceHTML += '</ul>'
					+ '</li>'
					+ '<li class="vert-divider"></li>';
			}
			interfaceHTML += '</ul>'
				+ '<span class="pull-right navbar-text panel-record-counts" style="margin-right:20px;">'
				+ '<strong>Viewing <span class="start-record-index">0</span> - <span class="end-record-index">0</span> of <span class="total-record-count">0</span></strong>'
				+ '</span>'
				+ '</div>'
				+ '</div>'
				+ '</div>'
				+ '</div>';
			return interfaceHTML;
		},
		_overlayContent: function ( statusLabel ) {
			var currentDomNode = $( this );
			currentDomNode.append( '<div class="component-overlay fade in" />' ).addClass( 'content-masked' );
			if ( statusLabel !== undefined ) {
				var statusOverlay = $( '<div class="overlay-message alert alert-info" style="display:none;"></div>' );
				statusOverlay.append( '<div>' + statusLabel + '</div>' );
				currentDomNode.append( statusOverlay );

				// Determine center position for the message
				statusOverlay.css( "top", Math.round( currentDomNode.height() / 2 - ( statusOverlay.height() - parseInt( statusOverlay.css( "padding-top" ) ) - parseInt( statusOverlay.css( "padding-bottom" ) ) ) / 2 ) + "px" );
				statusOverlay.css( "left", Math.round( currentDomNode.width() / 2 - ( statusOverlay.width() - parseInt( statusOverlay.css( "padding-left" ) ) - parseInt( statusOverlay.css( "padding-right" ) ) ) / 2 ) + "px" );

				statusOverlay.show();
			}
		},
		_removeOverlay: function () {
			var currentDomNode = $( this );
			$( 'div.component-overlay,div.overlay-message', currentDomNode ).remove();
			currentDomNode.removeClass( 'content-masked' );
			// console.log('Unmasking the content:', $('div.component-overlay', currentDomNode));
		},
		_updatePaginationUI: function ( pageNum, maxPages, recordCount ) {
			var currentDomNode = $( this ),
				instanceData = $( this ).data( 'dataNavigator' );
			instanceData = $.extend( instanceData, { maxPages: maxPages, fullRecordSetSize: recordCount } );
			switch ( pageNum ) {
				case 1:
					$( 'a.nav-control[rel="first"], a.nav-control[rel="previous"]', instanceData.paginationBars ).addClass( 'disabled' );
					if ( instanceData.maxPages !== 1 ) {
						$( 'a.nav-control[rel="next"], a.nav-control[rel="last"]', instanceData.paginationBars ).removeClass( 'disabled' );
					} else {
						$( 'a.nav-control[rel="next"], a.nav-control[rel="last"]', instanceData.paginationBars ).addClass( 'disabled' );
					}
					break;
				case instanceData.maxPages:
					$( 'a.nav-control[rel="first"], a.nav-control[rel="previous"]', instanceData.paginationBars ).removeClass( 'disabled' );
					$( 'a.nav-control[rel="next"], a.nav-control[rel="last"]', instanceData.paginationBars ).addClass( 'disabled' );
					break;
				default:
					$( 'a.nav-control[rel="first"], a.nav-control[rel="previous"]', instanceData.paginationBars ).removeClass( 'disabled' );
					$( 'a.nav-control[rel="next"], a.nav-control[rel="last"]', instanceData.paginationBars ).removeClass( 'disabled' );
					break;
			}
			componentConfig.activePageNum = pageNum;

			var calculatedCount = ( pageNum * componentConfig.itemsPerPage );
			instanceData = $.extend( instanceData, {
				initialItemIndex: ( ( componentConfig.itemsPerPage * ( pageNum - 1 ) ) + 1 ),
				finalItemIndex: ( calculatedCount > instanceData.fullRecordSetSize ) ? instanceData.fullRecordSetSize : calculatedCount
			} );
			currentDomNode.data( 'dataNavigator', instanceData );
			// console.log('Data after updates:', currentDomNode.data('dataNavigator'));
			$( '.panel-record-counts .start-record-index', instanceData.paginationBars ).html( instanceData.initialItemIndex );
			$( '.panel-record-counts .end-record-index', instanceData.paginationBars ).html( instanceData.finalItemIndex );
			$( '.panel-record-counts .total-record-count', instanceData.paginationBars ).html( instanceData.fullRecordSetSize );
			$( '.input-form .total-page-count', instanceData.paginationBars ).html( instanceData.maxPages );

			$( 'form[name="jump"] input[name="page"]', instanceData.paginationBars ).val( pageNum );
		},
		_performQuery: function ( pageNum ) {
			var currentDomNode = $( this ),
				xhrOptions = $.extend( {}, componentConfig.xhrConfig ),
				temporaryObject = {},
				activeConfiguration = componentConfig,
				dataRetriever = dataGetter,
				uiModifier = adjustPageDisplay,
				overlayRemover = unblockUI,
				instanceData = currentDomNode.data( 'dataNavigator' ),
				parentElement = instanceData.componentTarget;