function displayAlert(isProblem, alertText) {
    var alertElement = angular.element('<div id="notification">' + alertText + '</div>');
    if (isProblem) {
        alertElement.addClass('failure');
    }
    alertElement.appendTo(document.body);
    alertElement.css('top', $('header.primary').outerHeight());
    alertElement.hide();
    alertElement.slideDown(500)
                .delay(isProblem ? 6500 : 3500)
                .slideUp(500, function() {
                    $(this).remove();
                });
}

function appendToPurchaseCart(webClient) {
    return function(stallIdentifier, productEntry) {
        var payload = {
            ident: stallIdentifier,
            product: productEntry
        };
        webClient.post('/api/~user_shopping_list_item', payload)
            .then(function(response) {
                var confirmationMsg = 'Item ' + productEntry + ' was added to your cart.';
                displayAlert(false, confirmationMsg);
            }, function(response) {
                var problemMsg = 'Failed to add ' + productEntry + ' to cart. Reload and try again.';
                displayAlert(true, problemMsg);
            });
    };
}

function CultivationCentersController(pageContext, cultivations) {
    pageContext.centerCollection = cultivations.all.getList();
}

function CultivationDetailsController(pageContext, routeDetails, cultivations, webClient) {
    pageContext.cultivationSite = cultivations.one(routeDetails.identifier).get();

    pageContext.appendToList = appendToPurchaseCart(webClient);

    pageContext.mapFocus = {
        latCoord: 0,
        longCoord: 0
    };
    pageContext.mapMagnification = 9;

    pageContext.cultivationSite.then(function(siteData) {
        if (angular.isDefined(siteData.latCoord) && angular.isDefined(siteData.longCoord)) {
            var marketLocation = {
                latCoord: 43.074703,
                longCoord: -76.167891
            };
            var siteLocation = {
                latCoord: siteData.latCoord,
                longCoord: siteData.longCoord
            };
            angular.extend(pageContext, {
                mapFocus: marketLocation,
                mapPointers: [siteLocation],
            });
        }
    });
}

function GoodsController(pageContext, merchandise) {
    pageContext.merchandiseList = merchandise.merchandiseList;
}

function MerchandiseDetailsController(pageContext, routeDetails, merchandise, webClient) {
    var itemIdentifier = routeDetails.good;
    pageContext.merchandiseSymbol = merchandise.merchandisePicture(itemIdentifier);

    pageContext.itemData = merchandise.one(itemIdentifier).get().then(function(outcome) {
        outcome.stalls.forEach(function(currentStall) {
            currentStall.offeringList = _.filter(currentStall.offeringList, function(entry) {
                return itemIdentifier === entry.entry;
            });
            currentStall.hasSubTypes = false;
        });
        return outcome;
    });

    pageContext.appendToList = appendToPurchaseCart(webClient);
}


function PurchaseCartController(pageContext, clientAccount, webClient) {
    pageContext.cartContents = clientAccount.purchaseItems.getList();

    pageContext.categories = pageContext.cartContents.then(function(outcome) {
        return _.groupBy(outcome, function(entry) {
            return entry.category;
        });
    });

    pageContext.cartStatusEmpty = pageContext.cartContents.then(function(outcome) {
        return outcome.length === 0;
    });

    pageContext.deleteFromCart = function(stallIdentifier, productEntry, onCompletion) {
        var requestOptions = {
            method: 'DELETE',
            url: '/api/~user_shopping_list_item',
            data: {
                item_id: stallIdentifier,
                product_key: productEntry
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
        webClient(requestOptions)
            .then(function(response) {
                onCompletion();
            }, function(response) {
                var problemMsg = 'Failed to remove ' + productEntry + ' from cart. Reload and try again.';
                displayAlert(true, problemMsg);
            });
    };

    pageContext.clearAllItems = function() {
        var requestOptions = {
            method: 'DELETE',
            url: '/api/~user_shopping_list'
        };
        webClient(requestOptions)
            .then(function(response) {
                pageContext.cartStatusEmpty = true;
                pageContext.categories = {};
            }, function(response) {
                var problemMsg = 'Failed to clear your cart. Please try again.';
                displayAlert(true, problemMsg);
            });
    };
}