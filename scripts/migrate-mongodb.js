/**
 * MongoDB Data Migration Script
 * Copies all data from the old database to the new one
 */

const mongoose = require('mongoose');

const OLD_MONGO_URL = 'mongodb+srv://sagheer:nP0LPJVyAzTJd8gz@mason-amelia-cluster.l2yvyfn.mongodb.net/';
const NEW_MONGO_URL = 'mongodb+srv://admin_db_user:N36etR5qV9ERTdwY@cluster0.ummmkan.mongodb.net/mainDb';

async function migrate() {
  console.log('🚀 Starting MongoDB migration...\n');

  // Connect to source database
  console.log('📡 Connecting to source database...');
  const sourceConn = await mongoose.createConnection(OLD_MONGO_URL).asPromise();
  console.log('✅ Connected to source database\n');

  // Connect to destination database
  console.log('📡 Connecting to destination database...');
  const destConn = await mongoose.createConnection(NEW_MONGO_URL).asPromise();
  console.log('✅ Connected to destination database\n');

  try {
    // Get all collections from source
    const collections = await sourceConn.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections to migrate:\n`);
    
    for (const collInfo of collections) {
      const collName = collInfo.name;
      
      // Skip system collections
      if (collName.startsWith('system.')) {
        console.log(`⏭️  Skipping system collection: ${collName}`);
        continue;
      }

      console.log(`\n📦 Migrating collection: ${collName}`);
      
      // Get all documents from source collection
      const sourceCollection = sourceConn.db.collection(collName);
      const documents = await sourceCollection.find({}).toArray();
      
      console.log(`   Found ${documents.length} documents`);

      if (documents.length > 0) {
        // Get or create destination collection
        const destCollection = destConn.db.collection(collName);
        
        // Check if destination already has data
        const existingCount = await destCollection.countDocuments();
        if (existingCount > 0) {
          console.log(`   ⚠️  Destination already has ${existingCount} documents`);
          console.log(`   🗑️  Clearing destination collection...`);
          await destCollection.deleteMany({});
        }

        // Insert all documents
        const result = await destCollection.insertMany(documents);
        console.log(`   ✅ Migrated ${result.insertedCount} documents`);
      } else {
        console.log(`   ℹ️  No documents to migrate`);
      }
    }

    // Copy indexes
    console.log('\n\n📑 Migrating indexes...');
    for (const collInfo of collections) {
      const collName = collInfo.name;
      if (collName.startsWith('system.')) continue;

      const sourceCollection = sourceConn.db.collection(collName);
      const indexes = await sourceCollection.indexes();
      
      const destCollection = destConn.db.collection(collName);
      
      for (const index of indexes) {
        // Skip _id index (automatically created)
        if (index.name === '_id_') continue;
        
        try {
          const { key, ...options } = index;
          delete options.v; // Remove version field
          await destCollection.createIndex(key, options);
          console.log(`   ✅ Created index ${index.name} on ${collName}`);
        } catch (err) {
          console.log(`   ⚠️  Index ${index.name} on ${collName}: ${err.message}`);
        }
      }
    }

    console.log('\n\n🎉 Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    await sourceConn.close();
    await destConn.close();
    console.log('📴 Connections closed');
  }
}

migrate().then(() => {
  console.log('\n✨ All done! You can now update your .env.local with the new MongoDB URL.');
  process.exit(0);
}).catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
