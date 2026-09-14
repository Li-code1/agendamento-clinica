import { useState } from "react";
import { SchedulePage } from "./pages/SchedulePage";
import { AppointmentsListPage } from "./pages/AppointmentsListPage";

type View = "schedule" | "list";

export default function App() {
  const [view, setView] = useState<View>("schedule");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-xl gap-4 px-4 py-3">
          <button
            onClick={() => setView("schedule")}
            className={`text-sm font-medium ${
              view === "schedule" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Agendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`text-sm font-medium ${view === "list" ? "text-blue-600" : "text-gray-500"}`}
          >
            Ver agendamentos
          </button>
        </div>
      </nav>

      {view === "schedule" ? <SchedulePage /> : <AppointmentsListPage />}
    </div>
  );
}
