import { useState, useRef } from "react";

const StepIndicator = ({ step }) => {
  const steps = ["Încărcare", "Procesare AI", "Rezultate"];
  return (
    <div className="flex border-b border-slate-100 mb-6">
      {steps.map((label, i) => (
        <div key={label} className={`flex-1 py-3 text-center text-[11px] font-bold transition-all ${step === i ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400"}`}>
          {i + 1}. {label}
        </div>
      ))}
    </div>
  );
};

export default function InvoiceAIProcessor() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState(null);
  const inputRef = useRef();
  const [error, setError] = useState(null);

const handleProcess = async () => {
  if (!file) return;
  setStep(1);
  setError(null); // Ștergem orice eroare veche înainte să începem

  const formData = new FormData();
  formData.append("data", file);

  try {
    // URL-ul tău permanent de producție
    const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/e357df6d-b755-49df-84c1-be67f61c524c";

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Serverul AI este momentan ocupat.");
    }

    const rawData = await response.json();
    console.log("RĂSPUNS RAW DIN N8N:", rawData);

    // Săpăm în structură după textul AI
    let aiText = "";
    if (rawData.content && rawData.content.parts && rawData.content.parts[0]) {
      aiText = rawData.content.parts[0].text || "";
    } else if (typeof rawData === "string") {
      aiText = rawData;
    } else if (rawData.text) {
      aiText = rawData.text;
    } else if (rawData.output) {
      aiText = rawData.output;
    } else {
      aiText = JSON.stringify(rawData);
    }

    // Decupăm JSON-ul
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    let parsedFields = {};
    
    if (jsonMatch) {
      parsedFields = JSON.parse(jsonMatch[0]);
    } else {
      parsedFields = JSON.parse(aiText);
    }

    setFields({
      supplier: parsedFields.supplier || "Nedetectat",
      invoiceNumber: parsedFields.invoiceNumber || "Nedetectat",
      total: parsedFields.total || "0,00",
      vat: parsedFields.vat || "0,00",
      date: parsedFields.date || "Nedetectată",
    });

    setStep(2); // Mergem la pasul de rezultate doar dacă totul e OK
  } catch (err) {
    console.error("Eroare la procesare:", err);
    
    // Setăm un mesaj prietenos în loc de alert
    setError("Serverele Google sunt supraîncărcate în acest moment. Te rugăm să aștepți 30 de secunde și să încerci din nou.");
    // NOTĂ: NU mai punem setStep(0), utilizatorul rămâne pe ecranul curent ca să poată da click pe Reîncearcă!
  }
};
  return (
    <div className="min-h-screen bg-[#fcfcf9] flex flex-col items-center py-12 px-4 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 rounded-full px-4 py-1 mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Production AI via n8n</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Invoice AI Processor</h1>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
        <StepIndicator step={step} />

        <div className="p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div 
                onClick={() => inputRef.current.click()}
                className="border-2 border-dashed border-slate-200 rounded-[24px] p-12 text-center hover:bg-emerald-50/30 cursor-pointer transition-all"
              >
                <input type="file" ref={inputRef} hidden accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                <p className="text-sm font-bold text-slate-700">{file ? file.name : "Selectează Factura"}</p>
                <p className="text-[11px] text-slate-400 mt-2 italic">Trimite direct în cloud-ul tău n8n</p>
              </div>

              <button 
                onClick={handleProcess}
                disabled={!file}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:bg-slate-200"
              >
                🚀 Extrage cu LLM inteligent
              </button>
            </div>
          )}

          {step === 1 && (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    {!error ? (
      <>
        {/* AICI ESTE SPINNERUL TĂU ACTUAL DE ÎNCĂRCARE */}
        <div className="spinner"></div> 
        <p style={{ marginTop: '20px', color: '#666' }}>
          Inteligența Artificială analizează factura...
        </p>
      </>
    ) : (
      <>
        {/* AICI SE AFIȘEAZĂ EROAREA PRIETENOASĂ */}
        <div style={{ color: '#e74c3c', fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
        <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Ups! Ceva nu a mers bine</h3>
        <p style={{ color: '#555', maxWidth: '400px', margin: '0 auto 25px auto', lineHeight: '1.5' }}>
          {error}
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={handleProcess}
            style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔄 Reîncearcă acum
          </button>
          
          <button 
            onClick={() => { setStep(0); setError(null); setFile(null); }}
            style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Anulează
          </button>
        </div>
      </>
    )}
  </div>
)}

          {step === 2 && fields && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Date Extrase Real de AI</span>
                <button onClick={() => setStep(0)} className="text-emerald-600 underline">Altă factură</button>
              </div>
              
              <div className="grid gap-3">
                {[
                  { label: "Furnizor", val: fields.supplier, icon: "🏢" },
                  { label: "Număr Factură", val: fields.invoiceNumber, icon: "📄" },
                  { label: "Data", val: fields.date, icon: "📅" },
                  { label: "Total de Plată", val: fields.total, icon: "💰" },
                  { label: "TVA", val: fields.vat, icon: "🏦" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}