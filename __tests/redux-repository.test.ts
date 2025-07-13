import { describe, it, expect, beforeEach } from "vitest";
import { ReduxRepository } from "../src/repositories/redux/redux.repository";

interface TestState {
  count: number;
  text: string;
}

describe("ReduxRepository", () => {
  let repo: ReduxRepository<TestState>;
  const initialState = { count: 0, text: "hello" };

  beforeEach(() => {
    repo = new ReduxRepository<TestState>(initialState);
  });

  it("should initialize with the given initial state", () => {
    expect(repo.getState()).toEqual(initialState);
  });

  it("should setState and getState correctly", () => {
    const newState = { count: 10, text: "changed" };
    repo.setState(newState);
    expect(repo.getState()).toEqual(newState);
  });

  it("should updateState with updater function", () => {
    repo.updateState((state) => ({ ...state, count: state.count + 1 }));
    expect(repo.getState().count).toBe(1);
  });

  it("should resetState to initial state", () => {
    repo.setState({ count: 99, text: "abc" });
    repo.resetState();
    expect(repo.getState()).toEqual(initialState);
  });

  it("should subscribe and notify on state changes", () => {
    let calledWith: TestState | null = null;
    const unsubscribe = repo.subscribe((state) => {
      calledWith = state;
    });

    repo.setState({ count: 5, text: "subscribe" });
    expect(calledWith).toEqual({ count: 5, text: "subscribe" });

    unsubscribe();

    repo.setState({ count: 6, text: "no notify" });
    expect(calledWith).toEqual({ count: 5, text: "subscribe" }); // no update after unsubscribe
  });

  it("should return state with version", () => {
    expect(repo.getStateWithVersion()).toEqual({
      state: initialState,
      version: 0,
    });
    repo.setState({ count: 1, text: "ver" });
    expect(repo.getStateWithVersion().version).toBe(1);
  });

  it("should updateStateWithMetadata and getStateWithMetadata", () => {
    const meta = repo.getStateWithMetadata();
    expect(meta.state).toEqual(initialState);
    expect(typeof meta.timestamp).toBe("number");

    repo.updateStateWithMetadata((state, timestamp) => ({
      state: { ...state, count: 42 },
      timestamp: timestamp + 1000,
    }));

    const updatedMeta = repo.getStateWithMetadata();
    expect(updatedMeta.state.count).toBe(42);
    expect(updatedMeta.timestamp).toBeGreaterThan(meta.timestamp);
  });
});
