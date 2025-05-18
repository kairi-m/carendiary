(() => {
  const goalContainer = document.getElementById("goalContainer");
  let goals = JSON.parse(localStorage.getItem("goals") || "[]");

  function saveGoals() {
    localStorage.setItem("goals", JSON.stringify(goals));
  }

  function renderGoals() {
    if (!goalContainer) return;
    goalContainer.innerHTML = "";
    goals.forEach(goal => {
      const div = document.createElement("div");
      div.className = "goal-card";

      if (goal.type === "quantitative") {
        const percent = Math.min((goal.currentProgress || 0) / goal.targetValue * 100, 100);
        div.innerHTML = `
          <h3>${goal.title}</h3>
          <p>${goal.category} ／ ${goal.deadline}</p>
          <p>進捗: ${(goal.currentProgress || 0)} / ${goal.targetValue}${goal.targetType}</p>
          <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
          <input type="number" id="progressInput-${goal.id}" placeholder="追加${goal.targetType}">
          <button class="button" onclick="updateProgress(${goal.id})">進捗を追加</button>
        `;
      } else if (goal.type === "checklist") {
        const doneCount = goal.items.filter(i => i.done).length;
        const percent = Math.min(doneCount / goal.items.length * 100, 100);
        div.innerHTML = `
          <h3>${goal.title}</h3>
          <p>${goal.category} ／ ${goal.deadline}</p>
          <p>チェック済み: ${doneCount} / ${goal.items.length}</p>
          <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
          ${goal.items.map((item, i) => `
            <label><input type="checkbox" onchange="toggleChecklist(${goal.id}, ${i})" ${item.done ? 'checked' : ''}> ${item.text}</label><br>
          `).join('')}
        `;
      } else if (goal.type === "free") {
        const status = goal.status === "達成" ? "✔ 達成" : "⏳ 未達成";
        div.innerHTML = `
          <h3>${goal.title}</h3>
          <p>${goal.category} ／ ${goal.deadline}</p>
          <p>${status}</p>
          <p>${goal.description}</p>
          <label><input type="checkbox" onchange="toggleFreeStatus(${goal.id})" ${goal.status === '達成' ? 'checked' : ''}> 達成</label>
        `;
      }
      goalContainer.appendChild(div);
    });
  }

  window.updateProgress = function(id) {
    const input = document.getElementById(`progressInput-${id}`);
    const value = parseFloat(input.value);
    if (isNaN(value)) return;
    const goal = goals.find(g => g.id === id);
    goal.currentProgress = (goal.currentProgress || 0) + value;
    saveGoals();
    renderGoals();
  };

  window.toggleChecklist = function(goalId, index) {
    const goal = goals.find(g => g.id === goalId);
    goal.items[index].done = !goal.items[index].done;
    saveGoals();
    renderGoals();
  };

  window.toggleFreeStatus = function(goalId) {
    const goal = goals.find(g => g.id === goalId);
    goal.status = goal.status === "達成" ? "未達成" : "達成";
    saveGoals();
    renderGoals();
  };

  window.addQuantitativeGoal = function() {
    const title = document.getElementById("goalTitle").value.trim();
    const category = document.getElementById("goalCategory").value.trim();
    const deadline = document.getElementById("goalDeadline").value;
    const targetType = document.getElementById("goalTargetType").value;
    const targetValue = parseFloat(document.getElementById("goalTargetValue").value);

    if (!title || !category || !deadline || isNaN(targetValue)) {
      alert("すべての項目を正しく入力してください。");
      return;
    }

    const newGoal = {
      id: Date.now(),
      type: "quantitative",
      title,
      category,
      deadline,
      targetType,
      targetValue,
      currentProgress: 0
    };

    goals.push(newGoal);
    saveGoals();
    alert("目標を追加しました。");
    location.href = "goals.html#list";
  };

  window.addChecklistGoal = function() {
    const title = document.getElementById("goalTitle").value.trim();
    const category = document.getElementById("goalCategory").value.trim();
    const deadline = document.getElementById("goalDeadline").value;
    const itemsText = document.getElementById("goalChecklistItems").value.trim();
    const items = itemsText.split("\n").map(text => ({ text, done: false }));

    if (!title || !category || !deadline || items.length === 0) {
      alert("すべての項目を正しく入力してください。");
      return;
    }

    const newGoal = {
      id: Date.now(),
      type: "checklist",
      title,
      category,
      deadline,
      items
    };

    goals.push(newGoal);
    saveGoals();
    alert("目標を追加しました。");
    location.href = "goals.html#list";
  };

  window.addFreeGoal = function() {
    const title = document.getElementById("goalTitle").value.trim();
    const category = document.getElementById("goalCategory").value.trim();
    const deadline = document.getElementById("goalDeadline").value;
    const description = document.getElementById("goalDescription").value.trim();

    if (!title || !category || !deadline || !description) {
      alert("すべての項目を正しく入力してください。");
      return;
    }

    const newGoal = {
      id: Date.now(),
      type: "free",
      title,
      category,
      deadline,
      description,
      status: "未達成"
    };

    goals.push(newGoal);
    saveGoals();
    alert("目標を追加しました。");
    location.href = "goals.html#list";
  };

  window.getHashEditId = function() {
    const hash = window.location.hash;
    if (hash.startsWith("#edit-")) {
      return parseInt(hash.replace("#edit-", ""));
    }
    return null;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash;
    if (hash === "#list") {
      document.getElementById("goalFormSection").style.display = "none";
      renderGoals();
    } else if (!hash.startsWith("#edit-")) {
      switchGoalTypeForm();
    }
  });
})();
