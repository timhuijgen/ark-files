const AsaBinaryParser = require('./AsaBinaryParser');
const fs = require('fs');
const path = require('path');

/**
 * Create new Player object for ASA files
 */
function asaPlayerFactory(file, arkFilesDir) {
    let data = fs.readFileSync(path.join(arkFilesDir, path.basename(file)));
    let fileData = fs.statSync(path.join(arkFilesDir, file));
    
    // Use the AsaBinaryParser for all properties including string properties
    let binaryParser = new AsaBinaryParser(data);
    
    // Extract player name and character name using the binary parser
    let playerName = binaryParser.getProperty('PlayerName') || '';
    let characterName = binaryParser.getProperty('PlayerCharacterName') || '';
    
    // Try to find EOSID for ASA files
    let eosId = '';
    let redpointEOSOffset = data.indexOf('RedpointEOS');
    if (redpointEOSOffset !== -1) {
        // EOSID is stored as 16 bytes after "RedpointEOS\0\0"
        let eosIdStart = redpointEOSOffset + 'RedpointEOS'.length + 2; // +2 for the null bytes
        let eosIdBytes = data.slice(eosIdStart, eosIdStart + 16);
        eosId = eosIdBytes.toString('hex');
    } else {
        // Fallback: extract from filename
        eosId = path.basename(file, '.arkprofile');
    }
    
    // For ASA, SteamId doesn't exist, set to NaN
    let steamId = NaN;
    
    return {
        Tribe: false,
        PlayerName: playerName,
        Level: binaryParser.getProperty('CharacterStatusComponent_ExtraCharacterLevel') + 1,
        TotalEngramPoints: binaryParser.getProperty('PlayerState_TotalEngramPoints'),
        CharacterName: characterName,
        TribeId: binaryParser.getProperty('TribeID'),  // Fixed: TribeID not TribeId
        SteamId: steamId,
        EosId: eosId,
        PlayerId: binaryParser.getProperty('PlayerDataID'),
        FileCreated: formatTime(fileData.birthtime),
        FileUpdated: formatTime(fileData.mtime)
    };
}

// Simple time formatting function
function formatTime(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { asaPlayerFactory };
