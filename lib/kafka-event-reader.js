/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

// Internals
const KafkaEventReaderOptions = require('./kafka-event-reader-options');

// Framework
// const JournalEntry = require('eventsauce').JournalEntry;

// Externals
const kafka = require('no-kafka');

/**
 * The KafkaEventReader is a self-balancing competing consumer for a Kafka topic
 * that contains instances of [eventsauce].JournalEntry. Events are processed
 * serially per Kafka-partition.
 */
class KafkaEventReader {

  /**
   * Initialize a new instance of the KafkaEventReader
   * @param {KafkaEventReaderOptions}     options     - Options for KafkaEventReader
   */
  constructor(options) {
    this._running = false;
    this._options = new KafkaEventReaderOptions(options);
  }

  /**
   * Open the KafkaEventReader and make ourselves ready
   * for consumers to publish.
   */
  open() {
    // Don't allow opening twice.
    if (this._running) {
      throw new Error('Cannot open() a KafkaEventReader that is already running');
    }

    this._consumer = new kafka.GroupConsumer({
      connectionString: this._options.connectionString,
      groupId: this._options.groupId,
    });

    return this._consumer.init([{
      strategy: 'KafkaEventReader',
      subscriptions: [this._options.topicName],
    }])
      .then((r) => {
        this._running = true;
        return Promise.resolve(r);
      });
  }

  /**
   * Close the KafkaEventWriter and dispose all resources.
   */
  close() {
    // If we're running, then return the promise for the
    // no-kafka closure.
    if (this._running && this._consumer) {
      const promise = this._consumer.end()
        .then(() => {
          this._running = false;
          return Promise.resolve();
        });
      delete this._consumer;
      return promise;
    }

    // We aren't running, so succeed.
    this._running = false;
    return Promise.resolve();
  }
}

module.exports = KafkaEventReader;
