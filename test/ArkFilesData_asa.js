const ArkFiles = require('../src/ArkFilesData');
const ArkBinaryFormats = require('../src/ArkBinaryFormats');
const arkFiles = new ArkFiles('test/assets/asa', null, ArkBinaryFormats.ASA);
const chai = require('chai');
const expect = chai.expect;

const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

describe('ASA Players', () => {
  let players;

  before(() => {
    players = arkFiles.getPlayers();
  });

  it('finds all players', () => {
    expect(players).to.have.lengthOf(4);
  });

  it('parses player 123/AJ correctly', () => {
    const player = players[0];
    expect(player.PlayerName).to.equal('123');
    expect(player.CharacterName).to.equal('AJ');
    expect(player.PlayerId).to.equal(190417982);
    expect(player.EosId).to.equal('0002139a631d4a019b676be7f393af88');
    expect(player.TribeId).to.equal(1643109637);
    expect(player.Level).to.equal(210);
    expect(player.TotalEngramPoints).to.equal(11534);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });

  it('parses player Dianstixen correctly', () => {
    const player = players[1];
    expect(player.PlayerName).to.equal('Dianstixen');
    expect(player.CharacterName).to.equal('Dianstixen');
    expect(player.PlayerId).to.equal(654163);
    expect(player.EosId).to.equal('00023325604148d694eeafc1922a4c60');
    expect(player.TribeId).to.equal(1190874127);
    expect(player.Level).to.equal(141);
    expect(player.TotalEngramPoints).to.equal(6274);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });

  it('parses player Pikmario correctly', () => {
    const player = players[2];
    expect(player.PlayerName).to.equal('Pikmario');
    expect(player.CharacterName).to.equal('Pikmario');
    expect(player.PlayerId).to.equal(275405509);
    expect(player.EosId).to.equal('00025dc8e77f44ce8ce68e79da44886a');
    expect(player.TribeId).to.equal(1353448466);
    expect(player.Level).to.equal(210);
    expect(player.TotalEngramPoints).to.equal(11534);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });

  it('parses player Chuck Finley/Giga correctly', () => {
    const player = players[3];
    expect(player.PlayerName).to.equal('Chuck Finley');
    expect(player.CharacterName).to.equal('Giga');
    expect(player.PlayerId).to.equal(161090715);
    expect(player.EosId).to.equal('00028acaa47a4fd886c64adf4ed87d48');
    expect(player.TribeId).to.equal(1168628130);
    expect(player.Level).to.equal(195);
    expect(player.TotalEngramPoints).to.equal(11534);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });
});

describe('ASA Tribes', () => {
  let tribes;

  before(() => {
    tribes = arkFiles.getTribes();
  });

  it('finds all tribes', () => {
    expect(tribes).to.have.lengthOf(4);
  });

  // Tribe 0: Sexy Solicitors (1168628130)
  it('parses tribe Sexy Solicitors correctly', () => {
    const tribe = tribes[0];
    expect(tribe.Name).to.equal('Sexy Solicitors');
    expect(tribe.Id).to.equal(1168628130);
    expect(tribe.OwnerId).to.equal(161090715);
    expect(tribe.TribeMemberNames).to.deep.equal(['Giga', 'Bob Ross']);
    expect(tribe.TribeLogs).to.be.an('array').with.lengthOf(400);
    expect(tribe.FileCreated).to.match(timestampRegex);
    expect(tribe.FileUpdated).to.match(timestampRegex);
  });

  // Tribe 1: Vardania (1190874127)
  it('parses tribe Vardania correctly', () => {
    const tribe = tribes[1];
    expect(tribe.Name).to.equal('Vardania');
    expect(tribe.Id).to.equal(1190874127);
    expect(tribe.OwnerId).to.equal(654163);
    expect(tribe.TribeMemberNames).to.deep.equal(['Dianstixen']);
    expect(tribe.TribeLogs).to.be.an('array').with.lengthOf(400);
    expect(tribe.FileCreated).to.match(timestampRegex);
    expect(tribe.FileUpdated).to.match(timestampRegex);
  });

  // Tribe 2: Nemesis (1353448466)
  it('parses tribe Nemesis correctly', () => {
    const tribe = tribes[2];
    expect(tribe.Name).to.equal('Nemesis');
    expect(tribe.Id).to.equal(1353448466);
    expect(tribe.OwnerId).to.equal(81917032);
    expect(tribe.TribeMemberNames).to.deep.equal(['Orbis', 'SupremeBean', 'Pikmario']);
    expect(tribe.TribeLogs).to.be.an('array').with.lengthOf(400);
    expect(tribe.FileCreated).to.match(timestampRegex);
    expect(tribe.FileUpdated).to.match(timestampRegex);
  });

  // Tribe 3: Cockatiels (1643109637)
  it('parses tribe Cockatiels correctly', () => {
    const tribe = tribes[3];
    expect(tribe.Name).to.equal('Cockatiels');
    expect(tribe.Id).to.equal(1643109637);
    expect(tribe.OwnerId).to.equal(190417982);
    expect(tribe.TribeMemberNames).to.deep.equal(['AJ', 'TheOne', 'onrsub']);
    expect(tribe.TribeLogs).to.be.an('array').with.lengthOf(400);
    expect(tribe.FileCreated).to.match(timestampRegex);
    expect(tribe.FileUpdated).to.match(timestampRegex);
  });
});
