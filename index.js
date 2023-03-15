const FeneconPlatform = require('./src/homekit/FeneconPlatform');
const FeneconAccessory = require('./src/homekit/accessories/FeneconAccessory');
const FeneconSurplusPowerSensorAccessory = require('./src/homekit/accessories/FeneconSurplusPowerSensorAccessory');
const FeneconBatteryFullSensorAccessory = require('./src/homekit/accessories/FeneconBatteryFullSensorAccessory');

module.exports = function(homebridge) {
  homebridge.registerPlatform("homebridge-fenecon", "Fenecon", FeneconPlatform);
  homebridge.registerAccessory("homebridge-fenecon", "FeneconAccessory", FeneconAccessory);
  homebridge.registerAccessory("homebridge-fenecon", "FeneconSurplusPowerSensorAccessory", FeneconSurplusPowerSensorAccessory);
  homebridge.registerAccessory("homebridge-fenecon", "FeneconBatteryFullSensorAccessory", FeneconBatteryFullSensorAccessory);
};
