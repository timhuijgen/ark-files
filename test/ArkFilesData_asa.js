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

  // Player 0: 123/AJ (0002139a631d4a019b676be7f393af88)
  it('parses player 123/AJ correctly', () => {
    const player = players[0];
    expect(player.PlayerName).to.equal('123');
    expect(player.CharacterName).to.equal('AJ');
    expect(player.EosId).to.equal('0002139a631d4a019b676be7f393af88');
    expect(player.TribeId).to.equal(1643109637);
    expect(player.Level).to.equal(210);
    expect(player.TotalEngramPoints).to.equal(11534);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });

  // Player 1: Dianstixen/Survivor (00023325604148d694eeafc1922a4c60)
  it('parses player Dianstixen/Survivor correctly', () => {
    const player = players[1];
    expect(player.PlayerName).to.equal('Dianstixen');
    expect(player.CharacterName).to.equal('Dianstixen');
    expect(player.EosId).to.equal('00023325604148d694eeafc1922a4c60');
    expect(player.TribeId).to.equal(1190874127);
    expect(player.Level).to.equal(141);
    expect(player.TotalEngramPoints).to.equal(6274);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });

  // Player 2: Pikmario (00025dc8e77f44ce8ce68e79da44886a)
  it('parses player Pikmario correctly', () => {
    const player = players[2];
    expect(player.PlayerName).to.equal('Pikmario');
    expect(player.CharacterName).to.equal('Pikmario');
    expect(player.EosId).to.equal('00025dc8e77f44ce8ce68e79da44886a');
    expect(player.TribeId).to.equal(1353448466);
    expect(player.Level).to.equal(210);
    expect(player.TotalEngramPoints).to.equal(11534);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });

  // Player 3: Chuck Finley/Giga (00028acaa47a4fd886c64adf4ed87d48)
  it('parses player Chuck Finley/Giga correctly', () => {
    const player = players[3];
    expect(player.PlayerName).to.equal('Chuck Finley');
    expect(player.CharacterName).to.equal('Giga');
    expect(player.EosId).to.equal('00028acaa47a4fd886c64adf4ed87d48');
    expect(player.TribeId).to.equal(1168628130);
    expect(player.Level).to.equal(195);
    expect(player.TotalEngramPoints).to.equal(11534);
    expect(player.PlayerId).to.equal(161090715);
    expect(player.FileCreated).to.match(timestampRegex);
    expect(player.FileUpdated).to.match(timestampRegex);
  });
});
