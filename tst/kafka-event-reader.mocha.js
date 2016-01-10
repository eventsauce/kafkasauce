/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';
/* global afterEach */
/* global beforeEach */
/* global describe */
/* global it */
const config = require('config');
const lib = require('../lib');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const KafkaEventReader = lib.KafkaEventReader;
const uuid = require('uuid');
// const AggregateEvent = require('eventsauce').AggregateEvent;
// const JournalEntry = require('eventsauce').JournalEntry;

describe('KafkaEventReader', () => {
  describe('Construction', () => {
    const exampleConfig = {
      connectionString: 'some-conn-str',
      topicName: 'unit-test-topic',
      groupId: 'some-group-id',
    };

    it('Should succeed with valid options object', () => {
      expect(() => {
        (new KafkaEventReader(exampleConfig)).toString();
      }).to.not.throw(Error);
    });
  });

  describe('Operations', function runOperations() {
    let instance = null;
    this.timeout(60000);

    /**
     * Build new instance of KafkaEventReader
     */
    beforeEach(() => {
      console.log('beforeEach');
      instance = new KafkaEventReader({
        connectionString: config.get('build.testing.kafkaConnection'),
        topicName: config.get('build.testing.kafkaTopic'),
        groupId: uuid.v4(),
      });
      return instance.open();
    });

    it('Open twice should throw exception', () => {
        console.log('Now test');
      expect(() => {
        console.log('Now callback');
        instance.open();
      }).to.throw(Error);
    });

    it('Close twice should succeed silently', () => {
      return expect(() => {
        return instance.close()
          .then(() => {
            return instance.close();
          });
      }).to.not.throw(Error);
    });
    /**
     * Tear down the instance
     */
    afterEach(() => {
      return instance.close();
    });
  });
});
