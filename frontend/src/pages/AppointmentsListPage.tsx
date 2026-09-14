import { useEffect, useState } from "react";
import { fetchAppointments, Appointment, ApiError } from "../services/api";
import { formatDateBR } from "../utils/formatDate";

export function AppointmentsListPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments()
      .then(setAppointments)
      .catch((err) =>
        setErrorMessage(err instanceof ApiError ? err.message : "Erro ao carregar agendamentos")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-bold text-slate-900">Agendamentos</h1>
      <p className="mb-8 text-base text-slate-500">Consultas já confirmadas no sistema.</p>

      {loading && <p className="text-sm text-slate-500">Carregando...</p>}
      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</p>
      )}

      {!loading && !errorMessage && appointments.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Nenhum agendamento cadastrado ainda.
        </p>
      )}

      <ul className="space-y-3">
        {appointments.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-base font-semibold text-slate-900">{a.patientName}</p>
              <p className="text-sm text-slate-500">{formatDateBR(a.date)}</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {a.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
