import fs from "node:fs";

function read(path){
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const categories = read("./data/categories.json");
const standings = read("./data/standings.json");
const stories = read("./data/stories.json");
const history = read("./data/history.json");
const people = read("./data/people.json");
const deepDives = read("./data/deepDives.json");

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
  if (!deepDives[id]) errors.push(`deepDives.json に ${id} がありません`);

  if (standings[id]) {
    if (!standings[id].updatedAt) errors.push(`standings.${id}: updatedAt がありません`);
    if (!standings[id].sourceName) errors.push(`standings.${id}: sourceName がありません`);
    if (!standings[id].sourceUrl) errors.push(`standings.${id}: sourceUrl がありません`);
    if (!Array.isArray(standings[id].top)) errors.push(`standings.${id}: top は配列にしてください`);
    if ((standings[id].top || []).length > 5) errors.push(`standings.${id}: 上位表示は5件まで`);
    for (const [index, row] of (standings[id].top || []).entries()) {
      for (const field of ["rank", "name", "team", "points", "note"]) {
        if (row[field] === undefined || row[field] === "") errors.push(`standings.${id}.top[${index}]: ${field} がありません`);
      }
    }
  }

  if (stories[id]) {
    for (const field of ["updatedAt", "summary", "whyNow", "nextWatch", "beginnerGuide"]) {
      if (!stories[id][field]) errors.push(`stories.${id}: ${field} がありません`);
    }
    if (!stories[id].sourceName || !stories[id].sourceUrl) errors.push(`stories.${id}: 出典がありません`);
    if (!stories[id].beginnerHook) errors.push(`stories.${id}: beginnerHook がありません`);
    if (!Array.isArray(stories[id].themes) || stories[id].themes.length < 3 || stories[id].themes.length > 5) {
      errors.push(`stories.${id}: themes は3〜5件にしてください`);
    }
  }

  if (history[id] && (!Array.isArray(history[id]) || history[id].length < 4 || history[id].length > 6)) {
    errors.push(`history.${id}: 年代別ヒストリーは4〜6件にしてください`);
  }

  if (people[id] && (!Array.isArray(people[id]) || people[id].length < 3 || people[id].length > 5)) {
    errors.push(`people.${id}: 人物・チームは3〜5件にしてください`);
  }

  if (deepDives[id]) {
    const d = deepDives[id];
    for (const field of ["updatedAt", "sourceName", "sourceUrl", "f1Lens", "historyEntry", "afterRace"]) {
      if (!d[field]) errors.push(`deepDives.${id}: ${field} がありません`);
    }
    if (!d.f1Lens?.title || !d.f1Lens?.body) errors.push(`deepDives.${id}: f1Lens の必須項目がありません`);
    if (!Array.isArray(d.threeWords) || d.threeWords.length !== 3) errors.push(`deepDives.${id}: threeWords は3件にしてください`);
    for (const [index, word] of (d.threeWords || []).entries()) {
      if (!word.term || !word.meaning) errors.push(`deepDives.${id}.threeWords[${index}]: 必須項目がありません`);
    }
    if (!Array.isArray(d.checklist) || d.checklist.length !== 5) errors.push(`deepDives.${id}: checklist は5件にしてください`);
    for (const [index, item] of (d.checklist || []).entries()) {
      if (!item.label || !item.detail) errors.push(`deepDives.${id}.checklist[${index}]: 必須項目がありません`);
    }
    if (!d.historyEntry?.era || !d.historyEntry?.title || !d.historyEntry?.body) errors.push(`deepDives.${id}: historyEntry の必須項目がありません`);
    if (!d.afterRace?.title || !d.afterRace?.body || !Array.isArray(d.afterRace?.prompts) || d.afterRace.prompts.length !== 3) {
      errors.push(`deepDives.${id}: afterRace の必須項目がありません`);
    }
  }
}

if (errors.length) {
  console.error("データ検証エラー:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("OK: data files are valid.");
