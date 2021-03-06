/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

const KafkaOptionsBase = require('./kafka-options-base');

/**
 * The KafkaEventWriterOptions contains configuration settings for reading from a
 * Kafka topic for event consumers.
 */
class KafkaEventWriterOptions extends KafkaOptionsBase {
  /**
   * Initialize a new instance of the KafkaEventWriterOptions
   * @param {Object}      options       - Options structure.
   */
  constructor(options) {
    // Call base to share validation logic for common elements
    super(KafkaEventWriterOptions, options);
  }
}

module.exports = KafkaEventWriterOptions;
