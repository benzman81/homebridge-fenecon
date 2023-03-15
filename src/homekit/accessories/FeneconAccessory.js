const Constants = require('../../Constants');
const Util = require('../../Util');
const inherits = require('util').inherits;

function FeneconAccessory(ServiceParam, CharacteristicParam, FakeGatoHistoryService, platform, simpleName, address) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.FakeGatoHistoryService = FakeGatoHistoryService;

  this.platform = platform;
  this.log = platform.log;

  this.simpleName = simpleName;
  this.id = platform.name + " " + simpleName;
  this.name = platform.name + " " + simpleName;
  this.address = address;
  this.services = [];
  this.currentData = [];

  const informationService = new Service.AccessoryInformation();
  informationService.setCharacteristic(Characteristic.Manufacturer, "FeneconPlatform");
  informationService.setCharacteristic(Characteristic.SerialNumber, "FeneconAccessory-" + this.id);
  informationService.setCharacteristic(Characteristic.Model, "FeneconAccessory-" + this.name);
  this.services.push(informationService);

  var EvePowerConsumption = function() {
      Characteristic.call(this, 'Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
      this.setProps({
          format: Characteristic.Formats.UINT16,
          unit: 'watts',
          maxValue: 1000000000,
          minValue: 0,
          minStep: 1,
          perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
  };
  inherits(EvePowerConsumption, Characteristic);

  var EveTotalPowerConsumption = function() {
      Characteristic.call(this, 'Total Consumption', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
      this.setProps({
          format: Characteristic.Formats.FLOAT, // Deviation from Eve Energy observed type
          unit: 'kilowatthours',
          maxValue: 1000000000,
          minValue: 0,
          minStep: 0.001,
          perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
  };
  inherits(EveTotalPowerConsumption, Characteristic);

  const loggingService = new FakeGatoHistoryService("energy", this, { storage: 'fs' });
  this.services.push(loggingService);

  var PowerMeterService = function(displayName, subtype) {
      Service.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
      this.addCharacteristic(EvePowerConsumption);
      this.addOptionalCharacteristic(EveTotalPowerConsumption);
  };
  inherits(PowerMeterService, Service);

  var powerMeterService = new PowerMeterService(this.name);
  this.EvePowerConsumptionCharacteristic = powerMeterService.getCharacteristic(EvePowerConsumption);
  this.EvePowerConsumptionCharacteristic.on('get', this.getPowerConsumption.bind(this));
  powerMeterService.addCharacteristic(EveTotalPowerConsumption).on('get', this.getTotalPowerConsumption.bind(this));
  this.services.push(powerMeterService);
}

FeneconAccessory.prototype.setCurrentData = function(currentData) {
  if(!currentData) {
    this.currentData = [];
  }
  this.currentData = currentData;
  this.getPowerConsumption(function(err,powerConsumption) {
    if(!err && this.EvePowerConsumptionCharacteristic) {
      this.EvePowerConsumptionCharacteristic.updateValue(powerConsumption);
    }
  }.bind(this));
}

FeneconAccessory.prototype.getFromLoadedData = function() {
  if(!this.currentData) {
    return {};
  }
  for (const currentData of this.currentData) {
    if(currentData.address === this.address) {
      return currentData;
    }
  }
  return {};
}

FeneconAccessory.prototype.getPowerConsumption = function (callback) {
  const data = this.getFromLoadedData();
  let powerConsumption = 0;
  if(data.value) {
    powerConsumption = data.value;
  }

  if(this.address === "_sum/GridActivePower") {
    if(this.simpleName === "Sell") {
      if(powerConsumption > 0)  {
        powerConsumption = 0;
      }
    }
    else {
      if(powerConsumption < 0)  {
        powerConsumption = 0;
      }
    }
  }

  if(powerConsumption < 0) {
    powerConsumption = powerConsumption * -1;
  }
  callback(null, powerConsumption);
};

FeneconAccessory.prototype.getTotalPowerConsumption = function (callback) {
  callback(null, 0);
};

FeneconAccessory.prototype.getServices = function() {
  return this.services;
};

module.exports = FeneconAccessory;
