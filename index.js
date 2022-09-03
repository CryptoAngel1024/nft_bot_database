import { OpenSeaStreamClient } from '@opensea/stream-js';
import { WebSocket } from 'ws';
import {connectToCluster} from './mongo.js';
import { TOKEN, MONGO_DB_URL, DB_NAME, COLLECTION_ITEM_LISTED } from './constants.js'

let mongoClient = await connectToCluster(MONGO_DB_URL);

const client = new OpenSeaStreamClient({
    token: TOKEN,
    connectOptions: {
      transport: WebSocket
  }
});

client.onItemListed('*', async (event) => {
  
  try {
    const db = mongoClient.db(DB_NAME);
    const collection = db.collection(COLLECTION_ITEM_LISTED);
      const sampleData = {
        base_price: event.payload.base_price,
        listing_date: event.payload.listing_date,
        collection_slug: event.payload.collection.slug,
        item: event.payload.item
      };
      await collection.insertOne(sampleData);
  } catch(err) {
    console.log('err', err)
  }
});
