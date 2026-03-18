# ark-files
Read and parse Ark player profile and tribe files. Supports both **ARK: Survival Evolved (ASE)** and **ARK: Survival Ascended (ASA)** formats.

Install:
`npm install --save ark-files`

## Usage

### ARK: Survival Evolved (ASE) — default
```js
const ArkFiles = require('ark-files');

let arkFiles = new ArkFiles('/path/to/my/ark/server/folder');

let players = arkFiles.getPlayers();
let tribes = arkFiles.getTribes();
```

### ARK: Survival Ascended (ASA)
```js
const { ArkFiles, ArkBinaryFormats } = require('ark-files');

let arkFiles = new ArkFiles('/path/to/my/ark/server/folder', null, ArkBinaryFormats.ASA);

let players = arkFiles.getPlayers();
let tribes = arkFiles.getTribes();
```

## Data Structures

### Players
```js
/**
 * [{
 *   Tribe: Tribe|false,
 *   PlayerName: string,
 *   Level: Number,
 *   TotalEngramPoints: Number,
 *   CharacterName: string,
 *   TribeId: Number|false,
 *   SteamId: Number,          // ASE only
 *   EosId: string,            // ASA only
 *   PlayerId: Number,
 *   FileCreated: string,
 *   FileUpdated: string
 * }]
 */
```

### Tribes
```js
/**
 * [{
 *   Players: Players[],
 *   Name: string,
 *   OwnerId: Number,
 *   Id: Number,
 *   TribeLogs: string[],
 *   TribeMemberNames: string[],
 *   FileCreated: string,
 *   FileUpdated: string
 * }]
 */
```

## Options

Players and tribes are cached in memory with a default valid period of 5 minutes.
You can pass overrides to the constructor:

```js
// Custom cache interval (in seconds)
new ArkFiles('/path/', (60 * 60)); // 1 hour

// ASA format with custom cache interval
const { ArkFiles, ArkBinaryFormats } = require('ark-files');
new ArkFiles('/path/', (60 * 60), ArkBinaryFormats.ASA);
```
