var FeneconPlatform = require('./src/homekit/FeneconPlatform');
var FeneconAccessory = require('./src/homekit/accessories/FeneconAccessory');

module.exports = function(homebridge) {
  homebridge.registerPlatform("homebridge-fenecon", "Fenecon", FeneconPlatform);
  homebridge.registerAccessory("homebridge-fenecon", "FeneconAccessory", FeneconAccessory);
};
