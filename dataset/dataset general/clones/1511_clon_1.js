/******/ ( function(modules ) { // This is the webpackBootstrap function wrapper.
/******/
/******/ 	// The module cache object to store already loaded modules.
/******/ 	var installedModules = {};

/******/ 	// The core require function for loading modules.
/******/ 	function __webpack_require__ ( moduleId ) {

/******/ 		// First, check if the module is already in our cache.
/******/ 		if ( installedModules [ moduleId ] ) {
/******/ 			return installedModules [ moduleId ] . exports ;
/******/ 		}

/******/ 		// If not in cache, create a new module entry and add it to the cache.
/******/ 		var module = installedModules [ moduleId ] = {
/******/ 			exports : {} ,
/******/ 			id : moduleId , // Store the module's ID.
/******/ 			loaded : false // Mark as not yet loaded.
/******/ 		};

/******/ 		// Execute the module's function, passing necessary arguments.
/******/ 		modules [ moduleId ] . call ( module . exports , module , module . exports , __webpack_require__ ) ;

/******/ 		// After execution, flag the module as loaded.
/******/ 		module . loaded = true ;

/******/ 		// Finally, return the exports of the module.
/******/ 		return module . exports ;
/******/ 	}


/******/ 	// Expose the 'modules' object itself, often used for debugging or dynamic loading.
/******/ 	__webpack_require__ . m = modules ;

/******/ 	// Expose the module cache for external access.
/******/ 	__webpack_require__ . c = installedModules ;

/******/ 	// Set the public path for assets. Currently an empty string.
/******/ 	__webpack_require__ . p = "" ;


/******/ 	// Load the entry module (module 0) and return its exports to kick off the application.
/******/ 	return __webpack_require__ ( 0 ) ;
/******/ } )
/************************************************************************/
/******/ ( [
/* 0 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */
	// This module defines the main application setup and routing.
	var React = __webpack_require__ ( 2 ) ;
	var ReactTouch = __webpack_require__ ( 16 ) ;
	var RootPage = __webpack_require__ ( 1 ) ;

	// Define the routing options for the application.
	var routeOptions = {
	  '/launch$' : 'launch' , // Route for the initial launch screen.
	  '/search$' : 'search' , // Route for the search page.
	  '/update$' : 'update' , // Route for the updates page.
	  '/mine$' : 'mine' , // Route for the user's profile page.
	  '/top/(\\w+)?' : 'top' , // Route for top items, with optional category.
	  '/rating/(\\d+)?' : 'rating' , // Route for rating details, with optional ID.
	  '/reviews/(\\d+)?' : 'reviews' , // Route for reviews, with optional ID.
	  '/subject/(\\d+)?' : 'subject' , // Route for a specific subject, with optional ID.
	  '/discuss/(\\d+)?' : 'discuss' , // Route for discussions, with optional ID.
	  '/discuss_detail/(\\d+)?' : 'discussDetail' , // Route for discussion details, with optional ID.
	  '/$' : 'launch' // Default root route also goes to launch.
	}

	// Initialize the global 'app' object.
	app = {} ;

	/**
	 * Starts the ReactTouch application.
	 * @param {HTMLElement} mountNode The DOM element to mount the application to.
	 */
	app . start = function ( mountNode ) {
	  ReactTouch . start ( RootPage , mountNode , routeOptions ) ;
	} ;

	// Define a dummy user object for the application.
	app . user = {
	  id : '1170308' ,
	  name : 'kejun' ,
	  avatar : './pics/ul1170308-33.jpg'
	} ;

	// Initialize application history with a default search route.
	app . history = [ '/search' ] ;


/***/ } ,
/* 1 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */

	// This module exports the RootPage component, which acts as the main router for different views.

	var React = __webpack_require__ ( 2 ) ;
	var Layout = __webpack_require__ ( 3 ) ;
	var LayoutSecondary = __webpack_require__ ( 4 ) ;
	var LaunchPage = __webpack_require__ ( 5 ) ;
	var HomePage = __webpack_require__ ( 6 ) ;
	var UpdatePage = __webpack_require__ ( 7 ) ;
	var TopPage = __webpack_require__ ( 8 ) ;
	var SubjectPage = __webpack_require__ ( 9 ) ;
	var DiscussPage = __webpack_require__ ( 10 ) ;
	var DiscussDetailPage = __webpack_require__ ( 11 ) ;
	var MinePage = __webpack_require__ ( 12 ) ;
	var RatingPage = __webpack_require__ ( 13 ) ;
	var ReviewsPage = __webpack_require__ ( 14 ) ;
	var config = __webpack_require__ ( 15 ) ;

	module . exports = React . createClass ( { displayName : 'exports' ,
	  render : function ( ) {
	    // Based on the routeName prop, render the appropriate page component within its layout.
	    switch ( this . props . routeName ) {
	      case 'search' :
	        return Layout ( { routeName : "search" } , HomePage ( null ) )
	      case 'top' :
	        return Layout ( { routeName : "top" } , TopPage ( null ) )
	      case 'update' :
	        return Layout ( { routeName : "update" } , UpdatePage ( null ) )
	      case 'mine' :
	        return Layout ( { routeName : "mine" } , MinePage ( null ) )
	      case 'subject' :
	        return LayoutSecondary ( { routeName : "subject" } , SubjectPage ( null ) )
	      case 'discuss' :
	        return LayoutSecondary ( { routeName : "discuss" } , DiscussPage ( null ) )
	      case 'discussDetail' :
	        return LayoutSecondary ( { routeName : "discussDetail" } , DiscussDetailPage ( null ) )
	      case 'rating' :
	        return LayoutSecondary ( { routeName : "rating" } , RatingPage ( null ) )
	      case 'reviews' :
	        return LayoutSecondary ( { routeName : "reviews" } , ReviewsPage ( null ) )
	      case '' : // Default empty route also goes to launch.
	      case 'launch' :
	        return LaunchPage ( null , config . appName )
	    }
	  }
	} ) ;


/***/ } ,
/* 2 */
/***/ function ( module , exports , __webpack_require__ ) {

	// This module simply re-exports the React library from another module.
	module . exports = __webpack_require__ ( 17 ) ;


/***/ } ,
/* 3 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */

	// This module defines the primary application layout with a main content area and a tab bar.

	var React = __webpack_require__ ( 2 ) ;
	var TabBar = __webpack_require__ ( 18 ) ;
	var gteIOS7 = __webpack_require__ ( 28 ) ; // Utility to check if iOS version is 7 or greater.

	module . exports = React . createClass ( { displayName : 'exports' ,
	  render : function ( ) {
	    // Transfer props to the TabBar component.
	    var tabs = this . transferPropsTo (
	      TabBar ( null )
	    ) ;
	    return (
	      React . DOM . div ( { className : "app-layout" } ,
	        React . DOM . div ( { className : "app-layout-main" , style : { 'margin-top' : gteIOS7 ? '15px' : 0 } } ,
	          this . props . children // Render child components within the main layout area.
	        ) ,
	        React . DOM . div ( { className : "app-layout-bottom" } ,
	          tabs // Render the TabBar at the bottom.
	        )
	      )
	    ) ;
	  }
	} ) ;


/***/ } ,
/* 4 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */

	// This module provides a secondary layout, typically used for detail pages, with a title bar.

	var React = __webpack_require__ ( 2 ) ;
	var gteIOS7 = __webpack_require__ ( 28 ) ;
	var TitleBar = __webpack_require__ ( 21 ) ;

	module . exports = React . createClass ( { displayName : 'exports' ,
	  // Prevents default touch move behavior to potentially improve scrolling.
	  handleTouch : function ( e ) {
	    e . preventDefault ( ) ;
	  } ,
	  render : function ( ) {
	    // Create the TitleBar component and transfer props to it.
	    var titlebar = this . transferPropsTo (
	        TitleBar ( null )
	      ) ;
	    // var style = {'top': gteIOS7 ? '65px': '60px' }; // This line is commented out in the original.
	    return (
	      React . DOM . div ( { className : "app-layout" , onTouchMove : this . handleTouch } ,
	        React . DOM . div ( { className : "app-layout-secondary" } ,
	          this . props . children // Render children within the secondary layout area.
	        ) ,
	        titlebar // Render the TitleBar.
	      )
	    ) ;
	  }
	} ) ;


/***/ } ,
/* 5 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */

	// This module defines the LaunchPage component, which handles user login or redirects to search.

	var React = __webpack_require__ ( 2 ) ;
	var Router = __webpack_require__ ( 30 ) ;
	var appActions = __webpack_require__ ( 32 ) ;
	var appStores = __webpack_require__ ( 33 ) ;

	module . exports = React . createClass ( { displayName : 'exports' ,
	  // Initialize the component's state.
	  getInitialState : function ( ) {
	    return {
	      user : null // User data will be loaded here.
	    }
	  } ,
	  // Handles the form submission for user login.
	  handleSubmit : function ( e ) {
	    e . preventDefault ( ) ; // Prevent default form submission.
	    var id = this . refs . uid . getDOMNode ( ) . value ; // Get user ID from the input field.
	    if ( id ) {
	      app . user = { id : id } ; // Set global app user ID.
	      appActions . getUserInfo ( { id : id } ) ; // Dispatch action to fetch user info.
	      return ;
	    }
	    Router . trigger ( '/search' ) ; // If no ID, just go to search.
	  } ,
	  // Lifecycle method: Called after the component mounts.
	  componentDidMount : function ( ) {
	    appStores . addChangeListener ( this . onChange ) ; // Subscribe to store changes.
	  } ,
	  // Lifecycle method: Called before the component unmounts.
	  componentWillUnmount : function ( ) {
	    appStores . removeChangeListener ( this . onChange ) ; // Unsubscribe from store changes.
	  } ,
	  // Callback for store changes.
	  onChange : function ( ) {
	    this . setState ( {
	      user : appStores . get ( 'user' ) // Update state with user data from the store.
	    } ) ;
	    // After a short delay, navigate to the search page.
	    setTimeout ( function ( ) {
	      Router . trigger ( '/search' ) ;
	    } , 2000 ) ;
	  } ,
	  render : function ( ) {
	    var content = (
	        React . DOM . div ( { className : "app-launch-center" } ,
	          React . DOM . div ( { className : "app-launch-logo" } ,
	            React . DOM . svg ( { viewBox : "0 0 78 80" } ,
	            React . DOM . path ( { d : "m -0.95294,40.36218 0,-39.95294 39.95294,0 39.95294,0 0,39.95294 0,39.95294 -39.95294,0 -39.95294,0 0,-39.95294 z m 69.95294,25 0,-3 -7.5,0 -7.5,0 0.0775,-1.25 c 0.0426,-0.6875 0.86616,-3.5 1.83007,-6.25 l 1.75257,-5 2.66993,-0.31642 L 63,49.22933 l 0,-11.93357 0,-11.93358 -24,0 -24,0 0,12 0,12 2.86822,0 2.86823,0 1.63177,5.8156 C 23.2657,58.37637 24,61.30137 24,61.67778 l 0,0.6844 -7.5,0 -7.5,0 0,3 0,3 30,0 30,0 0,-3 z m -36.33571,-3.75 C 32.23693,60.90577 29,50.36584 29,49.68068 c 0,-0.17518 4.5,-0.3185 10,-0.3185 5.5,0 10,0.23179 10,0.5151 0,0.2833 -0.74878,3.2083 -1.66395,6.5 l -1.66395,5.9849 -6.27703,0 -6.27704,0 -0.45374,-0.75 z M 23,37.36218 l 0,-6 16,0 16,0 0,6 0,6 -16,0 -16,0 0,-6 z m 45,-22 0,-3 -29,0 -29,0 0,3 0,3 29,0 29,0 0,-3 z" } ) // SVG path for a logo.
	            )
	          ) ,
	          React . DOM . form ( { onSubmit : this . handleSubmit } ,
	          React . DOM . input ( { type : "text" , ref : "uid" , placeholder : "用户ID" } ) ,
	          React . DOM . input ( { type : "submit" , value : "登录" } )
	          )
	        )
	      ) ;
	    // If user data is available, display a loading message with user's avatar.
	    if ( this . state . user ) {
	      content = (
	        React . DOM . div ( { className : "app-launch-center" } ,
	          React . DOM . div ( { className : "app-launch-logo" } ,
	            React . DOM . img ( { src : this . state . user . user_info . avatar } )
	          ) ,
	          React . DOM . form ( null ,
	            "加载中..." // Loading message.
	          )
	        )
	      ) ;
	    }
	    return (
	      React . DOM . div ( { className : "app-launch-screen" } ,
	      content // Render the determined content.
	      )
	    ) ;
	  }
	} ) ;


/***/ } ,
/* 6 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */

	// This module defines the HomePage component, which handles search and displays search results or hot topics.

	var React = __webpack_require__ ( 2 ) ;
	var Router = __webpack_require__ ( 30 ) ;
	var Link = __webpack_require__ ( 31 ) ;
	var Loading = __webpack_require__ ( 61 ) ;
	var ScrollView = __webpack_require__ ( 62 ) ;
	var SubjectCard = __webpack_require__ ( 19 ) ;
	var HotList = __webpack_require__ ( 20 ) ;
	var appActions = __webpack_require__ ( 32 ) ;
	var appStores = __webpack_require__ ( 33 ) ;
	var string = __webpack_require__ ( 29 ) ;

	module . exports = React . createClass ( { displayName : 'exports' ,
	  getInitialState : function ( ) {
	    return {
	      isLoading : ! appStores . get ( 'search' ) . hot , // True if hot data is not yet loaded.
	      currentTopCate : 'all' , // Tracks the currently selected top category.
	      data : {
	        search : appStores . get ( 'search' ) // Get initial search data from store.
	      }
	    }
	  } ,
	  // Handler for search form submission.
	  handleSearch : function ( e ) {
	    e . preventDefault ( ) ;
	    var q = string . trim ( this . refs . query . getDOMNode ( ) . value ) ; // Get and trim search query.
	    if ( ! q ) {
	      this . linkToTopSearch ( ) ; // If query is empty, show top search.
	    }
	    this . setState ( {
	      isLoading : true // Set loading state.
	    } ) ;
	    appActions . search ( q ) ; // Dispatch search action.
	  } ,
	  // Callback for store changes.
	  onChange : function ( ) {
	    var data = this . state . data ;
	    data . search = appStores . get ( 'search' ) ; // Update search data from store.
	    this . setState ( {
	      isLoading : false , // Clear loading state.
	      data : data
	    } ) ;
	  } ,
	  // Fetches top search results by a specific category.
	  fetchTopByCate : function ( cate ) {
	    this . setState ( {
	      currentTopCate : cate , // Set current category.
	      isLoading : true // Set loading state.
	    } ) ;
	    appActions . getTopSearchByCate ( {
	      cate : cate
	    } ) ;
	  } ,
	  // Links to the general top search.
	  linkToTopSearch : function ( e ) {
	    e && e . preventDefault ( ) ;
	    this . setState ( {
	      currentTopCate : 'all' , // Set category to 'all'.
	      isLoading : true // Set loading state.
	    } ) ;
	    appActions . getTopSearch ( ) ; // Dispatch action to get general top search.
	  } ,
	  // Links to top books.
	  linkToTopBooks : function ( e ) {
	    e . preventDefault ( ) ;
	    this . fetchTopByCate ( 'book' ) ;
	  } ,
	  // Links to top movies.
	  linkToTopMovie : function ( e ) {
	    e . preventDefault ( ) ;
	    this . fetchTopByCate ( 'movie' ) ;
	  } ,
	  // Links to top music.
	  linkToTopMusic : function ( e ) {
	    e . preventDefault ( ) ;
	    this . fetchTopByCate ( 'music' ) ;
	  } ,
	  // Links to top events.
	  linkToTopEvents : function ( e ) {
	    e . preventDefault ( ) ;
	    this . fetchTopByCate ( 'events' ) ;
	  } ,
	  // Lifecycle method: Called before component mounts.
	  componentWillMount : function ( ) {
	    app . history . push ( location . hash . split ( '#' ) [ 1 ] ) ; // Add current route to history.
	  } ,
	  // Lifecycle method: Called after component mounts.
	  componentDidMount : function ( ) {
	    appStores . addChangeListener ( this . onChange ) ; // Subscribe to store changes.
	    var q = this . refs . query . getDOMNode ( ) . value = this . state . data . search . query ; // Set initial query value.
	    if ( ! q && ! this . state . data . search . hot ) {
	      this . linkToTopSearch ( ) ; // If no query and no hot data, load top search.
	    }
	  } ,
	  // Lifecycle method: Called before component unmounts.
	  componentWillUnmount : function ( ) {
	    appStores . removeChangeListener ( this . onChange ) ; // Unsubscribe from store changes.
	  } ,
	  // Lifecycle method: Called before component updates.
	  componentWillUpdate : function ( ) {
	    // Set dimensions for scrollview after a short delay to ensure correct rendering.
	    setTimeout ( function ( ) {
	      this . refs . scrollview && this . refs . scrollview . setDimensions ( ) ;
	    } . bind ( this ) , 300 ) ;
	  } ,
	  render : function ( ) {
	    var searchForm = (
	      React . DOM . div ( { className : "app-search" } ,
	      React . DOM . form ( { onSubmit : this . handleSearch } ,
	        React . DOM . input ( { type : "search" , placeholder : "搜索书、电影、唱片、商品..." , ref : "query" } ) ,
	        React . DOM . input ( { type : "submit" , value : "搜索" } )
	      )
	      )
	    ) ;

	    var cateTabs = (
	          React . DOM . div ( { className : "app-cate-tabs" } ,
	            React . DOM . a ( { href : "#all" , className : this . state . currentTopCate == 'all' ? 'app-cate-tabs-all on' : 'app-cate-tabs-all' , onTouchTap : this . linkToTopSearch } , "热门" ) ,
	            React . DOM . a ( { href : "#book" , className : this . state . currentTopCate == 'book' ? 'app-cate-tabs-book on' : 'app-cate-tabs-book' , onTouchTap : this . linkToTopBooks } , "图书" ) ,
	            React . DOM . a ( { href : "#movie" , className : this . state . currentTopCate == 'movie' ? 'app-cate-tabs-movie on' : 'app-cate-tabs-movie' , onTouchTap : this . linkToTopMovie } , "电影" ) ,
	            React . DOM . a ( { href : "#music" , className : this . state . currentTopCate == 'music' ? 'app-cate-tabs-music on' : 'app-cate-tabs-music' , onTouchTap : this . linkToTopMusic } , "音乐" ) ,
	            React . DOM . a ( { href : "#events" , className : this . state . currentTopCate == 'events' ? 'app-cate-tabs-events on' : 'app-cate-tabs-events' , onTouchTap : this . linkToTopEvents } , "同城" )
	          )
	        ) ;

	    var content = (
	        React . DOM . div ( { className : "app-loading" } ,
	          Loading ( null ) // Display a loading spinner.
	        )
	      ) ;
	    var topSearch = [ ] ;
	    var searchResult = [ ] ;
	    var srhRes = this . state . data . search . result ;
	    var srhHot = this . state . data . search . hot ;
	    var srhTop = this . state . data . search . top ;
	    var i ;
	    if ( ! this . state . isLoading && srhRes ) {
	      for ( i = 0 ; i < srhRes . length ; i ++ ) {
	        searchResult . push ( (
	            SubjectCard (
	              { key : i ,
	              id : srhRes [ i ] . subject_info . id ,
	              pic : srhRes [ i ] . subject_info . image ,
	              type : srhRes [ i ] . subject_info . type ,
	              title : srhRes [ i ] . subject_info . title ,
	              rating : srhRes [ i ] . subject_info . rating ,
	              reviews : srhRes [ i ] . subject_summary . reviews }
	            )
	          ) ) ;
	      }
	      if ( searchResult . length == 0 ) {
	        content = (
	            React . DOM . div ( { className : "search-result" } ,
	            "没有搜到 *_* " // Message for no results.
	            )
	          ) ;
	      } else {
	        content = (
	            React . DOM . div ( { className : "search-result" } ,
	              ScrollView ( { ref : "scrollview" } ,
	                searchResult // Display search results in a scrollable view.
	              )
	            )
	          ) ;
	      }
	    } else if ( ! this . state . isLoading && srhTop ) {
	      for ( i = 0 ; i < srhTop . results . length ; i ++ ) {
	        searchResult . push ( (
	            SubjectCard (
	              { key : i ,
	              id : srhTop . results [ i ] . subject_info . id ,
	              pic : srhTop . results [ i ] . subject_info . image ,
	              type : srhTop . results [ i ] . subject_info . type ,
	              title : srhTop . results [ i ] . subject_info . title ,
	              rating : srhTop . results [ i ] . subject_info . rating ,
	              reviews : srhTop . results [ i ] . subject_summary . reviews }
	            )
	          ) ) ;
	      }
	      content = (
	          React . DOM . div ( { className : "search-result" } ,
	            ScrollView ( { ref : "scrollview" } ,
	              cateTabs , // Category tabs.
	              searchResult // Top search results.
	            )
	          )
	        ) ;
	    } else if ( ! this . state . isLoading && srhHot ) {
	      content = (
	          React . DOM . div ( { className : "rec-subject" } ,
	          ScrollView ( { ref : "scrollview" } ,
	            cateTabs , // Category tabs.
	            React . DOM . h2 ( null , "热门搜索" ) , // Heading for hot searches.
	            HotList ( { className : "top-item" , titleMaxLength : "7" , unitWidth : "150" , data : srhHot . results } ) ,
	            React . DOM . h2 ( null , "大家正在讨论" ) , // Heading for trending discussions.
	            HotList ( { className : "top-item" , titleMaxLength : "7" , unitWidth : "150" , data : srhHot . results } )
	          )
	          )
	        ) ;
	    }
	    return (
	      React . DOM . div ( null ,
	        searchForm , // Render the search input form.
	        content // Render the main content area (loading, results, or hot lists).
	      )
	    ) ;
	  }
	} ) ;


/***/ } ,
/* 7 */
/***/ function ( module , exports , __webpack_require__ ) {

	/** @jsx React.DOM */
	// This module defines the UpdatePage component.

	var React = __webpack_require__ ( 2 ) ;
	var Loading = __webpack_require__ ( 61 ) ;
	var ScrollView = __webpack_require__ ( 62 ) ;
	var UpdateCard = __webpack_require__ ( 22 ) ;
	var appStores = __webpack_require__ ( 33 ) ;
	var appActions = __webpack_require__ ( 32 ) ;

	module . exports = React . createClass ( { displayName : 'exports' ,
	  getInitialState : function ( ) {
	    return {
	      data : null // Initial state for data is null.
	    } ;
	  } ,
	  componentWillMount : function ( ) {
	    app . history . push ( location . hash . split ( '#' ) [ 1 ] ) ; // Add current route to app history.
	    appStores . addChangeListener ( this . onChange ) ; // Subscribe to store changes for updates.
	  } ,
	  componentDidMount : function ( ) {