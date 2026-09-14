import { useState } from "react";
import { SchedulePage } from "./pages/SchedulePage";
import { AppointmentsListPage } from "./pages/AppointmentsListPage";

type View = "schedule" | "list";

export default function App() {
  const [view, setView] = useState<View>("schedule");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              +
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-slate-900">Clínica Vida Plena</p>
              <p className="text-xs text-slate-500">Agendamento online de consultas</p>
            </div>
          </div>

          <nav className="mt-5 flex gap-6 border-b border-slate-200">
            <button
              onClick={() => setView("schedule")}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                view === "schedule"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Agendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                view === "list"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Ver agendamentos
            </button>
          </nav>
        </div>
      </header>

      {view === "schedule" ? <SchedulePage /> : <AppointmentsListPage />}
    </div>
  );
}
