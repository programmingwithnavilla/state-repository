import { IRepository } from "./irepository.core";

export interface IUnitOfWork {
  // Register & Access
  getRepository<T>(name: string): IRepository<T> | undefined;
  registerRepository<T>(name: string, repo: IRepository<T>): void;
  hasRepository(name: string): boolean;
  removeRepository(name: string): void;
  getAllRepositories(): Map<string, IRepository<any>>;
  clear(): void;

  // Persistence
  persistAll(): Promise<void>;

  // Transactional (mimic)
  beginTransaction(): void;
  commit(): void;
  rollback(): void;
}
