/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

const KafkaOptionsBase = require('./kafka-options-base');

/**
 * The KafkaEventReaderOptions contains configuration settings for reading from a
 * Kafka topic for event consumers.
 */
class KafkaEventReaderOptions extends KafkaOptionsBase {
  /**
   * Initialize a new instance of the KafkaEventReaderOptions
   * @param {Object}      options       - Options structure.
   */
  constructor(options) {
    // Call base to share validation logic for common elements
    super(KafkaEventReaderOptions, options);
  }
}

module.exports = KafkaEventReaderOptions;
