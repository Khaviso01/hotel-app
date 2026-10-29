import fs from 'node:fs';
import path from 'node:path';
import type { Store } from '../models/types.js';
import { starter } from './seed.js';

// Define the file path used to store application data locally.
const dbFile = path.resolve(process.cwd(), 'data.json');

// Initialize the database using existing saved data or starter data.
// If data.json exists, load and parse its contents.
export let db: Store = fs.existsSync(dbFile)
  ? JSON.parse(fs.readFileSync(dbFile, 'utf8'))
  : starter;

// Save the current database state to the JSON file.
export const save = () =>
  fs.writeFileSync(
    dbFile,
    JSON.stringify(db, null, 2)
  );

// Create the database file with starter data if it does not exist.
if (!fs.existsSync(dbFile))
  save();
