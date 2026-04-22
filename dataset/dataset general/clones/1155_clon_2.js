import Fluxy from 'fluxy-core'

/*
 *  Every singular operation acts as an independent message conduit for a particular activity.
 *  These operations are invoked by presentational components.
 *  The central data store observes all operations, and subsequently, components monitor the store.
 *  Hence, the operational flow is as follows:
 *  User interaction -> component dispatches an operation -> store reacts and broadcasts updates -> components refresh their state.
 */
var ResourceEvents = Fluxy.generateEventChannels([
    'requestContent',
    'contentRetrieved'
]);

let itemCollection = [
    {
        webAddress: 'http://facebook.github.io/react/',
        label: 'React main portal'
    },
    {
        "webAddress": "https://github.com/enaqx/awesome-react",
        "label": "A compilation of superb React libraries, utilities, and sparkling items."
    },
    {
        "webAddress": "https://reactjsnews.com/",
        "label": "ReactJS News and instructional guides from the community"
    },
    {
        "webAddress": "http://spoike.ghost.io/deconstructing-reactjss-flux/",
        "label": "Fluxy - analyzing ReactJS's Flux"
    },
    {
        "webAddress": "https://github.com/echenley/react-news",
        "label": "Hacker News replica implemented in React + Fluxy + Firebase"
    },
    {
        "webAddress": "https://github.com/WRidder/react-spa",
        "label": "Community site SPA constructed with ReactJS + Fluxy"
    },
    {
        "webAddress": "http://react-components.com",
        "label": "Searchable repository of React components"
    },
    {
        "webAddress": "http://www.reactjsx.com/",
        "label": "Locate reusable React components"
    },
    {
        "webAddress": "http://formatjs.io/react/",
        "label": "React mixin for language localization"
    },
    {
        "webAddress": "http://isomorphic.net/",
        "label": "Isomorphic JavaScript - The upcoming phase of web application development"
    },
    {
        "webAddress": "https://code.tutsplus.com/courses/getting-started-with-reactjs",
        "label": "Beginning with React.js [video tutorials]"
    },
    {
        "webAddress": "https://egghead.io/series/react-flux-architecture",
        "label": "React: Flux Pattern [video tutorials]"
    },
    {
        "webAddress": "https://www.facebook.com/groups/228321510706889/",
        "label": "ReactJS (Facebook discussion group)"
    },
    {
        "webAddress": "http://react-bootstrap.github.io/",
        "label": "Bootstrap 3 integrated into React"
    },
    {
        "webAddress": "http://react-components.com/component/react-semantify",
        "label": "Semantic-UI within React"
    },
    {
        "webAddress": "https://github.com/sterpe/quantum-flux",
        "label": "https://github.com/sterpe/quantum-flux"
    },
    {
        "webAddress": "http://react.rocks/",
        "label": "Compendium of demonstrations and instructional guides"
    },
    {
        "webAddress": "https://reactjsnews.com/react-style-guide-patterns-i-like/",
        "label": "React Styling Handbook"
    }
];

ResourceEvents.requestContent.subscribe(function ()
{

    // This is the designated location for asynchronous communication with backend services...
    ResourceEvents.contentRetrieved(itemCollection);
});


export default ResourceEvents