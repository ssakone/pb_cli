import { initPocketBase, ensureAuthenticated, pb } from "./pb.service.js";

async function getFilteredRecords(collection: string, filter: string) {
  initPocketBase();
  await ensureAuthenticated();

  const records = await pb.collection(collection).getFullList({
    filter: filter,
  });

  return records;
}

export async function scriptModifyRecords(
  collection: string,
  filter: string,
  updateData: Record<string, any>,
  dryRun: boolean
): Promise<void> {
  try {
    const records = await getFilteredRecords(collection, filter);

    if (records.length === 0) {
      console.log(`No records found in ${collection} matching filter: ${filter}`);
      return;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would update ${records.length} records in ${collection}`);
      return;
    }

    const batchSize = 10;
    let updated = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await Promise.all(
        batch.map((record) =>
          pb.collection(collection).update(record.id, updateData)
        )
      );
      updated += batch.length;
    }

    console.log(`Updated ${updated} records in ${collection}`);
  } catch (error) {
    console.error(`Error updating records in ${collection}:`, error);
    throw error;
  }
}

export async function scriptDeleteRecords(
  collection: string,
  filter: string,
  dryRun: boolean
): Promise<void> {
  try {
    const records = await getFilteredRecords(collection, filter);

    if (records.length === 0) {
      console.log(`No records found in ${collection} matching filter: ${filter}`);
      return;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would delete ${records.length} records from ${collection}`);
      return;
    }

    const batchSize = 10;
    let deleted = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await Promise.all(
        batch.map((record) => pb.collection(collection).delete(record.id))
      );
      deleted += batch.length;
    }

    console.log(`Deleted ${deleted} records from ${collection}`);
  } catch (error) {
    console.error(`Error deleting records from ${collection}:`, error);
    throw error;
  }
}

export async function scriptCreateRecord(
  collection: string,
  recordData: Record<string, any>
): Promise<void> {
  try {
    initPocketBase();
    await ensureAuthenticated();

    const records = Array.isArray(recordData) ? recordData : [recordData];
    const batchSize = 10;
    let created = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await Promise.all(
        batch.map((data) => pb.collection(collection).create(data))
      );
      created += batch.length;
    }

    console.log(`Created ${created} records in ${collection}`);
  } catch (error) {
    console.error(`Error creating records in ${collection}:`, error);
    throw error;
  }
}
