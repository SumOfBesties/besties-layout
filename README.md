# nsg2-layouts

Broadcast graphics for speedrun marathon events from the [Norway Speedrunner Gathering](https://nsgmarathon.com/)

## Setup

- Clone this repository to `[nodecg]/bundles/nsg2-layouts`
- Install dependencies: `npm i`
- Run build: `npm run build`

### Configuration

To configure this bundle, create the file `[nodecg]/cfg/nsg2-layouts.json` with the following contents:

```json
{
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
    "username": "example-user",
    "password": "example-pwd",
    "eventId": 2
  }
}
```

Find a list of time zones [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).

## Usage

### Game layout

Opening the game layout graphic with the `is-layout-leader` query parameter allows it to take charge of positioning 
camera sources in OBS. This allows multiple game layout graphics to be open without them potentially interfering with 
one another.  
Example: `http://localhost:9090/bundles/nsg2-layouts/graphics/game-layout.html?is-layout-leader`

#### Other npm commands

- `build`: Create a production-ready build.
- `build:dev`: Create a development build with better debugging options.
- `build:clean`: Combines `build` and `clean` tasks.
- `clean`: Removes built files.
- `start`: Starts NodeCG.
- `watch`: Runs a build and rebuilds when changes are found.
- `schema-types`: Create or update type definitions for replicant schemas found in the `schemas` directory
- `test`: Run project tests. As of writing, tests are only written for a limited set of more complicated logic in the application.
