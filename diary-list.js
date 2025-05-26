window.addEventListener("DOMContentLoaded", () => {
  const diary = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
  const container = document.getElementById("diaryListContainer");

  if (Object.keys(diary).length === 0) {
    container.innerHTML = "<p>まだ日記はありません。</p>";
    return;
  }

  const sortedDates = Object.keys(diary).sort();

  sortedDates.forEach(date => {
    const entry = diary[date];
    const div = document.createElement("div");
    div.className = "diary-entry";

    div.innerHTML = `
      <h3>${date}</h3>
      <ul>
        <li><strong>朝食:</strong> ${entry.breakfast || "未入力"}</li>
        <li><strong>昼食:</strong> ${entry.lunch || "未入力"}</li>
        <li><strong>夕食:</strong> ${entry.dinner || "未入力"}</li>
        <li><strong>起床時間:</strong> ${entry.wakeUp || "未入力"}</li>
        <li><strong>就寝時間:</strong> ${entry.sleep || "未入力"}</li>
        <li><strong>運動時間:</strong> ${entry.exercise || "未入力"} 分</li>
        <li><strong>気分:</strong> ${entry.tension || "未入力"}</li>
        <li><strong>天気:</strong> ${entry.weather || "未入力"}</li>
        <li><strong>支出:</strong> ${entry.expense || 0} 円</li>
        <li><strong>活動記録:</strong><br>${entry.notes || "未入力"}</li>
      </ul>
    `;

    if (entry.aiFeedback) {
      const evaluationDiv = document.createElement("div");
      evaluationDiv.className = "ai-evaluation";
      evaluationDiv.style.display = "none";

      evaluationDiv.innerHTML = `
        <strong>健康評価：</strong> ${entry.aiFeedback.healthReview}<br>
        <strong>改善案：</strong> ${entry.aiFeedback.improvementSuggestions}<br>
        <strong>励まし：</strong> ${entry.aiFeedback.encouragement}
      `;
      div.appendChild(evaluationDiv);

      // 🧠 AI評価ボタン
      const button = document.createElement("button");
      button.className = "button";
      button.textContent = "AI評価を見る";
      button.onclick = () => {
        if (evaluationDiv.style.display === "none") {
          evaluationDiv.style.display = "block";
          button.textContent = "AI評価を隠す";
        } else {
          evaluationDiv.style.display = "none";
          button.textContent = "AI評価を見る";
        }
      };

      // ✏️ 編集ボタン
      const editButton = document.createElement("button");
      editButton.className = "button";
      editButton.textContent = "編集";
      editButton.onclick = () => editDiaryEntry(date);

      // 🗑 削除ボタン
      const deleteButton = document.createElement("button");
      deleteButton.className = "button";
      deleteButton.textContent = "削除";
      deleteButton.onclick = () => deleteDiaryEntry(date);

      // 🔲 ボタンをまとめるボックスを作成
      const buttonBox = document.createElement("div");
      buttonBox.style.marginTop = "10px";
      buttonBox.style.display = "flex";
      buttonBox.style.gap = "10px";
      buttonBox.style.flexWrap = "wrap"; // 狭い画面でも折り返し

      // 🧠 ボタンを buttonBox に追加
      buttonBox.appendChild(button);
      buttonBox.appendChild(editButton);
      buttonBox.appendChild(deleteButton);

// 📦 最後に全体ボックスをdivに追加
div.appendChild(buttonBox);

}
    container.appendChild(div);
  });
});

function editDiaryEntry(date) {
  const diary = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
  const entry = diary[date];
  if (!entry) return alert("日記が見つかりません");

  localStorage.setItem("editingDiaryDate", date);
  localStorage.setItem("editingDiaryEntry", JSON.stringify(entry));

  window.location.href = "index.html#edit-diary";
}

function deleteDiaryEntry(date) {
  if (!confirm(`${date} の日記を本当に削除しますか？`)) return;

  const diary = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
  delete diary[date];
  localStorage.setItem("diaryEntries", JSON.stringify(diary));
  alert("日記を削除しました");
  location.reload();
}
