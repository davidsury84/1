"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Vysledek() {
  const [skore, setSkore] = useState<number | null>(null);
  const [url, setUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("skore");
      const parsed = parseInt(value || "0", 10);
      setSkore(isNaN(parsed) ? 0 : parsed);
      setUrl(window.location.href);
    }
  }, []);

  if (skore === null) return null;

  const interpretace =
    skore >= 80
      ? "Silný souhlas s Green Dealem."
      : skore >= 50
      ? "Částečný souhlas s Green Dealem."
      : skore >= 20
      ? "Spíše nesouhlasíte s Green Dealem."
      : "Zásadní nesouhlas s Green Dealem.";

  const shareText = encodeURIComponent(`Moje skóre souhlasu s Green Dealem je ${skore} %. ${interpretace}`);
  const shareUrl = url ? encodeURIComponent(url) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopírování selhalo", err);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Vaše skóre</h1>
      <p className="text-2xl mb-2">Souhlasíte s Green Dealem na <strong>{skore}%</strong>.</p>
      <p className="text-lg text-gray-700">{interpretace}</p>

      {url && (
        <div className="mt-6 space-y-4">
          <div className="space-x-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Sdílet na X (Twitter)
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Sdílet na Facebooku
            </a>
          </div>
          <button
            onClick={handleCopy}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            {copied ? "Odkaz zkopírován!" : "Zkopírovat odkaz"}
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleBack}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Zpět na dotazník
        </button>
      </div>

      <p className="mt-6 text-gray-600">Děkujeme za vyplnění dotazníku.</p>
    </div>
  );
}
