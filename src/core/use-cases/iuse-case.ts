export interface IUseCase<I, R> {
  execute(args: I): Promise<R>;
}
