/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

const KafkaOptionsBase = require('./kafka-options-base');
const BoundedContext = require('eventsauce').BoundedContext;

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
    if (!options.groupId) {
      throw new Error('Cannot initialize KafkaEventReaderOptions: options.groupId must be a valid string');
    } else if (!options.context || !(options.context instanceof BoundedContext)) {
      throw new Error('Cannot initialize KafkaEventReaderOptions: options.context must extend BoundedContext');
    }

    // Build instance
    this._groupId = options.groupId;
    this._context = options.context;
  }

  /**
   * Consumer Group Id
   */
  get groupId() {
    return this._groupId;
  }

  /**
   * Bounded Context
   */
  get context() {
    return this._context;
  }
}

module.exports = KafkaEventReaderOptions;
