const Constants = require('../../Constants');
const Util = require('../../Util');

function FeneconSurplusPowerSensorAccessory(ServiceParam, CharacteristicParam, platform) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.platform = platform;
  this.log = platform.log;
  this.id = platform.name + " " + "SurplusPowerSensor";
  this.name = platform.name + " " + "Surplus Power Sensor";
  this.surplus_power_time_to_switch_in_minutes =  this.platform.config["surplus_power_time_to_switch_in_minutes"];
  if (this.surplus_power_time_to_switch_in_minutes === undefined || this.surplus_power_time_to_switch_in_minutes === null || this.surplus_power_time_to_switch_in_minutes === "" || this.surplus_power_time_to_switch_in_minutes < 1) {
    this.surplus_power_time_to_switch_in_minutes = Constants.DEFAULT_SURPLUS_POWER_TIME_TO_SWITCH_IN_MINUTES;
  }
  this.surplus_power_minimum_watt_to_sell =  this.platform.config["surplus_power_minimum_watt_to_sell"];
  if (this.surplus_power_minimum_watt_to_sell === undefined || this.surplus_power_minimum_watt_to_sell === null || this.surplus_power_minimum_watt_to_sell === "" || this.surplus_power_minimum_watt_to_sell < 100) {
    this.surplus_power_minimum_watt_to_sell = Constants.DEFAULT_SURPLUS_POWER_MINIMUM_WATT_TO_SELL;
  }
  this.surplus_power_only_when_battery_full =  this.platform.config["surplus_power_only_when_battery_full"];
  if (this.surplus_power_only_when_battery_full === undefined || this.surplus_power_only_when_battery_full === null || this.surplus_power_only_when_battery_full === "") {
    this.surplus_power_only_when_battery_full = Constants.DEFAULT_SURPLUS_POWER_ONLY_WHEN_BATTERY_FULL;
  }
  this.currentData = [];
  this.currentClosed = null;

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Manufacturer, "FeneconPlatform");
  this.informationService.setCharacteristic(Characteristic.SerialNumber, "FeneconSurplusPowerSensorAccessory-" + this.id);
  this.informationService.setCharacteristic(Characteristic.Model, "FeneconSurplusPowerSensorAccessory-" + this.name);

  this.service = new Service.ContactSensor(this.name);
  this.service.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getState.bind(this));
}

FeneconSurplusPowerSensorAccessory.prototype.setCurrentData = function(currentData) {
  const newState = this.getNewStateFromData(currentData);
  const stateChange = this.currentClosed === null || newState !== this.currentClosed;
  if(stateChange && !this.timeoutSet) {
    //this.log("setTimeout:" + (this.surplus_power_time_to_switch_in_minutes * 60 * 1000))
    this.timeoutSet = setTimeout(this.updateFromTimeout.bind(this,currentData), this.surplus_power_time_to_switch_in_minutes * 60 * 1000);
  }
  else if(stateChange && this.timeoutSet) {
    //this.log("timeout already set, nothing to do");
  }
  else if(this.timeoutSet) {
    //this.log("remove timeout as switched back to no change during timeout");
    clearTimeout(this.timeoutSet);
    this.timeoutSet = null;
  }
}

FeneconSurplusPowerSensorAccessory.prototype.updateFromTimeout = function(currentData) {
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

FeneconSurplusPowerSensorAccessory.prototype.getFromLoadedData = function(data) {
  if(!data) {
    return {};
  }
  const collectedData = {};
  for (const singleData of data) {
    if(singleData.address === "_sum/GridActivePower") {
      collectedData.GridActivePower = singleData;
    }
    else if(singleData.address === "_sum/EssSoc") {
      collectedData.EssSoc = singleData;
    }
  }
  if(!collectedData.EssSoc || !collectedData.EssSoc) {
    return {};
  }
  return collectedData;
}

FeneconSurplusPowerSensorAccessory.prototype.getNewStateFromData = function(data) {
  const singleData = this.getFromLoadedData(data);

  let gridActivePower = 0;
  if(singleData.GridActivePower && singleData.GridActivePower.value) {
    gridActivePower = singleData.GridActivePower.value;
  }

  let essSoc = 0;
  if(singleData.EssSoc && singleData.EssSoc.value) {
    essSoc = singleData.EssSoc.value;
  }

  let state = false;
  const sellMinimumReached = gridActivePower <= (this.surplus_power_minimum_watt_to_sell * -1);
  const batteryFull = essSoc === 100;
  if(sellMinimumReached && (batteryFull || !this.surplus_power_only_when_battery_full)) {
    state = true;
  }
  return state;
}

FeneconSurplusPowerSensorAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current surplus power for '%s'...", this.id);
  const newState = this.getNewStateFromData(this.currentData);
  this.currentClosed = newState;

  this.log.debug("Surplus power for '%s' is '%s'", this.id, newState);
  callback(null, newState ? Characteristic.ContactSensorState.CONTACT_DETECTED : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
};

FeneconSurplusPowerSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
};

module.exports = FeneconSurplusPowerSensorAccessory;
