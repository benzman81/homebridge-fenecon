# homebridge-fenecon
A plugin to get data from fenecon home and probably openems for Homebridge: [Homebridge](https://github.com/nfarina/homebridge).

Currently supports: TBD

# Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-fenecon`
3. Update your configuration file. See example config.json snippet below.

# Configuration
Example config.json:
```
    {
        "platforms": [
            {
                "platform": "Fenecon",
                "name": "MyFenecon",
                "server_name_or_ip": "Fenecon-FEMS12345",
                "pull_intervall_seconds": 300 // minimum is 15 seconds
            }
        ]
    }
```

# TDB
- Implement initial version
- interval poll and update
- Config Schema for Config UI