# ark-files
Read and parse Ark player profile and tribe files

Install:
`npm install`

Usage:
```
const ArkFiles = require('ark-files');

let arkFiles = new ArkFiles('/path/to/my/ark/server/folder/Ark');
let players = arkFiles.getPlayers();

/**
* Players structure:
* [{
* Tribe: Tribe|false,
* PlayerName: string,
* Level: Number,
* TotalEngramPoints: Number,
* CharacterName, 
* TribeId: Number, 
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
* FileCreated: string,
* FileUpdated: string
* }]
*/

```

Players and tribes are cached in memory with a default period of 5 minutes. 
You can pass an overwrite to the constructor.
`new ArkFiles('/path/', (60 * 60))`
