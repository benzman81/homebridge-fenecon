# homebridge-fenecon
A plugin to get data from fenecon home and probably openems for Homebridge: [Homebridge](https://github.com/nfarina/homebridge).

Currently supports: Fenecon Home

# Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-fenecon`
3. Update your configuration file. See example config.json snippet below.

# Accessories

## Production in Watt
The current production in watt.

## Consumption in Watt
The current consumption in watt.

## Buy in Watt
The current buy value in watt.

## Sell in Watt
The current sell value in watt.

## Battery full sensor
A contact sensor to be closed if battery is full according to settings.

## Surplus power sensor
A contact sensor to be closed if surplus power is reached according to settings.

## On Grid / Off Grid sensor
A contact sensor to be closed if on grid and open if off grid.

# Configuration
Example config.json:
```
    {
        "platforms": [
            {
                "platform": "Fenecon",
                "name": "MyFenecon",
                "server_name_or_ip": "Fenecon-FEMS12345",
                "pull_intervall_seconds": 300, // minimum is 15 seconds
                "battery_full_percentage": 100, // default 95
                "battery_time_to_switch_in_minutes": 2, // default 5 minutes, minimum 1 minute, must be larger than pull_intervall_seconds
                "surplus_power_minimum_watt_to_sell": 2000, // default 1000, minumum 100
                "surplus_power_time_to_switch_in_minutes": 2, // default 5 minutes, minimum 1 minute, must be larger than pull_intervall_seconds
                "surplus_power_only_when_battery_full": true //default false
            }
        ]
    }
```

## Setting battery_full_percentage
The percentage the battery is considerd full and thus the battery full sensor is triggered.

## Setting surplus_power_minimum_watt_to_sell
This is the mininum watt that needs to be currently selled to trigger the surplus power sensor.

## Setting surplus_power_time_to_switch_in_minutes
This is the ammount of timein minutes the minumum watt to sell must be sold to trigger the surplus power sensor.

## Setting surplus_power_only_when_battery_full
If this is set to true, the surplus power sensor is only triggered if the battery is already fully loaded.

# TDB
- Config Schema for Config UI