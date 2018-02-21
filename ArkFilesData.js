const util = require('./util');
const fs = require('fs');
const path = require('path');

/**
 * ArkFilesData class
 */
class ArkFilesData {

    /**
     * Constructor
     * @param {string} arkServerDir
     * @param {Number} refreshInterval
     */
    constructor(arkServerDir, refreshInterval = (60 * 5)) {
        this.arkFilesDir = path.join(arkServerDir, "ShooterGame", "Saved", "SavedArks");
        this.refreshInterval = refreshInterval;
        this.cache = {};
        this.cacheTime = 0;
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
        tribe.Players = players.filter(player => player.TribeId === tribe.Id)
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
        player.Tribe = tribes.find(tribe => tribe.Id === player.TribeId);
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
        let files = this._getFiles(),
            data = {
                players: files.filter(ArkFilesData._filterArkProfiles).map(player => this._playerFactory(player)),
                tribes: files.filter(ArkFilesData._filterArkTribes).map(tribe => this._tribeFactory(tribe))
            };

        return {
            players: data.players.map(player => this._attachTribeToPlayer(player, data.tribes)),
            tribes: data.tribes.map(tribe => this._attachPlayersToTribe(tribe, data.players))
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
     * Tribe: boolean|Tribe,
     * PlayerName,
     * Level: Number,
     * TotalEngramPoints: Number,
     * CharacterName, TribeId:
     * Number, PlayerId: Number,
     * FileCreated: string,
     * FileUpdated: string
     * }}
     * @private
     */
    _playerFactory(file) {
        let data = this._readFile(file),
            fileData = fs.statSync(path.join(this.arkFilesDir, file));

        return {
            Tribe: false,
            PlayerName: util.getString("PlayerName", data),
            Level: parseInt(util.getUInt16("CharacterStatusComponent_ExtraCharacterLevel", data) + 1),
            TotalEngramPoints: parseInt(util.getInt("PlayerState_TotalEngramPoints", data)),
            CharacterName: util.getString("PlayerCharacterName", data),
            TribeId: parseInt(util.getInt("TribeID", data)),
            SteamId: parseInt(util.getSteamId(data)),
            PlayerId: parseInt(util.getPlayerId(data)),
            FileCreated: new Date(fileData.birthtime).toISOString().slice(0, 19).replace('T', ' '),
            FileUpdated: new Date(fileData.mtime).toISOString().slice(0, 19).replace('T', ' ')
        };
    }

    /**
     * Create new tribe object
     *
     * @param file
     * @returns {{
     * Players: Array,
     * Name: *,
     * OwnerId: Number,
     * Id: Number,
     * FileCreated: string,
     * FileUpdated: string
     * }}
     * @private
     */
    _tribeFactory(file) {
        let data = this._readFile(file),
            fileData = fs.statSync(path.join(this.arkFilesDir, file));

        return {
            Players: [],
            Name: util.getString("TribeName", data),
            OwnerId: parseInt(util.getUInt32("OwnerPlayerDataID", data)),
            Id: parseInt(util.getInt("TribeID", data)),
            FileCreated: new Date(fileData.birthtime).toISOString().slice(0, 19).replace('T', ' '),
            FileUpdated: new Date(fileData.mtime).toISOString().slice(0, 19).replace('T', ' ')
        };

    }
}

/**
 * Export
 * @type {ArkFilesData}
 */
module.exports = ArkFilesData;