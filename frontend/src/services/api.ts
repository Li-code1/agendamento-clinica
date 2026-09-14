const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export type AvailabilityReason = "WEEKEND" | "HOLIDAY";

export type AvailabilityResponse =
  | { date: string; available: true; slots: string[] }
  | { date: string; available: false; reason: AvailabilityReason; slots: string[] };

export interface CreateAppointmentPayload {
  patientName: string;
  date: string;
  time: string;
}

export interface CreateAppointmentResponse {
  id: string;
  patientName: string;
  date: string;
  time: string;
  message: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Erro ao comunicar com o servidor");
  }
  return data as T;
}

export async function fetchAvailability(date: string): Promise<AvailabilityResponse> {
  const response = await fetch(`${API_URL}/available?date=${date}`);
  return handleResponse<AvailabilityResponse>(response);
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<CreateAppointmentResponse> {
  const response = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<CreateAppointmentResponse>(response);
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const response = await fetch(`${API_URL}/appointments`);
  return handleResponse<Appointment[]>(response);
}
