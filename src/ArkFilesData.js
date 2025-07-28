/**
 * Imports
 */
const util = require('./util');
const fs = require('fs');
const path = require('path');
const ArkBinaryParser = require('./ArkBinaryParser');
const ArkBinaryFormats = require('./ArkBinaryFormats');

/**
 * ArkFilesData class
 */
class ArkFilesData {

    /**
     * Constructor
     * @param {string} arkServerDir
     * @param {Number} refreshInterval
     */
    constructor(arkServerDir, refreshInterval = (60 * 5), format = ArkBinaryFormats.ASE) {
        this.arkFilesDir = path.join(arkServerDir, "ShooterGame", "Saved", "SavedArks");
        this.refreshInterval = refreshInterval;
        this.cache = {};
        this.cacheTime = 0;
        this.format = format;
    }

    /**
     * Returns an array of players
     * @returns {player[]}
     */
    getPlayers() {
        this._validateCache();
        return this.cache.players;
    }

    /**
     * Returns an array of tribes
     * @returns {tribe[]}
     */
    getTribes() {
        this._validateCache();
        return this.cache.tribes;
    }

    /**
     * Attach players to the tribe
     * @param tribe
     * @param players[]
     * @returns {tribe}
     * @private
     */
    _attachPlayersToTribe(tribe, players) {
        tribe.Players = players.filter(player => player.TribeId === tribe.Id);
        return tribe;
    }

    /**
     * Attach a tribe to the player
     * @param player
     * @param tribes[]
     * @returns {player}
     * @private
     */
    _attachTribeToPlayer(player, tribes) {
        player.Tribe = tribes.find(tribe => tribe.Id === player.TribeId) || false;

        return player;
    }

    /**
     * Checks if the cache is invalid and fetches new data if needed
     * @private
     */
    _validateCache() {
        if (this.cacheTime + this.refreshInterval < util.time()) {
            console.log('Fetching new player & tribe data from ark files');
            this.cacheTime = util.time();
            this.cache = this._fetch();
        }
    }

    /**
     * Handles the main process of getting all tribes and players
     * @returns {{players[], tribes[]}}
     * @private
     */
    _fetch() {
        const files = this._getFiles();

        // Deserialize player and tribe data, filtering out null entries (that result from parsing errors)
        const players = files.filter(ArkFilesData._filterArkProfiles).map(player => this._playerFactory(player)).filter(player => player !== null);
        const tribes = files.filter(ArkFilesData._filterArkTribes).map(tribe => this._tribeFactory(tribe)).filter(tribe => tribe !== null);
        
        return {
            players: players.map(player => this._attachTribeToPlayer(player, tribes)),
            tribes: tribes.map(tribe => this._attachPlayersToTribe(tribe, players))
        }
    }

    /**
     * Read the ark files dir and return an array of files
     * @returns []
     * @private
     */
    _getFiles() {
        return fs.readdirSync(this.arkFilesDir);
    }

    /**
     * Evaluates if a file is an arkprofile file
     * @param file
     * @returns {boolean}
     * @private
     */
    static _filterArkProfiles(file) {
        return new RegExp("^.*\\.arkprofile").test(file);
    }

    /**
     * Evaluates if a file is an arktribe file
     * @param file
     * @returns {boolean}
     * @private
     */
    static _filterArkTribes(file) {
        return new RegExp("^.*\\.arktribe").test(file);
    }

    /**
     * Read the contents of a file
     * @param file
     * @returns {Buffer}
     * @private
     */
    _readFile(file) {
        return fs.readFileSync(path.join(this.arkFilesDir, path.basename(file)));
    }

    /**
     * Create new Player object
     *
     * @param file
     * @returns {{
     * Tribe: Tribe|false,
     * PlayerName: string,
     * Level: Number,
     * TotalEngramPoints: Number,
     * CharacterName: string,
     * TribeId: Number|false,
     * SteamId?: Number,
     * EosId?: string,
     * PlayerId: Number,
     * FileCreated: string,
     * FileUpdated: string
     * }}
     * @private
     */
    _playerFactory(file) {
        let data = this._readFile(file),
            fileData = fs.statSync(path.join(this.arkFilesDir, file)),
            binaryParser = new ArkBinaryParser(data, this.format);

        let player =  {
            Tribe: false,
            PlayerName: binaryParser.getProperty('PlayerName', this.format),
            Level: binaryParser.getProperty('CharacterStatusComponent_ExtraCharacterLevel') + 1,
            TotalEngramPoints: binaryParser.getProperty('PlayerState_TotalEngramPoints'),
            CharacterName: binaryParser.getProperty('PlayerCharacterName', this.format),
            PlayerId: binaryParser.getProperty('PlayerDataID'),
            FileCreated: util.formatTime(fileData.birthtime),
            FileUpdated: util.formatTime(fileData.mtime)
        };

        // ASA and ASE use different property names for certain fields
        // or simply don't exist (SteamId and EosId)
        if(this.format === ArkBinaryFormats.ASA) {
            player.TribeId = binaryParser.getProperty('TribeID', this.format);
            player.EosId = binaryParser.getEosId();
        } else {
            player.TribeId = binaryParser.getProperty('TribeId', this.format);
            player.SteamId = binaryParser.getSteamId();
        }

        return player;
    }

    /**
     * Create new tribe object
     *
     * @param file
     * @returns {{
     * Players: Array,
     * Name: string,
     * OwnerId: Number,
     * Id: Number,
     * TribeLogs: string[],
     * TribeMemberNames: string[],
     * FileCreated: string,
     * FileUpdated: string
     * }}
     * @private
     */
    _tribeFactory(file) {

        try{
        let data = this._readFile(file),
            fileData = fs.statSync(path.join(this.arkFilesDir, file)),
            binaryParser = new ArkBinaryParser(data);

        let tribe = {
            Players: [],
            Name: binaryParser.getProperty('TribeName', this.format),
            OwnerId: binaryParser.getProperty('OwnerPlayerDataID', this.format),
            TribeLogs: binaryParser.getProperty('TribeLog', this.format),
            TribeMemberNames: binaryParser.getProperty('MembersPlayerName', this.format),
            FileCreated: util.formatTime(fileData.birthtime),
            FileUpdated: util.formatTime(fileData.mtime)
        };

        // ASA and ASE use different tribe ID property names
        if( this.format === ArkBinaryFormats.ASA) {
            tribe.Id = binaryParser.getProperty('TribeID', this.format);
        } else {
            tribe.Id = binaryParser.getProperty('TribeId', this.format);
        }

        return tribe;

        } catch (error) {
            console.error(`Error processing tribe file ${file}:`, error);
            return null;
        }
    }
}

/**
 * Export
 * @type {ArkFilesData}
 */
module.exports = ArkFilesData;