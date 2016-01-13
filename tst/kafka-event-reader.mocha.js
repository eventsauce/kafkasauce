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
const kafka = require('no-kafka');
const AggregateEvent = require('eventsauce').AggregateEvent;
const BoundedContext = require('eventsauce').BoundedContext;
const JournalEntry = require('eventsauce').JournalEntry;

class ExampleEvent extends AggregateEvent {

  /**
   * Initialize a new instance of the event.
   */
  constructor(input) {
    super();

    if (input) {
      this._time = input.time;
    }
  }

  /**
   * Creation time
   */
  get time() {
    return this._time;
  }

  /**
   * Get the event type of this event.
   * @returns {String}                    - Name of event type.
   **/
  get eventType() {
    return 'example';
  }

  /**
   * Parse the event from an object definition.
   * @param {Object} object               - Object to parse
   * @returns {AggregateEvent}            - Parsed event
   */
  static fromObject(object) {
    return new ExampleEvent(object);
  }

  /**
   * Convert the current instance to an object
   * @returns {Object}                    - Object for serialization
   */
  toObject() {
    return {
      time: this.time,
    };
  }
}

class ExampleContext extends BoundedContext {
  constructor() {
    super();
    this.defineEvent('example', ExampleEvent.fromObject);
  }
}

describe('KafkaEventReader', () => {
  describe('Construction', () => {
    const exampleConfig = {
      connectionString: 'some-conn-str',
      topicName: 'unit-test-topic',
      groupId: 'some-group-id',
      context: new ExampleContext(),
    };

    it('Should succeed with valid options object', () => {
      expect(() => {
        (new KafkaEventReader(exampleConfig)).toString();
      }).to.not.throw(Error);
    });
    it('Should fail with null options object', () => {
      expect(() => {
        (new KafkaEventReader(null)).toString();
      }).to.throw(Error);
    });
  });

  describe('Operations', function runOperations() {
    let instance = null;
    this.timeout(60000);

    /**
     * Build new instance of KafkaEventReader
     */
    beforeEach(() => {
      instance = new KafkaEventReader({
        connectionString: config.get('build.testing.kafkaConnection'),
        topicName: config.get('build.testing.kafkaTopic'),
        groupId: uuid.v4(),
        context: new ExampleContext(),
      });
      return instance.open();
    });

    describe('Functional consistency', () => {
      it('Open twice should throw exception', () => {
        expect(() => {
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
    });

    describe('Message consumption', () => {
      let producer = null;

      beforeEach(() => {
        producer = new kafka.Producer({
          connectionString: config.get('build.testing.kafkaConnection'),
        });

        return producer.init();
      });

      it('Should fail when passing a null callback for registration', () => {
        expect(() => {
          instance.addMessageHandlerCallback(null);
        }).to.throw(Error);
      });

      it('Should fail when passing a non-func callback for registration', () => {
        expect(() => {
          instance.addMessageHandlerCallback(1234);
        }).to.throw(Error);
      });

      it('Should recieve messages from Kafka', function runner(done) {
        const journalEntry = new JournalEntry({
          aggregateType: 'some-agg',
          aggregateKey: 'some-key',
          revision: 1234,
          eventType: 'exampleEvent',
          eventData: {
            time: Date.now(),
          },
        });

        instance.addMessageHandlerCallback(() => {
          done();
          return Promise.resolve();
        });

        producer.send({
          topic: config.get('build.testing.kafkaTopic'),
          partitionId: 0,
          message: {
            value: JSON.stringify(journalEntry.toObject()),
          },
        });
      });

      it('Should execute handlers in registration order', function runner(done) {
        const journalEntry = new JournalEntry({
          aggregateType: 'some-agg',
          aggregateKey: 'some-key',
          revision: 1234,
          eventType: 'exampleEvent',
          eventData: {
            time: Date.now(),
          },
        });

        let first = false;
        instance.addMessageHandlerCallback(() => {
          first = true;
          return Promise.resolve();
        });
        instance.addMessageHandlerCallback(() => {
          if (first) {
            done();
          } else {
            done('Executed out of sequence. Second handler called before first');
          }
          return Promise.resolve();
        });

        producer.send({
          topic: config.get('build.testing.kafkaTopic'),
          partitionId: 0,
          message: {
            value: JSON.stringify(journalEntry.toObject()),
          },
        });
      });

      it('Should run handle rejections correctly', function runner(done) {
        const journalEntry = new JournalEntry({
          aggregateType: 'some-agg',
          aggregateKey: 'some-key',
          revision: 1234,
          eventType: 'exampleEvent',
          eventData: {
            time: Date.now(),
          },
        });

        let first = false;
        instance.on('error', () => {
          if (first) {
            done();
          } else {
            done('Error: Should have called handler first before failing...');
          }
        });

        instance.addMessageHandlerCallback(() => {
          first = true;
          return Promise.reject();
        });
        instance.addMessageHandlerCallback(() => {
          done('Should never touch second handler!');
        });

        producer.send({
          topic: config.get('build.testing.kafkaTopic'),
          partitionId: 0,
          message: {
            value: JSON.stringify(journalEntry.toObject()),
          },
        });
      });

      it('Should run handle non-thenable result correctly', function runner(done) {
        const journalEntry = new JournalEntry({
          aggregateType: 'some-agg',
          aggregateKey: 'some-key',
          revision: 1234,
          eventType: 'exampleEvent',
          eventData: {
            time: Date.now(),
          },
        });

        let first = false;
        instance.addMessageHandlerCallback(() => {
          first = true;
          return 'foo';
        });
        instance.addMessageHandlerCallback(() => {
          if (first) {
            done();
            return Promise.resolve();
          }
          done('Did not call first handler');
          return Promise.reject();
        });

        producer.send({
          topic: config.get('build.testing.kafkaTopic'),
          partitionId: 0,
          message: {
            value: JSON.stringify(journalEntry.toObject()),
          },
        });
      });

      it('Should run handle exception during promise gen. correctly', function runner(done) {
        const journalEntry = new JournalEntry({
          aggregateType: 'some-agg',
          aggregateKey: 'some-key',
          revision: 1234,
          eventType: 'exampleEvent',
          eventData: {
            time: Date.now(),
          },
        });

        instance.addMessageHandlerCallback(() => {
          throw new Error('Should explode!');
        });
        instance.addMessageHandlerCallback(() => {
          done('Should never call this');
        });
        instance.on('error', () => {
          done();
        });

        producer.send({
          topic: config.get('build.testing.kafkaTopic'),
          partitionId: 0,
          message: {
            value: JSON.stringify(journalEntry.toObject()),
          },
        });
      });

      afterEach(() => {
        return producer.end().catch(() => Promise.resolve());
      });
    });

    /**
     * Tear down the instance
     */
    afterEach(() => {
      return instance.close().catch(() => Promise.resolve());
    });
  });
});
