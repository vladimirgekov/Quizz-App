const API_URL = "https://jsonmock.hackerrank.com";
let correctAnswer = null;

const init = () => {
  // Do not remove
  generateQuestionId();
};

// Do not modify the code mentioned below
const generateQuestionId = () => {
  const id = randomIntInRange(0, 6);
  document.getElementById("current-question-id").value = id.toString();
};

const randomIntInRange = (min, max, notIn) => {
  const value = Math.floor(Math.random() * (max - min + 1) + min);
  if (notIn && notIn.includes(value)) {
    return randomIntInRange(min, max, notIn);
  } else {
    return value;
  }
};
// Do not modify

document.getElementById("get-started-button").addEventListener("click", () => {
  document.getElementById("pre-quiz").style.display = "none";
  document.getElementById("loader-view").style.display = "block";

  const idValue = document.getElementById("current-question-id").value;
  fetch(`${API_URL}/api/questions/${idValue}`)
    .then((res) => res.json())
    .then(({ data }) => {
      const { question, options, answer } = data;
      correctAnswer = answer;
      document.getElementById("loader-view").style.display = "none";
      document.getElementById("question").innerHTML = question;

      options.forEach((el, index) => {
        const option = document.createElement("pre");
        option.classList.add("option");
        option.id = `option-number-${index}`;
        option.textContent = el;
        option.addEventListener("click", () => {
          [...document.querySelectorAll(".user-answer")].forEach((sel) =>
            sel.classList.remove("user-answer")
          );
          option.classList.add("user-answer");
        });
        document.getElementById("options-container").appendChild(option);
      });

      document.getElementById("quiz").style.display = "block";
      document.getElementById("submit-button").addEventListener("click", () => {
        [...document.querySelectorAll(".option")].forEach((el) => {
          el.classList.add(
            el.id === `option-number-${correctAnswer}`
              ? "correct-answer"
              : "wrong-answer"
          );
        });
      });
    });
});

init();
