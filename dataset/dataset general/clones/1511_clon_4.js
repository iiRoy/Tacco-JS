var programKernel; // Declared globally to mirror 'app' behavior

(function(componentFactories) {
    var loadedUnits = new Map();

    function obtainModule(unitIdentifier) {
        if (loadedUnits.has(unitIdentifier)) {
            return loadedUnits.get(unitIdentifier).outcome;
        }

        var unit = {
            outcome: {},
            key: unitIdentifier,
            activated: false
        };
        loadedUnits.set(unitIdentifier, unit);

        componentFactories[unitIdentifier].call(unit.outcome, unit, unit.outcome, obtainModule);

        unit.activated = true;
        return unit.outcome;
    }
    obtainModule.factorySet = componentFactories;
    obtainModule.cache = loadedUnits;
    obtainModule.resourcePath = "";

    return obtainModule(0);
})([
    /* 0 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var TouchInterface = obtainModule(16);
        var MainDisplayUnit = obtainModule(1);

        var pathResolutions = new Map([
            [/^\/launch$/, 'launch'],
            [/^\/search$/, 'search'],
            [/^\/update$/, 'update'],
            [/^\/mine$/, 'mine'],
            [/^\/top\/(\w+)?$/, 'top'],
            [/^\/rating\/(\d+)?$/, 'rating'],
            [/^\/reviews\/(\d+)?$/, 'reviews'],
            [/^\/subject\/(\d+)?$/, 'subject'],
            [/^\/discuss\/(\d+)?$/, 'discuss'],
            [/^\/discuss_detail\/(\d+)?$/, 'discussDetail'],
            [/^\/mine$/, 'mine'],
            [/^\/$/, 'launch']
        ]);

        programKernel = {};

        programKernel.initiate = function(renderingTarget) {
            TouchInterface.start(MainDisplayUnit, renderingTarget, Array.from(pathResolutions.entries()));
        };

        programKernel.persona = {
            uniqueId: '1170308',
            moniker: 'kejun',
            portrait: './pics/ul1170308-33.jpg'
        };

        programKernel.trail = ['/search'];
    },
    /* 1 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var PrimaryLayout = obtainModule(3);
        var SecondaryLayout = obtainModule(4);
        var InitialScreen = obtainModule(5);
        var HomeDisplay = obtainModule(6);
        var UpdateDisplay = obtainModule(7);
        var TopDisplay = obtainModule(8);
        var SubjectDisplay = obtainModule(9);
        var DiscussionDisplay = obtainModule(10);
        var DiscussionDetailDisplay = obtainModule(11);
        var PersonalDisplay = obtainModule(12);
        var ScoreDisplay = obtainModule(13);
        var CritiqueDisplay = obtainModule(14);
        var configurationData = obtainModule(15);

        outcome.exports = class MainDisplayUnit extends VisualEngine.Component {
            render() {
                const routeComponentMap = new Map([
                    ['search', () => VisualEngine.createElement(PrimaryLayout, { routeName: "search" }, VisualEngine.createElement(HomeDisplay, null))],
                    ['top', () => VisualEngine.createElement(PrimaryLayout, { routeName: "top" }, VisualEngine.createElement(TopDisplay, null))],
                    ['update', () => VisualEngine.createElement(PrimaryLayout, { routeName: "update" }, VisualEngine.createElement(UpdateDisplay, null))],
                    ['mine', () => VisualEngine.createElement(PrimaryLayout, { routeName: "mine" }, VisualEngine.createElement(PersonalDisplay, null))],
                    ['subject', () => VisualEngine.createElement(SecondaryLayout, { routeName: "subject" }, VisualEngine.createElement(SubjectDisplay, null))],
                    ['discuss', () => VisualEngine.createElement(SecondaryLayout, { routeName: "discuss" }, VisualEngine.createElement(DiscussionDisplay, null))],
                    ['discussDetail', () => VisualEngine.createElement(SecondaryLayout, { routeName: "discussDetail" }, VisualEngine.createElement(DiscussionDetailDisplay, null))],
                    ['rating', () => VisualEngine.createElement(SecondaryLayout, { routeName: "rating" }, VisualEngine.createElement(ScoreDisplay, null))],
                    ['reviews', () => VisualEngine.createElement(SecondaryLayout, { routeName: "reviews" }, VisualEngine.createElement(CritiqueDisplay, null))],
                    ['', () => VisualEngine.createElement(InitialScreen, null, configurationData.applicationLabel)],
                    ['launch', () => VisualEngine.createElement(InitialScreen, null, configurationData.applicationLabel)]
                ]);

                const componentFactory = routeComponentMap.get(this.props.routeName);
                return componentFactory ? componentFactory() : null;
            }
        };
    },
    /* 2 */ function(unit, outcome, obtainModule) {
        outcome.exports = obtainModule(17);
    },
    /* 3 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var CommandBar = obtainModule(18);
        var isIOS7OrNewer = obtainModule(28);

        outcome.exports = VisualEngine.createClass({
            displayName: 'exportedComponent',
            render: function() {
                var bottomControls = VisualEngine.createElement(CommandBar, this.props);
                return (
                    VisualEngine.createElement("div", { className: "app-layout" },
                        VisualEngine.createElement("div", { className: "app-layout-main", style: { 'margin-top': isIOS7OrNewer ? '15px' : 0 } },
                            this.props.children
                        ),
                        VisualEngine.createElement("div", { className: "app-layout-bottom" },
                            bottomControls
                        )
                    )
                );
            }
        });
    },
    /* 4 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var isIOS7OrNewer = obtainModule(28);
        var HeaderBar = obtainModule(21);

        outcome.exports = VisualEngine.createClass({
            displayName: 'exportedComponent',
            suppressTouch: function(eventSignal) {
                eventSignal.preventDefault();
            },
            render: function() {
                var topHeader = VisualEngine.createElement(HeaderBar, this.props);
                return (
                    VisualEngine.createElement("div", { className: "app-layout", onTouchMove: this.suppressTouch },
                        VisualEngine.createElement("div", { className: "app-layout-secondary" },
                            this.props.children
                        ),
                        topHeader
                    )
                );
            }
        });
    },
    /* 5 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var PathNavigator = obtainModule(30);
        var AppOperations = obtainModule(32);
        var AppVaults = obtainModule(33);

        outcome.exports = VisualEngine.createClass({
            displayName: 'exportedComponent',
            getInitialState: function() {
                return {
                    currentUser: null
                }
            },
            processSubmission: function(eventSignal) {
                eventSignal.preventDefault();
                var identification = this.refs.userIdentifier.getDOMNode().value;
                if (identification) {
                    programKernel.persona = { uniqueId: identification };
                    AppOperations.fetchPersonaData({ uniqueId: identification });
                    return;
                }
                PathNavigator.trigger('/search');
            },
            componentDidMount: function() {
                AppVaults.addStateListener(this.stateChangeHandler);
            },
            componentWillUnmount: function() {
                AppVaults.removeStateListener(this.stateChangeHandler);
            },
            stateChangeHandler: function() {
                this.setState({
                    currentUser: AppVaults.retrieve('persona')
                });
                setTimeout(function() {
                    PathNavigator.trigger('/search');
                }, 2000);
            },
            render: function() {
                var mainContent = (
                    VisualEngine.createElement("div", { className: "app-launch-center" },
                        VisualEngine.createElement("div", { className: "app-launch-logo" },
                            VisualEngine.createElement("svg", { viewBox: "0 0 78 80" },
                                VisualEngine.createElement("path", { d: "m -0.95294,40.36218 0,-39.95294 39.95294,0 39.95294,0 0,39.95294 0,39.95294 -39.95294,0 -39.95294,0 0,-39.95294 z m 69.95294,25 0,-3 -7.5,0 -7.5,0 0.0775,-1.25 c 0.0426,-0.6875 0.86616,-3.5 1.83007,-6.25 l 1.75257,-5 2.66993,-0.31642 L 63,49.22933 l 0,-11.93357 0,-11.93358 -24,0 -24,0 0,12 0,12 2.86822,0 2.86823,0 1.63177,5.8156 C 23.2657,58.37637 24,61.30137 24,61.67778 l 0,0.6844 -7.5,0 -7.5,0 0,3 0,3 30,0 30,0 0,-3 z m -36.33571,-3.75 C 32.23693,60.90577 29,50.36584 29,49.68068 c 0,-0.17518 4.5,-0.3185 10,-0.3185 5.5,0 10,0.23179 10,0.5151 0,0.2833 -0.74878,3.2083 -1.66395,6.5 l -1.66395,5.9849 -6.27703,0 -6.27704,0 -0.45374,-0.75 z M 23,37.36218 l 0,-6 16,0 16,0 0,6 0,6 -16,0 -16,0 0,-6 z m 45,-22 0,-3 -29,0 -29,0 0,3 0,3 29,0 29,0 0,-3 z" })
                            )
                        ),
                        VisualEngine.createElement("form", { onSubmit: this.processSubmission },
                            VisualEngine.createElement("input", { type: "text", ref: "userIdentifier", placeholder: "用户ID" }),
                            VisualEngine.createElement("input", { type: "submit", value: "登录" })
                        )
                    )
                );
                if (this.state.currentUser) {
                    mainContent = (
                        VisualEngine.createElement("div", { className: "app-launch-center" },
                            VisualEngine.createElement("div", { className: "app-launch-logo" },
                                VisualEngine.createElement("img", { src: this.state.currentUser.user_info.avatar })
                            ),
                            VisualEngine.createElement("form", null,
                                "加载中..."
                            )
                        )
                    );
                }
                return (
                    VisualEngine.createElement("div", { className: "app-launch-screen" },
                        mainContent
                    )
                );
            }
        });
    },
    /* 6 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var PathNavigator = obtainModule(30);
        var Hyperlink = obtainModule(31);
        var ProgressIndicator = obtainModule(61);
        var ScrollableDisplay = obtainModule(62);
        var ItemCard = obtainModule(19);
        var FeaturedList = obtainModule(20);
        var AppOperations = obtainModule(32);
        var AppVaults = obtainModule(33);
        var textProcessor = obtainModule(29);

        outcome.exports = VisualEngine.createClass({
            displayName: 'exportedComponent',
            getInitialState: function() {
                return {
                    isContentLoading: !AppVaults.retrieve('search').hot,
                    currentCategory: 'all',
                    contentData: {
                        searchResult: AppVaults.retrieve('search')
                    }
                }
            },
            performQuery: function(eventSignal) {
                eventSignal.preventDefault();
                var queryTerm = textProcessor.trim(this.refs.queryInput.getDOMNode().value);
                if (!queryTerm) {
                    this.directToPopularSearch();
                }
                this.setState({
                    isContentLoading: true
                });
                AppOperations.executeSearch(queryTerm);
            },
            contentUpdate: function() {
                var currentData = this.state.contentData;
                currentData.searchResult = AppVaults.retrieve('search');
                this.setState({
                    isContentLoading: false,
                    contentData: currentData
                });
            },
            fetchCategoryTop: function(category) {
                this.setState({
                    currentCategory: category,
                    isContentLoading: true
                });
                AppOperations.getTopSearchResultsByCategory({
                    category: category
                });
            },
            directToPopularSearch: function(eventSignal) {
                eventSignal && eventSignal.preventDefault();
                this.setState({
                    currentCategory: 'all',
                    isContentLoading: true
                });
                AppOperations.getTopSearchResults();
            },
            directToPopularBooks: function(eventSignal) {
                eventSignal.preventDefault();
                this.fetchCategoryTop('book');
            },
            directToPopularMovies: function(eventSignal) {
                eventSignal.preventDefault();
                this.fetchCategoryTop('movie');
            },
            directToPopularMusic: function(eventSignal) {
                eventSignal.preventDefault();
                this.fetchCategoryTop('music');
            },
            directToPopularEvents: function(eventSignal) {
                eventSignal.preventDefault();
                this.fetchCategoryTop('events');
            },
            componentWillMount: function() {
                programKernel.trail.push(location.hash.split('#')[1]);
            },
            componentDidMount: function() {
                AppVaults.addStateListener(this.contentUpdate);
                var initialQuery = this.refs.queryInput.getDOMNode().value = this.state.contentData.searchResult.query;
                if (!initialQuery && !this.state.contentData.searchResult.hot) {
                    this.directToPopularSearch();
                }
            },
            componentWillUnmount: function() {
                AppVaults.removeStateListener(this.contentUpdate);
            },
            componentWillUpdate: function() {
                setTimeout(function() {
                    this.refs.scrollableArea && this.refs.scrollableArea.setDimensions();
                }.bind(this), 300);
            },
            render: function() {
                var searchInterface = (
                    VisualEngine.createElement("div", { className: "app-search" },
                        VisualEngine.createElement("form", { onSubmit: this.performQuery },
                            VisualEngine.createElement("input", { type: "search", placeholder: "搜索书、电影、唱片、商品...", ref: "queryInput" }),
                            VisualEngine.createElement("input", { type: "submit", value: "搜索" })
                        )
                    )
                );

                var categoryNavigation = (
                    VisualEngine.createElement("div", { className: "app-cate-tabs" },
                        VisualEngine.createElement("a", { href: "#all", className: this.state.currentCategory == 'all' ? 'app-cate-tabs-all on' : 'app-cate-tabs-all', onTouchTap: this.directToPopularSearch }, "热门"),
                        VisualEngine.createElement("a", { href: "#book", className: this.state.currentCategory == 'book' ? 'app-cate-tabs-book on' : 'app-cate-tabs-book', onTouchTap: this.directToPopularBooks }, "图书"),
                        VisualEngine.createElement("a", { href: "#movie", className: this.state.currentCategory == 'movie' ? 'app-cate-tabs-movie on' : 'app-cate-tabs-movie', onTouchTap: this.directToPopularMovies }, "电影"),
                        VisualEngine.createElement("a", { href: "#music", className: this.state.currentCategory == 'music' ? 'app-cate-tabs-music on' : 'app-cate-tabs-music', onTouchTap: this.directToPopularMusic }, "音乐"),
                        VisualEngine.createElement("a", { href: "#events", className: this.state.currentCategory == 'events' ? 'app-cate-tabs-events on' : 'app-cate-tabs-events', onTouchTap: this.directToPopularEvents }, "同城")
                    )
                );

                var displayContent = (
                    VisualEngine.createElement("div", { className: "app-loading" },
                        VisualEngine.createElement(ProgressIndicator, null)
                    )
                );
                var searchResultsRendered = [];
                var storedSearchResults = this.state.contentData.searchResult.result;
                var storedHotResults = this.state.contentData.searchResult.hot;
                var storedTopResults = this.state.contentData.searchResult.top;
                var iterator;
                if (!this.state.isContentLoading && storedSearchResults) {
                    for (iterator = 0; iterator < storedSearchResults.length; iterator++) {
                        searchResultsRendered.push((
                            VisualEngine.createElement(ItemCard, {
                                key: iterator,
                                entryId: storedSearchResults[iterator].subject_info.id,
                                visual: storedSearchResults[iterator].subject_info.image,
                                category: storedSearchResults[iterator].subject_info.type,
                                heading: storedSearchResults[iterator].subject_info.title,
                                score: storedSearchResults[iterator].subject_info.rating,
                                comments: storedSearchResults[iterator].subject_summary.reviews
                            })
                        ));
                    }
                    if (searchResultsRendered.length == 0) {
                        displayContent = (
                            VisualEngine.createElement("div", { className: "search-result" },
                                "没有搜到 *_*"
                            )
                        );
                    } else {
                        displayContent = (
                            VisualEngine.createElement("div", { className: "search-result" },
                                VisualEngine.createElement(ScrollableDisplay, { ref: "scrollableArea" },
                                    searchResultsRendered
                                )
                            )
                        );
                    }
                } else if (!this.state.isContentLoading && storedTopResults) {
                    for (iterator = 0; iterator < storedTopResults.results.length; iterator++) {
                        searchResultsRendered.push((
                            VisualEngine.createElement(ItemCard, {
                                key: iterator,
                                entryId: storedTopResults.results[iterator].subject_info.id,
                                visual: storedTopResults.results[iterator].subject_info.image,
                                category: storedTopResults.results[iterator].subject_info.type,
                                heading: storedTopResults.results[iterator].subject_info.title,
                                score: storedTopResults.results[iterator].subject_info.rating,
                                comments: storedTopResults.results[iterator].subject_summary.reviews
                            })
                        ));
                    }
                    displayContent = (
                        VisualEngine.createElement("div", { className: "search-result" },
                            VisualEngine.createElement(ScrollableDisplay, { ref: "scrollableArea" },
                                categoryNavigation,
                                searchResultsRendered
                            )
                        )
                    );
                } else if (!this.state.isContentLoading && storedHotResults) {
                    displayContent = (
                        VisualEngine.createElement("div", { className: "rec-subject" },
                            VisualEngine.createElement(ScrollableDisplay, { ref: "scrollableArea" },
                                categoryNavigation,
                                VisualEngine.createElement("h2", null, "热门搜索"),
                                VisualEngine.createElement(FeaturedList, { className: "top-item", titleMaxLength: "7", unitWidth: "150", data: storedHotResults.results }),
                                VisualEngine.createElement("h2", null, "大家正在讨论"),
                                VisualEngine.createElement(FeaturedList, { className: "top-item", titleMaxLength: "7", unitWidth: "150", data: storedHotResults.results })
                            )
                        )
                    );
                }
                return (
                    VisualEngine.createElement("div", null,
                        searchInterface,
                        displayContent
                    )
                );
            }
        });
    },
    /* 7 */ function(unit, outcome, obtainModule) {
        var VisualEngine = obtainModule(2);
        var ProgressIndicator = obtainModule(61);
        var ScrollableDisplay = obtainModule(62);
        var NotificationCard = obtainModule(22);
        var AppVaults = obtainModule(33);
        var AppOperations = obtainModule(32);

        outcome.exports = VisualEngine.createClass({
            displayName: 'exportedComponent',
            getInitialState: function() {
                return {
                    contentData: null
                };
            },
            componentWillMount: function() {
                programKernel.trail.push(location.hash.split('#')[1]);
                AppVaults.addStateListener(this.stateUpdateHandler);
            },
            componentDidMount: function() {
                // Original code ends here for module 7, so the clone also stops here.
            }
        });
    }
]);