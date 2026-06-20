const state = {
  mode: "story",
  selectedId: "f1",
  categories: [],
  standings: {},
  stories: {},
  history: {},
  people: {}
};

const $ = (id) => document.getElementById(id);

async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`${path} を読み込めませんでした`);
  return res.json();
}

async function init(){
  try{
    const [categories, standings, stories, history, people] = await Promise.all([
      loadJson("./data/categories.json"),
      loadJson("./data/standings.json"),
      loadJson("./data/stories.json"),
      loadJson("./data/history.json"),
      loadJson("./data/people.json")
    ]);

    state.categories = categories;
    state.standings = standings;
    state.stories = stories;
    state.history = history;
    state.people = people;

    const newest = Object.values(standings)
      .map(x => x.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    $("globalUpdated").textContent = newest ? `データ最終更新: ${newest}` : "データ更新日: 未設定";

    document.querySelectorAll(".mode").forEach(btn => {
      btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        document.querySelectorAll(".mode").forEach(b => b.classList.toggle("active", b === btn));
        renderContent();
      });
    });

    $("searchInput").addEventListener("input", renderCategories);
    renderCategories();
    renderContent();
  }catch(error){
    $("content").innerHTML = `<section class="panel"><h2>読み込みエラー</h2><p class="notice">${error.message}<br>ローカルで開く場合は、ファイルを直接開くのではなく <code>python3 -m http.server</code> などで簡易サーバーから開いてください。</p></section>`;
  }
}

function currentCategory(){
  return state.categories.find(c => c.id === state.selectedId) || state.categories[0];
}

function filteredCategories(){
  const q = $("searchInput").value.trim().toLowerCase();
  if(!q) return state.categories;
  return state.categories.filter(c => [
    c.title, c.tag, c.hook, ...(c.keywords || [])
  ].join(" ").toLowerCase().includes(q));
}

function renderCategories(){
  const list = filteredCategories();
  $("categoryList").innerHTML = list.map(c => `
    <button class="cat ${c.id === state.selectedId ? "active" : ""}" data-id="${c.id}">
      <div class="catHead">
        <div class="catTitle"><span class="icon">${c.icon}</span><span>${c.title}</span></div>
        <span class="tag">${c.tag}</span>
      </div>
      <p>${c.hook}</p>
    </button>
  `).join("");

  document.querySelectorAll(".cat").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      renderCategories();
      renderContent();
      if(window.matchMedia("(max-width: 860px)").matches){
        $("content").scrollIntoView({ behavior: "smooth", block: "start" });
      }else{
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

function sourceBlock(item){
  const source = item?.sourceName || "出典未設定";
  const url = item?.sourceUrl;
  const updated = item?.updatedAt || "未設定";
  return `<div class="meta">
    <span>更新: ${updated}</span>
    <span>出典: ${url ? `<a href="${url}" target="_blank" rel="noopener">${source}</a>` : source}</span>
  </div>`;
}

function renderContent(){
  const c = currentCategory();
  if(!c) return;
  const id = c.id;

  if(state.mode === "story") renderStory(c, id);
  if(state.mode === "standings") renderStandings(c, id);
  if(state.mode === "history") renderHistory(c, id);
  if(state.mode === "people") renderPeople(c, id);
  if(state.mode === "beginner") renderBeginner(c, id);
}

function renderStory(c, id){
  const s = state.stories[id];
  const chips = (s?.themes || []).map(x => `<span>${x}</span>`).join("");
  $("content").innerHTML = `
    <section class="panel">
      <p class="eyebrow">Current Story</p>
      <h2>${c.icon} ${c.title}</h2>
      <p class="storyText">${s?.summary || "ストーリー未設定"}</p>
      <div class="meta">${chips}</div>
      ${sourceBlock(s)}
    </section>
    <div class="cards">
      <div class="card"><b>今見る理由</b><p>${s?.whyNow || "未設定"}</p></div>
      <div class="card"><b>次に見るポイント</b><p>${s?.nextWatch || "未設定"}</p></div>
      <div class="card"><b>初心者向け一言</b><p>${s?.beginnerHook || "未設定"}</p></div>
    </div>
  `;
}

function renderStandings(c, id){
  const st = state.standings[id];
  const rows = (st?.top || []).map(r => `
    <tr>
      <td class="rank">${r.rank}</td>
      <td>${r.name}</td>
      <td>${r.team || "-"}</td>
      <td>${r.points ?? "-"}</td>
      <td>${r.note || ""}</td>
    </tr>
  `).join("");

  $("content").innerHTML = `
    <section class="panel">
      <p class="eyebrow">Standings</p>
      <h2>${c.title} 最新順位メモ</h2>
      <p class="notice">上位の関係をつかむためのスナップショットです。開催中のセッションは未反映の場合があります。正確な最新情報は公式リンクで確認してください。</p>
      ${sourceBlock(st)}
      <div class="tableWrap" style="margin-top:14px">
        <table>
          <thead><tr><th>順位</th><th>名前</th><th>チーム</th><th>ポイント</th><th>メモ</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5">順位データ未設定</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderHistory(c, id){
  const items = state.history[id] || [];
  $("content").innerHTML = `
    <section class="panel">
      <p class="eyebrow">History</p>
      <h2>${c.title}を歴史で掴む</h2>
      <p class="lead">年号暗記ではなく、「何が変わった時代か」で見るためのタイムライン。</p>
      <div style="margin-top:14px">
        ${items.map((e, i) => `
          <div class="era ${i === 0 ? "open" : ""}">
            <button aria-expanded="${i === 0}"><span>${e.era}｜${e.title}</span><span aria-hidden="true">＋</span></button>
            <div class="eraBody">${e.body}</div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
  document.querySelectorAll(".era button").forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.parentElement.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    });
  });
}

function renderPeople(c, id){
  const list = state.people[id] || [];
  $("content").innerHTML = `
    <section class="panel">
      <p class="eyebrow">People / Teams</p>
      <h2>${c.title}でまず見る人物・チーム</h2>
      <div class="people">
        ${list.map(p => `
          <div class="person">
            <small>${p.role}</small>
            <strong>${p.name}</strong>
            <p>${p.whyWatch}</p>
          </div>
        `).join("") || "<p>人物データ未設定</p>"}
      </div>
    </section>
  `;
}

function renderBeginner(c, id){
  const s = state.stories[id];
  $("content").innerHTML = `
    <section class="panel">
      <p class="eyebrow">Beginner Guide</p>
      <h2>${c.title}の初心者向け見方</h2>
      <p class="storyText">${s?.beginnerGuide || "未設定"}</p>
      <div class="cards" style="margin-top:16px">
        <div class="card"><b>全部覚えなくていい</b><p>推し1人、ライバル1人、強いチーム1つだけで十分。</p></div>
        <div class="card"><b>順位より流れ</b><p>なぜ順位が変わったかを見ると、競技の面白さが見える。</p></div>
        <div class="card"><b>公式リンクへ飛ぶ</b><p>このアプリで文脈を掴んで、最後は公式順位表で確認する。</p></div>
      </div>
    </section>
  `;
}

init();
