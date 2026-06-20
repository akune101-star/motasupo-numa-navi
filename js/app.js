const state = {
  mode: "story",
  selectedId: "f1",
  categories: [],
  standings: {},
  stories: {},
  history: {},
  people: {},
  deepDives: {}
};

const $ = (id) => document.getElementById(id);

const categoryVisuals = {
  f1: {
    image: "./assets/images/category-f1.png",
    fallback: "linear-gradient(145deg,#7d1b22,#121b27 56%,#07101a)"
  },
  wrc: {
    image: "./assets/images/category-wrc.png",
    fallback: "linear-gradient(145deg,#d8e6ed,#274758 45%,#101923)"
  },
  wec: {
    image: "./assets/images/category-wec.png",
    fallback: "linear-gradient(145deg,#224c67,#172938 46%,#090d14)"
  },
  supergt: {
    image: "./assets/images/category-supergt.png",
    fallback: "linear-gradient(145deg,#8b2527,#243245 52%,#090e16)"
  },
  sformula: {
    image: "./assets/images/category-sformula.png",
    fallback: "linear-gradient(145deg,#6d2730,#142a3e 52%,#080e16)"
  },
  fe: {
    image: "./assets/images/category-formulae.png",
    fallback: "linear-gradient(145deg,#164d70,#162b52 52%,#070e18)"
  },
  nascar: {
    image: "./assets/images/category-nascar.png",
    fallback: "linear-gradient(145deg,#bf642b,#31394a 48%,#0b1018)"
  }
};

async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`${path} を読み込めませんでした`);
  return res.json();
}

async function init(){
  try{
    const [categories, standings, stories, history, people, deepDives] = await Promise.all([
      loadJson("./data/categories.json"),
      loadJson("./data/standings.json"),
      loadJson("./data/stories.json"),
      loadJson("./data/history.json"),
      loadJson("./data/people.json"),
      loadJson("./data/deepDives.json")
    ]);

    state.categories = categories;
    state.standings = standings;
    state.stories = stories;
    state.history = history;
    state.people = people;
    state.deepDives = deepDives;

    const newest = Object.values(standings)
      .map(x => x.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    $("globalUpdated").textContent = newest ? `データ最終更新: ${newest}` : "データ更新日: 未設定";

    document.querySelectorAll(".mode").forEach(btn => {
      btn.addEventListener("click", () => setMode(btn.dataset.mode));
    });

    document.querySelectorAll("[data-mode-link]").forEach(link => {
      link.addEventListener("click", () => setMode(link.dataset.modeLink));
    });

    document.querySelectorAll(".siteNav a").forEach(link => {
      link.addEventListener("click", () => {
        document.querySelectorAll(".siteNav a").forEach(item => item.classList.toggle("active", item === link));
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

function setMode(mode){
  state.mode = mode;
  document.querySelectorAll(".mode").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  renderContent();
}

function renderCategories(){
  const list = filteredCategories();
  $("categoryList").innerHTML = list.map(c => `
    <button
      class="cat ${c.id === state.selectedId ? "active" : ""}"
      data-id="${c.id}"
      aria-pressed="${c.id === state.selectedId}"
    >
      <span
        class="catImage"
        aria-hidden="true"
        style="background-image:url('${categoryVisuals[c.id]?.image || ""}'),${categoryVisuals[c.id]?.fallback || "linear-gradient(145deg,#26364a,#07101a)"}"
      ></span>
      <span class="icon" aria-hidden="true">${c.icon}</span>
      <span class="catContent">
        <span class="catTop">
          <span class="catTitle ${c.title.length > 10 ? "long" : ""}">${c.title}</span>
          <span class="tag">${c.tag}</span>
        </span>
        <span class="catDescription">${c.hook}</span>
      </span>
    </button>
  `).join("");

  document.querySelectorAll(".cat").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      renderCategories();
      renderContent();
      $("reader").scrollIntoView({ behavior: "smooth", block: "start" });
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
  if(state.mode === "deepDive") renderDeepDive(c, id);
  if(state.mode === "standings") renderStandings(c, id);
  if(state.mode === "history") renderHistory(c, id);
  if(state.mode === "people") renderPeople(c, id);
  if(state.mode === "beginner") renderBeginner(c, id);
}

function renderDeepDive(c, id){
  const d = state.deepDives[id];
  if(!d){
    $("content").innerHTML = `<section class="panel"><h2>${c.title} 深掘り</h2><p>読み物を準備中です。</p></section>`;
    return;
  }

  const words = d.threeWords.map(word => `
    <article class="termCard">
      <small>KEY WORD</small>
      <strong>${word.term}</strong>
      <p>${word.meaning}</p>
    </article>
  `).join("");

  const checklist = d.checklist.map((item, index) => `
    <li class="checkItem">
      <span class="checkNumber" aria-hidden="true">${index + 1}</span>
      <div><strong>${item.label}</strong><p>${item.detail}</p></div>
    </li>
  `).join("");

  const prompts = d.afterRace.prompts.map(prompt => `<li>${prompt}</li>`).join("");
  const deepDiveTitle = id === "f1" ? "F1をもっと深く見るなら" : `F1好きなら、${c.title}のここを見ろ`;

  $("content").innerHTML = `
    <section class="panel deepHero">
      <p class="eyebrow">From F1</p>
      <h2>${c.icon} ${deepDiveTitle}</h2>
      <h3>${d.f1Lens.title}</h3>
      <p class="storyText">${d.f1Lens.body}</p>
      ${sourceBlock(d)}
    </section>

    <div class="readingStack">
      <section class="panel readingPanel">
        <p class="eyebrow">Three Words</p>
        <h3>まず覚える3ワード</h3>
        <p class="sectionLead">全部は覚えなくていい。この三つが聞こえたら、レースの輪郭が少し濃くなります。</p>
        <div class="glossaryGrid">${words}</div>
      </section>

      <section class="panel readingPanel">
        <p class="eyebrow">Before The Race</p>
        <h3>観戦前チェックリスト</h3>
        <p class="sectionLead">中継が始まる前の五分で確認すること。答え合わせは、チェッカーのあとで。</p>
        <ol class="checkList">${checklist}</ol>
      </section>

      <section class="panel readingPanel historyDoor">
        <p class="eyebrow">History Door</p>
        <span class="eraLabel">${d.historyEntry.era}</span>
        <h3>${d.historyEntry.title}</h3>
        <p class="storyText">${d.historyEntry.body}</p>
      </section>

      <section class="panel readingPanel afterglow">
        <p class="eyebrow">After The Race</p>
        <h3>${d.afterRace.title}</h3>
        <p class="storyText">${d.afterRace.body}</p>
        <ul class="afterPrompts">${prompts}</ul>
      </section>
    </div>
  `;
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
