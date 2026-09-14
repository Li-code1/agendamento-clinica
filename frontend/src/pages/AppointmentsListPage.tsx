import { useEffect, useState } from "react";
import { fetchAppointments, Appointment, ApiError } from "../services/api";

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
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Agendamentos</h1>

      {loading && <p className="text-sm text-gray-500">Carregando...</p>}
      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      {!loading && !errorMessage && appointments.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum agendamento cadastrado ainda.</p>
      )}

      <ul className="space-y-3">
        {appointments.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
          >
            <p className="font-medium text-gray-900">{a.patientName}</p>
            <p className="text-gray-600">
              {a.date} às {a.time}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
