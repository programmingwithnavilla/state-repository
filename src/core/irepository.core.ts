export interface IRepository<T> {
  getState(): T;
  setState(value: T): void;
  updateState(updater: (state: T) => T): void;
  resetState(): void;
  subscribe(listener: (state: T) => void): () => void;
  getStateSnapshot(): T;
  getStateAsync(): Promise<T>;
  setStateAsync(value: T): Promise<void>;
  updateStateAsync(updater: (state: T) => T): Promise<void>;
  resetStateAsync(): Promise<void>;
  getStateWithMetadata(): { state: T; timestamp: number };
  setStateWithMetadata(value: T, timestamp: number): void;
  updateStateWithMetadata(
    updater: (state: T, timestamp: number) => { state: T; timestamp: number }
  ): void;
  resetStateWithMetadata(): void;
  subscribeWithMetadata(
    listener: (state: T, timestamp: number) => void
  ): () => void;
  getStateSnapshotWithMetadata(): { state: T; timestamp: number };
  getStateAsyncWithMetadata(): Promise<{ state: T; timestamp: number }>;
  setStateAsyncWithMetadata(value: T, timestamp: number): Promise<void>;
  updateStateAsyncWithMetadata(
    updater: (state: T, timestamp: number) => { state: T; timestamp: number }
  ): Promise<void>;
  resetStateAsyncWithMetadata(): Promise<void>;
  getStateWithVersion(): { state: T; version: number };
}
