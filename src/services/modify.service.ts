import { initPocketBase, ensureAuthenticated, pb } from "./pb.service.js";
import PocketBase from "pocketbase";

async function getFilteredRecords(collection: string, filter: string) {
  initPocketBase();
  await ensureAuthenticated();

  const records = await pb.collection(collection).getFullList({
    filter: filter,
  });

  return records;
}

export async function modifyRecords(
  collection: string,
  filter: string,
  updateData: Record<string, any>,
  dryRun: boolean
): Promise<void> {
  try {
    const records = await getFilteredRecords(collection, filter);

    console.log(`Found ${records.length} records matching filter: ${filter}`);

    if (records.length === 0) {
      console.log("No records to update");
      return;
    }

    // Afficher un exemple de modification
    if (records.length > 0) {
      console.log("\nExample of changes:");
      console.log("Original record:", records[0]);
      console.log("Will be updated with:", updateData);
    }

    if (dryRun) {
      console.log("\nDRY RUN - No changes were made");
      return;
    }

    // Effectuer les modifications
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
      console.log(`Updated ${updated}/${records.length} records...`);
    }

    console.log(`Successfully updated ${updated} records`);
  } catch (error) {
    console.error("Error modifying records:", error);
    process.exit(1);
  }
}

export async function deleteRecords(
  collection: string,
  filter: string,
  dryRun: boolean
): Promise<void> {
  try {
    const records = await getFilteredRecords(collection, filter);

    console.log(`Found ${records.length} records matching filter: ${filter}`);

    if (records.length === 0) {
      console.log("No records to delete");
      return;
    }

    // Afficher un exemple de suppression
    if (records.length > 0) {
      console.log("\nExample of record to be deleted:");
      console.log(records[0]);
    }

    if (dryRun) {
      console.log("\nDRY RUN - No changes were made");
      return;
    }

    // Effectuer les suppressions
    const batchSize = 10;
    let deleted = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await Promise.all(
        batch.map((record) => pb.collection(collection).delete(record.id))
      );
      deleted += batch.length;
      console.log(`Deleted ${deleted}/${records.length} records...`);
    }

    console.log(`Successfully deleted ${deleted} records`);
  } catch (error) {
    console.error("Error deleting records:", error);
    process.exit(1);
  }
}

export async function createRecord(
  collection: string,
  recordData: Record<string, any>
): Promise<void> {
  try {
    initPocketBase();
    await ensureAuthenticated();

    const batchSize = 10;
    const records = Array.isArray(recordData) ? recordData : [recordData];
    let created = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await Promise.all(
        batch.map((data) => pb.collection(collection).create(data))
      );
      created += batch.length;
      console.log(`Created ${created}/${records.length} records...`);
    }

    console.log("Records created successfully");
  } catch (error) {
    console.error("Error creating records:", error);
    process.exit(1);
  }
}
