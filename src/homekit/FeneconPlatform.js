const Constants = require('../Constants');
const Util = require('../Util');

const FeneconAccessory = require('./accessories/FeneconAccessory');
const FeneconSurplusPowerSensorAccessory = require('./accessories/FeneconSurplusPowerSensorAccessory');
const FeneconBatteryFullSensorAccessory = require('./accessories/FeneconBatteryFullSensorAccessory');

let Service, Characteristic, FakeGatoHistoryService;

function FeneconPlatform(log, config, homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  FakeGatoHistoryService = require('fakegato-history')(homebridge);

  this.log = log;
  this.name = config["name"] || "Fenecon";
  this.server_name_or_ip = config["server_name_or_ip"];
  this.pull_intervall_seconds = config["pull_intervall_seconds"];
  if (this.pull_intervall_seconds == null || this.pull_intervall_seconds == "" || this.pull_intervall_seconds < 15) {
    this.pull_intervall_seconds = Constants.DEFAULT_PULL_INTERVALL_SECONDS;
  }
  this.currentData = [];

  this.loadData();
  setInterval(this.loadData.bind(this), this.pull_intervall_seconds * 1000);
};

FeneconPlatform.prototype.loadData = function() {
  const onSuccessCallback = function(json){
    this.currentData = json;
    for (const accessory of this.accessories) {
      accessory.setCurrentData(this.currentData);
    }
  }.bind(this);
  const onFailureCallback = function(){
    this.log("onFailureCallback called");
    this.currentData = [];
    for (const accessory of this.accessories) {
      accessory.setCurrentData(this.currentData);
    }
  };
  const baseURL = "http://x:user@"+this.server_name_or_ip+"/rest/channel/";
  Util.callHttpApi(this.log, baseURL+"_sum/.*", onSuccessCallback, onFailureCallback);
}

FeneconPlatform.prototype.accessories = function(callback) {
  this.accessories = [];

  this.accessories.push(new FeneconAccessory(Service, Characteristic, FakeGatoHistoryService, this, "Consumption", "_sum/ConsumptionActivePower"));
  this.accessories.push(new FeneconAccessory(Service, Characteristic, FakeGatoHistoryService, this, "Production", "_sum/ProductionActivePower"));
  this.accessories.push(new FeneconAccessory(Service, Characteristic, FakeGatoHistoryService, this, "Buy", "_sum/GridActivePower"));
  this.accessories.push(new FeneconAccessory(Service, Characteristic, FakeGatoHistoryService, this, "Sell", "_sum/GridActivePower"));

  this.accessories.push(new FeneconSurplusPowerSensorAccessory(Service, Characteristic, this));
  this.accessories.push(new FeneconBatteryFullSensorAccessory(Service, Characteristic, this));

  callback(this.accessories);
};

module.exports = FeneconPlatform;
