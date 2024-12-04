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

async function getUserConfirmation(message: string): Promise<boolean> {
  console.log(message);
  const response = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
  process.stdin.destroy();
  return response.toLowerCase() === "yes";
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

    // Demander confirmation
    const confirmed = await getUserConfirmation(
      `\nAbout to update ${records.length} records. Type 'yes' to continue:`
    );

    if (!confirmed) {
      console.log("Operation cancelled");
      return;
    }

    // Effectuer les modifications
    let updated = 0;
    for (const record of records) {
      await pb.collection(collection).update(record.id, updateData);
      updated++;
      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${records.length} records...`);
      }
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

    // Demander confirmation
    const confirmed = await getUserConfirmation(
      `\nAbout to delete ${records.length} records. Type 'yes' to continue:`
    );

    if (!confirmed) {
      console.log("Operation cancelled");
      return;
    }

    // Effectuer les suppressions
    let deleted = 0;
    for (const record of records) {
      await pb.collection(collection).delete(record.id);
      deleted++;
      if (deleted % 10 === 0) {
        console.log(`Deleted ${deleted}/${records.length} records...`);
      }
    }

    console.log(`Successfully deleted ${deleted} records`);
  } catch (error) {
    console.error("Error deleting records:", error);
    process.exit(1);
  }
}
