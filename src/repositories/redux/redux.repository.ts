// src/repositories/redux/ReduxRepository.ts

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Store } from "redux";
import { IRepository } from "../../core/irepository.core";

export class ReduxRepository<T> implements IRepository<T> {
  private store: Store<{ state: T }>;
  private initialState: T;

  constructor(initialState: T) {
    this.initialState = initialState;

    const slice = createSlice({
      name: "reduxRepo",
      initialState: this.initialState,
      reducers: {
        setState: (_state, action: PayloadAction<T>) => action.payload,
        updateState: (state, action: PayloadAction<Partial<T>>) => ({
          ...state,
          ...action.payload,
        }),
        resetState: () => this.initialState,
      },
    });

    this.store = configureStore({
      reducer: slice.reducer,
    });

    this.setState = (value: T) => {
      this.store.dispatch(slice.actions.setState(value));
    };

    this.updateState = (updater: Partial<T>): void => {
      this.store.dispatch(slice.actions.updateState(updater));
    };

    this.resetState = () => {
      this.store.dispatch(slice.actions.resetState());
    };
  }

  getState(): T {
    return this.store.getState().state;
  }

  setState(value: T): void {
    // This will be overridden in constructor
  }

  updateState(updater: (state: T) => T): void {
    // We simplify updateState to accept partial object here
  }

  resetState(): void {
    // This will be overridden in constructor
  }

  subscribe(listener: (state: T) => void): () => void {
    return this.store.subscribe(() => {
      listener(this.getState());
    });
  }

  getStateSnapshot(): T {
    return this.getState();
  }

  async getStateAsync(): Promise<T> {
    return this.getState();
  }

  async setStateAsync(value: T): Promise<void> {
    this.setState(value);
  }

  async updateStateAsync(updater: (state: T) => T): Promise<void> {
    const currentState = this.getState();
    const newState = updater(currentState);
    this.setState(newState);
  }

  async resetStateAsync(): Promise<void> {
    this.resetState();
  }

  // For metadata, just naive implementations
  getStateWithMetadata(): { state: T; timestamp: number } {
    return { state: this.getState(), timestamp: Date.now() };
  }

  setStateWithMetadata(value: T, timestamp: number): void {
    this.setState(value);
  }

  updateStateWithMetadata(
    updater: (state: T, timestamp: number) => { state: T; timestamp: number }
  ): void {
    const current = this.getStateWithMetadata();
    const updated = updater(current.state, current.timestamp);
    this.setState(updated.state);
  }

  resetStateWithMetadata(): void {
    this.resetState();
  }

  subscribeWithMetadata(
    listener: (state: T, timestamp: number) => void
  ): () => void {
    return this.store.subscribe(() => {
      const current = this.getStateWithMetadata();
      listener(current.state, current.timestamp);
    });
  }

  getStateSnapshotWithMetadata(): { state: T; timestamp: number } {
    return this.getStateWithMetadata();
  }

  async getStateAsyncWithMetadata(): Promise<{ state: T; timestamp: number }> {
    return this.getStateWithMetadata();
  }

  async setStateAsyncWithMetadata(value: T, timestamp: number): Promise<void> {
    this.setStateWithMetadata(value, timestamp);
  }

  async updateStateAsyncWithMetadata(
    updater: (state: T, timestamp: number) => { state: T; timestamp: number }
  ): Promise<void> {
    const current = this.getStateWithMetadata();
    const updated = updater(current.state, current.timestamp);
    this.setState(updated.state);
  }

  async resetStateAsyncWithMetadata(): Promise<void> {
    this.resetStateWithMetadata();
  }
}
