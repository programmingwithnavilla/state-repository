// src/repositories/redux/ReduxRepository.ts

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Store } from "redux";
import { IRepository } from "../../core/irepository.core";

interface StateWithVersion<T> {
  state: T;
  version: number;
}

export class ReduxRepository<T> implements IRepository<T> {
  private store;

  constructor(private initialState: T) {
    const slice = createSlice({
      name: "reduxRepo",
      initialState: {
        state: this.initialState,
        version: 0,
      } as StateWithVersion<T>,
      reducers: {
        setState: (state, action: PayloadAction<T>) => {
          // Use castDraft to ensure type compatibility with Draft<T>
          state.state = action.payload as typeof state.state;
          state.version += 1;
        },
        updateState: (state, action: PayloadAction<(prev: T) => T>) => {
          state.state = action.payload(state.state as T) as typeof state.state;
          state.version += 1;
        },
        resetState: (state) => {
          state.state = this.initialState as typeof state.state;
          state.version = 0;
        },
      },
    });

    this.store = configureStore({
      reducer: slice.reducer,
    });
  }

  getState(): T {
    return this.store.getState().state;
  }

  setState(value: T): void {
    this.store.dispatch({
      type: "reduxRepo/setState",
      payload: value,
    });
  }

  updateState(updater: (state: T) => T): void {
    this.store.dispatch({
      type: "reduxRepo/updateState",
      payload: updater,
    });
  }

  resetState(): void {
    this.store.dispatch({ type: "reduxRepo/resetState" });
  }

  subscribe(listener: (state: T) => void): () => void {
    let currentState = this.getState();
    return this.store.subscribe(() => {
      const nextState = this.getState();
      if (nextState !== currentState) {
        currentState = nextState;
        listener(nextState);
      }
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
    this.updateState(updater);
  }

  async resetStateAsync(): Promise<void> {
    this.resetState();
  }

  getStateWithMetadata(): { state: T; timestamp: number } {
    return { state: this.getState(), timestamp: Date.now() };
  }

  setStateWithMetadata(value: T, _timestamp: number): void {
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
    let current = this.getStateWithMetadata();
    return this.store.subscribe(() => {
      const next = this.getStateWithMetadata();
      if (
        next.state !== current.state ||
        next.timestamp !== current.timestamp
      ) {
        current = next;
        listener(next.state, next.timestamp);
      }
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
    this.updateStateWithMetadata(updater);
  }

  async resetStateAsyncWithMetadata(): Promise<void> {
    this.resetStateWithMetadata();
  }

  getStateWithVersion(): { state: T; version: number } {
    const storeState = this.store.getState();
    return { state: storeState.state, version: storeState.version };
  }
}
