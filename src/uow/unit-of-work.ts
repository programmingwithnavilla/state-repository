import { IRepository } from "../core/irepository.core";
import { IUnitOfWork } from "../core/iunit-of-work.core";

type RepoMap = Map<string, IRepository<any>>;
type RepoSnapshot = Map<string, any>;

export class UnitOfWork implements IUnitOfWork {
  private repositories: RepoMap = new Map();
  private transactionSnapshot: RepoSnapshot | null = null;

  getRepository<T>(name: string): IRepository<T> | undefined {
    return this.repositories.get(name) as IRepository<T> | undefined;
  }

  registerRepository<T>(name: string, repo: IRepository<T>): void {
    this.repositories.set(name, repo);
  }

  hasRepository(name: string): boolean {
    return this.repositories.has(name);
  }

  removeRepository(name: string): void {
    this.repositories.delete(name);
  }

  getAllRepositories(): RepoMap {
    return new Map(this.repositories);
  }

  clear(): void {
    this.repositories.clear();
  }

  async persistAll(): Promise<void> {
    for (const [name, repo] of this.repositories) {
      const state = await repo.getStateAsync?.();
      console.log(`Persisting [${name}]:`, state);
      // This can be replaced with real persistence logic.
    }
  }

  beginTransaction(): void {
    this.transactionSnapshot = new Map();
    for (const [name, repo] of this.repositories) {
      const snapshot = repo.getStateSnapshot?.();
      this.transactionSnapshot.set(name, snapshot);
    }
  }

  commit(): void {
    this.transactionSnapshot = null;
  }

  rollback(): void {
    if (!this.transactionSnapshot) return;

    for (const [name, snapshot] of this.transactionSnapshot) {
      const repo = this.repositories.get(name);
      if (repo?.resetState) {
        repo.setState?.(snapshot);
      }
    }

    this.transactionSnapshot = null;
  }
}
