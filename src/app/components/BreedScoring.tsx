import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, Shield, CheckCircle, XCircle, Minus, RotateCcw, Star, Eye } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { GIR_BREED_STANDARDS, cows, Cow } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CowCard } from "./CowCard";

function simulateScore(): Record<string, number> {
  const traits = Object.keys(GIR_BREED_STANDARDS);
  const scores: Record<string, number> = {};
  traits.forEach(t => {
    scores[t] = +(Math.random() * 4 + 5).toFixed(1);
  });
  return scores;
}

export function BreedScoring() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<Cow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
        setScores(null);
        setAnalyzing(true);
        setTimeout(() => {
          setScores(simulateScore());
          setAnalyzing(false);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setScores(null);
    setAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const overallScore = scores
    ? +(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)
    : 0;

  const radarData = scores
    ? Object.entries(scores).map(([key, value]) => ({
      trait: key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
      score: value,
      ideal: (GIR_BREED_STANDARDS as any)[key]?.ideal || 9,
    }))
    : [];

  const topCows = [...cows].sort((a, b) => b.totalBreedScore - a.totalBreedScore).slice(0, 20);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-saffron" />
          Gir Breed Scoring &amp; Comparison
        </h1>
        <p style={{ fontSize: '0.8rem' }} className="text-muted-foreground mt-0.5">
          Upload a full-body photo of a cow to compare against golden Gir breed standards. View and compare breed scores across your herd.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-saffron/10 p-5 space-y-4">
          <h3 className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-saffron" />
            Photo Analysis
          </h3>

          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-saffron/30 rounded-xl p-10 text-center cursor-pointer hover:border-saffron/50 hover:bg-saffron/5 transition-all"
            >
              <Upload className="w-10 h-10 text-saffron/50 mx-auto mb-3" />
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Upload Full Body Photo</p>
              <p style={{ fontSize: '0.75rem' }} className="text-muted-foreground mt-1">
                Take a clear side-profile photo for best results.<br />
                Supports JPG, PNG up to 10MB.
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden">
                <img src={uploadedImage} alt="Uploaded cow" className="w-full h-64 object-cover" />
                <button onClick={handleReset}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors">
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
              </div>

              {analyzing && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
                  <p style={{ fontSize: '0.85rem' }} className="text-saffron">Analyzing breed characteristics...</p>
                </div>
              )}

              {scores && !analyzing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className={`text-center p-4 rounded-xl ${overallScore >= 8 ? "bg-green-50 border border-green-200" :
                    overallScore >= 6 ? "bg-yellow-50 border border-yellow-200" :
                      "bg-red-50 border border-red-200"
                    }`}>
                    <p style={{ fontSize: '0.65rem' }} className="text-muted-foreground uppercase tracking-wider">Overall Gir Score</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800 }} className={
                      overallScore >= 8 ? "text-green-600" : overallScore >= 6 ? "text-yellow-600" : "text-red-600"
                    }>{overallScore}<span style={{ fontSize: '0.9rem' }} className="text-muted-foreground">/10</span></p>
                    <p style={{ fontSize: '0.75rem' }} className="text-muted-foreground">
                      {overallScore >= 8 ? "Excellent Gir Specimen" :
                        overallScore >= 6 ? "Good Breed Conformity" :
                          "Below Standard - Needs Improvement"}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-3">
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData} outerRadius="70%">
                        <PolarGrid stroke="#00000010" />
                        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 8 }} />
                        <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                        <Radar name="Ideal" dataKey="ideal" stroke="#1B3A6B" fill="#1B3A6B" fillOpacity={0.1} strokeWidth={1} strokeDasharray="3 3" />
                        <Radar name="Score" dataKey="score" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.25} strokeWidth={2} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5">
                    {radarData.map(d => {
                      const diff = d.score - d.ideal;
                      const status = diff >= -0.5 ? "pass" : diff >= -2 ? "warn" : "fail";
                      return (
                        <div key={d.trait} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                          {status === "pass" ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :
                            status === "warn" ? <Minus className="w-4 h-4 text-yellow-500 shrink-0" /> :
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          <span style={{ fontSize: '0.78rem' }} className="flex-1">{d.trait}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }} className={
                            status === "pass" ? "text-green-600" : status === "warn" ? "text-yellow-600" : "text-red-600"
                          }>{d.score}</span>
                          <span style={{ fontSize: '0.65rem' }} className="text-muted-foreground">/ {d.ideal}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-saffron/10 p-5">
            <h3 className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-saffron" />
              Gir Breed Golden Standards
            </h3>
            <div className="space-y-2.5">
              {Object.entries(GIR_BREED_STANDARDS).map(([key, val]) => (
                <div key={key} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }} className="text-saffron">
                      Ideal: {val.ideal}/10
                    </span>
                  </div>
                  <p style={{ fontSize: '0.7rem' }} className="text-muted-foreground">{val.description}</p>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-saffron to-saffron-dark"
                      style={{ width: `${val.ideal * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-saffron/10 p-5">
        <h3 className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-navy" />
          Herd Breed Scores - Compare Cows
        </h3>
        <p style={{ fontSize: '0.75rem' }} className="text-muted-foreground mb-4">
          Top 20 cows by breed score. Click to view full profile with detailed scoring.
        </p>

        {selectedForCompare && (
          <div className="mb-4 bg-accent/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={selectedForCompare.image} alt={selectedForCompare.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-saffron/30" />
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedForCompare.name}</p>
                  <p style={{ fontSize: '0.7rem' }} className="text-muted-foreground">
                    {selectedForCompare.tagNumber} &bull; Gen {selectedForCompare.generation} &bull; Score: {selectedForCompare.totalBreedScore}/10
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCow(selectedForCompare)}
                className="px-3 py-1.5 rounded-lg bg-saffron text-white hover:bg-saffron-dark transition-colors"
                style={{ fontSize: '0.75rem' }}>
                View Full Card
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(selectedForCompare.breedScore).map(([key, val]) => (
                <div key={key} className="text-center bg-white rounded-lg p-2">
                  <p style={{ fontSize: '0.55rem' }} className="text-muted-foreground truncate">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                  </p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }} className={
                    val >= 7 ? "text-green-600" : val >= 5 ? "text-yellow-600" : "text-red-600"
                  }>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
          {topCows.map((cow, i) => (
            <motion.button key={cow.id} whileHover={{ y: -3 }}
              onClick={() => setSelectedForCompare(cow)}
              className={`p-2.5 rounded-xl border transition-all flex flex-col items-center ${selectedForCompare?.id === cow.id
                ? "border-saffron bg-saffron/5 shadow-sm"
                : "border-saffron/10 hover:border-saffron/30"
                }`}>
              <div className="relative">
                <ImageWithFallback src={cow.image} alt={cow.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-saffron/20" />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-saffron text-white flex items-center justify-center"
                  style={{ fontSize: '0.5rem', fontWeight: 700 }}>{i + 1}</div>
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 600 }} className="mt-1 truncate w-full text-center">{cow.name}</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 700 }} className={
                cow.totalBreedScore >= 8 ? "text-green-600" :
                  cow.totalBreedScore >= 6 ? "text-saffron" : "text-yellow-600"
              }>{cow.totalBreedScore}</p>
              <div className="w-full h-1 rounded-full bg-gray-100 mt-0.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-saffron to-navy"
                  style={{ width: `${cow.totalBreedScore * 10}%` }} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCow && (
          <CowCard cow={selectedCow} onClose={() => setSelectedCow(null)} onSelectCow={setSelectedCow} />
        )}
      </AnimatePresence>
    </div>
  );
}
