import {
  addRightLetter,
  setWord,
  loadSavedLetters,
  loadUsedLetters,
  addLetterSpaces,
  maskWord,
  lostingHearts,
  showVictory,
} from "./main.js";

// PEGAR A PALAVRA VERDADEIRA DEPOIS QUE O JOGO ACABOU
export async function getRealWord() {
  const URL = "http://localhost:8080/realWord";

  if (!localStorage.getItem("correct_word").includes("*")) {
    return;
  }
  try {
    const resp = await fetch(URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (resp.status === 200) {
      const data = await resp.json();
      localStorage.setItem("correct_word", JSON.stringify(data.word));
    }
  } catch (error) {
    alert("ERRO: " + error.message);
  }
}

// VERIFICA SE TEM UMA PALAVRA NOVA NO BACKEND PARA RECOMEÇAR O JOGO
export async function verifyNewWord(oldWord) {
  const URL = "http://localhost:8080/verifyWord";
  const data = oldWord.slice(1, -1);

  try {
    const resp = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldWord: data }),
    });

    if (resp.status === 200) {
      const recievedData = await resp.json();

      if (recievedData.hasNewWord) {
        localStorage.removeItem("correct_letters");
        localStorage.removeItem("correct_word");
        localStorage.removeItem("hearts");
        localStorage.removeItem("used_letters");
        localStorage.removeItem("game_active");
        location.reload();
      } else {
        loadUsedLetters();
        addLetterSpaces(maskWord(oldWord));
        loadSavedLetters();
      }
    }
  } catch (error) {
    alert("ERRO: " + error.message);
  }
}

// PEGA A NOVA PALAVRA DO BACKEND
export async function getTheNewWord() {
  const savedWord = localStorage.getItem("correct_word");

  if (savedWord) {
    try {
      const parsedWord = JSON.parse(savedWord);
      setWord(parsedWord);
      return;
    } catch (error) {
      localStorage.removeItem("correct_word");
    }
  }

  const URL = "http://localhost:8080/cryptWord";

  try {
    const resp = await fetch(URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (resp.status === 200) {
      const data = await resp.json();
      localStorage.setItem("correct_word", JSON.stringify(data.cryptWord));
      setWord(data.cryptWord);
    }
  } catch (error) {
    alert("ERRO: " + error.message);
  }
}

// ENVIA A LETRA QUE O USUÁRIO CLICOU PARA O BACKEND
export async function sendLetter(letter) {
  const URL = "http://localhost:8080/letter";
  const data = letter.toUpperCase();

  try {
    const resp = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letter: data }),
    });

    if (resp.status === 200) {
      const data2 = await resp.json();
      const exist = data2.exist;

      const usedLetter = document.getElementById("usedLetters");
      usedLetter.textContent = localStorage.getItem("used_letters");

      if (exist) {
        const newCorrectArray = data2.newCorrectArray;

        // Recupera o array atual salvo com as letras corretas
        let saved = localStorage.getItem("correct_letters");
        let savedCorrect = [];

        if (saved) {
          savedCorrect = JSON.parse(saved);
        }

        if (
          !Array.isArray(savedCorrect) ||
          savedCorrect.length !== newCorrectArray.length
        ) {
          savedCorrect = newCorrectArray.map((char) => {
            if (char === " " || char === "-") return char;
            return "*";
          });
        }

        // Atualiza somente os caracteres revelados agora
        newCorrectArray.forEach((char, idx) => {
          if (char !== "*") {
            savedCorrect[idx] = char;
          }
        });

        // Atualiza no localStorage
        localStorage.setItem("correct_letters", JSON.stringify(savedCorrect));

        addRightLetter(newCorrectArray, data);
      } else {
        lostingHearts();
        if (localStorage.getItem("hearts") == 0) {
          showVictory("false");
        }
      }
    }
  } catch (error) {
    alert("ERRO: " + error.message);
  }
}
