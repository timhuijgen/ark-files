module.exports = class AsaBinaryParser {

    constructor(data) {
        this.buffer = Buffer.from(data);
    }

    /**
     * @param {string} property
     * @returns {*}
     */
    getProperty(property) {
        let propertyOffset = this.buffer.indexOf(property);

        // Return false if there is none
        if(propertyOffset === -1) { return false; }

        let offset = propertyOffset + property.length + 1;
        // Get the length of the property type
        let propertyTypeLength = this.buffer.readUInt32LE(offset);
        offset += 4;
        // Read the actual property type
        let propertyType = this.buffer.toString('utf8', offset, offset + propertyTypeLength);
        offset += propertyTypeLength;

        // Skip size and index
        offset += 8;

        switch(propertyType.replace(/\0[\s\S]*$/g,'')) {
            case 'ArrayProperty':
                return AsaBinaryParser.getArrayProperty(offset, this.buffer);
            case 'StrProperty':
                return AsaBinaryParser.trim(
                    AsaBinaryParser.getStringProperty(offset, this.buffer)
                );
            case 'IntProperty':
                return AsaBinaryParser.getIntProperty(offset, this.buffer);
            case 'UInt16Property':
                return AsaBinaryParser.getUInt16Property(offset, this.buffer);
            case 'UInt32Property':
                return AsaBinaryParser.getUInt32Property(offset, this.buffer);
            case 'UInt64Property':
                return AsaBinaryParser.getUInt64Property(offset, this.buffer);
        }
    }

    /**
     * Get steam ID from ark player file, improved for ASA format
     * @returns {number}
     */
    getSteamId() {
        // Try to find the Steam ID in different locations
        let steamIdPatterns = [
            'UniqueNetIdRepl',
            'SteamNetworkingIdentity',
            'NetId'
        ];

        for (let identifier of steamIdPatterns) {
            let idOffset = this.buffer.indexOf(identifier);
            if (idOffset === -1) continue;

            // Try different offsets after the identifier
            for (let extraOffset of [9, 13, 17, 21, 25]) {
                let start = idOffset + identifier.length + extraOffset;
                let end = start + 17;
                
                if (end > this.buffer.length) continue;
                
                let steamIdStr = this.buffer.toString('utf8', start, end);
                let steamId = parseInt(steamIdStr);
                
                if (!isNaN(steamId) && steamId > 76000000000000000 && steamId < 77000000000000000) {
                    return steamId;
                }
            }
        }

        // If that doesn't work, search for Steam ID pattern in the entire buffer
        let bufferStr = this.buffer.toString('utf8');
        let steamIdMatch = bufferStr.match(/76[0-9]{15}/);
        if (steamIdMatch) {
            return parseInt(steamIdMatch[0]);
        }

        return NaN;
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {string}
     */
    static getStringProperty(offset, buffer) {
        // For ASA format:
        // After skipping the 8 bytes (size and index), the string structure is:
        // [4 bytes length][string data including null terminator]
        
        // Get property length (includes null terminator)
        let propertyLength = buffer.readInt32LE(offset);
        offset += 4;

        // return value (exclude null terminator)
        return buffer.toString('utf8', offset, offset + propertyLength - 1);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Array}
     */
    static getArrayProperty(offset, buffer) {
        let arr = [],
            propertySubtypeLength = buffer.readInt32LE(offset);
        offset += 4;

        let propertySubtype = buffer.toString('utf8', offset, offset + propertySubtypeLength);
        offset += propertySubtypeLength;

        // Read the array length
        let arrayLength = buffer.readUInt32LE(offset);
        offset += 4;

        // Loop for array length
        for(let i = 0; i < arrayLength; i++) {
            // Placeholder for value
            let value;
            // Switch the array type
            switch(propertySubtype.replace(/\0[\s\S]*$/g,'')) {
                case 'StrProperty':
                    value = AsaBinaryParser.getStringProperty(offset, buffer);
                    // Add the length of the value as extra offset
                    offset += value.length;
                    break;
                case 'IntProperty':
                    value = AsaBinaryParser.getIntProperty(offset, buffer);
                    break;
                case 'UInt16Property':
                    value = AsaBinaryParser.getUInt16Property(offset, buffer);
                    break;
                case 'UInt32Property':
                    value = AsaBinaryParser.getUInt32Property(offset, buffer);
                    break;
                case 'UInt64Property':
                    value = AsaBinaryParser.getUInt64Property(offset, buffer);
                    break;
            }

            // Offset for the property
            offset += 4;
            // Trim and push to the array
            arr.push(AsaBinaryParser.trim(value));
        }

        return arr;
    }

    /**
     *
     * @param {number} offset
     * @param {Buffer} buffer
     */
    static getIntProperty(offset, buffer) {
        return buffer.readInt32LE(offset);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Number}
     */
    static getUInt16Property(offset, buffer) {
        return buffer.readUInt16LE(offset);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Number}
     */
    static getUInt32Property(offset, buffer) {
        return buffer.readUInt32LE(offset);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Number}
     */
    static getUInt64Property(offset, buffer) {
        return buffer.readUInt32LE(offset, true);
    }

    /**
     * Trim \u0000 and other whitespace from string
     * @param {string} value
     * @returns {string}
     */
    static trim(value) {
        return value.replace(/\0[\s\S]*$/g,'');
    }

};
