const Constants = require('../../Constants');
const Util = require('../../Util');

function FeneconOnOffGridSensorAccessory(ServiceParam, CharacteristicParam, platform) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.platform = platform;
  this.log = platform.log;
  this.id = platform.name + " " + "OnOffGridSensor";
  this.name = platform.name + " " + "On Off Grid Sensor";
  this.currentData = [];

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Manufacturer, "FeneconPlatform");
  this.informationService.setCharacteristic(Characteristic.SerialNumber, "FeneconOnOffGridSensorAccessory-" + this.id);
  this.informationService.setCharacteristic(Characteristic.Model, "FeneconOnOffGridSensorAccessory-" + this.name);

  this.service = new Service.ContactSensor(this.name);
  this.service.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getState.bind(this));
}

FeneconOnOffGridSensorAccessory.prototype.setCurrentData = function(currentData) {
  this.updateFromTimeout(currentData);
}

FeneconOnOffGridSensorAccessory.prototype.updateFromTimeout = function(currentData) {
  if(!currentData) {
    this.currentData = [];
  }
  this.currentData = currentData;
  this.getState(function(err,newState) {
    if(!err && this.service) {
      this.service.getCharacteristic(Characteristic.ContactSensorState).updateValue(newState);
    }
  }.bind(this));
  this.timeoutSet = null;
}

FeneconOnOffGridSensorAccessory.prototype.getFromLoadedData = function(data) {
  if(!data) {
    return {};
  }
  for (const singleData of data) {
    if(singleData.address === "_sum/GridMode") {
      return singleData;
    }
  }
  return {};
}

FeneconOnOffGridSensorAccessory.prototype.getNewStateFromData = function(data) {
  const singleData = this.getFromLoadedData(data);
  let onGrid = true;
  if(singleData.value === 2) {
    onGrid = false;
  }
  let state = false;
  if(onGrid) {
    state = true;
  }
  return state;
}

FeneconOnOffGridSensorAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current on off grid state for '%s'...", this.id);
  const newState = this.getNewStateFromData(this.currentData);

  this.log.debug("On off grid state for '%s' is '%s'", this.id, newState);
  callback(null, newState ? Characteristic.ContactSensorState.CONTACT_DETECTED : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
};

FeneconOnOffGridSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
};

module.exports = FeneconOnOffGridSensorAccessory;
