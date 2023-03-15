const Constants = require('../../Constants');
const Util = require('../../Util');

function FeneconSurplusPowerSensorAccessory(ServiceParam, CharacteristicParam, platform) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.platform = platform;
  this.log = platform.log;
  this.id = platform.name + " " + "SurplusPowerSensor";
  this.name = platform.name + " " + "Surplus Power Sensor";
  this.currentData = [];

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Manufacturer, "FeneconPlatform");
  this.informationService.setCharacteristic(Characteristic.SerialNumber, "FeneconSurplusPowerSensorAccessory-" + this.id);
  this.informationService.setCharacteristic(Characteristic.Model, "FeneconSurplusPowerSensorAccessory-" + this.name);

  this.service = new Service.ContactSensor(this.name);
  this.service.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getState.bind(this));
}

FeneconSurplusPowerSensorAccessory.prototype.setCurrentData = function(currentData) {
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

FeneconSurplusPowerSensorAccessory.prototype.getFromLoadedData = function() {
  const currentData = {};
  if(!this.currentData) {
    return currentData;
  }
  for (const currentDataTmp of this.currentData) {
    if(currentDataTmp.address === "_sum/GridActivePower") {
      currentData.GridActivePower = currentDataTmp;
    }
    else if(currentDataTmp.address === "_sum/EssSoc") {
      currentData.EssSoc = currentDataTmp;
    }
  }
  return currentData;
}

FeneconSurplusPowerSensorAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current surplus power for '%s'...", this.id);
  const data = this.getFromLoadedData();

  let gridActivePower = 0;
  if(data.GridActivePower.value) {
    gridActivePower = data.GridActivePower.value;
  }

  let essSoc = 0;
  if(data.EssSoc.value) {
    essSoc = data.EssSoc.value;
  }

  let state = false;
  const sell = gridActivePower < 0;
  const batteryFull = essSoc === 100;
  if(sell && batteryFull) {
    state = true;
  }

  this.log.debug("Surplus power for '%s' is '%s'", this.id, state);
  callback(null, state ? Characteristic.ContactSensorState.CONTACT_DETECTED : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
};

FeneconSurplusPowerSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
};

module.exports = FeneconSurplusPowerSensorAccessory;
