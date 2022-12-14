import { OpenSeaStreamClient } from '@opensea/stream-js';
import { WebSocket } from 'ws';
import {connectToCluster} from './mongo.js';
import * as dotenv from 'dotenv'
dotenv.config()

let mongoClient = await connectToCluster(process.env.MONGO_DB_URL);

const client = new OpenSeaStreamClient({
    token: process.env.TOKEN,
    connectOptions: {
      transport: WebSocket
  }
});

client.onItemListed('*', async (event) => {
  
  try {
    const db = mongoClient.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_ITEM_LISTED);
    if(event.payload.item.chain.name === 'ethereum' && event.payload.is_private !== true) {
      const sampleData = {
        base_price: event.payload.base_price,
        listing_date: new Date(event.payload.listing_date).getTime(),
        collection_slug: event.payload.collection.slug,
        contract_address: event.payload.item.nft_id.split("/")[1],
        token_id: event.payload.item.nft_id.split("/")[2]
      };
      await collection.insertOne(sampleData);
    }
  } catch(err) {
    console.log('err', err)
  }
});
