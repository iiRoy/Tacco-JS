const webFramework = require('restify');
const configurationProvider = require('../config');
const EventScheduler = require('../controllers/calendarController');

const requestThrottler = webFramework.throttle({
    burst: configurationProvider.limiter.defaultBurstRate,
    rate: configurationProvider.limiter.defaultRatePerSec,
    ip: true
});

function actionDispatcher(methodIdentifier) {
    return function(clientRequest, serverResponse, continuation) {
        const schedulerInstance = new EventScheduler(clientRequest, serverResponse, continuation);
        schedulerInstance[methodIdentifier]();
    };
}

const endpointConfigurations = [
    {
        verb: 'get',
        pathSegment: '/api/calendar/weekday',
        handlerMethod: 'getCalendarDay'
    },
    {
        verb: 'post',
        pathSegment: '/api/calendar/appointment',
        handlerMethod: 'postCalendarAppointment'
    }
];

function RoutingSetup(applicationGateway) {
    endpointConfigurations.forEach(endpoint => {
        const specificHandler = actionDispatcher(endpoint.handlerMethod);
        applicationGateway[endpoint.verb](endpoint.pathSegment, requestThrottler, specificHandler);
    });
}

module.exports.initializerFunction = RoutingSetup;