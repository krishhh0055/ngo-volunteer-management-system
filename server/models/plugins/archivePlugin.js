import Archive from '../Archive.js';

export default function archivePlugin(schema) {
  // Hook for findByIdAndDelete / findOneAndDelete
  schema.post('findOneAndDelete', async function(doc, next) {
    if (doc) {
      try {
        await Archive.create({
          originalCollection: this.model.modelName,
          originalId: doc._id.toString(),
          data: doc.toObject()
        });
        console.log(`[Archive] Saved deleted record from ${this.model.modelName}`);
      } catch (err) {
        console.error(`[Archive Error] Failed to archive ${this.model.modelName} document:`, err);
      }
    }
    next();
  });

  // Hook for document.deleteOne() operations
  schema.post('deleteOne', { document: true, query: false }, async function(doc, next) {
    if (doc) {
      try {
        await Archive.create({
          originalCollection: doc.constructor.modelName,
          originalId: doc._id.toString(),
          data: doc.toObject()
        });
        console.log(`[Archive] Saved deleted record from ${doc.constructor.modelName}`);
      } catch (err) {
        console.error(`[Archive Error] Failed to archive ${doc.constructor.modelName} document:`, err);
      }
    }
    next();
  });
}
