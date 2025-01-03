import { Kafka, logLevel } from 'kafkajs';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../packages/kafka/.env');
dotenv.config({ path: envPath });

const kafkaUri = process.env.KAFKA_URI as string;
if (!kafkaUri) {
  throw new Error('KAFKA_URI environment variable is not defined');
}

class KafkaSingleton {
  private static instance: Kafka;

  private constructor() {}

  public static getInstance(): Kafka {
    if (!KafkaSingleton.instance) {
      KafkaSingleton.instance = new Kafka({
        brokers: [kafkaUri],
        ssl: {
          rejectUnauthorized: false,
        },
        sasl: {
          mechanism: 'scram-sha-256',
          username: process.env.KAFKA_USERNAME as string,
          password: process.env.KAFKA_PASSWORD as string,
        },
        logLevel: logLevel.ERROR,
      });
    }
    return KafkaSingleton.instance;
  }

  public static async createTopic(topic: string) {
    const admin = kafkaClient.getInstance().admin();
    await admin.connect();

    const topics = await admin.listTopics();
    if (!topics.includes(topic)) {
      console.log(`Creating topic "${topic}" as it doesn't exist.`);
      await admin.createTopics({
        topics: [
          {
            topic: topic,
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
    }
  }
}

const kafkaClient = KafkaSingleton;

export default kafkaClient;
