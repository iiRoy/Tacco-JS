const tradingModule = require("./cexapi.js");

const outputManager = {
    publishMessage: function(content) {
        console.log(content);
    }
};

Reflect.apply(tradingModule.create, tradingModule, [username, api_key, api_secret]);
Reflect.apply(tradingModule.balance, tradingModule, [outputManager.publishMessage]);