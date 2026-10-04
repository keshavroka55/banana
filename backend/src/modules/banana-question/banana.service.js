import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bananaFilePath = path.resolve(
  __dirname,
  "../../../../banana-scraper/banana-images.json"

);

export const getBananaQuestions = async () => {
  const file = await fs.readFile(bananaFilePath, "utf-8");

  return JSON.parse(file);
};

export const getRandomBananaQuestion = async () => {
  const questions = await getBananaQuestions();

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No Banana questions available");
  }

  const randomIndex = Math.floor(Math.random() * questions.length);

  return questions[randomIndex];
};