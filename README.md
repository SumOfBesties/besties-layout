# nsg2-layouts

Broadcast graphics for speedrun marathon events from the [Norway Speedrunner Gathering](https://nsgmarathon.com/), informally known as "Norskontrol".

## Setup

- Clone this repository to `[nodecg]/bundles/nsg2-layouts`
- Install dependencies: `npm i`
- Run build: `npm run build`

### Configuration

To configure this bundle, create the file `[nodecg]/cfg/nsg2-layouts.json` with the following contents:

```json
{
  "intermission": {
      "addVisualizerSpace": true
  },
  "obs": {
    "sceneDataInTransitionEvents": false
  },
  "event": {
    "timezone": "Europe/Oslo",
    "name": "NSG Fall 2024",
    "donationUrl": "donate.nsgmarathon.com"
  },
  "oengus": {
    "useSandbox": false
  },
  "tracker": {
    "address": "tracker.example.org",
    "socketAddress": "wss://tracker.example.org/tracker/ws/donations/",
    "username": "example-user",
    "password": "example-pwd",
    "eventId": 2
  },
  "twitch": {
    "clientId": "twitch_client_id",
    "clientSecret": "twitch_client_secret",
    "redirectUri": "http://localhost:9090/nsg2-layouts/twitch-auth",
    "titleTemplates": {
      "speedrun": "NSG Fall 2024: {{title}} [{{category}}] by {{talent}}",
      "race": "NSG Fall 2024: {{title}} [{{category}}] - {{talent}}",
      "other": "NSG Fall 2024: {{title}} by {{talent}}",
      "withoutTalent": "NSG Fall 2024: {{title}}",
      "fallback": "NSG Fall 2024 benefiting Norges Blindeforbund"
    }
  },
  "foobar2000": {
    "address": "http://localhost:8880",
    "username": "fb2k-user",
    "password": "fb2k-pwd"
  },
  "x32": {
    "address": "192.168.1.102",
    "transitionFps": 10,
    "defaultSpeakingDBThreshold": -65,
    "disableNameplateVolumeMeters": false,
    "transitionDurations": {
        "mute": 500,
        "unmute": 750
    },
    "channelMapping": {
      "runners": [{ "type": "DCA", "number": 1 }],
      "games": [{ "type": "DCA", "number": 2 }]
    }
  }
}
```

#### Time zones

Find a list of time zones [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).

#### Music

Music information is gathered through foobar2000 with the [beefweb](https://github.com/hyperblast/beefweb) plugin installed.

#### X32 integration

When configuring mixer channel mappings (`x32.channelMappings`), the following channel types are accepted:
`CHANNEL`, `AUX_IN`, `FX_RETURN`, `BUS`, `MATRIX` & `DCA`

#### OBS Websocket

nsg2-layouts can be used in conjunction with a [modified build of obs-websocket](https://github.com/obsproject/obs-websocket/pull/1229)
to react to scene changes when a transition starts as opposed to when it completes. If this build is in use, set the
`obs.sceneDataInTransitionEvents` property in the bundle configuration file to `true`. Otherwise, set it to `false`.

## Usage

### Game layout

Opening the game layout graphic with the `is-layout-leader` query parameter allows it to take charge of positioning 
camera sources in OBS. This allows multiple game layout graphics to be open without them potentially interfering with 
one another.  
Example: `http://localhost:9090/bundles/nsg2-layouts/graphics/game-layout.html?is-layout-leader`

### Scene name rules

The following suffixes may be added to the end of OBS scene names to modify the stream while those scenes are in the program feed.
- `[M]`: Play music
- `[G]`: Unmute game audio
- `[R]`: Unmute runners

These suffixes may be combined. For example, a scene named `Test Scene [MG]` will play music and unmute the game audio while it is in the program feed.

### Oengus login

Logging in to Oengus is possible using the Data Import dashboard panel. All Oengus functionality is present without doing 
so, but schedules will be imported without any cache on Oengus' side if the logged-in user is a moderator of the marathon 
being imported. This means that updates to the schedule will appear without any delay.

## npm commands

- `build`: Create a production-ready build.
- `build:dev`: Create a development build with better debugging options.
- `build:clean`: Combines `build` and `clean` tasks.
- `clean`: Removes built files.
- `start`: Starts NodeCG.
- `watch`: Runs a build and rebuilds when changes are found.
- `schema-types`: Create or update type definitions for replicant schemas found in the `schemas` directory
- `test`: Run project tests. As of writing, tests are only written for a limited set of more complicated logic in the application.
