/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

// Internals
const KafkaEventWriterOptions = require('./kafka-event-writer-options');

// Framework
const JournalEntry = require('eventsauce').JournalEntry;

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

    this._producer = new kafka.Producer({
      connectionString: this._options.connectionString,
    });

    return this._producer.init()
      .then(() => {
        this._running = true;
      });
  }

  /**
   * Write a single event to the event stream
   *
   * @param {JournalEntry}        journalEntry      - eventsauce JournalEntry structure.
   */
  write(journalEntry) {
    // Validate arguments
    if (!journalEntry) {
      throw new Error('Cannot write() - journalEntry cannot be null');
    } else if (!(journalEntry instanceof JournalEntry)) {
      throw new Error('Cannot write() - journalEntry must be an instance of [eventsauce].JournalEntry');
    }

    // Validate state
    if (!this._running) {
      throw new Error('Cannot write() - the KafkaEventWriter is not open');
    }

    return this._producer.send({
      topic: this._options.topicName,
      partition: 0, // TODO: Make support partitioning.
      message: {
        value: JSON.stringify(journalEntry.toObject()),
      },
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
