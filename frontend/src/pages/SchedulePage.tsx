import { useState } from "react";
import { SlotButton } from "../components/SlotButton";
import {
  fetchAvailability,
  createAppointment,
  ApiError,
  AvailabilityReason,
} from "../services/api";
import { formatDateBR } from "../utils/formatDate";

type Status = "idle" | "loading" | "error" | "success";

const REASON_MESSAGES: Record<AvailabilityReason, string> = {
  WEEKEND: "Não há agendamento disponível aos finais de semana.",
  HOLIDAY: "Esta data é feriado. Não há agendamento disponível.",
};

export function SchedulePage() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    patientName: string;
    date: string;
    time: string;
  } | null>(null);

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    setSelectedTime(null);
    setConfirmation(null);
    setErrorMessage(null);
    setUnavailableMessage(null);
    setSlots([]);

    if (!newDate) return;

    setStatus("loading");
    try {
      const result = await fetchAvailability(newDate);
      if (result.available) {
        setSlots(result.slots);
      } else {
        setUnavailableMessage(REASON_MESSAGES[result.reason]);
      }
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof ApiError ? err.message : "Erro ao buscar horários disponíveis");
    }
  }

  async function handleSubmit() {
    if (!date || !selectedTime || !patientName.trim()) {
      setErrorMessage("Preencha a data, o horário e o nome do paciente.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const result = await createAppointment({
        patientName: patientName.trim(),
        date,
        time: selectedTime,
      });
      setConfirmation({ patientName: result.patientName, date: result.date, time: result.time });
      setStatus("success");
      setSlots((prev) => prev.filter((s) => s !== selectedTime));
      setSelectedTime(null);
      setPatientName("");
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 409) {
        setErrorMessage("Esse horário acabou de ser ocupado. Escolha outro horário.");
      } else {
        setErrorMessage(err instanceof ApiError ? err.message : "Erro ao criar agendamento");
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-bold text-slate-900">Agendamento de Consulta</h1>
      <p className="mb-8 text-base text-slate-500">
        Escolha uma data, selecione um horário disponível e confirme com seu nome.
      </p>

      <div className="space-y-7 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-semibold text-slate-700">
            Data da consulta
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {unavailableMessage && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {unavailableMessage}
          </p>
        )}

        {date && !unavailableMessage && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Horários disponíveis</p>
            {slots.length === 0 && status !== "loading" ? (
              <p className="text-sm text-slate-500">Nenhum horário disponível para esta data.</p>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {slots.map((time) => (
                  <SlotButton
                    key={time}
                    time={time}
                    selected={selectedTime === time}
                    onSelect={setSelectedTime}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTime && (
          <div>
            <label htmlFor="patientName" className="mb-2 block text-sm font-semibold text-slate-700">
              Nome do paciente
            </label>
            <input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Digite o nome completo"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</p>
        )}

        {confirmation && (
          <div className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800">
            <p className="mb-1 text-base font-semibold">Agendamento realizado com sucesso!</p>
            <p>Paciente: {confirmation.patientName}</p>
            <p>Data: {formatDateBR(confirmation.date)}</p>
            <p>Horário: {confirmation.time}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedTime || !patientName.trim() || status === "loading"}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === "loading" ? "Processando..." : "Agendar consulta"}
        </button>
      </div>
    </div>
  );
}
