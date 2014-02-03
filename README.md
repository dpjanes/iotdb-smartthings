iotdb-smartthings
=================

Well-documented code to:

* Demo how to write using the SmartThings API
* Control / Monitor SmartThings from Python
* Control / Monitor SmartThings from Node-JS
* Broadcast SmartThings events to MQTT

Courtesy of IOTDB. Follow us on Twitter:
* @iotdb
* @dpjanes

## Important Notes

The SmartThings code broadcasts everything you do
to MQTT. It's anonymous enough but you may find it
creepy and it's easily turned off by editing
<code>smartthings.groovy</code>.

## Installation

This is somewhat developer-y. At some point
we'll make a more general user friendly version of this.

### Clone this project into a local directory

    git clone https://github.com/dpjanes/iotdb-smartthings.git

### Log into SmartThings

https://graph.api.smartthings.com/

If necessary, do what it takes to become a Developer

### Create New App

Go to:

https://graph.api.smartthings.com/ide/apps

Click on "+ New SmartApp"

<img src="./images/ST1.png" />

### Fill in the App Details

Make sure to "Enable OAuth" and to copy the two values produced. You'll need them them later. Press the *Create* (or *Update* maybe) button. Authorize access to as much as your comfortable with, you can always change this later from your iPhone or Android app.

<img src="./images/ST2.png" />

### Add the code

* Press the *Code* button
* Copy the code from <code>smartthings.groovy</code> and paste
* Press *Save*
* Press *Publish*

<img src="./images/ST3.png" />

## Authorize

To access the API key, you need an <code>access\_token</code>. 
Normally this is a real pain in the arse to generate, but we've
done the hard work.

You'll need the <code>OAuth Client ID</code> and <code>OAuth Client Secret</code>, 
which you copied from the last major step. If you didn't, you can go back 
and get them now.

* Go to this page: https://iotdb.org/playground/oauthorize/smartthings
* Fill in the form
* Press *Submit*
* You'll be brought to the SmartThings website, where you'll allow access to your stuff
* When that's done, you'll be brought back to IOTDB OAuthorize
* copy the JSON data displayed and save it in a file called <code>smartthings.json</code>
in the same directory 

Keep that file to yourself. If you need to turn off access to your things, you can
just go generate new OAuth keys in SmartThings.

If you add new devices to your SmartThings setup, you can give the API access using
your SmartThings phone app.

## API Access
### Python 
#### List all the motion detectors

    $ python smartthings.py --type motion
    [
      {
        "id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", 
        "label": "Motion LivingRoom", 
        "type": "motion", 
        "url": "http://graph.api.smartthings.com/api/smartapps/installations/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/motion/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", 
        "value": {
          "motion": false, 
          "timestamp": "2014-02-03T13:30:31.361Z"
        }
      }
    ]

#### Turn off a switch

    $ python smartthings.py --type switch --id "My Z-Wave Switch" --request switch=0

#### Toggle a switch

    $ python smartthings.py --type switch --id "My Z-Wave Switch" --request switch=-1

### Node

A work in progress. The code is solid, but there's no command line argument parsing
