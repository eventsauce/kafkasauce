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
const JournalEntry = require('eventsauce').JournalEntry;

// Externals
const debug = require('debug')('kafkasauce:KafkaEventReader');
const kafka = require('no-kafka');
const sprintf = require('sprintf-js').sprintf;

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
    if (!options) {
      throw new Error('Cannot initialize KafkaEventReader without options');
    }
    debug('Constructing new instance: ' + JSON.stringify(options));
    this._running = false;
    this._options = new KafkaEventReaderOptions(options);
    this._handlerCallbacks = [];
  }

  /**
   * Open the KafkaEventReader and make ourselves ready
   * for consumers to publish.
   */
  open() {
    debug('open()');
    // Don't allow opening twice.
    if (this._running) {
      debug('Aborting: Already have this._running flag set.');
      throw new Error('Cannot open() a KafkaEventReader that is already running');
    }

    debug('Creating no-kafka GroupConsumer');
    this._consumer = new kafka.GroupConsumer({
      connectionString: this._options.connectionString,
      groupId: this._options.groupId,
    });

    // Wireup handler.
    this._consumer.on('data', (messageSet, topic, partition) => {
      return this._handleMessageSet(messageSet, topic, partition);
    });

    debug('Initializing');
    return this._consumer.init([{
      strategy: 'KafkaEventReader',
      subscriptions: [this._options.topicName],
    }])
      .then((r) => {
        debug('Consumer initialized: setting running flags');
        this._running = true;
        return Promise.resolve(r);
      });
  }

  /**
   * Handle the arrival of a set of messages from a given topic and partition. We
   * commit the offset of the message once we have called all callback handlers for
   * a given message.
   */
  _handleMessageSet(messageSet, topic, partition) {
    debug(sprintf('Recieved set of %s messages for %s:%s', messageSet.length, topic, partition));
    let tail = Promise.resolve(messageSet);
    let currMessage = 0;
    let currHandler = 0;

    messageSet.forEach((msg) => {
       const capturedMessage = currMessage + 1;
       currMessage = currMessage + 1;

      debug(sprintf('Processing message %s: %s', currMessage, JSON.stringify(msg)));
      const rawMessage = msg.message.value.toString('utf8');
      debug('Raw: ' + JSON.stringify(rawMessage));
      const json = JSON.parse(rawMessage);
      json.event = this._options.context.parseEvent(json.eventType, json.eventData);
      const journalItem = new JournalEntry(json);
      debug('JournalEntry: ' + JSON.stringify(journalItem.toObject()));

      this._handlerCallbacks.forEach((handler) => {
        const capturedHandler = currHandler + 1;
        currHandler = currHandler + 1;
        debug(sprintf('Building promise for handler %s', currHandler));
        const generator = () => {
          return new Promise((resolve, reject) => {
           debug(sprintf('[%s:%s] Executing handler %s for msg %s',
              topic,
              partition,
              capturedHandler,
              capturedMessage));

            try {
              // Run the handler
              let subChain = handler(journalItem);

              // If result is a promise, then wireup resolution
              if (subChain.then) {
                debug('Handler was then-able, so chaining promises');
                subChain = subChain.then((d) => {
                  debug(sprintf('[%s:%s] Resolving handler %s for msg %s',
                    topic,
                    partition,
                    capturedHandler,
                    capturedMessage));
                  resolve(d);
                }).catch((err) => {
                  debug(sprintf('[%s:%s] Rejecting handler %s for msg %s',
                    topic,
                    partition,
                    capturedHandler,
                    capturedMessage));
                  reject(err);
                });
              } else {
                // Result was not then-able, so resolve with the
                // result as a raw value.
                debug(sprintf('[%s:%s] Non-promise handler %s for msg %s (resolving)',
                  topic,
                  partition,
                  capturedHandler,
                  capturedMessage));

                resolve(subChain);
              }
            } catch (err) {
              debug(sprintf('[%s:%s] Failed generating/promising %s for msg %s',
                topic,
                partition,
                capturedHandler,
                capturedMessage));
              reject(err);
            }
          });
        };

        // Build the chain
        tail = tail.then(() => {
          return generator();
        })
          .then((d) => {
            debug('Promise completed');
            return Promise.resolve(d);
          })
          .catch((err) => {
            debug('Error occured: ' + err);
            throw err;
          });
      });
    });
  }

  /**
   * Add a message handler callback
   * @param {Function} cb     - Function that generates a promise for handling messages.
   */
  addMessageHandlerCallback(cb) {
    if (!cb) {
      throw new Error('Cannot addMessageHandlerCallback: cb must be a non-null function');
    }

    debug('Wiring up message handler callback');
    this._handlerCallbacks.push(cb);
  }

  /**
   * Close the KafkaEventWriter and dispose all resources.
   */
  close() {
    // If we're running, then return the promise for the
    // no-kafka closure.
    if (this._running && this._consumer) {
      this._running = false;
      const promise = this._consumer.end()
        .then(() => {
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
