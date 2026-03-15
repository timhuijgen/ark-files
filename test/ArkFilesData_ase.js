const ArkFiles = require('../src/ArkFilesData');
const arkFiles = new ArkFiles('test/assets/ase');
const chai = require('chai');
const expect = chai.expect;

const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

describe('Players', () => {
    it('gets players', () => {
        const players = arkFiles.getPlayers();

        expect(players).to.have.lengthOf(1);
        expect(players[0].FileCreated).to.match(timestampRegex);
        expect(players[0].FileUpdated).to.match(timestampRegex);

        const {FileCreated, FileUpdated, ...playerData} = players[0];
        expect(playerData).to.deep.equal({
            Tribe: false,
            PlayerName: 'TimmeY',
            Level: 300,
            TotalEngramPoints: 10000,
            CharacterName: 'Timmey',
            TribeId: false,
            SteamId: 76561198123343260,
            PlayerId: 145285114,
        });
    });
});

describe('tribes', () => {
    it('gets tribes', () => {
        const tribes = arkFiles.getTribes();

        expect(tribes).to.have.lengthOf(1);
        expect(tribes[0].FileCreated).to.match(timestampRegex);
        expect(tribes[0].FileUpdated).to.match(timestampRegex);

        const {FileCreated, FileUpdated, ...tribeData} = tribes[0];
        expect(tribeData).to.deep.equal({
            Players: [],
            Name: 'The Dino Police',
            OwnerId: 529159650,
            Id: 1632026172,
            TribeLogs:
                ['Day 93, 09:26:13: <RichColor Color="0, 1, 1, 1">Jarno was added to the Tribe!</>',
                    'Day 93, 10:45:15: <RichColor Color="0, 1, 1, 1">Remco was added to the Tribe by Jarno!</>',
                    'Day 93, 11:48:28: <RichColor Color="1, 0, 0, 1">Tribemember Remco - Lvl 26 was killed by a Raptor - Lvl 360!</>',
                    'Day 93, 11:53:40: <RichColor Color="1, 0, 0, 1">Tribemember Jarno - Lvl 44 was killed by a Raptor - Lvl 360!</>',
                    'Day 93, 16:23:49: <RichColor Color="0, 1, 0, 1">Jarno Tamed a Pteranodon - Lvl 149 (Pteranodon)!</>'],
            TribeMemberNames: ['Jarno', 'Remco'],
        });
    });
});
