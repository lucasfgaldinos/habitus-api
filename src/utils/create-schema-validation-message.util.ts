import type { core } from "zod";

export function createSchemaValidationMessage(issues: core.$ZodIssue[]) {
	const errors = issues.map(
		(item) => `${item.path.join(".")}: ${item.message}`,
	);

	return errors;
}
