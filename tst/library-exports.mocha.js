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

describe('Library Exports', () => {
  it('Should export correct number of symbols', () => {
    expect(Object.keys(lib).length).to.equal(3);
  });

  it('Should export: KafkaEventReaderOptions', () => {
    expect(lib.KafkaEventReaderOptions).to.equal(require('../lib/kafka-event-reader-options'));
  });

  it('Should export: KafkaEventWriter', () => {
    expect(lib.KafkaEventWriter).to.equal(require('../lib/kafka-event-writer'));
  });

  it('Should export: KafkaEventWriterOptions', () => {
    expect(lib.KafkaEventWriterOptions).to.equal(require('../lib/kafka-event-writer-options'));
  });
});
