# ark-files
Read and parse Ark player profile and tribe files

Install:
`npm install --save ark-files`

Usage:
```js
const ArkFiles = require('ark-files');

let arkFiles = new ArkFiles('/path/to/my/ark/server/folder');

let players = arkFiles.getPlayers();

/**
* Players structure:
* [{
* Tribe: Tribe|false,
* PlayerName: string,
* Level: Number,
* TotalEngramPoints: Number,
* CharacterName: string,
* TribeId: Number|false,
* SteamId: Number,
* PlayerId: Number,
* FileCreated: string,
* FileUpdated: string
* }]
*/

let tribes = arkFiles.getTribes();

/**
* Tribes structure:
* [{
* Players: Players[],
* Name: string,
* OwnerId: Number,
* Id: Number,
* TribeLogs: string[],
* TribeMemberNames: string[],
* FileCreated: string,
* FileUpdated: string
* }]
*/

```

Players and tribes are cached in memory with a default valid period of 5 minutes. 
You can pass an override to the constructor in seconds:

```js
new ArkFiles('/path/', (60 * 60)); // 1 hour 
```
