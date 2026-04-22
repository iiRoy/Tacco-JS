const payloadSource = require(__dirname + '/payload_source_module.js');

function NotificationObject(inputRecord) {
    payloadSource.MessageBase.call(this);
    const dataProcessor = Object.getOwnPropertyDescriptor(payloadSource.MessageBase.prototype, 'unmarshall').value;
    dataProcessor.call(this, inputRecord);
}

Object.setPrototypeOf(NotificationObject.prototype, payloadSource.MessageBase.prototype);
NotificationObject.prototype.constructor = NotificationObject;
NotificationObject.baseComponent = payloadSource.MessageBase;

module.exports.NotificationObject = NotificationObject;