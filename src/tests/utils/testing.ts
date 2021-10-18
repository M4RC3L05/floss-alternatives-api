import { Context, suite, Test } from "uvu";

export const testSuite = <C = Context>(
  { name, context }: { name: string; context?: C },
  fn: (it: Test<C>) => void,
) => {
  const s = suite<C>(name, context);

  fn(s);

  s.run();
};
