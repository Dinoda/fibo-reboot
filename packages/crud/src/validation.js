import { z } from 'zod';

export const types = [
	'SELECT',
	'UPDATE',
	'DELETE',
	'INSERT',
];

export const operationSchema = z.object({
	sql: z.string()
		.min(5),
	params: z.nullish(z.union([
		z.array(z.string()), 
		z.object(),
	])),
	validator: z.nullish(z.object()),
	hydrator: z.nullish(z.function()),
	type: z.literal(types)
		.default('SELECT'),
});

export const operationArraySchema = z.array(operationSchema);

export const optionsSchema = z.object({
	defaultHydrator: z.nullish(z.function()),
	defaultUpdateHydrator: z.nullish(z.function()),
	defaultValidator: z.nullish(z.object()), 
});

export const DEFAULT_OPTIONS = {
	defaultHydrator: (a) => a,
	defaultUpdateHydrator: (a) => a,
};
