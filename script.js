const perguntas = [
  {
    pergunta: "Você encontra um inimigo mais forte que você. O que faz?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Como você age quando está jogando em grupo?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Seu lema seria:",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Uma guerra começou. Qual seu papel?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "O que te dá mais satisfação?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Qual dessas funções você prefere em jogos?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Você tem 10 minutos pra escapar de uma armadilha. Você:",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Como você reage a uma traição?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "O que te representa melhor?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  },
  {
    pergunta: "Qual dessas frases combina com você?",
    opcoes: ["📘", "🔩", "🔮", "🔩", "🔮"]
  }
];

const form = document.getElementById('quiz-form');
const questionsDiv = document.getElementById('questions');
const resultDiv = document.getElementById('result');

async function getIP() {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;
}

function hasAnswered(ip) {
  const answered = JSON.parse(localStorage.getItem("answeredIps")) || [];
  return answered.includes(ip);
}

function saveIP(ip) {
  const answered = JSON.parse(localStorage.getItem("answeredIps")) || [];
  answered.push(ip);
  localStorage.setItem("answeredIps", JSON.stringify(answered));
}

async function init() {
  const ip = await getIP();
  if (hasAnswered(ip)) {
    questionsDiv.innerHTML = "<p>Você já respondeu este questionário.</p>";
    form.remove();
    return;
  }

  perguntas.forEach((q, i) => {
    const div = document.createElement('div');
    div.innerHTML = `<p>${i + 1}. ${q.pergunta}</p>` +
      q.opcoes.map((opt, idx) =>
        `<label><input type="radio" name="q${i}" value="${opt}" required> ${String.fromCharCode(65 + idx)}</label>`
      ).join("<br>");
    questionsDiv.appendChild(div);
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const nome = formData.get("nome");
    const twitch = formData.get("twitch") || "Não informado";
    const frase = formData.get("frase");

    const counts = { "📘": 0, "🔩": 0, "🔮": 0 };
    perguntas.forEach((_, i) => {
      counts[formData.get(`q${i}`)]++;
    });

    const vencedor = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    let faccao = {
      "📘": "Arquivistas",
      "🔩": "Ferronatos",
      "🔮": "Éterios"
    }[vencedor];

    const resultado = `
      <h2>Você é da facção: ${faccao} ${vencedor}</h2>
      <p>Frase escolhida: "${frase}"</p>
    `;
    resultDiv.innerHTML = resultado;
    saveIP(ip);

    const webhookData = {
      embeds: [{
        title: `Nova resposta - ${faccao} ${vencedor}`,
        color: 3447003,
        fields: [
          { name: "Nome", value: nome, inline: true },
          { name: "Canal da Twitch", value: twitch, inline: true },
          { name: "Frase escolhida", value: frase }
        ],
        footer: { text: "Questionário de Facções" }
      }]
    };

    await fetch("https://discord.com/api/webhooks/1369495262485151744/FeUI8IfdyEZDgZl55TCMP7Zzmo36kMKH_0aKAXU3BUWmvY9dm76hPzG-Ol0zsDWfa9ju", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookData)
    });
  };
}

init();