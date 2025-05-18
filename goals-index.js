const homeGoalContainer = document.getElementById("goalContainer");
let goals = JSON.parse(localStorage.getItem("goals") || "[]");

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function renderGoals() {
  if (!homeGoalContainer) return;
  homeGoalContainer.innerHTML = "";

  const activeGoals = goals.filter(goal => goal.status !== "達成");

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
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.95rem; color: #555;">
          <span>締切：${goal.deadline}</span>
          <span class="goal-actions" style="display: flex; gap: 8px;">
            <button class="delete" onclick="deleteGoal(${goal.id})">削除</button>
            <button class="delete" onclick="editGoal(${goal.id})">編集</button>
            <button class="delete" onclick="markAsAchieved(${goal.id}, ${percent})">達成</button>
          </span>
        </div>
      </div>
    `;
    homeGoalContainer.appendChild(div);
  });
}

function markAsAchieved(id, percent) {
  if (percent < 100) {
    alert("達成率が100%未満のため、達成できません。");
    return;
  }
  const goal = goals.find(g => g.id === id);
  goal.status = "達成";
  saveGoals();
  renderGoals();
}

function deleteGoal(id) {
  if (!confirm("本当に削除しますか？")) return;
  goals = goals.filter(g => g.id !== id);
  saveGoals();
  renderGoals();
}

function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  localStorage.setItem("editingGoal", JSON.stringify(goal));
  window.location.href = `goals-edit.html`;
}

window.generateAiSuggestion = async function () {
  const title = document.getElementById("goalTitle")?.value.trim();
  const category = document.getElementById("goalCategory")?.value.trim();
  const deadline = document.getElementById("goalDeadline")?.value;
  const type = document.getElementById("goalType")?.value; // 存在前提ならOK

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

提案は箇条書きで3つ以内にまとめてください。
`;

  const suggestionArea = document.getElementById("aiSuggestionResult");
  suggestionArea.textContent = "提案を生成中...";

  try {
    const response = await fetch("http://localhost:3001/goal-advice", {
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
