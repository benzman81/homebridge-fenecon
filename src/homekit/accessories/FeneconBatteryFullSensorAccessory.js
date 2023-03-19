const Constants = require('../../Constants');
const Util = require('../../Util');

function FeneconBatteryFullSensorAccessory(ServiceParam, CharacteristicParam, platform) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.platform = platform;
  this.log = platform.log;
  this.id = platform.name + " " + "BatteryFullSensor";
  this.name = platform.name + " " + "Battery Full Sensor";
  this.battery_full_percentage =  this.platform.config["battery_full_percentage"];
  if (this.battery_full_percentage === undefined || this.battery_full_percentage === null || this.battery_full_percentage === "" || this.battery_full_percentage < 1 || this.battery_full_percentage > 100) {
    this.battery_full_percentage = Constants.DEFAULT_BATTERY_FULL_PERCENTAGE;
  }
  this.battery_time_to_switch_in_minutes =  this.platform.config["battery_time_to_switch_in_minutes"];
  if (this.battery_time_to_switch_in_minutes === undefined || this.battery_time_to_switch_in_minutes === null || this.battery_time_to_switch_in_minutes === "" || this.battery_time_to_switch_in_minutes < 1) {
    this.battery_time_to_switch_in_minutes = Constants.DEFAULT_BATTERY_FULL_TIME_TO_SWITCH_IN_MINUTES;
  }
  this.currentData = [];
  this.currentClosed = null;

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Manufacturer, "FeneconPlatform");
  this.informationService.setCharacteristic(Characteristic.SerialNumber, "FeneconBatteryFullSensorAccessory-" + this.id);
  this.informationService.setCharacteristic(Characteristic.Model, "FeneconBatteryFullSensorAccessory-" + this.name);

  this.service = new Service.ContactSensor(this.name);
  this.service.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getState.bind(this));
}

FeneconBatteryFullSensorAccessory.prototype.setCurrentData = function(currentData) {
  const newState = this.getNewStateFromData(currentData);
  const stateChange = this.currentClosed === null || newState !== this.currentClosed;
  if(stateChange && !this.timeoutSet) {
    //this.log("setTimeout:" + (this.battery_time_to_switch_in_minutes * 60 * 1000))
    this.timeoutSet = setTimeout(this.updateFromTimeout.bind(this,currentData), this.battery_time_to_switch_in_minutes * 60 * 1000);
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

FeneconBatteryFullSensorAccessory.prototype.updateFromTimeout = function(currentData) {
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

FeneconBatteryFullSensorAccessory.prototype.getFromLoadedData = function(data) {
  if(!data) {
    return {};
  }
  for (const singleData of data) {
    if(singleData.address === "_sum/EssSoc") {
      return singleData;
    }
  }
  return {};
}

FeneconBatteryFullSensorAccessory.prototype.getNewStateFromData = function(data) {
  const singleData = this.getFromLoadedData(data);
  let batteryState = 0;
  if(singleData.value) {
    batteryState = singleData.value;
  }
  let state = false;
  if(batteryState  >= this.battery_full_percentage) {
    state = true;
  }
  return state;
}

FeneconBatteryFullSensorAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current battery full state for '%s'...", this.id);
  const newState = this.getNewStateFromData(this.currentData);
  this.currentClosed = newState;

  this.log.debug("Battery full state for '%s' is '%s'", this.id, newState);
  callback(null, newState ? Characteristic.ContactSensorState.CONTACT_DETECTED : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
};

FeneconBatteryFullSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
};

module.exports = FeneconBatteryFullSensorAccessory;
