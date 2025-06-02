const homeGoalContainer = document.getElementById("goalContainer");
let goals = JSON.parse(localStorage.getItem("goals") || "[]");

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function renderGoals() {
  if (!homeGoalContainer) return;
  homeGoalContainer.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 達成済みと期限切れの目標を除外
  const activeGoals = goals.filter(goal => {
    const deadline = new Date(goal.deadline);
    return goal.status !== "達成" && deadline >= today;
  });

  if (activeGoals.length === 0) {
    homeGoalContainer.innerHTML = "<p>現在、進行中の目標はありません。</p>";
    return;
  }

  activeGoals.forEach(goal => {
    const div = document.createElement("div");
    div.className = "goal-card";

    let percent = 0;
    if (goal.type === "quantitative") {
      percent = Math.round((goal.currentProgress || 0) / goal.targetValue * 100);
    } else if (goal.type === "checklist") {
      const doneCount = goal.items.filter(i => i.done).length;
      percent = Math.round(doneCount / goal.items.length * 100);
    }

    div.innerHTML = `
      <div class="goal-row" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="goal-title" style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">${goal.title}</span>
          <span class="goal-progress" style="font-size: 1rem;">達成率: <strong>${percent}%</strong></span>
        </div>
        <div class="progress-bar" style="background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">
          <div class="progress-fill" style="width: ${percent}%; height: 100%; background: #2ecc71;"></div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.95rem; color: #555;">
          <span>締切：${goal.deadline}</span>
          <span class="goal-actions" style="display: flex; gap: 8px;">
            <button class="delete" onclick="deleteGoal(${goal.id})">削除</button>
            <button class="delete" onclick="editGoal(${goal.id})">編集</button>
            <button class="delete" onclick="toggleGoalStatus(${goal.id})">達成</button>
          </span>
        </div>
      </div>
    `;
    homeGoalContainer.appendChild(div);
  });
}

function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  
  localStorage.setItem("editingGoal", JSON.stringify(goal));
  window.location.href = "goals-edit.html";
}

function deleteGoal(id) {
  if (!confirm("この目標を削除してもよろしいですか？")) return;
  
  const goalIndex = goals.findIndex(g => g.id === id);
  if (goalIndex === -1) return;

  // カレンダーからも締め切りイベントを削除
  const goal = goals[goalIndex];
  const events = JSON.parse(localStorage.getItem("calendarEvents") || "{}");
  if (events[goal.deadline]) {
    events[goal.deadline] = events[goal.deadline].filter(
      event => !(event.category === "締め切り" && event.title === `${goal.title}の締め切り`)
    );
    if (events[goal.deadline].length === 0) {
      delete events[goal.deadline];
    }
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  goals.splice(goalIndex, 1);
  saveGoals();
  renderGoals();
}

function toggleGoalStatus(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  goal.status = goal.status === "達成" ? "未達成" : "達成";
  saveGoals();
  renderGoals();
}

window.generateAiSuggestion = async function () {
  const title = document.getElementById("goalTitle")?.value.trim();
  const category = document.getElementById("goalCategory")?.value.trim();
  const deadline = document.getElementById("goalDeadline")?.value;
  const type = document.getElementById("goalType")?.value;

  if (!title || !category || !deadline) {
    alert("目標タイトル、カテゴリ、締め切りをすべて入力してください。");
    return;
  }

  const userPrompt = `
あなたは目標達成の専門家です。
以下の目標に対して、達成に向けた現実的で効果的なアドバイスや取り組み方を提案してください。

【目標タイトル】：${title}
【カテゴリ】：${category}
【締め切り】：${deadline}

提案は箇条書きでまとめてください。
`;

  const suggestionArea = document.getElementById("aiSuggestionResult");
  suggestionArea.textContent = "提案を生成中...";

  try {
    const response = await fetch("https://openai-proxy-server-w980.onrender.com/goal-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt })
    });

    const data = await response.json();
    suggestionArea.innerHTML = `<pre style="white-space:pre-wrap;">${data.reply}</pre>`;
  } catch (error) {
    console.error("AI提案エラー:", error);
    suggestionArea.innerHTML = "<span style='color:red;'>AI提案の取得に失敗しました。</span>";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // URLが index.html で終わっている場合だけ描画する
  if (window.location.pathname.endsWith("index.html")) {
    renderGoals();
  }
});
