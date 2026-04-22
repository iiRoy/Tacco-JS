const createEventHandle = () => {
    let registeredCallbacks = [];
    const eventEmitter = (...payload) => {
        registeredCallbacks.forEach(callback => callback(...payload));
    };
    eventEmitter.subscribe = (handler) => {
        registeredCallbacks.push(handler);
        return () => {
            registeredCallbacks = registeredCallbacks.filter(cb => cb !== handler);
        };
    };
    return eventEmitter;
};

const collectionItems = [
    {
        resource: 'http://facebook.github.io/react/',
        caption: 'React home page'
    },
    {
        resource: "https://github.com/enaqx/awesome-react",
        caption: "A collection of awesome React libraries, resources and shiny things."
    },
    {
        resource: "https://reactjsnews.com/",
        caption: "ReactJS News and tutorials from the community"
    },
    {
        resource: "http://spoike.ghost.io/deconstructing-reactjss-flux/",
        caption: "Reflux - deconstructing ReactJS's Flux"
    },
    {
        resource: "https://github.com/echenley/react-news",
        caption: "Hacker News clone written in React + Reflux + Firebase"
    },
    {
        resource: "https://github.com/WRidder/react-spa",
        caption: "Community site SPA based on ReactJS + Reflux"
    },
    {
        resource: "http://react-components.com",
        caption: "Searchable database of React components"
    },
    {
        resource: "http://www.reactjsx.com/",
        caption: "Search reusable React components"
    },
    {
        resource: "http://formatjs.io/react/",
        caption: "React mixin for internationalization"
    },
    {
        resource: "http://isomorphic.net/",
        caption: "Isomorphic JavaScript - The future of web app development"
    },
    {
        resource: "https://code.tutsplus.com/courses/getting-started-with-reactjs",
        caption: "Getting Started With React.js [screencasts]"
    },
    {
        resource: "https://egghead.io/series/react-flux-architecture",
        caption: "React: Flux Architecture [screencasts]"
    },
    {
        resource: "https://www.facebook.com/groups/228321510706889/",
        caption: "ReactJS (Facebook group)"
    },
    {
        resource: "http://react-bootstrap.github.io/",
        caption: "Bootstrap 3 in React"
    },
    {
        resource: "http://react-components.com/component/react-semantify",
        caption: "Semantic-UI in React"
    },
    {
        resource: "https://github.com/sterpe/quantum-flux",
        caption: "https://github.com/sterpe/quantum-flux"
    },
    {
        resource: "http://react.rocks/",
        caption: "Collection of examples and tutorials"
    },
    {
        resource: "https://reactjsnews.com/react-style-guide-patterns-i-like/",
        caption: "React Style Guide"
    }
];

const InformationFlow = {};

InformationFlow.requestInformation = createEventHandle();
InformationFlow.fetchCompleted = createEventHandle();

InformationFlow.requestInformation.subscribe(() => {
    InformationFlow.fetchCompleted(collectionItems);
});

export default InformationFlow;