// import MODEL_URL from "./model/model.json";
// Function to classify toxicity

const models = fetch("http://127.0.0.1:8080/model.json")
  .then((response) => response.json())
  .catch((error) => {
    console.error("Error loading model:", error);
  });

console.log(models);
async function classifyToxicity() {
  // Get input text from textarea
  console.log("Classifying text...");
  const text = document.getElementById("text").value;
  console.log(text);

  // Preprocess text if needed (e.g., tokenization, padding)

  try {
    // Load the TensorFlow.js model
    const model = await tf.loadGraphModel("http://127.0.0.1:8080/model.json");
    console.log(model);
    const tensor = tf.tensor([text]);
    console.log(tensor);

    // Perform prediction
    const prediction = await model.predict(tensor);
    const resultDiv = document.getElementById("result");
    console.log(prediction);
    resultDiv.textContent = "Prediction: " + prediction;
  } catch (error) {
    console.error("Error classifying toxicity:", error);
  }
}

// classifyToxicity();
document.getElementById("button").addEventListener("click", classifyToxicity);
