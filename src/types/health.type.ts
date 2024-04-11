export enum HealthStatus {
  AVAILABLE = 'Disponible',
  UNAVAILABLE = 'No Disponible',
}

export type Health = {
  status: HealthStatus;
};
