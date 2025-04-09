"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  "Souhlasíte s tím, aby se zateplily domy kvůli nižší spotřebě energie?",
  "Souhlasíte s tím, aby se stavělo víc solárních a větrných elektráren?",
  "Souhlasíte s tím, aby se více používala tepelná čerpadla místo plynových kotlů?",
  "Souhlasíte s tím, aby Evropa postupně přestala používat uhlí a plyn?",
  "Souhlasíte s tím, aby se podporovaly elektromobily a stavěly dobíječky?",
  "Souhlasíte s tím, aby se omezily staré auta ve městech?",
  "Souhlasíte s tím, aby se víc investovalo do hromadné dopravy a cyklostezek?",
  "Souhlasíte s tím, aby firmy platily víc, pokud znečišťují ovzduší?",
  "Souhlasíte s tím, aby průmysl používal čistší technologie, i když to bude dražší?",
  "Souhlasíte s tím, aby se více recyklovalo a méně vyhazovalo?",
  "Souhlasíte s tím, aby zemědělci používali méně chemie?",
  "Souhlasíte s tím, aby se chránily lesy, louky a mokřady?",
  "Souhlasíte s tím, aby se omezila velkochovná výroba masa?",
  "Souhlasíte s tím, aby EU dávala peníze na zelené projekty z veřejných rozpočtů?",
  "Souhlasíte s tím, aby se zavedly nové poplatky za znečištění (např. u budov nebo dopravy)?",
  "Souhlasíte s tím, aby domácnosti s nízkými příjmy dostávaly podporu na energetické úspory?",
];

export default function Home() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const router = useRouter();

  const handleAnswer = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const calculateScore = () => {
    const yesCount = answers.filter((a) => a === "yes").length;
    return Math.round((yesCount / questions.length) * 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    router.push(`/vysledek?skore=${score}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Green Deal: Souhlasíte?</h1>
      {questions.map((question, index) => (
        <div key={index} className="border rounded p-4">
          <p className="font-medium">{question}</p>
          <div className="space-x-2 mt-2">
            <button onClick={() => handleAnswer(index, "yes")}>Ano</button>
            <button onClick={() => handleAnswer(index, "no")}>Ne</button>
            <button onClick={() => handleAnswer(index, "dontknow")}>Nevím</button>
          </div>
        </div>
      ))}
      <div className="text-center">
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
          Vyhodnotit
        </button>
      </div>
    </div>
  );
}
