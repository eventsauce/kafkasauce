/**
 *   ___             _   ___                       EventSauce
 *   | __|_ _____ _ _| |_/ __| __ _ _  _ __ ___    CQRS / Event Sourcing Framework for NodeJS
 *   | _|\ V / -_) ' \  _\__ \/ _` | || / _/ -_)   (c) 2016 Steve Gray / eventualconsistency.net
 *   |___|\_/\___|_||_\__|___/\__,_|\_,_\__\___|   This code is GPL v2.0 licenced.
 **/
'use strict';

/**
 * The KafkaEventReader is a self-balancing competing consumer for a Kafka topic
 * that contains instances of [eventsauce].JournalEntry. Events are processed
 * serially per Kafka-partition.
 */
class KafkaEventReader {

}

module.exports = KafkaEventReader;
