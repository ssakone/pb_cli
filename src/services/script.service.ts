import console from "console";
import { initPocketBase, ensureAuthenticated, pb } from "./pb.service.js";
import { RecordModel } from "pocketbase";

const BATCH_SIZE = 10;

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
): Promise<boolean> {
  try {
    const records = await getFilteredRecords(collection, filter);

    if (records.length === 0) {
      console.log(
        `No records found in ${collection} matching filter: ${filter}`
      );
      return false;
    }

    if (dryRun) {
      console.log(
        `[DRY RUN] Would update ${records.length} records in ${collection}`
      );
      return true;
    }

    let updated = 0;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((record: RecordModel) =>
          pb.collection(collection).update(record.id, updateData)
        )
      );
      updated += batch.length;
    }

    console.log(`Updated ${updated} records in ${collection}`);
    return true;
  } catch (error) {
    console.log(`Error updating records in ${collection}:`, error);
    return false;
  }
}

export async function scriptDeleteRecords(
  collection: string,
  filter: string,
  dryRun: boolean
): Promise<boolean> {
  try {
    const records = await getFilteredRecords(collection, filter);

    if (records.length === 0) {
      console.log(
        `No records found in ${collection} matching filter: ${filter}`
      );
      return true;
    }

    if (dryRun) {
      console.log(
        `[DRY RUN] Would delete ${records.length} records from ${collection}`
      );
      return true;
    }

    let deleted = 0;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((record: RecordModel) =>
          pb.collection(collection).delete(record.id)
        )
      );
      deleted += batch.length;
    }

    console.log(`Deleted ${deleted} records from ${collection}`);
    return true;
  } catch (error: any) {
    console.error(
      `Error deleting records from ${collection}:`,
      error.statusText
    );
    return false;
  }
}

export async function scriptCreateRecord(
  collection: string,
  recordData: Record<string, any>
): Promise<boolean> {
  try {
    initPocketBase();
    await ensureAuthenticated();

    const records = Array.isArray(recordData) ? recordData : [recordData];
    let created = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((data) => pb.collection(collection).create(data))
      );
      created += batch.length;
    }

    console.log(`Created ${created} records in ${collection}`);
    return true;
  } catch (error: any) {
    console.error(`Error creating records in ${collection}:`, error.statusText);
    return false;
  }
}