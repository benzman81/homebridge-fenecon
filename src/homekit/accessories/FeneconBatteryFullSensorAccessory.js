const Constants = require('../../Constants');
const Util = require('../../Util');

function FeneconBatteryFullSensorAccessory(ServiceParam, CharacteristicParam, platform) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.platform = platform;
  this.log = platform.log;
  this.id = platform.name + " " + "BatteryFullSensor";
  this.name = platform.name + " " + "Battery Full Sensor";
  this.currentData = [];

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Manufacturer, "FeneconPlatform");
  this.informationService.setCharacteristic(Characteristic.SerialNumber, "FeneconBatteryFullSensorAccessory-" + this.id);
  this.informationService.setCharacteristic(Characteristic.Model, "FeneconBatteryFullSensorAccessory-" + this.name);

  this.service = new Service.ContactSensor(this.name);
  this.service.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getState.bind(this));
}

FeneconBatteryFullSensorAccessory.prototype.setCurrentData = function(currentData) {
  if(!currentData) {
    this.currentData = [];
  }
  this.currentData = currentData;
  this.getState(function(err,newState) {
    if(!err && this.service) {
      this.service.getCharacteristic(Characteristic.ContactSensorState).updateValue(newState);
    }
  }.bind(this));
}

FeneconBatteryFullSensorAccessory.prototype.getFromLoadedData = function() {
  if(!this.currentData) {
    return {};
  }
  for (const currentData of this.currentData) {
    if(currentData.address === "_sum/EssSoc") {
      return currentData;
    }
  }
  return {};
}

FeneconBatteryFullSensorAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current battery full state for '%s'...", this.id);
  const data = this.getFromLoadedData();
  let batteryState = 0;
  if(data.value) {
    batteryState = data.value;
  }
  let state = false;
  if(batteryState  === 100) {
    state = true;
  }

  this.log.debug("Battery full state for '%s' is '%s'", this.id, state);
  callback(null, state ? Characteristic.ContactSensorState.CONTACT_DETECTED : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
};

FeneconBatteryFullSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
};

module.exports = FeneconBatteryFullSensorAccessory;
