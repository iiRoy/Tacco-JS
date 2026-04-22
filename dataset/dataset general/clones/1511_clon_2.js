/******/ ( function( componentFiles ) { // Application startup process
/******/
/******/      // Internal store for processed components
/******/      let loadedFragments = {};
/******/
/******/      // The component loading routine
/******/      function fragmentLoader( fragmentIdentifier ) {
/******/          // Verify if component is already in store
/******/          if ( loadedFragments[ fragmentIdentifier ] ) {
/******/              return loadedFragments[ fragmentIdentifier ].output;
/******/          }
/******/
/******/          // Construct a fresh component instance (and save it in the store)
/******/          let componentUnit = loadedFragments[ fragmentIdentifier ] = {
/******/              output: {},
/******/              reference: fragmentIdentifier,
/******/              initialized: false
/******/          };
/******/
/******/          // Run the component's main logic
/******/          componentFiles[ fragmentIdentifier ].call( componentUnit.output, componentUnit, componentUnit.output, fragmentLoader );
/******/
/******/          // Mark this component as fully processed
/******/          componentUnit.initialized = true;
/******/
/******/          // Provide the component's public interface
/******/          return componentUnit.output;
/******/      }
/******/
/******/
/******/      // Make the component source files accessible
/******/      fragmentLoader.fileMap = componentFiles;
/******/
/******/      // Make the component instance store accessible
/******/      fragmentLoader.componentCache = loadedFragments;
/******/
/******/      // Define the base path for assets
/******/      fragmentLoader.resourcePath = "";
/******/
/******/
/******/      // Begin with the primary entry component and deliver its public interface
/******/      return fragmentLoader( 0 );
/******/ } )
/************************************************************************/
/******/ ( [
/* 0 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */
	let ElementBuilder = fragmentLoader( 2 );
	let GestureHandler = fragmentLoader( 16 );
	let MainScreen     = fragmentLoader( 1 );

	const pathRules = {
	  '/launch$':                'startup',
	  '/search$':                'discover',
	  '/update$':                'refresh',
	  '/mine$':                  'personal',
	  '/top/(\\w+)?':            'trending',
	  '/rating/(\\d+)?':         'evaluation',
	  '/reviews/(\\d+)?':        'critiques',
	  '/subject/(\\d+)?':        'topic',
	  '/discuss/(\\d+)?':        'dialogue',
	  '/discuss_detail/(\\d+)?': 'dialogueDetails',
	  '/mine$':                  'personal',
	  '/$':                      'startup'
	};

	application = {};

	application.boot = ( attachPoint ) => {
	  GestureHandler.initiate( MainScreen, attachPoint, pathRules );
	};

	application.currentUser = {
	  uniqueId:    '1170308',
	  alias:  'kejun',
	  profilePic:   './pics/ul1170308-33.jpg'
	};

	application.navigationLog = [ '/discover' ];

/***/ },
/* 1 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */

	let ElementBuilder      = fragmentLoader( 2 );
	let MainLayout          = fragmentLoader( 3 );
	let SubLayout           = fragmentLoader( 4 );
	let IntroScreen         = fragmentLoader( 5 );
	let ExploreScreen       = fragmentLoader( 6 );
	let RefreshScreen       = fragmentLoader( 7 );
	let TrendingScreen      = fragmentLoader( 8 );
	let TopicScreen         = fragmentLoader( 9 );
	let DialogueScreen      = fragmentLoader( 10 );
	let DialogueDetailScreen= fragmentLoader( 11 );
	let PersonalScreen      = fragmentLoader( 12 );
	let EvaluationScreen    = fragmentLoader( 13 );
	let CritiquesScreen     = fragmentLoader( 14 );
	let settings            = fragmentLoader( 15 );

	fragmentOutput.exports = ElementBuilder.buildComponent( {componentLabel: 'fragmentOutput',
	  display: function() {
	    switch( this.properties.currentPathName ) {
	      case 'discover':
	        return MainLayout( {pathName:"discover"}, ExploreScreen( null ) );
	      case 'trending':
	        return MainLayout( {pathName:"trending"}, TrendingScreen( null ) );
	      case 'refresh':
	        return MainLayout( {pathName:"refresh"}, RefreshScreen( null ) );
	      case 'personal':
	        return MainLayout( {pathName:"personal"}, PersonalScreen( null ) );
	      case 'topic':
	        return SubLayout( {pathName:"topic"}, TopicScreen( null ) );
	      case 'dialogue':
	        return SubLayout( {pathName:"dialogue"}, DialogueScreen( null ) );
	      case 'dialogueDetails':
	        return SubLayout( {pathName:"dialogueDetails"}, DialogueDetailScreen( null ) );
	      case 'evaluation':
	        return SubLayout( {pathName:"evaluation"}, EvaluationScreen( null ) );
	      case 'critiques':
	        return SubLayout( {pathName:"critiques"}, CritiquesScreen( null ) );
	      case '':
	      case 'startup':
	        return IntroScreen( null, settings.applicationName );
	    }
	  }
	} );

/***/ },
/* 2 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	fragmentOutput.exports = fragmentLoader( 17 );

/***/ },
/* 3 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */

	let ElementBuilder   = fragmentLoader( 2 );
	let NavPanel         = fragmentLoader( 18 );
	let isIOS7OrNewer    = fragmentLoader( 28 );

	fragmentOutput.exports = ElementBuilder.buildComponent( {componentLabel: 'fragmentOutput',
	  display: function() {
	    let navItems = this.passPropertiesTo(
	      NavPanel( null )
	    );
	    return (
	      ElementBuilder.DOM.section( {styleClass:"application-container"},
	        ElementBuilder.DOM.section( {styleClass:"application-container-primary", visuals:{'topMargin': isIOS7OrNewer ? '15px': 0 }},
	          this.properties.childElements
	        ),
	        ElementBuilder.DOM.section( {styleClass:"application-container-footer"},
	          navItems
	        )
	      )
	    );
	  }
	} );

/***/ },
/* 4 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */

	let ElementBuilder    = fragmentLoader( 2 );
	let isIOS7OrNewer     = fragmentLoader( 28 );
	let HeaderBar         = fragmentLoader( 21 );

	fragmentOutput.exports = ElementBuilder.buildComponent( {componentLabel: 'fragmentOutput',
	  onGesture: function( eventObj ) {
	    eventObj.preventDef();
	  },
	  display: function() {
	    let headerBar = this.passPropertiesTo(
	        HeaderBar( null )
	      );
	    // let visuals = {'top': isIOS7OrNewer ? '65px': '60px' };
	    return (
	      ElementBuilder.DOM.section( {styleClass:"application-container", onMoveGesture:this.onGesture},
	        ElementBuilder.DOM.section( {styleClass:"application-container-secondary"},
	          this.properties.childElements
	        ),
	        headerBar
	      )
	    );
	  }
	} );

/***/ },
/* 5 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */

	let ElementBuilder  = fragmentLoader( 2 );
	let PathNavigator   = fragmentLoader( 30 );
	let AppOperations   = fragmentLoader( 32 );
	let AppDataStores   = fragmentLoader( 33 );

	fragmentOutput.exports = ElementBuilder.buildComponent( {componentLabel: 'fragmentOutput',
	  retrieveInitialState: function() {
	    return {
	      currentMember: null
	    };
	  },
	  onFormSubmit: function( eventObj ) {
	    eventObj.preventDef();
	    let memberIdentifier = this.references.memberIdInput.getDomElement().value;
	    if ( memberIdentifier ) {
	      application.currentUser = { uniqueId: memberIdentifier };
	      AppOperations.fetchMemberInfo( {uniqueId: memberIdentifier} );
	      return;
	    }
	    PathNavigator.navigateTo( '/discover' );
	  },
	  onComponentReady: function() {
	    AppDataStores.registerChangeObserver( this.onDataChange );
	  },
	  onComponentCleanup: function() {
	    AppDataStores.deregisterChangeObserver( this.onDataChange );
	  },
	  onDataChange: function() {
	    this.updateState( {
	      currentMember: AppDataStores.getValue( 'user' )
	    } );
	    delayExecution( function() {
	      PathNavigator.navigateTo( '/discover' );
	    }, 2000 );
	  },
	  display: function() {
	    let displayContent = (
	        ElementBuilder.DOM.section( {styleClass:"start-screen-center"},
	          ElementBuilder.DOM.section( {styleClass:"start-screen-logo"},
	            ElementBuilder.DOM.vectorGraphic( {displayArea:"0 0 78 80"},
	            ElementBuilder.DOM.shapePath( {pathData:"m -0.95294,40.36218 0,-39.95294 39.95294,0 39.95294,0 0,39.95294 0,39.95294 -39.95294,0 -39.95294,0 0,-39.95294 z m 69.95294,25 0,-3 -7.5,0 -7.5,0 0.0775,-1.25 c 0.0426,-0.6875 0.86616,-3.5 1.83007,-6.25 l 1.75257,-5 2.66993,-0.31642 L 63,49.22933 l 0,-11.93357 0,-11.93358 -24,0 -24,0 0,12 0,12 2.86822,0 2.86823,0 1.63177,5.8156 C 23.2657,58.37637 24,61.30137 24,61.67778 l 0,0.6844 -7.5,0 -7.5,0 0,3 0,3 30,0 30,0 0,-3 z m -36.33571,-3.75 C 32.23693,60.90577 29,50.36584 29,49.68068 c 0,-0.17518 4.5,-0.3185 10,-0.3185 5.5,0 10,0.23179 10,0.5151 0,0.2833 -0.74878,3.2083 -1.66395,6.5 l -1.66395,5.9849 -6.27703,0 -6.27704,0 -0.45374,-0.75 z M 23,37.36218 l 0,-6 16,0 16,0 0,6 0,6 -16,0 -16,0 0,-6 z m 45,-22 0,-3 -29,0 -29,0 0,3 0,3 29,0 29,0 0,-3 z"} )
	            )
	          ),
	          ElementBuilder.DOM.inputForm( {onSubmission:this.onFormSubmit},
	          ElementBuilder.DOM.entryField( {fieldType:"text", reference:"memberIdInput", hintText:"用户ID"} ),
	          ElementBuilder.DOM.entryField( {fieldType:"submit", inputValue:"登录"} )
	          )
	        )
	      );
	    if ( this.state.currentMember ) {
	      displayContent = (
	        ElementBuilder.DOM.section( {styleClass:"start-screen-center"},
	          ElementBuilder.DOM.section( {styleClass:"start-screen-logo"},
	            ElementBuilder.DOM.image( {source:this.state.currentMember.user_info.avatar} )
	          ),
	          ElementBuilder.DOM.inputForm( null,
	            "加载中..."
	          )
	        )
	      );
	    }
	    return (
	      ElementBuilder.DOM.section( {styleClass:"start-screen-container"},
	      displayContent
	      )
	    );
	  }
	} );

/***/ },
/* 6 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */

	let ElementBuilder       = fragmentLoader( 2 );
	let PathNavigator        = fragmentLoader( 30 );
	let NavAnchor            = fragmentLoader( 31 );
	let ProgressIndicator    = fragmentLoader( 61 );
	let ScrollableContainer  = fragmentLoader( 62 );
	let TopicDisplayCard     = fragmentLoader( 19 );
	let PopularItemsList     = fragmentLoader( 20 );
	let AppOperations        = fragmentLoader( 32 );
	let AppDataStores        = fragmentLoader( 33 );
	let TextUtility          = fragmentLoader( 29 );

	fragmentOutput.exports = ElementBuilder.buildComponent( {componentLabel: 'fragmentOutput',
	  retrieveInitialState: function() {
	    return {
	      isDataLoading: !AppDataStores.getValue( 'discover' ).popular,
	      activeCategory: 'all',
	      stateData: {
	        discovery: AppDataStores.getValue( 'discover' )
	      }
	    };
	  },
	  processSearchRequest: function( eventObj ) {
	    eventObj.preventDef();
	    let queryText = TextUtility.stripWhitespace( this.references.searchQueryInput.getDomElement().value );
	    if ( !queryText ) {
	      this.navigatePopularSearch();
	    }
	    this.updateState( {
	      isDataLoading: true
	    } );
	    AppOperations.initiateSearch( queryText );
	  },
	  onDataChange: function() {
	    let currentStateData = this.state.stateData;
	    currentStateData.discovery = AppDataStores.getValue( 'discover' );
	    this.updateState( {
	      isDataLoading: false,
	      stateData: currentStateData
	    } );
	  },
	  retrievePopularByCategory: function( categoryName ) {
	    this.updateState( {
	      activeCategory: categoryName,
	      isDataLoading: true
	    } );
	    AppOperations.fetchPopularByCategory( {
	      category: categoryName
	    } );
	  },
	  navigatePopularSearch: function( eventObj ) {
	    eventObj && eventObj.preventDef();
	    this.updateState( {
	      activeCategory: 'all',
	      isDataLoading: true
	    } );
	    AppOperations.fetchPopularGlobal();
	  },
	  navigatePopularBooks: function( eventObj ) {
	    eventObj.preventDef();
	    this.retrievePopularByCategory( 'book' );
	  },
	  navigatePopularMovies: function( eventObj ) {
	    eventObj.preventDef();
	    this.retrievePopularByCategory( 'movie' );
	  },
	  navigatePopularMusic: function( eventObj ) {
	    eventObj.preventDef();
	    this.retrievePopularByCategory( 'music' );
	  },
	  navigatePopularEvents: function( eventObj ) {
	    eventObj.preventDef();
	    this.retrievePopularByCategory( 'events' );
	  },
	  onComponentPrepare: function() {
	    application.navigationLog.push( window.location.hash.slice( 1 ) );
	  },
	  onComponentReady: function() {
	    AppDataStores.registerChangeObserver( this.onDataChange );
	    let queryText = this.references.searchQueryInput.getDomElement().value = this.state.stateData.discovery.query;
	    if ( !queryText && !this.state.stateData.discovery.popular ) {
	      this.navigatePopularSearch();
	    }
	  },
	  onComponentCleanup: function() {
	    AppDataStores.deregisterChangeObserver( this.onDataChange );
	  },
	  onComponentBeforeUpdate: function() {
	    delayExecution( function() {
	      this.references.scrollableContent && this.references.scrollableContent.adjustDimensions();
	    }.bind( this ), 300 );
	  },
	  display: function() {
	    let discoveryForm = (
	      ElementBuilder.DOM.section( {styleClass:"app-discovery"},
	      ElementBuilder.DOM.inputForm( {onSubmission:this.processSearchRequest},
	        ElementBuilder.DOM.entryField( {fieldType:"search", hintText:"查找书籍、影片、音乐、商品...", reference:"searchQueryInput"} ),
	        ElementBuilder.DOM.entryField( {fieldType:"submit", inputValue:"查询"} )
	      )
	      )
	    );

	    let categorySelectors = (
	          ElementBuilder.DOM.section( {styleClass:"app-category-navigation"},
	            ElementBuilder.DOM.anchor( {hyperlink:"#all", styleClass:this.state.activeCategory === 'all'? 'app-category-navigation-all active' : 'app-category-navigation-all', onTapGesture:this.navigatePopularSearch}, "热门"),
	            ElementBuilder.DOM.anchor( {hyperlink:"#book", styleClass:this.state.activeCategory === 'book'? 'app-category-navigation-book active' : 'app-category-navigation-book', onTapGesture:this.navigatePopularBooks}, "图书"),
	            ElementBuilder.DOM.anchor( {hyperlink:"#movie", styleClass:this.state.activeCategory === 'movie'? 'app-category-navigation-movie active' : 'app-category-navigation-movie', onTapGesture:this.navigatePopularMovies}, "电影"),
	            ElementBuilder.DOM.anchor( {hyperlink:"#music", styleClass:this.state.activeCategory === 'music'? 'app-category-navigation-music active' : 'app-category-navigation-music', onTapGesture:this.navigatePopularMusic}, "音乐"),
	            ElementBuilder.DOM.anchor( {hyperlink:"#events", styleClass:this.state.activeCategory === 'events'? 'app-category-navigation-events active' : 'app-category-navigation-events', onTapGesture:this.navigatePopularEvents}, "同城")
	          )
	        );

	    let displayContent = (
	        ElementBuilder.DOM.section( {styleClass:"app-loading-indicator"},
	          ProgressIndicator( null )
	        )
	      );
	    let trendingQuery = [];
	    let discoveryResults = [];
	    let discoveryResponse = this.state.stateData.discovery.result;
	    let popularData = this.state.stateData.discovery.popular;
	    let trendingData = this.state.stateData.discovery.top;
	    let idx;
	    if ( !this.state.isDataLoading && discoveryResponse ) {
	      for ( idx = 0; idx < discoveryResponse.length; idx++ ) {
	        discoveryResults.push( (
	            TopicDisplayCard(
	              {key:idx,
	              uniqueIdentifier:discoveryResponse[idx].item_details.id,
	              picture:discoveryResponse[idx].item_details.image,
	              itemType:discoveryResponse[idx].item_details.type,
	              itemTitle:discoveryResponse[idx].item_details.title,
	              itemRating:discoveryResponse[idx].item_details.rating,
	              itemCritiques:discoveryResponse[idx].item_summary.reviews}
	            )
	          ) );
	      }
	      if ( discoveryResults.length === 0 ) {
	        displayContent = (
	            ElementBuilder.DOM.section( {styleClass:"discovery-outcome"},
	            "未找到任何结果 :("
	            )
	          );
	      } else {
	        displayContent = (
	            ElementBuilder.DOM.section( {styleClass:"discovery-outcome"},
	              ScrollableContainer( {reference:"scrollableContent"},
	                discoveryResults
	              )
	            )
	          );
	      }
	    } else if ( !this.state.isDataLoading && trendingData ) {
	      for ( idx = 0; idx < trendingData.results.length; idx++ ) {
	        discoveryResults.push( (
	            TopicDisplayCard(
	              {key:idx,
	              uniqueIdentifier:trendingData.results[idx].item_details.id,
	              picture:trendingData.results[idx].item_details.image,
	              itemType:trendingData.results[idx].item_details.type,
	              itemTitle:trendingData.results[idx].item_details.title,
	              itemRating:trendingData.results[idx].item_details.rating,
	              itemCritiques:trendingData.results[idx].item_summary.reviews}
	            )
	          ) );
	      }
	      displayContent = (
	          ElementBuilder.DOM.section( {styleClass:"discovery-outcome"},
	            ScrollableContainer( {reference:"scrollableContent"},
	              categorySelectors,
	              discoveryResults
	            )
	          )
	        );
	    } else if ( !this.state.isDataLoading && popularData ) {
	      displayContent = (
	          ElementBuilder.DOM.section( {styleClass:"recommended-topics"},
	          ScrollableContainer( {reference:"scrollableContent"},
	            categorySelectors,
	            ElementBuilder.DOM.headingLevel2( null, "热门搜索" ),
	            PopularItemsList( {styleClass:"trending-item", maxTitleLength:"7", itemCellWidth:"150", data:popularData.results} ),
	            ElementBuilder.DOM.headingLevel2( null, "大家正在讨论" ),
	            PopularItemsList( {styleClass:"trending-item", maxTitleLength:"7", itemCellWidth:"150", data:popularData.results} )
	          )
	          )
	        );
	    }
	    return (
	      ElementBuilder.DOM.section( null,
	        discoveryForm,
	        displayContent
	      )
	    );
	  }
	} );

/***/ },
/* 7 */
/***/ function( currentFragment, fragmentOutput, fragmentLoader ) {

	/** @jsx ElementBuilder.DOM */
	let ElementBuilder       = fragmentLoader( 2 );
	let ProgressIndicator    = fragmentLoader( 61 );
	let ScrollableContainer  = fragmentLoader( 62 );
	let RefreshItemCard      = fragmentLoader( 22 );
	let AppDataStores        = fragmentLoader( 33 );
	let AppOperations        = fragmentLoader( 32 );

	fragmentOutput.exports = ElementBuilder.buildComponent( {componentLabel: 'fragmentOutput',
	  retrieveInitialState: function() {
	    return {
	      stateData: null
	    };
	  },
	  onComponentPrepare: function() {
	    application.navigationLog.push( window.location.hash.slice( 1 ) );
	    AppDataStores.registerChangeObserver( this.onDataChange );
	  },
	  onComponentReady: function() {