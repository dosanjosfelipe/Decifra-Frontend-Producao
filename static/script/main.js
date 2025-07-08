import {
  sendLetter,
  getRealWord,
  verifyNewWord,
  getTheNewWord,
} from "./api.js";

// QUANDO DA F5 NA PÁGINA
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("game_active")) {
    localStorage.setItem("game_active", "true");
  }

  if (!localStorage.getItem("hearts")) {
    localStorage.setItem("hearts", 5);
  }

  if (localStorage.getItem("game_active") === "true") {
    getTheNewWord();
    renderHearts();
    loadUsedLetters();
  }

  if (localStorage.getItem("game_active") === "false") {
    renderHearts();
    showVictory(localStorage.getItem("victory"));
    const oldWord = localStorage.getItem("correct_word");

    if (oldWord) {
      verifyNewWord(oldWord);
    }
  }
});

// COLOCA OS ESPAÇOS PARA AS LETRAS
export function addLetterSpaces(word) {
  const wordContainer = document.getElementById("wordContainer");

  if (Array.isArray(word)) {
    word.forEach(function (letter, index) {
      let spaceSpan;
      let letterSpan;

      if (letter === " ") {
        letterSpan = document.createElement("span");
        letterSpan.className = "right-letter";
        letterSpan.id = `rightLetter${index}`;
        letterSpan.textContent = " ";

        wordContainer.appendChild(letterSpan);
      } else if (letter === "-") {
        letterSpan = document.createElement("span");
        letterSpan.className = "right-letter";
        letterSpan.id = `rightLetter${index}`;
        letterSpan.textContent = "-";

        wordContainer.appendChild(letterSpan);
      } else if (letter === "*") {
        spaceSpan = document.createElement("span");
        spaceSpan.className = "letter-spaces";
        spaceSpan.id = `letterSpaces${index}`;

        letterSpan = document.createElement("span");
        letterSpan.className = "right-letter";
        letterSpan.id = `rightLetter${index}`;
        letterSpan.textContent = "";

        spaceSpan.appendChild(letterSpan);
        wordContainer.appendChild(spaceSpan);
      }
    });
  }
}

// CARREGA AS LETRAS QUE JÁ FORAM COLOCADAS CORRETAMENTE NA TELA DEPOIS DO F5
export function loadSavedLetters() {
  const savedLetters = localStorage.getItem("correct_letters");

  if (savedLetters) {
    const correctLettersArray = JSON.parse(savedLetters);

    correctLettersArray.forEach((letter, index) => {
      const letterSpan = document.getElementById(`rightLetter${index}`);

      if (letterSpan && letter !== "*") {
        letterSpan.textContent = letter;
      }
    });
  }
}

// COLOCA AS LETRAS NA TELA SIMULTANEAMENTE ENQUANTO JOGA
export function addRightLetter(array, letterPressed) {
  array.forEach(function (letter, index) {
    if (letterPressed === letter) {
      const rightLetter = document.getElementById(`rightLetter${index}`);
      if (rightLetter) {
        rightLetter.textContent = letter;

        rightLetter.classList.remove("zoom-in");
        void rightLetter.offsetWidth;
        rightLetter.classList.add("zoom-in");

        const letterAlreadyUsed = document.getElementById("letterAlreadyUsed");
        letterAlreadyUsed.textContent = "";
      }
    }
  });
  if (!localStorage.getItem("correct_letters").includes("*")) {
    showVictory("true");
  }
}

const usedLetters = [];
// VERIFICA AS TECLAS QUE O USUARIO APERTA
document.addEventListener("keydown", function (event) {
  if (localStorage.getItem("game_active") === "false") {
    return;
  }
  const keyPressed = event.key;

  if (keyPressed.length === 1 && keyPressed.match(/[a-zA-Z]/)) {
    if (
      !localStorage.getItem("used_letters").includes(keyPressed.toUpperCase())
    ) {
      usedLetters.push(keyPressed.toUpperCase());
      localStorage.setItem("used_letters", usedLetters.join(" "));
      sendLetter(keyPressed);
    } else {
      const letterAlreadyUsed = document.getElementById("letterAlreadyUsed");
      letterAlreadyUsed.textContent = "você já usou essa letra";

      letterAlreadyUsed.classList.remove("expand-fade-in");
      void letterAlreadyUsed.offsetWidth;
      letterAlreadyUsed.classList.add("expand-fade-in");

      const usedLettersList = document.getElementById("usedLetters");

      usedLettersList.classList.remove("shake");
      void usedLettersList.offsetWidth;
      usedLettersList.classList.add("shake");
    }
  }
});

// CARREGA AS LETRAS JÁ USADAS PELO USUARIO DEPOIS DO F5
export function loadUsedLetters() {
  if (localStorage.getItem("used_letters")) {
    const storageUsedLetters = localStorage.getItem("used_letters");
    usedLetters.push(...storageUsedLetters.split(" "));

    const usedLetter = document.getElementById("usedLetters");
    if (usedLetter) {
      usedLetter.textContent = storageUsedLetters;
    }
  } else {
    localStorage.setItem("used_letters", "");
  }
}

// SETA O TAMANHO DA PALAVRA DO DIA
export function setWord(wordCripto) {
  addLetterSpaces(wordCripto);
  loadSavedLetters();
}

// RECODIFICAR A PALAVRA
export function maskWord(word) {
  const masked = [];

  word
    .slice(1, -1)
    .split("")
    .forEach((char) => {
      if (char === " " || char === "-") {
        masked.push(char);
      } else {
        masked.push("*");
      }
    });

  return masked;
}

// DELETAR OS CORAÇÕES
export function lostingHearts() {
  let hearts = parseInt(localStorage.getItem("hearts"), 10);
  hearts--;
  localStorage.setItem("hearts", hearts);
  for (let i = 1; i <= 5; i++) {
    const heart = document.getElementById(`heart${i}`);
    if (heart) {
      if (i <= hearts) {
        heart.style.display = "inline";
        heart.classList.remove("shake");
        void heart.offsetWidth;
        heart.classList.add("shake");
      } else {
        heart.style.display = "none";
        heart.classList.remove("shake");
        void heart.offsetWidth;
        heart.classList.add("shake");
      }
    }
  }
}

// CONTINUAR DELETADO OS CORAÇÕES DEPOIS DO F5
function renderHearts() {
  const userHearts = parseInt(localStorage.getItem("hearts"), 10);

  for (let i = 5; i > userHearts; i--) {
    const heart = document.getElementById(`heart${i}`);

    if (heart) {
      heart.style.display = "none";
    }
  }
}

// MOSTRAR VITORIA/DERROTA NA TELA
export async function showVictory(victory) {
  const resultgame = document.getElementById("resultGame");

  if (victory === "true") {
    resultgame.textContent = "VOCÊ GANHOU!";
    resultgame.classList.remove("fall-from-top");

    void resultgame.offsetWidth;
    resultgame.classList.add("fall-from-top");
    document.getElementById("winSound").play();

    localStorage.setItem("victory", "true");
  } else {
    resultgame.textContent = "VOCÊ PERDEU!";
    resultgame.classList.remove("fall-from-top");

    void resultgame.offsetWidth;
    resultgame.classList.add("fall-from-top");
    const loseSound = document.getElementById("loseSound");
    loseSound.volume = 0.3;
    loseSound.play();

    localStorage.setItem("victory", "false");
  }

  const realWordText = document.getElementById("realWord");
  await getRealWord();
  localStorage.setItem("game_active", "false");

  const realWord = localStorage.getItem("correct_word");
  realWordText.textContent = realWord.slice(1, -1);
}
