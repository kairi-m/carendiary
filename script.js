let currentDate = new Date();
let selectedDate = "";
let events = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
let jobs = JSON.parse(localStorage.getItem("jobList") || "[]");
let categories = JSON.parse(localStorage.getItem("categoryList") || "[]");

const defaultCategories = [
  { name: "授業", color: "#007acc" },
  { name: "テスト", color: "#e74c3c" },
  { name: "バイト", color: "#27ae60" },
  { name: "遊び", color: "#9b59b6" },
  { name: "資格", color: "#f39c12" }
];

if (categories.length === 0) {
  categories = [...defaultCategories];
  localStorage.setItem("categoryList", JSON.stringify(categories));
}

function saveToStorage() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
  localStorage.setItem("jobList", JSON.stringify(jobs));
  localStorage.setItem("categoryList", JSON.stringify(categories));
}

function renderCategoryOptions() {
  const select = document.getElementById("eventCategory");
  select.innerHTML = '<option value="">カテゴリを選択</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

function renderCategoryList() {
  const ul = document.getElementById("categoryList");
  ul.innerHTML = "";
  categories.forEach((cat, index) => {
    const li = document.createElement("li");
    const colorBox = `<span class='color-box' style='background:${cat.color}'></span>`;
    li.innerHTML = `${colorBox}${cat.name}
      <span class="category-buttons">
        <button class="edit" onclick="editCategory(${index})">編集</button>
        <button class="delete" onclick="deleteCategory(${index})">削除</button>
      </span>`;
    ul.appendChild(li);
  });
}

function addCategory(event) {
  event.preventDefault();
  const name = document.getElementById("newCategoryName").value.trim();
  const color = document.getElementById("newCategoryColor").value;

  if (!name) return alert("カテゴリ名を入力してください");
  if (categories.length >= 10) return alert("カテゴリは最大10個までです");
  if (categories.find(c => c.name === name)) return alert("同じ名前のカテゴリがすでに存在します");
  if (categories.find(c => c.color === color)) return alert("この色はすでに使われています");

  categories.push({ name, color });
  saveToStorage();
  renderCategoryOptions();
  renderCategoryList();
  document.getElementById("newCategoryName").value = "";
}

function editCategory(index) {
  const newName = prompt("新しいカテゴリ名：", categories[index].name);
  if (!newName) return;
  const usedColor = categories.map(c => c.color);
  const newColor = prompt("新しいカラーコード：", categories[index].color);
  if (!/^#[0-9a-fA-F]{6}$/.test(newColor)) return alert("カラーコードが不正です");
  if (usedColor.includes(newColor) && newColor !== categories[index].color) return alert("この色はすでに使われています");

  categories[index].name = newName;
  categories[index].color = newColor;
  saveToStorage();
  renderCategoryOptions();
  renderCategoryList();
  generateCalendar(currentDate);
}

function deleteCategory(index) {
  if (index < 5) return alert("初期カテゴリは削除できません");
  if (!confirm("本当に削除しますか？")) return;
  categories.splice(index, 1);
  saveToStorage();
  renderCategoryOptions();
  renderCategoryList();
  generateCalendar(currentDate);
}

function renderJobList() {
  const ul = document.getElementById("jobList");
  ul.innerHTML = "";
  jobs.forEach((job, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${job.name}（¥${job.wage} / ${job.unit}分単位）
      <span class="category-buttons">
        <button class="edit" onclick="editJob(${index})">編集</button>
        <button class="delete" onclick="deleteJob(${index})">削除</button>
      </span>`;
    ul.appendChild(li);
  });
}

function editJob(index) {
  const job = jobs[index];
  const newName = prompt("新しいバイト名", job.name);
  const newWage = parseInt(prompt("新しい時給", job.wage));
  const newUnit = parseInt(prompt("新しい分単位", job.unit));
  if (!newName || isNaN(newWage) || isNaN(newUnit)) return alert("すべての項目を正しく入力してください");

  jobs[index] = { name: newName, wage: newWage, unit: newUnit };
  saveToStorage();
  renderJobList();
  generateCalendar(currentDate);
}

function deleteJob(index) {
  if (!confirm("本当に削除しますか？")) return;
  jobs.splice(index, 1);
  saveToStorage();
  renderJobList();
  generateCalendar(currentDate);
}

function generateCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  document.getElementById("monthYear").textContent = `${year}年 ${month + 1}月`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tbody = document.getElementById("calendar-body");
  tbody.innerHTML = "";

  let row = document.createElement("tr");
  for (let i = 0; i < firstDay; i++) row.appendChild(document.createElement("td"));

  for (let day = 1; day <= daysInMonth; day++) {
    if (row.children.length === 7) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }
    const td = document.createElement("td");
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    td.innerHTML = `<div>${day}</div>`;

    const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
    const diaryEntry = diaryEntries[key];
    if (diaryEntry && diaryEntry.aiFeedback) {
      const mark = document.createElement("div");
      mark.textContent = "📘記録済み";
      mark.style.fontSize = "0.7rem";
      mark.style.color = "#2c3e50";
      td.appendChild(mark);
    }

    // 🔽 過去日付にグレー背景を適用
    const cellDate = new Date(year, month, day);
    if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      td.classList.add("past-day");
    }

    if (events[key]) {
      events[key].forEach((e, i) => {
        const color = categories.find(c => c.name === e.category)?.color || "gray";
        const div = document.createElement("div");
        div.className = "event";
        div.style.backgroundColor = color;
        div.innerHTML = `
          <span>${e.title}</span>
          <div style='text-align:right;'>
            <button onclick='editEvent("${key}", ${i})' style='font-size:0.7rem;'>編集</button>
            <button onclick='deleteEvent("${key}", ${i})' style='font-size:0.7rem;'>削除</button>
          </div>`;
        td.appendChild(div);
      });
    }

    td.onclick = () => openForm(key);
    row.appendChild(td);
  }

  if (row.children.length > 0) {
    while (row.children.length < 7) row.appendChild(document.createElement("td"));
    tbody.appendChild(row);
  }

  calculateSalary();
  renderJobList();
  updateJobSelector();
}

function openForm(date) {
  selectedDate = date;
  document.getElementById("selectedDate").textContent = `${date} の予定追加`;
  document.getElementById("eventForm").style.display = "block";
}

function closeEventForm() {
  document.getElementById("eventForm").style.display = "none";
}

function saveEvent() {
  const cat = document.getElementById("eventCategory").value;
  let title = document.getElementById("eventTitle").value;
  const start = document.getElementById("eventStart").value;
  const end = document.getElementById("eventEnd").value;
  const memo = document.getElementById("eventMemo").value;
  const jobSelect = document.getElementById("jobSelector");

  if (!cat || !title || !start || !end) return alert("全て入力してください");

  if (cat === "バイト") {
    const jobIndex = jobSelect.value;
    if (jobIndex === "") return alert("バイトを選んでください");
    title = jobs[jobIndex].name;
  }

  if (!events[selectedDate]) events[selectedDate] = [];
  events[selectedDate].push({ category: cat, title, start, end, memo });
  saveToStorage();
  generateCalendar(currentDate);
  closeEventForm();
  document.querySelectorAll("#eventForm input, #eventForm select, #eventForm textarea").forEach(e => e.value = "");
  document.getElementById("jobSelector").style.display = "none";
}

function editEvent(date, index) {
  const e = events[date][index];
  const newTitle = prompt("新しいタイトル", e.title);
  const newStart = prompt("新しい開始時刻 (hh:mm)", e.start);
  const newEnd = prompt("新しい終了時刻 (hh:mm)", e.end);
  if (!newTitle || !newStart || !newEnd) return alert("すべての項目を入力してください");

  events[date][index].title = newTitle;
  events[date][index].start = newStart;
  events[date][index].end = newEnd;
  saveToStorage();
  generateCalendar(currentDate);
}

function deleteEvent(date, index) {
  if (!confirm("本当に削除しますか？")) return;
  events[date].splice(index, 1);
  if (events[date].length === 0) delete events[date];
  saveToStorage();
  generateCalendar(currentDate);
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  generateCalendar(currentDate);
}

function calculateSalary() {
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  let total = 0;
  for (let key in events) {
    if (key.startsWith(`${year}-${String(month).padStart(2,'0')}`)) {
      for (let e of events[key]) {
        if (e.category === "バイト") {
          const job = jobs.find(j => j.name === e.title);
          if (!job) continue;
          const [sh, sm] = e.start.split(":").map(Number);
          const [eh, em] = e.end.split(":").map(Number);
          let minutes = ((eh * 60 + em) - (sh * 60 + sm));
          const unit = job.unit || 1;
          minutes = Math.ceil(minutes / unit) * unit;
          const hours = minutes / 60;
          total += hours * job.wage;
        }
      }
    }
  }
  document.getElementById("salaryDisplay").textContent = `今月の給料（概算）：¥${Math.floor(total)}`;
}

function updateJobSelector() {
  const select = document.getElementById("jobSelector");
  select.innerHTML = '<option value="">バイトを選択</option>';
  jobs.forEach((job, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = job.name;
    select.appendChild(option);
  });
}

function addJob() {
  const name = document.getElementById("jobName").value.trim();
  const wage = parseInt(document.getElementById("jobWage").value);
  const unit = parseInt(document.getElementById("jobUnit").value);

  if (!name || isNaN(wage) || isNaN(unit)) {
    alert("すべての項目を正しく入力してください");
    return;
  }

  jobs.push({ name, wage, unit });
  saveToStorage();
  renderJobList();
  updateJobSelector();
  calculateSalary(); // すぐ反映

  // 入力欄をクリア
  document.getElementById("jobName").value = "";
  document.getElementById("jobWage").value = "";
  document.getElementById("jobUnit").value = "";
}

function toggleJobSelect() {
  const cat = document.getElementById("eventCategory").value;
  document.getElementById("jobSelector").style.display = cat === "バイト" ? "block" : "none";
}

// 初期化
generateCalendar(currentDate);
renderCategoryOptions();
renderCategoryList();

function openForm(date) {
  selectedDate = date;
  const today = new Date();
  const clicked = new Date(date);

  if (clicked < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    document.getElementById("eventForm").style.display = "none";
    document.getElementById("diaryForm").style.display = "block";
    document.getElementById("selectedDiaryDate").textContent = `${date} の日記`;
  } else {
    document.getElementById("diaryForm").style.display = "none";
    document.getElementById("eventForm").style.display = "block";
    document.getElementById("selectedDate").textContent = `${date} の予定追加`;
  }
}

function closeDiaryForm() {
  document.getElementById("diaryForm").style.display = "none";
}

async function saveDiary() {
  const parts = selectedDate.split("-");
  const date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  const entry = {
    breakfast: document.getElementById("breakfast").value,
    lunch: document.getElementById("lunch").value,
    dinner: document.getElementById("dinner").value,
    wakeUp: document.getElementById("wakeUp").value,
    sleep: document.getElementById("sleep").value,
    exercise: document.getElementById("exercise").value,
    notes: document.getElementById("notes").value
  };

  // GPT-3.5に日記を送って評価を取得
  const aiFeedback = await evaluateDiaryWithAI(entry);

  // 評価も一緒に保存
  const diary = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
  diary[date] = { ...entry, aiFeedback };
  localStorage.setItem("diaryEntries", JSON.stringify(diary));

  alert("日記とAI評価を保存しました！");
  closeDiaryForm();
}


async function searchWithAI() {
  const query = document.getElementById("aiQuery").value.trim();
  const resultArea = document.getElementById("aiResults");
  resultArea.innerHTML = "検索中...";

  if (!query) return alert("検索内容を入力してください");

  try {
    const res = await fetch("http://localhost:3001/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt: query })
    });

    const data = await res.json();

    console.log("🧠 AIの生応答:", data.reply);

    // OpenAIからの応答（JSON形式の文字列）を解析
    const results = JSON.parse(data.reply);

    resultArea.innerHTML = "";
    results.forEach(item => {
      const div = document.createElement("div");
      div.className = "ai-result";
      div.innerHTML = `
        <strong>${item.date}</strong><br>
        ${item.title}（${item.location}）<br>
        <button onclick="addAIResultToCalendar('${item.date}', '${item.title}')">この予定を追加</button>
      `;
      resultArea.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    resultArea.innerHTML = "AIからの応答を取得できませんでした。形式やネットワークを確認してください。";
  }
}

function addAIResultToCalendar(date, title) {
  if (!events[date]) events[date] = [];
  events[date].push({
    category: "イベント", // または user 選択可能
    title: title,
    start: "00:00",
    end: "23:59",
    memo: "AI提案イベント"
  });
  saveToStorage();
  generateCalendar(currentDate);
  alert(`「${title}」を ${date} に追加しました`);
}

async function evaluateDiaryWithAI(entry) {
  try {
    const response = await fetch("http://localhost:3001/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry })
    });
    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.error("AI評価に失敗しました:", err);
    return {
      healthReview: "評価できませんでした。",
      improvementSuggestions: "改善案を取得できませんでした。",
      encouragement: "応援コメントを取得できませんでした。"
    };
  }
}
