import Reflux   from   'reflux'   ; // Importing the core Reflux library for action management.

/*
 * This section defines the purpose of actions within the Reflux architecture.
 * Each action effectively serves as a dedicated event channel for a specific,
 * distinct event that can occur within the application.
 *
 * Components are responsible for initiating these actions.
 * Conversely, the central store component is configured to listen for all
 * relevant actions. In turn, components that display data listen to the store.
 *
 * The overall data flow is designed as follows:
 * 1. User Interaction (e.g., clicking a button)
 * 2. A component invokes a relevant action
 * 3. The store reacts to the action and processes the event
 * 4. The store then triggers an update, notifying listening components
 * 5. Components update their views based on the new state provided by the store
 */
const LinksActions  =  Reflux . createActions ( [

    'loadData' , // Action to signal the initiation of data loading.

    'loadDataSuccess' // Action to signal that data has been successfully loaded.
] ) ;

// This array holds the example data that will be loaded.
const data  =  [
    {
        url : 'http://facebook.github.io/react/' ,
        title : 'React home page'
    } ,
    {
        "url" : "https://github.com/enaqx/awesome-react" ,
        "title" : "A collection of awesome React libraries, resources and shiny things."
    } ,
    {
        "url" : "https://reactjsnews.com/" ,
        "title" : "ReactJS News and tutorials from the community"
    } ,
    {
        "url" : "http://spoike.ghost.io/deconstructing-reactjss-flux/" ,
        "title" : "Reflux - deconstructing ReactJS's Flux"
    } ,
    {
        "url" : "https://github.com/echenley/react-news" ,
        "title" : "Hacker News clone written in React + Reflux + Firebase"
    } ,
    {
        "url" : "https://github.com/WRidder/react-spa" ,
        "title" : "Community site SPA based on ReactJS + Reflux"
    } ,
    {
        "url" : "http://react-components.com" ,
        "title" : "Searchable database of React components"
    } ,
    {
        "url" : "http://www.reactjsx.com/" ,
        "title" : "Search reusable React components"
    } ,
    {
        "url" : "http://formatjs.io/react/" ,
        "title" : "React mixin for internationalization"
    } ,
    {
        "url" : "http://isomorphic.net/" ,
        "title" : "Isomorphic JavaScript - The future of web app development"
    } ,
    {
        "url" : "https://code.tutsplus.com/courses/getting-started-with-reactjs" ,
        "title" : "Getting Started With React.js [screencasts]"
    } ,
    {
        "url" : "https://egghead.io/series/react-flux-architecture" ,
        "title" : "React: Flux Architecture [screencasts]"
    } ,
    {
        "url" : "https://www.facebook.com/groups/228321510706889/" ,
        "title" : "ReactJS (Facebook group)"
    } ,
    {
        "url" : "http://react-bootstrap.github.io/" ,
        "title" : "Bootstrap 3 in React"
    } ,
    {
        "url" : "http://react-components.com/component/react-semantify" ,
        "title" : "Semantic-UI in React"
    } ,
    {
        "url" : "https://github.com/sterpe/quantum-flux" ,
        "title" : "https://github.com/sterpe/quantum-flux"
    } ,
    {
        "url" : "http://react.rocks/" ,
        "title" : "Collection of examples and tutorials"
    } ,
    {
        "url" : "https://reactjsnews.com/react-style-guide-patterns-i-like/" ,
        "title" : "React Style Guide"
    }
] ;


// Set up a listener for the 'loadData' action.
// When 'loadData' is triggered, this function will execute.
LinksActions . loadData . listen ( function ( ) {

    /*
     * In a real-world application, this is the designated spot
     * for asynchronous operations, such as making API calls
     * to a backend server to fetch actual data.
     * For this example, we're simply using predefined static data.
     */
    LinksActions . loadDataSuccess ( data ) ; // Immediately trigger the 'loadDataSuccess' action with our static data.
} ) ;

// Export the actions so they can be imported and used by other modules (e.g., React components).
export   default   LinksActions ;