/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';
/* global describe */
/* global it */
const lib = require('../lib');
const chai = require('chai');
const expect = chai.expect;

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
});
