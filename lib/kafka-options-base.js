/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

const sprintf = require('sprintf-js').sprintf;

/**
 * The KafkaOptionsBase class defines some shared attributes of configuration
 * types that handle Kafka messages/topics.
 */
class KafkaOptionsBase {

  /**
   * Initialize a new instance of the KafkaEventWriterOptions
   */
  constructor(type, options) {
    // TODO: Refactor this later when istanbul has updated to include the fix for new.target
    // metaproperties.
    // Validate
    if (!type) {
      throw new Error('Cannot initialize KafkaOptionsBase: require a type');
    } else if (!options) {
      throw new Error(sprintf('Cannot initialize %s: options cannot be null', type.constructor.name));
    } else if (!options.connectionString) {
      throw new Error(sprintf('Cannot initialize %s: options.connectionString required', type.constructor.name));
    } else if (!options.topicName) {
      throw new Error(sprintf('Cannot initialize %s: options.topicName required', type.constructor.name));
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

module.exports = KafkaOptionsBase;
