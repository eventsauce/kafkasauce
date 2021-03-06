/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';
/* global describe */
/* global it */
const chai = require('chai');
const expect = chai.expect;
const KafkaOptionsBase = require('../lib/kafka-options-base');

describe('KafkaOptionsBase', () => {
  class Variant extends KafkaOptionsBase {
    constructor(options) {
      super(Variant, options);
    }
  }

  describe('Construction', () => {
    const exampleConfig = {
      connectionString: 'some-conn-str',
      topicName: 'unit-test-topic',
    };

    it('Should succeed with valid options object', () => {
      expect(() => new KafkaOptionsBase(Variant, exampleConfig)).to.not.throw(Error);
    });

    it('Should fail with no sub-type/class object', () => {
      expect(() => new KafkaOptionsBase(null, exampleConfig)).to.throw(Error);
    });

    it('Should fail with null options object', () => {
      expect(() => new Variant(null)).to.throw(Error);
    });

    it('Should set connectionString property', () => {
      const instance = new Variant(exampleConfig);
      expect(instance.connectionString).to.equal(exampleConfig.connectionString);
    });

    it('Should set topicName property', () => {
      const instance = new Variant(exampleConfig);
      expect(instance.topicName).to.equal(exampleConfig.topicName);
    });

    it('Should fail if any options property is missing', () => {
      Object.keys(exampleConfig).forEach((key) => {
        const clone = JSON.parse(JSON.stringify(exampleConfig));
        delete clone[key];
        expect(() => new Variant(clone)).to.throw(Error);
      });
    });
  });
});
