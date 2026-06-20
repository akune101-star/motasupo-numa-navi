import fs from "node:fs";

function read(path){
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const categories = read("./data/categories.json");
const standings = read("./data/standings.json");
const stories = read("./data/stories.json");
const history = read("./data/history.json");
const people = read("./data/people.json");

const ids = categories.map(c => c.id);
const errors = [];

for (const c of categories) {
  if (!c.id || !c.title || !c.hook) errors.push(`categories: ${c.id || "(no id)"} に必須項目がありません`);
}

for (const id of ids) {
  if (!standings[id]) errors.push(`standings.json に ${id} がありません`);
  if (!stories[id]) errors.push(`stories.json に ${id} がありません`);
  if (!history[id]) errors.push(`history.json に ${id} がありません`);
  if (!people[id]) errors.push(`people.json に ${id} がありません`);

  if (standings[id]) {
    if (!standings[id].updatedAt) errors.push(`standings.${id}: updatedAt がありません`);
    if (!Array.isArray(standings[id].top)) errors.push(`standings.${id}: top は配列にしてください`);
    if ((standings[id].top || []).length > 5) errors.push(`standings.${id}: 上位表示は5件まで`);
  }

  if (stories[id]) {
    for (const field of ["updatedAt", "summary", "whyNow", "nextWatch", "beginnerGuide"]) {
      if (!stories[id][field]) errors.push(`stories.${id}: ${field} がありません`);
    }
  }
}

if (errors.length) {
  console.error("データ検証エラー:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("OK: data files are valid.");
