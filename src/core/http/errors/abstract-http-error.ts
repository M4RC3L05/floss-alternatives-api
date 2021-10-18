export abstract class AbstractHttpError extends Error {
  constructor(public code: number, public message: string) {
    super(message);
  }
}
