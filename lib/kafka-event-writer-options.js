/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

/**
 * The KafkaEventWriterOptions class defines the expected attributes of configuration
 * for the KafkaEventWriter.
 */
class KafkaEventWriterOptions {

  /**
   * Initialize a new instance of the KafkaEventWriterOptions
   */
  constructor(options) {
    // Validate
    if (!options) {
      throw new Error('Cannot initialize KafkaEventWriterOptions: options cannot be null');
    } else if (!options.connectionString) {
      throw new Error('Cannot initialize KafkaEventWriterOptions: options.connectionString required');
    } else if (!options.topicName) {
      throw new Error('Cannot initialize KafkaEventWriterOptions: options.topicName required');
    }

    // Build instance
    this._connectionString = options.connectionString;
    this._topicName = options.topicName;
  }

  /**
   * Connection string
   */
  get connectionString() {
    return this._connectionString;
  }

  /**
   * Topic to write to
   */
  get topicName() {
    return this._topicName;
  }
}

module.exports = KafkaEventWriterOptions;
