import { useState, useRef } from "react";

const StepIndicator = ({ step }) => {
  const steps = ["Încărcare", "Procesare AI", "Rezultate"];

  return (
    <div className="flex border-b border-slate-100 mb-6">
      {steps.map((label, i) => (
        <div
          key={label}
          className={`flex-1 py-3 text-center text-[11px] font-bold transition-all ${
            step === i
              ? "text-emerald-600 border-b-2 border-emerald-500"
              : "text-slate-400"
          }`}
        >
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
  const [approvedInvoices, setApprovedInvoices] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleProcess = async () => {
    if (!file) return;

    setStep(1);
    setError(null);

    const formData = new FormData();
    formData.append("data", file);

    try {
      const N8N_WEBHOOK_URL =
        "http://localhost:5678/webhook/e357df6d-b755-49df-84c1-be67f61c524c";

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Serverul AI este momentan ocupat.");
      }

      const rawData = await response.json();
      console.log("RĂSPUNS RAW DIN N8N:", rawData);

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

      setStep(2);
    } catch (err) {
      console.error("Eroare la procesare:", err);

      setError(
        "Serverele Google sunt supraîncărcate în acest moment. Te rugăm să aștepți 30 de secunde și să încerci din nou."
      );
    }
  };

  const handleApprove = () => {
    if (!fields) return;

    const approvedInvoice = {
      id: Date.now(),
      supplier: fields.supplier,
      invoiceNumber: fields.invoiceNumber,
      total: fields.total,
      vat: fields.vat,
      date: fields.date,
      fileName: file?.name || "Fișier necunoscut",
      approvedAt: new Date().toLocaleString("ro-RO"),
    };

    setApprovedInvoices((prev) => [...prev, approvedInvoice]);
    setFields(null);
    setFile(null);
    setError(null);
    setStep(0);
  };

  const handleReset = () => {
    setStep(0);
    setError(null);
    setFile(null);
    setFields(null);
  };

 return (
  <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white font-sans overflow-x-hidden">
    <div className="min-h-screen w-full grid grid-cols-[360px_minmax(0,1fr)]">

      {/* SIDEBAR */}
    <aside className="sticky top-0 h-screen flex flex-col justify-start gap-8 p-12 border-r border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
              Production AI via n8n
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Invoice AI<br />
            Processor
          </h1>

          <p className="mt-6 text-slate-300 leading-relaxed">
            Încarcă facturi, extrage automat datele importante cu AI și aprobă documentele pentru procesare contabilă.
          </p>
        </div>

        <div className="grid gap-4 text-sm text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            ⚡ Procesare rapidă prin webhook n8n
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            🔒 Flux local, controlat de tine
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            📊 Istoric facturi aprobate
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
 <main className="w-full min-w-0 h-screen p-8 overflow-y-auto overflow-x-hidden">
        <div className="xl:hidden text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
              Production AI via n8n
            </span>
          </div>

          <h1 className="text-4xl font-black">Invoice AI Processor</h1>
        </div>

       <section className="w-full min-w-0 flex flex-col gap-8">

          {/* CARD PROCESARE */}
          <div className="w-full max-w-[900px] mx-auto bg-white text-slate-900 rounded-[36px] shadow-2xl border border-white/20 overflow-hidden">
            <StepIndicator step={step} />

            <div className="p-8 md:p-12">
              {step === 0 && (
                <div className="space-y-8">
                  <div
                    onClick={() => inputRef.current.click()}
                    className="min-h-[320px] border-2 border-dashed border-emerald-300 rounded-[32px] p-10 text-center hover:bg-emerald-50 cursor-pointer transition-all flex flex-col justify-center items-center"
                  >
                    <input
                      type="file"
                      ref={inputRef}
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                    />

                    <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-4xl flex items-center justify-center mb-6">
                      📄
                    </div>

                    <p className="text-xl font-black text-slate-800">
                      {file ? file.name : "Selectează factura"}
                    </p>

                    <p className="text-sm text-slate-400 mt-3 max-w-sm">
                      Acceptă imagini sau PDF-uri. Documentul va fi trimis către fluxul tău n8n.
                    </p>
                  </div>

                  <button
                    onClick={handleProcess}
                    disabled={!file}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    🚀 Extrage cu LLM inteligent
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="text-center py-20">
                  {!error ? (
                    <>
                      <div className="spinner"></div>
                      <p className="mt-8 text-slate-500 font-semibold">
                        Inteligența Artificială analizează factura...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">⚠️</div>
                      <h3 className="text-2xl font-black text-red-500 mb-4">
                        Ups! Ceva nu a mers bine
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                        {error}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={handleProcess}
                          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold"
                        >
                          🔄 Reîncearcă acum
                        </button>

                        <button
                          onClick={handleReset}
                          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold"
                        >
                          Anulează
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 2 && fields && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Date extrase real de AI
                    </span>

                    <button
                      onClick={handleReset}
                      className="text-emerald-600 font-bold underline"
                    >
                      Altă factură
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "Furnizor", val: fields.supplier, icon: "🏢" },
                      { label: "Număr Factură", val: fields.invoiceNumber, icon: "📄" },
                      { label: "Data", val: fields.date, icon: "📅" },
                      { label: "Total de Plată", val: fields.total, icon: "💰" },
                      { label: "TVA", val: fields.vat, icon: "🏦" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4"
                      >
                        <span className="text-3xl">{item.icon}</span>

                        <div>
                          <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                            {item.label}
                          </p>
                          <p className="text-base font-black text-slate-800">
                            {item.val}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleApprove}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all"
                  >
                    ✅ Aprobă factura
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FACTURI APROBATE */}
   

          {/* FACTURI APROBATE */}
<div className="w-full bg-white/10 backdrop-blur-xl rounded-[36px] border border-white/10 shadow-2xl overflow-hidden">
  <div className="p-8 border-b border-white/10">
    <h2 className="text-2xl font-black text-white">
      Facturi Aprobate
    </h2>

    <p className="text-sm text-slate-300 mt-2">
      Documente verificate și trimise spre aprobare contabilă.
    </p>
  </div>

  {approvedInvoices.length === 0 ? (
    <div className="h-[380px] flex flex-col items-center justify-center text-center px-8">
      <div className="text-6xl mb-5">🧾</div>

      <h3 className="text-xl font-black text-white">
        Nu există facturi aprobate încă
      </h3>

      <p className="text-slate-400 mt-2 max-w-sm">
        După ce aprobi o factură, aceasta va apărea aici în tabel.
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-white">
        <thead className="bg-white/10 text-slate-300 uppercase text-[11px]">
          <tr>
            <th className="px-4 py-4">Furnizor</th>
            <th className="px-4 py-4">Nr. Factură</th>
            <th className="px-4 py-4">Data</th>
            <th className="px-4 py-4">Total</th>
            <th className="px-4 py-4">TVA</th>
            <th className="px-4 py-4">Fișier</th>
            <th className="px-4 py-4">Aprobat la</th>
            <th className="px-4 py-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {approvedInvoices.map((invoice) => (
            <tr key={invoice.id} className="border-t border-white/10">
              <td className="px-4 py-4 font-bold">{invoice.supplier}</td>
              <td className="px-4 py-4 text-slate-300">{invoice.invoiceNumber}</td>
              <td className="px-4 py-4 text-slate-300">{invoice.date}</td>
              <td className="px-4 py-4 font-black text-emerald-300">{invoice.total}</td>
              <td className="px-4 py-4 text-slate-300">{invoice.vat}</td>
              <td className="px-4 py-4 text-slate-400">{invoice.fileName}</td>
              <td className="px-4 py-4 text-slate-400">{invoice.approvedAt}</td>
              <td className="px-4 py-4">
                <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-300 text-xs font-black border border-emerald-400/20">
                  Aprobată
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
        </section>
      </main>
    </div>
  </div>
);
}