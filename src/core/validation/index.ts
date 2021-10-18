import FastestValidator, {
  AsyncCheckFunction,
  ValidationSchema,
} from "fastest-validator";

const fastestValidator = new FastestValidator();
const compiledSchemas = new Map<string, AsyncCheckFunction>();

export const compile = (name: string, schema: ValidationSchema) => {
  if (!compiledSchemas.has(name)) {
    compiledSchemas.set(
      name,
      fastestValidator.compile({
        ...schema,
        $$async: true,
      }) as AsyncCheckFunction,
    );
  }
};

export const validate = async <T>(
  schema: string | ValidationSchema | ValidationSchema[],
  data: T,
) => {
  if (typeof schema === "string") {
    if (!compiledSchemas.has(schema)) {
      throw new Error(`Compiled schema with name ${schema} not found.`);
    }

    return compiledSchemas.get(schema)?.(data);
  }

  const validator = fastestValidator.compile(schema);
  return validator(data);
};
