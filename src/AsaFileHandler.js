const AsaBinaryParser = require('./AsaBinaryParser');
const fs = require('fs');
const path = require('path');

/**
 * Create new Player object for ASA files
 */
function asaPlayerFactory(file, arkFilesDir) {
    let data = fs.readFileSync(path.join(arkFilesDir, path.basename(file)));
    let fileData = fs.statSync(path.join(arkFilesDir, file));
    
    // Extract strings using the exact working pattern
    function findStringProperty(data, propertyName) {
        const propertyIndex = data.indexOf(propertyName);
        if (propertyIndex === -1) return '';
        
        // First, skip past StrProperty to avoid matching it
        let strPropertyIndex = data.indexOf('StrProperty', propertyIndex);
        if (strPropertyIndex === -1) return '';
        
        let searchStart = strPropertyIndex + 'StrProperty'.length;
        
        // Search for the pattern: null byte + length (1-100) + 3 zero bytes
        for (let i = searchStart; i < searchStart + 100; i++) {
            if (data[i] === 0x00 && 
                data[i+1] >= 1 && data[i+1] <= 100 && 
                data[i+2] === 0x00 && data[i+3] === 0x00 && data[i+4] === 0x00) {
                
                let outerLength = data.readUInt32LE(i + 1);
                let dataStart = i + 5;
                
                // Now look for the actual string length within this data section
                // Based on analysis: 5 null bytes + actual_length + 3 null bytes + string
                for (let j = dataStart; j < dataStart + outerLength - 10; j++) {
                    if (data[j+4] >= 1 && data[j+4] <= 100 && 
                        data[j+5] === 0x00 && data[j+6] === 0x00 && data[j+7] === 0x00) {
                        
                        let actualLength = data.readUInt32LE(j + 4);
                        let stringStart = j + 8;
                        
                        if (stringStart + actualLength <= data.length) {
                            return data.toString('utf8', stringStart, stringStart + actualLength - 1);
                        }
                    }
                }
            }
        }
        
        return '';
    }
    
    // Extract player name and character name using dynamic parsing
    let playerName = findStringProperty(data, 'PlayerName');
    let characterName = findStringProperty(data, 'PlayerCharacterName');
    
    // Use the AsaBinaryParser for other properties
    let binaryParser = new AsaBinaryParser(data);
    
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
        TribeId: binaryParser.getProperty('TribeId'),
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
