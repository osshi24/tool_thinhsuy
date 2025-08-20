import { MongoClient } from 'mongodb';
import { Client } from '@elastic/elasticsearch';

async function syncDataInBatches() {
  const BATCH_SIZE = 1000; // Số document mỗi batch
  
  // MongoDB connection
  const mongoClient = new MongoClient('mongodb://admin:ZguF6MUddcwX@47.84.35.30:27017');
  await mongoClient.connect();
  const db = mongoClient.db('recruitment');
  const collection = db.collection('recruitmentapp_companyinfo');

  // Elasticsearch connection
  const esClient = new Client({
    node: 'https://elasticsearch.mangoads.com.vn/',
    auth: {
      username: 'mangoads',
      password: 'C1xPHEG03N1Xoe6l6gJCnqR808NVpBVzi1J0fEsgYHkj5brr7T'
    }
  });
  
  // Đếm tổng số documents
  const totalDocs = await collection.countDocuments();
  console.log(`Tổng số documents: ${totalDocs}`);
  
  // Sử dụng cursor để đọc từng batch
  const cursor = collection.find({});
  let batch = [];
  let processedCount = 0;
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    batch.push(doc);
    
    // Khi đủ batch size hoặc hết documents
    if (batch.length === BATCH_SIZE) {
      await sendBatchToES(esClient, batch);
      processedCount += batch.length;
      console.log(`Đã xử lý: ${processedCount}/${totalDocs}`);
      batch = []; // Reset batch
    }
  }
  
  // Gửi batch cuối cùng nếu còn
  if (batch.length > 0) {
    await sendBatchToES(esClient, batch);
    processedCount += batch.length;
    console.log(`Đã xử lý: ${processedCount}/${totalDocs}`);
  }
  
  await cursor.close();
  await mongoClient.close();
  console.log('Sync hoàn tất!');
}

async function sendBatchToES(esClient, batch) {
  const body = batch.flatMap(doc => {
    const { _id, ...docWithoutId } = doc;
    return [
      { index: { _index: 'recruitmentapp_companyinfo', _id: _id.toString() } },
      { ...docWithoutId }
    ];
  });
  
  try {
    const result = await esClient.bulk({ body });
    
    // Kiểm tra lỗi
    if (result.errors) {
      console.error('Có lỗi trong batch:');
      result.items.forEach((item, i) => {
        if (item.index?.error) {
          console.error(`Document ${i}: ${JSON.stringify(item.index.error)}`);
        }
      });
    }
  } catch (error) {
    console.error('Lỗi khi gửi batch:', error);
    throw error;
  }
}

syncDataInBatches().catch(console.error);