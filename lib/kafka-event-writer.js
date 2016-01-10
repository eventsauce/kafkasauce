/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

// Internals
const KafkaEventWriterOptions = require('./kafka-event-writer-options');

// Externals
const kafka = require('no-kafka');

/**
 * The KafkaEventWriter allows a domain to publish events to a Kafka topic.
 * Events are distributed to partitions of the topic based on the aggregate
 * key sharding function.
 */
class KafkaEventWriter {

  /**
   * Initialize a new instance of the KafkaEventWriter
   * @param {KafkaEventWriterOptions}     options     - Options for KafkaEventWriter
   */
  constructor(options) {
    this._running = false;
    this._options = new KafkaEventWriterOptions(options);
  }

  /**
   * Open the KafkaEventWriter and make ourselves ready
   * for consumers to publish.
   */
  open() {
    // Don't allow opening twice.
    if (this._running) {
      throw new Error('Cannot open() a KafkaEventWriter that is already running');
    }

    this._producer = new kafka.Producer();
    this._producer.init()
      .then(() => {
        this._running = true;
      });
  }

  /**
   * Close the KafkaEventWriter and dispose all resources.
   */
  close() {
    // If we're running, then return the promise for the
    // no-kafka closure.
    if (this._running) {
      const promise = this._producer.end()
        .then(() => {
          this._running = false;
          return Promise.resolve();
        });
      delete this._producer;
      return promise;
    }

    // We aren't running, so succeed.
    return Promise.resolve();
  }
}

module.exports = KafkaEventWriter;
