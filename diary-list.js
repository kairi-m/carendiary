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

      div.appendChild(button);
    }

    container.appendChild(div);
  });
});
