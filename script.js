// -----------------------------
// TAB SWITCHING
// -----------------------------
const tabButtons = document.querySelectorAll(".tabBtn");
const tabContents = document.querySelectorAll(".tabContent");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.tab;

        tabContents.forEach(tab => tab.classList.add("hidden"));
        tabButtons.forEach(b => {
            b.classList.remove("bg-green-600", "text-white");
            b.classList.add("bg-gray-200", "text-gray-800");
        });

        document.getElementById(target).classList.remove("hidden");
        btn.classList.add("bg-green-600", "text-white");
    });
});


// -----------------------------
// API CALL – Recommend Crop
// -----------------------------
const recommendBtn = document.getElementById("recommendBtn");
const resultBox = document.getElementById("recommendResult");
const cropName = document.getElementById("cropName");
const reasoning = document.getElementById("reasoning");

recommendBtn.addEventListener("click", async () => {

    // Read form values
    let location = document.getElementById("location").value.trim();
    let month = document.getElementById("month").value;
    let N = document.getElementById("n").value;
    let P = document.getElementById("p").value;
    let K = document.getElementById("k").value;

    // PH is not in UI, so using neutral 7 (or add ph input)
    let ph = 7;  

    if (!location || !month || !N || !P || !K) {
        alert("⚠ Please fill all required fields!");
        return;
    }

    // Show loading
    recommendBtn.disabled = true;
    recommendBtn.innerText = "Analyzing...";
    recommendBtn.classList.add("opacity-50", "cursor-not-allowed");

    try {
        const apiUrl = "https://crop-recommendation-system-backend-wt4v.onrender.com/recommend_crop";

        const params = new URLSearchParams({
            N: N,
            P: P,
            K: K,
            ph: ph,
            city: location,
            month: month
        });

        const response = await fetch(apiUrl + "?" + params.toString(), {
            method: "POST"
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // Show result section
        resultBox.classList.remove("hidden");

        // Top crop
        cropName.innerText = "🌱 " + data.top_3_crops[0].crop;
        reasoning.innerHTML = `
            <p><b>Top 3 recommendations:</b></p>
            <ul class="list-disc ml-6">
                <li>${data.top_3_crops[0].crop} (confidence: ${(data.top_3_crops[0].confidence.toFixed(2)) * 100}%)</li>
                <li>${data.top_3_crops[1].crop} (confidence: ${(data.top_3_crops[1].confidence.toFixed(2) * 100)}%)</li>
                <li>${data.top_3_crops[2].crop} (confidence: ${(data.top_3_crops[2].confidence.toFixed(2) * 100)}%)</li>
            </ul>

            <p class="mt-3"><b>Weather (3-month avg):</b></p>
            <ul class="ml-6">
                <li>🌡 Temperature: ${data.weather.temperature.toFixed(2)} °C</li>
                <li>💧 Humidity: ${data.weather.humidity.toFixed(2)} %</li>
                <li>🌧 Rainfall: ${data.weather.rainfall.toFixed(2)} mm</li>
            </ul>
        `;

        // Save to history
        saveToHistory(data.top_3_crops);

    } catch (err) {
        alert("API Error: " + err.message);
    }

    // Reset button
    recommendBtn.disabled = false;
    recommendBtn.innerText = "Recommend Crop";
    recommendBtn.classList.remove("opacity-50", "cursor-not-allowed");
});


// -----------------------------
// HISTORY HANDLING
// -----------------------------
function saveToHistory(crops) {
    let history = JSON.parse(localStorage.getItem("cropHistory")) || [];

    history.push({
        date: new Date().toLocaleString(),
        result: crops
    });

    localStorage.setItem("cropHistory", JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("cropHistory")) || [];

    history.forEach(entry => {
        let item = document.createElement("li");
        item.classList.add("bg-white", "p-3", "rounded-lg", "shadow");

        item.innerHTML = `
            <p><b>${entry.date}</b></p>
            <ul class="ml-5 list-disc">
                <li>${entry.result[0].crop}</li>
                <li>${entry.result[1].crop}</li>
                <li>${entry.result[2].crop}</li>
            </ul>
        `;

        historyList.appendChild(item);
    });
}

// Load history on startup
loadHistory();
