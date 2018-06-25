const mockfs = require('mock-fs');
const assert = require('assert');
const Store = require('./store').Store;
const CommandHandler = require('./store').CommandHandler;
describe('Store', function() {
  describe('#get', function() {
    it('should find correct value', async function() {
      const _store = new Store();
      _store.calculateHash = (x=>x);
      mockfs({
        'data': {
          'a': '{"key":"a","value":"1"}'}});
      const value = await _store.read("a");
      assert.equal(value,"1");
    });
  });
  describe('#add', function() {
    it('should retrive same input', async function() {
      const _store = new Store();
      _store.calculateHash = (x=>x);
      mockfs({'data':{}});
      await _store.add("a","1");
      const value = await _store.read("a");
      assert.equal(value,"1");
    });
  });
  describe('#remove', function() {
    it('should remove only same data', async function() {
      const _store = new Store();
      _store.calculateHash = (x=> x);
      mockfs({'data':{}});
      await _store.add("a","1");
      await _store.add("b","2");
      await _store.remove("a");
      const value = await _store.read("b");
      assert.equal(value,"2");
      assert.equal(undefined,await _store.read("a"));
    });
  });
  describe('#clear', function() {
    it('should remove all data', async function() {
      const _store = new Store();
      _store.calculateHash = (x=> x);
      mockfs({'data':{}});
      await _store.add("a","1");
      await _store.add("b","2");
      await _store.add("c","2");
      await _store.clear();
      assert.equal(undefined,await _store.read("a"));
      assert.equal(undefined,await _store.read("b"));
      assert.equal(undefined,await _store.read("c"));
    });
  });
  describe('#list', function() {
    it('should return all data', async function() {
      const _store = new Store();
      _store.calculateHash = (x=> x);
      mockfs({'data':{}});
      await _store.add("a","1");
      await _store.add("b","2");
      const list = await _store.list();
      assert.deepEqual([{key:"a",value:1},{key:"b",value:2}],list);
    });
  });
  describe('#calculateHash', function() {
    it('should return different values for different keys', async function() {
      assert.notEqual(new Store().calculateHash("a"),new Store().calculateHash("b"));
      assert.notEqual(new Store().calculateHash("a1"),new Store().calculateHash("b23"));
      assert.notEqual(new Store().calculateHash("1a"),new Store().calculateHash("1b"));
      assert.notEqual(new Store().calculateHash("."),new Store().calculateHash(".."));
      assert.notEqual(new Store().calculateHash("@"),new Store().calculateHash("@ @"));
    });
  });
});