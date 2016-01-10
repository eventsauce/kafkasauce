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

describe('KafkaEventWriter', () => {
  describe('Construction', () => {
    const exampleConfig = {
      connectionString: 'some-conn-str',
      topicName: 'unit-test-topic',
    };

    it('Should succeed with valid options object', () => {
      expect(() => new lib.KafkaEventWriter(exampleConfig)).to.not.throw(Error);
    });
  });

  describe('Operations', function runOperations() {
    let instance = null;
    this.timeout(30000);

    /**
     * Build new instance of KafkaEventWriter
     */
    beforeEach(() => {
      instance = new lib.KafkaEventWriter({
        connectionString: config.get('build.testing.kafkaConnection'),
        topicName: config.get('build.testing.kafkaTopic'),
      });
      return instance.open();
    });

    it('Open twice should throw exception', () => {
      expect(() => {
        return instance.open();
      }).to.throw(Error);
    });

    it('Close twice should succeed silently', () => {
      expect(() => {
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
